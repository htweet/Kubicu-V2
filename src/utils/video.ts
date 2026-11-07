import { youTubeId } from './embeds';

/** Kept for older callers; new code uses parseEmbed from utils/embeds (D142). */
export function getYouTubeId(url: string): string | null {
  return youTubeId(url);
}
