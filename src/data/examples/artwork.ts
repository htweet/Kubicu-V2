import { b, doc, hours, type ExamplePage } from './build';
import { daysFromNow } from '../../utils/eventTime';

/*
 * Artwork collection (D158, enriched in D159): classic single-column pages built only from the standard
 * canvas blocks, set over an AI-generated background artwork. All businesses, people, prices, quotes and
 * links are fictional sample content.
 */

const img = {
  dj: "/ae475b70-0215-40ba-9e7e-f830e48db217.jpg",
  cakes: "/15592af8-e686-45b0-be47-8d41ff2a3dbb.jpg",
  architecture: "/43e71e50-b63a-4a2f-8a21-e99e84704b0e.jpg",
  waterfall: "/dbd7e045-b0fc-4099-81e6-a3dc8d5b18e6.jpg",
  yoga: "/6d2a26b7-b7af-43d0-bf3d-db4b096d595e.jpg",
  adire: "/fc4d1588-8858-43b8-9b64-f8e2c67e6386.jpg",
  meetup: "/5b6be459-54b9-4a53-8769-7d04cee54c3a.jpg",
  chromeNails: "/6e5854f2-430c-414f-bcfc-cb95cfebff2a.jpg",
  nudeNails: "/62447a94-62d4-48a0-8099-0ddf9df772ac.jpg",
  trousers: "/3cf32009-10eb-405b-af35-32395a7942fc.jpg",
  tote: "/08d7b751-c878-472e-9107-7258feb7ebb6.jpg"
};

const sampleSource = 'Sample review — replace with a real one';

export const novaSounds: ExamplePage = {
  id: 'art-nova-sounds',
  category: 'Creator',
  name: 'Nova Sounds',
  city: 'Lagos',
  bestFor: 'DJs, producers and nightlife hosts',
  description: 'Aurora ribbons over midnight navy. Latest mix, next show with tickets, booking packages and a press kit.',
  goals: ['audience', 'book', 'events'],
  styles: ['dark', 'bold'],
  plan: 'creator',
  artwork: { priceNgn: 2500, art: 'Aurora ribbons' },
  doc: doc(
    'novasounds',
    'Nova Sounds',
    'Afro-house and amapiano sets from Lagos. New mix monthly, bookings open.',
    {
      presetId: 'custom',
      background: '#0B0D1E',
      surface: '#171B36',
      text: '#F4F2FF',
      mutedText: '#B9B5D6',
      accent: '#C9A2FF',
      accentText: '#140A24',
      fontPair: 'grotesk',
      buttonShape: 'pill',
      buttonStyle: 'solid',
      backgroundImage: "/78dfad73-fb6c-480c-a928-4d0df1e623f9.jpg",
      backgroundVeil: 20
    },
    [
    b('nv_profile', 'profile', { name: 'Nova Sounds', tagline: 'Afro-house and amapiano, mixed late. Resident at Thursdays on the Island.', avatarUrl: '', avatarAlt: '', location: 'Victoria Island, Lagos' }, { align: 'center' }),
    b('nv_social', 'social', {
      items: [
      { id: 'nv_ig', platform: 'instagram', url: 'https://instagram.com/novasounds.example' },
      { id: 'nv_tt', platform: 'tiktok', url: 'https://tiktok.com/@novasounds.example' },
      { id: 'nv_yt', platform: 'youtube', url: 'https://youtube.com/@novasounds.example' }]

    }, { align: 'center' }),
    b('nv_mix', 'link', { label: 'Listen: Midnight Lagos Vol. 7', url: 'https://soundcloud.com/novasounds.example', description: '62-minute mix · new every month' }, { align: 'center', emphasis: 'featured' }),
    b('nv_img', 'image', { url: img.dj, alt: 'Nova Sounds behind the decks under violet and teal lights', caption: 'Thursdays on the Island', aspect: '4:5' }),
    b('nv_count', 'countdown', { title: 'Next headline set in', target: daysFromNow(12, 22), endedMessage: 'We’re live — see you on the floor.', linkLabel: '', url: '' }),
    b('nv_event', 'event', {
      title: 'Midnight Lagos — Live',
      startsAt: daysFromNow(12, 22), endsAt: daysFromNow(13, 3), timeZone: 'Africa/Lagos',
      venue: 'The Rooftop (sample venue)', address: 'Victoria Island, Lagos',
      ticketUrl: 'https://tix.example/midnightlagos', ctaLabel: 'Get tickets',
      tiers: [
      { id: 'nv_t1', name: 'Early bird', priceNgn: 8000, note: '', soldOut: true },
      { id: 'nv_t2', name: 'Regular', priceNgn: 12000, note: '', soldOut: false },
      { id: 'nv_t3', name: 'Table for 6', priceNgn: 150000, note: 'Includes a bottle', soldOut: false }],

      soldOut: false
    }),
    b('nv_pricing', 'pricing', {
      title: 'Book a set',
      packages: [
      { id: 'nv_p1', name: 'Private party', priceNgn: 250000, unit: 'up to 3 hrs', description: 'Birthdays and house parties in Lagos.', features: 'Own controller and booth\nCurated playlist call\nSetup 1 hour before', ctaLabel: 'Enquire', url: '#nv_form', highlighted: false },
      { id: 'nv_p2', name: 'Wedding & launch', priceNgn: 600000, unit: 'up to 5 hrs', description: 'Most booked.', features: 'Full sound system and lights\nMC coordination\nFirst-dance edit included', ctaLabel: 'Enquire', url: '#nv_form', highlighted: true }]

    }),
    b('nv_test', 'testimonial', { quote: 'The floor didn’t empty once. Guests are still asking for the playlist.', name: 'Tobi A.', role: 'Wedding client', source: sampleSource, avatarUrl: '', avatarAlt: '', permission: true }),
    b('nv_press', 'download', { title: 'Press kit & rider', description: 'Photos, bio and technical rider for promoters.', fileName: 'novasounds-press.zip', fileSize: '24 MB', format: 'ZIP (JPG + PDF)', access: 'free', priceNgn: null, url: 'https://novasounds.example/press', ctaLabel: 'Download press kit', coverUrl: '', coverAlt: '' }),
    b('nv_form', 'leadForm', { title: 'Booking enquiry', description: 'Tell me the date, venue and crowd. I reply within two working days.', fields: { name: true, email: true, phone: true, message: true }, submitLabel: 'Send enquiry', consentText: 'Your details are only used to reply to this enquiry.' }),
    b('nv_news', 'newsletter', { title: 'Get the monthly mix first', description: 'One email when a new mix drops, plus where I’m playing.', buttonLabel: 'Subscribe', consentText: 'One email a month. Unsubscribe anytime.' })]

  )
};

