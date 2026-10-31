import type { FieldRule, FormDef, FormField } from '../../types/forms';
import { isValidEmail } from '../validation';
import { formatNgn } from '../format';
import { choiceTypes } from './fields';
import { activeCountryInfo } from '../country';

export type Answers = Record<string, string | string[]>;

const asText = (v: string | string[] | undefined): string => Array.isArray(v) ? v.join(', ') : v ?? '';

/** Product picker answers are stored as "productId:qty". */
export function parsePicks(v: string | string[] | undefined): {id: string;qty: number;}[] {
  const list = Array.isArray(v) ? v : [];
  return list.
  map((s) => {
    const [id, q] = s.split(':');
    return { id, qty: Math.max(0, Math.floor(Number(q) || 0)) };
  }).
  filter((p) => p.id && p.qty > 0);
}

export function picksTotal(field: FormField, v: string | string[] | undefined): number {
  return parsePicks(v).reduce((sum, p) => sum + (field.products?.find((x) => x.id === p.id)?.priceNgn ?? 0) * p.qty, 0);
}

export const isDrawnSignature = (v: string) => v.startsWith('data:image/');

const num = (v: string | string[] | undefined): number => {
  const n = Number(asText(v).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

/** A field's answer as a number (for totals). Products give their total; calculated fields recurse. */
export function numericValue(field: FormField, answers: Answers, fields: FormField[], depth = 0): number {
  if (field.type === 'products') return picksTotal(field, answers[field.id]);
  if (field.type === 'calculated') return depth > 4 ? 0 : calcValue(field, answers, fields, depth + 1);
  return num(answers[field.id]);
}

/** Calculated total (D194): the sum of chosen earlier answers × multiplier, rounded. */
export function calcValue(field: FormField, answers: Answers, fields: FormField[], depth = 0): number {
  const c = field.calc;
  if (!c) return 0;
  const sum = c.fieldIds.reduce((s, id) => {
    const src = fields.find((f) => f.id === id);
    return src ? s + numericValue(src, answers, fields, depth) : s;
  }, 0);
  return Math.round(sum * (Number.isFinite(c.multiplier) ? c.multiplier : 1));
}

const WEBSITE_RE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/i;
const HANDLE_RE = /^@[a-z0-9._]{2,30}$/i;
export const isValidWebsiteOrHandle = (s: string) => WEBSITE_RE.test(s) || HANDLE_RE.test(s);

export const maskAccount = (n: string) => n.length > 4 ? `••••${n.slice(-4)}` : n;

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

/** `fields` lets the amount come from a Product picker total. */
export function paymentAmount(field: FormField, answers: Answers, fields: FormField[] = []): number {
  if (field.amountFromFieldId) {
    const src = fields.find((f) => f.id === field.amountFromFieldId);
    if (src && (src.type === 'products' || src.type === 'calculated')) return numericValue(src, answers, fields);
    const n = Number(asText(answers[field.amountFromFieldId]).replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? Math.round(n) : 0;
  }
  return field.amountNgn ?? 0;
}

export function fieldError(field: FormField, value: string | string[] | undefined): string {
  if (field.type === 'payment' || field.type === 'consent' || field.type === 'section' || field.type === 'calculated') return '';
  if (field.type === 'ranking') {
    return field.required && !(Array.isArray(value) && value.length) ? 'Put these in order with the arrows, or choose “This order is right”' : '';
  }
  if (field.type === 'grid') {
    const rows = field.options.filter((o) => o.trim());
    const answered = new Set((Array.isArray(value) ? value : []).map((x) => x.split('=')[0]));
    const missing = rows.filter((r) => !answered.has(r));
    if (field.required && missing.length) return missing.length === rows.length ? 'Answer each row' : `Answer ${missing.slice(0, 2).join(' and ')}${missing.length > 2 ? '…' : ''}`;
    return '';
  }
  if (field.type === 'region') {
    const [country = '', state = ''] = Array.isArray(value) ? value.map((x) => x.trim()) : [];
    if (!country && !state) return field.required ? 'Choose your country' : '';
    if (!country) return 'Choose your country';
    if (field.required && !state) return country === 'Nigeria' ? 'Choose your state' : ['Kenya', 'Ghana', 'South Africa'].includes(country) ? 'Choose one from the list' : 'Add your state or region';
    return '';
  }
  if (field.type === 'bank') {
    const [bank = '', acct = '', holder = ''] = Array.isArray(value) ? value.map((x) => x.trim()) : [];
    if (!bank && !acct && !holder) return field.required ? 'Add your bank details' : '';
    if (!bank) return 'Choose your bank';
    // The seller's country sets the length (D355): 10 in Nigeria, 10–16 in Kenya and Ghana, 9–11 in South Africa.
    const rule = activeCountryInfo().accountNumber;
    if (!/^\d+$/.test(acct) || acct.length < rule.min || acct.length > rule.max) return rule.min === rule.max ? 'Account numbers have 10 digits' : 'Check the account number — it’s the wrong length';
    if (holder.length < 3) return 'Add the name on the account';
    return '';
  }
  if (field.type === 'bookingSlot') {
    const [iso = ''] = Array.isArray(value) ? value : [];
    if (field.required && !iso) return 'Choose a time';
    return '';
  }
  if (field.type === 'name') {
    const [first = '', last = ''] = Array.isArray(value) ? value.map((x) => x.trim()) : [];
    if (field.required && (!first || !last)) return first ? 'Add your last name' : last ? 'Add your first name' : 'Enter your first and last name';
    if (first.length > 60 || last.length > 60) return 'Keep each name under 60 characters';
    return '';
  }
  if (field.type === 'dateRange') {
    const [from = '', to = ''] = Array.isArray(value) ? value : [];
    if (!from && !to) return field.required ? 'Choose a start and end date' : '';
    if (!from || !to) return from ? 'Choose an end date' : 'Choose a start date';
    if (to < from) return 'The end date must be on or after the start date';
    return '';
  }
  if (field.type === 'products') {
    const picks = parsePicks(value);
    if (field.required && picks.length === 0) return 'Choose at least one item';
    return '';
  }
  const text = asText(value).trim();
  if (field.required && !text) return field.type === 'file' ? 'Attach a file' : field.type === 'signature' ? 'Add your signature' : field.type === 'imageChoice' || field.type === 'scale' ? 'Choose one' : 'This is required';
  if (!text) return '';
  if (field.type === 'signature' && !isDrawnSignature(text) && text.replace(/^typed:/, '').trim().length < 2) return 'Type your full name to sign';
  if (field.maxLength && text.length > field.maxLength) return `Keep it under ${field.maxLength} characters`;
  if (field.type === 'email' && !isValidEmail(text)) return 'Enter an email like name@example.com';
  if (field.type === 'website' && !isValidWebsiteOrHandle(text)) return 'Enter a web address like example.com, or a handle like @yourname';
  if (field.type === 'phone' && !/^\+?[\d\s-]{7,16}$/.test(text)) return 'Enter a phone number with its country code';
  if ((field.type === 'number' || field.type === 'amount') && !/^\d+(\.\d+)?$/.test(text.replace(/[,₦\s]/g, ''))) return 'Enter numbers only';
  return '';
}

type Translate = (key: string, vars?: Record<string, string | number>) => string;
const plain: Translate = (key, vars) => vars ? key.replace(/\{(\w+)\}/g, (m, k: string) => k in vars ? String(vars[k]) : m) : key;

const ruleKeys: Record<FieldRule['op'], string> = {
  is: 'If {source} is {value}, show {field}',
  isNot: 'If {source} is not {value}, show {field}',
  contains: 'If {source} contains {value}, show {field}',
  answered: 'If {source} is answered, show {field}'
};

/** "If Topic is Press, show Your KUBICU link". Pass the translator to get it in the chosen language (D341). */
export function ruleSentence(field: FormField, fields: FormField[], t: Translate = plain): string | null {
  if (!field.rule) return null;
  const src = fields.find((f) => f.id === field.rule!.fieldId);
  if (!src) return t('Rule points to a deleted field');
  return t(ruleKeys[field.rule.op], { source: src.label || t('untitled'), value: field.rule.value || '…', field: field.label || t('this field') });
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
    if (choiceTypes.includes(f.type) && f.options.filter((o) => o.trim()).length < 2) issues.push(`“${f.label}” needs at least two options`);
    if (f.type === 'imageChoice' && f.options.some((o, j) => o.trim() && !f.optionImages?.[j])) issues.push(`“${f.label}” has options without a picture`);
    if (f.type === 'products' && !f.products?.length) issues.push(`“${f.label}” needs at least one product`);
    if (f.type === 'scale' && f.scale && (!f.scale.minLabel.trim() || !f.scale.maxLabel.trim())) issues.push(`“${f.label}” needs words for both ends of the scale`);
    if ((f.type === 'ranking' || f.type === 'grid') && f.options.filter((o) => o.trim()).length < 2) issues.push(`“${f.label}” needs at least two ${f.type === 'grid' ? 'rows' : 'items'}`);
    if (f.type === 'grid' && (f.gridColumns ?? []).filter((o) => o.trim()).length < 2) issues.push(`“${f.label}” needs at least two answer choices`);
    if (f.type === 'bookingSlot' && !f.serviceId) issues.push(`“${f.label}” needs a service from Bookings`);
    if (f.type === 'calculated') {
      const ids = f.calc?.fieldIds ?? [];
      if (!ids.length) issues.push(`“${f.label}” needs at least one answer to add up`);else
      if (ids.some((id) => form.fields.findIndex((x) => x.id === id) === -1 || form.fields.findIndex((x) => x.id === id) >= i)) issues.push(`“${f.label}” can only add up answers above it`);
    }
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

/**
 * An answer as readable text. Pass the field so names, date ranges, signatures and picks read naturally.
 * `mask` hides all but the last 4 digits of bank account numbers.
 */
export function answerText(v: string | string[] | undefined, field?: FormField, opts: {mask?: boolean;} = {}): string {
  if (!field) return asText(v);
  const list = Array.isArray(v) ? v : [];
  switch (field.type) {
    case 'section':
      return '';
    case 'ranking':
      return list.map((x, i) => `${i + 1}. ${x}`).join(', ');
    case 'grid':
      return list.map((x) => x.replace('=', ': ')).join('; ');
    case 'region':
      return list.map((x) => x.trim()).filter(Boolean).reverse().join(', ');
    case 'bookingSlot':
      return list[1] ?? list[0] ?? '';
    case 'bank':{
        const [bank = '', acct = '', holder = ''] = list;
        if (!bank && !acct) return '';
        return [bank, opts.mask ? maskAccount(acct) : acct, holder].filter(Boolean).join(' · ');
      }
    case 'calculated':{
        const s = typeof v === 'string' ? v : '';
        if (!s) return '';
        return field.calc?.unit === 'number' ? Number(s).toLocaleString('en-NG') : formatNgn(Number(s));
      }
    case 'name':
      return (Array.isArray(v) ? v : []).map((x) => x.trim()).filter(Boolean).join(' ');
    case 'dateRange':{
        const [from = '', to = ''] = Array.isArray(v) ? v : [];
        return from && to ? `${from} → ${to}` : from || to;
      }
    case 'signature':{
        const s = typeof v === 'string' ? v : '';
        if (!s) return '';
        return isDrawnSignature(s) ? 'Signed (drawn)' : `Signed: ${s.replace(/^typed:/, '')} (typed)`;
      }
    case 'scale':{
        const s = typeof v === 'string' ? v : '';
        return s && field.scale ? `${s} of ${field.scale.max}` : s;
      }
    case 'products':{
        const picks = parsePicks(v);
        if (!picks.length) return '';
        const lines = picks.map((p) => {
          const prod = field.products?.find((x) => x.id === p.id);
          return `${p.qty} × ${prod?.name ?? 'Removed product'}${prod ? ` (${formatNgn(prod.priceNgn * p.qty)})` : ''}`;
        });
        return `${lines.join(', ')} · Total ${formatNgn(picksTotal(field, v))}`;
      }
    default:
      return asText(v);
  }
}