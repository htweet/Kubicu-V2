import { useEffect } from 'react';
import { extensionActive, readMarketplace } from '../../utils/marketplace';

export const SEARCH_VERIFY = /^[A-Za-z0-9_-]{20,64}$/;

/**
 * Search Console & SEO (D232): adds Google's site-verification tag to live pages so the owner can prove
 * they own the address. A meta tag, not a cookie, so it doesn't wait for the cookie notice.
 */
export function SearchVerificationTag({ workspaceId }: { workspaceId: string }) {
  const market = readMarketplace(workspaceId);
  const code = extensionActive(market, 'search-console') ? (market.installed['search-console']?.settings.verification ?? '').trim() : '';
  useEffect(() => {
    if (!SEARCH_VERIFY.test(code)) return;
    const m = document.createElement('meta');
    m.name = 'google-site-verification';
    m.content = code;
    document.head.appendChild(m);
    return () => m.remove();
  }, [code]);
  return null;
}
