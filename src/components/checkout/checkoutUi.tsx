import React, { useId } from 'react';
import type { PageTheme } from '../../types/page';
import { buttonStyle, fontsFor, inputStyle, mix } from '../blocks/pageStyle';

/** Small theme-styled pieces shared by checkout, order and download screens. */

export function CheckoutHeading({ theme, children, sub }: {theme: PageTheme;children: React.ReactNode;sub?: React.ReactNode;}) {
  return (
    <div className="pr-12">
      <h2 className="text-[22px] font-medium leading-tight tracking-[-0.01em]" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>
        {children}
      </h2>
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
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium" style={{ color: theme.text }}>
        {label}
        {optional && <span style={{ color: theme.mutedText, fontWeight: 400 }}> · optional</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
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
  return (
    <button type="button" onClick={onClick} className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold" style={buttonStyle(theme, 'default')}>
      {children}
    </button>);

}

export function TestModeNote({ theme }: {theme: PageTheme;}) {
  return (
    <p className="rounded-md px-3 py-2 text-[12.5px] font-medium" style={{ background: mix('#d9a400', 16, theme.background), color: theme.text }} role="note">
      Test mode — this is a KUBICU prototype. No real money moves.
    </p>);

}

export function StepDots({ theme, step, total }: {theme: PageTheme;step: number;total: number;}) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-label="Checkout progress" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step}>
      {Array.from({ length: total }).map((_, i) =>
      <span key={i} aria-hidden className="h-1 flex-1 rounded-full" style={{ background: i < step ? theme.text : mix(theme.text, 14) }} />
      )}
    </div>);

}