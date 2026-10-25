import React from 'react';
import { Link } from 'react-router-dom';
import type { ExamplePage } from '../../data/examples/build';
import { TemplateThumb } from './TemplateThumb';
import { formatNaira as formatNgn } from '../../utils/currency';

interface ArtworkCollectionProps {
  templates: ExamplePage[];
  hrefFor: (e: ExamplePage) => string;
  /** In the app, open the preview sheet instead of navigating. */
  onOpen?: (e: ExamplePage) => void;
}

/** Artwork collection (D158): classic single-column pages, each over its own AI-generated background artwork. */
export function ArtworkCollection({ templates, hrefFor, onOpen }: ArtworkCollectionProps) {
  const list = templates.filter((t) => t.artwork);
  if (list.length === 0) return null;
  const open = (t: ExamplePage) => (ev: React.MouseEvent) => {
    if (!onOpen) return;
    ev.preventDefault();
    onOpen(t);
  };
  return (
    <section aria-labelledby="artwork-title" className="mt-14">
      <div className="max-w-xl">
        <h2 id="artwork-title" className="font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] text-fg md:text-[32px]">
          Artwork collection
        </h2>
        <p className="mt-2 text-label text-fg-muted">
          The familiar one-column page — profile, links, forms — set over an original background artwork. Keep the art and change everything else. Up to {formatNgn(3000)}, paid once per workspace (example prices).
        </p>
      </div>
      <ul className="scroll-quiet -mx-1 mt-8 flex snap-x gap-5 overflow-x-auto px-1 pb-3">
        {list.map((t) =>
        <li key={t.id} className="flex w-[200px] shrink-0 snap-start flex-col">
            <Link to={hrefFor(t)} onClick={open(t)} className="group block rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              <span className="block transition-transform duration-150 ease-out group-hover:-translate-y-0.5">
                <TemplateThumb doc={t.doc} width={200} height={360} />
              </span>
            </Link>
            <div className="mt-3 flex items-start justify-between gap-2">
              <Link to={hrefFor(t)} onClick={open(t)} className="min-w-0 truncate text-label font-semibold text-fg hover:underline">
                {t.name}
              </Link>
              <span className="shrink-0 text-label font-semibold tabular-nums text-fg">{formatNgn(t.artwork!.priceNgn)}</span>
            </div>
            <p className="mt-0.5 truncate text-caption text-fg-subtle">{t.artwork!.art} · {t.bestFor}</p>
          </li>
        )}
      </ul>
    </section>);

}