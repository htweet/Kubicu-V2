import React from 'react';

interface CertificateSealProps {
  /** Words set around the rim, e.g. "COURSE COMPLETED · ADAEZE STUDIO". */
  rim: string;
  /** One to three characters in the centre (initials). */
  mark: string;
  colour: string;
  paper: string;
  id: string;
  size?: number;
}

/** An embossed-style rosette seal drawn in one solid colour — no gradients, prints cleanly. */
export function CertificateSeal({ rim, mark, colour, paper, id, size = 128 }: CertificateSealProps) {
  const points = Array.from({ length: 64 }, (_, i) => {
    const a = i / 64 * Math.PI * 2;
    const r = i % 2 ? 57 : 61;
    return `${(64 + r * Math.cos(a)).toFixed(2)},${(64 + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
  const text = rim.toUpperCase();
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" aria-hidden className="shrink-0">
      <defs>
        <path id={`${id}-rim`} d="M64,64 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" />
      </defs>
      <polygon points={points} fill={colour} />
      <circle cx="64" cy="64" r="51" fill="none" stroke={paper} strokeOpacity="0.85" strokeWidth="1" />
      <circle cx="64" cy="64" r="31" fill="none" stroke={paper} strokeOpacity="0.85" strokeWidth="1" />
      <circle cx="64" cy="64" r="28" fill="none" stroke={paper} strokeOpacity="0.5" strokeWidth="0.6" />
      <text fill={paper} fontSize="7.6" fontWeight="600" letterSpacing="1.6" fontFamily="Inter, system-ui, sans-serif">
        <textPath href={`#${id}-rim`} startOffset="0" textLength="246" lengthAdjust="spacing">
          {text.length > 44 ? `${text.slice(0, 43)}…` : text}
        </textPath>
      </text>
      <text x="64" y="64" dy="0.36em" textAnchor="middle" fill={paper} fontSize={mark.length > 2 ? 17 : 22} fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="600" letterSpacing="0.5">
        {mark}
      </text>
    </svg>);

}