import { bl, doc, type ExamplePage } from '../build';
import { daysFromNow } from '../../../utils/eventTime';

/* Elite Template Library (D154) — events, learning, place and community. Every organisation, listing, figure and link is fictional sample content. */

const img = {
  event: "/33d6c19b-a0fb-4b0e-b4be-4c8b3d2716e4.jpg",
  educator: "/b37e87c7-1283-4ab5-be0a-1fff55226691.jpg",
  property: "/8ce895be-3ba2-4c89-b1f5-5a4c05216332.jpg",
  propertyInterior: "/0d8c9338-b58b-4c2e-94d8-56e8771ce861.jpg",
  travel: "/de8d5e83-a902-4a03-8d22-8ba04e5dc9fc.jpg",
  community: "/821bf07a-27eb-4c98-bffd-567645d5f136.jpg",
  nonprofit: "/5cbd1e67-d061-4f2e-94ba-8971ac8f2bb9.jpg"
};

const faq = (prefix: string, items: [string, string][]) => items.map(([question, answer], i) => ({ id: `${prefix}_q${i}`, question, answer }));

// 18 — Event & Ticket Experience
export const eliteEvent: ExamplePage = {
  id: 'elite-event',
  category: 'Event',
  name: 'Event & Ticket Experience',
  city: 'Lagos',
  bestFor: 'Conferences, workshops, launches and live experiences',
  description: 'A poster opening with date and venue, a countdown, tickets, the agenda as steps, speakers, venue and practical FAQ, and a sticky Get tickets bar.',
  goals: ['events'],
  styles: ['dark', 'bold'],
  plan: 'pro',
  elite: {
    number: 18,
    useCase: 'events',
    goal: 'register',
    priceNgn: 6333,
    structure: 'Poster hero · countdown · tickets · agenda steps · speakers grid · FAQ · sticky Tickets bar',
    inside: ['Poster hero with date and venue line', 'Countdown to doors', 'Ticket types with prices', 'Agenda as a timeline', 'Speakers in a 3-column grid', 'Getting there and FAQ'],
    goodToKnow: ['Speakers, times and prices are samples.', 'Selling tickets with seat limits and QR tickets needs Commerce → Events; otherwise the button links out.']
  },
  doc: {
    ...doc('buildlagos', 'Build Lagos 2026', 'A one-day conference for people designing and building products in Africa.', {
      presetId: 'custom',
      background: '#0E0F14',
      surface: '#191B23',
      text: '#F3F4F7',
      mutedText: '#A5A9B6',
      accent: '#FF7A45',
      accentText: '#140A05',
      fontPair: 'statement',
      buttonShape: 'rounded',
      buttonStyle: 'solid'
    }, [
    bl('e18_poster', 'hero', { variant: 'poster', eyebrow: 'One day · 600 seats', title: 'Build Lagos 2026', subtitle: 'Talks and workshops for people designing and building products in Africa.', imageUrl: img.event, imageAlt: 'A speaker on stage under amber lights in front of an audience', focal: 'center', primaryLabel: 'Get tickets', primaryUrl: '#b-e18_tickets', secondaryLabel: 'See the agenda', secondaryUrl: '#b-e18_agenda', meta: 'Sat 28 Nov · Landmark Centre, Victoria Island' }, { width: 'wide' }),
    bl('e18_count', 'countdown', { title: 'Doors open in', target: daysFromNow(35, 9), endedMessage: 'Build Lagos is happening now.', linkLabel: 'Get tickets', url: '#b-e18_tickets' }, { spacing: 'loose' }),
    bl('e18_tickets', 'event', { title: 'Build Lagos 2026', startsAt: daysFromNow(35, 9), endsAt: daysFromNow(35, 18), timeZone: 'Africa/Lagos', venue: 'Landmark Centre', address: 'Water Corporation Dr, Victoria Island, Lagos', ticketUrl: 'https://buildlagos.example/tickets', ctaLabel: 'Get tickets', soldOut: false, tiers: [
      { id: 'e18_t1', name: 'Early bird', priceNgn: 25000, note: 'Until 31 Oct', soldOut: true },
      { id: 'e18_t2', name: 'General', priceNgn: 40000, note: 'Talks, lunch and the after-party', soldOut: false },
      { id: 'e18_t3', name: 'Workshop pass', priceNgn: 75000, note: 'General plus one afternoon workshop', soldOut: false }]
    }, { spacing: 'loose' }),
    bl('e18_agenda', 'steps', { title: 'The day', intro: '', items: [
      { id: 'e18_a1', title: '9:00 · Doors and breakfast', text: 'Collect your badge and meet people.' },
      { id: 'e18_a2', title: '10:00 · Morning talks', text: 'Six short talks on building for African markets.' },
      { id: 'e18_a3', title: '13:30 · Workshops', text: 'Hands-on sessions in small groups (workshop pass).' },
      { id: 'e18_a4', title: '17:00 · After-party', text: 'Music, food and drinks on the terrace.' }]
    }, { background: 'tint', width: 'wide', spacing: 'loose' }),
    bl('e18_speakers', 'featureGrid', { title: 'Speakers', intro: 'Sample line-up.', columns: 3, items: [
      { id: 'e18_s1', title: 'Aisha Bello', text: 'Design lead at a payments company.', imageUrl: '', imageAlt: '', label: 'Designing trust', url: '' },
      { id: 'e18_s2', title: 'Tobi Martins', text: 'Engineer and founder.', imageUrl: '', imageAlt: '', label: 'Shipping on bad networks', url: '' },
      { id: 'e18_s3', title: 'Kelechi Uba', text: 'Product manager in logistics.', imageUrl: '', imageAlt: '', label: 'Pricing in naira', url: '' }]
    }, { width: 'wide', spacing: 'loose' }),
    bl('e18_faq', 'faq', { title: 'Getting there', items: faq('e18', [['Is there parking?', 'Limited paid parking on site. We recommend a ride-hailing drop-off at Gate 2.'], ['Can I get a refund?', 'Transfer your ticket to someone else up to 7 days before. Refunds only if the event is cancelled.'], ['Is the venue accessible?', 'Yes — step-free entrance, lift and accessible toilets.']]) }, { spacing: 'loose' })]
    ),
    layout: { actionBar: { enabled: true, label: 'Get tickets', blockId: 'e18_tickets', url: '' } }
  }
};

