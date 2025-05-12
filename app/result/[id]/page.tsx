"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import type { AuditResult } from "@/types";
import Header from "@/components/Header";
import SavingsHero from "@/components/SavingsHero";
import RecommendationCard from "@/components/RecommendationCard";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import CredexCTA from "@/components/CredexCTA";
import ShareBar from "@/components/ShareBar";
import BenchmarkBar from "@/components/BenchmarkBar";

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, borderColor: "var(--border)", borderTopColor: "var(--green)" }} />
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Loading audit...
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, textAlign: "center", padding: "0 20px" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 64, color: "var(--text-dim)", lineHeight: 1 }}>404</div>
      <p style={{ color: "var(--text-muted)", fontSize: 15, maxWidth: 320, lineHeight: 1.6 }}>
        Audit not found. It may have expired or the link is incorrect.
      </p>
      <Link href="/" className="btn btn-secondary" style={{ marginTop: 8 }}>
        ← Run a new audit
      </Link>
    </div>
  );
}

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadResult = async () => {
      // 1. Try localStorage
      try {
        const cached = localStorage.getItem(`audit_${id}`);
        if (cached) {
          const parsed = JSON.parse(cached) as AuditResult;
          if (!cancelled) { setResult(parsed); setLoading(false); }
          return;
        }
      } catch { /* fall through */ }

      // 2. Try URL-encoded fallback
      const urlParams = new URLSearchParams(window.location.search);
      const encoded = urlParams.get("d");
      if (encoded) {
        try {
          const decoded = JSON.parse(atob(encoded)) as AuditResult;
          if (!cancelled) { setResult(decoded); setLoading(false); }
          return;
        } catch { /* fall through */ }
      }

      // 3. Fetch from API
      try {
        const res = await fetch(`/api/result/${id}`);
        if (!res.ok) throw new Error("not found");
        const data = await res.json() as AuditResult;
        if (!cancelled) { setResult(data); setLoading(false); }
      } catch {
        if (!cancelled) { setResult(null); setLoading(false); }
      }
    };

    loadResult();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!result) return <NotFound />;

  const isHighSavings = result.totalMonthlySavings > 500;
  const highRecs = result.recommendations.filter(r => r.severity === "high");
  const otherRecs = result.recommendations.filter(r => r.severity !== "high");

  return (
    <div className="grid-bg" style={{ minHeight: "100dvh" }}>
      <Header />

      <main className="container" style={{ paddingBottom: 80 }}>

        <SavingsHero result={result} />

        {/* AI Summary */}
        {result.aiSummary && (
          <section className="anim-fade-up-1" style={{ padding: "28px 0", borderBottom: "1px solid var(--border)" }}>
            <div className="label" style={{ marginBottom: 12 }}>◈ AI Analysis</div>
            <blockquote style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75, maxWidth: 680, fontStyle: "italic", borderLeft: "2px solid var(--green-mid)", paddingLeft: 18, margin: 0 }}>
              {result.aiSummary}
            </blockquote>
          </section>
        )}

        {/* Credex CTA — high savings only */}
        {isHighSavings && (
          <div className="anim-fade-up-2" style={{ paddingTop: 24 }}>
            <CredexCTA monthlySavings={result.totalMonthlySavings} />
          </div>
        )}

        {/* Per-tool breakdown */}
        <section className="anim-fade-up-2" style={{ paddingTop: 32 }}>
          <div className="label" style={{ marginBottom: 16 }}>Per-Tool Breakdown</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {highRecs.length > 0 && (
              <>
                {highRecs.map((rec, i) => <RecommendationCard key={`h${i}`} rec={rec} />)}
                {otherRecs.length > 0 && <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />}
              </>
            )}
            {otherRecs.map((rec, i) => <RecommendationCard key={`o${i}`} rec={rec} />)}
          </div>
        </section>

        {/* Benchmark bar — shown for all team sizes */}
        <div className="anim-fade-up-3">
          <BenchmarkBar
            totalCurrentSpend={result.totalCurrentSpend}
            totalProjectedSpend={result.totalProjectedSpend}
            teamSize={result.input.teamSize}
            useCase={result.input.useCase}
            hasSavings={!result.isOptimal}
          />
        </div>

        <hr className="divider" />

        <div className="anim-fade-up-3">
          <LeadCaptureForm
            auditId={result.id}
            monthlySavings={result.totalMonthlySavings}
            isOptimal={result.isOptimal}
          />
        </div>

        <div style={{ height: 24 }} />

        <div className="anim-fade-up-4">
          <ShareBar auditId={result.id} monthlySavings={result.totalMonthlySavings} />
        </div>

      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 0", marginTop: 24 }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>STACKAUDIT by Credex · credex.rocks</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>
            Pricing data verified {new Date(result.createdAt).toLocaleDateString()}
          </span>
        </div>
      </footer>
    </div>
  );
}