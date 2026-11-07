import { useCallback, useMemo } from 'react';
import type { Partnership } from '../types/partnership';
import { useEditor } from '../contexts/EditorContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useLocalStore } from './useLocalStore';
import { useCoBrandActor } from './useCoBrandActor';
import { emptyPartnerships, partnershipKey } from '../utils/partnerships';
import { changesSinceLive, needsPartnerApproval } from '../utils/coBrand';

/** Everything the canvas needs about the co-branded space being edited (D121). */
export function useCoBrand() {
  const { state } = useEditor();
  const { current } = useWorkspace();
  const site = state.site;
  const cb = site.coBrand ?? null;
  const store = useLocalStore(partnershipKey(current.id), emptyPartnerships);
  const partnership = cb ? store.data.partnerships.find((p) => p.id === cb.partnershipId) : undefined;
  const [actor, setActor] = useCoBrandActor(site.id);
  const live = state.published ?? null;
  const hasLive = !!live;
  const needsApproval = cb ? needsPartnerApproval(site, hasLive) : false;
  const changes = useMemo(() => (cb && live ? changesSinceLive(live, site) : []), [cb, live, site]);
  const savePartnership = useCallback((next: Partnership) => store.update((d) => ({ ...d, partnerships: d.partnerships.map((p) => (p.id === next.id ? next : p)) })), [store]);
  const activePartnerships = store.data.partnerships.filter((p) => p.status === 'active');
  return { cb, partnership, activePartnerships, savePartnership, actor: cb ? actor : ('lead' as const), setActor, live, hasLive, needsApproval, changes, leadName: current.name };
}
