import { bl, doc, hours, type ExamplePage } from '../build';

/* Elite Template Library (D154) — commerce & services. Every business, price and link is fictional sample content. */

const img = {
  beauty: "/385deb77-e253-44ca-9637-2ee7faa7e4fb.jpg",
  food: "/355738c1-f5d1-49e7-98d1-b154ca9aacf5.jpg",
  boutique: "/2752d206-8f3d-4a7f-9645-591988811211.jpg",
  digital: "/848094a0-66ff-4b91-b8e7-a4905a7ca3c7.jpg",
  coach: "/c0107ae0-8df8-4232-86c1-b7671b40b23d.jpg"
};

const faq = (prefix: string, items: [string, string][]) => items.map(([question, answer], i) => ({ id: `${prefix}_q${i}`, question, answer }));

// 12 — Beauty Professional
export const eliteBeauty: ExamplePage = {
  id: 'elite-beauty',
  category: 'Beauty',
  name: 'Beauty Professional',
  city: 'Lagos',
  bestFor: 'Makeup artists, hairstylists, nail techs and salons',
  description: 'The route to booking is obvious: a portrait split hero, services with starting prices, a polished gallery, how booking works, hours and area, and a sticky Book bar.',
  goals: ['book'],
  styles: ['light'],
  plan: 'pro',
  elite: {
    number: 12,
    useCase: 'services',
    goal: 'bookings',
    priceNgn: 4667,
    structure: 'Split hero · priced services · gallery · booking steps · hours & area · FAQ · sticky Book bar',
    inside: ['Split hero with a close-up portrait', 'Services with starting prices', 'Gallery of recent looks', 'How booking works, in three steps', 'Opening hours and service area', 'Short FAQ', 'Booking button'],
    goodToKnow: ['Prices are samples.', 'Booking on the page needs Bookings; otherwise the button opens WhatsApp or your link.']
  },
  doc: {
    ...doc('glowbytemi', 'Glow by Temi', 'Bridal and soft-glam makeup artist in Lekki. Home service across Lagos Island.', {
      presetId: 'custom',
      background: '#FBF6F2',
      surface: '#FFFFFF',
      text: '#2A1E1A',
      mutedText: '#6E5D56',
      accent: '#9C4A3C',
      accentText: '#FFFFFF',
      fontPair: 'luxe',
      buttonShape: 'pill',
      buttonStyle: 'solid'
    }, [
    bl('e12_hero', 'hero', { variant: 'split', eyebrow: 'Makeup artist · Lekki', title: 'Soft glam that lasts all day', subtitle: 'Bridal, owambe and photoshoot makeup, in my studio or at your home across Lagos Island.', imageUrl: img.beauty, imageAlt: 'Close-up of soft glam makeup with glossy lips', focal: 'top', primaryLabel: 'Book an appointment', primaryUrl: '#b-e12_book', secondaryLabel: 'See prices', secondaryUrl: '#b-e12_services', meta: '' }, { width: 'wide', spacing: 'loose' }),
    bl('e12_services', 'featureGrid', { title: 'Services', intro: 'Starting prices. Final price depends on the look and location.', columns: 3, items: [
      { id: 'e12_s1', title: 'Soft glam', text: 'Everyday to evening, lashes included.', imageUrl: '', imageAlt: '', label: 'From ₦35,000 · 75 min', url: '' },
      { id: 'e12_s2', title: 'Bridal', text: 'Trial, wedding-day makeup and a touch-up kit.', imageUrl: '', imageAlt: '', label: 'From ₦180,000', url: '' },
      { id: 'e12_s3', title: 'Gele tying', text: 'Add-on for owambe and traditional weddings.', imageUrl: '', imageAlt: '', label: 'From ₦10,000', url: '' }]
    }, { width: 'wide', spacing: 'loose' }),
    bl('e12_gallery', 'gallery', { title: 'Recent looks', layout: 'grid', images: [
      { id: 'e12_g1', url: img.beauty, alt: 'Soft glam with glossy nude lips' },
      { id: 'e12_g2', url: img.coach, alt: 'Natural daytime makeup for a corporate shoot' }]
    }, { width: 'wide', spacing: 'loose' }),
    bl('e12_steps', 'steps', { title: 'How booking works', intro: '', items: [
      { id: 'e12_p1', title: 'Pick a service and time', text: 'Choose a slot that works for you.' },
      { id: 'e12_p2', title: 'Pay a deposit', text: 'Your slot is held once the deposit is paid.' },
      { id: 'e12_p3', title: 'Arrive with a clean face', text: 'Or I come to you — travel fee depends on area.' }]
    }, { background: 'tint', width: 'wide', spacing: 'loose' }),
    bl('e12_book', 'booking', { title: 'Book an appointment', description: 'Studio in Lekki Phase 1, or home service on the Island.', duration: '75 min', priceNote: 'From ₦35,000 · deposit to confirm', ctaLabel: 'Book now', url: 'https://wa.me/2348000000000' }, { spacing: 'loose' }),
    bl('e12_location', 'location', { name: 'Glow by Temi studio', address: 'Admiralty Way, Lekki Phase 1, Lagos', timeZone: 'Africa/Lagos', hours: hours('09:00', '19:00', [1]), note: 'Home service: Lekki, VI, Ikoyi and Ajah.' }, { spacing: 'loose' }),
    bl('e12_faq', 'faq', { title: 'Good to know', items: faq('e12', [['Do you travel?', 'Yes, across Lagos Island. A travel fee is added based on your area.'], ['How far ahead should I book bridal?', 'Ideally three months, with a trial a month before.']]) }, { spacing: 'loose' })]
    ),
    layout: { contentWidth: 'standard', actionBar: { enabled: true, label: 'Book now', blockId: 'e12_book', url: '' } }
  }
};

