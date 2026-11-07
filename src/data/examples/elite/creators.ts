import { bl, doc, type ExamplePage } from '../build';
import { daysFromNow } from '../../../utils/eventTime';

/* Elite Template Library (D154) — creators & media. Every person, business, figure and link is fictional sample content. */

const img = {
  tomiPortrait: 'https://cdn.magicpatterns.com/patterns/generated-images/741cbc35-297b-4fde-9310-010649301ce6.jpg',
  tomiVideo: 'https://cdn.magicpatterns.com/patterns/generated-images/d9a32e92-e1b9-4781-b44b-e04a04f1b500.jpg',
  lagosStreet: 'https://cdn.magicpatterns.com/patterns/generated-images/68f0a123-bb0c-4bba-a7ad-75a7d0e2e498.jpg',
  ifeHero: 'https://cdn.magicpatterns.com/patterns/generated-images/12634abf-f585-4bdd-9055-5fc2f8c693c7.jpg',
  ifeDish: 'https://cdn.magicpatterns.com/patterns/generated-images/15015ccd-f494-49d0-a397-f6324b073a26.jpg',
  kemiCover: 'https://cdn.magicpatterns.com/patterns/generated-images/e491e526-143d-4bee-93d4-e5ba33b672d9.jpg',
  kemiLive: 'https://cdn.magicpatterns.com/patterns/generated-images/28542c84-8150-4883-837f-1450c466a66d.jpg',
  podcastStudio: 'https://cdn.magicpatterns.com/patterns/generated-images/7f1d0c60-6899-4772-bbfc-ab43a24a1942.jpg',
  podcastGuest: 'https://cdn.magicpatterns.com/patterns/generated-images/99d034b8-4fe6-4744-bee0-770a50b083d6.jpg',
  damiVideo: 'https://cdn.magicpatterns.com/patterns/generated-images/b4c8899a-f359-4767-b8fd-5734ad7bff2f.jpg',
};

const social = (prefix: string, platforms: [string, string][]) => ({ items: platforms.map(([platform, url], i) => ({ id: `${prefix}_s${i}`, platform, url })) }) as never;

// 01 — Signature Creator
export const eliteSignatureCreator: ExamplePage = {
  id: 'elite-signature-creator',
  category: 'Creator',
  name: 'Signature Creator',
  city: 'Lagos',
  bestFor: 'Creators, influencers and personal brands',
  description: 'A personal page with real art direction: a portrait opening, one featured link above the rest, your latest video and a sticky Follow bar on phones.',
  goals: ['audience'],
  styles: ['light', 'editorial'],
  plan: 'creator',
  elite: {
    number: 1,
    useCase: 'creators',
    goal: 'audience',
    priceNgn: 2667,
    structure: 'Portrait hero · ranked links · featured video · sticky Follow bar',
    inside: ['Portrait hero with a one-line positioning statement', 'Featured link, then three quieter links', 'Latest video beside a short note', 'Socials', 'Newsletter in a tinted section'],
    goodToKnow: ['Links, socials and the newsletter text are samples — they’re cleared when you use the template.', 'The sticky bar only shows on phones.'],
  },
  doc: {
    ...doc('tomiade', 'Tomi Ade', 'Slow living, honest reviews and Lagos weekends. Everything I mention, in one place.', {
      presetId: 'custom',
      background: '#F5F0E8',
      surface: '#FCFAF6',
      text: '#1B1714',
      mutedText: '#5F564C',
      accent: '#1B1714',
      accentText: '#F5F0E8',
      fontPair: 'editorial',
      buttonShape: 'pill',
      buttonStyle: 'solid',
    }, [
      bl('e1_hero', 'hero', { variant: 'portrait', eyebrow: 'Lifestyle · Lagos', title: 'Tomi Ade', subtitle: 'Slow living, honest reviews and the best of Lagos on a weekend budget.', imageUrl: img.tomiPortrait, imageAlt: 'Tomi smiling in a cream linen shirt by a window', focal: 'top', primaryLabel: '', primaryUrl: '', secondaryLabel: '', secondaryUrl: '', meta: '' }, { spacing: 'loose' }),
      bl('e1_featured', 'link', { label: 'New: My ₦25k Lagos weekend guide', url: 'https://tomiade.example/weekend', description: 'Free PDF · updated this month' }, {}, { align: 'center', emphasis: 'featured' }),
      bl('e1_l2', 'link', { label: 'Everything I use to film', url: 'https://tomiade.example/kit', description: '' }, { spacing: 'tight' }, { align: 'center' }),
      bl('e1_l3', 'link', { label: 'Restaurant reviews', url: 'https://tomiade.example/eats', description: '' }, { spacing: 'tight' }, { align: 'center' }),
      bl('e1_l4', 'link', { label: 'Work with me', url: '#b-e1_news', description: '' }, { spacing: 'tight' }, { align: 'center', emphasis: 'subtle' }),
      bl('e1_video', 'image', { url: img.tomiVideo, alt: 'Tomi filming a morning routine in a bright kitchen', caption: 'This week on YouTube: a slow Saturday morning, start to finish.', aspect: '16:9' }, { width: 'wide', pair: 'wide-first', spacing: 'loose' }),
      bl('e1_note', 'text', { body: 'I make calm videos about everyday Lagos — food, homes, small businesses worth knowing. New video every Thursday, newsletter every Sunday.' }, { spacing: 'loose' }),
      bl('e1_social', 'social', social('e1', [['instagram', 'https://instagram.com/tomiade.example'], ['tiktok', 'https://tiktok.com/@tomiade.example'], ['youtube', 'https://youtube.com/@tomiade.example']]), {}, { align: 'center' }),
      bl('e1_news', 'newsletter', { title: 'The Sunday note', description: 'One place, one recipe, one thing I learned. Every Sunday morning.', buttonLabel: 'Subscribe', consentText: 'One email a week. Unsubscribe anytime.' }, { background: 'tint', spacing: 'loose' }),
    ]),
    layout: { contentWidth: 'narrow', actionBar: { enabled: true, label: 'Get the Sunday note', blockId: 'e1_news', url: '' } },
  },
};

