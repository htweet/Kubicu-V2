import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { GavelIcon, PaperclipIcon } from 'lucide-react';
import type { EscrowCase } from '../../types/escrow';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useT } from '../../contexts/LocaleContext';
import { MONEY_EVENT, readMoney, writeMoney } from '../../utils/money/store';
import { DECIDE_HOURS, issueLabels, stageLabels, stageTones, staffDecide } from '../../utils/money/escrow';
import { audit, staffActor, useAdminStore } from '../../utils/admin/store';
import { formatNgn, formatRelative, formatTimestamp } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Sheet } from '../../components/ui/Sheet';
import { DetailList, DetailSection } from '../../components/ui/layout/DetailList';
import { Button } from '../../components/ui/Button';
import { TextArea } from '../../components/ui/TextArea';
import { TextInput } from '../../components/ui/TextInput';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { EscrowTimeline } from '../../components/money/EscrowTimeline';
import { cn } from '../../utils/cn';

interface Row {
  id: string;
  workspaceId: string;
  workspace: string;
  c: EscrowCase;
}

type Tab = 'decide' | 'seller' | 'decided';
type Outcome = 'release' | 'refund' | 'partial';
type Tr = (s: string, v?: Record<string, string | number>) => string;

/**
 * Super admin → Escrow cases (D94): staff decide buyer-protection disputes that buyer and seller couldn’t settle.
 * Follows the console language (D492); what buyers and sellers wrote, the staff note and audit entries stay as recorded.
 */
