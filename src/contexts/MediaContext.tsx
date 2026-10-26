import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import type { MediaAsset, MediaFolder } from '../types/media';
import { useWorkspace } from './WorkspaceContext';
import { usePlan } from './PlanContext';
import { mediaQuota } from '../data/mediaQuota';
import { systemMediaFolders } from '../data/mediaFolders';
import { ImageProblem, imageSize, processUpload } from '../utils/image';
import { deleteAssetRecord, getAllAssets, isQuotaError, putAsset } from '../utils/media/db';
import { createAsset, migrateEmbeddedImages } from '../utils/media/migrate';
import { dataUrlBytes, hashString, mediaRef, removeCachedMedia, setCachedMedia, setCachedMediaMany } from '../utils/media/refs';

export interface StoredImage {
  /** What to save in the field: a library reference, or the image itself if the library is unavailable. */
  src: string;
  asset: MediaAsset | null;
  duplicate: boolean;
}

interface MediaValue {
  /** False when the browser's media storage can't be used — images then stay inside each page. */
  available: boolean;
  /** Library images for this workspace, newest first (archived ones excluded). */
  assets: MediaAsset[];
  /** Default folders first, then the workspace's own folders A–Z. */
  folders: MediaFolder[];
  usedBytes: number;
  quotaBytes: number;
  get: (id: string) => MediaAsset | undefined;
  /** The folder an image is in, or undefined when it's not in one (or its folder was deleted). */
  folderOf: (asset: MediaAsset) => MediaFolder | undefined;
  /** Validates, resizes and stores a file. Throws ImageProblem with a readable message. */
  addFile: (file: File, folderId?: string) => Promise<StoredImage>;
  /** Stores an already-processed image (e.g. a crop). */
  addDataUrl: (dataUrl: string, name: string, alt?: string, folderId?: string) => Promise<StoredImage>;
  update: (id: string, patch: Partial<Pick<MediaAsset, 'name' | 'alt'>>) => Promise<void>;
  /** Files images in a folder; `null` takes them out of any folder. */
  moveTo: (ids: string[], folderId: string | null) => Promise<void>;
  /** Swaps the picture behind an ID (an already-processed image), so every place using it updates. */
  replaceWithDataUrl: (id: string, dataUrl: string) => Promise<void>;
  /** Removes from the library. `keepData` archives it so live pages and history still render. */
  remove: (id: string, keepData: boolean) => Promise<MediaAsset | undefined>;
  restore: (asset: MediaAsset) => Promise<void>;
  /** Throws ImageProblem when the name is empty or already taken. */
  createFolder: (name: string) => MediaFolder;
  renameFolder: (id: string, name: string) => void;
  /** Deletes one of your folders. Its images stay in the library, no longer in a folder. */
  deleteFolder: (id: string) => Promise<number>;
}

const MediaContext = createContext<MediaValue | null>(null);

const nameFrom = (file: File) => file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim().slice(0, 60) || 'Photo';
const storageFull = () => new ImageProblem('Your browser is out of space for photos. Delete unused images in Media and try again.');
const foldersKey = (ws: string) => `kubicu.mediaFolders.${ws}`;

function loadFolders(ws: string): MediaFolder[] {
  try {
    const raw = localStorage.getItem(foldersKey(ws));
    const list = raw ? JSON.parse(raw) as MediaFolder[] : [];
    return Array.isArray(list) ? list.filter((f) => f && typeof f.id === 'string' && typeof f.name === 'string').map((f) => ({ ...f, system: false })) : [];
  } catch {
    return [];
  }
}

