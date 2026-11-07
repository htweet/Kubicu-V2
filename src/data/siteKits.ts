import { BriefcaseIcon, CalendarHeartIcon, DownloadCloudIcon, MicIcon, ScaleIcon, ShoppingBagIcon, UtensilsIcon, type LucideIcon } from 'lucide-react';
import type { Block, BlockType } from '../types/page';
import { createBlock } from '../utils/blocks';
import { placeholder } from '../utils/ai/draft';
import { uid } from '../utils/id';

/**
 * Industry page sets (D127, expanded to seven in D137): ready-made multi-page sites for a main page.
 * Wording only the owner can know is left as "[Add …]" so publishing waits until it's replaced —
 * nothing is invented. Each set is written for how Nigerian customers actually buy in that trade.
 */

export interface SiteKitPage {
  title: string;
  /** What the page is for, shown in the picker. */
  purpose: string;
  build: () => Block[];
}

export interface SiteKit {
  id: string;
  name: string;
  forWho: string;
  icon: LucideIcon;
  /** One line on why these pages, in this order. */
  why: string;
  pages: SiteKitPage[];
}

function heading(text: string, level: 'h2' | 'h3' = 'h2'): Block {
  const b = createBlock('heading');
  return { ...b, content: { text, level } } as Block;
}
function text(body: string): Block {
  const b = createBlock('text');
  return { ...b, content: { body } } as Block;
}
function faq(title: string, qs: string[]): Block {
  const b = createBlock('faq');
  return { ...b, content: { title, items: qs.map((q) => ({ id: uid('faq'), question: q, answer: placeholder('your answer') })) } } as Block;
}
function plain<K extends BlockType>(type: K): Block {
  return createBlock(type) as Block;
}

const contactPage: SiteKitPage = {
  title: 'Contact',
  purpose: 'WhatsApp button, phone, address, opening hours and a map',
  build: () => [heading('Get in touch'), text(placeholder('the best way to reach you, e.g. “WhatsApp is fastest — we reply within the hour, 9am–7pm.”')), plain('whatsapp'), plain('contact'), plain('location')],
};

