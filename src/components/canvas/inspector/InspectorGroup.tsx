import React, { useId } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { useLocalStore } from '../../../hooks/useLocalStore';
import { cn } from '../../../utils/cn';

interface InspectorGroupProps {
  /** Stable key, e.g. "style.layout" — remembers open/closed for every block on this device. */
  storeKey: string;
  title: string;
  /** One line shown when closed, so set values are never hidden. */
  summary?: string;
  /** Shown beside the title (e.g. a status badge). */
  trailing?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const emptyGroups = () => ({ open: {} as Record<string, boolean> });

/** A collapsible group of block settings (D177). Separated by hairlines, not boxes. */
export function InspectorGroup({ storeKey, title, summary, trailing, defaultOpen = true, children }: InspectorGroupProps) {
  const { data, update } = useLocalStore('kubicu:inspector-groups', emptyGroups);
  const open = data.open[storeKey] ?? defaultOpen;
  const bodyId = useId();

  return (
    <section className="border-t border-line first:border-t-0">
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => update((d) => ({ open: { ...d.open, [storeKey]: !open } }))}
          className="group flex min-h-[44px] w-full items-center gap-2 rounded-sm py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          
          <span className="min-w-0 flex-1">
            <span className="block text-label font-semibold text-fg">{title}</span>
            {!open && summary && <span className="block truncate text-caption font-normal text-fg-subtle">{summary}</span>}
          </span>
          {trailing}
          <ChevronDownIcon
            size={16}
            aria-hidden
            className={cn('shrink-0 text-fg-subtle transition-transform duration-150 ease-out group-hover:text-fg', open && 'rotate-180')} />
          
        </button>
      </h3>
      <div id={bodyId} hidden={!open} className="flex flex-col gap-5 pb-5 pt-1">
        {children}
      </div>
    </section>);

}