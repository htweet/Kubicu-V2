import React from 'react';
import { toast } from 'sonner';
import { ChevronDownIcon, ChevronsUpDownIcon } from 'lucide-react';
import type { LanguageId } from '../../types/account';
import { languageOptions } from '../../data/accountOptions';
import { updateAccount, useAccount } from '../../utils/account/store';
import { toUiLang, translatorFor, useT } from '../../contexts/LocaleContext';
import type { SideTip } from '../../hooks/useSideTip';
import { Menu, type MenuItem } from './Menu';
import { fieldControlClass } from './Field';
import { cn } from '../../utils/cn';

type Variant = 'row' | 'pill' | 'compact' | 'field' | 'site';

interface LanguagePickerProps {
  /**
   * row: sidebar row (full width, or a badge when collapsed) · pill: signed-out pages ·
   * compact: toolbars (code only) · field: a form control in Preferences.
   */
  variant: Variant;
  collapsed?: boolean;
  tip?: SideTip;
  side?: 'top' | 'bottom';
  align?: 'start' | 'end';
  /** Field variant only: id so a label can point at it. */
  id?: string;
  /** Site variant: fill the width (phone menu). */
  stretch?: boolean;
}

/** Short code shown on the badge. */
const codes: Partial<Record<LanguageId, string>> = { 'en-NG': 'EN', 'en-GB': 'EN', pcm: 'PCM', yo: 'YO', ha: 'HA', ig: 'IG', fr: 'FR' };
/** The language's own name first, then the English name underneath. */
const names: Partial<Record<LanguageId, {native: string;english: string;}>> = {
  'en-NG': { native: 'English', english: 'Nigeria' },
  'en-GB': { native: 'English', english: 'United Kingdom' },
  pcm: { native: 'Naijá', english: 'Nigerian Pidgin' },
  yo: { native: 'Yorùbá', english: 'Yoruba' },
  ha: { native: 'Hausa', english: 'Hausa' },
  ig: { native: 'Igbo', english: 'Igbo' },
  fr: { native: 'Français', english: 'French' }
};

/**
 * One language picker for the whole signed-in and signed-out app (D298). It writes the device-wide
 * account preference, so the choice follows the person from sign-in into every workspace and the editor.
 * Visitors to a public page still choose their own language from that page.
 */
