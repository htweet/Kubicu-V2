import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangleIcon, ArrowLeftIcon, Link2Icon, CopyIcon, DownloadIcon, ExternalLinkIcon, PauseIcon, PencilIcon, PlayIcon, QrCodeIcon, Trash2Icon } from 'lucide-react';
import { Dialog } from '../../components/ui/Dialog';
import { viaLabels } from '../../utils/analytics/clickQuality';
import { checkLinkHealth, linkGoesTo, linkOffsite, linkStatus, linkStatusLabels } from '../../utils/domains/linkRules';
import { toast } from 'sonner';
import { useDomains } from '../../contexts/DomainsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import { useMainLink } from '../../hooks/useMainLink';
import { linkClicks, linkStats, outcomeLabels, type ClickOutcome } from '../../utils/analytics/linkStats';
import { shortDisplay, shortHref, shortUrl } from '../../utils/domains/links';
import { sourceLabels } from '../../utils/analytics/track';
import { copyToClipboard } from '../../utils/clipboard';
import { downloadCsv, toCsv } from '../../utils/csv';
import { formatNgn } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { Segmented } from '../../components/ui/Segmented';
import { EmptyState } from '../../components/ui/EmptyState';
import { IllustrativeTag } from '../../components/ui/IllustrativeTag';
import { VisitsChart } from '../../components/analytics/VisitsChart';
import { CampaignLinkDialog } from '../../components/domains/CampaignLinkDialog';
import { useT } from '../../contexts/LocaleContext';

type Period = '7' | '30' | '90' | 'all';
const DAY = 86_400_000;

