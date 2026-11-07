import { MessageCircleIcon, BanknoteIcon, SignalLowIcon, ShieldCheckIcon } from 'lucide-react';

/** Honest availability shown on the website. Update as batches ship (source: docs/DESIGN_GAP_AUDIT.md). */
export const capabilityStatus = [
  { name: 'Pages, canvas editor and 27 blocks', detail: 'Design, publish, multi-page sites, version history', status: 'Ready in prototype', ready: true },
  { name: 'Shop, checkout, discounts and subscriptions', detail: 'Stock, fulfilment, refunds, digital downloads — payments in test mode', status: 'Ready in prototype', ready: true },
  { name: 'Bookings, events and ticket check-in', detail: 'Services, deposits, QR tickets, door check-in', status: 'Ready in prototype', ready: true },
  { name: 'Audience, automations and teams', detail: 'CRM with consent, automation test runs, roles and approvals', status: 'Ready in prototype', ready: true },
  { name: 'Analytics, QR codes and custom domains', detail: 'Real visits on this device; domain checks are simulated', status: 'Ready in prototype', ready: true },
  { name: 'AI page setup', detail: 'Describe your business, review a draft — never invents prices or reviews', status: 'Preview', ready: false },
  { name: 'WhatsApp catalogue sync, Voice-to-Store', detail: 'Waiting on partner integrations', status: 'Planned', ready: false },
];

export const businessTypes = ['Fashion & tailoring', 'Food & bukkas', 'Beauty & salons', 'Events & nightlife', 'Photography', 'Coaches & tutors', 'Artisans & repairs', 'Music & creators', 'Bookshops', 'Churches & causes'];

export const howItWorks = [
  { title: 'Tell us what you do', text: 'Pick a goal — sell, take bookings, sell tickets, show your work — and start from a layout built for it.' },
  { title: 'Arrange it on the canvas', text: 'Drag blocks, edit text in place, pick a theme. What you see is exactly what visitors get.' },
  { title: 'Publish and share', text: 'A publish check catches broken links first. Then share your kub.icu link or QR code anywhere.' },
];

export const localFeatures = [
  { icon: MessageCircleIcon, title: 'WhatsApp ordering built in', text: 'Order buttons open a chat with the item and price already written, so customers don’t have to type it.' },
  { icon: BanknoteIcon, title: 'Naira first', text: 'Prices in ₦ with local payment providers. When a price isn’t set, visitors see “Price on request”, never a made-up number.' },
  { icon: SignalLowIcon, title: 'Light on data', text: 'Photos are resized, maps aren’t embedded, and pages stay readable on slow connections.' },
  { icon: ShieldCheckIcon, title: 'Honest by default', text: 'No fake reviews, no invented stock counts. DealRoom counters only ever use real orders.' },
];

export const homeFaq = [
  { q: 'Is KUBICU free?', a: 'Yes. The Free plan gives you a full page with every basic block and up to 5 products with WhatsApp ordering. Paid plans add your own brand, checkout, bookings and teams.' },
  { q: 'Do I need a website already?', a: 'No. Your page lives at kub.icu/yourname from the start. You can connect your own domain later on Creator and above.' },
  { q: 'How do customers pay me?', a: 'On Pro and above, checkout takes cards and bank transfers through a local payment provider. On every plan, customers can order on WhatsApp.' },
  { q: 'Can my team help run it?', a: 'Business and Agency plans include team seats with roles — editors, sales, viewers — plus approvals before anything goes live.' },
  { q: 'What happens if I downgrade?', a: 'Nothing is deleted. Features above your plan pause until you upgrade again.' },
];

export const pricingFaq = [
  { q: 'Are these the final prices?', a: 'Not yet. They’re example figures we’re testing with early users. Nobody is charged in this prototype.' },
  { q: 'What does KUBICU take from my sales?', a: 'The payment provider charges its own fee (example: 1.5% + ₦100). KUBICU adds 0–2% depending on plan. Every order shows exactly what you receive.' },
  { q: 'Can I switch plans at any time?', a: 'Yes. Upgrades start straight away and you only pay for the rest of the period. Downgrades happen at your renewal date.' },
  { q: 'What are add-ons?', a: 'Optional extensions from the marketplace, like Forms or Meta Pixel. Some are free, some are a small monthly fee on top of your plan.' },
];

export const addOns = [
  { name: 'Forms', text: 'Multi-step forms with logic, file uploads, payments and a submissions inbox.', price: '₦2,500 / month', plan: 'Creator and above' },
  { name: 'Abandoned-cart recovery', text: 'Remind shoppers who left items in their cart.', price: 'Free', plan: 'Pro and above' },
  { name: 'Meta Pixel & Google tag', text: 'Measure ads with consent built in.', price: 'Free', plan: 'Every plan' },
];
