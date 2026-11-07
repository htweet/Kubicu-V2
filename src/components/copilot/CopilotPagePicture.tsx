import React from 'react';
import type { PageDocument } from '../../types/page';
import { useT } from '../../contexts/LocaleContext';
import { TemplateThumb } from '../templates/TemplateThumb';

interface Props {
  doc: PageDocument;
  /** Width of the whole picture in px; height follows a 4:5 ratio, like the image sent in chat. */
  width?: number;
}

/**
 * The picture of a draft sent in the chat (D263): the page's first screen on a phone, on a quiet backdrop.
 * In production this is a PNG rendered on a server from the same page document; here it's drawn live. Translated in D339.
 */
export function CopilotPagePicture({ doc, width = 240 }: Props) {
  const { t: tr } = useT();
  const height = Math.round((width * 5) / 4);
  const phoneW = Math.round(width * 0.56);
  const phoneH = Math.round(phoneW * 2.05);
  return (
    <div
      role="img"
      aria-label={tr('Picture of the draft page “{title}” on a phone', { title: doc.title })}
      className="relative flex items-end justify-center overflow-hidden"
      style={{ width, height, background: 'rgb(238 235 228)' }}
    >
      <div
        className="relative mb-[-28px] overflow-hidden rounded-[22px] border-[5px] border-[rgb(24_24_22)] bg-[rgb(24_24_22)]"
        style={{ width: phoneW, height: phoneH, boxShadow: '0 18px 40px -18px rgb(0 0 0 / 0.45)' }}
      >
        <div aria-hidden className="pointer-events-none overflow-hidden rounded-[17px]">
          <TemplateThumb doc={doc} width={phoneW - 10} height={phoneH - 10} />
        </div>
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[rgb(40_40_36)]">{tr('Draft · not published')}</span>
    </div>
  );
}
