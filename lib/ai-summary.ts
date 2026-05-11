import type { AuditResult } from "@/types";

export async function generateSummary(result: AuditResult): Promise<string> {
  if (!process.env.GROQ_API_KEY) throw new Error("No GROQ_API_KEY configured");

  const Groq = (await import("groq-sdk")).default;
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const toolList = result.recommendations
    .map(r => `- ${r.toolName} (${r.currentPlan}): $${r.currentSpend}/mo → ${r.recommendedAction} → saves $${r.monthlySavings}/mo`)
    .join("\n");

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 200,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: "You are a direct, numbers-focused financial advisor. Write concise plain-English paragraphs only. No bullet points, no headers, no markdown formatting whatsoever.",
      },
      {
        role: "user",
        content: `Write an 80-100 word personalized audit summary for a team of ${result.input.teamSize} people whose primary use case is ${result.input.useCase}.

Current AI tool stack:
${toolList}

Total current spend: $${result.totalCurrentSpend}/month
Total potential savings: $${result.totalMonthlySavings}/month ($${result.totalAnnualSavings}/year)

Rules:
- Reference actual tool names and dollar figures
- No filler phrases like "great news", "looking at your stack", "I can see"
- If already optimal, say so honestly and directly
- End with exactly one concrete next action
- Plain paragraph only — no lists, no headers`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response from Groq");
  return text;
}
