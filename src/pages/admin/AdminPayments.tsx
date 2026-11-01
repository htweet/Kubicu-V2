import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangleIcon, MoreHorizontalIcon, PauseIcon, PlayIcon, SnowflakeIcon, Undo2Icon } from 'lucide-react';
import type { MoneyData, Payout } from '../../types/money';
import type { KycRequest, KycStatus } from '../../types/kyc';
import { entityInfo, kycRisks, REVIEW_HOURS, statusLabels, statusTones, withEvent } from '../../utils/money/kyc';
import { KycReviewSheet } from '../../components/admin/KycReviewSheet';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { audit, flagOn, staffActor, useAdminStore } from '../../utils/admin/store';
import { effectiveStatus, newApproval } from '../../utils/admin/approvals';
import { useStaffSession } from '../../hooks/useStaffSession';
import { ApprovalQueue } from '../../components/admin/ApprovalQueue';
import type { PendingApproval } from '../../types/admin';
import { balances, MONEY_EVENT, payoutTier, readMoney, tierInfo, writeMoney } from '../../utils/money/store';
import { uid } from '../../utils/id';
import { formatNgn, formatRelative } from '../../utils/format';
import { convertExampleNaira, formatMoney, type CurrencyCode } from '../../utils/currency';
import { formatTotals, workspaceCurrency } from '../../utils/admin/workspaceMoney';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Menu } from '../../components/ui/Menu';
import { IconButton } from '../../components/ui/IconButton';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { Card } from '../../components/ui/layout/Card';
import { ReasonDialog } from '../../components/admin/ReasonDialog';
import { useT } from '../../contexts/LocaleContext';

type Tab = 'queue' | 'wallets' | 'identity' | 'providers';
type KycFilter = 'waiting' | 'changes' | 'approved' | 'rejected' | 'all';
const kycFilters: Record<KycFilter, {label: string;empty: string;match: (s: KycStatus) => boolean;}> = {
  waiting: { label: 'Waiting', empty: 'No verifications are waiting', match: (s) => s === 'in_review' },
  changes: { label: 'Changes requested', empty: 'No owners are fixing changes', match: (s) => s === 'needs_info' },
  approved: { label: 'Approved', empty: 'No approved verifications yet', match: (s) => s === 'approved' },
  rejected: { label: 'Not approved', empty: 'Nothing has been rejected', match: (s) => s === 'rejected' },
  all: { label: 'All', empty: 'No verifications have been sent', match: () => true }
};
const LARGE_PAYOUT = 100_000;
const NEW_BANK_DAYS = 7;

interface PayoutRow {
  id: string;
  workspaceId: string;
  workspace: string;
  /** The workspace's own currency — payouts and balances are stored in it (D494). */
  currency: CurrencyCode;
  payout: Payout;
  risks: string[];
}
interface WalletRow {
  id: string;
  workspace: string;
  currency: CurrencyCode;
  money: MoneyData;
}

/** The ₦100,000 "large payout" rule, at the day's rate for payouts in other currencies (D494). */
const isLarge = (row: PayoutRow) => row.payout.amountNgn >= convertExampleNaira(LARGE_PAYOUT, row.currency);

type Pending =
{kind: 'hold' | 'release' | 'return';row: PayoutRow;} |
{kind: 'freeze' | 'unfreeze';row: WalletRow;};

const providers = [
{ name: 'Payment provider (cards, transfer, USSD)', status: 'Operational', tone: 'success' as const },
{ name: 'Escrow trustee partner', status: 'Not chosen', tone: 'neutral' as const },
{ name: 'Payouts (NIP transfers)', status: 'Operational', tone: 'success' as const },
{ name: 'Identity checks — Nigeria (BVN / NIN / CAC)', status: 'Degraded — slow responses', tone: 'warning' as const },
{ name: 'Identity checks — Kenya (IPRS / KRA / BRS)', status: 'Simulated — no partner yet', tone: 'neutral' as const },
{ name: 'Identity checks — Ghana (NIA / Registrar of Companies)', status: 'Simulated — no partner yet', tone: 'neutral' as const },
{ name: 'Identity checks — South Africa (Home Affairs / SARS / CIPC)', status: 'Simulated — no partner yet', tone: 'neutral' as const }];


