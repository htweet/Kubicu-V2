import { BriefcaseIcon, CalendarHeartIcon, PaletteIcon, ShoppingBagIcon, type LucideIcon } from 'lucide-react';
import type { Block, BlockType } from '../types/page';
import { createBlock } from '../utils/blocks';
import { placeholder } from '../utils/ai/draft';
import { uid } from '../utils/id';

/**
 * Site kits (D127): ready-made sets of extra pages for a main page. Wording that only the
 * owner can know is left as "[Add …]" so publishing waits until it's replaced — nothing is invented.
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
  build: () => [heading('Get in touch'), text(placeholder('one line on the best way to reach you, e.g. “WhatsApp is fastest — we reply within the hour, 9am–7pm.”')), plain('whatsapp'), plain('contact'), plain('location')]
};

export const siteKits: SiteKit[] = [
{
  id: 'shop',
  name: 'Shop site',
  forWho: 'Fashion, food, retail and anything you sell',
  icon: ShoppingBagIcon,
  pages: [
  { title: 'Shop', purpose: 'Your products in a grid with checkout', build: () => [heading('Shop'), text(placeholder('what you sell and who it’s for')), plain('productGrid')] },
  { title: 'About', purpose: 'Your story, your photo and why customers trust you', build: () => [heading('Our story'), text(placeholder('how you started and what makes your products different')), plain('image'), plain('proof')] },
  {
    title: 'Delivery & returns',
    purpose: 'Areas, fees, timings and returns — the questions buyers ask first',
    build: () => [heading('Delivery & returns'), faq('Before you order', ['Which areas do you deliver to?', 'How much is delivery and how long does it take?', 'Can I pay on delivery?', 'How do returns and exchanges work?'])]
  },
  contactPage]

},
{
  id: 'services',
  name: 'Services site',
  forWho: 'Beauty, home services, consultants and tutors',
  icon: BriefcaseIcon,
  pages: [
  { title: 'Services', purpose: 'What you offer with prices or “from” prices', build: () => [heading('Services'), text(placeholder('a short line about how you work')), plain('pricing')] },
  { title: 'Book', purpose: 'Book a slot and pay a deposit', build: () => [heading('Book an appointment'), text(placeholder('how booking and deposits work')), plain('booking')] },
  { title: 'Reviews', purpose: 'Verified reviews and delivered work', build: () => [heading('What clients say'), plain('proof')] },
  { title: 'FAQ', purpose: 'Cancellation, travel, preparation', build: () => [heading('Questions'), faq('Good to know', ['Do you come to my home or office?', 'What’s your cancellation policy?', 'How should I prepare?', 'Do you take transfers or cards?'])] },
  contactPage]

},
{
  id: 'creative',
  name: 'Portfolio site',
  forWho: 'Photographers, designers, musicians and makers',
  icon: PaletteIcon,
  pages: [
  { title: 'Work', purpose: 'Your best projects with results', build: () => [heading('Selected work'), plain('portfolio'), plain('gallery')] },
  { title: 'About', purpose: 'Who you are and who you work with', build: () => [heading('About me'), text(placeholder('your background, style and the clients you love working with')), plain('image')] },
  { title: 'Hire me', purpose: 'Packages and an enquiry form', build: () => [heading('Work with me'), plain('pricing'), plain('leadForm')] },
  contactPage]

},
{
  id: 'events',
  name: 'Events site',
  forWho: 'Event hosts, venues, planners and communities',
  icon: CalendarHeartIcon,
  pages: [
  { title: 'Events', purpose: 'Upcoming events with tickets', build: () => [heading('Upcoming events'), plain('event')] },
  { title: 'Gallery', purpose: 'Photos from past events', build: () => [heading('Past events'), plain('gallery')] },
  { title: 'FAQ', purpose: 'Dress code, tables, refunds, parking', build: () => [heading('Before you come'), faq('Questions', ['Is there a dress code?', 'Can I book a whole table?', 'Can I get a refund if I can’t come?', 'Is there parking at the venue?'])] },
  contactPage]

}];


export const siteKitById = (id: string) => siteKits.find((k) => k.id === id);