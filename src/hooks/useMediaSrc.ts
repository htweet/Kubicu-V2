import { useSyncExternalStore } from 'react';
import { mediaVersion, resolveMediaSrc, subscribeMedia } from '../utils/media/refs';

/** Resolves a library reference to a displayable URL and re-renders when the library changes. */
export function useMediaSrc(src: string | undefined | null): string {
  useSyncExternalStore(subscribeMedia, mediaVersion, mediaVersion);
  return resolveMediaSrc(src);
}
