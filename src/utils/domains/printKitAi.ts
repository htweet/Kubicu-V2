import type { KitFont, KitPaper, KitStyle } from './printKit';

/**
 * "AI preview" for the print kit (D118). Rule-based in the prototype — no model is called.
 * It writes short print copy and suggests a design from the business type and tone.
 * It never invents prices, discounts, awards, guarantees or delivery promises.
 */

export type KitTone = 'warm' | 'premium' | 'playful' | 'pidgin';
export type KitCategory = 'beauty' | 'fashion' | 'food' | 'events' | 'home' | 'pro' | 'general';

export const kitTones: {id: KitTone;label: string;}[] = [
{ id: 'warm', label: 'Warm' },
{ id: 'premium', label: 'Premium' },
{ id: 'playful', label: 'Playful' },
{ id: 'pidgin', label: 'Pidgin-friendly' }];


const keywords: Record<Exclude<KitCategory, 'general'>, string[]> = {
  beauty: ['makeup', 'make-up', 'bridal', 'gele', 'lash', 'nail', 'hair', 'salon', 'skin', 'spa', 'braid', 'wig', 'beauty', 'glam', 'barb'],
  fashion: ['ankara', 'fashion', 'tailor', 'bespoke', 'cloth', 'boutique', 'aso', 'fabric', 'shoe', 'bag', 'thrift', 'wear', 'atelier', 'jewel', 'bead', 'adire', 'agbada'],
  food: ['food', 'kitchen', 'cake', 'bak', 'chops', 'jollof', 'cater', 'drink', 'zobo', 'chef', 'grill', 'suya', 'pastr', 'smoothie', 'restaurant', 'bukka', 'snack', 'meal'],
  events: ['event', 'decor', 'planner', 'rental', 'photo', 'video', 'dj', 'mc', 'wedding', 'party', 'usher'],
  home: ['clean', 'repair', 'plumb', 'electric', 'laundry', 'interior', 'furniture', 'paint', 'install', 'solar', 'fumigat', 'logistics', 'dispatch'],
  pro: ['consult', 'design', 'studio', 'tech', 'coach', 'tutor', 'lesson', 'law', 'account', 'agency', 'brand', 'training', 'class']
};

export const categoryLabels: Record<KitCategory, string> = {
  beauty: 'Beauty',
  fashion: 'Fashion',
  food: 'Food & drinks',
  events: 'Events',
  home: 'Home services',
  pro: 'Professional services',
  general: 'General business'
};

export function detectCategory(...texts: string[]): KitCategory {
  const t = texts.join(' ').toLowerCase();
  let best: KitCategory = 'general';
  let hits = 0;
  for (const [cat, words] of Object.entries(keywords) as [KitCategory, string[]][]) {
    const n = words.filter((w) => t.includes(w)).length;
    if (n > hits) {
      best = cat;
      hits = n;
    }
  }
  return best;
}

const taglines: Record<KitCategory, Record<KitTone, string[]>> = {
  beauty: {
    warm: ['Beauty made for your big days', 'Glam that feels like you', 'Bridal and event makeup with care'],
    premium: ['Refined bridal and event beauty', 'Considered artistry for occasions', 'Beauty, beautifully finished'],
    playful: ['Your glow-up starts here', 'Beat faces, happy hearts', 'Serving looks, every time'],
    pidgin: ['We go make you shine', 'Your face, our joy', 'Fine face for every occasion']
  },
  fashion: {
    warm: ['Clothes made with you in mind', 'Ankara and bespoke pieces, made with care', 'Wear what feels like you'],
    premium: ['Bespoke tailoring, finished by hand', 'Considered pieces for every occasion', 'Craft you can feel'],
    playful: ['Outfits that start conversations', 'Slay-ready pieces, every week', 'Your next favourite outfit'],
    pidgin: ['Correct cloth, correct fitting', 'We dey sew am to your taste', 'Your outfit don land']
  },
  food: {
    warm: ['Homemade taste, made fresh', 'Good food for every gathering', 'Made fresh, packed with care'],
    premium: ['Thoughtfully prepared, beautifully served', 'Catering for occasions that matter', 'Fresh ingredients, careful cooking'],
    playful: ['Happy bellies, happy people', 'Small chops, big vibes', 'Come hungry, leave happy'],
    pidgin: ['Better food wey go sweet you', 'Chop well, enjoy well', 'Food wey dey taste like home']
  },
  events: {
    warm: ['Making your moments memorable', 'Events planned with heart', 'Your day, handled with care'],
    premium: ['Considered events, flawlessly run', 'Occasions, elegantly delivered', 'Planning and décor for milestones'],
    playful: ['Owambe-ready, every weekend', 'We bring the vibes', 'Parties people talk about'],
    pidgin: ['Your party go make sense', 'We go arrange am finish', 'Enjoyment wey organise well']
  },
  home: {
    warm: ['Reliable help for your home', 'Your home in good hands', 'Fixed properly, the first time'],
    premium: ['Professional home services', 'Careful work, tidy finish', 'Trusted service for homes and offices'],
    playful: ['We fix it, you relax', 'Problems in, smiles out', 'Your home’s new best friend'],
    pidgin: ['We go fix am well well', 'Call us, problem solved', 'Correct work, no wahala']
  },
  pro: {
    warm: ['Practical help that moves you forward', 'Expert support, explained simply', 'Here to help your business grow'],
    premium: ['Clear thinking, careful delivery', 'Advisory and design for growing brands', 'Considered work, measurable progress'],
    playful: ['Big ideas, done properly', 'Let’s build something great', 'Your next move, sorted'],
    pidgin: ['We go help you move forward', 'Correct advice, no long talk', 'Make we grow together']
  },
  general: {
    warm: ['Made with care for you', 'Thank you for shopping with us', 'Quality you can come back for'],
    premium: ['Thoughtfully made, carefully delivered', 'Quality in every detail', 'Considered products and service'],
    playful: ['Good things, happy people', 'Your new favourite shop', 'Come for one, leave with two'],
    pidgin: ['Correct goods, correct service', 'We dey for you always', 'Buy am, enjoy am']
  }
};

