import { useEffect, useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTeam } from '../../contexts/TeamContext';
import { useImports } from '../../contexts/ImportsContext';
import { DEMO_WORKSPACE_ID } from '../../utils/workspaceStorage';
import { ImportWorkspaceDialog } from '../account/ImportWorkspaceDialog';

/** Browser workspaces already offered once (device state, never uploaded). */
const PROMPTED_KEY = 'kubicu.importPrompted';

function readPrompted(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(PROMPTED_KEY) ?? '[]') as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Offers "Bring this workspace to your account" once per eligible browser workspace after signing in
 * (D-UI-2): not the demo workspace, not one started with demo data, not already linked. Each offer can
 * be reopened from Your account → Workspaces.
 */
/** True while the first-visit Extensions tour is showing for this workspace (same rule as ExtensionsTour). */
function tourShowing(workspaceId: string, canManage: boolean): boolean {
  if (!canManage) return false;
  try {
    return window.localStorage.getItem(`kubicu.extensionsTour.${workspaceId}`) !== 'done';
  } catch {
    return false;
  }
}

export function ImportPrompt() {
  const { workspaces, current } = useWorkspace();
  const canManage = useTeam().can('extensions.manage').allowed;
  // One thing at a time: the offer waits until the Extensions tour has been finished or skipped.
  const [tour, setTour] = useState(() => tourShowing(current.id, canManage));
  useEffect(() => {
    setTour(tourShowing(current.id, canManage));
    if (!tourShowing(current.id, canManage)) return;
    const id = window.setInterval(() => setTour(tourShowing(current.id, canManage)), 1000);
    return () => window.clearInterval(id);
  }, [current.id, canManage, tour]);
  const imports = useImports();
  const [prompted, setPrompted] = useState<string[]>(readPrompted);
  const [openId, setOpenId] = useState<string | null>(null);

  const eligible = imports?.loaded ?
  workspaces.filter((w) => w.id !== DEMO_WORKSPACE_ID && !w.demoData && !imports.imports.some((i) => i.legacyWorkspaceId === w.id && i.status === 'completed') && !prompted.includes(w.id)) :
  [];
  const next = tour ? null : eligible[0]?.id ?? null;

  useEffect(() => {
    if (!openId && next) setOpenId(next);
  }, [next, openId]);

  if (!openId) return null;
  const close = () => {
    const list = [...new Set([...readPrompted(), openId])];
    try {
      window.localStorage.setItem(PROMPTED_KEY, JSON.stringify(list));
    } catch {
      // Storage unavailable: the offer may appear again next time, which is harmless.
    }
    setPrompted(list);
    setOpenId(null);
  };
  return <ImportWorkspaceDialog open workspaceId={openId} onClose={close} />;
}