// 20 — Educator & Course Creator
export const eliteEducator: ExamplePage = {
  id: 'elite-educator',
  category: 'Education',
  name: 'Educator & Course Creator',
  city: 'Ibadan',
  bestFor: 'Tutors, educators and course creators',
  description: 'A learning-first page: a split hero, free resources clearly separated from paid courses, a featured lesson list, how classes work and enrolment.',
  goals: ['audience', 'sell'],
  styles: ['light'],
  plan: 'pro',
  elite: {
    number: 20,
    useCase: 'events',
    goal: 'register',
    priceNgn: 4667,
    structure: 'Split hero · free resources · paid courses pricing · lesson list · steps · enrol form',
    inside: ['Split hero with who you teach', 'Free resources, labelled Free', 'Paid courses with prices', 'Featured lessons', 'How classes work', 'Enrolment enquiry'],
    goodToKnow: ['Courses and prices are samples.', 'Free and paid are kept in separate sections so learners always know which is which.']
  },
  doc: doc('mathswithbola', 'Maths with Bola', 'WAEC and JAMB maths tutoring, online and in small groups in Ibadan.', {
    presetId: 'custom',
    background: '#FAFAF5',
    surface: '#FFFFFF',
    text: '#1A1C22',
    mutedText: '#585C66',
    accent: '#3730A3',
    accentText: '#FFFFFF',
    fontPair: 'modern',
    buttonShape: 'rounded',
    buttonStyle: 'solid'
  }, [
  bl('e20_hero', 'hero', { variant: 'split', eyebrow: 'WAEC · JAMB · Online and in Ibadan', title: 'Maths that finally makes sense', subtitle: 'I help SS2 and SS3 students go from scared of maths to ready for WAEC and JAMB, in small groups of six.', imageUrl: img.educator, imageAlt: 'Bola teaching a small group of students at a table', focal: 'center', primaryLabel: 'Enrol for next term', primaryUrl: '#b-e20_enrol', secondaryLabel: 'Free practice papers', secondaryUrl: '#b-e20_free', meta: '' }, { width: 'wide', spacing: 'loose' }),
  bl('e20_free', 'featureGrid', { title: 'Free resources', intro: 'Free to download — no sign-up needed.', columns: 3, items: [
    { id: 'e20_f1', title: 'WAEC past questions, worked', text: 'Ten years of objective questions with step-by-step answers.', imageUrl: '', imageAlt: '', label: 'Free · PDF', url: 'https://mathswithbola.example/free/waec' },
    { id: 'e20_f2', title: 'Formula sheet', text: 'Every formula you need, on one page.', imageUrl: '', imageAlt: '', label: 'Free · PDF', url: 'https://mathswithbola.example/free/formulas' },
    { id: 'e20_f3', title: 'Weekly live revision', text: 'Saturday mornings on YouTube.', imageUrl: '', imageAlt: '', label: 'Free · Live', url: 'https://youtube.com/@mathswithbola.example' }]
  }, { width: 'wide', spacing: 'loose' }),
  bl('e20_courses', 'pricing', { title: 'Paid courses', packages: [
    { id: 'e20_k1', name: 'WAEC crash course', priceNgn: 35000, unit: '6 weeks', description: 'Twice-weekly online classes before the exam.', features: '12 live classes\nRecorded replays\nMock exam with feedback', ctaLabel: 'Enrol', url: '#b-e20_enrol', highlighted: true },
    { id: 'e20_k2', name: 'Term group class', priceNgn: 60000, unit: 'per term', description: 'Small groups of six in Bodija, Ibadan.', features: 'Weekly 2-hour class\nHomework marking\nTermly report to parents', ctaLabel: 'Enrol', url: '#b-e20_enrol', highlighted: false }]
  }, { background: 'tint', width: 'wide', spacing: 'loose' }),
  bl('e20_lessons', 'mediaList', { title: 'Featured lessons', kind: 'videos', items: [
    { id: 'e20_l1', title: 'Indices in 12 minutes', meta: 'Free lesson', duration: '12:04', imageUrl: img.educator, url: 'https://youtube.com/@mathswithbola.example' },
    { id: 'e20_l2', title: 'Never fear quadratic equations again', meta: 'Free lesson', duration: '18:30', imageUrl: img.educator, url: 'https://youtube.com/@mathswithbola.example' }],
    links: [] }, { spacing: 'loose' }),
  bl('e20_steps', 'steps', { title: 'How classes work', intro: '', items: [
    { id: 'e20_p1', title: 'Placement check', text: 'A short free test so I know where to start.' },
    { id: 'e20_p2', title: 'Small-group classes', text: 'Six students, so everyone gets attention.' },
    { id: 'e20_p3', title: 'Progress reports', text: 'Parents get an update every four weeks.' }]
  }, { width: 'wide', spacing: 'loose' }),
  bl('e20_enrol', 'leadForm', { title: 'Enrol for next term', description: 'Tell me the student’s class and which exam they’re preparing for.', fields: { name: true, email: true, phone: true, message: true }, submitLabel: 'Send enrolment request', consentText: 'Used only to reply about enrolment.' }, { background: 'invert', spacing: 'loose' })]
  )
};