// 02 — Editorial Creator
export const eliteEditorialCreator: ExamplePage = {
  id: 'elite-editorial-creator',
  category: 'Writer',
  name: 'Editorial Creator',
  city: 'Lagos',
  bestFor: 'Writers, commentators and thought leaders',
  description: 'Reads like a magazine: a masthead, a lead story beside its summary, an archive and an inverted subscribe section.',
  goals: ['audience'],
  styles: ['light', 'editorial'],
  plan: 'creator',
  elite: {
    number: 2,
    useCase: 'creators',
    goal: 'audience',
    priceNgn: 3333,
    structure: 'Masthead hero · lead story pair · archive list · inverted subscribe',
    inside: ['Masthead with issue line', 'Lead story photo beside its standfirst', 'Archive of recent pieces', 'Short author note', 'Inverted newsletter section'],
    goodToKnow: ['Story titles and dates are samples.', 'Pieces open wherever you publish them — KUBICU doesn’t host long articles.'],
  },
  doc: {
    ...doc('lagosletter', 'The Lagos Letter', 'Weekly essays on how Lagos works — money, movement and the people who keep it going.', {
      presetId: 'custom',
      background: '#FBFAF7',
      surface: '#FFFFFF',
      text: '#141414',
      mutedText: '#5C5A55',
      accent: '#141414',
      accentText: '#FBFAF7',
      fontPair: 'classic',
      buttonShape: 'square',
      buttonStyle: 'outline',
    }, [
      bl('e2_mast', 'hero', { variant: 'masthead', eyebrow: 'Issue 87 · Every Friday', title: 'The Lagos Letter', subtitle: 'Weekly essays on how Lagos really works — money, movement and the people who keep the city going.', imageUrl: '', imageAlt: '', focal: 'center', primaryLabel: 'Read this week’s issue', primaryUrl: 'https://lagosletter.example/87', secondaryLabel: 'Subscribe free', secondaryUrl: '#b-e2_news', meta: 'By Adaora Mbanefo' }, { width: 'wide' }),
      bl('e2_lead_img', 'image', { url: img.lagosStreet, alt: 'A busy Lagos market street at golden hour with yellow buses', caption: '', aspect: '4:5' }, { width: 'wide', pair: 'wide-first', spacing: 'loose' }),
      bl('e2_lead_text', 'text', { body: 'This week · 9 min read\n\nThe danfo economy\n\nEvery morning, twelve million trips are stitched together by drivers, conductors and agberos nobody plans for. I spent a month riding the Oshodi loop to understand who earns what — and why the system works better than it should.' }, { spacing: 'loose' }),
      bl('e2_archive', 'mediaList', { title: 'Recent issues', kind: 'chapters', items: [
        { id: 'e2_a1', title: 'Why everyone in Yaba is suddenly a landlord', meta: 'Issue 86 · Property', duration: '7 min', imageUrl: '', url: 'https://lagosletter.example/86' },
        { id: 'e2_a2', title: 'The quiet business of borehole water', meta: 'Issue 85 · Utilities', duration: '11 min', imageUrl: '', url: 'https://lagosletter.example/85' },
        { id: 'e2_a3', title: 'What a ₦5,000 lunch budget buys in VI now', meta: 'Issue 84 · Food', duration: '5 min', imageUrl: '', url: 'https://lagosletter.example/84' },
        { id: 'e2_a4', title: 'Inside the Computer Village repair economy', meta: 'Issue 83 · Tech', duration: '12 min', imageUrl: '', url: 'https://lagosletter.example/83' },
      ], links: [] }, { width: 'wide', spacing: 'loose' }),
      bl('e2_about', 'text', { body: 'Adaora Mbanefo has reported on cities and money for eleven years. The Lagos Letter is reader-supported and independent.' }),
      bl('e2_news', 'newsletter', { title: 'Get Friday’s letter', description: 'One long, careful essay a week. No spam, no hot takes.', buttonLabel: 'Subscribe free', consentText: 'One email a week from The Lagos Letter. Unsubscribe anytime.' }, { background: 'invert', width: 'wide', spacing: 'loose' }),
    ]),
    layout: { contentWidth: 'narrow' },
  },
};

