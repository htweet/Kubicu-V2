import type { Invoice } from '../types/billing';
import { billingCountryFor } from '../data/billingCountries';
import { billingCurrency, formatNairaAt, type CurrencyCode } from './currency';
import { isFxCode, nairaPerToday, nairaToLocal, rateMoveSince } from './fxRates';

/**
 * KUBICU's own charges in the workspace country's currency (D432). Amounts are kept in naira (the one price list)
 * and converted at the day's rate; an invoice freezes the rate of the day it was made.
 */
export interface LocalBreakdown {
  code: CurrencyCode;
  /** Naira per unit used, or 1 for naira. */
  rate: number;
  subtotal: number;
  tax: number;
  total: number;
  taxLabel: string;
}

/** Subtotal, tax and total in the billing currency — tax worked out on the local subtotal, at that country's rate. */
export function localBreakdown(subtotalNgn: number, code: CurrencyCode = billingCurrency(), rate = nairaPerToday(code)): LocalBreakdown {
  const country = billingCountryFor(code);
  const subtotal = Math.max(0, nairaToLocal(subtotalNgn, code, rate));
  const tax = Math.round(subtotal * country.taxRate);
  return { code, rate, subtotal, tax, total: subtotal + tax, taxLabel: country.taxLabel };
}

/** Format a naira amount the way this invoice shows it — at its frozen rate, or naira for older invoices. */
export function invoiceMoney(inv: Invoice, ngn: number): string {
  const fx = inv.fx;
  return fx ? formatNairaAt(ngn, fx.currency, fx.rate) : formatNairaAt(ngn, 'NGN');
}

/** An invoice's own subtotal, tax and total — local and frozen when it has a rate, else the stored naira figures. */
export function invoiceTotals(inv: Invoice): LocalBreakdown {
  if (inv.fx) return localBreakdown(inv.subtotalNgn, inv.fx.currency, inv.fx.rate);
  return { code: 'NGN', rate: 1, subtotal: inv.subtotalNgn, tax: inv.vatNgn, total: inv.totalNgn, taxLabel: billingCountryFor('NGN').taxLabel };
}

/** "₦11.80 = KSh 1" for the rate line. */
export const rateLine = (code: CurrencyCode, rate: number) => `₦${rate.toFixed(2)} = ${code === 'KES' ? 'KSh' : code === 'GHS' ? 'GH₵' : code === 'ZAR' ? 'R' : code} 1`;

/** True when the day's rate has moved more than 10% since the last paid invoice — renewal reminders say so. */
export function rateMovedSince(lastInvoice: Invoice | undefined): { moved: boolean; pct: number } {
  const code = billingCurrency();
  if (!lastInvoice?.fx || !isFxCode(code) || lastInvoice.fx.currency !== code) return { moved: false, pct: 0 };
  const pct = rateMoveSince(code, lastInvoice.fx.date);
  return { moved: pct > 0.1, pct };
}

/** How long an unpaid invoice keeps its amount. */
export const INVOICE_HOLD_DAYS = 7;
