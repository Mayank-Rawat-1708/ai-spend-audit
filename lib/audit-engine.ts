import { nanoid } from "nanoid";
import type { AuditInput, AuditResult, ToolRecommendation, ToolEntry } from "@/types";
import { TOOL_NAMES } from "@/types";

function auditCursor(entry: ToolEntry, _teamSize: number): ToolRecommendation {
  const base = {
    toolId: entry.toolId,
    toolName: TOOL_NAMES.cursor,
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    seats: entry.seats,
    credexApplicable: true,
  };

  const costPerSeat = entry.monthlySpend / Math.max(entry.seats, 1);

  if (entry.plan === "Business" && entry.seats <= 3) {
    const projectedSpend = entry.seats * 20;
    const savings = entry.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "downgrade",
      recommendedPlan: "Pro",
      projectedSpend,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `Business plan ($40/seat) provides centralized admin, SSO, and enforced privacy mode — meaningful for 10+ person teams. With ${entry.seats} seat(s), you gain none of these benefits. Pro ($20/seat) delivers identical AI capabilities.`,
      severity: savings > 100 ? "high" : "medium",
    } as ToolRecommendation;
  }

  if (entry.plan === "Enterprise" && entry.seats < 10) {
    const projectedSpend = entry.seats * 40;
    const savings = entry.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "downgrade",
      recommendedPlan: "Business",
      projectedSpend: Math.max(projectedSpend, 0),
      monthlySavings: Math.max(savings, 0),
      annualSavings: Math.max(savings, 0) * 12,
      reason: `Enterprise contracts carry a significant premium for SLA guarantees and dedicated support that sub-10 person teams rarely utilize. Business plan provides SSO and admin controls at $40/seat.`,
      severity: "high",
    } as ToolRecommendation;
  }

  if (costPerSeat > 45 && entry.plan !== "Enterprise") {
    const projectedSpend = entry.seats * 40;
    const savings = entry.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "optimize",
      recommendedPlan: "Business",
      projectedSpend,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `Your effective cost per seat ($${costPerSeat.toFixed(0)}) exceeds the Business plan rate ($40/seat). You may be on an old contract or reseller markup. Verify direct billing with Cursor.`,
      severity: "high",
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: "keep",
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `${entry.plan} plan is appropriate for your team size (${entry.seats} seat${entry.seats !== 1 ? "s" : ""}). Pricing aligns with official rates.`,
    severity: "optimal",
    credexApplicable: false,
  } as ToolRecommendation;
}

function auditGithubCopilot(entry: ToolEntry, _teamSize: number, useCase: string): ToolRecommendation {
  const base = {
    toolId: entry.toolId,
    toolName: TOOL_NAMES.github_copilot,
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    seats: entry.seats,
    credexApplicable: true,
  };

  if (entry.plan === "Enterprise" && entry.seats < 20) {
    const projectedSpend = entry.seats * 19;
    const savings = entry.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "downgrade",
      recommendedPlan: "Business",
      projectedSpend,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `Copilot Enterprise ($39/seat) adds fine-tuned org models and PR summaries — features valuable for 20+ person eng teams with established codebases. Business ($19/seat) covers policy management, audit logs, and IP indemnity.`,
      severity: savings > 100 ? "high" : "medium",
    } as ToolRecommendation;
  }

  if (useCase !== "coding" && useCase !== "mixed") {
    const projectedSpend = entry.seats * 20;
    const savings = entry.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "switch",
      recommendedTool: "Claude Pro",
      projectedSpend: entry.seats * 20,
      monthlySavings: Math.max(savings, 0),
      annualSavings: Math.max(savings, 0) * 12,
      reason: `GitHub Copilot is purpose-built for code completion in IDEs. For ${useCase} workflows, Claude Pro or ChatGPT Plus deliver significantly more value — better long-form writing, research synthesis, and data reasoning.`,
      severity: "medium",
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: "keep",
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `${entry.plan} plan is appropriate. GitHub Copilot is well-suited for your ${useCase} use case.`,
    severity: "optimal",
    credexApplicable: false,
  } as ToolRecommendation;
}

