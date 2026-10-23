import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type {
  Block,
  BlockGroup,
  BlockContentMap,
  PageBranding,
  BlockMeta,
  BlockType,
  PageDocument,
  PageSeo,
  PageTheme,
  PageVersion,
  SaveStatus,
  ScheduledPublish } from
'../types/page';
import { samplePage, samplePublishedAt } from '../data/samplePage';
import { cloneBlock, cloneDocument, createBlock, docSignature } from '../utils/blocks';
import type { ValidationIssue } from '../utils/validation';
import type { SitePage } from '../types/page';
import { findPage, homeLabel, pageView, siteIssues, sitePages, uniquePath, writeView } from '../utils/sitePages';
import { uid } from '../utils/id';
import { groupRange, nextGroupName, normalizeGroups } from '../utils/groups';
import { DEMO_WORKSPACE_ID, editorStorageKey, parsePersistedPage, readPersistedPage } from '../utils/workspaceStorage';
import { pageThemePresets } from '../data/pageThemes';
import type { PersistedPage } from '../types/workspace';
import * as groups from '../utils/groupOps';

const HISTORY_LIMIT = 100;
const VERSION_LIMIT = 30;
const COALESCE_MS = 900;
const AUTOSAVE_DELAY = 650;

type PersistedState = PersistedPage;

export interface EditorState extends PersistedState {
  /** Newer copy saved from another tab, held while the owner decides. */
  remote: PersistedState | null;
  past: PageDocument[];
  future: PageDocument[];
  selectedId: string | null;
  saveStatus: SaveStatus;
  lastKey: string | null;
  lastAt: number;
  /** Page of the site being edited (null = home). Not saved. */
  activePageId: string | null;
}

type Action =
{type: 'mutate';fn: (doc: PageDocument) => PageDocument;coalesceKey?: string;at: number;select?: string | null;scope?: 'page' | 'site';} |
{type: 'select';id: string | null;} |
{type: 'setPage';id: string | null;} |
{type: 'undo';} |
{type: 'redo';} |
{type: 'publish';at: string;version: PageVersion;doc: PageDocument;} |
{type: 'unpublish';} |
{type: 'schedule';scheduled: ScheduledPublish | null;} |
{type: 'conflict';remote: PersistedState;} |
{type: 'snapshot';version: PageVersion;} |
{type: 'restoreVersion';id: string;at: number;} |
{type: 'saveStatus';status: SaveStatus;at?: string;} |
{type: 'reset';persisted: PersistedState;};

type MetaPatch = { [P in keyof BlockMeta]?: Partial<BlockMeta[P]> };

function blankPersisted(workspaceId: string): PersistedState {
  const now = new Date().toISOString();
  return {
    draft: {
      id: `page_${workspaceId}`,
      schemaVersion: 1,
      handle: workspaceId.replace(/[^a-z0-9]/g, '').slice(0, 20) || 'mypage',
      title: 'My page',
      theme: { ...pageThemePresets[0].theme },
      seo: { title: '', description: '' },
      blocks: [createBlock('profile')],
      updatedAt: now
    },
    published: null,
    publishedAt: null,
    versions: [],
    lastSavedAt: null,
    scheduled: null
  };
}

function initialPersisted(workspaceId: string): PersistedState {
  if (workspaceId !== DEMO_WORKSPACE_ID) return blankPersisted(workspaceId);
  return {
    draft: samplePage,
    published: samplePage,
    publishedAt: samplePublishedAt,
    versions: [
    {
      id: 'ver_initial',
      label: 'Version 1',
      note: 'First publish',
      createdAt: samplePublishedAt,
      kind: 'published',
      doc: samplePage
    }],

    lastSavedAt: samplePublishedAt,
    scheduled: null
  };
}

function loadPersisted(workspaceId: string): PersistedState {
  return readPersistedPage(workspaceId) ?? initialPersisted(workspaceId);
}

function toPersisted(s: PersistedState): PersistedState {
  return {
    draft: s.draft,
    published: s.published,
    publishedAt: s.publishedAt,
    versions: s.versions.slice(0, VERSION_LIMIT),
    lastSavedAt: s.lastSavedAt,
    scheduled: s.scheduled
  };
}

