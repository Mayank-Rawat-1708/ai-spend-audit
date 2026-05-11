# StackAudit — AI Spend Audit for Startups

**StackAudit** is a free web app that audits your AI tool stack and tells you exactly where you're overspending. Built for startup founders and engineering managers. Lead-gen asset for Credex — users with >$500/mo savings get shown the Credex consultation CTA.

🔗 **Live URL**: [https://stackaudit.credex.rocks](https://stackaudit.credex.rocks)

## Quick Start

```bash
git clone https://github.com/YOUR_GITHUB/ai-spend-audit
cd ai-spend-audit
npm install
cp .env.example .env.local
# Add your GROQ_API_KEY
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | AI summary — free at console.groq.com |
| `SUPABASE_URL` | Optional | Audit + lead storage |
| `SUPABASE_SERVICE_KEY` | Optional | Supabase service role key |
| `RESEND_API_KEY` | Optional | Transactional emails |
| `NEXT_PUBLIC_BASE_URL` | Optional | Base URL for OG tags |

## Tests

```bash
npm test        # 18 tests, all passing
npm run build   # production build check
```

## Decisions

1. **Next.js App Router** — per-audit OG metadata, API routes, SSR for Lighthouse scores, Vercel zero-config deploy.
2. **Rule-based audit engine, not LLM** — finance-defensible, deterministic, testable. AI (Groq) used only for the summary paragraph.
3. **Zustand + localStorage persistence** — form survives page reloads; users check pricing in another tab.
4. **Graceful degradation everywhere** — Supabase down → localStorage fallback. Groq down → templated summary. Resend down → lead still captured.
5. **Honeypot + rate limiting over hCaptcha** — no user-facing friction; catches bots silently.
