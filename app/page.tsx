"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/lib/store";
import type { ToolId, UseCase } from "@/types";
import { TOOL_PLANS } from "@/types";
import Header from "@/components/Header";
import ToolRow from "@/components/ToolRow";

const ALL_TOOLS: ToolId[] = ["cursor","github_copilot","claude","chatgpt","anthropic_api","openai_api","gemini","windsurf"];
const USE_CASES: { value: UseCase; label: string }[] = [
  { value: "coding",   label: "Coding / Engineering" },
  { value: "writing",  label: "Writing / Content" },
  { value: "data",     label: "Data / Analytics" },
  { value: "research", label: "Research" },
  { value: "mixed",    label: "Mixed / General" },
];

export default function HomePage() {
  const router = useRouter();
  const { tools, teamSize, useCase, addTool, updateTool, removeTool, setTeamSize, setUseCase } = useFormStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  const usedIds = new Set(tools.map(t => t.toolId));

  const handleAddTool = () => {
    const available = ALL_TOOLS.find(t => !usedIds.has(t));
    if (available) addTool({ toolId: available, plan: TOOL_PLANS[available]?.[1] ?? TOOL_PLANS[available]?.[0] ?? "Pro", monthlySpend: 20, seats: 1 });
  };

  const handleSubmit = async () => {
    if (!mounted) return;
    if (tools.length === 0) { setError("Add at least one AI tool to audit."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tools, teamSize, useCase }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Audit failed."); }
      const data = await res.json();
      try { localStorage.setItem(`audit_${data.id}`, JSON.stringify(data)); } catch {}
      router.push(`/result/${data.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  };

  const totalSpend = mounted ? tools.reduce((s, t) => s + (t.monthlySpend || 0), 0) : 0;

  return (
    <div className="grid-bg" style={{ minHeight: "100dvh" }}>
      <Header />
      <main className="container" style={{ paddingBottom: 80 }}>

        {/* Hero */}
        <section className="anim-fade-up" style={{ padding: "56px 0 44px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--green)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 18 }}>
            AI Spend Audit · Free · No Login
          </div>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(34px, 6.5vw, 68px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.025em", marginBottom: 18 }}>
            Are you overpaying<br /><span style={{ color: "var(--green)" }}>for AI tools?</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-muted)", maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.65 }}>
            Enter your AI stack and get an instant, defensible audit — what to cut, downgrade, or switch. Takes 60 seconds.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {["Cursor","Claude","ChatGPT","Copilot","Gemini","Windsurf"].map(t => (
              <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.06em" }}>✓ {t}</span>
            ))}
          </div>
        </section>

        {/* Form */}
        <div className="anim-fade-up-1" style={{ maxWidth: 760, margin: "0 auto" }}>

          {/* Step 1 */}
          <div className="card-section">
            <div className="label" style={{ marginBottom: 18 }}>01 / Team Context</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="field-label">Team size</label>
                <input type="number" min={1} max={10000} value={mounted ? teamSize : 1}
                  onChange={e => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))} placeholder="e.g. 5" />
              </div>
              <div>
                <label className="field-label">Primary use case</label>
                <select value={mounted ? useCase : "mixed"} onChange={e => setUseCase(e.target.value as UseCase)}>
                  {USE_CASES.map(uc => <option key={uc.value} value={uc.value}>{uc.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="card-section">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <span className="label">02 / Your AI Tools</span>
              {mounted && tools.length > 0 && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--green)" }}>${totalSpend.toLocaleString()}/mo total</span>
              )}
            </div>

            {mounted && tools.length === 0 && (
              <div style={{ textAlign: "center", padding: "28px 0", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.05em" }}>
                No tools added yet — click below to get started
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mounted && tools.map((tool, i) => {
                const rowUsedIds = new Set(tools.map((t, j) => j !== i ? t.toolId : null).filter((x): x is ToolId => x !== null));
                return (
                  <ToolRow key={`${tool.toolId}-${i}`} toolId={tool.toolId} plan={tool.plan}
                    monthlySpend={tool.monthlySpend} seats={tool.seats} usedIds={rowUsedIds}
                    onUpdate={(field, value) => updateTool(i, { [field]: value })}
                    onRemove={() => removeTool(i)} />
                );
              })}
            </div>

            <button onClick={handleAddTool} disabled={!mounted || tools.length >= ALL_TOOLS.length}
              style={{ marginTop: 12, background: "none", border: "1px dashed var(--border-bright)", borderRadius: 4,
                color: "var(--text-muted)", cursor: tools.length >= ALL_TOOLS.length ? "not-allowed" : "pointer",
                padding: "11px 0", width: "100%", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em",
                textTransform: "uppercase", transition: "all 0.15s", opacity: tools.length >= ALL_TOOLS.length ? 0.4 : 1 }}
              onMouseEnter={e => { if (tools.length < ALL_TOOLS.length) { e.currentTarget.style.borderColor = "var(--green-mid)"; e.currentTarget.style.color = "var(--green)"; }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-bright)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
              + Add Tool
            </button>
          </div>

          {error && (
            <div style={{ padding: "11px 14px", background: "var(--red-dim)", border: "1px solid var(--red-border)", borderRadius: 4, color: "var(--red)", fontFamily: "var(--font-mono)", fontSize: 12, marginBottom: 12 }}>
              ⚠ {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading || !mounted} className="btn btn-primary btn-full"
            style={{ fontSize: 13, letterSpacing: "0.1em", padding: "17px 24px" }}>
            {loading
              ? <><span className="spinner" style={{ borderColor: "#000", borderTopColor: "transparent" }} />Analyzing your stack...</>
              : "Run My Audit →"}
          </button>
          <p style={{ textAlign: "center", marginTop: 10, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.06em" }}>
            No login required · Free forever · ~5 seconds
          </p>
        </div>

        {/* Stats */}
        <section className="anim-fade-up-3" style={{ marginTop: 72, paddingTop: 48, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
            {[{ stat: "$2,400", label: "Avg annual savings" },{ stat: "8 tools", label: "Audited per session" },{ stat: "60 sec", label: "To complete an audit" }].map(({ stat, label }) => (
              <div key={stat}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: "var(--green)", marginBottom: 6 }}>{stat}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="anim-fade-up-4" style={{ marginTop: 64, paddingTop: 48, borderTop: "1px solid var(--border)", maxWidth: 760, margin: "64px auto 0" }}>
          <div className="label" style={{ textAlign: "center", marginBottom: 32 }}>How It Works</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {[
              { step: "01", title: "Enter your stack", desc: "Add each AI tool, plan, monthly spend, and seat count." },
              { step: "02", title: "Get your audit", desc: "Our engine checks every tool against current pricing and alternatives for your use case." },
              { step: "03", title: "Act on it", desc: "Per-tool recommendations with specific actions, savings figures, and defensible reasoning." },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ padding: 20, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 4 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--green)", letterSpacing: "0.14em", marginBottom: 10 }}>{step}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 0", marginTop: 64 }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>STACKAUDIT by Credex · credex.rocks</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>Pricing verified weekly from official vendor pages</span>
        </div>
      </footer>
    </div>
  );
}
