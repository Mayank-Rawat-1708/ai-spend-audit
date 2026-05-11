export type ToolId =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface ToolEntry {
  toolId: ToolId;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

export interface ToolRecommendation {
  toolId: ToolId;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  seats: number;
  recommendedAction: "downgrade" | "switch" | "cancel" | "keep" | "optimize";
  recommendedPlan?: string;
  recommendedTool?: string;
  projectedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  severity: "high" | "medium" | "low" | "optimal";
  credexApplicable: boolean;
}

export interface AuditResult {
  id: string;
  createdAt: string;
  input: AuditInput;
  recommendations: ToolRecommendation[];
  totalCurrentSpend: number;
  totalProjectedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  aiSummary?: string;
  isOptimal: boolean;
}

export const TOOL_NAMES: Record<ToolId, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude (Anthropic)",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API",
  openai_api: "OpenAI API",
  gemini: "Google Gemini",
  windsurf: "Windsurf",
};

export const TOOL_PLANS: Record<ToolId, string[]> = {
  cursor: ["Hobby", "Pro", "Business", "Enterprise"],
  github_copilot: ["Individual", "Business", "Enterprise"],
  claude: ["Free", "Pro", "Max", "Team", "Enterprise", "API Direct"],
  chatgpt: ["Plus", "Team", "Enterprise", "API Direct"],
  anthropic_api: ["Pay-as-you-go"],
  openai_api: ["Pay-as-you-go"],
  gemini: ["Free", "Advanced", "API"],
  windsurf: ["Free", "Pro", "Teams", "Enterprise"],
};
