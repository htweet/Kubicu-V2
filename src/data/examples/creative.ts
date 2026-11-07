import { b, doc, type ExamplePage } from './build';
import { daysFromNow } from '../../utils/eventTime';

/* All businesses, people, prices, numbers and links below are fictional sample content. */

export const toluMakes: ExamplePage = {
  id: 'tolu-makes',
  category: 'Creator',
  name: 'Tolu Makes',
  city: 'Lagos',
  bestFor: 'Creators and influencers',
  description: 'Brand-deal enquiries, a newsletter, featured content and socials in one warm, personal page.',
  goals: ['audience'],
  styles: ['light', 'editorial'],
  plan: 'creator',
  doc: doc(
    'tolumakes',
    'Tolu Makes',
    'Lifestyle, food and slow living in Lagos. Work with me, read the Sunday letter, find everything I mention.',
    {
      presetId: 'custom',
      background: '#F6EEE6',
      surface: '#FFFAF5',
      text: '#2A1A14',
      mutedText: '#6E5548',
      accent: '#B4502E',
      accentText: '#FFFFFF',
      fontPair: 'expressive',
      buttonShape: 'pill',
      buttonStyle: 'soft',
    },
    [
      b('t_profile', 'profile', {
        name: 'Tolu Makes',
        tagline: 'Lifestyle, food and slow living in Lagos. 180k of you watch me cook, plan and wander — thank you.',
        avatarUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/df66cb13-05ae-4179-a39e-eae805aa6b84.jpg',
        avatarAlt: 'Tolu smiling in a mustard knit top against a terracotta wall',
        location: 'Yaba, Lagos',
      }, { align: 'center' }),
      b('t_social', 'social', {
        items: [
          { id: 't_ig', platform: 'instagram', url: 'https://instagram.com/tolumakes.example' },
          { id: 't_tt', platform: 'tiktok', url: 'https://tiktok.com/@tolumakes.example' },
          { id: 't_yt', platform: 'youtube', url: 'https://youtube.com/@tolumakes.example' },
        ],
      }, { align: 'center' }),
      b('t_latest', 'link', { label: 'Watch: ₦10k market run challenge', url: 'https://youtube.com/@tolumakes.example', description: 'New video every Thursday' }, { align: 'center', emphasis: 'featured' }),
      b('t_recipes', 'link', { label: 'All my recipes', url: 'https://tolumakes.example/recipes', description: '' }, { align: 'center' }),
      b('t_kit', 'link', { label: 'What’s in my filming kit', url: 'https://tolumakes.example/kit', description: 'Affiliate links — I earn a small fee' }, { align: 'center' }),
      b('t_gallery', 'gallery', {
        title: 'Lately',
        layout: 'carousel',
        images: [
          { id: 't_g1', url: 'https://cdn.magicpatterns.com/patterns/generated-images/54b8fc11-0f50-42da-a1c0-36e61190728a.jpg', alt: 'Tolu filming at a busy Lagos food market at golden hour' },
          { id: 't_g2', url: 'https://cdn.magicpatterns.com/patterns/generated-images/cba9e074-3922-4f2f-be2d-36f3d6caf531.jpg', alt: 'Coffee, an open planner and filming gear on a linen table' },
        ],
      }),
      b('t_h_work', 'heading', { text: 'Work with me', level: 'h2' }),
      b('t_work', 'text', { body: 'I partner with food, home and lifestyle brands that fit how my audience actually lives. Most of my viewers are 22–34 and based in Lagos and Abuja. Media kit on request.' }),
      b('t_form', 'leadForm', {
        title: 'Brand enquiry',
        description: 'Tell me about your brand and timeline. I reply within three working days.',
        fields: { name: true, email: true, phone: false, message: true },
        submitLabel: 'Send enquiry',
        consentText: 'Your details are only used to reply to this enquiry.',
      }),
      b('t_news', 'newsletter', {
        title: 'The Sunday letter',
        description: 'One recipe, one thing I loved, one thing I learned. Every Sunday.',
        buttonLabel: 'Subscribe',
        consentText: 'You’ll get one email a week from Tolu Makes. Unsubscribe anytime.',
      }),
      b('t_faq', 'faq', {
        title: 'Good to know',
        items: [
          { id: 't_f1', question: 'Do you do unpaid collaborations?', answer: 'Not at the moment. I occasionally feature small Lagos businesses for free when I genuinely love the product.' },
          { id: 't_f2', question: 'Can I use your recipes?', answer: 'Yes, for home cooking. Please credit and link back if you share them.' },
        ],
      }),
    ],
  ),
};

