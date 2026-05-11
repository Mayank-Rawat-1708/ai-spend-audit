import type { AuditResult } from "@/types";

export default function SavingsHero({ result }: { result: AuditResult }) {
  const actionable = result.recommendations.filter(r => r.recommendedAction !== "keep").length;
  const highPriority = result.recommendations.filter(r => r.severity === "high").length;

  if (result.isOptimal) {
    return (
      <section className="anim-fade-up" style={{ padding: "44px 0 36px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>
          Audit Complete · {new Date(result.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 56, fontWeight: 700, color: "var(--green)", lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 14 }}>
          ✓ Optimal
        </div>
        <p style={{ fontSize: 17, color: "var(--text-muted)", maxWidth: 520, lineHeight: 1.6 }}>
          Your ${result.totalCurrentSpend.toLocaleString()}/mo AI stack is well-sized. No significant overspend found across {result.recommendations.length} tool{result.recommendations.length !== 1 ? "s" : ""}.
        </p>
      </section>
    );
  }

  return (
    <section className="anim-fade-up" style={{ padding: "44px 0 36px", borderBottom: "1px solid var(--border)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>
        Audit Complete · {new Date(result.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
        Potential monthly savings
      </div>
      <div className="hero-savings" style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(52px, 9vw, 92px)", fontWeight: 700, color: "var(--green)", lineHeight: 1, letterSpacing: "-0.025em", textShadow: "0 0 60px var(--green-glow-strong)", marginBottom: 8 }}>
        ${result.totalMonthlySavings.toLocaleString()}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, color: "var(--text-muted)", marginBottom: 28 }}>
        <span style={{ color: "var(--green)" }}>${result.totalAnnualSavings.toLocaleString()}/yr</span>
        {" · "}from ${result.totalCurrentSpend.toLocaleString()} → ${result.totalProjectedSpend.toLocaleString()}/mo
      </div>
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,auto)", gap: "20px 40px", width: "fit-content" }}>
        {[
          { val: result.recommendations.length, label: "Tools audited" },
          { val: actionable, label: "Actions found" },
          { val: highPriority, label: "High priority" },
        ].map(({ val, label }) => (
          <div key={label}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, lineHeight: 1, marginBottom: 4 }}>{val}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
