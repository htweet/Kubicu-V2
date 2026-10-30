import React from 'react';
import { GlobeIcon } from 'lucide-react';
import type { LanguageId } from '../../types/account';
import { languageOptions } from '../../data/accountOptions';
import { updateAccount, useAccount } from '../../utils/account/store';
import { useT } from '../../contexts/LocaleContext';

/** Choose the interface language before signing in; it's saved as the account preference. */
export function AuthLanguagePicker() {
  const { t } = useT();
  const account = useAccount();
  const options = languageOptions.filter((o) => o.ready || o.draft).filter((o) => o.value !== 'en-GB');
  const value = account.prefs.language === 'en-GB' ? 'en-NG' : account.prefs.language;
  return (
    <label className="relative inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-raised pl-3 pr-2 text-caption font-medium text-fg-muted transition-colors duration-150 focus-within:ring-2 focus-within:ring-focus hover:border-line-strong">
      <GlobeIcon size={14} aria-hidden />
      <span className="sr-only">{t('Language')}</span>
      <select
        value={value}
        onChange={(e) => updateAccount((a) => ({ ...a, prefs: { ...a.prefs, language: e.target.value as LanguageId } }))}
        className="cursor-pointer appearance-none bg-transparent pr-1 text-caption font-medium text-fg focus:outline-none">
        
        {options.map((o) =>
        <option key={o.value} value={o.value}>
            {o.value === 'en-NG' ? 'English' : o.label}
            {o.draft ? ` (${t('draft')})` : ''}
          </option>
        )}
      </select>
    </label>);

}