## What this PR does

Adds a "Re-audit on Pricing Change" system to StackAudit. Every completed audit now persists the user's email and a snapshot of the pricing data used. A `/api/detect-changes` endpoint compares stored snapshots against current pricing, marks stale audits, sends one consolidated email per affected user with a one-click re-run link, and renders a side-by-side diff of old vs new recommendations when the user clicks through.

## Why

A one-time audit becomes misleading the moment pricing changes — and AI tool pricing changes often (Cursor, Claude, Copilot all repriced in the last 18 months). Users who acted on a stale audit could make worse decisions than if they'd never audited. This feature makes audits a living record, not a snapshot.

## How it works

**Storage layer (`audits` table — new columns):**
- `user_email` — captured at audit time (optional) or backfilled when the user submits the lead form
- `pricing_snapshot` — JSON map of `{ toolId: { planName: price } }` built from `PRICING_DATA` at audit time
- `stale`, `notified_at`, `unsubscribed` — tracking fields

**Detection (`POST /api/detect-changes`):**
Fetches all audits with email + snapshot, compares each snapshot against the current `PRICING_DATA`, and collects `PriceChange` objects (`price_changed | plan_added | plan_removed`). Audits with changes are marked `stale: true`. Changes are logged to a `pricing_changes` table. The endpoint accepts an optional body `{ toolId, plan, newPrice }` to simulate a price change for testing — this is how the reviewer can trigger the full flow without waiting for a real price change.

**Email (`lib/reaudit-email.ts`):**
One email per user, consolidated across all their stale audits (no spam if multiple audits are affected). Email lists exactly what changed (tool, plan, old price → new price) with a re-run link per audit and a one-click unsubscribe link.

**Diff view (`/result/[id]?reaudit=true`):**
The re-run link opens the original audit in re-audit mode. The page loads the original result, then fires a fresh `/api/audit` call with the same input. A `DiffView` component renders both side-by-side: changed recommendations are highlighted at the top, unchanged ones collapsed. The headline shows the savings delta (new - old).

**Data flow:**
```
User submits audit
  → /api/audit: runAudit() + store with pricing_snapshot
  → user submits email via lead form
  → /api/lead: backfills user_email on audit row

POST /api/detect-changes (manual trigger or cron)
  → compare snapshots → mark stale → log changes
  → send consolidated email per affected user

User clicks re-run link
  → /result/[id]?reaudit=true
  → load original → fire fresh audit → render DiffView
```

## What I cut

- **Scheduled cron via GitHub Actions**: I went with a manual trigger endpoint instead. GitHub Actions cron needs the CRON_SECRET passed as a secret and a workflow file, which works but adds repo config complexity for a feature the reviewer can test manually. Doc'd the approach in this PR; easy to add in 30 minutes.
- **Admin dashboard (bonus)**: The `pricing_changes` and `email_log` tables are there — the Supabase dashboard covers this adequately. Building a custom UI felt lower-value than polishing the diff view.
- **"What changed this week" public page (bonus)**: Skipped — the `pricing_changes` table makes it trivial to add later, but the 4 required features took priority.
- **Click tracking on re-run emails**: `email_log` table has a `clicked_at` column wired for this. The tracking endpoint would be `/api/track-click?emailId=xxx` — straightforward but not required.

## How to test it manually

1. Run an audit at the live URL (add any tool + plan)
2. Submit your email in the lead capture form on the result page
3. Fire a pricing change simulation:
   ```bash
   curl -X POST https://[your-vercel-url]/api/detect-changes \
     -H "Content-Type: application/json" \
     -d '{"toolId": "cursor", "plan": "Pro", "newPrice": 25}'
   ```
4. Check your inbox — you should receive a re-audit email listing the Cursor Pro price change ($20 → $25)
5. Click the "Re-run audit with new pricing →" link in the email
6. You should land on `/result/[id]?reaudit=true` — the diff view shows the original vs updated recommendations with the savings delta as the headline

To test unsubscribe: click the unsubscribe link at the bottom of the re-audit email. Running detect-changes again for the same audit should not send another email.

## What's tested

- `__tests__/audit-engine.test.ts` (Round 1 tests) — all passing, no regression
- Manual end-to-end flow: audit → lead → detect-changes → email → diff view
- Edge cases tested manually: audit with no email (gracefully skipped), user with multiple stale audits (one consolidated email), unsubscribed user (skipped in detect-changes query)
- No automated tests added for Round 2 routes — would add `/api/detect-changes` unit tests next (mock Supabase client, assert stale marking and email grouping logic)

## Open questions / risks

- **Email deliverability**: `audit@credex.rocks` domain needs SPF/DKIM configured in Resend for inbox delivery. Without it, re-audit emails may hit spam — especially for Gmail.
- **Snapshot drift**: If a tool's plan names change (e.g. "Pro" → "Pro Monthly"), the comparison misses it. A fuzzy match or normalized plan ID would make this more robust.
- **Re-audit creates a new audit ID**: The fresh audit from the diff view gets a new ID and is stored as a new row. This means the user's new audit URL changes. A better model would be versioning audits under the same ID — didn't implement to avoid schema changes beyond what was needed.
