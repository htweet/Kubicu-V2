import type { PageTheme } from '../../types/page';
import { b, doc, hours, type ExamplePage } from './build';

/*
 * Country-flavoured starters for Kenya, Ghana and South Africa (D434): food, fashion, services and a creator for each.
 * All businesses, people, prices, numbers and links below are fictional sample content. Prices are in each
 * country's own currency (the page's `currency`), so previews show them as written.
 */

const theme = (background: string, surface: string, text: string, mutedText: string, accent: string, fontPair: PageTheme['fontPair'], buttonShape: PageTheme['buttonShape'] = 'rounded'): PageTheme => ({
  presetId: 'custom',
  background,
  surface,
  text,
  mutedText,
  accent,
  accentText: '#FFFFFF',
  fontPair,
  buttonShape,
  buttonStyle: 'solid',
});

const img = {
  keNyama: 'https://cdn.magicpatterns.com/patterns/generated-images/1204032c-9275-4d39-8796-b4302c5d2d67.jpg',
  keKikoi: 'https://cdn.magicpatterns.com/patterns/generated-images/80c66e62-fda3-403d-9e01-c72aa94aa10d.jpg',
  keClean: 'https://cdn.magicpatterns.com/patterns/generated-images/bf5d076f-c0fb-4116-ac8f-39fd119409b2.jpg',
  keCreator: 'https://cdn.magicpatterns.com/patterns/generated-images/32cc3900-4de5-4c6f-83d9-a0679a01d0c3.jpg',
  ghWaakye: 'https://cdn.magicpatterns.com/patterns/generated-images/04ba5a3a-5005-4984-ba52-40ed6cf6ede2.jpg',
  ghKente: 'https://cdn.magicpatterns.com/patterns/generated-images/63c5de66-62ff-4033-9c07-56797974effd.jpg',
  ghRepair: 'https://cdn.magicpatterns.com/patterns/generated-images/61f35679-f419-48f1-ac06-043eff1ad41d.jpg',
  ghCreator: 'https://cdn.magicpatterns.com/patterns/generated-images/6c25a492-c8ed-48b4-8815-ff32b6aad377.jpg',
  zaKota: 'https://cdn.magicpatterns.com/patterns/generated-images/428ffb77-d178-468f-b8dc-3d204aaea9c0.jpg',
  zaShweshwe: 'https://cdn.magicpatterns.com/patterns/generated-images/19c11f29-3f69-4206-bb81-261f6863f4c4.jpg',
  zaPhoto: 'https://cdn.magicpatterns.com/patterns/generated-images/4f5963e4-7172-477a-8522-58d9eca7cd0c.jpg',
  zaTutor: 'https://cdn.magicpatterns.com/patterns/generated-images/ce6ffac2-e47e-4ab4-bf38-a287b1bbaea8.jpg',
};

const withCurrency = (e: ExamplePage, currency: 'KES' | 'GHS' | 'ZAR'): ExamplePage => ({ ...e, doc: { ...e.doc, currency } });

// ——— Kenya ———

