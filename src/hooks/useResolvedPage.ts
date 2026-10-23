import { useMemo } from 'react';
import type { PageDocument } from '../types/page';
import type { PlanInfo } from '../data/plans';
import { plans } from '../data/plans';
import { useEditor } from '../contexts/EditorContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { usePlan } from '../contexts/PlanContext';
import { resolvePublicPage } from '../utils/resolvePublicPage';
import { allBlocks } from '../utils/sitePages';
import { spaceStorageId } from '../utils/spaces';
import { liveReadableTheme } from '../utils/contrastFixes';

export interface ResolvedPage {
  doc: PageDocument;
  plan: PlanInfo;
  workspaceId: string | null;
  /**
   * The page belongs to the workspace open in this browser, so commerce, bookings and
   * contacts come from the live workspace data (shared by all its spaces).
   */
  isOwn: boolean;
  example?: {id: string;name: string;category: string;};
  /** Archived space: forward to this handle. */
  redirectTo?: string;
}

/** Who a public handle belongs to, and which version to show. */
export function useResolvedPage(handle: string, isDraft = false): ResolvedPage | null {
  const { state } = useEditor();
  const { workspaces, current, currentSpace } = useWorkspace();
  const workspacePlan = usePlan();
  const storageId = spaceStorageId(current.id, currentSpace.id);

  return useMemo(() => {
    const own = isDraft ? state.site : state.published;
    if (own && own.handle === handle && !currentSpace.archivedAt) return { doc: readable(own), plan: workspacePlan, workspaceId: current.id, isOwn: true };
    if (isDraft) return null;
    const other = resolvePublicPage(handle, workspaces, storageId);
    if (!other) return null;
    const sameWorkspace = other.workspaceId === current.id;
    return { doc: readable(other.doc), plan: sameWorkspace ? workspacePlan : plans[other.plan], workspaceId: other.workspaceId, isOwn: sameWorkspace, example: other.example, redirectTo: other.redirectTo };
  }, [isDraft, state.site, state.published, handle, workspacePlan, workspaces, current.id, currentSpace.archivedAt, storageId]);
}

/** Visitors always get readable colours, whatever the saved theme (D76). */
function readable(doc: PageDocument): PageDocument {
  const theme = liveReadableTheme(doc.theme);
  return theme === doc.theme ? doc : { ...doc, theme };
}

/** The seller's WhatsApp number from any page of the site, for “message the seller” links. */
export function sellerPhone(doc: PageDocument): string {
  for (const b of allBlocks(doc)) {
    if (b.type === 'whatsapp' && b.content.phone) return b.content.phone;
    if (b.type === 'product' && b.content.whatsappPhone) return b.content.whatsappPhone;
    if (b.type === 'contact' && b.content.phone) return b.content.phone;
  }
  return '';
}