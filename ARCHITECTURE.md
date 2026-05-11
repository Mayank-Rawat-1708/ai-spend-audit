# Architecture

## System Diagram

```mermaid
graph TD
    A[Landing Page] --> B[Spend Input Form]
    B --> C[Zustand + localStorage]
    C --> D[POST /api/audit]
    D --> E[Zod Validation + Rate Limit]
    E --> F[Audit Engine — Rule-based TS]
    F --> G[Groq API — Llama 3.3 70B Summary]
    G --> H[(Supabase — optional)]
    F --> I[AuditResult JSON]
    I --> J[localStorage cache]
    J --> K[/result/:id Page]
    K --> L[Lead Capture Form]
    L --> M[POST /api/lead]
    M --> N[(Supabase leads)]
    M --> O[Resend Email]
    K --> P[Share URL with OG tags]
    P --> Q[GET /api/result/:id — PII stripped]
```

## Data Flow

1. User fills form → Zustand persists to localStorage on every change
2. Submit → `POST /api/audit` with `{ tools[], teamSize, useCase }`
3. Zod validation + IP rate limit (15 req/min)
4. Audit engine runs: one function per tool → overlap detection post-pass
5. Groq generates 80-100 word summary (8s timeout, templated fallback)
6. Result stored in Supabase if configured; always returned to client
7. Client caches in localStorage, navigates to `/result/:id`
8. Result page loads from localStorage first, then API

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 App Router | Per-audit OG metadata, API routes, SSR |
| Language | TypeScript | Type-safe audit engine |
| State | Zustand + persist | Form survives page reloads |
| AI | Groq (Llama 3.3 70B) | ~200ms, free tier, excellent instruction-following |
| Validation | Zod | Schema matches TypeScript types |
| DB | Supabase | Free tier, RLS, instant API |
| Email | Resend | Simple API, free tier |
| Deploy | Vercel | Zero-config Next.js |

## Scaling to 10k Audits/Day

- Rate limiting → Redis (Upstash) on the edge instead of in-memory
- AI summary → async job queue (Inngest) so audit returns immediately
- Supabase → enable PgBouncer connection pooling
- OG images → per-audit dynamic images with `@vercel/og`
