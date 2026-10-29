import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArchiveIcon, ArchiveRestoreIcon, CopyIcon, DownloadIcon, ExternalLinkIcon, LinkIcon, PencilIcon, PlusIcon, QrCodeIcon, AlertTriangleIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog } from '../../components/ui/Dialog';
import { downloadCsv, toCsv } from '../../utils/csv';
import { useDomains } from '../../contexts/DomainsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import { useMainLink } from '../../hooks/useMainLink';
import type { CampaignLink } from '../../types/domains';
import { campaignStats } from '../../utils/analytics/aggregate';
import { destinationExists, destinationLabel, linkEnded, shortDisplay, shortHref, shortUrl } from '../../utils/domains/links';
import { sourceLabels } from '../../utils/analytics/track';
import { copyToClipboard } from '../../utils/clipboard';
import { formatNgn } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Segmented } from '../../components/ui/Segmented';
import { EmptyState } from '../../components/ui/EmptyState';
import { IllustrativeTag } from '../../components/ui/IllustrativeTag';
import { CampaignLinkDialog } from '../../components/domains/CampaignLinkDialog';
import { List } from '../../components/ui/layout/ListRow';

type View = 'active' | 'archived';

/** Tracked short links for each place you share (D62). */
export function CampaignLinks() {
  const { data, saveLink, deleteLink } = useDomains();
  const [deleting, setDeleting] = useState<CampaignLink | null>(null);
  const { current } = useWorkspace();
  const { data: commerce } = useCommerce();
  const { data: analytics } = useAnalytics();
  const can = useCan('pages.edit');
  const team = useTeam();
  const navigate = useNavigate();
  const { mainHandle, host } = useMainLink();
  const [view, setView] = useState<View>('active');
  const [editing, setEditing] = useState<CampaignLink | null | 'new'>(null);
  const stats = useMemo(() => campaignStats(analytics.events), [analytics.events]);
  const list = data.links.filter((l) => view === 'active' ? !l.archivedAt : !!l.archivedAt).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const archivedCount = data.links.filter((l) => l.archivedAt).length;

  const remove = (l: CampaignLink) => {
    if (!deleteLink(l.id)) {
      toast.error('A QR code uses this link', { description: 'Delete the QR code first, or archive the link instead.' });
      return;
    }
    team.log('pages', `deleted the campaign link ${shortDisplay(mainHandle, l.slug, host)}`, '/app/campaign-links');
    toast('Link deleted', { description: 'Visits already counted stay in Analytics.' });
    setDeleting(null);
  };

  const exportCsv = () => {
    const rows = data.links.map((l) => {
      const s = stats.get(l.slug) ?? { visits: 0, orders: 0, revenueNgn: 0 };
      return [l.name, shortUrl(mainHandle, l.slug, host), sourceLabels[l.source], destinationLabel(current, commerce, l.destination), l.utm?.medium ?? '', l.utm?.campaign ?? '', l.utm?.content ?? '', s.visits, s.orders, s.revenueNgn, l.createdAt.slice(0, 10), l.endsAt?.slice(0, 10) ?? '', l.archivedAt ? 'Archived' : linkEnded(l) ? 'Ended' : 'Active'];
    });
    downloadCsv('campaign-links.csv', toCsv(['Name', 'Link', 'Shared on', 'Goes to', 'utm_medium', 'utm_campaign', 'utm_content', 'Visits', 'Orders', 'Revenue (NGN)', 'Created', 'Ends', 'Status'], rows));
  };

  const setArchived = (l: CampaignLink, on: boolean) => {
    saveLink({ ...l, archivedAt: on ? new Date().toISOString() : null });
    team.log('pages', `${on ? 'archived' : 'restored'} the campaign link ${shortDisplay(mainHandle, l.slug, host)}`, '/app/campaign-links');
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Campaign links"
        description="One short link per place you share — Instagram bio, a flyer, a WhatsApp status — so Analytics shows which brings visitors and sales."
        actions={
        <Button leadingIcon={PlusIcon} disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={() => setEditing('new')}>
            New link
          </Button>
        } />
      

      {data.links.length > 0 &&
      <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented<View>
          ariaLabel="Show"
          size="sm"
          value={view}
          onChange={setView}
          options={[
          { value: 'active', label: 'Active' },
          { value: 'archived', label: `Archived${archivedCount ? ` (${archivedCount})` : ''}` }]
          } />
        
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-caption text-fg-subtle">Visits, orders and revenue since each link was created · orders in test mode</p>
            <Button size="sm" variant="secondary" leadingIcon={DownloadIcon} onClick={exportCsv}>
              Export CSV
            </Button>
          </div>
        </div>
      }

      {list.length === 0 ?
      <EmptyState
        framed
        icon={LinkIcon}
        title={view === 'archived' ? 'No archived links' : 'No campaign links yet'}
        description={view === 'archived' ? 'Links you stop using show here. Archived links tell visitors they’ve ended.' : 'Make one for your Instagram bio and one for a flyer, then compare them in Analytics.'}
        action={
        view === 'active' ?
        <Button leadingIcon={PlusIcon} disabled={!can.allowed} onClick={() => setEditing('new')}>
                  New link
                </Button> :
        undefined
        } /> :


      <List ruled label="Campaign links">
          {list.map((l) => {
          const s = stats.get(l.slug) ?? { visits: 0, orders: 0, revenueNgn: 0 };
          const ok = destinationExists(current, commerce, l.destination);
          return (
            <li key={l.id} className="grid gap-3 py-4 md:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.5fr))_auto] md:items-center md:gap-6">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-label font-semibold text-fg">
                    <span className="truncate">{l.name}</span>
                    {l.id.startsWith('lnk_sample') && <IllustrativeTag note="Sample link — visits come from sample history." />}
                  </p>
                  <p className="mt-0.5 truncate text-caption text-fg-muted">
                    <span className="font-medium text-fg">{shortDisplay(mainHandle, l.slug, host)}</span> · {sourceLabels[l.source]}
                    {l.endsAt && !l.archivedAt && <> · {linkEnded(l) ? 'Ended' : 'Ends'} {new Date(l.endsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</>}
                  </p>
                  <p className={ok ? 'mt-0.5 truncate text-caption text-fg-subtle' : 'mt-0.5 flex items-center gap-1 text-caption text-danger'}>
                    {!ok && <AlertTriangleIcon size={12} aria-hidden />}→ {ok ? destinationLabel(current, commerce, l.destination) : 'Its page was removed — visitors are sent to the nearest page that still exists. Edit to choose a new one.'}
                  </p>
                </div>
                <dl className="grid grid-cols-3 gap-3 md:contents">
                  <RowFigure label={l.source === 'qr' ? 'Scans' : 'Visits'} value={s.visits.toLocaleString()} />
                  <RowFigure label="Orders" value={s.orders.toLocaleString()} />
                  <RowFigure label="Revenue" value={formatNgn(s.revenueNgn)} />
                </dl>
                <div className="flex items-center gap-1 md:justify-end">
                  <IconButton icon={CopyIcon} label={`Copy ${l.name} link`} size="sm" onClick={() => copyToClipboard(shortUrl(mainHandle, l.slug, host), 'Link copied')} />
                  <IconButton icon={ExternalLinkIcon} label={`Open ${l.name} link (test visit)`} size="sm" onClick={() => window.open(shortHref(mainHandle, l.slug), '_blank')} />
                  {!l.archivedAt && <IconButton icon={QrCodeIcon} label={`QR code for ${l.name}`} size="sm" onClick={() => navigate(`/app/qr?link=${l.id}`)} />}
                  <IconButton icon={PencilIcon} label={`Edit ${l.name}`} size="sm" disabled={!can.allowed} onClick={() => setEditing(l)} />
                  <IconButton
                  icon={l.archivedAt ? ArchiveRestoreIcon : ArchiveIcon}
                  label={l.archivedAt ? `Restore ${l.name}` : `Archive ${l.name}`}
                  size="sm"
                  disabled={!can.allowed}
                  onClick={() => setArchived(l, !l.archivedAt)} />
                
                  <IconButton icon={Trash2Icon} label={`Delete ${l.name}`} size="sm" disabled={!can.allowed} onClick={() => setDeleting(l)} />
                </div>
              </li>);

        })}
        </List>
      }

      <p className="text-caption text-fg-subtle">“Open” simulates a visit through the link, so it’s counted in Analytics. Turn on “Don’t count my own visits” in Settings → Privacy to stop that.</p>

      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete this link?"
        description={deleting ? `${shortDisplay(mainHandle, deleting.slug, host)} will stop working straight away, including anywhere it’s printed or shared. Visits already counted stay in Analytics. To keep it but stop using it, archive it instead.` : undefined}
        footer={
        <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleting && remove(deleting)}>
              Delete link
            </Button>
          </>
        }>
        
        {deleting && data.qrs.some((q) => q.linkId === deleting.id) ? <p className="text-label text-danger">A QR code uses this link. Delete the QR code in QR codes first.</p> : null}
      </Dialog>

      <CampaignLinkDialog open={editing !== null} onClose={() => setEditing(null)} link={editing && editing !== 'new' ? editing : undefined} />
    </div>);

}

/** A figure inside a table-like row: label on phones, column caption on desktop. Not a stat strip, so not the shared Stat (D188). */
function RowFigure({ label, value }: {label: string;value: string;}) {
  return (
    <div className="md:text-right">
      <dt className="text-caption text-fg-subtle md:sr-only">{label}</dt>
      <dd className="text-label font-semibold tabular-nums text-fg">
        {value}
        <span className="hidden text-caption font-normal text-fg-subtle md:block">{label}</span>
      </dd>
    </div>);

}