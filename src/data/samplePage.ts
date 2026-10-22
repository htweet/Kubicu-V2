import type { PageDocument } from '../types/page';

const base = {
  schemaVersion: 1,
  layout: { spacing: 'normal' as const },
  behaviour: { trackClicks: true, openInNewTab: true },
  visibility: { hidden: false },
  accessibility: { label: '' },
  createdAt: '2026-10-14T09:00:00.000Z',
  updatedAt: '2026-10-19T16:20:00.000Z'
};

/**
 * Fictional sample business used across the prototype.
 * Names, prices, phone numbers, policies and URLs are illustrative only.
 */
export const samplePage: PageDocument = {
  id: 'page_adaeze',
  schemaVersion: 1,
  handle: 'adaeze',
  title: 'Adaeze Atelier',
  updatedAt: '2026-10-19T16:20:00.000Z',
  seo: {
    title: 'Adaeze Atelier — Ready-to-wear, made in Lagos',
    description: 'Shop the Harmattan drop, book a studio fitting and order on WhatsApp.'
  },
  theme: {
    presetId: 'noirCream',
    background: '#F3EDE3',
    surface: '#FBF8F2',
    text: '#121212',
    mutedText: '#5E574D',
    accent: '#121212',
    accentText: '#F3EDE3',
    fontPair: 'editorial',
    buttonShape: 'pill',
    buttonStyle: 'solid'
  },
  blocks: [
  {
    ...base,
    id: 'blk_profile',
    type: 'profile',
    style: { align: 'center', emphasis: 'default' },
    content: {
      name: 'Adaeze Atelier',
      tagline: 'Ready-to-wear for women who move through Lagos with intent. Cut and finished in our Lekki studio.',
      avatarUrl: "/c01c9bfe-5e09-4298-b9e1-e72395313856.jpg",
      avatarAlt: 'Adaeze, founder of Adaeze Atelier, in a cream linen blazer',
      location: 'Lekki Phase 1, Lagos'
    }
  },
  {
    ...base,
    id: 'blk_drop',
    type: 'link',
    style: { align: 'center', emphasis: 'featured' },
    content: {
      label: 'Shop the Harmattan drop',
      url: 'https://adaezeatelier.example/harmattan',
      description: '12 pieces in linen and cotton voile'
    }
  },
  {
    ...base,
    id: 'blk_product',
    type: 'product',
    style: { align: 'left', emphasis: 'default' },
    content: {
      name: 'Ìfé linen two-piece',
      priceNgn: 68000,
      description: 'Wide-leg trousers and a cropped wrap top in breathable cream linen with black piping. Sizes 6–18.',
      imageUrl: "/f4c7271f-cc76-4053-9771-c898db966afb.jpg",
      imageAlt: 'Model wearing the cream Ìfé linen two-piece against a black backdrop',
      badge: 'New drop',
      ctaLabel: 'Order on WhatsApp',
      ctaAction: 'whatsapp',
      url: '',
      whatsappPhone: '+234 803 123 4567'
    }
  },
  {
    ...base,
    id: 'blk_grid',
    type: 'productGrid',
    style: { align: 'left', emphasis: 'default' },
    content: {
      title: 'Also in the drop',
      orderAction: 'whatsapp',
      whatsappPhone: '+234 803 123 4567',
      ctaLabel: 'Order',
      items: [
      {
        id: 'gp_wrap',
        name: 'Voile wrap blouse',
        priceNgn: 32000,
        imageUrl: "/897f481d-af30-4d86-8e3d-0c44ea17f0e1.jpg",
        imageAlt: 'Cream cotton voile wrap blouse with black stitching on a hanger',
        note: 'Sizes 6–18',
        soldOut: false,
        url: ''
      },
      {
        id: 'gp_trousers',
        name: 'Black linen trousers',
        priceNgn: 38000,
        imageUrl: "/9e6a2dd6-fe8c-4011-bc3c-12beb45a6526.jpg",
        imageAlt: 'Folded black wide-leg linen trousers with a cream swatch',
        note: 'Sizes 6–18',
        soldOut: true,
        url: ''
      }]

    }
  },
  {
    ...base,
    id: 'blk_whatsapp',
    type: 'whatsapp',
    style: { align: 'center', emphasis: 'default' },
    content: {
      label: 'Ask about sizing on WhatsApp',
      phone: '+234 803 123 4567',
      message: 'Hi Adaeze Atelier, I’d like help choosing a size.'
    }
  },
  {
    ...base,
    id: 'blk_booking',
    type: 'booking',
    style: { align: 'left', emphasis: 'default' },
    content: {
      title: 'Book a fitting at the studio',
      description: 'Try the collection on and have adjustments pinned by our tailor.',
      duration: '45 min',
      priceNote: 'Free with any purchase',
      ctaLabel: 'Choose a time',
      url: 'https://adaezeatelier.example/fittings'
    }
  },
  {
    ...base,
    id: 'blk_heading_studio',
    type: 'heading',
    style: { align: 'left', emphasis: 'default' },
    content: { text: 'The studio', level: 'h2' }
  },
  {
    ...base,
    id: 'blk_story',
    type: 'text',
    style: { align: 'left', emphasis: 'default' },
    content: {
      body: 'We design for heat, traffic and long days — fabrics that breathe, cuts that hold their shape, and finishing you can feel. Every piece is made in small runs by a team of six in Lekki.'
    }
  },
  {
    ...base,
    id: 'blk_image',
    type: 'image',
    style: { align: 'left', emphasis: 'default' },
    content: {
      url: "/904aab49-c0be-40d9-a5b1-ebbc391aafc3.jpg",
      alt: 'A rail of cream and black garments beside a tailoring table in the Adaeze Atelier studio',
      caption: 'The Lekki studio, open for fittings Tuesday to Saturday.',
      aspect: '4:5'
    }
  },
  {
    ...base,
    id: 'blk_gallery',
    type: 'gallery',
    style: { align: 'left', emphasis: 'default' },
    content: {
      title: 'Lookbook',
      layout: 'grid',
      images: [
      {
        id: 'img_look1',
        url: "/8dbf748f-3ff9-46f2-ab30-51a790fef204.jpg",
        alt: 'Model in a flowing black linen dress with cream piping against a cream wall'
      },
      {
        id: 'img_look2',
        url: "/a824e7f3-d92e-4cd8-8729-bd71dabce9b5.jpg",
        alt: 'A tailor’s hands pinning cream linen on a dress form'
      }]

    }
  },
  {
    ...base,
    id: 'blk_faq',
    type: 'faq',
    style: { align: 'left', emphasis: 'default' },
    content: {
      title: 'Delivery & pickup',
      items: [
      {
        id: 'faq_1',
        question: 'Do you deliver outside Lagos?',
        answer: 'Yes. We dispatch nationwide through a courier partner. The fee and delivery window are confirmed on WhatsApp before you pay.'
      },
      {
        id: 'faq_2',
        question: 'Can I pick up my order?',
        answer: 'Pickup is available at the Lekki studio, Tuesday to Saturday, 10am–6pm.'
      },
      {
        id: 'faq_3',
        question: 'What if it doesn’t fit?',
        answer: 'Unworn pieces can be exchanged within 7 days. Alterations at the studio are free for 30 days after purchase.'
      }]

    }
  },
  {
    ...base,
    id: 'blk_newsletter',
    type: 'newsletter',
    style: { align: 'left', emphasis: 'default' },
    content: {
      title: 'Hear about the next drop first',
      description: 'One email per drop. Nothing else.',
      buttonLabel: 'Subscribe',
      consentText: 'By subscribing you agree to receive drop announcements from Adaeze Atelier. Unsubscribe anytime.'
    }
  },
  {
    ...base,
    id: 'blk_contact',
    type: 'contact',
    style: { align: 'left', emphasis: 'default' },
    content: {
      phone: '+234 803 123 4567',
      email: 'hello@adaezeatelier.example',
      address: '14 Admiralty Way, Lekki Phase 1, Lagos',
      hours: 'Tue–Sat, 10am–6pm WAT'
    }
  },
  {
    ...base,
    id: 'blk_social',
    type: 'social',
    style: { align: 'center', emphasis: 'default' },
    content: {
      items: [
      { id: 'soc_ig', platform: 'instagram', url: 'https://instagram.com/adaeze.atelier' },
      { id: 'soc_tt', platform: 'tiktok', url: 'https://tiktok.com/@adaeze.atelier' }]

    }
  }]

};

export const samplePublishedAt = '2026-10-19T16:24:00.000Z';