/** Super admin → Payments & providers (D92): payout queue, wallet freezes, identity reviews and provider health. */
export function AdminPayments() {
  const { workspaces } = useWorkspace();
  const [adminStore, setStore] = useAdminStore();
  const me = useStaffSession();
  // Follows the console language (D490); audit entries, reasons, owner-facing labels and workspace names stay as recorded.
  const { t } = useT();
  const releaseApproved = (a: PendingApproval) => {
    if (!a.workspaceId || !a.payoutId) return;
    writeMoney(a.workspaceId, ((d: MoneyData) => ({ ...d, payouts: d.payouts.map((p) => p.id === a.payoutId ? { ...p, status: 'processing' as const, holdReason: null, createdAt: new Date().toISOString() } : p) }))(readMoney(a.workspaceId)));
    setTick((t) => t + 1);
  };
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => ['queue', 'wallets', 'identity', 'providers'].includes(params.get('tab') ?? '') ? params.get('tab') as Tab : 'queue');
  const [tick, setTick] = useState(0);
  // A seller submitting verification (or any wallet change) refreshes this page without a reload (D244).
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith('kubicu.money.')) bump();
    };
    window.addEventListener(MONEY_EVENT, bump);
    window.addEventListener('storage', onStorage);
    const t = window.setInterval(bump, 30000);
    return () => {
      window.removeEventListener(MONEY_EVENT, bump);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(t);
    };
  }, []);
  useEffect(() => {
    const t = params.get('tab');
    if (t === 'queue' || t === 'wallets' || t === 'identity' || t === 'providers') setTab(t);
  }, [params]);
  const [pending, setPending] = useState<Pending | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);

  const wallets: WalletRow[] = useMemo(() => workspaces.map((w) => ({ id: w.id, workspace: w.name, currency: workspaceCurrency(w), money: readMoney(w.id) })), [workspaces, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const queue: PayoutRow[] = useMemo(
    () =>
    wallets.flatMap((w) =>
    w.money.payouts.
    filter((p) => p.status === 'processing' || p.status === 'on_hold').
    map((p) => {
      const bank = w.money.banks.find((b) => b.id === p.bankId);
      const risks: string[] = [];
      if (bank && Date.now() - Date.parse(bank.addedAt) < NEW_BANK_DAYS * 86_400_000) risks.push(t('New bank account'));
      const large = convertExampleNaira(LARGE_PAYOUT, w.currency);
      if (p.amountNgn >= large) risks.push(t('Over {amount}', { amount: formatMoney(large, w.currency) }));
      if (bank?.nameMatch === 'close') risks.push(t('Name partly matches'));
      return { id: `${w.id}:${p.id}`, workspaceId: w.id, workspace: w.workspace, currency: w.currency, payout: p, risks };
    })
    ),
    [wallets, t]
  );
  const reviews = wallets.filter((w) => w.money.kyc.status === 'in_review').sort((a, b) => Date.parse(a.money.kyc.submittedAt ?? '') - Date.parse(b.money.kyc.submittedAt ?? ''));
  // D252: every case ever sent stays findable after a decision.
  const [kycFilter, setKycFilter] = useState<KycFilter>('waiting');
  const cases = useMemo(() => wallets.filter((w) => !!w.money.kyc.submittedAt || w.money.kyc.history.length > 0), [wallets]);
  const kycCount = (f: KycFilter) => cases.filter((w) => kycFilters[f].match(w.money.kyc.status)).length;
  const shownCases = useMemo(() => {
    const list = cases.filter((w) => kycFilters[kycFilter].match(w.money.kyc.status));
    return kycFilter === 'waiting' ?
    list.sort((a, b) => Date.parse(a.money.kyc.submittedAt ?? '') - Date.parse(b.money.kyc.submittedAt ?? '')) :
    list.sort((a, b) => Date.parse(b.money.kyc.decidedAt ?? b.money.kyc.submittedAt ?? '') - Date.parse(a.money.kyc.decidedAt ?? a.money.kyc.submittedAt ?? ''));
  }, [cases, kycFilter]);
  // Opened from Users & tenants → "Verification" (…?tab=identity&ws=<id>).
  useEffect(() => {
    const ws = params.get('ws');
    if (!ws) return;
    const status = readMoney(ws).kyc.status;
    setKycFilter(status === 'in_review' ? 'waiting' : 'all');
    setReviewing(ws);
  }, [params]);
  const reviewRow = reviewing ? wallets.find((w) => w.id === reviewing) ?? null : null;
  const isLead = me?.role === 'lead';
  const frozen = wallets.filter((w) => w.money.frozen);
  const held = formatTotals(wallets.map((w) => ({ currency: w.currency, amount: balances(w.money).held })));

  const change = (workspaceId: string, fn: (d: MoneyData) => MoneyData) => {
    writeMoney(workspaceId, fn(readMoney(workspaceId)));
    setTick((t) => t + 1);
  };

  const confirm = (reason: string) => {
    if (!pending) return;
    const by = staffActor();
    const now = new Date().toISOString();
    if (pending.kind === 'release' && isLarge(pending.row)) {
      // Large releases need a second Finance or Platform lead (D130).
      const { row } = pending;
      const amount = formatMoney(row.payout.amountNgn, row.currency);
      if (adminStore.approvals.some((a) => a.kind === 'payout_release' && a.payoutId === row.payout.id && effectiveStatus(a) === 'pending')) {
        toast(t('This release is already waiting for approval'));
      } else {
        const req = newApproval({ kind: 'payout_release', summary: `Release ${amount} payout · ${row.workspace}`, targetId: row.id, targetEmail: `${row.workspace} · ${amount}`, workspaceId: row.workspaceId, payoutId: row.payout.id, amountNgn: row.payout.amountNgn, reason, requestedById: me?.id ?? '', requestedBy: staffActor() });
        setStore((s) => audit({ ...s, approvals: [req, ...s.approvals] }, { area: 'approvals', action: `Requested: ${req.summary}`, target: req.targetEmail, reason }));
        toast.success(t('Sent for a second approval'), { description: t('Payouts of {amount} or more need another Finance or Platform lead. It stays on hold until then.', { amount: formatNgn(LARGE_PAYOUT) }) });
      }
      setPending(null);
      return;
    }
    if (pending.kind === 'hold' || pending.kind === 'release' || pending.kind === 'return') {
      const { row } = pending;
      change(row.workspaceId, (d) => {
        if (pending.kind === 'hold') return { ...d, payouts: d.payouts.map((p) => p.id === row.payout.id ? { ...p, status: 'on_hold', holdReason: reason } : p) };
        if (pending.kind === 'release') return { ...d, payouts: d.payouts.map((p) => p.id === row.payout.id ? { ...p, status: 'processing', holdReason: null, createdAt: now } : p) };
        return {
          ...d,
          payouts: d.payouts.map((p) => p.id === row.payout.id ? { ...p, status: 'failed', settledAt: now, failureReason: `Returned by KUBICU: ${reason}` } : p),
          ledger: [{ id: uid('led'), at: now, kind: 'payout_returned', amountNgn: row.payout.amountNgn + row.payout.feeNgn, state: 'available', label: `Payout returned by KUBICU · ${row.payout.bankLabel}`, ref: { type: 'payout', id: row.payout.id } }, ...d.ledger]
        };
      });
      const action = pending.kind === 'hold' ? 'Held payout' : pending.kind === 'release' ? 'Released payout' : 'Returned payout to wallet';
      setStore((s) => audit(s, { area: 'payments', action, target: `${row.workspace} · ${formatMoney(row.payout.amountNgn, row.currency)}`, reason }));
      toast.success(t(action));
    } else if (pending.kind === 'freeze' || pending.kind === 'unfreeze') {
      const { row } = pending;
      change(row.id, (d) => ({ ...d, frozen: pending.kind === 'freeze' ? { reason, at: now, by } : null }));
      setStore((s) => audit(s, { area: 'payments', action: pending.kind === 'freeze' ? 'Paused payouts' : 'Resumed payouts', target: row.workspace, reason }));
      toast.success(t(pending.kind === 'freeze' ? 'Payouts paused for this workspace' : 'Payouts resumed'));
    }
    setPending(null);
  };

  // ——— Verification decisions (D93) ———
  const decide = (row: WalletRow, kind: 'approve' | 'request' | 'reject' | 'withdraw', reason: string, requests: KycRequest[] = []) => {
    const by = staffActor();
    const now = new Date().toISOString();
    if (kind === 'withdraw') {
      // D252: a Platform lead can take an approval back — limits drop to unverified and the owner sees why.
      if (!isLead) return;
      change(row.id, (d) => ({
        ...d,
        verification: { tier: 0, pending: null, rejectedNote: reason },
        kyc: withEvent({ ...d.kyc, status: 'rejected', decidedAt: now, decidedBy: by, note: `Approval withdrawn: ${reason}`, requests: [] }, 'Approval withdrawn', by)
      }));
      setStore((s) => audit(s, { area: 'payments', action: 'Withdrew verification approval', target: row.workspace, reason }));
      toast.success(t('Approval withdrawn'), { description: t('Payouts are back to unverified limits. The owner sees your reason and can send verification again.') });
      setReviewing(null);
      return;
    }
    change(row.id, (d) => {
      const k = d.kyc;
      if (kind === 'approve') {
        const tier = k.entity ? entityInfo[k.entity].tier : 2;
        return { ...d, verification: { tier, pending: null, rejectedNote: null }, kyc: withEvent({ ...k, status: 'approved', decidedAt: now, decidedBy: by, note: null, requests: [] }, `Approved · ${tierInfo[tier].label}`, by) };
      }
      if (kind === 'request') return { ...d, kyc: withEvent({ ...k, status: 'needs_info', decidedAt: now, decidedBy: by, requests }, `Changes requested (${requests.length})`, by) };
      return { ...d, verification: { tier: 0, pending: null, rejectedNote: reason }, kyc: withEvent({ ...k, status: 'rejected', decidedAt: now, decidedBy: by, note: reason, requests: [] }, 'Not approved', by) };
    });
    const action = kind === 'approve' ? 'Approved verification' : kind === 'request' ? 'Asked for verification changes' : 'Rejected verification';
    setStore((s) => audit(s, { area: 'payments', action, target: row.workspace, reason }));
    toast.success(t(kind === 'approve' ? 'Verified — payouts are on for this workspace' : kind === 'request' ? 'Request sent — the owner sees each note' : 'Rejected — the owner sees your reason'));
    setReviewing(null);
  };

  const payoutStatus = (p: Payout) => p.status === 'on_hold' ? <Badge tone="warning" dot>{t('On hold')}</Badge> : <Badge tone="info" dot>{t('Processing')}</Badge>;

  const queueCols: DataColumn<PayoutRow>[] = [
  { key: 'ws', header: t('Workspace'), render: (r) => <span className="font-medium text-fg">{r.workspace}</span> },
  { key: 'bank', header: t('To'), hideOnMobile: true, render: (r) => <span className="text-fg-muted">{r.payout.bankLabel}</span> },
  {
    key: 'risk',
    header: t('Flags'),
    render: (r) =>
    r.risks.length ?
    <span className="flex flex-wrap gap-1">
            {r.risks.map((x) =>
      <Badge key={x} tone="warning" icon={AlertTriangleIcon}>
                {x}
              </Badge>
      )}
          </span> :

    <span className="text-fg-subtle">—</span>

  },
  { key: 'status', header: t('Status'), render: (r) => payoutStatus(r.payout) },
  { key: 'amount', header: t('Amount'), align: 'right', sortValue: (r) => r.payout.amountNgn, render: (r) => <span className="font-semibold tabular-nums text-fg">{formatMoney(r.payout.amountNgn, r.currency)}</span> },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (r) =>
    <Menu
      items={[
      r.payout.status === 'on_hold' ?
      { id: 'release', label: t('Release payout…'), icon: PlayIcon, onSelect: () => setPending({ kind: 'release', row: r }) } :
      { id: 'hold', label: t('Hold payout…'), icon: PauseIcon, onSelect: () => setPending({ kind: 'hold', row: r }) },
      { id: 'return', label: t('Return to wallet…'), icon: Undo2Icon, onSelect: () => setPending({ kind: 'return', row: r }) }]
      }
      trigger={(props) => <IconButton {...props} size="sm" icon={MoreHorizontalIcon} label={t('Actions for the {name} payout', { name: r.workspace })} />} />


  }];


  const walletCols: DataColumn<WalletRow>[] = [
  { key: 'ws', header: t('Workspace'), render: (r) => <span className="font-medium text-fg">{r.workspace}</span> },
  {
    key: 'tier',
    header: t('Verification'),
    render: (r) =>
    r.money.kyc.status === 'approved' ?
    <span className="text-fg-muted">{t(tierInfo[payoutTier(r.money)].label)}</span> :

    <Badge tone={statusTones[r.money.kyc.status]}>{t(statusLabels[r.money.kyc.status])}</Badge>

  },
  { key: 'avail', header: t('Available'), align: 'right', sortValue: (r) => balances(r.money).available, render: (r) => <span className="tabular-nums text-fg">{formatMoney(balances(r.money).available, r.currency)}</span> },
  { key: 'held', header: t('In escrow'), align: 'right', hideOnMobile: true, render: (r) => <span className="tabular-nums text-fg-muted">{formatMoney(balances(r.money).held, r.currency)}</span> },
  { key: 'state', header: t('Payouts'), render: (r) => r.money.frozen ? <Badge tone="danger" dot>{t('Paused')}</Badge> : <Badge tone="success" dot>{t('Normal')}</Badge> },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (r) =>
    r.money.frozen ?
    <Button size="sm" variant="tertiary" leadingIcon={PlayIcon} onClick={() => setPending({ kind: 'unfreeze', row: r })}>
            {t('Resume')}
          </Button> :

    <Button size="sm" variant="tertiary" leadingIcon={SnowflakeIcon} onClick={() => setPending({ kind: 'freeze', row: r })}>
            {t('Pause payouts')}
          </Button>

  }];


  const dialogCopy: Record<Pending['kind'], {title: string;label: string;destructive?: boolean;description: string;}> = {
    hold: { title: 'Hold this payout', label: 'Hold payout', description: 'The owner sees that KUBICU is checking it, with your reason.' },
    release:
    pending?.kind === 'release' && isLarge(pending.row) ?
    { title: 'Release this payout', label: 'Send for approval', description: `Payouts of ${formatNgn(LARGE_PAYOUT)} or more need a second Finance or Platform lead. It stays on hold until they approve.` } :
    { title: 'Release this payout', label: 'Release', description: 'It goes to the bank straight away.' },
    return: { title: 'Return payout to the wallet', label: 'Return to wallet', destructive: true, description: 'The money goes back to the seller’s available balance. Nothing is lost.' },
    freeze: { title: 'Pause payouts for this workspace', label: 'Pause payouts', destructive: true, description: 'Sales keep arriving; only payouts stop. The owner sees your reason word for word.' },
    unfreeze: { title: 'Resume payouts', label: 'Resume payouts', description: 'Payouts and schedules start working again.' }
  };

  const decidedCols: DataColumn<WalletRow>[] = [
  { key: 'ws', header: t('Workspace'), render: (r) => <span className="font-medium text-fg">{r.workspace}</span> },
  { key: 'type', header: t('Type'), hideOnMobile: true, render: (r) => <span className="text-fg-muted">{r.money.kyc.entity ? t(entityInfo[r.money.kyc.entity].short) : '—'}</span> },
  { key: 'status', header: t('Status'), render: (r) => <Badge tone={statusTones[r.money.kyc.status]}>{t(r.money.kyc.history[r.money.kyc.history.length - 1]?.label === 'Approval withdrawn' && r.money.kyc.status === 'rejected' ? 'Approval withdrawn' : statusLabels[r.money.kyc.status])}</Badge> },
  {
    key: 'decided',
    header: t('Decided'),
    hideOnMobile: true,
    sortValue: (r) => Date.parse(r.money.kyc.decidedAt ?? ''),
    render: (r) =>
    <span className="text-fg-muted">
          {r.money.kyc.decidedAt ? `${formatRelative(r.money.kyc.decidedAt)}${r.money.kyc.decidedBy ? ` · ${r.money.kyc.decidedBy}` : ''}` : '—'}
        </span>

  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (r) =>
    <Button size="sm" variant={r.money.kyc.status === 'in_review' ? 'secondary' : 'tertiary'} onClick={() => setReviewing(r.id)}>
          {t(r.money.kyc.status === 'in_review' ? 'Review' : 'Open')}
        </Button>

  }];


  const reviewCols: DataColumn<WalletRow>[] = [
  { key: 'ws', header: t('Workspace'), render: (r) => <span className="font-medium text-fg">{r.workspace}</span> },
  { key: 'type', header: t('Type'), render: (r) => <span className="text-fg-muted">{r.money.kyc.entity ? t(entityInfo[r.money.kyc.entity].short) : '—'}</span> },
  {
    key: 'risk',
    header: t('Flags'),
    render: (r) => {
      const risks = kycRisks(r.money.kyc);
      return risks.length ?
      <span className="flex flex-wrap gap-1">
            {risks.slice(0, 2).map((x) =>
        <Badge key={x} tone="warning" icon={AlertTriangleIcon}>
                {x}
              </Badge>
        )}
            {risks.length > 2 && <Badge tone="neutral">+{risks.length - 2}</Badge>}
          </span> :

      <Badge tone="success">{t('All checks matched')}</Badge>;

    }
  },
  {
    key: 'sent',
    header: t('Waiting'),
    hideOnMobile: true,
    sortValue: (r) => Date.parse(r.money.kyc.submittedAt ?? ''),
    render: (r) => {
      const at = r.money.kyc.submittedAt;
      const late = at && Date.now() - Date.parse(at) > REVIEW_HOURS * 3_600_000;
      return <span className={late ? 'font-medium text-danger' : 'text-fg-muted'}>{at ? `${formatRelative(at)}${late ? ` · ${t('overdue')}` : ''}` : '—'}</span>;
    }
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (r) =>
    <Button size="sm" variant="secondary" onClick={() => setReviewing(r.id)}>
          {t('Review')}
        </Button>

  }];

  const rawCopy = pending ? dialogCopy[pending.kind] : null;
  const copy = rawCopy ? { ...rawCopy, title: t(rawCopy.title), label: t(rawCopy.label), description: pending?.kind === 'release' && isLarge(pending.row) ? t('Payouts of {amount} or more need a second Finance or Platform lead. It stays on hold until they approve.', { amount: formatNgn(LARGE_PAYOUT) }) : t(rawCopy.description) } : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title={t('Payments & providers')} description={t('Watch payouts, pause a wallet that looks wrong and review identity checks. Staff never move money into or out of a seller’s wallet themselves.')} />

      <ApprovalQueue kinds={['payout_release']} title={t('Large payouts waiting for a second person')} description={t('Releasing a held payout of {amount} or more needs another Finance or Platform lead.', { amount: formatNgn(LARGE_PAYOUT) })} onApproved={releaseApproved} />

      <StatGroup columns={4} className="mt-8 items-end border-b border-line pb-6">
        <Stat primary label={t('Payouts in the queue')} value={queue.length} hint={t('Flagged: {n}', { n: queue.filter((r) => r.risks.length).length })} />
        <Stat label={t('Verifications to review')} value={reviews.length} hint={t('Target: within {hours} hours', { hours: REVIEW_HOURS })} />
        <Stat label={t('Payouts paused')} value={frozen.length} hint={t('Workspaces')} />
        <Stat label={t('Held in escrow')} value={held} hint={t('All workspaces')} />
      </StatGroup>

      <div className="mt-8 flex flex-col gap-5">
        <Tabs<Tab>
          idPrefix="admin-pay"
          ariaLabel={t('Payments areas')}
          value={tab}
          onChange={setTab}
          items={[
          { id: 'queue', label: t('Payout queue'), badge: queue.length || undefined },
          { id: 'wallets', label: t('Wallets') },
          { id: 'identity', label: t('Verification'), badge: reviews.length || undefined },
          { id: 'providers', label: t('Providers') }]
          } />
        
        <div role="tabpanel" id={`admin-pay-panel-${tab}`} aria-labelledby={`admin-pay-tab-${tab}`}>
          {tab === 'queue' && <DataTable caption={t('Payouts not yet paid')} rows={queue} columns={queueCols} filterText={(r) => `${r.workspace} ${r.payout.bankLabel}`} filterPlaceholder={t('Search workspace or bank')} emptyTitle={t('The queue is empty')} emptyDescription={t('Payouts finish within seconds in the prototype. Held payouts wait here.')} />}
          {tab === 'wallets' && <DataTable caption={t('Wallets')} rows={wallets} columns={walletCols} filterText={(r) => r.workspace} filterPlaceholder={t('Search workspace')} emptyTitle={t('No wallets')} emptyDescription={t('Wallets appear as workspaces are created.')} />}
          {tab === 'identity' &&
          <div className="flex flex-col gap-4">
              <div role="group" aria-label={t('Show verifications')} className="flex gap-1.5 overflow-x-auto overflow-y-hidden pb-0.5">
                {(Object.keys(kycFilters) as KycFilter[]).map((f) => {
                const on = kycFilter === f;
                const n = kycCount(f);
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setKycFilter(f)}
                    className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-label transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${on ? 'border-fg bg-fg font-semibold text-canvas' : 'border-line bg-raised text-fg-muted hover:bg-sunken hover:text-fg'}`}>
                    
                      {t(kycFilters[f].label)}
                      <span className={`tabular-nums ${on ? 'opacity-80' : 'text-fg-subtle'}`}>{n}</span>
                    </button>);

              })}
              </div>
              {kycFilter === 'waiting' ?
            <DataTable caption={t('Verification cases waiting for review, oldest first')} rows={shownCases} columns={reviewCols} filterText={(r) => r.workspace} filterPlaceholder={t('Search workspace')} emptyTitle={t('No verifications are waiting')} emptyDescription={t('Cases appear here when an owner sends their business verification. Decided cases are under Approved, Not approved and All.')} /> :

            <DataTable caption={t('Verification cases · {filter}, newest decision first', { filter: t(kycFilters[kycFilter].label) })} rows={shownCases} columns={decidedCols} filterText={(r) => r.workspace} filterPlaceholder={t('Search workspace')} emptyTitle={t(kycFilters[kycFilter].empty)} emptyDescription={t('Every case an owner has sent stays here after a decision, with its full history.')} />
            }
            </div>
          }
          {tab === 'providers' &&
          <Card title={t('Provider health')} description={t('Illustrative — no provider is integrated yet. Secrets and keys are never shown here.')} body="flush">
              <ul className="divide-y divide-line border-t border-line">
                {providers.map((p) =>
              <li key={p.name} className="flex items-center justify-between gap-3 px-5 py-3.5 md:px-6">
                    <span className="text-label text-fg">{t(p.name)}</span>
                    <Badge tone={p.tone} dot>
                      {t(p.status)}
                    </Badge>
                  </li>
              )}
              </ul>
            </Card>
          }
        </div>
      </div>

      {copy && <ReasonDialog open={!!pending} onClose={() => setPending(null)} onConfirm={confirm} title={copy.title} description={copy.description} confirmLabel={copy.label} destructive={copy.destructive} />}
      <KycReviewSheet
        open={!!reviewRow}
        onClose={() => setReviewing(null)}
        workspace={reviewRow?.workspace ?? ''}
        money={reviewRow?.money ?? null}
        onApprove={(note) => reviewRow && decide(reviewRow, 'approve', note)}
        onRequest={(requests, summary) => reviewRow && decide(reviewRow, 'request', summary, requests)}
        onReject={(reason) => reviewRow && decide(reviewRow, 'reject', reason)}
        canWithdraw={isLead}
        onWithdraw={(reason) => reviewRow && decide(reviewRow, 'withdraw', reason)}
        tick={reviewRow ? { platformOn: flagOn(adminStore, 'verified_tick'), hidden: adminStore.verifiedTickOff?.[reviewRow.id] ?? null } : undefined}
        onTick={(show, reason) => {
          if (!reviewRow) return;
          setStore((s) => {
            const { [reviewRow.id]: _gone, ...rest } = s.verifiedTickOff ?? {};
            const next = show ? rest : { ...rest, [reviewRow.id]: { reason, at: new Date().toISOString(), by: staffActor(s) } };
            return audit({ ...s, verifiedTickOff: next }, { area: 'payments', action: show ? 'Showed verified tick again' : 'Hid verified tick', target: reviewRow.workspace, reason });
          });
          toast.success(t(show ? 'Verified tick showing again' : 'Verified tick hidden'), { description: t('Their public pages update straight away.') });
        }} />
      
    </div>);

}