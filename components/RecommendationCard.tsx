import type { ToolRecommendation } from "@/types";

const ACTION_LABELS: Record<string, string> = { downgrade:"DOWNGRADE", switch:"SWITCH TOOL", cancel:"CANCEL", keep:"KEEP ✓", optimize:"OPTIMIZE" };
const ACTION_COLORS: Record<string, string> = { downgrade:"var(--yellow)", switch:"var(--orange)", cancel:"var(--red)", keep:"var(--green)", optimize:"var(--blue)" };
const ACTION_BG: Record<string, string>     = { downgrade:"var(--yellow-dim)", switch:"rgba(251,146,60,0.1)", cancel:"var(--red-dim)", keep:"var(--green-glow)", optimize:"var(--blue-dim)" };

export default function RecommendationCard({ rec }: { rec: ToolRecommendation }) {
  const borderColor = rec.severity === "high" ? "rgba(248,113,113,0.28)" : rec.severity === "optimal" ? "rgba(34,197,94,0.15)" : "var(--border)";
  return (
    <div className="card" style={{ padding: "20px 22px", borderColor, transition: "border-color 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = rec.severity === "high" ? "0 0 0 1px rgba(248,113,113,0.12)" : "0 0 0 1px var(--border-bright)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Left */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14 }}>{rec.toolName}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", background: "var(--bg-input)", padding: "2px 7px", borderRadius: 2, border: "1px solid var(--border)" }}>{rec.currentPlan}</span>
            <span className={`badge badge-${rec.severity}`}>{rec.severity}</span>
            {rec.credexApplicable && rec.recommendedAction !== "keep" && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--green)", background: "var(--green-glow)", border: "1px solid rgba(34,197,94,0.2)", padding: "2px 6px", borderRadius: 2, letterSpacing: "0.08em" }}>
                CREDEX ELIGIBLE
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, maxWidth: 560 }}>{rec.reason}</p>
          {(rec.recommendedPlan || rec.recommendedTool) && (
            <div style={{ marginTop: 10, display: "flex", gap: 16, flexWrap: "wrap" }}>
              {rec.recommendedPlan && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}><span style={{ color: "var(--text-muted)" }}>Switch to plan: </span><span style={{ color: "var(--text)" }}>{rec.recommendedPlan}</span></div>}
              {rec.recommendedTool && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}><span style={{ color: "var(--text-muted)" }}>Switch to tool: </span><span style={{ color: "var(--text)" }}>{rec.recommendedTool}</span></div>}
            </div>
          )}
        </div>
        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, minWidth: 130 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", textDecoration: rec.recommendedAction !== "keep" ? "line-through" : "none" }}>
            ${rec.currentSpend.toLocaleString()}/mo
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, letterSpacing: "0.07em", color: ACTION_COLORS[rec.recommendedAction], background: ACTION_BG[rec.recommendedAction], border: `1px solid ${ACTION_COLORS[rec.recommendedAction]}40`, padding: "5px 10px", borderRadius: 3 }}>
            {ACTION_LABELS[rec.recommendedAction]}
          </div>
          {rec.monthlySavings > 0 && (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--green)" }}>−${rec.monthlySavings.toLocaleString()}/mo</div>
          )}
          {rec.recommendedAction !== "keep" && (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>→ ${rec.projectedSpend.toLocaleString()}/mo</div>
          )}
        </div>
      </div>
    </div>
  );
}