const mamaOliechGrill: ExamplePage = withCurrency({
  id: 'mama-oliech-grill',
  country: 'KE',
  category: 'Food & drink',
  name: 'Mama Oliech Grill',
  city: 'Nairobi',
  bestFor: 'Grills, cafés and home kitchens',
  description: 'Nyama choma menu by the kilo, M-Pesa ordering, pickup hours and a WhatsApp button.',
  goals: ['sell'],
  styles: ['dark', 'bold'],
  plan: 'free',
  doc: doc('mamaoliechgrill', 'Mama Oliech Grill', 'Nyama choma, ugali and kachumbari in Kilimani, Nairobi. Order ahead and pay by M-Pesa.', theme('#1A120D', '#2A1D15', '#FBEFE3', '#CDB7A3', '#E0812D', 'statement'), [
    b('ke1_profile', 'profile', { name: 'Mama Oliech Grill', tagline: 'Goat and beef grilled slow over charcoal since 2012. Order ahead, skip the wait.', avatarUrl: img.keNyama, avatarAlt: 'Grilled nyama choma with kachumbari and ugali on a wooden board', location: 'Kilimani, Nairobi' }, { align: 'center' }),
    b('ke1_menu', 'menu', {
      title: 'Today’s grill',
      note: 'Weighed raw, served grilled. Delivery within Kilimani and Lavington from KSh 200. Pay by M-Pesa.',
      whatsappPhone: '+254 712 555 014',
      orderingOpen: true,
      closedMessage: 'The grill is off for today. We light up again at 12 noon.',
      categories: [
        { id: 'ke1_c1', name: 'Nyama choma', items: [
          { id: 'ke1_i1', name: 'Goat, ½ kg', description: 'With kachumbari', priceNgn: 900, tags: 'Most ordered', available: true },
          { id: 'ke1_i2', name: 'Beef, ½ kg', description: 'With kachumbari', priceNgn: 800, tags: '', available: true },
          { id: 'ke1_i3', name: 'Chicken, whole', description: 'Charcoal-grilled, pili pili on the side', priceNgn: 1200, tags: 'Spicy', available: false },
        ] },
        { id: 'ke1_c2', name: 'Sides', items: [
          { id: 'ke1_i4', name: 'Ugali', description: '', priceNgn: 100, tags: '', available: true },
          { id: 'ke1_i5', name: 'Mukimo', description: 'Potato, peas and greens', priceNgn: 200, tags: 'Vegetarian', available: true },
        ] },
      ],
    }),
    b('ke1_loc', 'location', { name: 'The grill', address: 'Argwings Kodhek Road\nKilimani, Nairobi', timeZone: 'Africa/Nairobi', hours: hours('12:00', '22:00', [1]), note: 'Orders after 9pm are for pickup only.' }),
    b('ke1_faq', 'faq', { title: 'Ordering', items: [
      { id: 'ke1_f1', question: 'How do I pay?', answer: 'By M-Pesa when you order. If the prompt doesn’t come, use our Paybill — the number is shown at checkout.' },
      { id: 'ke1_f2', question: 'Do you cater for events?', answer: 'Yes, for 20 to 150 guests. Message us at least five days ahead.' },
    ] }),
    b('ke1_wa', 'whatsapp', { label: 'Order on WhatsApp', phone: '+254 712 555 014', message: 'Hi Mama Oliech, I’d like to order…' }, { align: 'center' }),
  ]),
}, 'KES');

const pwaniKikoi: ExamplePage = withCurrency({
  id: 'pwani-kikoi',
  country: 'KE',
  category: 'Fashion',
  name: 'Pwani Kikoi Co.',
  city: 'Mombasa',
  bestFor: 'Fabric shops and fashion makers',
  description: 'Kikoi and shuka price list, delivery across Kenya, and custom orders by WhatsApp.',
  goals: ['sell', 'showcase'],
  styles: ['light'],
  plan: 'creator',
  doc: doc('pwanikikoi', 'Pwani Kikoi Co.', 'Hand-loomed kikois and shukas from Old Town, Mombasa. Delivered across Kenya.', theme('#F3F8F8', '#FFFFFF', '#0E2B33', '#4C6A72', '#1F7A8C', 'classic', 'pill'), [
    b('ke2_profile', 'profile', { name: 'Pwani Kikoi Co.', tagline: 'Hand-loomed kikois and shukas from the coast. Light, soft, made to last.', avatarUrl: img.keKikoi, avatarAlt: 'Folded striped kikois in ocean blue and coral on a white bench', location: 'Old Town, Mombasa' }, { align: 'center' }),
    b('ke2_hero', 'image', { url: img.keKikoi, alt: 'Stack of striped kikoi cloths in blue, coral and sand colours', caption: 'New season colours: reef, sunset and sand', aspect: '4:5' }),
    b('ke2_pricing', 'pricing', { title: 'Prices', packages: [
      { id: 'ke2_p1', name: 'Classic kikoi', priceNgn: 1500, unit: 'each', description: 'Cotton, fringed ends.', features: '100 × 165 cm\nTen stripe colourways', ctaLabel: 'Order', url: 'https://wa.me/254733555021', highlighted: true },
      { id: 'ke2_p2', name: 'Maasai shuka', priceNgn: 1200, unit: 'each', description: 'Warm checked wrap.', features: '150 × 200 cm\nRed, blue or green check', ctaLabel: 'Order', url: 'https://wa.me/254733555021', highlighted: false },
      { id: 'ke2_p3', name: 'Beach set', priceNgn: 3800, unit: '', description: 'Kikoi, tote and towel.', features: 'Gift-wrapped\nPick your colours', ctaLabel: 'Order', url: 'https://wa.me/254733555021', highlighted: false },
    ] }),
    b('ke2_faq', 'faq', { title: 'Delivery', items: [
      { id: 'ke2_f1', question: 'Do you deliver outside Mombasa?', answer: 'Yes. Nairobi in 2 days by courier from KSh 350; elsewhere in Kenya in 2–4 days.' },
      { id: 'ke2_f2', question: 'Can I order a custom colour?', answer: 'For 10 pieces or more. Message us your colours and we’ll send a sample photo first.' },
    ] }),
    b('ke2_wa', 'whatsapp', { label: 'Ask about colours', phone: '+254 733 555 021', message: 'Hi Pwani Kikoi, do you have…' }, { align: 'center' }),
  ]),
}, 'KES');

