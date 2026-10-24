import React from 'react';
import type { PageTheme } from '../../types/page';
import { mix } from '../blocks/pageStyle';
import { useT } from '../../contexts/LocaleContext';

interface WatermarkPreviewProps {
  theme: PageTheme;
  kind: 'pdf' | 'image';
  label: string;
  title: string;
}

/**
 * What the buyer's copy carries (D136): a faint diagonal mark across the page plus a footer line
 * on PDFs, or a tiled mark over images. Drawn here as a preview — the prototype stores no files.
 */
export function WatermarkPreview({ theme: t, kind, label, title }: WatermarkPreviewProps) {
  const { t: tr } = useT();
  const ink = mix(t.text, 9);
  return (
    <figure className="flex flex-col gap-1.5">
      <div
        aria-hidden
        className="relative mx-auto w-full max-w-[260px] overflow-hidden rounded-sm"
        style={{ aspectRatio: kind === 'pdf' ? '1 / 1.3' : '4 / 3', background: kind === 'pdf' ? '#ffffff' : mix(t.text, 14), border: `1px solid ${mix(t.text, 14)}` }}>
        
        {kind === 'pdf' ?
        <>
            <div className="flex flex-col gap-1.5 p-4">
              <span className="mb-1 block truncate text-[10px] font-semibold text-[#1a1a1a]">{title}</span>
              {[92, 100, 86, 97, 74, 100, 90, 68, 95, 82].map((w, i) =>
            <span key={i} className="block h-[3px] rounded-full bg-[#1a1a1a]/15" style={{ width: `${w}%` }} />
            )}
            </div>
            <span className="absolute left-1/2 top-1/2 w-[160%] -translate-x-1/2 -translate-y-1/2 -rotate-[32deg] text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1a1a1a]/[0.12]">
              {label.split(' · ')[0]}
            </span>
            <span className="absolute inset-x-0 bottom-0 truncate border-t border-[#1a1a1a]/10 bg-white px-2 py-1 text-[7.5px] text-[#1a1a1a]/70">{label} · Not for resale</span>
          </> :

        <div className="absolute inset-[-40%] flex -rotate-[28deg] flex-col justify-center gap-5">
            {Array.from({ length: 7 }).map((_, r) =>
          <span key={r} className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ color: ink, marginLeft: r % 2 ? 40 : 0 }}>
                {`${label.split(' · ')[0]} · ${label.split(' · ').pop()}   `.repeat(4)}
              </span>
          )}
          </div>
        }
      </div>
      <figcaption className="text-center text-[11.5px]" style={{ color: t.mutedText }}>
        {tr(kind === 'pdf' ? 'Preview of your first page' : 'Preview of the mark on your image')}
      </figcaption>
    </figure>);

}