// 21 — Real Estate & Property Showcase
export const eliteRealEstate: ExamplePage = {
  id: 'elite-real-estate',
  category: 'Real estate',
  name: 'Real Estate & Property Showcase',
  city: 'Lagos',
  bestFor: 'Agents, property consultants and small property businesses',
  description: 'Property first: an edge-to-edge home, listings with key facts (labelled as examples), an interior beside the agent’s profile, how buying works, and a viewing request.',
  goals: ['showcase'],
  styles: ['light', 'editorial'],
  plan: 'pro',
  elite: {
    number: 21,
    useCase: 'professionals',
    goal: 'enquiries',
    priceNgn: 8000,
    structure: 'Full-bleed cover · listings · interior + agent pair · process steps · viewing form',
    inside: ['Edge-to-edge property photograph', 'Listings with price, key facts and area', 'Interior photo beside the agent’s profile', 'How buying or renting works', 'Viewing request'],
    goodToKnow: ['Every listing shows “Example listing” until you edit it, so sample homes are never mistaken for real inventory.', 'Prices are samples.']
  },
  doc: {
    ...doc('adaproperties', 'Ada Okonkwo Properties', 'Homes to buy and rent in Lekki and Ikoyi, with a licensed agent who answers.', {
      presetId: 'custom',
      background: '#F7F6F3',
      surface: '#FFFFFF',
      text: '#1A1D1F',
      mutedText: '#5A5F63',
      accent: '#0F3B3A',
      accentText: '#FFFFFF',
      fontPair: 'luxe',
      buttonShape: 'square',
      buttonStyle: 'solid'
    }, [
    bl('e21_cover', 'hero', { variant: 'cover', eyebrow: 'Lekki · Ikoyi · Victoria Island', title: 'Homes worth coming home to', subtitle: 'Verified homes to buy and rent, with an agent who answers the phone.', imageUrl: img.property, imageAlt: 'Modern white two-storey house with palm trees at golden hour', focal: 'center', primaryLabel: 'See listings', primaryUrl: '#b-e21_listings', secondaryLabel: 'Book a viewing', secondaryUrl: '#b-e21_form', meta: '' }, { width: 'full' }),
    bl('e21_listings', 'listings', { title: 'Available now', ctaLabel: 'Ask about this home', items: [
      { id: 'e21_h1', title: '4-bed detached duplex', imageUrl: img.property, imageAlt: 'White duplex with palm trees', price: '₦380m', facts: '4 bed · 5 bath · 450 m²', location: 'Lekki Phase 1', url: '', example: true },
      { id: 'e21_h2', title: '2-bed serviced apartment', imageUrl: img.propertyInterior, imageAlt: 'Bright living room with large windows', price: '₦12m / year', facts: '2 bed · 2 bath · 24h power', location: 'Ikoyi', url: '', example: true },
      { id: 'e21_h3', title: '3-bed terrace', imageUrl: img.property, imageAlt: 'Terrace house exterior', price: '₦210m', facts: '3 bed · 4 bath · BQ', location: 'Osapa London', url: '', example: true }]
    }, { width: 'wide', spacing: 'loose' }),
    bl('e21_interior', 'image', { url: img.propertyInterior, alt: 'Bright living room with a neutral sofa and plants', caption: '', aspect: '4:5' }, { width: 'wide', pair: 'equal', background: 'tint', spacing: 'loose' }),
    bl('e21_agent', 'text', { body: 'Ada Okonkwo\nLicensed estate agent\n\nTwelve years helping families and expats find homes on the Island. I visit every property myself, check the documents, and tell you what the photos don’t.' }, { background: 'tint', spacing: 'loose' }),
    bl('e21_steps', 'steps', { title: 'How it works', intro: '', items: [
      { id: 'e21_p1', title: 'Tell me what you need', text: 'Area, budget, size and move-in date.' },
      { id: 'e21_p2', title: 'Viewings', text: 'I shortlist homes and arrange viewings together.' },
      { id: 'e21_p3', title: 'Documents checked', text: 'Title and approvals reviewed before you pay anything.' },
      { id: 'e21_p4', title: 'Keys', text: 'Agreement, payment and handover.' }]
    }, { width: 'wide', spacing: 'loose' }),
    bl('e21_form', 'leadForm', { title: 'Book a viewing', description: 'Which home, and when you’re free. I reply the same day.', fields: { name: true, email: true, phone: true, message: true }, submitLabel: 'Request a viewing', consentText: 'Used only to arrange your viewing.' }, { background: 'invert', spacing: 'loose' })]
    ),
    layout: { contentWidth: 'wide' }
  }
};