export const studioNnamdi: ExamplePage = {
  id: 'studio-nnamdi',
  category: 'Freelancer',
  name: 'Studio Nnamdi',
  city: 'Enugu',
  bestFor: 'Designers, writers and consultants',
  description: 'Portfolio case studies, clear packages and a discovery-call booking.',
  goals: ['showcase', 'book'],
  styles: ['light', 'bold'],
  plan: 'pro',
  doc: doc(
    'studionnamdi',
    'Studio Nnamdi',
    'Brand identity for founders who want to look as serious as they are. Based in Enugu, working across Africa.',
    {
      presetId: 'custom',
      background: '#FFFFFF',
      surface: '#F3F3F1',
      text: '#111111',
      mutedText: '#55554F',
      accent: '#1D3FD1',
      accentText: '#FFFFFF',
      fontPair: 'statement',
      buttonShape: 'square',
      buttonStyle: 'outline',
    },
    [
      b('n_profile', 'profile', {
        name: 'Studio Nnamdi',
        tagline: 'Brand identity for founders who want to look as serious as they are.',
        avatarUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/40882f02-aba5-4cdd-ada1-6a12e937ce03.jpg',
        avatarAlt: 'Nnamdi in round glasses and a black t-shirt in a white studio',
        location: 'Enugu · working remotely',
      }),
      b('n_text', 'text', { body: 'I’m Nnamdi Okafor. For eight years I’ve built logos, packaging and brand systems for coffee roasters, fintechs and hotels. I take on four projects a quarter so each one gets my full attention.' }),
      b('n_portfolio', 'portfolio', {
        title: 'Selected work',
        items: [
          {
            id: 'n_p1', title: 'Ọka Coffee Roasters', client: 'Ọka Coffee', role: 'Identity & packaging',
            outcome: 'Launched in 14 Enugu cafés within two months of the rebrand.',
            summary: 'Ọka wanted packaging that felt crafted but could scale from market stalls to supermarket shelves.\n\nWe built a geometric mark inspired by uli patterns, a two-colour system that prints cheaply, and a stamp so small batches could be labelled by hand.',
            coverUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/646d68bc-847a-4f1d-9fee-88626414ddff.jpg', coverAlt: 'Kraft coffee bags and cards with a green geometric logo', url: '',
          },
          {
            id: 'n_p2', title: 'Aurion', client: 'Aurion (fintech)', role: 'Brand system',
            outcome: 'One system now used across the app, guidelines and pitch materials.',
            summary: 'Aurion needed to feel trustworthy to first-time savers without looking like a bank. We landed on a confident cobalt palette, friendly geometric shapes and a short guideline book the in-house team actually uses.',
            coverUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/6fea20c4-da92-4b22-afe7-d6cdf41b2ba3.jpg', coverAlt: 'Blue brand guideline book and app screen on a grey desk', url: '',
          },
          {
            id: 'n_p3', title: 'Ìlú House', client: 'Ìlú House hotel', role: 'Identity & signage',
            outcome: 'Signage, totes and stationery delivered for the hotel’s opening.',
            summary: 'A boutique hotel in Calabar with a terracotta and sand palette, an understated monogram and signage made by local craftspeople.',
            coverUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/068ab88e-aa2e-4a6e-a4b6-42a5240b7990.jpg', coverAlt: 'Terracotta signage and tote bags against a plaster wall', url: '',
          },
        ],
      }),
      b('n_pricing', 'pricing', {
        title: 'Packages',
        packages: [
          { id: 'n_k1', name: 'Identity starter', priceNgn: 450000, unit: 'per project', description: 'For new businesses getting started.', features: 'Logo and wordmark\nColour and type system\nOne-page guidelines\nTwo rounds of revisions', ctaLabel: 'Enquire', url: 'https://studionnamdi.example/enquire', highlighted: false },
          { id: 'n_k2', name: 'Full brand system', priceNgn: 1200000, unit: 'per project', description: 'For teams ready to scale.', features: 'Everything in Starter\nPackaging or signage design\nFull guideline book\nSocial templates\nFour weeks of support', ctaLabel: 'Book a call', url: 'https://cal.example/studionnamdi', highlighted: true },
        ],
      }),
      b('n_booking', 'booking', { title: 'Book a discovery call', description: 'A 20-minute video call to understand your business and whether we’re a fit.', duration: '20 min', priceNote: 'Free', ctaLabel: 'Pick a time', url: 'https://cal.example/studionnamdi' }),
      b('n_test', 'testimonial', {
        quote: 'Nnamdi understood what we were trying to say before we did. The packaging paid for itself in the first month.',
        name: 'Chiamaka Eze', role: 'Founder, Ọka Coffee', source: 'Email, shared with permission', avatarUrl: '', avatarAlt: '', permission: true,
      }),
      b('n_social', 'social', {
        items: [
          { id: 'n_li', platform: 'linkedin', url: 'https://linkedin.com/in/studionnamdi.example' },
          { id: 'n_ig', platform: 'instagram', url: 'https://instagram.com/studionnamdi.example' },
        ],
      }),
    ],
  ),
};

