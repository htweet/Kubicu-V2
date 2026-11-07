import type { Permission, Role } from '../types/team';
import type { WorkspacePlan } from '../types/plan';

/** The single role × action table (D57). Engineering must enforce the same table on the server. */

export const roleOrder: Role[] = ['owner', 'admin', 'editor', 'sales', 'viewer'];

export const roleInfo: Record<Role, { label: string; summary: string }> = {
  owner: { label: 'Owner', summary: 'Everything, including billing, plan, deleting the workspace and transferring ownership. One per workspace.' },
  admin: { label: 'Admin', summary: 'Everything except billing, deleting the workspace and removing the Owner. Manages the team and approves changes.' },
  editor: { label: 'Editor', summary: 'Builds pages, campaigns and DealRooms in the spaces they can access, and manages media.' },
  sales: { label: 'Sales', summary: 'Orders, fulfilment, bookings, contacts and follow-ups. Can’t edit pages or prices; large refunds need an Admin.' },
  viewer: { label: 'Viewer', summary: 'Sees everything they can access and changes nothing. Good for accountants or partners.' },
};

export const permissionRows: { id: Permission; label: string }[] = [
  { id: 'pages.edit', label: 'Edit pages, campaigns and DealRooms' },
  { id: 'pages.publish', label: 'Publish' },
  { id: 'spaces.manage', label: 'Create and archive spaces' },
  { id: 'media.manage', label: 'Upload and delete media' },
  { id: 'products.edit', label: 'Add products and change stock' },
  { id: 'prices.edit', label: 'Change prices' },
  { id: 'orders.manage', label: 'Fulfil and cancel orders' },
  { id: 'orders.refund', label: 'Refund orders' },
  { id: 'tickets.checkin', label: 'Check in guests at events' },
  { id: 'discounts.manage', label: 'Create discounts' },
  { id: 'commerce.settings', label: 'Payments, delivery and storefront settings' },
  { id: 'payouts.manage', label: 'Pay out from the wallet and change bank accounts' },
  { id: 'paylinks.manage', label: 'Create payment links' },
  { id: 'bookings.manage', label: 'Manage bookings and services' },
  { id: 'contacts.manage', label: 'Manage contacts and follow-ups' },
  { id: 'automations.manage', label: 'Build and switch on automations' },
  { id: 'analytics.view', label: 'See analytics' },
  { id: 'domains.manage', label: 'Connect and manage domains' },
  { id: 'team.manage', label: 'Invite people and change roles' },
  { id: 'approvals.review', label: 'Approve changes' },
  { id: 'extensions.manage', label: 'Install and manage extensions' },
  { id: 'billing.manage', label: 'Change plan and billing' },
  { id: 'ownership.transfer', label: 'Transfer ownership' },
  { id: 'workspace.delete', label: 'Delete the workspace' },
];

const all = permissionRows.map((r) => r.id);

export const rolePermissions: Record<Role, Set<Permission>> = {
  owner: new Set(all),
  // Payouts stay with the Owner unless they allow Admins in Wallet settings (D92).
  admin: new Set(all.filter((p) => p !== 'billing.manage' && p !== 'ownership.transfer' && p !== 'workspace.delete' && p !== 'payouts.manage')),
  editor: new Set<Permission>(['pages.edit', 'pages.publish', 'spaces.manage', 'media.manage', 'analytics.view']),
  sales: new Set<Permission>(['products.edit', 'orders.manage', 'orders.refund', 'tickets.checkin', 'bookings.manage', 'contacts.manage', 'analytics.view', 'paylinks.manage']),
  viewer: new Set<Permission>(),
};

/** “Only Admins and Owners can …” — the reason shown on anything disabled. */
export function permissionReason(p: Permission): string {
  const roles = roleOrder.filter((r) => rolePermissions[r].has(p)).map((r) => `${roleInfo[r].label}s`);
  const label = permissionRows.find((r) => r.id === p)?.label.toLowerCase() ?? 'do this';
  const who = roles.length <= 1 ? roles[0] ?? 'Owners' : `${roles.slice(0, -1).join(', ')} and ${roles[roles.length - 1]}`;
  return `Only ${who} can ${label}.`;
}

/**
 * AI run permissions (Batch 2, D550). Account mode only, so they're kept out of `permissionRows` and the
 * browser-mode roles table. Owner and Admin get all three; other roles none until engineering confirms.
 */
export type WorkflowPermission = 'workflows.run' | 'workflows.approve' | 'workflows.admin';
const allWorkflow: WorkflowPermission[] = ['workflows.run', 'workflows.approve', 'workflows.admin'];
export const workflowPermissions: Record<Role, WorkflowPermission[]> = { owner: allWorkflow, admin: allWorkflow, editor: [], sales: [], viewer: [] };
export const workflowPermissionReasons: Record<WorkflowPermission, string> = {
  'workflows.run': 'Only Owners and Admins can start AI runs.',
  'workflows.approve': 'Only Owners and Admins can approve AI actions.',
  'workflows.admin': 'Only the person who started it, or an Owner or Admin, can cancel this run.',
};

/** Team seats per plan, including the owner. Example figures (D59). */
export const seatLimits: Record<WorkspacePlan, number> = { free: 1, creator: 1, pro: 1, business: 5, agency: 25, enterprise: 100 };
