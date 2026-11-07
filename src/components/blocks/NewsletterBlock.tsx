import React, { useId, useState } from 'react';
import { CheckIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { buttonStyle, cardStyle, fontsFor, inputStyle } from './pageStyle';
import { isValidEmail } from '../../utils/validation';
import { usePageOpsContext } from '../../contexts/PageOpsContext';
import { useT } from '../../contexts/LocaleContext';

export function NewsletterBlock({ block, theme, mode }: BlockProps<'newsletter'>) {
  const { title, description, buttonLabel, consentText } = block.content;
  const id = useId();
  // Fixed wording follows the visitor's language (D344); the seller's title, description and consent stay as written.
  const { t: tr } = useT();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const inert = mode === 'edit';
  const { actions } = usePageOpsContext();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inert) return;
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      window.setTimeout(() => document.getElementById(id)?.focus(), 0);
      return;
    }
    if (actions && !actions.subscribe({ email: email.trim() }, title || 'Newsletter')) {
      setError('Something went wrong. Please try again.');
      return;
    }
    setError('');
    setDone(true);
  };

  return (
    <section className="flex flex-col gap-3 p-5" style={cardStyle(theme)}>
      <div>
        <h2 className="text-[20px] font-medium tracking-[-0.01em]" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
          {title || tr('Newsletter')}
        </h2>
        {description && (
          <p className="mt-1 text-[14px]" style={{ color: theme.mutedText }}>
            {description}
          </p>
        )}
      </div>
      {done ? (
        <div role="status" className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-2 text-[15px] font-semibold" style={{ color: theme.text }}>
            <CheckIcon size={17} aria-hidden /> {tr('You’re on the list.')}
          </span>
          <span className="text-[12.5px]" style={{ color: theme.mutedText }}>
            {actions ? tr('You can unsubscribe any time.') : tr('Demo page: no email was stored.')}
          </span>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2.5">
          <label htmlFor={id} className="sr-only">
            {tr('Email address')}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id={id}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              readOnly={inert}
              tabIndex={inert ? -1 : undefined}
              value={email}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 min-w-0 flex-1 px-3.5 text-[14.5px] outline-none focus:ring-2"
              style={inputStyle(theme)}
            />
            <button
              type="submit"
              tabIndex={inert ? -1 : undefined}
              className="h-12 shrink-0 px-5 text-[15px] font-semibold"
              style={buttonStyle(theme, 'featured')}
            >
              {buttonLabel || tr('Subscribe')}
            </button>
          </div>
          {error && (
            <p id={`${id}-error`} role="alert" className="text-[13px] font-medium" style={{ color: theme.text }}>
              {tr(error)}
            </p>
          )}
          {consentText && (
            <p className="text-[12px] leading-snug" style={{ color: theme.mutedText }}>
              {consentText}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
