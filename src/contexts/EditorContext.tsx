import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useEditorStore, type EditorStore } from '../hooks/useEditorStore';
import { useWorkspace } from './WorkspaceContext';
import { useCommerce } from './CommerceContext';
import { useOps } from './OpsContext';
import { usePlan } from './PlanContext';
import { takenHandles } from '../utils/handles';
import { catalogLinkIssues } from '../utils/commerce/linkIssues';
import { opsLinkIssues } from '../utils/ops/linkIssues';
import type { PageDocument } from '../types/page';
import type { ValidationIssue } from '../utils/validation';
import { pageCount, pageLimits } from '../utils/sitePages';

const EditorContext = createContext<EditorStore | null>(null);

/** The current workspace's page editor. Remount (key by workspace id) when switching. */
export function EditorProvider({ children }: {children: React.ReactNode;}) {
  const { current, workspaces } = useWorkspace();
  const { data } = useCommerce();
  const ops = useOps().data;
  const plan = usePlan();
  const taken = useMemo(() => takenHandles(workspaces, current.id), [workspaces, current.id]);
  const extra = useCallback((doc: PageDocument) => [...catalogLinkIssues(doc, data, plan.id), ...opsLinkIssues(doc, ops, plan.id)], [data, ops, plan.id]);
  const siteLevel = useCallback((doc: PageDocument): ValidationIssue[] => {
    const limit = pageLimits[plan.id];
    const count = pageCount(doc);
    return count > limit ?
    [{ id: 'site:limit', blockId: null, severity: 'error', message: `Your ${plan.name} plan includes ${limit} page${limit === 1 ? '' : 's'}. This site has ${count}. Remove pages or upgrade to publish.` }] :
    [];
  }, [plan.id, plan.name]);
  const store = useEditorStore(current.id, taken, extra, siteLevel);
  return <EditorContext.Provider value={store}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorStore {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');
  return ctx;
}