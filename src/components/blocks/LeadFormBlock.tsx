import React, { useId, useState } from 'react';
import { CheckIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { buttonStyle, cardStyle, fontsFor, inputStyle } from './pageStyle';
import { isValidEmail } from '../../utils/validation';
import { usePageOpsContext } from '../../contexts/PageOpsContext';
import { useT } from '../../contexts/LocaleContext';

type Key = 'name' | 'email' | 'phone' | 'message';

const autoComplete: Record<Key, string> = { name: 'name', email: 'email', phone: 'tel', message: 'off' };

export function LeadFormBlock({ block, theme, mode }: BlockProps<'leadForm'>) {
  const { title, description, fields, submitLabel, consentText } = block.content;
  const uid = useId();
  // Fixed wording follows the visitor's language (D344); the seller's title, description and consent stay as written.
  const { t: tr } = useT();
  const [values, setValues] = useState({ name: '', email: '', phone: '', message: '' });
  const [error, setError] = useState<{field: Key | null;text: string;} | null>(null);
  const [sent, setSent] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const { actions } = usePageOpsContext();
  const inert = mode === 'edit';
  const errorId = `${uid}-error`;

  // Errors name the field, mark it invalid and move focus to it (WCAG 3.3.1, D76).
  const fail = (field: Key | null, text: string) => {
    setError({ field, text });
    if (field) window.setTimeout(() => document.getElementById(`${uid}-${field}`)?.focus(), 0);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inert) return;
    if (fields.name && !values.name.trim()) return fail('name', 'Please tell us your name.');
    if (fields.email && !isValidEmail(values.email)) return fail('email', 'Please enter a valid email address.');
    if (fields.phone && !fields.email && !values.phone.trim()) return fail('phone', 'Please add a phone number so we can reply.');
    if (actions && !actions.submitLead(values, title || 'Form', optIn)) return fail(null, 'Something went wrong. Please try again.');
    setError(null);
    setSent(true);
  };

  const input = (key: Key, label: string, type = 'text') => {
    const invalid = error?.field === key;
    const common = {
      id: `${uid}-${key}`,
      readOnly: inert,
      tabIndex: inert ? -1 : undefined,
      value: values[key],
      autoComplete: autoComplete[key],
      'aria-invalid': invalid || undefined,
      'aria-describedby': invalid ? errorId : undefined,
      style: inputStyle(theme)
    };
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${uid}-${key}`} className="text-[12.5px] font-medium" style={{ color: theme.text }}>
          {label}
        </label>
        {key === 'message' ?
        <textarea {...common} rows={3} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} className="w-full resize-none px-3.5 py-2.5 text-[14.5px] outline-none focus:ring-2" /> :

        <input {...common} type={type} inputMode={type === 'tel' ? 'tel' : type === 'email' ? 'email' : undefined} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} className="h-11 w-full px-3.5 text-[14.5px] outline-none focus:ring-2" />
        }
      </div>);

  };

  return (
    <section className="flex flex-col gap-4 p-5" style={cardStyle(theme)}>
      <div>
        <h2 className="text-[20px] font-medium tracking-[-0.01em]" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
          {title || tr('Form')}
        </h2>
        {description &&
        <p className="mt-1 text-[14px] leading-relaxed" style={{ color: theme.mutedText }}>
            {description}
          </p>
        }
      </div>
      {sent ?
      <div className="flex flex-col items-start gap-1 py-2" role="status">
          <span className="inline-flex items-center gap-2 text-[15px] font-semibold" style={{ color: theme.text }}>
            <CheckIcon size={17} aria-hidden /> {tr('Thanks — your message is in.')}
          </span>
          <span className="text-[12.5px]" style={{ color: theme.mutedText }}>
            {actions ? tr('The owner will get back to you.') : tr('Demo page: nothing was actually sent.')}
          </span>
        </div> :

      <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
          {fields.name && input('name', tr('Name'))}
          {fields.email && input('email', tr('Email'), 'email')}
          {fields.phone && input('phone', tr('Phone'), 'tel')}
          {fields.message && input('message', tr('Message'))}
          {!fields.name && !fields.email && !fields.phone && !fields.message &&
        <p className="text-[13px]" style={{ color: theme.mutedText }}>
              {tr('Turn on at least one field in the inspector.')}
            </p>
        }
          {error &&
        <p id={errorId} className="text-[13px] font-medium" role="alert" style={{ color: theme.text }}>
              {tr(error.text)}
            </p>
        }
          {consentText &&
        <p className="text-[12px] leading-snug" style={{ color: theme.mutedText }}>
              {consentText}
            </p>
        }
          <label className="flex min-h-[24px] items-start gap-2 text-[12.5px]" style={{ color: theme.mutedText }}>
            <input type="checkbox" checked={optIn} disabled={inert} tabIndex={inert ? -1 : undefined} onChange={(e) => setOptIn(e.target.checked)} className="mt-0.5 h-4 w-4" style={{ accentColor: theme.text }} />
            {tr('Also send me occasional updates (optional)')}
          </label>
          <button type="submit" tabIndex={inert ? -1 : undefined} className="mt-1 h-12 w-full text-[15px] font-semibold" style={buttonStyle(theme, 'featured')}>
            {submitLabel || tr('Send')}
          </button>
        </form>
      }
    </section>);

}