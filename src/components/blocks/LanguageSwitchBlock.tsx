import React from 'react';
import { ChevronDownIcon, LanguagesIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { useT } from '../../contexts/LocaleContext';
import { uiLanguages, type UiLang } from '../../data/translations';
import { inputStyle } from './pageStyle';

/**
 * Language switch (D170): changes the page's buttons, labels and messages for this visitor (remembered on
 * their device). Your own words stay as you wrote them — the switch says so.
 */
export function LanguageSwitchBlock({ block, theme, mode }: BlockProps<'languageSwitch'>) {
  const { lang, setLang } = useT();
  const id = `${block.id}-lang`;
  const live = mode === 'live' && !!setLang;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <label htmlFor={id} className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: theme.mutedText }}>
        <LanguagesIcon size={14} aria-hidden /> {block.content.label || 'Language'}
      </label>
      <div className="relative w-full max-w-[16rem]">
        <select id={id} value={lang} disabled={!live} onChange={(e) => setLang?.(e.target.value as UiLang)} className="h-12 w-full appearance-none px-4 pr-10 text-[15px] font-medium" style={inputStyle(theme)}>
          {uiLanguages.map((l) =>
          <option key={l.value} value={l.value} lang={l.value}>
              {l.native}
            </option>
          )}
        </select>
        <ChevronDownIcon size={16} aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" style={{ color: theme.mutedText }} />
      </div>
      <p className="text-center text-[11.5px]" style={{ color: theme.mutedText }}>Changes buttons and labels. Page text stays as written.</p>
    </div>);

}