function auditClaude(entry: ToolEntry, _teamSize: number): ToolRecommendation {
  const base = {
    toolId: entry.toolId,
    toolName: TOOL_NAMES.claude,
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    seats: entry.seats,
    credexApplicable: false,
  };

  if (entry.plan === "Team" && entry.seats < 5) {
    const projectedSpend = entry.seats * 20;
    const savings = entry.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "downgrade",
      recommendedPlan: "Pro (per seat)",
      projectedSpend,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `Claude Team requires a minimum of 5 seats at $30/seat. With ${entry.seats} user(s), Pro at $20/seat provides identical model access without the team overhead.`,
      severity: savings > 0 ? "high" : "medium",
    } as ToolRecommendation;
  }

  if (entry.plan === "Enterprise" && entry.seats < 10) {
    const projectedSpend = entry.seats * 30;
    const savings = entry.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "downgrade",
      recommendedPlan: "Team",
      projectedSpend,
      monthlySavings: Math.max(savings, 0),
      annualSavings: Math.max(savings, 0) * 12,
      reason: `Claude Enterprise targets 25+ person organizations needing custom usage policies and SAML SSO. Team plan at $30/seat covers collaboration needs for sub-10 teams.`,
      severity: "medium",
      credexApplicable: true,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: "keep",
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `${entry.plan} plan is well-matched to your usage. No immediate optimization found.`,
    severity: "optimal",
  } as ToolRecommendation;
}

function auditChatGPT(entry: ToolEntry, _teamSize: number): ToolRecommendation {
  const base = {
    toolId: entry.toolId,
    toolName: TOOL_NAMES.chatgpt,
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    seats: entry.seats,
    credexApplicable: false,
  };

  if (entry.plan === "Team" && entry.seats <= 2) {
    const projectedSpend = entry.seats * 20;
    const savings = entry.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "downgrade",
      recommendedPlan: "Plus (individual)",
      projectedSpend,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `ChatGPT Team ($30/seat) adds workspace management and data privacy for companies — but solo operators and 2-person teams rarely need the admin layer. Two individual Plus plans at $20/seat saves $20/mo with identical AI access.`,
      severity: "medium",
    } as ToolRecommendation;
  }

  if (entry.plan === "Enterprise" && entry.seats < 15) {
    const projectedSpend = entry.seats * 30;
    const savings = entry.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "downgrade",
      recommendedPlan: "Team",
      projectedSpend,
      monthlySavings: Math.max(savings, 0),
      annualSavings: Math.max(savings, 0) * 12,
      reason: `ChatGPT Enterprise is designed for 150+ person orgs per OpenAI's own targeting. Team plan provides data privacy and admin controls for smaller teams at $30/seat.`,
      severity: "high",
      credexApplicable: true,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: "keep",
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `${entry.plan} plan is appropriate for your team. No savings identified at this tier.`,
    severity: "optimal",
  } as ToolRecommendation;
}

function auditAPISpend(entry: ToolEntry, _useCase: string): ToolRecommendation {
  const base = {
    toolId: entry.toolId,
    toolName: TOOL_NAMES[entry.toolId],
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    seats: entry.seats,
    credexApplicable: true,
  };

  if (entry.toolId === "openai_api" && entry.monthlySpend > 200) {
    const projectedSpend = entry.monthlySpend * 0.55;
    const savings = entry.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "optimize",
      recommendedTool: "Anthropic API (Claude 3.5 Haiku)",
      projectedSpend,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `At $${entry.monthlySpend}/mo on OpenAI API, model selection is your biggest lever. Claude 3.5 Haiku ($0.80/$4 per M tokens) is ~68% cheaper than GPT-4o for comparable quality on most tasks. Mixing cheaper models for classification and routing can cut spend 40-60%.`,
      severity: "high",
    } as ToolRecommendation;
  }

  if (entry.toolId === "anthropic_api" && entry.monthlySpend > 500) {
    const projectedSpend = entry.monthlySpend * 0.7;
    const savings = entry.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "optimize",
      projectedSpend,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `At $${entry.monthlySpend}/mo on Anthropic API, routing simpler tasks to Claude 3.5 Haiku instead of Sonnet can reduce costs 30-40% with minimal quality degradation for classification, summarization, and extraction tasks.`,
      severity: "medium",
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: "keep",
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `API spend is within reasonable range. As volume grows, model routing optimization becomes the primary savings lever.`,
    severity: "optimal",
    credexApplicable: false,
  } as ToolRecommendation;
}

function auditGemini(entry: ToolEntry): ToolRecommendation {
  const base = {
    toolId: entry.toolId,
    toolName: TOOL_NAMES.gemini,
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    seats: entry.seats,
    credexApplicable: false,
  };

  if (entry.plan === "Advanced" && entry.seats > 1) {
    const projectedSpend = entry.seats * 20;
    const savings = entry.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "switch",
      recommendedTool: "Claude Pro",
      projectedSpend,
      monthlySavings: Math.max(savings, 0),
      annualSavings: Math.max(savings, 0) * 12,
      reason: `Gemini Advanced ($19.99/user) bundles Google One storage as its primary value prop — not AI capability. For AI reasoning, Claude Pro ($20/seat) delivers superior performance on writing, analysis, and coding benchmarks.`,
      severity: savings > 0 ? "medium" : "low",
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: "keep",
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `Gemini ${entry.plan} plan is appropriately sized. No immediate optimization identified.`,
    severity: "optimal",
  } as ToolRecommendation;
}