export const adaBakes: ExamplePage = {
  id: 'art-ada-bakes',
  category: 'Food & drink',
  name: 'Ada Bakes',
  city: 'Abuja',
  bestFor: 'Home bakers and small food makers',
  description: 'Cut-paper shapes on warm cream. A menu you can order from, cake gallery, pickup hours and ordering rules.',
  goals: ['sell'],
  styles: ['light', 'bold'],
  plan: 'creator',
  artwork: { priceNgn: 2000, art: 'Cut-paper collage' },
  doc: doc(
    'adabakes',
    'Ada Bakes',
    'Celebration cakes and small-batch pastries baked to order in Wuse, Abuja.',
    {
      presetId: 'custom',
      background: '#F7EFE3',
      surface: '#FFFAF3',
      text: '#2B1B12',
      mutedText: '#6B5244',
      accent: '#B5482A',
      accentText: '#FFFFFF',
      fontPair: 'expressive',
      buttonShape: 'rounded',
      buttonStyle: 'solid',
      backgroundImage: "/8caa67a1-01fd-47b3-9d26-2410583cd547.jpg",
      backgroundVeil: 50
    },
    [
    b('ab_profile', 'profile', { name: 'Ada Bakes', tagline: 'Celebration cakes and small-batch pastries, baked to order in my home kitchen.', avatarUrl: '', avatarAlt: '', location: 'Wuse 2, Abuja' }, { align: 'center' }),
    b('ab_wa', 'whatsapp', { label: 'Order a cake on WhatsApp', phone: '+234 803 555 0142', message: 'Hello Ada! I’d like to order a cake for…' }, { align: 'center', emphasis: 'featured' }),
    b('ab_hero', 'image', { url: img.cakes, alt: 'Pastel buttercream cake with fresh flowers beside cupcakes', caption: 'Garden party cake, 8-inch two tier', aspect: '1:1' }),
    b('ab_menu', 'menu', {
      title: 'This week’s menu',
      note: 'Pastry boxes close Wednesday for Saturday pickup. Cakes need five days’ notice.',
      whatsappPhone: '+234 803 555 0142',
      orderingOpen: true,
      closedMessage: 'Orders are closed for this week. The new menu goes up on Monday.',
      categories: [
      {
        id: 'ab_c1', name: 'Celebration cakes',
        items: [
        { id: 'ab_i1', name: '6-inch buttercream cake', description: 'Vanilla, chocolate or red velvet', priceNgn: 28000, tags: 'Serves 10', available: true },
        { id: 'ab_i2', name: '8-inch two tier', description: 'Custom colours and fresh flowers', priceNgn: 65000, tags: 'Serves 30', available: true }]

      },
      {
        id: 'ab_c2', name: 'Pastry boxes',
        items: [
        { id: 'ab_i3', name: 'Cupcakes (box of 6)', description: 'Mixed flavours', priceNgn: 9000, tags: '', available: true },
        { id: 'ab_i4', name: 'Cinnamon rolls (box of 4)', description: 'Cream cheese glaze', priceNgn: 7500, tags: '', available: false },
        { id: 'ab_i5', name: 'Banana bread loaf', description: 'With walnuts', priceNgn: 6000, tags: 'Egg-free option', available: true }]

      }]

    }),
    b('ab_test', 'testimonial', { quote: 'The cake looked exactly like the picture I sent — and it was gone in ten minutes.', name: 'Ngozi E.', role: 'Birthday order', source: sampleSource, avatarUrl: '', avatarAlt: '', permission: true }),
    b('ab_loc', 'location', { name: 'Pickup', address: 'Wuse 2, Abuja\n(exact address shared after you order)', timeZone: 'Africa/Lagos', hours: hours('10:00', '14:00', [0, 1, 2, 3, 4, 5]), note: 'Pickup on Saturdays only. Delivery by rider, paid separately.' }),
    b('ab_faq', 'faq', {
      title: 'Good to know',
      items: [
      { id: 'ab_f1', question: 'Do you bake egg-free?', answer: 'Yes, for most sponges. Mention it when you order.' },
      { id: 'ab_f2', question: 'How do I pay?', answer: 'A 50% deposit by transfer confirms your order. The balance is paid at pickup.' },
      { id: 'ab_f3', question: 'Can I change my design?', answer: 'Up to three days before pickup, at no cost.' }]

    }),
    b('ab_news', 'newsletter', { title: 'Monday menu alert', description: 'Get the week’s menu before it sells out.', buttonLabel: 'Notify me', consentText: 'One email a week. Unsubscribe anytime.' }),
    b('ab_social', 'social', { items: [{ id: 'ab_ig', platform: 'instagram', url: 'https://instagram.com/adabakes.example' }, { id: 'ab_tt', platform: 'tiktok', url: 'https://tiktok.com/@adabakes.example' }] }, { align: 'center' })]

  )
};

