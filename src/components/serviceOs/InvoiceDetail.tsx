import React, { useEffect, useState } from 'react';
import { BanIcon, CopyIcon, MessageCircleIcon, PrinterIcon, SendIcon, WalletIcon } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useEditor } from '../../contexts/EditorContext';
import { useMoney } from '../../hooks/useMoney';
import { printServiceInvoice } from '../../utils/serviceInvoicePrint';
import { ClientAudienceLink } from './ClientAudienceLink';
import { toast } from 'sonner';
import type { Invoice, PaymentMethod, ServiceOsData } from '../../types/serviceOs';
import { balanceOf, formatDay, invoiceLabels, invoiceTones, invoiceTotal, invoiceView, itemsTotal, manualMethods, methodLabels, paidOf, todayKey } from '../../utils/serviceOs';
import { TextArea } from '../ui/TextArea';
import { invoicePayPath } from '../../utils/milestones';
import { useMainLink } from '../../hooks/useMainLink';
import { formatNgn, formatTimestamp, whatsappLink } from '../../utils/format';
import { uid } from '../../utils/id';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Dialog } from '../ui/Dialog';
import { TextInput } from '../ui/TextInput';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Segmented } from '../ui/Segmented';
import { SampleTag } from '../commerce/StatusBadges';
import { LineItemsEditor, TotalRow } from './LineItemsEditor';

interface Props {
  invoice: Invoice | null;
  businessName: string;
  canEdit: boolean;
  update: (fn: (d: ServiceOsData) => ServiceOsData) => void;
  onClose: () => void;
  onOpenQuote: (id: string) => void;
}

