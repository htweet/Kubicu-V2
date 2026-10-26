import type { FormDef, FormSettings, FormsData, FormSubmission } from '../../types/forms';
import { formTemplates } from '../../data/formTemplates';
import { uid } from '../id';
import { seedsSample } from '../workspaceStorage';

export const formsKey = (workspaceId: string) => `kubicu.forms.${workspaceId}`;
export const FORMS_EXTENSION_ID = 'forms';

const listeners = new Set<() => void>();
export function subscribeForms(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const defaultSettings = (): FormSettings => ({
  submitLabel: 'Send',
  successTitle: 'Thanks — we’ve got it',
  successText: 'We’ll be in touch soon.',
  redirectUrl: '',
  closeAt: null,
  maxResponses: null,
  minFillSeconds: 3,
  perVisitorLimit: 3,
  privacyNote: 'We only use your details to reply to you.',
  assigneeId: null
});

export function createForm(templateId: string, name?: string): FormDef {
  const t = formTemplates.find((x) => x.id === templateId) ?? formTemplates[0];
  const now = new Date().toISOString();
  return { id: uid('form'), name: name ?? t.name, description: t.description, status: 'draft', fields: t.fields(), settings: defaultSettings(), templateId: t.id, createdAt: now, updatedAt: now };
}

function seed(): FormsData {
  const form = { ...createForm('quote', 'Bridal quote request'), status: 'live' as const, sample: true };
  const [name, phone, service, date, budget, more] = form.fields;
  const ago = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
  const sub = (id: string, n: string, s: string, b: string, days: number, status: FormSubmission['status']): FormSubmission => ({
    id,
    formId: form.id,
    answers: { [name.id]: n, [phone.id]: '+234 803 555 0101', [service.id]: s, ...(s === 'Bridal' ? { [date.id]: '2026-12-12' } : {}), [budget.id]: b, [more.id]: 'Looking for something with adire detailing.' },
    source: days % 2 ? 'instagram' : 'whatsapp',
    pageHandle: null,
    payment: null,
    status,
    assigneeId: null,
    contactName: n,
    contactEmail: '',
    marketingConsent: false,
    createdAt: ago(days),
    sample: true
  });
  return {
    forms: [form],
    submissions: [sub('sub_s1', 'Funke Adeyemi', 'Bridal', '450000', 1, 'new'), sub('sub_s2', 'Zainab Bello', 'Owambe outfit', '120000', 3, 'read'), sub('sub_s3', 'Ifeoma Obi', 'Bridal', '600000', 6, 'read')]
  };
}

export function readForms(workspaceId: string): FormsData {
  try {
    const raw = window.localStorage.getItem(formsKey(workspaceId));
    if (raw) return JSON.parse(raw) as FormsData;
  } catch {

    /* fall through */}
  const fresh: FormsData = seedsSample(workspaceId) ? seed() : { forms: [], submissions: [] };
  writeForms(workspaceId, fresh, false);
  return fresh;
}

export function writeForms(workspaceId: string, data: FormsData, notify = true): void {
  window.localStorage.setItem(formsKey(workspaceId), JSON.stringify(data));
  if (notify) listeners.forEach((l) => l());
}

export function updateForms(workspaceId: string, fn: (d: FormsData) => FormsData): FormsData {
  const next = fn(readForms(workspaceId));
  writeForms(workspaceId, next);
  return next;
}

/** Per-device rate limit (spam protection). */
export function visitorCount(formId: string): number {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = JSON.parse(window.localStorage.getItem('kubicu.formRate') ?? '{}') as Record<string, number>;
    return raw[`${formId}:${today}`] ?? 0;
  } catch {
    return 0;
  }
}

export function bumpVisitor(formId: string): void {
  const today = new Date().toISOString().slice(0, 10);
  let raw: Record<string, number> = {};
  try {
    raw = JSON.parse(window.localStorage.getItem('kubicu.formRate') ?? '{}');
  } catch {

    /* reset */}
  raw[`${formId}:${today}`] = (raw[`${formId}:${today}`] ?? 0) + 1;
  window.localStorage.setItem('kubicu.formRate', JSON.stringify(raw));
}

/** Is the Forms add-on installed and not paused for this workspace? */
export function formsAddOnActive(workspaceId: string): boolean {
  try {
    const raw = window.localStorage.getItem(`kubicu.marketplace.${workspaceId}`);
    if (!raw) return false;
    const m = JSON.parse(raw) as {installed?: Record<string, {paused?: boolean;}>;};
    const ext = m.installed?.[FORMS_EXTENSION_ID];
    return !!ext && !ext.paused;
  } catch {
    return false;
  }
}