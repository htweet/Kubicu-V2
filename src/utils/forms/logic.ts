import type { FieldRule, FormDef, FormField } from '../../types/forms';
import { isValidEmail } from '../validation';

export type Answers = Record<string, string | string[]>;

const asText = (v: string | string[] | undefined): string => Array.isArray(v) ? v.join(', ') : v ?? '';

export function ruleMatches(rule: FieldRule | null, answers: Answers): boolean {
  if (!rule) return true;
  const v = answers[rule.fieldId];
  const text = asText(v).toLowerCase();
  const target = rule.value.toLowerCase();
  switch (rule.op) {
    case 'answered':
      return text.trim().length > 0;
    case 'is':
      return Array.isArray(v) ? v.map((x) => x.toLowerCase()).includes(target) : text === target;
    case 'isNot':
      return Array.isArray(v) ? !v.map((x) => x.toLowerCase()).includes(target) : text !== target;
    case 'contains':
      return text.includes(target);
  }
}

/** Visible fields given current answers. A field whose controlling field is hidden is hidden too. */
export function visibleFields(fields: FormField[], answers: Answers): FormField[] {
  const shown = new Set<string>();
  return fields.filter((f) => {
    if (f.type === 'hidden') return false;
    const ok = !f.rule || shown.has(f.rule.fieldId) && ruleMatches(f.rule, answers);
    if (ok) shown.add(f.id);
    return ok;
  });
}

export interface FormStep {
  title: string;
  fields: FormField[];
}

export function splitSteps(form: FormDef): FormStep[] {
  const steps: FormStep[] = [];
  form.fields.forEach((f, i) => {
    if (i === 0 || f.stepBreak) steps.push({ title: f.stepBreak ? f.stepTitle || `Step ${steps.length + 1}` : form.name, fields: [] });
    steps[steps.length - 1].fields.push(f);
  });
  return steps.length ? steps : [{ title: form.name, fields: [] }];
}

export function paymentAmount(field: FormField, answers: Answers): number {
  if (field.amountFromFieldId) {
    const n = Number(asText(answers[field.amountFromFieldId]).replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? Math.round(n) : 0;
  }
  return field.amountNgn ?? 0;
}

export function fieldError(field: FormField, value: string | string[] | undefined): string {
  const text = asText(value).trim();
  if (field.type === 'payment') return '';
  if (field.type === 'consent') return '';
  if (field.required && !text) return field.type === 'file' ? 'Attach a file' : 'This is required';
  if (!text) return '';
  if (field.maxLength && text.length > field.maxLength) return `Keep it under ${field.maxLength} characters`;
  if (field.type === 'email' && !isValidEmail(text)) return 'Enter an email like name@example.com';
  if (field.type === 'phone' && !/^\+?[\d\s-]{7,16}$/.test(text)) return 'Enter a phone number, e.g. +234 803 000 0000';
  if ((field.type === 'number' || field.type === 'amount') && !/^\d+(\.\d+)?$/.test(text.replace(/[,₦\s]/g, ''))) return 'Enter numbers only';
  return '';
}

const opText: Record<FieldRule['op'], string> = { is: 'is', isNot: 'is not', contains: 'contains', answered: 'is answered' };

export function ruleSentence(field: FormField, fields: FormField[]): string | null {
  if (!field.rule) return null;
  const src = fields.find((f) => f.id === field.rule!.fieldId);
  if (!src) return 'Rule points to a deleted field';
  return `If ${src.label || 'untitled'} ${opText[field.rule.op]}${field.rule.op === 'answered' ? '' : ` ${field.rule.value || '…'}`}, show ${field.label || 'this field'}`;
}

export function formIssues(form: FormDef): string[] {
  const issues: string[] = [];
  if (form.fields.filter((f) => f.type !== 'hidden').length === 0) issues.push('Add at least one field');
  form.fields.forEach((f, i) => {
    if (!f.label.trim()) issues.push(`Field ${i + 1} needs a label`);
    if (f.rule) {
      const idx = form.fields.findIndex((x) => x.id === f.rule!.fieldId);
      if (idx === -1) issues.push(`“${f.label}” has a rule pointing to a deleted field`);else
      if (idx >= i) issues.push(`“${f.label}” can only depend on a field above it`);
    }
    if (['dropdown', 'choice', 'checkboxes'].includes(f.type) && f.options.filter((o) => o.trim()).length < 2) issues.push(`“${f.label}” needs at least two options`);
    if (f.type === 'payment' && !f.amountFromFieldId && !(f.amountNgn && f.amountNgn > 0)) issues.push(`“${f.label}” needs an amount`);
  });
  if (form.fields.filter((f) => f.type === 'payment').length > 1) issues.push('Use only one payment field per form');
  return issues;
}

/** Whether the form accepts responses right now. */
export function closedReason(form: FormDef, count: number, now = Date.now()): string | null {
  if (form.status === 'closed') return 'This form isn’t accepting responses.';
  if (form.settings.closeAt && Date.parse(form.settings.closeAt) <= now) return 'This form has closed.';
  if (form.settings.maxResponses && count >= form.settings.maxResponses) return 'This form has reached its response limit.';
  return null;
}

export function answerText(v: string | string[] | undefined): string {
  return asText(v);
}