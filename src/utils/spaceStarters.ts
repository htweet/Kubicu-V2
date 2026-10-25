import type { Block, BlockOf, BlockType, BookingPageSettings, MembersAreaSettings, CampaignPhase, CampaignSettings, DealRoomSettings, FundraiserSettings, PageDocument, PopupSettings } from '../types/page';
import { sessionStart, sessionWhen, sortedSessions } from './popup';
import type { SpaceKind } from '../types/workspace';
import type { CommerceEvent } from '../types/commerce';
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
  /** Event spaces: the Commerce event the page is for (D178). */
  event?: CommerceEvent;
  /** Fundraiser spaces: goal, purpose and the payment link (D179). */
  fundraiser?: FundraiserSettings;
  /** Pop-up shops: place, sessions and products (D183). */
  popup?: PopupSettings;
  /** Booking pages: chosen services and the fallback contact (D184). */
  bookingPage?: BookingPageSettings;
  /** Members areas: which plans get in and the welcome for everyone else (D185). */
  membersArea?: MembersAreaSettings;
}

/**
 * Members area starter (D185): what members see once signed in. Non-members never see these — they
 * get the welcome card. What members actually get is left for the owner to write.
 */
function membersAreaBlocks(main: PageDocument, name: string): Block[] {
  const welcome = createBlock('text');
  welcome.content.variant = 'editorial';
  welcome.content.body = `Welcome to ${name}\n[Add a short welcome: what members get here and how often it’s updated]`;
  const latest = createBlock('text');
  latest.content.body = 'This month\n[Add this month’s material, notes or announcement for members]';
  const faq = createBlock('faq');
  faq.content.title = 'Your membership';
  faq.content.items = [
  { id: uid('faq'), question: 'How do I sign in on another phone?', answer: 'Tap Sign in and enter the phone number or email you subscribed with. We’ll send a one-time code.' },
  { id: uid('faq'), question: 'How do I pause, change or cancel?', answer: 'Use “My membership” at the top of this page. If you cancel, you keep access until the end of the period you’ve paid for.' }];

  const back = createBlock('link');
  back.content.label = `Visit ${main.title || 'our main page'}`;
  back.content.url = `https://kub.icu/${main.handle}`;
  return [welcome, latest, faq, back];
}

/**
 * Booking page starter (D184). The services panel (next free times, Choose a time) sits above these;
 * a short "before you book", a waitlist the panel links to when nothing is free, and a way back.
 */
function bookingPageBlocks(main: PageDocument): {blocks: Block[];waitlistId: string;} {
  const faq = createBlock('faq');
  faq.content.title = 'Before you book';
  faq.content.items = [
  { id: uid('faq'), question: 'Can I change or cancel?', answer: 'Yes — use the link in your confirmation, up to the cut-off shown there.' },
  { id: uid('faq'), question: 'Do I pay now?', answer: 'Only if the service asks for a deposit; it’s shown next to the price. Anything else is paid as the service says.' },
  { id: uid('faq'), question: 'Where is it?', answer: '[Add where appointments happen, or say they’re online]' }];

  const waitlist = createBlock('newsletter');
  Object.assign(waitlist.content, {
    title: 'No time that suits you?',
    description: 'Leave your email and we’ll tell you when new times open.',
    buttonLabel: 'Join the waitlist'
  });
  const back = createBlock('link');
  back.content.label = `Visit ${main.title || 'our main page'}`;
  back.content.url = `https://kub.icu/${main.handle}`;
  return { blocks: [faq, waitlist, back], waitlistId: waitlist.id };
}

/**
 * Pop-up shop starter (D183). The status panel (open/closed, place, sessions) sits above these;
 * Before teases, Open sells for pickup, Closed thanks and points to the main shop.
 */
