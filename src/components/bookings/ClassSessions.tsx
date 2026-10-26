import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChevronDownIcon, UsersIcon, XCircleIcon } from 'lucide-react';
import { useOps } from '../../contexts/OpsContext';
import { activeBookings, classCapacity, dayLabel, timeLabel } from '../../utils/ops/slots';
import { cancelClass } from '../../utils/ops/ops';
import { formatNgn } from '../../utils/format';
import { Card } from '../ui/layout/Card';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { TextArea } from '../ui/TextArea';
import { cn } from '../../utils/cn';

interface Session {
  key: string;
  serviceId: string;
  serviceName: string;
  start: number;
  capacity: number;
  people: {id: string;name: string;phone: string;deposit: number;ref: string;}[];
}

/** Coming group classes (D198): seats taken, who's coming, and cancelling a class for everyone. */
export function ClassSessions({ onOpenBooking }: {onOpenBooking: (id: string) => void;}) {
  const { data, apply } = useOps();
  const tz = data.availability.timeZone;
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<Session | null>(null);
  const [reason, setReason] = useState('');

  const sessions = useMemo(() => {
    const groups = new Map<string, Session>();
    const services = new Map(data.services.map((s) => [s.id, s]));
    activeBookings(data.bookings).
    filter((b) => Date.parse(b.end) >= Date.now()).
    forEach((b) => {
      const svc = services.get(b.serviceId);
      if (!svc || classCapacity(svc) < 2) return;
      const start = Date.parse(b.start);
      const key = `${b.serviceId}@${start}`;
      const g = groups.get(key) ?? { key, serviceId: b.serviceId, serviceName: svc.name, start, capacity: classCapacity(svc), people: [] };
      g.people.push({ id: b.id, name: b.customer.name, phone: b.customer.phone, deposit: b.depositPaidNgn, ref: b.ref });
      groups.set(key, g);
    });
    return [...groups.values()].sort((a, b) => a.start - b.start).slice(0, 8);
  }, [data.bookings, data.services]);

  if (sessions.length === 0) return null;

  const confirm = () => {
    if (!cancelling) return;
    let result = { cancelled: 0, refundedNgn: 0 };
    const ok = apply((d) => {
      const r = cancelClass(d, cancelling.serviceId, cancelling.start, reason.trim());
      result = r;
      return r.data;
    });
    if (ok) toast.success(`${cancelling.serviceName} cancelled`, { description: `${result.cancelled} ${result.cancelled === 1 ? 'person' : 'people'} cancelled${result.refundedNgn ? ` · ${formatNgn(result.refundedNgn)} in deposits refunded (test mode)` : ''}.` });
    setCancelling(null);
    setReason('');
  };

  return (
    <section aria-labelledby="classes-title" className="mt-8">
      <h2 id="classes-title" className="mb-3 text-label font-semibold text-fg">
        Coming classes
      </h2>
      <Card as="div" body="flush">
        <ul>
          {sessions.map((s) => {
            const pct = Math.round(s.people.length / s.capacity * 100);
            const open = openKey === s.key;
            return (
              <li key={s.key} className="border-b border-line last:border-0">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 sm:flex-nowrap md:px-6">
                  <span className="w-16 shrink-0 sm:w-20">
                    <span className="block text-label font-semibold tabular-nums text-fg">{timeLabel(s.start, tz)}</span>
                    <span className="block text-caption text-fg-subtle">{dayLabel(s.start, tz)}</span>
                  </span>
                  <button type="button" aria-expanded={open} onClick={() => setOpenKey(open ? null : s.key)} className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-label font-semibold text-fg">{s.serviceName}</span>
                      <span className="mt-1 flex items-center gap-2">
                        <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-sunken sm:w-28" role="progressbar" aria-valuemin={0} aria-valuemax={s.capacity} aria-valuenow={s.people.length} aria-label={`${s.people.length} of ${s.capacity} seats booked`}>
                          <span className="block h-full rounded-full bg-action" style={{ width: `${pct}%` }} />
                        </span>
                        <span className="text-caption tabular-nums text-fg-subtle">
                          {s.people.length} of {s.capacity} booked{s.people.length >= s.capacity ? ' · full' : ''}
                        </span>
                      </span>
                    </span>
                    <ChevronDownIcon size={15} className={cn('shrink-0 text-fg-subtle transition-transform duration-150 ease-out', open && 'rotate-180')} aria-hidden />
                  </button>
                  <Button size="md" variant="tertiary" leadingIcon={XCircleIcon} onClick={() => setCancelling(s)}>
                    <span className="hidden sm:inline">Cancel class</span>
                    <span className="sr-only sm:hidden">Cancel {s.serviceName}</span>
                  </Button>
                </div>
                {open &&
                <ul aria-label={`Who’s coming to ${s.serviceName}`} className="border-t border-line bg-sunken/40 px-5 py-2 md:px-6">
                    {s.people.map((p) =>
                  <li key={p.id}>
                        <button type="button" onClick={() => onOpenBooking(p.id)} className="flex min-h-[44px] w-full items-center gap-3 rounded-sm text-left text-label hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                          <UsersIcon size={14} className="shrink-0 text-fg-subtle" aria-hidden />
                          <span className="min-w-0 flex-1 truncate font-medium text-fg">{p.name}</span>
                          <span className="hidden truncate text-caption text-fg-subtle sm:inline">{p.phone}</span>
                          <span className="text-caption tabular-nums text-fg-subtle">{p.deposit ? `${formatNgn(p.deposit)} paid` : p.ref}</span>
                        </button>
                      </li>
                  )}
                  </ul>
                }
              </li>);

          })}
        </ul>
      </Card>

      <Dialog
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        title={`Cancel ${cancelling?.serviceName ?? 'class'}?`}
        description="Everyone booked into this time is cancelled and every deposit is refunded in full."
        footer={
        <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCancelling(null)}>
              Keep class
            </Button>
            <Button variant="destructive" onClick={confirm}>
              Cancel for everyone
            </Button>
          </div>
        }>
        
        {cancelling &&
        <div className="flex flex-col gap-4">
            <p className="text-label font-semibold tabular-nums text-fg">
              {cancelling.people.length} {cancelling.people.length === 1 ? 'person' : 'people'} · {formatNgn(cancelling.people.reduce((t, p) => t + p.deposit, 0))} to refund
            </p>
            <TextArea id="class-cancel-reason" label="Reason people will see" optional rows={2} value={reason} placeholder="e.g. The tutor is unwell. We’ll share a new date soon." onChange={(e) => setReason(e.target.value)} />
            <p className="rounded-md border border-line bg-sunken px-3.5 py-3 text-caption text-fg-muted">Preview only — messages aren’t sent in the prototype.</p>
          </div>
        }
      </Dialog>
    </section>);

}