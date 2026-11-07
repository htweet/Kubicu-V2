import { useEffect, type RefObject } from 'react';

/**
 * Phones only (under 768px): everything between the page's hero and its closing call to action
 * folds into rounded bars in each block's own colour, styled like the site header (D558, D559).
 * Tapping a bar opens that block and closes the one that was open.
 *
 * Works on the rendered page so every marketing, company and legal page gets it without edits:
 * - the hero is the first section or header in <main> holding an <h1>; it stays open;
 * - the closing call to action is marked `data-mbar-skip` (ClosingCta); it and anything after it stay open;
 * - every block in between is included. A block with an h2/h3 becomes a bar labelled with that heading.
 *   A block without a heading (a notice, a strip, a marquee) travels with the nearest bar before it
 *   (or the first bar, if it comes before any), showing only while that bar is open;
 * - wrappers that hold several sections are opened up, so their sections become separate bars.
 * Only attributes and CSS variables are set; no elements are added, so React's markup is untouched.
 * The look lives in index.css under "Mobile section bars".
 */

const PHONE = '(max-width: 767px)';
const BAR_ATTRS = ['data-mbar', 'data-mbar-title', 'data-mbar-tone', 'data-mbar-kind', 'role', 'tabindex', 'aria-expanded'];

type Rgb = [number, number, number];

