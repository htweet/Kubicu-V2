import { announceServerLinkChange } from '../utils/serverSpaces';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useOptionalAuth } from './AuthContext';
import { api } from '../utils/auth/session';
import type { LegacyBundle } from '../utils/legacyBundle';

/**
 * Which browser workspaces are linked to the account (M2.6, D-UI-2). The server is the only source:
 * GET /v1/imports; nothing about links is kept in the browser. Mounted only with real sign-in on.
 */
export interface Reinvite {
  contact: string;
  contactKind: 'email' | 'phone';
  role: string;
}

export interface ImportRecord {
  importId: string;
  workspaceId: string;
  orgId: string;
  legacyWorkspaceId: string;
  workspaceName?: string;
  mode: 'primary' | 'copy';
  status: 'completed' | 'rolled_back' | string;
  undoUntil: string;
  imported?: string[];
  excluded?: string[];
  sampleRecordsRemoved?: number;
  reinvites?: Reinvite[];
}

interface ImportsValue {
  loaded: boolean;
  imports: ImportRecord[];
  /** The live (not undone) primary import of this browser workspace, if any. */
  linkFor: (legacyWorkspaceId: string) => ImportRecord | undefined;
  refresh: () => Promise<ImportRecord[]>;
  upload: (bundle: LegacyBundle) => Promise<ImportRecord>;
  undo: (importId: string) => Promise<void>;
  sealedCopy: (importId: string) => Promise<{ legacyWorkspaceId: string; workspace: { id: string; name: string }; entries: Array<{ key: string; valueJson: string }> }>;
}

const ImportsContext = createContext<ImportsValue | null>(null);

export function ImportsProvider({ children }: { children: React.ReactNode }) {
  const auth = useOptionalAuth();
  const signedIn = auth?.status === 'signedIn';
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const r = await api<{ imports: ImportRecord[] }>('GET', '/v1/imports');
    setImports(r.imports);
    setLoaded(true);
    return r.imports;
  }, []);

  useEffect(() => {
    if (!signedIn) {
      setImports([]);
      setLoaded(false);
      return;
    }
    refresh().catch(() => setLoaded(true));
  }, [signedIn, refresh]);

  const value = useMemo<ImportsValue>(
    () => ({
      loaded,
      imports,
      linkFor: (id) => imports.find((i) => i.legacyWorkspaceId === id && i.mode === 'primary' && i.status === 'completed'),
      refresh,
      upload: async (bundle) => {
        const r = await api<ImportRecord>('POST', '/v1/imports/legacy-workspace', bundle);
        await refresh().catch(() => undefined);
        announceServerLinkChange();
        return { ...r, legacyWorkspaceId: bundle.legacyWorkspaceId, mode: 'primary' };
      },
      undo: async (importId) => {
        await api('POST', `/v1/imports/${importId}/undo`);
        await refresh().catch(() => undefined);
        announceServerLinkChange();
      },
      sealedCopy: (importId) => api('GET', `/v1/imports/${importId}/bundle`)
    }),
    [loaded, imports, refresh]
  );
  return <ImportsContext.Provider value={value}>{children}</ImportsContext.Provider>;
}

/** Linked-workspace state, or null when real sign-in is off. */
export function useImports(): ImportsValue | null {
  return useContext(ImportsContext);
}
