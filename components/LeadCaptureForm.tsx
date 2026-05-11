"use client";
import { useState } from "react";

interface Props { auditId: string; monthlySavings: number; isOptimal: boolean; }

export default function LeadCaptureForm({ auditId, monthlySavings, isOptimal }: Props) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, email: email.trim(), companyName: company.trim() || undefined, role: role.trim() || undefined, monthlySavings, honeypot }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Submission failed"); }
      setSubmitted(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="card" style={{ padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12, color: "var(--green)" }}>✓</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, marginBottom: 6 }}>Report sent to {email}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
          {monthlySavings > 500 ? "Our team will follow up within 1 business day." : "We'll notify you when new optimizations apply."}
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: "24px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
          {isOptimal ? "Stay Updated" : "Get the Full Report"}
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
          {isOptimal ? "AI pricing changes constantly. Get notified when new optimizations apply to your stack." : "Get the full breakdown with implementation steps emailed to you."}
        </p>
      </div>

      {/* Honeypot — hidden from users, catches bots */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }} aria-hidden="true">
        <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <label className="field-label">Email *</label>
          <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} autoComplete="email" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label className="field-label">Company</label>
            <input type="text" placeholder="Acme Inc. (optional)" value={company} onChange={e => setCompany(e.target.value)} autoComplete="organization" />
          </div>
          <div>
            <label className="field-label">Role</label>
            <input type="text" placeholder="CTO, EM... (optional)" value={role} onChange={e => setRole(e.target.value)} autoComplete="organization-title" />
          </div>
        </div>
        {error && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--red)", padding: "8px 12px", background: "var(--red-dim)", border: "1px solid var(--red-border)", borderRadius: 3 }}>{error}</div>}
        <button onClick={handleSubmit} disabled={!email.trim() || submitting} className="btn btn-primary btn-full" style={{ marginTop: 4 }}>
          {submitting ? <><span className="spinner" style={{ borderColor: "#000", borderTopColor: "transparent" }} />SENDING...</> : "SEND REPORT →"}
        </button>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", textAlign: "center", letterSpacing: "0.05em" }}>
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
