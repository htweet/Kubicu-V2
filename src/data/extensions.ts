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
  adds: ['A Domains & QR screen in your sidebar', 'QR codes, campaign links and redirects', 'A print kit for cards, stickers and inserts', 'Custom domains on Creator and above'],
  permissions: ['Create QR codes and short links for your pages', 'Count scans and clicks in Analytics', 'Connect a domain you own (Creator and above)'],
  minPlan: 'free',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-23', notes: 'Now an app you install from Extensions.' }],
  reviews: [{ name: 'Bisi O.', business: 'Bisi’s Kitchen', rating: 5, text: 'The QR on my counter brings in most of my WhatsApp orders now.' }],
  uninstallNote: 'Your QR codes and links keep working for customers, and nothing is deleted. The screen leaves your sidebar until you reinstall.'
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
  uninstallNote: 'Your services and bookings are kept, and booking blocks already on your pages keep working. The screen leaves your sidebar until you reinstall.'
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
  uninstallNote: 'Your quotes, invoices and jobs are kept, and quote links keep working for clients. The screen leaves your sidebar until you reinstall.'
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
  uninstallNote: 'Your reviews and delivered work are kept, and Proof blocks already on your pages keep showing them. The screen leaves your sidebar until you reinstall.'
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
  uninstallNote: 'Nothing is deleted — items you handled or snoozed are remembered if you reinstall.'
},
{
  id: 'automations',
  name: 'Automations',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'apps',
  summary: 'When something happens, do something — thank-yous, reminders, follow-ups and stock alerts.',
  description:
  'Start from five ready-made recipes or build your own: a trigger, optional conditions, then actions and waits. Test on a sample event before turning it on, pause any time, and see every run in the history.',
  adds: ['An Automations screen in your sidebar', 'Five ready-made recipes and a step builder', 'Test runs and run history'],
  permissions: ['Read events from orders, bookings, forms and subscriptions', 'Message customers who agreed to marketing (preview — not sent)', 'Create tasks and notify your team'],
  minPlan: 'free',
  priceNgn: 0,
  version: '1.0.0',
  versions: [{ version: '1.0.0', date: '2026-10-23', notes: 'Now an app you install from Extensions.' }],
  reviews: [],
  uninstallNote: 'Your automations are kept but stop running until you reinstall.'
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
  uninstallNote: 'Source rules on your blocks are kept and keep applying on your live pages. The screen leaves your sidebar until you reinstall.'
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
  uninstallNote: 'Your forms and responses are kept for 30 days in case you reinstall. Form blocks on your pages stop accepting responses straight away.'
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
  uninstallNote: 'The automation and its run history stay in Automations — delete them there if you want.'
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
  uninstallNote: 'The tag and cookie notice are removed from your pages straight away.'
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
  uninstallNote: 'The tag is removed from your pages straight away.'
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

  staffPick: true,
  uninstallNote: 'The three partner zones are removed. Your own zones and past orders are untouched.'
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
  uninstallNote: 'The Invoice button disappears. Orders are untouched.'
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
  uninstallNote: 'Testimonials you already added to your page stay.'
},
{
  id: 'whatsapp-catalogue',
  name: 'WhatsApp catalogue sync',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'selling',
  summary: 'Keep your WhatsApp Business catalogue in step.',
  description: 'Copies active products — name, price, photo and link — to your WhatsApp Business catalogue whenever they change. Preview: shows which products would sync and why others wouldn’t.',
  adds: ['Active products with a price and photo sync', 'Sold-out products are hidden on WhatsApp', 'Preview list with reasons'],
  permissions: ['Read your products', 'Update your WhatsApp Business catalogue (preview — not connected)'],
  minPlan: 'pro',
  priceNgn: 2000,
  version: '0.8.0',
  versions: [{ version: '0.8.0', date: '2026-10-05', notes: 'Preview release.' }],
  reviews: [{ name: 'Ngozi U.', business: 'Ngozi Naturals', rating: 4, text: 'Can’t wait for this to go live.' }],
  preview: true,
  uninstallNote: 'Nothing changes in your products.'
},
{
  id: 'bank-transfer',
  name: 'Bank transfer payments',
  publisher: 'KUBICU',
  verified: 'kubicu',
  category: 'selling',
  summary: 'Let customers pay by transfer; you confirm.',
  description: 'Adds “Pay by bank transfer” at checkout with your account details. The order waits as “awaiting payment” until you confirm the money arrived. Preview: account details are saved; the checkout option arrives with the next release.',
  adds: ['Your bank details shown at checkout', '“I’ve paid” button for customers', 'You confirm before the order moves on'],
  permissions: ['Show your bank details at checkout', 'Create orders awaiting payment'],
  minPlan: 'free',
  priceNgn: 0,
  version: '0.9.2',
  versions: [{ version: '0.9.2', date: '2026-10-10', notes: 'Preview release.' }],
  reviews: [],
  preview: true,
  setup: [
  { id: 'bank', label: 'Bank', placeholder: 'GTBank', hint: 'As customers know it.', pattern: /^.{2,40}$/, error: 'Enter the bank name.' },
  { id: 'account', label: 'Account number', placeholder: '0123456789', hint: '10-digit NUBAN.', pattern: /^\d{10}$/, error: 'NUBAN account numbers are 10 digits.' }],

  uninstallNote: 'Your bank details are removed. Existing orders are untouched.'
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