import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ViewportFrameProps {
  title: string;
  height: number;
  background: string;
  children: React.ReactNode;
}

const SHELL = '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body></body></html>';

/**
 * Renders children inside a real iframe (D158) so the page's responsive rules respond to the preview's
 * width — a phone preview on a desktop screen gets the true phone layout, not a squeezed desktop one.
 * The app's styles are mirrored into the frame and kept in sync.
 */
export function ViewportFrame({ title, height, background, children }: ViewportFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null);

  const setup = useCallback(() => {
    const doc = ref.current?.contentDocument;
    if (!doc?.body) return;
    const sync = () => {
      doc.head.querySelectorAll('[data-kb-mirror]').forEach((n) => n.remove());
      document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((n) => {
        const copy = n.cloneNode(true) as HTMLElement;
        copy.setAttribute('data-kb-mirror', '');
        doc.head.appendChild(copy);
      });
    };
    sync();
    doc.body.style.margin = '0';
    doc.body.style.background = background;
    const observer = new MutationObserver(sync);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    (ref.current as HTMLIFrameElement & { _kbObserver?: MutationObserver })._kbObserver?.disconnect();
    (ref.current as HTMLIFrameElement & { _kbObserver?: MutationObserver })._kbObserver = observer;
    setMount(doc.body);
  }, [background]);

  useEffect(() => {
    const frame = ref.current as (HTMLIFrameElement & { _kbObserver?: MutationObserver }) | null;
    // Some browsers have the document ready before onLoad fires.
    if (frame?.contentDocument?.readyState === 'complete' && frame.contentDocument.body) setup();
    return () => frame?._kbObserver?.disconnect();
  }, [setup]);

  return (
    <iframe ref={ref} title={title} srcDoc={SHELL} onLoad={setup} className="block w-full border-0" style={{ height, background }}>
      {mount && createPortal(children, mount)}
    </iframe>
  );
}
