import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { ActivityArea, Invite, Member, Notice, Permission, ReviewRequest, Role, TeamData } from '../types/team';
import { useWorkspace } from './WorkspaceContext';
import { DEMO_WORKSPACE_ID } from '../utils/workspaceStorage';
import { rolePermissions, permissionReason, roleInfo, seatLimits } from '../data/permissions';
import { activity, effectiveRole, emptyTeam, INVITE_DAYS, inviteState, OWNER_ID, pausedMemberIds, readTeam, seatsUsed, teamKey, withSampleTeam, writeTeam } from '../utils/team';
import { MAIN_SPACE_ID } from '../utils/spaces';
import { uid } from '../utils/id';

export interface CanResult {
  allowed: boolean;
  reason: string;
}

interface TeamValue {
  data: TeamData;
  /** The person using the app right now (the “Viewing as” control picks who). */
  me: Member;
  /** Role after seat limits (members over the plan's seats act as Viewers). */
  role: Role;
  /** Members over the plan's seats (D59). */
  paused: Set<string>;
  seatLimit: number;
  seatsUsed: number;
  can: (p: Permission, spaceId?: string) => CanResult;
  canAccessSpace: (spaceId: string) => boolean;
  invite: (input: {contact: string;role: Role;spaceIds: string[] | null;}) => Invite | null;
  cancelInvite: (id: string) => void;
  resendInvite: (id: string) => void;
  acceptInvite: (token: string, name: string) => Member | null;
  changeRole: (memberId: string, role: Role) => void;
  setSpaces: (memberId: string, spaceIds: string[] | null) => void;
  removeMember: (memberId: string) => void;
  transferOwnership: (memberId: string) => void;
  update: (patch: Partial<Pick<TeamData, 'approvalsOn' | 'salesRefundLimitNgn'>>) => void;
  log: (area: ActivityArea, text: string, href?: string) => void;
  /** Publishing needs a review for the signed-in member (approvals on, and not an Owner/Admin). */
  needsReview: boolean;
  requestReview: (input: Pick<ReviewRequest, 'spaceId' | 'spaceName' | 'handle' | 'doc' | 'live' | 'note' | 'scheduleAt'>) => ReviewRequest;
  updateReviewDoc: (id: string, doc: ReviewRequest['doc']) => void;
  withdrawReview: (id: string) => void;
  decideReview: (id: string, outcome: 'approved' | 'changes', comment: string) => void;
  myNotices: Notice[];
  markNoticesSeen: () => void;
}

const TeamContext = createContext<TeamValue | null>(null);

