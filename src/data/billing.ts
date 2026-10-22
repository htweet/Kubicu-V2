import type { WorkspacePlan } from '../types/plan';
import type { CardOutcome } from '../types/billing';

/**
 * Example monthly prices in NGN, taken from inside each plan's price hypothesis (blueprint §19.1).
 * Not final pricing (D65). Enterprise is quoted, so it has no self-serve price.
 */
export const monthlyPriceNgn: Record<WorkspacePlan, number | null> = {
  free: 0,
  creator: 3000,
  pro: 8000,
  business: 20000,
  agency: 50000,
  enterprise: null
};

/** Yearly = 10 months — "2 months free". */
export const YEARLY_MONTHS = 10;
/** Example VAT rate (Nigeria, 7.5%). Confirm with tax advice before launch. */
export const VAT_RATE = 0.075;
export const GRACE_DAYS = 7;
export const TRIAL_DAYS = 14;
export const TRIAL_PLAN: WorkspacePlan = 'pro';
export const TRIAL_REMINDER_DAYS = 3;

export const cancelReasons = ['It costs too much', 'I’m not using it enough', 'A feature I need is missing', 'I’m moving to another tool', 'My business is closing or pausing', 'Something else'];

/** Test card numbers choose the outcome, like a payment provider's test mode. */
export const testCards: {number: string;outcome: CardOutcome;label: string;}[] = [
{ number: '4242 4242 4242 4242', outcome: 'success', label: 'Pays' },
{ number: '4000 0000 0000 3220', outcome: 'challenge', label: 'Asks your bank to confirm' },
{ number: '4000 0000 0000 0002', outcome: 'declined', label: 'Declined' },
{ number: '4000 0000 0000 0069', outcome: 'expired', label: 'Expired card' }];


/** Illustrative seller-of-record details printed on invoices. */
export const kubicuBillingEntity = {
  name: 'KUBICU Technologies Ltd (example)',
  address: 'Lagos, Nigeria',
  taxId: 'TIN 00000000-0001 (example)'
};