import React, { useId, useState } from 'react';
import { CheckIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { buttonStyle, cardStyle, fontsFor, inputStyle } from './pageStyle';
import { isValidEmail } from '../../utils/validation';
import { usePageOpsContext } from '../../contexts/PageOpsContext';

export function LeadFormBlock({ block, theme, mode }: BlockProps<'leadForm'>) {
  const { title, description, fields, submitLabel, consentText } = block.content;
  const uid = useId();
  const [values, setValues] = useState({ name: '', email: '', phone: '', message: '' });
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const { actions } = usePageOpsContext();
  const inert = mode === 'edit';

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inert) return;
    if (fields.email && !isValidEmail(values.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (fields.name && !values.name.trim()) {
      setError('Please tell us your name.');
      return;
    }
    if (fields.phone && !fields.email && !values.phone.trim()) {
      setError('Please add a phone number so we can reply.');
      return;
    }
    if (actions && !actions.submitLead(values, title || 'Form', optIn)) {
      setError('Something went wrong. Please try again.');
      return;
    }
    setError('');
    setSent(true);
  };

  const input = (key: keyof typeof values, label: string, type = 'text') =>
  <label className="flex flex-col gap-1.5" htmlFor={`${uid}-${key}`}>
      <span className="text-[12.5px] font-medium" style={{ color: theme.text }}>
        {label}
      </span>
      {key === 'message' ?
    <textarea
      id={`${uid}-${key}`}
      rows={3}
      readOnly={inert}
      tabIndex={inert ? -1 : undefined}
      value={values[key]}
      onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
      className="w-full resize-none px-3.5 py-2.5 text-[14.5px] outline-none focus:ring-2"
      style={inputStyle(theme)} /> :


    <input
      id={`${uid}-${key}`}
      type={type}
      readOnly={inert}
      tabIndex={inert ? -1 : undefined}
      value={values[key]}
      onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
      className="h-11 w-full px-3.5 text-[14.5px] outline-none focus:ring-2"
      style={inputStyle(theme)} />

    }
    </label>;


  return (
    <section className="flex flex-col gap-4 p-5" style={cardStyle(theme)}>
      <div>
        <h2 className="text-[20px] font-medium tracking-[-0.01em]" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
          {title || 'Form'}
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
            <CheckIcon size={17} aria-hidden /> Thanks — your message is in.
          </span>
          <span className="text-[12.5px]" style={{ color: theme.mutedText }}>
            {actions ? 'The owner will get back to you.' : 'Demo page: nothing was actually sent.'}
          </span>
        </div> :

      <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
          {fields.name && input('name', 'Name')}
          {fields.email && input('email', 'Email', 'email')}
          {fields.phone && input('phone', 'Phone', 'tel')}
          {fields.message && input('message', 'Message')}
          {!fields.name && !fields.email && !fields.phone && !fields.message &&
        <p className="text-[13px]" style={{ color: theme.mutedText }}>
              Turn on at least one field in the inspector.
            </p>
        }
          {error &&
        <p className="text-[13px] font-medium" role="alert" style={{ color: theme.text }}>
              {error}
            </p>
        }
          {consentText &&
        <p className="text-[12px] leading-snug" style={{ color: theme.mutedText }}>
              {consentText}
            </p>
        }
          <label className="flex items-start gap-2 text-[12.5px]" style={{ color: theme.mutedText }}>
            <input type="checkbox" checked={optIn} disabled={inert} tabIndex={inert ? -1 : undefined} onChange={(e) => setOptIn(e.target.checked)} className="mt-0.5" style={{ accentColor: theme.text }} />
            Also send me occasional updates (optional)
          </label>
          <button
          type="submit"
          tabIndex={inert ? -1 : undefined}
          className="mt-1 h-12 w-full text-[15px] font-semibold"
          style={buttonStyle(theme, 'featured')}>
          
            {submitLabel || 'Send'}
          </button>
        </form>
      }
    </section>);

}