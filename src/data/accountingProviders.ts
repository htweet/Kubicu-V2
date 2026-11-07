import type { AccountingAccounts, AccountingProviderId, AccountKey } from '../types/accounting';

/** Xero and Sage Business Cloud (D438). Default account codes follow each tool's standard chart — examples to confirm. */
export const accountingProviders: Record<AccountingProviderId, { name: string; blurb: string; defaults: AccountingAccounts }> = {
  xero: {
    name: 'Xero',
    blurb: 'Sales, fees and refunds post as invoices and bank transactions. Popular with accountants in Kenya, Ghana and South Africa.',
    defaults: { sales: '200', fees: '404', refunds: '200', vat: '820', clearing: '610', bank: '090' },
  },
  sage: {
    name: 'Sage Business Cloud',
    blurb: 'Sales, fees and refunds post as journals. Common in South Africa and Nigeria.',
    defaults: { sales: '4000', fees: '7900', refunds: '4009', vat: '2200', clearing: '1210', bank: '1200' },
  },
};

export const accountLabels: Record<AccountKey, { label: string; hint: string }> = {
  sales: { label: 'Sales', hint: 'Income from orders, bookings, invoices and links.' },
  fees: { label: 'Payment fees', hint: 'Provider, KUBICU and manual payout fees — an expense.' },
  refunds: { label: 'Refunds', hint: 'Money returned to buyers.' },
  vat: { label: 'Tax collected', hint: 'VAT you owe the tax office.' },
  clearing: { label: 'Clearing account', hint: 'Holds money between your payment provider and your bank.' },
  bank: { label: 'Bank account', hint: 'Your business bank account. Wallet payouts move here from the clearing account.' },
};

export const ACCOUNTING_PLAN = 'pro' as const;