function auditWindsurf(entry: ToolEntry, _teamSize: number): ToolRecommendation {
  const base = {
    toolId: entry.toolId,
    toolName: TOOL_NAMES.windsurf,
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    seats: entry.seats,
    credexApplicable: false,
  };

  if (entry.plan === "Teams" && entry.seats <= 2) {
    const projectedSpend = entry.seats * 15;
    const savings = entry.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "downgrade",
      recommendedPlan: "Pro (individual)",
      projectedSpend,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `Windsurf Teams ($35/seat) adds admin controls and billing consolidation — overhead that doesn't add productivity for 2-person teams. Individual Pro plans at $15/seat saves $${savings}/mo.`,
      severity: savings > 50 ? "medium" : "low",
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: "keep",
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: `${entry.plan} plan is appropriate for your team size.`,
    severity: "optimal",
  } as ToolRecommendation;
}

function checkOverlaps(entries: ToolEntry[], recommendations: ToolRecommendation[]): ToolRecommendation[] {
  const hasCodeCopilot = entries.some(e => e.toolId === "github_copilot");
  const hasCursor = entries.some(e => e.toolId === "cursor");
  const hasWindsurf = entries.some(e => e.toolId === "windsurf");
  const codeAssistants = [hasCodeCopilot, hasCursor, hasWindsurf].filter(Boolean).length;

  if (codeAssistants >= 2) {
    const codeTools = entries
      .filter(e => ["github_copilot", "cursor", "windsurf"].includes(e.toolId))
      .sort((a, b) => b.monthlySpend - a.monthlySpend);

    if (codeTools.length >= 2 && codeTools[0] && codeTools[1]) {
      const expensive = codeTools[0];
      const cheaper = codeTools[1];
      const idx = recommendations.findIndex(r => r.toolId === expensive.toolId);
      if (idx !== -1 && recommendations[idx]) {
        recommendations[idx] = {
          ...recommendations[idx]!,
          recommendedAction: "cancel",
          projectedSpend: 0,
          monthlySavings: expensive.monthlySpend,
          annualSavings: expensive.monthlySpend * 12,
          reason: `Overlap detected: you are paying for ${codeAssistants} AI coding assistants simultaneously. Engineers using multiple overlapping tools gain marginal productivity benefit but pay full price for each. ${TOOL_NAMES[expensive.toolId]} ($${expensive.monthlySpend}/mo) overlaps almost entirely with ${TOOL_NAMES[cheaper.toolId as keyof typeof TOOL_NAMES]}. Cancel the higher-cost subscription.`,
          severity: "high",
          credexApplicable: true,
        };
      }
    }
  }

  return recommendations;
}

export function runAudit(input: AuditInput): AuditResult {
  const recommendations: ToolRecommendation[] = [];

  for (const entry of input.tools) {
    let rec: ToolRecommendation;
    switch (entry.toolId) {
      case "cursor":        rec = auditCursor(entry, input.teamSize); break;
      case "github_copilot": rec = auditGithubCopilot(entry, input.teamSize, input.useCase); break;
      case "claude":        rec = auditClaude(entry, input.teamSize); break;
      case "chatgpt":       rec = auditChatGPT(entry, input.teamSize); break;
      case "anthropic_api":
      case "openai_api":    rec = auditAPISpend(entry, input.useCase); break;
      case "gemini":        rec = auditGemini(entry); break;
      case "windsurf":      rec = auditWindsurf(entry, input.teamSize); break;
      default:
        rec = {
          toolId: entry.toolId,
          toolName: TOOL_NAMES[entry.toolId] ?? entry.toolId,
          currentPlan: entry.plan,
          currentSpend: entry.monthlySpend,
          seats: entry.seats,
          recommendedAction: "keep",
          projectedSpend: entry.monthlySpend,
          monthlySavings: 0,
          annualSavings: 0,
          reason: "No optimization data available for this tool.",
          severity: "optimal",
          credexApplicable: false,
        };
    }
    recommendations.push(rec);
  }

  const finalRecs = checkOverlaps(input.tools, recommendations);
  const totalCurrentSpend = input.tools.reduce((s, t) => s + t.monthlySpend, 0);
  const totalMonthlySavings = finalRecs.reduce((s, r) => s + r.monthlySavings, 0);
  const totalProjectedSpend = totalCurrentSpend - totalMonthlySavings;

  return {
    id: nanoid(10),
    createdAt: new Date().toISOString(),
    input,
    recommendations: finalRecs,
    totalCurrentSpend,
    totalProjectedSpend,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    isOptimal: totalMonthlySavings === 0,
  };
}
