import type { Workspace } from '../types/workspace';
import { examplePages } from '../data/examples';
import { readPersistedPage } from './workspaceStorage';

/** Addresses KUBICU itself uses, so nobody can claim them. */
export const RESERVED_HANDLES = [
'app', 'admin', 'api', 'about', 'help', 'kubicu', 'p', 'pricing', 'signin', 'signup', 'start', 'templates', 'www', 'reset', 'verify'];


export const HANDLE_PATTERN = /^[a-z0-9-]{3,30}$/;

export function slugifyHandle(value: string): string {
  return value.
  toLowerCase().
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/&/g, 'and').
  replace(/[^a-z0-9]+/g, '').
  slice(0, 30);
}

/** Every handle in use, optionally ignoring one workspace (the one being edited). */
export function takenHandles(workspaces: Workspace[], exceptWorkspaceId?: string): Set<string> {
  const taken = new Set<string>([...RESERVED_HANDLES, ...examplePages.map((e) => e.doc.handle)]);
  workspaces.forEach((w) => {
    if (w.id === exceptWorkspaceId) return;
    const page = readPersistedPage(w.id);
    if (page?.draft.handle) taken.add(page.draft.handle);
    if (page?.published?.handle) taken.add(page.published.handle);
  });
  // The demo page's handle belongs to the demo workspace even before it's saved.
  if (exceptWorkspaceId !== 'ws_adaeze') taken.add('adaeze');
  return taken;
}

export type HandleStatus = 'empty' | 'invalid' | 'reserved' | 'taken' | 'available';

export function handleStatus(handle: string, taken: ReadonlySet<string>): HandleStatus {
  if (!handle) return 'empty';
  if (!HANDLE_PATTERN.test(handle)) return 'invalid';
  if (RESERVED_HANDLES.includes(handle)) return 'reserved';
  if (taken.has(handle)) return 'taken';
  return 'available';
}

export function suggestHandles(base: string, taken: ReadonlySet<string>, city?: string): string[] {
  const root = slugifyHandle(base) || 'mypage';
  const candidates = [
  root,
  `${root}ng`,
  city ? `${root}${slugifyHandle(city)}` : `${root}hq`,
  `the${root}`,
  `${root}-official`,
  `${root}2`];

  return Array.from(new Set(candidates.map((c) => c.slice(0, 30)))).
  filter((c) => handleStatus(c, taken) === 'available').
  slice(0, 3);
}