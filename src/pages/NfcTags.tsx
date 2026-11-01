import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ExternalLinkIcon, MoreHorizontalIcon, NfcIcon, PencilIcon, PlusIcon, PowerIcon } from 'lucide-react';
import type { NfcTag } from '../types/nfc';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useCan, useTeam } from '../contexts/TeamContext';
import { useDomains } from '../contexts/DomainsContext';
import { useT } from '../contexts/LocaleContext';
import { useNfcTags } from '../hooks/useNfcTags';
import { arrived, nfcKinds, tapPath, tapsSince } from '../utils/nfc';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Badge } from '../components/ui/Badge';
import { Menu } from '../components/ui/Menu';
import { EmptyState } from '../components/ui/EmptyState';
import { NfcOrderSheet } from '../components/nfc/NfcOrderSheet';
import { NfcTagSheet } from '../components/nfc/NfcTagSheet';

/** NFC tags (D442): tap-to-open stickers, cards and keyrings that can be re-pointed or switched off. */
export function NfcTags() {
  const { t: tr } = useT();
  const { current } = useWorkspace();
  const team = useTeam();
  const can = useCan('extensions.manage');
  const links = useDomains().data.links;
  const { tags, update } = useNfcTags(current.id);
  const [ordering, setOrdering] = useState(false);
  const [editing, setEditing] = useState<NfcTag | null>(null);

  const weekTaps = tags.reduce((s, t) => s + tapsSince(t, 7), 0);
  const where = (t: NfcTag) => {
    const d = t.destination;
    if (d.type === 'page') return tr('Main page');
    if (d.type === 'url') return d.url.replace(/^https:\/\//, '');
    const link = links.find((l) => l.id === d.linkId);
    return link ? tr('Short link · {name}', { name: link.name }) : tr('Short link removed — opens main page');
  };

  const setStatus = (t: NfcTag, status: NfcTag['status']) => {
    if (!update((list) => list.map((x) => x.id === t.id ? { ...x, status } : x))) return;
    team.log('settings', `${status === 'off' ? 'turned off' : 'turned on'} NFC tag “${t.label}”`, '/app/nfc');
    toast(status === 'off' ? tr('{name} turned off', { name: t.label }) : tr('{name} is on again', { name: t.label }), { description: status === 'off' ? tr('Taps now show a “turned off” notice instead of your page.') : undefined });
  };

  const orderButton =
  <Button leadingIcon={PlusIcon} disabled={!can.allowed} onClick={() => setOrdering(true)}>
      {tr('Order tags')}
    </Button>;


  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 md:px-10 md:py-12">
      <PageHeader title={tr('NFC tags')} description={tr('Stickers, cards and keyrings customers tap with their phone to open your page. Point each one anywhere, change it later, or switch it off if it’s lost.')} actions={orderButton} />

      {tags.length === 0 ?
      <EmptyState
        framed
        className="mt-8"
        icon={NfcIcon}
        title={tr('No tags yet')}
        description={tr('Put one on your counter, a product box or a rider’s keyring. Taps are counted here, separately from QR scans.')}
        action={can.allowed ? orderButton : undefined} /> :


      <>
          <div className="mt-8 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <p className="text-label text-fg-muted">{tr('Taps in the last 7 days: {n} · Tags: {tags}', { n: weekTaps, tags: tags.length })}</p>
            <Link to="/app/qr" className="shrink-0 text-label text-action hover:underline">
              {tr('QR scans are in QR codes')}
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {tags.map((t) =>
          <li key={t.id} className="-mx-2 flex items-center gap-2 rounded-md px-2 transition-colors duration-150 hover:bg-sunken">
                <button type="button" disabled={!can.allowed} onClick={() => setEditing(t)} className="flex min-w-0 flex-1 items-center gap-4 rounded-md py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-default">
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="truncate text-label font-semibold text-fg">{t.label}</span>
                      {t.status === 'off' ? <Badge tone="neutral">{tr('Off')}</Badge> : !arrived(t) ? <Badge tone="info">{tr('On the way · {ref}', { ref: t.orderRef })}</Badge> : null}
                    </span>
                    <span className="mt-0.5 block truncate text-caption text-fg-muted">
                      {tr(nfcKinds[t.kind].one)} · {tr('opens {where}', { where: where(t) })}
                    </span>
                  </span>
                  <span className="w-24 shrink-0 text-right sm:w-36">
                    <span className="block text-label font-semibold tabular-nums text-fg">{tapsSince(t, 7)}</span>
                    <span className="block truncate text-caption text-fg-subtle">{tr('this week · total {total}', { total: t.taps.length })}</span>
                  </span>
                </button>
                <Menu
              align="end"
              trigger={(p) => <IconButton {...p} icon={MoreHorizontalIcon} label={tr('Actions for {name}', { name: t.label })} variant="ghost" />}
              items={[
              { id: 'edit', label: tr('Rename or re-point'), icon: PencilIcon, disabled: !can.allowed, onSelect: () => setEditing(t) },
              { id: 'test', label: tr('Test a tap'), icon: ExternalLinkIcon, onSelect: () => window.open(tapPath(t), '_blank', 'noopener') },
              t.status === 'active' ?
              { id: 'off', label: tr('Turn off (lost or stolen)'), icon: PowerIcon, destructive: true, disabled: !can.allowed, onSelect: () => setStatus(t, 'off') } :
              { id: 'on', label: tr('Turn back on'), icon: PowerIcon, disabled: !can.allowed, onSelect: () => setStatus(t, 'active') }]
              } />
            
              </li>
          )}
          </ul>
          <p className="mt-3 text-caption text-fg-subtle">{tr('“Test a tap” opens the tag’s address in a new tab and counts as a tap. Ordering and delivery are simulated.')}</p>
        </>
      }

      <NfcOrderSheet open={ordering} onClose={() => setOrdering(false)} />
      <NfcTagSheet tag={editing} onClose={() => setEditing(null)} />
    </div>);

}