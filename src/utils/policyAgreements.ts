import type { PolicyRelease } from '../types/admin';
import type { LegalDoc } from '../types/legal';
import { allLegalDocs } from '../data/legal';

/** Days a workspace can choose "Later" before it must agree to a new policy version (D141). Example figure. */
export const POLICY_GRACE_DAYS = 14;
/** How long checkout mentions a recently updated policy. */
export const CHECKOUT_NOTICE_DAYS = 30;
const DAY = 86400000;
const EVENT = 'kubicu:policy-agreements';

export interface PolicyAgreement {
  version: string;
  at: string;
  by: string;
}

export interface PolicyAgreementStore {
  /** Latest version agreed per legal doc slug. */
  agreed: Record<string, PolicyAgreement>;
  /** When "Later" was last chosen, keyed `${slug}@${version}`. */
  laterAt: Record<string, string>;
}

export interface PendingPolicy {
  doc: LegalDoc;
  release: PolicyRelease;
  /** Last day "Later" is allowed. */
  deadline: number;
  overdue: boolean;
}

const key = (workspaceId: string) => `kubicu:policy-agreements:${workspaceId}`;
const empty = (): PolicyAgreementStore => ({ agreed: {}, laterAt: {} });

export function readAgreements(workspaceId: string): PolicyAgreementStore {
  try {
    const raw = localStorage.getItem(key(workspaceId));
    return raw ? { ...empty(), ...(JSON.parse(raw) as PolicyAgreementStore) } : empty();
  } catch {
    return empty();
  }
}

export function writeAgreements(workspaceId: string, s: PolicyAgreementStore) {
  try {
    localStorage.setItem(key(workspaceId), JSON.stringify(s));
  } catch {
    /* storage full — the prompt simply shows again */
  }
  window.dispatchEvent(new Event(EVENT));
}

export const AGREEMENTS_EVENT = EVENT;

/** The numbers in a version label, ignoring words like "Draft" ("Draft 0.3" → [0, 3]). */
export function versionParts(v: string | number): number[] {
  const m = String(v).match(/\d+(?:\.\d+)*/);
  return m ? m[0].split('.').map(Number) : [0];
}

/** a < b for versions like 2.1, 3.0.1 or "Draft 0.3". */
export function versionBefore(a: string, b: string): boolean {
  const pa = versionParts(a);
  const pb = versionParts(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) < (pb[i] ?? 0);
  }
  return false;
}

/** Policy versions this workspace still has to agree to, oldest deadline first. */
export function pendingPolicies(releases: Record<string, PolicyRelease[]>, store: PolicyAgreementStore, paid: boolean, now = Date.now()): PendingPolicy[] {
  const out: PendingPolicy[] = [];
  for (const doc of allLegalDocs) {
    const list = releases[doc.slug] ?? [];
    const required = list.find((r) => r.reaccept === 'all' || (r.reaccept === 'paid' && paid));
    if (!required) continue;
    const agreed = store.agreed[doc.slug];
    if (agreed && !versionBefore(agreed.version, required.version)) continue;
    const deadline = Date.parse(required.publishedAt) + POLICY_GRACE_DAYS * DAY;
    out.push({ doc, release: required, deadline, overdue: now >= deadline });
  }
  return out.sort((a, b) => a.deadline - b.deadline);
}

/** Agree to every pending version. Records the newest published version per doc. */
export function agreeAll(store: PolicyAgreementStore, pending: PendingPolicy[], releases: Record<string, PolicyRelease[]>, by: string): PolicyAgreementStore {
  const at = new Date().toISOString();
  const agreed = { ...store.agreed };
  for (const p of pending) agreed[p.doc.slug] = { version: releases[p.doc.slug]?.[0]?.version ?? p.release.version, at, by };
  return { ...store, agreed };
}

/** Recently updated policies buyers should hear about at checkout. */
export function recentBuyerUpdates(releases: Record<string, PolicyRelease[]>, now = Date.now()): { doc: LegalDoc; release: PolicyRelease }[] {
  const buyerFacing = ['terms', 'privacy', 'refunds'];
  return allLegalDocs
    .filter((d) => buyerFacing.includes(d.slug))
    .map((doc) => ({ doc, release: releases[doc.slug]?.[0] }))
    .filter((x): x is { doc: LegalDoc; release: PolicyRelease } => !!x.release && now - Date.parse(x.release.publishedAt) < CHECKOUT_NOTICE_DAYS * DAY);
}
