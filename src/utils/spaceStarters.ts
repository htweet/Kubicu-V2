import type { Block, BlockOf, BlockType, CampaignPhase, CampaignSettings, DealRoomSettings, PageDocument } from '../types/page';
import type { SpaceKind } from '../types/workspace';
import { createBlock } from './blocks';
import { uid } from './id';

interface StarterInput {
  id: string;
  name: string;
  handle: string;
  /** Campaign spaces: window, discount code and featured products from the setup flow. */
  campaign?: CampaignSettings;
  /** Customer-facing code for the campaign discount, used in the starter copy. */
  discountCode?: string;
  /** DealRoom spaces: the offer and terms from the setup flow (D54). */
  dealRoom?: DealRoomSettings;
}

function inPhases<T extends BlockType>(block: BlockOf<T>, phases: CampaignPhase[]): BlockOf<T> {
  return { ...block, visibility: { ...block.visibility, phases } };
}

/** Campaign starter (D52): heading for every phase, then a Before, Live and Ended version. */
function campaignBlocks(main: PageDocument, input: StarterInput, c: CampaignSettings): Block[] {
  const blocks: Block[] = [];
  const heading = createBlock('heading');
  heading.content.text = input.name;
  blocks.push(heading);

  // Before
  const tease = createBlock('text');
  tease.content.body =
  c.starter === 'launch' ? 'Something new is coming. Be the first to know when it drops.' : c.starter === 'event' ? 'Save the date — details and RSVP below.' : 'Our sale starts soon. Sign up and we’ll tell you the moment it opens.';
  blocks.push(inPhases(tease, ['before']));
  if (c.startsAt) {
    const startCount = createBlock('countdown');
    startCount.content.title = 'Starts in';
    startCount.content.target = c.startsAt;
    startCount.content.endedMessage = 'It’s on — refresh to see it.';
    blocks.push(inPhases(startCount, ['before']));
  }
  const notify = createBlock('newsletter');
  notify.content.title = 'Tell me when it starts';
  notify.content.description = 'One message when it opens. No spam.';
  notify.content.buttonLabel = 'Notify me';
  blocks.push(inPhases(notify, ['before']));

  // Live
  const offer = createBlock('text');
  offer.content.body =
  c.starter === 'sale' ?
  input.discountCode ?
  `It’s on. Code ${input.discountCode} is applied automatically at checkout.` :
  'It’s on. Prices are marked down for a limited time.' :
  c.starter === 'launch' ?
  'It’s here. Limited quantities — order while stock lasts.' :
  'Here’s everything you need for the day.';
  blocks.push(inPhases(offer, ['live']));
  if (c.starter === 'event') {
    const ev = createBlock('event');
    ev.content.title = input.name;
    ev.content.startsAt = c.startsAt;
    ev.content.endsAt = c.endsAt;
    blocks.push(inPhases(ev, ['before', 'live']));
  }
  if (c.endsAt) {
    const endCount = createBlock('countdown');
    endCount.content.title = 'Ends in';
    endCount.content.target = c.endsAt;
    endCount.content.endedMessage = 'This campaign has ended. Thank you!';
    blocks.push(inPhases(endCount, ['live']));
  }
  const grid = createBlock('productGrid');
  if (c.productIds.length) {
    grid.content.source = 'catalog';
    grid.content.productIds = c.productIds;
    grid.content.collectionId = null;
    grid.content.title = c.starter === 'launch' ? 'The drop' : 'On offer';
  }
  blocks.push(inPhases(grid, ['live']));

  // Ended
  const thanks = createBlock('text');
  thanks.content.body = 'That’s a wrap — thank you to everyone who joined in. Our regular range is still available.';
  blocks.push(inPhases(thanks, ['ended']));
  const back = createBlock('link');
  back.content.label = `Visit ${main.title || 'our main page'}`;
  back.content.url = `https://kub.icu/${main.handle}`;
  blocks.push(inPhases(back, ['ended']));

  const faq = createBlock('faq');
  blocks.push(inPhases(faq, ['before', 'live']));
  return blocks;
}

/**
 * A first draft for a new campaign or DealRoom: the main page's look with a short,
 * editable structure. DealRoom setup replaces its starter in Pass D.
 */
export function starterSpaceDoc(kind: Exclude<SpaceKind, 'main'>, main: PageDocument, input: StarterInput): PageDocument {
  const now = new Date().toISOString();
  let blocks: Block[];

  if (kind === 'campaign' && input.campaign) {
    blocks = campaignBlocks(main, input, input.campaign);
  } else {
    // DealRoom: the room panel (offer, progress, terms, buy) sits above these blocks.
    blocks = [];
    const text = createBlock('text');
    text.content.body =
    input.dealRoom?.type === 'goal' ?
    'We’re buying together to unlock a better price. Join now — you only pay once, and if we don’t reach the goal by the deadline, everyone gets a full refund automatically.' :
    'A small batch at a special price. When they’re gone, they’re gone.';
    blocks.push(text);
    const faq = createBlock('faq');
    faq.content.title = 'How it works';
    faq.content.items =
    input.dealRoom?.type === 'goal' ?
    [
    { id: uid('faq'), question: 'When am I charged?', answer: 'When you join. Your payment is held for this group buy.' },
    { id: uid('faq'), question: 'What if the goal isn’t reached?', answer: 'Everyone is refunded in full, automatically, right after the deadline. You don’t need to ask.' },
    { id: uid('faq'), question: 'When will my order arrive?', answer: 'Orders are packed once the goal is reached, then delivered as usual.' }] :

    [
    { id: uid('faq'), question: 'How many are available?', answer: 'The counter above shows exactly how many are left — it updates with every order.' },
    { id: uid('faq'), question: 'Can I buy more than one?', answer: 'Up to the per-person limit shown above, so more people get a chance.' }];

    blocks.push(faq);
  }

  return {
    id: input.id,
    schemaVersion: 1,
    handle: input.handle,
    title: input.name,
    theme: JSON.parse(JSON.stringify(main.theme)) as PageDocument['theme'],
    branding: main.branding ? JSON.parse(JSON.stringify(main.branding)) as PageDocument['branding'] : undefined,
    seo: { title: input.name, description: '' },
    blocks,
    campaign: kind === 'campaign' ? input.campaign : undefined,
    dealRoom: kind === 'dealroom' ? input.dealRoom : undefined,
    updatedAt: now
  };
}