export const ifeSounds: ExamplePage = {
  id: 'ife-sounds',
  category: 'Musician',
  name: 'Ife Sounds',
  city: 'Lagos',
  bestFor: 'Musicians, DJs and performers',
  description: 'New release, streaming links, upcoming shows and booking enquiries on a moody dark page.',
  goals: ['audience', 'events'],
  styles: ['dark', 'editorial'],
  plan: 'creator',
  doc: doc(
    'ifesounds',
    'Ife Sounds',
    'Afro-soul from Lagos. New single “Lagoon Moon” out now.',
    {
      presetId: 'custom',
      background: '#0E1424',
      surface: '#172036',
      text: '#F2ECE2',
      mutedText: '#AEB4C4',
      accent: '#F08A3E',
      accentText: '#140C05',
      fontPair: 'editorial',
      buttonShape: 'pill',
      buttonStyle: 'solid',
    },
    [
      b('i_profile', 'profile', {
        name: 'Ife Sounds',
        tagline: 'Afro-soul from Lagos. Songs for late drives and long talks.',
        avatarUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/4ee6c65f-709e-4b33-aae8-9b8ce1adebbf.jpg',
        avatarAlt: 'Ife in a cream knit and gold chain against a deep blue backdrop',
        location: 'Lagos',
      }, { align: 'center' }),
      b('i_cover', 'image', {
        url: 'https://cdn.magicpatterns.com/patterns/generated-images/aefef564-f401-4398-bff9-0aff6e160fe0.jpg',
        alt: 'Cover art for Lagoon Moon: a silhouette with headphones before a huge orange moon over the lagoon',
        caption: '“Lagoon Moon” — out now everywhere',
        aspect: '1:1',
      }),
      b('i_spotify', 'link', { label: 'Listen on Spotify', url: 'https://open.spotify.example/ifesounds', description: '' }, { align: 'center', emphasis: 'featured' }),
      b('i_apple', 'link', { label: 'Apple Music', url: 'https://music.apple.example/ifesounds', description: '' }, { align: 'center' }),
      b('i_boom', 'link', { label: 'Boomplay', url: 'https://boomplay.example/ifesounds', description: '' }, { align: 'center' }),
      b('i_yt', 'link', { label: 'Watch the visualiser', url: 'https://youtube.com/@ifesounds.example', description: 'YouTube' }, { align: 'center' }),
      b('i_h_live', 'heading', { text: 'Live', level: 'h2' }),
      b('i_show', 'event', {
        title: 'Lagoon Moon listening night',
        startsAt: daysFromNow(24, 19), endsAt: daysFromNow(24, 23), timeZone: 'Africa/Lagos',
        venue: 'Terra Kulture', address: 'Tiamiyu Savage St, Victoria Island, Lagos',
        ticketUrl: 'https://tix.example/lagoonmoon', ctaLabel: 'Get tickets',
        tiers: [
          { id: 'i_t1', name: 'Early bird', priceNgn: 10000, note: '', soldOut: true },
          { id: 'i_t2', name: 'Regular', priceNgn: 15000, note: '', soldOut: false },
          { id: 'i_t3', name: 'Table for 4', priceNgn: 80000, note: 'Includes drinks', soldOut: false },
        ],
        soldOut: false,
      }),
      b('i_form', 'leadForm', {
        title: 'Bookings',
        description: 'Weddings, corporate events and festivals. Include your date and city.',
        fields: { name: true, email: true, phone: true, message: true },
        submitLabel: 'Send booking request',
        consentText: 'Used only to reply to your booking request.',
      }),
      b('i_social', 'social', {
        items: [
          { id: 'i_ig', platform: 'instagram', url: 'https://instagram.com/ifesounds.example' },
          { id: 'i_tt', platform: 'tiktok', url: 'https://tiktok.com/@ifesounds.example' },
          { id: 'i_x', platform: 'x', url: 'https://x.com/ifesounds_example' },
        ],
      }, { align: 'center' }),
    ],
  ),
};

