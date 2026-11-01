import React from 'react';
import { Link } from 'react-router-dom';
import { GlobeIcon } from 'lucide-react';
import type { Workspace } from '../../types/workspace';
import { useT } from '../../contexts/LocaleContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { countryInfo, workspaceCountry } from '../../utils/country';
import { formatOpeningDay, useCountryRollout } from '../../utils/admin/countryRollout';
import { KubicuLogo } from './KubicuLogo';

/**
 * Shown instead of a workspace whose country KUBICU hasn't opened yet (D494). Nothing is deleted and the published
 * page stays live for buyers; the team gets back in as soon as staff open the country. Other workspaces stay a click away.
 */
export function CountryNotOpen({ workspace }: {workspace: Workspace;}) {
  const { t: tr } = useT();
  const { workspaces, switchTo } = useWorkspace();
  const rollout = useCountryRollout();
  const code = workspaceCountry(workspace);
  const country = tr(countryInfo(code).name);
  const opensOn = rollout.opensOn(code);
  const elsewhere = workspaces.filter((w) => w.id !== workspace.id && rollout.open(workspaceCountry(w)));

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-canvas px-5 py-12 text-fg">
      <div className="w-full max-w-md">
        <KubicuLogo withWordmark />
        <span className="mt-10 flex h-11 w-11 items-center justify-center rounded-full bg-sunken text-fg-muted">
          <GlobeIcon size={20} aria-hidden />
        </span>
        <h1 className="mt-4 text-title font-semibold">{tr('KUBICU isn’t open in {country} yet', { country })}</h1>
        <p className="mt-2 text-body text-fg-muted">
          {tr('{workspace} sells from {country}. We’re opening one country at a time, so this workspace is closed for now. Your published page stays live and nothing is deleted.', { workspace: workspace.name, country })}
        </p>
        {opensOn && <p className="mt-3 text-body font-medium text-fg">{tr('We plan to open there on {date}.', { date: formatOpeningDay(opensOn) })}</p>}

        {elsewhere.length > 0 &&
        <div className="mt-8">
            <h2 className="text-label font-semibold text-fg">{tr('Your other workspaces')}</h2>
            <ul className="mt-2 divide-y divide-line border-y border-line">
              {elsewhere.map((w) =>
            <li key={w.id}>
                  <button
                type="button"
                onClick={() => switchTo(w.id)}
                className="flex min-h-[48px] w-full items-center justify-between gap-3 py-2 text-left text-label transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                
                    <span className="min-w-0 truncate font-medium text-fg">{w.name}</span>
                    <span className="shrink-0 text-caption text-fg-subtle">{tr(countryInfo(workspaceCountry(w)).name)}</span>
                  </button>
                </li>
            )}
            </ul>
          </div>
        }

        <Link to="/contact" className="mt-6 inline-flex h-10 items-center rounded-md border border-line bg-raised px-4 text-label font-semibold text-fg transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {tr('Contact support')}
        </Link>
      </div>
    </main>);

}