import type { FormDef, FormSubmission } from '../../types/forms';
import type { SourceId } from '../../types/analytics';
import { type Answers, answerText } from './logic';
import { updateForms } from './storage';
import { sendConfirmation } from './confirmation';
import { uid } from '../id';

export interface SubmissionContact {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
}

export function contactFrom(form: FormDef, answers: Answers): SubmissionContact {
  const pick = (pred: (label: string, type: string) => boolean) => {
    const f = form.fields.find((x) => pred(x.label, x.type) && answerText(answers[x.id], x).trim());
    return f ? answerText(answers[f.id], f).trim() : '';
  };
  return {
    name: pick((_, t) => t === 'name') || pick((l, t) => t === 'shortText' && /name/i.test(l)) || pick((_, t) => t === 'shortText'),
    email: pick((_, t) => t === 'email'),
    phone: pick((_, t) => t === 'phone'),
    consent: form.fields.some((f) => f.type === 'consent' && answers[f.id] === 'yes'),
  };
}

/** Saves a live submission. Hidden attribution fields are filled here, never by the visitor. */
export function recordSubmission(
  workspaceId: string,
  form: FormDef,
  answers: Answers,
  paymentNgn: number | null,
  ctx: { source: SourceId | null; handle: string | null; campaign?: string | null },
): FormSubmission {
  const filled: Answers = { ...answers };
  form.fields
    .filter((f) => f.type === 'hidden')
    .forEach((f) => {
      filled[f.id] = f.hiddenSource === 'source' ? ctx.source ?? 'direct' : f.hiddenSource === 'campaign' ? ctx.campaign ?? '' : ctx.handle ?? '';
    });
  const c = contactFrom(form, filled);
  const sub: FormSubmission = {
    id: uid('sub'),
    formId: form.id,
    answers: filled,
    source: ctx.source,
    pageHandle: ctx.handle,
    payment: paymentNgn ? { amountNgn: paymentNgn, status: 'test', reference: `FRM-${Math.random().toString(36).slice(2, 8).toUpperCase()}` } : null,
    status: 'new',
    assigneeId: form.settings.assigneeId,
    contactName: c.name,
    contactEmail: c.email,
    contactPhone: c.phone,
    marketingConsent: c.consent,
    createdAt: new Date().toISOString(),
  };
  const email = sendConfirmation(workspaceId, form, filled, c.email, c.name);
  if (email) sub.email = email;
  updateForms(workspaceId, (d) => ({ ...d, submissions: [sub, ...d.submissions] }));
  return sub;
}