export const kolaStudio: ExamplePage = {
  id: 'art-kola-studio',
  category: 'Professional',
  name: 'Kola Studio',
  city: 'Lagos',
  bestFor: 'Architects, interior and technical consultants',
  description: 'Blueprint linework on cobalt. Project case studies, fee packages, consultation booking and office hours.',
  goals: ['showcase', 'book'],
  styles: ['dark', 'editorial'],
  plan: 'creator',
  artwork: { priceNgn: 3000, art: 'Blueprint linework' },
  doc: doc(
    'kolastudio',
    'Kola Studio',
    'Residential architecture and interior planning in Lagos. Book a first consultation.',
    {
      presetId: 'custom',
      background: '#0F2A6B',
      surface: '#173784',
      text: '#FFFFFF',
      mutedText: '#C9D6F5',
      accent: '#FFFFFF',
      accentText: '#0F2A6B',
      fontPair: 'modern',
      buttonShape: 'square',
      buttonStyle: 'solid',
      backgroundImage: "/a19525ae-a2c4-4f43-b0aa-e6d628929229.jpg",
      backgroundVeil: 40
    },
    [
    b('ks_profile', 'profile', { name: 'Kola Studio', tagline: 'Residential architecture and interior planning. Homes designed around how you actually live.', avatarUrl: '', avatarAlt: '', location: 'Lekki, Lagos' }, { align: 'left' }),
    b('ks_text', 'text', { body: 'New homes, extensions and full interior layouts. We handle drawings, approvals guidance and site visits, and work with your builder or recommend one.' }),
    b('ks_portfolio', 'portfolio', {
      title: 'Selected projects',
      items: [
      { id: 'ks_p1', title: 'Courtyard House', client: 'Private client, Ikoyi', role: 'Architecture & interiors', outcome: 'Completed in 14 months, with natural cross-ventilation in every room.', summary: 'A four-bedroom family home arranged around a planted courtyard, so every room gets daylight and a breeze without relying on air conditioning.', coverUrl: img.architecture, coverAlt: 'Double-height living room in concrete and timber with tall windows', url: '' },
      { id: 'ks_p2', title: 'Terrace Extension', client: 'Private client, Surulere', role: 'Extension & approvals', outcome: 'Added a study and guest room without losing the garden.', summary: 'A light steel-and-block rooftop extension designed to sit within the existing structure’s load limits.', coverUrl: '', coverAlt: '', url: '' }]

    }),
    b('ks_pricing', 'pricing', {
      title: 'Ways to work with us',
      packages: [
      { id: 'ks_k1', name: 'Design consultation', priceNgn: 75000, unit: 'per session', description: 'Advice on a plot, a purchase or a renovation.', features: '90-minute session\nSite visit or online\nWritten summary', ctaLabel: 'Book', url: 'https://kolastudio.example/consult', highlighted: false },
      { id: 'ks_k2', name: 'Full design', priceNgn: null, unit: 'quoted per project', description: 'Concept to construction drawings.', features: 'Concept options\nDetailed drawings\nApprovals guidance\nSite visits during build', ctaLabel: 'Request a quote', url: '#ks_form', highlighted: true }]

    }),
    b('ks_book', 'booking', { title: 'Book a first consultation', description: 'Talk through your site, budget and timeline.', duration: '45 min', priceNote: 'Free first call', ctaLabel: 'Pick a time', url: 'https://kolastudio.example/consult' }),
    b('ks_test', 'testimonial', { quote: 'They designed around how our family actually lives — the courtyard is where we spend every evening now.', name: 'Mr & Mrs O.', role: 'Courtyard House', source: sampleSource, avatarUrl: '', avatarAlt: '', permission: true }),
    b('ks_form', 'leadForm', { title: 'Tell us about your project', description: 'Plot location, size and what you’d like to build.', fields: { name: true, email: true, phone: true, message: true }, submitLabel: 'Send project details', consentText: 'Your details are only used to reply to this request.' }),
    b('ks_loc', 'location', { name: 'Studio', address: 'Admiralty Way\nLekki Phase 1, Lagos', timeZone: 'Africa/Lagos', hours: hours('09:00', '17:00', [0, 6]), note: 'Visits by appointment.' }),
    b('ks_social', 'social', { items: [{ id: 'ks_li', platform: 'linkedin', url: 'https://linkedin.com/company/kolastudio.example' }, { id: 'ks_ig', platform: 'instagram', url: 'https://instagram.com/kolastudio.example' }] })]

  )
};

