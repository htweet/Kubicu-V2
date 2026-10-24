import type { WorkspacePlan } from '../types/plan';

/**
 * Plan matrix (D101): the single list of what each plan includes — built, in preview and upcoming.
 * Used by the public Pricing page and docs/PLAN_MATRIX.md. Prices, limits and fees confirmed in D105.
 * Every new feature gets a row here when it is designed, even before it is built.
 */

export type PlanCell = boolean | string;
/** live = works in the prototype · preview = works, partner side simulated · planned = designed, not built yet. */
export type FeatureStatus = 'live' | 'preview' | 'planned';

export interface PlanFeature {
  label: string;
  note?: string;
  status: FeatureStatus;
  values: Record<WorkspacePlan, PlanCell>;
}

export interface PlanFeatureGroup {
  area: string;
  rows: PlanFeature[];
}

const order: WorkspacePlan[] = ['free', 'creator', 'pro', 'business', 'agency', 'enterprise'];
const all = (v: PlanCell): Record<WorkspacePlan, PlanCell> => ({ free: v, creator: v, pro: v, business: v, agency: v, enterprise: v });
/** ✓ from `min` upwards, ✗ below. */
const from = (min: WorkspacePlan, v: PlanCell = true): Record<WorkspacePlan, PlanCell> => {
  const i = order.indexOf(min);
  return Object.fromEntries(order.map((p, j) => [p, j >= i ? v : false])) as Record<WorkspacePlan, PlanCell>;
};
const each = (free: PlanCell, creator: PlanCell, pro: PlanCell, business: PlanCell, agency: PlanCell, enterprise: PlanCell) => ({ free, creator, pro, business, agency, enterprise });

export const planMatrix: PlanFeatureGroup[] = [
{
  area: 'Build',
  rows: [
  { label: 'Canvas editor and all core blocks', status: 'live', values: all(true) },
  { label: 'Pages per space', note: 'Shop, About, Book… under one link', status: 'live', values: each('1', '5', '20', '20', '20', 'Custom') },
  { label: 'Extra spaces — campaigns and DealRooms', status: 'live', values: each(false, '3', '15', '15', '15', 'Custom') },
  { label: 'Full photo galleries', note: 'Free shows the first photo', status: 'live', values: from('creator') },
  { label: 'Remove “Made with KUBICU”', status: 'live', values: from('creator') },
  { label: 'Custom domain', status: 'preview', values: from('creator') },
  { label: 'QR codes, campaign links and print kit', status: 'live', values: all(true) },
  { label: 'AI page setup and suggestions', note: 'Monthly AI credits', status: 'preview', values: each('10', '60', '200', '500', '1,500', '5,000') },
  { label: 'Media storage', status: 'live', values: each('100 MB', '1 GB', '5 GB', '5 GB', '5 GB', 'Custom') },
  { label: 'Sell your own templates', note: 'You keep 70%', status: 'live', values: all(true) },
  { label: 'Members-only pages and sections (code sign-in)', status: 'live', values: from('pro') },
  { label: 'Audio and playlist blocks', note: 'Sell tracks as downloads on Pro', status: 'live', values: all(true) },
  { label: 'Collection block', status: 'live', values: all(true) },
  { label: 'Search engine settings, sitemap and structured data', status: 'live', values: all(true) }]

},
{
  area: 'Sell',
  rows: [
  { label: 'Products', note: 'Free: 5 with WhatsApp ordering', status: 'live', values: { ...all('Unlimited'), free: '5' } },
  { label: 'Discount codes, automatic offers and referrals', status: 'live', values: all(true) },
  { label: 'Checkout with card and transfer', status: 'live', values: from('pro') },
  { label: 'Digital downloads', status: 'live', values: from('pro') },
  { label: 'Licence keys and buyer-stamped PDFs', note: 'With digital downloads; stamping simulated', status: 'live', values: from('pro') },
  { label: 'Printable invoices with bank details (Quotes & jobs)', status: 'live', values: all(true) },
  { label: 'Customer subscriptions and product boxes', status: 'live', values: from('pro') },
  { label: 'Paid event tickets and door check-in', note: 'Free events work on every plan', status: 'live', values: from('pro') },
  { label: 'Made-to-order deposits', status: 'live', values: from('pro') },
  { label: 'Payment links, including staged links', status: 'live', values: all(true) },
  { label: 'Support / pay-what-you-want block', note: 'A payment, not a tax-deductible donation', status: 'live', values: all(true) },
  { label: 'KUBICU wallet and payouts', note: 'After business verification', status: 'preview', values: all(true) },
  { label: 'Escrow buyer protection', status: 'preview', values: from('pro') },
  { label: 'Pay on delivery and instalments (seller-run)', status: 'live', values: from('pro') },
  { label: 'Seating maps (rows, tables, stage + standing)', status: 'live', values: from('pro') },
  { label: 'Repeating events (own seats and guest list per date)', status: 'live', values: from('free') }]

},
{
  area: 'Serve & grow',
  rows: [
  { label: 'Built-in bookings with deposits and balances', status: 'live', values: from('pro') },
  { label: 'Quotes, invoices, jobs and milestone payments', status: 'live', values: all(true) },
  { label: 'Audience, lead forms and newsletter', status: 'live', values: all(true) },
  { label: 'Analytics and Link Intelligence', status: 'live', values: all(true) },
  { label: 'Automations', status: 'live', values: all(true) },
  { label: 'IntentFlow — blocks by visitor source', status: 'live', values: all(true) },
  { label: 'Opportunities inbox', status: 'live', values: all(true) },
  { label: 'Lightweight mode for slow connections', status: 'live', values: all(true) }]

},
{
  area: 'Apps and partners',
  rows: [
  { label: 'Forms builder', note: 'Paid add-on ₦2,500/mo', status: 'live', values: from('creator', 'Add-on') },
  { label: 'Deliveries with rider booking and handover codes', status: 'preview', values: all(true) },
  { label: 'WhatsApp Commerce Bridge — inbox, catalogue, greeting and away', status: 'preview', values: all(true) },
  { label: 'WhatsApp keyword replies and order/booking updates', status: 'preview', values: from('creator') },
  { label: 'Trust Passport, badge block and public passport', status: 'preview', values: all(true) },
  { label: 'Voice-to-Store — speak your products in', status: 'preview', values: from('creator') },
  { label: 'Creator Collaboration — partners and commissions', status: 'preview', values: from('pro') },
  { label: 'AI Business Coach', note: 'Uses AI credits', status: 'preview', values: from('creator') },
  { label: 'Ordering prints from a partner print shop', status: 'preview', values: all(true) },
  { label: 'Co-branded spaces with a business partner', note: 'Needed by the business that sets it up', status: 'live', values: from('pro') },
  { label: 'Partner bundles — sell with another business, split at payment', note: 'Split payments simulated until a payment partner is chosen', status: 'preview', values: from('pro') }]

},
{
  area: 'Teams',
  rows: [
  { label: 'Team seats with roles and approvals', status: 'live', values: each(false, false, false, '5', '25', 'Custom') },
  { label: 'Assignments and activity log', status: 'live', values: from('business') },
  { label: 'Team comments with @mentions and resolve', status: 'live', values: from('business') },
  { label: 'Client workspaces and handover', status: 'live', values: from('agency') },
  { label: 'Priority support', status: 'live', values: from('business') },
  { label: 'Single sign-on (SSO)', status: 'preview', values: from('enterprise') }]

}];


export const featureStatusLabels: Record<FeatureStatus, string> = { live: 'Live', preview: 'Preview', planned: 'Coming' };