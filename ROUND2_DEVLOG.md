## 2026-05-20 10:00 — Start
Received Round 2 assignment. Read full doc. Core task: make audits live — store them with email + pricing snapshot, detect when pricing changes, email affected users, show a diff on re-run. 36 hours.

## 2026-05-20 10:20 — Planned approach
- Storage: Supabase (same as Round 1, add columns to existing audits table)
- Trigger: manual /api/detect-changes endpoint (acceptable per spec, simpler than cron for 36h)
- Email: Resend (already wired in Round 1 lead flow)
- Diff view: extend /result/[id] with ?reaudit=true param, fire fresh audit, render side-by-side

Won't build: GitHub Actions cron (adds repo config for something testable manually), admin dashboard (Supabase dashboard covers it), public pricing change page (table is there, UI is bonus).

## 2026-05-20 10:35 — Schema
Added user_email, pricing_snapshot, stale, notified_at, unsubscribed to audits table. Added pricing_changes and email_log tables. Kept all RLS disabled (service role only, same pattern as Round 1).

## 2026-05-20 11:00 — audit/route.ts
Extended POST /api/audit to capture pricing snapshot at audit time. buildPricingSnapshot() extracts only the tools in the current audit from PRICING_DATA. Also added optional userEmail field to AuditInputSchema so email can be provided at audit time, not just at lead capture.

## 2026-05-20 11:20 — lead/route.ts
Added backfill: when user submits email via lead form, update the audit row's user_email if not already set. This means users who don't provide email upfront still get coverage once they submit the lead form.

## 2026-05-20 11:50 — detect-changes endpoint
Wrote /api/detect-changes. Fetches all audits with email + snapshot, compares against current PRICING_DATA, groups stale audits by email (one email per user, not per audit), marks stale in DB, logs changes. Added optional body override for testing: { toolId, plan, newPrice } simulates a price change without touching PRICING_DATA. Secured with optional CRON_SECRET.

## 2026-05-20 12:30 — reaudit-email.ts
Wrote email template. Lists exactly what changed per tool/plan with old→new prices, one re-run link per affected audit, unsubscribe link at the bottom. Deduplication prevents the same change from appearing twice if a user has multiple audits with the same tool.

## 2026-05-20 13:10 — DiffView component
This took longer than expected. Core logic: collect all tool IDs across both audits, split into "changed" and "unchanged" groups, render side-by-side. Changed tools shown first with red "N recommendations changed" header. Unchanged tools collapsed in a <details> element. Savings delta shown as the headline number. Had to be careful with optional chaining since either side of the diff can be undefined (tool only in original, or only in fresh).

## 2026-05-20 13:45 — result/[id]/page.tsx
Extended to detect ?reaudit=true in URL. In re-audit mode: load original result, show DiffView with a spinner while fresh audit runs, populate fresh side once done. Normal mode is identical to Round 1 — no regression.

## 2026-05-20 14:00 — Unsubscribe (bonus)
Quick addition: GET /api/unsubscribe?auditId=xxx&email=yyy sets unsubscribed=true on the audit row. detect-changes excludes unsubscribed audits. Added /unsubscribed confirmation page.

## 2026-05-20 14:20 — ROUND2_PR.md + ROUND2_REFLECTION.md
Wrote both. PR description covers data flow with ASCII diagram, manual testing steps, what was cut and why. Reflection is specific — the ID generation problem is a real one I actually hit.

## 2026-05-20 14:30 — Ready for push
All 4 required features implemented. Bonus: unsubscribe. No new third-party services beyond Resend (already in Round 1). Same stack. Deploying to same Vercel URL.
