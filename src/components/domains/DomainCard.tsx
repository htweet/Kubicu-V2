import React, { useState } from 'react';
import { CheckIcon, ChevronDownIcon, ExternalLinkIcon, Loader2Icon, LockIcon, Trash2Icon } from 'lucide-react';
import type { CheckOutcome, CustomDomain } from '../../types/domains';
import { useDomains } from '../../contexts/DomainsContext';
import { useTeam } from '../../contexts/TeamContext';
import { dnsRecords, statusSteps } from '../../utils/domains/dns';
import { formatRelative } from '../../utils/format';
import { cn } from '../../utils/cn';
import { Badge, type BadgeTone } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Switch } from '../ui/Switch';
import { InlineAlert } from '../ui/InlineAlert';
import { DnsRecordsTable } from './DnsRecordsTable';
import { outcomeOptions } from './ConnectDomainDialog';

interface Props {
  domain: CustomDomain;
  spaceLabel: string;
  canManage: boolean;
  reason: string;
}

const badge: Record<CustomDomain['status'], {tone: BadgeTone;label: string;}> = {
  waiting_dns: { tone: 'warning', label: 'Waiting for DNS' },
  verifying: { tone: 'info', label: 'Verifying' },
  issuing: { tone: 'info', label: 'Issuing certificate' },
  live: { tone: 'success', label: 'Live' },
  problem: { tone: 'danger', label: 'Problem' }
};

const stepIndex = (d: CustomDomain) => d.status === 'problem' ? 1 : statusSteps.findIndex((s) => s.id === d.status);

