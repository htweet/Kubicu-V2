import type { WorkspacePlan } from '../types/plan';

/** What each plan adds, shown in the upgrade dialog. Limits are example figures (D24, D41, D48, D50). */
export const planHighlights: Record<WorkspacePlan, string[]> = {
  free: ['Main page with every basic block', '5 products with WhatsApp ordering', '100 MB of media'],
  creator: ['Remove “Made with KUBICU”', 'Unlimited products', 'Up to 5 pages per site', '3 campaigns or DealRooms', '1 GB of media'],
  pro: ['Checkout and test card payments', 'Sell digital files', 'Built-in bookings with deposits', 'Up to 20 pages per site', '15 campaigns or DealRooms', '5 GB of media'],
  business: ['Everything in Pro', 'Up to 5 team seats with roles', 'Priority support'],
  agency: ['Everything in Business', 'Many client workspaces', 'Client handover'],
  enterprise: ['Custom limits and contracts', 'Dedicated support']
};