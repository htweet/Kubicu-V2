import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface PreviewFrameProps {
  /** Viewport width the content is laid out at, in CSS pixels. */
  width: number;
  /** Viewport height. The page scrolls inside it, like a real screen (D196b). */
  height: number;
  title: string;
  children: React.ReactNode;
}

/**
 * Renders children inside a same-origin iframe of a real width, so the page's own responsive rules
 * (Tailwind md:/lg: breakpoints) respond to the preview size, not the browser window (D196a).
 * The frame has a fixed screen height and scrolls inside, so a long shop never makes the settings page long.
 * Links and buttons inside are disabled — it's a picture of what shoppers get, not a second shop.
 * The app's stylesheets and fonts are mirrored in, including ones added later.
 */
export function PreviewFrame({ width, height, title, children }: PreviewFrameProps) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const frame = ref.current;
    const doc = frame?.contentDocument;
    if (!frame || !doc) return;
    doc.open();
    doc.write('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
    doc.close();
    Array.from(document.documentElement.attributes).forEach((a) => doc.documentElement.setAttribute(a.name, a.value));
    const isStyle = (n: Node): n is HTMLElement => n instanceof HTMLStyleElement || n instanceof HTMLLinkElement && (n.rel === 'stylesheet' || n.rel === 'preconnect');
    document.head.querySelectorAll('style, link[rel="stylesheet"], link[rel="preconnect"]').forEach((n) => doc.head.appendChild(n.cloneNode(true)));
    const own = doc.createElement('style');
    own.textContent = 'html{scrollbar-width:thin;overscroll-behavior:contain}body{margin:0;background:transparent}a,button,input,select,label{cursor:default!important}';
    doc.head.appendChild(own);
    // Theme fonts and dev-time style updates are added to the app's <head> later; mirror them.
    const mo = new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => isStyle(n) && doc.head.appendChild(n.cloneNode(true)))));
    mo.observe(document.head, { childList: true });
    // Swallow clicks, submits and typing before React sees them: scrolling works, nothing navigates or changes.
    const block = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const blocked = ['click', 'submit', 'keydown', 'input', 'change', 'pointerdown', 'mousedown'] as const;
    blocked.forEach((t) => doc.addEventListener(t, block, true));
    setMount(doc.body);
    return () => {
      mo.disconnect();
      blocked.forEach((t) => doc.removeEventListener(t, block, true));
    };
  }, []);

  return (
    <>
      <iframe ref={ref} title={title} tabIndex={-1} aria-hidden className="block border-0" style={{ width, height }} />
      {mount && createPortal(children, mount)}
    </>);

}