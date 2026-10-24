import { useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useLocalStore } from './useLocalStore';
import { developersKey, emptyDevelopers, seedDevelopers } from '../utils/developers';

/** Developer keys, webhooks and connected apps for the current workspace (D131). */
export function useDevelopers() {
  const { current } = useWorkspace();
  const store = useLocalStore(developersKey(current.id), emptyDevelopers);
  const { data, update } = store;
  useEffect(() => {
    if (!data.seeded) update(seedDevelopers);
  }, [data.seeded, update]);
  return { ...store, workspaceId: current.id };
}