import React from 'react';
import { LanguagesIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { useT } from '../../contexts/LocaleContext';
import { VisitorLanguageMenu } from './VisitorLanguageMenu';

/**
 * Language switch (D170): changes the page's buttons, labels and messages for this visitor (remembered on
 * their device). Your own words stay as you wrote them — the switch says so. Themed picker since D298.
 */
export function LanguageSwitchBlock({ block, theme, mode }: BlockProps<'languageSwitch'>) {
  const { t, setLang } = useT();
  const live = mode === 'live' && !!setLang;
  const label = block.content.label || t('Language');
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: theme.mutedText }}>
        <LanguagesIcon size={14} aria-hidden /> {label}
      </p>
      <VisitorLanguageMenu theme={theme} variant="field" label={label} disabled={!live} side="bottom" />
    </div>
  );
}