// 13 — Food & Hospitality
export const eliteFood: ExamplePage = {
  id: 'elite-food',
  category: 'Restaurant',
  name: 'Food & Hospitality',
  city: 'Lagos',
  bestFor: 'Restaurants, chefs, caterers and food vendors',
  description: 'Appetising and practical: an edge-to-edge food cover, a scannable menu, catering beside a photo, opening hours and location, and a sticky Order bar.',
  goals: ['sell'],
  styles: ['dark', 'bold'],
  plan: 'pro',
  elite: {
    number: 13,
    useCase: 'commerce',
    goal: 'sell',
    priceNgn: 5333,
    structure: 'Full-bleed cover · menu · catering pair · hours & location · sticky Order bar',
    inside: ['Edge-to-edge food photograph', 'Menu by category with prices', 'Catering beside a photo', 'Opening hours and map', 'WhatsApp ordering'],
    goodToKnow: ['Menu items and prices are samples.', 'Paid ordering through KUBICU needs Commerce; otherwise orders go to WhatsApp.']
  },
  doc: {
    ...doc('ewabukka', 'Ẹwà Kitchen', 'Smoky party jollof, suya and Sunday rice in Yaba. Dine in, pick up or delivery.', {
      presetId: 'custom',
      background: '#14110E',
      surface: '#1F1A15',
      text: '#F6EEE3',
      mutedText: '#BDAE9C',
      accent: '#F2A33A',
      accentText: '#1A1208',
      fontPair: 'statement',
      buttonShape: 'rounded',
      buttonStyle: 'solid'
    }, [
    bl('e13_cover', 'hero', { variant: 'cover', eyebrow: 'Yaba · Open till 10pm', title: 'Ẹwà Kitchen', subtitle: 'Smoky party jollof, suya and Sunday rice, cooked over firewood.', imageUrl: img.food, imageAlt: 'Jollof rice, suya and plantain on ceramic plates', focal: 'center', primaryLabel: 'Order on WhatsApp', primaryUrl: 'https://wa.me/2348000000001', secondaryLabel: 'See the menu', secondaryUrl: '#b-e13_menu', meta: '' }, { width: 'full' }),
    bl('e13_menu', 'menu', { title: 'Menu', note: 'Prices include a takeaway pack.', whatsappPhone: '2348000000001', orderingOpen: true, closedMessage: 'The kitchen is closed. We open at 11am.', categories: [
      { id: 'e13_c1', name: 'Rice', items: [
        { id: 'e13_m1', name: 'Firewood party jollof', description: 'With fried plantain and coleslaw.', priceNgn: 4500, tags: 'Spicy', available: true },
        { id: 'e13_m2', name: 'Ofada rice & ayamase', description: 'Green pepper stew with assorted.', priceNgn: 5500, tags: 'Very spicy', available: true }]
      },
      { id: 'e13_c2', name: 'Grill', items: [
        { id: 'e13_m3', name: 'Beef suya', description: 'Yaji-rubbed, with onions and tomato.', priceNgn: 3500, tags: 'Spicy', available: true },
        { id: 'e13_m4', name: 'Grilled chicken', description: 'Half chicken, peppered.', priceNgn: 6000, tags: '', available: true }]
      }]
    }, { spacing: 'loose' }),
    bl('e13_cater_img', 'image', { url: img.food, alt: 'A party spread of jollof and suya', caption: '', aspect: '4:5' }, { width: 'wide', pair: 'narrow-first', background: 'tint', spacing: 'loose' }),
    bl('e13_cater_text', 'text', { body: 'Catering for 20 to 300\n\nBirthdays, office lunches and owambes. Coolers delivered hot across the mainland, with servers on request. Order at least five days ahead.' }, { background: 'tint', spacing: 'loose' }),
    bl('e13_location', 'location', { name: 'Ẹwà Kitchen', address: '14 Herbert Macaulay Way, Yaba, Lagos', timeZone: 'Africa/Lagos', hours: hours('11:00', '22:00', [1]), note: 'Delivery on the mainland through our riders.' }, { spacing: 'loose' }),
    bl('e13_whatsapp', 'whatsapp', { label: 'Order on WhatsApp', phone: '2348000000001', message: 'Hi Ẹwà Kitchen, I’d like to order:' }, { spacing: 'loose' })]
    ),
    layout: { actionBar: { enabled: true, label: 'Order now', blockId: 'e13_menu', url: '' } }
  }
};

