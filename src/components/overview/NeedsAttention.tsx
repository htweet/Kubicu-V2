import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, BellIcon, CalendarIcon, GavelIcon, PackageIcon, ReceiptIcon, SendIcon, UsersIcon } from 'lucide-react';
import { useTeam } from '../../contexts/TeamContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useOps } from '../../contexts/OpsContext';
import { isLowStock, isSoldOut } from '../../utils/commerce/catalog';

/** Compact row of things to act on today. Hidden when there's nothing to do. */
export function NeedsAttention() {
  const { data } = useCommerce();
  const toFulfil = data.orders.filter((o) => o.status === 'paid' || o.status === 'packing').length;
  const toConfirm = data.orders.filter((o) => o.status === 'new').length;
  const disputes = data.orders.filter((o) => o.dispute?.status === 'needs_response').length;
  const stock = data.products.filter((p) => p.status === 'active' && (isSoldOut(p) || isLowStock(p))).length;
  const ops = useOps().data;
  const todayKey = new Date().toDateString();
  const todayBookings = ops.bookings.filter((b) => b.status === 'confirmed' && new Date(b.start).toDateString() === todayKey).length;
  const newLeads = ops.contacts.filter((c) => c.stage === 'new' && c.sources.includes('form')).length;
  const dueTasks = ops.contacts.reduce((s, c) => s + c.tasks.filter((t) => !t.done && t.due && Date.parse(t.due) < Date.now() + 86400000).length, 0);

  const team = useTeam();
  const reviews = team.can('approvals.review').allowed ? team.data.reviews.filter((r) => r.status === 'pending').length : 0;
  const unseen = team.myNotices.filter((n) => !n.seen);

  const items = [
  reviews > 0 && { id: 'reviews', icon: SendIcon, label: `${reviews} change${reviews === 1 ? '' : 's'} to review`, to: '/app/settings/approvals' },
  unseen[0] && { id: 'notice', icon: BellIcon, label: unseen.length > 1 ? `${unseen[0].text} (+${unseen.length - 1} more)` : unseen[0].text, to: unseen[0].href ?? '/app/settings/approvals' },
  todayBookings > 0 && { id: 'today', icon: CalendarIcon, label: `${todayBookings} booking${todayBookings === 1 ? '' : 's'} today`, to: '/app/bookings' },
  newLeads > 0 && { id: 'leads', icon: UsersIcon, label: `${newLeads} new lead${newLeads === 1 ? '' : 's'}`, to: '/app/audience' },
  dueTasks > 0 && { id: 'tasks', icon: UsersIcon, label: `${dueTasks} follow-up${dueTasks === 1 ? '' : 's'} due`, to: '/app/audience' },
  toFulfil > 0 && { id: 'fulfil', icon: ReceiptIcon, label: `${toFulfil} order${toFulfil === 1 ? '' : 's'} to fulfil`, to: '/app/commerce/orders?status=paid' },
  toConfirm > 0 && { id: 'confirm', icon: ReceiptIcon, label: `${toConfirm} awaiting payment`, to: '/app/commerce/orders?status=new' },
  disputes > 0 && { id: 'dispute', icon: GavelIcon, label: `${disputes} dispute${disputes === 1 ? '' : 's'} to answer`, to: '/app/commerce/orders' },
  stock > 0 && { id: 'stock', icon: PackageIcon, label: `${stock} product${stock === 1 ? '' : 's'} low or sold out`, to: '/app/commerce/inventory' }].
  filter(Boolean) as {id: string;icon: typeof ReceiptIcon;label: string;to: string;}[];

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="attention-heading" className="mt-8">
      <h2 id="attention-heading" className="text-label font-semibold text-fg-subtle">
        Needs attention
      </h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((i) =>
        <li key={i.id}>
            <Link
            to={i.to}
            onClick={i.id === 'notice' ? team.markNoticesSeen : undefined}
            className="group inline-flex h-10 items-center gap-2 rounded-full border border-line bg-raised px-4 text-label font-semibold text-fg transition-colors duration-150 hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
              <i.icon size={15} strokeWidth={2.25} className="text-action" aria-hidden />
              {i.label}
              <ArrowRightIcon size={14} className="text-fg-subtle transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        )}
      </ul>
    </section>);

}