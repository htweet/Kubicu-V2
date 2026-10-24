import type { AdminStore, PendingApproval, StaffMember } from '../../types/admin';
import { roleInfo } from '../../data/staffRoles';
import { audit } from './store';

/** A high-risk request expires if no second Platform lead decides within this many hours. Example figure (D129). */
export const APPROVAL_HOURS = 24;

/** Pending requests past their deadline count as expired, without needing a background job. */
export function effectiveStatus(a: PendingApproval, now = Date.now()): PendingApproval['status'] {
  return a.status === 'pending' && Date.parse(a.expiresAt) < now ? 'expired' : a.status;
}

export const STAFF_KINDS: PendingApproval['kind'][] = ['staff_role', 'staff_disable', 'staff_reset'];

/** Which Super-admin area a second approver must be able to open for each kind. */
export const approvalArea: Record<PendingApproval['kind'], string> = { staff_role: 'staff', staff_disable: 'staff', staff_reset: 'staff', workspace_suspend: 'tenants', payout_release: 'payments' };

export function approvalSummary(kind: PendingApproval['kind'], m: StaffMember, role?: PendingApproval['role']): string {
  if (kind === 'staff_role') return `Change ${m.name}: ${roleInfo(m.role).label} → ${roleInfo(role ?? m.role).label}`;
  if (kind === 'staff_disable') return `Disable ${m.name}’s staff account`;
  return `Reset ${m.name}’s two-step sign-in`;
}

/** Applies an approved request. Re-checks the rules at approval time, since things may have changed. */
export function applyApproval(s: AdminStore, a: PendingApproval, approver: string): {store: AdminStore;error?: string;} {
  const decidedAt = new Date().toISOString();
  if (a.kind === 'workspace_suspend' || a.kind === 'payout_release') {
    // Payout money moves are applied by the caller (they live in the workspace's wallet, not here).
    let next: AdminStore = { ...s, approvals: s.approvals.map((x) => x.id === a.id ? { ...a, status: 'approved', decidedBy: approver, decidedAt, decisionNote: null } : x) };
    if (a.kind === 'workspace_suspend' && a.workspaceId) next = { ...next, suspended: { ...next.suspended, [a.workspaceId]: { reason: a.reason, at: decidedAt } } };
    next = audit(next, { area: a.kind === 'workspace_suspend' ? 'tenants' : 'payments', action: `${a.summary} (approved — requested by ${a.requestedBy})`, target: a.targetEmail, reason: a.reason });
    return { store: next };
  }
  const m = s.staff.find((x) => x.id === a.targetId);
  if (!m) return { store: s, error: 'That staff account no longer exists.' };
  const activeLeads = s.staff.filter((x) => x.role === 'lead' && x.status === 'active');
  const removesLead = m.role === 'lead' && m.status === 'active' && (a.kind === 'staff_disable' || a.kind === 'staff_role' && a.role !== 'lead');
  if (removesLead && activeLeads.length <= 1) return { store: s, error: 'This would leave no active Platform lead.' };

  const patch: Partial<StaffMember> = a.kind === 'staff_role' ? { role: a.role } : a.kind === 'staff_disable' ? { status: 'disabled' } : { twoStep: false, backupCodes: [] };
  const decided: PendingApproval = { ...a, status: 'approved', decidedBy: approver, decidedAt: new Date().toISOString(), decisionNote: null };
  let next: AdminStore = {
    ...s,
    staff: s.staff.map((x) => x.id === m.id ? { ...x, ...patch } : x),
    approvals: s.approvals.map((x) => x.id === a.id ? decided : x)
  };
  next = audit(next, { area: 'staff', action: `${a.summary} (approved — requested by ${a.requestedBy})`, target: a.targetEmail, reason: a.reason });
  return { store: next };
}

/** Builds a new request that expires after APPROVAL_HOURS. */
export function newApproval(p: Pick<PendingApproval, 'kind' | 'summary' | 'targetId' | 'targetEmail' | 'reason' | 'requestedById' | 'requestedBy'> & Partial<Pick<PendingApproval, 'role' | 'workspaceId' | 'payoutId' | 'amountNgn'>>): PendingApproval {
  const now = Date.now();
  return { id: `apr_${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`, ...p, requestedAt: new Date(now).toISOString(), expiresAt: new Date(now + APPROVAL_HOURS * 3600000).toISOString(), status: 'pending', decidedBy: null, decidedAt: null, decisionNote: null };
}

/** Ten one-time codes like "7KQ2-M3DX". Ambiguous characters (0/O, 1/I) are left out. */
export function makeBackupCodes(): string[] {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const pick = () => chars[Math.floor(Math.random() * chars.length)];
  return Array.from({ length: 10 }, () => `${Array.from({ length: 4 }, pick).join('')}-${Array.from({ length: 4 }, pick).join('')}`);
}

export const normaliseCode = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '');