import { bl, doc, type ExamplePage } from '../build';

/* Elite Template Library (D154) — professionals & studios. Every person, business, quote and link is fictional sample content. */

const img = {
  freelance: 'https://cdn.magicpatterns.com/patterns/generated-images/f4ec2f5b-04b5-4d04-b647-1ba274791c3b.jpg',
  agencyProject: 'https://cdn.magicpatterns.com/patterns/generated-images/0b49a03e-bbaf-4f42-9868-89c9665a135a.jpg',
  agencyTeam: 'https://cdn.magicpatterns.com/patterns/generated-images/e0ec5441-0799-41d0-8e65-22a6db178b94.jpg',
  designShot: 'https://cdn.magicpatterns.com/patterns/generated-images/57e1b6a7-b6be-425f-ae25-41bda54411cf.jpg',
  designShot2: 'https://cdn.magicpatterns.com/patterns/generated-images/a5e21920-60ec-431a-b909-4ea57702d1b1.jpg',
  photoWedding: 'https://cdn.magicpatterns.com/patterns/generated-images/8e72fafc-8414-4ad4-919a-0ba018fab340.jpg',
  photoPortrait: 'https://cdn.magicpatterns.com/patterns/generated-images/a7803e5d-9dfe-49b0-b4b5-de1abee7dc47.jpg',
  photoLandscape: 'https://cdn.magicpatterns.com/patterns/generated-images/6f8fbad7-d8d7-48dc-b767-54491cf509a7.jpg',
  fashion: 'https://cdn.magicpatterns.com/patterns/generated-images/e1a1abcd-c66b-49f9-ab3a-470496f58c28.jpg',
  author: 'https://cdn.magicpatterns.com/patterns/generated-images/82c73a0a-84fe-4fcd-94b5-c327e4be04a9.jpg',
};

