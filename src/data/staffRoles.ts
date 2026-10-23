import type { StaffRole } from '../types/admin';

export interface StaffRoleInfo {
  id: StaffRole;
  label: string;
  description: string;
  /** Super-admin area ids this role can open. `'*'` means every area. */
  areas: string[] | '*';
}

/** Least privilege by default: each role opens only what its job needs (D83). */
export const staffRoles: StaffRoleInfo[] = [
{ id: 'lead', label: 'Platform lead', description: 'Everything, including staff and access. Keep this to two or three people.', areas: '*' },
{ id: 'trust', label: 'Trust & safety', description: 'Reports, takedowns, suspensions, appeals and escrow disputes.', areas: ['overview', 'tenants', 'pages', 'moderation', 'appeals', 'escrow', 'support', 'audit', 'health'] },
{ id: 'support', label: 'Support', description: 'Help requests, seller orders and personal-data requests.', areas: ['overview', 'tenants', 'pages', 'support', 'orders', 'data-requests', 'modules'] },
{ id: 'finance', label: 'Finance', description: 'Revenue, plans, payments, refunds and escrow decisions.', areas: ['overview', 'tenants', 'orders', 'escrow', 'reporting', 'plans', 'payments'] },
{ id: 'engineering', label: 'Engineering', description: 'Feature flags, the design system, extensions and system health.', areas: ['overview', 'flags', 'design-system', 'modules', 'health', 'audit', 'notifications', 'ai'] }];


export const roleInfo = (id: StaffRole): StaffRoleInfo => staffRoles.find((r) => r.id === id) ?? staffRoles[0];

export function roleCanOpen(role: StaffRole, area: string): boolean {
  const { areas } = roleInfo(role);
  return areas === '*' || areas.includes(area);
}

/** How long a verified staff session lasts. Example figure. */
export const STAFF_SESSION_HOURS = 8;