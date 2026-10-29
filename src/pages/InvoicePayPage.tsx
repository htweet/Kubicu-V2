import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircle2Icon, CircleIcon, ShieldCheckIcon, XCircleIcon } from 'lucide-react';
import type { ServiceOsData } from '../types/serviceOs';
import type { PageTheme } from '../types/page';
import type { StageRow } from '../utils/milestones';
import { useResolvedPage } from '../hooks/useResolvedPage';
import { balanceOf, formatDay, lineTotal, paidOf, readServiceOs, SERVICE_OS_EVENT, todayKey, vatSplit, writeServiceOs } from '../utils/serviceOs';
import { vatRateLabel } from '../utils/commerce/shopSettings';
import { stageRows } from '../utils/milestones';
import { inspectionDays, methodFor, readMoney, recordInvoicePayment, writeMoney } from '../utils/money/store';
import { formatNgn, formatTimestamp } from '../utils/format';
import { uid } from '../utils/id';
import { PageSurface } from '../components/blocks/PageSurface';
import { cardStyle, mix } from '../components/blocks/pageStyle';
import { CheckoutHeading, PrimaryButton, SecondaryButton, TestModeNote } from '../components/checkout/checkoutUi';
import { Unavailable } from './PublicPage';

type Step = 'view' | 'pay' | 'done' | 'declined';