export function AdminEscrow() {
  const { t } = useT();
  const { workspaces } = useWorkspace();
  const [, setStore] = useAdminStore();
  const [tab, setTab] = useState<Tab>('decide');
  const [openId, setOpenId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((x) => x + 1);
    const timer = window.setInterval(bump, 5000);
    window.addEventListener(MONEY_EVENT, bump);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(MONEY_EVENT, bump);
    };
  }, []);

  const rows: Row[] = useMemo(
    () => workspaces.flatMap((w) => readMoney(w.id).escrow.filter((c) => c.dispute).map((c) => ({ id: `${w.id}:${c.id}`, workspaceId: w.id, workspace: w.name, c }))),
    [workspaces, tick] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const toDecide = rows.filter((r) => r.c.stage === 'escalated').sort((a, b) => Date.parse(a.c.dispute?.escalatedAt ?? '') - Date.parse(b.c.dispute?.escalatedAt ?? ''));
  const withSeller = rows.filter((r) => r.c.stage === 'disputed');
  const decided = rows.filter((r) => r.c.dispute?.decision).sort((a, b) => Date.parse(b.c.dispute?.decision?.at ?? '') - Date.parse(a.c.dispute?.decision?.at ?? ''));
  const list = tab === 'decide' ? toDecide : tab === 'seller' ? withSeller : decided;
  const reserved = [...toDecide, ...withSeller].reduce((s, r) => s + r.c.grossNgn, 0);
  const overdue = toDecide.filter((r) => Date.now() - Date.parse(r.c.dispute?.escalatedAt ?? '') > DECIDE_HOURS * 3_600_000).length;
  const open = openId ? rows.find((r) => r.id === openId) ?? null : null;

  const columns: DataColumn<Row>[] = [
  {
    key: 'case',
    header: t('Order'),
    render: (r) =>
    <span className="min-w-0">
          <span className="block truncate font-semibold text-fg">
            #{r.c.orderNumber} · {r.c.buyerName}
          </span>
          <span className="block truncate text-caption text-fg-subtle">{r.workspace}</span>
        </span>

  },
  { key: 'issue', header: t('Problem'), hideOnMobile: true, render: (r) => <span className="text-fg-muted">{r.c.dispute ? t(issueLabels[r.c.dispute.issue]) : '—'}</span> },
  { key: 'stage', header: t('Status'), render: (r) => <Badge tone={stageTones[r.c.stage]}>{t(r.c.dispute?.decision ? decisionLabel(r.c) : stageLabels[r.c.stage])}</Badge> },
  {
    key: 'when',
    header: t(tab === 'decide' ? 'Waiting' : tab === 'seller' ? 'Seller reply due' : 'Decided'),
    hideOnMobile: true,
    sortValue: (r) => Date.parse((tab === 'decide' ? r.c.dispute?.escalatedAt : tab === 'seller' ? r.c.dispute?.respondBy : r.c.dispute?.decision?.at) ?? ''),
    render: (r) => {
      const at = tab === 'decide' ? r.c.dispute?.escalatedAt : tab === 'seller' ? r.c.dispute?.respondBy : r.c.dispute?.decision?.at;
      const late = tab === 'decide' && at && Date.now() - Date.parse(at) > DECIDE_HOURS * 3_600_000;
      return <span className={late ? 'font-medium text-danger' : 'text-fg-muted'}>{at ? tab === 'seller' ? formatTimestamp(at) : `${formatRelative(at)}${late ? ` · ${t('overdue')}` : ''}` : '—'}</span>;
    }
  },
  { key: 'amount', header: t('Paid'), align: 'right', sortValue: (r) => r.c.grossNgn, render: (r) => <span className="font-semibold tabular-nums text-fg">{formatNgn(r.c.grossNgn)}</span> },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (r) =>
    <Button size="sm" variant="secondary" onClick={() => setOpenId(r.id)}>
          {t(r.c.stage === 'escalated' ? 'Decide' : 'View')}
        </Button>

  }];


  const decide = (r: Row, outcome: Outcome, note: string, partialNgn?: number) => {
    const before = readMoney(r.workspaceId);
    const after = staffDecide(r.workspaceId, before, r.c.id, { outcome, note, partialNgn, by: staffActor() });
    if (after === before) {
      toast.error(t('Couldn’t record the decision'), { description: t('The case may have changed. Refresh and try again.') });
      return;
    }
    writeMoney(r.workspaceId, after);
    const label = outcome === 'release' ? 'Released escrow to seller' : outcome === 'refund' ? 'Refunded escrow to buyer' : `Split escrow (${formatNgn(partialNgn ?? 0)} to buyer)`;
    setStore((s) => audit(s, { area: 'escrow', action: label, target: `${r.workspace} · #${r.c.orderNumber}`, reason: note }));
    toast.success(t('Decision recorded'), { description: t('Buyer and seller both see your note word for word.') });
    setOpenId(null);
  };

  const openCount = toDecide.length + withSeller.length;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title={t('Escrow cases')} description={t('Buyer-protection problems that buyer and seller couldn’t settle. Read both sides, then release, refund or split. The partner moves the money on our instruction · Test mode.')} />

      <StatGroup columns={3} className="mt-8 items-end border-b border-line pb-6">
        <Stat primary label={t('To decide')} value={toDecide.length} hint={t('Target: within {days} days', { days: DECIDE_HOURS / 24 })} />
        <Stat label={t('Overdue')} value={<span className={overdue ? 'text-danger' : undefined}>{overdue}</span>} hint={t('Past the decision target')} />
        <Stat label={t('Reserved in open cases')} value={formatNgn(reserved)} hint={t('Cases: {n}', { n: openCount })} />
      </StatGroup>

      <div className="mt-8 flex flex-col gap-5">
        <Tabs<Tab>
          idPrefix="admin-escrow"
          ariaLabel={t('Escrow queues')}
          value={tab}
          onChange={setTab}
          items={[
          { id: 'decide', label: t('To decide'), badge: toDecide.length || undefined },
          { id: 'seller', label: t('Waiting on seller'), badge: withSeller.length || undefined },
          { id: 'decided', label: t('Decided') }]
          } />
        
        <div role="tabpanel" id={`admin-escrow-panel-${tab}`} aria-labelledby={`admin-escrow-tab-${tab}`}>
          <DataTable
            caption={t('Escrow cases')}
            rows={list}
            columns={columns}
            filterText={(r) => `${r.c.orderNumber} ${r.c.buyerName} ${r.workspace}`}
            filterPlaceholder={t('Search order, buyer or workspace')}
            emptyTitle={t(tab === 'decide' ? 'Nothing to decide' : tab === 'seller' ? 'No sellers are mid-reply' : 'No decisions yet')}
            emptyDescription={t('Cases arrive when a buyer or seller asks KUBICU to decide, or a seller misses the 48-hour reply.')} />
          
        </div>
      </div>

      <Sheet
        open={!!open}
        onClose={() => setOpenId(null)}
        side="right"
        size="lg"
        title={open ? t('Order #{n}', { n: open.c.orderNumber }) : t('Case')}
        description={open ? `${open.workspace} · ${t(stageLabels[open.c.stage])}` : undefined}>
        
        {open && <CaseReview row={open} onDecide={decide} t={t} />}
      </Sheet>
    </div>);

}

