import React, { useEffect, useId, useRef, useState } from 'react';
import { readableOn, mixHex } from '../../utils/contrast';
import { CertificateSeal } from './CertificateSeal';

export interface CertificateSignature {
  name: string;
  role: string;
}

interface CertificateSheetProps {
  /** "Completion", "Delivered Work"… — shown under the word "Certificate". */
  kind: string;
  /** The business issuing it, set in small capitals at the top. */
  issuer: string;
  lead: string;
  recipient: string;
  statement: string;
  subject: string;
  detail?: string;
  date: { label: string; value: string };
  signature: CertificateSignature;
  seal: { rim: string; mark: string };
  code?: string;
  footnote: string;
  /** The page theme's accent; deepened until it reads as ink on paper. */
  accent: string;
  label: string;
}

const W = 1000;
const H = 707; // A4 landscape proportions
const PAPER = '#FBF8F1';
const SEAL = '#9A7B44';

/**
 * A formal, landscape certificate (A4 proportions): engraved double frame with a fine line band,
 * corner ornaments, classic serif type and a solid-colour seal. Laid out once at 1000px and scaled
 * to fit, so phones see the same certificate, smaller. Prints as one A4 landscape page.
 */
export function CertificateSheet(p: CertificateSheetProps) {
  const uid = useId().replace(/:/g, '');
  const ink = readableOn(p.accent, PAPER, 7);
  const soft = mixHex(ink, PAPER, 0.35);
  const faint = mixHex(ink, PAPER, 0.78);
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const serif = "'Cormorant Garamond', 'Fraunces', Georgia, serif";

  return (
    <div ref={wrap} className="cert-wrap w-full">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          html, body { background: #fff !important; }
          body * { visibility: hidden !important; }
          .cert-sheet, .cert-sheet * { visibility: visible !important; }
          .cert-sheet { position: fixed !important; left: 0; top: 0; width: 297mm !important; height: 210mm !important; transform: none !important; box-shadow: none !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .cert-sheet > .cert-inner { transform: scale(${(297 / 25.4 * 96 / W).toFixed(4)}) !important; transform-origin: top left; }
        }
      `}</style>
      <article
        aria-label={p.label}
        className="cert-sheet relative overflow-hidden"
        style={{ width: W * scale, height: H * scale, boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 12px 32px -12px rgba(0,0,0,0.22)', background: PAPER }}
      >
        <div className="cert-inner absolute left-0 top-0" style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', color: ink, background: PAPER }}>
          <Frame id={uid} ink={ink} faint={faint} />

          <div className="absolute inset-0 flex flex-col items-center px-[120px] pb-[64px] pt-[82px] text-center">
            <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.32em', color: soft }}>{p.issuer.toUpperCase()}</p>

            <h2 className="mt-5" style={{ fontFamily: serif, fontSize: 64, fontWeight: 500, lineHeight: 1, letterSpacing: '0.04em' }}>
              Certificate
            </h2>
            <p className="mt-2" style={{ fontFamily: serif, fontSize: 24, fontStyle: 'italic', color: soft }}>
              of {p.kind}
            </p>

            <Rule colour={faint} ink={soft} />

            <p className="mt-5" style={{ fontFamily: serif, fontSize: 18, fontStyle: 'italic', color: soft }}>
              {p.lead}
            </p>
            <p
              className="mt-2 max-w-[700px] truncate px-8 pb-2"
              style={{ fontFamily: serif, fontSize: p.recipient.length > 28 ? 40 : 50, fontWeight: 600, fontStyle: 'italic', lineHeight: 1.1, borderBottom: `1px solid ${faint}`, minWidth: 420 }}
            >
              {p.recipient || 'Your name'}
            </p>
            <p className="mt-4" style={{ fontFamily: serif, fontSize: 18, fontStyle: 'italic', color: soft }}>
              {p.statement}
            </p>
            <p className="mt-1 max-w-[680px]" style={{ fontFamily: serif, fontSize: p.subject.length > 50 ? 24 : 30, fontWeight: 600, lineHeight: 1.2 }}>
              {p.subject}
            </p>
            {p.detail && (
              <p className="mt-2" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: soft }}>
                {p.detail}
              </p>
            )}

            <div className="mt-auto grid w-full grid-cols-[1fr_auto_1fr] items-end gap-10">
              <SignLine label={p.date.label} value={p.date.value} soft={soft} faint={faint} serif={serif} />
              <div className="-mb-3">
                <CertificateSeal id={`${uid}-seal`} rim={p.seal.rim} mark={p.seal.mark} colour={SEAL} paper={PAPER} size={120} />
              </div>
              <SignLine label={p.signature.role} value={p.signature.name} soft={soft} faint={faint} serif={serif} script />
            </div>
          </div>

          <p className="absolute inset-x-0 bottom-[34px] px-[110px] text-center" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 9.5, lineHeight: 1.45, color: soft }}>
            {p.code && <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.08em', color: ink }}>{p.code} · </span>}
            {p.footnote}
          </p>
        </div>
      </article>
      {/* On phones the sheet is scaled down; repeat the small print at a readable size. */}
      {scale < 0.6 && (
        <p className="mt-3 text-[12.5px] leading-relaxed opacity-80 print:hidden">
          {p.code && <span className="font-mono">{p.code} · </span>}
          {p.footnote} Turn your phone sideways or print it to see it full size.
        </p>
      )}
    </div>
  );
}

function SignLine({ label, value, soft, faint, serif, script }: { label: string; value: string; soft: string; faint: string; serif: string; script?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <p className="min-h-[34px] w-full truncate px-2" style={{ fontFamily: serif, fontSize: script ? 26 : 20, fontStyle: script ? 'italic' : 'normal', fontWeight: script ? 500 : 600, lineHeight: 1.3 }}>
        {value}
      </p>
      <span className="mt-1 block h-px w-full" style={{ background: faint }} />
      <p className="mt-2" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.2em', color: soft }}>
        {label.toUpperCase()}
      </p>
    </div>
  );
}

function Rule({ colour, ink }: { colour: string; ink: string }) {
  return (
    <svg width="220" height="14" viewBox="0 0 220 14" className="mt-5" aria-hidden>
      <line x1="0" y1="7" x2="92" y2="7" stroke={colour} strokeWidth="1" />
      <line x1="128" y1="7" x2="220" y2="7" stroke={colour} strokeWidth="1" />
      <path d="M110 1 L116 7 L110 13 L104 7 Z" fill="none" stroke={ink} strokeWidth="1" />
      <circle cx="98" cy="7" r="1.6" fill={ink} />
      <circle cx="122" cy="7" r="1.6" fill={ink} />
    </svg>
  );
}

/** Outer rule, a fine engraved wave band, inner hairline and four corner ornaments. */
function Frame({ id, ink, faint }: { id: string; ink: string; faint: string }) {
  const o = 22; // outer line inset
  const b1 = 30; // band outer
  const b2 = 46; // band inner
  const i = 52; // inner hairline
  const corner = (x: number, y: number, sx: number, sy: number, k: number) => (
    <g key={k} transform={`translate(${x} ${y}) scale(${sx} ${sy})`} fill="none" stroke={ink} strokeWidth="1">
      <path d="M0 26 C0 10 10 0 26 0" />
      <path d="M6 30 C6 15 15 6 30 6" strokeOpacity="0.55" />
      <circle cx="12" cy="12" r="3" fill={ink} stroke="none" />
      <path d="M12 21 L12 34 M21 12 L34 12" strokeOpacity="0.55" />
    </g>
  );
  return (
    <svg className="absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <defs>
        <pattern id={`${id}-wave`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 8 Q4 2 8 8 T16 8" fill="none" stroke={ink} strokeOpacity="0.32" strokeWidth="0.7" />
          <path d="M0 8 Q4 14 8 8 T16 8" fill="none" stroke={ink} strokeOpacity="0.32" strokeWidth="0.7" />
        </pattern>
      </defs>
      <rect x={o} y={o} width={W - o * 2} height={H - o * 2} fill="none" stroke={ink} strokeWidth="2" />
      <path
        fillRule="evenodd"
        fill={`url(#${id}-wave)`}
        d={`M${b1} ${b1} H${W - b1} V${H - b1} H${b1} Z M${b2} ${b2} V${H - b2} H${W - b2} V${b2} Z`}
      />
      <rect x={b1} y={b1} width={W - b1 * 2} height={H - b1 * 2} fill="none" stroke={ink} strokeOpacity="0.6" strokeWidth="0.75" />
      <rect x={b2} y={b2} width={W - b2 * 2} height={H - b2 * 2} fill="none" stroke={ink} strokeOpacity="0.6" strokeWidth="0.75" />
      <rect x={i} y={i} width={W - i * 2} height={H - i * 2} fill="none" stroke={faint} strokeWidth="1" />
      {corner(i + 6, i + 6, 1, 1, 0)}
      {corner(W - i - 6, i + 6, -1, 1, 1)}
      {corner(i + 6, H - i - 6, 1, -1, 2)}
      {corner(W - i - 6, H - i - 6, -1, -1, 3)}
    </svg>
  );
}