const safiHomeCare: ExamplePage = withCurrency({
  id: 'safi-home-care',
  country: 'KE',
  category: 'Home services',
  name: 'Safi Home Care',
  city: 'Nairobi',
  bestFor: 'Cleaners, handymen and home services',
  description: 'Cleaning packages, online booking with an M-Pesa deposit, service areas and reviews.',
  goals: ['book'],
  styles: ['light'],
  plan: 'pro',
  doc: doc('safihomecare', 'Safi Home Care', 'Trusted home and office cleaning in Westlands, Kileleshwa and Lavington. Book online.', theme('#F5FBF7', '#FFFFFF', '#103322', '#4A6B5A', '#1D7A4C', 'modern', 'pill'), [
    b('ke3_profile', 'profile', { name: 'Safi Home Care', tagline: 'Vetted, insured cleaners who arrive on time with their own supplies.', avatarUrl: img.keClean, avatarAlt: 'Smiling cleaner in a teal polo holding cleaning supplies in a bright living room', location: 'Westlands, Nairobi' }, { align: 'center' }),
    b('ke3_book', 'booking', { title: 'Book a clean', description: 'Pick a package and a time. A KSh 500 M-Pesa deposit holds your slot.', duration: '2–6 hrs', priceNote: 'Deposit KSh 500', ctaLabel: 'See free times', url: 'https://book.example/safihomecare' }),
    b('ke3_pricing', 'pricing', { title: 'Packages', packages: [
      { id: 'ke3_p1', name: 'Standard clean', priceNgn: 2500, unit: '1–2 bedrooms', description: '', features: 'Kitchen, bathrooms, floors and dusting\nAbout 3 hours', ctaLabel: 'Book', url: 'https://book.example/safihomecare/standard', highlighted: true },
      { id: 'ke3_p2', name: 'Deep clean', priceNgn: 6000, unit: '1–3 bedrooms', description: 'Moving in or out.', features: 'Inside cupboards, oven and windows\nAbout 6 hours', ctaLabel: 'Book', url: 'https://book.example/safihomecare/deep', highlighted: false },
    ] }),
    b('ke3_test', 'testimonial', { quote: 'They came on time, worked quietly and my flat has never looked better. Booking and paying took two minutes.', name: 'Wanjiru K.', role: 'Client in Kileleshwa', source: 'Google review, quoted with permission', avatarUrl: '', avatarAlt: '', permission: true }),
    b('ke3_wa', 'whatsapp', { label: 'Ask a question', phone: '+254 722 555 038', message: 'Hi Safi Home Care, I’d like to ask about…' }, { align: 'center' }),
  ]),
}, 'KES');

const kevoOnTheRoad: ExamplePage = withCurrency({
  id: 'kevo-on-the-road',
  country: 'KE',
  category: 'Creator',
  name: 'Kevo on the Road',
  city: 'Nairobi',
  bestFor: 'Video creators and storytellers',
  description: 'Latest videos, brand work, a media kit link and a tip jar by M-Pesa.',
  goals: ['audience', 'support'],
  styles: ['bold', 'dark'],
  plan: 'free',
  doc: doc('kevoontheroad', 'Kevo on the Road', 'Stories from Nairobi’s matatu culture, street food and weekend trips. New video every Friday.', theme('#14102A', '#211B3D', '#F4F1FF', '#B8B0DA', '#F2C230', 'statement', 'pill'), [
    b('ke4_profile', 'profile', { name: 'Kevo on the Road', tagline: 'Matatu art, street food and weekend trips. New video every Friday.', avatarUrl: img.keCreator, avatarAlt: 'Young creator filming on a phone gimbal in front of colourful matatu art', location: 'Nairobi' }, { align: 'center' }),
    b('ke4_l1', 'link', { label: 'Watch: The loudest matatu in Nairobi', url: 'https://youtube.com/@kevoontheroad.example', description: 'New this Friday' }, { align: 'center', emphasis: 'featured' }),
    b('ke4_l2', 'link', { label: 'Work with me — media kit', url: 'https://kevoontheroad.example/media-kit', description: 'Audience, rates and past partners' }, { align: 'center' }),
    b('ke4_l3', 'link', { label: 'Buy me a chai (M-Pesa tip)', url: 'https://kub.icu/kevoontheroad/tip', description: 'From KSh 50' }, { align: 'center' }),
    b('ke4_social', 'social', { items: [
      { id: 'ke4_yt', platform: 'youtube', url: 'https://youtube.com/@kevoontheroad.example' },
      { id: 'ke4_tt', platform: 'tiktok', url: 'https://tiktok.com/@kevoontheroad.example' },
      { id: 'ke4_ig', platform: 'instagram', url: 'https://instagram.com/kevoontheroad.example' },
    ] }, { align: 'center' }),
  ]),
}, 'KES');