// 14 — Boutique Storefront
export const eliteBoutique: ExamplePage = {
  id: 'elite-boutique',
  category: 'Boutique',
  name: 'Boutique Storefront',
  city: 'Abuja',
  bestFor: 'Independent fashion, accessories and homeware sellers',
  description: 'Brand and products lead: a product hero, a curated product grid, the maker’s story beside a still life, delivery and returns, and enquiry by WhatsApp.',
  goals: ['sell'],
  styles: ['light', 'editorial'],
  plan: 'pro',
  elite: {
    number: 14,
    useCase: 'commerce',
    goal: 'sell',
    priceNgn: 6667,
    structure: 'Product hero · product grid · story pair · trust grid · FAQ',
    inside: ['Featured product hero with price line', 'Curated product grid', 'Maker’s story beside a still life', 'Delivery, returns and payment in a 3-column grid', 'FAQ'],
    goodToKnow: ['Products and prices are samples. Connect Commerce for checkout; otherwise orders go to WhatsApp.']
  },
  doc: doc('kanuleather', 'Kánú Leather', 'Handmade leather bags from Abuja. Made to order in small batches.', {
    presetId: 'custom',
    background: '#F6F1EA',
    surface: '#FFFFFF',
    text: '#231B15',
    mutedText: '#6B5E52',
    accent: '#5A2E1E',
    accentText: '#FFFFFF',
    fontPair: 'luxe',
    buttonShape: 'square',
    buttonStyle: 'solid'
  }, [
  bl('e14_hero', 'hero', { variant: 'product', eyebrow: 'New · The Ọ̀ṣọ́ tote', title: 'Carried for years, not seasons', subtitle: 'Full-grain leather, hand-stitched in Abuja. Each bag is made to order in small batches.', imageUrl: img.boutique, imageAlt: 'Tan and burgundy leather bags with a raffia clutch on a plinth', focal: 'center', primaryLabel: 'Shop the collection', primaryUrl: '#b-e14_grid', secondaryLabel: 'Ask about a bag', secondaryUrl: 'https://wa.me/2348000000002', meta: 'From ₦85,000' }, { width: 'wide', spacing: 'loose' }),
  bl('e14_grid', 'productGrid', { title: 'The collection', orderAction: 'whatsapp', whatsappPhone: '2348000000002', ctaLabel: 'Order', items: [
    { id: 'e14_p1', name: 'Ọ̀ṣọ́ tote · tan', priceNgn: 120000, imageUrl: img.boutique, imageAlt: 'Tan leather tote', note: 'Made to order · 2 weeks', soldOut: false, url: '' },
    { id: 'e14_p2', name: 'Ọ̀ṣọ́ tote · burgundy', priceNgn: 120000, imageUrl: img.boutique, imageAlt: 'Burgundy leather tote', note: 'Made to order · 2 weeks', soldOut: false, url: '' },
    { id: 'e14_p3', name: 'Raffia clutch', priceNgn: 45000, imageUrl: img.boutique, imageAlt: 'Woven raffia clutch', note: 'In stock', soldOut: false, url: '' },
    { id: 'e14_p4', name: 'Card holder', priceNgn: 18000, imageUrl: img.boutique, imageAlt: 'Small leather card holder', note: '', soldOut: true, url: '' }]
  }, { width: 'wide', spacing: 'loose' }),
  bl('e14_story_img', 'image', { url: img.boutique, alt: 'Leather bags displayed on a plaster plinth', caption: '', aspect: '4:5' }, { width: 'wide', pair: 'equal', spacing: 'loose' }),
  bl('e14_story', 'text', { body: 'Made by four hands in Wuse\n\nKánú started with one bag for my sister’s wedding. Today Chinedu and I cut, stitch and edge every piece ourselves, using leather tanned in Kano.' }, { spacing: 'loose' }),
  bl('e14_trust', 'featureGrid', { title: 'Buying from us', intro: '', columns: 3, items: [
    { id: 'e14_t1', title: 'Delivery', text: 'Nationwide by courier, 2–5 days after your bag is ready.', imageUrl: '', imageAlt: '', label: '', url: '' },
    { id: 'e14_t2', title: 'Returns', text: 'Unused, ready-made items within 7 days. Made-to-order items can’t be returned.', imageUrl: '', imageAlt: '', label: '', url: '' },
    { id: 'e14_t3', title: 'Care', text: 'Free re-conditioning for the first year.', imageUrl: '', imageAlt: '', label: '', url: '' }]
  }, { background: 'tint', width: 'wide', spacing: 'loose' }),
  bl('e14_faq', 'faq', { title: 'Questions', items: faq('e14', [['Can I choose a colour?', 'Yes — message us for this month’s leather colours.'], ['Do you do corporate gifts?', 'Yes, from 10 pieces, with embossing.']]) }, { spacing: 'loose' })]
  )
};

