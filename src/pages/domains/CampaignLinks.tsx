import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3Icon, ArchiveIcon, ArchiveRestoreIcon, CopyIcon, DownloadIcon, ExternalLinkIcon, LinkIcon, PauseIcon, PencilIcon, PlayIcon, PlusIcon, QrCodeIcon, AlertTriangleIcon, Trash2Icon, RefreshCwIcon, MessageCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { QuickShortenBar } from '../../components/domains/QuickShortenBar';
import { ShortLinkFilters, emptyLinkFilters, type LinkFilterState } from '../../components/domains/ShortLinkFilters';
import { clicksBySlug } from '../../utils/analytics/linkStats';
import { Dialog } from '../../components/ui/Dialog';
import { downloadCsv, toCsv } from '../../utils/csv';
import { useDomains } from '../../contexts/DomainsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import { useMainLink } from '../../hooks/useMainLink';
import { useLinkHealthCheck } from '../../hooks/useLinkHealthCheck';
import type { CampaignLink } from '../../types/domains';
import type { SourceId } from '../../types/analytics';
import { campaignStats } from '../../utils/analytics/aggregate';
import { shortDisplay, shortHref, shortUrl } from '../../utils/domains/links';
import { checkLinkHealth, linkGoesTo, linkStatus, linkStatusLabels } from '../../utils/domains/linkRules';
import { sourceLabels } from '../../utils/analytics/track';
import { copyToClipboard } from '../../utils/clipboard';
import { formatNgn, formatRelative } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Segmented } from '../../components/ui/Segmented';
import { EmptyState } from '../../components/ui/EmptyState';
import { IllustrativeTag } from '../../components/ui/IllustrativeTag';
import { CampaignLinkDialog } from '../../components/domains/CampaignLinkDialog';
import { List } from '../../components/ui/layout/ListRow';
import { useT } from '../../contexts/LocaleContext';

type View = 'active' | 'archived';

const timeAgo = (iso: string) => formatRelative(iso).replace(/^about /, '');

