import type { Booking, OpsData, Service } from '../../types/ops';
import { uid } from '../id';

/** Booking fee now, balance before the appointment (D95). */

export const DEFAULT_BALANCE_HOURS = 24;
export const balanceHourOptions = [2, 12, 24, 48, 72];

export type BalanceState = 'none' | 'at_appointment' | 'upcoming' | 'due' | 'overdue' | 'paid';

export interface BookingBalance {
  state: BalanceState;
  /** What's left after the deposit. */
  amount: number;
  dueAt: number | null;
  paid: number;
}

/** Works from the deal copied onto the booking; falls back to the service for older bookings. */
export function bookingBalance(b: Booking, service?: Service, now = Date.now()): BookingBalance {
  const amount = b.priceNgn !== null ? Math.max(0, b.priceNgn - b.depositPaidNgn) : 0;
  const online = b.balanceOnline ?? service?.balanceOnline ?? false;
  const paid = b.balancePaidNgn ?? 0;
  if (b.priceNgn === null || amount === 0) return { state: 'none', amount: 0, dueAt: null, paid };
  if (paid >= amount) return { state: 'paid', amount, dueAt: null, paid };
  if (!online) return { state: 'at_appointment', amount, dueAt: null, paid };
  const hours = b.balanceHoursBefore ?? service?.balanceHoursBefore ?? DEFAULT_BALANCE_HOURS;
  const dueAt = Date.parse(b.start) - hours * 3_600_000;
  // Ask for it from 3 days before the due time; past it, it's overdue.
  const state: BalanceState = now > dueAt ? 'overdue' : now > dueAt - 3 * 86_400_000 ? 'due' : 'upcoming';
  return { state, amount, dueAt, paid };
}

export const balanceLabels: Record<BalanceState, string> = {
  none: 'Nothing more to pay',
  at_appointment: 'Paid at the appointment',
  upcoming: 'Balance not due yet',
  due: 'Balance due',
  overdue: 'Balance overdue',
  paid: 'Balance paid',
};

export function payBookingBalance(d: OpsData, bookingId: string, how: 'online' | 'recorded'): OpsData {
  const at = new Date().toISOString();
  return {
    ...d,
    bookings: d.bookings.map((b) => {
      if (b.id !== bookingId || b.priceNgn === null) return b;
      const amount = Math.max(0, b.priceNgn - b.depositPaidNgn);
      return {
        ...b,
        balancePaidNgn: amount,
        balancePaidAt: at,
        balancePaidHow: how,
        events: [...b.events, { id: uid('bev'), at, label: how === 'online' ? 'Balance paid online (test mode)' : 'Balance recorded as paid by the business' }],
      };
    }),
  };
}