// 15 — Digital Product Atelier
export const eliteDigital: ExamplePage = {
  id: 'elite-digital',
  category: 'Digital products',
  name: 'Digital Product Atelier',
  city: 'Lagos',
  bestFor: 'Sellers of ebooks, templates, presets and guides',
  description: 'Product-led: a product hero with price, what’s inside, a preview, a choice of bundles, transparent delivery details and a FAQ.',
  goals: ['sell'],
  styles: ['light', 'bold'],
  plan: 'pro',
  elite: {
    number: 15,
    useCase: 'commerce',
    goal: 'sell',
    priceNgn: 5000,
    structure: 'Product hero · inside grid · preview pair · pricing · download · FAQ',
    inside: ['Product hero with price line', 'What’s inside, four columns', 'Preview image beside who it’s for', 'Three bundles to choose from', 'Free sample download', 'Delivery and refund FAQ'],
    goodToKnow: ['Prices are samples. Secure delivery needs Commerce → Digital; otherwise buttons link out.']
  },
  doc: doc('naira-planner', 'The Naira Planner', 'A budget planner and money templates built for Nigerian incomes.', {
    presetId: 'custom',
    background: '#FFFFFF',
    surface: '#F7F4EF',
    text: '#1B1B1B',
    mutedText: '#5B5B5B',
    accent: '#C04E2A',
    accentText: '#FFFFFF',
    fontPair: 'modern',
    buttonShape: 'rounded',
    buttonStyle: 'solid'
  }, [
  bl('e15_hero', 'hero', { variant: 'product', eyebrow: 'Templates · Instant download', title: 'The Naira Planner', subtitle: 'A budget planner built for irregular Nigerian incomes — with sheets for ajo, rent saving and side hustles.', imageUrl: img.digital, imageAlt: 'Printed planner and tablet showing budget templates', focal: 'center', primaryLabel: 'Get the planner', primaryUrl: '#b-e15_pricing', secondaryLabel: 'Free sample', secondaryUrl: '#b-e15_sample', meta: 'From ₦7,500' }, { width: 'wide', spacing: 'loose' }),
  bl('e15_inside', 'featureGrid', { title: 'What’s inside', intro: '', columns: 4, items: [
    { id: 'e15_i1', title: 'Monthly budget', text: 'Works with salary, freelance or both.', imageUrl: '', imageAlt: '', label: 'Sheets + PDF', url: '' },
    { id: 'e15_i2', title: 'Ajo tracker', text: 'Who paid, who’s next, what you’re owed.', imageUrl: '', imageAlt: '', label: 'Sheets', url: '' },
    { id: 'e15_i3', title: 'Rent countdown', text: 'Save monthly for a yearly rent.', imageUrl: '', imageAlt: '', label: 'Sheets', url: '' },
    { id: 'e15_i4', title: '30-page guide', text: 'How to use it, with worked examples.', imageUrl: '', imageAlt: '', label: 'PDF', url: '' }]
  }, { width: 'wide', spacing: 'loose' }),
  bl('e15_prev_img', 'image', { url: img.digital, alt: 'Budget planner template on a tablet', caption: '', aspect: '4:5' }, { width: 'wide', pair: 'wide-first', background: 'tint', spacing: 'loose' }),
  bl('e15_prev_text', 'text', { body: 'Made for you if…\n\nYour income changes month to month, you save in ajo or esusu, or you’re tired of budget apps that assume a fixed salary in dollars.' }, { background: 'tint', spacing: 'loose' }),
  bl('e15_pricing', 'pricing', { title: 'Choose your bundle', packages: [
    { id: 'e15_k1', name: 'Planner', priceNgn: 7500, unit: 'one-off', description: 'The core budget planner.', features: 'Monthly budget\nGuide (PDF)', ctaLabel: 'Buy', url: 'https://nairaplanner.example/buy/planner', highlighted: false },
    { id: 'e15_k2', name: 'Complete', priceNgn: 12000, unit: 'one-off', description: 'Everything in the planner, plus all trackers.', features: 'Monthly budget\nAjo tracker\nRent countdown\nGuide (PDF)', ctaLabel: 'Buy', url: 'https://nairaplanner.example/buy/complete', highlighted: true },
    { id: 'e15_k3', name: 'Couples', priceNgn: 18000, unit: 'one-off', description: 'Complete, set up for two incomes.', features: 'Everything in Complete\nShared goals sheet', ctaLabel: 'Buy', url: 'https://nairaplanner.example/buy/couples', highlighted: false }]
  }, { width: 'wide', spacing: 'loose' }),
  bl('e15_sample', 'download', { title: 'Free sample: one-month budget', description: 'Try one sheet before you buy.', fileName: 'naira-planner-sample.pdf', fileSize: '1.2 MB', format: 'PDF', access: 'free', priceNgn: null, url: 'https://nairaplanner.example/sample.pdf', ctaLabel: 'Download sample', coverUrl: '', coverAlt: '' }, { spacing: 'loose' }),
  bl('e15_faq', 'faq', { title: 'Delivery and refunds', items: faq('e15', [['How do I get it?', 'A download link arrives by email straight after payment.'], ['Does it work on my phone?', 'Yes, in Google Sheets on any phone or computer.'], ['Can I get a refund?', 'If a file doesn’t open, we’ll fix it or refund you within 7 days.']]) }, { spacing: 'loose' })]
  )
};

