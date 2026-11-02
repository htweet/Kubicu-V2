import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { workspaceNav } from '../../data/navigation';
import { extensions } from '../../data/extensions';
import { useT } from '../../contexts/LocaleContext';
import { audit, useAdminStore } from '../../utils/admin/store';
import { ALWAYS_ON_NAV, extKey, moduleOn, navKey } from '../../utils/admin/moduleFlags';
import { formatRelative } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { Segmented } from '../ui/Segmented';
import { ReasonDialog } from './ReasonDialog';

interface Row {
  key: string;
  /** English name — used for the audit log and for search. */
  name: string;
  /** Name in the staff console language. */
  label: string;
  detail: string;
  kind: 'module' | 'addon';
}

type Show = 'all' | 'off';

/**
 * Super admin → Feature flags → Modules and add-ons (D464): one switch per workspace module and Marketplace add-on.
 * Off keeps it visible to owners as "Currently not available"; add-ons can't be installed and their effects stop.
 * Follows the staff console language (D501). Add-on names and publishers stay as listed; audit stays English.
 */
export function ModuleFlagsSection() {
  const { t: tr } = useT();
  const [store, setStore] = useAdminStore();
  // Staff console search links here with ?q= (D472).
  const [params] = useSearchParams();
  const [q, setQ] = useState(() => params.get('q') ?? '');
  useEffect(() => {
    const v = params.get('q');
    if (v !== null) setQ(v);
  }, [params]);
  const [show, setShow] = useState<Show>('all');
  const [pending, setPending] = useState<{row: Row;on: boolean;} | null>(null);

  const rows = useMemo<Row[]>(
    () => [
    ...workspaceNav.
    filter((n) => !ALWAYS_ON_NAV.includes(n.id)).
    map((n): Row => {
      const addon = n.appId ? extensions.find((e) => e.id === n.appId)?.name ?? n.appId : null;
      return {
        key: navKey(n.id),
        name: n.label,
        label: tr(n.label),
        detail: addon ? `${tr('Workspace screen')} · ${n.to} · ${tr('needs the {addon} add-on', { addon })}` : `${tr('Workspace screen')} · ${n.to}`,
        kind: 'module'
      };
    }),
    ...extensions.filter((e) => !e.retired).map((e): Row => ({ key: extKey(e.id), name: e.name, label: e.name, detail: `${tr('Marketplace add-on')} · ${e.publisher}`, kind: 'addon' }))],

    [tr]
  );

  const term = q.trim().toLowerCase();
  const visible = rows.filter((r) => (show === 'all' || !moduleOn(store, r.key)) && (!term || `${r.name} ${r.label} ${r.detail}`.toLowerCase().includes(term)));
  const offCount = rows.filter((r) => !moduleOn(store, r.key)).length;

  const confirm = (reason: string) => {
    if (!pending) return;
    const { row, on } = pending;
    setStore((s) =>
    audit({ ...s, modules: { ...s.modules, [row.key]: { on, updatedAt: new Date().toISOString() } } }, { area: 'flags', action: on ? 'Made available again' : 'Switched off — shown as “Currently not available”', target: row.name, reason })
    );
    toast.success(`${row.label}: ${on ? tr('available again') : tr('switched off')}`, { description: tr('Applies straight away in every open tab.') });
    setPending(null);
  };

  const list = (kind: Row['kind']) => visible.filter((r) => r.kind === kind);

  return (
    <section aria-labelledby="module-flags" className="mt-12">
      <h2 id="module-flags" className="text-heading font-semibold text-fg">
        {tr('Modules and add-ons')}
      </h2>
      <p className="mt-1 max-w-2xl text-label text-fg-muted">
        {tr('Switch any workspace screen or Marketplace add-on off for everyone. Owners still see it, marked “Currently not available”, and nothing they saved is lost. Add-ons can’t be installed while off, and their effects stop for workspaces that have them. Overview, Extensions and Settings can’t be switched off.')}
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-72">
          <TextInput id="module-flag-search" label={tr('Search')} placeholder={tr('e.g. Bookings, Meta Pixel')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Segmented<Show>
          ariaLabel={tr('Show')}
          value={show}
          onChange={setShow}
          options={[
          { value: 'all', label: tr('All: {n}', { n: rows.length }) },
          { value: 'off', label: tr('Switched off: {n}', { n: offCount }) }]
          } />
        
      </div>

      {(['module', 'addon'] as const).map((kind) => {
        const items = list(kind);
        return (
          <div key={kind} className="mt-6">
            <h3 className="text-label font-semibold text-fg">{kind === 'module' ? tr('Workspace modules') : tr('Marketplace add-ons')}</h3>
            {items.length === 0 ?
            <p className="mt-2 text-caption text-fg-muted">{show === 'off' ? tr('Nothing switched off.') : tr('No match.')}</p> :

            <ul className="mt-2 divide-y divide-line border-y border-line">
                {items.map((r) => {
                const on = moduleOn(store, r.key);
                const changed = store.modules?.[r.key]?.updatedAt;
                return (
                  <li key={r.key} className="flex flex-wrap items-center gap-3 py-3">
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-label font-semibold text-fg">{r.label}</span>
                          <Badge tone={on ? 'success' : 'danger'} dot>
                            {on ? tr('Available') : tr('Not available')}
                          </Badge>
                        </span>
                        <span className="mt-0.5 block truncate text-caption text-fg-subtle">
                          {r.detail}
                          {changed ? ` · ${tr('changed {when}', { when: formatRelative(changed) })}` : ''}
                        </span>
                      </span>
                      <Button size="sm" variant={on ? 'secondary' : 'primary'} onClick={() => setPending({ row: r, on: !on })}>
                        {on ? tr('Switch off') : tr('Make available')}
                      </Button>
                    </li>);

              })}
              </ul>
            }
          </div>);

      })}

      <ReasonDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={confirm}
        destructive={pending ? !pending.on : false}
        title={pending ? `${pending.on ? tr('Make available') : tr('Switch off')}: ${pending.row.label}` : ''}
        description={pending?.on ? tr('Owners can use it again straight away.') : tr('Owners keep seeing it, marked “Currently not available”. Nothing they saved is deleted.')}
        confirmLabel={tr('Apply change')} />
      
    </section>);

}