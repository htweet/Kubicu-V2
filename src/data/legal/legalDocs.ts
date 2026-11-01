import type { LegalDoc } from '../../types/legal';
import { companyLine, kubicuCompany } from './company';

/**
 * Core legal documents — Draft 1.0, written to a professional standard for counsel review (D233).
 * Plain language first: every section has an "In short" summary. Figures marked "example" follow the
 * confirmed Group A values (D233) but must be re-checked by counsel before publishing.
 */
const UPDATED = '27 October 2026';
const VERSION = 'Draft 1.0 — for legal review';

export const legalDocs: LegalDoc[] = [
{
  slug: 'terms',
  title: 'Terms of service',
  group: 'Legal',
  intro: 'The agreement between you and KUBICU when you create a workspace, publish pages, or sell, book or take payments through KUBICU. Please read it with our Privacy policy, Acceptable use policy and, if you take payments, our Seller terms.',
  updated: UPDATED,
  version: VERSION,
  sections: [
  {
    id: 'who',
    title: 'About these terms',
    summary: `KUBICU is a product of ${kubicuCompany.legalName}; you are the account holder. These terms are a binding agreement.`,
    paragraphs: [
    `KUBICU is a product of ${companyLine} (“KUBICU”, “we”, “us”).`,
    'KUBICU provides online tools to build pages, sell products and services, take bookings and payments, and manage customers (the “Service”). “You” means the individual or business that creates or owns a workspace. If you accept these terms for a business, you confirm you are authorised to bind that business.',
    'By creating an account or using the Service you agree to these terms. If you do not agree, do not use the Service. Additional terms apply to specific features (for example Seller terms, Subscription terms or Developer terms); if they conflict with these terms, the more specific terms apply to that feature.']

  },
  {
    id: 'eligibility',
    title: 'Eligibility and your account',
    summary: 'You must be 18+ (or have a guardian’s permission), give accurate details and keep your sign-in safe.',
    paragraphs: [
    'You must be at least 18 years old, or have the consent of a parent or legal guardian who agrees to these terms on your behalf. You must give accurate, current information and keep it up to date. Some features — receiving payouts, running a fundraiser — require identity or business verification.',
    'You are responsible for all activity in your workspace, including actions by team members you invite and the roles you give them.'],

    list: [
    'Keep your sign-in details confidential and don’t share accounts — invite team members instead',
    'Turn on two-step sign-in where available',
    'Tell us promptly at legal@kub.icu if you suspect unauthorised access']

  },
  {
    id: 'content',
    title: 'Your content',
    summary: 'You own what you publish. You give us a limited licence to host and show it so your pages work.',
    paragraphs: [
    'You keep all ownership rights in the text, images, products, pages and other material you upload (“Your Content”). You grant KUBICU a worldwide, non-exclusive, royalty-free licence to host, store, copy, adapt (for example resize images), display and deliver Your Content only as needed to operate, secure and improve the Service and to show your published pages. This licence ends when you delete the content or close your workspace, except for copies we must keep by law or in routine backups for a limited time.',
    'You confirm that you own or have permission to use everything you upload, including photos of identifiable people, logos and music, and that Your Content complies with the law and our Acceptable use policy.']

  },
  {
    id: 'our-platform',
    title: 'Our platform and templates',
    summary: 'KUBICU’s software, templates and brand remain ours; you get a licence to use them while subscribed.',
    paragraphs: [
    'The Service, including its software, designs, themes, templates, blocks and the KUBICU name and logo, belongs to KUBICU or its licensors. We give you a personal, non-transferable, revocable licence to use them within the Service for your own pages while your account is in good standing. Premium templates you buy are licensed for use in the workspace that bought them and may not be resold or redistributed.']

  },
  {
    id: 'selling',
    title: 'Selling, bookings and payments',
    summary: 'You are the seller. The sale is between you and your customer; KUBICU provides the tools.',
    paragraphs: [
    'When a customer buys, books or pays through your page, the contract for that product or service is between you and the customer. You are responsible for your prices, descriptions, taxes, delivery, refunds and customer service, and for complying with consumer-protection law, including the Federal Competition and Consumer Protection Act 2018.',
    'Payments are processed by licensed third-party payment providers. KUBICU does not hold customer funds except where a feature expressly says money is held by our payment partner (for example Buyer protection). The provider’s own terms also apply. Seller terms set out fees, payouts, refunds and chargebacks.']

  },
  {
    id: 'plans',
    title: 'Plans, billing and cancellation',
    summary: 'Paid plans renew automatically. Upgrades start now; downgrades and cancellations take effect at renewal.',
    paragraphs: [
    'Paid plans are billed in advance, monthly or yearly, and renew automatically until cancelled. Prices are shown in naira and include VAT where it applies. Upgrades are charged immediately for the remainder of the period, less unused time on your current plan. Downgrades and cancellations take effect at the end of the current paid period.',
    'If a renewal payment fails, you have a 7-day grace period to update your payment method; after that your workspace moves to the Free plan. Downgrading never deletes Your Content: features above your new plan are paused until you upgrade again. A free trial, where offered, is available once per workspace and ends automatically unless you choose a paid plan. We will give at least 30 days’ notice of price increases for existing subscriptions.']

  },
  {
    id: 'ai',
    title: 'AI-assisted features',
    summary: 'AI suggestions are drafts. You review and approve them, and you are responsible for what you publish.',
    paragraphs: [
    'Some features suggest layouts, wording or images using automated or AI tools. Suggestions may be inaccurate or incomplete. KUBICU’s assistant does not invent prices, reviews, qualifications or policies, but you must check every suggestion before publishing. See our AI features terms for details.']

  },
  {
    id: 'suspension',
    title: 'Suspension and termination',
    summary: 'We may pause content or accounts that break our rules or the law. You can appeal, and you can leave at any time.',
    paragraphs: [
    'We may remove content, pause selling or payouts, or suspend or close a workspace if we reasonably believe it breaks these terms, our Acceptable use policy or the law, or creates risk for customers or KUBICU. Where the law allows, we will tell you why and how to appeal (see Takedowns and appeals). In urgent cases — fraud in progress, child safety — we may act first and explain afterwards.',
    'You may close your workspace at any time from Your account. Before you do, you can export your data. Obligations that by nature continue (for example outstanding fees, refunds owed to customers, and the liability sections) survive termination.']

  },
  {
    id: 'liability',
    title: 'Warranties and limits of liability',
    summary: 'We work hard to keep KUBICU running but can’t guarantee it never fails. Your consumer rights are not affected.',
    paragraphs: [
    'The Service is provided “as is” and “as available”. To the extent permitted by law, KUBICU excludes implied warranties of merchantability, fitness for a particular purpose and non-infringement, and does not guarantee uninterrupted or error-free operation.',
    'To the extent permitted by law, KUBICU is not liable for indirect, incidental or consequential losses, including loss of profit, revenue, data or goodwill. Our total liability for any claim relating to the Service in any 12-month period is limited to the fees you paid KUBICU in that period, or ₦50,000 if greater. Nothing in these terms limits liability for fraud, death or personal injury caused by negligence, or any liability that cannot be limited under Nigerian law.']

  },
  {
    id: 'indemnity',
    title: 'Your responsibility to us',
    summary: 'If your content or business breaks the law and someone claims against KUBICU, you cover the cost.',
    paragraphs: [
    'You agree to indemnify KUBICU against reasonable losses, costs and legal fees arising from Your Content, your products or services, your dealings with your customers, or your breach of these terms or the law.']

  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    summary: 'We’ll tell you about important changes in advance and ask you to agree again where needed.',
    paragraphs: [
    'We may update these terms. For material changes we will give at least 30 days’ notice by email and in the app, and ask you to accept the new version before you continue using affected features. The version and date at the top show which terms apply.']

  },
  {
    id: 'law',
    title: 'Governing law and disputes',
    summary: 'Nigerian law applies. We try to resolve disputes informally first.',
    paragraphs: [
    'These terms are governed by the laws of the Federal Republic of Nigeria. If a dispute arises, contact legal@kub.icu and we will try to resolve it informally within 30 days. If it is not resolved, either party may refer it to mediation in Abuja, and failing that to the courts of the Federal Capital Territory, Abuja, which have non-exclusive jurisdiction. This does not affect your right to complain to the Federal Competition and Consumer Protection Commission.']

  },
  {
    id: 'contact',
    title: 'Contact',
    summary: 'legal@kub.icu',
    paragraphs: [
    `Questions about these terms: email ${kubicuCompany.legalEmail}, or use the contact form at kub.icu/about/contact and choose “Legal, privacy or security”.`,
    `Post: ${kubicuCompany.legalName}, ${kubicuCompany.registeredAddress}. Company registration: ${kubicuCompany.rcNumber}. Tax identification number: ${kubicuCompany.tin}.`]

  }]

},
{
  slug: 'privacy',
  title: 'Privacy policy',
  group: 'Legal',
  intro: 'What personal data we collect, why, how long we keep it, who we share it with, and your rights under the Nigeria Data Protection Act 2023 (NDPA) and the General Application and Implementation Directive.',
  updated: UPDATED,
  version: VERSION,
  sections: [
  {
    id: 'roles',
    title: 'Who is responsible for your data',
    summary: 'For account holders, KUBICU is the controller. For a seller’s customers, the seller is.',
    paragraphs: [
    `${kubicuCompany.legalName} (${kubicuCompany.rcNumber}), ${kubicuCompany.registeredAddress}, which operates KUBICU, is the data controller for personal data about account holders, team members and visitors to KUBICU’s own website. Contact for data protection questions: ${kubicuCompany.legalEmail}.`,
    'When a seller collects personal data through their page — orders, bookings, forms, memberships — the seller is the data controller and KUBICU is their data processor, acting on the seller’s instructions under our Data processing terms (part of the Seller terms). Customers should contact the seller first about that data; we will help sellers respond.']

  },
  {
    id: 'collect',
    title: 'What we collect',
    summary: 'Only what we need to run, secure and improve the service.',
    paragraphs: ['We collect:'],
    list: [
    'Account data: name, email, phone number, business name, role and sign-in records',
    'Verification data (only when you verify): legal name, date of birth, national identity number check results (for example BVN and NIN in Nigeria, national ID and KRA PIN in Kenya, Ghana Card in Ghana, SA ID in South Africa), ID document details, address and business registration — collected through licensed verification partners [DRAFT — country wording pending legal review, D428]',
    'Billing data: plan, invoices and payment status (card details are held by the payment provider, not KUBICU)',
    'Content you upload: pages, products, photos, messages to customers',
    'Customer data sellers collect: names, contact details, delivery addresses, order and booking history, form answers',
    'Visit statistics: pages viewed, taps, device type and the site a visit came from, using a random ID — never names or contact details',
    'Support messages and reports you send us']

  },
  {
    id: 'why',
    title: 'Why we use it and our legal basis',
    summary: 'To provide the service, keep it safe, meet legal duties, and — only with consent — for marketing.',
    paragraphs: ['We process personal data on these lawful bases under section 25 of the NDPA:'],
    list: [
    'Contract — to create your account, host your pages, process orders and bookings, and bill you',
    'Legal obligation — tax records, anti-money-laundering and verification checks, and lawful requests from authorities',
    'Legitimate interests — preventing fraud and abuse, securing the service, and improving features using aggregated statistics',
    'Consent — marketing emails, optional cookies and marketing pixels; you can withdraw consent at any time']

  },
  {
    id: 'retention',
    title: 'How long we keep it',
    summary: 'Visit statistics 90 days; account data while your account is open, then up to 6 years for tax.',
    paragraphs: [
    'Visit statistics are kept for 90 days. Account and transaction records are kept while your workspace is open and for up to 6 years afterwards to meet tax and accounting duties. Verification records are kept for at least 5 years after the business relationship ends, as anti-money-laundering rules require. Closed accounts enter a 14-day recovery period, then are deleted or anonymised except for records we must keep.']

  },
  {
    id: 'sharing',
    title: 'Who we share it with',
    summary: 'Trusted service providers under contract. We never sell personal data.',
    paragraphs: ['We share personal data only with:'],
    list: [
    'Payment, verification, messaging, email, hosting and delivery providers, under written contracts that protect the data',
    'The seller you buy from, book with or contact through their page',
    'Professional advisers and auditors, under confidentiality',
    'Authorities, where the law requires it or to protect people from harm',
    'A buyer of our business, if KUBICU is sold or merged, with notice to you']

  },
  {
    id: 'transfers',
    title: 'International transfers',
    summary: 'Some providers store data outside Nigeria; we use the safeguards the NDPA requires.',
    paragraphs: [
    'Where personal data is transferred outside Nigeria, we rely on an adequacy decision, standard contractual clauses or another safeguard recognised under Part VIII of the NDPA, and we keep a record of each transfer.']

  },
  {
    id: 'security',
    title: 'How we protect it',
    summary: 'Encryption, access controls and logging.',
    paragraphs: [
    'Data is encrypted in transit and at rest. Staff access is limited by role, requires two-step sign-in and is logged with a reason. If a personal data breach is likely to put your rights at risk, we will notify the Nigeria Data Protection Commission within 72 hours and tell affected people without undue delay.']

  },
  {
    id: 'rights',
    title: 'Your rights',
    summary: 'Access, correct, delete, restrict, object, move your data, or complain.',
    paragraphs: ['Under the NDPA you have the right to:'],
    list: [
    'Be told how your data is used (this policy)',
    'Get a copy of the data we hold about you',
    'Correct inaccurate or incomplete data',
    'Ask us to delete data we no longer need',
    'Restrict or object to processing, including direct marketing',
    'Receive your data in a portable format',
    'Not be subject to decisions based solely on automated processing that significantly affect you',
    'Withdraw consent at any time, without affecting earlier processing',
    'Complain to the Nigeria Data Protection Commission']

  },
  {
    id: 'requests',
    title: 'Making a request',
    summary: 'Use Your account → Data & privacy, or email us. We reply within 30 days.',
    paragraphs: [
    'You can download your data or delete your account from Your account → Data & privacy, email legal@kub.icu, or use the contact form at kub.icu/about/contact. We may ask you to confirm your identity. We respond within 30 days; if a request is complex we may extend this once and will tell you why.']

  },
  {
    id: 'children',
    title: 'Children',
    summary: 'KUBICU is not for children under 18 without a guardian.',
    paragraphs: ['We do not knowingly collect data from children under 18 except with the consent of a parent or guardian. If you believe a child has given us data without consent, contact legal@kub.icu and we will delete it.']
  },
  {
    id: 'contact',
    title: 'Data protection officer',
    summary: 'legal@kub.icu',
    paragraphs: ['Contact our Data Protection Officer at legal@kub.icu (mark your email “Data protection”), or use the contact form at kub.icu/about/contact and choose “Legal, privacy or security”. KUBICU’s registration with the Nigeria Data Protection Commission will be listed here before publication.']
  }]

},
{
  slug: 'cookies',
  title: 'Cookies and consent',
  group: 'Legal',
  intro: 'Which cookies and similar browser storage KUBICU and sellers’ pages use, why, and how to change your choices.',
  updated: UPDATED,
  version: VERSION,
  sections: [
  {
    id: 'what',
    title: 'What cookies are',
    summary: 'Small files and browser storage that help a site remember things.',
    paragraphs: ['Cookies, local storage and similar technologies let a site remember information between visits — for example that you are signed in, what is in your cart, or which language you chose.']
  },
  {
    id: 'categories',
    title: 'The categories we use',
    summary: 'Essential is always on. Statistics are anonymous. Marketing needs your agreement.',
    paragraphs: ['KUBICU groups cookies like this:'],
    list: [
    'Essential — sign-in, cart, checkout, fraud prevention and security. Always on, because the service can’t work without them.',
    'Preferences — language, appearance and data-saver mode. You can clear them at any time.',
    'Statistics — anonymous visit counts using a random ID, kept 90 days. No names, contact details or cross-site tracking.',
    'Marketing — Meta Pixel, Google tag, TikTok Pixel and Microsoft Clarity, only when a seller installs them and only after the visitor taps Accept.']

  },
  {
    id: 'sellers',
    title: 'Cookies on sellers’ pages',
    summary: 'Sellers who add marketing tools must ask visitors first. Saying no never blocks buying.',
    paragraphs: [
    'If a seller installs a marketing or analytics extension, their page shows a consent notice and the tool does not load until the visitor accepts. The seller is responsible for the tools they choose; those providers’ own privacy policies apply to the data they receive.']

  },
  {
    id: 'choices',
    title: 'Changing your choices',
    summary: 'Reopen the consent notice from the page footer, or clear cookies in your browser.',
    paragraphs: ['On a page with marketing tools you can reopen the consent notice from the page footer and withdraw consent at any time. You can also block or clear cookies in your browser settings; blocking essential cookies may stop checkout or sign-in working.']
  }]

},
{
  slug: 'acceptable-use',
  title: 'Acceptable use',
  group: 'Legal',
  intro: 'What may not be published, sold or done on KUBICU, what needs extra care, and how we enforce these rules.',
  updated: UPDATED,
  version: VERSION,
  sections: [
  {
    id: 'not-allowed',
    title: 'Not allowed',
    summary: 'Anything illegal, harmful, deceptive or that infringes others’ rights.',
    paragraphs: ['You may not use KUBICU to publish, sell, promote or facilitate:'],
    list: [
    'Fraud and scams, including fake giveaways, investment, “doubling”, Ponzi or pyramid schemes',
    'Counterfeit goods or content that infringes copyright, trademarks or other rights',
    'Weapons, ammunition, explosives, illegal drugs, or prescription medicines without a licence',
    'Hate speech, harassment, threats, or incitement to violence',
    'Child sexual abuse material or any sexualisation of minors — reported to the authorities',
    'Adult sexual services or explicit sexual content',
    'Fake reviews, invented stock counts, false scarcity or misleading health, income or results claims',
    'Malware, phishing, or attempts to access other people’s accounts or data',
    'Fundraising for unlawful purposes, or misrepresenting who will receive the money',
    'Anything that breaks Nigerian law or the law where you or your customers are']

  },
  {
    id: 'restricted',
    title: 'Allowed with conditions',
    summary: 'Some products and services need licences, age checks or clear notices.',
    paragraphs: ['These are allowed only with the right licence or registration and clear eligibility notices:'],
    list: [
    'Alcohol and tobacco — 18+ notice and lawful sale only',
    'Food, cosmetics and supplements — NAFDAC registration where required',
    'Medical, legal and financial services — practising licence or registration',
    'Events with age limits — the limit shown before purchase',
    'Fundraisers — verified organiser, a clear purpose and honest updates']

  },
  {
    id: 'platform',
    title: 'Using the platform fairly',
    summary: 'Don’t abuse, overload or work around KUBICU’s systems.',
    list: [
    'Don’t send spam or message people who haven’t opted in',
    'Don’t scrape, overload or reverse-engineer the service',
    'Don’t create accounts to evade a suspension',
    'Don’t display a verification or trust badge you haven’t earned'],

    paragraphs: []
  },
  {
    id: 'enforcement',
    title: 'How we enforce these rules',
    summary: 'A person reviews reports. Action is proportionate to the harm.',
    paragraphs: [
    'Anyone can report a page using “Report this page”. A member of our moderation team reviews each report. Depending on the harm and history, we may dismiss the report, warn you, remove content, pause selling, payouts or fundraising, or suspend the workspace. Customers’ refunds remain protected when we suspend a seller. We may share information with law enforcement where the law requires it.']

  },
  {
    id: 'appeal',
    title: 'Appeals',
    summary: 'You can ask us to look again within 14 days.',
    paragraphs: ['If we act against your content or account, you can appeal within 14 days. A different staff member reviews the appeal. See Takedowns and appeals for the full process.']
  }]

}];