export function LanguagePicker({ variant, collapsed, tip, side = 'bottom', align = 'end', id, stretch }: LanguagePickerProps) {
  const { t } = useT();
  const account = useAccount();
  const current = account.prefs.language;
  const regions = variant === 'field';
  // Outside Preferences, the two Englishes read as one "English" and French (not ready) is left out.
  const options = languageOptions.filter((o) => regions ? true : (o.ready || o.draft) && o.value !== 'en-GB');
  const shown: LanguageId = !regions && current === 'en-GB' ? 'en-NG' : current;
  const active = names[shown] ?? names['en-NG']!;
  const activeDraft = !!languageOptions.find((o) => o.value === shown)?.draft;
  const code = codes[shown] ?? 'EN';

  const choose = (language: LanguageId) => {
    // Keep a UK English choice when someone simply re-picks "English".
    const next = !regions && language === 'en-NG' && current === 'en-GB' ? 'en-GB' : language;
    if (next === current) return;
    if (updateAccount((a) => ({ ...a, prefs: { ...a.prefs, language: next } }))) toast.success(translatorFor(toUiLang(next))('Language saved'));
  };

  const items: MenuItem[] = options.map((o) => {
    const n = names[o.value] ?? { native: o.label, english: '' };
    const comingSoon = !o.ready && !o.draft;
    const sub = [regions || o.value !== 'en-NG' ? t(n.english) : '', o.draft ? t('Draft') : '', comingSoon ? t('Coming later') : ''].filter(Boolean).join(' · ');
    return {
      id: o.value,
      label: n.native,
      reason: sub || undefined,
      leading: <CodeBadge code={codes[o.value] ?? ''} active={o.value === shown} />,
      selected: o.value === shown,
      disabled: comingSoon,
      onSelect: () => choose(o.value)
    };
  });

  const header =
  <div className="max-w-[260px]">
      <p className="text-caption font-semibold text-fg">{t('Language')}</p>
      <p className="mt-0.5 text-caption leading-snug text-fg-subtle">{t('Drafts haven’t been checked by a native speaker yet. Anything not translated stays in English.')}</p>
    </div>;


  const label = `${t('Language')}: ${active.native}`;

  return (
    <Menu
      side={side}
      align={align}
      header={header}
      items={items}
      className={variant === 'row' ? collapsed ? 'mx-auto' : 'w-full' : variant === 'field' || stretch ? 'w-full' : undefined}
      trigger={(props) => {
        if (variant === 'row')
        return (
          <button
            type="button"
            {...props}
            aria-label={label}
            onMouseEnter={collapsed ? tip?.show(label) : undefined}
            onMouseLeave={tip?.hide}
            className={cn(
              'flex h-10 items-center gap-3 rounded-md text-label transition-colors duration-150 hover:bg-sunken',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              collapsed ? 'w-10 justify-center' : 'w-full px-2'
            )}>
            
              <CodeBadge code={code} />
              {!collapsed &&
            <>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block truncate font-medium text-fg">{active.native}</span>
                    {activeDraft && <span className="block truncate text-caption text-fg-subtle">{t('Draft translation')}</span>}
                  </span>
                  <ChevronsUpDownIcon size={14} className="shrink-0 text-fg-subtle" aria-hidden />
                </>
            }
            </button>);

        if (variant === 'pill')
        return (
          <button
            type="button"
            {...props}
            aria-label={label}
            className="group inline-flex h-9 items-center gap-2 rounded-full border border-line bg-raised pl-1.5 pr-3 text-caption font-medium text-fg transition-colors duration-150 hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
              <CodeBadge code={code} round />
              <span className="whitespace-nowrap">{active.native}</span>
              <ChevronDownIcon size={14} className="text-fg-subtle transition-transform duration-150 group-aria-expanded:rotate-180" aria-hidden />
            </button>);

        if (variant === 'site')
          // Marketing header (D298): matches the cream "Log in" pill on the white bar.
          return (
            <button
              type="button"
              {...props}
              aria-label={label}
              className={cn(
                'group inline-flex h-12 items-center gap-2 rounded-full bg-[rgb(238_233_221)] pl-2 pr-4 text-[15px] font-semibold text-[rgb(20_20_18)] transition-colors duration-150 hover:bg-[rgb(224_217_202)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                stretch && 'w-full justify-center'
              )}>
              
              <span aria-hidden className="inline-flex h-8 min-w-[34px] items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold tracking-wide">
                {code}
              </span>
              {/* Name only where the header has room; the code badge carries it otherwise. */}
              <span className={cn('whitespace-nowrap', !stretch && 'hidden xl:inline')}>{active.native}</span>
              <ChevronDownIcon size={15} className="transition-transform duration-150 group-aria-expanded:rotate-180" aria-hidden />
            </button>);

        if (variant === 'compact')
        return (
          <button
            type="button"
            {...props}
            aria-label={label}
            title={label}
            className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-caption font-semibold tracking-wide text-fg-muted transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
              {code}
              <ChevronDownIcon size={13} aria-hidden />
            </button>);

        return (
          <button type="button" id={id} {...props} className={cn(fieldControlClass, 'flex h-10 items-center gap-2.5 pl-2 text-left')}>
            <CodeBadge code={code} />
            <span className="min-w-0 flex-1 truncate">
              {active.native}
              {regions && <span className="text-fg-subtle"> · {t(active.english)}</span>}
              {activeDraft && <span className="text-fg-subtle"> · {t('Draft')}</span>}
            </span>
            <ChevronDownIcon size={16} className="shrink-0 text-fg-subtle" aria-hidden />
          </button>);

      }} />);


}

function CodeBadge({ code, active, round }: {code: string;active?: boolean;round?: boolean;}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex h-6 min-w-[28px] shrink-0 items-center justify-center px-1 text-[10px] font-bold tracking-wide tabular-nums',
        round ? 'rounded-full' : 'rounded-[6px]',
        active ? 'bg-action text-action-fg' : 'bg-sunken text-fg-muted'
      )}>
      
      {code}
    </span>);

}