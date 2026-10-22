import type { PageDocument } from '../types/page';
import type { Workspace } from '../types/workspace';
import type { WorkspacePlan } from '../types/plan';
import { findExampleByHandle } from '../data/examples';
import { readPersistedPage } from './workspaceStorage';

export interface ResolvedPublicPage {
  doc: PageDocument;
  plan: WorkspacePlan;
  /** The workspace that owns the page (null for examples). */
  workspaceId: string | null;
  /** A fictional sample page rather than one a workspace published. */
  example?: {id: string;name: string;category: string;};
}

/** Finds who owns a public handle: another workspace on this device, or an example page. */
export function resolvePublicPage(handle: string, workspaces: Workspace[], skipWorkspaceId: string): ResolvedPublicPage | null {
  for (const w of workspaces) {
    if (w.id === skipWorkspaceId) continue;
    const page = readPersistedPage(w.id);
    if (page?.published?.handle === handle) return { doc: page.published, plan: w.plan, workspaceId: w.id };
  }
  const example = findExampleByHandle(handle);
  if (example) return { doc: example.doc, plan: example.plan, workspaceId: null, example: { id: example.id, name: example.name, category: example.category } };
  return null;
}