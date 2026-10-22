const YOUTUBE_PATTERNS = [
/youtube\.com\/watch\?v=([\w-]{11})/i,
/youtu\.be\/([\w-]{11})/i,
/youtube\.com\/shorts\/([\w-]{11})/i,
/youtube\.com\/embed\/([\w-]{11})/i];


export function getYouTubeId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}