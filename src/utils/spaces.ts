import type { WorkspacePlan } from '../types/plan';
import type { PersistedPage, Space, Workspace } from '../types/workspace';
import { readPersistedPage } from './workspaceStorage';

export const MAIN_SPACE_ID = 'main';

/** Extra spaces (campaigns + DealRooms) each plan includes. Example figures (D50). */
export const extraSpaceLimits: Record<WorkspacePlan, number> = {
  free: 0,
  creator: 3,
  pro: 15,
  business: 15,
  agency: 15,
  enterprise: 15
};

export function mainSpace(w: Workspace): Space {
  return { id: MAIN_SPACE_ID, kind: 'main', name: 'Main page', createdAt: w.createdAt, archivedAt: null };
}

/** The main space first, then campaigns and DealRooms in the order they were made. */
export function workspaceSpaces(w: Workspace): Space[] {
  return [mainSpace(w), ...(w.spaces ?? [])];
}

export function activeExtraSpaces(w: Workspace): Space[] {
  return (w.spaces ?? []).filter((s) => !s.archivedAt);
}

/**
 * Where a space's page is saved. The main space keeps the workspace's original key so
 * every existing page loads unchanged.
 */
export function spaceStorageId(workspaceId: string, spaceId: string): string {
  return spaceId === MAIN_SPACE_ID ? workspaceId : `${workspaceId}~${spaceId}`;
}

export function readSpacePage(workspaceId: string, spaceId: string): PersistedPage | null {
  return readPersistedPage(spaceStorageId(workspaceId, spaceId));
}

export type SpaceStatus = 'live' | 'changes' | 'scheduled' | 'draft' | 'ended';

export function spaceStatus(space: Space, page: Pick<PersistedPage, 'published' | 'scheduled'> | null, changed: boolean): SpaceStatus {
  if (space.archivedAt) return 'ended';
  if (page?.published) return changed ? 'changes' : 'live';
  if (page?.scheduled) return 'scheduled';
  return 'draft';
}

/** The space a page id belongs to, within one workspace. */
export function spaceForPageId(w: Workspace, pageId: string): Space | null {
  for (const s of workspaceSpaces(w)) {
    const draftId = readSpacePage(w.id, s.id)?.draft.id;
    if (draftId === pageId || s.id === MAIN_SPACE_ID && w.pageId === pageId) return s;
  }
  return null;
}

export function spacePageId(workspaceId: string, spaceId: string): string {
  return `page_${workspaceId}_${spaceId}`;
}