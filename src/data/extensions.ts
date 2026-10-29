import type { ExtensionCategory, ExtensionInfo } from '../types/marketplace';

export const extensionCategories: Record<ExtensionCategory, string> = {
  apps: 'KUBICU apps',
  selling: 'Selling',
  marketing: 'Marketing',
  analytics: 'Analytics',
  operations: 'Operations'
};

/** Curated catalogue (D67). Partners and reviews are illustrative. */
export const extensions: ExtensionInfo[] = [
// KUBICU apps (D87): full workspace modules, free, uninstalled by default. Installing adds the screen to the sidebar.
{
  id: 'domains',
  name: 'Domains & QR',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'apps',
  summary: 'QR codes for your counter and packaging, short campaign links, your own domain and a print kit.',
  description:
  'Make QR codes in your colours with your logo, short tracked links for each campaign or ad, and print business cards, stickers and package inserts that carry them. Connect your own domain on Creator and above. Every scan and click shows in Analytics.',
  adds: ['Domains, QR codes, Print kit and Campaign links in your sidebar', 'Redirects for old or moved addresses', 'A print kit for cards, stickers and inserts', 'Custom domains on Creator and above'],
  permissions: ['Create QR codes and short links for your pages', 'Count scans and clicks in Analytics', 'Connect a domain you own (Creator and above)'],
  minPlan: 'free',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-23', notes: 'Now an app you install from Extensions.' }],
  reviews: [{ name: 'Bisi O.', business: 'Bisi’s Kitchen', rating: 5, text: 'The QR on my counter brings in most of my WhatsApp orders now.' }],
  uninstallNote: 'Your QR codes and links keep working for customers, and nothing is deleted. The screen leaves your sidebar until you reinstall.',
  worksWith: [
  { module: 'pages', how: 'QR codes and short links point to your spaces and products' },
  { module: 'analytics', how: 'Scans and clicks show as their own sources' },
  { module: 'orders', how: 'Orders are credited to the link that brought them' }]

},
{
  id: 'bookings',
  name: 'Bookings',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'apps',
  summary: 'Services, availability, deposits and a schedule — customers book a time from your page.',
  description:
  'Set up the services you offer, your weekly hours and buffers, and optional deposits. Add a Booking block to your page and customers pick a free time; you manage everything in a day or week schedule, with reschedules, cancellations and no-shows.',
  adds: ['A Bookings screen in your sidebar', 'Services, availability and a schedule', 'Booking blocks that read your real free times', 'Deposits in test mode on Pro'],
  permissions: ['Create services and availability', 'Save bookings customers make', 'Add people who book to Audience'],
  minPlan: 'free',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-23', notes: 'Now an app you install from Extensions.' }],
  reviews: [{ name: 'Funmi A.', business: 'Studio Funmi', rating: 5, text: 'No more “are you free Saturday?” messages.' }],
  uninstallNote: 'Your services and bookings are kept, and booking blocks already on your pages keep working. The screen leaves your sidebar until you reinstall.',
  worksWith: [
  { module: 'pages', how: 'Booking blocks read your real free times' },
  { module: 'audience', how: 'People who book become contacts' },
  { module: 'automations', how: 'New bookings can start an automation' },
  { module: 'reports', how: 'Deposits and balances count in the Sales report' }]

},
{
  id: 'service-os',
  name: 'Quotes & jobs',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'apps',
  summary: 'Send quotes clients accept from a link, invoice the deposit and balance, and track each job.',
  description:
  'For makeup artists, photographers, tailors, cleaners, builders — anyone who prices work before doing it. Build a quote from priced items with an optional deposit and expiry date. Your client opens the link, then accepts by typing their name or declines with a reason. From an accepted quote, invoice the deposit and later the balance, record payments as they come in, and run the job with a checklist and dated updates you can send on WhatsApp.',
  adds: ['A Quotes & jobs screen in your sidebar', 'Quote links clients accept or decline', 'Deposit and balance invoices with payment records', 'Jobs with checklists and client updates'],
  permissions: ['Create quotes, invoices and jobs', 'Show quotes to anyone with the link', 'Open WhatsApp with messages you can edit (nothing is sent automatically)'],
  minPlan: 'free',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-23', notes: 'First release: quotes, invoices and jobs.' }],
  reviews: [],
  uninstallNote: 'Your quotes, invoices and jobs are kept, and quote links keep working for clients. The screen leaves your sidebar until you reinstall.',
  worksWith: [
  { module: 'orders', how: 'Printable invoices on every order' },
  { module: 'reports', how: 'Paid invoices count in the Sales report' },
  { module: 'automations', how: 'Balances falling due can send a reminder' },
  { module: 'notifications', how: 'Accepted quotes and payments notify you' }]

},
{
  id: 'proof',
  name: 'Proof of work',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'apps',
  summary: 'Reviews that can only come from real orders, bookings and jobs, plus a timeline of work you’ve delivered.',
  description:
  'Ask a customer with a completed order, completed booking or finished job for a review. They get a one-time link, and their review is labelled verified because it’s tied to that record. You can reply or hide a review with a reason, but never change the words, and hidden reviews still count in your rating. Add delivered work with a photo and match it to a real record. A Proof block shows both on your page.',
  adds: ['A Proof of work screen in your sidebar', 'One-time review links for real customers', 'A delivered-work timeline', 'A Proof block for your pages'],
  permissions: ['Read completed orders, bookings and jobs to match reviews', 'Show reviews and work on your public pages', 'Open WhatsApp with messages you can edit (nothing is sent automatically)'],
  minPlan: 'free',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-23', notes: 'First release: verified reviews, delivered work and the Proof block.' }],
  reviews: [],
  uninstallNote: 'Your reviews and delivered work are kept, and Proof blocks already on your pages keep showing them. The screen leaves your sidebar until you reinstall.',
  worksWith: [
  { module: 'orders', how: 'Review links only for completed orders' },
  { module: 'bookings', how: 'Review links for completed bookings' },
  { module: 'pages', how: 'The Proof block shows reviews and work' }]

},
{
  id: 'trust-passport',
  name: 'Trust Passport',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'apps',
  summary: 'A trust level built only from checked records — verification, real orders, escrow and reviews.',
  description:
  'Shows buyers-facing trust signals you can’t fake: business verification, verified reviews, completed orders, your escrow track record, refund and dispute rate, and time selling. Each signal shows its evidence and what to do next, and you can share a summary on WhatsApp. Independent partner checks are simulated.',
  adds: ['A Trust Passport screen in your sidebar', 'Six checked signals with evidence', 'Next steps to raise your level', 'A shareable summary'],
  permissions: ['Read your verification status', 'Read orders, refunds and disputes', 'Read escrow outcomes and verified reviews'],
  minPlan: 'free',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-23', notes: 'First release. Partner checks simulated.' }],
  reviews: [],
  preview: true,
  uninstallNote: 'Nothing is deleted — the passport is worked out from your records each time.',
  worksWith: [
  { module: 'orders', how: 'Completed orders, refunds and disputes feed your level' },
  { module: 'proof', how: 'Verified reviews count as a signal' },
  { module: 'pages', how: 'The Trust badge block shows your level' }]

},
{
  id: 'voice-to-store',
  name: 'Voice-to-Store',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'apps',
  summary: 'Say your products out loud — name, price, how many — and check them before they’re added as drafts.',
  description:
  'Speak a list of products and Voice-to-Store turns it into drafts with names, prices, stock and descriptions. It never guesses a price: anything it couldn’t hear clearly is marked for you to fix. Drafts stay hidden until you add photos and publish. English works now; Pidgin, Yorùbá, Hausa and Igbo wait for a speech partner.',
  adds: ['A Voice-to-Store screen in your sidebar', 'Speak or paste a product list', 'Check and edit drafts before adding', 'Session history'],
  permissions: ['Use your microphone while you’re on the screen', 'Create draft products in Commerce'],
  minPlan: 'creator',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-23', notes: 'First release. Local-language speech simulated.' }],
  reviews: [],
  preview: true,
  uninstallNote: 'Products you added stay in Commerce. Your session history is kept for when you reinstall.',
  worksWith: [
  { module: 'products', how: 'Creates draft products with prices and stock' },
  { module: 'storefront', how: 'Drafts appear in your shop once published' }]

},
{
  id: 'collaborations',
  name: 'Creator Collaboration',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'apps',
  summary: 'Partners share your link and earn a commission on real sales, paid from your wallet.',
  description:
  'Invite creators, stylists and resellers with their own tracked link and commission rate, for every product or chosen ones. Commission is worked out from real orders after discounts and refunds, becomes payable once the order is delivered, and can be paid from your KUBICU wallet (after verification) or recorded as paid elsewhere.',
  adds: ['A Collaborations screen in your sidebar', 'Partner links and commission rates', 'Commission worked out per order', 'Pay from your wallet or record as paid'],
  permissions: ['Read orders placed through partner links', 'Pay commission from your wallet when you choose'],
  minPlan: 'pro',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-23', notes: 'First release. Partner sign-up simulated.' }],
  reviews: [],
  preview: true,
  uninstallNote: 'Partner links stop earning, and your partners and payment history are kept for when you reinstall.',
  worksWith: [
  { module: 'checkout', how: 'Records the partner code on each order' },
  { module: 'orders', how: 'Commission worked out from real orders after refunds' },
  { module: 'wallet', how: 'Commission paid from your wallet' }]

},
{
  id: 'ai-coach',
  name: 'AI Business Coach',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'apps',
  summary: 'A weekly brief and straight answers from your own numbers — what to restock, who to message, where money is waiting.',
  description:
  'Business Coach reads your orders, products and wallet and suggests the few things worth doing this week, each with the numbers behind it. Ask questions like “What should I restock?” and get answers from your records only — it never invents figures. Refreshing the brief and each answer use one AI credit.',
  adds: ['A Business Coach screen in your sidebar', 'A weekly brief with up to 6 moves', 'Five questions you can ask', 'Evidence on every suggestion'],
  permissions: ['Read orders, products and stock', 'Read wallet balances', 'Use your monthly AI credits'],
  minPlan: 'creator',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-23', notes: 'First release. Rule-based preview.' }],
  reviews: [],
  preview: true,
  uninstallNote: 'Nothing is deleted. Saved answers come back if you reinstall.',
  worksWith: [
  { module: 'orders', how: 'Reads sales to suggest what to do' },
  { module: 'products', how: 'Spots what to restock' },
  { module: 'wallet', how: 'Shows money waiting to be paid out' }]

},
{
  id: 'local-fulfilment',
  name: 'Deliveries',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'apps',
  summary: 'Book a rider for paid orders, track them to the door, and hand over only with the customer’s code.',
  description:
  'Compare courier quotes for each order’s address, or use your own rider. The customer is texted a 4-digit code and the rider only hands over when it matches — for escrow orders, a matching code releases the payment to your wallet straight away. Orders move to Packing, Out for delivery and Completed on their own. Courier partners are simulated until real partners are connected.',
  adds: ['A Deliveries screen in your sidebar', 'Courier quotes per address, or your own rider', 'Delivery codes that confirm handover', 'Escrow released when the code matches'],
  permissions: ['Read paid delivery orders and their addresses', 'Update order status as the rider moves', 'Release escrow payments when the customer’s code matches', 'Share the customer’s name, phone and address with the courier you choose'],
  minPlan: 'free',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-23', notes: 'First release: quotes, riders, delivery codes and escrow release. Couriers simulated.' }],
  reviews: [],
  uninstallNote: 'Your delivery history is kept. Deliveries already on the way keep their status, but you’ll update orders by hand until you reinstall.',
  worksWith: [
  { module: 'orders', how: 'Moves orders to Out for delivery and Completed' },
  { module: 'wallet', how: 'A matching code releases escrow payments' }]

},
{
  id: 'opportunities',
  name: 'Opportunities',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'apps',
  summary: 'One list of money and people still waiting on you — unpaid checkouts, failed renewals, quiet leads.',
  description:
  'Gathers what still needs a nudge from your real records: unpaid checkouts, failed subscription payments, bookings without deposits, enquiries with no reply and overdue follow-ups. Message from WhatsApp with a suggested note, or open the right screen.',
  adds: ['An Opportunities screen in your sidebar', 'Biggest amounts first, never guessed', 'WhatsApp messages you edit before sending'],
  permissions: ['Read your orders, bookings, subscriptions and contacts', 'Open WhatsApp with a message you can edit (nothing is sent automatically)'],
  minPlan: 'free',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-23', notes: 'Now an app you install from Extensions.' }],
  reviews: [],
  uninstallNote: 'Nothing is deleted — items you handled or snoozed are remembered if you reinstall.',
  worksWith: [
  { module: 'orders', how: 'Lists unpaid checkouts' },
  { module: 'bookings', how: 'Lists unpaid deposits and no-shows' },
  { module: 'audience', how: 'Lists quiet leads and overdue follow-ups' }]

},
{
  id: 'automations',
  name: 'Automations',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'apps',
  summary: 'When something happens, do something — thank-yous, reminders, follow-ups and stock alerts.',
  description:
  'Start from 18 ready-made recipes or build your own: a trigger, optional conditions, then actions and waits. Test on a sample event before turning it on, pause any time, and see every run in the history.',
  adds: ['An Automations screen in your sidebar', '18 ready-made recipes and a step builder', 'Test runs and run history'],
  permissions: ['Read events from orders, bookings, forms and subscriptions', 'Message customers who agreed to marketing (preview — not sent)', 'Create tasks and notify your team'],
  minPlan: 'free',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-23', notes: 'Now an app you install from Extensions.' }],
  reviews: [],
  uninstallNote: 'Your automations are kept but stop running until you reinstall.',
  worksWith: [
  { module: 'orders', how: 'Paid and unfinished orders start automations' },
  { module: 'bookings', how: 'New bookings start automations' },
  { module: 'audience', how: 'Tags contacts and respects their consent' },
  { module: 'notifications', how: 'Can notify you or a team member' }]

},
{
  id: 'intentflow',
  name: 'IntentFlow',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'apps',
  summary: 'Show different blocks to visitors from WhatsApp, Instagram, TikTok, QR codes or campaign links.',
  description:
  'Each block can show to everyone, only to chosen sources, or to everyone except them. Preview what each audience sees, set a goal, and compare results — it says “too early to tell” until there are enough visits. Rules only use where a visit came from, never anything about the person.',
  adds: ['An IntentFlow screen in your sidebar', 'Pause, resume and roll back any rule', 'Results compared with everyone else'],
  permissions: ['Read where each visit came from', 'Show or hide blocks on your live pages by source'],
  minPlan: 'free',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-23', notes: 'Now an app you install from Extensions.' }],
  reviews: [],
  uninstallNote: 'Source rules on your blocks are kept and keep applying on your live pages. The screen leaves your sidebar until you reinstall.',
  worksWith: [
  { module: 'pages', how: 'Shows or hides blocks by visitor source' },
  { module: 'analytics', how: 'Compares results for each audience' },
  { module: 'campaignLinks', how: 'Campaign links can be a source rule' }]

},
{
  id: 'forms',
  name: 'Forms',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'operations',
  summary: 'Build any form — quotes, RSVPs, orders, applications — with steps, rules and payments.',
  description:
  'A full form builder: 17 field types, multi-step forms, show-or-hide rules based on earlier answers, spam protection, honest marketing consent and an optional payment field (test mode). Add a Form block to any page; every response lands in that form’s inbox and in Audience, and can start an automation. The free Lead form and Newsletter blocks stay as they are.',
  adds: ['A Forms screen with a builder and six starter forms', 'A Form block for your pages', 'An inbox for each form with assigning and CSV export', 'Responses feed Audience, Automations, Analytics and notifications'],
  permissions: ['Create forms in your workspace', 'Save responses visitors send', 'Add or update contacts in Audience', 'Take test-mode payments on forms with a payment field'],
  minPlan: 'creator',
  priceNgn: 2500,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-20', notes: 'First release: builder, steps, rules, payment field and inbox.' }],
  reviews: [
  { name: 'Adaeze N.', business: 'Adaeze Bridal', rating: 5, text: 'The quote form with the wedding-date question only showing for bridal saved me hours of back and forth.' },
  { name: 'Kunle B.', business: 'Kunle Events', rating: 4, text: 'RSVPs straight into Audience. Would love to email everyone from the inbox.' }],

  staffPick: true,
  uninstallNote: 'Your forms and responses are kept for 30 days in case you reinstall. Form blocks on your pages stop accepting responses straight away.',
  worksWith: [
  { module: 'pages', how: 'A Form block for any page' },
  { module: 'audience', how: 'Responses become contacts' },
  { module: 'automations', how: 'Responses can start an automation' },
  { module: 'notifications', how: 'New responses notify you' }]

},
{
  id: 'abandoned-cart',
  name: 'Abandoned-cart recovery',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'selling',
  summary: 'Nudge people who started checkout but didn’t pay.',
  description: 'Installs a ready-made automation: an hour after someone leaves checkout, they get a friendly reminder — but only if they agreed to marketing. You review and switch it on in Automations.',
  adds: ['A draft “Abandoned checkout nudge” automation', 'Only customers who opted in are messaged', 'Results in the automation’s run history'],
  permissions: ['Read checkouts that weren’t finished', 'Create an automation in your workspace', 'Message customers who agreed to marketing (preview — not sent)'],
  minPlan: 'pro',
  priceNgn: 0,
  version: '1.2.0',
  versions: [
  { version: '1.2.0', date: '2026-09-02', notes: 'Respects quiet hours for WhatsApp messages.' },
  { version: '1.1.0', date: '2026-06-14', notes: 'Waits an hour before the first nudge (was 30 minutes).' }],

  reviews: [
  { name: 'Tolu A.', business: 'Tolu’s Bakes', rating: 5, text: 'Got two orders back the first week. Easy to switch off when I want.' },
  { name: 'Chidi O.', business: 'Kicks by Chidi', rating: 4, text: 'Would love a second reminder option.' }],

  staffPick: true,
  uninstallNote: 'The automation and its run history stay in Automations — delete them there if you want.',
  retired: {
    movedTo: 'Automations',
    href: '/app/automations?recipe=abandoned',
    note: 'This is now the “Abandoned checkout nudge” recipe in Automations, one tap from Orders. Your automation keeps running exactly as it was.',
    installs: 'automations'
  }
},
{
  id: 'meta-pixel',
  name: 'Meta Pixel',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'marketing',
  summary: 'Measure Instagram and Facebook ads on your pages.',
  description: 'Adds your Meta Pixel to your public pages so ad results show in Meta Ads Manager. Visitors see a short cookie notice first, and the pixel only loads if they accept.',
  adds: ['Your Pixel ID on every public page', 'A cookie notice for visitors', 'Nothing loads until a visitor accepts'],
  permissions: ['Add a tracking tag to your public pages', 'Show a cookie notice to visitors'],
  minPlan: 'creator',
  priceNgn: 0,
  version: '2.0.1',
  versions: [
  { version: '2.0.1', date: '2026-08-20', notes: 'Waits for consent before loading.' },
  { version: '1.4.0', date: '2026-03-02', notes: 'Shop page events.' }],

  reviews: [{ name: 'Amaka E.', business: 'Glow by Amaka', rating: 5, text: 'Finally see which ads bring bookings.' }],
  setup: [{ id: 'pixelId', label: 'Pixel ID', placeholder: '123456789012345', hint: 'In Meta Events Manager → Data sources. 15–16 digits.', pattern: /^\d{15,16}$/, error: 'A Pixel ID is 15 or 16 digits.' }],
  uninstallNote: 'The tag and cookie notice are removed from your pages straight away.',
  worksWith: [
  { module: 'pages', how: 'Loads after visitors accept the cookie notice' },
  { module: 'checkout', how: 'Records purchases with their value' },
  { module: 'campaignLinks', how: 'Campaign links carry UTM tags for ads' }]

},
{
  id: 'google-tag',
  name: 'Google tag',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'analytics',
  summary: 'Send visits to Google Analytics 4.',
  description: 'Adds your Google tag (GA4) to your public pages alongside KUBICU Analytics. Uses the same cookie notice as Meta Pixel.',
  adds: ['Your Measurement ID on every public page', 'Shared cookie notice', 'Nothing loads until a visitor accepts'],
  permissions: ['Add a tracking tag to your public pages', 'Show a cookie notice to visitors'],
  minPlan: 'creator',
  priceNgn: 0,
  version: '1.1.0',
  versions: [
  { version: '1.1.0', date: '2026-07-11', notes: 'Consent mode.' },
  { version: '1.0.0', date: '2026-02-01', notes: 'First release.' }],

  reviews: [{ name: 'Seun K.', business: 'Seun Studio', rating: 4, text: 'Does what it says.' }],
  setup: [{ id: 'tagId', label: 'Measurement ID', placeholder: 'G-XXXXXXXXXX', hint: 'In Google Analytics → Admin → Data streams.', pattern: /^G-[A-Z0-9]{6,12}$/, error: 'Starts with G- followed by letters and numbers.' }],
  uninstallNote: 'The tag is removed from your pages straight away.',
  worksWith: [
  { module: 'pages', how: 'Loads after visitors accept the cookie notice' },
  { module: 'checkout', how: 'Records purchases with their value' },
  { module: 'campaignLinks', how: 'Campaign links carry UTM tags' }]

},
{
  id: 'delivery-partners',
  name: 'Lagos delivery partners',
  publisher: 'SwiftRun Logistics (example partner)',
  verified: 'partner',
  category: 'operations',
  summary: 'Courier rates for Lagos zones, added to checkout.',
  description: 'Adds three Lagos delivery zones with the partner’s current rates and delivery times. Edit or remove them any time in Commerce → Settings.',
  adds: ['Lagos Island — ₦2,500, same day', 'Lagos Mainland — ₦2,000, same day', 'Ikorodu & Epe — ₦3,500, next day'],
  permissions: ['Read your delivery zones', 'Add delivery zones and fees'],
  minPlan: 'creator',
  priceNgn: 1500,
  version: '3.0.0',
  versions: [
  { version: '3.0.0', date: '2026-10-01', notes: 'October rates; Ikorodu & Epe added.' },
  { version: '2.3.0', date: '2026-05-18', notes: 'Rates update.' }],

  reviews: [
  { name: 'Bisi F.', business: 'Fola Fabrics', rating: 4, text: 'Saves me typing rates every month.' },
  { name: 'Ifeanyi N.', business: 'Gadget Hub', rating: 3, text: 'Wish it covered Abuja.' }],

  uninstallNote: 'The three partner zones are removed. Your own zones and past orders are untouched.',
  worksWith: [
  { module: 'checkout', how: 'Partner zones and fees offered at checkout' },
  { module: 'orders', how: 'The chosen zone and fee are recorded on each order' }],

  // Removed (D232): both connections sat inside Commerce, rates were examples, and couriers already connect through Deliveries.
  retired: {
    movedTo: 'Delivery & pickup',
    href: '/app/commerce/settings',
    note: 'This extension has been removed. The three zones it added stay as your own delivery zones — change their fees in Commerce settings → Delivery & pickup. Courier booking is part of Deliveries.'
  }
},
{
  id: 'invoice-generator',
  name: 'Order invoices',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'operations',
  summary: 'Printable invoices for every order.',
  description: 'Adds an “Invoice” button to each order. Prints a clean invoice with your business name, the items, delivery, discount and total — ready to send on WhatsApp as a PDF.',
  adds: ['“Invoice” button on every order', 'Your business name and contact on top', 'Print or save as PDF'],
  permissions: ['Read your orders', 'Read your business name and contact'],
  minPlan: 'free',
  priceNgn: 0,
  version: '1.0.3',
  versions: [
  { version: '1.0.3', date: '2026-09-12', notes: 'Shows discounts on their own line.' },
  { version: '1.0.0', date: '2026-04-30', notes: 'First release.' }],

  reviews: [{ name: 'Halima B.', business: 'Halima’s Glow', rating: 5, text: 'Customers ask for receipts all the time. This is it.' }],
  staffPick: true,
  uninstallNote: 'The Invoice button disappears. Orders are untouched.',
  retired: {
    movedTo: 'Quotes & jobs',
    href: '/app/extensions?ext=service-os',
    note: 'Order invoices are now part of Quotes & jobs, so every invoice shares one template. Moving installs Quotes & jobs (free) and the Invoice button stays on your orders.',
    installs: 'service-os'
  }
},
{
  id: 'review-requests',
  name: 'Review requests',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'marketing',
  summary: 'Ask happy customers for a testimonial.',
  description: 'Two days after an order is delivered, asks the customer for a short review. Approved reviews can go into a Testimonials block. Preview: shows who would be asked; nothing is sent yet.',
  adds: ['A request two days after delivery', 'You approve every review before it shows', 'Preview list of who would be asked'],
  permissions: ['Read delivered orders', 'Message customers about their order (preview — not sent)'],
  minPlan: 'creator',
  priceNgn: 0,
  version: '0.9.0',
  versions: [{ version: '0.9.0', date: '2026-09-28', notes: 'Preview release.' }],
  reviews: [],
  preview: true,
  uninstallNote: 'Testimonials you already added to your page stay.',
  retired: {
    movedTo: 'Proof of work',
    href: '/app/proof',
    note: 'Review requests are now part of Proof of work, which sends one-time review links only to customers with a completed order, booking or job. Moving installs Proof of work (free).',
    installs: 'proof'
  }
},
{
  id: 'whatsapp-catalogue',
  name: 'WhatsApp Commerce Bridge',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'apps',
  summary: 'Answer WhatsApp chats, send products with a buy link, and sync your catalogue.',
  description:
  'Connect your WhatsApp Business number to reply to customers from KUBICU, send product cards that link straight to checkout, use quick replies, greeting and away messages, and keep your WhatsApp catalogue in step with your shop. Simulated: no messages leave this device until a WhatsApp Business partner is chosen.',
  adds: ['A WhatsApp screen in your sidebar', 'Chats with labels, quick replies and product cards', 'Greeting and away messages', 'Catalogue sync with reasons for skipped products'],
  permissions: ['Read your products and prices', 'Read and reply to chats on your WhatsApp Business number (simulated)', 'Add people who message you to Audience when you choose'],
  minPlan: 'free',
  priceNgn: 0,
  version: '1.0.0',
  versions: [
  { version: '1.0.0', date: '2026-10-23', notes: 'Now a full app: chats, product cards, automatic messages and catalogue sync. WhatsApp simulated.' },
  { version: '0.8.0', date: '2026-10-05', notes: 'Preview release.' }],

  reviews: [{ name: 'Ngozi U.', business: 'Ngozi Naturals', rating: 4, text: 'Can’t wait for this to go live.' }],
  preview: true,
  uninstallNote: 'Your chats and settings are kept on this device. The WhatsApp screen leaves your sidebar until you reinstall.',
  worksWith: [
  { module: 'products', how: 'Product cards and catalogue sync from your shop' },
  { module: 'checkout', how: 'Product cards link straight to checkout' },
  { module: 'audience', how: 'People who message you can become contacts' }]

},
{
  id: 'bank-transfer',
  name: 'Bank transfer payments',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'selling',
  summary: 'Let customers pay by transfer; you confirm.',
  description: 'Adds “Bank transfer” at checkout with your account details. The order waits as “awaiting payment” with its order number as the transfer reference. Customers tap “I’ve sent the money”, and you confirm once it shows in your bank. Naira payments only; not used for DealRooms or instalments.',
  adds: ['Your bank details shown at checkout and on the order page', '“I’ve sent the money” button for customers', 'You confirm before the order moves on'],
  permissions: ['Show your bank details at checkout', 'Create orders awaiting payment'],
  minPlan: 'free',
  priceNgn: 0,
  version: '1.0.0',
  versions: [
  { version: '1.0.0', date: '2026-10-24', notes: 'Bank transfer at checkout, order-number reference, “I’ve sent the money” and seller confirmation.' },
  { version: '0.9.2', date: '2026-10-10', notes: 'Preview release.' }],

  reviews: [],
  setup: [
  { id: 'bank', label: 'Bank', placeholder: 'GTBank', hint: 'As customers know it.', pattern: /^.{2,40}$/, error: 'Enter the bank name.' },
  { id: 'account', label: 'Account number', placeholder: '0123456789', hint: '10-digit NUBAN.', pattern: /^\d{10}$/, error: 'NUBAN account numbers are 10 digits.' }],

  uninstallNote: 'Your bank details are removed. Existing orders are untouched.',
  worksWith: [
  { module: 'checkout', how: 'Bank transfer offered at checkout' },
  { module: 'paymentLinks', how: 'Transfers to your account on payment links' },
  { module: 'orders', how: 'Orders wait until you confirm the money arrived' }]

},
// ——— D232: new extensions, each connected to two or more core modules ———
{
  id: 'tiktok-pixel',
  name: 'TikTok Pixel',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'marketing',
  summary: 'Measure TikTok ads on your pages.',
  description: 'Adds your TikTok Pixel to your public pages so ad results show in TikTok Ads Manager. Uses the same cookie notice as Meta Pixel and Google tag, and loads only if visitors accept.',
  adds: ['Your Pixel ID on every public page', 'Paid checkouts recorded as “Complete payment” with their value', 'Shared cookie notice'],
  permissions: ['Add a tracking tag to your public pages', 'Show a cookie notice to visitors'],
  minPlan: 'creator',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-27', notes: 'First release.' }],
  reviews: [],
  setup: [{ id: 'pixelId', label: 'Pixel ID', placeholder: 'C4ABCDEFGHIJ12345678', hint: 'In TikTok Ads Manager → Assets → Events → Web events. 20 capital letters and numbers.', pattern: /^[A-Z0-9]{20}$/, error: 'A TikTok Pixel ID is 20 capital letters and numbers.' }],
  uninstallNote: 'The pixel is removed from your pages straight away.',
  worksWith: [
  { module: 'pages', how: 'Loads after visitors accept the cookie notice' },
  { module: 'checkout', how: 'Records paid checkouts with their value' },
  { module: 'campaignLinks', how: 'Campaign links set to “TikTok” carry UTM tags for your ads' }]

},
{
  id: 'product-feed',
  name: 'Product feed',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'selling',
  summary: 'Your products in Instagram & Facebook Shops and Google Shopping.',
  description:
  'Builds a catalogue file from your products in the format Meta and Google ask for, and tells you which products are left out and why. Every product link is tagged, so visits from Shops show up in Analytics. Preview: download the file and upload it yourself; an address that updates automatically needs the KUBICU backend.',
  adds: ['A Meta and a Google catalogue file', 'Reasons for every product left out', 'Tagged links so Shops visits show in Analytics'],
  permissions: ['Read your products, prices, photos and stock'],
  minPlan: 'free',
  priceNgn: 0,
  version: '0.9.0',
  versions: [{ version: '0.9.0', date: '2026-10-27', notes: 'Preview release: download the feed file.' }],
  reviews: [],
  preview: true,
  uninstallNote: 'Nothing on your pages changes. Catalogues you already uploaded keep their last copy.',
  worksWith: [
  { module: 'products', how: 'Name, price, photo, description and stock go into the feed' },
  { module: 'storefront', how: 'Each product links to its shop page' },
  { module: 'analytics', how: 'Visits from Shops show as Facebook or Google sources' }]

},
{
  id: 'loyalty',
  name: 'Loyalty points',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'selling',
  summary: 'Customers earn points on every order and spend them at checkout.',
  description:
  'Customers earn 1 point for every ₦100 they spend on items, matched by phone number. At checkout, 500 points become a one-time ₦500 discount code. Refunds take points back. Points start from the day you install. Referral codes stay in Commerce → Discounts. Example figures.',
  adds: ['Points on every paid order', '“Use 500 points” at checkout', 'Points on each customer’s receipt and contact'],
  permissions: ['Read your orders and customers’ phone numbers', 'Create one-time discount codes'],
  minPlan: 'creator',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-27', notes: 'First release.' }],
  reviews: [],
  uninstallNote: 'Customers stop earning and can’t make new codes. Points codes already made still work once.',
  worksWith: [
  { module: 'checkout', how: '500 points become a ₦500 code at checkout' },
  { module: 'orders', how: 'Paid orders earn points; the receipt shows them' },
  { module: 'audience', how: 'Each contact shows their points balance' }]

},
{
  id: 'email-sync',
  name: 'Email marketing sync',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'marketing',
  summary: 'Send subscribed contacts to Mailchimp or Brevo.',
  description:
  'Copies contacts who agreed to hear from you — with their tags — to your Mailchimp or Brevo audience. People who only bought, or who unsubscribed, are never sent. Preview: shows exactly who would be sent and lets you download them; the live connection needs the KUBICU backend.',
  adds: ['Subscribed contacts and their tags', 'Form sign-ups with consent included', 'Download the list any time'],
  permissions: ['Read contacts who subscribed, their emails and tags', 'Send contacts to your email tool (preview — not sent)'],
  minPlan: 'free',
  priceNgn: 0,
  version: '0.9.0',
  versions: [{ version: '0.9.0', date: '2026-10-27', notes: 'Preview release.' }],
  reviews: [],
  preview: true,
  setup: [
  {
    id: 'apiKey',
    label: 'Mailchimp or Brevo API key',
    placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us21',
    hint: 'Mailchimp: Account → Extras → API keys. Brevo: SMTP & API → API keys (starts with xkeysib-).',
    pattern: /^([0-9a-f]{32}-us\d{1,2}|xkeysib-[0-9a-f]{64}-[A-Za-z0-9]{16})$/,
    error: 'That doesn’t look like a Mailchimp or Brevo API key.'
  }],

  uninstallNote: 'Nothing more is sent. Contacts already in your email tool stay there.',
  worksWith: [
  { module: 'audience', how: 'Only subscribed contacts, with their tags' },
  { module: 'forms', how: 'Form sign-ups who ticked consent are included' }]

},
{
  id: 'sheets-sync',
  name: 'Google Sheets sync',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'operations',
  summary: 'Orders, bookings and form responses in a spreadsheet.',
  description:
  'Adds a row to your Google Sheet for every new order, booking and form response, one tab each — handy for a packer or assistant who doesn’t use KUBICU. Preview: shows the rows and lets you download each tab; adding rows automatically needs the KUBICU backend.',
  adds: ['An Orders, a Bookings and a Responses tab', 'One row per new record', 'Download each tab any time'],
  permissions: ['Read your orders, bookings and form responses', 'Add rows to the sheet you choose (preview — not sent)'],
  minPlan: 'free',
  priceNgn: 0,
  version: '0.9.0',
  versions: [{ version: '0.9.0', date: '2026-10-27', notes: 'Preview release.' }],
  reviews: [],
  preview: true,
  setup: [
  {
    id: 'sheetUrl',
    label: 'Google Sheet address',
    placeholder: 'https://docs.google.com/spreadsheets/d/…',
    hint: 'Open the sheet and copy the address from your browser. Share it with sync@kub.icu as an editor.',
    pattern: /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]{20,}/,
    error: 'Paste the full address of a Google Sheet.'
  }],

  uninstallNote: 'No new rows are added. Your sheet keeps everything already in it.',
  worksWith: [
  { module: 'orders', how: 'A row per new order' },
  { module: 'bookings', how: 'A row per new booking' },
  { module: 'forms', how: 'A row per form response' }]

},
{
  id: 'accounting-export',
  name: 'Accounting export',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'operations',
  summary: 'Sales, fees, refunds and VAT for QuickBooks, Zoho Books or your accountant.',
  description: 'Adds an “Accounting export” button to the Sales report. It downloads the period you’re viewing in QuickBooks or Zoho Books import format, or as a spreadsheet, with fees and refunds on their own lines. Sample entries are left out.',
  adds: ['“Accounting export” on the Sales report', 'QuickBooks, Zoho Books and spreadsheet formats', 'Fees, refunds and VAT on their own lines'],
  permissions: ['Read your sales, payment links, invoices and VAT'],
  minPlan: 'creator',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-27', notes: 'First release.' }],
  reviews: [],
  uninstallNote: 'The button leaves the Sales report. Files you downloaded are yours.',
  worksWith: [
  { module: 'reports', how: 'Exports the period you’re viewing' },
  { module: 'paymentLinks', how: 'Payment link income is included' },
  { module: 'quotes', how: 'Paid invoices are included' }]

},
{
  id: 'search-console',
  name: 'Search Console & SEO',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'marketing',
  summary: 'Prove you own your pages to Google and hand it your sitemap.',
  description: 'Adds Google’s verification tag to your live pages and builds a sitemap from what you’ve published — pages, shop, products, events and services, leaving out hidden and members-only pages. Also lists published pages missing a search description.',
  adds: ['Google verification tag on live pages', 'Sitemap file built from your published pages', 'Pages missing a search description'],
  permissions: ['Add a verification tag to your public pages', 'Read your published pages and products'],
  minPlan: 'free',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-27', notes: 'First release.' }],
  reviews: [],
  setup: [
  {
    id: 'verification',
    label: 'Google verification code',
    placeholder: 'e.g. 1a2B3c4D5e6F7g8H9i0J…',
    hint: 'In Search Console → Add property → URL prefix → HTML tag. Paste only the content="…" value.',
    pattern: /^[A-Za-z0-9_-]{20,64}$/,
    error: 'Paste only the code inside content="…".'
  }],

  uninstallNote: 'The verification tag is removed. Google may ask you to verify again.',
  worksWith: [
  { module: 'pages', how: 'Uses the search details you set when publishing' },
  { module: 'storefront', how: 'Shop and product pages go into the sitemap' }]

},
{
  id: 'clarity',
  name: 'Microsoft Clarity',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'analytics',
  summary: 'Free heatmaps and session recordings.',
  description: 'Adds Microsoft Clarity to your public pages so you can see where visitors tap and scroll. It loads only after visitors accept the cookie notice. Clarity hides typed text by default; recordings live in your Clarity account.',
  adds: ['Clarity on every public page', 'Shared cookie notice', 'A shortcut from Analytics to your heatmaps'],
  permissions: ['Add a tracking tag to your public pages', 'Show a cookie notice to visitors'],
  minPlan: 'creator',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-27', notes: 'First release.' }],
  reviews: [],
  setup: [{ id: 'projectId', label: 'Project ID', placeholder: 'abcd1234ef', hint: 'In Clarity → Settings → Overview. Lower-case letters and numbers.', pattern: /^[a-z0-9]{8,12}$/, error: 'A Clarity project ID is 8–12 lower-case letters and numbers.' }],
  uninstallNote: 'Clarity is removed from your pages straight away. Recordings stay in your Clarity account.',
  worksWith: [
  { module: 'pages', how: 'Loads after visitors accept the cookie notice' },
  { module: 'analytics', how: 'Heatmaps one tap away from Analytics' }]

}];


export const extensionById = Object.fromEntries(extensions.map((e) => [e.id, e])) as Record<string, ExtensionInfo>;

export const partnerZones = [
{ name: 'Lagos Island (SwiftRun)', feeNgn: 2500, eta: 'Same day' },
{ name: 'Lagos Mainland (SwiftRun)', feeNgn: 2000, eta: 'Same day' },
{ name: 'Ikorodu & Epe (SwiftRun)', feeNgn: 3500, eta: 'Next day' }];


export function averageRating(e: ExtensionInfo): number | null {
  if (!e.reviews.length) return null;
  return e.reviews.reduce((s, r) => s + r.rating, 0) / e.reviews.length;
}