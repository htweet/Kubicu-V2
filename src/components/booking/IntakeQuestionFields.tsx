import React from 'react';
import type { IntakeQuestion } from '../../types/ops';
import type { PageTheme } from '../../types/page';
import { ThemedField } from '../checkout/checkoutUi';
import { mix } from '../blocks/pageStyle';

interface IntakeQuestionFieldsProps {
  theme: PageTheme;
  questions: IntakeQuestion[];
  answers: Record<string, string>;
  onChange: (id: string, answer: string) => void;
  showErrors: boolean;
}

/** Missing required answers, keyed by question id (D256). */
export function intakeErrors(questions: IntakeQuestion[], answers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(questions.filter((q) => q.required && !(answers[q.id] ?? '').trim()).map((q) => [q.id, q.kind === 'text' ? 'Please answer this' : 'Please choose one']));
}

/** The answers as stored on the booking, with each question's wording copied. */
export function intakeAnswers(questions: IntakeQuestion[], answers: Record<string, string>) {
  return questions.map((q) => ({ question: q.label, answer: (answers[q.id] ?? '').trim() })).filter((a) => a.answer);
}

/** A service's own questions in the booking sheet, styled by the page theme (D256). */
export function IntakeQuestionFields({ theme, questions, answers, onChange, showErrors }: IntakeQuestionFieldsProps) {
  const errors = intakeErrors(questions, answers);
  const muted = { color: theme.mutedText };
  return (
    <>
      {questions.map((q) => {
        const err = showErrors ? errors[q.id] : undefined;
        if (q.kind === 'text')
          return (
            <ThemedField
              key={q.id}
              theme={theme}
              label={q.label}
              optional={!q.required}
              value={answers[q.id] ?? ''}
              error={err}
              onChange={(v) => onChange(q.id, v.slice(0, 300))}
            />
          );
        const options = q.kind === 'yesno' ? ['Yes', 'No'] : q.options;
        const errId = `iq-err-${q.id}`;
        return (
          <fieldset key={q.id} className="flex flex-col gap-2" aria-describedby={err ? errId : undefined} aria-invalid={err ? true : undefined}>
            <legend className="mb-1.5 text-[13px] font-medium">
              {q.label} {!q.required && <span style={{ ...muted, fontWeight: 400 }}>· optional</span>}
            </legend>
            <div className={q.kind === 'yesno' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}>
              {options.map((o) => {
                const on = answers[q.id] === o;
                return (
                  <label
                    key={o}
                    className="flex min-h-[44px] cursor-pointer items-center gap-3 px-3.5 text-[14.5px] focus-within:ring-2"
                    style={{ background: theme.background, color: theme.text, borderRadius: 10, border: `1.5px solid ${on ? theme.text : mix(theme.text, 18)}` }}
                  >
                    <input type="radio" name={`iq-${q.id}`} checked={on} onChange={() => onChange(q.id, o)} style={{ accentColor: theme.text }} />
                    {o}
                  </label>
                );
              })}
            </div>
            {err && (
              <p id={errId} className="text-[12.5px] font-semibold" role="alert">
                {err}
              </p>
            )}
          </fieldset>
        );
      })}
    </>
  );
}
