import React, { useMemo, useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { autoFlagRules, scanPublishedPages, type AutoFlag } from '../../utils/admin/autoFlags';
import { uid } from '../../utils/id';
import { toast } from 'sonner';
import { ExternalLinkIcon, ShieldCheckIcon } from 'lucide-react';
import type { PageReport, ReportStatus } from '../../types/admin';
import { reportReasonLabels } from '../../data/featureFlags';
import { audit, staffActor, useAdminStore } from '../../utils/admin/store';
import { formatRelative, formatTimestamp } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { EmptyState } from '../../components/ui/EmptyState';
import { SampleTag } from '../../components/commerce/StatusBadges';
import { ReasonDialog } from '../../components/admin/ReasonDialog';

type Tab = 'open' | 'auto' | 'decided' | 'takedowns';
type Decision = {kind: 'takedown' | 'dismiss';report: PageReport;} | {kind: 'restore';handle: string;} | null;

/** Super admin → Moderation & trust: reports from “Report this page”, takedowns and restores (D75b). */
export function AdminModeration() {
  const [store, setStore] = useAdminStore();
  const [tab, setTab] = useState<Tab>('open');
  const [openId, setOpenId] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision>(null);
  const open = store.reports.find((r) => r.id === openId) ?? null;
  const openReports = store.reports.filter((r) => r.status === 'open');
  const decided = store.reports.filter((r) => r.status !== 'open');
  const list = tab === 'open' ? openReports : decided;
  const reportsFor = (handle: string) => store.reports.filter((r) => r.handle === handle).length;
  const { workspaces } = useWorkspace();
  const allFlags = useMemo(() => scanPublishedPages(workspaces), [workspaces]);
  const flags = allFlags.filter((f) => !store.autoFlagsCleared[f.key] && !store.takedowns.some((t) => t.handle === f.handle));
  const [clearing, setClearing] = useState<AutoFlag | null>(null);

  const raiseReport = (f: AutoFlag) => {
    if (store.reports.some((r) => r.handle === f.handle && r.status === 'open')) {
      toast('This page already has an open report', { description: 'Review it in Open reports.' });
      setTab('open');
      return;
    }
    const report: PageReport = { id: uid('rep'), handle: f.handle, workspaceId: f.workspaceId, reason: f.rule.reason, details: `Automatic check — ${f.rule.label}: “${f.snippet}”`, reporterEmail: '', createdAt: new Date().toISOString(), status: 'open', decision: null, decidedAt: null, sample: f.sample };
    setStore((s) => audit({ ...s, reports: [report, ...s.reports] }, { area: 'moderation', action: `Opened a report from an automatic flag (${f.rule.label})`, target: `kub.icu/${f.handle}`, reason: 'A staff member reviewed the flag and wants it decided as a report.' }));
    toast.success('Report opened', { description: 'Decide it like any visitor report — check the page yourself first.' });
    setTab('open');
  };
  const clearFlag = (reason: string) => {
    if (!clearing) return;
    const f = clearing;
    setStore((s) => audit({ ...s, autoFlagsCleared: { ...s.autoFlagsCleared, [f.key]: { at: new Date().toISOString(), by: staffActor(s), reason } } }, { area: 'moderation', action: `Cleared automatic flag (${f.rule.label})`, target: `kub.icu/${f.handle}`, reason }));
    toast('Flag cleared', { description: 'It won’t come back for this page unless the wording matches a different check.' });
    setClearing(null);
  };

  const confirm = (reason: string) => {
    if (!decision) return;
    const now = new Date().toISOString();
    if (decision.kind === 'restore') {
      setStore((s) => audit({ ...s, takedowns: s.takedowns.filter((t) => t.handle !== decision.handle) }, { area: 'moderation', action: 'Restored page', target: `kub.icu/${decision.handle}`, reason }));
      toast.success(`kub.icu/${decision.handle} restored`);
    } else {
      const { report } = decision;
      const status: ReportStatus = decision.kind === 'takedown' ? 'actioned' : 'dismissed';
      setStore((s) => {
        let next: typeof s = {
          ...s,
          // Deciding one report decides every open report for the same page.
          reports: s.reports.map((r) => r.handle === report.handle && r.status === 'open' ? { ...r, status, decision: reason, decidedAt: now } : r)
        };
        if (decision.kind === 'takedown' && !s.takedowns.some((t) => t.handle === report.handle)) next = { ...next, takedowns: [{ handle: report.handle, reason, at: now }, ...next.takedowns] };
        return audit(next, { area: 'moderation', action: decision.kind === 'takedown' ? 'Took page down' : 'Dismissed report', target: `kub.icu/${report.handle}`, reason });
      });
      toast.success(decision.kind === 'takedown' ? `kub.icu/${report.handle} taken down` : 'Report dismissed', { description: decision.kind === 'takedown' ? 'Visitors see “removed for breaking KUBICU’s rules”. The owner keeps their data and can appeal.' : undefined });
      setOpenId(null);
    }
    setDecision(null);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Moderation & trust" description="Reports from visitors and the actions taken. Act proportionately: dismiss, or take a page down — accounts are suspended from Users & tenants." />

      <div className="mt-8">
        <Tabs<Tab>
          idPrefix="mod"
          ariaLabel="Moderation"
          value={tab}
          onChange={setTab}
          items={[
          { id: 'open', label: 'Open reports', badge: openReports.length || undefined },
          { id: 'auto', label: 'Automatic flags', badge: flags.length || undefined },
          { id: 'decided', label: 'Decided' },
          { id: 'takedowns', label: 'Taken down', badge: store.takedowns.length || undefined }]
          } />
        
      </div>

      <div className="mt-6" role="tabpanel" id={`mod-panel-${tab}`} aria-labelledby={`mod-tab-${tab}`}>
        {tab === 'auto' ?
        <>
            <p className="mb-4 max-w-3xl text-label text-fg-muted">
              Live pages are checked for wording common in scams and fakes. A flag is only a prompt to look — it never takes a page down, and the owner isn’t told. Open it as a report to decide it, or clear it if it’s fine.
            </p>
            {flags.length === 0 ?
          <EmptyState icon={ShieldCheckIcon} title="No automatic flags" description="Nothing on live pages matches the checks right now." /> :

          <ul className="flex flex-col divide-y divide-line border-y border-line">
                {flags.map((f) =>
            <li key={f.key} className="flex flex-col gap-3 py-4 md:flex-row md:items-start md:gap-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-fg">kub.icu/{f.handle}</span>
                        <Badge tone={f.rule.reason === 'scam' ? 'danger' : 'warning'}>{f.rule.label}</Badge>
                        {f.sample && <SampleTag />}
                        {store.reports.some((r) => r.handle === f.handle && r.status === 'open') && <Badge tone="info">Also reported by visitors</Badge>}
                      </div>
                      <p className="mt-0.5 text-caption text-fg-subtle">
                        {f.workspaceName} · {f.rule.why}
                      </p>
                      <blockquote className="mt-2 rounded-md bg-sunken px-3 py-2 text-label text-fg">{f.snippet}</blockquote>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button size="sm" variant="tertiary" leadingIcon={ExternalLinkIcon} onClick={() => window.open(`/p/${f.handle}`, '_blank', 'noopener')}>
                        Open page
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setClearing(f)}>
                        Not a problem…
                      </Button>
                      <Button size="sm" onClick={() => raiseReport(f)}>
                        Open as report
                      </Button>
                    </div>
                  </li>
            )}
              </ul>
          }
            <details className="mt-6 text-label">
              <summary className="cursor-pointer font-medium text-fg">What the checks look for</summary>
              <ul className="mt-3 flex flex-col gap-2">
                {autoFlagRules.map((r) =>
              <li key={r.id}>
                    <span className="font-medium text-fg">{r.label}</span> <span className="text-fg-muted">— {r.why}</span>
                  </li>
              )}
              </ul>
            </details>
          </> :
        tab === 'takedowns' ?
        store.takedowns.length === 0 ?
        <EmptyState icon={ShieldCheckIcon} title="No pages taken down" description="Pages you take down are listed here so they can be restored after an appeal." /> :

        <ul className="flex flex-col divide-y divide-line border-y border-line">
              {store.takedowns.map((t) =>
          <li key={t.handle} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="min-w-0">
                    <span className="block font-semibold text-fg">kub.icu/{t.handle}</span>
                    <span className="block text-caption text-fg-subtle">
                      “{t.reason}” · {formatTimestamp(t.at)}
                    </span>
                  </span>
                  <Button size="sm" variant="secondary" onClick={() => setDecision({ kind: 'restore', handle: t.handle })}>
                    Restore…
                  </Button>
                </li>
          )}
            </ul> :

        list.length === 0 ?
        <EmptyState icon={ShieldCheckIcon} title={tab === 'open' ? 'No open reports' : 'Nothing decided yet'} description="Visitors report pages from the “Report this page” link at the bottom of every public page." /> :

        <ul className="flex flex-col divide-y divide-line border-y border-line">
            {list.map((r) =>
          <li key={r.id}>
                <button type="button" onClick={() => setOpenId(r.id)} className="flex w-full flex-col gap-1 py-4 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus sm:flex-row sm:items-center sm:gap-4 sm:px-2">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-fg">kub.icu/{r.handle}</span>
                      <Badge tone={r.reason === 'scam' || r.reason === 'hate' ? 'danger' : 'warning'}>{reportReasonLabels[r.reason]}</Badge>
                      {r.sample && <SampleTag />}
                    </span>
                    <span className="mt-0.5 block truncate text-caption text-fg-subtle">{r.details}</span>
                  </span>
                  <span className="shrink-0 text-caption text-fg-subtle">
                    {r.status === 'open' ? formatRelative(r.createdAt) : r.status === 'actioned' ? 'Taken down' : 'Dismissed'}
                    {reportsFor(r.handle) > 1 ? ` · ${reportsFor(r.handle)} reports` : ''}
                  </span>
                </button>
              </li>
          )}
          </ul>
        }
      </div>

      <Sheet
        open={!!open}
        onClose={() => setOpenId(null)}
        side="right"
        title={open ? `kub.icu/${open.handle}` : 'Report'}
        description={open ? reportReasonLabels[open.reason] : undefined}
        footer={
        open?.status === 'open' ?
        <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={() => setDecision({ kind: 'dismiss', report: open })}>
                Dismiss…
              </Button>
              <Button variant="destructive" onClick={() => setDecision({ kind: 'takedown', report: open })}>
                Take page down…
              </Button>
            </div> :
        undefined
        }>
        
        {open &&
        <div className="flex flex-col gap-6">
            <section aria-labelledby="rep-what" className="flex flex-col gap-2">
              <h3 id="rep-what" className="text-label font-semibold text-fg">
                What the visitor said
              </h3>
              <blockquote className="rounded-md border border-line bg-sunken p-4 text-label text-fg">{open.details}</blockquote>
              <p className="text-caption text-fg-subtle">
                From {open.reporterEmail || 'an anonymous visitor'} · {formatTimestamp(open.createdAt)}
              </p>
            </section>
            <section aria-labelledby="rep-page" className="flex flex-col gap-2">
              <h3 id="rep-page" className="text-label font-semibold text-fg">
                The page
              </h3>
              <p className="text-caption text-fg-muted">
                {reportsFor(open.handle)} report{reportsFor(open.handle) === 1 ? '' : 's'} for this page in total. Check it yourself before acting — reports alone aren’t proof.
              </p>
              <Button size="sm" variant="secondary" leadingIcon={ExternalLinkIcon} className="self-start" onClick={() => window.open(`/p/${open.handle}`, '_blank', 'noopener')}>
                Open the page
              </Button>
            </section>
            {open.status !== 'open' &&
          <section aria-labelledby="rep-decision" className="flex flex-col gap-1 border-t border-line pt-4">
                <h3 id="rep-decision" className="text-label font-semibold text-fg">
                  {open.status === 'actioned' ? 'Taken down' : 'Dismissed'}
                </h3>
                <p className="text-caption text-fg-muted">
                  “{open.decision}” · {open.decidedAt ? formatTimestamp(open.decidedAt) : ''}
                </p>
              </section>
          }
          </div>
        }
      </Sheet>

      <ReasonDialog
        open={!!decision}
        onClose={() => setDecision(null)}
        onConfirm={confirm}
        destructive={decision?.kind === 'takedown'}
        title={decision?.kind === 'takedown' ? 'Take this page down?' : decision?.kind === 'dismiss' ? 'Dismiss this report?' : 'Restore this page?'}
        description={
        decision?.kind === 'takedown' ?
        'Visitors see “This page was removed for breaking KUBICU’s rules”. Orders, contacts and the owner’s account aren’t touched. Every open report for this page is closed.' :
        decision?.kind === 'dismiss' ?
        'The page stays up. Every open report for this page is closed with your reason.' :
        'The page comes back straight away, for example after a successful appeal.'
        }
        confirmLabel={decision?.kind === 'takedown' ? 'Take down' : decision?.kind === 'dismiss' ? 'Dismiss' : 'Restore'} />
      
      <ReasonDialog open={!!clearing} onClose={() => setClearing(null)} onConfirm={clearFlag} title="Clear this flag?" description={clearing ? `kub.icu/${clearing.handle} — ${clearing.rule.label}. Say why it’s fine, e.g. “Sells phone cases, not phones”.` : ''} confirmLabel="Clear flag" />
    </div>);

}