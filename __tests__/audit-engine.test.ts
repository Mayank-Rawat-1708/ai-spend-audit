import { runAudit } from "../lib/audit-engine";
import type { AuditInput } from "../types";

describe("Cursor", () => {
  test("Business ≤3 seats → downgrade to Pro", () => {
    const r = runAudit({ tools: [{ toolId: "cursor", plan: "Business", monthlySpend: 80, seats: 2 }], teamSize: 2, useCase: "coding" });
    expect(r.recommendations[0]!.recommendedAction).toBe("downgrade");
    expect(r.recommendations[0]!.recommendedPlan).toBe("Pro");
    expect(r.recommendations[0]!.monthlySavings).toBe(40);
    expect(r.recommendations[0]!.annualSavings).toBe(480);
  });
  test("Pro 3 seats → keep", () => {
    const r = runAudit({ tools: [{ toolId: "cursor", plan: "Pro", monthlySpend: 60, seats: 3 }], teamSize: 3, useCase: "coding" });
    expect(r.recommendations[0]!.recommendedAction).toBe("keep");
    expect(r.recommendations[0]!.severity).toBe("optimal");
  });
  test("Enterprise <10 seats → downgrade to Business", () => {
    const r = runAudit({ tools: [{ toolId: "cursor", plan: "Enterprise", monthlySpend: 500, seats: 5 }], teamSize: 5, useCase: "coding" });
    expect(r.recommendations[0]!.recommendedAction).toBe("downgrade");
    expect(r.recommendations[0]!.severity).toBe("high");
  });
});

describe("GitHub Copilot", () => {
  test("Enterprise <20 seats → downgrade to Business", () => {
    const r = runAudit({ tools: [{ toolId: "github_copilot", plan: "Enterprise", monthlySpend: 195, seats: 5 }], teamSize: 5, useCase: "coding" });
    expect(r.recommendations[0]!.recommendedAction).toBe("downgrade");
    expect(r.recommendations[0]!.recommendedPlan).toBe("Business");
    expect(r.recommendations[0]!.monthlySavings).toBe(100);
  });
  test("Non-coding use case → switch", () => {
    const r = runAudit({ tools: [{ toolId: "github_copilot", plan: "Business", monthlySpend: 95, seats: 5 }], teamSize: 5, useCase: "writing" });
    expect(r.recommendations[0]!.recommendedAction).toBe("switch");
    expect(r.recommendations[0]!.severity).toBe("medium");
  });
});

describe("Claude", () => {
  test("Team <5 seats → downgrade to Pro", () => {
    const r = runAudit({ tools: [{ toolId: "claude", plan: "Team", monthlySpend: 90, seats: 3 }], teamSize: 3, useCase: "mixed" });
    expect(r.recommendations[0]!.recommendedAction).toBe("downgrade");
    expect(r.recommendations[0]!.monthlySavings).toBe(30);
  });
  test("Pro 1 seat → optimal", () => {
    const r = runAudit({ tools: [{ toolId: "claude", plan: "Pro", monthlySpend: 20, seats: 1 }], teamSize: 1, useCase: "writing" });
    expect(r.recommendations[0]!.recommendedAction).toBe("keep");
    expect(r.recommendations[0]!.severity).toBe("optimal");
  });
});

describe("ChatGPT", () => {
  test("Team 2 seats → downgrade to Plus", () => {
    const r = runAudit({ tools: [{ toolId: "chatgpt", plan: "Team", monthlySpend: 60, seats: 2 }], teamSize: 2, useCase: "writing" });
    expect(r.recommendations[0]!.recommendedAction).toBe("downgrade");
    expect(r.recommendations[0]!.monthlySavings).toBe(20);
    expect(r.recommendations[0]!.annualSavings).toBe(240);
  });
  test("Enterprise <15 seats → downgrade to Team", () => {
    const r = runAudit({ tools: [{ toolId: "chatgpt", plan: "Enterprise", monthlySpend: 480, seats: 8 }], teamSize: 8, useCase: "mixed" });
    expect(r.recommendations[0]!.recommendedAction).toBe("downgrade");
    expect(r.recommendations[0]!.severity).toBe("high");
  });
});

