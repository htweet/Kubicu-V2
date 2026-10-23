import { ScissorsIcon, ShirtIcon, UtensilsIcon, WrenchIcon } from 'lucide-react';
import type { BusinessKit, KitPart } from '../types/kit';

export const kitPartLabels: Record<KitPart, {label: string;description: string;}> = {
  page: { label: 'Page layout', description: 'Replaces your main page draft. Your name and photo stay; the old draft goes to version history.' },
  products: { label: 'Starter products', description: 'Added as drafts with no price — rename them, add photos and prices, then switch them on.' },
  services: { label: 'Starter services', description: 'Added switched off with no price, so nothing is bookable until you set it up.' },
  policies: { label: 'Draft policies', description: 'Six drafts — refunds, delivery, cancellation, instructions, guides and a disclaimer — to edit. Needs your review before you rely on it.' },
  automations: { label: 'Automations', description: 'Added as drafts. Nothing runs until you turn each one on.' },
  apps: { label: 'Free apps', description: 'Installs the KUBICU apps this kind of business uses. Uninstall any time in Extensions.' }
};

/**
 * Four kits for the commonest business types (D90). Products and services carry no prices
 * and policies are clearly drafts — a kit never invents facts about the business.
 */
export const businessKits: BusinessKit[] = [
{
  id: 'fashion',
  name: 'Fashion boutique',
  forWho: 'Clothing, fabric, accessories and made-to-order fashion',
  summary: 'A shop-first page, starter products to rename, delivery and returns wording, and order follow-ups.',
  icon: ShirtIcon,
  templateId: 'adaeze-atelier',
  products: [
  { name: 'Ready-to-wear piece (rename me)', description: 'Describe the fabric, fit and sizes. Add at least one photo.' },
  { name: 'Made-to-measure order (rename me)', description: 'Explain how measurements are taken and how long sewing takes.' },
  { name: 'Accessory (rename me)', description: 'Head wrap, bag, jewellery — whatever you sell alongside.' }],

  services: [],
  policies: {
    refunds: 'Returns are accepted within [7] days of delivery for unworn items with tags attached. Made-to-measure pieces can’t be returned unless there’s a fault. Refunds go back to the original payment method within [5] working days of us receiving the item.',
    delivery: 'Orders are packed within [2] working days. Delivery times and fees depend on your area and are shown at checkout. Pickup is free.',
    cancellation: 'You can cancel before your order is packed for a full refund. Made-to-measure orders can’t be cancelled once cutting has started.',
    instructions: 'Hand wash cold or dry clean [as labelled]. Dry in shade to keep colours bright. Iron on the reverse side.',
    guides: 'Sizing: compare your bust, waist and hip measurements with the size chart on each product. Between sizes? Choose the larger one, or order made-to-measure and send your measurements on WhatsApp.',
    disclaimer: 'Colours may look slightly different on your screen. Handmade and hand-dyed fabrics vary a little from piece to piece.'
  },
  recipes: ['thanks', 'abandoned', 'stock'],
  apps: ['automations', 'domains']
},
{
  id: 'beauty',
  name: 'Beauty & bookings',
  forWho: 'Makeup artists, hair stylists, nail techs and spas',
  summary: 'A booking-first page, starter services, a clear deposit and cancellation policy, reminders and quotes for events.',
  icon: ScissorsIcon,
  templateId: 'glow-by-halima',
  products: [],
  services: [
  { name: 'Signature appointment (rename me)', description: 'What’s included and how long it takes.', durationMin: 90, location: 'studio' },
  { name: 'Home service (rename me)', description: 'Say which areas you travel to.', durationMin: 120, location: 'customer' },
  { name: 'Consultation', description: 'A short chat to plan a look or a bigger booking.', durationMin: 30, location: 'online' }],

  policies: {
    refunds: 'Deposits secure your slot and are refunded only if you cancel within the free cancellation window. Services already carried out aren’t refundable.',
    delivery: 'For home service, travel is included within [your areas]. Further locations may cost extra — we’ll confirm before booking.',
    cancellation: 'Cancel or reschedule free up to [24] hours before your appointment. Later cancellations and no-shows lose the deposit.',
    instructions: 'Arrive with a clean face [or freshly washed hair]. For home service, please have a chair near good light and a power socket ready.',
    guides: 'Booking an event? Send your date, location and number of people for a quote first. Bridal trials are booked separately, ideally [4] weeks before the day.',
    disclaimer: 'Tell us about allergies or skin conditions before your appointment. A patch test is available on request. Results vary with skin and hair type.',
    cancelHours: 24
  },
  recipes: ['reminder', 'lead'],
  apps: ['bookings', 'service-os', 'automations']
},
{
  id: 'food',
  name: 'Food vendor',
  forWho: 'Home kitchens, caterers, bakers and small-chops sellers',
  summary: 'A menu-style page, starter dishes to price, pickup and delivery wording, and order thank-yous.',
  icon: UtensilsIcon,
  templateId: 'mama-put-kitchen',
  products: [
  { name: 'Main dish (rename me)', description: 'Portion size and what comes with it.' },
  { name: 'Party tray (rename me)', description: 'How many people it serves and how much notice you need.' },
  { name: 'Drink or side (rename me)', description: 'Something customers add to their order.' }],

  services: [],
  policies: {
    refunds: 'If something is wrong with your order, tell us within [2] hours of delivery with a photo and we’ll replace it or refund you. Food can’t be returned.',
    delivery: 'Orders are prepared fresh. Delivery fees depend on your area and are shown at checkout. Party trays need [48] hours’ notice.',
    cancellation: 'Cancel before we start cooking for a full refund. Party-tray orders can be cancelled free up to [24] hours before.',
    instructions: 'Best eaten within [2] hours. Refrigerate leftovers and reheat until piping hot. Don’t reheat more than once.',
    guides: 'Ordering for a party? Allow about [1] tray per [10] guests and order at least [48] hours ahead.',
    disclaimer: 'Our kitchen handles nuts, shellfish, gluten and dairy. Ask us before ordering if you have an allergy.'
  },
  recipes: ['thanks', 'abandoned'],
  apps: ['automations']
},
{
  id: 'home-services',
  name: 'Home services',
  forWho: 'Plumbers, electricians, cleaners, installers and repairers',
  summary: 'A trust-first page, quote-led work with deposits, a site-visit service and follow-ups on enquiries.',
  icon: WrenchIcon,
  templateId: 'fixright-plumbing',
  products: [],
  services: [{ name: 'Site visit and quote', description: 'We come out, look at the job and send you a written quote.', durationMin: 60, location: 'customer' }],
  policies: {
    refunds: 'Deposits are refundable until materials are bought or work begins. If our work has a fault, we come back and fix it free within [30] days.',
    delivery: 'We cover [your areas]. Call-out outside these areas may cost extra — it will always be on your quote first.',
    cancellation: 'Reschedule or cancel a visit free up to [12] hours before. Quotes are valid until the date shown on them.',
    instructions: 'Before we arrive, clear access to the work area and switch off [water/power] if it’s safe to do so.',
    guides: 'Send a photo or short video of the problem on WhatsApp — it helps us bring the right parts and give a closer quote.',
    disclaimer: 'Quotes are based on what we can see. If we find hidden damage once work starts, we’ll stop and agree any extra cost with you first.',
    cancelHours: 12
  },
  recipes: ['lead', 'reminder'],
  apps: ['service-os', 'bookings', 'automations']
}];


export const kitById = (id: string) => businessKits.find((k) => k.id === id);

/** The six draft policies, in the order they're shown and added to the page (D90a). */
export const policyFields = [
{ key: 'refunds', label: 'Refunds', question: 'What’s your refund policy?' },
{ key: 'delivery', label: 'Delivery', question: 'How does delivery work?' },
{ key: 'cancellation', label: 'Cancellation', question: 'Can I cancel or reschedule?' },
{ key: 'instructions', label: 'Instructions', question: 'Any instructions I should know?' },
{ key: 'guides', label: 'Guides', question: 'How do I choose or get ready?' },
{ key: 'disclaimer', label: 'Disclaimer', question: 'Anything else to be aware of?' }] as
const;

export type PolicyKey = (typeof policyFields)[number]['key'];

/** Which parts a kit has something for. */
export function kitParts(kit: BusinessKit): KitPart[] {
  return (['page', 'products', 'services', 'policies', 'automations', 'apps'] as KitPart[]).filter((p) =>
  p === 'products' ? kit.products.length > 0 : p === 'services' ? kit.services.length > 0 : p === 'automations' ? kit.recipes.length > 0 : p === 'apps' ? kit.apps.length > 0 : true
  );
}