// 03 — Creator Media Kit
export const eliteMediaKit: ExamplePage = {
  id: 'elite-media-kit',
  category: 'Creator',
  name: 'Creator Media Kit',
  city: 'Abuja',
  bestFor: 'Creators who work with brands',
  description: 'A one-page media kit: who you are, illustrative audience figures, content formats, past partners and a partnership enquiry form.',
  goals: ['audience', 'showcase'],
  styles: ['light', 'bold'],
  plan: 'pro',
  elite: {
    number: 3,
    useCase: 'creators',
    goal: 'enquiries',
    priceNgn: 5000,
    structure: 'Split hero · figures · formats grid · logo strip · work gallery · enquiry form',
    inside: ['Split hero with niche and photo', 'Audience figures (labelled examples)', 'Content formats in a 3-column grid', 'Past partners strip', 'Work samples', 'Partnership enquiry form'],
    goodToKnow: ['Figures show “Example figures” until you confirm yours are real.', 'The partner strip stays hidden until you confirm each brand agreed to be shown.'],
  },
  doc: doc('ifecooks', 'Ife Cooks', 'Nigerian home cooking for busy people. Partnerships with food and kitchen brands.', {
    presetId: 'custom',
    background: '#FFFFFF',
    surface: '#F6F4F0',
    text: '#1A1A1A',
    mutedText: '#5B5751',
    accent: '#C2410C',
    accentText: '#FFFFFF',
    fontPair: 'modern',
    buttonShape: 'rounded',
    buttonStyle: 'solid',
  }, [
    bl('e3_hero', 'hero', { variant: 'split', eyebrow: 'Food creator · Abuja', title: 'Nigerian home cooking for busy people', subtitle: 'I’m Ife. I make 30-minute versions of the dishes we grew up with, for an audience that cooks on weeknights.', imageUrl: img.ifeHero, imageAlt: 'Ife plating jollof rice and plantain in a sunlit kitchen', focal: 'center', primaryLabel: 'Partner with me', primaryUrl: '#b-e3_form', secondaryLabel: 'Download media kit', secondaryUrl: 'https://ifecooks.example/kit.pdf', meta: '' }, { width: 'wide', spacing: 'loose' }),
    bl('e3_figures', 'figures', { title: 'Audience', items: [{ id: 'e3_f1', value: '240k', label: 'Followers across platforms' }, { id: 'e3_f2', value: '68%', label: 'Aged 22–34' }, { id: 'e3_f3', value: '4.1%', label: 'Average engagement' }, { id: 'e3_f4', value: 'Lagos · Abuja', label: 'Top cities' }], confirmed: false }, { width: 'wide', spacing: 'loose' }),
    bl('e3_formats', 'featureGrid', { title: 'What I make with brands', intro: 'Every partnership is built around a real recipe my audience will cook.', columns: 3, items: [
      { id: 'e3_x1', title: 'Recipe reel', text: 'A 45–60 second vertical video, filmed and edited by me, with your product in the cook.', imageUrl: '', imageAlt: '', label: 'Instagram · TikTok', url: '' },
      { id: 'e3_x2', title: 'Long-form cook-along', text: 'A full YouTube recipe with a natural integration and a pinned link.', imageUrl: '', imageAlt: '', label: 'YouTube', url: '' },
      { id: 'e3_x3', title: 'Recipe card set', text: 'Three printable recipe cards featuring your product, for your channels.', imageUrl: '', imageAlt: '', label: 'Usage rights included', url: '' },
    ] }, { width: 'wide', spacing: 'loose' }),
    bl('e3_logos', 'logoStrip', { title: 'Brands I’ve cooked with', items: [{ id: 'e3_l1', name: 'Golden Penny Kitchen', logoUrl: '' }, { id: 'e3_l2', name: 'Mama’s Pride', logoUrl: '' }, { id: 'e3_l3', name: 'Ofada Co.', logoUrl: '' }, { id: 'e3_l4', name: 'Lagos Spice House', logoUrl: '' }], permission: true }, { background: 'tint', width: 'wide' }),
    bl('e3_gallery', 'gallery', { title: 'Recent work', layout: 'grid', images: [{ id: 'e3_g1', url: img.ifeDish, alt: 'Egusi soup with pounded yam on a terracotta plate' }, { id: 'e3_g2', url: img.ifeHero, alt: 'Ife plating jollof rice in her kitchen' }] }, { width: 'wide', spacing: 'loose' }),
    bl('e3_form', 'leadForm', { title: 'Partnership enquiry', description: 'Tell me about your brand, the campaign and your timeline. I reply within three working days.', fields: { name: true, email: true, phone: false, message: true }, submitLabel: 'Send enquiry', consentText: 'Your details are only used to reply to this enquiry.' }, { spacing: 'loose' }),
  ]),
};

