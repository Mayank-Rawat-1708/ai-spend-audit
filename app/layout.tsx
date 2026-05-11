import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://stackaudit.credex.rocks";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: "StackAudit — Are you overpaying for AI tools?", template: "%s | StackAudit" },
  description: "Free AI spend audit for startups. Find out where you're overspending on Cursor, Claude, ChatGPT, GitHub Copilot, Gemini, and Windsurf. Instant recommendations in 60 seconds.",
  openGraph: {
    type: "website",
    title: "StackAudit — Are you overpaying for AI tools?",
    description: "Free AI spend audit. Find real savings in your AI tool stack in 60 seconds. No login required.",
    siteName: "StackAudit by Credex",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "StackAudit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "StackAudit — Are you overpaying for AI tools?",
    description: "Free AI spend audit. Find real savings in your AI tool stack in 60 seconds.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><link rel="icon" href="/favicon.ico" sizes="any" /></head>
      <body>{children}</body>
    </html>
  );
}
