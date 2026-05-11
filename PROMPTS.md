# Prompts

## AI Summary — `lib/ai-summary.ts`

**Model:** `llama-3.3-70b-versatile` via Groq API — fast (~200ms p50), generous free tier, excellent structured output.

**System prompt:**
```
You are a direct, numbers-focused financial advisor. Write concise plain-English paragraphs only. No bullet points, no headers, no markdown formatting whatsoever.
```

**User prompt:**
```
Write an 80-100 word personalized audit summary for a team of {teamSize} people whose primary use case is {useCase}.

Current AI tool stack:
{toolList}

Total current spend: ${totalCurrentSpend}/month
Total potential savings: ${totalMonthlySavings}/month (${totalAnnualSavings}/year)

Rules:
- Reference actual tool names and dollar figures
- No filler phrases like "great news", "looking at your stack", "I can see"
- If already optimal, say so honestly and directly
- End with exactly one concrete next action
- Plain paragraph only — no lists, no headers
```

**Why written this way:** Banning specific filler phrases and requiring tool-name references forces specificity. The "financial advisor" persona improves directness. Temperature 0.4 keeps output consistent without being robotic.

**What didn't work:** Simple "summarize this audit" prompts produced generic output ("you could save money by optimizing"). Explicit tool-name requirement and banned phrases were the key fixes.

**Fallback:** If Groq API fails or times out (8s limit), a templated summary is generated in `app/api/audit/route.ts` using actual tool names and figures from the audit result.
