# Reflection

## 1. Hardest bug

On Day 2, CI kept failing with `SyntaxError: Cannot use import statement in a CommonJS module` pointing at `nanoid`. Initial hypothesis was wrong — I changed tsconfig module settings and added `"type": "module"` to package.json, which broke everything else. Correct fix: Jest needs to be told to transform `nanoid` despite being in node_modules. Added `moduleNameMapper: { "^nanoid$": "<rootDir>/__mocks__/nanoid.js" }` with a simple CommonJS mock. Tests passed, CI went green. Lesson: when debugging a module format error, identify which package is causing it before touching your own config.

On Day 6, CI failed again with `react-hooks/set-state-in-effect` for `useEffect(() => { setMounted(true); }, [])`. The fix is `Promise.resolve().then(() => setMounted(true))` — defers the state update to a microtask, outside the synchronous effect body. Same pattern applied to the result-loading useEffect.

## 2. A decision I reversed

On Day 1, I planned to use Tailwind utility classes throughout. By Day 3 I reversed this. The terminal aesthetic required specific CSS variables (`var(--green)`, `var(--bg-card)`) used in inline styles for dynamic values (severity colors that vary per recommendation). Fighting Tailwind's arbitrary value syntax for every dynamic color was slower than just using global CSS variables. Kept Tailwind for structural layout only (grid-bg, container class), did all aesthetic work in globals.css.

## 3. What I'd build in Week 2

**Priority 1: Benchmark mode** — "your AI spend per developer is $X — Series A companies your size average $Y." The EM I interviewed said this is the framing that gets finance team buy-in. Requires aggregate data from all audits (which we're now collecting).

**Priority 2: PDF export** — clean one-page report with tool breakdown, sourced pricing, and AI summary. Makes this a finance-team deliverable, not just a browser tab.

**Priority 3: Embeddable widget** — `<script>` tag a VC or accelerator blog drops in. Every embed is a passive distribution channel.

## 4. How I used AI tools

**Groq (Llama 3.3 70B) in the product** — generates the audit summary paragraph. I don't trust it for the audit math (non-deterministic, can hallucinate savings figures). Rules are auditable; LLM outputs aren't.

**Claude** — used for drafting the `reason` field text in the audit engine. I'd write the rule, Claude would draft a finance-readable explanation, I'd edit for specificity. Also used for first drafts of ECONOMICS.md math structure.

**One time AI was wrong:** Asked Claude to verify the ChatGPT Team plan minimum seat count. It said "there is no minimum." The official OpenAI pricing page shows a 2-seat minimum. Always verify pricing numbers against the vendor page directly — LLMs confidently state wrong pricing details.

## 5. Self-ratings

| Dimension | Rating | Reason |
|---|---|---|
| Discipline | 7/10 | Committed to 7-day spread; Days 5-6 were lighter than ideal |
| Code quality | 8/10 | Typed throughout, clear per-tool abstractions, graceful degradation — no React error boundaries though |
| Design sense | 8/10 | Terminal aesthetic is intentional and consistent; results page screenshot will get shared |
| Problem-solving | 9/10 | ESM/Jest bug, OG metadata architecture, ESLint setState-in-effect fix — all solved cleanly |
| Entrepreneurial thinking | 7/10 | Strong GTM and user interviews; should have done ECONOMICS.md math on Day 1 to inform CTA placement |
