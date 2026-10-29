import type { AssistantAction, AssistantFeel, AssistantOffer } from '../types/assistant';
import type { CopilotKind, CopilotReply, CopilotTopic } from '../types/copilot';

/**
 * KUBICU Copilot's words (D262). Short, one question per message, written for WhatsApp first:
 * at most 3 reply buttons, otherwise a list of up to 10. Free text always works.
 */

export const COPILOT_GREETING =
'Hi, I’m KUBICU Copilot. I’ll help you make a web page — one link you can put in your WhatsApp status, Instagram bio or on a flyer, so customers can see what you do and reach you.\n\nYou don’t need any experience. I’ll ask a few simple questions; there are no wrong answers, and you can say “you decide” to anything. Nothing goes live until you say so.\n\nFirst: what are you creating today?';

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


/** Most photos Copilot takes besides the logo: 1 main picture + up to 4 for a gallery. */
export const MAX_PHOTOS = 5;

export const prompts: Record<Exclude<CopilotTopic, 'kind'>, string> = {
  about: 'Nice. Tell me about it in a sentence or two: what you do and who it’s for.',
  name: 'What name should visitors see at the top?',
  goal: 'When someone opens your page, what’s the one thing they should do?',
  look: 'How should it look? Here are a few directions — or I can choose.',
  logo: 'Do you have a logo? Send it as one picture.',
  photos: `Now send up to ${MAX_PHOTOS} photos of your work, your products, your space or you.`,
  items: 'List what you sell, one per line, with prices if you have them — like “Party tray (small) — 15,000”. I only use prices you give me.',
  phone: 'Which WhatsApp number should messages go to? You can skip this and add it later.',
  city: 'Where are you based? A city or area is enough.',
  change: 'Sure — what would you like to change?',
  more: 'Go ahead — tell me anything else you want on the page.'
};

/**
 * One plain line under each question (D265): what it means, why it's asked, and an example — written for
 * someone who has never made a website. Sent in the same message, so WhatsApp shows it too.
 */
export const helps: Partial<Record<CopilotTopic, string>> = {
  about: 'Write it the way you’d explain it to a new customer. For example: “I bake birthday cakes and small chops for parties in Ikeja. Most of my customers order on WhatsApp.”',
  name: 'Usually your business name, like “Tolu’s Kitchen”. If you work under your own name, that’s fine too. You can change it later.',
  goal: 'Pick the one most important thing. Most small businesses here choose WhatsApp, so customers can message you straight from the page. Not sure? Tap “You decide”.',
  look: 'This is just the colours, fonts and style. Your words and photos stay the same, and you can switch to another look later with one tap.',
  logo: 'A logo is the small picture or symbol that stands for your business. No logo? That’s completely normal — tap “I don’t have one” and I’ll show your initials in a neat circle instead.',
  photos: 'Phone photos are fine. The first one becomes the big picture at the top of your page; the rest go in a photo gallery. No photos yet? Skip — you can add them any time.',
  items: 'Write each thing on its own line. Prices are optional — I never guess a price, so anything without one stays marked for you to fill in.',
  phone: 'This is where customers’ messages will go when they tap the WhatsApp button. It’s only shown as a button, never as a list of numbers.',
  city: 'This helps nearby customers know you’re close. A city or area is enough — never your full home address.'
};

/** Longer explanations when someone says “what do you mean?” or “I don’t understand”. */
export const helpMore: Partial<Record<CopilotTopic, string>> = {
  kind: 'No problem. Think about why you want a page. If you sell things, choose “An online shop”. If people book or hire you (hair, makeup, cleaning, repairs), choose “A service or booking page”. If you want to show your work (designs, photos, art), choose “A portfolio”. Not sure? Choose “My business”.',
  about: 'I just need to know what you do, in your own words — like you’d say it to someone at a party. One or two sentences is plenty. You can also tap Skip and I’ll keep it short.',
  name: 'It’s the big title at the top of your page — what customers call you. A business name or your own name both work.',
  goal: 'When a customer opens your page, there will be one big button. Should it open a WhatsApp chat with you, let them send a short message form, ask to book a time, or something else? If you’re not sure, WhatsApp is the safest choice.',
  look: 'Every page has a style — colours and lettering. Pick the one that feels most like your business. You can’t get this wrong, and you can change it later.',
  logo: 'A logo is the little badge or symbol many businesses put on their signs, bags or Instagram profile picture. If you don’t have one, tap “I don’t have one” — I’ll use your initials.',
  photos: 'Photos help customers trust you. Send pictures of things you’ve made or sold, your shop or workspace, or you at work. Tap the photo button to choose them from your phone. The first photo is the big one at the top.',
  items: 'If you sell things, type them one per line. For example:\nJollof rice tray — 25,000\nSmall chops (50 pieces) — 15,000\nPrices are optional.',
  phone: 'When a customer taps the WhatsApp button on your page, a chat opens to this number. Use the number you do business on.',
  city: 'Just the town or area you work in, like “Yaba, Lagos”. It shows on your page so local customers know where you are.'
};

export const skipWords = /^(skip|later|not now|no|none|nope|i don'?t have|nothing)\b/i;
export const confusedWords =
/^\s*(\?+|what\??|huh\??|help\??|explain( (that|this|please))?|meaning\??|i'?m confused)\s*[.!?]*\s*$|^\s*(what do you mean|what does (that|this|it) mean|what is (a |that|this)|i don'?t (understand|get it|know what (you mean|that is|to say)))/i;
export const decideWords = /\b(you (decide|choose|pick)|not sure|recommend|anything|whatever|up to you|surprise me)\b/i;

/** Things Copilot never takes in chat. */
export const sensitivePatterns: RegExp[] = [/\b(?:\d[ -]?){13,19}\b/, /\b(password|passcode|pin|cvv|otp|bvn|nin)\b/i];