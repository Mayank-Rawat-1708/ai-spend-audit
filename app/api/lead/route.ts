import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const LeadSchema = z.object({
  auditId: z.string().min(1).max(50),
  email: z.string().email(),
  companyName: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  teamSize: z.number().int().min(1).max(100000).optional(),
  monthlySavings: z.number().optional(),
  honeypot: z.string().max(0).optional(),
});

const emailRateMap = new Map<string, number>();

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const data = parsed.data;

  if (data.honeypot && data.honeypot.length > 0) {
    return NextResponse.json({ success: true });
  }

  const emailKey = data.email.toLowerCase();
  const lastSubmit = emailRateMap.get(emailKey) ?? 0;
  if (Date.now() - lastSubmit < 1_200_000) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }
  emailRateMap.set(emailKey, Date.now());

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

      // Insert lead
      await supabase.from("leads").insert({
        audit_id: data.auditId,
        email: data.email,
        company_name: data.companyName ?? null,
        role: data.role ?? null,
        team_size: data.teamSize ?? null,
        monthly_savings: data.monthlySavings ?? 0,
        high_savings: (data.monthlySavings ?? 0) > 500,
        created_at: new Date().toISOString(),
      });

      // Round 2: backfill user_email on the audit row so detect-changes can reach them
      await supabase.from("audits")
        .update({ user_email: data.email })
        .eq("id", data.auditId)
        .is("user_email", null); // don't overwrite if already set
    } catch (e) { console.error("[supabase] lead insert failed:", e); }
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const isHighSavings = (data.monthlySavings ?? 0) > 500;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://stackaudit.credex.rocks";
      await resend.emails.send({
        from: "StackAudit <audit@credex.rocks>",
        to: data.email,
        subject: "Your AI Spend Audit Report",
        html: `
          <div style="font-family:monospace;max-width:600px;margin:0 auto;padding:24px;background:#060908;color:#dceadc;">
            <h1 style="color:#22c55e;font-size:22px;margin-bottom:16px;">Your AI Spend Audit is ready</h1>
            <p style="color:#5e7560;margin-bottom:20px;">View your full report:</p>
            <a href="${baseUrl}/result/${data.auditId}" style="color:#22c55e;font-weight:bold;">View Report →</a>
            ${isHighSavings ? `
            <div style="border:1px solid #22c55e;padding:16px;margin:24px 0;border-radius:4px;">
              <p style="margin:0;color:#22c55e;font-weight:bold;">High-savings opportunity detected</p>
              <p style="margin:8px 0 0;color:#5e7560;">Your audit shows significant savings potential. The Credex team will reach out within 1 business day.</p>
            </div>` : ""}
            <p style="color:#2e3e2f;font-size:12px;margin-top:32px;">StackAudit by Credex · credex.rocks</p>
          </div>
        `,
      });
    } catch (e) { console.error("[resend] email failed:", e); }
  }

  return NextResponse.json({ success: true });
}