// 16 — Coach & Consultant
export const eliteCoach: ExamplePage = {
  id: 'elite-coach',
  category: 'Coach',
  name: 'Coach & Consultant',
  city: 'Lagos',
  bestFor: 'Business coaches, mentors, trainers and advisors',
  description: 'Who it’s for and what changes: a split hero, the problems you solve, programmes with clear pricing, your approach, one attributed quote and a discovery-call booking.',
  goals: ['book'],
  styles: ['light'],
  plan: 'pro',
  elite: {
    number: 16,
    useCase: 'services',
    goal: 'bookings',
    priceNgn: 6000,
    structure: 'Split hero · problems grid · programmes pricing · approach steps · quote · booking',
    inside: ['Split hero naming who you help', 'Problems you solve', 'Programmes with prices', 'Your approach in four steps', 'One attributed quote', 'Free discovery call'],
    goodToKnow: ['The quote is a sample and is removed when you use the template.', 'No outcome promises — describe what you do, not guaranteed results.']
  },
  doc: {
    ...doc('funmiadvises', 'Funmi Adebayo', 'Business coach for founders of growing Nigerian SMEs.', {
      presetId: 'custom',
      background: '#F5F3EE',
      surface: '#FFFFFF',
      text: '#1D1F1C',
      mutedText: '#5A5D57',
      accent: '#1F4F45',
      accentText: '#FFFFFF',
      fontPair: 'modern',
      buttonShape: 'rounded',
      buttonStyle: 'solid'
    }, [
    bl('e16_hero', 'hero', { variant: 'split', eyebrow: 'Business coach · Lagos', title: 'For founders whose business has outgrown them', subtitle: 'I help owners of 5–50 person businesses step out of the day-to-day, hire well and make decisions with numbers.', imageUrl: img.coach, imageAlt: 'Funmi in a camel blazer in a bright office', focal: 'top', primaryLabel: 'Book a free call', primaryUrl: '#b-e16_book', secondaryLabel: 'See programmes', secondaryUrl: '#b-e16_pricing', meta: '' }, { width: 'wide', spacing: 'loose' }),
    bl('e16_problems', 'featureGrid', { title: 'Sound familiar?', intro: '', columns: 3, items: [
      { id: 'e16_x1', title: 'Everything goes through you', text: 'You can’t take a week off without the business slowing down.', imageUrl: '', imageAlt: '', label: '', url: '' },
      { id: 'e16_x2', title: 'Hiring feels like a gamble', text: 'Good people leave, and you’re not sure why.', imageUrl: '', imageAlt: '', label: '', url: '' },
      { id: 'e16_x3', title: 'Busy but not profitable', text: 'Sales are up, but there’s never cash at month end.', imageUrl: '', imageAlt: '', label: '', url: '' }]
    }, { width: 'wide', spacing: 'loose' }),
    bl('e16_pricing', 'pricing', { title: 'Programmes', packages: [
      { id: 'e16_k1', name: 'Strategy session', priceNgn: 75000, unit: 'per session', description: 'Two hours on one problem, with a written action plan.', features: '2-hour session\nWritten plan within 48 hours', ctaLabel: 'Book', url: '#b-e16_book', highlighted: false },
      { id: 'e16_k2', name: 'Founder programme', priceNgn: 650000, unit: '3 months', description: 'Fortnightly coaching and WhatsApp support.', features: '6 sessions\nWhatsApp support\nTeam and finance reviews', ctaLabel: 'Apply', url: '#b-e16_book', highlighted: true }]
    }, { width: 'wide', background: 'tint', spacing: 'loose' }),
    bl('e16_steps', 'steps', { title: 'How I work', intro: '', items: [
      { id: 'e16_p1', title: 'Listen', text: 'A free call to understand your business and goals.' },
      { id: 'e16_p2', title: 'Diagnose', text: 'Numbers, team and processes, reviewed together.' },
      { id: 'e16_p3', title: 'Plan', text: 'Three priorities for the next 90 days.' },
      { id: 'e16_p4', title: 'Follow through', text: 'Regular sessions to keep you accountable.' }]
    }, { spacing: 'loose' }),
    bl('e16_quote', 'testimonial', { quote: 'Funmi helped me hire my first manager. I took my first real holiday in four years.', name: 'Bisi Okafor', role: 'Founder, a Lagos catering company (sample)', source: 'Sample quote', avatarUrl: '', avatarAlt: '', permission: true }, { spacing: 'loose' }),
    bl('e16_book', 'booking', { title: 'Book a free discovery call', description: '30 minutes on video to see whether coaching is right for you.', duration: '30 min · video', priceNote: 'Free', ctaLabel: 'Choose a time', url: 'https://funmiadvises.example/book' }, { background: 'invert', spacing: 'loose' })]
    ),
    layout: { actionBar: { enabled: true, label: 'Book a free call', blockId: 'e16_book', url: '' } }
  }
};

