import type { Block, CampaignPhase, EventSpaceSettings, PageDocument } from '../types/page';
import type { CommerceData, CommerceEvent } from '../types/commerce';
import type { Workspace } from '../types/workspace';
import type { ValidationIssue } from './validation';
import { blockInPhase, campaignPhase, phaseDescriptions, phaseLabels, phaseOrder, phaseSummary } from './campaign';
import { eventDisplay, eventPhase, eventRevenue, eventSeatsLeft, eventSold, eventTotalSeats, findEvent } from './commerce/tickets';
import { formatSchedule } from './schedule';
import { activeExtraSpaces, readSpacePage } from './spaces';
import { popupPhase, popupPhaseDescriptions, popupPhaseLabels, popupSummary } from './popup';

/*
 * Event spaces (D178). The space points at one Commerce event; everything about tickets stays in Commerce.
 * Phases reuse the campaign phase field (before / live / ended), labelled Before / During / After.
 */

export const eventPhaseLabels: Record<CampaignPhase, string> = { before: 'Before', live: 'During', ended: 'After' };

export const eventPhaseDescriptions: Record<CampaignPhase, string> = {
  before: 'Before it starts — tickets, agenda and how to get there.',
  live: 'While it’s on — doors, directions and live updates up top.',
  ended: 'After it ends — thank-you, recap and the next one.'
};

const toPhase = { upcoming: 'before', live: 'live', past: 'ended' } as const;

/** Phase from the event's own times. A missing event counts as Before, so nothing past-tense shows by mistake. */
export function eventSpacePhase(ev: CommerceEvent | undefined, now = Date.now()): CampaignPhase {
  return ev ? toPhase[eventPhase(ev, now)] : 'before';
}

/** The phase visitors see now for any phased space (campaign or event), or null for pages without phases. */
export function docPhase(doc: Pick<PageDocument, 'campaign' | 'eventSpace' | 'popup'>, data: CommerceData | null | undefined, now = Date.now()): CampaignPhase | null {
  if (doc.campaign) return campaignPhase(doc.campaign, now);
  if (doc.eventSpace) return eventSpacePhase(findEvent(data, doc.eventSpace.eventId), now);
  // Pop-up shops (D183): Before / Open / Closed from the opening sessions.
  if (doc.popup) return popupPhase(doc.popup, now);
  return null;
}

/** Labels and descriptions for a phased document. */
export function phaseCopy(doc: Pick<PageDocument, 'eventSpace' | 'popup'>) {
  if (doc.popup) return { labels: popupPhaseLabels, descriptions: popupPhaseDescriptions };
  return doc.eventSpace ? { labels: eventPhaseLabels, descriptions: eventPhaseDescriptions } : { labels: phaseLabels, descriptions: phaseDescriptions };
}

/** "Starts Sat 6pm", "On now · ends 9pm", "Ended Sat". */
export function phasedSummary(doc: Pick<PageDocument, 'campaign' | 'eventSpace' | 'popup'>, data: CommerceData | null | undefined, now = Date.now()): string {
  if (doc.campaign) return phaseSummary(doc.campaign, now);
  if (doc.popup) return popupSummary(doc.popup, now);
  const ev = doc.eventSpace ? findEvent(data, doc.eventSpace.eventId) : undefined;
  if (!ev) return 'No event linked';
  const phase = eventSpacePhase(ev, now);
  if (phase === 'before') return `Starts ${formatSchedule(ev.startsAt)}`;
  if (phase === 'live') return ev.endsAt ? `On now · ends ${formatSchedule(ev.endsAt)}` : 'On now';
  return `Ended ${formatSchedule(ev.endsAt ?? ev.startsAt)}`;
}

export function eventSpaceTotals(data: CommerceData, ev: CommerceEvent) {
  return { sold: eventSold(data, ev), total: eventTotalSeats(ev), left: eventSeatsLeft(data, ev), revenueNgn: eventRevenue(data, ev) };
}

/** Which event each Event space in this workspace points at (draft first, then live). */
export function eventSpaceLinks(w: Workspace): {spaceId: string;spaceName: string;handle: string;eventId: string;}[] {
  const out: {spaceId: string;spaceName: string;handle: string;eventId: string;}[] = [];
  for (const s of activeExtraSpaces(w)) {
    if (s.kind !== 'event') continue;
    const page = readSpacePage(w.id, s.id);
    const doc = page?.draft ?? page?.published;
    const id = doc?.eventSpace?.eventId;
    if (doc && id) out.push({ spaceId: s.id, spaceName: s.name, handle: page?.published?.handle ?? doc.handle, eventId: id });
  }
  return out;
}

/** Pre-publish checks for an Event space. */
export function eventSpaceIssues(s: EventSpaceSettings, blocks: Block[], data: CommerceData | null, others: {eventId: string;spaceName: string;}[] = [], now = Date.now()): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const push = (id: string, severity: ValidationIssue['severity'], message: string) => out.push({ id: `eventspace:${id}`, blockId: null, severity, message });
  const ev = findEvent(data, s.eventId);
  if (!ev) {
    push('missing', 'error', 'The linked event was deleted from Commerce → Events. Link another event in Page settings.');
    return out;
  }
  const clash = others.find((o) => o.eventId === s.eventId);
  if (clash) push('shared', 'error', `“${ev.name}” already has an event page (${clash.spaceName}). One event, one page — link a different event.`);
  const display = eventDisplay(data, ev, now);
  if (display === 'draft') push('draft', 'warning', `“${ev.name}” is still a draft in Commerce, so tickets aren’t on sale yet.`);
  if (display === 'paused') push('paused', 'warning', `Ticket sales for “${ev.name}” are paused in Commerce.`);
  if (display === 'cancelled') push('cancelled', 'warning', `“${ev.name}” was cancelled. The page will say so above your blocks.`);
  phaseOrder.forEach((phase) => {
    if (!blocks.some((b) => !b.visibility.hidden && blockInPhase(b, phase)))
    push(`empty-${phase}`, phase === 'before' ? 'error' : 'warning', `Nothing shows in the ${eventPhaseLabels[phase]} phase yet.`);
  });
  return out;
}