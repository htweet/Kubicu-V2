import React, { useRef } from "react";
import { cn } from "../../utils/cn";
import { BoxIcon } from "lucide-react";
import { useT } from "../../contexts/LocaleContext";
export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: BoxIcon;
  iconOnly?: boolean;
}
interface SegmentedProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  size = 'md',
  fullWidth
}: SegmentedProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const { t } = useT();
  options = options.map((o) => ({ ...o, label: t(o.label) }));
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  return <div role="radiogroup" aria-label={ariaLabel} className={cn('inline-flex shrink-0 gap-0.5 rounded-md border border-line bg-canvas p-0.5', fullWidth && 'flex w-full')}>
      {options.map((option, i) => {
      const selected = option.value === value;
      const Icon = option.icon;
      return <button key={option.value} ref={(el) => refs.current[i] = el} type="button" role="radio" aria-checked={selected} aria-label={option.iconOnly ? option.label : undefined} title={option.iconOnly ? option.label : undefined} tabIndex={selected ? 0 : -1} onKeyDown={(e) => onKeyDown(e, i)} onClick={() => onChange(option.value)} className={cn('inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm border font-medium', 'transition-[background-color,color,border-color,box-shadow] duration-150 ease-out', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', size === 'sm' ? 'h-7 px-2.5 text-caption' : 'h-8 px-3 text-label', option.iconOnly && (size === 'sm' ? 'w-7 px-0' : 'w-8 px-0'), fullWidth && 'flex-1', selected ? 'border-line-strong bg-raised text-fg shadow-1' : 'border-transparent text-fg-muted hover:bg-sunken hover:text-fg')}>
            {Icon && <Icon size={size === 'sm' ? 13 : 15} aria-hidden />}
            {!option.iconOnly && option.label}
          </button>;
    })}
    </div>;
}