import { useCallback, useEffect, useState } from 'react';
import type { AdminStore, AuditEntry, FlagId } from '../../types/admin';
import type { WorkspacePlan } from '../../types/plan';
import { planOrder } from '../../data/plans';
import { uid } from '../id';
import { roleInfo } from '../../data/staffRoles';
import { readStaffSession } from './staffSession';

const KEY = 'kubicu.admin';
const EVENT = 'kubicu:admin';
/** The signed-in staff member in the prototype. */
export const STAFF_NAME = 'Kemi (KUBICU staff)';

const ago = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

function seed(): AdminStore {
  const now = new Date().toISOString();
  return {
    staff: [
    { id: 'stf-tolu', name: 'Tolu Bakare', email: 'tolu@kubicu.com', role: 'lead', status: 'active', twoStep: true, lastActiveAt: ago(1), invitedAt: ago(24 * 200) },
    SECOND_LEAD,
    { id: 'stf-ifeanyi', name: 'Ifeanyi Okafor', email: 'ifeanyi@kubicu.com', role: 'trust', status: 'active', twoStep: true, lastActiveAt: ago(6), invitedAt: ago(24 * 120) },
    { id: 'stf-kemi', name: 'Kemi Adeyemi', email: 'kemi@kubicu.com', role: 'support', status: 'active', twoStep: true, lastActiveAt: ago(3), invitedAt: ago(24 * 90) },
    { id: 'stf-dayo', name: 'Dayo Ajayi', email: 'dayo@kubicu.com', role: 'engineering', status: 'active', twoStep: true, lastActiveAt: ago(30), invitedAt: ago(24 * 60) },
    { id: 'stf-zainab', name: 'Zainab Musa', email: 'zainab@kubicu.com', role: 'finance', status: 'invited', twoStep: false, lastActiveAt: null, invitedAt: ago(20) }],

    appeals: [
    {
      id: uid('apl'),
      kind: 'takedown',
      handle: 'glow-by-halima',
      workspaceId: 'sample',
      workspaceName: 'Glow by Halima',
      from: 'Halima Yusuf',
      originalReason: 'Gallery used a photographer’s bridal photos without permission (copyright report).',
      originalBy: 'Ifeanyi Okafor · Trust & safety',
      statement: 'I bought those photos from the studio in 2024 and have the receipt. I’ve also added credit under each picture. Please restore my page — bookings come through it.',
      createdAt: ago(20),
      status: 'open',
      decision: null,
      decidedBy: null,
      decidedAt: null,
      sample: true
    }],

    flags: {
      ai_page_setup: { on: true, plans: [...planOrder], updatedAt: now },
      storefront: { on: true, plans: [...planOrder], updatedAt: now }
    },
    reports: [
    {
      id: uid('rep'),
      handle: 'cheap-iphones-lagos',
      workspaceId: null,
      reason: 'scam',
      details: 'Took my transfer for an iPhone 15 and blocked me on WhatsApp. Three friends say the same.',
      reporterEmail: 'tobi@example.com',
      createdAt: ago(5),
      status: 'open',
      decision: null,
      decidedAt: null,
      sample: true
    },
    {
      id: uid('rep'),
      handle: 'glow-by-halima',
      workspaceId: null,
      reason: 'copyright',
      details: 'The gallery uses four of my bridal photos without credit.',
      reporterEmail: 'studio@example.com',
      createdAt: ago(30),
      status: 'open',
      decision: null,
      decidedAt: null,
      sample: true
    }],

    takedowns: [],
    suspended: {},
    tickets: [
    {
      id: uid('tkt'),
      number: 1041,
      workspaceId: 'sample',
      workspaceName: 'Ade’s Kitchen',
      from: 'Ade Bello',
      topic: 'payments',
      subject: 'Payout hasn’t arrived',
      status: 'open',
      createdAt: ago(3),
      updatedAt: ago(3),
      messages: [{ id: uid('msg'), by: 'customer', name: 'Ade Bello', text: 'My payout from Monday still shows pending. Is something wrong with my bank details?', at: ago(3) }],
      sample: true
    },
    {
      id: uid('tkt'),
      number: 1038,
      workspaceId: 'sample',
      workspaceName: 'Lekki Lash Bar',
      from: 'Funmi O.',
      topic: 'pages',
      subject: 'Domain stuck on “Verifying”',
      status: 'waiting',
      createdAt: ago(52),
      updatedAt: ago(20),
      messages: [
      { id: uid('msg'), by: 'customer', name: 'Funmi O.', text: 'I added the records yesterday and it still says verifying.', at: ago(52) },
      { id: uid('msg'), by: 'staff', name: STAFF_NAME, text: 'Your CNAME points to kub.icu.com instead of kub.icu — could you remove the “.com” and press Check now?', at: ago(20) }],

      sample: true
    }],

    announcements: [],
    audit: [],
    orderNotes: {},
    dataRequests: [
    {
      id: uid('dsr'),
      kind: 'export',
      subject: 'visitor',
      name: 'Chiamaka Obi',
      email: 'chiamaka@example.com',
      workspaceName: 'Adaeze Atelier',
      details: 'Please send me everything Adaeze Atelier holds about me — orders, messages and whether I’m on any mailing list.',
      receivedAt: ago(26),
      dueAt: new Date(Date.now() - 26 * 3600000 + DATA_REQUEST_DAYS * 86400000).toISOString(),
      status: 'new',
      steps: [],
      outcome: null,
      closedAt: null,
      sample: true
    },
    {
      id: uid('dsr'),
      kind: 'correct',
      subject: 'visitor',
      name: 'Musa Ibrahim',
      email: 'musa.i@example.com',
      workspaceName: 'Lekki Lash Bar',
      details: 'My phone number on my bookings is wrong (last digits should be 4471). Please fix it.',
      receivedAt: ago(24 * 9),
      dueAt: new Date(Date.now() - 24 * 9 * 3600000 + DATA_REQUEST_DAYS * 86400000).toISOString(),
      status: 'in_progress',
      steps: ['verify'],
      outcome: null,
      closedAt: null,
      sample: true
    }],

    approvals: [],
    accessReviews: [],
    extensionPulls: {},
    autoFlagsCleared: {},
    planOverrides: {},
    coupons: [SAMPLE_COUPON],
    grants: [],
    aiOff: {},
    integrationTests: {},
    phraseReviews: {},
    policyReleases: {},
    incidents: [
    {
      id: 'inc-sample-1',
      title: 'Slow image uploads',
      impact: 'minor',
      services: ['Media storage'],
      status: 'resolved',
      startedAt: ago(24 * 4 + 3),
      resolvedAt: ago(24 * 4 + 1),
      updates: [
      { id: 'incu-s1', at: ago(24 * 4 + 3), status: 'investigating', message: 'Some sellers are seeing slow photo uploads in the canvas. Pages and checkout are not affected.', by: 'Dayo (KUBICU staff)' },
      { id: 'incu-s2', at: ago(24 * 4 + 1), status: 'resolved', message: 'Uploads are back to normal. Photos that failed can be added again — nothing already saved was lost.', by: 'Dayo (KUBICU staff)' }],

      sample: true
    }]

  };
}

