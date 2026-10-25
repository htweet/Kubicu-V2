import type { Space } from '../types/workspace';
import type { PersistedPage } from '../types/workspace';
import type { PageDocument } from '../types/page';
import { samplePage } from './samplePage';
import { SAMPLE_CAMPAIGN_HANDLE, SAMPLE_ROOM_HANDLE } from './commerceSeed';
import { SAMPLE_EVENT_ID, sampleEvent } from './sampleEvents';
import { SAMPLE_FUND_HANDLE, sampleFundraiserSettings } from './sampleFundraiser';
import { starterSpaceDoc } from '../utils/spaceStarters';
import { readPersistedPage, writePersistedPage, DEMO_WORKSPACE_ID } from '../utils/workspaceStorage';
import { spaceStorageId } from '../utils/spaces';
import { readCommerce } from '../utils/commerce/storage';

const day = 86400000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * day).toISOString();

export const SAMPLE_EVENT_HANDLE = 'adaeze-trunk-show';
export const SAMPLE_POPUP_HANDLE = 'adaeze-market-stall';
/** Bump when a new round of sample spaces is added; the demo workspace gets each round once. */
export const SAMPLE_SPACES_ROUND = 4;
export const SAMPLE_BOOKING_HANDLE = 'adaeze-book';
export const SAMPLE_MEMBERS_HANDLE = 'adaeze-circle';

/**
 * SAMPLE spaces for the demo workspace (labelled “sample” in their names):
 * - a live campaign with the EID20 code and a group buy with four sample orders out of 10;
 * - an Event space linked to the sample trunk show in Commerce → Events (D178);
 * - a Fundraiser whose counter reads labelled sample payments, one of them refunded (D179);
 * - a Pop-up shop with two market days (D183), a Booking page for the three sample services (D184)
 *   and a Members area for Atelier Circle subscribers (D185).
 * Each page is written once; an existing page is never overwritten.
 */
