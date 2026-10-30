import type { Block } from '../types/page';
import type { ValidationIssue } from './validation';
import { parseEmbed, providerMeta } from './embeds';

/**
 * Canvas "Check" tab (D126): an automatic accessibility pass and a page-weight estimate,
 * worked out from the draft only. It catches the common problems; it isn't a full WCAG audit.
 */

export type CheckLevel = 'fix' | 'improve';

export interface A11yFinding {
  id: string;
  blockId: string | null;
  level: CheckLevel;
  /** Short title, e.g. "Image has no description". English with placeholders filled from `vars` (D311). */
  title: string;
  /** What to do, in plain words. Same placeholders. */
  advice: string;
  vars?: Record<string, string | number>;
  /** WCAG 2.1 success criterion, shown as a reference. */
  wcag: string;
}

const VAGUE = new Set(['click here', 'here', 'link', 'read more', 'more', 'click', 'tap here', 'learn more', 'see more', 'this']);

export function a11yFindings(blocks: Block[], editorIssues: ValidationIssue[]): A11yFinding[] {
  const out: A11yFinding[] = [];
  let seenHeading = false;
  const linkTargets = new Map<string, string>();

  for (const b of blocks) {
    if (b.visibility?.hidden) continue;
    const add = (f: Omit<A11yFinding, 'blockId'>) => out.push({ ...f, blockId: b.id });

    switch (b.type) {
      case 'profile':
        if (b.content.avatarUrl && !b.content.avatarAlt.trim())
        add({ id: `${b.id}:avatar`, level: 'improve', title: 'Profile photo has no description', advice: 'Describe the photo in a few words, e.g. “Adaeze smiling in her studio”.', wcag: '1.1.1' });
        break;
      case 'image':
        if (b.content.url && !b.content.decorative && !b.content.alt.trim())
        add({ id: `${b.id}:alt`, level: 'fix', title: 'Image has no description', advice: 'Say what the image shows, or mark it “Decorative only” if it adds nothing.', wcag: '1.1.1' });
        break;
      case 'gallery':{
          const missing = b.content.images.filter((i) => i.url && !i.alt.trim()).length;
          if (missing) add({ id: `${b.id}:alt`, level: 'fix', title: 'Gallery photos with no description: {n}', vars: { n: missing }, advice: 'Add a short description to each photo so screen-reader users know what’s there.', wcag: '1.1.1' });
          break;
        }
      case 'product':
        if (b.content.imageUrl && !b.content.imageAlt.trim())
        add({ id: `${b.id}:alt`, level: 'improve', title: 'Product photo has no description', advice: 'Describe the item: colour, style, what’s included.', wcag: '1.1.1' });
        break;
      case 'productGrid':{
          const missing = b.content.items.filter((i) => i.imageUrl && !i.imageAlt.trim()).length;
          if (missing) add({ id: `${b.id}:alt`, level: 'improve', title: 'Product photos with no description: {n}', vars: { n: missing }, advice: 'Describe each product photo, or link the grid to Commerce where photos carry their own descriptions.', wcag: '1.1.1' });
          break;
        }
      case 'heading':
        if (!b.content.text.trim()) add({ id: `${b.id}:empty`, level: 'fix', title: 'Empty heading', advice: 'Type a heading or delete the block — screen readers announce empty headings.', wcag: '1.3.1' });else
        if (b.content.level === 'h3' && !seenHeading)
        add({ id: `${b.id}:level`, level: 'improve', title: 'Page starts with a small heading', advice: 'Make the first heading a section heading (H2) so the page outline makes sense.', wcag: '1.3.1' });
        seenHeading = true;
        break;
      case 'text':
        if (b.content.body.length > 60 && b.content.body === b.content.body.toUpperCase() && /[A-Z]/.test(b.content.body))
        add({ id: `${b.id}:caps`, level: 'improve', title: 'Long text in capitals', advice: 'Long capitals are harder to read and some screen readers spell them out. Use normal case.', wcag: '3.1.5' });
        break;
      case 'link':{
          const label = b.content.label.trim();
          if (!label) add({ id: `${b.id}:label`, level: 'fix', title: 'Button has no label', advice: 'Give the button a label that says where it goes.', wcag: '2.4.4' });else
          if (VAGUE.has(label.toLowerCase()))
          add({ id: `${b.id}:vague`, level: 'improve', title: '“{label}” doesn’t say where it goes', vars: { label }, advice: 'Use words like “See the menu” or “Book a fitting” — people using screen readers often jump from link to link.', wcag: '2.4.4' });else
          {
            const key = label.toLowerCase();
            const prev = linkTargets.get(key);
            if (prev !== undefined && prev !== b.content.url.trim())
            add({ id: `${b.id}:dup`, level: 'improve', title: 'Two buttons say “{label}” but go to different places', vars: { label }, advice: 'Make each label different so people can tell them apart.', wcag: '2.4.4' });
            linkTargets.set(key, b.content.url.trim());
          }
          break;
        }
      case 'video':{
          const r = b.content.url ? parseEmbed(b.content.url) : null;
          if (!r || !r.ok) break;
          const what = r.kind === 'map' ? 'map' : r.kind === 'scheduler' ? 'booking calendar' : r.kind === 'audio' ? 'audio player' : 'video';
          if (!b.content.title.trim())
          add({
            id: `${b.id}:title`,
            level: 'fix',
            title: { map: 'Embedded map has no title', 'booking calendar': 'Embedded booking calendar has no title', 'audio player': 'Embedded audio player has no title', video: 'Embedded video has no title' }[what],
            advice: 'Add a title so screen readers can announce what this {site} embed is.',
            vars: { site: r.name },
            wcag: '4.1.2'
          });
          if (r.kind === 'video' && !b.content.captioned)
          add({ id: `${b.id}:captions`, level: 'improve', title: 'Video isn’t marked as captioned', advice: `${providerMeta(r.provider).captionsHow ?? 'Turn on captions where the video is hosted.'} Then tick “This video has captions”. Many people watch on mute, on buses and in shops.`, wcag: '1.2.2' });
          if (r.kind === 'audio')
          add({ id: `${b.id}:transcript`, level: 'improve', title: 'Offer a transcript or lyrics', advice: 'For talks and podcasts, add a short summary or a link to a transcript in a Text block below, so Deaf visitors don’t miss out.', wcag: '1.2.1' });
          break;
        }
      default:
        break;
    }
  }

  // Theme colour problems come from the publish checks; repeat them here so everything is in one list.
  for (const i of editorIssues) {
    if (!i.id.startsWith('theme:')) continue;
    out.push({ id: `c:${i.id}`, blockId: null, level: i.severity === 'error' ? 'fix' : 'improve', title: i.message, advice: i.guidance ?? 'Change the colour in Theme so text stands out from its background.', wcag: '1.4.3' });
  }

  return out.sort((a, b) => a.level === b.level ? 0 : a.level === 'fix' ? -1 : 1);
}