export const wanderLagos: ExamplePage = {
  id: 'art-wander-lagos',
  category: 'Travel',
  name: 'Wander Lagos',
  city: 'Lagos',
  bestFor: 'Travel creators and small tour hosts',
  description: 'Sunset dunes in warm coral. Next group trip with tickets, trip packages, a free guide and a Friday letter.',
  goals: ['audience', 'events'],
  styles: ['light', 'editorial'],
  plan: 'creator',
  artwork: { priceNgn: 2500, art: 'Sunset dunes' },
  doc: doc(
    'wanderlagos',
    'Wander Lagos',
    'Slow weekend trips from Lagos — guides, small group getaways and a Friday letter.',
    {
      presetId: 'custom',
      background: '#FBE9DC',
      surface: '#FFF6EF',
      text: '#3A1F1A',
      mutedText: '#734A40',
      accent: '#C4462B',
      accentText: '#FFFFFF',
      fontPair: 'luxe',
      buttonShape: 'pill',
      buttonStyle: 'solid',
      backgroundImage: "/416bc6e9-b450-4743-bf15-3be7a37d6c34.jpg",
      backgroundVeil: 40
    },
    [
    b('wl_profile', 'profile', { name: 'Wander Lagos', tagline: 'Slow weekend trips within a day’s drive of Lagos. Beaches, hills and quiet towns.', avatarUrl: '', avatarAlt: '', location: 'Lagos' }, { align: 'center' }),
    b('wl_social', 'social', { items: [{ id: 'wl_ig', platform: 'instagram', url: 'https://instagram.com/wanderlagos.example' }, { id: 'wl_yt', platform: 'youtube', url: 'https://youtube.com/@wanderlagos.example' }] }, { align: 'center' }),
    b('wl_img', 'image', { url: img.waterfall, alt: 'Hikers at the foot of a tall forest waterfall', caption: 'Erin-Ijesha, last March', aspect: '4:5' }),
    b('wl_event', 'event', {
      title: 'Erin-Ijesha waterfalls weekend',
      startsAt: daysFromNow(21, 6), endsAt: daysFromNow(22, 19), timeZone: 'Africa/Lagos',
      venue: 'Departs from Ikeja City Mall car park', address: 'Ikeja, Lagos',
      ticketUrl: 'https://wanderlagos.example/trips/erin', ctaLabel: 'Reserve a seat',
      tiers: [
      { id: 'wl_t1', name: 'Shared room', priceNgn: 85000, note: 'Transport, 1 night, guide, 2 meals', soldOut: false },
      { id: 'wl_t2', name: 'Private room', priceNgn: 110000, note: 'Same, with your own room', soldOut: false }],

      soldOut: false
    }),
    b('wl_gallery', 'gallery', { title: 'Where we’ve been', layout: 'carousel', images: [
      { id: 'wl_g1', url: img.waterfall, alt: 'Forest waterfall with hikers' },
      { id: 'wl_g2', url: "/416bc6e9-b450-4743-bf15-3be7a37d6c34.jpg", alt: 'Sunset over coral dunes' }]
    }),
    b('wl_guide', 'download', { title: 'Free weekend guide: 5 trips under 4 hours', description: 'Routes, where to stay and what it really costs.', fileName: 'wanderlagos-guide.pdf', fileSize: '6 MB', format: 'PDF', access: 'free', priceNgn: null, url: 'https://wanderlagos.example/guide', ctaLabel: 'Download free', coverUrl: '', coverAlt: '' }),
    b('wl_test', 'testimonial', { quote: 'I came alone and left with six new friends. Everything was sorted — I just had to show up.', name: 'Bisi K.', role: 'Trip guest', source: sampleSource, avatarUrl: '', avatarAlt: '', permission: true }),
    b('wl_faq', 'faq', {
      title: 'Before you book',
      items: [
      { id: 'wl_f1', question: 'Is it safe to come alone?', answer: 'Most guests do. Groups are capped at 14 and we share a WhatsApp group a week before.' },
      { id: 'wl_f2', question: 'What’s the refund policy?', answer: 'Full refund up to 14 days before. After that, you can transfer your seat to a friend.' }]

    }),
    b('wl_news', 'newsletter', { title: 'The Friday letter', description: 'One weekend idea every Friday, with prices and directions.', buttonLabel: 'Subscribe', consentText: 'One email a week. Unsubscribe anytime.' }),
    b('wl_wa', 'whatsapp', { label: 'Plan a private group trip', phone: '+234 802 555 0150', message: 'Hi Wander Lagos! I’d like to plan a trip for…' }, { align: 'center' })]

  )
};

