import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, PauseCircleIcon } from 'lucide-react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { extensionById } from '../../data/extensions';
import { PageHeader } from '../shell/PageHeader';
import { ExtensionIcon } from './ExtensionIcon';

/** Shown when someone opens an app's screen (by link or bookmark) that isn't installed or is paused (D87). */
export function AppGate({ appId }: {appId: string;}) {
  const market = useMarketplace();
  const info = extensionById[appId];
  if (!info) return null;
  const paused = !!market.data.installed[appId]?.paused;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-5 py-8 md:px-10 md:py-12">
      <PageHeader title={info.name} description={info.summary} />
      <section className="grid gap-8 rounded-lg border border-line bg-raised p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:p-8">
        <div className="flex flex-col items-start gap-4">
          {paused ?
          <span className="grid h-14 w-14 place-items-center rounded-md bg-warning-soft text-warning">
              <PauseCircleIcon size={26} aria-hidden />
            </span> :

          <ExtensionIcon ext={info} size="lg" />
          }
          <div>
            <h2 className="text-heading font-semibold text-fg">{paused ? `${info.name} is paused` : `${info.name} isn’t installed`}</h2>
            <p className="mt-1.5 max-w-md text-body text-fg-muted">
              {paused ?
              'Everything you set up is safe. Resume it in Extensions to bring the screen back.' :
              'It’s a free KUBICU app. Install it from Extensions and it appears in your sidebar — remove it whenever you like.'}
            </p>
          </div>
          <Link
            to={`/app/extensions?ext=${appId}`}
            className="inline-flex h-10 items-center rounded-md bg-action px-4 text-label font-semibold text-action-fg transition-colors duration-150 hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
            {paused ? 'Open in Extensions' : `Get ${info.name}`}
          </Link>
          <p className="text-caption text-fg-subtle">{info.uninstallNote}</p>
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