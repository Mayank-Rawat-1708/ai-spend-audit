// Pricing data — all verified from official vendor pages May 2025
// Sources documented in PRICING_DATA.md

export interface PlanPrice {
  plan: string;
  pricePerSeatPerMonth: number;
  minSeats?: number;
  features: string[];
  officialUrl: string;
}

export const PRICING_DATA: Record<string, PlanPrice[]> = {
  cursor: [
    { plan: "Hobby",      pricePerSeatPerMonth: 0,  features: ["2000 completions/mo", "50 slow premium requests"],                              officialUrl: "https://cursor.sh/pricing" },
    { plan: "Pro",        pricePerSeatPerMonth: 20, features: ["Unlimited completions", "500 fast premium requests/mo"],                        officialUrl: "https://cursor.sh/pricing" },
    { plan: "Business",   pricePerSeatPerMonth: 40, features: ["Everything in Pro", "Admin dashboard", "SSO", "Privacy mode"],                  officialUrl: "https://cursor.sh/pricing" },
    { plan: "Enterprise", pricePerSeatPerMonth: 60, features: ["Custom contracts", "SLA", "Dedicated support"],                                 officialUrl: "https://cursor.sh/pricing" },
  ],
  github_copilot: [
    { plan: "Individual", pricePerSeatPerMonth: 10, features: ["Code completions", "Chat in IDE"],                                              officialUrl: "https://github.com/features/copilot#pricing" },
    { plan: "Business",   pricePerSeatPerMonth: 19, features: ["Policy management", "Audit logs", "IP indemnity"],                              officialUrl: "https://github.com/features/copilot#pricing" },
    { plan: "Enterprise", pricePerSeatPerMonth: 39, features: ["Fine-tuned models", "PR summaries", "Knowledge bases"],                        officialUrl: "https://github.com/features/copilot#pricing" },
  ],
  claude: [
    { plan: "Free",       pricePerSeatPerMonth: 0,   features: ["Limited Claude 3.5 Haiku"],                                                   officialUrl: "https://www.anthropic.com/pricing" },
    { plan: "Pro",        pricePerSeatPerMonth: 20,  features: ["5x more usage", "Claude 3.5 Sonnet & Opus", "Projects"],                      officialUrl: "https://www.anthropic.com/pricing" },
    { plan: "Max",        pricePerSeatPerMonth: 100, features: ["5x Pro usage", "Priority access", "Extended thinking"],                       officialUrl: "https://www.anthropic.com/pricing" },
    { plan: "Team",       pricePerSeatPerMonth: 30,  minSeats: 5, features: ["Everything Pro", "Team collaboration", "Admin console"],         officialUrl: "https://www.anthropic.com/pricing" },
    { plan: "Enterprise", pricePerSeatPerMonth: 60,  features: ["Custom usage", "SSO/SAML", "Dedicated support"],                              officialUrl: "https://www.anthropic.com/pricing" },
    { plan: "API Direct", pricePerSeatPerMonth: 0,   features: ["Pay per token", "All models"],                                                officialUrl: "https://www.anthropic.com/pricing" },
  ],
  chatgpt: [
    { plan: "Plus",       pricePerSeatPerMonth: 20, features: ["GPT-4o", "DALL-E 3", "Custom GPTs"],                                           officialUrl: "https://openai.com/chatgpt/pricing" },
    { plan: "Team",       pricePerSeatPerMonth: 30, minSeats: 2, features: ["No training on data", "Workspace management"],                    officialUrl: "https://openai.com/chatgpt/pricing" },
    { plan: "Enterprise", pricePerSeatPerMonth: 60, features: ["Unlimited GPT-4o", "Enterprise security"],                                    officialUrl: "https://openai.com/chatgpt/pricing" },
    { plan: "API Direct", pricePerSeatPerMonth: 0,  features: ["Pay per token"],                                                               officialUrl: "https://openai.com/api/pricing" },
  ],
  gemini: [
    { plan: "Free",     pricePerSeatPerMonth: 0,     features: ["Gemini 1.5 Flash (limited)"],                                                 officialUrl: "https://ai.google.dev/pricing" },
    { plan: "Advanced", pricePerSeatPerMonth: 19.99, features: ["Gemini Ultra", "2TB storage", "Google One perks"],                            officialUrl: "https://one.google.com/about/plans" },
    { plan: "API",      pricePerSeatPerMonth: 0,     features: ["Gemini 1.5 Flash: $0.075/$0.30 per M tokens"],                                officialUrl: "https://ai.google.dev/pricing" },
  ],
  windsurf: [
    { plan: "Free",       pricePerSeatPerMonth: 0,  features: ["Limited flows", "Basic models"],                                               officialUrl: "https://windsurf.com/pricing" },
    { plan: "Pro",        pricePerSeatPerMonth: 15, features: ["Unlimited flows", "Priority models"],                                          officialUrl: "https://windsurf.com/pricing" },
    { plan: "Teams",      pricePerSeatPerMonth: 35, minSeats: 2, features: ["Everything Pro", "Admin controls"],                               officialUrl: "https://windsurf.com/pricing" },
    { plan: "Enterprise", pricePerSeatPerMonth: 60, features: ["Custom deployment", "SSO", "SLA"],                                             officialUrl: "https://windsurf.com/pricing" },
  ],
};
