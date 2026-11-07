import type { AdminStore } from '../../types/admin';
import type { NavItem } from '../../data/navigation';
import { useAdminStore } from './store';

/**
 * Module and add-on availability (D464). Staff switch any workspace module or Marketplace add-on off in
 * Super admin → Feature flags. Off never hides anything: the page or listing stays visible to owners and says
 * "Currently not available"; add-ons can't be installed. Saved data is kept and comes back when it's on again.
 */
export const navKey = (navId: string) => `nav:${navId}`;
export const extKey = (extId: string) => `ext:${extId}`;

/** Screens every workspace needs to manage itself — never switchable. */
export const ALWAYS_ON_NAV = ['overview', 'extensions', 'settings'];

export const moduleOn = (store: AdminStore, key: string): boolean => store.modules?.[key]?.on !== false;

/** A workspace screen is available when its own switch is on and, for app screens, its add-on's switch is on too. */
export function navAvailable(store: AdminStore, nav: Pick<NavItem, 'id' | 'appId'>): boolean {
  if (ALWAYS_ON_NAV.includes(nav.id)) return true;
  return moduleOn(store, navKey(nav.id)) && (!nav.appId || moduleOn(store, extKey(nav.appId)));
}

export function useModuleAvailability() {
  const [store] = useAdminStore();
  return {
    nav: (nav: Pick<NavItem, 'id' | 'appId'>) => navAvailable(store, nav),
    ext: (extId: string) => moduleOn(store, extKey(extId)),
  };
}