// 04 — Freelance Conversion Studio
export const eliteFreelance: ExamplePage = {
  id: 'elite-freelance',
  category: 'Freelancer',
  name: 'Freelance Conversion Studio',
  city: 'Lagos',
  bestFor: 'Independent designers, developers, writers and consultants',
  description: 'Value proposition first, then services with starting prices, selected work, a four-step process, one attributed quote and a discovery-call enquiry.',
  goals: ['book', 'showcase'],
  styles: ['light'],
  plan: 'pro',
  elite: {
    number: 4,
    useCase: 'professionals',
    goal: 'enquiries',
    priceNgn: 5333,
    structure: 'Split hero · services grid · selected work · process steps · quote · enquiry',
    inside: ['Split hero with value proposition and photo', 'Three services with starting prices', 'Selected work with outcomes', 'How we’ll work, in four steps', 'One attributed client quote', 'Discovery-call enquiry in a tinted section'],
    goodToKnow: ['The client quote is a sample and is removed when you use the template.', 'Prices are samples; set your own or remove them.'],
  },
  doc: {
    ...doc('ngoziworks', 'Ngozi Eze — Product Designer', 'Independent product designer helping African fintech and logistics teams ship clearer apps.', {
      presetId: 'custom',
      background: '#FAFAF7',
      surface: '#FFFFFF',
      text: '#16181D',
      mutedText: '#555B66',
      accent: '#2547D0',
      accentText: '#FFFFFF',
      fontPair: 'modern',
      buttonShape: 'rounded',
      buttonStyle: 'solid',
    }, [
      bl('e4_hero', 'hero', { variant: 'split', eyebrow: 'Independent product designer · Lagos', title: 'Clearer apps for teams that move money and parcels', subtitle: 'I help African fintech and logistics teams turn complicated flows into screens customers understand the first time.', imageUrl: img.freelance, imageAlt: 'Ngozi at her desk with a laptop showing app screens', focal: 'center', primaryLabel: 'Book a discovery call', primaryUrl: '#b-e4_form', secondaryLabel: 'See selected work', secondaryUrl: '#b-e4_work', meta: 'Taking two projects for Q1' }, { width: 'wide', spacing: 'loose' }),
      bl('e4_services', 'featureGrid', { title: 'What I can do for you', intro: 'Fixed-scope engagements, so you know the cost before we start.', columns: 3, items: [
        { id: 'e4_s1', title: 'UX audit', text: 'A screen-by-screen review of one key flow, with a prioritised list of fixes.', imageUrl: '', imageAlt: '', label: 'From ₦450,000 · 2 weeks', url: '' },
        { id: 'e4_s2', title: 'Product design sprint', text: 'Research, flows and tested high-fidelity screens for one feature.', imageUrl: '', imageAlt: '', label: 'From ₦1.8m · 5 weeks', url: '' },
        { id: 'e4_s3', title: 'Design partner', text: 'Two days a week embedded with your team, on a monthly retainer.', imageUrl: '', imageAlt: '', label: 'From ₦1.2m / month', url: '' },
      ] }, { width: 'wide', spacing: 'loose' }),
      bl('e4_work', 'portfolio', { title: 'Selected work', items: [
        { id: 'e4_w1', title: 'Savings app onboarding', client: 'Kudi Save (sample)', role: 'Lead designer', outcome: 'Fewer drop-offs at ID check', summary: 'Rebuilt sign-up around one question per screen and a clearer BVN step.', coverUrl: img.designShot, coverAlt: 'Savings app screens on a phone', url: '' },
        { id: 'e4_w2', title: 'Dispatch dashboard', client: 'Moveit (sample)', role: 'Product designer', outcome: 'Dispatchers handle more riders per shift', summary: 'A map-first dashboard for assigning riders, with keyboard shortcuts.', coverUrl: img.designShot2, coverAlt: 'Logistics dashboard on a laptop', url: '' },
      ] }, { width: 'wide', spacing: 'loose' }),
      bl('e4_steps', 'steps', { title: 'How we’ll work', intro: '', items: [
        { id: 'e4_p1', title: 'Discovery call', text: '30 minutes to understand the problem and whether I’m the right fit.' },
        { id: 'e4_p2', title: 'Proposal', text: 'A fixed scope, price and timeline within three working days.' },
        { id: 'e4_p3', title: 'Design', text: 'Weekly check-ins with working prototypes, not slide decks.' },
        { id: 'e4_p4', title: 'Handover', text: 'Organised files, a component guide and a call with your developers.' },
      ] }, { spacing: 'loose' }),
      bl('e4_quote', 'testimonial', { quote: 'Ngozi found the three screens where we were losing people, and fixed them in a fortnight.', name: 'Femi Adeyemi', role: 'Head of Product, Kudi Save (sample)', source: 'Sample quote', avatarUrl: '', avatarAlt: '', permission: true }, { spacing: 'loose' }),
      bl('e4_form', 'leadForm', { title: 'Book a discovery call', description: 'Tell me about your product and what’s not working. I reply within two working days.', fields: { name: true, email: true, phone: false, message: true }, submitLabel: 'Request a call', consentText: 'Used only to reply to your enquiry.' }, { background: 'tint', spacing: 'loose' }),
    ]),
    layout: { contentWidth: 'standard', actionBar: { enabled: true, label: 'Book a call', blockId: 'e4_form', url: '' } },
  },
};

