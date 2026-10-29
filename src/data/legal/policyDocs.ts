import type { LegalDoc } from '../../types/legal';

/** Policy documents — Draft 1.0, written to a professional standard for counsel review (D233). */
const UPDATED = '27 October 2026';
const VERSION = 'Draft 1.0 — for legal review';

export const policyDocs: LegalDoc[] = [
{
  slug: 'refunds',
  title: 'Refunds and cancellations',
  group: 'Legal',
  intro: 'How refunds and cancellations work for things you buy from sellers on KUBICU, and for KUBICU plans, templates and extensions.',
  updated: UPDATED,
  version: VERSION,
  sections: [
  {
    id: 'sellers',
    title: 'Buying from a seller',
    summary: 'Each seller sets their own policy and must show it before you pay.',
    paragraphs: [
    'Sellers set their own refund, cancellation, delivery and returns terms and must show them before you pay. Those terms cannot take away your rights under the Federal Competition and Consumer Protection Act 2018 — for example to goods that match their description and are of satisfactory quality. If something never arrives or isn’t as described, contact the seller first using the details on your order page.']

  },
  {
    id: 'customers',
    title: 'What customers always get',
    summary: 'A refund returns exactly what you paid, by the way you paid.',
    paragraphs: ['Whatever the seller’s policy:'],
    list: [
    'A full refund returns exactly what you paid, including any delivery fee you were charged',
    'Refunds go back to the original payment method; bank processing can take 5–10 working days',
    'If a group buy (DealRoom) misses its goal, everyone is refunded in full automatically',
    'If an event is cancelled, tickets are refunded in full',
    'If a course or membership is closed by the seller, the unused part of a prepaid period is refunded']

  },
  {
    id: 'bookings',
    title: 'Bookings and deposits',
    summary: 'The seller’s cancellation window decides whether a deposit is returned.',
    paragraphs: [
    'Bookings may need a deposit. If you cancel inside the seller’s cancellation window, the deposit may be kept as shown when you booked. If the seller cancels, you always get the full deposit back.']

  },
  {
    id: 'subscriptions',
    title: 'Subscriptions and memberships',
    summary: 'Cancel any time; access continues until the end of the period you paid for.',
    paragraphs: ['You can cancel a subscription from your subscriber page at any time. You keep access until the end of the period already paid for, and you are not charged again. Payments for periods already started are not refunded unless the seller’s policy says otherwise or the law requires it.']
  },
  {
    id: 'disputes',
    title: 'If you can’t agree with the seller',
    summary: 'Use Buyer protection where available, contact your bank, and report the page.',
    paragraphs: [
    'If your order was paid into Buyer protection, open your protection page and report the problem before the release date. Otherwise you can raise a dispute with your bank or card issuer. Please also report the page to us — we review every report and can pause sellers who don’t deliver. You may also complain to the Federal Competition and Consumer Protection Commission.']

  },
  {
    id: 'plans',
    title: 'KUBICU plans, templates and extensions',
    summary: 'Cancel any time. Charges made in error and premium templates have refund windows.',
    list: [
    'Plans: you keep your plan until the paid period ends; time already used isn’t refunded',
    'Charged in error: tell us within 14 days for a full refund',
    'Premium templates: refundable within 7 days of purchase if not published on a live page',
    'Paid extensions: cancel any time; the current month isn’t refunded',
    'AI credits: unused purchased credits are refundable within 14 days'],

    paragraphs: []
  }]

},
{
  slug: 'seller-terms',
  title: 'Seller terms',
  group: 'Legal',
  intro: 'Additional terms for workspaces that take payments, sell products, tickets, courses, memberships or templates, or receive payouts. They form part of the Terms of service.',
  updated: UPDATED,
  version: VERSION,
  sections: [
  {
    id: 'obligations',
    title: 'Your obligations as a seller',
    summary: 'Describe things honestly, deliver what you sell, and follow consumer and tax law.',
    list: [
    'Describe products and services accurately, with true prices including any fees',
    'Show your refund, delivery and cancellation terms before payment and honour them',
    'Deliver within the time you promise, or tell the customer and offer a refund',
    'Collect and pay any VAT or other taxes that apply to you',
    'Hold any licence or registration your products or services need',
    'Handle customer data only as our Data processing terms allow'],

    paragraphs: []
  },
  {
    id: 'verification',
    title: 'Verification',
    summary: 'Payouts and fundraising require verified identity and business details.',
    paragraphs: [
    'To receive payouts you must complete verification (KYC for individuals, KYB for businesses), and the payout account must be in the verified person’s or registered business’s name. You consent to us and our licensed partners checking your BVN, NIN and CAC records. Payouts are held until verification is approved. Daily payout and balance limits apply according to your verification level.']

  },
  {
    id: 'fees',
    title: 'Fees',
    summary: 'Provider fee plus a 0–2% KUBICU fee, shown on every order.',
    paragraphs: [
    'Each card or transfer payment carries the payment provider’s fee — currently 1.5% + ₦100, waived under ₦2,500 and capped at ₦2,000 — and a KUBICU fee of 2% on Free falling to 0% on Agency. Every order shows the gross amount, delivery, fees, refunds and what you receive. We give 30 days’ notice of fee changes.']

  },
  {
    id: 'payouts',
    title: 'Payouts',
    summary: 'Paid by the provider to your verified account.',
    paragraphs: [
    'Payouts are made by the payment provider to your verified bank account on your chosen schedule. The provider or KUBICU may delay or hold payouts where there is a high risk of refunds or chargebacks, a suspected breach of our rules, or a legal requirement. Money due to customers (refunds, lost disputes) may be deducted from your balance or future payouts.']

  },
  {
    id: 'refund-fees',
    title: 'Refunds and fees',
    summary: 'KUBICU returns its fee on full refunds; the provider’s fee usually isn’t returned.',
    paragraphs: [
    'Customers always get back exactly what they paid. When you refund an order in full, KUBICU returns its fee. The provider’s fee is usually not returned and remains a cost to you, shown on its own line. KUBICU waives its fee on DealRoom group buys that miss their goal.']

  },
  {
    id: 'own-account',
    title: 'Payments to your own bank account',
    summary: 'You confirm these yourself; KUBICU can’t verify or protect them.',
    paragraphs: [
    'If you let buyers transfer directly to your own bank account, the order stays pending until you confirm the money arrived. These payments are outside the payment provider, so Buyer protection and automatic refunds don’t apply; you must refund buyers yourself if needed.']

  },
  {
    id: 'pod-instalments',
    title: 'Pay on delivery and instalments',
    summary: 'Limits apply; you carry the risk of unpaid deliveries.',
    paragraphs: [
    'Pay on delivery is available for physical items up to ₦100,000 per order. You carry the risk if the buyer doesn’t pay on delivery. Instalments are available on carts of ₦20,000 or more, in 2–4 parts charged to the buyer’s card; if a later part fails, the provider’s retry rules apply and you may pause delivery until it is paid.']

  },
  {
    id: 'disputes',
    title: 'Disputes and chargebacks',
    summary: 'Respond with evidence before the provider’s deadline.',
    paragraphs: [
    'If a customer disputes a payment, upload evidence (proof of delivery, messages, the policy shown at checkout) from the order screen before the deadline. Providers usually decide within 30–75 days. If you lose, the disputed amount and any provider fee are deducted from your balance or future payouts.']

  },
  {
    id: 'data-processing',
    title: 'Data processing terms',
    summary: 'You are the controller of your customers’ data; KUBICU processes it for you.',
    paragraphs: [
    'For customer data you collect, you are the data controller and KUBICU is your processor. KUBICU will process that data only to provide the Service and on your documented instructions, keep it confidential and secure, use vetted sub-processors under equivalent terms, help you respond to rights requests, notify you of breaches without undue delay, and delete or return it when you close your workspace. You must have a lawful basis for collecting it and give customers a privacy notice.']

  },
  {
    id: 'templates',
    title: 'Selling templates',
    summary: 'You keep 70% of each sale. Staff review every template before listing.',
    paragraphs: [
    'See Template creator terms. In short: templates are reviewed before listing, you keep 70% of each sale and KUBICU 30%, and payouts start once you reach ₦5,000.']

  }]

},
{
  slug: 'safety',
  title: 'Safety tips for buyers',
  group: 'Trust & safety',
  intro: 'Simple ways to shop, book and give safely on pages built with KUBICU.',
  updated: UPDATED,
  version: VERSION,
  sections: [
  { id: 'pay', title: 'Pay through the page', summary: 'Checkout keeps a record and gives you ways to get help.', paragraphs: ['Where a page has checkout, pay there. Be careful if a seller asks you to transfer to a personal account outside the page, or asks for your card PIN or one-time code — KUBICU and sellers never need these.'] },
  { id: 'check', title: 'Check the seller', summary: 'Look for clear contact details, policies and real reviews.', paragraphs: ['Good signs: a real phone number or address, a refund policy shown before payment, reviews marked as from completed orders, and a Trust Passport level. Be careful with prices that look far too low or pressure to pay immediately.'] },
  { id: 'groups', title: 'Group buys and fundraisers', summary: 'Counters only count real payments.', paragraphs: ['DealRoom progress bars and fundraiser totals only count real, paid payments, less refunds. If a group goal is missed you’re refunded automatically. A fundraiser is a payment to the organiser, not a tax-deductible donation.'] },
  { id: 'report', title: 'Something wrong?', summary: 'Report the page and contact your bank.', paragraphs: ['Use “Report this page” at the bottom of any page. If you lost money, contact your bank immediately — they can act faster than we can.'] }]

},
{
  slug: 'takedown',
  title: 'Takedowns and appeals',
  group: 'Trust & safety',
  intro: 'What happens after something is reported, how rights holders can ask us to remove content, and how to ask us to look again.',
  updated: UPDATED,
  version: VERSION,
  sections: [
  { id: 'review', title: 'How reports are reviewed', summary: 'A person reviews every report, usually within 2 working days.', paragraphs: ['Reports go to our moderation team, who look at the page, the reason given and any history. Urgent harm — fraud in progress, fundraising scams, child safety — is prioritised and may be acted on immediately.'] },
  { id: 'outcomes', title: 'Possible outcomes', summary: 'Dismissed, warning, content removed, selling paused, or workspace suspended.', paragraphs: ['If something breaks our rules we may remove it — visitors then see “This page was removed”. We may also pause selling, payouts or fundraising. Repeated or serious breaches can lead to suspension. We tell the owner the reason unless the law prevents it. The reporter’s identity is never shared with the seller.'] },
  { id: 'appeal', title: 'Appealing', summary: 'Appeal within 14 days; a different staff member decides.', paragraphs: ['Reply to the notice or use the appeal button within 14 days with anything we should know. A different staff member reviews it, usually within 5 working days, and we tell you the outcome and reasons. Restored content comes back exactly as it was.'] },
  { id: 'ip', title: 'Copyright and trademark notices', summary: 'Rights holders can ask us to remove infringing content.', paragraphs: ['Email legal@kub.icu, or use the contact form at kub.icu/about/contact (choose “Legal, privacy or security”), with: your contact details; the work or mark infringed; the page address; a statement that you believe in good faith the use is unauthorised; and a statement that the notice is accurate and you are the rights holder or authorised to act for them. We remove or disable access promptly and tell the owner, who may send a counter-notice. Knowingly false notices may lead to liability.'] }]

},
{
  slug: 'security',
  title: 'Security',
  group: 'Trust & safety',
  intro: 'How KUBICU protects accounts, payments and data, and how to report a vulnerability.',
  updated: UPDATED,
  version: VERSION,
  sections: [
  { id: 'payments', title: 'Payments', summary: 'Card details never touch KUBICU.', paragraphs: ['Card and bank details are handled by licensed, PCI DSS-compliant payment providers. KUBICU only receives whether a payment succeeded and a reference.'] },
  { id: 'accounts', title: 'Accounts and teams', summary: 'Two-step sign-in, roles and an activity log.', paragraphs: ['Owners can require two-step sign-in. Team members get roles — Owner, Admin, Editor, Sales, Viewer — and important actions are recorded in the activity log. KUBICU staff access to a workspace requires a reason, is time-limited and is logged.'] },
  { id: 'data', title: 'Data', summary: 'Encrypted in transit and at rest, with backups.', paragraphs: ['Data is encrypted in transit (TLS) and at rest, backed up regularly and access-controlled. Visit statistics never include names or contact details.'] },
  { id: 'disclosure', title: 'Reporting a vulnerability', summary: 'legal@kub.icu — we reply within 3 working days.', paragraphs: ['If you find a security issue, email legal@kub.icu (subject “Security”) with steps to reproduce it, or use the contact form at kub.icu/about/contact and choose “Legal, privacy or security”. Please don’t access, change or delete other people’s data, or disrupt the service. We reply within 3 working days, keep you updated, and won’t take legal action against good-faith research that follows these rules.'] }]

}];