"use client";
import { useState } from "react";
import Link from "next/link";

interface Props { auditId: string; monthlySavings: number; }

export default function ShareBar({ auditId, monthlySavings }: Props) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/result/${auditId}`
    : `https://stackaudit.credex.rocks/result/${auditId}`;

  const tweetText = monthlySavings > 0
    ? `Just audited my AI tool stack with StackAudit and found $${monthlySavings.toLocaleString()}/mo in potential savings 👀\n\nCheck yours (free, no login):`
    : `Just audited my AI tool stack with StackAudit — already spending optimally. Check yours:`;

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(url); }
    catch { const el = document.createElement("textarea"); el.value = url; document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>
        Share this report — tools &amp; savings are public, your email is never shown
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={handleCopy} className="btn btn-secondary" style={{ minWidth: 130 }}>
          {copied ? "✓ Copied!" : "⬡ Copy Link"}
        </button>
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`}
          target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
          𝕏 Share on X
        </a>
        <Link href="/" className="btn btn-ghost">← New Audit</Link>
      </div>
    </div>
  );
}
