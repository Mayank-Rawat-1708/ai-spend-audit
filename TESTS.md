# Tests

## Running

```bash
npm test
# or
npx jest __tests__/audit-engine.test.ts
```

## File: `__tests__/audit-engine.test.ts`

18 tests covering `lib/audit-engine.ts`:

| Test | Covers |
|---|---|
| Cursor Business ≤3 seats → downgrade | Plan right-sizing |
| Cursor Pro 3 seats → keep | No false positives |
| Cursor Enterprise <10 seats → downgrade | Enterprise overkill |
| Copilot Enterprise <20 seats → downgrade | Copilot right-sizing |
| Copilot for non-coding → switch | Use-case mismatch |
| Claude Team <5 seats → downgrade | Below minimum detection |
| Claude Pro 1 seat → optimal | No false positives |
| ChatGPT Team 2 seats → downgrade | Team-vs-Plus comparison |
| ChatGPT Enterprise <15 seats → downgrade | Enterprise overkill |
| OpenAI API high spend → optimize | API spend trigger |
| OpenAI API low spend → keep | No false positives |
| Windsurf Teams ≤2 seats → downgrade | Windsurf right-sizing |
| Gemini Advanced multi-seat → switch | Use-case mismatch |
| Cursor + Copilot → cancel expensive | Overlap detection (2 tools) |
| Cursor + Copilot + Windsurf → cancel most expensive | Overlap detection (3 tools) |
| Total savings = sum of individual savings | Totals accuracy |
| Optimal stack → isOptimal = true | Flag correctness |
| Result has id and valid createdAt | Shape validation |