// 22 — Travel & Experience Curator
export const eliteTravel: ExamplePage = {
  id: 'elite-travel',
  category: 'Travel',
  name: 'Travel & Experience Curator',
  city: 'Calabar',
  bestFor: 'Tour operators, travel creators and experience providers',
  description: 'A sense of place: a full-bleed landscape, curated trips as listings, an itinerary as steps, a destination note beside a photo, a travel guide download and a booking enquiry.',
  goals: ['book'],
  styles: ['light', 'editorial'],
  plan: 'pro',
  elite: {
    number: 22,
    useCase: 'services',
    goal: 'bookings',
    priceNgn: 6000,
    structure: 'Full-bleed cover · trips listings · itinerary steps · place pair · guide download · enquiry',
    inside: ['Edge-to-edge destination photograph', 'Curated trips with facts and price', 'Day-by-day itinerary', 'A note on the place beside a photo', 'Free travel guide', 'Trip enquiry'],
    goodToKnow: ['Trips and prices are samples and show “Example listing” until edited.']
  },
  doc: doc('crossriverwild', 'Cross River Wild', 'Small-group trips to Obudu, Afi and the Calabar coast.', {
    presetId: 'custom',
    background: '#F3F1EA',
    surface: '#FFFFFF',
    text: '#17201A',
    mutedText: '#57605A',
    accent: '#2F5D3A',
    accentText: '#FFFFFF',
    fontPair: 'editorial',
    buttonShape: 'pill',
    buttonStyle: 'solid'
  }, [
  bl('e22_cover', 'hero', { variant: 'cover', eyebrow: 'Small-group trips · Cross River', title: 'Above the clouds at Obudu', subtitle: 'Hikes, waterfalls and the quiet side of Nigeria, in groups of eight or fewer.', imageUrl: img.travel, imageAlt: 'Misty green hills of the Obudu plateau at sunrise with a hiker', focal: 'center', primaryLabel: 'See trips', primaryUrl: '#b-e22_trips', secondaryLabel: 'Plan a private trip', secondaryUrl: '#b-e22_form', meta: '' }, { width: 'full' }),
  bl('e22_trips', 'listings', { title: 'Upcoming trips', ctaLabel: 'Enquire', items: [
    { id: 'e22_x1', title: 'Obudu weekend', imageUrl: img.travel, imageAlt: 'Obudu hills', price: '₦285,000', facts: '3 days · up to 8 people', location: 'Obudu Plateau', url: '', example: true },
    { id: 'e22_x2', title: 'Afi forest & drill ranch', imageUrl: img.travel, imageAlt: 'Forest canopy walkway', price: '₦240,000', facts: '2 days · up to 8 people', location: 'Afi Mountain', url: '', example: true }]
  }, { width: 'wide', spacing: 'loose' }),
  bl('e22_itin', 'steps', { title: 'Obudu weekend, day by day', intro: '', items: [
    { id: 'e22_d1', title: 'Day 1 · Calabar to the plateau', text: 'Morning drive, cable car up, sunset walk.' },
    { id: 'e22_d2', title: 'Day 2 · Waterfall hike', text: 'Guided hike to Grotto falls, lunch by the canopy walk.' },
    { id: 'e22_d3', title: 'Day 3 · Sunrise and home', text: 'Early sunrise viewpoint, return to Calabar by 4pm.' }]
  }, { background: 'tint', width: 'wide', spacing: 'loose' }),
  bl('e22_place_img', 'image', { url: img.travel, alt: 'Winding road through green hills', caption: '', aspect: '4:5' }, { width: 'wide', pair: 'wide-first', spacing: 'loose' }),
  bl('e22_place', 'text', { body: 'Why Cross River\n\nCool mornings at 1,500 metres, forests with drill monkeys and the warmest welcome in the south. Most visitors never get past Calabar — we take you further, with local guides who grew up here.' }, { spacing: 'loose' }),
  bl('e22_guide', 'download', { title: 'Free guide: packing for Obudu', description: 'What to bring, what to wear and what it costs.', fileName: 'obudu-packing-guide.pdf', fileSize: '900 KB', format: 'PDF', access: 'free', priceNgn: null, url: 'https://crossriverwild.example/guide.pdf', ctaLabel: 'Download guide', coverUrl: '', coverAlt: '' }, { spacing: 'loose' }),
  bl('e22_form', 'leadForm', { title: 'Plan your trip', description: 'Dates, group size and what you’d like to do.', fields: { name: true, email: true, phone: true, message: true }, submitLabel: 'Send enquiry', consentText: 'Used only to reply about your trip.' }, { background: 'invert', spacing: 'loose' })]
  )
};