// ——— Ghana ———

const auntieAmaWaakye: ExamplePage = withCurrency({
  id: 'auntie-ama-waakye',
  country: 'GH',
  category: 'Food & drink',
  name: 'Auntie Ama’s Waakye',
  city: 'Accra',
  bestFor: 'Chop bars, caterers and street food',
  description: 'Morning waakye menu, mobile money ordering, pickup and delivery across Osu.',
  goals: ['sell'],
  styles: ['light', 'bold'],
  plan: 'free',
  doc: doc('auntieamawaakye', 'Auntie Ama’s Waakye', 'Waakye, kelewele and shito every morning in Osu, Accra. Order ahead and pay by mobile money.', theme('#FFF7E6', '#FFFFFF', '#2B1A06', '#6E5233', '#B4400F', 'statement'), [
    b('gh1_profile', 'profile', { name: 'Auntie Ama’s Waakye', tagline: 'Waakye the way it should be — from 6am until it finishes.', avatarUrl: img.ghWaakye, avatarAlt: 'Plate of waakye with shito, gari, egg and kelewele on a leaf', location: 'Osu, Accra' }, { align: 'center' }),
    b('gh1_menu', 'menu', {
      title: 'This morning',
      note: 'Delivery within Osu, Labone and Cantonments from GH₵ 15. Pay with MTN MoMo, Telecel Cash or AirtelTigo Money.',
      whatsappPhone: '+233 24 555 0142',
      orderingOpen: true,
      closedMessage: 'We’re sold out for today. See you from 6am tomorrow.',
      categories: [
        { id: 'gh1_c1', name: 'Waakye', items: [
          { id: 'gh1_i1', name: 'Waakye full plate', description: 'With egg, wele, spaghetti, gari and shito', priceNgn: 60, tags: 'Most ordered', available: true },
          { id: 'gh1_i2', name: 'Waakye + fish', description: 'With fried fish and shito', priceNgn: 55, tags: '', available: true },
        ] },
        { id: 'gh1_c2', name: 'Sides & drinks', items: [
          { id: 'gh1_i3', name: 'Kelewele', description: 'Spiced fried plantain', priceNgn: 20, tags: 'Vegetarian', available: true },
          { id: 'gh1_i4', name: 'Sobolo (50cl)', description: 'Hibiscus with ginger', priceNgn: 12, tags: '', available: false },
        ] },
      ],
    }),
    b('gh1_loc', 'location', { name: 'Pickup', address: 'Oxford Street, near the junction\nOsu, Accra', timeZone: 'Africa/Accra', hours: hours('06:00', '13:00', [0]), note: 'We close early when the pot is empty.' }),
    b('gh1_wa', 'whatsapp', { label: 'Order on WhatsApp', phone: '+233 24 555 0142', message: 'Hi Auntie Ama, I’d like to order…' }, { align: 'center' }),
  ]),
}, 'GHS');

