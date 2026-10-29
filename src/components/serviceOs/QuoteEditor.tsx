import React, { useEffect, useState } from 'react';
import { BriefcaseIcon, CopyIcon, MessageCircleIcon, ReceiptIcon, SendIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Quote, ServiceOsData } from '../../types/serviceOs';
import type { DocVat } from '../../types/serviceOs';
import { depositOf, formatDay, invoiceFromQuote, invoiceTotal, itemsTotal, jobFromQuote, quoteLabels, quotePath, quoteProblems, quoteTones, quoteTotal, quoteView, todayKey, uninvoiced } from '../../utils/serviceOs';
import { vatRateLabel } from '../../utils/commerce/shopSettings';
import { formatNgn, whatsappLink } from '../../utils/format';
import { useMainLink } from '../../hooks/useMainLink';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { SelectInput } from '../ui/SelectInput';
import { InlineAlert } from '../ui/InlineAlert';
import { SampleTag } from '../commerce/StatusBadges';
import { Segmented } from '../ui/Segmented';
import { LineItemsEditor, TotalRow } from './LineItemsEditor';
import { MilestoneEditor } from './MilestoneEditor';
import { StageSchedule } from './StageSchedule';
import { builtInTemplates, hasStages, milestoneProblems, stagesFromTemplate } from '../../utils/milestones';

interface Props {
  quote: Quote | null;
  data: ServiceOsData;
  businessName: string;
  canEdit: boolean;
  update: (fn: (d: ServiceOsData) => ServiceOsData) => void;
  onClose: () => void;
  onOpenInvoice: (id: string) => void;
  onOpenJob: (id: string) => void;
  /** The Commerce VAT rate, when Commerce has one set (D257). */
  vatRate?: DocVat;
}

const depositOptions = [0, 20, 30, 50, 70, 100].map((v) => ({ value: String(v), label: v === 0 ? 'No deposit' : `${v}% up front` }));