describe("OpenAI API", () => {
  test("High spend → optimize", () => {
    const r = runAudit({ tools: [{ toolId: "openai_api", plan: "Pay-as-you-go", monthlySpend: 500, seats: 1 }], teamSize: 5, useCase: "coding" });
    expect(r.recommendations[0]!.recommendedAction).toBe("optimize");
    expect(r.recommendations[0]!.monthlySavings).toBeGreaterThan(0);
    expect(r.recommendations[0]!.severity).toBe("high");
  });
  test("Low spend → keep", () => {
    const r = runAudit({ tools: [{ toolId: "openai_api", plan: "Pay-as-you-go", monthlySpend: 50, seats: 1 }], teamSize: 2, useCase: "coding" });
    expect(r.recommendations[0]!.recommendedAction).toBe("keep");
  });
});

describe("Windsurf", () => {
  test("Teams ≤2 seats → downgrade to Pro", () => {
    const r = runAudit({ tools: [{ toolId: "windsurf", plan: "Teams", monthlySpend: 35, seats: 1 }], teamSize: 1, useCase: "coding" });
    expect(r.recommendations[0]!.recommendedAction).toBe("downgrade");
    expect(r.recommendations[0]!.monthlySavings).toBe(20);
  });
});

describe("Gemini", () => {
  test("Advanced multi-seat → switch to Claude", () => {
    const r = runAudit({ tools: [{ toolId: "gemini", plan: "Advanced", monthlySpend: 60, seats: 3 }], teamSize: 3, useCase: "writing" });
    expect(r.recommendations[0]!.recommendedAction).toBe("switch");
    expect(r.recommendations[0]!.recommendedTool).toContain("Claude");
  });
});

describe("Overlap detection", () => {
  test("Cursor + Copilot → cancel expensive one", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "cursor", plan: "Pro", monthlySpend: 100, seats: 5 },
        { toolId: "github_copilot", plan: "Business", monthlySpend: 95, seats: 5 },
      ],
      teamSize: 5, useCase: "coding",
    };
    const r = runAudit(input);
    const cancel = r.recommendations.find(rec => rec.recommendedAction === "cancel");
    expect(cancel).toBeDefined();
    expect(cancel!.monthlySavings).toBeGreaterThan(0);
    expect(cancel!.severity).toBe("high");
  });
  test("Three coding tools → most expensive cancelled", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "cursor", plan: "Business", monthlySpend: 200, seats: 5 },
        { toolId: "github_copilot", plan: "Business", monthlySpend: 95, seats: 5 },
        { toolId: "windsurf", plan: "Pro", monthlySpend: 75, seats: 5 },
      ],
      teamSize: 5, useCase: "coding",
    };
    const r = runAudit(input);
    const cancel = r.recommendations.find(rec => rec.recommendedAction === "cancel");
    expect(cancel).toBeDefined();
    expect(cancel!.toolId).toBe("cursor");
  });
});

describe("Totals", () => {
  test("Total savings = sum of individual savings", () => {
    const r = runAudit({ tools: [{ toolId: "cursor", plan: "Business", monthlySpend: 80, seats: 2 }, { toolId: "chatgpt", plan: "Team", monthlySpend: 60, seats: 2 }], teamSize: 2, useCase: "mixed" });
    const sum = r.recommendations.reduce((s, rec) => s + rec.monthlySavings, 0);
    expect(r.totalMonthlySavings).toBe(sum);
    expect(r.totalAnnualSavings).toBe(r.totalMonthlySavings * 12);
  });
  test("Optimal stack → isOptimal = true", () => {
    const r = runAudit({ tools: [{ toolId: "cursor", plan: "Pro", monthlySpend: 60, seats: 3 }, { toolId: "claude", plan: "Pro", monthlySpend: 60, seats: 3 }], teamSize: 3, useCase: "coding" });
    expect(r.isOptimal).toBe(true);
    expect(r.totalMonthlySavings).toBe(0);
  });
  test("Result has unique id and valid createdAt", () => {
    const r = runAudit({ tools: [{ toolId: "cursor", plan: "Pro", monthlySpend: 20, seats: 1 }], teamSize: 1, useCase: "coding" });
    expect(r.id.length).toBeGreaterThan(0);
    expect(new Date(r.createdAt).getTime()).not.toBeNaN();
  });
});
