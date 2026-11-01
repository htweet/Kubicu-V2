import React, { useEffect, useState } from 'react';
import { CheckIcon, VoteIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { BlockPlaceholder } from './BlockPlaceholder';
import { buttonStyle, cardStyle, fontsFor, mix } from './pageStyle';
import { useT } from '../../contexts/LocaleContext';

interface Tally {
  votes: Record<string, number>;
  mine: string | null;
}

const key = (id: string) => `kubicu.poll.${id}`;
const read = (id: string): Tally => {
  try {
    const raw = window.localStorage.getItem(key(id));
    return raw ? JSON.parse(raw) as Tally : { votes: {}, mine: null };
  } catch {
    return { votes: {}, mine: null };
  }
};

/**
 * Poll (D170): a fieldset of radio choices and a Vote button. Prototype: votes are counted on this
 * device only, and the results say so — no invented totals.
 */
export function PollBlock({ block, theme, mode }: BlockProps<'poll'>) {
  // Fixed wording follows the visitor's language (D505); the question and answers stay as written.
  const { t: tr } = useT();
  const c = block.content;
  const options = c.options.filter((o) => o.label.trim());
  const [tally, setTally] = useState<Tally>({ votes: {}, mine: null });
  const [pick, setPick] = useState<string | null>(null);
  useEffect(() => {
    if (mode === 'live') setTally(read(block.id));
  }, [block.id, mode]);
  if (!c.question.trim() || options.length < 2) return mode === 'edit' ? <BlockPlaceholder icon={VoteIcon} title="Write a question and at least two answers" hint="Short answers work best" theme={theme} /> : null;

  const vote = () => {
    if (!pick || mode !== 'live') return;
    const next = { votes: { ...tally.votes, [pick]: (tally.votes[pick] ?? 0) + 1 }, mine: pick };
    setTally(next);
    try {
      window.localStorage.setItem(key(block.id), JSON.stringify(next));
    } catch {

      /* storage blocked — vote just isn't remembered */}
  };
  const total = Object.values(tally.votes).reduce((a, b) => a + b, 0);
  const voted = !!tally.mine;
  const gid = `${block.id}-q`;
  return (
    <section className="p-5 md:p-6" style={cardStyle(theme)}>
      <h2 id={gid} className="text-[19px] font-medium leading-snug" style={{ fontFamily: fontsFor(theme).display, color: theme.text }}>{c.question}</h2>
      {voted ?
      <div className="mt-4" role="status">
          <p className="text-[14px] font-medium" style={{ color: theme.text }}>{tr('Thanks — your vote is in.')}</p>
          {c.showResults === 'after' &&
        <ul className="mt-3 flex flex-col gap-2.5">
              {options.map((o) => {
            const n = tally.votes[o.id] ?? 0;
            const pct = total ? Math.round(n / total * 100) : 0;
            return (
              <li key={o.id}>
                    <div className="flex justify-between text-[14px]" style={{ color: theme.text }}>
                      <span className="inline-flex items-center gap-1.5">
                        {o.label}
                        {tally.mine === o.id && <CheckIcon size={14} aria-label={tr('your vote')} />}
                      </span>
                      <span className="tabular-nums">{pct}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full" style={{ background: mix(theme.text, 8) }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: theme.text }} />
                    </div>
                  </li>);

          })}
            </ul>
        }
          <p className="mt-3 text-[11.5px]" style={{ color: theme.mutedText }}>{tr('Results from this device only (prototype).')}</p>
        </div> :

      <fieldset className="mt-4" aria-labelledby={gid}>
          <div className="flex flex-col gap-2">
            {options.map((o) =>
          <label key={o.id} className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-[10px] px-3.5 text-[15px]" style={{ border: `1.5px solid ${pick === o.id ? theme.text : mix(theme.text, 16)}`, color: theme.text }}>
                <input type="radio" name={gid} value={o.id} checked={pick === o.id} onChange={() => setPick(o.id)} disabled={mode !== 'live'} className="h-4 w-4" style={{ accentColor: theme.text }} />
                {o.label}
              </label>
          )}
          </div>
          <button type="button" onClick={vote} disabled={!pick || mode !== 'live'} className="mt-4 h-12 w-full text-[15px] font-semibold disabled:opacity-50" style={buttonStyle(theme, 'featured')}>
            {tr('Vote')}
          </button>
        </fieldset>
      }
    </section>);

}