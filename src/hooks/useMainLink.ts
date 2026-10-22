import { useWorkspace } from '../contexts/WorkspaceContext';
import { useDomains } from '../contexts/DomainsContext';
import { spaceHandle } from '../utils/domains/links';
import { MAIN_SPACE_ID } from '../utils/spaces';

/** The main page's handle and, when connected, its primary custom domain — short links live under these (D62). */
export function useMainLink(): {mainHandle: string;host: string | null;} {
  const { current } = useWorkspace();
  const { data } = useDomains();
  const mainHandle = spaceHandle(current.id, MAIN_SPACE_ID) ?? '';
  const host = data.domains.find((d) => d.spaceId === MAIN_SPACE_ID && d.status === 'live' && d.primary)?.host ?? null;
  return { mainHandle, host };
}