export const verdantWellness: ExamplePage = {
  id: 'art-verdant-wellness',
  category: 'Wellness',
  name: 'Verdant Wellness',
  city: 'Abuja',
  bestFor: 'Yoga teachers and wellness coaches',
  description: 'Gold plant line drawings on forest green. Class passes, booking, the studio schedule and a free breathwork guide.',
  goals: ['book'],
  styles: ['dark', 'editorial'],
  plan: 'creator',
  artwork: { priceNgn: 3000, art: 'Gold botanicals' },
  doc: doc(
    'verdantwellness',
    'Verdant Wellness',
    'Gentle yoga and breathwork classes in Maitama, plus private sessions.',
    {
      presetId: 'custom',
      background: '#0F2A20',
      surface: '#18392C',
      text: '#F3EBD3',
      mutedText: '#CFC5A6',
      accent: '#D4B26A',
      accentText: '#10241B',
      fontPair: 'luxe',
      buttonShape: 'rounded',
      buttonStyle: 'solid',
      backgroundImage: "/835b3c62-9914-4019-860d-9f13a6e09b4a.jpg",
      backgroundVeil: 35
    },
    [
    b('vw_profile', 'profile', { name: 'Verdant Wellness', tagline: 'Gentle yoga and breathwork for busy people. Classes in Maitama and online.', avatarUrl: '', avatarAlt: '', location: 'Maitama, Abuja' }, { align: 'center' }),
    b('vw_book', 'booking', { title: 'Book a class', description: 'Small groups of up to 10. Mats provided.', duration: '60 min', priceNote: 'From ₦6,000', ctaLabel: 'See class times', url: 'https://verdantwellness.example/classes' }, { align: 'center' }),
    b('vw_img', 'image', { url: img.yoga, alt: 'A woman in a gentle yoga pose in a bright studio with plants', caption: 'Saturday slow flow', aspect: '4:5' }),
    b('vw_pricing', 'pricing', {
      title: 'Class passes',
      packages: [
      { id: 'vw_p1', name: 'Drop-in', priceNgn: 6000, unit: 'per class', description: 'Try any group class.', features: 'Any group class\nMat provided', ctaLabel: 'Book', url: 'https://verdantwellness.example/classes', highlighted: false },
      { id: 'vw_p2', name: '8-class pass', priceNgn: 40000, unit: 'valid 2 months', description: 'Best for regulars.', features: 'Any group class\nOne free guest class\nOnline replays', ctaLabel: 'Buy pass', url: 'https://verdantwellness.example/pass', highlighted: true },
      { id: 'vw_p3', name: 'Private session', priceNgn: 25000, unit: '60 min', description: 'One to one, at the studio or your home.', features: 'Shaped to your body\nAll levels', ctaLabel: 'Request', url: '#vw_form', highlighted: false }]

    }),
    b('vw_loc', 'location', { name: 'The studio', address: 'Off Gana Street\nMaitama, Abuja', timeZone: 'Africa/Lagos', hours: hours('07:00', '19:00', [0], { 6: ['08:00', '12:00'] }), note: 'Classes Tue & Thu 7am, Sat 9am.' }),
    b('vw_guide', 'download', { title: 'Free 5-minute breathwork guide', description: 'Three simple practices for stress and sleep.', fileName: 'breathwork-guide.pdf', fileSize: '2 MB', format: 'PDF', access: 'free', priceNgn: null, url: 'https://verdantwellness.example/guide', ctaLabel: 'Download free', coverUrl: '', coverAlt: '' }),
    b('vw_test', 'testimonial', { quote: 'I came for my back and stayed for the calm. Tuesday mornings are non-negotiable now.', name: 'Halima S.', role: 'Member', source: sampleSource, avatarUrl: '', avatarAlt: '', permission: true }),
    b('vw_form', 'leadForm', { title: 'Request a private session', description: 'Share a few times that suit you.', fields: { name: true, email: false, phone: true, message: true }, submitLabel: 'Request a session', consentText: 'Your number is only used to arrange your session.' }),
    b('vw_faq', 'faq', {
      title: 'New to yoga?',
      items: [
      { id: 'vw_f1', question: 'Do I need experience?', answer: 'No. Every class offers easier and harder options.' },
      { id: 'vw_f2', question: 'Is this medical treatment?', answer: 'No. Yoga isn’t a substitute for medical advice — speak to your doctor if you have an injury or condition.' }]

    }),
    b('vw_social', 'social', { items: [{ id: 'vw_ig', platform: 'instagram', url: 'https://instagram.com/verdantwellness.example' }] }, { align: 'center' })]

  )
};

