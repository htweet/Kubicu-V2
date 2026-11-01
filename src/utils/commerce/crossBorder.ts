import type { CountryCode } from '../../types/country';
import type { Product } from '../../types/commerce';
import { activeCurrency, convertExampleNaira } from '../currency';
import { countryInfo } from '../country';
import { figure, onOpsSettings } from '../opsSettings';

/**
 * Cross-border delivery between Nigeria, Kenya, Ghana and South Africa (D436). Courier names, rates and times are
 * EXAMPLES — no courier is connected. Rates are set in naira and shown in the shop's currency at the day's rate.
 */
export interface CrossBorderOption {
  id: 'intl_express' | 'intl_economy';
  courier: string;
  title: string;
  eta: string;
  fee: number;
}

const rates = {
  intl_express: { courier: 'Express courier (example)', baseNgn: 18_000, perKgNgn: 6_000, eta: '3–5 business days' },
  intl_economy: { courier: 'Economy courier (example)', baseNgn: 9_000, perKgNgn: 3_500, eta: '7–12 business days' }
};
// Courier rates are example figures staff can change (D465).
onOpsSettings(() => {
  rates.intl_express.baseNgn = figure('crossBorder.expressBaseNgn');
  rates.intl_express.perKgNgn = figure('crossBorder.expressPerKgNgn');
  rates.intl_economy.baseNgn = figure('crossBorder.economyBaseNgn');
  rates.intl_economy.perKgNgn = figure('crossBorder.economyPerKgNgn');
});

/** Each item counts this much when its weight isn't set. */
export const DEFAULT_ITEM_KG = 0.5;

export function parcelKg(lines: {product?: Product;qty: number;}[]): number {
  const kg = lines.reduce((s, l) => s + (l.product?.kind === 'physical' && !l.product.giftCard ? (l.product.weightKg ?? DEFAULT_ITEM_KG) * l.qty : 0), 0);
  return Math.max(0.5, Math.round(kg * 10) / 10);
}

const local = (ngn: number) => activeCurrency() === 'NGN' ? ngn : convertExampleNaira(ngn, activeCurrency());

/** Courier options to a country for a parcel of `kg`, cheapest last. */
export function crossBorderOptions(to: CountryCode, kg: number): CrossBorderOption[] {
  const name = countryInfo(to).name;
  return (Object.keys(rates) as CrossBorderOption['id'][]).map((id) => {
    const r = rates[id];
    return { id, courier: r.courier, title: `${id === 'intl_express' ? 'Express' : 'Economy'} to ${name}`, eta: r.eta, fee: local(Math.round(r.baseNgn + r.perKgNgn * Math.max(0, kg - 0.5))) };
  });
}

export const isCrossBorderMethod = (method: string) => method === 'intl_express' || method === 'intl_economy';

/**
 * Tracking steps for a cross-border parcel, including the customs states (D436). Wired into Deliveries in D451:
 * index 0–1 follow the delivery's status, 2–5 follow `Delivery.crossBorder.stage` (1–4), 6 is the handover.
 */
export const crossBorderSteps = ['Booked with courier', 'Picked up', 'Left {from}', 'At customs in {to}', 'Cleared customs', 'Out for delivery', 'Delivered'] as const;
export const crossBorderProblems = { held: 'Held at customs — the courier needs more details or duties to be paid', returned: 'Returned to sender' } as const;