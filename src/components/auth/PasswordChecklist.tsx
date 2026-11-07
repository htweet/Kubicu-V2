import React from 'react';
import { CheckIcon } from 'lucide-react';
import { useT } from '../../contexts/LocaleContext';
import { cn } from '../../utils/cn';

/** Only the length rule is required; the other two make the password harder to guess and say so. */
export function passwordChecks(pw: string) {
  return [
    { id: 'len', label: 'At least 8 characters', met: pw.length >= 8, required: true },
    { id: 'num', label: 'A number or symbol', met: /[\d\W_]/.test(pw), required: false },
    { id: 'case', label: 'Upper and lower case letters', met: /[a-z]/.test(pw) && /[A-Z]/.test(pw), required: false },
  ];
}

/** Live strength bar with the rules spelled out — never only colour. */
export function PasswordChecklist({ password }: { password: string }) {
  const { t } = useT();
  const checks = passwordChecks(password);
  const score = checks.filter((c) => c.met).length;
  const word = !password ? '' : !checks[0].met ? t('Too short') : score === 3 ? t('Strong') : score === 2 ? t('Good') : t('Fair');
  const filled = !password ? 0 : checks[0].met ? score : 1;
  const tone = !checks[0].met ? 'bg-warning' : score === 3 ? 'bg-success' : score === 2 ? 'bg-action' : 'bg-warning';
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="grid flex-1 grid-cols-3 gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className={cn('h-1.5 rounded-full transition-colors duration-200 ease-out', i < filled ? tone : 'bg-line')} />
          ))}
        </div>
        {/* Only the strength word is announced, and only when it changes — not every rule on every keystroke (D430). */}
        <span aria-live="polite" className="w-16 text-right text-caption font-semibold text-fg-muted">{word}</span>
      </div>
      <ul className="flex flex-col gap-1">
        {checks.map((c) => (
          <li key={c.id} className={cn('flex items-center gap-2 text-caption', c.met ? 'text-fg' : 'text-fg-subtle')}>
            <span className={cn('flex h-4 w-4 items-center justify-center rounded-full border transition-colors duration-150', c.met ? 'border-success bg-success text-white' : 'border-line-strong')}>
              {c.met && <CheckIcon size={11} strokeWidth={3} aria-hidden />}
            </span>
            {t(c.label)}
            {!c.required && <span className="text-fg-subtle">· {t('recommended')}</span>}
            <span className="sr-only">{c.met ? t('done') : t('not yet')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
