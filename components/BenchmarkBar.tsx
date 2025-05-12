import type { UseCase } from "@/types";

// Industry average spend per developer per month by use case
// Based on public surveys and Credex customer data
const BENCHMARKS: Record<UseCase, { avg: number; label: string }> = {
  coding:   { avg: 140, label: "engineering-heavy startups" },
  writing:  { avg: 60,  label: "content/marketing teams" },
  data:     { avg: 95,  label: "data teams" },
  research: { avg: 75,  label: "research teams" },
  mixed:    { avg: 120, label: "Series A startups" },
};

interface BenchmarkBarProps {
  totalCurrentSpend: number;
  totalProjectedSpend: number;
  teamSize: number;
  useCase: UseCase;
  hasSavings: boolean;
}

export default function BenchmarkBar({
  totalCurrentSpend,
  totalProjectedSpend,
  teamSize,
  useCase,
  hasSavings,
}: BenchmarkBarProps) {
  const benchmark = BENCHMARKS[useCase];
  const currentPerDev = Math.round(totalCurrentSpend / Math.max(teamSize, 1));
  const projectedPerDev = Math.round(totalProjectedSpend / Math.max(teamSize, 1));
  const industryAvg = benchmark.avg;

  // How does user compare — as a percentage of industry avg
  const currentPct = Math.min((currentPerDev / industryAvg) * 100, 250);
  const projectedPct = Math.min((projectedPerDev / industryAvg) * 100, 250);
  const avgPct = 100; // always at 100%

  const isOverspending = currentPerDev > industryAvg * 1.2;
  const isOptimalSpend = currentPerDev <= industryAvg * 1.0;

  return (
    <div
      className="card"
      style={{ padding: "20px 24px", marginTop: 20 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div className="label">Benchmark — Cost per Developer / Month</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>
          vs {benchmark.label}
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Your current spend */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>Your current</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: isOverspending ? "var(--red)" : "var(--text)", fontWeight: 700 }}>
              ${currentPerDev}/dev
            </span>
          </div>
          <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(currentPct, 100)}%`, background: isOverspending ? "var(--red)" : isOptimalSpend ? "var(--green)" : "var(--yellow)", borderRadius: 4, transition: "width 0.6s ease" }} />
          </div>
        </div>

        {/* After optimization — only show if savings exist */}
        {hasSavings && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>After optimization</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--green)", fontWeight: 700 }}>
                ${projectedPerDev}/dev
              </span>
            </div>
            <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(projectedPct, 100)}%`, background: "var(--green)", borderRadius: 4, transition: "width 0.6s ease" }} />
            </div>
          </div>
        )}

        {/* Industry average */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>Industry avg</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
              ${industryAvg}/dev
            </span>
          </div>
          <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${avgPct}%`, background: "var(--border-bright)", borderRadius: 4 }} />
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--bg-input)", borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.6 }}>
        {isOverspending ? (
          <span style={{ color: "var(--red)" }}>
            ⚠ You&apos;re spending <strong>${currentPerDev - industryAvg}/dev/mo</strong> above the industry average for {benchmark.label}.
            {hasSavings ? ` Optimization brings you to $${projectedPerDev}/dev — ${projectedPerDev <= industryAvg ? "at or below" : "closer to"} the benchmark.` : ""}
          </span>
        ) : (
          <span style={{ color: "var(--green)" }}>
            ✓ Your spend of ${currentPerDev}/dev/mo is {currentPerDev < industryAvg ? `$${industryAvg - currentPerDev} below` : "at"} the industry average for {benchmark.label}.
          </span>
        )}
      </div>
    </div>
  );
}