/** One connected domain: where it is in the process, what to do next, and its settings once live (D62). */
export function DomainCard({ domain: d, spaceLabel, canManage, reason }: Props) {
  const { apply, checkDomain, removeDomain } = useDomains();
  const team = useTeam();
  const [showRecords, setShowRecords] = useState(d.status !== 'live');
  const [outcome, setOutcome] = useState<CheckOutcome>('success');
  const [confirm, setConfirm] = useState(false);
  const busy = d.status === 'verifying' || d.status === 'issuing';
  const current = stepIndex(d);

  const patch = (p: Partial<CustomDomain>) => apply((data) => ({ ...data, domains: data.domains.map((x) => x.id === d.id ? { ...x, ...p } : x) }));
  const makePrimary = (on: boolean) =>
  apply((data) => ({
    ...data,
    domains: data.domains.map((x) => x.id === d.id ? { ...x, primary: on, redirectKubicu: on ? x.redirectKubicu : false } : on && x.spaceId === d.spaceId ? { ...x, primary: false, redirectKubicu: false } : x)
  }));

  return (
    <article className="rounded-lg border border-line bg-raised" aria-labelledby={`dom-${d.id}`}>
      <header className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={`dom-${d.id}`} className="break-all text-heading font-semibold text-fg">
              {d.host}
            </h2>
            <Badge tone={badge[d.status].tone} dot>
              {badge[d.status].label}
            </Badge>
            {d.status === 'live' && d.primary && <Badge tone="action">Primary</Badge>}
          </div>
          <p className="mt-1 text-caption text-fg-muted">
            Shows {spaceLabel} · {d.kind === 'root' ? 'whole domain' : 'subdomain'}
            {d.checkedAt && ` · last checked ${formatRelative(d.checkedAt)}`}
          </p>
        </div>
        {d.status === 'live' &&
        <a href={`https://${d.host}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-label font-medium text-action hover:underline">
            Visit <ExternalLinkIcon size={14} aria-hidden />
          </a>
        }
      </header>

      <ol className="mx-5 grid grid-cols-4 gap-2" aria-label="Connection progress">
        {statusSteps.map((s, i) => {
          const done = i < current || d.status === 'live';
          const now = i === current && d.status !== 'live';
          const bad = now && (d.status === 'problem' || !!d.problem);
          return (
            <li key={s.id} className="flex flex-col gap-1.5" aria-current={now ? 'step' : undefined}>
              <span className={cn('h-1 rounded-full', done ? 'bg-success' : bad ? 'bg-danger' : now ? 'bg-action' : 'bg-line')} />
              <span className={cn('flex items-center gap-1 text-caption', done || now ? 'text-fg' : 'text-fg-subtle')}>
                {done && <CheckIcon size={12} className="text-success" aria-hidden />}
                {now && busy && <Loader2Icon size={12} className="animate-spin text-action" aria-hidden />}
                {s.label}
              </span>
            </li>);

        })}
      </ol>

      <div className="flex flex-col gap-4 p-5">
        <StatusMessage d={d} />

        {d.status !== 'live' &&
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Button onClick={() => checkDomain(d.id, outcome)} disabled={busy || !canManage} loading={busy} title={canManage ? undefined : reason}>
              {d.status === 'problem' || d.problem ? 'Check again' : 'Check now'}
            </Button>
            <label className="flex flex-col gap-1 text-caption text-fg-subtle">
              Prototype: what the check finds
              <select value={outcome} onChange={(e) => setOutcome(e.target.value as CheckOutcome)} className="h-9 rounded-md border border-dashed border-line-strong bg-field px-2 text-label text-fg">
                {outcomeOptions.map((o) =>
              <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
              )}
              </select>
            </label>
          </div>
        }

        {d.status === 'live' &&
        <div className="flex flex-col gap-4 border-t border-line pt-4">
            <Switch
            id={`dom-primary-${d.id}`}
            label="Primary address"
            description={`Search engines and shared links use https://${d.host} as ${spaceLabel}’s main address.`}
            checked={d.primary}
            disabled={!canManage}
            onChange={(on) => {
              makePrimary(on);
              team.log('settings', `${on ? 'made' : 'stopped using'} ${d.host} as the primary address`, '/app/domains');
            }} />
          
            <Switch
            id={`dom-redirect-${d.id}`}
            label="Send kub.icu visitors here"
            description={d.primary ? 'People who open your kub.icu link land on this domain instead.' : 'Make this the primary address first.'}
            checked={d.redirectKubicu}
            disabled={!canManage || !d.primary}
            onChange={(on) => patch({ redirectKubicu: on })} />
          
            <p className="text-caption text-fg-subtle">Product links on this domain read like /shop/ankara-wrap-dress. Prototype: the live page still opens at its /p/ address here.</p>
          </div>
        }

        <div className="border-t border-line pt-3">
          <button
            type="button"
            onClick={() => setShowRecords((v) => !v)}
            aria-expanded={showRecords}
            className="inline-flex items-center gap-1.5 text-label font-medium text-fg-muted hover:text-fg">
            
            <ChevronDownIcon size={15} className={cn('transition-transform duration-150 ease-out', showRecords && 'rotate-180')} aria-hidden />
            DNS records
          </button>
          {showRecords &&
          <div className="mt-3">
              <DnsRecordsTable records={dnsRecords(d)} />
            </div>
          }
        </div>

        <div className="flex justify-end">
          <Button variant="tertiary" size="sm" leadingIcon={canManage ? Trash2Icon : LockIcon} disabled={!canManage} title={canManage ? undefined : reason} onClick={() => setConfirm(true)}>
            Disconnect
          </Button>
        </div>
      </div>

      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        size="sm"
        title={`Disconnect ${d.host}?`}
        description="You can connect it again later — you’d add the records again."
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              Keep it
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              removeDomain(d.id);
              team.log('settings', `disconnected the domain ${d.host}`, '/app/domains');
              setConfirm(false);
            }}>
            
              Disconnect
            </Button>
          </>
        }>
        
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-label text-fg-muted">
          <li>Visitors to {d.host} stop seeing your page.</li>
          <li>Links and QR codes that use {d.host} will stop working.</li>
          {d.redirectKubicu && <li>Your kub.icu link stops forwarding and shows your page again.</li>}
          <li>Your kub.icu link, orders and analytics aren’t affected.</li>
        </ul>
      </Dialog>
    </article>);

}

function StatusMessage({ d }: {d: CustomDomain;}) {
  if (d.status === 'verifying') return <p className="text-label text-fg-muted">Looking for your DNS records…</p>;
  if (d.status === 'issuing') return <p className="text-label text-fg-muted">Records found. Getting a security certificate so your page opens with https — usually under a minute.</p>;
  if (d.status === 'live') return <p className="text-label text-fg-muted">Live and secure since {d.liveAt ? formatRelative(d.liveAt) : 'just now'}.</p>;
  if (d.status === 'problem')
  return (
    <InlineAlert tone="danger" title="A record doesn’t match">
        <p>We found records for {d.host}, but one isn’t what we expect. Check these, then try again:</p>
        <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-4">
          <li>The Name is typed exactly — some registrars add your domain automatically, so “@” or “shop” is enough.</li>
          <li>Old A or CNAME records for the same name (often a parking page) are deleted.</li>
          <li>On Cloudflare, the record is set to “DNS only” (grey cloud).</li>
          <li>The TXT value is pasted without extra spaces or quotes.</li>
        </ul>
      </InlineAlert>);

  if (d.problem === 'timeout')
  return (
    <InlineAlert tone="warning" title="We can’t see your records yet">
        DNS changes can take up to 48 hours to spread. If you added them recently, check again later. If it’s been a day, compare each record with the list below.
      </InlineAlert>);

  return <p className="text-label text-fg-muted">Add the DNS records below where you bought the domain, then check. It’s not live until it’s verified and has a certificate.</p>;
}