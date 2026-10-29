import type { CommerceData, Order } from '../../types/commerce';
import { extensionActive, readMarketplace } from '../marketplace';
import { uid } from '../id';

/** "Bank transfer payments" extension (D148): the buyer transfers to the seller's account; the seller confirms. */
export const BANK_TRANSFER_ID = 'bank-transfer';
/** Up to this many accounts can be offered (D223). */
export const MAX_BANK_ACCOUNTS = 3;

export interface TransferDetails {
  bank: string;
  account: string;
  accountName: string;
}

/**
 * The accounts saved in the extension's settings (D223). Saved as JSON under `accounts`; older installs
 * only had one `bank` + `account` and no account name, which is read as a single account.
 */
export function parseAccounts(settings: Record<string, string> | undefined): TransferDetails[] {
  const s = settings ?? {};
  if (s.accounts) {
    try {
      const list = JSON.parse(s.accounts) as Partial<TransferDetails>[];
      if (Array.isArray(list)) return list.map((a) => ({ bank: (a.bank ?? '').trim(), account: (a.account ?? '').trim(), accountName: (a.accountName ?? '').trim() }));
    } catch {

      /* fall through to the old single account */}
  }
  if (s.bank || s.account) return [{ bank: (s.bank ?? '').trim(), account: (s.account ?? '').trim(), accountName: (s.accountName ?? '').trim() }];
  return [];
}

export function accountIssue(a: TransferDetails): {bank?: string;account?: string;accountName?: string;} {
  return {
    bank: a.bank.trim().length < 2 ? 'Enter the bank name' : undefined,
    account: /^\d{10}$/.test(a.account.trim()) ? undefined : 'NUBAN account numbers are 10 digits',
    accountName: a.accountName.trim().length < 2 ? 'Enter the name on the account' : undefined
  };
}

/** Settings to save for a list of accounts; the first is also kept in the old fields for older readers. */
export function accountsToSettings(list: TransferDetails[]): Record<string, string> {
  const clean = list.map((a) => ({ bank: a.bank.trim(), account: a.account.trim(), accountName: a.accountName.trim() }));
  return { accounts: JSON.stringify(clean), bank: clean[0]?.bank ?? '', account: clean[0]?.account ?? '', accountName: clean[0]?.accountName ?? '' };
}

/**
 * Every valid account the seller offers, when the extension is installed and on — readable from public pages.
 * An account saved before names were asked for falls back to the business name.
 */
export function transferAccounts(workspaceId: string | null | undefined, fallbackName: string): TransferDetails[] {
  if (!workspaceId) return [];
  const market = readMarketplace(workspaceId);
  if (!extensionActive(market, BANK_TRANSFER_ID)) return [];
  return parseAccounts(market.installed[BANK_TRANSFER_ID]?.settings).
  filter((a) => a.bank.length >= 2 && /^\d{10}$/.test(a.account)).
  map((a) => ({ ...a, accountName: a.accountName || fallbackName.trim() }));
}

/** The first account (older callers). */
export function transferDetails(workspaceId: string | null | undefined, accountName: string): TransferDetails | null {
  return transferAccounts(workspaceId, accountName)[0] ?? null;
}

/** Stamps a just-placed order as awaiting a transfer. No payment provider is involved, so no provider fee. */
export function stampTransfer(o: Order, details: TransferDetails): Order {
  return {
    ...o,
    providerFeeNgn: 0,
    paymentNote: 'Bank transfer',
    bankTransfer: { ...details },
    events: [...o.events, { id: uid('ev'), at: new Date().toISOString(), kind: 'payment', label: `Customer chose bank transfer to ${details.bank} ${details.account.slice(-4).padStart(details.account.length, '•')} — waiting for the money` }]
  };
}

/** The buyer says they've sent it. The seller still confirms the money arrived. */
export function markTransferSent(data: CommerceData, orderId: string): CommerceData {
  const at = new Date().toISOString();
  return {
    ...data,
    orders: data.orders.map((o) =>
    o.id === orderId && o.bankTransfer && !o.bankTransfer.sentAt ?
    { ...o, bankTransfer: { ...o.bankTransfer, sentAt: at }, events: [...o.events, { id: uid('ev'), at, kind: 'payment', label: 'Customer says the transfer was sent' }] } :
    o
    )
  };
}