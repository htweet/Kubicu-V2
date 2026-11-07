import React, { useId } from 'react';
import { cn } from '../../utils/cn';

interface RangeInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** How the current value is shown, e.g. 1.2 → "120%". */
  format?: (value: number) => string;
  disabled?: boolean;
  className?: string;
}

/**
 * Labelled slider with its value shown beside the label. Arrow keys, Page Up/Down, Home and End work natively.
 * The track and thumb use the app's border and action tokens so they read on every appearance, light or dark.
 */
export function RangeInput({ label, value, min, max, step = 0.05, onChange, format = (v) => `${Math.round(v * 100)}%`, disabled, className }: RangeInputProps) {
  const id = useId();
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const sel = `#${CSS.escape(id)}`;
  const thumb = 'width:18px;height:18px;border-radius:999px;background:rgb(var(--action));border:3px solid rgb(var(--raised));box-shadow:0 0 0 1px rgb(var(--action)),0 1px 3px rgb(0 0 0 / 0.35);cursor:pointer;';
  const css = [
    `${sel}{-webkit-appearance:none;appearance:none;background:transparent;}`,
    `${sel}::-webkit-slider-runnable-track{height:6px;border-radius:999px;background:linear-gradient(to right, rgb(var(--action)) 0 ${pct}%, rgb(var(--border-strong)) ${pct}% 100%);}`,
    `${sel}::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;margin-top:-6px;${thumb}}`,
    `${sel}::-moz-range-track{height:6px;border-radius:999px;background:rgb(var(--border-strong));}`,
    `${sel}::-moz-range-progress{height:6px;border-radius:999px;background:rgb(var(--action));}`,
    `${sel}::-moz-range-thumb{${thumb}box-sizing:border-box;}`,
    `${sel}:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 1px rgb(var(--action)),0 0 0 4px rgb(var(--focus) / 0.45);}`,
    `${sel}:focus-visible::-moz-range-thumb{box-shadow:0 0 0 1px rgb(var(--action)),0 0 0 4px rgb(var(--focus) / 0.45);}`,
  ].join('');
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-label font-medium text-fg">
          {label}
        </label>
        <span className="text-caption font-medium tabular-nums text-fg-muted" aria-hidden>
          {format(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={format(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-6 w-full cursor-pointer focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
      <style>{css}</style>
    </div>
  );
}
