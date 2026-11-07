import { b, doc, type ExamplePage } from './build';
import { daysFromNow } from '../../utils/eventTime';

/* All organisations, people, prices, numbers and links below are fictional sample content. */

export const afrobeatsBrunch: ExamplePage = {
  id: 'afrobeats-brunch',
  category: 'Event',
  name: 'Afrobeats Brunch PH',
  city: 'Port Harcourt',
  bestFor: 'Events, parties and launches',
  description: 'A countdown to the real date, ticket tiers, venue, FAQ and a past event showing “Event ended”.',
  goals: ['events'],
  styles: ['dark', 'bold'],
  plan: 'creator',
  doc: doc(
    'afrobeatsbrunchph',
    'Afrobeats Brunch PH',
    'Food, drinks and the best Afrobeats in Port Harcourt. Next edition tickets on sale now.',
    {
      presetId: 'custom',
      background: '#1E0F2E',
      surface: '#2B1742',
      text: '#FFF1E0',
      mutedText: '#CDB8DA',
      accent: '#FF8A2A',
      accentText: '#1E0F2E',
      fontPair: 'statement',
      buttonShape: 'pill',
      buttonStyle: 'solid',
    },
    [
      b('a_profile', 'profile', {
        name: 'Afrobeats Brunch PH',
        tagline: 'Good food, cold drinks and Afrobeats till sunset. Every other month in Port Harcourt.',
        avatarUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/2553519c-465c-4a48-b2bd-d4d07c310a3f.jpg',
        avatarAlt: 'Afrobeats Brunch emblem: a vinyl record merging with a sun',
        location: 'Port Harcourt',
      }, { align: 'center' }),
      b('a_hero', 'image', {
        url: 'https://cdn.magicpatterns.com/patterns/generated-images/7376e6bd-6fb6-4154-a594-50ce1957e066.jpg',
        alt: 'Friends dancing on a rooftop terrace with string lights and a DJ booth',
        caption: '',
        aspect: '16:9',
      }),
      b('a_count', 'countdown', { title: 'Next edition starts in', target: daysFromNow(18, 13), endedMessage: 'We’re live — see you on the terrace!', linkLabel: '', url: '' }),
      b('a_event', 'event', {
        title: 'Afrobeats Brunch — Vol. 9',
        startsAt: daysFromNow(18, 13), endsAt: daysFromNow(18, 19), timeZone: 'Africa/Lagos',
        venue: 'The Rooftop at Azure Suites', address: 'Woji Road, GRA Phase 2, Port Harcourt',
        ticketUrl: 'https://tix.example/abph9', ctaLabel: 'Get tickets',
        tiers: [
          { id: 'a_t1', name: 'Early bird', priceNgn: 15000, note: 'Brunch plate + 1 drink', soldOut: true },
          { id: 'a_t2', name: 'Regular', priceNgn: 20000, note: 'Brunch plate + 1 drink', soldOut: false },
          { id: 'a_t3', name: 'VIP table (6)', priceNgn: 180000, note: 'Reserved table, bottle and platters', soldOut: false },
        ],
        soldOut: false,
      }),
      b('a_gallery', 'gallery', {
        title: 'Last time',
        layout: 'carousel',
        images: [
          { id: 'a_g1', url: 'https://cdn.magicpatterns.com/patterns/generated-images/7376e6bd-6fb6-4154-a594-50ce1957e066.jpg', alt: 'Guests dancing on the rooftop at golden hour' },
          { id: 'a_g2', url: 'https://cdn.magicpatterns.com/patterns/generated-images/19519a62-0b67-4819-a320-16b5f33416b8.jpg', alt: 'Brunch table with small chops, pancakes and mocktails' },
        ],
      }),
      b('a_past', 'event', {
        title: 'Afrobeats Brunch — Vol. 8',
        startsAt: daysFromNow(-42, 13), endsAt: daysFromNow(-42, 19), timeZone: 'Africa/Lagos',
        venue: 'The Rooftop at Azure Suites', address: 'Woji Road, GRA Phase 2, Port Harcourt',
        ticketUrl: 'https://tix.example/abph8', ctaLabel: 'Get tickets', tiers: [], soldOut: false,
      }),
      b('a_faq', 'faq', {
        title: 'Good to know',
        items: [
          { id: 'a_f1', question: 'Is there a dress code?', answer: 'Day-party smart. Think colour, comfortable shoes for dancing.' },
          { id: 'a_f2', question: 'Is it 18+?', answer: 'Yes. Bring a valid ID — it’s checked at the door.' },
          { id: 'a_f3', question: 'Refunds?', answer: 'Tickets are transferable but not refundable. If we cancel, you get a full refund within 7 days.' },
        ],
      }),
      b('a_social', 'social', {
        items: [
          { id: 'a_ig', platform: 'instagram', url: 'https://instagram.com/afrobeatsbrunchph.example' },
          { id: 'a_tt', platform: 'tiktok', url: 'https://tiktok.com/@afrobeatsbrunchph.example' },
        ],
      }, { align: 'center' }),
    ],
  ),
};

