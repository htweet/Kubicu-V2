import type { AssistantAction, AssistantFeel, AssistantOffer } from '../types/assistant';
import type { CopilotKind, CopilotReply, CopilotTopic } from '../types/copilot';

/**
 * KUBICU Copilot's words (D262). Short, one question per message, written for WhatsApp first:
 * at most 3 reply buttons, otherwise a list of up to 10. Free text always works.
 */

export const COPILOT_GREETING = 'Hi, I’m KUBICU Copilot. Let’s turn your idea into a page you can share. What are you creating today?';

export const kindReplies: CopilotReply[] = [
{ value: 'business', label: 'My business', description: 'A page for what you sell or do' },
{ value: 'portfolio', label: 'A portfolio', description: 'Show your work and get enquiries' },
{ value: 'creator', label: 'My creator page', description: 'Links, content and your audience' },
{ value: 'shop', label: 'An online shop', description: 'Products people can order' },
{ value: 'service', label: 'A service or booking page', description: 'Appointments and enquiries' },
{ value: 'event', label: 'An event page', description: 'Date, venue and registration' },
{ value: 'other', label: 'Something else', description: 'Tell me in your own words' }];


export const kindLabels: Record<CopilotKind, string> = {
  business: 'A business page',
  portfolio: 'A portfolio',
  creator: 'A creator page',
  shop: 'An online shop',
  service: 'A service and booking page',
  event: 'An event page',
  other: 'A page'
};

/** Sensible starting points for each kind, used until the person says otherwise. */
export const kindDefaults: Record<CopilotKind, {offer?: AssistantOffer;action?: AssistantAction;}> = {
  business: {},
  portfolio: { offer: 'content', action: 'enquire' },
  creator: { offer: 'content', action: 'follow' },
  shop: { offer: 'products', action: 'order' },
  service: { offer: 'services', action: 'book' },
  event: { offer: 'events', action: 'enquire' },
  other: {}
};

export const goalReplies: CopilotReply[] = [
{ value: 'order', label: 'Message me on WhatsApp', description: 'Orders and questions come to your chat' },
{ value: 'enquire', label: 'Send an enquiry', description: 'A short form or contact buttons' },
{ value: 'book', label: 'Book a time', description: 'Shown as an enquiry until Bookings is set up' },
{ value: 'buy', label: 'Buy online', description: 'Needs checkout set up in KUBICU first' },
{ value: 'follow', label: 'Follow or subscribe', description: 'Grow your audience' },
{ value: 'view', label: 'See my work', description: 'Portfolio first, contact after' },
{ value: 'donate', label: 'Support a cause', description: 'Needs a verified account to take money' },
{ value: 'decide', label: 'You decide', description: 'I’ll pick what fits best' }];


export const goalLabels: Record<AssistantAction, string> = {
  order: 'Message you on WhatsApp',
  enquire: 'Send you an enquiry',
  book: 'Ask to book a time',
  buy: 'Buy online',
  follow: 'Follow or subscribe',
  donate: 'Support your cause'
};

/** The looks, each tied to a real Signature theme through `themeForFeel`. */
export const lookReplies: CopilotReply[] = [
{ value: 'light', label: 'Refined & minimal', feel: 'light', description: 'Calm, bright, lots of space' },
{ value: 'glass', label: 'Premium dark glass', feel: 'glass', description: 'Deep colour with soft glow' },
{ value: 'editorial', label: 'Editorial luxury', feel: 'editorial', description: 'Magazine type, black and cream' },
{ value: 'bold', label: 'Vibrant & creative', feel: 'bold', description: 'Bright colour, confident shapes' },
{ value: 'warm', label: 'Warm & natural', feel: 'warm', description: 'Clay, sand and soft light' },
{ value: 'dark', label: 'Sleek & dark', feel: 'dark', description: 'Near-black with crisp detail' },
{ value: 'decide', label: 'You choose', description: 'I’ll match it to your business' }];


export const lookLabels: Record<AssistantFeel, string> = {
  light: 'Refined & minimal',
  glass: 'Premium dark glass',
  editorial: 'Editorial luxury',
  bold: 'Vibrant & creative',
  warm: 'Warm & natural',
  dark: 'Sleek & dark'
};

/** Free-text words for looks ("make it more premium", "black and cream"). */
export const lookWords: [AssistantFeel, RegExp][] = [
['editorial', /\b(editorial|magazine|black and cream|cream|luxur|elegant|classy)/i],
['glass', /\b(glass|glow|premium|neon|futur)/i],
['dark', /\b(dark|black|sleek|night)/i],
['warm', /\b(warm|natural|earth|clay|brown|cosy|cozy|emerald|green)/i],
['bold', /\b(bold|vibrant|colou?rful|bright|fun|playful|pop)/i],
['light', /\b(minimal|clean|simple|white|light|airy|calm)/i]];


export const audienceWords: [string, RegExp][] = [
['People near you', /\b(near|local|area|estate|neighbou?r)/i],
['Customers across Nigeria', /\b(nationwide|across nigeria|all over|anywhere in nigeria)/i],
['Businesses and clients', /\b(business(es)?|clients?|companies|brands|offices?|corporate)/i],
['Fans and followers', /\b(fans?|followers?|audience|listeners?|viewers?)/i]];


export const prompts: Record<Exclude<CopilotTopic, 'kind'>, string> = {
  about: 'Nice. Tell me about it in a sentence or two: what you do and who it’s for.',
  name: 'What name should visitors see at the top?',
  goal: 'When someone opens your page, what’s the one thing they should do?',
  look: 'How should it look? Here are a few directions — or I can choose.',
  photos: 'Got a logo or a few photos? Send up to 6. The first becomes the main image. You can skip this and add them later.',
  items: 'List what you sell, one per line, with prices if you have them — like “Party tray (small) — 15,000”. I only use prices you give me.',
  phone: 'Which WhatsApp number should messages go to? You can skip this and add it later.',
  city: 'Where are you based? A city or area is enough.',
  change: 'Sure — what would you like to change?',
  more: 'Go ahead — tell me anything else you want on the page.'
};

export const skipWords = /^(skip|later|not now|no|none|nope|i don'?t have|nothing)\b/i;
export const decideWords = /\b(you (decide|choose|pick)|not sure|recommend|anything|whatever|up to you|surprise me)\b/i;

/** Things Copilot never takes in chat. */
export const sensitivePatterns: RegExp[] = [/\b(?:\d[ -]?){13,19}\b/, /\b(password|passcode|pin|cvv|otp|bvn|nin)\b/i];