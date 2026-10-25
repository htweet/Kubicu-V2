import type { CommerceData, Order } from '../../types/commerce';
import { extensionActive, readMarketplace } from '../marketplace';
import { uid } from '../id';

/** "Bank transfer payments" extension (D148): the buyer transfers to the seller's account; the seller confirms. */
export const BANK_TRANSFER_ID = 'bank-transfer';

export interface TransferDetails {
  bank: string;
  account: string;
  accountName: string;
}

/** The seller's transfer details when the extension is installed, on and set up — readable from public pages. */
export function transferDetails(workspaceId: string | null | undefined, accountName: string): TransferDetails | null {
  if (!workspaceId) return null;
  const market = readMarketplace(workspaceId);
  if (!extensionActive(market, BANK_TRANSFER_ID)) return null;
  const s = market.installed[BANK_TRANSFER_ID]?.settings ?? {};
  const bank = (s.bank ?? '').trim();
  const account = (s.account ?? '').trim();
  if (!bank || !/^\d{10}$/.test(account)) return null;
  return { bank, account, accountName: accountName.trim() };
}

/** Stamps a just-placed order as awaiting a transfer. No payment provider is involved, so no provider fee. */
export function stampTransfer(o: Order, details: TransferDetails): Order {
  return {
    ...o,
    providerFeeNgn: 0,
    paymentNote: 'Bank transfer',
    bankTransfer: { ...details },
    events: [...o.events, { id: uid('ev'), at: new Date().toISOString(), kind: 'payment', label: 'Customer chose bank transfer — waiting for the money' }]
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