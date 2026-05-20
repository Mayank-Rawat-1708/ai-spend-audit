import { NextRequest, NextResponse } from "next/server";

/** GET /api/unsubscribe?auditId=xxx&email=yyy — one-click unsubscribe from email */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const auditId = searchParams.get("auditId");
  const email = searchParams.get("email");

  if (!auditId || !email) {
    return new NextResponse("Missing auditId or email", { status: 400 });
  }

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      await supabase.from("audits")
        .update({ unsubscribed: true })
        .eq("id", auditId)
        .eq("user_email", email);
    } catch (e) {
      console.error("[unsubscribe] failed:", e);
    }
  }

  // Redirect to a simple confirmation page
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  return NextResponse.redirect(`${baseUrl}/unsubscribed`, { status: 302 });
}