/** What a client opens from an invoice or payment-stage link (D95): what's due, the full stage plan, test card, receipt. */
export function InvoicePayPage() {
  const { handle = '', invoiceId = '' } = useParams();
  const page = useResolvedPage(handle);
  const workspaceId = page?.workspaceId ?? null;
  const [data, setData] = useState<ServiceOsData | null>(null);
  const [step, setStep] = useState<Step>('view');
  const [outcome, setOutcome] = useState<'success' | 'declined'>('success');
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<{number: string;at: string;amount: number;escrow: boolean;} | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    const load = () => setData(readServiceOs(workspaceId));
    load();
    window.addEventListener(SERVICE_OS_EVENT, load);
    return () => window.removeEventListener(SERVICE_OS_EVENT, load);
  }, [workspaceId]);

  if (!page) return <Unavailable handle={handle} />;
  if (!data || !workspaceId) return null;
  const invoice = data.invoices.find((i) => i.id === invoiceId);
  // Drafts and voided invoices aren't payable or visible.
  if (!invoice || invoice.status === 'draft' || invoice.status === 'void')
  return <Unavailable handle={handle} title="We can’t find this invoice" body="The link may be incomplete, or the business cancelled this invoice. Ask them for a new link." />;

  const t = page.doc.theme;
  const muted = { color: t.mutedText };
  const business = page.doc.title;
  const quote = invoice.quoteId ? data.quotes.find((q) => q.id === invoice.quoteId) : undefined;
  const stages = quote && invoice.milestoneId ? stageRows(data, quote) : [];
  const stage = stages.find((r) => r.m.id === invoice.milestoneId);
  const balance = balanceOf(invoice);
  const split = vatSplit(invoice.items, invoice.vat);
  const overdue = invoice.status === 'sent' && invoice.dueDate < todayKey();
  const escrow = methodFor(readMoney(workspaceId), 'quotes') === 'escrow';

  const pay = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      if (outcome === 'declined') return setStep('declined');
      const sd = readServiceOs(workspaceId);
      const inv = sd.invoices.find((i) => i.id === invoice.id);
      const amount = inv ? balanceOf(inv) : 0;
      if (!inv || inv.status !== 'sent' || amount <= 0) return setStep('view');
      const money = recordInvoicePayment(readMoney(workspaceId), {
        invoiceId: inv.id,
        label: `${inv.number} · ${stage ? stage.m.label : inv.title} · ${inv.client.name}`,
        amountNgn: amount,
        milestone: !!inv.milestoneId
      });
      writeMoney(workspaceId, money.data);
      const at = new Date().toISOString();
      const payments = [...inv.payments, { id: uid('pay'), amountNgn: amount, method: 'online' as const, at, receipt: money.receipt, payerName: inv.client.name }];
      writeServiceOs(workspaceId, { ...sd, invoices: sd.invoices.map((i) => i.id === inv.id ? { ...i, payments, status: 'paid' } : i) });
      setReceipt({ number: money.receipt, at, amount, escrow: money.method === 'escrow' });
      setStep('done');
    }, 1100);
  };

  return (
    <div className="min-h-screen w-full" style={{ background: t.background }}>
      <PageSurface theme={t}>
        <main className="flex flex-col gap-5 py-6">
          <Link to={`/p/${handle}`} className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium" style={muted}>
            <ArrowLeftIcon size={15} aria-hidden /> {business}
          </Link>

          {step === 'done' && receipt ?
          <>
              <CheckCircle2Icon size={30} aria-hidden style={{ color: t.text }} />
              <CheckoutHeading theme={t} level={1} sub={`${business} has been told. Keep this page as your receipt.`}>
                {stage ? `“${stage.m.label}” paid` : 'Invoice paid'}
              </CheckoutHeading>
              <section aria-label="Receipt" className="flex flex-col gap-2 p-5 text-[14.5px]" style={{ ...cardStyle(t), color: t.text }}>
                <Row label="For" value={invoice.title} />
                <Row label="Invoice" value={invoice.number} />
                <Row label="Amount" value={formatNgn(receipt.amount)} strong />
                <Row label="Receipt" value={receipt.number} />
                <Row label="Paid" value={formatTimestamp(receipt.at)} />
                {receipt.escrow &&
              <p className="mt-2 flex items-start gap-2 text-[13px] leading-relaxed" style={muted}>
                    <ShieldCheckIcon size={15} className="mt-0.5 shrink-0" aria-hidden /> Held by our licensed payment partner and released to {business} after {inspectionDays.quotes} days.
                  </p>
              }
              </section>
              {stages.length > 0 && quote && <StagePlan rows={stageRows(readServiceOs(workspaceId), quote)} currentId={invoice.milestoneId} theme={t} />}
              <TestModeNote theme={t} />
            </> :
          step === 'declined' ?
          <>
              <XCircleIcon size={30} aria-hidden style={{ color: t.text }} />
              <CheckoutHeading theme={t} level={1} sub="Your card was declined (test). Nothing was charged.">
                Payment didn’t go through
              </CheckoutHeading>
              <PrimaryButton theme={t} onClick={() => setStep('pay')}>
                Try again
              </PrimaryButton>
            </> :

          <>
              <CheckoutHeading
              theme={t}
              level={1}
              sub={
              invoice.status === 'paid' ?
              `This invoice is paid in full. Thank you!` :
              `From ${business} for ${invoice.client.name}. ${overdue ? `Was due ${formatDay(invoice.dueDate)}.` : `Due ${formatDay(invoice.dueDate)}.`}`
              }>
              
                {stage ? `${stage.m.label} — ${invoice.title}` : invoice.title}
              </CheckoutHeading>

              <section aria-label="Invoice" className="flex flex-col p-5" style={cardStyle(t)}>
                <p className="text-[12.5px] font-medium" style={muted}>
                  Invoice {invoice.number}
                </p>
                <ul className="mt-3 flex flex-col">
                  {invoice.items.map((i) =>
                <li key={i.id} className="flex items-baseline justify-between gap-4 border-b py-2.5 text-[14.5px]" style={{ borderColor: mix(t.text, 10), color: t.text }}>
                      <span className="min-w-0">{i.label}</span>
                      <span className="shrink-0 tabular-nums">{formatNgn(lineTotal(i))}</span>
                    </li>
                )}
                </ul>
                {invoice.vat && split.vat > 0 &&
              <div className="mt-3 flex items-baseline justify-between text-[13.5px]" style={muted}>
                    <span>
                      {invoice.vat.inclusive ? 'Includes VAT' : 'VAT'} ({vatRateLabel(invoice.vat.ratePct)})
                    </span>
                    <span className="tabular-nums">{formatNgn(split.vat)}</span>
                  </div>
              }
                {paidOf(invoice) > 0 &&
              <div className="mt-3 flex items-baseline justify-between text-[13.5px]" style={muted}>
                    <span>Already paid</span>
                    <span className="tabular-nums">− {formatNgn(paidOf(invoice))}</span>
                  </div>
              }
                <div className="mt-2 flex items-baseline justify-between text-[16px] font-semibold" style={{ color: t.text }}>
                  <span>{invoice.status === 'paid' ? 'Total' : 'To pay now'}</span>
                  <span className="tabular-nums">{formatNgn(invoice.status === 'paid' ? split.total : balance)}</span>
                </div>
                {invoice.note &&
              <p className="mt-4 whitespace-pre-line text-[13.5px] leading-relaxed" style={muted}>
                    {invoice.note}
                  </p>
              }
              </section>

              {stages.length > 0 && <StagePlan rows={stages} currentId={invoice.milestoneId} theme={t} />}

              {invoice.status === 'sent' && balance > 0 && step === 'view' &&
            <PrimaryButton theme={t} onClick={() => setStep('pay')}>
                  Pay {formatNgn(balance)}
                </PrimaryButton>
            }

              {invoice.status === 'sent' && step === 'pay' &&
            <section aria-label="Pay" className="flex flex-col gap-4 p-5" style={cardStyle(t)}>
                  {escrow &&
              <p className="flex items-start gap-2 rounded-md px-3 py-2 text-[13px] leading-relaxed" style={{ background: mix(t.text, 6), color: t.text }}>
                      <ShieldCheckIcon size={15} className="mt-0.5 shrink-0" aria-hidden /> Protected by escrow: held by our licensed partner for {inspectionDays.quotes} days before {business} receives it.
                    </p>
              }
                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-1 text-[13px] font-medium" style={{ color: t.text }}>
                      Test card
                    </legend>
                    {(['success', 'declined'] as const).map((o) =>
                <label key={o} className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-[14px]" style={{ border: `1px solid ${mix(t.text, outcome === o ? 40 : 14)}`, color: t.text }}>
                        <input type="radio" name="invoice-card" checked={outcome === o} onChange={() => setOutcome(o)} />
                        {o === 'success' ? '4242 4242 4242 4242 — payment works' : '4000 0000 0000 0002 — declined'}
                      </label>
                )}
                  </fieldset>
                  <TestModeNote theme={t} />
                  <PrimaryButton theme={t} onClick={pay} disabled={busy}>
                    {busy ? 'Paying…' : `Pay ${formatNgn(balance)}`}
                  </PrimaryButton>
                  <SecondaryButton theme={t} onClick={() => setStep('view')}>
                    Back
                  </SecondaryButton>
                </section>
            }
            </>
          }

          <p className="text-[12.5px] leading-relaxed" style={muted}>
            Invoice from {business}, sent with KUBICU. Money is handled by our licensed payment partner.
          </p>
        </main>
      </PageSurface>
    </div>);

}