const bonwireKenteHouse: ExamplePage = withCurrency({
  id: 'bonwire-kente-house',
  country: 'GH',
  category: 'Fashion',
  name: 'Bonwire Kente House',
  city: 'Kumasi',
  bestFor: 'Weavers, makers and made-to-order fashion',
  description: 'Hand-woven kente by the piece, made-to-order deposits, weaving times and the story behind each pattern.',
  goals: ['sell', 'showcase'],
  styles: ['editorial'],
  plan: 'creator',
  doc: doc('bonwirekentehouse', 'Bonwire Kente House', 'Hand-woven kente from Bonwire, near Kumasi. Stoles, strips and full cloths, made to order.', theme('#FBF6EA', '#FFFFFF', '#1F1608', '#6A5734', '#0F6B3A', 'classic'), [
    b('gh2_profile', 'profile', { name: 'Bonwire Kente House', tagline: 'Three generations of weavers. Every strip is woven by hand on our looms.', avatarUrl: img.ghKente, avatarAlt: 'Weaver’s hands on a wooden loom with gold, green and red kente', location: 'Bonwire, near Kumasi' }, { align: 'center' }),
    b('gh2_hero', 'image', { url: img.ghKente, alt: 'Kente weaver working at a traditional loom', caption: 'Weaving “Adwinasa” — it takes about two weeks for a full cloth', aspect: '4:5' }),
    b('gh2_pricing', 'pricing', { title: 'Made to order', packages: [
      { id: 'gh2_p1', name: 'Graduation stole', priceNgn: 350, unit: '', description: 'Your name and year woven in.', features: 'Ready in 7 days\n50% deposit to start', ctaLabel: 'Order', url: 'https://wa.me/233205550188', highlighted: true },
      { id: 'gh2_p2', name: 'Kente strip set', priceNgn: 900, unit: '12 strips', description: 'For a dress or shirt.', features: 'Ready in 10 days\nPick your pattern', ctaLabel: 'Order', url: 'https://wa.me/233205550188', highlighted: false },
      { id: 'gh2_p3', name: 'Full cloth', priceNgn: 4500, unit: '', description: 'For weddings and naming ceremonies.', features: 'Ready in 3–4 weeks\nPhotos as it’s woven', ctaLabel: 'Enquire', url: 'https://wa.me/233205550188', highlighted: false },
    ] }),
    b('gh2_faq', 'faq', { title: 'Good to know', items: [
      { id: 'gh2_f1', question: 'Do you ship abroad?', answer: 'Within Ghana by courier from GH₵ 40. Ask us about other countries.' },
      { id: 'gh2_f2', question: 'Can I visit the looms?', answer: 'Yes, Monday to Saturday. Message ahead so a weaver can show you round.' },
    ] }),
    b('gh2_wa', 'whatsapp', { label: 'Talk to a weaver', phone: '+233 20 555 0188', message: 'Hello Bonwire Kente House, I’d like…' }, { align: 'center' }),
  ]),
}, 'GHS');

const fixamFonesAccra: ExamplePage = withCurrency({
  id: 'fixam-fones-accra',
  country: 'GH',
  category: 'Repairs',
  name: 'Fixam Fones',
  city: 'Accra',
  bestFor: 'Repair shops and technicians',
  description: 'Repair prices by model, same-day booking, a 90-day warranty and directions.',
  goals: ['book'],
  styles: ['light'],
  plan: 'pro',
  doc: doc('fixamfones', 'Fixam Fones', 'Phone screen, battery and charging-port repairs in Kaneshie, Accra. Most fixed the same day.', theme('#F4F6FA', '#FFFFFF', '#0F1A2E', '#4D5B76', '#2152C5', 'modern'), [
    b('gh3_profile', 'profile', { name: 'Fixam Fones', tagline: 'Screens, batteries and charging ports — most phones fixed while you wait.', avatarUrl: img.ghRepair, avatarAlt: 'Technician repairing a smartphone at a tidy workbench', location: 'Kaneshie, Accra' }, { align: 'center' }),
    b('gh3_book', 'booking', { title: 'Book a repair', description: 'Choose a time and drop your phone in. Pay when it’s fixed.', duration: '30–90 min', priceNote: 'From GH₵ 150', ctaLabel: 'See free times', url: 'https://book.example/fixamfones' }),
    b('gh3_pricing', 'pricing', { title: 'Popular repairs', packages: [
      { id: 'gh3_p1', name: 'Screen replacement', priceNgn: 450, unit: 'from', description: 'Samsung, Tecno, Infinix, iPhone.', features: 'About 1 hour\n90-day warranty', ctaLabel: 'Book', url: 'https://book.example/fixamfones/screen', highlighted: true },
      { id: 'gh3_p2', name: 'New battery', priceNgn: 250, unit: 'from', description: '', features: 'About 30 minutes\n90-day warranty', ctaLabel: 'Book', url: 'https://book.example/fixamfones/battery', highlighted: false },
    ] }),
    b('gh3_loc', 'location', { name: 'The shop', address: 'Kaneshie Market Complex, ground floor\nAccra', timeZone: 'Africa/Accra', hours: hours('08:30', '18:30', [0]), note: '' }),
    b('gh3_wa', 'whatsapp', { label: 'Get a quote', phone: '+233 55 555 0119', message: 'Hi Fixam Fones, my phone is a… and the problem is…' }, { align: 'center' }),
  ]),
}, 'GHS');