function fitPage(doc: PageDocument, id: string | null): string | null {
  return findPage(doc, id) ? id : null;
}

function keepSelection(doc: PageDocument, pageId: string | null, id: string | null): string | null {
  return id && pageView(doc, pageId).blocks.some((b) => b.id === id) ? id : null;
}

function viewOf(s: Pick<EditorState, 'draft' | 'activePageId'>): PageDocument {
  return pageView(s.draft, s.activePageId);
}

function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case 'mutate':{
        const pid = state.activePageId;
        let next: PageDocument;
        if (action.scope === 'site') {
          const raw = action.fn(state.draft);
          if (raw === state.draft) return state;
          next = normalizeGroups(raw);
        } else {
          // Block edits apply to the page being edited; everything else is shared.
          const view = viewOf(state);
          const raw = action.fn(view);
          if (raw === view) return state;
          next = writeView(state.draft, pid, normalizeGroups(raw));
        }
        const coalesce =
        !!action.coalesceKey && action.coalesceKey === state.lastKey && action.at - state.lastAt < COALESCE_MS;
        const draft = { ...next, updatedAt: new Date(action.at).toISOString() };
        const selected = action.select !== undefined ? action.select : state.selectedId;
        const activePageId = fitPage(draft, pid);
        return {
          ...state,
          draft,
          activePageId,
          past: coalesce ? state.past : [...state.past, state.draft].slice(-HISTORY_LIMIT),
          future: [],
          lastKey: action.coalesceKey ?? null,
          lastAt: action.at,
          selectedId: keepSelection(draft, activePageId, selected)
        };
      }
    case 'select':
      return { ...state, selectedId: action.id };
    case 'setPage':{
        const id = fitPage(state.draft, action.id);
        return id === state.activePageId ? state : { ...state, activePageId: id, selectedId: null, lastKey: null };
      }
    case 'undo':{
        if (state.past.length === 0) return state;
        const prev = state.past[state.past.length - 1];
        const activePageId = fitPage(prev, state.activePageId);
        return {
          ...state,
          draft: prev,
          activePageId,
          past: state.past.slice(0, -1),
          future: [state.draft, ...state.future],
          lastKey: null,
          selectedId: keepSelection(prev, activePageId, state.selectedId)
        };
      }
    case 'redo':{
        if (state.future.length === 0) return state;
        const [next, ...rest] = state.future;
        const activePageId = fitPage(next, state.activePageId);
        return {
          ...state,
          draft: next,
          activePageId,
          past: [...state.past, state.draft],
          future: rest,
          lastKey: null,
          selectedId: keepSelection(next, activePageId, state.selectedId)
        };
      }
    case 'publish':
      return {
        ...state,
        published: action.doc,
        publishedAt: action.at,
        versions: [action.version, ...state.versions].slice(0, VERSION_LIMIT)
      };
    case 'unpublish':
      return { ...state, published: null, publishedAt: null, scheduled: null };
    case 'schedule':
      return { ...state, scheduled: action.scheduled };
    case 'conflict':
      return { ...state, remote: action.remote, saveStatus: 'conflict' };
    case 'snapshot':
      return { ...state, versions: [action.version, ...state.versions].slice(0, VERSION_LIMIT) };
    case 'restoreVersion':{
        const version = state.versions.find((v) => v.id === action.id);
        if (!version) return state;
        const draft = { ...version.doc, updatedAt: new Date(action.at).toISOString() };
        return {
          ...state,
          draft,
          activePageId: fitPage(draft, state.activePageId),
          past: [...state.past, state.draft].slice(-HISTORY_LIMIT),
          future: [],
          lastKey: null,
          selectedId: null
        };
      }
    case 'saveStatus':
      return { ...state, saveStatus: action.status, lastSavedAt: action.at ?? state.lastSavedAt };
    case 'reset':
      return {
        ...action.persisted,
        remote: null,
        past: [],
        future: [],
        selectedId: null,
        saveStatus: 'saved',
        lastKey: null,
        lastAt: 0,
        activePageId: fitPage(action.persisted.draft, state.activePageId)
      };
    default:
      return state;
  }
}

