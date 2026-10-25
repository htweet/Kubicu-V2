import React, { useEffect, useId, useRef } from 'react';
import type { PageTheme } from '../../types/page';
import { buttonStyle, fontsFor, inputStyle, mix } from '../blocks/pageStyle';
import { useT } from '../../contexts/LocaleContext';
import { readAdminStore } from '../../utils/admin/store';
import { recentBuyerUpdates } from '../../utils/policyAgreements';

/** Plain-text children follow the visitor's language (D133); anything richer is left as written. */
const useTx = () => {
  const { t } = useT();
  return (node: React.ReactNode) => typeof node === 'string' ? t(node) : node;
};

/** Small theme-styled pieces shared by checkout, order and download screens. */

/**
 * Step heading. Inside sheets (level 2) it takes focus when a new step appears, so screen-reader
 * and keyboard users land at the top of each step (WCAG 2.4.3, D76). Standalone pages use level 1.
 */
export function CheckoutHeading({ theme, children, sub, level = 2 }: {theme: PageTheme;children: React.ReactNode;sub?: React.ReactNode;level?: 1 | 2;}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const tx = useTx();
  children = tx(children);
  sub = tx(sub);
  const text = typeof children === 'string' ? children : ref.current?.textContent ?? '';
  useEffect(() => {
    if (level !== 2) return;
    const t = window.setTimeout(() => ref.current?.focus({ preventScroll: true }), 50);
    return () => window.clearTimeout(t);
  }, [level, text]);
  const Tag = level === 1 ? 'h1' : 'h2';
  return (
    <div className="pr-12">
      <Tag ref={ref} tabIndex={-1} className="text-[22px] font-medium leading-tight tracking-[-0.01em] focus:outline-none" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
        {children}
      </Tag>
      {sub &&
      <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: theme.mutedText }}>
          {sub}
        </p>
      }
    </div>);

}

export function ThemedField({
  theme,
  label,
  value,
  onChange,
  type = 'text',
  error,
  placeholder,
  autoComplete,
  inputMode,
  optional











}: {theme: PageTheme;label: string;value: string;onChange: (v: string) => void;type?: string;error?: string;placeholder?: string;autoComplete?: string;inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];optional?: boolean;}) {
  const id = useId();
  const { t } = useT();
  label = t(label);
  if (error) error = t(error);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium" style={{ color: theme.text }}>
        {label}
        {optional && <span style={{ color: theme.mutedText, fontWeight: 400 }}> · {t('optional')}</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-required={optional ? undefined : true}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full px-3.5 text-[15px] outline-none focus:ring-2"
        style={{ ...inputStyle(theme), borderColor: error ? '#c0392b' : undefined }} />
      
      {error &&
      <p id={`${id}-err`} className="text-[12.5px] font-medium" style={{ color: theme.text }}>
          {error}
        </p>
      }
    </div>);

}

export function PrimaryButton({ theme, children, onClick, disabled, type = 'button' }: {theme: PageTheme;children: React.ReactNode;onClick?: () => void;disabled?: boolean;type?: 'button' | 'submit';}) {
  children = useTx()(children);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-50"
      style={buttonStyle(theme, 'featured')}>
      
      {children}
    </button>);

}

export function SecondaryButton({ theme, children, onClick }: {theme: PageTheme;children: React.ReactNode;onClick: () => void;}) {
  children = useTx()(children);
  return (
    <button type="button" onClick={onClick} className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold" style={buttonStyle(theme, 'default')}>
      {children}
    </button>);

}

/**
 * Pins a sheet's main actions to the bottom edge while the content above scrolls.
 * Must be the last child of a step inside PageOverlay (whose content wrapper uses px-5).
 */
export function SheetActions({ theme, children }: {theme: PageTheme;children: React.ReactNode;}) {
  return (
    <div
      className="sticky bottom-0 z-[1] -mx-5 mt-auto flex flex-col gap-2 px-5 pt-3"
      style={{
        background: theme.background,
        borderTop: `1px solid ${mix(theme.text, 10)}`,
        paddingBottom: 'max(20px, env(safe-area-inset-bottom))'
      }}>
      
      {children}
    </div>);

}

export function TestModeNote({ theme }: {theme: PageTheme;}) {
  const { t } = useT();
  return (
    <p className="rounded-md px-3 py-2 text-[12.5px] font-medium" style={{ background: mix('#d9a400', 16, theme.background), color: theme.text }} role="note">
      {t('Test mode — this is a KUBICU prototype. No real money moves.')}
    </p>);

}

/** Shown for 30 days after KUBICU publishes a new Terms, Privacy or Refunds version (D141). */
export function TermsUpdatedNote({ theme }: {theme: PageTheme;}) {
  const { t } = useT();
  const updates = recentBuyerUpdates(readAdminStore().policyReleases);
  if (updates.length === 0) return null;
  return (
    <p className="text-[12.5px] leading-snug" style={{ color: mix(theme.text, 72, theme.background) }} role="note">
      {t('Updated recently:')}{' '}
      {updates.map((u, i) =>
      <React.Fragment key={u.doc.slug}>
          {i > 0 && ', '}
          <a href={`/about/${u.doc.slug}`} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2">
            {u.doc.title} v{u.release.version}
          </a>
        </React.Fragment>
      )}
      . {t('By continuing you agree to the current versions.')}
    </p>);

}

export function StepDots({ theme, step, total }: {theme: PageTheme;step: number;total: number;}) {
  const { t } = useT();
  return (
    <div className="flex gap-1.5" role="progressbar" aria-label={t('Checkout progress')} aria-valuemin={1} aria-valuemax={total} aria-valuenow={step}>
      {Array.from({ length: total }).map((_, i) =>
      <span key={i} aria-hidden className="h-1 flex-1 rounded-full" style={{ background: i < step ? theme.text : mix(theme.text, 14) }} />
      )}
    </div>);

}