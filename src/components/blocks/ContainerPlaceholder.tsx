import React from 'react';
import type { PageTheme } from '../../types/page';
import type { ContainerType } from '../../utils/containers';
import { cardRadius, mix } from './pageStyle';

/** The shape of an empty container (D167): used in the picker's mini previews and inside empty containers on the canvas. */
export function ContainerPlaceholder({ kind, theme, hint }: {kind: ContainerType;theme: PageTheme;hint?: string;}) {
  const r = Math.max(cardRadius(theme) - 4, 6);
  const box = { borderRadius: r, border: `1.5px dashed ${mix(theme.text, 22)}`, background: mix(theme.text, 3) };
  return (
    <div className="flex flex-col gap-2">
      {kind === 'tabs' &&
      <div className="flex gap-4 pb-1" style={{ borderBottom: `1px solid ${mix(theme.text, 14)}` }} aria-hidden>
          {[0, 1, 2].map((i) =>
        <span key={i} className="h-2 w-12 rounded-full" style={{ background: mix(theme.text, i === 0 ? 40 : 14) }} />
        )}
        </div>
      }
      <div className={kind === 'columns' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-2'} aria-hidden>
        {(kind === 'section' ? [0, 1] : kind === 'columns' ? [0, 1] : [0]).map((i) =>
        <div key={i} className="h-16" style={box} />
        )}
      </div>
      {hint &&
      <p className="text-center text-[12px]" style={{ color: theme.mutedText }}>
          {hint}
        </p>
      }
    </div>);

}