const kojoStrings: ExamplePage = withCurrency({
  id: 'kojo-strings',
  country: 'GH',
  category: 'Musician',
  name: 'Kojo Strings',
  city: 'Accra',
  bestFor: 'Musicians and performers',
  description: 'New release, live dates, booking for events and a link to guitar lessons.',
  goals: ['audience', 'book'],
  styles: ['dark', 'editorial'],
  plan: 'creator',
  doc: doc('kojostrings', 'Kojo Strings', 'Highlife guitarist from Accra. New EP out now; booking for weddings and events.', theme('#160F08', '#24190E', '#FCEFD8', '#D2B88E', '#E3A72F', 'expressive', 'pill'), [
    b('gh4_profile', 'profile', { name: 'Kojo Strings', tagline: 'Palm-wine highlife with a modern groove. Live on rooftops across Accra.', avatarUrl: img.ghCreator, avatarAlt: 'Guitarist smiling with an acoustic guitar on a rooftop at sunset', location: 'Accra' }, { align: 'center' }),
    b('gh4_l1', 'link', { label: 'Listen: “Osu Evenings” EP', url: 'https://open.spotify.com/artist/kojostrings.example', description: 'Out now everywhere' }, { align: 'center', emphasis: 'featured' }),
    b('gh4_l2', 'link', { label: 'Book Kojo for your event', url: 'https://kub.icu/kojostrings/book', description: 'Weddings, launches and dinners' }, { align: 'center' }),
    b('gh4_l3', 'link', { label: 'Guitar lessons — GH₵ 120 an hour', url: 'https://kub.icu/kojostrings/lessons', description: 'Beginners welcome' }, { align: 'center' }),
    b('gh4_social', 'social', { items: [
      { id: 'gh4_ig', platform: 'instagram', url: 'https://instagram.com/kojostrings.example' },
      { id: 'gh4_yt', platform: 'youtube', url: 'https://youtube.com/@kojostrings.example' },
    ] }, { align: 'center' }),
  ]),
}, 'GHS');

// ——— South Africa ———

const thandisKotaKitchen: ExamplePage = withCurrency({
  id: 'thandis-kota-kitchen',
  country: 'ZA',
  category: 'Food & drink',
  name: 'Thandi’s Kota Kitchen',
  city: 'Soweto',
  bestFor: 'Takeaways, food trucks and kasi kitchens',
  description: 'Kota menu with sold-out items, card and instant EFT ordering, and trading hours.',
  goals: ['sell'],
  styles: ['bold'],
  plan: 'free',
  doc: doc('thandiskota', 'Thandi’s Kota Kitchen', 'Kotas, chips and vetkoek in Orlando West, Soweto. Order ahead for pickup or delivery.', theme('#FFF4D6', '#FFFFFF', '#241500', '#6B5326', '#D2401F', 'statement'), [
    b('za1_profile', 'profile', { name: 'Thandi’s Kota Kitchen', tagline: 'Proper kotas, loaded the kasi way. Order ahead — no queue.', avatarUrl: img.zaKota, avatarAlt: 'Kota bread loaf filled with chips, polony, cheese, egg and atchar', location: 'Orlando West, Soweto' }, { align: 'center' }),
    b('za1_menu', 'menu', {
      title: 'Kotas & more',
      note: 'Delivery within Orlando, Dube and Phefeni from R 25. Pay by card or instant EFT.',
      whatsappPhone: '+27 82 555 0164',
      orderingOpen: true,
      closedMessage: 'We’re closed now. Back tomorrow at 10am.',
      categories: [
        { id: 'za1_c1', name: 'Kotas', items: [
          { id: 'za1_i1', name: 'Classic kota', description: 'Chips, polony, cheese and atchar', priceNgn: 45, tags: 'Most ordered', available: true },
          { id: 'za1_i2', name: 'Full house', description: 'Classic plus russian, egg and Vienna', priceNgn: 75, tags: '', available: true },
          { id: 'za1_i3', name: 'Veggie kota', description: 'Chips, cheese, egg and chakalaka', priceNgn: 45, tags: 'Vegetarian', available: false },
        ] },
        { id: 'za1_c2', name: 'Sides', items: [
          { id: 'za1_i4', name: 'Vetkoek with mince', description: '', priceNgn: 30, tags: '', available: true },
          { id: 'za1_i5', name: 'Large chips', description: '', priceNgn: 25, tags: '', available: true },
        ] },
      ],
    }),
    b('za1_loc', 'location', { name: 'Pickup', address: 'Vilakazi Street, near the corner\nOrlando West, Soweto', timeZone: 'Africa/Johannesburg', hours: hours('10:00', '21:00', [], { 0: ['11:00', '18:00'] }), note: 'Load-shedding? We still trade — our grill is on gas.' }),
    b('za1_wa', 'whatsapp', { label: 'Order on WhatsApp', phone: '+27 82 555 0164', message: 'Hi Thandi, I’d like to order…' }, { align: 'center' }),
  ]),
}, 'ZAR');

