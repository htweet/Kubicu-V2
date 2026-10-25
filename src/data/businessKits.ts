import { BriefcaseIcon, CameraIcon, CompassIcon, DownloadIcon, GraduationCapIcon, HeartHandshakeIcon, HomeIcon, MapIcon, MicIcon, MusicIcon, PartyPopperIcon, ScissorsIcon, ShirtIcon, StoreIcon, UsersIcon, UtensilsIcon, WrenchIcon } from 'lucide-react';
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
 * Ten kits for the commonest business types (D90, six more in D126). Products and services carry no prices
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
},
// ---- Six more business types (D126) ----
{
  id: 'events',
  name: 'Events & owambe',
  forWho: 'Event planners, party hosts, brunches, concerts and award nights',
  summary: 'An event-first page, a consultation to plan bigger parties, clear ticket refund wording and reminders before the day.',
  icon: PartyPopperIcon,
  templateId: 'afrobeats-brunch',
  products: [],
  services: [{ name: 'Event planning consultation', description: 'Tell us the date, venue, guest count and budget, and we’ll plan it with you.', durationMin: 45, location: 'online' }],
  policies: {
    refunds: 'Tickets are refunded in full if the event is cancelled or moved and you can’t make the new date. Otherwise tickets can be passed to a friend but not refunded within [7] days of the event.',
    delivery: 'Tickets arrive instantly on your order page and by WhatsApp. Show the QR code at the door — screenshots work.',
    cancellation: 'Planning deposits are refundable until we book vendors for you. After that, what we’ve already paid out is kept.',
    instructions: 'Doors open [1 hour] before start. Bring the ticket on your phone and a valid ID for age-restricted events.',
    guides: 'Booking a table? One table seats [8–10]. Book together so your group sits together.',
    disclaimer: 'Line-ups and timings can change. We’ll tell ticket holders on WhatsApp as soon as anything changes.',
    cancelHours: 48
  },
  recipes: ['reminder', 'thanks'],
  apps: ['bookings', 'automations']
},
{
  id: 'photography',
  name: 'Photography & studio',
  forWho: 'Photographers, videographers, studios and content creators for hire',
  summary: 'A portfolio-led page, session bookings with deposits, quotes for weddings and shoots, and proof of past work.',
  icon: CameraIcon,
  templateId: 'studio-nnamdi',
  products: [],
  services: [
  { name: 'Studio session (rename me)', description: 'How long, how many outfits, how many edited photos.', durationMin: 60, location: 'studio' },
  { name: 'Outdoor or event shoot (rename me)', description: 'Say which areas you cover and how travel is charged.', durationMin: 180, location: 'customer' }],

  policies: {
    refunds: 'Deposits secure your date and aren’t refundable within [14] days of the shoot. If we have to cancel, you get every naira back.',
    delivery: 'Edited photos are delivered in an online gallery within [7] working days. Wedding galleries take up to [4] weeks.',
    cancellation: 'Reschedule free once up to [72] hours before. Late changes or no-shows lose the deposit.',
    instructions: 'Bring outfits ironed and on hangers. Arrive [15] minutes early for makeup touch-ups.',
    guides: 'Planning a wedding? Book [3] months ahead for Saturdays in December and Easter season.',
    disclaimer: 'We may share a few photos in our portfolio unless you ask us not to when booking.',
    cancelHours: 72
  },
  recipes: ['reminder', 'lead'],
  apps: ['bookings', 'service-os', 'proof']
},
{
  id: 'digital-creator',
  name: 'Digital creator',
  forWho: 'Presets, e-books, courses, templates and other downloads',
  summary: 'A download-first page, starter digital products, clear licence wording and thank-you follow-ups.',
  icon: DownloadIcon,
  templateId: 'kemi-presets',
  products: [
  { name: 'Digital download (rename me)', description: 'What’s in the file, which apps it works with and how to use it.', kind: 'digital' },
  { name: 'Bundle (rename me)', description: 'Several downloads together at a better price.', kind: 'digital' }],

  services: [],
  policies: {
    refunds: 'Because downloads can’t be returned, we refund only if the file is faulty and we can’t fix it within [3] days.',
    delivery: 'Your download link appears straight after payment and is also sent to your email. Links work [5] times over [30] days.',
    cancellation: 'Orders can’t be cancelled once the download link has been opened.',
    instructions: 'Download on Wi-Fi if you can — some files are large. Unzip before importing.',
    guides: 'Not sure which pack suits you? Message us a photo you want to edit and we’ll recommend one.',
    disclaimer: 'For personal use unless you buy the extended licence. Don’t share or resell the files.'
  },
  recipes: ['thanks', 'abandoned'],
  apps: ['automations']
},
{
  id: 'retail',
  name: 'Shop & retail',
  forWho: 'Bookshops, gadget stores, provision shops and gift stores',
  summary: 'A catalogue page, starter products, pickup and delivery wording, and restock alerts.',
  icon: StoreIcon,
  templateId: 'lagos-bookshelf',
  products: [
  { name: 'Best seller (rename me)', description: 'What it is, the condition (new or used) and what’s in the box.' },
  { name: 'New arrival (rename me)', description: 'Something just in stock.' },
  { name: 'Gift item (rename me)', description: 'Popular for birthdays and festive seasons.' }],

  services: [],
  policies: {
    refunds: 'Return unused items in their original packaging within [7] days for an exchange or refund. Opened gadgets are exchanged only if faulty.',
    delivery: 'Orders placed before [2pm] go out the same day within [your city]. Pickup from our shop is free.',
    cancellation: 'Cancel any time before your order leaves the shop for a full refund.',
    instructions: 'Check your item when the rider arrives. Tell us within [24] hours if anything is missing or damaged.',
    guides: 'Can’t find something? Send us a photo on WhatsApp and we’ll check if we can get it.',
    disclaimer: 'Stock moves fast. If an item sells out after you pay, we’ll refund you or offer an alternative.'
  },
  recipes: ['thanks', 'stock', 'abandoned'],
  apps: ['automations']
},
{
  id: 'consulting',
  name: 'Consulting & professional',
  forWho: 'Lawyers, accountants, coaches, tutors and consultants',
  summary: 'A credibility-first page, paid consultations, quotes for bigger work and follow-ups on enquiries.',
  icon: BriefcaseIcon,
  templateId: 'bello-and-co',
  products: [],
  services: [
  { name: 'First consultation', description: 'A short call to understand what you need and how we can help.', durationMin: 30, location: 'online' },
  { name: 'Working session (rename me)', description: 'What’s covered and what you’ll leave with.', durationMin: 60, location: 'online' }],

  policies: {
    refunds: 'Consultation fees are refundable if you cancel at least [24] hours before. Project deposits are refundable until work begins.',
    delivery: 'Sessions take place on [Google Meet / Zoom / phone] or at our office. Written work is delivered by the date on your quote.',
    cancellation: 'Reschedule free up to [24] hours before. Late cancellations are charged in full.',
    instructions: 'Send any documents at least [1] day before so we can prepare.',
    guides: 'Not sure what you need? Book the first consultation — we’ll tell you honestly if we’re the right fit.',
    disclaimer: 'General information on this page isn’t professional advice for your situation. Advice is given only in a paid session.',
    cancelHours: 24
  },
  recipes: ['lead', 'reminder'],
  apps: ['bookings', 'service-os', 'automations']
},
{
  id: 'music',
  name: 'Music & performance',
  forWho: 'Musicians, DJs, MCs, comedians and live performers',
  summary: 'A music-first page, bookings for shows, merch to sell and a newsletter for fans.',
  icon: MusicIcon,
  templateId: 'ife-sounds',
  products: [{ name: 'Merch item (rename me)', description: 'T-shirt, cap or signed copy — sizes and colours.' }],
  services: [{ name: 'Booking enquiry: show or event', description: 'Date, venue, set length and budget. We’ll reply with availability and a quote.', durationMin: 30, location: 'online' }],
  policies: {
    refunds: 'Booking deposits are refundable if you cancel at least [14] days before the event. Merch can be exchanged within [7] days if unworn.',
    delivery: 'Merch ships within [3] working days. Show bookings are confirmed in writing with the agreed set time.',
    cancellation: 'Cancellations under [14] days before the show keep the deposit. If we cancel, you get every naira back.',
    instructions: 'For shows, please share the venue address, sound setup and a contact person on the day.',
    guides: 'Booking for a wedding or owambe? Tell us the crowd size and the vibe you want.',
    disclaimer: 'Travel outside [your city] and accommodation are quoted separately.',
    cancelHours: 336
  },
  recipes: ['lead', 'thanks'],
  apps: ['bookings', 'automations']
},
// D156 — kits for verticals the Elite library opened up. Each starts from a free page; the Elite template is an optional upgrade.
{
  id: 'podcast',
  name: 'Podcast & media',
  forWho: 'Podcasters, video show hosts and small media brands',
  summary: 'An audience-first page, sponsor and guest enquiries, a newsletter and episode follow-ups.',
  icon: MicIcon,
  templateId: 'ife-sounds',
  products: [],
  services: [{ name: 'Sponsorship enquiry', description: 'Episode dates, audience and placement. We reply with availability.', durationMin: 30, location: 'online' }],
  policies: {
    refunds: 'Sponsorship fees are refundable if we cancel the episode. Once an episode is published with your message, fees aren’t refundable.',
    delivery: 'Sponsor messages are read in the agreed episode and linked in the show notes.',
    cancellation: 'Sponsors can move their slot up to [14] days before recording.',
    guides: 'Pitching a guest? Tell us who they are and what they’d talk about for an hour.',
    disclaimer: 'Guests share their own views, not the show’s.'
  },
  recipes: ['lead'],
  apps: ['automations']
},
{
  id: 'real-estate',
  name: 'Real estate',
  forWho: 'Agents, property consultants and small property businesses',
  summary: 'A listings page, viewing appointments, clear inspection and fee wording, and enquiry follow-ups.',
  icon: HomeIcon,
  templateId: 'bello-and-co',
  products: [],
  services: [{ name: 'Property viewing', description: 'Say which areas you cover and how viewings are arranged.', durationMin: 60, location: 'customer' }],
  policies: {
    refunds: 'Inspection fees, where charged, are [refundable / not refundable]. Agency fees are only due after an agreement is signed.',
    delivery: 'Viewings are arranged by appointment. Documents are shared after a viewing, on request.',
    cancellation: 'Please give [24] hours’ notice to cancel a viewing.',
    guides: 'Tell us your area, budget, size and move-in date so we can shortlist homes.',
    disclaimer: 'Listings are subject to availability. Always verify title documents before paying anything.',
    cancelHours: 24
  },
  recipes: ['lead', 'reminder'],
  apps: ['bookings', 'automations']
},
{
  id: 'courses',
  name: 'Courses & tutoring',
  forWho: 'Tutors, educators and course creators',
  summary: 'A learning page with free resources kept apart from paid courses, class bookings and enrolment follow-ups.',
  icon: GraduationCapIcon,
  templateId: 'kemi-presets',
  products: [{ name: 'Course (rename me)', description: 'What students learn, how long it takes and what’s included.', kind: 'digital' }],
  services: [{ name: 'Tutoring session (rename me)', description: 'Subject, level and whether it’s online or in person.', durationMin: 60, location: 'online' }],
  policies: {
    refunds: 'Full refund within [7] days if you haven’t started the course. Live classes already attended aren’t refundable.',
    delivery: 'Course access is sent by email straight after payment.',
    cancellation: 'Reschedule a tutoring session free up to [24] hours before.',
    guides: 'Not sure which course? Take the free placement check first.',
    disclaimer: 'Exam results depend on each student’s work. We don’t guarantee grades.',
    cancelHours: 24
  },
  recipes: ['thanks', 'reminder'],
  apps: ['bookings', 'automations']
},
{
  id: 'coaching',
  name: 'Coaching',
  forWho: 'Business and life coaches, mentors and trainers',
  summary: 'A discovery-call page, starter sessions, honest no-guarantee wording and call reminders.',
  icon: CompassIcon,
  templateId: 'bello-and-co',
  products: [],
  services: [
  { name: 'Discovery call', description: 'A free call to see if coaching is right for you.', durationMin: 30, location: 'online' },
  { name: 'Coaching session (rename me)', description: 'What you cover and what the client leaves with.', durationMin: 60, location: 'online' }],

  policies: {
    refunds: 'Programmes can be cancelled within [7] days for a refund of unused sessions.',
    delivery: 'Sessions are held by video unless agreed otherwise.',
    cancellation: 'Reschedule free up to [24] hours before a session. Later changes count as a used session.',
    guides: 'Before your first session, write down the one thing you most want to change.',
    disclaimer: 'Coaching isn’t therapy, legal or financial advice, and results aren’t guaranteed.',
    cancelHours: 24
  },
  recipes: ['reminder', 'lead'],
  apps: ['bookings', 'automations']
},
{
  id: 'travel',
  name: 'Travel & experiences',
  forWho: 'Tour operators, guides and experience providers',
  summary: 'A trips page, trip enquiries, deposit and weather wording, and pre-trip reminders.',
  icon: MapIcon,
  templateId: 'afrobeats-brunch',
  products: [{ name: 'Trip (rename me)', description: 'Dates, group size, what’s included and what isn’t.' }],
  services: [{ name: 'Private trip planning call', description: 'Talk through dates, group size and interests.', durationMin: 30, location: 'online' }],
  policies: {
    refunds: 'Deposits are refundable up to [21] days before departure. After that, they can be moved to another date.',
    delivery: 'Joining instructions are sent [7] days before the trip.',
    cancellation: 'If we cancel for weather or safety, you choose a full refund or a new date.',
    instructions: 'Bring comfortable shoes, a rain jacket and your ID.',
    disclaimer: 'Activities carry some physical risk. Tell us about health conditions before booking.'
  },
  recipes: ['thanks', 'reminder'],
  apps: ['automations']
},
{
  id: 'community',
  name: 'Community & membership',
  forWho: 'Clubs, communities, networks and membership projects',
  summary: 'A join page, membership tiers, meetup sign-ups and welcome follow-ups — with no invented member counts.',
  icon: UsersIcon,
  templateId: 'afrobeats-brunch',
  products: [],
  services: [],
  policies: {
    refunds: 'Monthly memberships can be cancelled any time and stop at the end of the month. No refunds for part months.',
    delivery: 'New members are added to the group within [3] days.',
    cancellation: 'Cancel your membership from the link in your welcome email.',
    guides: 'Read the community guidelines before your first meetup.',
    disclaimer: 'Members share their own views. We remove anyone who breaks the guidelines.'
  },
  recipes: ['thanks', 'lead'],
  apps: ['automations']
},
{
  id: 'nonprofit',
  name: 'Nonprofit & impact',
  forWho: 'Charities, campaigns, social enterprises and community initiatives',
  summary: 'A mission page, volunteer sign-ups, clear support-payment wording and thank-yous.',
  icon: HeartHandshakeIcon,
  templateId: 'ikeja-food-bank',
  products: [],
  services: [],
  policies: {
    refunds: 'Support payments made by mistake can be refunded within [14] days — contact us.',
    delivery: 'You’ll get an email receipt for every payment.',
    cancellation: 'Regular supporters can stop at any time.',
    guides: 'Want to volunteer? Tell us where you live and when you’re free.',
    disclaimer: 'Payments are support payments, not tax-deductible donations, unless we tell you we’re registered to issue receipts.'
  },
  recipes: ['thanks'],
  apps: ['automations']
}];


/** "Upgrade the look" (D156): the Elite template that best matches each kit. The kit's free page stays the default. */
const eliteUpgrade: Record<string, string> = {
  fashion: 'elite-boutique',
  beauty: 'elite-beauty',
  food: 'elite-food',
  'home-services': 'elite-booking-hub',
  events: 'elite-event',
  photography: 'elite-photographer',
  'digital-creator': 'elite-digital',
  retail: 'elite-boutique',
  consulting: 'elite-freelance',
  music: 'elite-music-artist',
  podcast: 'elite-podcast',
  'real-estate': 'elite-real-estate',
  courses: 'elite-educator',
  coaching: 'elite-coach',
  travel: 'elite-travel',
  community: 'elite-community',
  nonprofit: 'elite-nonprofit'
};
for (const k of businessKits) k.eliteTemplateId = eliteUpgrade[k.id];

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