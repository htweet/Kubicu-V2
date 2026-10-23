import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { legacyModuleIds } from '../data/navigation';
import { NotFound } from './NotFound';

/** Staff console areas — the console itself still asks for a staff sign-in and checks the role. */
const staffAreas = ['health', 'audit', 'appeals', 'staff', 'flags', 'moderation', 'support', 'tenants', 'reporting', 'data-requests', 'escrow', 'modules'];
const shortcuts: Record<string, string> = {
  availability: '/app/bookings/availability',
  services: '/app/bookings/services',
  schedule: '/app/bookings',
  events: '/app/commerce/events',
  wallet: '/app/commerce/wallet',
  account: '/app/account'
};

/** Sends addresses from before the workspace moved to /app to their new home. */
export function LegacyRedirect() {
  const { pageId, module } = useParams();
  if (pageId) return <Navigate to={`/app/canvas/${pageId}`} replace />;
  if (module && legacyModuleIds.includes(module)) return <Navigate to={`/app/${module}`} replace />;
  // Short addresses people type from memory (D113a).
  if (module && staffAreas.includes(module)) return <Navigate to={`/admin/${module}`} replace />;
  if (module && shortcuts[module]) return <Navigate to={shortcuts[module]} replace />;
  return <NotFound />;
}