/** Everything about one short link: clicks over time, devices, timing and what people did next (D270). */
export function LinkStats() {
  const { t: tr } = useT();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, saveLink } = useDomains();
  const { current } = useWorkspace();
  const { data: commerce } = useCommerce();
  const { data: analytics, clearLinkClicks } = useAnalytics();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const can = useCan('pages.edit');
  const team = useTeam();
  const { mainHandle, host } = useMainLink();
  const link = data.links.find((l) => l.id === id);
  const [period, setPeriod] = useState<Period>('30');
  const [editing, setEditing] = useState(false);

  const range = useMemo(() => {
    const end = new Date();
    end.setHours(24, 0, 0, 0);
    const to = end.getTime();
    if (period !== 'all') return { from: to - Number(period) * DAY, to, compare: true };
    const created = link ? Date.parse(link.createdAt) : to - 30 * DAY;
    const earliest = Math.min(created, ...analytics.events.filter((e) => link && e.campaign === link.slug).map((e) => Date.parse(e.at)));
    const start = new Date(Math.max(earliest, to - 365 * DAY));
    start.setHours(0, 0, 0, 0);
    return { from: start.getTime(), to, compare: false };
  }, [period, link, analytics.events]);

  const stats = useMemo(() => (link ? linkStats(analytics.events, link.slug, range.from, range.to, range.compare) : null), [link, analytics.events, range]);

  if (!link || !stats) {
    return (
      <EmptyState
        framed
        icon={Link2Icon}
        title="This link doesn’t exist"
        description="It may have been deleted. Clicks already counted stay in Analytics."
        action={<Button onClick={() => navigate('/app/links')}>Back to Short links</Button>}
      />
    );
  }

  const display = shortDisplay(mainHandle, link.slug, host);
  const statusKey = linkStatus(link);
  const status = linkStatusLabels[statusKey];
  const goesTo = linkGoesTo(current, commerce, link);
  const offsite = linkOffsite(link);
  const leftLabel = link.whatsapp ? 'Opened WhatsApp' : 'Went to the website';
  const outcomeLabel = (o: ClickOutcome) => (o === 'left' ? leftLabel : outcomeLabels[o]);
  const health = checkLinkHealth(current, commerce, link);
  const allTaps = analytics.events.filter((e) => e.campaign === link.slug && e.type === 'link_click').length;
  const filteredTotal = stats.filtered.bots + stats.filtered.bursts;

  const deleteClicks = () => {
    const removed = clearLinkClicks(link.slug);
    team.log('pages', `deleted the click data of the short link ${display}`, `/app/links/${link.id}`);
    toast(tr('Click data deleted'), { description: tr('Taps deleted: {n}. Visits it brought stay in Analytics, no longer tied to the link.', { n: removed.toLocaleString() }) });
    setConfirmDelete(false);
  };
  const change = stats.previousClicks === null ? null : stats.previousClicks === 0 ? (stats.clicks > 0 ? tr('New this period') : null) : tr('{pct} vs previous {n} days', { pct: `${stats.clicks >= stats.previousClicks ? '+' : ''}${Math.round(((stats.clicks - stats.previousClicks) / stats.previousClicks) * 100)}%`, n: period });
  const pct = (n: number) => (stats.clicks ? `${Math.round((n / stats.clicks) * 100)}%` : '—');
  const maxHour = Math.max(1, ...stats.hours);
  const pageName = (pageId: string | null) => (pageId === null ? tr('Home') : pageId === 'shop' ? tr('Shop') : tr('Page “{name}”', { name: pageId }));
  const periodLabel = period === 'all' ? tr('since it was created') : tr('in the last {n} days', { n: period });

  const togglePause = () => {
    saveLink({ ...link, pausedAt: link.pausedAt ? null : new Date().toISOString() });
    team.log('pages', `${link.pausedAt ? 'resumed' : 'paused'} the short link ${display}`, `/app/links/${link.id}`);
    toast(tr(link.pausedAt ? 'Link resumed' : 'Link paused'));
  };

  // Every click in the period, not just the latest 20 shown on screen.
  const exportCsv = () => {
    const rows = linkClicks(analytics.events, link.slug)
      .filter((c) => c.at >= range.from && c.at < range.to)
      .map((c) => [new Date(c.at).toISOString(), c.device ?? '', c.via ? viaLabels[c.via] : '', c.outcome === 'left' ? (link.whatsapp ? 'WhatsApp' : 'Website') : pageName(c.pageId), outcomeLabel(c.outcome), c.sample ? 'yes' : '']);
    downloadCsv(`short-link-${link.slug}-clicks.csv`, toCsv(['clicked_at', 'device', 'came_from', 'landed_on', 'what_happened', 'sample'], rows));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link to="/app/links" className="inline-flex items-center gap-1.5 self-start rounded-sm text-label text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <ArrowLeftIcon size={16} aria-hidden />
          {tr('Short links')}
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-caption text-fg-subtle">
              <span className={statusKey === 'live' ? 'font-semibold text-success' : 'font-semibold text-fg-muted'}>
                {tr(status)}
                {statusKey === 'scheduled' && link.startsAt ? ` · ${tr('Starts {date}', { date: new Date(link.startsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) })}` : ''}
              </span>
              <span aria-hidden>·</span>
              <span>{tr('Shared on {place}', { place: tr(sourceLabels[link.source]) })}</span>
              <span aria-hidden>·</span>
              <span>{tr('Created {date}', { date: new Date(link.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) })}</span>
              {stats.hasSample && <IllustrativeTag note={tr('Includes sample clicks from the demo history.')} />}
            </p>
            <h1 className="mt-1 truncate font-display text-title font-semibold text-fg">{link.name}</h1>
            <p className="mt-1 truncate font-mono text-label text-fg">{display}</p>
            <p className="mt-0.5 truncate text-caption text-fg-muted">→ {goesTo}</p>
            {!health.ok && (
              <p className="mt-1 flex items-start gap-1 text-caption text-danger">
                <AlertTriangleIcon size={12} aria-hidden className="mt-0.5 shrink-0" />
                {tr(health.reason ?? '')} {tr('Edit to choose another.')}
              </p>
            )}
            {(link.tags?.length ?? 0) > 0 && <p className="mt-1 text-caption text-fg-subtle">{link.tags!.map((t) => `#${t}`).join(' ')}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" leadingIcon={CopyIcon} onClick={() => void copyToClipboard(shortUrl(mainHandle, link.slug, host), tr('Link copied'))}>
              Copy
            </Button>
            <Button variant="secondary" size="sm" leadingIcon={ExternalLinkIcon} onClick={() => window.open(shortHref(mainHandle, link.slug), '_blank')}>
              Test
            </Button>
            {!link.archivedAt && (
              <Button variant="secondary" size="sm" leadingIcon={QrCodeIcon} onClick={() => navigate(`/app/qr?link=${link.id}`)}>
                QR code
              </Button>
            )}
            {!link.archivedAt && (
              <Button variant="secondary" size="sm" leadingIcon={link.pausedAt ? PlayIcon : PauseIcon} disabled={!can.allowed} onClick={togglePause}>
                {link.pausedAt ? 'Resume' : 'Pause'}
              </Button>
            )}
            <Button size="sm" leadingIcon={PencilIcon} disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={() => setEditing(true)}>
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
        <Segmented<Period>
          ariaLabel="Period"
          size="sm"
          value={period}
          onChange={setPeriod}
          options={[
            { value: '7', label: '7 days' },
            { value: '30', label: '30 days' },
            { value: '90', label: '90 days' },
            { value: 'all', label: 'All time' },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="tertiary" leadingIcon={Trash2Icon} onClick={() => setConfirmDelete(true)} disabled={!can.allowed || allTaps === 0} title={can.allowed ? undefined : can.reason}>
            Delete click data
          </Button>
          <Button size="sm" variant="secondary" leadingIcon={DownloadIcon} onClick={exportCsv} disabled={stats.clicks === 0}>
            Export clicks
          </Button>
        </div>
      </div>

      {/* Headline: clicks lead, everything else supports it. */}
      <section aria-labelledby="ls-headline" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="flex flex-col gap-6">
          <div>
            <h2 id="ls-headline" className="text-label text-fg-muted">
              {tr(link.source === 'qr' ? 'Scans' : 'Clicks')} {periodLabel}
            </h2>
            <p className="mt-1 text-[56px] font-semibold leading-none tabular-nums text-fg">{stats.clicks.toLocaleString()}</p>
            {change && <p className="mt-2 text-caption text-fg-muted">{change}</p>}
            <p className="mt-2 text-caption text-fg-subtle">
              {tr('One per visit — tapping twice in 30 minutes counts once.')}{' '}
              {filteredTotal > 0
                ? `${tr('Taps left out: {n}', { n: filteredTotal.toLocaleString() })} — ${[stats.filtered.bots ? tr('{n} from bots or link previews', { n: stats.filtered.bots }) : '', stats.filtered.bursts ? tr('{n} rapid repeats from one browser', { n: stats.filtered.bursts }) : ''].filter(Boolean).join(', ')}.`
                : tr('Bots, link previews and rapid repeats are left out.')}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Figure label="Unique people" value={stats.visitors.toLocaleString()} note="Estimated from a random browser ID" />
            {offsite ? (
              <Figure label={leftLabel} value={stats.clicks.toLocaleString()} note={link.whatsapp ? 'Whether they sent the message isn’t tracked' : 'What they do there isn’t tracked'} />
            ) : (
              <Figure label="Did something" value={pct(stats.engaged)} note={tr('{n} tapped, browsed or more', { n: stats.engaged })} />
            )}
            {!offsite && <Figure label="Orders" value={stats.orders.toLocaleString()} note="Test mode" />}
            {!offsite && <Figure label="Revenue" value={formatNgn(stats.revenueNgn)} note={tr('{pct} of clicks bought, booked or signed up', { pct: pct(stats.conversions) })} />}
          </dl>
        </div>
        <div className="min-w-0">
          {stats.clicks === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg bg-sunken px-6 text-center">
              <p className="text-label font-semibold text-fg">{tr('No clicks')} {periodLabel}</p>
              <p className="max-w-sm text-caption text-fg-muted">{tr('Share the link or print its QR code. Use “Test” to try it yourself — your own taps count unless you turn that off in Settings → Privacy.')}</p>
            </div>
          ) : (
            <VisitsChart
              data={stats.daily}
              compare={range.compare}
              summary={`${stats.clicks} ${tr(link.source === 'qr' ? 'scans' : 'clicks')} ${periodLabel}${stats.busiestDay ? ` · ${tr('busiest day:')} ${stats.busiestDay}` : ''}.`}
            />
          )}
        </div>
      </section>

      {stats.clicks > 0 && (
        <div className="grid gap-10 border-t border-line pt-8 md:grid-cols-2">
          <section aria-labelledby="ls-outcomes" className="flex flex-col gap-3">
            <h2 id="ls-outcomes" className="text-label font-semibold text-fg">
              {tr('What happened after the click')}
            </h2>
            <Bars rows={stats.outcomes.map((o) => ({ label: outcomeLabel(o.key), count: o.count }))} total={stats.clicks} />
          </section>

          <section aria-labelledby="ls-via" className="flex flex-col gap-3">
            <div>
              <h2 id="ls-via" className="text-label font-semibold text-fg">
                {tr('Where the taps came from')}
              </h2>
              <p className="text-caption text-fg-subtle">{tr('The app or site it was tapped in. Printed QR codes and typed links show as scanned or typed.')}</p>
            </div>
            <Bars rows={stats.via.map((v) => ({ label: v.label, count: v.count }))} total={stats.clicks} />
          </section>

          <section aria-labelledby="ls-devices" className="flex flex-col gap-3">
            <h2 id="ls-devices" className="text-label font-semibold text-fg">
              {tr('Devices')}
            </h2>
            <Bars rows={stats.devices.map((d) => ({ label: d.label, count: d.count }))} total={stats.clicks} />
          </section>

          <section aria-labelledby="ls-hours" className="flex flex-col gap-3">
            <h2 id="ls-hours" className="text-label font-semibold text-fg">
              {tr('Time of day')}
            </h2>
            <div className="flex h-24 items-end gap-[3px]" aria-hidden>
              {stats.hours.map((h, i) => (
                <div key={i} className="flex-1 rounded-t-[2px] bg-action" style={{ height: `${Math.max(3, (h / maxHour) * 100)}%`, opacity: h ? 1 : 0.15 }} />
              ))}
            </div>
            <div className="flex justify-between text-caption text-fg-subtle" aria-hidden>
              <span>12am</span>
              <span>6am</span>
              <span>12pm</span>
              <span>6pm</span>
              <span>11pm</span>
            </div>
            <p className="text-caption text-fg-muted">
              {tr('Busiest hour:')} {formatHour(stats.hours.indexOf(Math.max(...stats.hours)))}
              {stats.busiestDay ? ` · ${tr('busiest day:')} ${stats.busiestDay}` : ''}. {tr('Your device’s time zone.')}
            </p>
          </section>

          {!offsite && stats.landed.length > 0 && (
            <section aria-labelledby="ls-landed" className="flex flex-col gap-3">
              <h2 id="ls-landed" className="text-label font-semibold text-fg">
                {tr('Where they landed')}
              </h2>
              <Bars rows={stats.landed.map((l) => ({ label: pageName(l.pageId), count: l.count }))} total={stats.clicks} />
            </section>
          )}
        </div>
      )}

      {stats.recent.length > 0 && (
        <section aria-labelledby="ls-recent" className="flex flex-col gap-3 border-t border-line pt-8">
          <div>
            <h2 id="ls-recent" className="text-label font-semibold text-fg">
              {tr('Latest clicks')}
            </h2>
            <p className="text-caption text-fg-subtle">{tr('Anonymous — no names, numbers or locations are recorded.')}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-label">
              <thead className="text-caption text-fg-subtle">
                <tr className="border-b border-line">
                  <th scope="col" className="py-2 pr-4 font-medium">{tr('When')}</th>
                  <th scope="col" className="py-2 pr-4 font-medium">{tr('Device')}</th>
                  <th scope="col" className="py-2 pr-4 font-medium">{tr('Came from')}</th>
                  <th scope="col" className="py-2 pr-4 font-medium">{tr('Landed on')}</th>
                  <th scope="col" className="py-2 font-medium">{tr('What happened')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((c) => (
                  <tr key={c.session} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-4 tabular-nums text-fg">{new Date(c.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-2.5 pr-4 text-fg-muted">{c.device ? tr({ phone: 'Phone', tablet: 'Tablet', desktop: 'Computer' }[c.device]) : '—'}</td>
                    <td className="py-2.5 pr-4 text-fg-muted">{c.via ? tr(viaLabels[c.via]) : '—'}</td>
                    <td className="py-2.5 pr-4 text-fg-muted">{c.outcome === 'left' ? (link.whatsapp ? 'WhatsApp' : tr('Website')) : pageName(c.pageId)}</td>
                    <td className="py-2.5 text-fg">{tr(outcomeLabel(c.outcome))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {link.history && link.history.length > 0 && (
        <section aria-labelledby="ls-history" className="flex flex-col gap-2 border-t border-line pt-8">
          <h2 id="ls-history" className="text-label font-semibold text-fg">
            {tr('Destination history')}
          </h2>
          <ol className="flex flex-col gap-1 text-caption text-fg-muted">
            {link.history.map((h) => (
              <li key={h.at}>
                {new Date(h.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {tr('now goes to')} <span className="text-fg">{h.to}</span> · {tr('by {name}', { name: h.by })}
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="text-caption text-fg-subtle">{tr('Counts follow your Privacy settings and are kept for your analytics retention period. Location isn’t recorded, and the app a tap came from is kept only as its kind (Instagram, WhatsApp…), never the address.')}</p>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this link’s click data?"
        description={tr('All {n} recorded taps on {link} are removed, including sample ones. Visits it brought stay in Analytics, no longer tied to this link. The link keeps working and starts counting again from zero. This can’t be undone.', { n: allTaps.toLocaleString(), link: display })}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteClicks}>
              Delete click data
            </Button>
          </>
        }
      />

      <CampaignLinkDialog open={editing} onClose={() => setEditing(false)} link={link} />
    </div>
  );
}

function Figure({ label, value, note }: { label: string; value: string; note: string }) {
  const { t } = useT();
  label = t(label);
  note = t(note);
  return (
    <div>
      <dt className="text-caption text-fg-muted">{label}</dt>
      <dd className="mt-0.5 text-heading font-semibold tabular-nums text-fg">{value}</dd>
      <dd className="text-caption text-fg-subtle">{note}</dd>
    </div>
  );
}

function Bars({ rows, total }: { rows: { label: string; count: number }[]; total: number }) {
  const { t } = useT();
  rows = rows.map((r) => ({ ...r, label: t(r.label) }));
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <li key={r.label} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3 text-label">
            <span className="truncate text-fg">{r.label}</span>
            <span className="shrink-0 tabular-nums text-fg-muted">
              {r.count.toLocaleString()} <span className="text-fg-subtle">· {Math.round((r.count / Math.max(1, total)) * 100)}%</span>
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-sunken" aria-hidden>
            <div className="h-full rounded-full bg-action" style={{ width: `${(r.count / Math.max(1, total)) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatHour(h: number): string {
  const suffix = h < 12 ? 'am' : 'pm';
  const n = h % 12 === 0 ? 12 : h % 12;
  return `${n}${suffix}–${(h + 1) % 12 === 0 ? 12 : (h + 1) % 12}${(h + 1) % 24 < 12 ? 'am' : 'pm'}`;
}
