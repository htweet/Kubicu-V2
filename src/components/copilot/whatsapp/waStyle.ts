import type { CopilotMessage, CopilotReply, CopilotSession } from '../../../types/copilot';

/**
 * The simulated WhatsApp chat (D263) imitates WhatsApp's own light look so reviewers judge the real
 * channel, so these colours are WhatsApp's rather than KUBICU theme tokens.
 */
export const wa = {
  header: 'rgb(0 128 105)',
  wall: 'rgb(239 234 226)',
  incoming: 'rgb(255 255 255)',
  outgoing: 'rgb(217 253 211)',
  text: 'rgb(17 27 33)',
  meta: 'rgb(102 119 129)',
  action: 'rgb(2 126 181)',
  notice: 'rgb(255 243 196)',
  divider: 'rgb(233 237 239)',
  bar: 'rgb(240 242 245)',
  send: 'rgb(0 168 132)'
};

/** WhatsApp's real limits: up to 3 reply buttons per message; more choices go in a list of up to 10. */
export const MAX_BUTTONS = 3;
export const MAX_LIST_ROWS = 10;

export const SKIP_REPLY: CopilotReply = { value: '__skip', label: 'Skip for now' };

export function optionsFor(m: CopilotMessage, session: CopilotSession, isLatest: boolean): {buttons: CopilotReply[];list: CopilotReply[];} {
  if (!isLatest || session.stage === 'generating') return { buttons: [], list: [] };
  const replies = [...(m.replies ?? [])];
  if (session.question?.skippable && session.stage === 'asking' && !replies.some((r) => r.value === 'decide')) replies.push(SKIP_REPLY);
  if (!replies.length) return { buttons: [], list: [] };
  return replies.length <= MAX_BUTTONS ? { buttons: replies, list: [] } : { buttons: [], list: replies.slice(0, MAX_LIST_ROWS) };
}

export function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false });
}

type Translate = (key: string, vars?: Record<string, string | number>) => string;
const plain: Translate = (key) => key;

/**
 * The brief as one WhatsApp message (no cards in WhatsApp — just formatted text). D519: labels and the plan's
 * fixed values go through the translator; the page name stays as given.
 */
export function briefText(session: CopilotSession, t: Translate = plain): string {
  const b = session.brief;
  if (!b) return '';
  const lines = [
  `*${t('Here’s the plan')}*`,
  `${t('Creating')}: ${t(b.kindLabel)}`,
  `${t('Name')}: ${b.name}`,
  `${t('For')}: ${t(b.audience)}`,
  `${t('Visitors should')}: ${t(b.goal)}`,
  `${t('Look')}: ${t(b.look)}`,
  `${t('Layout')}: ${t(b.layout)}`,
  '',
  `*${t('Sections')}*`,
  ...b.sections.map((s, i) => `${i + 1}. ${t(s)}`)];

  if (b.gaps.length) lines.push('', `*${t('Left for you to fill in')}*`, ...b.gaps.map((g) => `• ${t(g)}`), '', `_${t('I never make up prices, reviews, hours or policies.')}_`);
  return lines.join('\n');
}