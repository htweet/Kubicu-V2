import type { Workspace } from '../types/workspace';
import { readCommerce, writeCommerce } from './commerce/storage';
import { clearSample } from './commerce/ops';
import { readOps, writeOps } from './ops/storage';
import { clearOpsSample } from './ops/ops';
import { readAnalytics, writeAnalytics } from './analytics/storage';
import { readDomains, writeDomains } from './domains/storage';
import { readTeam, writeTeam } from './team';
import { readMoneyRaw, writeMoney } from './money/store';
import { formsKey } from './forms/storage';
import { editorStorageKey, setDemoSeed } from './workspaceStorage';
import { spaceStorageId } from './spaces';
import { SAMPLE_SPACE_PREFIX } from '../data/sampleSpaces';
import type { FormsData } from '../types/forms';
import type { PartnershipData } from '../types/partnership';
import { readServiceOs, writeServiceOs } from './serviceOs';
import { readProof, writeProof } from './proof';
import { readWhatsApp, writeWhatsApp } from './whatsapp';
import { readFulfilment, writeFulfilment } from './fulfilment';
import { collabKey, type CollabData } from './collabs';
import { partnershipKey } from './partnerships';

/** Demo data lasts this long, then is removed automatically (D200). */
export const DEMO_DATA_DAYS = 7;
/** From this many days left, the notice turns into a warning. */
export const DEMO_WARN_DAYS = 2;

const DAY = 86400000;
const NOTICE_KEY = 'kubicu.demoRemovedNotice';

export function demoExpiry(now = Date.now()): { seededAt: string; expiresAt: string } {
  return { seededAt: new Date(now).toISOString(), expiresAt: new Date(now + DEMO_DATA_DAYS * DAY).toISOString() };
}

export function demoDaysLeft(w: Pick<Workspace, 'demoData'>, now = Date.now()): number | null {
  if (!w.demoData) return null;
  return Math.max(0, Math.ceil((Date.parse(w.demoData.expiresAt) - now) / DAY));
}

export function demoExpired(w: Pick<Workspace, 'demoData'>, now = Date.now()): boolean {
  return !!w.demoData && Date.parse(w.demoData.expiresAt) <= now;
}

/** What demo data covers, in plain words, for setup and Settings. */
export const demoDataCovers = [
  'Products, collections, orders, discounts, stock history and a delivery in progress',
  'Subscriptions, an event with tickets, and two courses with learners',
  'Bookings services, a group class with attendees, appointments, contacts and automations',
  'Quotes, invoices and jobs, review requests and published reviews',
  'Wallet history, a payment link, WhatsApp chats and partner collaborations',
  'A form with responses, short links, a QR code and 30 days of visits',
  'Two sample teammates and an invite',
  'Seven sample spaces: campaign, group buy, event, fundraiser, pop-up shop, booking page and members area',
];

/**
 * Removes every record marked as sample from this workspace's saved data and deletes the sample
 * spaces' pages. Your own products, orders, pages and settings are untouched. The caller removes the
 * spaces from the workspace and reloads so every screen reads the cleaned data.
 */