// 23 — Community & Membership Hub
export const eliteCommunity: ExamplePage = {
  id: 'elite-community',
  category: 'Community',
  name: 'Community & Membership Hub',
  city: 'Lagos',
  bestFor: 'Communities, clubs, membership projects and networks',
  description: 'Built for belonging: a split hero with purpose and who it’s for, what members do, membership options, upcoming meetups, member resources and a join form — no invented member counts.',
  goals: ['audience', 'events'],
  styles: ['light', 'bold'],
  plan: 'pro',
  elite: {
    number: 23,
    useCase: 'impact',
    goal: 'register',
    priceNgn: 5000,
    structure: 'Split hero · activities grid · membership pricing · meetup event · resources list · join form',
    inside: ['Split hero with purpose and who it’s for', 'What members do together', 'Membership options', 'Next meetup', 'Member resources', 'Join form'],
    goodToKnow: ['No member counts or testimonials are included — add real ones only.', 'Recurring membership billing needs Commerce → Subscriptions; otherwise buttons link to the join form.']
  },
  doc: doc('shebuildsng', 'SheBuilds NG', 'A community for women building businesses in Nigeria. Meetups, mentoring and honest conversations.', {
    presetId: 'custom',
    background: '#FFF8F3',
    surface: '#FFFFFF',
    text: '#26161A',
    mutedText: '#6C5A5E',
    accent: '#B4235A',
    accentText: '#FFFFFF',
    fontPair: 'grotesk',
    buttonShape: 'pill',
    buttonStyle: 'solid'
  }, [
  bl('e23_hero', 'hero', { variant: 'split', eyebrow: 'Community · Lagos and online', title: 'Build your business with women who get it', subtitle: 'SheBuilds is for women running businesses in Nigeria — from first sale to first hire. Monthly meetups, peer mentoring and a group chat that actually helps.', imageUrl: img.community, imageAlt: 'Women founders laughing together at a meetup', focal: 'center', primaryLabel: 'Join SheBuilds', primaryUrl: '#b-e23_join', secondaryLabel: 'Next meetup', secondaryUrl: '#b-e23_meetup', meta: '' }, { width: 'wide', spacing: 'loose' }),
  bl('e23_do', 'featureGrid', { title: 'What we do together', intro: '', columns: 3, items: [
    { id: 'e23_a1', title: 'Monthly meetups', text: 'An evening of talks and real conversations, in Lagos.', imageUrl: '', imageAlt: '', label: 'First Thursday', url: '' },
    { id: 'e23_a2', title: 'Peer circles', text: 'Six founders, meeting every two weeks to unblock each other.', imageUrl: '', imageAlt: '', label: 'Online', url: '' },
    { id: 'e23_a3', title: 'Office hours', text: 'Book time with volunteer lawyers, accountants and designers.', imageUrl: '', imageAlt: '', label: 'Members', url: '' }]
  }, { width: 'wide', spacing: 'loose' }),
  bl('e23_plans', 'pricing', { title: 'Membership', packages: [
    { id: 'e23_k1', name: 'Community', priceNgn: null, unit: 'free', description: 'The group chat and public meetups.', features: 'Group chat\nPublic meetups', ctaLabel: 'Join free', url: '#b-e23_join', highlighted: false },
    { id: 'e23_k2', name: 'Member', priceNgn: 5000, unit: 'per month', description: 'Everything, including peer circles and office hours.', features: 'Peer circle\nOffice hours\nMember resources\nMeetup discount', ctaLabel: 'Become a member', url: '#b-e23_join', highlighted: true }]
  }, { background: 'tint', width: 'wide', spacing: 'loose' }),
  bl('e23_meetup', 'event', { title: 'November meetup: pricing without fear', startsAt: daysFromNow(12, 18), endsAt: daysFromNow(12, 21), timeZone: 'Africa/Lagos', venue: 'The Workstation', address: 'Ozumba Mbadiwe Ave, Victoria Island, Lagos', ticketUrl: '#b-e23_join', ctaLabel: 'Save my seat', tiers: [], soldOut: false }, { spacing: 'loose' }),
  bl('e23_resources', 'mediaList', { title: 'Member resources', kind: 'chapters', items: [
    { id: 'e23_r1', title: 'Registering with CAC, step by step', meta: 'Guide', duration: '10 min read', imageUrl: '', url: '' },
    { id: 'e23_r2', title: 'Your first employment contract', meta: 'Template', duration: 'DOCX', imageUrl: '', url: '' },
    { id: 'e23_r3', title: 'How to talk to a bank about a loan', meta: 'Recorded talk', duration: '42 min', imageUrl: '', url: '' }],
    links: [] }, { spacing: 'loose' }),
  bl('e23_join', 'leadForm', { title: 'Join SheBuilds', description: 'Tell us a little about your business. We’ll add you to the group within a few days.', fields: { name: true, email: true, phone: true, message: true }, submitLabel: 'Request to join', consentText: 'Used only to welcome you to the community.' }, { background: 'invert', spacing: 'loose' })]
  )
};