/** Tracked short links for each place you share (D62, D270, D271). */
export function CampaignLinks() {
  const { t: tr } = useT();
  const { data, saveLink, deleteLink } = useDomains();
  const [deleting, setDeleting] = useState<CampaignLink | null>(null);
  const [alsoClicks, setAlsoClicks] = useState(false);
  const { current } = useWorkspace();
  const { data: commerce } = useCommerce();
  const { data: analytics, clearLinkClicks } = useAnalytics();
  const can = useCan('pages.edit');
  const team = useTeam();
  const navigate = useNavigate();
  const { mainHandle, host } = useMainLink();
  const health = useLinkHealthCheck();
  const [view, setView] = useState<View>('active');
  const [filters, setFilters] = useState<LinkFilterState>(emptyLinkFilters);
  const [editing, setEditing] = useState<CampaignLink | null | 'new'>(null);
  const stats = useMemo(() => campaignStats(analytics.events), [analytics.events]);
  const clicks = useMemo(() => clicksBySlug(analytics.events), [analytics.events]);

  // Live health for the list, so a removed page shows straight away rather than at the next daily check.
  const healthOf = (l: CampaignLink) => checkLinkHealth(current, commerce, l);
  const inView = data.links.filter((l) => (view === 'active' ? !l.archivedAt : !!l.archivedAt));
  const channels = Array.from(new Set(data.links.map((l) => l.source))) as SourceId[];
  const tags = Array.from(new Set(data.links.flatMap((l) => l.tags ?? []))).sort();
  const q = filters.q.trim().toLowerCase();
  const list = inView
    .filter((l) => filters.channel === 'all' || l.source === filters.channel)
    .filter((l) => filters.tag === 'all' || (l.tags ?? []).includes(filters.tag))
    .filter((l) => view === 'archived' || filters.status === 'all' || (filters.status === 'attention' ? !healthOf(l).ok : linkStatus(l) === filters.status))
    .filter((l) => !q || [l.name, l.slug, linkGoesTo(current, commerce, l), ...(l.tags ?? [])].some((s) => s.toLowerCase().includes(q)))
    .sort((a, b) => {
      if (filters.sort === 'clicks') return (clicks.get(b.slug)?.clicks ?? 0) - (clicks.get(a.slug)?.clicks ?? 0);
      if (filters.sort === 'recent') return (clicks.get(b.slug)?.last ?? 0) - (clicks.get(a.slug)?.last ?? 0);
      if (filters.sort === 'name') return a.name.localeCompare(b.name);
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
  const archivedCount = data.links.filter((l) => l.archivedAt).length;
  const attention = data.links.filter((l) => !l.archivedAt && !healthOf(l).ok).length;
  const deletingTaps = deleting ? analytics.events.filter((e) => e.campaign === deleting.slug && e.type === 'link_click').length : 0;

  const remove = (l: CampaignLink) => {
    if (!deleteLink(l.id)) {
      toast.error(tr('A QR code uses this link'), { description: tr('Delete the QR code first, or archive the link instead.') });
      return;
    }
    const removed = alsoClicks ? clearLinkClicks(l.slug) : 0;
    team.log('pages', `deleted the short link ${shortDisplay(mainHandle, l.slug, host)}${alsoClicks ? ' and its click data' : ''}`, '/app/links');
    toast(tr('Link deleted'), { description: alsoClicks ? tr('Taps deleted: {n}. Visits it brought stay in Analytics, no longer tied to the link.', { n: removed }) : tr('Visits already counted stay in Analytics.') });
    setDeleting(null);
  };

  const exportCsv = () => {
    const rows = list.map((l) => {
      const s = stats.get(l.slug) ?? { visits: 0, orders: 0, revenueNgn: 0 };
      const c = clicks.get(l.slug);
      return [l.name, shortUrl(mainHandle, l.slug, host), sourceLabels[l.source], linkGoesTo(current, commerce, l), (l.tags ?? []).join('; '), l.utm?.medium ?? '', l.utm?.campaign ?? '', l.utm?.content ?? '', c?.clicks ?? s.visits, c?.last ? new Date(c.last).toISOString() : '', s.orders, s.revenueNgn, l.createdAt.slice(0, 10), l.startsAt?.slice(0, 10) ?? '', l.endsAt?.slice(0, 10) ?? '', linkStatusLabels[linkStatus(l)], healthOf(l).ok ? 'OK' : 'Needs attention'];
    });
    downloadCsv('short-links.csv', toCsv(['Name', 'Link', 'Shared on', 'Goes to', 'Tags', 'utm_medium', 'utm_campaign', 'utm_content', 'Clicks', 'Last click', 'Orders', 'Revenue (NGN)', 'Created', 'Starts', 'Ends', 'Status', 'Check'], rows));
  };

  const setArchived = (l: CampaignLink, on: boolean) => {
    saveLink({ ...l, archivedAt: on ? new Date().toISOString() : null });
    team.log('pages', `${on ? 'archived' : 'restored'} the short link ${shortDisplay(mainHandle, l.slug, host)}`, '/app/links');
  };

  const checkNow = () => {
    const broken = health.run();
    toast(broken ? tr('Links that need attention: {n}', { n: broken }) : tr('All links passed'), { description: tr('Website addresses, WhatsApp numbers and your pages were checked.') });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Short links"
        description="Short, tracked links to your pages, any website or a WhatsApp chat. Make one per place you share — Instagram bio, a flyer, a WhatsApp status — and see who taps, from where, and what they did next."
        actions={
          <Button leadingIcon={PlusIcon} disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={() => setEditing('new')}>
            New link
          </Button>
        }
      />

      <QuickShortenBar />

      {data.links.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented<View>
              ariaLabel="Show"
              size="sm"
              value={view}
              onChange={setView}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'archived', label: `${tr('Archived')}${archivedCount ? ` (${archivedCount})` : ''}` },
              ]}
            />
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-caption text-fg-subtle">
                {attention > 0 ? (
                  <button type="button" onClick={() => setFilters((f) => ({ ...f, status: 'attention' }))} className="font-semibold text-danger hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    {tr('Need attention: {n}', { n: attention })}
                  </button>
                ) : (
                  tr('All links pass their checks')
                )}
                {' · '}{tr('checked daily')}{health.checkedAt ? `, ${tr('last {when}', { when: timeAgo(health.checkedAt) })}` : ''}
              </p>
              <Button size="sm" variant="tertiary" leadingIcon={RefreshCwIcon} onClick={checkNow}>
                Check now
              </Button>
              <Button size="sm" variant="secondary" leadingIcon={DownloadIcon} onClick={exportCsv} disabled={list.length === 0}>
                Export CSV
              </Button>
            </div>
          </div>
          <ShortLinkFilters value={filters} onChange={setFilters} channels={channels} tags={tags} showStatus={view === 'active'} shown={list.length} total={inView.length} />
        </div>
      )}

      {list.length === 0 ? (
        inView.length > 0 ? (
          <EmptyState framed icon={LinkIcon} title="No links match" description="Try another search or clear the filters." action={<Button variant="secondary" onClick={() => setFilters({ ...emptyLinkFilters, sort: filters.sort })}>Clear filters</Button>} />
        ) : (
          <EmptyState
            framed
            icon={LinkIcon}
            title={view === 'archived' ? 'No archived links' : 'No short links yet'}
            description={view === 'archived' ? 'Links you stop using show here. Archived links tell visitors they’ve ended.' : 'Make one for your Instagram bio and one for a flyer, then compare them.'}
            action={
              view === 'active' ? (
                <Button leadingIcon={PlusIcon} disabled={!can.allowed} onClick={() => setEditing('new')}>
                  New link
                </Button>
              ) : undefined
            }
          />
        )
      ) : (
        <List ruled label="Short links">
          {list.map((l) => {
            const s = stats.get(l.slug) ?? { visits: 0, orders: 0, revenueNgn: 0 };
            const c = clicks.get(l.slug);
            const h = healthOf(l);
            const status = linkStatus(l);
            return (
              <li key={l.id} className="grid gap-3 py-4 md:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,0.5fr))_auto] md:items-center md:gap-6">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-label font-semibold text-fg">
                    <Link to={`/app/links/${l.id}`} className="truncate rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                      {l.name}
                    </Link>
                    {l.id.startsWith('lnk_sample') && <IllustrativeTag note={tr('Sample link — visits come from sample history.')} />}
                    {status !== 'live' && status !== 'archived' && <span className="shrink-0 rounded-full bg-sunken px-2 py-0.5 text-caption font-semibold text-fg-muted">{tr(linkStatusLabels[status])}</span>}
                  </p>
                  {(l.tags?.length ?? 0) > 0 && <p className="mt-0.5 truncate text-caption text-fg-subtle">{l.tags!.map((t) => `#${t}`).join(' ')}</p>}
                  <p className="mt-0.5 truncate text-caption text-fg-muted">
                    <span className="font-medium text-fg">{shortDisplay(mainHandle, l.slug, host)}</span> · {tr(sourceLabels[l.source])}
                    {status === 'scheduled' && l.startsAt && <> · {tr('Starts {date}', { date: new Date(l.startsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) })}</>}
                    {l.endsAt && !l.archivedAt && <> · {tr(status === 'ended' ? 'Ended {date}' : 'Ends {date}', { date: new Date(l.endsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) })}</>}
                  </p>
                  <p className={h.ok ? 'mt-0.5 flex items-center gap-1 truncate text-caption text-fg-subtle' : 'mt-0.5 flex items-start gap-1 text-caption text-danger'}>
                    {!h.ok ? <AlertTriangleIcon size={12} aria-hidden className="mt-0.5 shrink-0" /> : l.whatsapp ? <MessageCircleIcon size={12} aria-hidden className="shrink-0" /> : <span aria-hidden>→</span>}
                    <span className={h.ok ? 'truncate' : undefined}>{h.ok ? linkGoesTo(current, commerce, l) : `${tr(h.reason ?? '')} ${tr('Edit to choose another.')}`}</span>
                  </p>
                </div>
                <dl className="grid grid-cols-4 gap-3 md:contents">
                  <RowFigure label={l.source === 'qr' ? 'Scans' : 'Clicks'} value={(c?.clicks ?? s.visits).toLocaleString()} />
                  <RowFigure label="Last click" value={c?.last ? timeAgo(new Date(c.last).toISOString()) : '—'} />
                  <RowFigure label="Orders" value={l.externalUrl || l.whatsapp ? '—' : s.orders.toLocaleString()} />
                  <RowFigure label="Revenue" value={l.externalUrl || l.whatsapp ? '—' : formatNgn(s.revenueNgn)} />
                </dl>
                <div className="flex flex-wrap items-center gap-1 md:justify-end">
                  <IconButton icon={BarChart3Icon} label={tr('Stats for {name}', { name: l.name })} size="sm" onClick={() => navigate(`/app/links/${l.id}`)} />
                  <IconButton icon={CopyIcon} label={tr('Copy {name} link', { name: l.name })} size="sm" onClick={() => copyToClipboard(shortUrl(mainHandle, l.slug, host), tr('Link copied'))} />
                  <IconButton icon={ExternalLinkIcon} label={tr('Open {name} link (test visit)', { name: l.name })} size="sm" onClick={() => window.open(shortHref(mainHandle, l.slug), '_blank')} />
                  {!l.archivedAt && <IconButton icon={QrCodeIcon} label={tr('QR code for {name}', { name: l.name })} size="sm" onClick={() => navigate(`/app/qr?link=${l.id}`)} />}
                  <IconButton icon={PencilIcon} label={tr('Edit {name}', { name: l.name })} size="sm" disabled={!can.allowed} onClick={() => setEditing(l)} />
                  {!l.archivedAt && (
                    <IconButton
                      icon={l.pausedAt ? PlayIcon : PauseIcon}
                      label={tr(l.pausedAt ? 'Resume {name}' : 'Pause {name}', { name: l.name })}
                      size="sm"
                      disabled={!can.allowed}
                      onClick={() => {
                        saveLink({ ...l, pausedAt: l.pausedAt ? null : new Date().toISOString() });
                        team.log('pages', `${l.pausedAt ? 'resumed' : 'paused'} the short link ${shortDisplay(mainHandle, l.slug, host)}`, '/app/links');
                        toast(tr(l.pausedAt ? 'Link resumed' : 'Link paused'), { description: tr(l.pausedAt ? 'It sends people to its destination again.' : 'Anyone who taps it sees that it’s paused, with a link to your main page.') });
                      }}
                    />
                  )}
                  <IconButton icon={l.archivedAt ? ArchiveRestoreIcon : ArchiveIcon} label={tr(l.archivedAt ? 'Restore {name}' : 'Archive {name}', { name: l.name })} size="sm" disabled={!can.allowed} onClick={() => setArchived(l, !l.archivedAt)} />
                  <IconButton
                    icon={Trash2Icon}
                    label={tr('Delete {name}', { name: l.name })}
                    size="sm"
                    disabled={!can.allowed}
                    onClick={() => {
                      setAlsoClicks(false);
                      setDeleting(l);
                    }}
                  />
                </div>
              </li>
            );
          })}
        </List>
      )}

      <p className="text-caption text-fg-subtle">
        {tr('“Open” simulates a visit through the link, so it’s counted. Turn on “Don’t count my own visits” in Settings → Privacy to stop that. Daily checks confirm website addresses still pass the safety check, WhatsApp numbers are valid and your pages still exist; checking whether another website is down needs the live service.')}
      </p>

      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete this link?"
        description={deleting ? tr('{link} will stop working straight away, including anywhere it’s printed or shared. To keep it but stop using it, archive it instead.', { link: shortDisplay(mainHandle, deleting.slug, host) }) : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleting && remove(deleting)}>
              Delete link
            </Button>
          </>
        }
      >
        {deleting && data.qrs.some((q) => q.linkId === deleting.id) ? (
          <p className="text-label text-danger">{tr('A QR code uses this link. Delete the QR code in QR codes first.')}</p>
        ) : (
          <label className="flex items-start gap-3 text-label text-fg">
            <input type="checkbox" checked={alsoClicks} onChange={(e) => setAlsoClicks(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {tr('Also delete its click data')}{deletingTaps ? ` (${tr('{n} taps', { n: deletingTaps.toLocaleString() })})` : ''}
              <span className="block text-caption text-fg-subtle">{tr('Visits it brought stay in Analytics, no longer tied to this link. This can’t be undone.')}</span>
            </span>
          </label>
        )}
      </Dialog>

      <CampaignLinkDialog open={editing !== null} onClose={() => setEditing(null)} link={editing && editing !== 'new' ? editing : undefined} />
    </div>
  );
}

/** A figure inside a table-like row: label on phones, column caption on desktop. Not a stat strip, so not the shared Stat (D188). */
function RowFigure({ label, value }: { label: string; value: string }) {
  label = useT().t(label);
  return (
    <div className="min-w-0 md:text-right">
      <dt className="text-caption text-fg-subtle md:sr-only">{label}</dt>
      <dd className="truncate text-label font-semibold tabular-nums text-fg">
        {value}
        <span className="hidden text-caption font-normal text-fg-subtle md:block">{label}</span>
      </dd>
    </div>
  );
}
