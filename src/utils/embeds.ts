/**
 * Safe embeds (D142). Only links from a curated list of sites are accepted. Each is rewritten to the site's
 * official embed address and shown in a locked-down frame (sandboxed, no referrer leak beyond the origin).
 * Anything else is refused with a plain reason, so sellers never paste arbitrary code into a page.
 */

export type EmbedProvider =
'youtube' |
'vimeo' |
'tiktok' |
'instagram' |
'facebook' |
'loom' |
'spotify' |
'soundcloud' |
'audiomack' |
'maps' |
'calendly';

export type EmbedKind = 'video' | 'audio' | 'map' | 'scheduler';

export type EmbedFrame = {type: 'ratio';ratio: string;} | {type: 'fixed';height: number;maxWidth?: number;};

export interface EmbedInfo {
  ok: true;
  provider: EmbedProvider;
  name: string;
  kind: EmbedKind;
  src: string;
  frame: EmbedFrame;
  /** Thumbnail shown in the canvas, when the site offers one without a script. */
  thumbnail?: string;
  /** Features the frame may use. */
  allow: string;
  sandbox: string;
}

export interface EmbedRefusal {
  ok: false;
  reason: string;
}

export type EmbedResult = EmbedInfo | EmbedRefusal;

export interface ProviderMeta {
  id: EmbedProvider;
  name: string;
  kind: EmbedKind;
  example: string;
  /** Where the seller turns captions on, for video sites. */
  captionsHow?: string;
}

export const EMBED_PROVIDERS: ProviderMeta[] = [
{ id: 'youtube', name: 'YouTube', kind: 'video', example: 'youtube.com/watch?v=…', captionsHow: 'In YouTube Studio, open the video → Subtitles → Add language, then upload or type captions. Automatic captions are a start, but check names and Nigerian words.' },
{ id: 'vimeo', name: 'Vimeo', kind: 'video', example: 'vimeo.com/123456789', captionsHow: 'On Vimeo, open the video → Distribution → Subtitles, then upload a caption file or use automatic captions.' },
{ id: 'tiktok', name: 'TikTok', kind: 'video', example: 'tiktok.com/@you/video/…', captionsHow: 'In TikTok, turn on Auto captions before posting, or add on-screen text. Edit the captions after they’re generated.' },
{ id: 'instagram', name: 'Instagram', kind: 'video', example: 'instagram.com/reel/…', captionsHow: 'When posting a reel, tap Captions (or Text) to add automatic captions, and check them before sharing.' },
{ id: 'facebook', name: 'Facebook video', kind: 'video', example: 'facebook.com/…/videos/…', captionsHow: 'In Meta Business Suite, open the video → Edit → Subtitles & captions, then generate or upload them.' },
{ id: 'loom', name: 'Loom', kind: 'video', example: 'loom.com/share/…', captionsHow: 'Loom adds captions automatically. Open the video → Settings and make sure captions are on for viewers.' },
{ id: 'spotify', name: 'Spotify', kind: 'audio', example: 'open.spotify.com/track/…' },
{ id: 'soundcloud', name: 'SoundCloud', kind: 'audio', example: 'soundcloud.com/artist/track' },
{ id: 'audiomack', name: 'Audiomack', kind: 'audio', example: 'audiomack.com/artist/song/…' },
{ id: 'maps', name: 'Google Maps', kind: 'map', example: 'google.com/maps/place/…' },
{ id: 'calendly', name: 'Calendly', kind: 'scheduler', example: 'calendly.com/you/30min' }];


export const providerMeta = (id: EmbedProvider) => EMBED_PROVIDERS.find((p) => p.id === id)!;

const SANDBOX = 'allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox';
const VIDEO_ALLOW = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
const SUPPORTED_LIST = 'YouTube, Vimeo, TikTok, Instagram, Facebook video, Loom, Spotify, SoundCloud, Audiomack, Google Maps and Calendly';