// 05 — Creative Agency
export const eliteAgency: ExamplePage = {
  id: 'elite-agency',
  category: 'Agency',
  name: 'Creative Agency',
  city: 'Lagos',
  bestFor: 'Small agencies, creative studios and multidisciplinary teams',
  description: 'A compact agency site: an inverted masthead, edge-to-edge project image, work list, disciplines, team beside the studio story, and a project brief form.',
  goals: ['showcase'],
  styles: ['dark', 'editorial'],
  plan: 'pro',
  elite: {
    number: 5,
    useCase: 'professionals',
    goal: 'enquiries',
    priceNgn: 8000,
    structure: 'Masthead · full-bleed project · case studies · disciplines · team pair · brief form',
    inside: ['Studio masthead with positioning line', 'Edge-to-edge featured project', 'Case studies with client and role', 'Disciplines in a 4-column grid', 'Team photo beside the studio story', 'Clients strip (needs permission)', 'Project brief form'],
    goodToKnow: ['Client names are samples; the strip stays hidden until you confirm permission.', 'Wide width is set in Page settings — the layout is designed for it.'],
  },
  doc: {
    ...doc('studioosun', 'Studio Ọ̀ṣun', 'Brand identity and packaging studio for African consumer brands.', {
      presetId: 'custom',
      background: '#121110',
      surface: '#1C1A18',
      text: '#F1ECE4',
      mutedText: '#A89F93',
      accent: '#E2643B',
      accentText: '#121110',
      fontPair: 'grotesk',
      buttonShape: 'square',
      buttonStyle: 'solid',
    }, [
      bl('e5_mast', 'hero', { variant: 'masthead', eyebrow: 'Brand identity · Packaging · Campaigns', title: 'Studio Ọ̀ṣun', subtitle: 'We build brands for African consumer companies that want to be remembered on the shelf and on the phone.', imageUrl: '', imageAlt: '', focal: 'center', primaryLabel: 'Start a project', primaryUrl: '#b-e5_brief', secondaryLabel: 'Our work', secondaryUrl: '#b-e5_work', meta: 'Lagos · Working worldwide' }, { width: 'wide', spacing: 'loose' }),
      bl('e5_feature', 'image', { url: img.agencyProject, alt: 'Terracotta and cream packaging, cards and tote bag for a skincare brand', caption: 'Ìrẹ̀ Skincare — identity and packaging (sample project)', aspect: '16:9' }, { width: 'full' }),
      bl('e5_work', 'portfolio', { title: 'Selected projects', items: [
        { id: 'e5_w1', title: 'Ìrẹ̀ Skincare', client: 'Sample client', role: 'Identity, packaging', outcome: 'Launched in 40 stores', summary: 'A warm, earthy system built around a single hand-drawn mark.', coverUrl: img.agencyProject, coverAlt: 'Skincare packaging', url: '' },
        { id: 'e5_w2', title: 'Ama Coffee', client: 'Sample client', role: 'Naming, identity, retail', outcome: 'Three cafés in Accra', summary: 'A name and visual language rooted in Ghanaian market signage.', coverUrl: img.agencyTeam, coverAlt: 'Designers reviewing layouts on a wall', url: '' },
      ] }, { width: 'wide', spacing: 'loose' }),
      bl('e5_disciplines', 'featureGrid', { title: 'What we do', intro: '', columns: 4, items: [
        { id: 'e5_d1', title: 'Strategy', text: 'Positioning, naming and brand architecture.', imageUrl: '', imageAlt: '', label: '', url: '' },
        { id: 'e5_d2', title: 'Identity', text: 'Logos, type, colour and the rules that hold them together.', imageUrl: '', imageAlt: '', label: '', url: '' },
        { id: 'e5_d3', title: 'Packaging', text: 'Structures and print that survive real shelves and real heat.', imageUrl: '', imageAlt: '', label: '', url: '' },
        { id: 'e5_d4', title: 'Campaigns', text: 'Launch films, social systems and outdoor.', imageUrl: '', imageAlt: '', label: '', url: '' },
      ] }, { width: 'wide', background: 'tint', spacing: 'loose' }),
      bl('e5_team', 'image', { url: img.agencyTeam, alt: 'Three studio designers reviewing printed layouts', caption: '', aspect: '4:5' }, { width: 'wide', pair: 'narrow-first', spacing: 'loose' }),
      bl('e5_story', 'text', { body: 'Seven designers, one studio in Yaba\n\nWe started in 2019 making labels for friends’ businesses. Today we work with founders across West Africa — small enough that the people you meet are the people doing the work.' }, { spacing: 'loose' }),
      bl('e5_clients', 'logoStrip', { title: 'Clients', items: [{ id: 'e5_c1', name: 'Ìrẹ̀ Skincare', logoUrl: '' }, { id: 'e5_c2', name: 'Ama Coffee', logoUrl: '' }, { id: 'e5_c3', name: 'Kola Foods', logoUrl: '' }, { id: 'e5_c4', name: 'Bluefin Pay', logoUrl: '' }], permission: true }, { width: 'wide' }),
      bl('e5_brief', 'leadForm', { title: 'Tell us about your project', description: 'What you’re making, when you need it and a rough budget. We reply within a week.', fields: { name: true, email: true, phone: true, message: true }, submitLabel: 'Send brief', consentText: 'Used only to reply to your brief.' }, { background: 'invert', spacing: 'loose' }),
    ]),
    layout: { contentWidth: 'wide' },
  },
};

