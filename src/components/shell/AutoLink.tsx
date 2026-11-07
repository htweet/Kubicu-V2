import { useEffect, useRef } from 'react';
import { useOptionalAuth } from '../../contexts/AuthContext';
import { useImports } from '../../contexts/ImportsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { doneAutoLink, pendingAutoLinks } from '../../utils/autoLink';
import { buildLegacyBundleFrom, readBrowserStorage } from '../../utils/legacyBundle';

/**
 * Links workspaces created while signed in to the account, without asking (owner decision, 7 Nov 2026). Uses the same
 * bundle and upload as "Bring it to my account"; a failure leaves the workspace in this browser and retries next visit.
 * Renders nothing.
 */
export function AutoLink() {
  const auth = useOptionalAuth();
  const imports = useImports();
  const { workspaces } = useWorkspace();
  const running = useRef(false);

  useEffect(() => {
    if (auth?.status !== 'signedIn' || !imports?.loaded || running.current) return;
    const todo = pendingAutoLinks().filter((id) => workspaces.some((w) => w.id === id));
    if (todo.length === 0) return;
    running.current = true;
    void (async () => {
      for (const id of todo) {
        if (imports.linkFor(id)) {
          doneAutoLink(id);
          continue;
        }
        try {
          const { bundle } = await buildLegacyBundleFrom(readBrowserStorage(), id);
          await imports.upload(bundle);
          doneAutoLink(id);
        } catch {
          // Offline, a limit, or a key-like value in the data: stays in this browser; tried again on the next visit.
        }
      }
      running.current = false;
    })();
  }, [auth?.status, imports, workspaces]);

  return null;
}
