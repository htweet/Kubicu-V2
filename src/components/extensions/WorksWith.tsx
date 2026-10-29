import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';
import type { ModuleConnection } from '../../types/marketplace';
import { coreModules } from '../../data/coreModules';

/** The core modules an extension genuinely connects to, each linking to that screen (D231). */
export function WorksWith({ connections, onNavigate }: {connections: ModuleConnection[];onNavigate?: () => void;}) {
  if (!connections.length) return null;
  return (
    <section aria-labelledby="ext-works-h">
      <h3 id="ext-works-h" className="text-label font-semibold text-fg">
        Works with
      </h3>
      <p className="mt-1 text-caption text-fg-subtle">Where it connects to the rest of KUBICU.</p>
      <ul className="mt-3 flex flex-col divide-y divide-line">
        {connections.map((c) => {
          const m = coreModules[c.module];
          return (
            <li key={c.module} className="flex items-start justify-between gap-4 py-2.5">
              <span className="min-w-0">
                <span className="block text-label font-medium text-fg">{m.label}</span>
                <span className="block text-caption text-fg-muted">{c.how}</span>
              </span>
              <Link
                to={m.href}
                onClick={onNavigate}
                className="inline-flex shrink-0 items-center gap-1 rounded-sm text-caption font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                
                Open
                <ArrowUpRightIcon size={13} aria-hidden />
                <span className="sr-only">{m.label}</span>
              </Link>
            </li>);

        })}
      </ul>
    </section>);

}

/** "Orders · Checkout · Audience" for list rows. */
export function worksWithLine(connections: ModuleConnection[] | undefined): string {
  return (connections ?? []).map((c) => coreModules[c.module].label).join(' · ');
}