/** Members, invites, roles and the activity log of the current workspace (D57–D59). */
export function TeamProvider({ viewingAs, children }: {viewingAs: Role;children: React.ReactNode;}) {
  const { current } = useWorkspace();
  const [data, setData] = useState<TeamData>(() => {
    const stored = readTeam(current.id);
    const base = stored ?? emptyTeam(current);
    return current.id === DEMO_WORKSPACE_ID && !base.sampleSeeded ? withSampleTeam(base) : base;
  });
  const ref = useRef(data);
  ref.current = data;

  useEffect(() => {
    try {
      if (!readTeam(current.id)) writeTeam(current.id, ref.current);
    } catch {

      // Storage unavailable — team lasts for this visit.
    }const onStorage = (e: StorageEvent) => {
      if (e.key !== teamKey(current.id)) return;
      const next = readTeam(current.id);
      if (next) setData(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [current.id]);

  const apply = useCallback(
    (fn: (d: TeamData) => TeamData) => {
      const next = fn(ref.current);
      try {
        writeTeam(current.id, next);
      } catch {
        toast.error('Couldn’t save', { description: 'Your browser storage is full.' });
        return false;
      }
      ref.current = next;
      setData(next);
      return true;
    },
    [current.id]
  );

  const paused = useMemo(() => pausedMemberIds(data, current.plan), [data, current.plan]);
  const owner = data.members.find((m) => m.role === 'owner') ?? data.members[0];
  const me: Member = useMemo(() => {
    if (viewingAs === 'owner') return owner;
    const found = data.members.find((m) => m.role === viewingAs);
    // No teammate with that role yet: a labelled stand-in so the role can still be previewed.
    return found ?? { id: `preview_${viewingAs}`, name: `${roleInfo[viewingAs].label} (preview)`, contact: '', role: viewingAs, spaceIds: null, joinedAt: current.createdAt, lastActiveAt: null };
  }, [viewingAs, data.members, owner, current.createdAt]);
  const role = me.id.startsWith('preview_') ? me.role : effectiveRole(me, paused);

  const canAccessSpace = useCallback((spaceId: string) => role === 'owner' || role === 'admin' || !me.spaceIds || me.spaceIds.includes(spaceId), [role, me.spaceIds]);

  const can = useCallback(
    (p: Permission, spaceId?: string): CanResult => {
      if (!rolePermissions[role].has(p)) {
        const pausedNote = role === 'viewer' && me.role !== 'viewer' ? ` Your ${roleInfo[me.role].label} seat is paused until the plan has room.` : '';
        return { allowed: false, reason: `${permissionReason(p)}${pausedNote}` };
      }
      if (spaceId && !canAccessSpace(spaceId)) return { allowed: false, reason: 'You don’t have access to this space. Ask an Admin to add you.' };
      return { allowed: true, reason: '' };
    },
    [role, me.role, canAccessSpace]
  );

  const log = useCallback((area: ActivityArea, text: string, href?: string) => {
    apply((d) => ({ ...d, activity: [activity(me.name, area, text, href), ...d.activity].slice(0, 500) }));
  }, [apply, me.name]);

  const seatLimit = seatLimits[current.plan];
  const used = seatsUsed(data);

  const invite = useCallback(
    (input: {contact: string;role: Role;spaceIds: string[] | null;}) => {
      const contact = input.contact.trim();
      if (seatsUsed(ref.current) >= seatLimits[current.plan]) return null;
      const now = new Date();
      const inv: Invite = {
        id: uid('inv'),
        token: Math.random().toString(36).slice(2, 10),
        contact,
        role: input.role,
        spaceIds: input.spaceIds,
        invitedBy: me.name,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + INVITE_DAYS * 86400000).toISOString(),
        status: 'pending'
      };
      apply((d) => ({ ...d, invites: [inv, ...d.invites], activity: [activity(me.name, 'team', `invited ${contact} as ${articled(input.role)}`, '/app/settings'), ...d.activity] }));
      return inv;
    },
    [apply, current.plan, me.name]
  );

  const cancelInvite = useCallback(
    (id: string) => apply((d) => ({ ...d, invites: d.invites.map((i) => i.id === id ? { ...i, status: 'cancelled' as const } : i), activity: [activity(me.name, 'team', `cancelled the invite for ${d.invites.find((i) => i.id === id)?.contact ?? 'someone'}`), ...d.activity] })),
    [apply, me.name]
  );

  const resendInvite = useCallback(
    (id: string) => apply((d) => ({ ...d, invites: d.invites.map((i) => i.id === id ? { ...i, expiresAt: new Date(Date.now() + INVITE_DAYS * 86400000).toISOString() } : i) })),
    [apply]
  );

  const acceptInvite = useCallback(
    (token: string, name: string) => {
      const inv = ref.current.invites.find((i) => i.token === token);
      if (!inv || inviteState(inv) !== 'pending') return null;
      const member: Member = { id: uid('member'), name: name.trim() || inv.contact, contact: inv.contact, role: inv.role, spaceIds: inv.spaceIds, joinedAt: new Date().toISOString(), lastActiveAt: new Date().toISOString() };
      apply((d) => ({ ...d, members: [...d.members, member], invites: d.invites.map((i) => i.id === inv.id ? { ...i, status: 'accepted' as const } : i), activity: [activity(member.name, 'team', `joined as ${articled(inv.role)}`, '/app/settings'), ...d.activity] }));
      return member;
    },
    [apply]
  );

  const changeRole = useCallback(
    (memberId: string, next: Role) =>
    apply((d) => {
      const m = d.members.find((x) => x.id === memberId);
      if (!m || m.role === 'owner' || next === 'owner') return d;
      return { ...d, members: d.members.map((x) => x.id === memberId ? { ...x, role: next } : x), activity: [activity(me.name, 'team', `changed ${m.name}’s role to ${roleInfo[next].label}`, '/app/settings'), ...d.activity] };
    }),
    [apply, me.name]
  );

  const setSpaces = useCallback(
    (memberId: string, spaceIds: string[] | null) =>
    apply((d) => {
      const m = d.members.find((x) => x.id === memberId);
      if (!m) return d;
      return { ...d, members: d.members.map((x) => x.id === memberId ? { ...x, spaceIds } : x), activity: [activity(me.name, 'team', `changed which spaces ${m.name} can edit`, '/app/settings'), ...d.activity] };
    }),
    [apply, me.name]
  );

  const removeMember = useCallback(
    (memberId: string) =>
    apply((d) => {
      const m = d.members.find((x) => x.id === memberId);
      if (!m || m.role === 'owner') return d;
      return { ...d, members: d.members.filter((x) => x.id !== memberId), activity: [activity(me.name, 'team', `removed ${m.name} from the workspace`, '/app/settings'), ...d.activity] };
    }),
    [apply, me.name]
  );

  const transferOwnership = useCallback(
    (memberId: string) =>
    apply((d) => {
      const to = d.members.find((x) => x.id === memberId);
      const from = d.members.find((x) => x.role === 'owner');
      if (!to || !from || to.id === from.id) return d;
      return {
        ...d,
        members: d.members.map((x) => x.id === to.id ? { ...x, role: 'owner' as const, spaceIds: null } : x.id === from.id ? { ...x, role: 'admin' as const } : x),
        activity: [activity(me.name, 'team', `transferred ownership to ${to.name}`, '/app/settings'), ...d.activity]
      };
    }),
    [apply, me.name]
  );

  const update = useCallback(
    (patch: Partial<Pick<TeamData, 'approvalsOn' | 'salesRefundLimitNgn'>>) =>
    apply((d) => ({ ...d, ...patch, activity: 'approvalsOn' in patch ? [activity(me.name, 'settings', patch.approvalsOn ? 'turned on approvals for publishing' : 'turned off approvals for publishing', '/app/settings/approvals'), ...d.activity] : d.activity })),
    [apply, me.name]
  );

  // Approvals (D58): Owners and Admins publish directly; everyone else sends for review when it's on.
  const needsReview = data.approvalsOn && !rolePermissions[role].has('approvals.review');
  const reviewers = (d: TeamData) => d.members.filter((m) => (m.role === 'owner' || m.role === 'admin') && !pausedMemberIds(d, current.plan).has(m.id));
  const notice = (memberId: string, text: string, href?: string): Notice => ({ id: uid('ntc'), at: new Date().toISOString(), memberId, text, href, seen: false });

  const requestReview = useCallback(
    (input: Pick<ReviewRequest, 'spaceId' | 'spaceName' | 'handle' | 'doc' | 'live' | 'note' | 'scheduleAt'>) => {
      const at = new Date().toISOString();
      const req: ReviewRequest = { ...input, id: uid('rev'), requestedBy: me.name, requestedById: me.id, createdAt: at, updatedAt: at, status: 'pending' };
      apply((d) => ({
        ...d,
        // One open request per space: a new one replaces the old.
        reviews: [req, ...d.reviews.map((r) => r.spaceId === input.spaceId && r.status === 'pending' ? { ...r, status: 'withdrawn' as const } : r)],
        notices: [...reviewers(d).map((m) => notice(m.id, `${me.name} sent ${input.spaceName} for review`, `/app/settings/approvals?review=${req.id}`)), ...d.notices],
        activity: [activity(me.name, 'pages', `sent ${input.spaceName} for review`, `/app/settings/approvals?review=${req.id}`), ...d.activity]
      }));
      return req;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apply, me.name, me.id, current.plan]
  );

  const updateReviewDoc = useCallback((id: string, doc: ReviewRequest['doc']) => apply((d) => ({ ...d, reviews: d.reviews.map((r) => r.id === id && r.status === 'pending' ? { ...r, doc, updatedAt: new Date().toISOString() } : r) })), [apply]);

  const withdrawReview = useCallback(
    (id: string) => apply((d) => ({ ...d, reviews: d.reviews.map((r) => r.id === id && r.status === 'pending' ? { ...r, status: 'withdrawn' as const } : r), activity: [activity(me.name, 'pages', `withdrew the review request for ${d.reviews.find((r) => r.id === id)?.spaceName ?? 'a space'}`), ...d.activity] })),
    [apply, me.name]
  );

  const decideReview = useCallback(
    (id: string, outcome: 'approved' | 'changes', comment: string) =>
    apply((d) => {
      const r = d.reviews.find((x) => x.id === id);
      if (!r || r.status !== 'pending') return d;
      const text = outcome === 'approved' ? `${me.name} approved ${r.spaceName}${r.scheduleAt ? ' — it’s scheduled' : ' — it’s live'}` : `${me.name} asked for changes to ${r.spaceName}: “${comment}”`;
      return {
        ...d,
        reviews: d.reviews.map((x) => x.id === id ? { ...x, status: outcome, comment: comment.trim() || undefined, decidedBy: me.name, decidedAt: new Date().toISOString() } : x),
        notices: [notice(r.requestedById, text, '/app/canvas'), ...d.notices],
        activity: [activity(me.name, 'pages', outcome === 'approved' ? `approved and published ${r.spaceName}` : `asked for changes to ${r.spaceName}`, `/app/settings/approvals?review=${id}`), ...d.activity]
      };
    }),
    [apply, me.name]
  );

  const myNotices = useMemo(() => data.notices.filter((n) => n.memberId === me.id), [data.notices, me.id]);
  const markNoticesSeen = useCallback(() => apply((d) => d.notices.some((n) => n.memberId === me.id && !n.seen) ? { ...d, notices: d.notices.map((n) => n.memberId === me.id ? { ...n, seen: true } : n) } : d), [apply, me.id]);

  const value = useMemo<TeamValue>(
    () => ({ data, me, role, paused, seatLimit, seatsUsed: used, can, canAccessSpace, invite, cancelInvite, resendInvite, acceptInvite, changeRole, setSpaces, removeMember, transferOwnership, update, log, needsReview, requestReview, updateReviewDoc, withdrawReview, decideReview, myNotices, markNoticesSeen }),
    [data, me, role, paused, seatLimit, used, can, canAccessSpace, invite, cancelInvite, resendInvite, acceptInvite, changeRole, setSpaces, removeMember, transferOwnership, update, log, needsReview, requestReview, updateReviewDoc, withdrawReview, decideReview, myNotices, markNoticesSeen]
  );
  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

function articled(role: Role): string {
  return `${role === 'admin' || role === 'editor' || role === 'owner' ? 'an' : 'a'} ${roleInfo[role].label}`;
}

export function useTeam(): TeamValue {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used inside TeamProvider');
  return ctx;
}

export function useOptionalTeam(): TeamValue | null {
  return useContext(TeamContext);
}

/** `{ allowed, reason }` for one action, optionally inside one space. */
export function useCan(p: Permission, spaceId?: string): CanResult {
  return useTeam().can(p, spaceId);
}

export { OWNER_ID, MAIN_SPACE_ID };