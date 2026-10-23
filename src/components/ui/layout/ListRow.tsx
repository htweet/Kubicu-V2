import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ListRowProps {
  /** Fixed-width lead: an avatar, thumbnail, icon or #number. */
  leading?: React.ReactNode;
  title: React.ReactNode;
  /** One line under the title; truncates. */
  meta?: React.ReactNode;
  /** Right-aligned status, amount or action. Amounts should use tabular-nums. */
  trailing?: React.ReactNode;
  to?: string;
  onClick?: () => void;
  /** Show a chevron on navigable rows that have no trailing content. */
  chevron?: boolean;
  /** Matches the inset of the Card it sits in. Use `none` inside a padded Card. */
  inset?: 'card' | 'none';
  className?: string;
}

const rowBase = 'flex min-h-[56px] w-full items-center gap-3 py-3 text-left';
const interactive = 'transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus';

/** One row of a list: lead, title + meta, trailing — always on the same baselines (D75). */
export function ListRow({ leading, title, meta, trailing, to, onClick, chevron, inset = 'card', className }: ListRowProps) {
  const pad = inset === 'card' ? 'px-5 md:px-6' : 'px-0';
  const inner =
  <>
      {leading && <span className="flex shrink-0 items-center">{leading}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-label font-semibold text-fg">{title}</span>
        {meta && <span className="mt-0.5 block truncate text-caption text-fg-subtle">{meta}</span>}
      </span>
      {trailing && <span className="flex shrink-0 items-center gap-3 text-right">{trailing}</span>}
      {chevron && (to || onClick) && <ChevronRightIcon size={16} className="shrink-0 text-fg-subtle" aria-hidden />}
    </>;

  if (to)
  return (
    <li>
        <Link to={to} className={cn(rowBase, pad, interactive, inset === 'none' && '-mx-2 rounded-md px-2', className)}>
          {inner}
        </Link>
      </li>);

  if (onClick)
  return (
    <li>
        <button type="button" onClick={onClick} className={cn(rowBase, pad, interactive, inset === 'none' && '-mx-2 rounded-md px-2', className)}>
          {inner}
        </button>
      </li>);

  return <li className={cn(rowBase, pad, className)}>{inner}</li>;
}

/** Hairline-divided list for ListRow children. */
export function List({ label, className, children }: {label?: string;className?: string;children: React.ReactNode;}) {
  return (
    <ul aria-label={label} className={cn('flex flex-col divide-y divide-line', className)}>
      {children}
    </ul>);

}