import type { PersistedPage } from '../types/workspace';

export const DEMO_WORKSPACE_ID = 'ws_adaeze';

/**
 * Workspaces created with "Start with demo data" (D200). Written synchronously at creation so every
 * module seeds its labelled sample records the first time it opens for that workspace.
 */
const DEMO_SEED_KEY = 'kubicu.demoSeed';

function readDemoSeeds(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DEMO_SEED_KEY) ?? '[]') as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function setDemoSeed(workspaceId: string, on: boolean): void {
  const list = readDemoSeeds().filter((id) => id !== workspaceId);
  try {
    window.localStorage.setItem(DEMO_SEED_KEY, JSON.stringify(on ? [...list, workspaceId] : list));
  } catch {

    // Storage unavailable — modules simply start empty.
  }}

/** True when this workspace should get labelled sample data in every module: the built-in demo, or one created with demo data. */
export function seedsSample(workspaceId: string): boolean {
  return workspaceId === DEMO_WORKSPACE_ID || readDemoSeeds().includes(workspaceId);
}

/** Public addresses must be unique, so a demo-data workspace's sample spaces get a short suffix. */
export function sampleHandle(base: string, workspaceId: string): string {
  if (workspaceId === DEMO_WORKSPACE_ID) return base;
  const tail = workspaceId.toLowerCase().replace(/[^a-z0-9]/g, '').slice(-4) || 'demo';
  return `${base}-${tail}`;
}

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