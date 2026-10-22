import { b, doc, hours, type ExamplePage } from './build';

/* All businesses, people, prices, numbers and links below are fictional sample content. */

export const glowByHalima: ExamplePage = {
  id: 'glow-by-halima',
  category: 'Beauty',
  name: 'Glow by Halima',
  city: 'Abuja',
  bestFor: 'Salons, stylists and beauty pros',
  description: 'Service prices, booking, a work gallery and opening hours with an open-now badge.',
  goals: ['book', 'showcase'],
  styles: ['light', 'editorial'],
  plan: 'creator',
  doc: doc(
    'glowbyhalima',
    'Glow by Halima',
    'Braids, natural hair care and nails in Wuse 2, Abuja. Book online.',
    {
      presetId: 'custom',
      background: '#F8ECE8',
      surface: '#FFF9F7',
      text: '#2D1B1E',
      mutedText: '#6E5258',
      accent: '#1E5A4A',
      accentText: '#FFFFFF',
      fontPair: 'expressive',
      buttonShape: 'pill',
      buttonStyle: 'solid'
    },
    [
    b('h_profile', 'profile', {
      name: 'Glow by Halima',
      tagline: 'Braids, natural hair care and nails — done gently, done on time.',
      avatarUrl: "/f501d240-4565-4c3a-a1aa-76068199a4a3.jpg",
      avatarAlt: 'Halima in an emerald headwrap smiling in her salon',
      location: 'Wuse 2, Abuja'
    }, { align: 'center' }),
    b('h_book', 'booking', { title: 'Book an appointment', description: 'Choose your service and a time that suits you. A ₦5,000 deposit holds your slot.', duration: '1–6 hrs', priceNote: 'Deposit ₦5,000', ctaLabel: 'See available times', url: 'https://book.example/glowbyhalima' }),
    b('h_pricing', 'pricing', {
      title: 'Popular services',
      packages: [
      { id: 'h_p1', name: 'Knotless braids', priceNgn: 35000, unit: 'mid-back', description: 'Hair included.', features: 'Small or medium size\nAbout 5 hours\nFree touch-up within 7 days', ctaLabel: 'Book braids', url: 'https://book.example/glowbyhalima/braids', highlighted: true },
      { id: 'h_p2', name: 'Silk press', priceNgn: 18000, unit: '', description: 'For natural hair.', features: 'Wash and deep condition\nTrim included\nAbout 2 hours', ctaLabel: 'Book silk press', url: 'https://book.example/glowbyhalima/silk', highlighted: false },
      { id: 'h_p3', name: 'Gel manicure', priceNgn: 12000, unit: '', description: '', features: 'Shape, cuticle care and gel colour\nAbout 1 hour', ctaLabel: 'Book nails', url: 'https://book.example/glowbyhalima/nails', highlighted: false }]

    }),
    b('h_gallery', 'gallery', {
      title: 'Recent work',
      layout: 'grid',
      images: [
      { id: 'h_g1', url: "/6810ec48-8ab0-48cf-86e6-a643bd901f5d.jpg", alt: 'Neat knotless box braids seen from behind' },
      { id: 'h_g2', url: "/62447a94-62d4-48a0-8099-0ddf9df772ac.jpg", alt: 'Almond nails in nude with gold accents' },
      { id: 'h_g3', url: "/cb0a2bd3-9ed9-45f2-9517-f0615df66ae5.jpg", alt: 'The salon: blush walls, round mirrors and velvet chairs' }]

    }),
    b('h_test', 'testimonial', {
      quote: 'My braids lasted eight weeks and my edges are still intact. Halima is the only person I trust with my hair now.',
      name: 'Zainab M.', role: 'Client since 2024', source: 'Google review, quoted with permission', avatarUrl: '', avatarAlt: '', permission: true
    }),
    b('h_loc', 'location', {
      name: 'The salon',
      address: 'Suite 14, Banex Plaza annex\nWuse 2, Abuja',
      timeZone: 'Africa/Lagos',
      hours: hours('09:00', '19:00', [0, 1], { 6: ['08:00', '18:00'] }),
      note: 'Walk-ins for nails only. Braids by appointment.'
    }),
    b('h_faq', 'faq', {
      title: 'Policies',
      items: [
      { id: 'h_f1', question: 'What if I’m late?', answer: 'We hold your slot for 20 minutes. After that we may need to rebook you, and the deposit carries over once.' },
      { id: 'h_f2', question: 'Can I cancel?', answer: 'Cancel at least 24 hours before and your deposit is refunded. Later than that, it isn’t.' }]

    }),
    b('h_wa', 'whatsapp', { label: 'Questions? WhatsApp us', phone: '+234 809 555 0163', message: 'Hi Glow by Halima, I have a question about…' }, { align: 'center' })]

  )
};

