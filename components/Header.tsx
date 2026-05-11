"use client";
import Link from "next/link";

interface HeaderProps {
  rightSlot?: React.ReactNode;
}

export default function Header({ rightSlot }: HeaderProps) {
  return (
    <header style={{ borderBottom: "1px solid var(--border)", padding: "0 20px", position: "sticky", top: 0, zIndex: 100, background: "rgba(6,9,8,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14, color: "var(--green)", letterSpacing: "0.1em" }}>STACKAUDIT</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.06em" }}>by CREDEX</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {rightSlot}
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.08em" }}>
            <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", display: "inline-block", flexShrink: 0 }} />
            FREE · NO LOGIN
          </div>
        </div>
      </div>
    </header>
  );
}