export function seedSampleSpaces(): Space[] {
  const created = '2026-10-18T09:00:00.000Z';
  const created2 = '2026-10-24T09:00:00.000Z';
  const created3 = '2026-10-25T09:00:00.000Z';
  const spaces: Space[] = [
  { id: 'sp_sample_eid', kind: 'campaign', name: 'Eid sale (sample)', createdAt: created, archivedAt: null },
  { id: 'sp_sample_room', kind: 'dealroom', name: 'Scarf group buy (sample)', createdAt: created, archivedAt: null },
  { id: 'sp_sample_event', kind: 'event', name: 'Trunk show (sample)', createdAt: created2, archivedAt: null },
  { id: 'sp_sample_fund', kind: 'fundraiser', name: 'Apprentice machines (sample)', createdAt: created2, archivedAt: null },
  { id: 'sp_sample_popup', kind: 'popup', name: 'Christmas market stall (sample)', createdAt: created3, archivedAt: null },
  { id: 'sp_sample_book', kind: 'booking', name: 'Book a fitting (sample)', createdAt: created3, archivedAt: null },
  { id: 'sp_sample_members', kind: 'members', name: 'Atelier Circle members (sample)', createdAt: created3, archivedAt: null }];


  const campaign = starterSpaceDoc('campaign', samplePage, {
    id: `page_${DEMO_WORKSPACE_ID}_sp_sample_eid`,
    name: 'Eid sale',
    handle: SAMPLE_CAMPAIGN_HANDLE,
    campaign: { starter: 'sale', startsAt: iso(-1), endsAt: iso(5), discountId: 'sd_eid', productIds: ['sp_wrap', 'sp_ife', 'sp_scarf'] },
    discountCode: 'EID20'
  });
  const room = starterSpaceDoc('dealroom', samplePage, {
    id: `page_${DEMO_WORKSPACE_ID}_sp_sample_room`,
    name: 'Adire scarf group buy',
    handle: SAMPLE_ROOM_HANDLE,
    dealRoom: { type: 'goal', productId: 'sp_scarf', priceNgn: 14000, seats: null, goal: 10, perPersonLimit: 2, opensAt: null, deadline: iso(3), endedAt: null, extensions: [], updates: [], referralReward: 'Bring 3 friends and your scarf comes with free gift wrapping.' }
  });
  // Use the saved sample event when there is one, so the countdown and dates match Commerce → Events.
  const event = readCommerce(DEMO_WORKSPACE_ID)?.events?.find((e) => e.id === SAMPLE_EVENT_ID) ?? sampleEvent();
  const eventDoc = starterSpaceDoc('event', samplePage, {
    id: `page_${DEMO_WORKSPACE_ID}_sp_sample_event`,
    name: 'Adaeze Atelier Trunk Show',
    handle: SAMPLE_EVENT_HANDLE,
    event
  });
  const fundDoc = starterSpaceDoc('fundraiser', samplePage, {
    id: `page_${DEMO_WORKSPACE_ID}_sp_sample_fund`,
    name: 'Sewing machines for our apprentices',
    handle: SAMPLE_FUND_HANDLE,
    fundraiser: sampleFundraiserSettings()
  });

  // Pop-up shop (D183): two market days next week; the scarf has a stall limit of 12.
  const dayAt = (offset: number) => {
    const d = new Date(Date.now() + offset * day);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const popupDoc = starterSpaceDoc('popup', samplePage, {
    id: `page_${DEMO_WORKSPACE_ID}_sp_sample_popup`,
    name: 'Adaeze Atelier at the Christmas market',
    handle: SAMPLE_POPUP_HANDLE,
    popup: {
      venue: 'Ikoyi Christmas Market, stall 14 (sample)',
      address: 'Sample address, Ikoyi, Lagos',
      sessions: [
      { id: 'ses_sample_1', date: dayAt(6), from: '10:00', to: '18:00' },
      { id: 'ses_sample_2', date: dayAt(7), from: '12:00', to: '18:00' }],

      productIds: ['sp_wrap', 'sp_ife', 'sp_scarf'],
      stallLimits: { sp_scarf: 12 },
      payment: 'both',
      closedAt: null
    }
  });

  // Booking page (D184): the three sample services from Bookings, with WhatsApp as the fallback.
  const bookDoc = starterSpaceDoc('booking', samplePage, {
    id: `page_${DEMO_WORKSPACE_ID}_sp_sample_book`,
    name: 'Book a fitting',
    handle: SAMPLE_BOOKING_HANDLE,
    bookingPage: { serviceIds: ['ss_fitting', 'ss_bespoke', 'ss_video'], intro: 'Book a fitting or styling session', whatsapp: '0803 000 0000', waitlistBlockId: null }
  });
  // Members area (D185): Atelier Circle subscribers only.
  const membersDoc = starterSpaceDoc('members', samplePage, {
    id: `page_${DEMO_WORKSPACE_ID}_sp_sample_members`,
    name: 'Atelier Circle',
    handle: SAMPLE_MEMBERS_HANDLE,
    membersArea: {
      rule: { access: 'plans', planIds: ['ssp_circle'] },
      title: 'Atelier Circle members only',
      teaser: 'Early looks at each drop, this month’s styling notes and the studio calendar. Join the Circle to see it.',
      joinLabel: 'Join Atelier Circle'
    }
  });

  const pages: [Space, PageDocument, string][] = [
  [spaces[0], campaign, created],
  [spaces[1], room, created],
  [spaces[2], eventDoc, created2],
  [spaces[3], fillFundraiserStory(fundDoc), created2],
  [spaces[4], fillPopupReturns(popupDoc), created3],
  [spaces[5], fillGaps(bookDoc, ['Our Victoria Island studio for fittings and consultations (sample address). Video calls are online — the link comes with your confirmation.']), created3],
  [spaces[6], fillGaps(membersDoc, [
  'Welcome to the Circle\nEverything for members lives here: early looks at each drop, styling notes and the studio calendar. It’s updated at the start of each month. (Sample.)',
  'This month\nThe Harmattan drop opens to members three days early. Book your monthly styling session from your membership page. (Sample.)']
  ), created3]];

  pages.forEach(([space, doc, at]) => {
    const id = spaceStorageId(DEMO_WORKSPACE_ID, space.id);
    if (readPersistedPage(id)) return;
    const page: PersistedPage = { draft: doc, published: doc, publishedAt: at, versions: [], lastSavedAt: at, scheduled: null };
    try {
      writePersistedPage(id, page);
    } catch {

      // Storage unavailable — the spaces still appear, as drafts that won't load.
    }});
  return spaces;
}

/** Replace a starter's "[Add …]" gaps (text bodies, then FAQ answers) with sample copy, in order. */
function fillGaps(doc: PageDocument, copy: string[]): PageDocument {
  let i = 0;
  const next = (s: string) => s.includes('[Add') && i < copy.length ? copy[i++] : s;
  return {
    ...doc,
    blocks: doc.blocks.map((b) => {
      if (b.type === 'text') return { ...b, content: { ...b.content, body: next(b.content.body) } };
      if (b.type === 'faq') return { ...b, content: { ...b.content, items: b.content.items.map((it) => ({ ...it, answer: next(it.answer) })) } };
      return b;
    })
  };
}

/** The pop-up starter leaves the returns policy for the owner; the sample fills it in. */
function fillPopupReturns(doc: PageDocument): PageDocument {
  return {
    ...doc,
    blocks: doc.blocks.map((b) => b.type === 'delivery' ? { ...b, content: { ...b.content, returns: 'Exchanges within 7 days with your receipt, at the stall or the studio. Sale items can’t be returned. (Sample policy.)' } } : b)
  };
}

/** The starter story leaves "[Add …]" gaps that block publishing; the sample fills them in. */
function fillFundraiserStory(doc: PageDocument): PageDocument {
  const story = [
  'Why we’re raising this\nOur apprentices learn on two shared machines, so most of the day is spent waiting. Four more machines means every apprentice sews from day one.',
  'How the money will be used\nFour industrial straight-stitch machines at about ₦135,000 each, plus servicing for the first year. Anything left over buys fabric for apprentice projects.'];

  let i = 0;
  return {
    ...doc,
    blocks: doc.blocks.map((b) => {
      if (b.type !== 'text') return b;
      const body = String((b.content as {body?: string;}).body ?? '');
      if (!body.includes('[Add') || i >= story.length) return b;
      return { ...b, content: { ...b.content, body: story[i++] } } as typeof b;
    })
  };
}