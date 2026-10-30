import React from 'react';
import type { PageTheme } from '../../types/page';
import { useT } from '../../contexts/LocaleContext';
import { VisitorLanguageMenu } from './VisitorLanguageMenu';

/** Top-right language picker for visitor pages outside the main page (order, booking, ticket, pay…) (D298). */
export function VisitorLanguageRow({ theme }: {theme: PageTheme;}) {
  const { setLang } = useT();
  if (!setLang) return null;
  return (
    <div className="mx-auto flex w-full max-w-[560px] justify-end px-5 pt-4 text-[12.5px] font-medium" style={{ color: theme.mutedText }}>
      <VisitorLanguageMenu theme={theme} variant="inline" side="bottom" align="end" />
    </div>);

}