/** A sample launch code so the coupon field can be tried straight away (D135). */
const SAMPLE_COUPON = {
  id: 'cpn-sample-naija',
  code: 'NAIJA20',
  kind: 'percent' as const,
  value: 20,
  plans: ['creator', 'pro', 'business'] as WorkspacePlan[],
  maxUses: 500,
  uses: 37,
  expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
  duration: 'first' as const,
  active: true,
  createdAt: ago(24 * 10),
  createdBy: 'Tolu Bakare · Platform lead',
  note: 'Launch offer for market traders’ association members.',
  sample: true
};

/** A second Platform lead so two-person approval can be tried in the prototype (D129). */
const SECOND_LEAD = { id: 'stf-ngozi', name: 'Ngozi Eze', email: 'ngozi@kubicu.com', role: 'lead' as const, status: 'active' as const, twoStep: true, lastActiveAt: ago(9), invitedAt: ago(24 * 180) };

/** Days to answer a personal-data request. Example figure — confirm against NDPA guidance (D82). */
export const DATA_REQUEST_DAYS = 30;

export function readAdminStore(): AdminStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AdminStore;
      const base = seed();
      // Older saved stores get the second sample lead once, so approvals have someone to approve them.
      const staff = parsed.staff ? parsed.staff.some((m) => m.id === SECOND_LEAD.id) ? parsed.staff : [...parsed.staff, SECOND_LEAD] : base.staff;
      return {
        ...base,
        ...parsed,
        flags: { ...base.flags, ...parsed.flags },
        orderNotes: parsed.orderNotes ?? {},
        dataRequests: parsed.dataRequests ?? base.dataRequests,
        staff,
        appeals: parsed.appeals ?? base.appeals,
        approvals: parsed.approvals ?? [],
        accessReviews: parsed.accessReviews ?? [],
        incidents: parsed.incidents ?? base.incidents,
        extensionPulls: parsed.extensionPulls ?? {},
        autoFlagsCleared: parsed.autoFlagsCleared ?? {},
        planOverrides: parsed.planOverrides ?? {},
        coupons: parsed.coupons ?? base.coupons,
        grants: parsed.grants ?? [],
        aiOff: parsed.aiOff ?? {},
        integrationTests: parsed.integrationTests ?? {},
        phraseReviews: parsed.phraseReviews ?? {},
        policyReleases: parsed.policyReleases ?? {}
      };
    }
  } catch {

    /* fall through to seed */}
  const fresh = seed();
  try {
    localStorage.setItem(KEY, JSON.stringify(fresh));
  } catch {

    /* storage blocked — keep in memory */}
  return fresh;
}

