import type { CurrencyCode } from '../utils/currency';
import { kubicuBillingEntity } from './billing';

/**
 * How KUBICU bills a workspace in each country (D432): the tax added to KUBICU's own invoices, the seller of
 * record, and the invoice number series. EXAMPLE FIGURES AND DETAILS — confirm tax rates with tax advice and the
 * local entities with a lawyer before launch (listed in NOT_FOR_PRODUCTION.md).
 */
export interface BillingCountry {
  currency: CurrencyCode;
  /** Tax added to KUBICU invoices, as a fraction. */
  taxRate: number;
  /** Line label on quotes and invoices. */
  taxLabel: string;
  entity: {name: string;address: string;taxId: string;};
  /** Invoice numbers run per country: KUB-2026-0001 (Nigeria), KUB-KE-2026-0001 … */
  invoicePrefix: string;
}

export const billingCountries: Record<'NGN' | 'KES' | 'GHS' | 'ZAR', BillingCountry> = {
  NGN: { currency: 'NGN', taxRate: 0.075, taxLabel: 'VAT (7.5%, example)', entity: kubicuBillingEntity, invoicePrefix: 'KUB' },
  KES: {
    currency: 'KES',
    taxRate: 0.16,
    taxLabel: 'VAT (16%, example)',
    entity: { name: 'KUBICU Kenya (example entity)', address: 'Nairobi, Kenya — address to be confirmed', taxId: 'KRA PIN to be confirmed' },
    invoicePrefix: 'KUB-KE'
  },
  GHS: {
    currency: 'GHS',
    taxRate: 0.2,
    taxLabel: 'VAT and levies (20%, example)',
    entity: { name: 'KUBICU Ghana (example entity)', address: 'Accra, Ghana — address to be confirmed', taxId: 'TIN to be confirmed' },
    invoicePrefix: 'KUB-GH'
  },
  ZAR: {
    currency: 'ZAR',
    taxRate: 0.15,
    taxLabel: 'VAT (15%, example)',
    entity: { name: 'KUBICU South Africa (example entity)', address: 'Johannesburg, South Africa — address to be confirmed', taxId: 'VAT number to be confirmed' },
    invoicePrefix: 'KUB-ZA'
  }
};

export const billingCountryFor = (code: CurrencyCode): BillingCountry => (billingCountries as Record<string, BillingCountry>)[code] ?? billingCountries.NGN;