// 17 — Service Booking Hub
export const eliteBookingHub: ExamplePage = {
  id: 'elite-booking-hub',
  category: 'Clinic',
  name: 'Service Booking Hub',
  city: 'Abuja',
  bestFor: 'Clinics, studios and providers whose main goal is bookings',
  description: 'Calm and dependable: a plain masthead, services listed with duration and price, how a visit works, location and hours, what to bring, and a sticky Book bar.',
  goals: ['book'],
  styles: ['light'],
  plan: 'pro',
  elite: {
    number: 17,
    useCase: 'services',
    goal: 'bookings',
    priceNgn: 5667,
    structure: 'Masthead · bookable services · visit steps · location · FAQ · sticky Book bar',
    inside: ['Short masthead with the main action', 'Services, each with duration and price', 'What happens at your visit', 'Location and opening hours', 'What to bring and cancellation FAQ'],
    goodToKnow: ['Services and prices are samples. Connect Bookings to let visitors pick a time on the page.']
  },
  doc: {
    ...doc('restorephysio', 'Restore Physio', 'Physiotherapy clinic in Wuse 2, Abuja. Book online in a minute.', {
      presetId: 'custom',
      background: '#F4F7F8',
      surface: '#FFFFFF',
      text: '#14232B',
      mutedText: '#4E5F68',
      accent: '#1D6A8A',
      accentText: '#FFFFFF',
      fontPair: 'modern',
      buttonShape: 'rounded',
      buttonStyle: 'solid'
    }, [
    bl('e17_mast', 'hero', { variant: 'masthead', eyebrow: 'Physiotherapy · Wuse 2, Abuja', title: 'Restore Physio', subtitle: 'Back, neck, sports and post-surgery care. Book a time that suits you — most appointments are available within the week.', imageUrl: '', imageAlt: '', focal: 'center', primaryLabel: 'Book an appointment', primaryUrl: '#b-e17_b1', secondaryLabel: 'Call the clinic', secondaryUrl: 'tel:+2348000000003', meta: '' }, { spacing: 'loose' }),
    bl('e17_b1', 'booking', { title: 'First assessment', description: 'A full assessment and your first treatment.', duration: '60 min', priceNote: '₦25,000', ctaLabel: 'Book', url: 'https://restorephysio.example/book/assessment' }, { spacing: 'tight' }),
    bl('e17_b2', 'booking', { title: 'Follow-up treatment', description: 'For existing patients.', duration: '45 min', priceNote: '₦18,000', ctaLabel: 'Book', url: 'https://restorephysio.example/book/follow-up' }, { spacing: 'tight' }),
    bl('e17_b3', 'booking', { title: 'Sports massage', description: 'Recovery and mobility.', duration: '45 min', priceNote: '₦20,000', ctaLabel: 'Book', url: 'https://restorephysio.example/book/sports' }, { spacing: 'tight' }),
    bl('e17_steps', 'steps', { title: 'Your first visit', intro: '', items: [
      { id: 'e17_p1', title: 'Book online', text: 'Pick a time. You’ll get a confirmation straight away.' },
      { id: 'e17_p2', title: 'Assessment', text: 'We ask about your history and check how you move.' },
      { id: 'e17_p3', title: 'Your plan', text: 'Treatment, exercises and how many visits you’re likely to need.' }]
    }, { background: 'tint', width: 'wide', spacing: 'loose' }),
    bl('e17_location', 'location', { name: 'Restore Physio', address: 'Plot 12, Aminu Kano Crescent, Wuse 2, Abuja', timeZone: 'Africa/Lagos', hours: hours('08:00', '18:00', [0], { 6: ['09:00', '14:00'] }), note: 'Parking available behind the building.' }, { spacing: 'loose' }),
    bl('e17_faq', 'faq', { title: 'Before you come', items: faq('e17', [['What should I bring?', 'Comfortable clothes and any scans or doctor’s letters.'], ['Can I cancel?', 'Yes, free up to 24 hours before your appointment.'], ['Do you take HMO?', 'Ask us — it depends on your plan.']]) }, { spacing: 'loose' })]
    ),
    layout: { contentWidth: 'standard', actionBar: { enabled: true, label: 'Book an appointment', blockId: 'e17_b1', url: '' } }
  }
};

export const eliteCommerce: ExamplePage[] = [eliteBeauty, eliteFood, eliteBoutique, eliteDigital, eliteCoach, eliteBookingHub];