const indigoShweshwe: ExamplePage = withCurrency({
  id: 'indigo-shweshwe',
  country: 'ZA',
  category: 'Fashion',
  name: 'Indigo & Shweshwe',
  city: 'Johannesburg',
  bestFor: 'Designers and boutiques',
  description: 'Modern shweshwe collection, sizes and fitting appointments, and nationwide delivery.',
  goals: ['sell', 'book'],
  styles: ['editorial', 'light'],
  plan: 'pro',
  doc: doc('indigoshweshwe', 'Indigo & Shweshwe', 'Modern shweshwe dresses and two-pieces, designed in Melville, Johannesburg. Delivered nationwide.', theme('#F2F4FA', '#FFFFFF', '#121A3A', '#4E5675', '#2A3D99', 'expressive'), [
    b('za2_profile', 'profile', { name: 'Indigo & Shweshwe', tagline: 'Heritage print, modern cut. Small batches, made in Johannesburg.', avatarUrl: img.zaShweshwe, avatarAlt: 'Indigo shweshwe dress with white geometric print on a mannequin', location: 'Melville, Johannesburg' }, { align: 'center' }),
    b('za2_hero', 'image', { url: img.zaShweshwe, alt: 'Shweshwe wrap dress in indigo with fine white pattern', caption: 'The Lerato wrap dress — sizes 30 to 44', aspect: '4:5' }),
    b('za2_pricing', 'pricing', { title: 'The collection', packages: [
      { id: 'za2_p1', name: 'Lerato wrap dress', priceNgn: 1250, unit: '', description: 'Midi length, tie waist.', features: 'Sizes 30–44\nShips in 3 days', ctaLabel: 'Order', url: 'https://kub.icu/indigoshweshwe/shop', highlighted: true },
      { id: 'za2_p2', name: 'Two-piece set', priceNgn: 1450, unit: '', description: 'Cropped top and wide-leg pants.', features: 'Sizes 30–42\nShips in 3 days', ctaLabel: 'Order', url: 'https://kub.icu/indigoshweshwe/shop', highlighted: false },
    ] }),
    b('za2_book', 'booking', { title: 'Book a fitting', description: 'Try the collection at the studio, or book a custom fit for a wedding or graduation.', duration: '45 min', priceNote: 'Free fitting', ctaLabel: 'See free times', url: 'https://book.example/indigoshweshwe' }),
    b('za2_faq', 'faq', { title: 'Delivery & returns', items: [
      { id: 'za2_f1', question: 'Do you deliver outside Johannesburg?', answer: 'Yes, nationwide by courier in 2–4 working days from R 99, or collect from the studio.' },
      { id: 'za2_f2', question: 'Can I return it?', answer: 'Unworn items within 14 days for an exchange or store credit. Custom pieces can’t be returned.' },
    ] }),
  ]),
}, 'ZAR');

