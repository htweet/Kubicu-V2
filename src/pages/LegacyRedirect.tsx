import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { legacyModuleIds } from '../data/navigation';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { resolvePublicPage } from '../utils/resolvePublicPage';
import { NotFound } from './NotFound';
import { STAFF_CONSOLE_BUILD } from '../utils/staffConsole';

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
const handleShape = /^[a-z0-9][a-z0-9-]{1,48}$/i;

/**
 * Sends addresses from before the workspace moved to /app to their new home, and turns
 * public addresses written the way they're shown ("kub.icu/adaeze-trunk-show") into the
 * page's real address (/p/adaeze-trunk-show) instead of a 404 (D187).
 */
export function LegacyRedirect() {
  const { pageId, module } = useParams();
  const { pathname, search } = useLocation();
  const { workspaces } = useWorkspace();

  if (pageId) return <Navigate to={`/app/canvas/${pageId}`} replace />;
  if (module && legacyModuleIds.includes(module)) return <Navigate to={`/app/${module}`} replace />;
  // Short addresses people type from memory (D113a).
  // Staff-area shortcuts exist only in builds with the prototype staff console (G-1).
  if (STAFF_CONSOLE_BUILD && module && staffAreas.includes(module)) return <Navigate to={`/admin/${module}`} replace />;
  if (module && shortcuts[module]) return <Navigate to={shortcuts[module]} replace />;

  // Public page addresses typed without /p — optionally with the "kub.icu/" prefix pasted in.
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0]?.toLowerCase() === 'kub.icu') segments.shift();
  const [handle, ...rest] = segments;
  if (handle && handleShape.test(handle)) {
    const lower = handle.toLowerCase();
    if (resolvePublicPage(lower, workspaces, '')) {
      return <Navigate to={`/p/${[lower, ...rest].join('/')}${search}`} replace />;
    }
  }
  return <NotFound />;
}