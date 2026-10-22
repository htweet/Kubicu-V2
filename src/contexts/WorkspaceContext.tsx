import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PageDocument } from '../types/page';
import type { WorkspacePlan } from '../types/plan';
import type { Workspace } from '../types/workspace';
import { DEMO_WORKSPACE_ID, writePersistedPage } from '../utils/workspaceStorage';
import { uid } from '../utils/id';

const LIST_KEY = 'kubicu.workspaces';
const CURRENT_KEY = 'kubicu.workspace.current';

export interface CreateWorkspaceInput {
  name: string;
  ownerName: string;
  doc: PageDocument;
  publish: boolean;
}

interface WorkspaceValue {
  workspaces: Workspace[];
  current: Workspace;
  switchTo: (id: string) => void;
  /** Creates the workspace and its page, then makes it current. Throws if storage fails. */
  create: (input: CreateWorkspaceInput) => Workspace;
  update: (id: string, patch: Partial<Pick<Workspace, 'name' | 'ownerName' | 'plan'>>) => void;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

function demoWorkspace(plan: WorkspacePlan): Workspace {
  return {
    id: DEMO_WORKSPACE_ID,
    name: 'Adaeze Atelier',
    ownerName: 'Adaeze',
    plan,
    pageId: 'page_adaeze',
    createdAt: '2026-10-14T09:00:00.000Z'
  };
}

function readList(plan: WorkspacePlan): Workspace[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LIST_KEY) ?? 'null') as Workspace[] | null;
    if (Array.isArray(parsed) && parsed.some((w) => w.id === DEMO_WORKSPACE_ID)) return parsed;
  } catch {

    // Fall through to the default list.
  }return [demoWorkspace(plan)];
}

export function workspaceInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'K';
  return (parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts[1][0]}`).toUpperCase();
}

/**
 * All workspaces this person can open. Each workspace has its own page, appearance,
 * plan and library. `planControl` (Controls panel) sets the current workspace's plan.
 */
export function WorkspaceProvider({ planControl, children }: {planControl: WorkspacePlan;children: React.ReactNode;}) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => readList(planControl));
  const [currentId, setCurrentId] = useState<string>(() => {
    try {
      return window.localStorage.getItem(CURRENT_KEY) ?? DEMO_WORKSPACE_ID;
    } catch {
      return DEMO_WORKSPACE_ID;
    }
  });
  const current = workspaces.find((w) => w.id === currentId) ?? workspaces[0];

  useEffect(() => {
    try {
      window.localStorage.setItem(LIST_KEY, JSON.stringify(workspaces));
      window.localStorage.setItem(CURRENT_KEY, current.id);
    } catch {

      // Storage unavailable — switching still works for this session.
    }}, [workspaces, current.id]);

  // Changing the plan in the Controls panel applies it to the workspace you're in.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setWorkspaces((list) => list.map((w) => w.id === currentId ? { ...w, plan: planControl } : w));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planControl]);

  const switchTo = useCallback((id: string) => setCurrentId(id), []);

  const create = useCallback((input: CreateWorkspaceInput) => {
    const id = uid('ws');
    const now = new Date().toISOString();
    const doc: PageDocument = { ...input.doc, id: `page_${id}`, updatedAt: now };
    writePersistedPage(id, {
      draft: doc,
      published: input.publish ? doc : null,
      publishedAt: input.publish ? now : null,
      versions: input.publish ?
      [{ id: uid('ver'), label: 'Version 1', note: 'First publish', createdAt: now, kind: 'published', doc }] :
      [],
      lastSavedAt: now,
      scheduled: null
    });
    const workspace: Workspace = {
      id,
      name: input.name.trim() || 'My workspace',
      ownerName: input.ownerName.trim().split(/\s+/)[0] || '',
      plan: 'free',
      pageId: doc.id,
      createdAt: now
    };
    setWorkspaces((list) => [...list, workspace]);
    setCurrentId(id);
    return workspace;
  }, []);

  const update = useCallback((id: string, patch: Partial<Pick<Workspace, 'name' | 'ownerName' | 'plan'>>) => {
    setWorkspaces((list) => list.map((w) => w.id === id ? { ...w, ...patch } : w));
  }, []);

  const value = useMemo(() => ({ workspaces, current, switchTo, create, update }), [workspaces, current, switchTo, create, update]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ctx;
}