export function useEditorStore(
workspaceId: string = DEMO_WORKSPACE_ID,
takenHandles?: ReadonlySet<string>,
/** Extra checks (e.g. catalogue links) merged into the pre-publish issues. */
extraIssues?: (doc: PageDocument) => ValidationIssue[],
/** Site-wide checks (e.g. page limit for the plan). */
siteLevelIssues?: (doc: PageDocument) => ValidationIssue[])
{
  const storageKey = editorStorageKey(workspaceId);
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    ...loadPersisted(workspaceId),
    remote: null,
    past: [],
    future: [],
    selectedId: null,
    saveStatus: 'saved' as SaveStatus,
    lastKey: null,
    lastAt: 0,
    activePageId: null
  }));

  const stateRef = useRef(state);
  stateRef.current = state;
  const isFirstRun = useRef(true);

  const persist = useCallback(
    (s: PersistedState) => {
      window.localStorage.setItem(storageKey, JSON.stringify(toPersisted(s)));
    },
    [storageKey]
  );

  const save = useCallback((force = false) => {
    const s = stateRef.current;
    // Never silently overwrite a newer copy from another tab.
    if (s.saveStatus === 'conflict' && !force) return;
    if (!navigator.onLine) {
      dispatch({ type: 'saveStatus', status: 'offline' });
      return;
    }
    try {
      const at = new Date().toISOString();
      persist({ ...s, lastSavedAt: at });
      dispatch({ type: 'saveStatus', status: 'saved', at });
    } catch {
      dispatch({ type: 'saveStatus', status: 'error' });
    }
  }, [persist]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (stateRef.current.saveStatus === 'conflict') return;
    dispatch({ type: 'saveStatus', status: 'saving' });
    const timer = window.setTimeout(() => save(), AUTOSAVE_DELAY);
    return () => window.clearTimeout(timer);
  }, [state.draft, state.published, state.versions, state.scheduled, save]);

  // Another tab saved this page: hold its copy and let the owner choose.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return;
      const remote = parsePersistedPage(e.newValue);
      if (!remote) return;
      const mine = stateRef.current;
      if (docSignature(remote.draft) === docSignature(mine.draft) && remote.publishedAt === mine.publishedAt) return;
      dispatch({ type: 'conflict', remote });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  // Scheduled publish: goes live once its time arrives (checked while the app is open and on load).
  useEffect(() => {
    const runIfDue = () => {
      const s = stateRef.current;
      if (!s.scheduled || Date.parse(s.scheduled.at) > Date.now()) return;
      const { scheduled } = s;
      const count = s.versions.filter((v) => v.kind === 'published').length + 1;
      dispatch({
        type: 'publish',
        at: scheduled.at,
        doc: scheduled.doc,
        version: {
          id: uid('ver'),
          label: `Version ${count}`,
          note: scheduled.note ? `${scheduled.note} (scheduled)` : 'Scheduled publish',
          createdAt: scheduled.at,
          kind: 'published',
          doc: scheduled.doc
        }
      });
      dispatch({ type: 'schedule', scheduled: null });
    };
    runIfDue();
    const timer = window.setInterval(runIfDue, 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const goOffline = () => dispatch({ type: 'saveStatus', status: 'offline' });
    const goOnline = () => save();
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, [save]);

  const actions = useMemo(() => {
    const mutate = (fn: (doc: PageDocument) => PageDocument, coalesceKey?: string, select?: string | null) =>
    dispatch({ type: 'mutate', fn, coalesceKey, at: Date.now(), select });
    const mutateSite = (fn: (doc: PageDocument) => PageDocument, coalesceKey?: string, select?: string | null) =>
    dispatch({ type: 'mutate', fn, coalesceKey, at: Date.now(), select, scope: 'site' });
    const updateSitePage = (id: string, fn: (p: SitePage) => SitePage, coalesceKey?: string) =>
    mutateSite((doc) => ({ ...doc, pages: sitePages(doc).map((p) => p.id === id ? fn(p) : p) }), coalesceKey);

    const updateBlock = (id: string, fn: (block: Block) => Block, coalesceKey?: string) =>
    mutate(
      (doc) => ({
        ...doc,
        blocks: doc.blocks.map((b) => b.id === id ? { ...fn(b), updatedAt: new Date().toISOString() } : b)
      }),
      coalesceKey
    );

    return {
      select: (id: string | null) => dispatch({ type: 'select', id }),

      addBlock: (type: BlockType, index?: number) => {
        const block = createBlock(type);
        const { selectedId } = stateRef.current;
        const draft = viewOf(stateRef.current);
        const selectedIndex = draft.blocks.findIndex((b) => b.id === selectedId);
        const at = index ?? (selectedIndex >= 0 ? selectedIndex + 1 : draft.blocks.length);
        mutate(
          (doc) => {
            const blocks = [...doc.blocks];
            blocks.splice(Math.min(at, blocks.length), 0, block);
            return { ...doc, blocks };
          },
          undefined,
          block.id
        );
        return block.id;
      },

      updateContent: <K extends BlockType,>(id: string, _type: K, patch: Partial<BlockContentMap[K]>, field = 'content') =>
      updateBlock(id, (b) => ({ ...b, content: { ...b.content, ...patch } }) as Block, `content:${id}:${field}`),

      updateMeta: (id: string, patch: MetaPatch, field?: string) =>
      updateBlock(
        id,
        (b) => ({
          ...b,
          style: { ...b.style, ...patch.style },
          layout: { ...b.layout, ...patch.layout },
          behaviour: { ...b.behaviour, ...patch.behaviour },
          visibility: { ...b.visibility, ...patch.visibility },
          accessibility: { ...b.accessibility, ...patch.accessibility }
        }),
        field ? `meta:${id}:${field}` : undefined
      ),

      moveBlock: (id: string, direction: -1 | 1) =>
      mutate((doc) => {
        const i = doc.blocks.findIndex((b) => b.id === id);
        const j = i + direction;
        if (i < 0 || j < 0 || j >= doc.blocks.length || doc.blocks[i].locked) return doc;
        const blocks = [...doc.blocks];
        [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
        return { ...doc, blocks };
      }),

      reorderBlocks: (ids: string[]) =>
      mutate((doc) => {
        if (ids.join('|') === doc.blocks.map((b) => b.id).join('|')) return doc;
        const byId = new Map(doc.blocks.map((b) => [b.id, b]));
        const blocks = ids.map((id) => byId.get(id)).filter((b): b is Block => !!b);
        if (blocks.length !== doc.blocks.length) return doc;
        return { ...doc, blocks };
      }, 'reorder'),

      duplicateBlock: (id: string) => {
        const source = viewOf(stateRef.current).blocks.find((b) => b.id === id);
        if (!source) return;
        const copy = cloneBlock(source);
        mutate(
          (doc) => {
            const i = doc.blocks.findIndex((b) => b.id === id);
            const blocks = [...doc.blocks];
            blocks.splice(i + 1, 0, copy);
            return { ...doc, blocks };
          },
          undefined,
          copy.id
        );
      },

      toggleHidden: (id: string) =>
      updateBlock(id, (b) => ({ ...b, visibility: { ...b.visibility, hidden: !b.visibility.hidden } })),

      removeBlock: (id: string) =>
      mutate((doc) =>
      doc.blocks.some((b) => b.id === id && b.locked) ? doc : { ...doc, blocks: doc.blocks.filter((b) => b.id !== id) }
      ),

      toggleLocked: (id: string) => updateBlock(id, (b) => ({ ...b, locked: !b.locked })),

      /** Groups ungrouped blocks into one contiguous group at the position of the first. */
      groupBlocks: (ids: string[]): string | null => {
        if (ids.length < 2) return null;
        const group: BlockGroup = { id: uid('grp'), name: nextGroupName(viewOf(stateRef.current)) };
        mutate((doc) => groups.groupBlocks(doc, ids, group), undefined, null);
        return group.id;
      },
      ungroup: (groupId: string) => mutate((doc) => groups.ungroup(doc, groupId)),
      renameGroup: (groupId: string, name: string) => mutate((doc) => groups.renameGroup(doc, groupId, name), `group:${groupId}:name`),
      setGroupLocked: (groupId: string, locked: boolean) => mutate((doc) => groups.setGroupLocked(doc, groupId, locked)),
      setGroupHidden: (groupId: string, hidden: boolean) => mutate((doc) => groups.setGroupHidden(doc, groupId, hidden)),
      moveGroup: (groupId: string, direction: -1 | 1) => mutate((doc) => groups.moveGroup(doc, groupId, direction)),
      reorderUnits: (keys: string[]) => mutate((doc) => groups.reorderUnits(doc, keys), 'reorder'),
      reorderWithinGroup: (groupId: string, ids: string[]) =>
      mutate((doc) => groups.reorderWithinGroup(doc, groupId, ids), `reorder:${groupId}`),
      moveWithinGroup: (id: string, direction: -1 | 1) => mutate((doc) => groups.moveWithinGroup(doc, id, direction)),
      removeFromGroup: (id: string) => mutate((doc) => groups.removeFromGroup(doc, id)),
      duplicateGroup: (groupId: string) => mutate((doc) => groups.duplicateGroup(doc, groupId), undefined, null),
      removeGroup: (groupId: string) => mutate((doc) => groups.removeGroup(doc, groupId), undefined, null),

      updateBranding: (patch: Partial<PageBranding>) =>
      mutate((doc) => ({
        ...doc,
        branding: { hideKubicuBadge: false, ...doc.branding, ...patch }
      })),

      restoreBlock: (block: Block, index: number) =>
      mutate(
        (doc) => {
          if (doc.blocks.some((b) => b.id === block.id)) return doc;
          const blocks = [...doc.blocks];
          blocks.splice(Math.min(index, blocks.length), 0, block);
          return { ...doc, blocks };
        },
        undefined,
        block.id
      ),

      updateTheme: (patch: Partial<PageTheme>, field = 'theme') =>
      mutate((doc) => ({ ...doc, theme: { ...doc.theme, ...patch } }), `theme:${field}`),

      applyThemePreset: (theme: PageTheme) => mutate((doc) => ({ ...doc, theme: { ...theme } })),

      updatePage: (patch: {title?: string;handle?: string;seo?: Partial<PageSeo>;}, field: string) =>
      mutate(
        (doc) => ({
          ...doc,
          title: patch.title ?? doc.title,
          handle: patch.handle ?? doc.handle,
          seo: { ...doc.seo, ...patch.seo }
        }),
        `page:${field}`
      ),

      /** The language visitors' browsers and screen readers use for the whole site (D76). */
      setLanguage: (language: string) => mutateSite((doc) => ({ ...doc, language }), 'page:language'),

      applyTemplate: (template: PageDocument) =>
      mutate(
        (doc) => cloneDocument(template, { id: doc.id, handle: doc.handle, title: doc.title, branding: doc.branding }),
        undefined,
        null
      ),

      /** Replaces the current page's blocks (and optionally its look) in one undoable step — used by AI page setup (D63). */
      replaceBlocks: (blocks: Block[], theme?: PageTheme) =>
      mutate((doc) => ({ ...doc, blocks, theme: theme ? { ...theme } : doc.theme, updatedAt: new Date().toISOString() }), undefined, null),

      /** Whole-site change from outside the canvas (e.g. removing a deleted library image). Undoable. */
      transformDocument: (fn: (doc: PageDocument) => PageDocument) => mutateSite(fn),

      /* ---- Pages of the site (D48) ---- */
      setPage: (id: string | null) => dispatch({ type: 'setPage', id }),

      addPage: (title: string): string => {
        const id = uid('pg');
        const name = title.trim() || 'New page';
        const heading = createBlock('heading');
        const first = heading.type === 'heading' ? { ...heading, content: { ...heading.content, text: name } } : heading;
        mutateSite((doc) => ({
          ...doc,
          pages: [...sitePages(doc), { id, title: name, path: uniquePath(doc, name), seo: { title: '', description: '' }, blocks: [first], createdAt: new Date().toISOString() }]
        }));
        dispatch({ type: 'setPage', id });
        return id;
      },

      renamePage: (id: string, title: string) => updateSitePage(id, (p) => ({ ...p, title }), `pg:${id}:title`),

      /** Changes a page's address. A published address keeps working by redirecting to the new one. */
      setPagePath: (id: string, path: string) => {
        const old = stateRef.current.published?.pages?.find((p) => p.id === id)?.path;
        mutateSite(
          (doc) => ({
            ...doc,
            pages: sitePages(doc).map((p) => p.id === id ? { ...p, path } : p),
            redirects:
            old && old !== path ?
            [...(doc.redirects ?? []).filter((r) => r.from !== old && r.from !== path), { from: old, to: path }] :
            (doc.redirects ?? []).filter((r) => r.from !== path)
          }),
          `pg:${id}:path`
        );
      },

      setPageHidden: (id: string, hideFromNav: boolean) => updateSitePage(id, (p) => ({ ...p, hideFromNav })),

      setHomeLabel: (label: string) => mutateSite((doc) => ({ ...doc, homeLabel: label }), 'homeLabel'),

      movePage: (id: string, direction: -1 | 1) =>
      mutateSite((doc) => {
        const list = [...sitePages(doc)];
        const i = list.findIndex((p) => p.id === id);
        const j = i + direction;
        if (i < 0 || j < 0 || j >= list.length) return doc;
        [list[i], list[j]] = [list[j], list[i]];
        return { ...doc, pages: list };
      }),

      duplicatePage: (id: string): string | null => {
        const source = findPage(stateRef.current.draft, id);
        if (!source) return null;
        const copyId = uid('pg');
        mutateSite((doc) => {
          const list = [...sitePages(doc)];
          const title = `${source.title} copy`;
          list.splice(list.findIndex((p) => p.id === id) + 1, 0, {
            ...source,
            id: copyId,
            title,
            path: uniquePath(doc, title),
            blocks: source.blocks.map((b) => ({ ...cloneBlock(b), groupId: null })),
            groups: undefined,
            createdAt: new Date().toISOString()
          });
          return { ...doc, pages: list };
        });
        dispatch({ type: 'setPage', id: copyId });
        return copyId;
      },

      removePage: (id: string) => {
        const old = stateRef.current.published?.pages?.find((p) => p.id === id)?.path;
        // A removed page that was live forwards to home, so shared links don't break.
        mutateSite((doc) => ({
          ...doc,
          pages: sitePages(doc).filter((p) => p.id !== id),
          redirects: old ? [...(doc.redirects ?? []).filter((r) => r.from !== old), { from: old, to: '' }] : doc.redirects
        }));
      },

      /** Makes a page the home page. The old home becomes a regular page. */
      makeHome: (id: string) => {
        mutateSite((doc) => {
          const p = findPage(doc, id);
          if (!p) return doc;
          const label = homeLabel(doc);
          const oldHome: SitePage = {
            id: uid('pg'),
            title: label,
            path: uniquePath(doc, label === 'Home' ? 'welcome' : label, p.id),
            seo: doc.seo,
            blocks: doc.blocks,
            groups: doc.groups,
            createdAt: new Date().toISOString()
          };
          return {
            ...doc,
            blocks: p.blocks,
            groups: p.groups,
            seo: p.seo,
            homeLabel: p.title,
            pages: sitePages(doc).map((x) => x.id === id ? oldHome : x),
            redirects: [...(doc.redirects ?? []).filter((r) => r.from !== p.path), { from: p.path, to: '' }]
          };
        });
        dispatch({ type: 'setPage', id: null });
      },

      undo: () => dispatch({ type: 'undo' }),
      redo: () => dispatch({ type: 'redo' }),

      /** Publishes the draft — or exactly `doc` when an approved review is published (D58). */
      publish: (note: string, doc?: PageDocument): boolean => {
        const s = stateRef.current;
        const live = doc ?? s.draft;
        const at = new Date().toISOString();
        const count = s.versions.filter((v) => v.kind === 'published').length + 1;
        const version: PageVersion = {
          id: uid('ver'),
          label: `Version ${count}`,
          note: note.trim(),
          createdAt: at,
          kind: 'published',
          doc: live
        };
        try {
          persist({ ...s, published: live, publishedAt: at, versions: [version, ...s.versions], scheduled: null });
        } catch {
          return false;
        }
        dispatch({ type: 'publish', at, version, doc: live });
        if (s.scheduled) dispatch({ type: 'schedule', scheduled: null });
        return true;
      },

      /** Takes the page offline. The draft and every version stay, so it can be published again. */
      unpublish: (): boolean => {
        const s = stateRef.current;
        try {
          persist({ ...s, published: null, publishedAt: null, scheduled: null });
        } catch {
          return false;
        }
        dispatch({ type: 'unpublish' });
        return true;
      },

      /** Captures the current draft to go live at `at`. Replaces any earlier schedule. */
      schedulePublish: (at: string, note: string, doc?: PageDocument): boolean => {
        const s = stateRef.current;
        const scheduled: ScheduledPublish = {
          id: uid('sch'),
          at,
          note: note.trim(),
          doc: doc ?? s.draft,
          createdAt: new Date().toISOString()
        };
        try {
          persist({ ...s, scheduled });
        } catch {
          return false;
        }
        dispatch({ type: 'schedule', scheduled });
        return true;
      },

      cancelSchedule: () => dispatch({ type: 'schedule', scheduled: null }),

      /** Inserts copies of saved blocks below the selection, grouped under `groupName` when 2+. */
      insertBlocks: (source: Block[], groupName?: string) => {
        if (source.length === 0) return;
        const { selectedId } = stateRef.current;
        const draft = viewOf(stateRef.current);
        const sel = draft.blocks.find((b) => b.id === selectedId);
        let at = draft.blocks.length;
        if (sel) {
          const range = sel.groupId ? groupRange(draft, sel.groupId) : null;
          at = (range ? range[1] : draft.blocks.indexOf(sel)) + 1;
        }
        const group: BlockGroup | null = source.length > 1 ? { id: uid('grp'), name: groupName ?? nextGroupName(draft) } : null;
        const copies = source.map((b) => ({ ...cloneBlock(b), groupId: group?.id ?? null }));
        mutate(
          (doc) => {
            const blocks = [...doc.blocks];
            blocks.splice(Math.min(at, blocks.length), 0, ...copies);
            return { ...doc, blocks, groups: group ? [...(doc.groups ?? []), group] : doc.groups };
          },
          undefined,
          copies[0].id
        );
      },

      /** Conflict: keep this tab's version and overwrite the other copy. */
      keepMine: () => {
        dispatch({ type: 'saveStatus', status: 'saving' });
        save(true);
      },

      /** Picks up a change written to storage outside the editor (e.g. pausing an IntentFlow rule, D64). */
      reloadFromStorage: () => {
        try {
          const saved = parsePersistedPage(window.localStorage.getItem(storageKey));
          if (saved) dispatch({ type: 'reset', persisted: saved });
        } catch {

          // Storage unavailable — nothing to reload.
        }},

      /** Conflict: load the copy saved in the other tab. */
      loadTheirs: () => {
        const remote = stateRef.current.remote;
        if (remote) dispatch({ type: 'reset', persisted: remote });
      },

      saveSnapshot: (label: string) => {
        const s = stateRef.current;
        dispatch({
          type: 'snapshot',
          version: {
            id: uid('ver'),
            label: label.trim() || 'Named snapshot',
            note: '',
            createdAt: new Date().toISOString(),
            kind: 'snapshot',
            doc: s.draft
          }
        });
      },

      restoreVersion: (id: string) => dispatch({ type: 'restoreVersion', id, at: Date.now() }),

      retrySave: () => save(true),

      resetDemo: () => {
        try {
          window.localStorage.removeItem(storageKey);
        } catch {

          // Storage unavailable — the in-memory reset below still applies.
        }dispatch({ type: 'reset', persisted: initialPersisted(workspaceId) });
      }
    };
  }, [persist, save, storageKey, workspaceId]);

  const issues = useMemo(
    () => siteIssues(state.draft, takenHandles, extraIssues, siteLevelIssues ? siteLevelIssues(state.draft) : []),
    [state.draft, takenHandles, extraIssues, siteLevelIssues]
  );
  const hasUnpublishedChanges = useMemo(
    () => docSignature(state.draft) !== docSignature(state.published),
    [state.draft, state.published]
  );

  // Canvas components work on the page being edited; `site` is the whole space.
  const page = useMemo(() => viewOf(state), [state.draft, state.activePageId]); // eslint-disable-line react-hooks/exhaustive-deps
  const exposed = useMemo(() => ({ ...state, draft: page, site: state.draft }), [state, page]);

  return {
    state: exposed,
    actions,
    issues,
    hasUnpublishedChanges,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0
  };
}

export type EditorStore = ReturnType<typeof useEditorStore>;