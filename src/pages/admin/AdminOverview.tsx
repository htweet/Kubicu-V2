import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../utils/admin/store';
import { useStaffSession } from '../../hooks/useStaffSession';
import { roleCanOpen, roleInfo } from '../../data/staffRoles';
import { approvalArea, effectiveStatus } from '../../utils/admin/approvals';
import { activeIncidents, impactLabels, overallState, serviceStateLabels } from '../../utils/admin/incidents';
import { formatRelative } from '../../utils/format';
import { useKycQueue } from '../../hooks/useKycQueue';
import { REVIEW_HOURS } from '../../utils/money/kyc';
import { useSponsorships } from '../../hooks/useSponsorships';
import { disputeOpen, disputeRows, SPONSOR_DECIDE_DAYS } from '../../utils/sponsorships';
import { useT } from '../../contexts/LocaleContext';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card } from '../../components/ui/layout/Card';
import { List, ListRow } from '../../components/ui/layout/ListRow';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';

const DAY = 86400000;

/**
 * Super admin → Operations overview: every queue the signed-in role can act on, worst first (D129).
 * Follows the console's language (D487); incident titles and audit entries stay as recorded.
 */
export function AdminOverview() {
  const { t } = useT();
  const [store] = useAdminStore();
  const me = useStaffSession();
  const role = me?.role ?? 'lead';
  const now = Date.now();

  const pendingApprovals = store.approvals.filter((a) => effectiveStatus(a, now) === 'pending');
  const approvalsForMe = pendingApprovals.filter((a) => a.requestedById !== me?.id);
  const dueSoon = store.dataRequests.filter((d) => (d.status === 'new' || d.status === 'in_progress') && Date.parse(d.dueAt) - now < 7 * DAY);
  const incidents = activeIncidents(store.incidents);
  const overall = overallState(store.incidents);
  const kyc = useKycQueue();
  const kycLate = kyc.filter((k) => now - Date.parse(k.submittedAt) > REVIEW_HOURS * 3600000);
  const { briefs } = useSponsorships();
  const sponsorOpen = disputeRows(briefs).filter((r) => disputeOpen(r.app));
  const sponsorLate = sponsorOpen.filter((r) => now - Date.parse(r.app.dispute!.openedAt) > SPONSOR_DECIDE_DAYS * DAY).length;

  const queues = [
    {
      area: 'health',
      label: t('Open incidents'),
      count: incidents.length,
      urgent: incidents.length > 0,
      note: incidents.length ? incidents.map((i) => `${i.title} (${t(impactLabels[i.impact])})`).join(' · ') : t('Status page: working normally'),
      to: '/admin/health',
    },
    {
      area: 'payments',
      label: t('Verifications to review'),
      count: kyc.length,
      urgent: kycLate.length > 0,
      note: kycLate.length ? t('Past the {hours}-hour promise: {n} · oldest first', { hours: REVIEW_HOURS, n: kycLate.length }) : t('Sellers are promised a decision within {hours} hours', { hours: REVIEW_HOURS }),
      to: '/admin/payments?tab=identity',
    },
    ...(['staff', 'tenants', 'payments'] as const).map((area) => {
      const mineToDecide = approvalsForMe.filter((a) => approvalArea[a.kind] === area);
      const label = area === 'staff' ? 'Access changes waiting for you' : area === 'tenants' ? 'Suspensions waiting for you' : 'Large payouts waiting for you';
      return { area, label: t(label), count: mineToDecide.length, urgent: mineToDecide.length > 0, note: t('Second-person approval — expires after 24 hours'), to: `/admin/${area}` };
    }),
    { area: 'moderation', label: t('Open page reports'), count: store.reports.filter((r) => r.status === 'open').length, urgent: store.reports.some((r) => r.status === 'open' && r.reason === 'scam'), note: t('Scam reports are reviewed first'), to: '/admin/moderation' },
    {
      area: 'sponsorships',
      label: t('Sponsorship problems to decide'),
      count: sponsorOpen.length,
      urgent: sponsorLate > 0,
      note: sponsorLate ? t('Past the {days}-day target: {n}', { days: SPONSOR_DECIDE_DAYS, n: sponsorLate }) : t('Held money is frozen until you decide'),
      to: '/admin/sponsorships',
    },
    { area: 'sponsorships', label: t('Sponsorship briefs to check'), count: briefs.filter((b) => b.status === 'review').length, urgent: false, note: t('Creators can’t see a brief until it’s approved'), to: '/admin/sponsorships' },
    { area: 'appeals', label: t('Appeals to decide'), count: store.appeals.filter((a) => a.status === 'open').length, urgent: false, note: t('Decided by someone other than the original reviewer'), to: '/admin/appeals' },
    { area: 'support', label: t('Help requests needing a reply'), count: store.tickets.filter((x) => x.status === 'open').length, urgent: false, note: t('Oldest first in Support'), to: '/admin/support' },
    { area: 'data-requests', label: t('Data requests due within 7 days'), count: dueSoon.length, urgent: dueSoon.some((d) => Date.parse(d.dueAt) < now), note: t('Legal deadline — don’t let these slip'), to: '/admin/data-requests' },
    { area: 'tenants', label: t('Suspended workspaces'), count: Object.keys(store.suspended).length, urgent: false, note: t('Restore from Users & tenants'), to: '/admin/tenants' },
  ].filter((q) => roleCanOpen(role, q.area));

  const needsAction = queues.filter((q) => q.count > 0).sort((a, b) => Number(b.urgent) - Number(a.urgent) || b.count - a.count);
  const clear = queues.filter((q) => q.count === 0);
  const recent = store.audit.slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title={t('Operations overview')} description={t('What needs {role} attention now, worst first. Only the areas your role can open are shown.', { role: t(roleInfo(role).label) })} />

      <div className={cn('mt-8 flex flex-col gap-1 rounded-lg border px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6', overall === 'operational' ? 'border-line bg-raised' : 'border-danger/40 bg-danger-soft')}>
        <p className="text-label font-semibold text-fg">
          {overall === 'operational' ? t('Platform: all services working normally') : t('Platform: some services {state}', { state: t(serviceStateLabels[overall]).toLowerCase() })}
        </p>
        <Link to="/status" target="_blank" className="text-label font-medium text-action hover:underline">
          {t('Public status page')}
        </Link>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card id="queues" title={t('Needs action')} description={needsAction.length ? t('Queues with work in them: {n}', { n: needsAction.length }) : t('Every queue you can open is clear.')} body="flush" emphasis="primary">
          {needsAction.length === 0 ? (
            <p className="px-5 py-6 text-label text-fg-muted md:px-6">{t('Nothing waiting. Nice.')}</p>
          ) : (
            <List>
              {needsAction.map((q) => (
                <ListRow
                  key={q.area + q.label}
                  to={q.to}
                  title={q.label}
                  meta={q.note}
                  leading={<span className={cn('flex h-9 min-w-[36px] items-center justify-center rounded-md px-2 text-label font-semibold tabular-nums', q.urgent ? 'bg-danger-soft text-danger' : 'bg-sunken text-fg')}>{q.count}</span>}
                  trailing={q.urgent ? <Badge tone="danger">{t('Urgent')}</Badge> : undefined}
                  chevron
                />
              ))}
            </List>
          )}
          {clear.length > 0 && (
            <p className="border-t border-line px-5 py-3 text-caption text-fg-subtle md:px-6">
              {t('Clear: {list}.', { list: clear.map((q) => q.label).join(' · ') })}
            </p>
          )}
        </Card>

        <Card
          id="recent"
          title={t('Recent staff actions')}
          actions={roleCanOpen(role, 'audit') ? <Link to="/admin/audit" className="text-label font-medium text-action hover:underline">{t('Audit log')}</Link> : undefined}
          body="flush"
        >
          {recent.length === 0 ? (
            <p className="px-5 py-6 text-label text-fg-muted md:px-6">{t('No staff actions logged yet.')}</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((e) => (
                <li key={e.id} className="px-5 py-3 md:px-6">
                  <p className="text-label text-fg">{e.action}</p>
                  <p className="mt-0.5 truncate text-caption text-fg-subtle">
                    {e.actor.split(' ·')[0]} · {e.target} · {formatRelative(e.at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