export function useMobileSectionBars(rootRef: RefObject<HTMLElement>, routeKey: string) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined') return;
    const media = window.matchMedia(PHONE);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const followers = new Map<HTMLElement, HTMLElement[]>();
    let frame = 0;

    /** Blocks between the hero and the closing call to action, in page order. */
    const collectBlocks = (): HTMLElement[] => {
      const h1 = own(root, 'h1')[0];
      if (!h1) return [];
      // The hero is the section or header holding the h1; when there isn't one, the largest
      // wrapper around the h1 that holds no h2 (so its lead text and buttons stay with it) (D562).
      let hero: HTMLElement | null = h1.closest<HTMLElement>('section, header');
      if (!hero || !root.contains(hero)) {
        hero = h1;
        while (hero.parentElement && hero.parentElement !== root && !own(hero.parentElement, 'h2').length) hero = hero.parentElement;
      }
      const blocks: HTMLElement[] = [];
      let stopped = false;

      const visit = (el: HTMLElement) => {
        if (stopped) return;
        if (el.hasAttribute('data-mbar-skip')) {
          stopped = true;
          return;
        }
        // Already folded elements are forced visible by CSS, so only check fresh ones.
        if (!el.hasAttribute('data-mbar') && !el.hasAttribute('data-mbar-follow') && getComputedStyle(el).display === 'none') return;
        const isSection = el.tagName === 'SECTION';
        // Sections and headings inside page previews don't count (D563).
        const holdsSections = !isSection && own(el, 'section').length > 0;
        const holdsCta = own(el, '[data-mbar-skip]').length > 0;
        // A plain wrapper with several h2s is several blocks laid out flat (heading, then its content) (D562).
        const holdsSeveralHeadings = !isSection && own(el, 'h2').length > 1;
        if (holdsSections || holdsCta || holdsSeveralHeadings) {
          Array.from(el.children).forEach((c) => visit(c as HTMLElement));
          return;
        }
        blocks.push(el);
      };

      let node: HTMLElement | null = hero;
      while (node && node !== root && !stopped) {
        let sib = node.nextElementSibling as HTMLElement | null;
        while (sib && !stopped) {
          visit(sib);
          sib = sib.nextElementSibling as HTMLElement | null;
        }
        node = node.parentElement;
      }
      return blocks;
    };

    const clear = () => {
      root.querySelectorAll<HTMLElement>('[data-mbar]').forEach((s) => {
        if (s.dataset.mbarOwnLabel === undefined) s.removeAttribute('aria-label');
        BAR_ATTRS.forEach((a) => s.removeAttribute(a));
        s.style.removeProperty('--mbar-bg');
        s.style.removeProperty('--mbar-fg');
        delete s.dataset.mbarOwnLabel;
      });
      root.querySelectorAll<HTMLElement>('[data-mbar-follow]').forEach((f) => f.removeAttribute('data-mbar-follow'));
      followers.clear();
    };

    const setOpen = (s: HTMLElement, open: boolean) => {
      s.setAttribute('data-mbar', open ? 'open' : 'closed');
      s.setAttribute('aria-expanded', String(open));
      if (open) {
        s.removeAttribute('role');
        s.setAttribute('tabindex', '-1');
      } else {
        s.setAttribute('role', 'button');
        s.setAttribute('tabindex', '0');
      }
      followers.get(s)?.forEach((f) => f.setAttribute('data-mbar-follow', open ? 'open' : 'closed'));
      placeBar(s);
    };

    /**
     * Keeps the bar the same width open as folded (D566). Folded, a block has no margin or padding,
     * so its bar sits 12px in from the parent's content edges. Opened, the block gets its own margins
     * and padding back; these offsets pull the bar to the same place.
     */
    const placeBar = (s: HTMLElement) => {
      if (s.getAttribute('data-mbar') !== 'open' || !s.parentElement) {
        s.style.removeProperty('--mbar-l');
        s.style.removeProperty('--mbar-r');
        return;
      }
      const p = s.parentElement;
      const ps = getComputedStyle(p);
      const ss = getComputedStyle(s);
      const pr = p.getBoundingClientRect();
      const r = s.getBoundingClientRect();
      const columnLeft = pr.left + parseFloat(ps.borderLeftWidth) + parseFloat(ps.paddingLeft);
      const columnRight = pr.right - parseFloat(ps.borderRightWidth) - parseFloat(ps.paddingRight);
      const boxLeft = r.left + parseFloat(ss.borderLeftWidth);
      const boxRight = r.right - parseFloat(ss.borderRightWidth);
      s.style.setProperty('--mbar-l', `${Math.round(columnLeft - boxLeft + 12)}px`);
      s.style.setProperty('--mbar-r', `${Math.round(boxRight - columnRight + 12)}px`);
    };

    const enhance = () => {
      frame = 0;
      if (!media.matches) {
        clear();
        return;
      }
      const blocks = collectBlocks();
      const bars: HTMLElement[] = [];
      const pending: HTMLElement[] = [];
      followers.clear();
      // Rebuilt from scratch each pass (same frame, so nothing flashes); setOpen re-applies them.
      root.querySelectorAll<HTMLElement>('[data-mbar-follow]').forEach((f) => f.removeAttribute('data-mbar-follow'));
      const stale = new Set(root.querySelectorAll<HTMLElement>('[data-mbar]'));

      const makeBar = (b: HTMLElement, title: string) => {
        bars.push(b);
        stale.delete(b);
        followers.set(b, []);
        if (pending.length) followers.get(b)!.push(...pending.splice(0));
        // A bare h2/h3 laid out flat becomes the bar for the content after it; its own text is drawn by the bar (D562).
        if (b.matches('h2, h3')) b.setAttribute('data-mbar-kind', 'heading');
        else b.removeAttribute('data-mbar-kind');
        if (b.getAttribute('data-mbar-title') !== title) b.setAttribute('data-mbar-title', title);
        if (!b.hasAttribute('data-mbar')) {
          // Read the colour before folding, because a folded block's own background is cleared.
          // Blocks without their own colour get a warm light bar, so it still shows on the white page (D561).
          const own = blockColour(b);
          const bg = own && luminance(own) < 0.97 ? own : ([243, 239, 230] as Rgb);
          const dark = luminance(bg) < 0.4;
          b.style.setProperty('--mbar-bg', `rgb(${bg.join(' ')})`);
          b.style.setProperty('--mbar-fg', dark ? 'rgb(255 255 255)' : 'rgb(20 20 18)');
          b.setAttribute('data-mbar-tone', dark ? 'dark' : 'light');
          if (b.hasAttribute('aria-label')) b.dataset.mbarOwnLabel = '';
          setOpen(b, false);
        } else {
          setOpen(b, b.getAttribute('data-mbar') === 'open');
        }
        if (b.dataset.mbarOwnLabel === undefined) b.setAttribute('aria-label', title);
      };

      blocks.forEach((b) => {
        const title = headingText(b);
        if (!title) {
          const owner = bars[bars.length - 1];
          if (owner) followers.get(owner)!.push(b);
          else pending.push(b);
          return;
        }
        makeBar(b, title);
      });

      // Nothing skips folding (D562): headless blocks with no headed block to travel with become
      // bars of their own, labelled from their own words.
      if (!bars.length) {
        pending.splice(0).forEach((b) => {
          const title = fallbackLabel(b);
          if (title) makeBar(b, title);
        });
      }

      // Followers are collected after their bar is made, so their folded or open state is applied
      // here, once every bar's list is complete (D568). Before this, content laid out under a bare
      // heading — like Templates' "All templates" filters and grid — stayed visible until the bar was tapped.
      bars.forEach((b) => {
        const state = b.getAttribute('data-mbar') === 'open' ? 'open' : 'closed';
        followers.get(b)?.forEach((f) => f.setAttribute('data-mbar-follow', state));
      });

      // Blocks that are no longer between the hero and the call to action go back to normal.
      stale.forEach((s) => {
        if (s.dataset.mbarOwnLabel === undefined) s.removeAttribute('aria-label');
        BAR_ATTRS.forEach((a) => s.removeAttribute(a));
        s.style.removeProperty('--mbar-bg');
        s.style.removeProperty('--mbar-fg');
        delete s.dataset.mbarOwnLabel;
      });
      openFromHash();
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(enhance);
    };

    const openOnly = (target: HTMLElement, scroll: boolean) => {
      root.querySelectorAll<HTMLElement>('[data-mbar="open"]').forEach((s) => s !== target && setOpen(s, false));
      setOpen(target, true);
      if (scroll) {
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }
    };

    // Links to #a-section (legal contents, "On this page") open the block they point at.
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      let host = el.closest<HTMLElement>('[data-mbar]');
      if (!host) {
        const follower = el.closest<HTMLElement>('[data-mbar-follow]');
        host = follower ? Array.from(followers.entries()).find(([, list]) => list.includes(follower))?.[0] ?? null : null;
      }
      if (host && host.getAttribute('data-mbar') === 'closed') openOnly(host, true);
    };

    const onClick = (e: MouseEvent) => {
      if (!media.matches) return;
      const s = (e.target as HTMLElement).closest<HTMLElement>('[data-mbar]');
      if (!s || !root.contains(s)) return;
      if (s.getAttribute('data-mbar') === 'closed') {
        e.preventDefault();
        openOnly(s, true);
        return;
      }
      // An open block folds again only from its bar at the top, so taps on its content behave normally.
      if (e.target === s && e.clientY - s.getBoundingClientRect().top < 84) setOpen(s, false);
    };

    const onKey = (e: KeyboardEvent) => {
      const s = e.target as HTMLElement;
      if (!media.matches || !s.hasAttribute?.('data-mbar')) return;
      if ((e.key === 'Enter' || e.key === ' ') && s.getAttribute('data-mbar') === 'closed') {
        e.preventDefault();
        openOnly(s, false);
      } else if (e.key === 'Escape' && s.getAttribute('data-mbar') === 'open') {
        setOpen(s, false);
      }
    };

    // Re-check when the page's content or language changes; attribute writes above don't trigger this.
    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', openFromHash);
    media.addEventListener('change', schedule);
    schedule();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onKey);
      window.removeEventListener('hashchange', openFromHash);
      media.removeEventListener('change', schedule);
      clear();
    };
  }, [rootRef, routeKey]);
}

