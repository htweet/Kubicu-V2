import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDownRightIcon, ArrowUpRightIcon, BarChart3Icon, DownloadIcon, LightbulbIcon, LockIcon, MousePointerClickIcon, XIcon } from 'lucide-react';
import { ExtensionShortcut } from '../components/extensions/ExtensionShortcut';
import { toast } from 'sonner';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useEditor } from '../contexts/EditorContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useCan } from '../contexts/TeamContext';
import { useDomains } from '../contexts/DomainsContext';
import { campaignStats, change, devices, funnels, hasSample, headline, inRange, insights, rangeFor, sources, topLinks, visitorMix, visitsByDay, type Range } from '../utils/analytics/aggregate';
import { deviceLabels, sourceLabels } from '../utils/analytics/track';
import { AudienceBreakdown } from '../components/analytics/AudienceBreakdown';
import { activeExtraSpaces, readSpacePage } from '../utils/spaces';
import { allBlocks } from '../utils/sitePages';
import { blockName } from '../utils/blocks';
import { downloadCsv, toCsv } from '../utils/csv';
import { formatNgn } from '../utils/format';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { Switch } from '../components/ui/Switch';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Tabs } from '../components/ui/Tabs';
import { VisitsChart } from '../components/analytics/VisitsChart';
import { FunnelView } from '../components/analytics/FunnelView';
import { Stat, StatGroup } from '../components/ui/layout/Stat';
import { Section } from '../components/ui/layout/Section';
import { Card } from '../components/ui/layout/Card';
import { cn } from '../utils/cn';
import { useT } from '../contexts/LocaleContext';
import { useSponsorships } from '../hooks/useSponsorships';
import { sponsorCampaign } from '../utils/sponsorships';

type Period = '7' | '30' | '90' | 'custom';
type FunnelTab = 'shop' | 'booking' | 'leads' | 'subscriptions' | 'tickets' | 'forms' | 'members';

const pct = (n: number) => `${Math.round(n * 100)}%`;

