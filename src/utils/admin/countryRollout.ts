import type { AdminStore } from '../../types/admin';
import type { CountryCode } from '../../types/country';
import { useAdminStore } from './store';

/**
 * Country rollout (D494). Staff open countries one at a time from Super admin → Feature flags, starting from Nigeria.
 * A closed country turns away new sign-ups and closes its workspaces to their teams; buyers still reach published pages.
 */
export const LAUNCH_COUNTRY: CountryCode = 'NG';

export const countryOpen = (store: AdminStore, code: CountryCode): boolean => code === LAUNCH_COUNTRY || store.countries?.[code]?.open !== false;

export const countryOpensOn = (store: AdminStore, code: CountryCode): string | null => countryOpen(store, code) ? null : store.countries?.[code]?.opensOn || null;

export function useCountryRollout() {
  const [store] = useAdminStore();
  return {
    open: (code: CountryCode) => countryOpen(store, code),
    opensOn: (code: CountryCode) => countryOpensOn(store, code)
  };
}

/** A planned opening day, written out for people ("12 March 2027"). */
export function formatOpeningDay(iso: string, locale = 'en-GB'): string {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}