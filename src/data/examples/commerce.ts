import { b, doc, hours, type ExamplePage } from './build';
import { samplePage } from '../samplePage';

/* All businesses, people, prices, numbers and links below are fictional sample content. */

export const adaezeAtelier: ExamplePage = {
  id: 'adaeze-atelier',
  category: 'Fashion',
  name: 'Adaeze Atelier',
  city: 'Lagos',
  bestFor: 'Fashion and beauty sellers',
  description: 'Hero drop, product grid, lookbook gallery, WhatsApp ordering, fittings and delivery FAQ.',
  goals: ['sell', 'book'],
  styles: ['light', 'editorial'],
  plan: 'creator',
  doc: samplePage,
};

export const lagosBookshelf: ExamplePage = {
  id: 'lagos-bookshelf',
  category: 'Retail',
  name: 'Lagos Bookshelf',
  city: 'Lagos',
  bestFor: 'Shops with a physical location',
  description: 'Product grid with sold-out items, opening hours with an open-now badge and a delivery FAQ.',
  goals: ['sell'],
  styles: ['light', 'editorial'],
  plan: 'free',
  doc: doc(
    'lagosbookshelf',
    'Lagos Bookshelf',
    'Independent bookshop in Surulere. New African fiction, children’s books and cookbooks. Delivery across Lagos.',
    {
      presetId: 'custom',
      background: '#F2EDE2',
      surface: '#FBF8F1',
      text: '#1F2A24',
      mutedText: '#56625A',
      accent: '#2F5A43',
      accentText: '#FFFFFF',
      fontPair: 'warm',
      buttonShape: 'rounded',
      buttonStyle: 'solid',
    },
    [
      b('l_profile', 'profile', {
        name: 'Lagos Bookshelf',
        tagline: 'An independent bookshop for new African writing, children’s books and the occasional cookbook.',
        avatarUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/6335ab5e-62e3-431d-9988-dfe763cfaa51.jpg',
        avatarAlt: 'The Lagos Bookshelf shopfront with wooden shelves visible through the window',
        location: 'Surulere, Lagos',
      }, { align: 'center' }),
      b('l_wa', 'whatsapp', { label: 'Ask if we have a book', phone: '+234 802 555 0181', message: 'Hello Lagos Bookshelf! Do you have…' }, { align: 'center', emphasis: 'featured' }),
      b('l_grid', 'productGrid', {
        title: 'This week’s picks',
        orderAction: 'whatsapp',
        whatsappPhone: '+234 802 555 0181',
        ctaLabel: 'Reserve',
        items: [
          { id: 'l_b1', name: 'The Harmattan Letters', priceNgn: 9500, imageUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/9849f120-c973-4142-9925-947ffe11aba3.jpg', imageAlt: 'Hardcover novel with an indigo and orange abstract cover', note: 'Fiction · Hardcover', soldOut: false, url: '' },
          { id: 'l_b2', name: 'Under the Palm', priceNgn: 7000, imageUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/8be54bc8-3ec7-4901-8c63-9e22b6b784f9.jpg', imageAlt: 'Paperback with a green and gold palm tree illustration', note: 'Poetry · Paperback', soldOut: true, url: '' },
          { id: 'l_b3', name: 'The Great Adventure', priceNgn: 6500, imageUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/cde836f9-3444-45ba-b7ff-1281e8a7a8a7.jpg', imageAlt: 'Illustrated children’s book cover with a child and a tortoise', note: 'Ages 4–7', soldOut: false, url: '' },
          { id: 'l_b4', name: 'Pepper & Palm Oil (set of 3)', priceNgn: 24000, imageUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/4560e2c0-0b8e-4eaf-b3b4-41eebc270328.jpg', imageAlt: 'Stack of three cookbooks beside a bowl of red peppers', note: 'Cookbooks', soldOut: false, url: '' },
        ],
      }),
      b('l_club', 'link', { label: 'Join the monthly book club', url: 'https://lagosbookshelf.example/club', description: 'Last Saturday of every month, 4pm' }),
      b('l_img', 'image', {
        url: 'https://cdn.magicpatterns.com/patterns/generated-images/5434d275-3ad3-4bee-b7a5-85f714103073.jpg',
        alt: 'Inside the bookshop: tall wooden shelves, a reading armchair and warm lamps',
        caption: 'Come and browse — there’s always a chair free.',
        aspect: '4:5',
      }),
      b('l_loc', 'location', {
        name: 'The shop',
        address: '22 Adeniran Ogunsanya St\nSurulere, Lagos',
        timeZone: 'Africa/Lagos',
        hours: hours('10:00', '19:00', [0], { 6: ['11:00', '17:00'] }),
        note: 'Street parking in front. Step-free entrance.',
      }),
      b('l_faq', 'faq', {
        title: 'Delivery',
        items: [
          { id: 'l_f1', question: 'Do you deliver?', answer: 'Yes, anywhere in Lagos. The fee depends on your area and is confirmed on WhatsApp before you pay.' },
          { id: 'l_f2', question: 'Can you order a book you don’t have?', answer: 'Usually. Message us the title; special orders take 1–3 weeks.' },
        ],
      }),
      b('l_social', 'social', { items: [{ id: 'l_ig', platform: 'instagram', url: 'https://instagram.com/lagosbookshelf.example' }] }, { align: 'center' }),
    ],
  ),
};

export const mamaPutKitchen: ExamplePage = {
  id: 'mama-put-kitchen',
  category: 'Food',
  name: 'Mama Put Kitchen',
  city: 'Ibadan',
  bestFor: 'Restaurants, caterers and home kitchens',
  description: 'Menu with “sold out today”, WhatsApp ordering, delivery zones and a closed state.',
  goals: ['sell'],
  styles: ['light', 'bold'],
  plan: 'free',
  doc: doc(
    'mamaputkitchen',
    'Mama Put Kitchen',
    'Home-style Nigerian food in Bodija, Ibadan. Order on WhatsApp for pickup or delivery.',
    {
      presetId: 'custom',
      background: '#FFF6E8',
      surface: '#FFFFFF',
      text: '#2B1608',
      mutedText: '#6E4D35',
      accent: '#C23B12',
      accentText: '#FFFFFF',
      fontPair: 'statement',
      buttonShape: 'rounded',
      buttonStyle: 'solid',
    },
    [
      b('m_profile', 'profile', {
        name: 'Mama Put Kitchen',
        tagline: 'Home-style Nigerian food, cooked fresh every morning by Mama Funmi and her daughters.',
        avatarUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/cb80c687-ed8b-4fe1-86b2-96f819f02789.jpg',
        avatarAlt: 'Mama Funmi smiling in a colourful Ankara apron in her kitchen',
        location: 'Bodija, Ibadan',
      }, { align: 'center' }),
      b('m_hero', 'image', {
        url: 'https://cdn.magicpatterns.com/patterns/generated-images/4bf82f5e-9da5-4af2-9c42-1d9126e09c87.jpg',
        alt: 'Plate of smoky jollof rice with fried plantain, grilled chicken and coleslaw',
        caption: '',
        aspect: '4:5',
      }),
      b('m_menu', 'menu', {
        title: 'Today’s menu',
        note: 'Portions serve one generously. Delivery within Bodija, UI and Agodi from ₦1,500.',
        whatsappPhone: '+234 805 555 0127',
        orderingOpen: true,
        closedMessage: 'The kitchen is closed for today. Orders open again at 10am.',
        categories: [
          {
            id: 'm_c1', name: 'Rice',
            items: [
              { id: 'm_i1', name: 'Party jollof + chicken', description: 'With dodo and coleslaw', priceNgn: 4500, tags: 'Spicy', available: true },
              { id: 'm_i2', name: 'Fried rice + turkey', description: 'With dodo', priceNgn: 5500, tags: '', available: false },
              { id: 'm_i3', name: 'Ofada rice + ayamase', description: 'Green pepper stew with assorted meat', priceNgn: 5000, tags: 'Very spicy', available: true },
            ],
          },
          {
            id: 'm_c2', name: 'Soups & swallow',
            items: [
              { id: 'm_i4', name: 'Egusi + pounded yam', description: 'With assorted meat', priceNgn: 5000, tags: '', available: true },
              { id: 'm_i5', name: 'Efo riro + amala', description: 'With fish', priceNgn: 4500, tags: '', available: true },
            ],
          },
          {
            id: 'm_c3', name: 'Small chops & drinks',
            items: [
              { id: 'm_i6', name: 'Puff-puff (10 pcs)', description: '', priceNgn: 1500, tags: 'Vegetarian', available: true },
              { id: 'm_i7', name: 'Zobo (50cl)', description: 'Homemade, lightly sweetened', priceNgn: 1000, tags: '', available: true },
            ],
          },
        ],
      }),
      b('m_gallery', 'image', {
        url: 'https://cdn.magicpatterns.com/patterns/generated-images/b2dfebf9-da8e-4878-88a8-96827adda3e3.jpg',
        alt: 'Bowl of egusi soup beside wrapped pounded yam',
        caption: 'Egusi + pounded yam, our most-ordered plate',
        aspect: '1:1',
      }),
      b('m_loc', 'location', {
        name: 'Pickup',
        address: '5 Bodija Market Road\nBodija, Ibadan',
        timeZone: 'Africa/Lagos',
        hours: hours('10:00', '20:00', [0]),
        note: 'Orders after 7pm may be ready for tomorrow only.',
      }),
      b('m_faq', 'faq', {
        title: 'Ordering',
        items: [
          { id: 'm_f1', question: 'How do I pay?', answer: 'We confirm your order and total on WhatsApp first, then send our account details for transfer.' },
          { id: 'm_f2', question: 'Do you cater for events?', answer: 'Yes, for 20 to 200 guests. Message us at least a week ahead.' },
        ],
      }),
      b('m_social', 'social', { items: [{ id: 'm_ig', platform: 'instagram', url: 'https://instagram.com/mamaputkitchen.example' }] }, { align: 'center' }),
    ],
  ),
};