/** Draft and send a quote; after the client accepts, invoice it and start the job (D89). */
export function QuoteEditor({ quote, data, businessName, canEdit, update, onClose, onOpenInvoice, onOpenJob, vatRate }: Props) {
  const { mainHandle } = useMainLink();
  const [draft, setDraft] = useState<Quote | null>(quote);
  const [tried, setTried] = useState(false);
  useEffect(() => {
    setDraft(quote);
    setTried(false);
  }, [quote?.id, quote?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!quote || !draft) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;

  const view = quoteView(quote);
  const editable = canEdit && quote.status === 'draft';
  const staged = hasStages(draft);
  const problems = [...quoteProblems(draft), ...(staged ? milestoneProblems(draft.milestones!) : [])];
  const setPlan = (plan: 'deposit' | 'stages') =>
  setDraft(plan === 'stages' ? { ...draft, depositPct: 0, milestones: draft.milestones?.length ? draft.milestones : stagesFromTemplate(builtInTemplates[1]) } : { ...draft, milestones: undefined });
  const link = `${window.location.origin}${quotePath(mainHandle, quote.id)}`;
  const dirty = JSON.stringify(draft) !== JSON.stringify(quote);
  const left = quote.status === 'accepted' ? uninvoiced(data, quote) : 0;

  const save = (patch: Partial<Quote> = {}) => update((d) => ({ ...d, quotes: d.quotes.map((q) => q.id === quote.id ? { ...draft, ...patch } : q) }));
  const send = () => {
    setTried(true);
    if (problems.length) return;
    save({ status: 'sent', sentAt: new Date().toISOString() });
    navigator.clipboard?.writeText(link).catch(() => undefined);
    toast.success('Quote ready to send', { description: 'Link copied — share it with your client on WhatsApp or email.' });
  };
  const share = () => {
    const msg = `Hi ${quote.client.name.split(' ')[0]}, here’s your quote from ${businessName} for ${quote.title} (${formatNgn(quoteTotal(quote))}). View and accept it here: ${link}`;
    window.open(whatsappLink(quote.client.phone, msg), '_blank', 'noopener');
  };
  const invoice = () => {
    let id = '';
    update((d) => {
      const r = invoiceFromQuote(d, quote);
      id = r.invoice.id;
      return r.data;
    });
    toast.success('Invoice created as a draft');
    onOpenInvoice(id);
  };
  const job = () => {
    let id = '';
    update((d) => {
      const r = jobFromQuote(d, quote);
      id = r.job.id;
      return r.data;
    });
    onOpenJob(id);
  };

  const footer = editable ?
  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="secondary" disabled={!dirty} onClick={() => (save(), toast.success('Draft saved'))}>
        Save draft
      </Button>
      <Button leadingIcon={SendIcon} onClick={send}>
        Save and get link
      </Button>
    </div> :
  quote.status === 'sent' ?
  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="secondary" disabled={!canEdit} onClick={() => update((d) => ({ ...d, quotes: d.quotes.map((q) => q.id === quote.id ? { ...q, status: 'draft' } : q) }))}>
        Edit (back to draft)
      </Button>
      <Button variant="secondary" leadingIcon={CopyIcon} onClick={() => navigator.clipboard?.writeText(link).then(() => toast.success('Link copied'))}>
        Copy link
      </Button>
      <Button leadingIcon={MessageCircleIcon} disabled={!quote.client.phone} onClick={share}>
        Send on WhatsApp
      </Button>
    </div> :
  quote.status === 'accepted' ?
  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      {quote.jobId ?
    <Button variant="secondary" leadingIcon={BriefcaseIcon} onClick={() => onOpenJob(quote.jobId!)}>
          Open job
        </Button> :

    <Button variant="secondary" leadingIcon={BriefcaseIcon} disabled={!canEdit} onClick={job}>
          Start job
        </Button>
    }
      {!hasStages(quote) &&
    <Button leadingIcon={ReceiptIcon} disabled={!canEdit || left === 0} onClick={invoice}>
          {quote.invoiceIds.length === 0 ? quote.depositPct ? 'Invoice the deposit' : 'Create invoice' : left ? `Invoice the balance (${formatNgn(left)})` : 'Fully invoiced'}
        </Button>
    }
    </div> :
  undefined;

  return (
    <Sheet open onClose={onClose} side="right" size="lg" title={`${quote.number} · ${quote.title || 'New quote'}`} description={editable ? 'Your client sees exactly this, with Accept and Decline buttons.' : undefined} footer={footer}>
      <div className="flex flex-col gap-7 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={quoteTones[view]} dot>
            {quoteLabels[view]}
          </Badge>
          {quote.sample && <SampleTag />}
          {quote.status === 'accepted' &&
          <span className="text-caption text-fg-muted">
              Accepted by {quote.acceptedBy} on {quote.decidedAt ? formatDay(quote.decidedAt.slice(0, 10)) : '—'}
            </span>
          }
          {view === 'expired' && <span className="text-caption text-fg-muted">The client can no longer accept it. Move it back to draft to change the date.</span>}
        </div>
        {quote.status === 'declined' &&
        <InlineAlert tone="warning" title="Your client declined this quote">
            {quote.declineReason ? `“${quote.declineReason}”` : 'They didn’t give a reason.'}
          </InlineAlert>
        }

        <section aria-labelledby="qe-client" className="flex flex-col gap-4">
          <h3 id="qe-client" className="text-label font-semibold text-fg">
            Client
          </h3>
          <TextInput id="qe-name" label="Name" value={draft.client.name} disabled={!editable} maxLength={60} onChange={(e) => setDraft({ ...draft, client: { ...draft.client, name: e.target.value } })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput id="qe-phone" label="Phone or WhatsApp" type="tel" value={draft.client.phone} disabled={!editable} maxLength={24} onChange={(e) => setDraft({ ...draft, client: { ...draft.client, phone: e.target.value } })} />
            <TextInput id="qe-email" label="Email" type="email" optional value={draft.client.email} disabled={!editable} maxLength={80} onChange={(e) => setDraft({ ...draft, client: { ...draft.client, email: e.target.value } })} />
          </div>
        </section>

        <section aria-labelledby="qe-work" className="flex flex-col gap-4 border-t border-line pt-6">
          <h3 id="qe-work" className="text-label font-semibold text-fg">
            The work
          </h3>
          <TextInput id="qe-title" label="What it’s for" placeholder="e.g. Wedding day makeup — bride + 3 bridesmaids" value={draft.title} disabled={!editable} maxLength={90} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <LineItemsEditor
            items={draft.items}
            vat={draft.vat}
            readOnly={!editable}
            onChange={(items) => setDraft({ ...draft, items })}
            footer={!staged && draft.depositPct > 0 ? <TotalRow label={`Deposit to book (${draft.depositPct}%)${draft.vat && !draft.vat.inclusive ? ' + VAT' : ''}`} value={formatNgn(depositOf(draft))} /> : undefined} />
          
          {editable && (draft.vat || data.settings?.vat) &&
          <label className="flex items-start gap-2.5 text-label text-fg">
              <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={!!draft.vat}
              disabled={!draft.vat && !vatRate}
              onChange={(e) => setDraft({ ...draft, vat: e.target.checked && vatRate ? vatRate : undefined })} />
            
              <span>
                Charge VAT on this quote
                <span className="block text-caption text-fg-subtle">
                  {draft.vat ? `${vatRateLabel(draft.vat.ratePct)}, ${draft.vat.inclusive ? 'included in your prices' : 'added on top'}. Its invoices charge the same.` : 'Uses the rate in Commerce settings → Tax.'}
                </span>
              </span>
            </label>
          }
        </section>

        {quote.status === 'accepted' && hasStages(quote) ?
        <div className="border-t border-line pt-6">
            <StageSchedule quote={quote} data={data} businessName={businessName} canEdit={canEdit} update={update} onOpenInvoice={onOpenInvoice} headingId="qe-stages" />
          </div> :

        <section aria-labelledby="qe-pay" className="flex flex-col gap-4 border-t border-line pt-6">
            <div className="flex flex-col gap-1">
              <h3 id="qe-pay" className="text-label font-semibold text-fg">
                How the client pays
              </h3>
              <p className="text-caption text-fg-muted">Stages suit longer jobs: each one gets its own pay link when it’s due.</p>
            </div>
            {editable &&
          <Segmented<'deposit' | 'stages'>
            ariaLabel="How the client pays"
            value={staged ? 'stages' : 'deposit'}
            onChange={setPlan}
            options={[
            { value: 'deposit', label: 'Deposit + balance' },
            { value: 'stages', label: 'In stages' }]
            } />

          }
            {staged ?
          <MilestoneEditor
            stages={draft.milestones!}
            total={itemsTotal(draft.items)}
            readOnly={!editable}
            savedTemplates={data.milestoneTemplates ?? []}
            onChange={(milestones) => setDraft({ ...draft, milestones })}
            onSaveTemplate={(t) => update((d) => ({ ...d, milestoneTemplates: [...(d.milestoneTemplates ?? []), t] }))}
            onDeleteTemplate={(id) => update((d) => ({ ...d, milestoneTemplates: (d.milestoneTemplates ?? []).filter((t) => t.id !== id) }))} /> :


          <div className="sm:max-w-[50%] sm:pr-2">
                <SelectInput<string> id="qe-deposit" label="Deposit" value={String(draft.depositPct)} disabled={!editable} options={depositOptions} onChange={(v) => setDraft({ ...draft, depositPct: Number(v) })} />
              </div>
          }
          </section>
        }

        <section aria-labelledby="qe-terms" className="flex flex-col gap-4 border-t border-line pt-6">
          <h3 id="qe-terms" className="text-label font-semibold text-fg">
            Terms
          </h3>
          <TextInput id="qe-valid" label="Valid until" type="date" min={todayKey()} value={draft.validUntil} disabled={!editable} onChange={(e) => setDraft({ ...draft, validUntil: e.target.value })} fieldClassName="sm:max-w-[50%] sm:pr-2" />
          <TextArea id="qe-note" label="Note to client" optional rows={3} maxLength={400} value={draft.note} disabled={!editable} onChange={(e) => setDraft({ ...draft, note: e.target.value })} hint="Timings, what’s included, what you need from them." />
        </section>

        {editable && tried && problems.length > 0 &&
        <InlineAlert tone="danger" title="Fix these before getting a link">
            <ul className="list-disc pl-4">
              {problems.map((p) =>
            <li key={p}>{p}</li>
            )}
            </ul>
          </InlineAlert>
        }

        {(quote.invoiceIds.length > 0 || quote.jobId) &&
        <section aria-labelledby="qe-linked" className="flex flex-col gap-2 border-t border-line pt-6">
            <h3 id="qe-linked" className="text-label font-semibold text-fg">
              From this quote
            </h3>
            <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
              {quote.invoiceIds.map((id) => {
              const inv = data.invoices.find((i) => i.id === id);
              if (!inv) return null;
              return (
                <li key={id}>
                    <button type="button" onClick={() => onOpenInvoice(id)} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-label hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                      <span className="text-fg">
                        Invoice {inv.number}
                        {inv.milestoneId && <span className="text-fg-subtle"> · {quote.milestones?.find((m) => m.id === inv.milestoneId)?.label ?? 'Stage'}</span>}
                      </span>
                      <span className="tabular-nums text-fg-muted">{formatNgn(invoiceTotal(inv))}</span>
                    </button>
                  </li>);

            })}
              {quote.jobId &&
            <li>
                  <button type="button" onClick={() => onOpenJob(quote.jobId!)} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-label hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                    <span className="text-fg">Job</span>
                    <span className="text-fg-muted">Open</span>
                  </button>
                </li>
            }
            </ul>
          </section>
        }
      </div>
    </Sheet>);

}