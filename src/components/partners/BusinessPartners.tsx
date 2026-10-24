import React from 'react';
import { ArrowRightIcon, HandshakeIcon } from 'lucide-react';
import type { Partnership } from '../../types/partnership';
import { isExpired, statusLabels, statusTones } from '../../utils/partnerships';
import { formatDate } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { PartnerAvatar } from './PartnerAvatar';

interface BusinessPartnersProps {
  rows: Partnership[];
  leadName: string;
  onOpen: (id: string) => void;
  onStart: () => void;
  canStart: boolean;
}

const order: Record<Partnership['status'], number> = { invited: 1, active: 0, ending: 2, declined: 3, ended: 4 };

/** Businesses you work with (D120): what's waiting on whom comes first. */
export function BusinessPartners({ rows, leadName, onOpen, onStart, canStart }: BusinessPartnersProps) {
  const sorted = [...rows].sort((a, b) => Number(!!b.pending) - Number(!!a.pending) || order[a.status] - order[b.status]);
  const current = sorted.filter((p) => p.status !== 'ended' && p.status !== 'declined');
  const past = sorted.filter((p) => p.status === 'ended' || p.status === 'declined');

  if (!rows.length)
  return (
    <div className="mt-8 rounded-lg border border-line bg-raised">
        <EmptyState
        icon={HandshakeIcon}
        title="Sell together with another business"
        description="A makeup artist and a gele stylist, a caterer and a cake maker — share one page, sell packages of both, and each get paid your own part."
        action={
        <Button disabled={!canStart} onClick={onStart}>
              Work together
            </Button>
        } />
      
      </div>);


  const list = (items: Partnership[]) =>
  <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
      {items.map((p) => {
      const expired = isExpired(p);
      const waiting = p.pending ? p.pending.by === 'lead' ? `Waiting for ${p.partner.name} to accept new terms` : `${p.partner.name} proposed new terms` : p.status === 'invited' ? expired ? 'Invite link expired — send a new one' : `Invite sent ${formatDate(p.invitedAt)}` : p.status === 'ending' && p.endsAt ? `Ends ${formatDate(p.endsAt)}` : `${p.agreement.leadSharePct}% ${leadName} · ${100 - p.agreement.leadSharePct}% them`;
      return (
        <li key={p.id}>
            <button type="button" onClick={() => onOpen(p.id)} className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 text-left hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none">
              <PartnerAvatar partner={p.partner} />
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-label font-semibold text-fg">{p.partner.name}</span>
                  <span className="text-caption text-fg-subtle">{p.kind === 'connected' ? `@${p.partner.handle}` : 'Guest'}</span>
                  {p.sample && <Badge tone="neutral">Sample</Badge>}
                </span>
                <span className={p.pending && p.pending.by === 'partner' ? 'block truncate text-caption font-medium text-warning' : 'block truncate text-caption text-fg-muted'}>{waiting}</span>
              </span>
              <span className="flex items-center gap-2">
                <Badge tone={expired ? 'warning' : statusTones[p.status]} dot>
                  {expired ? 'Expired' : statusLabels[p.status]}
                </Badge>
                <ArrowRightIcon size={14} className="hidden text-fg-subtle sm:block" aria-hidden />
              </span>
            </button>
          </li>);

    })}
    </ul>;


  return (
    <div className="mt-8 flex flex-col gap-8">
      <section aria-labelledby="bp-current" className="flex flex-col gap-3">
        <h2 id="bp-current" className="text-heading font-semibold text-fg">
          Working with
        </h2>
        {current.length ? list(current) : <p className="text-label text-fg-muted">No current partners.</p>}
      </section>
      {past.length > 0 &&
      <section aria-labelledby="bp-past" className="flex flex-col gap-3">
          <h2 id="bp-past" className="text-label font-semibold text-fg-muted">
            Past
          </h2>
          {list(past)}
        </section>
      }
    </div>);

}