// 08 — Music Artist
export const eliteMusicArtist: ExamplePage = {
  id: 'elite-music-artist',
  category: 'Music',
  name: 'Music Artist',
  city: 'Lagos',
  bestFor: 'Singers, bands, DJs and independent artists',
  description: 'Dark and cinematic: a full-bleed cover for the new release, the tracklist, a live shot, show dates, where to stream and booking.',
  goals: ['audience', 'events'],
  styles: ['dark', 'bold'],
  plan: 'creator',
  elite: {
    number: 8,
    useCase: 'creators',
    goal: 'audience',
    priceNgn: 4000,
    structure: 'Edge-to-edge cover · tracklist · live pair · show dates · stream links · booking',
    inside: ['Edge-to-edge release cover with Listen button', 'Tracklist with streaming links', 'Live photo beside a short bio', 'Next show', 'Booking enquiry in an inverted section'],
    goodToKnow: ['Track names, dates and venues are samples.', 'Ticket sales through KUBICU need Commerce → Events; otherwise the button links out.'],
  },
  doc: doc('kemistrings', 'Kemi Strings', 'Afro-soul singer-songwriter from Lagos. New EP “Harmattan Letters” out now.', {
    presetId: 'custom',
    background: '#0F0D0B',
    surface: '#1A1714',
    text: '#F4EDE4',
    mutedText: '#B6AA9C',
    accent: '#E8A44A',
    accentText: '#1A1208',
    fontPair: 'statement',
    buttonShape: 'pill',
    buttonStyle: 'outline',
  }, [
    bl('e8_cover', 'hero', { variant: 'cover', eyebrow: 'New EP · Out now', title: 'Harmattan Letters', subtitle: 'Five songs written over one dry season in Lagos.', imageUrl: img.kemiCover, imageAlt: 'Kemi singing with an acoustic guitar under a warm spotlight', focal: 'center', primaryLabel: 'Listen now', primaryUrl: 'https://kemistrings.example/listen', secondaryLabel: 'Book Kemi', secondaryUrl: '#b-e8_book', meta: '' }, { width: 'full' }),
    bl('e8_tracks', 'mediaList', { title: 'Tracklist', kind: 'tracks', items: [
      { id: 'e8_t1', title: 'Dust on the Window', meta: 'Harmattan Letters', duration: '3:42', imageUrl: '', url: 'https://kemistrings.example/listen' },
      { id: 'e8_t2', title: 'Mainland Love', meta: 'Harmattan Letters', duration: '4:05', imageUrl: '', url: 'https://kemistrings.example/listen' },
      { id: 'e8_t3', title: 'Third Mainland at Dawn', meta: 'Harmattan Letters', duration: '3:18', imageUrl: '', url: 'https://kemistrings.example/listen' },
      { id: 'e8_t4', title: 'Ìfẹ́ (Interlude)', meta: 'Harmattan Letters', duration: '1:47', imageUrl: '', url: 'https://kemistrings.example/listen' },
      { id: 'e8_t5', title: 'Letters Home', meta: 'Harmattan Letters', duration: '4:31', imageUrl: '', url: 'https://kemistrings.example/listen' },
    ], links: [{ id: 'e8_p1', label: 'Spotify', url: 'https://open.spotify.com/artist/example' }, { id: 'e8_p2', label: 'Apple Music', url: 'https://music.apple.com/example' }, { id: 'e8_p3', label: 'Audiomack', url: 'https://audiomack.com/example' }] }, { spacing: 'loose' }),
    bl('e8_live', 'image', { url: img.kemiLive, alt: 'Kemi singing into a vintage microphone in a warmly lit lounge', caption: '', aspect: '4:5' }, { width: 'wide', pair: 'equal', spacing: 'loose' }),
    bl('e8_bio', 'text', { body: 'Kemi Strings writes Afro-soul about distance, family and the city. Harmattan Letters is her second EP, recorded live with a four-piece band in Surulere.' }, { spacing: 'loose' }),
    bl('e8_show', 'event', { title: 'Harmattan Letters — live', startsAt: daysFromNow(24, 20), endsAt: daysFromNow(24, 23), timeZone: 'Africa/Lagos', venue: 'Bogobiri House', address: '9 Maitama Sule St, Ikoyi, Lagos', ticketUrl: 'https://kemistrings.example/tickets', ctaLabel: 'Get tickets', tiers: [], soldOut: false }, { spacing: 'loose' }),
    bl('e8_book', 'leadForm', { title: 'Bookings & management', description: 'Shows, private events and sync. Tell us the date, city and type of event.', fields: { name: true, email: true, phone: true, message: true }, submitLabel: 'Send booking request', consentText: 'Used only to reply to your booking request.' }, { background: 'invert', spacing: 'loose' }),
  ]),
};