export const fixRightPlumbing: ExamplePage = {
  id: 'fixright-plumbing',
  category: 'Service',
  name: 'FixRight Plumbing',
  city: 'Port Harcourt',
  bestFor: 'Tradespeople and home services',
  description: 'Call and WhatsApp first, service areas, a quote form and clear emergency hours.',
  goals: ['book'],
  styles: ['light', 'bold'],
  plan: 'free',
  doc: doc(
    'fixrightph',
    'FixRight Plumbing',
    'Licensed plumbers in Port Harcourt. Leaks, installs and emergency call-outs.',
    {
      presetId: 'custom',
      background: '#EEF2F6',
      surface: '#FFFFFF',
      text: '#0F1E2E',
      mutedText: '#4A5A6A',
      accent: '#0E4C8A',
      accentText: '#FFFFFF',
      fontPair: 'statement',
      buttonShape: 'rounded',
      buttonStyle: 'solid'
    },
    [
    b('f_profile', 'profile', {
      name: 'FixRight Plumbing',
      tagline: 'Leaks, blockages and new installs across Port Harcourt. We turn up when we say we will.',
      avatarUrl: "/5979d776-350b-4589-8c43-783db605cecb.jpg",
      avatarAlt: 'Emeka, lead plumber, holding a pipe wrench in a clean bathroom',
      location: 'Port Harcourt, Rivers'
    }),
    b('f_wa', 'whatsapp', { label: 'WhatsApp a photo of the problem', phone: '+234 803 555 0119', message: 'Hello FixRight, I need help with…' }, { align: 'center', emphasis: 'featured' }),
    b('f_contact', 'contact', { phone: '+234 803 555 0119', email: 'jobs@fixright.example', address: '', hours: 'Mon–Sat 8am–6pm · Emergencies 24/7' }),
    b('f_h', 'heading', { text: 'What we fix', level: 'h2' }),
    b('f_text', 'text', { body: 'Burst and leaking pipes · Blocked sinks and toilets · Water heater installs · Borehole pump connections · Kitchen and bathroom fittings' }),
    b('f_img', 'image', {
      url: "/6c3946b4-7c16-493b-8d86-56c5156dc14a.jpg",
      alt: 'A newly installed chrome kitchen tap with neat white pipework',
      caption: 'Recent kitchen install, GRA Phase 2',
      aspect: '16:9'
    }),
    b('f_form', 'leadForm', {
      title: 'Get a quote',
      description: 'Describe the job and your area. We reply with a price range the same day.',
      fields: { name: true, email: false, phone: true, message: true },
      submitLabel: 'Request quote',
      consentText: 'We only use your number to discuss this job.'
    }),
    b('f_faq', 'faq', {
      title: 'Before you call',
      items: [
      { id: 'f_f1', question: 'Which areas do you cover?', answer: 'GRA, Old GRA, Trans-Amadi, Rumuola, Rumuokoro, Woji, Peter Odili Road and Eleme. Further out by arrangement.' },
      { id: 'f_f2', question: 'How much is a call-out?', answer: '₦10,000 during working hours, ₦20,000 for emergencies. It’s deducted from the job if you go ahead.' },
      { id: 'f_f3', question: 'Do you guarantee your work?', answer: 'Yes. Labour is guaranteed for 90 days. Parts carry the manufacturer’s warranty.' }]

    })]

  )
};

