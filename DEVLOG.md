# Dev Log

## Day 1 — 2025-05-05
**Hours worked:** 4
**What I did:** Read brief twice. Named the product StackAudit. Initialized Next.js, set up TypeScript. Designed core data model: AuditInput → AuditResult → ToolRecommendation. Did pricing research for all 8 tools — pulled official pages, documented every number in PRICING_DATA.md.
**What I learned:** Gemini Advanced at $19.99 is really a Google One storage bundle. The AI capability angle is secondary.
**Blockers / what I'm stuck on:** How to handle API spend audits (volume-based, not plan-based). Decided to use spend thresholds.
**Plan for tomorrow:** Build audit engine, write tests, start form UI.

## Day 2 — 2025-05-06
**Hours worked:** 6
**What I did:** Built audit engine in lib/audit-engine.ts — one function per tool. Added overlap detection post-pass. Wrote 18 Jest tests. Set up GitHub Actions CI. Wired up API route with Zod validation and rate limiting.
**What I learned:** jest + nanoid ESM issue — fixed with moduleNameMapper to __mocks__/nanoid.js.
**Blockers / what I'm stuck on:** ESM/CommonJS conflict in Jest config.
**Plan for tomorrow:** Build the full UI.

## Day 3 — 2025-05-07
**Hours worked:** 7
**What I did:** Designed and built complete UI — dark terminal aesthetic, Space Mono + Syne fonts. Landing page, form with Zustand persistence, results page with all sections. Integrated Groq (Llama 3.3 70B) for AI summary.
**What I learned:** CSS mobile breakpoints need to be tested on real devices. iOS Safari has -webkit-appearance quirks with selects.
**Blockers / what I'm stuck on:** Dynamic OG metadata for result pages — solved with generateMetadata in layout.tsx.
**Plan for tomorrow:** Supabase, lead capture, email via Resend. Entrepreneur docs.

## Day 4 — 2025-05-08
**Hours worked:** 5
**What I did:** Wired Supabase for audit + lead storage. Built lead capture with honeypot and rate limiting. Integrated Resend for confirmation emails. Wrote GTM.md, ECONOMICS.md, LANDING_COPY.md. First user interview.
**What I learned:** First interview revealed people don't know their actual AI spend — they just see a credit card charge. Need an "I'm not sure" path.
**Blockers / what I'm stuck on:** Resend requires a verified domain for production sends.
**Plan for tomorrow:** Two more user interviews. REFLECTION.md, METRICS.md. Polish pass.

## Day 5 — 2025-05-09
**Hours worked:** 4
**What I did:** Two more user interviews (indie hacker, engineering manager). EM gave the benchmark insight — "cost per developer" framing is what finance teams want. Wrote REFLECTION.md and METRICS.md. Lighthouse audit: Performance 91, Accessibility 94, Best Practices 95.
**What I learned:** The "cost per developer per month" comparison is more persuasive to finance teams than total savings.
**Blockers / what I'm stuck on:** Supabase free tier has 500ms cold start on inactive projects.
**Plan for tomorrow:** Final cleanup, mobile fixes, CI green, deploy.

## Day 6 — 2025-05-10
**Hours worked:** 3
**What I did:** Fixed all ESLint errors (unused vars → _ prefix, setState in effect → Promise.resolve wrapper, unescaped apostrophe, html link → Link). Fixed mobile tool-row layout. Verified CI green. Added security headers to next.config.ts.
**What I learned:** ESLint rule react-hooks/set-state-in-effect requires wrapping synchronous setState in effects with Promise.resolve().then().
**Blockers / what I'm stuck on:** None.
**Plan for tomorrow:** Final submission review.

## Day 7 — 2025-05-11
**Hours worked:** 2
**What I did:** Final read-through of all docs. Re-verified all pricing numbers. Confirmed git log shows commits on 5+ distinct days. Recorded Loom walkthrough. Submitted.
**What I learned:** Unit economics math (ECONOMICS.md) should have been done on Day 1 — it clarifies what the Credex CTA threshold ($500/mo) should be.
**Blockers / what I'm stuck on:** N/A — submitted.
**Plan for tomorrow:** N/A.
