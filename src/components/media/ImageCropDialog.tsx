import React, { useEffect, useRef, useState } from 'react';
import { RotateCcwIcon, ZoomInIcon } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { cropImage, cropRect, type CropBox } from '../../utils/image';

interface ImageCropDialogProps {
  open: boolean;
  src: string;
  aspect: number;
  aspectLabel: string;
  onClose: () => void;
  onCropped: (dataUrl: string) => void;
}

const initialBox: CropBox = { zoom: 1, x: 0, y: 0 };
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function ImageCropDialog({ open, src, aspect, aspectLabel, onClose, onCropped }: ImageCropDialogProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; box: CropBox } | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [frameW, setFrameW] = useState(0);
  const [box, setBox] = useState<CropBox>(initialBox);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setBox(initialBox);
    setError(null);
    setNatural(null);
    const img = new Image();
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setError('We couldn’t load this image to crop it.');
    img.src = src;
  }, [open, src]);

  useEffect(() => {
    if (!open) return;
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setFrameW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, natural]);

  const rect = natural ? cropRect(natural.w, natural.h, aspect, box) : null;
  const scale = rect && frameW ? frameW / rect.w : 0;

  const pan = (dxPx: number, dyPx: number, from: CropBox) => {
    if (!natural || !scale) return from;
    const r = cropRect(natural.w, natural.h, aspect, from);
    const slackX = ((natural.w - r.w) * scale) / 2;
    const slackY = ((natural.h - r.h) * scale) / 2;
    return {
      ...from,
      x: slackX > 0 ? clamp(from.x - dxPx / slackX, -1, 1) : 0,
      y: slackY > 0 ? clamp(from.y - dyPx / slackY, -1, 1) : 0,
    };
  };

  const apply = async () => {
    setBusy(true);
    setError(null);
    try {
      onCropped(await cropImage(src, aspect, box));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cropping failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Crop photo"
      description={`Drag to position. Shape: ${aspectLabel}.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={apply} loading={busy} disabled={!natural} data-autofocus>
            Apply crop
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 pb-2">
        <div
          ref={frameRef}
          role="img"
          tabIndex={0}
          aria-label="Crop area. Use arrow keys to move the photo."
          className="relative w-full cursor-grab touch-none select-none overflow-hidden rounded-md bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:cursor-grabbing"
          style={{ aspectRatio: String(aspect) }}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, y: e.clientY, box };
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            setBox(pan(e.clientX - drag.current.x, e.clientY - drag.current.y, drag.current.box));
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 40 : 12;
            const moves: Record<string, [number, number]> = {
              ArrowLeft: [step, 0],
              ArrowRight: [-step, 0],
              ArrowUp: [0, step],
              ArrowDown: [0, -step],
            };
            const m = moves[e.key];
            if (m) {
              e.preventDefault();
              setBox((b) => pan(m[0], m[1], b));
            }
          }}
        >
          {natural && rect && scale > 0 && (
            <img
              src={src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute max-w-none"
              style={{ width: natural.w * scale, height: natural.h * scale, left: -rect.sx * scale, top: -rect.sy * scale }}
            />
          )}
          {/* Rule-of-thirds guide */}
          <span aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="border border-white/25" />
            ))}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ZoomInIcon size={16} className="shrink-0 text-fg-subtle" aria-hidden />
          <label htmlFor="crop-zoom" className="sr-only">
            Zoom
          </label>
          <input
            id="crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={box.zoom}
            onChange={(e) => setBox((b) => ({ ...b, zoom: Number(e.target.value) }))}
            className="h-1.5 flex-1 cursor-pointer accent-[rgb(var(--action))]"
          />
          <span className="w-10 text-right text-caption tabular-nums text-fg-muted">{box.zoom.toFixed(1)}×</span>
          <Button size="sm" variant="tertiary" leadingIcon={RotateCcwIcon} onClick={() => setBox(initialBox)}>
            Reset
          </Button>
        </div>
        {error && <p className="text-caption text-danger">{error}</p>}
      </div>
    </Dialog>
  );
}
