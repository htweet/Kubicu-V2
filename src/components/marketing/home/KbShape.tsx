import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type KbShapeKind = 'asterisk' | 'circle' | 'half' | 'ring' | 'pill' | 'diamond' | 'arch' | 'plus';
export type KbShapeMotion = 'none' | 'spin' | 'float' | 'bob' | 'sway';

interface KbShapeProps {
  kind: KbShapeKind;
  /** Any CSS colour, e.g. 'rgb(var(--kb-pink))'. */
  color: string;
  size: number;
  motion?: KbShapeMotion;
  className?: string;
  /** Seconds of offset so neighbouring shapes don't move in step. */
  phase?: number;
}

/** Brand geometry used around photos and phones on public pages (D260). Always decorative. */
export function KbShape({ kind, color, size, motion: m = 'none', className, phase = 0 }: KbShapeProps) {
  const reduce = useReducedMotion();
  const loop = { repeat: Infinity, ease: 'easeInOut' as const, delay: phase };
  const animate =
  reduce || m === 'none' ?
  undefined :
  m === 'spin' ?
  { rotate: 360 } :
  m === 'float' ?
  { y: [0, -14, 0], rotate: [0, 6, 0] } :
  m === 'bob' ?
  { y: [0, 10, 0] } :
  { rotate: [-8, 8, -8] };
  const transition = m === 'spin' ? { repeat: Infinity, ease: 'linear' as const, duration: 18 } : { ...loop, duration: m === 'bob' ? 4.5 : 6 };
  return (
    <motion.div aria-hidden className={className} style={{ width: size, height: size }} animate={animate} transition={transition}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="block overflow-visible">
        {shape(kind, color)}
      </svg>
    </motion.div>);

}

function shape(kind: KbShapeKind, c: string) {
  switch (kind) {
    case 'asterisk':
      return (
        <g fill={c}>
          {[0, 45, 90, 135].map((r) =>
          <rect key={r} x="42" y="2" width="16" height="96" rx="8" transform={`rotate(${r} 50 50)`} />
          )}
        </g>);

    case 'circle':
      return <circle cx="50" cy="50" r="50" fill={c} />;
    case 'half':
      return <path d="M0 50a50 50 0 0 1 100 0z" fill={c} transform="translate(0 25)" />;
    case 'ring':
      return <circle cx="50" cy="50" r="40" fill="none" stroke={c} strokeWidth="16" />;
    case 'pill':
      return <rect x="0" y="30" width="100" height="40" rx="20" fill={c} />;
    case 'diamond':
      return <path d="M50 0 62 38 100 50 62 62 50 100 38 62 0 50 38 38z" fill={c} />;
    case 'arch':
      return <path d="M10 100V50a40 40 0 0 1 80 0v50H66V50a16 16 0 0 0-32 0v50z" fill={c} />;
    case 'plus':
      return <path d="M38 0h24v38h38v24H62v38H38V62H0V38h38z" fill={c} />;
  }
}