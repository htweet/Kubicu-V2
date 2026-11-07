import type { FormConfirmation, FormDef, SubmissionEmail } from '../../types/forms';
import { activeProvider, appendProviderLog, maskEmail, readProviders } from '../providers/store';
import { type Answers, answerText } from './logic';

/** Starting wording for a form's confirmation email (D195). */
export const defaultConfirmation = (): FormConfirmation => ({
  enabled: false,
  subject: 'We got your response to “{form}”',
  body: 'Hi {first_name},\n\nThanks — we’ve received your response to “{form}”. Here’s a copy of what you sent:\n\n{answers}\n\nWe’ll be in touch soon.',
});

/** Fields that never go into an email copy: private, decorative or machine-filled. */
const PRIVATE = new Set(['payment', 'consent', 'section', 'hidden', 'bank', 'signature', 'file']);

export function answersSummary(form: FormDef, answers: Answers): string {
  return form.fields
    .filter((f) => !PRIVATE.has(f.type))
    .map((f) => {
      const v = answerText(answers[f.id], f).trim();
      return v ? `${f.label}: ${v}` : null;
    })
    .filter((x): x is string => !!x)
    .join('\n');
}

export function fillConfirmation(text: string, vars: { name: string; form: string; answers: string }): string {
  const first = vars.name.trim().split(/\s+/)[0] || 'there';
  return text.replace(/\{(first_name|name|form|answers)\}/g, (_, k: string) => (k === 'first_name' ? first : k === 'name' ? vars.name || 'there' : k === 'form' ? vars.form : vars.answers));
}

/**
 * Writes the confirmation email and hands it to the connected email provider (D195).
 * The send is simulated: it's recorded on the response and in Integrations → Activity.
 */
export function sendConfirmation(workspaceId: string, form: FormDef, answers: Answers, to: string, name: string): SubmissionEmail | undefined {
  const c = form.settings.confirmation;
  if (!c?.enabled) return undefined;
  const vars = { name, form: form.name, answers: answersSummary(form, answers) };
  const subject = fillConfirmation(c.subject, vars);
  const body = fillConfirmation(c.body, vars);
  const at = new Date().toISOString();
  if (!to) return { status: 'no_address', to: '', subject, body, at };
  const provider = activeProvider(readProviders(workspaceId), 'email');
  if (!provider) return { status: 'not_connected', to, subject, body, at };
  appendProviderLog(workspaceId, provider.id, 'Form confirmation', true, `To ${maskEmail(to)} — “${subject}” (simulated)`);
  return { status: 'sent', providerName: provider.name, to, subject, body, at };
}
