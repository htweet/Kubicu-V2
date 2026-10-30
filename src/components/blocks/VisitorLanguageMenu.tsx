import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckIcon, ChevronDownIcon, LanguagesIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import { useT } from '../../contexts/LocaleContext';
import { uiLanguages, type UiLang } from '../../data/translations';
import { inputRadius, mix } from './pageStyle';

const codes: Record<UiLang, string> = { en: 'EN', pcm: 'PCM', yo: 'YO', ha: 'HA', ig: 'IG' };

interface VisitorLanguageMenuProps {
  theme: PageTheme;
  /** inline: a quiet footer link · field: the Language switch block's full-width control. */
  variant: 'inline' | 'field';
  /** Field label, already chosen by the owner. */
  label?: string;
  /** In the editor the block is shown but can't change anything. */
  disabled?: boolean;
  side?: 'top' | 'bottom';
  /** center: under the middle of the trigger · end: right edges line up (for triggers near the screen edge). */
  align?: 'center' | 'end';
}

/**
 * The visitor's language picker on public pages (D298), painted in the page's own theme so it never
 * looks like KUBICU's app inside someone's page. Changes buttons and labels only; the owner's words stay.
 */
export function VisitorLanguageMenu({ theme, variant, label, disabled, side = 'top', align = 'center' }: VisitorLanguageMenuProps) {
  const { t, lang, setLang } = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listId = useId();
  const reduce = useReducedMotion();
  const current = uiLanguages.find((l) => l.value === lang) ?? uiLanguages[0];
  const radius = Math.min(inputRadius(theme), 16);
  const shiftX = align === 'end' ? '0%' : '-50%';

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    optionRefs.current[Math.max(0, uiLanguages.findIndex((l) => l.value === lang))]?.focus();
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, lang]);

  const choose = (value: UiLang) => {
    setLang?.(value);
    setOpen(false);
  };

  const onOptionKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'Tab') return setOpen(false);
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const n = uiLanguages.length;
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
    optionRefs.current[next]?.focus();
  };

  const inactive = disabled || !setLang;

  return (
    <div ref={rootRef} className={variant === 'field' ? 'relative w-full max-w-[16rem]' : 'relative inline-flex'}>
      {variant === 'inline' ?
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${t('Language')}: ${current.native}`}
        disabled={inactive}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded px-1 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2">
        
          <LanguagesIcon size={12} aria-hidden />
          {current.native}
          <ChevronDownIcon size={11} aria-hidden className={open ? 'rotate-180 transition-transform duration-150' : 'transition-transform duration-150'} />
        </button> :

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label || t('Language')}: ${current.native}`}
        disabled={inactive}
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-full items-center gap-3 px-3 text-left text-[15px] font-medium focus-visible:outline-none focus-visible:ring-2 disabled:cursor-default"
        style={{ background: theme.background, color: theme.text, borderRadius: inputRadius(theme), border: `1px solid ${mix(theme.text, 18)}` }}>
        
          <Code code={codes[current.value]} theme={theme} />
          <span className="min-w-0 flex-1 truncate">{current.native}</span>
          <ChevronDownIcon size={16} aria-hidden style={{ color: theme.mutedText }} className={open ? 'rotate-180 transition-transform duration-150' : 'transition-transform duration-150'} />
        </button>
      }

      <AnimatePresence>
        {open &&
        <motion.div
          id={listId}
          role="listbox"
          aria-label={t('Language')}
          initial={reduce ? { opacity: 0, x: shiftX } : { opacity: 0, x: shiftX, scale: 0.96, y: side === 'top' ? 4 : -4 }}
          animate={{ opacity: 1, x: shiftX, scale: 1, y: 0 }}
          exit={{ opacity: 0, x: shiftX, scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className={[
          'absolute z-50 w-[232px] max-w-[calc(100vw-24px)] p-1.5',
          align === 'end' ? 'right-0' : 'left-1/2',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          side === 'top' ? align === 'end' ? 'origin-bottom-right' : 'origin-bottom' : align === 'end' ? 'origin-top-right' : 'origin-top'].
          join(' ')}
          style={{
            // Glass themes have see-through cards; the menu needs a solid face to stay readable.
            background: theme.material?.surfaceFinish === 'glass' ? theme.background : theme.surface,
            color: theme.text,
            borderRadius: radius + 4,
            border: `1px solid ${mix(theme.text, 12)}`,
            boxShadow: `0 18px 40px -18px ${mix('#000', 45)}, 0 2px 6px ${mix('#000', 8)}`
          }}>
          
            {uiLanguages.map((l, i) => {
            const selected = l.value === lang;
            return (
              <button
                key={l.value}
                ref={(el) => optionRefs.current[i] = el}
                type="button"
                role="option"
                aria-selected={selected}
                lang={l.value}
                onKeyDown={(e) => onOptionKey(e, i)}
                onClick={() => choose(l.value)}
                className="flex w-full items-center gap-2.5 px-2 py-2 text-left transition-colors duration-100 focus-visible:outline-none"
                style={{ borderRadius: radius, background: selected ? mix(theme.accent, 12) : undefined }}
                onMouseEnter={(e) => !selected && (e.currentTarget.style.background = mix(theme.text, 6))}
                onMouseLeave={(e) => !selected && (e.currentTarget.style.background = '')}
                onFocus={(e) => !selected && (e.currentTarget.style.background = mix(theme.text, 6))}
                onBlur={(e) => !selected && (e.currentTarget.style.background = '')}>
                
                  <Code code={codes[l.value]} theme={theme} active={selected} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold leading-tight">{l.native}</span>
                    {l.label !== l.native &&
                  <span className="block text-[12px] leading-tight" style={{ color: theme.mutedText }}>
                        {l.label}
                      </span>
                  }
                  </span>
                  {selected && <CheckIcon size={15} strokeWidth={2.5} aria-hidden style={{ color: theme.accent }} />}
                </button>);

          })}
            <p className="mx-2 mt-1 border-t pt-2 text-[11px] leading-snug" style={{ color: theme.mutedText, borderColor: mix(theme.text, 10) }}>
              {t('Changes buttons and labels. Page text stays as written.')}
            </p>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}

function Code({ code, theme, active }: {code: string;theme: PageTheme;active?: boolean;}) {
  return (
    <span
      aria-hidden
      className="inline-flex h-6 min-w-[30px] shrink-0 items-center justify-center rounded-md px-1 text-[10px] font-bold tracking-wide"
      style={active ? { background: theme.accent, color: theme.accentText } : { background: mix(theme.text, 8), color: theme.mutedText }}>
      
      {code}
    </span>);

}