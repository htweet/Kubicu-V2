import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PageDocument } from '../types/page';
import type { WorkspacePlan } from '../types/plan';
import type { PersistedPage, Space, SpaceKind, Workspace } from '../types/workspace';
import { DEMO_WORKSPACE_ID, setDemoSeed, writePersistedPage } from '../utils/workspaceStorage';
import { MAIN_SPACE_ID, mainSpace, spaceStorageId, workspaceSpaces } from '../utils/spaces';
import { uid } from '../utils/id';
import type { CountryCode } from '../types/country';
import { countryInfo } from '../utils/country';
import { SAMPLE_SPACE_PREFIX, SAMPLE_SPACES_ROUND, seedSampleSpaces } from '../data/sampleSpaces';
import { demoExpiry, removeDemoDataFromStorage, wipeWorkspaceStorage, writeDemoWorkspaceNotice, writeRemovedNotice } from '../utils/demoData';

const LIST_KEY = 'kubicu.workspaces';
const CURRENT_KEY = 'kubicu.workspace.current';
const SPACE_KEY = 'kubicu.space.current';

export interface CreateWorkspaceInput {
  name: string;
  ownerName: string;
  doc: PageDocument;
  publish: boolean;
  /** Fill every module with labelled sample data, removed automatically after 7 days (D200). */
  demoData?: boolean;
  /** The Business WhatsApp number, if given during setup (D214). */
  whatsapp?: string;
  /** Where the business sells from, chosen at sign-up (D494). Sets the currency too. */
  country?: CountryCode;
}

export interface CreateSpaceInput {
  kind: Exclude<SpaceKind, 'main'>;
  name: string;
  /** Builds the first draft once the space id is known. */
  buildDoc: (ids: { spaceId: string; pageId: string }) => PageDocument;
}

interface WorkspaceValue {
  workspaces: Workspace[];
  current: Workspace;
  /** The space open in the canvas. Workspace screens always use the main space. */
  currentSpace: Space;
  /** Opens a workspace, optionally straight into one of its spaces. */
  switchTo: (id: string, spaceId?: string) => void;
  switchSpace: (spaceId: string) => void;
  /** Creates the workspace and its page, then makes it current. Throws if storage fails. */
  create: (input: CreateWorkspaceInput) => Workspace;
  /** Adds a campaign or DealRoom to the current workspace. Throws if storage fails. */
  createSpace: (input: CreateSpaceInput) => Space;
  setSpaceArchived: (spaceId: string, archived: boolean) => void;
  update: (id: string, patch: Partial<Pick<Workspace, 'name' | 'ownerName' | 'plan' | 'currency' | 'country' | 'whatsapp'>>) => void;
  /** Removes the current workspace's demo data everywhere, then reloads so every screen reads clean data (D200). */
  removeDemoData: (reason: 'manual' | 'expired') => void;
  /** Deletes the built-in Adaeze demo workspace and everything in it (D201). Needs another workspace to move to. */
  removeDemoWorkspace: () => void;
  /** Adds a fresh copy of the demo workspace back and opens it (D201). */
  restoreDemoWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

function demoWorkspace(plan: WorkspacePlan): Workspace {
  return {
    id: DEMO_WORKSPACE_ID,
    name: 'Adaeze Atelier',
    ownerName: 'Adaeze',
    plan,
    pageId: 'page_adaeze',
    whatsapp: '+234 803 123 4567',
    country: 'NG',
    spaces: seedSampleSpaces(),
    sampleSpacesSeeded: true,
    sampleSpaces2Seeded: true,
    sampleSpacesRound: SAMPLE_SPACES_ROUND,
    createdAt: '2026-10-14T09:00:00.000Z',
  };
}

function readList(plan: WorkspacePlan): Workspace[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LIST_KEY) ?? 'null') as Workspace[] | null;
    // A list without the demo workspace is kept as it is — the person removed it (D201).
    if (Array.isArray(parsed) && parsed.length > 0)
      // The demo workspace gets each round of sample spaces once (they can be archived like any space).
      return parsed.map((w) =>
        w.id === DEMO_WORKSPACE_ID && (!w.sampleSpacesSeeded || !w.sampleSpaces2Seeded || (w.sampleSpacesRound ?? 2) < SAMPLE_SPACES_ROUND)
          ? { ...w, spaces: [...(w.spaces ?? []), ...seedSampleSpaces().filter((s) => !(w.spaces ?? []).some((x) => x.id === s.id))], sampleSpacesSeeded: true, sampleSpaces2Seeded: true, sampleSpacesRound: SAMPLE_SPACES_ROUND }
          : w,
      );
  } catch {
    // Fall through to the default list.
  }
  return [demoWorkspace(plan)];
}

