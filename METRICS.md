# Metrics

## North Star Metric
**Credex consultations booked per week**

Why: maps directly to Credex revenue. DAU is wrong (people use this once a quarter). Total audits is vanity if none convert. Consultations = tool has done its job.

## 3 Input Metrics
1. **Audit completion rate** (visitors → audit submitted) — Is the form clear? Target: ≥40%
2. **Email capture rate** (audits → email submitted) — Is the value compelling enough? Target: ≥25%
3. **High-savings rate** (audits where savings >$500/mo) — Are we reaching the right users? Target: ≥15%

## What I'd instrument first
1. `audit_submitted` — with `{ toolCount, totalCurrentSpend, useCase, teamSize }`
2. `audit_result_viewed` — with `{ auditId, totalMonthlySavings, highSavings }`
3. `lead_form_submitted` — with `{ auditId, monthlySavings }`
4. `credex_cta_clicked` — only fires for >$500/mo cases
5. `share_url_copied` — measures viral coefficient

**Tool:** Plausible.io — privacy-friendly, no GDPR consent banner, custom events via API.

## Pivot trigger
After 200 audits, pivot if:
- Email capture rate < 10% → audit results not compelling enough
- High-savings rate < 5% → reaching wrong users (too many solo devs on free plans)
- Consultations/emails < 3% → Credex CTA not converting

**Specific number:** 0 consultations after 50 audits in week 4 → run 5-user session to find where they drop off.