/** One invoice: send it, record payments as they come in, or void it (D89). */
export function InvoiceDetail({ invoice, businessName, canEdit, update, onClose, onOpenQuote }: Props) {
  const [draft, setDraft] = useState<Invoice | null>(invoice);
  const [paying, setPaying] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('transfer');
  const [voiding, setVoiding] = useState(false);
  useEffect(() => setDraft(invoice), [invoice?.id, invoice?.status]); // eslint-disable-line react-hooks/exhaustive-deps
  const { mainHandle } = useMainLink();
  const { current } = useWorkspace();
  const { state } = useEditor();
  const money = useMoney(current.id);
  const profile = state.draft.blocks.find((b) => b.type === 'profile');
  const logo = { url: profile?.type === 'profile' ? profile.content.avatarUrl : '', accent: state.draft.theme.accent };

  if (!invoice || !draft) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;

  const view = invoiceView(invoice);
  const balance = balanceOf(invoice);
  const editable = canEdit && invoice.status === 'draft';
  const patch = (p: Partial<Invoice>) => update((d) => ({ ...d, invoices: d.invoices.map((i) => (i.id === invoice.id ? { ...i, ...p } : i)) }));
  const valid = itemsTotal(draft.items) > 0 && draft.items.every((i) => i.label.trim()) && draft.dueDate >= todayKey();
  const amountError = amount !== null && (amount <= 0 || amount > balance) ? `Enter up to ${formatNgn(balance)}.` : undefined;

  const record = () => {
    if (!amount || amountError) return;
    const payments = [...invoice.payments, { id: uid('pay'), amountNgn: amount, method, at: new Date().toISOString() }];
    const fullyPaid = payments.reduce((s, p) => s + p.amountNgn, 0) >= invoiceTotal(invoice);
    patch({ payments, status: fullyPaid ? 'paid' : 'sent' });
    toast.success(fullyPaid ? `${invoice.number} is paid in full` : `${formatNgn(amount)} recorded`);
    setPaying(false);
    setAmount(null);
  };
  const payUrl = `${window.location.origin}${invoicePayPath(mainHandle, invoice.id)}`;
  const print = () => {
    const bank = money.data.banks.find((b) => b.primary) ?? money.data.banks[0];
    const ok = printServiceInvoice(invoice, { business: businessName, bank, payUrl, accent: logo.accent, logoUrl: logo.url });
    if (!ok) toast.error('Allow pop-ups to print', { description: 'Your browser blocked the print window.' });
  };
  const remind = () => {
    const msg = `Hi ${invoice.client.name.split(' ')[0]}, a reminder from ${businessName}: invoice ${invoice.number} for ${invoice.title} has ${formatNgn(balance)} left to pay, due ${formatDay(invoice.dueDate)}. Pay securely here: ${payUrl} — thank you!`;
    window.open(whatsappLink(invoice.client.phone, msg), '_blank', 'noopener');
  };

  const footer = editable ? (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="secondary" onClick={() => (patch({ items: draft.items, dueDate: draft.dueDate, note: draft.note }), toast.success('Draft saved'))}>
        Save draft
      </Button>
      <Button leadingIcon={SendIcon} disabled={!valid} onClick={() => (patch({ items: draft.items, dueDate: draft.dueDate, note: draft.note, status: 'sent' }), toast.success('Marked as sent', { description: 'Share it with your client on WhatsApp.' }))}>
        Mark as sent
      </Button>
    </div>
  ) : invoice.status === 'sent' ? (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <Button variant="tertiary" leadingIcon={BanIcon} disabled={!canEdit || paidOf(invoice) > 0} title={paidOf(invoice) > 0 ? 'Invoices with payments can’t be voided' : undefined} onClick={() => setVoiding(true)} className="sm:mr-auto">
        Void
      </Button>
      <Button variant="secondary" leadingIcon={PrinterIcon} onClick={print}>
        Print / PDF
      </Button>
      <Button variant="secondary" leadingIcon={CopyIcon} onClick={() => navigator.clipboard?.writeText(payUrl).then(() => toast.success('Pay link copied'))}>
        Pay link
      </Button>
      <Button variant="secondary" leadingIcon={MessageCircleIcon} disabled={!invoice.client.phone} onClick={remind}>
        Send reminder
      </Button>
      <Button leadingIcon={WalletIcon} disabled={!canEdit} onClick={() => (setAmount(balance), setPaying(true))}>
        Record payment
      </Button>
    </div>
  ) : (
    <div className="flex justify-end">
      <Button variant="secondary" leadingIcon={PrinterIcon} onClick={print}>
        Print / PDF
      </Button>
    </div>
  );

  return (
    <>
      <Sheet open onClose={onClose} side="right" size="lg" title={`${invoice.number} · ${invoice.title}`} description={`For ${invoice.client.name}`} footer={footer}>
        <div className="flex flex-col gap-7 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={invoiceTones[view]} dot>
              {invoiceLabels[view]}
            </Badge>
            {invoice.sample && <SampleTag />}
            {invoice.quoteId && (
              <button type="button" onClick={() => onOpenQuote(invoice.quoteId!)} className="text-caption font-medium text-fg-muted underline-offset-2 hover:text-fg hover:underline">
                From quote
              </button>
            )}
          </div>

          <ClientAudienceLink client={invoice.client} label={`Invoice ${invoice.number}`} linkedId={invoice.id} canEdit={canEdit} />

          <section aria-labelledby="inv-items">
            <h3 id="inv-items" className="mb-2 text-label font-semibold text-fg">
              Items
            </h3>
            <LineItemsEditor
              items={draft.items}
              vat={invoice.vat}
              readOnly={!editable}
              onChange={(items) => setDraft({ ...draft, items })}
              footer={
                invoice.payments.length > 0 ? (
                  <>
                    <TotalRow label="Paid" value={`− ${formatNgn(paidOf(invoice))}`} />
                    <TotalRow label="Left to pay" value={formatNgn(balance)} tone="strong" />
                  </>
                ) : undefined
              }
            />
          </section>

          <section aria-labelledby="inv-due" className="border-t border-line pt-6">
            <h3 id="inv-due" className="sr-only">
              Due date
            </h3>
            {editable ? (
              <div className="flex flex-col gap-4">
                <TextInput id="inv-due-date" label="Due" type="date" min={todayKey()} value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} fieldClassName="sm:max-w-[50%] sm:pr-2" />
                <TextArea id="inv-note" label="Payment terms" optional rows={3} maxLength={400} value={draft.note ?? ''} hint="Shown on the pay page and the printed invoice." onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
              </div>
            ) : (
              <>
                <p className="text-label text-fg-muted">
                  Due <span className="font-medium text-fg">{formatDay(invoice.dueDate)}</span>
                </p>
                {invoice.note && <p className="mt-2 whitespace-pre-line text-label text-fg-muted">{invoice.note}</p>}
              </>
            )}
          </section>

          {invoice.payments.length > 0 && (
            <section aria-labelledby="inv-pay" className="border-t border-line pt-6">
              <h3 id="inv-pay" className="mb-2 text-label font-semibold text-fg">
                Payments
              </h3>
              <ul className="flex flex-col divide-y divide-line">
                {invoice.payments.map((p) => (
                  <li key={p.id} className="flex items-baseline justify-between gap-3 py-2 text-label">
                    <span className="text-fg">
                      {methodLabels[p.method]} <span className="text-fg-subtle">· {formatTimestamp(p.at)}</span>
                    </span>
                    <span className="font-medium tabular-nums text-fg">{formatNgn(p.amountNgn)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <p className="text-caption text-fg-subtle">Once sent, your client can pay online through the pay link (test card), or you can record a transfer or cash payment yourself. Online payments follow your Quotes & jobs payment setting in Commerce → Payments.</p>
        </div>
      </Sheet>

      <Dialog
        open={paying}
        onClose={() => setPaying(false)}
        title="Record a payment"
        description={`${formatNgn(balance)} left on ${invoice.number}.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPaying(false)}>
              Cancel
            </Button>
            <Button disabled={!amount || !!amountError} onClick={record}>
              Record {amount ? formatNgn(amount) : ''}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <CurrencyInput id="inv-amount" label="Amount received" value={amount} onChange={setAmount} error={amountError} />
          <div>
            <p className="mb-2 text-label font-medium text-fg">How they paid</p>
            <Segmented<PaymentMethod> ariaLabel="Payment method" value={method} onChange={setMethod} options={manualMethods.map((m) => ({ value: m, label: methodLabels[m] }))} />
          </div>
        </div>
      </Dialog>

      <Dialog
        open={voiding}
        onClose={() => setVoiding(false)}
        title={`Void ${invoice.number}?`}
        description="It stays in your records marked Void, and its amount can be invoiced again from the quote."
        footer={
          <>
            <Button variant="secondary" onClick={() => setVoiding(false)}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={() => (patch({ status: 'void' }), setVoiding(false), toast('Invoice voided'))}>
              Void invoice
            </Button>
          </>
        }
      />
    </>
  );
}
