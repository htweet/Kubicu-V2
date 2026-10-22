import type { PersistedPage } from '../types/workspace';

export const DEMO_WORKSPACE_ID = 'ws_adaeze';

/** The demo workspace keeps its original key so existing drafts survive. */
export function editorStorageKey(workspaceId: string): string {
  return workspaceId === DEMO_WORKSPACE_ID ? 'kubicu.editor.v1' : `kubicu.editor.v1.${workspaceId}`;
}

export function parsePersistedPage(raw: string | null): PersistedPage | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedPage;
    if (!parsed.draft || !Array.isArray(parsed.draft.blocks)) return null;
    return { ...parsed, versions: parsed.versions ?? [], scheduled: parsed.scheduled ?? null };
  } catch {
    return null;
  }
}

export function readPersistedPage(workspaceId: string): PersistedPage | null {
  try {
    return parsePersistedPage(window.localStorage.getItem(editorStorageKey(workspaceId)));
  } catch {
    return null;
  }
}

/** Throws if storage is full or blocked, so callers can show a failure state. */
export function writePersistedPage(workspaceId: string, page: PersistedPage): void {
  window.localStorage.setItem(editorStorageKey(workspaceId), JSON.stringify(page));
}