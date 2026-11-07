import { useCallback, useEffect, useState } from 'react';
import type { SponsorBrief } from '../types/sponsorship';
import { SPONSOR_EVENT, SPONSOR_KEY, readBriefs, writeBriefs } from '../utils/sponsorships';

/** All sponsorship briefs in this browser, shared by every workspace (D441). */
export function useSponsorships() {
  const [briefs, setBriefs] = useState<SponsorBrief[]>(readBriefs);
  useEffect(() => {
    const refresh = () => setBriefs(readBriefs());
    const onStorage = (e: StorageEvent) => e.key === SPONSOR_KEY && refresh();
    window.addEventListener(SPONSOR_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SPONSOR_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  const update = useCallback((fn: (list: SponsorBrief[]) => SponsorBrief[]) => writeBriefs(fn(readBriefs())), []);
  return { briefs, update };
}
