import React, { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, BotMessageSquareIcon, SearchIcon } from 'lucide-react';
import type { FaqItem } from '../../types/page';
import type { BlockProps } from './blockProps';
import { useT } from '../../contexts/LocaleContext';
import { approvedFacts, matchFaq, type FaqMatch } from '../../utils/faqMatch';
import { BlockPlaceholder } from './BlockPlaceholder';
import { buttonRadius, buttonStyle, cardStyle, fontsFor, mix } from './pageStyle';

interface Asked {
  query: string;
  result: FaqMatch;
}

/**
 * FAQ assistant (D342): visitors ask in their own words and get the owner's approved answer, word for word.
 * When nothing matches it says so plainly and offers the owner's fallback link — it never makes an answer up.
 */
export function FaqAssistantBlock({ block, theme, mode }: BlockProps<'faqAssistant'>) {
  const { t } = useT();
  const c = block.content;
  const facts = approvedFacts(c.facts);
  const [query, setQuery] = useState('');
  const [asked, setAsked] = useState<Asked | null>(null);
  const reduce = useReducedMotion();
  const inputId = useId();

  if (facts.length === 0)
    return mode === 'edit' ? <BlockPlaceholder icon={BotMessageSquareIcon} title="Add approved questions and answers in the inspector" hint="Visitors type a question and get your answer, word for word" theme={theme} /> : null;

  const ask = (text: string) => {
    if (!text.trim()) return;
    setAsked({ query: text, result: matchFaq(text, facts) });
  };
  const pick = (f: FaqItem) => {
    setQuery(f.question);
    setAsked({ query: f.question, result: { best: f, related: [] } });
  };
  const fonts = fontsFor(theme);
  const chip = (f: FaqItem) => (
    <button
      key={f.id}
      type="button"
      onClick={() => pick(f)}
      className="min-h-[36px] px-3 py-1.5 text-left text-[13px] transition-[background-color] duration-150 ease-out"
      style={{ color: theme.text, background: mix(theme.text, 5), borderRadius: buttonRadius(theme) }}
    >
      {f.question}
    </button>
  );

  return (
    <section className="p-5 md:p-6" style={cardStyle(theme)}>
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: mix(theme.text, 6), color: theme.text }}>
          <BotMessageSquareIcon size={18} />
        </span>
        <div className="min-w-0">
          {c.title && (
            <h2 className="text-[19px] font-medium leading-snug" style={{ fontFamily: fonts.display, color: theme.text }}>
              {c.title}
            </h2>
          )}
          {c.intro && <p className="mt-1 text-[14px] leading-relaxed" style={{ color: theme.mutedText }}>{c.intro}</p>}
        </div>
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(query);
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          {t('Ask a question')}
        </label>
        <div className="relative min-w-0 flex-1">
          <SearchIcon size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: theme.mutedText }} />
          <input
            id={inputId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Ask about delivery, prices, opening hours…')}
            className="h-12 w-full bg-transparent pl-10 pr-3 text-[15px] outline-none focus-visible:ring-2"
            style={{ color: theme.text, border: `1.5px solid ${mix(theme.text, 16)}`, borderRadius: buttonRadius(theme) }}
          />
        </div>
        <button type="submit" disabled={!query.trim()} className="h-12 shrink-0 px-5 text-[15px] font-semibold disabled:opacity-50" style={buttonStyle(theme, 'featured')}>
          {t('Ask')}
        </button>
      </form>

      <div aria-live="polite" className="mt-4">
        <AnimatePresence mode="wait" initial={false}>
          {asked ? (
            <motion.div
              key={asked.query}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            >
              {asked.result.best ? (
                <div className="p-4" style={{ background: mix(theme.text, 4), borderRadius: buttonRadius(theme) }}>
                  <p className="text-[14px] font-semibold" style={{ color: theme.text }}>{asked.result.best.question}</p>
                  <p className="mt-1.5 whitespace-pre-line text-[14.5px] leading-relaxed" style={{ color: theme.text }}>{asked.result.best.answer}</p>
                </div>
              ) : (
                <div className="p-4" style={{ background: mix(theme.text, 4), borderRadius: buttonRadius(theme) }}>
                  <p className="text-[14px] font-semibold" style={{ color: theme.text }}>{t('There’s no approved answer for that yet.')}</p>
                  <p className="mt-1 text-[14px]" style={{ color: theme.mutedText }}>{t('Try different words, or ask the business directly.')}</p>
                  {c.fallbackUrl.trim() && (
                    <a
                      href={mode === 'live' ? c.fallbackUrl : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex h-11 items-center gap-1.5 px-4 text-[14px] font-semibold"
                      style={buttonStyle(theme, 'default')}
                    >
                      {c.fallbackLabel || t('Message us')} <ArrowRightIcon size={15} aria-hidden />
                    </a>
                  )}
                </div>
              )}
              {asked.result.related.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1.5 text-[12.5px] font-medium" style={{ color: theme.mutedText }}>{t('Also asked')}</p>
                  <div className="flex flex-wrap gap-1.5">{asked.result.related.map(chip)}</div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="suggest" initial={false} animate={{ opacity: 1 }}>
              <p className="mb-1.5 text-[12.5px] font-medium" style={{ color: theme.mutedText }}>{t('People often ask')}</p>
              <div className="flex flex-wrap gap-1.5">{facts.slice(0, 3).map(chip)}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-4 text-[11.5px]" style={{ color: theme.mutedText }}>
        {t('Answers come only from what this business has written. Nothing is made up.')}
      </p>
    </section>
  );
}
