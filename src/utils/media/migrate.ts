import type { MediaAsset } from '../../types/media';
import { editorStorageKey } from '../workspaceStorage';
import { commerceKey } from '../commerce/storage';
import { imageSize } from '../image';
import { uid } from '../id';
import { putAsset } from './db';
import { collectStrings, dataUrlBytes, hashString, isEmbeddedImage, isMediaRef, mapStrings, mediaRef, mediaRefId } from './refs';

/** Everything saved per workspace that can hold images. */
export function workspaceStorageKeys(workspaceId: string): string[] {
  return [editorStorageKey(workspaceId), commerceKey(workspaceId), `kubicu.library.${workspaceId}`];
}

export async function createAsset(workspaceId: string, dataUrl: string, name: string, alt = ''): Promise<MediaAsset> {
  const { width, height } = await imageSize(dataUrl);
  const now = new Date().toISOString();
  return { id: uid('med'), workspaceId, name, alt, dataUrl, width, height, bytes: dataUrlBytes(dataUrl), hash: hashString(dataUrl), createdAt: now, updatedAt: now };
}

/**
 * One-time move of embedded photos into the library: identical images merge, and saved pages,
 * products and saved sections are rewritten to point at the library. Runs before those load.
 */
export async function migrateEmbeddedImages(workspaceId: string, existing: MediaAsset[], everyAsset: MediaAsset[] = existing): Promise<MediaAsset[]> {
  const raws = workspaceStorageKeys(workspaceId).map((key) => {
    try {
      const raw = window.localStorage.getItem(key);
      return { key, data: raw ? JSON.parse(raw) as unknown : null };
    } catch {
      return { key, data: null };
    }
  });

  const embedded = new Set<string>();
  raws.forEach((r) => r.data && collectStrings(r.data, isEmbeddedImage, embedded));

  // Library images from another workspace (e.g. chosen during onboarding, or a duplicated space) get their own copy here.
  const mineIds = new Set(existing.map((a) => a.id));
  const foreign = new Set<string>();
  raws.forEach((r) => r.data && collectStrings(r.data, (s) => isMediaRef(s) && !mineIds.has(mediaRefId(s)), foreign));

  if (embedded.size === 0 && foreign.size === 0) return existing;

  const assets = [...existing];
  const byHash = new Map(assets.map((a) => [a.hash, a]));
  const replacements = new Map<string, string>();
  let n = assets.length;

  for (const ref of foreign) {
    const source = everyAsset.find((a) => a.id === mediaRefId(ref));
    if (!source) continue;
    let asset = byHash.get(source.hash);
    if (!asset) {
      asset = { ...source, id: uid('med'), workspaceId, archived: false };
      await putAsset(asset);
      assets.push(asset);
      byHash.set(asset.hash, asset);
    }
    replacements.set(ref, mediaRef(asset.id));
  }

  for (const dataUrl of embedded) {
    const hash = hashString(dataUrl);
    let asset = byHash.get(hash);
    if (!asset) {
      n += 1;
      asset = await createAsset(workspaceId, dataUrl, `Photo ${n}`);
      await putAsset(asset);
      assets.push(asset);
      byHash.set(hash, asset);
    }
    replacements.set(dataUrl, mediaRef(asset.id));
  }

  raws.forEach((r) => {
    if (!r.data) return;
    const next = mapStrings(r.data, (s) => replacements.get(s) ?? s);
    try {
      window.localStorage.setItem(r.key, JSON.stringify(next));
    } catch {

      // Leave this one embedded; it still renders.
    }});
  return assets;
}