function ok(provider: EmbedProvider, src: string, frame: EmbedFrame, extra: Partial<EmbedInfo> = {}): EmbedInfo {
  const meta = providerMeta(provider);
  return { ok: true, provider, name: meta.name, kind: meta.kind, src, frame, allow: meta.kind === 'video' ? VIDEO_ALLOW : 'autoplay; encrypted-media', sandbox: SANDBOX, ...extra };
}

const no = (reason: string): EmbedRefusal => ({ ok: false, reason });
const video = { type: 'ratio', ratio: '16 / 9' } as const;

/** The YouTube video id, if the link is a YouTube video (kept for thumbnails). */
export function youTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  return m ? m[1] : null;
}

/** Work out whether a pasted link (or embed code) can be shown, and how. */
export function parseEmbed(input: string): EmbedResult {
  let raw = input.trim();
  if (!raw) return no('Paste a link to a video, song, map or booking page.');

  // Pasted embed code: use only the address inside it, never the code itself.
  if (/<\s*(iframe|script|blockquote)/i.test(raw)) {
    const src = raw.match(/src\s*=\s*["']([^"']+)["']/i)?.[1] ?? raw.match(/cite\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!src) return no('That’s embed code, not a link. Paste the page’s link instead — we build the safe embed for you.');
    raw = src.startsWith('//') ? `https:${src}` : src;
  }

  if (!/^[a-z]+:\/\//i.test(raw)) raw = `https://${raw}`;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return no('That doesn’t look like a web address. Copy the link from the site’s Share button.');
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return no('Only web links (https://) can be embedded.');
  const host = u.hostname.replace(/^(www\.|m\.|mobile\.|web\.)/, '').toLowerCase();
  const path = u.pathname.replace(/\/+$/, '');
  const seg = path.split('/').filter(Boolean);

  // YouTube
  if (host === 'youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com' || host === 'music.youtube.com') {
    const id = youTubeId(u.href);
    if (!id) return no('That’s a YouTube channel or playlist page. Open the video itself and copy its link.');
    return ok('youtube', `https://www.youtube-nocookie.com/embed/${id}?rel=0`, seg[0] === 'shorts' ? { type: 'fixed', height: 620, maxWidth: 350 } : video, { thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` });
  }

  // Vimeo
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = seg.find((s) => /^\d{6,}$/.test(s));
    if (!id) return no('That Vimeo link isn’t a video. Open the video and copy the link from Share.');
    const hash = seg[seg.indexOf(id) + 1];
    return ok('vimeo', `https://player.vimeo.com/video/${id}?dnt=1${hash && /^[a-f0-9]{6,}$/i.test(hash) ? `&h=${hash}` : ''}`, video);
  }

  // TikTok
  if (host === 'tiktok.com' || host === 'vm.tiktok.com' || host === 'vt.tiktok.com') {
    if (host !== 'tiktok.com') return no('Short TikTok links can’t be checked. Open it in your browser and copy the full link (tiktok.com/@name/video/…).');
    const id = path.match(/\/video\/(\d{10,})/)?.[1] ?? path.match(/\/embed(?:\/v2)?\/(\d{10,})/)?.[1];
    if (!id) return no('That’s a TikTok profile, not a video. Open the video and copy its link.');
    return ok('tiktok', `https://www.tiktok.com/embed/v2/${id}`, { type: 'fixed', height: 740, maxWidth: 340 });
  }

  // Instagram
  if (host === 'instagram.com' || host === 'instagr.am') {
    const m = path.match(/^\/(p|reel|reels|tv)\/([\w-]+)/);
    if (!m) return no('That’s an Instagram profile. Open a post or reel and copy its link.');
    return ok('instagram', `https://www.instagram.com/${m[1] === 'reels' ? 'reel' : m[1]}/${m[2]}/embed`, { type: 'fixed', height: 640, maxWidth: 400 });
  }

  // Facebook video
  if (host === 'facebook.com' || host === 'fb.watch') {
    const isVideo = host === 'fb.watch' || /\/videos\//.test(path) || /\/reel\//.test(path) || path === '/watch' || path === '/video.php';
    if (!isVideo) return no('Only Facebook videos can be embedded. Open the video and copy its link.');
    return ok('facebook', `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u.href)}&show_text=false`, video);
  }

  // Loom
  if (host === 'loom.com') {
    const id = path.match(/\/(?:share|embed)\/([a-f0-9]{16,})/i)?.[1];
    if (!id) return no('That Loom link isn’t a recording. Use the Share link (loom.com/share/…).');
    return ok('loom', `https://www.loom.com/embed/${id}?hide_owner=true&hide_share=true`, video);
  }

  // Spotify
  if (host === 'open.spotify.com') {
    const parts = seg[0]?.startsWith('intl-') ? seg.slice(1) : seg;
    const [type, id] = parts[0] === 'embed' ? parts.slice(1) : parts;
    if (!['track', 'album', 'playlist', 'episode', 'show', 'artist'].includes(type ?? '') || !id) return no('That Spotify link isn’t a song, album, playlist or podcast. Use Share → Copy link.');
    return ok('spotify', `https://open.spotify.com/embed/${type}/${id}`, { type: 'fixed', height: type === 'track' || type === 'episode' ? 152 : 352 });
  }
  if (host === 'spotify.link') return no('Short Spotify links can’t be checked. Open it, then copy the open.spotify.com link.');

  // SoundCloud
  if (host === 'soundcloud.com' || host === 'on.soundcloud.com') {
    if (host === 'on.soundcloud.com') return no('Short SoundCloud links can’t be checked. Open it and copy the full soundcloud.com link.');
    if (seg.length < 2) return no('That’s a SoundCloud profile. Open a track or playlist and copy its link.');
    const isSet = seg[1] === 'sets';
    return ok('soundcloud', `https://w.soundcloud.com/player/?url=${encodeURIComponent(`https://soundcloud.com${path}`)}&color=%23ff5500&visual=false&show_comments=false`, { type: 'fixed', height: isSet ? 360 : 166 });
  }

  // Audiomack
  if (host === 'audiomack.com') {
    const m = path.match(/^\/([\w-]+)\/(song|album|playlist)\/([\w-]+)/);
    if (!m) return no('That Audiomack link isn’t a song, album or playlist. Open one and copy its link.');
    return ok('audiomack', `https://audiomack.com/embed/${m[2]}/${m[1]}/${m[3]}`, { type: 'fixed', height: m[2] === 'song' ? 252 : 400 });
  }

  // Google Maps
  if ((host === 'google.com' || /^google\.[a-z.]+$/.test(host) || host === 'maps.google.com') && (path.startsWith('/maps') || host === 'maps.google.com')) {
    if (path.startsWith('/maps/embed')) return ok('maps', `https://www.google.com/maps/embed${u.search}`, { type: 'ratio', ratio: '4 / 3' }, { sandbox: `${SANDBOX}`, allow: '' });
    const place = path.match(/\/maps\/place\/([^/]+)/)?.[1];
    const q = u.searchParams.get('q') ?? u.searchParams.get('query') ?? (place ? decodeURIComponent(place.replace(/\+/g, ' ')) : null);
    const at = path.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const query = q ?? (at ? `${at[1]},${at[2]}` : null);
    if (!query) return no('Search for the place on Google Maps first, then copy the link of the place.');
    return ok('maps', `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`, { type: 'ratio', ratio: '4 / 3' }, { allow: '' });
  }
  if (host === 'maps.app.goo.gl' || host === 'goo.gl') return no('Short Maps links can’t be checked. In Google Maps choose Share → Embed a map and paste that code, or open the link and copy the full address.');

  // Calendly
  if (host === 'calendly.com') {
    if (seg.length < 1) return no('Paste your Calendly booking link, like calendly.com/your-name/30min.');
    return ok('calendly', `https://calendly.com/${seg.join('/')}?embed_type=Inline&hide_gdpr_banner=1`, { type: 'fixed', height: 700 }, { sandbox: `${SANDBOX} allow-forms`, allow: '' });
  }

  return no(`${host} isn’t on the safe list. You can embed links from ${SUPPORTED_LIST}.`);
}

export const isCaptionable = (r: EmbedResult): r is EmbedInfo => r.ok && r.kind === 'video';