export const siteKits: SiteKit[] = [
  {
    id: 'creator',
    name: 'Creator',
    forWho: 'Content creators, influencers, comedians and podcasters',
    icon: MicIcon,
    why: 'Fans come for your content, then buy what you recommend, support you, or book you for brand work.',
    pages: [
      { title: 'Watch & listen', purpose: 'Your latest video and episodes in one place', build: () => [heading('Latest'), plain('video'), plain('playlist')] },
      { title: 'My picks', purpose: 'Products you use and sell, with checkout', build: () => [heading('Things I use and love'), text(placeholder('one line on how you choose what you recommend')), plain('productGrid')] },
      { title: 'Support me', purpose: 'Let fans “spray” you any amount', build: () => [heading('Support my work'), text(placeholder('what support helps you make next')), plain('support')] },
      { title: 'Work with me', purpose: 'Brand deals and bookings with your rate card', build: () => [heading('Brands & bookings'), text(placeholder('your audience in numbers — only figures you can show')), plain('pricing'), plain('leadForm')] },
      contactPage,
    ],
  },
  {
    id: 'retail',
    name: 'Retail shop',
    forWho: 'Fashion, beauty products, gadgets, home goods and boutiques',
    icon: ShoppingBagIcon,
    why: 'Buyers browse, check delivery and trust before paying — so those pages sit right next to the shop.',
    pages: [
      { title: 'Shop', purpose: 'All your products with checkout', build: () => [heading('Shop'), text(placeholder('what you sell and who it’s for')), plain('productGrid')] },
      { title: 'New in', purpose: 'One collection, e.g. new arrivals or a festive drop', build: () => [heading('New in'), plain('collection')] },
      { title: 'About', purpose: 'Your story and why customers trust you', build: () => [heading('Our story'), text(placeholder('how you started and what makes your products different')), plain('image'), plain('proof')] },
      {
        title: 'Delivery & returns',
        purpose: 'Areas, fees, timings, pay on delivery and returns',
        // Rates follow the shop's delivery settings (D181); returns stay a gap only the owner can fill.
        build: () => {
          const d = createBlock('delivery');
          d.content.returns = placeholder('your returns and exchanges policy');
          return [heading('Delivery & returns'), d, faq('Before you order', ['Can I pay on delivery?', 'What if my order arrives damaged?'])];
        },
      },
      contactPage,
    ],
  },
  {
    id: 'food',
    name: 'Food & drinks',
    forWho: 'Restaurants, home cooks, caterers, bakers and small chops',
    icon: UtensilsIcon,
    why: 'People decide from the menu, then want to know if you deliver to them and when you’re open.',
    pages: [
      { title: 'Menu', purpose: 'Dishes with prices, tags and what’s available today', build: () => [heading('Menu'), plain('menu')] },
      { title: 'Order', purpose: 'Trays, platters and packs with checkout', build: () => [heading('Order for delivery or pickup'), text(placeholder('cut-off time for same-day orders')), plain('productGrid')] },
      { title: 'Catering', purpose: 'Owambe, office and party orders by enquiry', build: () => [heading('Events & catering'), text(placeholder('the kinds of events you cater and your minimum order')), plain('pricing'), plain('leadForm')] },
      { title: 'Delivery & hours', purpose: 'Where you deliver, fees and opening hours', build: () => [heading('Delivery & hours'), faq('Good to know', ['Which areas do you deliver to?', 'How long does delivery take?', 'Can I pick up?', 'Do you take orders for tomorrow?']), plain('location')] },
      contactPage,
    ],
  },
  {
    id: 'service',
    name: 'Service business',
    forWho: 'Salons, lash techs, cleaners, tutors, mechanics and home services',
    icon: BriefcaseIcon,
    why: 'Customers check prices, book a slot with a deposit, then look for proof you’re good.',
    pages: [
      { title: 'Services', purpose: 'What you offer with prices or “from” prices', build: () => [heading('Services'), text(placeholder('a short line about how you work')), plain('pricing')] },
      { title: 'Book', purpose: 'Book a slot and pay a deposit', build: () => [heading('Book an appointment'), text(placeholder('how booking and deposits work')), plain('booking')] },
      { title: 'Reviews', purpose: 'Verified reviews and delivered work', build: () => [heading('What clients say'), plain('proof')] },
      { title: 'FAQ', purpose: 'Home visits, lateness, cancellation, payment', build: () => [heading('Questions'), faq('Good to know', ['Do you come to my home or office?', 'What happens if I’m late?', 'What’s your cancellation policy?', 'Do you take transfers or cards?'])] },
      contactPage,
    ],
  },
  {
    id: 'event',
    name: 'Events',
    forWho: 'Event hosts, venues, planners, churches and communities',
    icon: CalendarHeartIcon,
    why: 'Guests want the date, the ticket, what the last one looked like and the dress code.',
    pages: [
      { title: 'Events', purpose: 'Upcoming events with tickets or free sign-up', build: () => [heading('Upcoming events'), plain('event')] },
      { title: 'Gallery', purpose: 'Photos from past events', build: () => [heading('Past events'), plain('gallery')] },
      { title: 'Partners', purpose: 'Sponsors and vendors with an enquiry form', build: () => [heading('Partner with us'), text(placeholder('who comes to your events — only numbers you can show')), plain('leadForm')] },
      { title: 'FAQ', purpose: 'Dress code, tables, refunds, parking', build: () => [heading('Before you come'), faq('Questions', ['Is there a dress code?', 'Can I book a whole table?', 'Can I get a refund if I can’t come?', 'Is there parking at the venue?'])] },
      contactPage,
    ],
  },
  {
    id: 'digital',
    name: 'Digital products',
    forWho: 'E-books, courses, presets, templates, beats and printables',
    icon: DownloadCloudIcon,
    why: 'Buyers want a free taste first, then a safe download — and a membership if they keep coming back.',
    pages: [
      { title: 'Products', purpose: 'Your files with secure downloads', build: () => [heading('Get it now'), text(placeholder('who these are for and what they’ll be able to do')), plain('download')] },
      { title: 'Free sample', purpose: 'A free chapter or pack in exchange for an email', build: () => [heading('Try it free'), text(placeholder('what’s in the free sample')), plain('leadForm')] },
      { title: 'Membership', purpose: 'Monthly access to everything new', build: () => [heading('Join the membership'), plain('subscription')] },
      { title: 'FAQ', purpose: 'Licence, devices, refunds', build: () => [heading('Questions'), faq('Before you buy', ['How do I get my file after paying?', 'Can I use it for client work?', 'How many devices can I use it on?', 'Do you give refunds on downloads?'])] },
      contactPage,
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    forWho: 'Lawyers, accountants, consultants, architects and coaches',
    icon: ScaleIcon,
    why: 'Clients check who you are and your track record before they book a first consultation.',
    pages: [
      { title: 'About', purpose: 'Your background, qualifications and approach', build: () => [heading('About'), text(placeholder('your background and qualifications — only ones you hold')), plain('image')] },
      { title: 'Services & fees', purpose: 'What you do and how you charge', build: () => [heading('Services & fees'), plain('pricing')] },
      { title: 'Case studies', purpose: 'Results for past clients, with permission', build: () => [heading('Selected work'), plain('portfolio'), plain('proof')] },
      { title: 'Book a consultation', purpose: 'A first meeting in your calendar', build: () => [heading('Book a consultation'), text(placeholder('what happens in the first meeting and whether it’s paid')), plain('booking')] },
      contactPage,
    ],
  },
];

export const siteKitById = (id: string) => siteKits.find((k) => k.id === id);
