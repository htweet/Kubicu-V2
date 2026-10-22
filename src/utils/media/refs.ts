import type { MediaShape } from '../../types/media';

/** Pages and products point at library images with `kmedia:<id>` instead of holding a copy. */
export const MEDIA_PREFIX = 'kmedia:';

export function isMediaRef(src: unknown): src is string {
  return typeof src === 'string' && src.startsWith(MEDIA_PREFIX);
}

export function mediaRef(id: string): string {
  return `${MEDIA_PREFIX}${id}`;
}

export function mediaRefId(src: string): string {
  return src.slice(MEDIA_PREFIX.length);
}

export function isEmbeddedImage(src: unknown): src is string {
  return typeof src === 'string' && src.startsWith('data:image/');
}

// ---- Resolution cache (shared by every renderer, including other workspaces' public pages) ----

const cache = new Map<string, string>();
const listeners = new Set<() => void>();
let version = 0;

function bump() {
  version += 1;
  listeners.forEach((l) => l());
}

export function setCachedMedia(id: string, dataUrl: string) {
  cache.set(id, dataUrl);
  bump();
}

export function setCachedMediaMany(entries: [string, string][]) {
  entries.forEach(([id, url]) => cache.set(id, url));
  bump();
}

export function removeCachedMedia(id: string) {
  cache.delete(id);
  bump();
}

export function subscribeMedia(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function mediaVersion(): number {
  return version;
}

/** A displayable URL for any image value: library refs resolve, links and data URLs pass through. */
export function resolveMediaSrc(src: string | undefined | null): string {
  if (!src) return '';
  return isMediaRef(src) ? cache.get(mediaRefId(src)) ?? '' : src;
}

// ---- Helpers ----

/** FNV-1a — fast, good enough to spot identical uploads. */
export function hashString(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `${(h >>> 0).toString(16)}-${s.length}`;
}

export function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(',');
  return Math.round((dataUrl.length - comma - 1) * 3 / 4);
}

export function shapeOf(width: number, height: number): MediaShape {
  const r = width / Math.max(1, height);
  if (r > 1.2) return 'wide';
  if (r < 0.9) return 'portrait';
  return 'square';
}

/** Deep-maps every string inside plain JSON data. */
export function mapStrings<T>(value: T, fn: (s: string) => string): T {
  if (typeof value === 'string') return fn(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => mapStrings(v, fn)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
      out[k] = mapStrings(v, fn);
    });
    return out as T;
  }
  return value;
}

export function collectStrings(value: unknown, test: (s: string) => boolean, into: Set<string> = new Set()): Set<string> {
  if (typeof value === 'string') {
    if (test(value)) into.add(value);
  } else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, test, into));else
  if (value && typeof value === 'object') Object.values(value as Record<string, unknown>).forEach((v) => collectStrings(v, test, into));
  return into;
}

export function containsString(value: unknown, needle: string): boolean {
  return JSON.stringify(value ?? null).includes(`"${needle}"`);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}