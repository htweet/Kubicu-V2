import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarPlusIcon, MailCheckIcon, MailWarningIcon, ShoppingBagIcon, UserIcon } from 'lucide-react';
import type { FormDef, FormSubmission } from '../../types/forms';
import { useOps } from '../../contexts/OpsContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { createBooking } from '../../utils/ops/ops';
import { parsePicks } from '../../utils/forms/logic';
import { contactFrom } from '../../utils/forms/submit';
import { maskEmail } from '../../utils/providers/store';
import { Button } from '../ui/Button';
import { CreateOrderSheet } from './CreateOrderSheet';

interface ResponseRecordsProps {
  form: FormDef;
  submission: FormSubmission;
  onUpdate: (patch: Partial<FormSubmission>) => void;
  disabled: boolean;
}

/**
 * Where a response connects to the rest of KUBICU (D195): its contact in Audience, the confirmation
 * email, and an order or booking created from it. Nothing is created without the owner choosing to.
 */
export function ResponseRecords({ form, submission: s, onUpdate, disabled }: ResponseRecordsProps) {
  const ops = useOps();
  const commerce = useCommerce();
  const [orderOpen, setOrderOpen] = useState(false);

  const contact = contactFrom(form, s.answers);
  const email = s.contactEmail || contact.email;
  const phone = s.contactPhone || contact.phone;
  const digits = (p: string) => p.replace(/\D/g, '').slice(-10);
  const audience = ops.data.contacts.find((c) => email && c.email.toLowerCase() === email.toLowerCase() || phone && digits(c.phone) === digits(phone));

  const productField = form.fields.find((f) => f.type === 'products' && parsePicks(s.answers[f.id]).length > 0);
  const order = s.orderId ? commerce.data.orders.find((o) => o.id === s.orderId) : undefined;

  const slotField = form.fields.find((f) => f.type === 'bookingSlot' && f.serviceId && Array.isArray(s.answers[f.id]) && (s.answers[f.id] as string[])[0]);
  const slot = slotField ? s.answers[slotField.id] as string[] : null;
  const service = slotField ? ops.data.services.find((x) => x.id === slotField.serviceId) : undefined;
  const booking = s.bookingId ? ops.data.bookings.find((b) => b.id === s.bookingId) : undefined;
  const slotStart = slot ? Date.parse(slot[0]) : NaN;
  const slotPassed = Number.isFinite(slotStart) && slotStart < Date.now();

  const book = () => {
    if (!service || !slot) return;
    let made: {id: string;ref: string;} | null = null;
    let failure: string | null = null;
    const ok = ops.apply((d) => {
      const r = createBooking(d, {
        service,
        start: slotStart,
        customer: { name: contact.name || s.contactName || 'Form respondent', phone, email },
        intake: `From a “${form.name}” form response.`,
        depositOutcome: 'none',
        customerTimeZone: d.availability.timeZone,
        marketingConsent: s.marketingConsent,
        sourceHandle: s.pageHandle ?? undefined
      });
      if (!r.ok) {
        failure = r.message;
        return d;
      }
      made = { id: r.booking.id, ref: r.booking.ref };
      return { ...r.data, bookings: r.data.bookings.map((b) => b.id === r.booking.id ? { ...b, events: b.events.map((e) => /^Booked on your page/.test(e.label) ? { ...e, label: e.label.replace('Booked on your page', `Booked from a “${form.name}” response`) } : e) } : b) };
    });
    const m = made as {id: string;ref: string;} | null;
    if (!ok) return;
    if (!m) {
      toast.error('That time isn’t free any more', { description: failure ? `${failure.replace('Please pick another.', '')} Reply to the customer with another time.` : undefined });
      return;
    }
    onUpdate({ bookingId: m.id, bookingRef: m.ref });
    toast(`Booking ${m.ref} confirmed`, { description: `${service.name} · ${slot[1] ?? ''}` });
  };

  const rows: React.ReactNode[] = [];

  rows.push(
    <Row key="aud" icon={UserIcon} title="Audience">
      {audience ?
      <Link to={`/app/audience?contact=${audience.id}`} className="font-medium text-fg underline-offset-2 hover:underline">
          Open {audience.name || 'contact'}
        </Link> :
      email || phone ?
      <span className="text-fg-muted">
          No matching contact — it may have been removed.{' '}
          <Link to="/app/audience" className="font-medium text-fg underline-offset-2 hover:underline">
            Open Audience
          </Link>
        </span> :

      <span className="text-fg-muted">
          No contact — the form didn’t collect an email or phone.{' '}
          <Link to="/app/audience" className="font-medium text-fg underline-offset-2 hover:underline">
            Open Audience
          </Link>
        </span>
      }
    </Row>
  );

  if (s.email) {
    const e = s.email;
    rows.push(
      <Row key="mail" icon={e.status === 'sent' ? MailCheckIcon : MailWarningIcon} title="Confirmation email">
        <span className={e.status === 'sent' ? 'text-fg' : 'text-fg-muted'}>
          {e.status === 'sent' ? `Sent to ${maskEmail(e.to)} through ${e.providerName} (simulated)` : e.status === 'not_connected' ? 'Not sent — no email provider was connected' : 'Not sent — no email address was given'}
        </span>
        <details className="mt-1">
          <summary className="cursor-pointer text-caption font-medium text-fg-muted hover:text-fg">See the email</summary>
          <div className="mt-2 rounded-md bg-sunken p-3 text-caption">
            <p className="font-semibold text-fg">{e.subject}</p>
            <p className="mt-2 whitespace-pre-wrap text-fg-muted">{e.body}</p>
          </div>
        </details>
      </Row>
    );
  }

  if (productField) {
    rows.push(
      <Row key="order" icon={ShoppingBagIcon} title="Order">
        {order ?
        <Link to={`/app/commerce/orders?order=${order.id}`} className="font-medium text-fg underline-offset-2 hover:underline">
            Order #{order.number}
          </Link> :

        <div className="flex flex-col items-start gap-2">
            <span className="text-fg-muted">{s.orderId ? `Order #${s.orderNumber ?? ''} was deleted.` : 'Picks don’t create an order on their own.'}</span>
            <Button size="sm" variant="secondary" disabled={disabled} onClick={() => setOrderOpen(true)}>
              Create order
            </Button>
          </div>
        }
      </Row>
    );
  }

  if (slotField && slot) {
    rows.push(
      <Row key="booking" icon={CalendarPlusIcon} title="Booking">
        {booking ?
        <Link to={`/app/bookings?booking=${booking.id}`} className="font-medium text-fg underline-offset-2 hover:underline">
            Booking {booking.ref}
            {booking.status === 'cancelled' ? ' (cancelled)' : ''}
          </Link> :
        !service ?
        <span className="text-fg-muted">The service for this time was removed from Bookings.</span> :
        slotPassed ?
        <span className="text-fg-muted">{slot[1]} has passed.</span> :

        <div className="flex flex-col items-start gap-2">
            <span className="text-fg-muted">
              Asked for {service.name}, {slot[1]}. Not booked yet.
            </span>
            <Button size="sm" variant="secondary" disabled={disabled} onClick={book}>
              Book this time
            </Button>
          </div>
        }
      </Row>
    );
  }

  return (
    <section aria-labelledby={`rr-${s.id}`} className="flex flex-col gap-2">
      <h3 id={`rr-${s.id}`} className="text-caption font-semibold text-fg-subtle">
        Connected
      </h3>
      <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">{rows}</ul>
      {productField &&
      <CreateOrderSheet open={orderOpen} onClose={() => setOrderOpen(false)} form={form} field={productField} submission={s} onCreated={(orderId, orderNumber) => onUpdate({ orderId, orderNumber })} />
      }
    </section>);

}

function Row({ icon: Icon, title, children }: {icon: React.ComponentType<{size?: number;className?: string;'aria-hidden'?: boolean;}>;title: string;children: React.ReactNode;}) {
  return (
    <li className="flex items-start gap-3 px-3.5 py-3 text-label">
      <Icon size={16} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-caption text-fg-subtle">{title}</span>
        {children}
      </div>
    </li>);

}