/** Accounting connections (D438): Xero or Sage, one at a time per workspace. Simulated — nothing reaches the provider. */
export type AccountingProviderId = 'xero' | 'sage';

export type AccountingPostMode = 'each' | 'daily';

export interface AccountingAccounts {
  sales: string;
  fees: string;
  refunds: string;
  vat: string;
  /** Where money waits between the payment provider and your bank. */
  clearing: string;
  /** Your business bank account: wallet payouts move here from clearing (D452). Missing on older connections. */
  bank?: string;
  /** Tax collected for other countries the shop is registered in, by country code (D456). */
  vatAbroad?: Partial<Record<string, string>>;
}

/** The single-code accounts (everything except the per-country tax map). */
export type AccountKey = Exclude<keyof AccountingAccounts, 'vatAbroad'>;

export interface AccountingRun {
  id: string;
  at: string;
  posted: number;
  failed: number;
  /** Amount posted, in the shop's currency. */
  amountNgn: number;
  trigger: 'manual' | 'auto';
  problems: string[];
  /** Wallet payouts posted as transfers from clearing to the bank account (D452). */
  transfers?: number;
  /** Manual payout fees posted to the payment fees account (D455). */
  payoutFeesNgn?: number;
}

export interface AccountingState {
  provider: AccountingProviderId | null;
  organisation: string;
  connectedAt: string | null;
  mode: AccountingPostMode;
  /** Payments from this day on are synced (YYYY-MM-DD). */
  startFrom: string;
  accounts: AccountingAccounts;
  auto: boolean;
  /** Entry key → when it was posted. */
  synced: Record<string, string>;
  runs: AccountingRun[];
}