// 09 — Podcast & Media Network
export const elitePodcast: ExamplePage = {
  id: 'elite-podcast',
  category: 'Podcast',
  name: 'Podcast & Media',
  city: 'Lagos',
  bestFor: 'Podcasters, show hosts and small media brands',
  description: 'Show art beside the pitch, the featured episode, recent episodes with listen-on links, sponsor and guest options, and a sticky Listen bar.',
  goals: ['audience'],
  styles: ['light', 'bold'],
  plan: 'creator',
  elite: {
    number: 9,
    useCase: 'media',
    goal: 'audience',
    priceNgn: 4000,
    structure: 'Split hero · featured episode · episode list · sponsor grid · sticky Listen bar',
    inside: ['Show art beside the show pitch', 'Featured episode', 'Recent episodes with listen-on links', 'Sponsor and guest options', 'Newsletter'],
    goodToKnow: ['Episode titles and guests are samples.', 'Episodes play where you host them; add your feed links under “Listen on”.'],
  },
  doc: {
    ...doc('naijafounders', 'Naija Founders Show', 'Weekly conversations with the people building Nigerian companies.', {
      presetId: 'custom',
      background: '#F2F5F1',
      surface: '#FFFFFF',
      text: '#0F2419',
      mutedText: '#4C5E53',
      accent: '#1F6B46',
      accentText: '#FFFFFF',
      fontPair: 'grotesk',
      buttonShape: 'rounded',
      buttonStyle: 'soft',
    }, [
      bl('e9_hero', 'hero', { variant: 'split', eyebrow: 'New episode every Tuesday', title: 'Naija Founders Show', subtitle: 'Long, honest conversations with the people building Nigerian companies — what worked, what broke, and what they’d do again.', imageUrl: img.podcastStudio, imageAlt: 'Two microphones on a walnut desk in a green podcast studio', focal: 'center', primaryLabel: 'Listen to the latest', primaryUrl: 'https://naijafounders.example/latest', secondaryLabel: 'Become a sponsor', secondaryUrl: '#b-e9_sponsor', meta: 'Hosted by Chuka Obi' }, { width: 'wide', spacing: 'loose' }),
      bl('e9_feat_img', 'image', { url: img.podcastGuest, alt: 'This week’s guest speaking into a microphone', caption: '', aspect: '1:1' }, { width: 'wide', pair: 'narrow-first', spacing: 'loose', background: 'tint' }),
      bl('e9_feat_text', 'text', { body: 'Episode 112 · 58 min\n\nBuilding logistics for the last mile\nTunde Bakare on starting with three motorbikes, losing his biggest client, and the spreadsheet that saved the company.' }, { background: 'tint' }),
      bl('e9_eps', 'mediaList', { title: 'Recent episodes', kind: 'episodes', items: [
        { id: 'e9_e1', title: 'Pricing in naira when your costs are in dollars', meta: 'Ep. 111 · with Zainab Musa', duration: '46 min', imageUrl: '', url: 'https://naijafounders.example/111' },
        { id: 'e9_e2', title: 'Hiring your first ten people', meta: 'Ep. 110 · with Ken Eze', duration: '52 min', imageUrl: '', url: 'https://naijafounders.example/110' },
        { id: 'e9_e3', title: 'When to say no to investors', meta: 'Ep. 109 · with Amara Nwosu', duration: '61 min', imageUrl: '', url: 'https://naijafounders.example/109' },
      ], links: [{ id: 'e9_p1', label: 'Spotify', url: 'https://open.spotify.com/show/example' }, { id: 'e9_p2', label: 'Apple Podcasts', url: 'https://podcasts.apple.com/example' }, { id: 'e9_p3', label: 'YouTube', url: 'https://youtube.com/@naijafounders.example' }] }, { width: 'wide', spacing: 'loose' }),
      bl('e9_sponsor', 'featureGrid', { title: 'Work with the show', intro: '', columns: 2, items: [
        { id: 'e9_x1', title: 'Sponsor an episode', text: 'A host-read message at the start and middle of one episode, plus a link in the show notes.', imageUrl: '', imageAlt: '', label: 'Booked monthly', url: 'mailto:hello@naijafounders.example' },
        { id: 'e9_x2', title: 'Pitch a guest', text: 'Building something interesting? Tell us what you’d talk about for an hour.', imageUrl: '', imageAlt: '', label: 'We reply within two weeks', url: 'mailto:guests@naijafounders.example' },
      ] }, { width: 'wide', spacing: 'loose' }),
      bl('e9_news', 'newsletter', { title: 'Show notes by email', description: 'Every episode’s links and one takeaway, the morning it comes out.', buttonLabel: 'Subscribe', consentText: 'One email per episode. Unsubscribe anytime.' }, { spacing: 'loose' }),
    ]),
    layout: { actionBar: { enabled: true, label: 'Listen to the latest', blockId: null, url: 'https://naijafounders.example/latest' } },
  },
};

