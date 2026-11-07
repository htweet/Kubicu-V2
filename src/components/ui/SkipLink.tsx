import React from 'react';

/** "Skip to content" — the first Tab stop on every surface (WCAG 2.4.1, D76). Target must have the id and tabIndex={-1}. */
export function SkipLink({ target = 'main-content', label = 'Skip to content' }: { target?: string; label?: string }) {
  return (
    <a
      href={`#${target}`}
      onClick={(e) => {
        const el = document.getElementById(target);
        if (!el) return;
        e.preventDefault();
        el.focus({ preventScroll: false });
        el.scrollIntoView({ block: 'start' });
      }}
      className="sr-only z-[200] rounded-md bg-inverse px-4 py-2.5 text-label font-semibold text-fg-inverse shadow-3 focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
    >
      {label}
    </a>
  );
}
