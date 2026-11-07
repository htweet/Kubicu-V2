import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

type AskBarGlowProps = {
  /** Sweeps only run while this is true (bar visible, not engaged). */
  active: boolean;
  /** After the person has used the bar once, sweeps repeat far less often (D525). */
  calm?: boolean;
};

/** Seconds between sweeps: lively before anyone has used the bar, calmer after. */
const GAP_FRESH: [number, number] = [5, 12];
const GAP_CALM: [number, number] = [25, 45];

/** Colours travel round the border as one bright arc that fades in and out at its tail. */
const ARC =
  'conic-gradient(from 0deg, transparent 0deg, transparent 190deg, #4285F4 225deg, #A142F4 255deg, #EA4335 285deg, #FBBC04 318deg, #34A853 345deg, transparent 360deg)';

/** Shows only a 2px ring (D527): the inner area is masked out so the bar's own surface stays untouched. */
const RING_MASK: React.CSSProperties = {
  padding: '2px',
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  maskComposite: 'exclude',
};

const SWEEP_SECONDS = 2.4;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * A multi-colour arc that runs once round the Ask bar's border at random intervals, to invite a first question (D523).
 * It pauses while the person uses the bar (the parent resumes it after 60s idle or on return from Copilot, D524),
 * and never runs with reduced motion.
 */
export function AskBarGlow({ active, calm = false }: AskBarGlowProps) {
  const reduce = useReducedMotion();
  const [sweep, setSweep] = useState<{ id: number; from: number } | null>(null);

  useEffect(() => {
    if (!active || reduce) {
      setSweep(null);
      return;
    }
    let timer: number;
    let id = 0;
    const [minGap, maxGap] = calm ? GAP_CALM : GAP_FRESH;
    const nextGap = () => randomBetween(minGap * 1000, maxGap * 1000);
    const schedule = (delayMs: number) => {
      timer = window.setTimeout(() => {
        if (document.visibilityState === 'visible') {
          id += 1;
          setSweep({ id, from: Math.round(randomBetween(0, 360)) });
          // Clear after the sweep, then wait a random gap before the next one.
          timer = window.setTimeout(() => {
            setSweep(null);
            schedule(nextGap());
          }, SWEEP_SECONDS * 1000);
        } else {
          schedule(nextGap());
        }
      }, delayMs);
    };
    schedule(randomBetween(1200, 3000));
    return () => window.clearTimeout(timer);
  }, [active, calm, reduce]);

  return (
    <span aria-hidden className="pointer-events-none absolute -inset-px overflow-hidden rounded-full" style={RING_MASK}>
      <AnimatePresence>
        {sweep && (
          <motion.span
            key={sweep.id}
            className="absolute left-1/2 top-1/2 block aspect-square w-[160%]"
            style={{ x: '-50%', y: '-50%', background: ARC }}
            initial={{ rotate: sweep.from, opacity: 0 }}
            animate={{ rotate: sweep.from + 360, opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
            transition={{
              rotate: { duration: SWEEP_SECONDS, ease: [0.45, 0, 0.55, 1] },
              opacity: { duration: SWEEP_SECONDS, times: [0, 0.15, 0.8, 1], ease: 'linear' },
            }}
          />
        )}
      </AnimatePresence>
    </span>
  );
}
