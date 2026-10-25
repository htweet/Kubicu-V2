import React, { useEffect, useRef, useState } from 'react';
import type { FormSkin } from './formSkin';
import { isDrawnSignature } from '../../utils/forms/logic';

interface SignatureInputProps {
  id: string;
  value: string;
  onChange: (v: string) => void;
  skin: FormSkin;
  inert: boolean;
  describedBy?: string;
  invalid: boolean;
  labelledBy: string;
}

/**
 * Signature field (D193). Draw with a finger or mouse, or type your name — typing is a full
 * alternative, so keyboard and screen-reader users never need to draw.
 * Stored as a PNG data URL (drawn) or "typed:Full Name".
 */
export function SignatureInput({ id, value, onChange, skin, inert, describedBy, invalid, labelledBy }: SignatureInputProps) {
  const [mode, setMode] = useState<'draw' | 'type'>(value && !isDrawnSignature(value) ? 'type' : 'draw');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{x: number;y: number;} | null>(null);
  const typed = value.startsWith('typed:') ? value.slice(6) : '';

  // Size the canvas to its box (sharp on high-density screens) and redraw an existing signature.
  useEffect(() => {
    if (mode !== 'draw') return;
    const c = canvasRef.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = Math.max(1, Math.round(rect.width * ratio));
    c.height = Math.max(1, Math.round(rect.height * ratio));
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#111111';
    if (isDrawnSignature(value)) {
      const im = new Image();
      im.onload = () => ctx.drawImage(im, 0, 0, rect.width, rect.height);
      im.src = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (inert) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const ctx = e.currentTarget.getContext('2d');
    if (!ctx) return;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    const c = canvasRef.current;
    if (c) onChange(c.toDataURL('image/png'));
  };

  const clear = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
    onChange('');
  };

  const switchTo = (m: 'draw' | 'type') => {
    if (m === mode) return;
    setMode(m);
    onChange('');
  };

  const tab = (m: 'draw' | 'type', text: string, first: boolean) =>
  <button
    id={first ? id : undefined}
    type="button"
    role="radio"
    aria-checked={mode === m}
    disabled={inert}
    tabIndex={inert ? -1 : undefined}
    onClick={() => switchTo(m)}
    className="h-9 rounded-md px-3 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2"
    style={mode === m ? { ...skin.button, borderRadius: 8 } : { color: skin.muted }}>
    
      {text}
    </button>;


  return (
    <div className="flex flex-col gap-2" aria-describedby={describedBy}>
      <div role="radiogroup" aria-label="How to sign" className="flex gap-1">
        {tab('draw', 'Draw', true)}
        {tab('type', 'Type', false)}
      </div>
      {mode === 'draw' ?
      <div className="flex flex-col gap-1.5">
          <div className="relative overflow-hidden" style={{ ...skin.input, background: '#ffffff', height: 'auto' }}>
            <canvas
            ref={canvasRef}
            role="img"
            aria-labelledby={labelledBy}
            aria-invalid={invalid || undefined}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            className="block h-36 w-full cursor-crosshair touch-none" />
          
            {!value &&
          <span aria-hidden className="pointer-events-none absolute inset-x-4 bottom-6 border-b border-dashed text-[11px]" style={{ borderColor: '#9ca3af', color: '#6b7280' }}>
                <span className="relative top-4">Sign above the line</span>
              </span>
          }
          </div>
          <div className="flex items-center justify-between gap-2 text-[12px]" style={{ color: skin.muted }}>
            <span>Can’t draw here? Choose Type.</span>
            <button type="button" onClick={clear} disabled={inert || !value} className="min-h-[32px] px-1 font-medium underline disabled:opacity-50" style={{ color: skin.text }}>
              Clear
            </button>
          </div>
        </div> :

      <div className="flex flex-col gap-1.5">
          <input
          aria-labelledby={labelledBy}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          disabled={inert}
          tabIndex={inert ? -1 : undefined}
          autoComplete="name"
          maxLength={80}
          value={typed}
          placeholder="Type your full name"
          onChange={(e) => onChange(e.target.value ? `typed:${e.target.value}` : '')}
          className="h-11 w-full px-3.5 text-[14.5px] outline-none focus:ring-2"
          style={skin.input} />
        
          {typed.trim() &&
        <p aria-hidden className="truncate text-[26px] leading-tight" style={{ color: skin.text, fontFamily: '"Brush Script MT", "Segoe Script", cursive', fontStyle: 'italic' }}>
              {typed}
            </p>
        }
          <p className="text-[12px]" style={{ color: skin.muted }}>
            Typing your name counts as your signature on this form.
          </p>
        </div>
      }
    </div>);

}