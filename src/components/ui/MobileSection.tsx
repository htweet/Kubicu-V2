import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

interface MobileSectionProps {
  id: string;
  title: string;
  /** Short status shown while collapsed, e.g. “3 photos”. */
  summary?: string;
  open: boolean;
  onToggle: () => void;
  /** Marks the header when the section holds a problem. */
  invalid?: boolean;
  children: React.ReactNode;
}

/**
 * Long editors on phones: one section open at a time, each with a summary while closed (D49).
 * On wider screens the content simply renders in place.
 */
export function MobileSection({ id, title, summary, open, onToggle, invalid, children }: MobileSectionProps) {
  const wide = useMediaQuery('(min-width: 768px)');
  const { t } = useT();
  title = t(title);
  if (wide) return <div className="flex flex-col gap-6">{children}</div>;
  return (
    <section className="-mx-5 border-b border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-body`}
          onClick={onToggle}
          className="flex min-h-[56px] w-full items-center gap-3 px-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
        >
          <span className="min-w-0 flex-1">
            <span className={cn('block text-label font-semibold', invalid ? 'text-danger' : 'text-fg')}>{title}</span>
            {!open && summary && <span className="block truncate text-caption text-fg-subtle">{summary}</span>}
          </span>
          <ChevronDownIcon size={18} aria-hidden className={cn('shrink-0 text-fg-subtle transition-transform duration-200 ease-out', open && 'rotate-180')} />
        </button>
      </h3>
      {open && (
        <div id={`${id}-body`} className="flex flex-col gap-6 px-5 pb-6 pt-1">
          {children}
        </div>
      )}
    </section>
  );
}
