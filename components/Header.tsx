"use client";
import Link from "next/link";
import { useFormStore } from "@/lib/store";
import { usePathname } from "next/navigation";

interface HeaderProps {
  rightSlot?: React.ReactNode;
}

export default function Header({ rightSlot }: HeaderProps) {
  const { reset, tools } = useFormStore();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header style={{ borderBottom: "1px solid var(--border)", padding: "0 20px", position: "sticky", top: 0, zIndex: 100, background: "rgba(6,9,8,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>

        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14, color: "var(--green)", letterSpacing: "0.1em" }}>STACKAUDIT</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.06em" }}>by CREDEX</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {rightSlot}

          {/* Clear all — only show on home when tools exist */}
          {isHome && tools.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Clear all tools and reset the form?")) reset();
              }}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: 3,
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "5px 12px",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--red)";
                e.currentTarget.style.color = "var(--red)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              Clear All
            </button>
          )}

          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.08em" }}>
            <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", display: "inline-block", flexShrink: 0 }} />
            FREE · NO LOGIN
          </div>
        </div>

      </div>
    </header>
  );
}