function StagePlan({ rows, currentId, theme: t }: {rows: StageRow[];currentId?: string;theme: PageTheme;}) {
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const paid = rows.reduce((s, r) => s + r.paid, 0);
  return (
    <section aria-labelledby="ip-plan" className="flex flex-col gap-3 p-5" style={cardStyle(t)}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="ip-plan" className="text-[15px] font-semibold" style={{ color: t.text }}>
          Payment plan
        </h2>
        <span className="text-[12.5px] tabular-nums" style={{ color: t.mutedText }}>
          {formatNgn(paid)} of {formatNgn(total)} paid
        </span>
      </div>
      <ol className="flex flex-col">
        {rows.map((r) => {
          const current = r.m.id === currentId;
          return (
            <li key={r.m.id} className="flex items-start gap-3 border-b py-2.5 last:border-b-0" style={{ borderColor: mix(t.text, 10), color: t.text }} aria-current={current ? 'step' : undefined}>
              {r.state === 'paid' ? <CheckCircle2Icon size={17} className="mt-0.5 shrink-0" aria-hidden /> : <CircleIcon size={17} className="mt-0.5 shrink-0" style={{ opacity: current ? 1 : 0.4 }} aria-hidden />}
              <span className="min-w-0 flex-1">
                <span className={current ? 'block text-[14.5px] font-semibold' : 'block text-[14.5px]'}>
                  {r.m.label}
                  {current && r.state !== 'paid' && ' · this payment'}
                </span>
                <span className="block text-[12.5px]" style={{ color: t.mutedText }}>
                  {r.state === 'paid' ? 'Paid' : r.when}
                </span>
              </span>
              <span className="shrink-0 text-[14.5px] tabular-nums">{formatNgn(r.amount)}</span>
            </li>);

        })}
      </ol>
    </section>);

}

function Row({ label, value, strong }: {label: string;value: string;strong?: boolean;}) {
  return (
    <div className={strong ? 'flex items-baseline justify-between gap-4 text-[16px] font-semibold' : 'flex items-baseline justify-between gap-4'}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>);

}