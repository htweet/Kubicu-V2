import React from 'react';
import type { PageTheme, RenderMode } from '../../types/page';
import { mix } from './pageStyle';

export function MadeWithKubicu({ theme, mode }: {theme: PageTheme;mode: RenderMode;}) {
  const content =
  <>
      <span aria-hidden className="inline-block h-2 w-2 rounded-[2px]" style={{ background: theme.text }} />
      Made with KUBICU
    </>;

  const cls = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium';
  const style = { color: theme.mutedText, border: `1px solid ${mix(theme.text, 10)}` };
  return (
    <div className="flex justify-center pb-10">
      {mode === 'live' ?
      <a href="/" className={cls} style={style}>
          {content}
        </a> :

      <span className={cls} style={style}>
          {content}
        </span>
      }
    </div>);

}