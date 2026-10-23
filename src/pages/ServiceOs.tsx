import React, { useMemo, useState } from 'react';
import { BriefcaseIcon, FileTextIcon, PlusIcon, ReceiptIcon } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useCan } from '../contexts/TeamContext';
import { useServiceOs } from '../hooks/useServiceOs';
import { balanceOf, formatDay, invoiceLabels, invoiceTones, invoiceView, itemsTotal, jobLabels, jobOrder, jobTones, newQuote, quoteLabels, quoteTones, quoteView } from '../utils/serviceOs';
import { formatNgn } from '../utils/format';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { SampleTag } from '../components/commerce/StatusBadges';
import { QuoteEditor } from '../components/serviceOs/QuoteEditor';
import { InvoiceDetail } from '../components/serviceOs/InvoiceDetail';
import { JobDetail } from '../components/serviceOs/JobDetail';

type Tab = 'quotes' | 'invoices' | 'jobs';
type Open = {kind: 'quote' | 'invoice' | 'job';id: string;} | null;

const rowCls = 'flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus';

/** Quotes & jobs (Service OS, D89): quote → accepted → invoice → job, for service businesses. */
export function ServiceOs() {
  const { current } = useWorkspace();
  const can = useCan('orders.manage');
  const { data, update } = useServiceOs(current.id);
  const [tab, setTab] = useState<Tab>('quotes');
  const [open, setOpen] = useState<Open>(null);

  const owed = data.invoices.filter((i) => i.status === 'sent').reduce((s, i) => s + balanceOf(i), 0);
  const overdue = data.invoices.filter((i) => invoiceView(i) === 'overdue').length;
  const waitingQuotes = data.quotes.filter((q) => quoteView(q) === 'sent');
  const activeJobs = data.jobs.filter((j) => j.status !== 'done').length;
  const jobs = useMemo(() => [...data.jobs].sort((a, b) => jobOrder.indexOf(a.status) - jobOrder.indexOf(b.status) || a.dueDate.localeCompare(b.dueDate)), [data.jobs]);

  const create = () => {
    let id = '';
    update((d) => {
      const r = newQuote(d);
      id = r.quote.id;
      return r.data;
    });
    setTab('quotes');
    setOpen({ kind: 'quote', id });
  };

  const quote = open?.kind === 'quote' ? data.quotes.find((q) => q.id === open.id) ?? null : null;
  const invoice = open?.kind === 'invoice' ? data.invoices.find((i) => i.id === open.id) ?? null : null;
  const job = open?.kind === 'job' ? data.jobs.find((j) => j.id === open.id) ?? null : null;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
      <PageHeader
        title="Quotes & jobs"
        context={current.name}
        description="Send a quote your client accepts from a link, invoice the deposit and balance, and track the work until it’s done."
        actions={
        <Button leadingIcon={PlusIcon} disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={create}>
            New quote
          </Button>
        } />
      

      <section aria-label="Summary" className="mt-8 grid gap-6 border-b border-line pb-8 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="text-label text-fg-muted">Waiting to be paid</p>
          <p className="mt-1 font-display text-[2rem] font-semibold leading-tight tabular-nums text-fg">{formatNgn(owed)}</p>
          <p className="mt-1 text-caption text-fg-subtle">{overdue ? `${overdue} invoice${overdue === 1 ? '' : 's'} overdue` : 'Nothing overdue'}</p>
        </div>
        <div className="sm:border-l sm:border-line sm:pl-6">
          <p className="text-label text-fg-muted">Quotes waiting for a reply</p>
          <p className="mt-1 text-heading font-semibold tabular-nums text-fg">{waitingQuotes.length}</p>
          <p className="mt-1 text-caption text-fg-subtle">{formatNgn(waitingQuotes.reduce((s, q) => s + itemsTotal(q.items), 0))} quoted</p>
        </div>
        <div className="sm:border-l sm:border-line sm:pl-6">
          <p className="text-label text-fg-muted">Jobs in progress</p>
          <p className="mt-1 text-heading font-semibold tabular-nums text-fg">{activeJobs}</p>
          <p className="mt-1 text-caption text-fg-subtle">{data.jobs.length - activeJobs} done</p>
        </div>
      </section>

      <Tabs<Tab>
        idPrefix="sos"
        ariaLabel="Quotes, invoices and jobs"
        value={tab}
        onChange={setTab}
        className="mt-6"
        items={[
        { id: 'quotes', label: 'Quotes', badge: waitingQuotes.length || undefined },
        { id: 'invoices', label: 'Invoices', badge: overdue || undefined },
        { id: 'jobs', label: 'Jobs' }]
        } />
      

      <div role="tabpanel" id={`sos-panel-${tab}`} aria-labelledby={`sos-tab-${tab}`} className="mt-4">
        {tab === 'quotes' && (
        data.quotes.length === 0 ?
        <EmptyState icon={FileTextIcon} title="No quotes yet" description="Price up a job, send the link, and your client accepts it in one tap." /> :

        <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
              {data.quotes.map((q) => {
            const v = quoteView(q);
            return (
              <li key={q.id}>
                    <button type="button" onClick={() => setOpen({ kind: 'quote', id: q.id })} className={rowCls}>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-label font-semibold text-fg">{q.title || 'Untitled quote'}</span>
                          {q.sample && <SampleTag />}
                        </span>
                        <span className="mt-0.5 block truncate text-caption text-fg-muted">
                          {q.number} · {q.client.name || 'No client yet'} · valid until {formatDay(q.validUntil)}
                        </span>
                      </span>
                      <span className="hidden text-right text-label font-medium tabular-nums text-fg sm:block">{formatNgn(itemsTotal(q.items))}</span>
                      <Badge tone={quoteTones[v]} dot>
                        {quoteLabels[v]}
                      </Badge>
                    </button>
                  </li>);

          })}
            </ul>)
        }

        {tab === 'invoices' && (
        data.invoices.length === 0 ?
        <EmptyState icon={ReceiptIcon} title="No invoices yet" description="Open an accepted quote to invoice the deposit or the full amount." /> :

        <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
              {data.invoices.map((inv) => {
            const v = invoiceView(inv);
            return (
              <li key={inv.id}>
                    <button type="button" onClick={() => setOpen({ kind: 'invoice', id: inv.id })} className={rowCls}>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-label font-semibold text-fg">
                            {inv.number} · {inv.client.name}
                          </span>
                          {inv.sample && <SampleTag />}
                        </span>
                        <span className="mt-0.5 block truncate text-caption text-fg-muted">
                          {inv.title} · due {formatDay(inv.dueDate)}
                        </span>
                      </span>
                      <span className="hidden text-right sm:block">
                        <span className="block text-label font-medium tabular-nums text-fg">{formatNgn(itemsTotal(inv.items))}</span>
                        {v === 'part_paid' && <span className="block text-caption tabular-nums text-fg-muted">{formatNgn(balanceOf(inv))} left</span>}
                      </span>
                      <Badge tone={invoiceTones[v]} dot>
                        {invoiceLabels[v]}
                      </Badge>
                    </button>
                  </li>);

          })}
            </ul>)
        }

        {tab === 'jobs' && (
        jobs.length === 0 ?
        <EmptyState icon={BriefcaseIcon} title="No jobs yet" description="Start a job from an accepted quote to track its steps and updates." /> :

        <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
              {jobs.map((j) => {
            const done = j.checklist.filter((c) => c.done).length;
            return (
              <li key={j.id}>
                    <button type="button" onClick={() => setOpen({ kind: 'job', id: j.id })} className={rowCls}>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-label font-semibold text-fg">{j.title}</span>
                          {j.sample && <SampleTag />}
                        </span>
                        <span className="mt-0.5 block truncate text-caption text-fg-muted">
                          {j.client.name} · due {formatDay(j.dueDate)}
                          {j.checklist.length > 0 && ` · ${done} of ${j.checklist.length} steps`}
                        </span>
                      </span>
                      <Badge tone={jobTones[j.status]} dot>
                        {jobLabels[j.status]}
                      </Badge>
                    </button>
                  </li>);

          })}
            </ul>)
        }
      </div>

      <QuoteEditor
        quote={quote}
        data={data}
        businessName={current.name}
        canEdit={can.allowed}
        update={update}
        onClose={() => setOpen(null)}
        onOpenInvoice={(id) => (setTab('invoices'), setOpen({ kind: 'invoice', id }))}
        onOpenJob={(id) => (setTab('jobs'), setOpen({ kind: 'job', id }))} />
      
      <InvoiceDetail invoice={invoice} businessName={current.name} canEdit={can.allowed} update={update} onClose={() => setOpen(null)} onOpenQuote={(id) => (setTab('quotes'), setOpen({ kind: 'quote', id }))} />
      <JobDetail job={job} data={data} onOpenInvoice={(id) => (setTab('invoices'), setOpen({ kind: 'invoice', id }))} businessName={current.name} canEdit={can.allowed} update={update} onClose={() => setOpen(null)} onOpenQuote={(id) => (setTab('quotes'), setOpen({ kind: 'quote', id }))} />
    </div>);

}