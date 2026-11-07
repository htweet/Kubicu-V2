import type { ReportReason } from '../../types/admin';
import type { Workspace } from '../../types/workspace';
import { readPersistedPage } from '../workspaceStorage';

/**
 * Automatic moderation flags (D130): simple word patterns common in Nigerian online scams and fakes.
 * They only put a page in front of staff — they never take anything down on their own.
 */
export interface AutoFlagRule {
  id: string;
  label: string;
  why: string;
  reason: ReportReason;
  pattern: RegExp;
}

export const autoFlagRules: AutoFlagRule[] = [
  { id: 'returns', label: 'Promises guaranteed returns', why: 'Ponzi and “double your money” schemes promise fixed or guaranteed profit.', reason: 'scam', pattern: /(double your money|guaranteed (returns?|profit|income)|\b\d{2,3}% (returns?|profit|roi)\b|invest .{0,30}(get|earn) .{0,20}(weekly|daily))/i },
  { id: 'credentials', label: 'Asks for PINs, BVN or codes', why: 'No genuine seller needs a buyer’s card PIN, OTP or BVN to sell to them.', reason: 'scam', pattern: /(send|share|give|drop|enter).{0,30}\b(bvn|atm pin|card pin|otp|one[- ]time (code|pin)|token)\b/i },
  { id: 'counterfeit', label: 'Words used for copies of brands', why: '“First copy”, “master copy” and “replica” usually mean counterfeit branded goods.', reason: 'counterfeit', pattern: /\b(replica|first copy|master copy|mirror copy|aaa quality|1:1 copy|class a)\b/i },
  { id: 'too_cheap', label: 'Big-brand electronics at very low prices', why: 'New phones and consoles far below market price are a common bait in transfer scams.', reason: 'scam', pattern: /(iphone ?1[4-9]|ps5|playstation 5|macbook|galaxy s2\d).{0,60}(₦|n|ngn)\s?([1-9]\d{1,2}),?\d{3}(?!,\d{3})/i },
  { id: 'pressure', label: 'Pay-first pressure off the page', why: 'Pushing buyers to pay into a personal account or chat before delivery removes their protection.', reason: 'scam', pattern: /(pay|transfer|send money).{0,40}(personal account|my account|before (delivery|we deliver|i send)).{0,40}|(no pay on delivery).{0,30}(transfer|pay first)/i },
];

export interface AutoFlag {
  key: string;
  handle: string;
  workspaceId: string | null;
  workspaceName: string;
  rule: AutoFlagRule;
  snippet: string;
  sample?: boolean;
}

function textOf(value: unknown): string {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.entries(v as Record<string, unknown>).forEach(([k, x]) => k !== 'id' && !k.endsWith('Url') && walk(x));
  };
  walk(value);
  return out.join(' \n ');
}

function snippetAround(text: string, m: RegExpMatchArray): string {
  const i = m.index ?? 0;
  const start = Math.max(0, i - 40);
  const end = Math.min(text.length, i + m[0].length + 40);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${end < text.length ? '…' : ''}`;
}

const sampleFlag: AutoFlag = {
  key: 'cheap-iphones-lagos:too_cheap',
  handle: 'cheap-iphones-lagos',
  workspaceId: null,
  workspaceName: 'Not on this device (sample)',
  rule: autoFlagRules.find((r) => r.id === 'too_cheap')!,
  snippet: '…Brand new iPhone 15 Pro Max ₦185,000 only. Transfer first, delivery same day…',
  sample: true,
};

/** Scans every live page on this device. Only the published version is checked. */
export function scanPublishedPages(workspaces: Workspace[]): AutoFlag[] {
  const flags: AutoFlag[] = [sampleFlag];
  for (const w of workspaces) {
    const page = readPersistedPage(w.id);
    const live = page?.published;
    if (!live) continue;
    const text = textOf({ title: live.title, blocks: live.blocks, pages: live.pages });
    for (const rule of autoFlagRules) {
      const m = text.match(rule.pattern);
      if (m) flags.push({ key: `${live.handle}:${rule.id}`, handle: live.handle, workspaceId: w.id, workspaceName: w.name, rule, snippet: snippetAround(text, m) });
    }
  }
  return flags;
}
