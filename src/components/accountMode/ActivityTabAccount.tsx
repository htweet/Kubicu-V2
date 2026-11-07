import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DownloadIcon, HistoryIcon, Loader2Icon, LockIcon, ShieldAlertIcon, ShieldCheckIcon } from 'lucide-react';
import type { AccountFailure, AuditEvent, AuditPage } from '../../types/accountMode';
import type { ActivityRow } from '../../utils/activityExport';
import { useAccountMode } from '../../contexts/AccountModeContext';
import { useTeam } from '../../contexts/TeamContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useT } from '../../contexts/LocaleContext';
import { simulate } from '../../utils/accountModeSim';
import { formatRelative, formatTimestamp } from '../../utils/format';
import { initials } from '../../utils/team';
import { auditActionLabels, sampleAccountMembers, sampleAuditEvents, SAMPLE_AUDIT_PAGE_SIZE } from '../../data/accountModeSamples';
import { Button } from '../ui/Button';
import { SelectInput } from '../ui/SelectInput';
import { EmptyState } from '../ui/EmptyState';
import { InlineAlert } from '../ui/InlineAlert';
import { List } from '../ui/layout/ListRow';
import { ActivityExportDialog } from '../settings/ActivityExportDialog';
import { AccountStateAlert } from '../account/AccountStates';

type Period = '1' | '7' | '30' | 'all';

/**
 * Settings → Activity in account mode (D539). The server returns pages newest first with `chainIntact`.
 * Filters and export apply to the events loaded so far. Viewing needs audit.view (mapped to team.manage here).
 */