export const glossyByZara: ExamplePage = {
  id: 'art-glossy-by-zara',
  category: 'Beauty',
  name: 'Glossy by Zara',
  city: 'Port Harcourt',
  bestFor: 'Nail techs, lash and beauty studios',
  description: 'Liquid chrome and iridescent glass. Price list, booking, a nail gallery, studio hours and aftercare.',
  goals: ['book'],
  styles: ['light', 'bold'],
  plan: 'creator',
  artwork: { priceNgn: 2500, art: 'Liquid chrome' },
  doc: doc(
    'glossybyzara',
    'Glossy by Zara',
    'Gel, acrylic and chrome nails in GRA, Port Harcourt. Book on WhatsApp.',
    {
      presetId: 'custom',
      background: '#E9E6EF',
      surface: '#FFFFFF',
      text: '#1E1B2B',
      mutedText: '#555068',
      accent: '#1E1B2B',
      accentText: '#FFFFFF',
      fontPair: 'grotesk',
      buttonShape: 'pill',
      buttonStyle: 'solid',
      backgroundImage: "/7e43edc7-f06e-4481-b682-ad6525b96f24.jpg",
      backgroundVeil: 35
    },
    [
    b('gz_profile', 'profile', { name: 'Glossy by Zara', tagline: 'Gel, acrylic and chrome nails. Clean tools, unhurried appointments.', avatarUrl: '', avatarAlt: '', location: 'GRA Phase 2, Port Harcourt' }, { align: 'center' }),
    b('gz_wa', 'whatsapp', { label: 'Book on WhatsApp', phone: '+234 806 555 0119', message: 'Hi Zara! I’d like to book a nail appointment on…' }, { align: 'center', emphasis: 'featured' }),
    b('gz_gallery', 'gallery', { title: 'Recent sets', layout: 'grid', images: [
      { id: 'gz_g1', url: img.chromeNails, alt: 'Chrome mirror-finish almond nails on a lilac backdrop' },
      { id: 'gz_g2', url: img.nudeNails, alt: 'Almond nails in nude with gold accents' }]
    }),
    b('gz_pricing', 'pricing', {
      title: 'Price list',
      packages: [
      { id: 'gz_p1', name: 'Gel manicure', priceNgn: 12000, unit: '', description: 'On natural nails.', features: 'Shape and cuticle care\nOne gel colour\nAbout 1 hour', ctaLabel: 'Book', url: 'https://wa.me/2348065550119', highlighted: false },
      { id: 'gz_p2', name: 'Chrome acrylic set', priceNgn: 22000, unit: '', description: 'Our signature.', features: 'Full acrylic extensions\nChrome or pearl finish\nAbout 2 hours', ctaLabel: 'Book', url: 'https://wa.me/2348065550119', highlighted: true },
      { id: 'gz_p3', name: 'Refill', priceNgn: 14000, unit: 'within 3 weeks', description: '', features: 'Rebalance and new colour\nAbout 1.5 hours', ctaLabel: 'Book', url: 'https://wa.me/2348065550119', highlighted: false }]

    }),
    b('gz_test', 'testimonial', { quote: 'Three weeks in and not a single chip. Zara is so careful with cuticles.', name: 'Ifeoma N.', role: 'Client', source: sampleSource, avatarUrl: '', avatarAlt: '', permission: true }),
    b('gz_loc', 'location', { name: 'The studio', address: 'GRA Phase 2\nPort Harcourt', timeZone: 'Africa/Lagos', hours: hours('10:00', '19:00', [0, 1]), note: 'Appointments only. Exact address shared after booking.' }),
    b('gz_faq', 'faq', {
      title: 'Before you book',
      items: [
      { id: 'gz_f1', question: 'Do I pay a deposit?', answer: 'Yes, ₦5,000 to hold your slot, taken off the final price.' },
      { id: 'gz_f2', question: 'How long does a set last?', answer: 'Gel usually lasts two to three weeks with good aftercare.' },
      { id: 'gz_f3', question: 'Running late?', answer: 'We hold your slot for 15 minutes, then may need to rebook.' }]

    }),
    b('gz_care', 'download', { title: 'Aftercare card', description: 'How to keep your set glossy for longer.', fileName: 'aftercare.pdf', fileSize: '1 MB', format: 'PDF', access: 'free', priceNgn: null, url: 'https://glossybyzara.example/aftercare', ctaLabel: 'Download', coverUrl: '', coverAlt: '' }),
    b('gz_social', 'social', { items: [{ id: 'gz_ig', platform: 'instagram', url: 'https://instagram.com/glossybyzara.example' }, { id: 'gz_tt', platform: 'tiktok', url: 'https://tiktok.com/@glossybyzara.example' }] }, { align: 'center' })]

  )
};

