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
import DiffView from "@/components/DiffView";

function LoadingScreen({ message = "Loading audit..." }: { message?: string }) {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, borderColor: "var(--border)", borderTopColor: "var(--green)" }} />
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {message}
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
  const [originalResult, setOriginalResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [reauditLoading, setReauditLoading] = useState(false);
  const [isReaudit, setIsReaudit] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const urlParams = new URLSearchParams(window.location.search);
    const reauditMode = urlParams.get("reaudit") === "true";

    const loadResult = async () => {
      let original: AuditResult | null = null;

      // 1. Try localStorage
      try {
        const cached = localStorage.getItem(`audit_${id}`);
        if (cached) {
          original = JSON.parse(cached) as AuditResult;
        }
      } catch { /* fall through */ }

      // 2. Try URL-encoded fallback
      if (!original) {
        const encoded = urlParams.get("d");
        if (encoded) {
          try { original = JSON.parse(atob(encoded)) as AuditResult; } catch { /* fall through */ }
        }
      }

      // 3. Fetch from API
      if (!original) {
        try {
          const res = await fetch(`/api/result/${id}`);
          if (!res.ok) throw new Error("not found");
          original = await res.json() as AuditResult;
        } catch {
          if (!cancelled) { setResult(null); setLoading(false); }
          return;
        }
      }

      if (cancelled) return;

      if (reauditMode && original) {
        // Show original first, then run fresh audit with same input
        setOriginalResult(original);
        setIsReaudit(true);
        setLoading(false);
        setReauditLoading(true);

        try {
          const res = await fetch("/api/audit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(original.input),
          });
          if (!res.ok) throw new Error("reaudit failed");
          const fresh = await res.json() as AuditResult;
          if (!cancelled) setResult(fresh);
        } catch (e) {
          console.error("Re-audit failed:", e);
          if (!cancelled) setResult(original); // fallback to original
        } finally {
          if (!cancelled) setReauditLoading(false);
        }
      } else {
        setResult(original);
        setLoading(false);
      }
    };

    loadResult();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!result && !originalResult) return <NotFound />;

  // ── Diff / Re-audit mode ──────────────────────────────────────────────────
  if (isReaudit) {
    return (
      <div className="grid-bg" style={{ minHeight: "100dvh" }}>
        <Header />
        <main className="container" style={{ paddingBottom: 80 }}>
          <div style={{ padding: "32px 0 20px" }}>
            <div className="label" style={{ marginBottom: 8 }}>◈ Re-audit — Pricing Change Detected</div>
            <h1 style={{ fontSize: 22, color: "var(--text)", margin: "0 0 8px", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
              What changed since your last audit
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              Pricing in your stack has been updated. Below is a side-by-side comparison of your original recommendations vs. current pricing.
            </p>
          </div>

          {reauditLoading ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2, borderColor: "var(--border)", borderTopColor: "var(--green)", margin: "0 auto 12px" }} />
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em" }}>
                RUNNING FRESH AUDIT WITH CURRENT PRICING...
              </div>
            </div>
          ) : (
            <DiffView original={originalResult} fresh={result} />
          )}

          {!reauditLoading && result && (
            <>
              <hr className="divider" />
              <LeadCaptureForm auditId={result.id} monthlySavings={result.totalMonthlySavings} isOptimal={result.isOptimal} />
              <div style={{ height: 24 }} />
              <ShareBar auditId={result.id} monthlySavings={result.totalMonthlySavings} />
            </>
          )}
        </main>
      </div>
    );
  }

  // ── Normal result view (unchanged from Round 1) ───────────────────────────
  const current = result!;
  const isHighSavings = current.totalMonthlySavings > 500;
  const highRecs = current.recommendations.filter(r => r.severity === "high");
  const otherRecs = current.recommendations.filter(r => r.severity !== "high");

  return (
    <div className="grid-bg" style={{ minHeight: "100dvh" }}>
      <Header />
      <main className="container" style={{ paddingBottom: 80 }}>
        <SavingsHero result={current} />

        {current.aiSummary && (
          <section className="anim-fade-up-1" style={{ padding: "28px 0", borderBottom: "1px solid var(--border)" }}>
            <div className="label" style={{ marginBottom: 12 }}>◈ AI Analysis</div>
            <blockquote style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75, maxWidth: 680, fontStyle: "italic", borderLeft: "2px solid var(--green-mid)", paddingLeft: 18, margin: 0 }}>
              {current.aiSummary}
            </blockquote>
          </section>
        )}

        {isHighSavings && (
          <div className="anim-fade-up-2" style={{ paddingTop: 24 }}>
            <CredexCTA monthlySavings={current.totalMonthlySavings} />
          </div>
        )}

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

        <div className="anim-fade-up-3">
          <BenchmarkBar
            totalCurrentSpend={current.totalCurrentSpend}
            totalProjectedSpend={current.totalProjectedSpend}
            teamSize={current.input.teamSize}
            useCase={current.input.useCase}
            hasSavings={!current.isOptimal}
          />
        </div>

        <hr className="divider" />

        <div className="anim-fade-up-3">
          <LeadCaptureForm auditId={current.id} monthlySavings={current.totalMonthlySavings} isOptimal={current.isOptimal} />
        </div>

        <div style={{ height: 24 }} />

        <div className="anim-fade-up-4">
          <ShareBar auditId={current.id} monthlySavings={current.totalMonthlySavings} />
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 0", marginTop: 24 }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>STACKAUDIT by Credex · credex.rocks</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)" }}>
            Pricing data verified {new Date(current.createdAt).toLocaleDateString()}
          </span>
        </div>
      </footer>
    </div>
  );
}