const sipho_lens: ExamplePage = withCurrency({
  id: 'sipho-lens',
  country: 'ZA',
  category: 'Photographer',
  name: 'Sipho Lens',
  city: 'Cape Town',
  bestFor: 'Photographers and videographers',
  description: 'Portfolio highlights, session packages with deposits, and enquiry for weddings.',
  goals: ['book', 'showcase'],
  styles: ['dark', 'editorial'],
  plan: 'creator',
  doc: doc('sipholens', 'Sipho Lens', 'Portrait, couple and wedding photography in Cape Town. Book a session online.', theme('#0F1214', '#1A1F22', '#F1F4F5', '#A9B4B8', '#E58A4B', 'expressive', 'pill'), [
    b('za3_profile', 'profile', { name: 'Sipho Lens', tagline: 'Golden-hour portraits and honest wedding stories, from Signal Hill to the Winelands.', avatarUrl: img.zaPhoto, avatarAlt: 'Photographer with a camera on Signal Hill with Table Mountain behind', location: 'Cape Town' }, { align: 'center' }),
    b('za3_book', 'booking', { title: 'Book a session', description: 'Choose a package and date. A R 500 deposit secures it; the rest is due on the day.', duration: '1–8 hrs', priceNote: 'Deposit R 500', ctaLabel: 'Check dates', url: 'https://book.example/sipholens' }),
    b('za3_pricing', 'pricing', { title: 'Packages', packages: [
      { id: 'za3_p1', name: 'Golden-hour portrait', priceNgn: 1800, unit: '1 hour', description: '', features: '30 edited photos\nOne location\nGallery in 7 days', ctaLabel: 'Book', url: 'https://book.example/sipholens/portrait', highlighted: true },
      { id: 'za3_p2', name: 'Couple shoot', priceNgn: 2800, unit: '2 hours', description: 'Engagements and anniversaries.', features: '60 edited photos\nTwo locations', ctaLabel: 'Book', url: 'https://book.example/sipholens/couple', highlighted: false },
      { id: 'za3_p3', name: 'Wedding day', priceNgn: 18000, unit: 'from', description: '', features: 'Up to 8 hours\nSecond shooter\nPrinted album', ctaLabel: 'Enquire', url: 'https://book.example/sipholens/wedding', highlighted: false },
    ] }),
    b('za3_test', 'testimonial', { quote: 'Sipho made us forget the camera was there. The Signal Hill photos are on every wall of our home.', name: 'Naledi & Pieter', role: 'Married in Franschhoek', source: 'Quoted with permission', avatarUrl: '', avatarAlt: '', permission: true }),
    b('za3_social', 'social', { items: [{ id: 'za3_ig', platform: 'instagram', url: 'https://instagram.com/sipholens.example' }] }, { align: 'center' }),
  ]),
}, 'ZAR');

const mathsWithMsZulu: ExamplePage = withCurrency({
  id: 'maths-with-ms-zulu',
  country: 'ZA',
  category: 'Education',
  name: 'Maths with Ms Zulu',
  city: 'Durban',
  bestFor: 'Tutors and teachers',
  description: 'Matric maths and science tutoring, term packages, online or in person, and parent FAQs.',
  goals: ['book'],
  styles: ['light'],
  plan: 'creator',
  doc: doc('mathswithmszulu', 'Maths with Ms Zulu', 'Grade 10–12 maths and physical sciences tutoring in Durban and online. CAPS and IEB.', theme('#F6F8FF', '#FFFFFF', '#14183A', '#525A7E', '#5A3FD6', 'modern', 'pill'), [
    b('za4_profile', 'profile', { name: 'Maths with Ms Zulu', tagline: 'Grade 10–12 maths and physical sciences. Calm, clear and exam-ready.', avatarUrl: img.zaTutor, avatarAlt: 'Tutor explaining an equation to a learner at a table with books', location: 'Morningside, Durban' }, { align: 'center' }),
    b('za4_book', 'booking', { title: 'Book a lesson', description: 'One-on-one, online or at my study in Morningside.', duration: '1 hr', priceNote: 'From R 250', ctaLabel: 'See free times', url: 'https://book.example/mathswithmszulu' }),
    b('za4_pricing', 'pricing', { title: 'Term packages', packages: [
      { id: 'za4_p1', name: 'Weekly lessons', priceNgn: 2000, unit: 'per term', description: 'One hour a week.', features: '10 lessons\nProgress note each month', ctaLabel: 'Book', url: 'https://book.example/mathswithmszulu/term', highlighted: true },
      { id: 'za4_p2', name: 'Exam crash course', priceNgn: 1500, unit: '', description: 'Before trials or finals.', features: '6 lessons over 2 weeks\nPast papers worked through', ctaLabel: 'Book', url: 'https://book.example/mathswithmszulu/exam', highlighted: false },
    ] }),
    b('za4_faq', 'faq', { title: 'For parents', items: [
      { id: 'za4_f1', question: 'Which curriculum?', answer: 'CAPS and IEB, Grade 10 to 12. I also help with Grade 9 maths before subject choices.' },
      { id: 'za4_f2', question: 'What if we miss a lesson?', answer: 'Let me know 24 hours before and we’ll move it. Later than that, the lesson counts.' },
    ] }),
    b('za4_wa', 'whatsapp', { label: 'Ask about a slot', phone: '+27 72 555 0175', message: 'Hi Ms Zulu, my child is in Grade…' }, { align: 'center' }),
  ]),
}, 'ZAR');

export const countryStarters: ExamplePage[] = [
  mamaOliechGrill,
  pwaniKikoi,
  safiHomeCare,
  kevoOnTheRoad,
  auntieAmaWaakye,
  bonwireKenteHouse,
  fixamFonesAccra,
  kojoStrings,
  thandisKotaKitchen,
  indigoShweshwe,
  sipho_lens,
  mathsWithMsZulu,
];