/**
 * Page previews and thumbnails render real pages (with their own h1s, h2s and sections) inside
 * the website. Those belong to the sample page, not this page's structure, so they're ignored:
 * anything inside `data-mbar-ignore` or an aria-hidden subtree (D563).
 */
const IGNORE = '[data-mbar-ignore], [aria-hidden="true"], [aria-hidden=""]';

function own(scope: Element, selector: string): HTMLElement[] {
  return Array.from(scope.querySelectorAll<HTMLElement>(selector)).filter((n) => {
    const ignored = n.closest(IGNORE);
    return !ignored || !scope.contains(ignored);
  });
}

/**
 * The block's first h2/h3 as a reader hears it: text inside aria-hidden parts is skipped,
 * so animated headlines (a screen-reader copy plus a hidden word-by-word copy) aren't doubled.
 */
function headingText(block: HTMLElement): string {
  const h = block.matches('h2, h3') ? block : own(block, 'h2, h3')[0];
  if (!h) return '';
  const clone = h.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[aria-hidden="true"], [aria-hidden=""]').forEach((n) => n.remove());
  const text = (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
  return text || (h.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** A label for a block with no h2/h3: any lower heading, its accessible name, a legend, else its first words (D562). */
function fallbackLabel(block: HTMLElement): string {
  const tidy = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
  const heading = own(block, 'h4, h5, h6, legend, [role="heading"]')[0];
  if (heading && tidy(heading.textContent)) return tidy(heading.textContent);
  const named = tidy(block.getAttribute('aria-label'));
  if (named) return named;
  const labelledBy = block.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = tidy(document.getElementById(labelledBy.split(' ')[0])?.textContent);
    if (text) return text;
  }
  const clone = block.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[aria-hidden="true"], [aria-hidden=""], .sr-only, script, style').forEach((n) => n.remove());
  const words = tidy(clone.textContent);
  return words.length > 60 ? `${words.slice(0, 57).trimEnd()}…` : words;
}

/** The block's own background, else its first child's (some blocks paint an inner wrapper). None → white, like the header. */
function blockColour(s: HTMLElement): Rgb | null {
  for (const el of [s, s.firstElementChild as HTMLElement | null]) {
    if (!el) continue;
    const c = parseColour(getComputedStyle(el).backgroundColor);
    if (c) return c;
  }
  return null;
}

function parseColour(value: string): Rgb | null {
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length >= 4 && parts[3] < 0.5) return null;
  return [Math.round(parts[0]), Math.round(parts[1]), Math.round(parts[2])];
}

function luminance([r, g, b]: Rgb): number {
  const ch = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}
