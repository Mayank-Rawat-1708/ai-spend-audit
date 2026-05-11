export default function CredexCTA({ monthlySavings }: { monthlySavings: number }) {
  return (
    <div className="card" style={{ padding: "24px", borderColor: "rgba(34,197,94,0.28)", boxShadow: "0 0 48px var(--green-glow), inset 0 0 48px rgba(34,197,94,0.03)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, background: "radial-gradient(circle, var(--green-glow-strong), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", position: "relative" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
            💰 High-Savings Opportunity Detected
          </div>
          <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>
            Capture more savings with Credex AI credits
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.65, maxWidth: 460 }}>
            Credex sources discounted Cursor, Claude, ChatGPT Enterprise, and API credits from companies that overforecast or pivoted.
            Real discounts — not trials. You&apos;re saving <span style={{ color: "var(--text)" }}>${monthlySavings.toLocaleString()}/mo</span> through
            plan optimization alone; credits can stack additional savings on top.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
          <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: "13px 22px", fontSize: 12 }}>
            BOOK A CALL →
          </a>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-dim)", textAlign: "center", letterSpacing: "0.06em" }}>
            Free · No commitment
          </div>
        </div>
      </div>
    </div>
  );
}