// 06 — Design Portfolio
export const eliteDesignPortfolio: ExamplePage = {
  id: 'elite-design-portfolio',
  category: 'Designer',
  name: 'Design Portfolio',
  city: 'Abuja',
  bestFor: 'UI/UX, product and visual designers',
  description: 'Image-led: alternating large project rows (image beside text, swapping sides), a short role line, expertise and a calm contact section.',
  goals: ['showcase'],
  styles: ['light', 'editorial'],
  plan: 'creator',
  elite: {
    number: 6,
    useCase: 'professionals',
    goal: 'enquiries',
    priceNgn: 4333,
    structure: 'Masthead · alternating project rows · expertise · contact',
    inside: ['Name and role as a short masthead', 'Project rows that alternate image and text', 'Expertise in three columns', 'Contact details and a short form'],
    goodToKnow: ['Projects are samples. Each row is an image paired with text — swap the order per row in Layout.'],
  },
  doc: {
    ...doc('seunbakare', 'Seun Bakare', 'Product designer. Fintech, health and public services.', {
      presetId: 'custom',
      background: '#F3F4F1',
      surface: '#FFFFFF',
      text: '#191A17',
      mutedText: '#5A5D55',
      accent: '#3F6B4E',
      accentText: '#FFFFFF',
      fontPair: 'editorial',
      buttonShape: 'pill',
      buttonStyle: 'outline',
    }, [
      bl('e6_mast', 'hero', { variant: 'masthead', eyebrow: 'Product designer · Abuja', title: 'Seun Bakare', subtitle: 'I design calm, useful software for money, health and public services — currently open to senior roles and select freelance work.', imageUrl: '', imageAlt: '', focal: 'center', primaryLabel: 'Get in touch', primaryUrl: '#b-e6_form', secondaryLabel: 'Download CV', secondaryUrl: 'https://seunbakare.example/cv.pdf', meta: '' }, { width: 'wide', spacing: 'loose' }),
      bl('e6_p1_img', 'image', { url: img.designShot, alt: 'Savings app screens on a phone against sage green', caption: '', aspect: '4:5' }, { width: 'wide', pair: 'wide-first', spacing: 'loose' }),
      bl('e6_p1_text', 'text', { body: 'Kudi Save · 2025\n\nMaking saving feel safe\nA ground-up redesign of a savings app for first-time savers: plain-language goals, visible interest and a sign-up that never asks for more than one thing at a time.\n\nRole: Lead product designer' }, { spacing: 'loose' }),
      bl('e6_p2_img', 'image', { url: img.designShot2, alt: 'Logistics dashboard on a laptop', caption: '', aspect: '4:5' }, { width: 'wide', pair: 'wide-first', phoneSecond: false, spacing: 'loose' }),
      bl('e6_p2_text', 'text', { body: 'Moveit · 2024\n\nOne screen for a hundred riders\nA dispatch dashboard designed with dispatchers on the night shift: map first, keyboard friendly, readable at 2 a.m.\n\nRole: Product designer' }, { spacing: 'loose' }),
      bl('e6_skills', 'featureGrid', { title: 'Expertise', intro: '', columns: 3, items: [
        { id: 'e6_k1', title: 'Research', text: 'Interviews, usability testing and field visits.', imageUrl: '', imageAlt: '', label: '', url: '' },
        { id: 'e6_k2', title: 'Interaction design', text: 'Flows, prototypes and design systems.', imageUrl: '', imageAlt: '', label: '', url: '' },
        { id: 'e6_k3', title: 'Accessibility', text: 'Designing for low-end phones and every reader.', imageUrl: '', imageAlt: '', label: '', url: '' },
      ] }, { width: 'wide', background: 'tint', spacing: 'loose' }),
      bl('e6_form', 'leadForm', { title: 'Say hello', description: 'Roles, projects or just a question about my work.', fields: { name: true, email: true, phone: false, message: true }, submitLabel: 'Send message', consentText: 'Used only to reply to you.' }, { spacing: 'loose' }),
    ]),
    layout: { contentWidth: 'standard' },
  },
};

