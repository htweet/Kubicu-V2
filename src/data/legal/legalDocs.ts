import type { LegalDoc } from '../../types/legal';

/** Legal wording — reviewed and confirmed (D109). Plain language first. */
export const legalDocs: LegalDoc[] = [
{
  slug: 'terms',
  title: 'Terms of service',
  group: 'Legal',
  intro: 'The agreement between you and KUBICU when you create a workspace, publish pages or sell through KUBICU.',
  updated: '22 October 2026',
  version: 'Draft 0.3',
  sections: [
  { id: 'who', title: 'Who we are', summary: 'KUBICU is the service; you are the account holder.', paragraphs: ['KUBICU provides tools to build pages, sell products, take bookings and manage customers. “You” means the person or business that owns the workspace. If you create a workspace for a business, you confirm you’re allowed to act for it.'] },
  { id: 'account', title: 'Your account', summary: 'Keep your sign-in safe and your details accurate.', paragraphs: ['You must be 18 or older, or have permission from a parent or guardian. You’re responsible for what happens in your workspace, including what team members do with the roles you give them.'], list: ['Use accurate business and contact details', 'Don’t share your password; invite team members instead', 'Tell us quickly if you think your account was accessed without permission'] },
  { id: 'content', title: 'Your content', summary: 'You own what you publish. You give us permission to host and show it.', paragraphs: ['You keep ownership of your text, photos, products and pages. You give KUBICU a licence to store, display and deliver that content so your pages work. You confirm you have the rights to everything you upload, including photos of people.'] },
  { id: 'selling', title: 'Selling through KUBICU', summary: 'You are the seller. KUBICU provides the tools.', paragraphs: ['When a customer buys from your page, the contract is between you and that customer. You set your own prices, delivery terms and refund policy, and you must honour them. Payments are handled by a licensed payment provider; their terms also apply.'] },
  { id: 'plans', title: 'Plans, billing and cancellation', summary: 'Upgrades start now; downgrades and cancellations take effect at renewal.', paragraphs: ['Paid plans renew automatically until cancelled. Upgrades are charged straight away for the rest of the period. Downgrades and cancellations take effect at the end of the paid period. Downgrading never deletes content; features above your plan pause.'] },
  { id: 'suspension', title: 'Suspension and termination', summary: 'We may pause pages that break our rules, and you can appeal.', paragraphs: ['We may remove a page or suspend a workspace that breaks the Acceptable use policy or the law. We’ll tell you why, unless the law stops us, and you can appeal. You can close your workspace at any time and export your data first.'] },
  { id: 'liability', title: 'Limits of liability', summary: 'We work hard to keep KUBICU running, but can’t promise it never fails.', paragraphs: ['KUBICU is provided “as is”. To the extent the law allows, we’re not liable for indirect losses such as lost profits. Nothing here limits rights you have under Nigerian consumer protection law.'] },
  { id: 'law', title: 'Governing law', summary: 'Nigerian law applies.', paragraphs: ['These terms are governed by the laws of the Federal Republic of Nigeria. We’ll try to resolve any dispute informally first.'] }]

},
{
  slug: 'privacy',
  title: 'Privacy policy',
  group: 'Legal',
  intro: 'What we collect, why we collect it, how long we keep it, and your rights under the Nigeria Data Protection Act 2023 (NDPA).',
  updated: '22 October 2026',
  version: 'Draft 0.3',
  sections: [
  { id: 'roles', title: 'Our role and yours', summary: 'For your account we are the controller. For your customers’ data, you are.', paragraphs: ['KUBICU is the data controller for account holders’ information. When you collect customer details through your page (orders, bookings, forms), you are the controller and KUBICU processes that data on your behalf.'] },
  { id: 'collect', title: 'What we collect', summary: 'Only what we need to run the service.', paragraphs: ['We collect:'], list: ['Account details: name, email, phone, business name', 'Billing details: plan, invoices (card details are held by the payment provider, not KUBICU)', 'Content you upload: pages, products, photos', 'Visit statistics: pages viewed, taps and the site a visit came from — never names or contact details', 'Support messages you send us'] },
  { id: 'why', title: 'Why we use it', summary: 'To run KUBICU, keep it safe and meet legal duties.', paragraphs: ['We use data to provide the service (contract), prevent fraud and abuse (legitimate interest), meet tax and law-enforcement duties (legal obligation), and send marketing only when you agree (consent).'] },
  { id: 'retention', title: 'How long we keep it', summary: 'Visits 90 days; account data while your account is open.', paragraphs: ['Visit statistics are kept for 90 days (example figure). Account data is kept while your workspace is open and for up to 6 years after for tax records. You can ask us to delete data we don’t need to keep.'] },
  { id: 'sharing', title: 'Who we share it with', summary: 'Service providers only — we never sell data.', paragraphs: ['We share data with payment providers, hosting, email and messaging providers, under contracts that protect it. Some providers may store data outside Nigeria; where they do, we use safeguards the NDPA requires.'] },
  { id: 'rights', title: 'Your rights', summary: 'Access, correct, delete, object, move your data, or complain.', paragraphs: ['Under the NDPA you can:'], list: ['See the data we hold about you', 'Correct anything wrong', 'Ask us to delete it', 'Object to or restrict how we use it', 'Get a copy to take elsewhere', 'Withdraw consent at any time', 'Complain to the Nigeria Data Protection Commission'] },
  { id: 'contact', title: 'Contact our data protection officer', summary: 'privacy@kub.icu', paragraphs: ['Email privacy@kub.icu. We reply within 30 days.'] }]

},
{
  slug: 'cookies',
  title: 'Cookies and consent',
  group: 'Legal',
  intro: 'Which small files and browser storage KUBICU and your pages use, and how to change your choices.',
  updated: '22 October 2026',
  version: 'Draft 0.2',
  sections: [
  { id: 'what', title: 'What cookies are', summary: 'Small files that help a site remember things.', paragraphs: ['Cookies and similar browser storage let a site remember you between visits — for example, that you’re signed in or what’s in your cart.'] },
  { id: 'categories', title: 'The categories we use', summary: 'Essential is always on; the rest need your agreement.', paragraphs: ['KUBICU groups them like this:'], list: ['Essential — sign-in, cart, checkout, security. Always on.', 'Preferences — language, appearance. On unless you turn them off.', 'Statistics — anonymous visit counts with a random ID. No names or contact details.', 'Marketing — only when a seller installs Meta Pixel or Google tag, and only after the visitor agrees.'] },
  { id: 'sellers', title: 'Pages run by sellers', summary: 'Sellers who add ad tracking must ask visitors first.', paragraphs: ['If a seller installs a marketing extension, their page shows a consent banner before any marketing cookie is set. Saying no never blocks buying.'] },
  { id: 'choices', title: 'Changing your choices', summary: 'Reopen the consent banner, or clear cookies in your browser.', paragraphs: ['On a seller’s page with marketing tracking, you can reopen the consent banner from the page footer. You can also clear cookies in your browser settings at any time.'] }]

},
{
  slug: 'acceptable-use',
  title: 'Acceptable use',
  group: 'Legal',
  intro: 'What can’t be published or sold on KUBICU, and what happens when something breaks these rules.',
  updated: '22 October 2026',
  version: 'Draft 0.3',
  sections: [
  { id: 'not-allowed', title: 'Not allowed', summary: 'Anything illegal, harmful or deceptive.', paragraphs: ['You may not use KUBICU to publish or sell:'], list: ['Scams, fake giveaways, investment or “doubling” schemes', 'Counterfeit goods or anything that infringes someone’s rights', 'Weapons, drugs, or regulated goods without a licence', 'Hate, harassment, or threats', 'Sexual content involving minors — reported to authorities', 'Fake reviews, invented stock counts or misleading claims'] },
  { id: 'restricted', title: 'Allowed with conditions', summary: 'Some products need licences or extra care.', paragraphs: ['Alcohol, supplements, medical services, financial advice and events with age limits are allowed only with the right licences and clear age or eligibility notices.'] },
  { id: 'enforcement', title: 'What we do', summary: 'Warn, remove, suspend — proportionate to the harm.', paragraphs: ['A person on our team reviews reports. Depending on the harm we may warn you, remove a page, pause selling or suspend the workspace. Customers’ refunds are protected when we suspend a seller.'] },
  { id: 'appeal', title: 'Appeals', summary: 'You can ask us to look again within 14 days.', paragraphs: ['If we remove your page, you can appeal. A different staff member reviews it. See Takedowns and appeals for the full process.'] }]

}];