function readSpaceMap(): Record<string, string> {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SPACE_KEY) ?? '{}') as Record<string, string>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function firstPersisted(doc: PageDocument, publish: boolean, now: string): PersistedPage {
  return {
    draft: doc,
    published: publish ? doc : null,
    publishedAt: publish ? now : null,
    versions: publish ? [{ id: uid('ver'), label: 'Version 1', note: 'First publish', createdAt: now, kind: 'published', doc }] : [],
    lastSavedAt: now,
    scheduled: null,
  };
}

export function workspaceInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'K';
  return (parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts[1][0]}`).toUpperCase();
}

/**
 * All workspaces this person can open. Each workspace has a main space plus optional
 * campaigns and DealRooms (D50), sharing one set of products, orders and contacts.
 * `planControl` (Controls panel) sets the current workspace's plan.
 */
export function WorkspaceProvider({ planControl, children }: { planControl: WorkspacePlan; children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => readList(planControl));
  const [currentId, setCurrentId] = useState<string>(() => {
    try {
      return window.localStorage.getItem(CURRENT_KEY) ?? DEMO_WORKSPACE_ID;
    } catch {
      return DEMO_WORKSPACE_ID;
    }
  });
  const [spaceMap, setSpaceMap] = useState<Record<string, string>>(readSpaceMap);
  const current = workspaces.find((w) => w.id === currentId) ?? workspaces[0];
  const currentSpace = workspaceSpaces(current).find((s) => s.id === spaceMap[current.id] && !s.archivedAt) ?? mainSpace(current);

  useEffect(() => {
    try {
      window.localStorage.setItem(LIST_KEY, JSON.stringify(workspaces));
      window.localStorage.setItem(CURRENT_KEY, current.id);
      window.localStorage.setItem(SPACE_KEY, JSON.stringify(spaceMap));
    } catch {
      // Storage unavailable — switching still works for this session.
    }
  }, [workspaces, current.id, spaceMap]);

  // Changing the plan in the Controls panel applies it to the workspace you're in.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setWorkspaces((list) => list.map((w) => (w.id === currentId ? { ...w, plan: planControl } : w)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planControl]);

  const switchTo = useCallback((id: string, spaceId?: string) => {
    setCurrentId(id);
    setSpaceMap((m) => ({ ...m, [id]: spaceId ?? MAIN_SPACE_ID }));
  }, []);

  const switchSpace = useCallback(
    (spaceId: string) => setSpaceMap((m) => (m[current.id] === spaceId ? m : { ...m, [current.id]: spaceId })),
    [current.id],
  );

  const create = useCallback((input: CreateWorkspaceInput) => {
    const id = uid('ws');
    const now = new Date().toISOString();
    const doc: PageDocument = { ...input.doc, id: `page_${id}`, updatedAt: now };
    writePersistedPage(id, firstPersisted(doc, input.publish, now));
    // Marked before the switch, so each module seeds its sample records when it first opens here.
    if (input.demoData) setDemoSeed(id, true);
    const workspace: Workspace = {
      id,
      name: input.name.trim() || 'My workspace',
      ownerName: input.ownerName.trim().split(/\s+/)[0] || '',
      plan: 'free',
      pageId: doc.id,
      createdAt: now,
      ...(input.whatsapp?.trim() ? { whatsapp: input.whatsapp.trim() } : {}),
      ...(input.country ? { country: input.country, currency: countryInfo(input.country).currency } : {}),
      ...(input.demoData ? { demoData: demoExpiry(), spaces: seedSampleSpaces(id) } : {}),
    };
    setWorkspaces((list) => [...list, workspace]);
    setCurrentId(id);
    setSpaceMap((m) => ({ ...m, [id]: MAIN_SPACE_ID }));
    return workspace;
  }, []);

  const createSpace = useCallback(
    (input: CreateSpaceInput) => {
      const spaceId = uid('sp');
      const now = new Date().toISOString();
      const doc = input.buildDoc({ spaceId, pageId: `page_${current.id}_${spaceId}` });
      writePersistedPage(spaceStorageId(current.id, spaceId), firstPersisted(doc, false, now));
      const space: Space = { id: spaceId, kind: input.kind, name: input.name.trim() || 'Untitled space', createdAt: now, archivedAt: null };
      setWorkspaces((list) => list.map((w) => (w.id === current.id ? { ...w, spaces: [...(w.spaces ?? []), space] } : w)));
      return space;
    },
    [current.id],
  );

  const setSpaceArchived = useCallback(
    (spaceId: string, archived: boolean) => {
      if (spaceId === MAIN_SPACE_ID) return;
      setWorkspaces((list) =>
        list.map((w) => (w.id === current.id ? { ...w, spaces: (w.spaces ?? []).map((s) => (s.id === spaceId ? { ...s, archivedAt: archived ? new Date().toISOString() : null } : s)) } : w)),
      );
      if (archived) setSpaceMap((m) => (m[current.id] === spaceId ? { ...m, [current.id]: MAIN_SPACE_ID } : m));
    },
    [current.id],
  );

  const update = useCallback((id: string, patch: Partial<Pick<Workspace, 'name' | 'ownerName' | 'plan' | 'currency' | 'country' | 'whatsapp'>>) => {
    setWorkspaces((list) => list.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }, []);

  const removeDemoData = useCallback(
    (reason: 'manual' | 'expired') => {
      const ws = current;
      if (!ws.demoData) return;
      removeDemoDataFromStorage(ws.id, (ws.spaces ?? []).map((s) => s.id));
      const next = workspaces.map((w) => (w.id === ws.id ? { ...w, demoData: null, spaces: (w.spaces ?? []).filter((s) => !s.id.startsWith(SAMPLE_SPACE_PREFIX)) } : w));
      try {
        window.localStorage.setItem(LIST_KEY, JSON.stringify(next));
        window.localStorage.setItem(SPACE_KEY, JSON.stringify({ ...spaceMap, [ws.id]: MAIN_SPACE_ID }));
      } catch {
        // Storage unavailable — the in-memory list still drops the sample spaces.
      }
      setWorkspaces(next);
      writeRemovedNotice(reason, ws.name);
      // Every module keeps its data in memory; a reload makes them all read the cleaned copies.
      window.location.reload();
    },
    [current, workspaces, spaceMap],
  );

  const removeDemoWorkspace = useCallback(() => {
    const rest = workspaces.filter((w) => w.id !== DEMO_WORKSPACE_ID);
    if (rest.length === 0 || rest.length === workspaces.length) return;
    wipeWorkspaceStorage(DEMO_WORKSPACE_ID);
    const nextMap = { ...spaceMap };
    delete nextMap[DEMO_WORKSPACE_ID];
    try {
      window.localStorage.setItem(LIST_KEY, JSON.stringify(rest));
      window.localStorage.setItem(CURRENT_KEY, current.id === DEMO_WORKSPACE_ID ? rest[0].id : current.id);
      window.localStorage.setItem(SPACE_KEY, JSON.stringify(nextMap));
    } catch {
      // Storage unavailable — the in-memory list still drops it.
    }
    setWorkspaces(rest);
    writeDemoWorkspaceNotice('removed');
    window.location.assign('/app');
  }, [workspaces, spaceMap, current.id]);

  const restoreDemoWorkspace = useCallback(() => {
    if (workspaces.some((w) => w.id === DEMO_WORKSPACE_ID)) {
      switchTo(DEMO_WORKSPACE_ID);
      return;
    }
    // Anything left behind from before is cleared, so it starts exactly like a first visit.
    wipeWorkspaceStorage(DEMO_WORKSPACE_ID);
    const next = [demoWorkspace(planControl), ...workspaces];
    try {
      window.localStorage.setItem(LIST_KEY, JSON.stringify(next));
      window.localStorage.setItem(CURRENT_KEY, DEMO_WORKSPACE_ID);
      window.localStorage.setItem(SPACE_KEY, JSON.stringify({ ...spaceMap, [DEMO_WORKSPACE_ID]: MAIN_SPACE_ID }));
    } catch {
      // Storage unavailable.
    }
    setWorkspaces(next);
    writeDemoWorkspaceNotice('restored');
    window.location.assign('/app');
  }, [workspaces, spaceMap, planControl, switchTo]);

  const value = useMemo(
    () => ({ workspaces, current, currentSpace, switchTo, switchSpace, create, createSpace, setSpaceArchived, update, removeDemoData, removeDemoWorkspace, restoreDemoWorkspace }),
    [workspaces, current, currentSpace, switchTo, switchSpace, create, createSpace, setSpaceArchived, update, removeDemoData, removeDemoWorkspace, restoreDemoWorkspace],
  );
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ctx;
}