function popupBlocks(main: PageDocument, name: string, p: PopupSettings): Block[] {
  const both: CampaignPhase[] = ['before', 'live'];
  const blocks: Block[] = [];
  const first = sortedSessions(p)[0];
  const grid = createBlock('productGrid');
  grid.content.source = 'catalog';
  grid.content.productIds = p.productIds;
  grid.content.collectionId = null;
  grid.content.title = 'At the stall';

  const hero = createBlock('hero');
  Object.assign(hero.content, {
    variant: 'poster',
    eyebrow: '',
    title: name,
    subtitle: 'Order ahead and collect at the stall — or just come by.',
    imageUrl: '',
    imageAlt: '',
    meta: [first ? sessionWhen(first) : '', p.venue].filter(Boolean).join(' · '),
    primaryLabel: 'Order for pickup',
    primaryUrl: `#b-${grid.id}`,
    secondaryLabel: '',
    secondaryUrl: ''
  });
  blocks.push(inPhases(hero, both));

  if (first) {
    const count = createBlock('countdown');
    count.content.title = 'Opens in';
    count.content.target = new Date(sessionStart(first)).toISOString();
    count.content.endedMessage = 'We’re open — come by.';
    blocks.push(inPhases(count, ['before']));
  }
  blocks.push(inPhases(grid, both));

  const pickup = createBlock('delivery');
  pickup.content.title = 'Pickup & returns';
  pickup.content.source = 'own';
  pickup.content.pickup = [p.venue, p.address].filter((s) => s.trim()).join(', ') + '\nCollect during the session you choose at checkout. Bring your order number.';
  pickup.content.returns = '[Add your returns or exchange policy for stall purchases]';
  blocks.push(inPhases(pickup, both));

  const loc = createBlock('location');
  loc.content.name = p.venue;
  loc.content.address = p.address;
  loc.content.note = '';
  blocks.push(inPhases(loc, both));

  const faq = createBlock('faq');
  faq.content.title = 'Good to know';
  faq.content.items = [
  { id: uid('faq'), question: 'Can I just turn up?', answer: 'Yes — ordering ahead only makes sure what you want is kept for you.' },
  { id: uid('faq'), question: 'Do you deliver?', answer: 'Not from the pop-up. Orders here are collected at the stall. Our main shop delivers as usual.' },
  { id: uid('faq'), question: 'What if I miss my pickup time?', answer: 'Message us and we’ll sort out another session if there is one.' }];

  blocks.push(inPhases(faq, both));

  const thanks = createBlock('text');
  thanks.content.variant = 'editorial';
  thanks.content.body = `Thanks for coming by\n${name} has closed. Everything is still available from our main shop.`;
  blocks.push(inPhases(thanks, ['ended']));
  const back = createBlock('link');
  back.content.label = `Visit ${main.title || 'our main shop'}`;
  back.content.url = `https://kub.icu/${main.handle}`;
  blocks.push(inPhases(back, ['ended']));
  return blocks;
}

/**
 * Fundraiser starter (D179). The progress panel (organiser, purpose, raised so far, give, fixed wording)
 * sits above these blocks; these tell the story. Organiser-specific facts are left for the owner to write.
 */
