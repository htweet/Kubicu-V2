import React from 'react';
import { useLocation } from 'react-router-dom';
import { EyeIcon } from 'lucide-react';
import type { Permission } from '../../types/team';
import { useTeam } from '../../contexts/TeamContext';
import { roleInfo } from '../../data/permissions';

/** The permission that lets you change things on each workspace screen (D57). */
const areas: [RegExp, Permission, string][] = [
  [/^\/app\/commerce\/(orders)/, 'orders.manage', 'orders'],
  [/^\/app\/commerce\/(products|inventory|digital)/, 'products.edit', 'products'],
  [/^\/app\/commerce\/discounts/, 'discounts.manage', 'discounts'],
  [/^\/app\/commerce\/(storefront|payments|settings)/, 'commerce.settings', 'these settings'],
  [/^\/app\/bookings/, 'bookings.manage', 'bookings'],
  [/^\/app\/audience/, 'contacts.manage', 'contacts'],
  [/^\/app\/automations/, 'automations.manage', 'automations'],
  [/^\/app\/media/, 'media.manage', 'media'],
  [/^\/app\/spaces/, 'spaces.manage', 'spaces'],
  [/^\/app\/domains\/?$/, 'domains.manage', 'domains'],
  [/^\/app\/domains\/(qr|links|redirects)/, 'pages.edit', 'QR codes, links and redirects'],
];

/** A quiet line above a screen when your role can look but not change it. */
export function RoleBanner() {
  const { pathname } = useLocation();
  const team = useTeam();
  const match = areas.find(([re]) => re.test(pathname));
  if (!match) return null;
  const res = team.can(match[1]);
  if (res.allowed) return null;
  return (
    <div role="status" className="border-b border-line bg-sunken">
      <p className="mx-auto flex w-full max-w-[1200px] items-start gap-2 px-5 py-2.5 text-caption text-fg-muted md:px-10">
        <EyeIcon size={14} className="mt-0.5 shrink-0" aria-hidden />
        <span>
          <span className="font-semibold text-fg">View only.</span> {res.reason} You’re signed in as {team.me.name} ({roleInfo[team.role].label}), so changes to {match[2]} won’t save.
        </span>
      </p>
    </div>
  );
}
