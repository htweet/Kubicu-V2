import React, { useState } from 'react';
import { toast } from 'sonner';
import type { CountryCode } from '../../types/country';
import { countries } from '../../data/countries';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useT } from '../../contexts/LocaleContext';
import { audit, useAdminStore } from '../../utils/admin/store';
import { countryOpen, formatOpeningDay, LAUNCH_COUNTRY } from '../../utils/admin/countryRollout';
import { workspaceCountry } from '../../utils/country';
import { formatRelative } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { ReasonDialog } from './ReasonDialog';

type Action = 'open' | 'close' | 'date';

/** Confirm-box copy per action. `title` is a phrase with {country}. */
const dialog: Record<Action, {title: string;description: string;label: string;}> = {
  open: { title: 'Open {country}', description: 'People can sign up from this country straight away, and its workspaces open again for their teams.', label: 'Open country' },
  close: { title: 'Close {country}', description: 'Sign-up turns this country away and its workspaces close to their teams until you open it. Published pages stay live for buyers; nothing is deleted.', label: 'Close country' },
  date: { title: 'Planned opening for {country}', description: 'Shown to people turned away at sign-up and to closed workspaces. It doesn’t open the country by itself.', label: 'Save date' }
};

/**
 * Super admin → Feature flags → Countries (D494). Roll KUBICU out one country at a time, starting from Nigeria.
 * Closed: sign-up turns the country away, its workspaces can't be opened by their teams, and Settings can't switch to it.
 * Published pages stay live for buyers and nothing is deleted. Follows the staff console language (D501); audit stays English.
 */
export function CountryRolloutSection() {
  const { t: tr } = useT();
  const [store, setStore] = useAdminStore();
  const { workspaces } = useWorkspace();
  const [pending, setPending] = useState<{code: CountryCode;action: Action;} | null>(null);
  const [opensOn, setOpensOn] = useState('');

  const englishName = (code: CountryCode) => countries.find((c) => c.code === code)?.name ?? code;
  const name = (code: CountryCode) => tr(englishName(code));
  const inCountry = (code: CountryCode) => workspaces.filter((w) => workspaceCountry(w) === code).length;

  const start = (code: CountryCode, action: Action) => {
    setOpensOn(action === 'open' ? '' : store.countries?.[code]?.opensOn ?? '');
    setPending({ code, action });
  };

  const confirm = (reason: string) => {
    if (!pending) return;
    const { code, action } = pending;
    const now = new Date().toISOString();
    const open = action === 'open' ? true : action === 'close' ? false : countryOpen(store, code);
    const date = action === 'open' ? undefined : opensOn || undefined;
    const label = action === 'open' ? 'Opened country' : action === 'close' ? `Closed country${date ? ` — planned opening ${date}` : ''}` : date ? `Set planned opening to ${date}` : 'Cleared planned opening';
    setStore((s) => audit({ ...s, countries: { ...s.countries, [code]: { open, opensOn: date, updatedAt: now } } }, { area: 'flags', action: label, target: englishName(code), reason }));
    toast.success(action === 'open' ? tr('{country} is open', { country: name(code) }) : action === 'close' ? tr('{country} is closed', { country: name(code) }) : tr('Planned opening saved'), {
      description:
      action === 'open' ?
      tr('People can sign up from there, and its workspaces open again.') :
      action === 'close' ?
      tr('New sign-ups are turned away and its workspaces are closed to their teams. Published pages stay live.') :
      undefined
    });
    setPending(null);
  };

  const copy = pending ? dialog[pending.action] : null;
  const affected = pending ? inCountry(pending.code) : 0;

  return (
    <section aria-labelledby="country-rollout" className="mt-12">
      <h2 id="country-rollout" className="text-heading font-semibold text-fg">
        {tr('Countries')}
      </h2>
      <p className="mt-1 max-w-2xl text-label text-fg-muted">
        {tr('Open KUBICU one country at a time, starting from Nigeria. While a country is closed, sign-up turns it away, its workspaces can’t be opened by their teams and owners can’t switch to it in Settings. Buyers still reach published pages, and nothing is deleted.')}
      </p>

      <ul className="mt-5 divide-y divide-line border-y border-line">
        {countries.map((c) => {
          const launch = c.code === LAUNCH_COUNTRY;
          const open = countryOpen(store, c.code);
          const row = store.countries?.[c.code];
          const n = inCountry(c.code);
          return (
            <li key={c.code} className="flex flex-wrap items-center gap-3 py-3">
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-label font-semibold text-fg">{tr(c.name)}</span>
                  <Badge tone={open ? 'success' : 'danger'} dot>
                    {open ? tr('Open') : tr('Closed')}
                  </Badge>
                </span>
                <span className="mt-0.5 block text-caption text-fg-subtle">
                  {[
                  launch ? tr('Launch market — always open') : null,
                  tr('Workspaces on this device: {n}', { n }),
                  !open && row?.opensOn ? tr('Planned opening {date}', { date: formatOpeningDay(row.opensOn) }) : null,
                  row?.updatedAt ? tr('changed {when}', { when: formatRelative(row.updatedAt) }) : null].

                  filter(Boolean).
                  join(' · ')}
                </span>
              </span>
              {!launch &&
              <span className="flex flex-wrap gap-2">
                  {!open &&
                <Button size="sm" variant="tertiary" onClick={() => start(c.code, 'date')}>
                      {tr('Planned opening…')}
                    </Button>
                }
                  <Button size="sm" variant={open ? 'secondary' : 'primary'} onClick={() => start(c.code, open ? 'close' : 'open')}>
                    {open ? tr('Close…') : tr('Open…')}
                  </Button>
                </span>
              }
            </li>);

        })}
      </ul>

      <ReasonDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={confirm}
        destructive={pending?.action === 'close'}
        title={pending && copy ? tr(copy.title, { country: name(pending.code) }) : ''}
        description={copy ? pending?.action === 'close' && affected > 0 ? `${tr(copy.description)} ${tr('Workspaces affected on this device: {n}.', { n: affected })}` : tr(copy.description) : ''}
        confirmLabel={copy ? tr(copy.label) : tr('Apply change')}>
        
        {pending && pending.action !== 'open' &&
        <TextInput id="country-opens-on" label={tr('Planned opening (optional)')} type="date" value={opensOn} onChange={(e) => setOpensOn(e.target.value)} hint={tr('Leave empty if there’s no date yet.')} />
        }
      </ReasonDialog>
    </section>);

}