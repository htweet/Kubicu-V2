import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, ClipboardListIcon, PauseCircleIcon } from 'lucide-react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { extensionById } from '../../data/extensions';
import { formatNaira as formatNgn } from '../../utils/format';
import { FORMS_EXTENSION_ID } from '../../utils/forms/storage';
import { PageHeader } from '../shell/PageHeader';
import { Button } from '../ui/Button';

/** Shown on the Forms screens until the paid add-on is installed (or while it's paused) (D79). */
export function FormsGate({ children }: {children: React.ReactNode;}) {
  const market = useMarketplace();
  if (market.isActive(FORMS_EXTENSION_ID)) return <>{children}</>;
  const info = extensionById[FORMS_EXTENSION_ID];
  const paused = !!market.data.installed[FORMS_EXTENSION_ID]?.paused;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Forms" description="Quotes, RSVPs, order intake, applications — any form, with steps, rules and payments." />
      <section className="grid gap-8 rounded-lg border border-line bg-raised p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:p-8">
        <div className="flex flex-col items-start gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-action-soft text-action">
            {paused ? <PauseCircleIcon size={22} aria-hidden /> : <ClipboardListIcon size={22} aria-hidden />}
          </span>
          <div>
            <h2 className="text-heading font-semibold text-fg">{paused ? 'The Forms add-on is paused' : 'Forms is a paid add-on'}</h2>
            <p className="mt-1.5 max-w-md text-body text-fg-muted">
              {paused ?
              'Your forms and responses are safe. Form blocks on your pages aren’t accepting responses until you resume it in Extensions.' :
              `${formatNgn(info.priceNgn)} a month, on Creator and above. Install it from Extensions — you’ll see exactly what it can access first.`}
            </p>
          </div>
          <Link to={`/app/extensions?ext=${FORMS_EXTENSION_ID}`}>
            <Button>{paused ? 'Open in Extensions' : 'View the Forms add-on'}</Button>
          </Link>
          <p className="text-caption text-fg-subtle">The free Lead form and Newsletter blocks keep working without it.</p>
        </div>
        <ul className="flex flex-col gap-3 border-t border-line pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          {info.adds.map((a) =>
          <li key={a} className="flex items-start gap-2.5 text-label text-fg">
              <CheckIcon size={16} className="mt-0.5 shrink-0 text-success" aria-hidden />
              {a}
            </li>
          )}
        </ul>
      </section>
    </div>);

}