import type { AssistantAction, AssistantFeel, AssistantOffer, QuestionId } from '../types/assistant';

/**
 * What the assistant asks and the quick replies it offers (D211). The engine decides which questions
 * apply; these are the words. Keep prompts short — one question per message.
 */

export const questionPrompts: Record<QuestionId, string> = {
  business: 'First, which of these is closest to what you do?',
  name: 'What’s the business called? That’s the name visitors will see at the top.',
  audience: 'Who is this page mainly for?',
  action: 'What’s the one thing visitors should do when they land here?',
  offer: 'What will you show on the page?',
  city: 'Where are you based? People ordering or booking will want to know. Tap a city, or type your area.',
  phone: 'What WhatsApp number should orders and questions go to?',
  feel: 'How should it feel? Pick a look — you can change colours and fonts any time.',
  logo: 'Do you have a logo or a photo of yourself for the top of the page? Drop it here.',
  photos: 'Now a few photos of your work, products or place — up to 8. The first one becomes the main image.',
  mode: 'Your page already has content. Should I replace it, or add the new sections underneath?',
  items: 'List what you offer, one per line, with the price if you have it — like “Party tray (small) — 15,000”. I only use prices you give me, and I’ll add each one for you.',
  qr: 'Want a QR code for this page? It’s handy on flyers, packaging and your shop counter, and scans show in Analytics.',
  prices: 'Quick one while I build: what are the prices for these? Reply like “Asun 4500” — or skip and they’ll stay as drafts until you add prices.'
};

export const cityChips = [
{ value: 'Lagos', label: 'Lagos' },
{ value: 'Abuja', label: 'Abuja' },
{ value: 'Port Harcourt', label: 'Port Harcourt' },
{ value: 'Ibadan', label: 'Ibadan' },
{ value: 'Kano', label: 'Kano' },
{ value: 'online', label: 'Online only' }];


export const qrChips = [
{ value: 'yes', label: 'Yes, make one' },
{ value: 'no', label: 'Not now' }];


export const audienceChips = [
{ value: 'locals', label: 'People near me' },
{ value: 'nationwide', label: 'Customers across Nigeria' },
{ value: 'clients', label: 'Businesses & clients' },
{ value: 'fans', label: 'Fans & followers' }];


export const actionChips: {value: AssistantAction;label: string;}[] = [
{ value: 'order', label: 'Order on WhatsApp' },
{ value: 'buy', label: 'Buy online' },
{ value: 'book', label: 'Book a time' },
{ value: 'enquire', label: 'Get in touch' },
{ value: 'follow', label: 'Follow or subscribe' },
{ value: 'donate', label: 'Support or donate' }];


export const offerChips: {value: AssistantOffer;label: string;}[] = [
{ value: 'products', label: 'Products' },
{ value: 'menu', label: 'A food menu' },
{ value: 'services', label: 'Services' },
{ value: 'events', label: 'Events' },
{ value: 'content', label: 'My work or content' },
{ value: 'cause', label: 'A cause' }];


export const feelLabels: Record<AssistantFeel, string> = {
  warm: 'Warm & natural',
  light: 'Light & airy',
  bold: 'Bold',
  dark: 'Dark & luxurious',
  editorial: 'Editorial',
  glass: 'Glass & glow'
};

export const modeChips = [
{ value: 'replace', label: 'Replace my page' },
{ value: 'add', label: 'Add underneath' }];


export const actionLabels: Record<AssistantAction, string> = {
  order: 'Order on WhatsApp',
  buy: 'Shop now',
  book: 'Book a time',
  enquire: 'Get in touch',
  follow: 'Follow along',
  donate: 'Support us'
};

/** Words in an answer that point at an action or offer, for free-text replies. */
export const actionWords: [AssistantAction, RegExp][] = [
['book', /\b(book|appointment|session|reserve|schedule)/i],
['buy', /\b(buy|shop|checkout|purchase|cart)/i],
['order', /\b(order|whatsapp|dm)/i],
['donate', /\b(donat|support|give|fund)/i],
['follow', /\b(follow|subscribe|listen|watch|newsletter)/i],
['enquire', /\b(contact|call|enquir|inquir|quote|message|email|reach)/i]];


export const offerWords: [AssistantOffer, RegExp][] = [
['menu', /\b(menu|food|dish|meal|chops|jollof|cake|drinks?)\b/i],
['events', /\b(event|ticket|show|concert|party|workshop)/i],
['services', /\b(service|appointment|session|repair|install|consult|class)/i],
['cause', /\b(cause|charity|donat|volunteer|ngo)/i],
['content', /\b(portfolio|work|videos?|music|podcast|blog|content|photos?)\b/i],
['products', /\b(products?|items?|sell|shop|store|clothes|bags|shoes)\b/i]];