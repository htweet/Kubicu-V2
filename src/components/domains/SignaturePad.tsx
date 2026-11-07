import React, { useEffect, useRef, useState } from 'react';
import { EraserIcon } from 'lucide-react';
import { Button } from '../ui/Button';

/** Draw a signature with finger, pen or mouse; saved as a transparent PNG (D118). */
export function SignaturePad({ onSave, onCancel }: { onSave: (dataUrl: string, widthPx: number) => void; onCancel: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.clientWidth * ratio;
    c.height = c.clientHeight * ratio;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2.4;
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const ctx = e.currentTarget.getContext('2d');
    if (!ctx) return;
    const p = point(e);
    // Slightly thinner on fast strokes, like ink.
    const speed = Math.hypot(p.x - last.current.x, p.y - last.current.y);
    ctx.lineWidth = Math.max(1.4, 2.8 - speed / 18);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    setEmpty(false);
  };
  const up = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = () => {
    const c = ref.current;
    c?.getContext('2d')?.clearRect(0, 0, c.width, c.height);
    setEmpty(true);
  };

  const save = () => {
    const c = ref.current;
    if (!c || empty) return;
    onSave(c.toDataURL('image/png'), c.width);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative rounded-md border border-line-strong bg-white">
        <canvas
          ref={ref}
          aria-label="Signature drawing area. Draw with your finger, pen or mouse."
          role="img"
          className="block h-32 w-full touch-none cursor-crosshair"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
        />
        <span aria-hidden className="pointer-events-none absolute bottom-7 left-6 right-6 border-b border-dashed border-neutral-300" />
        {empty && <span className="pointer-events-none absolute inset-x-0 top-3 text-center text-caption text-neutral-400">Sign here</span>}
      </div>
      <div className="flex items-center justify-between gap-2">
        <Button size="sm" variant="tertiary" leadingIcon={EraserIcon} onClick={clear} disabled={empty}>
          Clear
        </Button>
        <div className="flex gap-2">
          <Button size="sm" variant="tertiary" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" variant="secondary" onClick={save} disabled={empty}>
            Use signature
          </Button>
        </div>
      </div>
      <p className="text-caption text-fg-subtle">Drawing with a mouse is hard — on a phone, use your finger. Or upload a photo of your signature on white paper.</p>
    </div>
  );
}