export const belloAndCo: ExamplePage = {
  id: 'bello-and-co',
  category: 'Professional',
  name: 'Bello & Co. Chartered Accountants',
  city: 'Kano',
  bestFor: 'Firms, consultants and professional services',
  description: 'Services, team, an enquiry form and office location in a restrained, credible style.',
  goals: ['book'],
  styles: ['light', 'editorial'],
  plan: 'business',
  doc: doc(
    'belloandco',
    'Bello & Co. Chartered Accountants',
    'Accounting, tax and advisory for SMEs and NGOs in Northern Nigeria.',
    {
      presetId: 'custom',
      background: '#F5F4F0',
      surface: '#FFFFFF',
      text: '#14213D',
      mutedText: '#4D5670',
      accent: '#14213D',
      accentText: '#FFFFFF',
      fontPair: 'classic',
      buttonShape: 'square',
      buttonStyle: 'outline'
    },
    [
    b('bc_profile', 'profile', {
      name: 'Bello & Co.',
      tagline: 'Chartered accountants for SMEs and NGOs across Northern Nigeria since 2009.',
      avatarUrl: "/26eea00f-36c2-4a11-8bce-adff3c16dd0a.jpg",
      avatarAlt: 'The Bello & Co. office reception with wood panels and a navy wall',
      location: 'Nassarawa GRA, Kano'
    }),
    b('bc_h1', 'heading', { text: 'What we do', level: 'h2' }),
    b('bc_faq', 'faq', {
      title: '',
      items: [
      { id: 'bc_s1', question: 'Bookkeeping & monthly accounts', answer: 'Monthly reconciliations and management accounts you can actually read, delivered by the 10th.' },
      { id: 'bc_s2', question: 'Tax filing & FIRS compliance', answer: 'Company income tax, VAT and PAYE returns filed on time, with a reminder calendar for your team.' },
      { id: 'bc_s3', question: 'Audit & assurance', answer: 'Statutory audits for companies and donor-funded audits for NGOs.' },
      { id: 'bc_s4', question: 'Business advisory', answer: 'Cash-flow planning, pricing reviews and preparing for investment or loans.' }]

    }),
    b('bc_team', 'image', {
      url: "/e187dbcf-378d-4113-9d4f-11e0c6067b98.jpg",
      alt: 'The four partners of Bello & Co. standing together in their office',
      caption: 'Our partners. Members of ICAN and CITN.',
      aspect: '16:9'
    }),
    b('bc_form', 'leadForm', {
      title: 'Book a consultation',
      description: 'Tell us about your organisation. First consultations are free and take about 30 minutes.',
      fields: { name: true, email: true, phone: true, message: true },
      submitLabel: 'Request consultation',
      consentText: 'We keep your details confidential and use them only to respond to this request.'
    }),
    b('bc_loc', 'location', {
      name: 'Our office',
      address: '7 Sultan Road\nNassarawa GRA, Kano',
      timeZone: 'Africa/Lagos',
      hours: hours('08:30', '17:00', [0, 6], { 5: ['08:30', '13:00'] }),
      note: 'Closed for Jumu’ah prayers 1pm–2:30pm on Fridays.'
    }),
    b('bc_contact', 'contact', { phone: '+234 806 555 0174', email: 'enquiries@belloandco.example', address: '', hours: '' }),
    b('bc_social', 'social', { items: [{ id: 'bc_li', platform: 'linkedin', url: 'https://linkedin.com/company/belloandco.example' }] })]

  )
};