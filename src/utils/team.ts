import type { ActivityArea, ActivityEntry, Invite, Member, Role, TeamData } from '../types/team';
import type { Workspace } from '../types/workspace';
import { seatLimits } from '../data/permissions';
import { uid } from './id';

export const teamKey = (workspaceId: string) => `kubicu.team.${workspaceId}`;
export const OWNER_ID = 'member_owner';
export const INVITE_DAYS = 7;

export function emptyTeam(w: Workspace): TeamData {
  return {
    members: [{ id: OWNER_ID, name: w.ownerName || 'You', contact: '', role: 'owner', spaceIds: null, joinedAt: w.createdAt, lastActiveAt: new Date().toISOString() }],
    invites: [],
    approvalsOn: false,
    reviews: [],
    notices: [],
    salesRefundLimitNgn: 50000,
    activity: [],
    sampleSeeded: false
  };
}

export function readTeam(workspaceId: string): TeamData | null {
  try {
    const raw = window.localStorage.getItem(teamKey(workspaceId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TeamData>;
    if (!Array.isArray(parsed.members)) return null;
    return {
      members: parsed.members,
      invites: Array.isArray(parsed.invites) ? parsed.invites : [],
      approvalsOn: !!parsed.approvalsOn,
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
      notices: Array.isArray(parsed.notices) ? parsed.notices : [],
      salesRefundLimitNgn: typeof parsed.salesRefundLimitNgn === 'number' ? parsed.salesRefundLimitNgn : 50000,
      activity: Array.isArray(parsed.activity) ? parsed.activity : [],
      sampleSeeded: !!parsed.sampleSeeded
    };
  } catch {
    return null;
  }
}

export function writeTeam(workspaceId: string, data: TeamData): void {
  window.localStorage.setItem(teamKey(workspaceId), JSON.stringify(data));
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

/** SAMPLE teammates for the demo workspace (D59). */
export function withSampleTeam(t: TeamData): TeamData {
  const members: Member[] = [
  { id: 'member_ngozi', name: 'Ngozi Eze', contact: 'ngozi@example.com', role: 'editor', spaceIds: ['main', 'sp_sample_eid'], joinedAt: hoursAgo(24 * 9), lastActiveAt: hoursAgo(3), sample: true },
  { id: 'member_tunde', name: 'Tunde Bello', contact: '+234 809 000 3101', role: 'sales', spaceIds: null, joinedAt: hoursAgo(24 * 6), lastActiveAt: hoursAgo(20), sample: true }];

  const invites: Invite[] = [
  { id: 'inv_kemi', token: 'sample-kemi', contact: 'kemi@example.com', role: 'viewer', spaceIds: null, invitedBy: t.members[0]?.name ?? 'Owner', createdAt: hoursAgo(24), expiresAt: new Date(Date.now() + (INVITE_DAYS - 1) * 86400000).toISOString(), status: 'pending', sample: true }];

  const activity: ActivityEntry[] = [
  { id: 'act_s1', at: hoursAgo(3), actor: 'Ngozi Eze', area: 'pages', text: 'edited the Eid sale campaign', href: '/app/spaces' },
  { id: 'act_s2', at: hoursAgo(20), actor: 'Tunde Bello', area: 'commerce', text: 'marked order #1007 as packing', href: '/app/commerce/orders' },
  { id: 'act_s3', at: hoursAgo(24), actor: t.members[0]?.name ?? 'Owner', area: 'team', text: 'invited kemi@example.com as a Viewer', href: '/app/settings' }];

  return {
    ...t,
    members: [...t.members, ...members.filter((m) => !t.members.some((x) => x.id === m.id))],
    invites: [...t.invites, ...invites.filter((i) => !t.invites.some((x) => x.id === i.id))],
    activity: [...activity, ...t.activity],
    sampleSeeded: true
  };
}

export function inviteState(i: Invite, now = Date.now()): 'pending' | 'expired' | 'accepted' | 'cancelled' {
  if (i.status !== 'pending') return i.status;
  return Date.parse(i.expiresAt) <= now ? 'expired' : 'pending';
}

export function seatsUsed(t: TeamData): number {
  return t.members.length + t.invites.filter((i) => inviteState(i) === 'pending').length;
}

/**
 * Members beyond the plan's seats keep their account but act as Viewers until seats free up (D59).
 * The owner always has a seat; others keep theirs in the order they joined.
 */
export function pausedMemberIds(t: TeamData, plan: Workspace['plan']): Set<string> {
  const limit = seatLimits[plan];
  const others = t.members.filter((m) => m.role !== 'owner').sort((a, b) => Date.parse(a.joinedAt) - Date.parse(b.joinedAt));
  return new Set(others.slice(Math.max(0, limit - 1)).map((m) => m.id));
}

export function effectiveRole(m: Member, paused: Set<string>): Role {
  return paused.has(m.id) ? 'viewer' : m.role;
}

export function activity(actor: string, area: ActivityArea, text: string, href?: string): ActivityEntry {
  return { id: uid('act'), at: new Date().toISOString(), actor, area, text, href };
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : (parts[0] ?? '?').slice(0, 2)).toUpperCase();
}