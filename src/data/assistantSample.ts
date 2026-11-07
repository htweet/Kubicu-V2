/**
 * A worked example of the AI page assistant (D211e), shown from "See an example". Fictional business,
 * labelled as a sample. It follows the real rules: the assistant asks first, only uses facts given, and
 * every change is kept or discarded by the owner.
 */

export interface SampleTurn {
  who: 'assistant' | 'owner';
  text: string;
  /** A short note on what's happening behind the scenes. */
  note?: string;
}

export const assistantSample: { business: string; turns: SampleTurn[]; outcome: string[] } = {
  business: 'Bola’s Kitchen — small chops and party trays, Yaba',
  turns: [
    { who: 'assistant', text: 'First, which of these is closest to what you do?', note: 'Opens with tap-to-answer choices, never a blank box.' },
    { who: 'owner', text: 'Something else → “small chops and party trays in Yaba, WhatsApp 0803 123 4567”', note: 'One typed answer covers type, area and number, so those questions are skipped.' },
    { who: 'assistant', text: 'What’s the business called?' },
    { who: 'owner', text: 'Use “Bola’s Kitchen”' },
    { who: 'assistant', text: 'What’s the one thing visitors should do when they land here?' },
    { who: 'owner', text: 'Order on WhatsApp' },
    { who: 'assistant', text: 'List what you offer, one per line, with the price if you have it.' },
    { who: 'owner', text: 'Small chops tray — 15,000\nJollof (large) — 8,500\nAsun', note: 'Prices only come from what the owner types. Asun has none yet.' },
    { who: 'assistant', text: 'How should it feel?' },
    { who: 'owner', text: 'Warm & natural' },
    { who: 'assistant', text: 'Do you have a logo…? Now a few photos…', note: 'Logo goes to Brand assets, food photos to Product images.' },
    { who: 'owner', text: 'Logo + 3 photos' },
    { who: 'assistant', text: 'Here’s my plan, using the “Food vendor” template. Nothing changes until you approve it.', note: 'Plan card: sections, theme, items, assumptions, gaps. 5 credits on approval.' },
    { who: 'owner', text: 'Approve and build' },
    { who: 'assistant', text: 'Quick one while I build: what’s the price for Asun?', note: 'The build waits right before the menu goes in.' },
    { who: 'owner', text: '4500' },
    { who: 'assistant', text: 'Your page is built. 2 things still need your details before you publish.' },
    { who: 'owner', text: 'Taps the gallery → “Move this up”', note: 'A proposal with Before / After. 1 credit.' },
    { who: 'owner', text: 'Keep' },
    { who: 'owner', text: '“Write me five reviews”' },
    { who: 'assistant', text: 'I won’t write reviews or testimonials — they have to come from real customers. I can add a Review summary that shows only real reviews. (No credit used.)' },
  ],
  outcome: [
    'A warm one-page site: logo, cover hero, WhatsApp order button, menu of 3 items, gallery, about, hours and location, FAQ, contact',
    '3 products in Commerce, linked from the menu',
    'Gaps left for the owner: opening hours and FAQ answers',
    'Nothing published — the owner publishes from the canvas',
  ],
};
