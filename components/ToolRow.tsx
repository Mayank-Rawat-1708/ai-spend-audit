"use client";
import { useState } from "react";
import type { ToolId } from "@/types";
import { TOOL_NAMES, TOOL_PLANS } from "@/types";

const ALL_TOOLS: ToolId[] = [
  "cursor",
  "github_copilot",
  "claude",
  "chatgpt",
  "anthropic_api",
  "openai_api",
  "gemini",
  "windsurf",
];
const TOOL_ICONS: Record<ToolId, string> = {
  cursor: "⌥",
  github_copilot: "◎",
  claude: "◈",
  chatgpt: "◐",
  anthropic_api: "◆",
  openai_api: "○",
  gemini: "◇",
  windsurf: "◉",
};

interface ToolRowProps {
  toolId: ToolId;
  plan: string;
  monthlySpend: number;
  seats: number;
  usedIds: Set<string>;
  onUpdate: (
    field: "toolId" | "plan" | "monthlySpend" | "seats",
    value: string | number,
  ) => void;
  onRemove: () => void;
}

export default function ToolRow({
  toolId,
  plan,
  monthlySpend,
  seats,
  usedIds,
  onUpdate,
  onRemove,
}: ToolRowProps) {
  const plans = TOOL_PLANS[toolId] || [];

  // Local string state so user can freely type/backspace without snapping back
  const [spendStr, setSpendStr] = useState(String(monthlySpend));
  const [seatsStr, setSeatsStr] = useState(String(seats));

  return (
    <div
      style={{
        background: "var(--bg-input)",
        border: "1px solid var(--border)",
        borderRadius: 4,
        padding: "14px 16px",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--border-bright)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--border)")
      }
    >
      <div className="tool-row">
        {/* Tool */}
        <div className="tool-col-tool">
          <label className="field-label">Tool</label>
          <select
            value={toolId}
            onChange={(e) => {
              const id = e.target.value as ToolId;
              onUpdate("toolId", id);
              onUpdate("plan", TOOL_PLANS[id]?.[0] ?? "Pro");
            }}
          >
            {ALL_TOOLS.map((id) => (
              <option key={id} value={id} disabled={usedIds.has(id)}>
                {TOOL_ICONS[id]} {TOOL_NAMES[id]}
              </option>
            ))}
          </select>
        </div>

        {/* Plan */}
        <div className="tool-col-plan">
          <label className="field-label">Plan</label>
          <select
            value={plan}
            onChange={(e) => onUpdate("plan", e.target.value)}
          >
            {plans.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Monthly spend — local string state */}
        <div className="tool-col-spend">
          <label className="field-label">$/Month</label>
          <input
            type="number"
            min={0}
            max={100000}
            value={spendStr}
            placeholder="0"
            onChange={(e) => {
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
            onFocus={(e) => e.target.select()}
          />
        </div>

        {/* Seats — local string state */}
        <div className="tool-col-seats">
          <label className="field-label">Seats</label>
          <input
            type="number"
            min={1}
            max={10000}
            value={seatsStr}
            placeholder="1"
            onChange={(e) => {
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
            onFocus={(e) => e.target.select()}
          />
        </div>

        {/* Remove */}
        <div className="tool-col-remove" style={{ paddingBottom: 1 }}>
          <button
            onClick={onRemove}
            aria-label="Remove tool"
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: 3,
              color: "var(--text-muted)",
              cursor: "pointer",
              width: 36,
              height: 36,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "var(--red)";
              el.style.color = "var(--red)";
              el.style.background = "var(--red-dim)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "var(--border)";
              el.style.color = "var(--text-muted)";
              el.style.background = "none";
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