function fundraiserBlocks(f: FundraiserSettings): Block[] {
  const story = createBlock('text');
  story.content.variant = 'editorial';
  story.content.body = `Why we’re raising this\n${f.purpose}\n\n[Add the story in your own words: who this helps, what has happened so far, and why now]`;
  const use = createBlock('text');
  use.content.body = 'How the money will be used\n[Add what the money pays for, item by item, and what happens if you raise more than the goal]';
  const faq = createBlock('faq');
  faq.content.title = 'Questions';
  faq.content.items = [
  { id: uid('faq'), question: 'Is my payment tax-deductible?', answer: `No. It’s a payment to ${f.organiser || 'the organiser'}, not a donation to a registered charity.` },
  { id: uid('faq'), question: 'Will my name be shown?', answer: 'Only if you tick “Show my first name” when you pay. Otherwise you appear as Anonymous.' },
  { id: uid('faq'), question: 'What if the goal isn’t reached?', answer: 'Everything raised still goes to the cause — the goal is a target, not a condition.' }];

  const share = createBlock('share');
  share.content.title = 'Help us reach the goal';
  share.content.text = 'Sharing this page helps as much as giving.';
  return [story, use, faq, share];
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
 * Event space starter (D178): built only from existing blocks, every one editable.
 * Before → tickets, agenda, speakers, venue · During → "happening now" on top · After → thanks and the next one.
 */
function eventBlocks(main: PageDocument, ev: CommerceEvent): Block[] {
  const both: CampaignPhase[] = ['before', 'live'];
  const blocks: Block[] = [];
  const when = new Date(ev.startsAt).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: ev.timeZone || undefined });
  const where = ev.online ? 'Online' : ev.venue || 'Venue to be announced';

  const tickets = createBlock('event');
  tickets.content.source = 'catalog';
  tickets.content.eventId = ev.id;
  tickets.content.title = ev.name;

  // During: what matters on the day goes first.
  const now = createBlock('announcement');
  now.content.text = ev.online ? 'Happening now — your join link is on your ticket.' : `Happening now — doors are open at ${where}.`;
  now.content.tone = 'accent';
  now.content.linkLabel = '';
  blocks.push(inPhases(now, ['live']));

  const hero = createBlock('hero');
  Object.assign(hero.content, {
    variant: 'poster',
    eyebrow: '',
    title: ev.name,
    subtitle: ev.description.split('\n')[0] ?? '',
    imageUrl: ev.imageUrl,
    imageAlt: ev.imageUrl ? `${ev.name} event artwork` : '',
    meta: `${when} · ${where}`,
    primaryLabel: 'Get tickets',
    primaryUrl: `#b-${tickets.id}`,
    secondaryLabel: '',
    secondaryUrl: ''
  });
  blocks.push(inPhases(hero, both));

  const count = createBlock('countdown');
  count.content.title = 'Starts in';
  count.content.target = ev.startsAt;
  count.content.endedMessage = 'It’s on — see you there.';
  blocks.push(inPhases(count, ['before']));

  blocks.push(inPhases(tickets, both));

  const waitlist = createBlock('newsletter');
  waitlist.content.title = 'Sold out or can’t make this one?';
  waitlist.content.description = 'Leave your email and we’ll tell you if seats free up, and when the next one is announced.';
  waitlist.content.buttonLabel = 'Keep me posted';
  blocks.push(inPhases(waitlist, ['before']));

  const agenda = createBlock('agenda');
  agenda.content.title = 'Agenda';
  blocks.push(inPhases(agenda, both));

  const speakers = createBlock('team');
  speakers.content.title = 'Speakers & hosts';
  speakers.content.variant = 'speakers';
  blocks.push(inPhases(speakers, both));

  if (!ev.online) {
    const loc = createBlock('location');
    loc.content.name = ev.venue;
    loc.content.address = ev.address;
    loc.content.note = 'Arrive 15 minutes early to get through the door.';
    blocks.push(inPhases(loc, both));
  }

  const faq = createBlock('faq');
  faq.content.title = 'Good to know';
  faq.content.items = [
  { id: uid('faq'), question: 'How do I get in?', answer: 'Show the QR code on your ticket page, or the short code printed under it. One code per person.' },
  { id: uid('faq'), question: 'Can I get a refund?', answer: ev.refundPolicy || 'See the refund policy on your ticket.' },
  { id: uid('faq'), question: 'Can I buy tickets at the door?', answer: 'Only if seats are left — buying here first is the only way to be sure of a place.' }];

  blocks.push(inPhases(faq, both));

  // After
  const thanks = createBlock('text');
  thanks.content.variant = 'editorial';
  thanks.content.body = `Thank you for coming\nThat’s a wrap on ${ev.name}. Photos and highlights are below.`;
  blocks.push(inPhases(thanks, ['ended']));
  const gallery = createBlock('gallery');
  gallery.content.title = 'From the day';
  blocks.push(inPhases(gallery, ['ended']));
  const next = createBlock('newsletter');
  next.content.title = 'Hear about the next one';
  next.content.description = 'One email when the next date is announced. No spam.';
  next.content.buttonLabel = 'Notify me';
  blocks.push(inPhases(next, ['ended']));
  const back = createBlock('link');
  back.content.label = `Visit ${main.title || 'our main page'}`;
  back.content.url = `https://kub.icu/${main.handle}`;
  blocks.push(inPhases(back, ['ended']));

  const share = createBlock('share');
  share.content.title = 'Bring a friend';
  blocks.push(share);
  return blocks;
}

/**
 * A first draft for a new campaign, DealRoom or Event space: the main page's look with a short,
 * editable structure.
 */
export function starterSpaceDoc(kind: Exclude<SpaceKind, 'main'>, main: PageDocument, input: StarterInput): PageDocument {
  const now = new Date().toISOString();
  let blocks: Block[];
  let bookingPage = input.bookingPage;

  if (kind === 'members' && input.membersArea) {
    blocks = membersAreaBlocks(main, input.name);
  } else if (kind === 'booking' && input.bookingPage) {
    const built = bookingPageBlocks(main);
    blocks = built.blocks;
    bookingPage = { ...input.bookingPage, waitlistBlockId: built.waitlistId };
  } else if (kind === 'campaign' && input.campaign) {
    blocks = campaignBlocks(main, input, input.campaign);
  } else if (kind === 'event' && input.event) {
    blocks = eventBlocks(main, input.event);
  } else if (kind === 'fundraiser' && input.fundraiser) {
    blocks = fundraiserBlocks(input.fundraiser);
  } else if (kind === 'popup' && input.popup) {
    blocks = popupBlocks(main, input.name, input.popup);
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
    eventSpace: kind === 'event' && input.event ? { eventId: input.event.id } : undefined,
    fundraiser: kind === 'fundraiser' ? input.fundraiser : undefined,
    popup: kind === 'popup' ? input.popup : undefined,
    bookingPage: kind === 'booking' ? bookingPage : undefined,
    membersArea: kind === 'members' ? input.membersArea : undefined,
    updatedAt: now
  };
}