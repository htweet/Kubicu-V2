import type { PageDocument } from '../types/page';
import type { Workspace } from '../types/workspace';
import type { WorkspacePlan } from '../types/plan';
import { findExampleByHandle } from '../data/examples';
import { samplePage } from '../data/samplePage';
import { DEMO_WORKSPACE_ID } from './workspaceStorage';
import { MAIN_SPACE_ID, readSpacePage, spaceStorageId, workspaceSpaces } from './spaces';

export interface ResolvedPublicPage {
  doc: PageDocument;
  plan: WorkspacePlan;
  /** The workspace that owns the page (null for examples). */
  workspaceId: string | null;
  /** A fictional sample page rather than one a workspace published. */
  example?: {id: string;name: string;category: string;};
  /** An archived space's link: forward visitors to this handle (the main page). */
  redirectTo?: string;
}

/** The demo page counts as published before its first save. */
function readPage(workspaceId: string, spaceId: string): {published: PageDocument | null;} | null {
  const page = readSpacePage(workspaceId, spaceId);
  if (page) return page;
  return workspaceId === DEMO_WORKSPACE_ID && spaceId === MAIN_SPACE_ID ? { published: samplePage } : null;
}

/**
 * Finds who owns a public handle: any space of any workspace on this device, or an
 * example page. `skipStorageId` is the space open in the editor (handled separately).
 */
export function resolvePublicPage(handle: string, workspaces: Workspace[], skipStorageId: string): ResolvedPublicPage | null {
  for (const w of workspaces) {
    for (const s of workspaceSpaces(w)) {
      if (spaceStorageId(w.id, s.id) === skipStorageId) continue;
      const page = readPage(w.id, s.id);
      if (page?.published?.handle !== handle) continue;
      if (s.archivedAt) {
        const main = readPage(w.id, MAIN_SPACE_ID);
        if (main?.published) return { doc: main.published, plan: w.plan, workspaceId: w.id, redirectTo: main.published.handle };
        return null;
      }
      return { doc: page.published, plan: w.plan, workspaceId: w.id };
    }
  }
  const example = findExampleByHandle(handle);
  if (example) return { doc: example.doc, plan: example.plan, workspaceId: null, example: { id: example.id, name: example.name, category: example.category } };
  return null;
}