// 24 — Nonprofit & Impact Page
export const eliteNonprofit: ExamplePage = {
  id: 'elite-nonprofit',
  category: 'Nonprofit',
  name: 'Nonprofit & Impact Page',
  city: 'Kaduna',
  bestFor: 'Charities, campaigns, social enterprises and community initiatives',
  description: 'Mission first and human-centred: a full-bleed story photo, the mission beside a programme note, programmes, impact figures labelled until confirmed, ways to help and trust details.',
  goals: ['support'],
  styles: ['light', 'editorial'],
  plan: 'pro',
  elite: {
    number: 24,
    useCase: 'impact',
    goal: 'register',
    priceNgn: 4000,
    structure: 'Full-bleed cover · mission pair · programmes grid · figures · ways to help · contact & FAQ',
    inside: ['Edge-to-edge story photograph', 'Mission beside how you work', 'Programmes', 'Impact figures (labelled until confirmed)', 'Ways to help: give, volunteer, partner', 'Registration, contact and FAQ'],
    goodToKnow: ['Figures show “Example figures” until you confirm they’re real.', 'Payments through KUBICU are support payments, not tax-deductible donations, unless you’re registered to issue receipts.', 'Registration number and outcomes are samples — never publish unverified ones.']
  },
  doc: doc('booksforkaduna', 'Books for Kaduna', 'Getting reading books into every public primary school in Kaduna State.', {
    presetId: 'custom',
    background: '#FAF8F3',
    surface: '#FFFFFF',
    text: '#1E1E1A',
    mutedText: '#5E5D55',
    accent: '#1E5A8C',
    accentText: '#FFFFFF',
    fontPair: 'classic',
    buttonShape: 'rounded',
    buttonStyle: 'solid'
  }, [
  bl('e24_cover', 'hero', { variant: 'cover', eyebrow: 'Kaduna State · Since 2019', title: 'Every child deserves a book of their own', subtitle: 'We bring reading books and trained reading volunteers to public primary schools across Kaduna.', imageUrl: img.nonprofit, imageAlt: 'Volunteers handing books to smiling schoolchildren in a schoolyard', focal: 'center', primaryLabel: 'Support a school', primaryUrl: '#b-e24_help', secondaryLabel: 'Volunteer', secondaryUrl: '#b-e24_form', meta: '' }, { width: 'full' }),
  bl('e24_mission_text', 'text', { body: 'Our mission\n\nMost public primary schools we visit have no library and fewer than one reading book per class. We change that one school at a time — books in Hausa and English, a reading corner, and volunteers who read with the children every week.' }, { pair: 'equal', spacing: 'loose', width: 'wide' }),
  bl('e24_mission_img', 'image', { url: img.nonprofit, alt: 'A girl holding a stack of new books', caption: '', aspect: '4:5' }, { spacing: 'loose' }),
  bl('e24_programmes', 'featureGrid', { title: 'Our programmes', intro: '', columns: 3, items: [
    { id: 'e24_p1', title: 'Reading corners', text: 'Shelves, mats and 300 books for each school.', imageUrl: '', imageAlt: '', label: '', url: '' },
    { id: 'e24_p2', title: 'Reading volunteers', text: 'Trained volunteers read with each class weekly.', imageUrl: '', imageAlt: '', label: '', url: '' },
    { id: 'e24_p3', title: 'Teacher training', text: 'A two-day course on teaching children to read.', imageUrl: '', imageAlt: '', label: '', url: '' }]
  }, { background: 'tint', width: 'wide', spacing: 'loose' }),
  bl('e24_figures', 'figures', { title: 'So far', items: [{ id: 'e24_f1', value: '46', label: 'Schools with a reading corner' }, { id: 'e24_f2', value: '13,800', label: 'Books delivered' }, { id: 'e24_f3', value: '210', label: 'Trained volunteers' }], confirmed: false }, { width: 'wide', spacing: 'loose' }),
  bl('e24_help', 'featureGrid', { title: 'Ways to help', intro: '', columns: 3, items: [
    { id: 'e24_h1', title: 'Give', text: '₦150,000 sets up one reading corner. Any amount helps.', imageUrl: '', imageAlt: '', label: 'Support a school', url: 'https://booksforkaduna.example/give' },
    { id: 'e24_h2', title: 'Volunteer', text: 'Two hours a week reading with a class in Kaduna.', imageUrl: '', imageAlt: '', label: 'Sign up below', url: '#b-e24_form' },
    { id: 'e24_h3', title: 'Partner', text: 'Companies can sponsor a local government area.', imageUrl: '', imageAlt: '', label: 'partners@booksforkaduna.example', url: 'mailto:partners@booksforkaduna.example' }]
  }, { width: 'wide', spacing: 'loose' }),
  bl('e24_form', 'leadForm', { title: 'Volunteer with us', description: 'Tell us where you live in Kaduna and when you’re free.', fields: { name: true, email: true, phone: true, message: true }, submitLabel: 'Send', consentText: 'Used only to contact you about volunteering.' }, { background: 'invert', spacing: 'loose' }),
  bl('e24_contact', 'contact', { phone: '+234 800 000 0004', email: 'hello@booksforkaduna.example', address: 'Ahmadu Bello Way, Kaduna', hours: 'Registered charity (sample registration number) · Accounts available on request' }, { spacing: 'loose' }),
  bl('e24_faq', 'faq', { title: 'Questions', items: faq('e24', [['Where does my money go?', 'Books, shelves and volunteer training. We publish a yearly summary of spending.'], ['Can I choose a school?', 'Yes — partners can sponsor a named school or area.']]) }, { spacing: 'loose' })]
  )
};

export const eliteCommunityPages: ExamplePage[] = [eliteEvent, eliteEducator, eliteRealEstate, eliteTravel, eliteCommunity, eliteNonprofit];