export const indigoHouse: ExamplePage = {
  id: 'art-indigo-house',
  category: 'Retail',
  name: 'Indigo House',
  city: 'Abeokuta',
  bestFor: 'Textile, fashion and craft sellers',
  description: 'Hand-dyed adire pattern in deep indigo. Product grid, custom orders, the maker’s story and delivery details.',
  goals: ['sell'],
  styles: ['dark', 'bold'],
  plan: 'creator',
  artwork: { priceNgn: 3000, art: 'Adire indigo' },
  doc: doc(
    'indigohouse',
    'Indigo House',
    'Hand-dyed adire fabric and ready-to-wear from Abeokuta.',
    {
      presetId: 'custom',
      background: '#13234F',
      surface: '#1C3068',
      text: '#F5F1E8',
      mutedText: '#C9CEE2',
      accent: '#F2C14E',
      accentText: '#13234F',
      fontPair: 'classic',
      buttonShape: 'rounded',
      buttonStyle: 'solid',
      backgroundImage: "/e37f5bc7-3553-423b-9955-8eef0ed7a404.jpg",
      backgroundVeil: 50
    },
    [
    b('ih_profile', 'profile', { name: 'Indigo House', tagline: 'Hand-dyed adire fabric and ready-to-wear, made by a family of dyers in Itoku.', avatarUrl: '', avatarAlt: '', location: 'Itoku, Abeokuta' }, { align: 'center' }),
    b('ih_grid', 'productGrid', {
      title: 'This month’s pieces',
      orderAction: 'whatsapp',
      whatsappPhone: '+234 805 555 0163',
      ctaLabel: 'Order',
      items: [
      { id: 'ih_p1', name: 'Adire fabric (per yard)', priceNgn: 6500, imageUrl: img.adire, imageAlt: 'Folded indigo adire fabrics with white patterns', note: 'Sold by the yard', soldOut: false, url: '' },
      { id: 'ih_p2', name: 'Wide-leg adire trousers', priceNgn: 28000, imageUrl: img.trousers, imageAlt: 'Indigo adire trousers on a wooden hanger', note: 'Made to measure', soldOut: false, url: '' },
      { id: 'ih_p3', name: 'Raffia tote', priceNgn: 15000, imageUrl: img.tote, imageAlt: 'Woven raffia tote with leather handles', note: 'Oyo-made', soldOut: true, url: '' }]

    }),
    b('ih_custom', 'whatsapp', { label: 'Ask about a custom order', phone: '+234 805 555 0163', message: 'Hello Indigo House! I’d like a custom order of…' }, { align: 'center', emphasis: 'featured' }),
    b('ih_h', 'heading', { text: 'Our story', level: 'h2' }),
    b('ih_text', 'text', { body: 'Every piece is resist-dyed by hand with indigo, then washed and dried in the sun. Patterns vary slightly from piece to piece — that’s the mark of the hand.' }),
    b('ih_img', 'image', { url: img.adire, alt: 'Stack of hand-dyed adire fabrics in deep indigo', caption: 'Dyed in Itoku, Abeokuta', aspect: '1:1' }),
    b('ih_test', 'testimonial', { quote: 'The fabric is even more beautiful in person. My tailor asked where I found it.', name: 'Funke A.', role: 'Customer, Lagos', source: sampleSource, avatarUrl: '', avatarAlt: '', permission: true }),
    b('ih_faq', 'faq', {
      title: 'Orders & care',
      items: [
      { id: 'ih_f1', question: 'How long is delivery?', answer: 'Three to five working days within Nigeria, through a courier.' },
      { id: 'ih_f2', question: 'How do I wash adire?', answer: 'Cold hand wash on its own, dry in the shade.' },
      { id: 'ih_f3', question: 'Do you sell wholesale?', answer: 'Yes, from 20 yards. Message us for wholesale prices.' }]

    }),
    b('ih_loc', 'location', { name: 'Dye yard & shop', address: 'Itoku Market\nAbeokuta, Ogun', timeZone: 'Africa/Lagos', hours: hours('09:00', '18:00', [0]), note: 'Visitors welcome to watch the dyeing on weekday mornings.' }),
    b('ih_social', 'social', { items: [{ id: 'ih_ig', platform: 'instagram', url: 'https://instagram.com/indigohouse.example' }] }, { align: 'center' })]

  )
};

