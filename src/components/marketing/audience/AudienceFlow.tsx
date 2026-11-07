import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useT } from '../../../contexts/LocaleContext';
import { cn } from '../../../utils/cn';

interface Step {
  title: string;
  text: string;
  /** Lines of the contact record as it stands after this step. */
  record: { label: string; value: string; fresh?: boolean }[];
}

const steps: Step[] = [
  {
    title: 'They tap your link',
    text: 'A visitor opens kub.icu/amaka/s/ig from your Instagram bio. That’s an anonymous click — no contact is made.',
    record: [{ label: 'Contact', value: 'None yet — a click isn’t a person', fresh: true }],
  },
  {
    title: 'They sign up on your page',
    text: 'They fill in your newsletter block with their name and email, and see the consent note you wrote.',
    record: [
      { label: 'Name', value: 'Tobi Adeyemi', fresh: true },
      { label: 'Email', value: 'tobi@example.com', fresh: true },
    ],
  },
  {
    title: 'Source and consent are recorded',
    text: 'The block, page and short link that brought them are saved, with the exact consent wording and when they agreed.',
    record: [
      { label: 'Name', value: 'Tobi Adeyemi' },
      { label: 'Email', value: 'tobi@example.com' },
      { label: 'Source', value: 'Newsletter · Main page · Instagram link', fresh: true },
      { label: 'Consent', value: 'Subscribed · 12 Dec, 14:02 · note v2', fresh: true },
    ],
  },
  {
    title: 'You organise them',
    text: 'Tag them, add a note, or let a rule do it. Segments update on their own as people match.',
    record: [
      { label: 'Name', value: 'Tobi Adeyemi' },
      { label: 'Source', value: 'Newsletter · Instagram link' },
      { label: 'Consent', value: 'Subscribed' },
      { label: 'Tags', value: 'regular, lagos', fresh: true },
      { label: 'Segment', value: 'Subscribed from Instagram', fresh: true },
    ],
  },
  {
    title: 'You reach them — properly',
    text: 'Export the segment, or sync subscribed contacts to your email tool. Anyone who unsubscribes is left out automatically.',
    record: [
      { label: 'Name', value: 'Tobi Adeyemi' },
      { label: 'Consent', value: 'Subscribed' },
      { label: 'Segment', value: 'Subscribed from Instagram' },
      { label: 'Synced', value: 'Email tool · preview', fresh: true },
    ],
  },
];

/** "From a tap to a contact" (D268): pick a step, watch the record change beside it. */
export function AudienceFlow() {
  const { t: tr } = useT();
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const step = steps[active];
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
      <ol className="flex flex-col" aria-label={tr('Steps')}>
        {steps.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              aria-current={i === active ? 'step' : undefined}
              onClick={() => setActive(i)}
              className={cn(
                'grid w-full grid-cols-[40px_minmax(0,1fr)] gap-4 rounded-2xl px-3 py-4 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                i === active ? 'bg-raised shadow-1' : 'hover:bg-raised/60',
              )}
            >
              <span className={cn('kb-display text-[28px] leading-none', i === active ? 'text-[rgb(var(--kb-clay))]' : 'text-fg-subtle')}>{i + 1}</span>
              <span>
                <span className="block text-[17px] font-extrabold text-fg">{tr(s.title)}</span>
                {i === active && <span className="mt-1 block text-[15px] leading-relaxed text-fg-muted">{tr(s.text)}</span>}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[28px] bg-[rgb(var(--kb-peach))] p-5 md:p-7">
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[rgb(var(--kb-clay))]">{tr('Contact record · step {n}', { n: active + 1 })}</p>
          <dl className="mt-4 flex flex-col gap-2" aria-live="polite">
            <AnimatePresence initial={false} mode="popLayout">
              {step.record.map((r) => (
                <motion.div
                  key={`${active}-${r.label}`}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 rounded-2xl bg-white px-4 py-3 text-[rgb(20_20_18)]"
                >
                  <dt className="text-[13px] font-semibold text-[rgb(90_86_78)]">{tr(r.label)}</dt>
                  <dd className="flex items-center gap-2 text-[14px] font-bold">
                    <span className="min-w-0 break-words">{tr(r.value)}</span>
                    {r.fresh && <span className="shrink-0 rounded-full bg-[rgb(var(--kb-lime))] px-2 py-0.5 text-[10px] font-extrabold uppercase text-[rgb(var(--kb-forest))]">{tr('New')}</span>}
                  </dd>
                </motion.div>
              ))}
            </AnimatePresence>
          </dl>
          <div className="mt-5 flex justify-between gap-2">
            <button
              type="button"
              disabled={active === 0}
              onClick={() => setActive((a) => a - 1)}
              className="h-11 rounded-full bg-white/70 px-5 text-[14px] font-bold text-[rgb(var(--kb-clay))] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--kb-clay))]"
            >
              {tr('Back')}
            </button>
            <button
              type="button"
              disabled={active === steps.length - 1}
              onClick={() => setActive((a) => a + 1)}
              className="h-11 rounded-full bg-[rgb(var(--kb-clay))] px-5 text-[14px] font-bold text-white disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--kb-clay))] focus-visible:ring-offset-2"
            >
              {tr('Next step')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
