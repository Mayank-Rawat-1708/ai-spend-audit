import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit-engine";
import { generateSummary } from "@/lib/ai-summary";
import { PRICING_DATA } from "@/lib/pricing";
import type { AuditInput } from "@/types";
import { z } from "zod";

const ToolEntrySchema = z.object({
  toolId: z.string().min(1).max(50),
  plan: z.string().min(1).max(100),
  monthlySpend: z.number().min(0).max(1000000),
  seats: z.number().int().min(1).max(100000),
});

const AuditInputSchema = z.object({
  tools: z.array(ToolEntrySchema).min(1).max(20),
  teamSize: z.number().int().min(1).max(100000),
  useCase: z.enum(["coding", "writing", "data", "research", "mixed"]),
  userEmail: z.string().email().optional(), // Round 2: capture at audit time if provided
});

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 15) return false;
  entry.count++;
  return true;
}

function generateFallbackSummary(result: ReturnType<typeof runAudit>): string {
  const toolCount = result.recommendations.length;
  const highSeverity = result.recommendations.filter(r => r.severity === "high").length;
  const savings = result.totalMonthlySavings;
  if (result.isOptimal) {
    return `Your AI stack of ${toolCount} tool${toolCount !== 1 ? "s" : ""} is well-optimized — no significant overspend found across $${result.totalCurrentSpend}/mo of tooling. Keep reviewing quarterly; pricing and alternatives shift frequently.`;
  }
  const topRec = result.recommendations.find(r => r.severity === "high");
  return `Your AI stack has ${highSeverity > 0 ? `${highSeverity} high-priority` : "several"} optimization${highSeverity !== 1 ? "s" : ""} available, led by ${topRec ? topRec.toolName : "plan right-sizing"}. Acting on these recommendations saves $${savings}/month ($${savings * 12}/year) without sacrificing capability. Start with the highest-severity items — they require only plan adjustments.`;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const parsed = AuditInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input.", details: parsed.error.issues }, { status: 400 });
  }

  const input = parsed.data as AuditInput & { userEmail?: string };
  const result = runAudit(input);

  try {
    const summary = await Promise.race([
      generateSummary(result),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
    ]);
    result.aiSummary = summary;
  } catch {
    result.aiSummary = generateFallbackSummary(result);
  }

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

      // Round 2: capture pricing snapshot at audit time
      const pricingSnapshot = buildPricingSnapshot(input.tools.map(t => t.toolId));

      await supabase.from("audits").upsert({
        id: result.id,
        created_at: result.createdAt,
        input: result.input,
        recommendations: result.recommendations,
        total_current_spend: result.totalCurrentSpend,
        total_projected_spend: result.totalProjectedSpend,
        total_monthly_savings: result.totalMonthlySavings,
        total_annual_savings: result.totalAnnualSavings,
        ai_summary: result.aiSummary,
        is_optimal: result.isOptimal,
        // Round 2 fields
        user_email: input.userEmail ?? null,
        pricing_snapshot: pricingSnapshot,
        stale: false,
      });
    } catch (e) { console.error("[supabase] insert failed:", e); }
  }

  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}

/**
 * Captures the current prices for only the tools in this audit.
 * Stored as: { cursor: { Pro: 20, Business: 40 }, ... }
 */
function buildPricingSnapshot(toolIds: string[]): Record<string, Record<string, number>> {
  const snapshot: Record<string, Record<string, number>> = {};
  for (const toolId of toolIds) {
    const plans = PRICING_DATA[toolId];
    if (plans) {
      snapshot[toolId] = Object.fromEntries(
        plans.map(p => [p.plan, p.pricePerSeatPerMonth])
      );
    }
  }
  return snapshot;
}