/** Analytics (D61): what visitors do, from real visits on this device plus labelled sample history. */
export function Analytics() {
  const { t: tr } = useT();
  const allowed = useCan('analytics.view');
  const { data, dismissInsight, clearSample } = useAnalytics();
  const { state, actions } = useEditor();
  const { current } = useWorkspace();
  const { briefs } = useSponsorships();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('30');
  const [from, setFrom] = useState(() => new Date(Date.now() - 13 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [compare, setCompare] = useState(true);
  const [handle, setHandle] = useState<string>('all');
  const [funnelTab, setFunnelTab] = useState<FunnelTab>('shop');

  const mainHandle = state.published?.handle ?? state.site.handle;
  const spaceOptions = useMemo(
    () => [
      { value: 'all', label: tr('All spaces') },
      { value: mainHandle, label: `${tr('Main page')} · ${mainHandle}` },
      ...activeExtraSpaces(current)
        .map((s) => readSpacePage(current.id, s.id)?.published?.handle ?? readSpacePage(current.id, s.id)?.draft.handle)
        .filter((h): h is string => !!h)
        .map((h) => ({ value: h, label: h })),
    ],
    [current, mainHandle, tr],
  );

  const ranges = useMemo((): { current: Range; previous: Range; days: number } => {
    if (period !== 'custom') {
      const d = Number(period);
      return { ...rangeFor(d), days: d };
    }
    const a = Date.parse(from);
    const b = Date.parse(to) + 86400000;
    const span = Math.max(86400000, b - a);
    return { current: { from: a, to: b }, previous: { from: a - span, to: a }, days: Math.round(span / 86400000) };
  }, [period, from, to]);

  const filter = { handle: handle === 'all' ? null : handle };
  const cur = useMemo(() => inRange(data.events, ranges.current, filter), [data.events, ranges, handle]); // eslint-disable-line react-hooks/exhaustive-deps
  const prev = useMemo(() => inRange(data.events, ranges.previous, filter), [data.events, ranges, handle]); // eslint-disable-line react-hooks/exhaustive-deps
  const h = headline(cur);
  const hp = headline(prev);
  const days = visitsByDay(cur, ranges.current);
  const prevDays = visitsByDay(prev, ranges.previous);
  const chart = days.map((d, i) => ({ label: d.label, value: d.value, previous: prevDays[i]?.value ?? 0 }));
  const links = topLinks(cur, h.visits).slice(0, 8);
  const src = sources(cur);
  const devs = devices(cur);
  const mix = visitorMix(cur, data.events);
  const f = funnels(cur);
  const sample = hasSample(cur);
  const { data: domainsData } = useDomains();
  const camp = campaignStats(cur);
  const domainLinks = domainsData.links.filter((l) => !l.archivedAt || camp.has(l.slug));
  // Creators' tracked sponsorship links on this business's briefs (D458), named after the creator.
  const sponsored = briefs
    .filter((b) => b.brandWorkspaceId === current.id)
    .flatMap((b) => b.applications.filter((a) => a.trackingCode).map((a) => ({ id: a.id, name: a.creatorName, brief: b.title, slug: sponsorCampaign(a.trackingCode as string) })));

  const mainBlocks = allBlocks(state.site);
  const ideas = insights(cur, state.site.blocks.map((b) => b.id), (id) => {
    const b = mainBlocks.find((x) => x.id === id);
    return b ? blockName(b) : '';
  }).filter((i) => !data.dismissedInsights.includes(i.id));

  // One-tap apply (D125): move a much-tapped link near the top of the draft, with Undo.
  const canApply = useCan('pages.edit').allowed;
  const applyMove = (insightId: string, blockId: string) => {
    const before = state.draft.blocks.map((b) => b.id);
    const lead = state.draft.blocks[0]?.type === 'profile' ? 1 : 0;
    const rest = before.filter((id) => id !== blockId);
    const next = [...rest.slice(0, lead), blockId, ...rest.slice(lead)];
    actions.reorderBlocks(next);
    dismissInsight(insightId);
    toast.success(tr('Moved it up in your draft'), {
      description: tr('Publish when you’re ready for visitors to see it.'),
      action: { label: tr('Undo'), onClick: () => actions.reorderBlocks(before) },
    });
  };

  if (!allowed.allowed)
    return (
      <div className="mx-auto w-full max-w-[1200px] px-5 py-8 md:px-10 md:py-12">
        <PageHeader title="Analytics" />
        <EmptyState framed className="mt-8" icon={LockIcon} title="You can’t see analytics" description={allowed.reason} />
      </div>
    );

  const exportCsv = () =>
    downloadCsv(
      `kubicu-analytics-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(['when', 'event', 'link', 'page', 'source', 'campaign', 'device', 'block', 'label', 'value_ngn', 'sample'], cur.map((e) => [e.at, e.type, e.handle, e.pageId ?? 'home', e.source, e.campaign ?? '', e.device ?? '', e.blockId ?? '', e.label ?? '', e.valueNgn ?? '', e.sample ? 'yes' : ''])),
    );

  const rangeText = period === 'custom' ? `${from} – ${to}` : tr('Last {n} days', { n: period });
  const delta = (c: number, p: number) => {
    if (!compare) return null;
    const ch = change(c, p);
    if (ch === null) return <span className="text-caption text-fg-subtle">{tr('new')}</span>;
    const up = ch >= 0;
    const Icon = up ? ArrowUpRightIcon : ArrowDownRightIcon;
    return (
      <span className={cn('inline-flex items-center gap-0.5 text-caption font-semibold', up ? 'text-success' : 'text-danger')}>
        <Icon size={13} aria-hidden />
        {up ? '+' : ''}
        {Math.round(ch * 100)}%<span className="sr-only"> {tr('vs previous period')}</span>
      </span>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 md:px-10 md:py-12">
      <PageHeader
        title="Analytics"
        description="What visitors do on your pages — recorded on this device, nothing personal kept."
        actions={
          <>
            <ExtensionShortcut id="clarity" label="Heatmaps" icon={MousePointerClickIcon} />
            <Button variant="secondary" leadingIcon={DownloadIcon} onClick={exportCsv} disabled={cur.length === 0}>
              Export CSV
            </Button>
          </>
        }
      />

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap items-end gap-3">
          <Segmented<Period>
            ariaLabel="Period"
            value={period}
            onChange={setPeriod}
            options={[
              { value: '7', label: '7 days' },
              { value: '30', label: '30 days' },
              { value: '90', label: '90 days' },
              { value: 'custom', label: 'Custom' },
            ]}
          />
          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="an-from">{tr('From')}</label>
              <input id="an-from" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="h-9 rounded-md border border-line bg-raised px-2.5 text-label text-fg" />
              <span className="text-caption text-fg-subtle">{tr('to')}</span>
              <label className="sr-only" htmlFor="an-to">{tr('To')}</label>
              <input id="an-to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="h-9 rounded-md border border-line bg-raised px-2.5 text-label text-fg" />
            </div>
          )}
          <div className="min-w-[200px]">
            <label htmlFor="an-space" className="sr-only">
              {tr('Space')}
            </label>
            <select id="an-space" value={handle} onChange={(e) => setHandle(e.target.value)} className="h-9 w-full rounded-md border border-line bg-raised px-2.5 text-label text-fg">
              {spaceOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {sample && (
            <span className="inline-flex items-center gap-2">
              <Badge tone="neutral">Includes sample visits</Badge>
              <button type="button" onClick={clearSample} className="text-caption font-medium text-fg-muted underline underline-offset-2 hover:text-fg">
                {tr('Clear sample')}
              </button>
            </span>
          )}
          <div className="w-52">
            <Switch id="an-compare" label="Compare to previous period" checked={compare} onChange={setCompare} />
          </div>
        </div>
      </div>

      {h.visits === 0 && hp.visits === 0 ? (
        <EmptyState framed className="mt-8" icon={BarChart3Icon} title="No visits in this period" description="Share your link or print a QR code. Visits, taps and where people came from show up here as they happen." />
      ) : (
        <>
          {/* Headline: visits leads; the rest support it. */}
          {/* Headline: visits leads; the rest support it (shared Stat, D188). */}
          <div role="group" aria-label={`${tr('Summary')}, ${rangeText}`} className="mt-8 grid gap-6 border-b border-line pb-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,3fr)] md:items-end">
            <dl>
              <Stat primary label="Visits" value={<span className="flex items-baseline gap-2">{h.visits.toLocaleString()} {delta(h.visits, hp.visits)}</span>} hint={`${rangeText} · ${tr('a visit is one browser session (30 min)')}`} />
            </dl>
            <StatGroup columns={3}>
              <Stat label="Visitors (estimated)" value={<span className="flex items-baseline gap-2">{h.visitors.toLocaleString()} {delta(h.visitors, hp.visitors)}</span>} hint="Distinct browsers — people on two devices count twice" />
              <Stat label="Tapped something" value={<span className="flex items-baseline gap-2">{pct(h.tapRate)} {delta(h.tapRate, hp.tapRate)}</span>} hint="Share of visits with at least one tap" />
              <Stat label="From your pages" value={<span className="flex items-baseline gap-2">{formatNgn(h.revenueNgn)} {delta(h.revenueNgn, hp.revenueNgn)}</span>} hint={tr('{n} paid orders · test mode', { n: h.orders })} />
            </StatGroup>
          </div>

          <Section id="visits-chart" title="Visits over time" className="mt-8">
            <VisitsChart
              data={chart}
              compare={compare}
              summary={`${tr('{n} visits', { n: h.visits.toLocaleString() })} · ${rangeText}${compare ? ` · ${tr('compared with {n} in the period before (dashed)', { n: hp.visits.toLocaleString() })}` : ''}. ${tr('Busiest day:')} ${days.reduce((a, b) => (b.value > a.value ? b : a), days[0])?.label ?? '—'}.`}
            />
          </Section>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_320px]">
            <Section id="links" title="Top links and buttons" className="gap-3">
              {links.length === 0 ? (
                <p className="text-label text-fg-muted">{tr('No taps yet in this period.')}</p>
              ) : (
                <table className="w-full text-label">
                  <caption className="sr-only">{tr('Top links and buttons in this period')}</caption>
                  <thead>
                    <tr className="border-b border-line text-caption text-fg-subtle">
                      <th scope="col" className="py-2 text-left font-medium">{tr('Link')}</th>
                      <th scope="col" className="py-2 text-right font-medium">{tr('Taps')}</th>
                      <th scope="col" className="py-2 text-right font-medium">{tr('Of visits')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((l) => (
                      <tr key={l.id} className="border-b border-line">
                        <td className="max-w-0 truncate py-2 pr-3 text-fg">{l.label}</td>
                        <td className="py-2 text-right tabular-nums text-fg">{l.taps}</td>
                        <td className="py-2 text-right tabular-nums text-fg-muted">{pct(l.share)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Section>

            <Section id="sources" title="Where visitors come from" className="gap-3">
              <div>
              <table className="w-full text-label">
                <caption className="sr-only">{tr('Visits and conversions by source')}</caption>
                <thead>
                  <tr className="border-b border-line text-caption text-fg-subtle">
                    <th scope="col" className="py-2 text-left font-medium">{tr('Source')}</th>
                    <th scope="col" className="py-2 text-right font-medium">{tr('Visits')}</th>
                    <th scope="col" className="py-2 text-right font-medium" title={tr('Paid orders, bookings, forms and sign-ups')}>{tr('Converted')}</th>
                  </tr>
                </thead>
                <tbody>
                  {src.map((s) => (
                    <tr key={s.id} className="border-b border-line">
                      <td className="py-2 pr-3 text-fg">
                        {tr(sourceLabels[s.id])} <span className="text-caption text-fg-subtle">{pct(s.share)}</span>
                      </td>
                      <td className="py-2 text-right tabular-nums text-fg">{s.visits}</td>
                      <td className="py-2 text-right tabular-nums text-fg-muted">
                        {s.conversions} <span className="text-caption">({pct(s.rate)})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-caption text-fg-subtle">{tr('From the link used (QR codes and campaign links tag themselves) or the site that sent them.')}</p>
              </div>
            </Section>

            <Card
              id="ideas"
              as="div"
              icon={LightbulbIcon}
              title="Link Intelligence"
              className="self-start"
              footer={<p className="text-caption text-fg-subtle">{tr('Observations, not proof — a pattern doesn’t show what caused it.')}</p>}
            >
              {ideas.length === 0 ? (
                <p className="text-caption text-fg-muted">{h.visits < 30 ? tr('Suggestions appear after 30 visits in a period ({n} so far).', { n: h.visits }) : tr('Nothing stands out right now.')}</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {ideas.map((i) => (
                    <li key={i.id} className="border-t border-line pt-3 first:border-0 first:pt-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-label font-medium text-fg">{i.title}</p>
                        <button type="button" aria-label={tr('Dismiss suggestion')} onClick={() => dismissInsight(i.id)} className="shrink-0 rounded p-0.5 text-fg-subtle hover:text-fg">
                          <XIcon size={14} aria-hidden />
                        </button>
                      </div>
                      <p className="mt-1 text-caption text-fg-muted">{i.evidence}</p>
                      {i.blockId && mainBlocks.some((b) => b.id === i.blockId) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {i.id.startsWith('move-') && canApply && state.draft.blocks.some((b) => b.id === i.blockId) && (
                            <Button size="sm" onClick={() => applyMove(i.id, i.blockId!)}>
                              Move it up
                            </Button>
                          )}
                          <Button size="sm" variant="secondary" onClick={() => navigate(`/app/canvas/${state.site.id}?block=${i.blockId}`)}>
                            Open in canvas
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <AudienceBreakdown
              id="devices"
              title="Devices"
              caption="Visits and conversions by device"
              rows={devs.map((d) => ({ ...d, label: tr(deviceLabels[d.id]) }))}
              note={devs.some((d) => d.id === 'unknown') ? 'Only the kind of device is kept. Visits from before devices were counted show as “Not recorded”.' : 'Only the kind of device is kept — never the model or browser.'}
            />
            <AudienceBreakdown
              id="returning"
              title="New and returning"
              caption="New and returning visits"
              rows={mix.map((d) => ({ ...d, label: d.id === 'new' ? 'First visit' : 'Came back' }))}
              note="An estimate: “came back” means the same browser visited before. Someone using a new phone, or who cleared their browser, counts as new."
            />
          </div>

          <Section
            id="campaigns"
            title="Campaign links and QR codes"
            className="mt-10 gap-3"
            actions={
              <Link to="/app/campaign-links" className="text-label font-medium text-action hover:underline">
                {tr('Manage')}
              </Link>
            }
          >
            {domainLinks.length === 0 && sponsored.length === 0 ? (
              <p className="text-label text-fg-muted">
                {tr('Make a short link for each place you share, or a QR code for print, to see which brings visitors.')} <Link to="/app/campaign-links" className="underline underline-offset-2">{tr('Create one')}</Link>
              </p>
            ) : (
              <table className="w-full max-w-3xl text-label">
                <caption className="sr-only">{tr('Campaign links and QR codes')}</caption>
                <thead>
                  <tr className="border-b border-line text-caption text-fg-subtle">
                    <th scope="col" className="py-2 text-left font-medium">{tr('Link')}</th>
                    <th scope="col" className="py-2 text-right font-medium">{tr('Visits / scans')}</th>
                    <th scope="col" className="py-2 text-right font-medium">{tr('Orders')}</th>
                    <th scope="col" className="hidden py-2 text-right font-medium sm:table-cell">{tr('Revenue')}</th>
                  </tr>
                </thead>
                <tbody>
                  {domainLinks.map((l) => {
                    const s = camp.get(l.slug) ?? { visits: 0, orders: 0, revenueNgn: 0 };
                    return (
                      <tr key={l.id} className="border-b border-line">
                        <td className="max-w-0 truncate py-2 pr-3 text-fg">
                          {l.name} <span className="text-caption text-fg-subtle">{l.source === 'qr' ? 'QR' : tr(sourceLabels[l.source])}</span>
                        </td>
                        <td className="py-2 text-right tabular-nums text-fg">{s.visits}</td>
                        <td className="py-2 text-right tabular-nums text-fg-muted">{s.orders}</td>
                        <td className="hidden py-2 text-right tabular-nums text-fg-muted sm:table-cell">{formatNgn(s.revenueNgn)}</td>
                      </tr>
                    );
                  })}
                  {sponsored.map((sp) => {
                    const s = camp.get(sp.slug) ?? { visits: 0, orders: 0, revenueNgn: 0 };
                    return (
                      <tr key={sp.id} className="border-b border-line">
                        <td className="max-w-0 truncate py-2 pr-3 text-fg">
                          {sp.name} <span className="text-caption text-fg-subtle">{tr('Sponsored creator · {brief}', { brief: sp.brief })}</span>
                        </td>
                        <td className="py-2 text-right tabular-nums text-fg">{s.visits}</td>
                        <td className="py-2 text-right tabular-nums text-fg-muted">{s.orders}</td>
                        <td className="hidden py-2 text-right tabular-nums text-fg-muted sm:table-cell">{formatNgn(s.revenueNgn)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {(domainLinks.length > 0 || sponsored.length > 0) && (
              <p className="max-w-3xl text-caption text-fg-subtle">
                {tr('Links that go to another website or a WhatsApp chat count each real click, because those visitors don’t open your page. Bots and repeat taps are left out.')}
              </p>
            )}
          </Section>

          <Section id="funnels" title="From visit to sale" className="mt-10 gap-3">
            <div>
              <Tabs<FunnelTab>
                items={[
                  { id: 'shop', label: 'Shop' },
                  { id: 'booking', label: 'Bookings' },
                  { id: 'leads', label: 'Leads' },
                  { id: 'subscriptions', label: 'Subscriptions' },
                  { id: 'tickets', label: 'Tickets' },
                  { id: 'forms', label: 'Forms' },
                  { id: 'members', label: 'Members' },
                ]}
                value={funnelTab}
                onChange={setFunnelTab}
                ariaLabel="Funnel"
                idPrefix="funnel"
              />
            </div>
            <div className="mt-1 max-w-3xl" role="tabpanel" id={`funnel-panel-${funnelTab}`} aria-labelledby={`funnel-tab-${funnelTab}`}>
              {funnelTab === 'shop' && <FunnelView steps={f.shop[0].count ? f.shop : f.shopFromCart} emptyText="No product views or carts in this period." />}
              {funnelTab === 'booking' && <FunnelView steps={f.booking} emptyText="Nobody opened a booking in this period." />}
              {funnelTab === 'subscriptions' && <FunnelView steps={f.subscriptions} emptyText="Nobody opened a subscription plan in this period." />}
              {funnelTab === 'forms' && <FunnelView steps={f.forms} emptyText="No Forms add-on forms were seen in this period." />}
              {funnelTab === 'members' && <FunnelView steps={f.members} emptyText="Nobody reached members-only content in this period." />}
              {funnelTab === 'tickets' && (
                <>
                  <FunnelView steps={f.tickets} emptyText="Nobody chose event tickets in this period." />
                  {(() => {
                    const paid = cur.filter((e) => e.type === 'ticket_paid');
                    const revenue = paid.reduce((s, e) => s + (e.valueNgn ?? 0), 0);
                    const byEvent = new Map<string, number>();
                    cur.filter((e) => e.type === 'ticket_select' && e.label).forEach((e) => byEvent.set(e.label as string, (byEvent.get(e.label as string) ?? 0) + 1));
                    if (!paid.length && !byEvent.size) return null;
                    return (
                      <StatGroup columns={3} divided className="mt-5">
                        <Stat label="Ticket revenue" value={formatNgn(revenue)} />
                        <Stat label="Orders with tickets" value={paid.length} />
                        {byEvent.size > 0 && <Stat label="Most chosen event" value={<span className="block truncate">{[...byEvent.entries()].sort((a, b) => b[1] - a[1])[0][0]}</span>} />}
                      </StatGroup>
                    );
                  })()}
                </>
              )}
              {funnelTab === 'leads' && (
                <FunnelView
                  steps={[f.leads[0], { label: 'Sent a form or signed up', count: new Set(cur.filter((e) => e.type === 'lead' || e.type === 'signup').map((e) => e.session)).size }]}
                  emptyText="No visits in this period."
                />
              )}
              <p className="mt-3 text-caption text-fg-subtle">{tr('Each step counts visits that also did every step before it. Percentages are kept from the step above.')}</p>
            </div>
          </Section>

          <p className="mt-10 text-caption text-fg-subtle">
            {tr(data.settings.excludeOwn ? 'Your own visits aren’t counted on this device — change it in' : 'Your own visits are counted on this device — change it in')} <Link to="/app/settings/privacy" className="underline underline-offset-2">{tr('Settings → Privacy')}</Link>.
          </p>
        </>
      )}
    </div>
  );
}
