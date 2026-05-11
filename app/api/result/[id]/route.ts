import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data, error } = await supabase.from("audits").select("*").eq("id", id).single();
    if (error || !data) return NextResponse.json({ error: "Audit not found" }, { status: 404 });

    // Strip PII — public view only shows tools + savings
    const publicData = {
      id: data.id,
      createdAt: data.created_at,
      input: { tools: data.input.tools, teamSize: data.input.teamSize, useCase: data.input.useCase },
      recommendations: data.recommendations,
      totalCurrentSpend: data.total_current_spend,
      totalProjectedSpend: data.total_projected_spend,
      totalMonthlySavings: data.total_monthly_savings,
      totalAnnualSavings: data.total_annual_savings,
      aiSummary: data.ai_summary,
      isOptimal: data.is_optimal,
    };

    return NextResponse.json(publicData, {
      headers: { "Cache-Control": "public, s-maxage=3600" },
    });
  } catch (e) {
    console.error("[supabase] fetch failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
