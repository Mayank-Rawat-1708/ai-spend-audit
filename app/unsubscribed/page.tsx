import Link from "next/link";

export default function UnsubscribedPage() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, textAlign: "center", padding: "0 20px", fontFamily: "var(--font-mono)" }}>
      <div style={{ fontSize: 48, color: "var(--green)" }}>✓</div>
      <h1 style={{ color: "var(--text)", fontSize: 18, margin: 0 }}>Unsubscribed</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 13, maxWidth: 320, lineHeight: 1.6, margin: 0 }}>
        You won&apos;t receive re-audit alerts for this audit anymore.
      </p>
      <Link href="/" style={{ color: "var(--green)", fontSize: 13, marginTop: 8 }}>
        ← Run a new audit
      </Link>
    </div>
  );
}
