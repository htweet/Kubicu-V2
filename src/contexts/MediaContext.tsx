import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import type { MediaAsset } from '../types/media';
import { useWorkspace } from './WorkspaceContext';
import { usePlan } from './PlanContext';
import { mediaQuota } from '../data/mediaQuota';
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
  usedBytes: number;
  quotaBytes: number;
  get: (id: string) => MediaAsset | undefined;
  /** Validates, resizes and stores a file. Throws ImageProblem with a readable message. */
  addFile: (file: File) => Promise<StoredImage>;
  /** Stores an already-processed image (e.g. a crop). */
  addDataUrl: (dataUrl: string, name: string, alt?: string) => Promise<StoredImage>;
  update: (id: string, patch: Partial<Pick<MediaAsset, 'name' | 'alt'>>) => Promise<void>;
  /** Swaps the picture behind an ID (an already-processed image), so every place using it updates. */
  replaceWithDataUrl: (id: string, dataUrl: string) => Promise<void>;
  /** Removes from the library. `keepData` archives it so live pages and history still render. */
  remove: (id: string, keepData: boolean) => Promise<MediaAsset | undefined>;
  restore: (asset: MediaAsset) => Promise<void>;
}

const MediaContext = createContext<MediaValue | null>(null);

const nameFrom = (file: File) => file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim().slice(0, 60) || 'Photo';
const storageFull = () => new ImageProblem('Your browser is out of space for photos. Delete unused images in Media and try again.');

/** Workspace media library. Waits for the library (and the one-time move of embedded photos) before rendering the workspace. */
export function MediaProvider({ children }: {children: React.ReactNode;}) {
  const workspaceId = useWorkspace().current.id;
  const plan = usePlan();
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(false);
  const [all, setAll] = useState<MediaAsset[]>([]);
  const allRef = useRef(all);
  allRef.current = all;

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

  const quotaBytes = mediaQuota[plan.id];
  const usedBytes = useMemo(() => all.reduce((s, a) => s + a.bytes, 0), [all]);

  const addDataUrl = useCallback(
    async (dataUrl: string, name: string, alt = ''): Promise<StoredImage> => {
      if (!available) return { src: dataUrl, asset: null, duplicate: false };
      const hash = hashString(dataUrl);
      const dup = allRef.current.find((a) => a.hash === hash);
      if (dup) {
        if (dup.archived) await save({ ...dup, archived: false, updatedAt: new Date().toISOString() });
        return { src: mediaRef(dup.id), asset: dup, duplicate: !dup.archived };
      }
      const used = allRef.current.reduce((s, a) => s + a.bytes, 0);
      if (used + dataUrlBytes(dataUrl) > quotaBytes) throw new ImageProblem(`Your ${plan.name} plan’s media storage is full. Delete unused images to make room.`);
      const asset = await createAsset(workspaceId, dataUrl, name, alt);
      await save(asset);
      return { src: mediaRef(asset.id), asset, duplicate: false };
    },
    [available, save, quotaBytes, plan.name, workspaceId]
  );

  const addFile = useCallback(async (file: File) => addDataUrl(await processUpload(file), nameFrom(file)), [addDataUrl]);

  const update = useCallback(
    async (id: string, patch: Partial<Pick<MediaAsset, 'name' | 'alt'>>) => {
      const a = allRef.current.find((x) => x.id === id);
      if (a) await save({ ...a, ...patch, updatedAt: new Date().toISOString() });
    },
    [save]
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

  const assets = useMemo(() => all.filter((a) => !a.archived).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [all]);
  const get = useCallback((id: string) => allRef.current.find((a) => a.id === id), []);

  const value = useMemo(
    () => ({ available, assets, usedBytes, quotaBytes, get, addFile, addDataUrl, update, replaceWithDataUrl, remove, restore }),
    [available, assets, usedBytes, quotaBytes, get, addFile, addDataUrl, update, replaceWithDataUrl, remove, restore]
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