// 07 — Photographer's Gallery
export const elitePhotographer: ExamplePage = {
  id: 'elite-photographer',
  category: 'Photographer',
  name: 'Photographer’s Gallery',
  city: 'Lagos',
  bestFor: 'Wedding, portrait, commercial and fine-art photographers',
  description: 'Photographs lead with almost no chrome: an edge-to-edge cover, a quiet name line, a large gallery, categories with starting prices and a booking enquiry.',
  goals: ['showcase', 'book'],
  styles: ['light', 'editorial'],
  plan: 'pro',
  elite: {
    number: 7,
    useCase: 'professionals',
    goal: 'bookings',
    priceNgn: 6000,
    structure: 'Full-bleed cover · gallery · wide landscape · categories · booking enquiry',
    inside: ['Edge-to-edge cover photograph', 'A gallery with deliberate ratios', 'One wide landscape as a pause', 'Weddings, portraits and commercial with starting prices', 'Booking enquiry'],
    goodToKnow: ['Photographs are samples — replace them with your own work.', 'Starting prices are samples.'],
  },
  doc: {
    ...doc('adeolalens', 'Adéọlá Lens', 'Wedding and portrait photographer in Lagos. Calm, natural, timeless.', {
      presetId: 'custom',
      background: '#FBF9F6',
      surface: '#FFFFFF',
      text: '#1F1C19',
      mutedText: '#6A635B',
      accent: '#1F1C19',
      accentText: '#FBF9F6',
      fontPair: 'luxe',
      buttonShape: 'square',
      buttonStyle: 'outline',
    }, [
      bl('e7_cover', 'hero', { variant: 'cover', eyebrow: 'Weddings · Portraits', title: 'Adéọlá Lens', subtitle: 'Calm, natural photographs of the days you’ll want to remember.', imageUrl: img.photoWedding, imageAlt: 'Bride in gele and groom in agbada walking through a garden at golden hour', focal: 'center', primaryLabel: 'Check my dates', primaryUrl: '#b-e7_form', secondaryLabel: '', secondaryUrl: '', meta: '' }, { width: 'full' }),
      bl('e7_gallery', 'gallery', { title: 'Recent work', layout: 'grid', images: [
        { id: 'e7_g1', url: img.photoWedding, alt: 'Couple laughing in a garden' },
        { id: 'e7_g2', url: img.photoPortrait, alt: 'Studio portrait of a man in a green kaftan' },
        { id: 'e7_g3', url: img.fashion, alt: 'Woman in an ankara blazer against a sand wall' },
        { id: 'e7_g4', url: img.author, alt: 'Man reading in a book-lined study' },
      ] }, { width: 'wide', spacing: 'loose' }),
      bl('e7_pause', 'image', { url: img.photoLandscape, alt: 'Fishing boats on the Lagos lagoon at dawn', caption: 'Personal work — Makoko at dawn', aspect: '16:9' }, { width: 'full', spacing: 'loose' }),
      bl('e7_cats', 'featureGrid', { title: 'Sessions', intro: '', columns: 3, items: [
        { id: 'e7_c1', title: 'Weddings', text: 'Full-day coverage, an online gallery and a printed album.', imageUrl: '', imageAlt: '', label: 'From ₦850,000', url: '' },
        { id: 'e7_c2', title: 'Portraits', text: 'One hour in studio or on location, 20 edited images.', imageUrl: '', imageAlt: '', label: 'From ₦120,000', url: '' },
        { id: 'e7_c3', title: 'Commercial', text: 'Products, teams and spaces for brands.', imageUrl: '', imageAlt: '', label: 'Quoted per brief', url: '' },
      ] }, { width: 'wide', spacing: 'loose' }),
      bl('e7_form', 'leadForm', { title: 'Check my dates', description: 'Share your date, venue and what you have in mind. I reply within two days.', fields: { name: true, email: true, phone: true, message: true }, submitLabel: 'Send enquiry', consentText: 'Used only to reply to your enquiry.' }, { background: 'tint', spacing: 'loose' }),
    ]),
    layout: { contentWidth: 'wide', actionBar: { enabled: true, label: 'Check my dates', blockId: 'e7_form', url: '' } },
  },
};

