import type { LegalDoc } from '../../types/legal';

/** Draft wording — pending legal review (D42, D44, D70, D78). */
export const policyDocs: LegalDoc[] = [
{
  slug: 'refunds',
  title: 'Refunds and cancellations',
  group: 'Legal',
  intro: 'How refunds work for things you buy from sellers on KUBICU, and for KUBICU plans themselves.',
  updated: '22 October 2026',
  version: 'Draft 0.2',
  sections: [
  { id: 'sellers', title: 'Buying from a seller', summary: 'Each seller sets their own policy and must show it.', paragraphs: ['Sellers set their refund, cancellation and delivery terms. They must show them before you pay. If something never arrives or isn’t as described, contact the seller first using the details on your order page.'] },
  { id: 'customers', title: 'What customers always get', summary: 'Refunds return exactly what you paid.', paragraphs: ['When a seller refunds an order, you get back exactly what you paid. If a DealRoom group goal is missed, everyone is refunded automatically. If an event is cancelled, tickets are refunded in full.'] },
  { id: 'disputes', title: 'If you can’t agree', summary: 'Ask your bank, and tell us.', paragraphs: ['You can raise a dispute with your bank or card issuer. Please also report the page to us — we look at every report and can pause sellers who don’t deliver.'] },
  { id: 'plans', title: 'KUBICU plans', summary: 'Cancel any time; you keep the plan until the period ends.', paragraphs: ['Plan payments aren’t refunded for time already used. If you were charged in error, contact us within 14 days. Premium templates can be refunded within 7 days of purchase.'] }]

},
{
  slug: 'seller-terms',
  title: 'Seller terms',
  group: 'Legal',
  intro: 'Extra terms for workspaces that take payments, sell tickets or sell templates.',
  updated: '22 October 2026',
  version: 'Draft 0.2',
  sections: [
  { id: 'fees', title: 'Fees', summary: 'Provider fee plus 0–2% KUBICU fee, shown on every order.', paragraphs: ['Each payment carries the payment provider’s fee (example: 1.5% + ₦100) and a KUBICU fee of 0–2% depending on plan. Every order shows the gross amount, fees and what you receive.'] },
  { id: 'payouts', title: 'Payouts', summary: 'Paid to your verified bank account by the provider.', paragraphs: ['Payouts are made by the payment provider to a bank account in your name or your business’s name. The provider may hold payouts while it verifies your identity.'] },
  { id: 'refund-fees', title: 'Refunds and fees', summary: 'KUBICU’s fee is returned on full refunds; the provider’s may not be.', paragraphs: ['When you refund an order in full, KUBICU returns its fee. The provider’s fee usually isn’t returned and stays a cost to you. KUBICU waives its fee on DealRooms that miss their goal.'] },
  { id: 'disputes', title: 'Disputes and chargebacks', summary: 'Respond with evidence within the provider’s deadline.', paragraphs: ['If a customer disputes a payment, upload evidence from the order screen before the deadline. Lost disputes are deducted from future payouts.'] },
  { id: 'templates', title: 'Selling templates', summary: 'You keep 70%; staff review every template.', paragraphs: ['Templates you sell are reviewed before listing. You keep 70% of each sale and KUBICU 30% (example split). Buyers get a licence to use the template for their own pages, not to resell it. Payouts start from ₦5,000.'] }]

},
{
  slug: 'safety',
  title: 'Safety tips for buyers',
  group: 'Trust & safety',
  intro: 'Simple ways to shop safely from pages on KUBICU.',
  updated: '22 October 2026',
  version: 'Draft 0.1',
  sections: [
  { id: 'pay', title: 'Pay through the page', summary: 'Checkout keeps a record and lets you dispute.', paragraphs: ['Where a page has checkout, pay there. Be careful if a seller asks you to transfer to a personal account outside the page.'] },
  { id: 'check', title: 'Check the seller', summary: 'Look for clear contact details and policies.', paragraphs: ['Good signs: a real phone number or address, a refund policy, and reviews that link to real orders. Be careful with prices that look far too low.'] },
  { id: 'groups', title: 'Group buys', summary: 'DealRoom counters only count real orders.', paragraphs: ['In a DealRoom, the progress bar only counts paid orders. If a group goal is missed, you’re refunded automatically.'] },
  { id: 'report', title: 'Something wrong?', summary: 'Report the page and contact your bank.', paragraphs: ['Use “Report this page” at the bottom of any page. If you lost money, contact your bank too — they can act faster than we can.'] }]

},
{
  slug: 'takedown',
  title: 'Takedowns and appeals',
  group: 'Trust & safety',
  intro: 'What happens after a page is reported, and how to ask us to look again.',
  updated: '22 October 2026',
  version: 'Draft 0.1',
  sections: [
  { id: 'review', title: 'How reports are reviewed', summary: 'A person reviews every report, usually within 2 working days.', paragraphs: ['Reports go to our moderation team. They look at the page, the reason given and any history. Urgent harm (fraud in progress, child safety) is prioritised.'] },
  { id: 'outcomes', title: 'Possible outcomes', summary: 'Dismissed, warning, page removed, or workspace suspended.', paragraphs: ['If the page breaks our rules we may remove it — visitors then see “This page was removed”. Repeated or serious breaches can lead to suspension. The reporter’s identity is never shared with the seller.'] },
  { id: 'appeal', title: 'Appealing', summary: 'Reply within 14 days; a different staff member decides.', paragraphs: ['Reply to the removal notice or contact support within 14 days with anything we should know. A different staff member reviews it and we tell you the outcome. Restored pages come back exactly as they were.'] },
  { id: 'ip', title: 'Copyright and trademark claims', summary: 'Rights holders can ask us to remove infringing content.', paragraphs: ['Send the page address, what’s infringed and proof you own the rights to legal@kub.icu. The seller can respond with a counter-notice.'] }]

},
{
  slug: 'security',
  title: 'Security',
  group: 'Trust & safety',
  intro: 'How KUBICU protects accounts, payments and data.',
  updated: '22 October 2026',
  version: 'Draft 0.1',
  sections: [
  { id: 'payments', title: 'Payments', summary: 'Card details never touch KUBICU.', paragraphs: ['Card and bank details are handled by a licensed, PCI-compliant payment provider. KUBICU only sees whether a payment succeeded.'] },
  { id: 'accounts', title: 'Accounts and teams', summary: 'Roles limit what each person can do.', paragraphs: ['Team members get roles — Owner, Admin, Editor, Sales, Viewer — and every important action is recorded in the activity log. Staff access to your workspace is logged with a reason.'] },
  { id: 'data', title: 'Data', summary: 'Encrypted in transit and at rest.', paragraphs: ['Data is encrypted when it travels and when it’s stored. Visit statistics never include names or contact details.'] },
  { id: 'disclosure', title: 'Reporting a vulnerability', summary: 'security@kub.icu', paragraphs: ['If you find a security issue, email security@kub.icu. Please don’t access other people’s data. We’ll reply within 3 working days.'] }]

}];