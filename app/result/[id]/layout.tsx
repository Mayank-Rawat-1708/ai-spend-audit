import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://stackaudit.credex.rocks";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  let title = "AI Spend Audit Report — StackAudit";
  let description = "See how much this team could save on AI tools. Check yours free.";
  try {
    const res = await fetch(`${BASE_URL}/api/result/${id}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const savings = data.totalMonthlySavings ?? 0;
      const toolCount = data.recommendations?.length ?? 0;
      if (savings > 0) {
        title = `$${savings.toLocaleString()}/mo in AI savings found — StackAudit`;
        description = `This team audited ${toolCount} AI tool${toolCount !== 1 ? "s" : ""} and found $${savings.toLocaleString()}/month in potential savings. Check yours free.`;
      } else {
        title = "Already spending optimally on AI — StackAudit";
        description = "This team's AI stack is well-optimized. Run your own free audit in 60 seconds.";
      }
    }
  } catch { /* use defaults */ }
  return {
    title,
    description,
    openGraph: { title, description, type: "website", siteName: "StackAudit by Credex", images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
  };
}

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
