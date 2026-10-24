import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useEditorStore, type EditorStore } from '../hooks/useEditorStore';
import { useWorkspace } from './WorkspaceContext';
import { useCommerce } from './CommerceContext';
import { useOps } from './OpsContext';
import { usePlan } from './PlanContext';
import { takenHandles } from '../utils/handles';
import { catalogLinkIssues } from '../utils/commerce/linkIssues';
import { opsLinkIssues } from '../utils/ops/linkIssues';
import { formLinkIssues } from '../utils/forms/linkIssues';
import type { PageDocument } from '../types/page';
import type { ValidationIssue } from '../utils/validation';
import { allBlocks, pageCount, pageLimits } from '../utils/sitePages';
import { hasPlaceholder } from '../utils/ai/draft';
import { intentIssues } from '../utils/intentflow';
import { abIssues } from '../utils/abTest';
import { activeExtraSpaces, extraSpaceLimits, MAIN_SPACE_ID, spaceStorageId } from '../utils/spaces';
import { spaceKinds } from '../data/spaceKinds';
import { planAtLeast, planOrder, plans } from '../data/plans';
import { CHECKOUT_PLAN } from '../utils/commerce/linkIssues';
import { dealRoomIssues, roomOrders } from '../utils/dealRoom';
import { campaignIssues } from '../utils/campaign';
import type { WorkspacePlan } from '../types/plan';
import { memberIssues } from '../utils/memberIssues';
import { usePublicPassport } from '../hooks/usePublicPassport';
import { useLocalStore } from '../hooks/useLocalStore';
import { emptyPartnerships, partnershipKey } from '../utils/partnerships';
import { coBrandIssues } from '../utils/coBrand';
import { readPersistedPage } from '../utils/workspaceStorage';

function nextPlanAbove(plan: WorkspacePlan): WorkspacePlan | undefined {
  return planOrder[planOrder.indexOf(plan) + 1];
}

const EditorContext = createContext<EditorStore | null>(null);

/** The editor for the space open in this workspace. Remount (key by space id) when switching. */
export function EditorProvider({ children }: {children: React.ReactNode;}) {
  const { current, currentSpace, workspaces } = useWorkspace();
  const { data } = useCommerce();
  const ops = useOps().data;
  const plan = usePlan();
  const storageId = spaceStorageId(current.id, currentSpace.id);
  const isMain = currentSpace.id === MAIN_SPACE_ID;
  const spaceIndex = activeExtraSpaces(current).findIndex((s) => s.id === currentSpace.id);
  const taken = useMemo(() => takenHandles(workspaces, storageId), [workspaces, storageId]);
  // Trust Passport badge checks (D111) need the live level and whether the app is on.
  const { passport, appOn: trustAppOn } = usePublicPassport(current.id, data.orders);
  const trustLevel = passport.level;
  const partnerships = useLocalStore(partnershipKey(current.id), emptyPartnerships).data;
  const extra = useCallback(
    (doc: PageDocument) => [...catalogLinkIssues(doc, data, plan.id), ...opsLinkIssues(doc, ops, plan.id), ...formLinkIssues(doc, current.id)],
    [data, ops, plan.id, current.id]
  );
  const siteLevel = useCallback(
    (doc: PageDocument): ValidationIssue[] => {
      const out: ValidationIssue[] = [];
      const count = pageCount(doc);
      if (!isMain && count > 1) {
        out.push({ id: 'site:space-pages', blockId: null, severity: 'error', message: `A ${spaceKinds[currentSpace.kind].label.toLowerCase()} has one page. Move extra pages to your main page to publish.` });
      } else {
        const limit = pageLimits[plan.id];
        if (count > limit) out.push({ id: 'site:limit', blockId: null, severity: 'error', message: `Your ${plan.name} plan includes ${limit} page${limit === 1 ? '' : 's'}. This site has ${count}. Remove pages or upgrade to publish.`, upgradeTo: nextPlanAbove(plan.id), upgradeFeature: 'More pages on your site' });
      }
      // Spaces over the plan's allowance stay editable but can't go live (nothing is deleted).
      if (!isMain && spaceIndex >= extraSpaceLimits[plan.id]) {
        const limit = extraSpaceLimits[plan.id];
        out.push({
          id: 'site:space-limit',
          blockId: null,
          severity: 'error',
          message: limit === 0 ? `Your ${plan.name} plan includes your main page only. Upgrade to publish campaigns and DealRooms.` : `Your ${plan.name} plan includes ${limit} campaigns and DealRooms. Archive one or upgrade to publish this.`,
          upgradeTo: nextPlanAbove(plan.id),
          upgradeFeature: 'Publishing campaigns and DealRooms'
        });
      }
      // AI drafts mark gaps as "[Add …]" — they must be replaced with the owner's own words (D63).
      allBlocks(doc).forEach((b) => {
        if (!b.visibility.hidden && hasPlaceholder(b))
        out.push({ id: `ai:placeholder:${b.id}`, blockId: b.id, severity: 'error', message: 'Replace the [Add …] placeholder with your own words before publishing.' });
      });
      out.push(...intentIssues(doc));
      out.push(...abIssues(allBlocks(doc)));
      out.push(...memberIssues(doc, data, plan.id, { appOn: trustAppOn, level: trustLevel }));
      if (doc.campaign) out.push(...campaignIssues(doc.campaign, doc.blocks, data));
      // Co-branded spaces (D121): partnership must be live and the partner must approve.
      if (doc.coBrand) out.push(...coBrandIssues(doc, { hasLive: !!readPersistedPage(storageId)?.published, partnership: partnerships.partnerships.find((p) => p.id === doc.coBrand!.partnershipId), plan: plan.id }));
      if (doc.dealRoom) {
        out.push(...dealRoomIssues(doc.dealRoom, doc.blocks, data, roomOrders(data, doc.handle).length));
        // DealRooms take payment through checkout (D54).
        if (!planAtLeast(plan.id, CHECKOUT_PLAN))
        out.push({ id: 'room:plan', blockId: null, severity: 'error', message: `DealRooms take payment at checkout, which is on the ${plans[CHECKOUT_PLAN].name} plan.`, upgradeTo: CHECKOUT_PLAN, upgradeFeature: 'DealRooms with checkout' });
      }
      return out;
    },
    [plan.id, plan.name, isMain, spaceIndex, currentSpace.kind, data, trustAppOn, trustLevel, partnerships, storageId]
  );
  const store = useEditorStore(storageId, taken, extra, siteLevel);
  return <EditorContext.Provider value={store}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorStore {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');
  return ctx;
}