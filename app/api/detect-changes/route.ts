import { NextRequest, NextResponse } from "next/server";
import { PRICING_DATA } from "@/lib/pricing";
import { sendReauditEmail } from "@/lib/reaudit-email";

/**
 * POST /api/detect-changes
 *
 * Scheduling: This endpoint can be called manually or via a cron job.
 * We use a manual trigger (acceptable per spec) secured by CRON_SECRET.
 * To automate: add a GitHub Actions schedule calling this URL, or use
 * Vercel Cron (requires Pro). Document in ROUND2_PR.md.
 *
 * Body (optional): { toolId: string, plan: string, newPrice: number }
 *   — override a specific price to simulate a pricing change for testing.
 *   — omit to run a real comparison against stored snapshots.
 */
export async function POST(req: NextRequest) {
  // Auth check — require CRON_SECRET if set
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  // Parse optional override body for testing
  let priceOverride: { toolId: string; plan: string; newPrice: number } | null = null;
  try {
    const body = await req.json();
    if (body?.toolId && body?.plan && typeof body?.newPrice === "number") {
      priceOverride = body as { toolId: string; plan: string; newPrice: number };
    }
  } catch { /* no body is fine */ }

  // Build "current" pricing map — apply override if provided
  const currentPricing = buildCurrentPricing(priceOverride);

  // Fetch all stored audits that have a pricing_snapshot and user_email and are not unsubscribed
  const { data: audits, error } = await supabase
    .from("audits")
    .select("id, user_email, pricing_snapshot, recommendations, ai_summary, total_monthly_savings, input, stale")
    .not("user_email", "is", null)
    .not("pricing_snapshot", "is", null)
    .eq("unsubscribed", false);

  if (error) {
    return NextResponse.json({ error: "DB fetch failed", detail: error.message }, { status: 500 });
  }

  if (!audits || audits.length === 0) {
    return NextResponse.json({ checked: 0, stale: 0, emails_sent: 0, message: "No audits with email+snapshot found." });
  }

  // Group stale audits by user email (one consolidated email per user)
  const staleByEmail = new Map<string, StaleAudit[]>();
  const staleAuditIds: string[] = [];

  for (const audit of audits) {
    const snapshot = audit.pricing_snapshot as Record<string, Record<string, number>>;
    const changes = detectChanges(snapshot, currentPricing);

    if (changes.length > 0) {
      staleAuditIds.push(audit.id);
      const email = audit.user_email as string;
      if (!staleByEmail.has(email)) staleByEmail.set(email, []);
      staleByEmail.get(email)!.push({ audit, changes });
    }
  }

  // Mark stale audits in DB
  if (staleAuditIds.length > 0) {
    await supabase.from("audits").update({ stale: true }).in("id", staleAuditIds);

    // Log pricing changes (deduplicated)
    const allChanges = Array.from(staleByEmail.values()).flat().flatMap(s => s.changes);
    const uniqueChanges = deduplicateChanges(allChanges);
    if (uniqueChanges.length > 0) {
      await supabase.from("pricing_changes").insert(
        uniqueChanges.map(c => ({
          tool_id: c.toolId,
          plan: c.plan,
          old_price: c.oldPrice,
          new_price: c.newPrice,
          change_type: c.changeType,
        }))
      );
    }
  }

  // Send one consolidated email per affected user
  let emailsSent = 0;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://stackaudit.credex.rocks";

  for (const [email, staleAudits] of staleByEmail) {
    try {
      await sendReauditEmail({ email, staleAudits, baseUrl });

      // Log email sent
      await supabase.from("email_log").insert({
        email,
        audit_ids: staleAudits.map(s => s.audit.id),
        sent_at: new Date().toISOString(),
      });

      // Update notified_at on each audit
      await supabase.from("audits")
        .update({ notified_at: new Date().toISOString() })
        .in("id", staleAudits.map(s => s.audit.id));

      emailsSent++;
    } catch (e) {
      console.error(`[detect-changes] email failed for ${email}:`, e);
    }
  }

  return NextResponse.json({
    checked: audits.length,
    stale: staleAuditIds.length,
    emails_sent: emailsSent,
    affected_emails: Array.from(staleByEmail.keys()),
  });
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PriceChange {
  toolId: string;
  toolName: string;
  plan: string;
  oldPrice: number | null;
  newPrice: number | null;
  changeType: "price_changed" | "plan_added" | "plan_removed";
}

export interface StaleAudit {
  audit: {
    id: string;
    user_email: string;
    pricing_snapshot: unknown;
    recommendations: unknown;
    ai_summary: string | null;
    total_monthly_savings: number;
    input: unknown;
    stale: boolean;
  };
  changes: PriceChange[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildCurrentPricing(
  override: { toolId: string; plan: string; newPrice: number } | null
): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  for (const [toolId, plans] of Object.entries(PRICING_DATA)) {
    result[toolId] = Object.fromEntries(plans.map(p => [p.plan, p.pricePerSeatPerMonth]));
  }
  // Apply test override if provided
  if (override) {
    if (!result[override.toolId]) result[override.toolId] = {};
    result[override.toolId]![override.plan] = override.newPrice;
  }
  return result;
}

function detectChanges(
  snapshot: Record<string, Record<string, number>>,
  current: Record<string, Record<string, number>>
): PriceChange[] {
  const changes: PriceChange[] = [];

  for (const [toolId, snapshotPlans] of Object.entries(snapshot)) {
    const currentPlans = current[toolId];
    const toolName = toolId.replace(/_/g, " ");

    if (!currentPlans) {
      // Entire tool removed — flag all plans
      for (const [plan, oldPrice] of Object.entries(snapshotPlans)) {
        changes.push({ toolId, toolName, plan, oldPrice, newPrice: null, changeType: "plan_removed" });
      }
      continue;
    }

    for (const [plan, oldPrice] of Object.entries(snapshotPlans)) {
      const newPrice = currentPlans[plan];
      if (newPrice === undefined) {
        changes.push({ toolId, toolName, plan, oldPrice, newPrice: null, changeType: "plan_removed" });
      } else if (newPrice !== oldPrice) {
        changes.push({ toolId, toolName, plan, oldPrice, newPrice, changeType: "price_changed" });
      }
    }

    // Check for newly added plans
    for (const [plan, newPrice] of Object.entries(currentPlans)) {
      if (snapshotPlans[plan] === undefined) {
        changes.push({ toolId, toolName, plan, oldPrice: null, newPrice, changeType: "plan_added" });
      }
    }
  }

  return changes;
}

function deduplicateChanges(changes: PriceChange[]): PriceChange[] {
  const seen = new Set<string>();
  return changes.filter(c => {
    const key = `${c.toolId}:${c.plan}:${c.changeType}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