const messages: Record<KitTone, (name: string) => string> = {
  warm: (n) => `Thank you for choosing ${n}! We hope you love it. Scan the code to order again, track your order or leave a review — it really helps a small business like ours.`,
  premium: (n) => `Thank you for your order. Every piece from ${n} is prepared with care. Scan to reorder, follow your delivery or share your experience.`,
  playful: (n) => `You made our day! Thanks for buying from ${n}. Scan to grab more, track your order or hype us with a review.`,
  pidgin: (n) => `Thank you for patronising ${n}! We hope e sweet you. Scan this code to order again sharp sharp, check your order or drop review for us.`
};

const headlines: Record<KitCategory, Record<KitTone, string>> = {
  beauty: { warm: 'Now booking bridal and event makeup', premium: 'Bridal and event beauty — now booking', playful: 'Book your glam today', pidgin: 'Book your makeup now' },
  fashion: { warm: 'New pieces now available', premium: 'The new collection is here', playful: 'Fresh drops just landed', pidgin: 'New cloth don land' },
  food: { warm: 'Order fresh for your next gathering', premium: 'Catering for every occasion', playful: 'Hungry? Order now', pidgin: 'Order your food now' },
  events: { warm: 'Planning an event? Let’s talk', premium: 'Now booking events and décor', playful: 'Let’s make it a party', pidgin: 'Get your event planned' },
  home: { warm: 'Book a visit today', premium: 'Professional service, booked in minutes', playful: 'Something broken? We’ve got you', pidgin: 'Call us make we come fix am' },
  pro: { warm: 'Book a free first chat', premium: 'Book a consultation', playful: 'Let’s get started', pidgin: 'Make we start today' },
  general: { warm: 'Now taking orders', premium: 'Order online in minutes', playful: 'Shop with us today', pidgin: 'Order now, e easy' }
};

const counterHeadlines: Record<KitTone, string> = {
  warm: 'Scan to see what’s available and order',
  premium: 'Scan to browse and order',
  playful: 'Point, scan, enjoy!',
  pidgin: 'Scan am make you order'
};

const designs: Record<KitCategory, {style: KitStyle;font: KitFont;paper: KitPaper;why: string;}> = {
  beauty: { style: 'minimal', font: 'elegant', paper: 'cream', why: 'Soft cream and a serif feel calm and premium — right for bridal and beauty.' },
  fashion: { style: 'classic', font: 'heritage', paper: 'white', why: 'A classic layout with a heritage serif lets the clothes and your name lead.' },
  food: { style: 'bold', font: 'friendly', paper: 'white', why: 'Solid colour and a rounded face read fast on packs and stalls, and feel appetising.' },
  events: { style: 'classic', font: 'elegant', paper: 'cream', why: 'Elegant type on cream suits invitations-style occasions.' },
  home: { style: 'bold', font: 'modern', paper: 'white', why: 'Bold colour and plain type look dependable and are easy to read on a fridge or door.' },
  pro: { style: 'minimal', font: 'modern', paper: 'white', why: 'Clean lines and plenty of space look professional and clear.' },
  general: { style: 'classic', font: 'modern', paper: 'white', why: 'A clean, trusted layout that works for most businesses.' }
};

export interface KitAiDraft {
  category: KitCategory;
  taglines: string[];
  message: string;
  headline: string;
  counterHeadline: string;
  voucherHeadline: string;
  design: {style: KitStyle;font: KitFont;paper: KitPaper;why: string;};
}

export function draftKitCopy(name: string, about: string, tone: KitTone, hasPhoto: boolean): KitAiDraft {
  const category = detectCategory(name, about);
  const design = { ...designs[category] };
  if (hasPhoto && (category === 'fashion' || category === 'food' || category === 'events' || category === 'beauty')) {
    design.style = 'photo';
    design.why = `${design.why} Your photo leads, since buyers in this category choose with their eyes.`;
  }
  return {
    category,
    taglines: taglines[category][tone],
    message: messages[tone](name.trim() || 'us'),
    headline: headlines[category][tone],
    counterHeadline: counterHeadlines[tone],
    voucherHeadline: tone === 'pidgin' ? 'Gift for you' : tone === 'premium' ? 'Gift card' : 'Gift voucher',
    design
  };
}

/** A readable voucher code, e.g. ADUNNI-7K2Q. */
export function voucherCode(name: string): string {
  const stem = name.replace(/[^a-z]/gi, '').toUpperCase().slice(0, 6) || 'GIFT';
  const tail = Array.from({ length: 4 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('');
  return `${stem}-${tail}`;
}