export function ActivityTabAccount() {
  const { t: tr } = useT();
  const team = useTeam();
  const { current } = useWorkspace();
  const { simulation } = useAccountMode();
  const allowed = team.can('team.manage').allowed;
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [hasOlder, setHasOlder] = useState(false);
  const [intact, setIntact] = useState(true);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [failure, setFailure] = useState<AccountFailure | null>(null);
  const [person, setPerson] = useState('all');
  const [period, setPeriod] = useState<Period>('all');
  const [exporting, setExporting] = useState(false);

  const fetchPage = useCallback(
    async (offset: number) => {
      const source = simulation === 'empty' ? [] : sampleAuditEvents;
      const page: AuditPage = { events: source.slice(offset, offset + SAMPLE_AUDIT_PAGE_SIZE), hasOlder: offset + SAMPLE_AUDIT_PAGE_SIZE < source.length, chainIntact: simulation !== 'logUnverified' };
      return simulate<AuditPage>('audit.load', simulation, { data: page });
    },
    [simulation],
  );

  const loadFirst = useCallback(async () => {
    setStatus('loading');
    setFailure(null);
    const r = await fetchPage(0);
    if (!r.ok) {
      setFailure(r);
      setStatus('error');
      return;
    }
    setEvents(r.data.events);
    setHasOlder(r.data.hasOlder);
    setIntact(r.data.chainIntact);
    setStatus('loaded');
  }, [fetchPage]);

  useEffect(() => {
    if (allowed) void loadFirst();
  }, [allowed, loadFirst]);

  const loadOlder = async () => {
    setLoadingOlder(true);
    const r = await fetchPage(events.length);
    setLoadingOlder(false);
    if (!r.ok) {
      setFailure(r);
      return;
    }
    setFailure(null);
    setEvents((e) => [...e, ...r.data.events]);
    setHasOlder(r.data.hasOlder);
    setIntact((was) => was && r.data.chainIntact);
  };

  const actorName = (id: string) => (id === 'system' ? 'Kubicu' : sampleAccountMembers.find((m) => m.id === id)?.name ?? tr('Someone no longer in the team'));

  const rows = useMemo<ActivityRow[]>(
    () =>
      events.map((e) => ({
        id: e.id,
        at: e.at,
        actor: actorName(e.actorId),
        area: e.action.startsWith('settings') || e.action.startsWith('workspace') ? 'settings' : 'team',
        text: `${tr(auditActionLabels[e.action] ?? e.action)}: ${e.target}`,
        workspace: current.name,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, current.name, tr],
  );
  const people = useMemo(() => Array.from(new Set(rows.map((r) => r.actor))).sort(), [rows]);
  const shown = useMemo(() => {
    const since = period === 'all' ? 0 : Date.now() - Number(period) * 86400000;
    return rows.filter((r) => (person === 'all' || r.actor === person) && Date.parse(r.at) >= since);
  }, [rows, person, period]);

  if (!allowed) {
    return <EmptyState framed icon={LockIcon} title={tr('You can’t view the activity log')} description={tr('Only Owners and Admins can see who changed what. Ask one of them if you need something checked.')} />;
  }
  if (status === 'loading') {
    return (
      <p className="flex items-center gap-2 py-10 text-label text-fg-muted" role="status">
        <Loader2Icon size={16} className="animate-spin" aria-hidden />
        {tr('Loading activity…')}
      </p>
    );
  }
  if (status === 'error' && failure) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-label font-semibold text-fg">{tr('Couldn’t load the activity log')}</p>
        <AccountStateAlert failure={failure} onRetry={() => void loadFirst()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {events.length > 0 &&
        (intact ? (
          <p className="flex items-center gap-1.5 text-caption text-success" role="status">
            <ShieldCheckIcon size={14} aria-hidden />
            {tr('Log verified: no entries have been changed')}
          </p>
        ) : (
          <InlineAlert tone="danger" title={tr('We couldn’t verify this log')}>
            {tr('Contact Kubicu support. The entries are still shown below.')}
          </InlineAlert>
        ))}

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="grid grid-cols-2 gap-3 md:flex">
          <div className="md:w-48">
            <SelectInput id="acc-act-person" label={tr('Who')} value={person} onChange={setPerson} options={[{ value: 'all', label: tr('Everyone') }, ...people.map((p) => ({ value: p, label: p }))]} />
          </div>
          <div className="md:w-40">
            <SelectInput<Period> id="acc-act-period" label={tr('When')} value={period} onChange={setPeriod} options={[{ value: '1', label: tr('Last 24 hours') }, { value: '7', label: tr('Last 7 days') }, { value: '30', label: tr('Last 30 days') }, { value: 'all', label: tr('All time') }]} />
          </div>
        </div>
        <Button variant="secondary" leadingIcon={DownloadIcon} disabled={shown.length === 0} onClick={() => setExporting(true)}>
          {tr('Export')}
        </Button>
      </div>
      {events.length > 0 && <p className="-mt-3 text-caption text-fg-subtle">{tr('Showing {n} loaded events. Load older to search further back.', { n: events.length })}</p>}

      {shown.length === 0 ? (
        <EmptyState framed icon={HistoryIcon} title={tr('Nothing here')} description={events.length ? tr('No loaded activity matches these filters.') : tr('Role changes, invites and settings changes show up here as people work.')} />
      ) : (
        <List ordered ruled>
          {shown.map((a) => (
            <li key={a.id} className="flex items-start gap-3 py-2.5">
              <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-action-soft text-caption font-semibold text-action">
                {initials(a.actor)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-label text-fg">
                  <span className="font-semibold">{a.actor}</span> {a.text}
                </p>
                <p className="text-caption text-fg-subtle" title={formatTimestamp(a.at)}>
                  {formatRelative(a.at)}
                </p>
              </div>
            </li>
          ))}
        </List>
      )}

      {failure && <AccountStateAlert failure={failure} onRetry={() => void loadOlder()} />}
      {hasOlder && (
        <Button variant="secondary" className="self-start" loading={loadingOlder} onClick={() => void loadOlder()}>
          {tr('Load older')}
        </Button>
      )}
      {!intact && events.length > 0 && (
        <p className="flex items-center gap-1.5 text-caption text-danger">
          <ShieldAlertIcon size={14} aria-hidden />
          {tr('Some entries couldn’t be verified.')}
        </p>
      )}

      <ActivityExportDialog open={exporting} rows={shown} scopeText={`${current.name} · ${tr('Showing {n} loaded events. Load older to search further back.', { n: events.length })}`} onClose={() => setExporting(false)} onExported={() => undefined} />
    </div>
  );
}