export const ikejaFoodBank: ExamplePage = {
  id: 'ikeja-food-bank',
  category: 'Community',
  name: 'Ikeja Food Bank',
  city: 'Lagos',
  bestFor: 'Nonprofits, churches, mosques and clubs',
  description: 'Volunteer sign-up, donations through your own link, impact photos and contact.',
  goals: ['support'],
  styles: ['light', 'bold'],
  plan: 'free',
  doc: doc(
    'ikejafoodbank',
    'Ikeja Food Bank',
    'Neighbours feeding neighbours in Ikeja. Volunteer on Saturdays or donate food and funds.',
    {
      presetId: 'custom',
      background: '#F1F5EC',
      surface: '#FFFFFF',
      text: '#16301F',
      mutedText: '#4C6152',
      accent: '#1F6B3A',
      accentText: '#FFFFFF',
      fontPair: 'modern',
      buttonShape: 'rounded',
      buttonStyle: 'solid',
    },
    [
      b('fb_profile', 'profile', {
        name: 'Ikeja Food Bank',
        tagline: 'Neighbours feeding neighbours. Every Saturday we pack and share food parcels with families in Ikeja.',
        avatarUrl: 'https://cdn.magicpatterns.com/patterns/generated-images/aa18d71e-fe16-485e-916c-b875a6c34c3d.jpg',
        avatarAlt: 'Ikeja Food Bank emblem: two hands holding a bowl with a leaf',
        location: 'Ikeja, Lagos',
      }, { align: 'center' }),
      b('fb_donate', 'link', { label: 'Donate to this month’s parcels', url: 'https://paystack.example/ikejafoodbank', description: 'Secure payment page run by our treasurer' }, { align: 'center', emphasis: 'featured' }),
      b('fb_note', 'text', { body: 'Donations go to our own payment page, not through KUBICU. We publish a simple breakdown of what we receive and spend every quarter.' }),
      b('fb_img', 'image', {
        url: 'https://cdn.magicpatterns.com/patterns/generated-images/04fdd850-f109-458b-a80a-2ea27e588528.jpg',
        alt: 'Volunteers in green t-shirts packing rice, beans and vegetables',
        caption: 'Saturday packing at the community hall',
        aspect: '4:5',
      }),
      b('fb_h', 'heading', { text: 'Volunteer with us', level: 'h2' }),
      b('fb_text', 'text', { body: 'We pack from 8am to 12pm on Saturdays at the Allen Avenue community hall. No experience needed — just come ready to lift a few bags.' }),
      b('fb_form', 'leadForm', {
        title: 'Sign up to volunteer',
        description: 'We’ll message you with the next available Saturday.',
        fields: { name: true, email: false, phone: true, message: false },
        submitLabel: 'Count me in',
        consentText: 'We only use your number to arrange volunteering. Reply STOP anytime.',
      }),
      b('fb_img2', 'image', {
        url: 'https://cdn.magicpatterns.com/patterns/generated-images/bd358b1c-86f2-42b6-b6f9-173acc73aa53.jpg',
        alt: 'A volunteer handing a food parcel to an elderly woman',
        caption: '',
        aspect: '1:1',
      }),
      b('fb_faq', 'faq', {
        title: 'Food donations',
        items: [
          { id: 'fb_f1', question: 'What can I donate?', answer: 'Rice, beans, garri, oil, tinned tomatoes and baby formula (unopened, at least 3 months before expiry).' },
          { id: 'fb_f2', question: 'Where do I drop it off?', answer: 'At the community hall on Saturday mornings, or message us to arrange a weekday drop.' },
        ],
      }),
      b('fb_contact', 'contact', { phone: '+234 807 555 0136', email: 'hello@ikejafoodbank.example', address: 'Community hall, 40 Allen Avenue, Ikeja', hours: 'Saturdays 8am–12pm' }),
    ],
  ),
};
