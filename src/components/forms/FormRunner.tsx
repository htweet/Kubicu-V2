import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { CheckIcon, LockIcon } from 'lucide-react';
import type { FormDef } from '../../types/forms';
import type { FormSkin } from './formSkin';
import { FormFieldInput } from './FormFieldInput';
import { type Answers, calcValue, fieldError, paymentAmount, splitSteps, visibleFields } from '../../utils/forms/logic';
import { bumpVisitor, visitorCount } from '../../utils/forms/storage';

export interface RunnerSubmit {
  answers: Answers;
  paymentNgn: number | null;
}

interface FormRunnerProps {
  form: FormDef;
  skin: FormSkin;
  /** `live` saves, `preview` runs but doesn't save, `inert` is a static picture (canvas). */
  mode: 'live' | 'preview' | 'inert';
  closed?: string | null;
  onSubmit?: (s: RunnerSubmit) => boolean;
  onStart?: () => void;
  /** Show the form's name as a heading. */
  showTitle?: boolean;
  headingLevel?: 'h2' | 'h3';
  /** Answers filled in before the visitor starts, e.g. a topic chosen by the page that linked here. */
  initialAnswers?: Answers;
}

/** Runs a form: steps, show/hide rules, validation, spam checks, test payment and done/closed states (D79). */
export function FormRunner({ form, skin, mode, closed, onSubmit, onStart, showTitle = true, headingLevel = 'h2', initialAnswers }: FormRunnerProps) {
  const uid = useId();
  const inert = mode === 'inert';
  const [answers, setAnswers] = useState<Answers>(() => initialAnswers ?? {});
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [failure, setFailure] = useState('');
  const [trap, setTrap] = useState('');
  const startedAt = useRef(Date.now());
  const started = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const Heading = headingLevel;

  useEffect(() => {
    setAnswers(initialAnswers ?? {});
    setStepIndex(0);
    setErrors({});
    setDone(false);
  }, [form.id]);

  const steps = useMemo(() => splitSteps(form), [form]);
  const visible = useMemo(() => new Set(visibleFields(form.fields, answers).map((f) => f.id)), [form.fields, answers]);
  // Steps with nothing visible are skipped.
  const liveSteps = steps.map((s) => ({ ...s, fields: s.fields.filter((f) => visible.has(f.id)) })).filter((s) => s.fields.length > 0);
  const safeIndex = Math.min(stepIndex, Math.max(0, liveSteps.length - 1));
  const step = liveSteps[safeIndex];
  const last = safeIndex >= liveSteps.length - 1;
  const paymentField = form.fields.find((f) => f.type === 'payment' && visible.has(f.id));

  const set = (id: string, v: string | string[]) => {
    if (!started.current && !inert) {
      started.current = true;
      onStart?.();
    }
    setAnswers((a) => {
      const next = { ...a, [id]: v };
      // Changing what the amount is based on after paying asks for payment again, so the charge always matches.
      const pay = form.fields.find((f) => f.type === 'payment' && f.amountFromFieldId);
      if (pay && pay.id !== id && next[pay.id] === 'paid' && paymentAmount(pay, next, form.fields) !== paymentAmount(pay, a, form.fields)) next[pay.id] = '';
      return next;
    });
    if (errors[id]) setErrors((e) => ({ ...e, [id]: '' }));
  };

  const checkStep = (): boolean => {
    if (!step) return true;
    const next: Record<string, string> = {};
    step.fields.forEach((f) => {
      const msg = f.type === 'payment' ? f.required && answers[f.id] !== 'paid' ? 'Complete the payment to continue' : '' : fieldError(f, answers[f.id]);
      if (msg) next[f.id] = msg;
    });
    setErrors(next);
    const first = step.fields.find((f) => next[f.id]);
    if (first) {
      window.setTimeout(() => document.getElementById(`${uid}-${first.id}`)?.focus(), 0);
      return false;
    }
    return true;
  };

  const goTo = (i: number) => {
    setStepIndex(i);
    window.setTimeout(() => headingRef.current?.focus(), 0);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inert) return;
    if (!checkStep()) return;
    if (!last) return goTo(safeIndex + 1);
    setFailure('');
    if (mode === 'live') {
      if (trap) return setDone(true); // bots get a quiet success
      if ((Date.now() - startedAt.current) / 1000 < form.settings.minFillSeconds) return setFailure('That was quick — please check your answers and send again.');
      if (visitorCount(form.id) >= form.settings.perVisitorLimit) return setFailure('You’ve sent this form a few times today. Please try again tomorrow.');
    }
    const kept: Answers = {};
    form.fields.forEach((f) => {
      if (visible.has(f.id) && answers[f.id] !== undefined) kept[f.id] = answers[f.id];
    });
    // Calculated totals are worked out here, never typed by the visitor.
    form.fields.forEach((f) => {
      if (f.type === 'calculated' && visible.has(f.id)) kept[f.id] = String(calcValue(f, answers, form.fields));
    });
    const paymentNgn = paymentField && answers[paymentField.id] === 'paid' ? paymentAmount(paymentField, answers, form.fields) : null;
    if (onSubmit && !onSubmit({ answers: kept, paymentNgn })) return setFailure('Something went wrong. Please try again.');
    if (mode === 'live') bumpVisitor(form.id);
    setDone(true);
  };

  const reset = () => {
    setAnswers({});
    setStepIndex(0);
    setDone(false);
    started.current = false;
    startedAt.current = Date.now();
  };

  const title = showTitle &&
  <Heading ref={headingRef} tabIndex={-1} className="text-[20px] font-medium tracking-[-0.01em] outline-none" style={{ fontFamily: skin.display, color: skin.text }}>
      {form.name}
    </Heading>;


  if (closed) {
    return (
      <div className="flex flex-col gap-2">
        {title}
        <p className="inline-flex items-center gap-2 text-[14px]" role="status" style={{ color: skin.muted }}>
          <LockIcon size={15} aria-hidden /> {closed}
        </p>
      </div>);

  }

  if (done) {
    return (
      <div className="flex flex-col items-start gap-1.5 py-2" role="status">
        <span className="inline-flex items-center gap-2 text-[16px] font-semibold" style={{ color: skin.text }}>
          <CheckIcon size={18} aria-hidden /> {form.settings.successTitle || 'Thanks — we’ve got it'}
        </span>
        <span className="text-[13.5px]" style={{ color: skin.muted }}>
          {mode === 'preview' ? 'Preview — nothing was saved.' : form.settings.successText}
        </span>
        {form.settings.redirectUrl && mode === 'live' &&
        <a href={form.settings.redirectUrl} className="mt-2 text-[13.5px] font-semibold underline" style={{ color: skin.text }}>
            Continue
          </a>
        }
        {mode === 'preview' &&
        <button type="button" onClick={reset} className="mt-2 text-[13px] font-medium underline" style={{ color: skin.text }}>
            Run again
          </button>
        }
      </div>);

  }

  return (
    <form noValidate onSubmit={submit} className="relative flex min-w-0 flex-col gap-4" aria-describedby={form.description ? `${uid}-desc` : undefined}>
      <div>
        {title}
        {form.description &&
        <p id={`${uid}-desc`} className="mt-1 text-[14px] leading-relaxed" style={{ color: skin.muted }}>
            {form.description}
          </p>
        }
      </div>

      {liveSteps.length > 1 &&
      <div>
          <div className="flex items-center justify-between text-[12px]" style={{ color: skin.muted }}>
            <span aria-live="polite">{step?.title}</span>
            <span>
              {safeIndex + 1} / {liveSteps.length}
            </span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full" style={{ background: `color-mix(in srgb, ${skin.text} 12%, transparent)` }} role="progressbar" aria-label="Form progress" aria-valuemin={1} aria-valuemax={liveSteps.length} aria-valuenow={safeIndex + 1}>
            <div className="h-full rounded-full transition-[width] duration-200 ease-out" style={{ width: `${(safeIndex + 1) / liveSteps.length * 100}%`, background: skin.text }} />
          </div>
        </div>
      }

      {step?.fields.map((f) =>
      <FormFieldInput key={f.id} field={f} value={answers[f.id]} onChange={(v) => set(f.id, v)} error={errors[f.id]} skin={skin} inert={inert} idPrefix={uid} amount={f.type === 'payment' ? paymentAmount(f, answers, form.fields) : f.type === 'calculated' ? calcValue(f, answers, form.fields) : undefined} />
      )}

      {/* Spam trap: invisible to people, tempting to bots. */}
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0 [clip:rect(0,0,0,0)]">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </label>
      </div>

      {failure &&
      <p role="alert" className="text-[13px] font-medium" style={{ color: skin.danger }}>
          {failure}
        </p>
      }
      {last && form.settings.privacyNote &&
      <p className="text-[12px] leading-snug" style={{ color: skin.muted }}>
          {form.settings.privacyNote}
        </p>
      }
      <div className="flex gap-2">
        {safeIndex > 0 &&
        <button type="button" disabled={inert} tabIndex={inert ? -1 : undefined} onClick={() => goTo(safeIndex - 1)} className="h-12 px-4 text-[14.5px] font-medium" style={{ ...skin.input, color: skin.text }}>
            Back
          </button>
        }
        <button type="submit" tabIndex={inert ? -1 : undefined} className="h-12 flex-1 text-[15px] font-semibold" style={skin.button}>
          {last ? form.settings.submitLabel || 'Send' : 'Next'}
        </button>
      </div>
    </form>);

}