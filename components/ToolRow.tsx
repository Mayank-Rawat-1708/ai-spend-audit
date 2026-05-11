"use client";
import type { ToolId } from "@/types";
import { TOOL_NAMES, TOOL_PLANS } from "@/types";

const ALL_TOOLS: ToolId[] = ["cursor","github_copilot","claude","chatgpt","anthropic_api","openai_api","gemini","windsurf"];
const TOOL_ICONS: Record<ToolId, string> = { cursor:"⌥", github_copilot:"◎", claude:"◈", chatgpt:"◐", anthropic_api:"◆", openai_api:"○", gemini:"◇", windsurf:"◉" };

interface ToolRowProps {
  toolId: ToolId;
  plan: string;
  monthlySpend: number;
  seats: number;
  usedIds: Set<string>;
  onUpdate: (field: "toolId" | "plan" | "monthlySpend" | "seats", value: string | number) => void;
  onRemove: () => void;
}

export default function ToolRow({ toolId, plan, monthlySpend, seats, usedIds, onUpdate, onRemove }: ToolRowProps) {
  const plans = TOOL_PLANS[toolId] || [];
  return (
    <div style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 4, padding: "14px 16px", transition: "border-color 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-bright)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
      <div className="tool-row">
        <div className="tool-col-tool">
          <label className="field-label">Tool</label>
          <select value={toolId} onChange={e => { const id = e.target.value as ToolId; onUpdate("toolId", id); onUpdate("plan", TOOL_PLANS[id]?.[0] ?? "Pro"); }}>
            {ALL_TOOLS.map(id => <option key={id} value={id} disabled={usedIds.has(id)}>{TOOL_ICONS[id]} {TOOL_NAMES[id]}</option>)}
          </select>
        </div>
        <div className="tool-col-plan">
          <label className="field-label">Plan</label>
          <select value={plan} onChange={e => onUpdate("plan", e.target.value)}>
            {plans.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="tool-col-spend">
          <label className="field-label">$/Month</label>
          <input type="number" min={0} max={100000} value={monthlySpend}
            onChange={e => onUpdate("monthlySpend", parseFloat(e.target.value) || 0)} placeholder="0" />
        </div>
        <div className="tool-col-seats">
          <label className="field-label">Seats</label>
          <input type="number" min={1} max={10000} value={seats}
            onChange={e => onUpdate("seats", parseInt(e.target.value) || 1)} placeholder="1" />
        </div>
        <div className="tool-col-remove" style={{ paddingBottom: 1 }}>
          <button onClick={onRemove} aria-label="Remove tool"
            style={{ background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--text-muted)", cursor: "pointer", width: 36, height: 36, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor="var(--red)"; el.style.color="var(--red)"; el.style.background="var(--red-dim)"; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor="var(--border)"; el.style.color="var(--text-muted)"; el.style.background="none"; }}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