// 10 — Video Creator
export const eliteVideoCreator: ExamplePage = {
  id: 'elite-video-creator',
  category: 'Creator',
  name: 'Video Creator',
  city: 'Ibadan',
  bestFor: 'YouTubers, educators and short-form creators',
  description: 'Video first: a wide featured video, series as a grid, a curated list of recent uploads, community links and a collaboration enquiry.',
  goals: ['audience'],
  styles: ['dark'],
  plan: 'creator',
  elite: {
    number: 10,
    useCase: 'media',
    goal: 'audience',
    priceNgn: 3333,
    structure: 'Masthead · wide featured video · series grid · video list · collab form',
    inside: ['Short masthead with channel pitch', 'Wide featured video', 'Series as a 3-column grid', 'Recent uploads list', 'Community links', 'Collaboration enquiry'],
    goodToKnow: ['Video titles are samples. Add a Video & embed block to play a real video on the page.'],
  },
  doc: doc('damiexplains', 'Dami Explains', 'Money, tech and the economy, explained in plain English. New videos every Wednesday.', {
    presetId: 'custom',
    background: '#111317',
    surface: '#1B1E24',
    text: '#F2F3F5',
    mutedText: '#A3A8B3',
    accent: '#FACC15',
    accentText: '#111317',
    fontPair: 'grotesk',
    buttonShape: 'rounded',
    buttonStyle: 'solid',
  }, [
    bl('e10_mast', 'hero', { variant: 'masthead', eyebrow: 'New videos every Wednesday', title: 'Dami Explains', subtitle: 'Money, tech and the Nigerian economy, explained in plain English — no jargon, no hype.', imageUrl: '', imageAlt: '', focal: 'center', primaryLabel: 'Subscribe on YouTube', primaryUrl: 'https://youtube.com/@damiexplains.example', secondaryLabel: '', secondaryUrl: '', meta: '' }, { width: 'wide' }),
    bl('e10_feat', 'image', { url: img.damiVideo, alt: 'Dami explaining an idea in front of a bookshelf', caption: 'Latest: Why your rent went up 40% — and who actually decided it (18 min)', aspect: '16:9' }, { width: 'wide', spacing: 'loose' }),
    bl('e10_series', 'featureGrid', { title: 'Series', intro: '', columns: 3, items: [
      { id: 'e10_s1', title: 'Money Basics', text: 'Budgets, savings and investing without the scams.', imageUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/c0e78ba1-2d45-4abf-976b-9f092e1f6de3.jpg', imageAlt: 'Naira notes, a budget notebook and a calculator on a desk', label: '24 videos', url: 'https://youtube.com/@damiexplains.example' },
      { id: 'e10_s2', title: 'How Lagos Works', text: 'Rent, transport and power, followed to the source.', imageUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/c60505e3-47c1-40d6-a24b-b6b80e848430.jpg', imageAlt: 'Yellow buses on a busy Lagos street at dusk', label: '11 videos', url: 'https://youtube.com/@damiexplains.example' },
      { id: 'e10_s3', title: 'Tech, Simply', text: 'What new apps and policies actually change for you.', imageUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/e57abb47-eb50-4a12-b911-6b85cf3f2e19.jpg', imageAlt: 'Hands holding a phone with a banking app beside a laptop', label: '16 videos', url: 'https://youtube.com/@damiexplains.example' },
    ] }, { width: 'wide', spacing: 'loose' }),
    bl('e10_recent', 'mediaList', { title: 'Recent uploads', kind: 'videos', items: [
      { id: 'e10_v1', title: 'Is fintech saving or spending your money?', meta: 'Tech, Simply', duration: '14:02', imageUrl: img.damiVideo, url: 'https://youtube.com/@damiexplains.example' },
      { id: 'e10_v2', title: 'The real cost of a generator', meta: 'How Lagos Works', duration: '11:47', imageUrl: img.damiVideo, url: 'https://youtube.com/@damiexplains.example' },
      { id: 'e10_v3', title: 'Your first ₦100,000 investment', meta: 'Money Basics', duration: '16:20', imageUrl: img.damiVideo, url: 'https://youtube.com/@damiexplains.example' },
    ], links: [{ id: 'e10_c1', label: 'Join the Discord', url: 'https://discord.gg/example' }, { id: 'e10_c2', label: 'WhatsApp channel', url: 'https://whatsapp.com/channel/example' }] }, { width: 'wide', spacing: 'loose' }),
    bl('e10_collab', 'leadForm', { title: 'Collaborations', description: 'Brands, schools and other creators — tell me what you have in mind.', fields: { name: true, email: true, phone: false, message: true }, submitLabel: 'Send', consentText: 'Used only to reply to you.' }, { background: 'tint', spacing: 'loose' }),
  ]),
};

export const eliteCreators: ExamplePage[] = [eliteSignatureCreator, eliteEditorialCreator, eliteMediaKit, eliteMusicArtist, elitePodcast, eliteVideoCreator];
