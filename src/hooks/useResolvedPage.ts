import { useMemo } from 'react';
import type { PageDocument } from '../types/page';
import type { PlanInfo } from '../data/plans';
import { plans } from '../data/plans';
import { useEditor } from '../contexts/EditorContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { usePlan } from '../contexts/PlanContext';
import { resolvePublicPage } from '../utils/resolvePublicPage';
import { allBlocks } from '../utils/sitePages';

export interface ResolvedPage {
  doc: PageDocument;
  plan: PlanInfo;
  workspaceId: string | null;
  /** The page belongs to the workspace open in this browser. */
  isOwn: boolean;
  example?: {id: string;name: string;category: string;};
}

/** Who a public handle belongs to, and which version to show. */
export function useResolvedPage(handle: string, isDraft = false): ResolvedPage | null {
  const { state } = useEditor();
  const { workspaces, current } = useWorkspace();
  const workspacePlan = usePlan();

  return useMemo(() => {
    const own = isDraft ? state.site : state.published;
    if (own && own.handle === handle) return { doc: own, plan: workspacePlan, workspaceId: current.id, isOwn: true };
    if (isDraft) return null;
    const other = resolvePublicPage(handle, workspaces, current.id);
    return other ? { doc: other.doc, plan: plans[other.plan], workspaceId: other.workspaceId, isOwn: false, example: other.example } : null;
  }, [isDraft, state.site, state.published, handle, workspacePlan, workspaces, current.id]);
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