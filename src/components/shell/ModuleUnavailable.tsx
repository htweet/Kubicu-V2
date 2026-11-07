import React from 'react';
import { Link } from 'react-router-dom';
import { CloudOffIcon } from 'lucide-react';
import { useT } from '../../contexts/LocaleContext';
import { PageHeader } from './PageHeader';

/**
 * A workspace screen KUBICU has switched off for now (D464). The page stays reachable and named so owners know
 * it exists; nothing they saved is lost.
 */
export function ModuleUnavailable({ name, description }: { name: string; description?: string }) {
  const { t: tr } = useT();
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-5 py-8 md:px-10 md:py-12">
      <PageHeader title={tr(name)} description={description ? tr(description) : undefined} />
      <section className="flex flex-col items-start gap-4 rounded-lg border border-line bg-raised p-6 md:p-8">
        <span className="grid h-14 w-14 place-items-center rounded-md bg-sunken text-fg-muted">
          <CloudOffIcon size={26} aria-hidden />
        </span>
        <div>
          <h2 className="text-heading font-semibold text-fg">{tr('Currently not available')}</h2>
          <p className="mt-1.5 max-w-lg text-body text-fg-muted">{tr('KUBICU has paused {name} for now. Everything you set up is kept, and it comes back here as soon as it’s available again.', { name: tr(name) })}</p>
        </div>
        <Link
          to="/app"
          className="inline-flex h-10 items-center rounded-md border border-line bg-canvas px-4 text-label font-semibold text-fg transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {tr('Back to Overview')}
        </Link>
      </section>
    </div>
  );
}
