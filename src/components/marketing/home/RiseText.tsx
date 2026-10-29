import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface RiseTextProps {
  text: string;
  /** Words (by index) drawn in the highlight colour. */
  highlight?: number[];
  highlightClassName?: string;
  /** Seconds between words. */
  stagger?: number;
  delay?: number;
}

/** Headline that rises in word by word from behind a mask. Screen readers get the plain sentence. */
export function RiseText({ text, highlight = [], highlightClassName, stagger = 0.05, delay = 0 }: RiseTextProps) {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) =>
        <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
            className={highlight.includes(i) ? `inline-block ${highlightClassName ?? ''}` : 'inline-block'}
            initial={reduce ? false : { y: '105%' }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: delay + i * stagger, ease: [0.23, 1, 0.32, 1] }}>
            
              {w}
            </motion.span>
            {i < words.length - 1 && '\u00a0'}
          </span>
        )}
      </span>
    </>);

}