export const kemiPresets: ExamplePage = {
  id: 'kemi-presets',
  category: 'Digital products',
  name: 'Kemi’s Lightroom Presets',
  city: 'Ibadan',
  bestFor: 'Selling files, guides and templates',
  description: 'Free sample, paid packs through your own checkout, before-and-after gallery and an honest refund note.',
  goals: ['sell'],
  styles: ['light', 'editorial'],
  plan: 'creator',
  doc: doc(
    'kemipresets',
    'Kemi’s Lightroom Presets',
    'Warm, true-to-skin Lightroom presets made for melanin. Free sample pack inside.',
    {
      presetId: 'custom',
      background: '#EFE7DC',
      surface: '#F9F4EC',
      text: '#2B2420',
      mutedText: '#6A5D53',
      accent: '#3F2E24',
      accentText: '#F9F4EC',
      fontPair: 'classic',
      buttonShape: 'rounded',
      buttonStyle: 'solid',
    },
    [
      b('k_profile', 'profile', {
        name: 'Kemi Adebayo',
        tagline: 'Photographer. I make Lightroom presets that keep dark skin warm and true — no ashy greys.',
        avatarUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/46d45da1-10aa-4a47-82bd-5180465e2c31.jpg',
        avatarAlt: 'Kemi holding a camera in golden hour light',
        location: 'Ibadan',
      }, { align: 'center' }),
      b('k_free', 'download', {
        title: 'Free sample pack', description: '3 presets to try on your own photos.', fileName: 'kemi-sample.zip', fileSize: '4 MB', format: 'Lightroom (.xmp)',
        access: 'free', priceNgn: null, url: 'https://drive.example/kemi-sample', ctaLabel: 'Download free', coverUrl: '', coverAlt: '',
      }),
      b('k_golden', 'download', {
        title: 'Golden Hour pack', description: '12 warm presets for outdoor portraits and streets.', fileName: 'golden-hour.zip', fileSize: '18 MB', format: 'Lightroom desktop + mobile',
        access: 'paid', priceNgn: 15000, url: 'https://selar.example/kemi-golden', ctaLabel: 'Buy pack',
        coverUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/61ecd243-7bf8-4243-b356-5f29ad0d55b2.jpg', coverAlt: 'Warm-toned portrait of a woman in an orange dress on a Lagos street',
      }),
      b('k_bridal', 'download', {
        title: 'Soft Bridal pack', description: '10 airy presets for weddings and engagements.', fileName: 'soft-bridal.zip', fileSize: '15 MB', format: 'Lightroom desktop + mobile',
        access: 'paid', priceNgn: 18000, url: 'https://selar.example/kemi-bridal', ctaLabel: 'Buy pack',
        coverUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/e55e13cb-2104-49ad-b4e1-6dcd673f484e.jpg', coverAlt: 'Bright airy photo of a bride walking on a beach',
      }),
      b('k_gallery', 'gallery', {
        title: 'Made with the presets',
        layout: 'grid',
        images: [
          { id: 'k_g1', url: 'https://cdn.magicpatterns.com/patterns/generated-images/bec9ed5f-99b1-4b9e-9198-91491a2f7c68.jpg', alt: 'Street portrait of a man in denim against a teal wall, rich cinematic tones' },
          { id: 'k_g2', url: 'https://cdn.magicpatterns.com/patterns/generated-images/61ecd243-7bf8-4243-b356-5f29ad0d55b2.jpg', alt: 'Woman in an orange dress walking at golden hour' },
          { id: 'k_g3', url: 'https://cdn.magicpatterns.com/patterns/generated-images/e55e13cb-2104-49ad-b4e1-6dcd673f484e.jpg', alt: 'Bride on a beach in soft pastel tones' },
        ],
      }),
      b('k_test', 'testimonial', {
        quote: 'First presets that didn’t turn my clients grey. I use Golden Hour on almost every shoot now.',
        name: 'Damilola O.', role: 'Portrait photographer, Abuja', source: 'Instagram DM, shared with permission', avatarUrl: '', avatarAlt: '', permission: true,
      }),
      b('k_faq', 'faq', {
        title: 'Before you buy',
        items: [
          { id: 'k_f1', question: 'How do I get the files?', answer: 'Checkout happens on Selar. You get the download link by email straight after payment.' },
          { id: 'k_f2', question: 'Do they work on my phone?', answer: 'Yes — every pack includes files for Lightroom mobile (free app) and desktop.' },
          { id: 'k_f3', question: 'Can I get a refund?', answer: 'Because files can’t be returned, I don’t offer refunds once downloaded. If a file is broken or missing, message me and I’ll fix it within 48 hours.' },
        ],
      }),
      b('k_social', 'social', {
        items: [
          { id: 'k_ig', platform: 'instagram', url: 'https://instagram.com/kemishoots.example' },
          { id: 'k_tt', platform: 'tiktok', url: 'https://tiktok.com/@kemishoots.example' },
        ],
      }, { align: 'center' }),
    ],
  ),
};
