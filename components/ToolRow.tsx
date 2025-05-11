"use client";
import { useState } from "react";
import type { ToolId } from "@/types";
import { TOOL_NAMES, TOOL_PLANS } from "@/types";

const ALL_TOOLS: ToolId[] = ["cursor","github_copilot","claude","chatgpt","anthropic_api","openai_api","gemini","windsurf"];

// SVG icon paths — inline so no external deps needed
const TOOL_ICONS: Record<ToolId, React.ReactNode> = {
  cursor: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 2L20 12L12 13.5L8.5 20L4 2Z" fill="currentColor"/>
    </svg>
  ),
  github_copilot: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  ),
  claude: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
    </svg>
  ),
  chatgpt: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.369 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.681zm2.010-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  ),
  anthropic_api: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017L3.674 20H0L6.569 3.52zm4.132 9.959L8.453 7.687 6.205 13.48h4.496z"/>
    </svg>
  ),
  openai_api: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.369 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.681zm2.010-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  ),
  gemini: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.304 14.304 0 0012 12 14.304 14.304 0 00-12 12z"/>
    </svg>
  ),
  windsurf: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
};

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
  const [spendStr, setSpendStr] = useState(String(monthlySpend));
  const [seatsStr, setSeatsStr] = useState(String(seats));

  return (
    <div
      style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 4, padding: "14px 16px", transition: "border-color 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-bright)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div className="tool-row">

        {/* Tool */}
        <div className="tool-col-tool">
          <label className="field-label">Tool</label>
          <select
            value={toolId}
            onChange={e => {
              const id = e.target.value as ToolId;
              onUpdate("toolId", id);
              onUpdate("plan", TOOL_PLANS[id]?.[0] ?? "Pro");
            }}
            style={{ paddingLeft: 10 }}
          >
            {ALL_TOOLS.map(id => (
              <option key={id} value={id} disabled={usedIds.has(id)}>
                {TOOL_NAMES[id]}
              </option>
            ))}
          </select>
          {/* Icon badge next to selected tool */}
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }}>
            {TOOL_ICONS[toolId]}
          </div>
        </div>

        {/* Plan */}
        <div className="tool-col-plan">
          <label className="field-label">Plan</label>
          <select value={plan} onChange={e => onUpdate("plan", e.target.value)}>
            {plans.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Spend */}
        <div className="tool-col-spend">
          <label className="field-label">$/Month</label>
          <input
            type="number"
            min={0}
            max={100000}
            value={spendStr}
            placeholder="0"
            onChange={e => {
              setSpendStr(e.target.value);
              const n = parseFloat(e.target.value);
              if (!isNaN(n) && n >= 0) onUpdate("monthlySpend", n);
            }}
            onBlur={() => {
              const n = parseFloat(spendStr);
              const safe = isNaN(n) || n < 0 ? 0 : n;
              setSpendStr(String(safe));
              onUpdate("monthlySpend", safe);
            }}
            onFocus={e => e.target.select()}
          />
        </div>

        {/* Seats */}
        <div className="tool-col-seats">
          <label className="field-label">Seats</label>
          <input
            type="number"
            min={1}
            max={10000}
            value={seatsStr}
            placeholder="1"
            onChange={e => {
              setSeatsStr(e.target.value);
              const n = parseInt(e.target.value);
              if (!isNaN(n) && n >= 1) onUpdate("seats", n);
            }}
            onBlur={() => {
              const n = parseInt(seatsStr);
              const safe = isNaN(n) || n < 1 ? 1 : n;
              setSeatsStr(String(safe));
              onUpdate("seats", safe);
            }}
            onFocus={e => e.target.select()}
          />
        </div>

        {/* Remove */}
        <div className="tool-col-remove" style={{ paddingBottom: 1 }}>
          <button
            onClick={onRemove}
            aria-label="Remove tool"
            style={{ background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--text-muted)", cursor: "pointer", width: 36, height: 36, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = "var(--red)"; el.style.color = "var(--red)"; el.style.background = "var(--red-dim)"; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = "var(--border)"; el.style.color = "var(--text-muted)"; el.style.background = "none"; }}
          >
            ✕
          </button>
        </div>

      </div>

      {/* Tool name + icon display row below selects */}
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--green)", display: "flex", alignItems: "center" }}>
          {TOOL_ICONS[toolId]}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
          {TOOL_NAMES[toolId]} · {plan}
        </span>
        {monthlySpend > 0 && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", marginLeft: "auto" }}>
            ${(monthlySpend * seats).toLocaleString()}/mo total
          </span>
        )}
      </div>
    </div>
  );
}