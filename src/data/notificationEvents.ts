import { BellIcon, CalendarIcon, CreditCardIcon, GlobeIcon, LayoutTemplateIcon, PackageIcon, ReceiptIcon, SparklesIcon, UsersIcon, type LucideIcon } from 'lucide-react';
import type { Permission } from '../types/team';
import type { NotifArea, NotifChannel, NotifEventId } from '../types/notifications';

export interface NotifEventInfo {
  id: NotifEventId;
  label: string;
  area: NotifArea;
  /** Who receives it: only people whose role can act on it (D66). Null = everyone it's addressed to. */
  permission: Permission | null;
  defaults: Record<NotifChannel, boolean>;
}

const on = { app: true, email: true, whatsapp: false };
const appOnly = { app: true, email: false, whatsapp: false };
const urgent = { app: true, email: true, whatsapp: true };

export const notifEvents: NotifEventInfo[] = [
{ id: 'order_paid', label: 'New paid order', area: 'orders', permission: 'orders.manage', defaults: urgent },
{ id: 'order_pending', label: 'Order waiting for payment', area: 'orders', permission: 'orders.manage', defaults: appOnly },
{ id: 'dispute', label: 'Payment dispute opened', area: 'orders', permission: 'orders.refund', defaults: urgent },
{ id: 'sub_new', label: 'New subscriber or trial', area: 'orders', permission: 'orders.manage', defaults: on },
{ id: 'sub_failed', label: 'Subscription payment failed', area: 'orders', permission: 'orders.manage', defaults: urgent },
{ id: 'sub_cancelled', label: 'Subscription cancelled', area: 'orders', permission: 'orders.manage', defaults: appOnly },
{ id: 'stock', label: 'Product low or sold out', area: 'stock', permission: 'products.edit', defaults: on },
{ id: 'booking_today', label: 'Bookings today', area: 'bookings', permission: 'bookings.manage', defaults: on },
{ id: 'booking_cancelled', label: 'Booking cancelled', area: 'bookings', permission: 'bookings.manage', defaults: on },
{ id: 'lead_new', label: 'New lead from a form', area: 'audience', permission: 'contacts.manage', defaults: on },
{ id: 'task_due', label: 'Follow-up due', area: 'audience', permission: 'contacts.manage', defaults: appOnly },
{ id: 'review_pending', label: 'Change sent for review', area: 'pages', permission: 'approvals.review', defaults: on },
{ id: 'team_notice', label: 'Messages for you (reviews, invites)', area: 'team', permission: null, defaults: on },
{ id: 'payment_failed', label: 'Plan payment failed', area: 'billing', permission: 'billing.manage', defaults: urgent },
{ id: 'renewal_soon', label: 'Plan renews soon', area: 'billing', permission: 'billing.manage', defaults: on },
{ id: 'trial_ending', label: 'Trial ending', area: 'billing', permission: 'billing.manage', defaults: on },
{ id: 'ai_low', label: 'AI credits running low', area: 'ai', permission: 'pages.edit', defaults: appOnly },
{ id: 'domain_status', label: 'Domain live or needs attention', area: 'domains', permission: 'domains.manage', defaults: on },
{ id: 'dealroom_result', label: 'DealRoom goal met or missed', area: 'pages', permission: 'pages.edit', defaults: on },
{ id: 'campaign_phase', label: 'Campaign went live or ended', area: 'pages', permission: 'pages.edit', defaults: appOnly }];


export const notifEventById = Object.fromEntries(notifEvents.map((e) => [e.id, e])) as Record<NotifEventId, NotifEventInfo>;

export const notifAreas: Record<NotifArea, {label: string;icon: LucideIcon;}> = {
  orders: { label: 'Orders', icon: ReceiptIcon },
  stock: { label: 'Stock', icon: PackageIcon },
  bookings: { label: 'Bookings', icon: CalendarIcon },
  audience: { label: 'Audience', icon: UsersIcon },
  pages: { label: 'Pages', icon: LayoutTemplateIcon },
  team: { label: 'Team', icon: BellIcon },
  billing: { label: 'Billing', icon: CreditCardIcon },
  ai: { label: 'AI', icon: SparklesIcon },
  domains: { label: 'Domains', icon: GlobeIcon }
};

export const channelLabels: Record<NotifChannel, string> = { app: 'In app', email: 'Email', whatsapp: 'WhatsApp' };