/** Workspace media library. Waits for the library (and the one-time move of embedded photos) before rendering the workspace. */
export function MediaProvider({ children }: {children: React.ReactNode;}) {
  const workspaceId = useWorkspace().current.id;
  const plan = usePlan();
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(false);
  const [all, setAll] = useState<MediaAsset[]>([]);
  const [own, setOwn] = useState<MediaFolder[]>(() => loadFolders(workspaceId));
  const allRef = useRef(all);
  allRef.current = all;
  const ownRef = useRef(own);
  ownRef.current = own;

  useEffect(() => {
    setOwn(loadFolders(workspaceId));
  }, [workspaceId]);

  const persistFolders = useCallback(
    (next: MediaFolder[]) => {
      setOwn(next);
      ownRef.current = next;
      try {
        localStorage.setItem(foldersKey(workspaceId), JSON.stringify(next));
      } catch {

        /* storage full — folders still work for this session */}
    },
    [workspaceId]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const stored = await getAllAssets();
        setCachedMediaMany(stored.map((a) => [a.id, a.dataUrl]));
        const mine = stored.filter((a) => a.workspaceId === workspaceId);
        const migrated = await migrateEmbeddedImages(workspaceId, mine, stored);
        setCachedMediaMany(migrated.map((a) => [a.id, a.dataUrl]));
        if (!alive) return;
        setAll(migrated);
        setAvailable(true);
      } catch {
        if (!alive) return;
        setAvailable(false);
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [workspaceId]);

  const save = useCallback(async (asset: MediaAsset) => {
    try {
      await putAsset(asset);
    } catch (e) {
      if (isQuotaError(e)) throw storageFull();
      throw new ImageProblem('We couldn’t save that photo. Try again.');
    }
    setCachedMedia(asset.id, asset.dataUrl);
    setAll((list) => [asset, ...list.filter((a) => a.id !== asset.id)]);
  }, []);

  const folders = useMemo(() => [...systemMediaFolders, ...[...own].sort((a, b) => a.name.localeCompare(b.name))], [own]);
  const validFolder = useCallback((id: string | undefined) => id && (systemMediaFolders.some((f) => f.id === id) || ownRef.current.some((f) => f.id === id)) ? id : undefined, []);

  const quotaBytes = mediaQuota[plan.id];
  const usedBytes = useMemo(() => all.reduce((s, a) => s + a.bytes, 0), [all]);

  const addDataUrl = useCallback(
    async (dataUrl: string, name: string, alt = '', folderId?: string): Promise<StoredImage> => {
      if (!available) return { src: dataUrl, asset: null, duplicate: false };
      const folder = validFolder(folderId);
      const hash = hashString(dataUrl);
      const dup = allRef.current.find((a) => a.hash === hash);
      if (dup) {
        // Re-uploading an unfiled image from a brand or product field files it there.
        const refile = folder && !validFolder(dup.folderId);
        if (dup.archived || refile) await save({ ...dup, archived: false, folderId: refile ? folder : dup.folderId, updatedAt: new Date().toISOString() });
        return { src: mediaRef(dup.id), asset: dup, duplicate: !dup.archived };
      }
      const used = allRef.current.reduce((s, a) => s + a.bytes, 0);
      if (used + dataUrlBytes(dataUrl) > quotaBytes) throw new ImageProblem(`Your ${plan.name} plan’s media storage is full. Delete unused images to make room.`);
      const created = await createAsset(workspaceId, dataUrl, name, alt);
      const asset = folder ? { ...created, folderId: folder } : created;
      await save(asset);
      return { src: mediaRef(asset.id), asset, duplicate: false };
    },
    [available, save, quotaBytes, plan.name, workspaceId, validFolder]
  );

  const addFile = useCallback(async (file: File, folderId?: string) => addDataUrl(await processUpload(file), nameFrom(file), '', folderId), [addDataUrl]);

  const update = useCallback(
    async (id: string, patch: Partial<Pick<MediaAsset, 'name' | 'alt'>>) => {
      const a = allRef.current.find((x) => x.id === id);
      if (a) await save({ ...a, ...patch, updatedAt: new Date().toISOString() });
    },
    [save]
  );

  const moveTo = useCallback(
    async (ids: string[], folderId: string | null) => {
      const target = folderId ? validFolder(folderId) : undefined;
      for (const id of ids) {
        const a = allRef.current.find((x) => x.id === id);
        if (a && a.folderId !== target) await save({ ...a, folderId: target, updatedAt: new Date().toISOString() });
      }
    },
    [save, validFolder]
  );

  const replaceWithDataUrl = useCallback(
    async (id: string, dataUrl: string) => {
      const a = allRef.current.find((x) => x.id === id);
      if (!a) return;
      const { width, height } = await imageSize(dataUrl);
      await save({ ...a, dataUrl, width, height, bytes: dataUrlBytes(dataUrl), hash: hashString(dataUrl), updatedAt: new Date().toISOString() });
    },
    [save]
  );

  const remove = useCallback(
    async (id: string, keepData: boolean) => {
      const a = allRef.current.find((x) => x.id === id);
      if (!a) return undefined;
      if (keepData) {
        await save({ ...a, archived: true, updatedAt: new Date().toISOString() });
      } else {
        await deleteAssetRecord(id);
        removeCachedMedia(id);
        setAll((list) => list.filter((x) => x.id !== id));
      }
      return a;
    },
    [save]
  );

  const restore = useCallback((asset: MediaAsset) => save({ ...asset, archived: false }), [save]);

  const checkName = useCallback((name: string, exceptId?: string) => {
    const clean = name.trim().replace(/\s+/g, ' ').slice(0, 40);
    if (!clean) throw new ImageProblem('Give the folder a name.');
    const taken = [...systemMediaFolders, ...ownRef.current].some((f) => f.id !== exceptId && f.name.toLowerCase() === clean.toLowerCase());
    if (taken) throw new ImageProblem(`You already have a folder called “${clean}”.`);
    return clean;
  }, []);

  const createFolder = useCallback(
    (name: string) => {
      const folder: MediaFolder = { id: `fld_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name: checkName(name), system: false, createdAt: new Date().toISOString() };
      persistFolders([...ownRef.current, folder]);
      return folder;
    },
    [checkName, persistFolders]
  );

  const renameFolder = useCallback(
    (id: string, name: string) => {
      if (!ownRef.current.some((f) => f.id === id)) return;
      const clean = checkName(name, id);
      persistFolders(ownRef.current.map((f) => f.id === id ? { ...f, name: clean } : f));
    },
    [checkName, persistFolders]
  );

  const deleteFolder = useCallback(
    async (id: string) => {
      if (!ownRef.current.some((f) => f.id === id)) return 0;
      const inside = allRef.current.filter((a) => a.folderId === id);
      for (const a of inside) await save({ ...a, folderId: undefined, updatedAt: new Date().toISOString() });
      persistFolders(ownRef.current.filter((f) => f.id !== id));
      return inside.filter((a) => !a.archived).length;
    },
    [save, persistFolders]
  );

  const assets = useMemo(() => all.filter((a) => !a.archived).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [all]);
  const get = useCallback((id: string) => allRef.current.find((a) => a.id === id), []);
  const folderOf = useCallback((a: MediaAsset) => a.folderId ? folders.find((f) => f.id === a.folderId) : undefined, [folders]);

  const value = useMemo(
    () => ({ available, assets, folders, usedBytes, quotaBytes, get, folderOf, addFile, addDataUrl, update, moveTo, replaceWithDataUrl, remove, restore, createFolder, renameFolder, deleteFolder }),
    [available, assets, folders, usedBytes, quotaBytes, get, folderOf, addFile, addDataUrl, update, moveTo, replaceWithDataUrl, remove, restore, createFolder, renameFolder, deleteFolder]
  );

  if (!ready) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-canvas" role="status" aria-label="Loading your workspace">
        <Loader2Icon size={20} className="animate-spin text-fg-subtle" aria-hidden />
      </div>);

  }
  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

export function useMedia(): MediaValue {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error('useMedia must be used inside MediaProvider');
  return ctx;
}

export function useOptionalMedia(): MediaValue | null {
  return useContext(MediaContext);
}