// 11 — Fashion & Style Editorial
export const eliteFashion: ExamplePage = {
  id: 'elite-fashion',
  category: 'Fashion',
  name: 'Fashion & Style Editorial',
  city: 'Lagos',
  bestFor: 'Stylists, models and fashion creators',
  description: 'Asymmetric and editorial: a poster opening, a tall look beside a short manifesto, curated picks, a lookbook and brand-collaboration enquiries.',
  goals: ['showcase', 'audience'],
  styles: ['editorial', 'bold'],
  plan: 'creator',
  elite: {
    number: 11,
    useCase: 'creators',
    goal: 'enquiries',
    priceNgn: 4667,
    structure: 'Poster hero · asymmetric look + manifesto · picks grid · lookbook · collab form',
    inside: ['Poster-style opening', 'Tall look beside a short manifesto (3:2)', 'Curated picks in a 4-column grid', 'Lookbook gallery', 'Socials', 'Brand collaboration enquiry'],
    goodToKnow: ['Picks link to sample shops — replace with your own.', 'Affiliate links should be labelled as such.'],
  },
  doc: doc('zaraokon', 'Zara Okon', 'Stylist and fashion creator. Lagos tailoring, worn every day.', {
    presetId: 'custom',
    background: '#EFE8DD',
    surface: '#F7F2EA',
    text: '#1A1612',
    mutedText: '#665C50',
    accent: '#7A1F2B',
    accentText: '#FFFFFF',
    fontPair: 'editorial',
    buttonShape: 'square',
    buttonStyle: 'solid',
  }, [
    bl('e11_poster', 'hero', { variant: 'poster', eyebrow: 'Autumn edit', title: 'Tailored, not precious', subtitle: 'Lagos tailoring, worn every day.', imageUrl: img.fashion, imageAlt: 'Model in a structured ankara blazer against a sand wall', focal: 'top', primaryLabel: 'Shop my picks', primaryUrl: '#b-e11_picks', secondaryLabel: 'Work with me', secondaryUrl: '#b-e11_form', meta: 'Zara Okon · Stylist' }, { width: 'wide' }),
    bl('e11_look', 'image', { url: img.fashion, alt: 'Full-length look: ankara blazer and wide trousers', caption: 'Look 04 — blazer by a Surulere tailor', aspect: '4:5' }, { width: 'wide', pair: 'wide-first', spacing: 'loose' }),
    bl('e11_manifesto', 'text', { body: 'I believe the best wardrobe is built with the tailor down the road.\n\nEvery week I style one Lagos-made piece three ways — for work, the weekend and an owambe — so you buy less and wear it more.' }, { spacing: 'loose' }),
    bl('e11_picks', 'featureGrid', { title: 'This week’s picks', intro: 'Some links may earn me a small commission.', columns: 4, items: [
      { id: 'e11_k1', title: 'Wide-leg trousers', text: 'Adire indigo, made to measure.', imageUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/3cf32009-10eb-405b-af35-32395a7942fc.jpg', imageAlt: 'Indigo adire wide-leg trousers on a hanger', label: 'Sample shop', url: 'https://zaraokon.example/p1' },
      { id: 'e11_k2', title: 'Woven tote', text: 'Raffia, Oyo-made.', imageUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/08d7b751-c878-472e-9107-7258feb7ebb6.jpg', imageAlt: 'Woven raffia tote with leather handles', label: 'Sample shop', url: 'https://zaraokon.example/p2' },
      { id: 'e11_k3', title: 'Leather mules', text: 'Aba leather, three colours.', imageUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/72627bb6-2c3b-4f8a-9e63-fd2c538311d2.jpg', imageAlt: 'Tan leather mules on a terracotta block', label: 'Sample shop', url: 'https://zaraokon.example/p3' },
      { id: 'e11_k4', title: 'Gold hoops', text: 'Small, everyday.', imageUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/a17b4ca9-f0e4-4af2-8068-8fa501d90abb.jpg', imageAlt: 'Small gold hoop earrings on cream linen', label: 'Sample shop', url: 'https://zaraokon.example/p4' },
    ] }, { width: 'wide', background: 'tint', spacing: 'loose' }),
    bl('e11_lookbook', 'gallery', { title: 'Lookbook', layout: 'carousel', images: [
      { id: 'e11_g1', url: img.fashion, alt: 'Ankara blazer look' },
      { id: 'e11_g2', url: img.photoPortrait, alt: 'Green kaftan portrait' },
      { id: 'e11_g3', url: img.photoWedding, alt: 'Owambe look in ivory and coral' },
    ] }, { width: 'wide', spacing: 'loose' }),
    bl('e11_social', 'social', { items: [{ id: 'e11_s1', platform: 'instagram', url: 'https://instagram.com/zaraokon.example' }, { id: 'e11_s2', platform: 'tiktok', url: 'https://tiktok.com/@zaraokon.example' }] }, {}, { align: 'center' }),
    bl('e11_form', 'leadForm', { title: 'Brand collaborations', description: 'Styling, lookbooks and campaigns with Lagos-made brands.', fields: { name: true, email: true, phone: false, message: true }, submitLabel: 'Send', consentText: 'Used only to reply to you.' }, { background: 'invert', spacing: 'loose' }),
  ]),
};

// 19 — Author & Knowledge Expert
export const eliteAuthor: ExamplePage = {
  id: 'elite-author',
  category: 'Author',
  name: 'Author & Knowledge Expert',
  city: 'Ibadan',
  bestFor: 'Authors, speakers, researchers and experts',
  description: 'Typographic and calm: a portrait beside a strong bio, the latest book, selected writing, speaking topics, newsletter and a speaking enquiry.',
  goals: ['audience', 'showcase'],
  styles: ['editorial', 'light'],
  plan: 'creator',
  elite: {
    number: 19,
    useCase: 'professionals',
    goal: 'audience',
    priceNgn: 3667,
    structure: 'Split hero · featured book · writing list · speaking topics · newsletter · enquiry',
    inside: ['Portrait beside name and bio', 'Latest book with where to buy', 'Selected essays and talks', 'Speaking topics', 'Newsletter', 'Speaking and press enquiry'],
    goodToKnow: ['Book and essay titles are samples.', 'Selling the book directly needs Commerce; otherwise the buttons link out.'],
  },
  doc: {
    ...doc('drolumide', 'Dr Olúmídé Ajayi', 'Historian and author of “The Long Market”. Writing on West African trade and cities.', {
      presetId: 'custom',
      background: '#F7F4EE',
      surface: '#FFFFFF',
      text: '#1C1B19',
      mutedText: '#5E5A52',
      accent: '#23395B',
      accentText: '#FFFFFF',
      fontPair: 'classic',
      buttonShape: 'square',
      buttonStyle: 'solid',
    }, [
      bl('e19_hero', 'hero', { variant: 'split', eyebrow: 'Historian · Author · Speaker', title: 'Dr Olúmídé Ajayi', subtitle: 'I write about how West African markets built West African cities — and what that means for how we trade today.', imageUrl: img.author, imageAlt: 'Dr Ajayi in his study surrounded by books', focal: 'top', primaryLabel: 'Read the new book', primaryUrl: '#b-e19_book', secondaryLabel: 'Invite me to speak', secondaryUrl: '#b-e19_form', meta: '' }, { width: 'wide', spacing: 'loose' }),
      bl('e19_book', 'hero', { variant: 'product', eyebrow: 'New book', title: 'The Long Market', subtitle: 'Five centuries of trade, from Kano to Lagos, told through the people who did it.', imageUrl: '', imageAlt: '', focal: 'center', primaryLabel: 'Where to buy', primaryUrl: 'https://thelongmarket.example', secondaryLabel: 'Read chapter one', secondaryUrl: 'https://thelongmarket.example/ch1', meta: 'Hardback · 320 pages' }, { background: 'tint', width: 'wide', spacing: 'loose' }),
      bl('e19_writing', 'mediaList', { title: 'Selected writing and talks', kind: 'chapters', items: [
        { id: 'e19_w1', title: 'Why Balogun market never sleeps', meta: 'Essay · sample magazine', duration: '12 min read', imageUrl: '', url: 'https://drolumide.example/balogun' },
        { id: 'e19_w2', title: 'Cowries to cards: a short history of payment', meta: 'Lecture · sample university', duration: '48 min', imageUrl: '', url: 'https://drolumide.example/cowries' },
        { id: 'e19_w3', title: 'The women who ran Kano’s cloth trade', meta: 'Essay · sample journal', duration: '18 min read', imageUrl: '', url: 'https://drolumide.example/kano' },
      ], links: [] }, { spacing: 'loose' }),
      bl('e19_topics', 'featureGrid', { title: 'Speaking topics', intro: 'Keynotes, panels and workshops, in person or online.', columns: 3, items: [
        { id: 'e19_t1', title: 'Markets and cities', text: 'How trade shaped where and how West Africans live.', imageUrl: '', imageAlt: '', label: 'Keynote · 45 min', url: '' },
        { id: 'e19_t2', title: 'The history of money', text: 'From cowries to mobile money, and what changes next.', imageUrl: '', imageAlt: '', label: 'Talk · 30 min', url: '' },
        { id: 'e19_t3', title: 'Writing history for everyone', text: 'A workshop for researchers who want to be read.', imageUrl: '', imageAlt: '', label: 'Workshop · half day', url: '' },
      ] }, { width: 'wide', spacing: 'loose' }),
      bl('e19_news', 'newsletter', { title: 'A letter from the archive', description: 'One short story from West African trade history, once a month.', buttonLabel: 'Subscribe', consentText: 'One email a month. Unsubscribe anytime.' }, { spacing: 'loose' }),
      bl('e19_form', 'leadForm', { title: 'Speaking and press', description: 'Event, date, audience and format, please.', fields: { name: true, email: true, phone: false, message: true }, submitLabel: 'Send enquiry', consentText: 'Used only to reply to your enquiry.' }, { background: 'invert', spacing: 'loose' }),
    ]),
    layout: { contentWidth: 'narrow' },
  },
};

export const eliteProfessionals: ExamplePage[] = [eliteFreelance, eliteAgency, eliteDesignPortfolio, elitePhotographer, eliteFashion, eliteAuthor];