export function removeDemoDataFromStorage(workspaceId: string, spaceIds: string[]): void {
  const safe = (fn: () => void) => {
    try {
      fn();
    } catch {
      // One module failing to save must not stop the others.
    }
  };
  safe(() => {
    const c = readCommerce(workspaceId);
    if (c) writeCommerce(workspaceId, { ...clearSample(c), sampleSeeded: true });
  });
  safe(() => {
    const o = readOps(workspaceId);
    if (o) writeOps(workspaceId, { ...clearOpsSample(o), sampleSeeded: true });
  });
  safe(() => {
    const a = readAnalytics(workspaceId);
    if (a) writeAnalytics(workspaceId, { ...a, events: a.events.filter((e) => !e.sample), sampleSeeded: true });
  });
  safe(() => {
    const d = readDomains(workspaceId);
    if (d) {
      const links = d.links.filter((l) => !l.id.startsWith('lnk_sample_'));
      writeDomains(workspaceId, { ...d, links, qrs: d.qrs.filter((q) => !q.id.startsWith('qr_sample_') && links.some((l) => l.id === q.linkId)), sampleSeeded: true });
    }
  });
  safe(() => {
    const t = readTeam(workspaceId);
    if (t) writeTeam(workspaceId, { ...t, members: t.members.filter((m) => !m.sample), invites: t.invites.filter((i) => !i.sample), activity: t.activity.filter((a) => !a.id.startsWith('act_s')), sampleSeeded: true });
  });
  safe(() => {
    const m = readMoneyRaw(workspaceId);
    writeMoney(workspaceId, {
      ...m,
      links: m.links.filter((l) => !l.sample),
      ledger: m.ledger.filter((e) => !e.sample),
      payouts: m.payouts.filter((p) => !p.sample),
      banks: m.banks.filter((b) => !b.id.endsWith('_s1')),
      sampleFundraiserSeeded: true,
    });
  });
  safe(() => {
    const s = readServiceOs(workspaceId);
    writeServiceOs(workspaceId, { ...s, quotes: s.quotes.filter((q) => !q.sample), invoices: s.invoices.filter((i) => !i.sample), jobs: s.jobs.filter((j) => !j.sample), seeded: true });
  });
  safe(() => {
    const p = readProof(workspaceId);
    writeProof(workspaceId, { ...p, requests: p.requests.filter((r) => !r.sample), reviews: p.reviews.filter((r) => !r.sample), work: p.work.filter((w) => !w.sample), seeded: true });
  });
  safe(() => {
    const w = readWhatsApp(workspaceId);
    writeWhatsApp(workspaceId, { ...w, chats: w.chats.filter((c) => !c.sample), sampleSeeded: true });
  });
  safe(() => {
    const f = readFulfilment(workspaceId);
    writeFulfilment(workspaceId, { ...f, deliveries: f.deliveries.filter((d) => !d.sample) });
  });
  safe(() => {
    const raw = window.localStorage.getItem(collabKey(workspaceId));
    if (!raw) return;
    const c = JSON.parse(raw) as CollabData;
    window.localStorage.setItem(collabKey(workspaceId), JSON.stringify({ ...c, partners: c.partners.filter((x) => !x.sample), payouts: c.payouts.filter((x) => !x.sample), sampleSeeded: true }));
  });
  safe(() => {
    const raw = window.localStorage.getItem(partnershipKey(workspaceId));
    if (!raw) return;
    const p = JSON.parse(raw) as PartnershipData;
    window.localStorage.setItem(partnershipKey(workspaceId), JSON.stringify({ ...p, partnerships: p.partnerships.filter((x) => !x.sample), sampleSeeded: true }));
  });
  safe(() => {
    const raw = window.localStorage.getItem(formsKey(workspaceId));
    if (!raw) return;
    const f = JSON.parse(raw) as FormsData;
    window.localStorage.setItem(formsKey(workspaceId), JSON.stringify({ ...f, forms: f.forms.filter((x) => !x.sample), submissions: f.submissions.filter((s) => !s.sample) }));
  });
  spaceIds.filter((id) => id.startsWith(SAMPLE_SPACE_PREFIX)).forEach((id) => safe(() => window.localStorage.removeItem(editorStorageKey(spaceStorageId(workspaceId, id)))));
  setDemoSeed(workspaceId, false);
}

/**
 * Deletes everything saved for one workspace on this device: every key that carries its id, plus the
 * demo workspace's original page key (D201). Shared, browser-wide keys are left alone.
 */
export function wipeWorkspaceStorage(workspaceId: string): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && (k.includes(workspaceId) || k === editorStorageKey(workspaceId))) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Storage unavailable — nothing to clear.
  }
  setDemoSeed(workspaceId, false);
}

const DEMO_WS_NOTICE_KEY = 'kubicu.demoWorkspaceNotice';

export function writeDemoWorkspaceNotice(kind: 'removed' | 'restored'): void {
  try {
    window.sessionStorage.setItem(DEMO_WS_NOTICE_KEY, kind);
  } catch {
    // No message is fine.
  }
}

export function takeDemoWorkspaceNotice(): 'removed' | 'restored' | null {
  try {
    const v = window.sessionStorage.getItem(DEMO_WS_NOTICE_KEY);
    window.sessionStorage.removeItem(DEMO_WS_NOTICE_KEY);
    return v === 'removed' || v === 'restored' ? v : null;
  } catch {
    return null;
  }
}

/** A one-time message shown after the reload that follows removal. */
export function writeRemovedNotice(reason: 'manual' | 'expired', workspaceName: string): void {
  try {
    window.sessionStorage.setItem(NOTICE_KEY, JSON.stringify({ reason, workspaceName }));
  } catch {
    // No message is fine.
  }
}

export function takeRemovedNotice(): { reason: 'manual' | 'expired'; workspaceName: string } | null {
  try {
    const raw = window.sessionStorage.getItem(NOTICE_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(NOTICE_KEY);
    return JSON.parse(raw) as { reason: 'manual' | 'expired'; workspaceName: string };
  } catch {
    return null;
  }
}
