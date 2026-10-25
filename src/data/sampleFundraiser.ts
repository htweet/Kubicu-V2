import type { FundraiserSettings } from '../types/page';
import type { LinkPayment, PaymentLink } from '../types/money';

/*
 * SAMPLE fundraiser for the demo workspace (D179, Pass C). Its counter reads these labelled sample
 * payments like any real ones — one is refunded, so the total shows refunds leaving it.
 */

export const SAMPLE_FUND_HANDLE = 'adaeze-apprentice-machines';
export const SAMPLE_FUND_LINK_ID = 'pl_s_fund';

const DAY = 86400_000;
const at = (daysAgo: number) => new Date(Date.now() - daysAgo * DAY).toISOString();

export function sampleFundraiserSettings(): FundraiserSettings {
  return {
    linkId: SAMPLE_FUND_LINK_ID,
    goalNgn: 600_000,
    endsAt: new Date(Date.now() + 18 * DAY).toISOString(),
    closedAt: null,
    organiser: 'Adaeze Atelier',
    purpose: 'Four sewing machines for our apprentice programme',
    beneficiary: 'Six apprentices in Yaba',
    amounts: [5_000, 10_000, 25_000, 50_000],
    minNgn: 1_000,
    askMessage: true,
    updates: [{ id: 'fupd_s1', at: at(2), text: 'The first machine is ordered — thank you to everyone who has given so far. (sample)' }],
    extensions: []
  };
}

const payments: LinkPayment[] = [
{ id: 'lp_sf1', at: at(1), amountNgn: 50_000, payerName: 'Kemi Bello', payerPhone: '', note: 'For the apprentices!', method: 'wallet', receipt: 'R-S-F01', showName: true, sample: true },
{ id: 'lp_sf2', at: at(2), amountNgn: 10_000, payerName: 'Tunde Ade', payerPhone: '', note: '', method: 'wallet', receipt: 'R-S-F02', showName: false, sample: true },
{ id: 'lp_sf3', at: at(3), amountNgn: 25_000, payerName: 'Ifeoma Nwosu', payerPhone: '', note: '', method: 'wallet', receipt: 'R-S-F03', showName: true, sample: true },
{ id: 'lp_sf4', at: at(4), amountNgn: 5_000, payerName: 'Chuka Eze', payerPhone: '', note: 'Paid twice by mistake', method: 'wallet', receipt: 'R-S-F04', showName: false, refundedNgn: 5_000, refundedAt: at(3), sample: true },
{ id: 'lp_sf5', at: at(5), amountNgn: 100_000, payerName: 'Halima Yusuf', payerPhone: '', note: 'Proud of what you’re building.', method: 'wallet', receipt: 'R-S-F05', showName: true, sample: true },
{ id: 'lp_sf6', at: at(7), amountNgn: 25_000, payerName: 'Bisi Oyelaran', payerPhone: '', note: '', method: 'wallet', receipt: 'R-S-F06', showName: false, sample: true }];


/** The payment link behind the sample fundraiser, built on a blank link from the money store. */
export function sampleFundraiserLink(base: PaymentLink): PaymentLink {
  const f = sampleFundraiserSettings();
  return {
    ...base,
    id: SAMPLE_FUND_LINK_ID,
    slug: 'apprentice-machines',
    kind: 'open',
    title: 'Sewing machines for apprentices (sample)',
    description: f.purpose,
    minNgn: f.minNgn,
    fields: { name: true, phone: false, note: true },
    expiresAt: f.endsAt,
    status: 'active',
    reusable: true,
    maxUses: null,
    method: 'wallet',
    createdAt: at(9),
    payments,
    fundraiser: { handle: SAMPLE_FUND_HANDLE, organiser: f.organiser },
    sample: true
  };
}