/** How many kinds of check ran, for the "N of M checks pass" line. */
export const CHECK_KINDS = ['Image descriptions', 'Headings', 'Button labels', 'Video titles and captions', 'Readable text', 'Colour contrast'] as const;

// ---- Page weight ---------------------------------------------------------------------------

export interface WeightItem {
  blockId: string;
  label: string;
  kb: number;
  /** True when the size is a guess (image hosted elsewhere). */
  guessed: boolean;
}

export interface PageWeight {
  totalKb: number;
  /** Media held back in data saver until tapped. */
  deferredKb: number;
  items: WeightItem[];
  seconds3g: number;
  seconds4g: number;
  /** Naira of mobile data for one visit, at an assumed ₦650 per GB. */
  dataNgn: number;
  rating: 'light' | 'ok' | 'heavy';
}

/** Page shell, fonts and code that every visit downloads (approximate). */
const BASE_KB = 140;
/** Guess for a photo hosted on another site. */
const REMOTE_KB = 180;
const NGN_PER_GB = 650;

function urlKb(url: string): {kb: number;guessed: boolean;} | null {
  if (!url) return null;
  if (url.startsWith('data:')) return { kb: Math.round((url.length - url.indexOf(',') - 1) * 0.75 / 1024), guessed: false };
  if (/^https?:/i.test(url)) return { kb: REMOTE_KB, guessed: true };
  return null;
}

export function pageWeight(blocks: Block[]): PageWeight {
  const items: WeightItem[] = [];
  let deferredKb = 0;
  const push = (b: Block, label: string, url: string) => {
    const s = urlKb(url);
    if (s) items.push({ blockId: b.id, label, kb: s.kb, guessed: s.guessed });
  };

  for (const b of blocks) {
    if (b.visibility?.hidden) continue;
    switch (b.type) {
      case 'profile':
        push(b, 'Profile photo', b.content.avatarUrl);
        break;
      case 'image':
        push(b, b.content.alt || 'Image', b.content.url);
        break;
      case 'gallery':
        b.content.images.forEach((i, n) => push(b, `${b.content.title || 'Gallery'} · photo ${n + 1}`, i.url));
        break;
      case 'product':
        push(b, b.content.name || 'Product photo', b.content.imageUrl);
        break;
      case 'productGrid':
        b.content.items.forEach((i) => push(b, i.name || 'Product photo', i.imageUrl));
        break;
      case 'portfolio':
        // Portfolio covers live in content.items on this block type.
        ((b.content as unknown as {items?: {coverUrl: string;title: string;}[];}).items ?? []).forEach((i) => push(b, i.title || 'Portfolio cover', i.coverUrl));
        break;
      case 'video':
        // Embedded players load only when tapped in data saver. Rough weights per kind.
        if (b.content.url) {
          const r = parseEmbed(b.content.url);
          if (r.ok) deferredKb += r.kind === 'video' ? 800 : r.kind === 'audio' ? 400 : 500;
        }
        break;
      default:
        break;
    }
  }

  const mediaKb = items.reduce((s, i) => s + i.kb, 0);
  const totalKb = BASE_KB + mediaKb;
  return {
    totalKb,
    deferredKb: deferredKb + mediaKb,
    items: items.sort((a, b) => b.kb - a.kb),
    // 3G ≈ 750 kbps ≈ 90 KB/s; 4G ≈ 6 Mbps ≈ 700 KB/s (typical Nigerian mobile speeds, not best case).
    seconds3g: Math.max(1, Math.round(totalKb / 90)),
    seconds4g: Math.max(1, Math.round(totalKb / 700 * 10) / 10),
    dataNgn: Math.max(1, Math.round(totalKb / (1024 * 1024) * NGN_PER_GB)),
    rating: totalKb < 1000 ? 'light' : totalKb < 3000 ? 'ok' : 'heavy'
  };
}

export function formatKb(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
}