export const mettleClub: ExamplePage = {
  id: 'art-mettle-club',
  category: 'Community',
  name: 'Mettle Design Club',
  city: 'Lagos',
  bestFor: 'Meetups, clubs and community events',
  description: 'Bauhaus shapes on paper white. Countdown, next meetup with RSVP, membership tiers and past talks.',
  goals: ['events', 'audience'],
  styles: ['light', 'bold'],
  plan: 'creator',
  artwork: { priceNgn: 2000, art: 'Bauhaus geometry' },
  doc: doc(
    'mettleclub',
    'Mettle Design Club',
    'A monthly meetup for designers in Lagos. Talks, critiques and good company.',
    {
      presetId: 'custom',
      background: '#F3EFE6',
      surface: '#FFFFFF',
      text: '#151515',
      mutedText: '#474747',
      accent: '#C42B22',
      accentText: '#FFFFFF',
      fontPair: 'statement',
      buttonShape: 'square',
      buttonStyle: 'solid',
      backgroundImage: "/6ca75551-c2b8-4c3d-84f0-438d6790a843.jpg",
      backgroundVeil: 50
    },
    [
    b('mc_profile', 'profile', { name: 'Mettle Design Club', tagline: 'A monthly meetup for designers in Lagos. Talks, portfolio critiques and good company.', avatarUrl: '', avatarAlt: '', location: 'Yaba, Lagos' }, { align: 'center' }),
    b('mc_count', 'countdown', { title: 'Next meetup in', target: daysFromNow(9, 14), endedMessage: 'Doors are open — come on in.', linkLabel: '', url: '' }),
    b('mc_event', 'event', {
      title: 'Meetup #31: Designing for low data',
      startsAt: daysFromNow(9, 14), endsAt: daysFromNow(9, 18), timeZone: 'Africa/Lagos',
      venue: 'The Workshop (sample venue)', address: 'Herbert Macaulay Way, Yaba, Lagos',
      ticketUrl: 'https://mettleclub.example/rsvp', ctaLabel: 'RSVP',
      tiers: [{ id: 'mc_t1', name: 'General', priceNgn: 0, note: 'Free · drinks provided', soldOut: false }],
      soldOut: false
    }),
    b('mc_img', 'image', { url: img.meetup, alt: 'Designers gathered around a projected slide at a meetup', caption: 'Meetup #30, portfolio critiques', aspect: '16:9' }),
    b('mc_h', 'heading', { text: 'How it works', level: 'h2' }),
    b('mc_text', 'text', { body: 'Two short talks, then small-group critiques. Bring work in progress — student or senior, everyone gets honest, kind feedback.' }),
    b('mc_pricing', 'pricing', {
      title: 'Membership',
      packages: [
      { id: 'mc_m1', name: 'Friend', priceNgn: 0, unit: '', description: 'Come to any meetup.', features: 'Monthly meetups\nMeetup reminders', ctaLabel: 'Join free', url: '#mc_news', highlighted: false },
      { id: 'mc_m2', name: 'Member', priceNgn: 5000, unit: 'per month', description: 'Supports the venue and snacks.', features: 'Priority seats\nMonthly portfolio review\nMembers’ WhatsApp group', ctaLabel: 'Become a member', url: 'https://mettleclub.example/join', highlighted: true }]

    }),
    b('mc_talks', 'link', { label: 'Watch past talks', url: 'https://youtube.com/@mettleclub.example', description: '30 talks on YouTube' }, { align: 'center' }),
    b('mc_speak', 'leadForm', { title: 'Pitch a talk', description: '15 minutes on something you’ve learned. All levels welcome.', fields: { name: true, email: true, phone: false, message: true }, submitLabel: 'Send pitch', consentText: 'Used only to reply to your pitch.' }),
    b('mc_faq', 'faq', {
      title: 'Good to know',
      items: [
      { id: 'mc_f1', question: 'Do I need to be a professional?', answer: 'No — students and career-changers are very welcome.' },
      { id: 'mc_f2', question: 'Is the venue accessible?', answer: 'Yes, ground floor with step-free entry.' }]

    }),
    b('mc_news', 'newsletter', { title: 'Meetup reminders', description: 'One email before each meetup with the speakers and venue.', buttonLabel: 'Remind me', consentText: 'One email a month. Unsubscribe anytime.' }),
    b('mc_social', 'social', {
      items: [
      { id: 'mc_ig', platform: 'instagram', url: 'https://instagram.com/mettleclub.example' },
      { id: 'mc_x', platform: 'x', url: 'https://x.com/mettleclub.example' }]

    }, { align: 'center' })]

  )
};

export const artworkPages: ExamplePage[] = [novaSounds, adaBakes, kolaStudio, wanderLagos, verdantWellness, glossyByZara, indigoHouse, mettleClub];