function decisionLabel(c: EscrowCase): string {
  const d = c.dispute?.decision;
  if (!d) return '';
  return d.outcome === 'release' ? 'Released to seller' : d.outcome === 'refund' ? 'Refunded to buyer' : 'Split';
}

function CaseReview({ row, onDecide, t }: {row: Row;onDecide: (r: Row, outcome: Outcome, note: string, partialNgn?: number) => void;t: Tr;}) {
  const { c } = row;
  const d = c.dispute!;
  const [outcome, setOutcome] = useState<Outcome>(d.wants === 'partial' ? 'partial' : 'refund');
  const [amount, setAmount] = useState(String(d.partialNgn ?? d.response?.partialNgn ?? ''));
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);
  const partial = Number(amount) || 0;
  const errors = {
    amount: outcome === 'partial' && (partial <= 0 || partial >= c.grossNgn) ? t('Enter an amount between ₦1 and {max}.', { max: formatNgn(c.grossNgn - 1) }) : undefined,
    note: note.trim().length < 20 ? t('Explain the decision in at least 20 characters. Buyer and seller see it word for word.') : undefined
  };

  return (
    <div className="flex flex-col gap-6 px-5 py-5">
      <DetailSection title={t('Case')}>
        <DetailList
          items={[
          { label: t('Buyer'), value: `${c.buyerName}${c.buyerPhone ? ` · ${c.buyerPhone}` : ''}` },
          { label: t('Buyer paid'), value: <span className="font-semibold tabular-nums">{formatNgn(c.grossNgn)}</span> },
          { label: t('Delivered'), value: c.deliveredAt ? formatTimestamp(c.deliveredAt) : t('Not marked delivered') },
          { label: t('Escalated'), value: d.escalatedAt ? `${formatRelative(d.escalatedAt)} · ${d.escalatedBy === 'system' ? t('by the deadline') : t('by {name}', { name: d.escalatedBy ?? '' })}` : '—' }]
          } />
        
      </DetailSection>

      <DetailSection title={`${t('Buyer')} · ${t(issueLabels[d.issue])}`}>
        <div>
          <p className="text-caption text-fg-subtle">{d.wants === 'full' ? t('Asks for a full refund') : t('Asks for {amount} back', { amount: formatNgn(d.partialNgn ?? 0) })}</p>
          <blockquote className="mt-2 border-l-2 border-line-strong pl-3 text-label text-fg-muted">“{d.details}”</blockquote>
          {d.escalationNote && <p className="mt-2 text-label text-fg-muted">{t('Escalation note:')} “{d.escalationNote}”</p>}
          <Files label={t('Buyer’s evidence')} names={d.evidence.map((f) => f.name)} />
        </div>
      </DetailSection>

      <DetailSection title={t('Seller')}>
        <div>
          {d.response ?
          <>
              <p className="text-caption text-fg-subtle">
                {d.response.kind === 'partial' ? t('Offered {amount} back', { amount: formatNgn(d.response.partialNgn ?? 0) }) : t('Disagrees')} · {formatTimestamp(d.response.at)}
              </p>
              <blockquote className="mt-2 border-l-2 border-line-strong pl-3 text-label text-fg-muted">“{d.response.text}”</blockquote>
              <Files label={t('Seller’s evidence')} names={d.response.evidence.map((f) => f.name)} />
            </> :

          <p className="text-label text-warning">{t('The seller didn’t reply within 48 hours.')}</p>
          }
          {c.deliveryNote && <p className="mt-2 text-label text-fg-muted">{t('Delivery note:')} “{c.deliveryNote}”</p>}
          <Files label={t('Proof of delivery')} names={c.proof.map((f) => f.name)} />
        </div>
      </DetailSection>

      {c.stage === 'escalated' ?
      <DetailSection
        title={
        <span className="flex items-center gap-2">
              <GavelIcon size={16} aria-hidden /> {t('Decision')}
            </span>
        }>
        
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">{t('Outcome')}</legend>
            {(
          [
          ['refund', t('Refund the buyer in full'), t('{amount} back to the buyer.', { amount: formatNgn(c.grossNgn) })],
          ['partial', t('Split'), t('Part back to the buyer, the rest released to the seller.')],
          ['release', t('Release to the seller'), t('The buyer’s problem isn’t upheld.')]] as
          const).
          map(([k, title, desc]) =>
          <label key={k} className={cn('flex min-h-[44px] cursor-pointer gap-3 rounded-md border px-3 py-2.5 transition-colors duration-150', outcome === k ? 'border-action bg-action-soft' : 'border-line hover:bg-sunken')}>
                <input type="radio" name="ae-outcome" className="mt-1" checked={outcome === k} onChange={() => setOutcome(k)} />
                <span>
                  <span className="block text-label font-medium text-fg">{title}</span>
                  <span className="block text-caption text-fg-subtle">{desc}</span>
                </span>
              </label>
          )}
          </fieldset>
          {outcome === 'partial' && <TextInput id="ae-amount" label={t('Refund to buyer (₦)')} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} error={tried ? errors.amount : undefined} />}
          <TextArea id="ae-note" label={t('Note to buyer and seller')} rows={4} value={note} onChange={(e) => setNote(e.target.value)} error={tried ? errors.note : undefined} hint={t('Shown word for word to both, and kept in the audit log.')} />
          <Button
          className="self-start"
          variant={outcome === 'release' ? 'primary' : 'destructive'}
          onClick={() => {
            setTried(true);
            if (errors.note || errors.amount) return;
            onDecide(row, outcome, note.trim(), outcome === 'partial' ? partial : undefined);
          }}>
          
            {outcome === 'release' ? t('Release to seller') : outcome === 'refund' ? t('Refund {amount}', { amount: formatNgn(c.grossNgn) }) : t('Record split')}
          </Button>
        </DetailSection> :
      d.decision ?
      <DetailSection title={t('Decided by {name}', { name: d.decision.by })}>
          <p className="text-label text-fg-muted">“{d.decision.note}”</p>
        </DetailSection> :
      null}

      <DetailSection title={t('History')}>
        <EscrowTimeline events={c.events} id={`ae-tl-${c.id}`} />
      </DetailSection>
    </div>);

}

function Files({ label, names }: {label: string;names: string[];}) {
  if (!names.length) return null;
  return (
    <div className="mt-2">
      <p className="text-caption font-semibold text-fg-subtle">{label}</p>
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {names.map((n, i) =>
        <li key={`${n}-${i}`} className="inline-flex items-center gap-1 rounded-md bg-sunken px-2 py-1 text-caption text-fg">
            <PaperclipIcon size={12} aria-hidden /> {n}
          </li>
        )}
      </ul>
    </div>);

}