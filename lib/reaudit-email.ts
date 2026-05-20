import type { StaleAudit, PriceChange } from "@/app/api/detect-changes/route";

interface SendReauditEmailParams {
  email: string;
  staleAudits: StaleAudit[];
  baseUrl: string;
}

export async function sendReauditEmail({ email, staleAudits, baseUrl }: SendReauditEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[reaudit-email] No RESEND_API_KEY — skipping email");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Consolidate all changes across audits for this user
  const allChanges = staleAudits.flatMap(s => s.changes);
  const uniqueChanges = deduplicateChanges(allChanges);

  const changesHtml = uniqueChanges.map(c => {
    if (c.changeType === "price_changed") {
      const direction = (c.newPrice ?? 0) > (c.oldPrice ?? 0) ? "↑ increased" : "↓ decreased";
      return `<li style="margin-bottom:8px;color:#dceadc;">
        <strong style="color:#22c55e;">${formatToolName(c.toolId)} ${c.plan}</strong>
        ${direction} from <strong>$${c.oldPrice}/seat</strong> to <strong>$${c.newPrice}/seat</strong>
      </li>`;
    }
    if (c.changeType === "plan_removed") {
      return `<li style="margin-bottom:8px;color:#dceadc;">
        <strong style="color:#f87171;">${formatToolName(c.toolId)} ${c.plan}</strong> plan has been removed
      </li>`;
    }
    return `<li style="margin-bottom:8px;color:#dceadc;">
      <strong style="color:#facc15;">${formatToolName(c.toolId)} ${c.plan}</strong> is a new plan ($${c.newPrice}/seat)
    </li>`;
  }).join("\n");

  const auditLinksHtml = staleAudits.map(s => {
    const rerunUrl = `${baseUrl}/result/${s.audit.id}?reaudit=true`;
    const unsubUrl = `${baseUrl}/api/unsubscribe?auditId=${s.audit.id}&email=${encodeURIComponent(email)}`;
    return `
      <div style="border:1px solid #1a2e1a;border-radius:6px;padding:16px;margin-bottom:12px;background:#0a140a;">
        <p style="margin:0 0 4px;color:#5e7560;font-size:11px;font-family:monospace;">AUDIT #${s.audit.id}</p>
        <p style="margin:0 0 12px;color:#dceadc;font-size:13px;">
          Previous savings identified: <strong style="color:#22c55e;">$${s.audit.total_monthly_savings}/mo</strong>
          — your recommendations may have changed.
        </p>
        <a href="${rerunUrl}" style="display:inline-block;background:#22c55e;color:#060908;font-weight:bold;padding:8px 16px;border-radius:4px;text-decoration:none;font-family:monospace;font-size:12px;">
          Re-run audit with new pricing →
        </a>
        <p style="margin:12px 0 0;font-size:11px;color:#2e3e2f;">
          <a href="${unsubUrl}" style="color:#2e3e2f;">Unsubscribe from re-audit alerts for this audit</a>
        </p>
      </div>
    `;
  }).join("\n");

  await resend.emails.send({
    from: "StackAudit <audit@credex.rocks>",
    to: email,
    subject: `Pricing changed — your audit may be stale`,
    html: `
      <div style="font-family:monospace;max-width:600px;margin:0 auto;padding:24px;background:#060908;color:#dceadc;">
        <h1 style="color:#22c55e;font-size:20px;margin-bottom:8px;">Pricing changed since your audit</h1>
        <p style="color:#5e7560;font-size:13px;margin-bottom:24px;">
          We detected pricing changes in tools you audited. Your previous recommendations may no longer be accurate.
        </p>

        <div style="margin-bottom:24px;">
          <p style="color:#dceadc;font-size:13px;font-weight:bold;margin-bottom:12px;">What changed:</p>
          <ul style="margin:0;padding-left:20px;font-size:13px;">
            ${changesHtml}
          </ul>
        </div>

        <div style="margin-bottom:24px;">
          <p style="color:#dceadc;font-size:13px;font-weight:bold;margin-bottom:12px;">Your affected audit${staleAudits.length > 1 ? "s" : ""}:</p>
          ${auditLinksHtml}
        </div>

        <p style="color:#2e3e2f;font-size:11px;margin-top:32px;border-top:1px solid #1a2e1a;padding-top:16px;">
          StackAudit by Credex · credex.rocks<br/>
          You're receiving this because you ran an AI spend audit and provided your email.
        </p>
      </div>
    `,
  });
}

function formatToolName(toolId: string): string {
  const names: Record<string, string> = {
    cursor: "Cursor",
    github_copilot: "GitHub Copilot",
    claude: "Claude",
    chatgpt: "ChatGPT",
    anthropic_api: "Anthropic API",
    openai_api: "OpenAI API",
    gemini: "Gemini",
    windsurf: "Windsurf",
  };
  return names[toolId] ?? toolId;
}

function deduplicateChanges(changes: PriceChange[]): PriceChange[] {
  const seen = new Set<string>();
  return changes.filter(c => {
    const key = `${c.toolId}:${c.plan}:${c.changeType}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
