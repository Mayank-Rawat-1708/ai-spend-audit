"use client";
import type { AuditResult, ToolRecommendation } from "@/types";

interface DiffViewProps {
  original: AuditResult | null;
  fresh: AuditResult | null;
}

const SEVERITY_COLOR: Record<string, string> = {
  high: "#f87171",
  medium: "#facc15",
  low: "#60a5fa",
  optimal: "#22c55e",
};

const ACTION_LABEL: Record<string, string> = {
  downgrade: "Downgrade",
  switch: "Switch",
  cancel: "Cancel",
  keep: "Keep",
  optimize: "Optimize",
};

function SavingsDelta({ original, fresh }: { original: AuditResult | null; fresh: AuditResult | null }) {
  if (!original || !fresh) return null;
  const delta = fresh.totalMonthlySavings - original.totalMonthlySavings;
  const deltaAnnual = delta * 12;
  const color = delta > 0 ? "#22c55e" : delta < 0 ? "#f87171" : "#5e7560";
  const sign = delta > 0 ? "+" : "";

  return (
    <div style={{
      background: "#0a140a",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "20px 24px",
      marginBottom: 28,
      display: "flex",
      gap: 32,
      flexWrap: "wrap",
    }}>
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 4 }}>SAVINGS DELTA</div>
        <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>
          {sign}${Math.abs(delta)}<span style={{ fontSize: 14, color: "var(--text-muted)" }}>/mo</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          {sign}${Math.abs(deltaAnnual)}/year vs original audit
        </div>
      </div>
      <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 32 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 4 }}>WAS</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-mono)" }}>${original.totalMonthlySavings}<span style={{ fontSize: 12, color: "var(--text-muted)" }}>/mo</span></div>
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 4 }}>NOW</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--green)", fontFamily: "var(--font-mono)" }}>${fresh.totalMonthlySavings}<span style={{ fontSize: 12, color: "var(--text-muted)" }}>/mo</span></div>
      </div>
    </div>
  );
}

function RecRow({ rec, isOld }: { rec: ToolRecommendation; isOld: boolean }) {
  return (
    <div style={{
      padding: "12px 14px",
      background: isOld ? "#0d0d0d" : "#0a140a",
      borderRadius: 4,
      border: `1px solid ${isOld ? "#1a1a1a" : "#1a2e1a"}`,
      height: "100%",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{rec.toolName}</span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: SEVERITY_COLOR[rec.severity] ?? "#5e7560",
          background: `${SEVERITY_COLOR[rec.severity] ?? "#5e7560"}18`,
          padding: "2px 6px",
          borderRadius: 3,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>{rec.severity}</span>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)", fontWeight: 600, marginBottom: 4 }}>
        {ACTION_LABEL[rec.recommendedAction] ?? rec.recommendedAction}
        {rec.recommendedPlan ? ` → ${rec.recommendedPlan}` : ""}
        {rec.recommendedTool ? ` → ${rec.recommendedTool}` : ""}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)" }}>
          ${rec.currentSpend}/mo
        </span>
        {rec.monthlySavings > 0 && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#22c55e" }}>
            saves ${rec.monthlySavings}/mo
          </span>
        )}
      </div>
    </div>
  );
}

function RecDiffRow({
  toolName,
  original,
  fresh,
}: {
  toolName: string;
  original: ToolRecommendation | undefined;
  fresh: ToolRecommendation | undefined;
}) {
  const unchanged =
    original &&
    fresh &&
    original.recommendedAction === fresh.recommendedAction &&
    original.monthlySavings === fresh.monthlySavings &&
    original.recommendedPlan === fresh.recommendedPlan;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" }}>
        {toolName}
        {unchanged && (
          <span style={{ marginLeft: 8, color: "#2e3e2f" }}>— unchanged</span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          {original ? <RecRow rec={original} isOld={true} /> : (
            <div style={{ padding: "12px 14px", background: "#0d0d0d", borderRadius: 4, border: "1px solid #1a1a1a", color: "var(--text-dim)", fontSize: 12 }}>
              Not in original audit
            </div>
          )}
        </div>
        <div>
          {fresh ? <RecRow rec={fresh} isOld={false} /> : (
            <div style={{ padding: "12px 14px", background: "#0a140a", borderRadius: 4, border: "1px solid #1a2e1a", color: "var(--text-dim)", fontSize: 12 }}>
              No longer flagged
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiffView({ original, fresh }: DiffViewProps) {
  if (!original && !fresh) return null;

  // Collect all tool IDs across both audits
  const allToolIds = Array.from(new Set([
    ...(original?.recommendations.map(r => r.toolId) ?? []),
    ...(fresh?.recommendations.map(r => r.toolId) ?? []),
  ]));

  const changedTools = allToolIds.filter(toolId => {
    const o = original?.recommendations.find(r => r.toolId === toolId);
    const f = fresh?.recommendations.find(r => r.toolId === toolId);
    if (!o || !f) return true;
    return (
      o.recommendedAction !== f.recommendedAction ||
      o.monthlySavings !== f.monthlySavings ||
      o.recommendedPlan !== f.recommendedPlan
    );
  });

  const unchangedTools = allToolIds.filter(id => !changedTools.includes(id));

  return (
    <div>
      <SavingsDelta original={original} fresh={fresh} />

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Original audit
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--green)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Updated (current pricing)
        </div>
      </div>

      {/* Changed tools first */}
      {changedTools.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#f87171", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            ● {changedTools.length} recommendation{changedTools.length !== 1 ? "s" : ""} changed
          </div>
          {changedTools.map(toolId => {
            const o = original?.recommendations.find(r => r.toolId === toolId);
            const f = fresh?.recommendations.find(r => r.toolId === toolId);
            const toolName = o?.toolName ?? f?.toolName ?? toolId;
            return <RecDiffRow key={toolId} toolName={toolName} original={o} fresh={f} />;
          })}
        </div>
      )}

      {/* Unchanged tools — collapsed by default */}
      {unchangedTools.length > 0 && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", marginBottom: 10 }}>
            ○ {unchangedTools.length} unchanged tool{unchangedTools.length !== 1 ? "s" : ""} (click to expand)
          </summary>
          <div style={{ marginTop: 10, opacity: 0.5 }}>
            {unchangedTools.map(toolId => {
              const o = original?.recommendations.find(r => r.toolId === toolId);
              const f = fresh?.recommendations.find(r => r.toolId === toolId);
              const toolName = o?.toolName ?? f?.toolName ?? toolId;
              return <RecDiffRow key={toolId} toolName={toolName} original={o} fresh={f} />;
            })}
          </div>
        </details>
      )}
    </div>
  );
}
