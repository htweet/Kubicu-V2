import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type KbShapeKind = 'kube' | 'circle' | 'half' | 'ring' | 'pill' | 'diamond' | 'arch' | 'plus';
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

/** Brand geometry used around photos and phones on public pages (D260, D266). Always decorative. */
export function KbShape({ kind, color, size, motion: m = 'none', className, phase = 0 }: KbShapeProps) {
  const reduce = useReducedMotion();
  if (kind === 'kube') return <KubeMark color={color} size={size} still={!!reduce || m === 'none'} className={className} phase={phase} />;

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

/**
 * KUBICU's own mark (D266): the logo's rounded tile with its three blocks cut out.
 * The two small blocks trade places now and then — "building blocks" — while the tile tilts gently.
 */
function KubeMark({ color, size, still, className, phase }: {color: string;size: number;still: boolean;className?: string;phase: number;}) {
  const id = useId().replace(/:/g, '');
  const cycle = 5.2;
  // Hold, swap (~0.5s), hold, swap back (~0.5s).
  const times = [0, 0.4, 0.5, 0.9, 1];
  const swap = { repeat: Infinity, duration: cycle, times, ease: [0.65, 0, 0.35, 1] as [number, number, number, number], delay: phase };
  return (
    <motion.div
      aria-hidden
      className={className}
      style={{ width: size, height: size }}
      animate={still ? undefined : { rotate: [-7, 7, -7], y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: phase }}>
      
      <svg viewBox="0 0 100 100" width={size} height={size} className="block overflow-visible">
        <defs>
          <mask id={`kube-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
            <rect x="0" y="0" width="100" height="100" rx="28" fill="white" />
            <motion.rect
              width="22"
              height="56"
              rx="7"
              fill="black"
              initial={{ x: 22, y: 22 }}
              animate={still ? undefined : { height: [56, 56, 48, 56, 56], y: [22, 22, 26, 22, 22] }}
              transition={swap} />
            
            <motion.rect
              width="22"
              height="22"
              rx="7"
              fill="black"
              initial={{ x: 56, y: 22 }}
              animate={still ? undefined : { y: [22, 22, 56, 56, 22], x: [56, 56, 56, 56, 56] }}
              transition={swap} />
            
            <motion.rect
              width="22"
              height="22"
              rx="7"
              fill="black"
              initial={{ x: 56, y: 56 }}
              animate={still ? undefined : { y: [56, 56, 22, 22, 56] }}
              transition={swap} />
            
          </mask>
        </defs>
        <rect x="0" y="0" width="100" height="100" rx="28" fill={color} mask={`url(#kube-${id})`} />
        {/* The accent block — the one coloured square in the logo — rides along with the top tile. */}
        <motion.rect
          width="22"
          height="22"
          rx="7"
          fill={color}
          opacity={0.45}
          initial={{ x: 56, y: 22 }}
          animate={still ? undefined : { y: [22, 22, 56, 56, 22] }}
          transition={swap} />
        
      </svg>
    </motion.div>);

}

function shape(kind: Exclude<KbShapeKind, 'kube'>, c: string) {
  switch (kind) {
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