export function updateAdminStore(fn: (s: AdminStore) => AdminStore): boolean {
  try {
    const next = fn(readAdminStore());
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch {
    return false;
  }
}

/** Every privileged action needs a reason and lands in the staff audit log. */
export function audit(s: AdminStore, entry: Omit<AuditEntry, 'id' | 'at' | 'actor'>): AdminStore {
  return { ...s, audit: [{ id: uid('aud'), at: new Date().toISOString(), actor: staffActor(s), ...entry }, ...s.audit].slice(0, 500) };
}

/** "Name · Role" for the signed-in staff member — every audit entry and staff reply names a real person (D83). */
export function staffActor(s: AdminStore = readAdminStore()): string {
  const id = readStaffSession();
  const m = id ? s.staff.find((x) => x.id === id) : undefined;
  return m ? `${m.name} · ${roleInfo(m.role).label}` : STAFF_NAME;
}

/** What customers see on staff replies: first name only, never the role. */
export function staffReplyName(s: AdminStore = readAdminStore()): string {
  const id = readStaffSession();
  const m = id ? s.staff.find((x) => x.id === id) : undefined;
  return m ? `${m.name.split(' ')[0]} (KUBICU staff)` : STAFF_NAME;
}

export function useAdminStore(): [AdminStore, (fn: (s: AdminStore) => AdminStore) => boolean] {
  const [store, setStore] = useState<AdminStore>(() => readAdminStore());
  useEffect(() => {
    const sync = () => setStore(readAdminStore());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const update = useCallback((fn: (s: AdminStore) => AdminStore) => updateAdminStore(fn), []);
  return [store, update];
}

/** Is a flagged feature on? Without a plan, only the kill switch is checked. */
export function flagOn(store: AdminStore, id: FlagId, plan?: WorkspacePlan): boolean {
  const f = store.flags[id];
  if (!f?.on) return false;
  return plan ? f.plans.includes(plan) : true;
}

export function useFlag(id: FlagId, plan?: WorkspacePlan): boolean {
  const [store] = useAdminStore();
  return flagOn(store, id, plan);
}