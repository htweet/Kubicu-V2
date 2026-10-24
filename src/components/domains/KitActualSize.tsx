import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FlipHorizontalIcon, RulerIcon, XIcon } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLocalStore } from '../../hooks/useLocalStore';
import { kitPreviewDoc, kitSheetCount, kitSheetDoc, kitSheetSize, type KitDetails, type KitItemSpec } from '../../utils/domains/printKit';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Segmented } from '../ui/Segmented';
import { RangeInput } from '../ui/RangeInput';
import { cn } from '../../utils/cn';

const MM = 96 / 25.4; // CSS px per millimetre
/** A Nigerian bank (ATM) card is the international ID-1 size. */
const CARD_W = 85.6;
const CARD_H = 53.98;

interface KitActualSizeProps {
  open: boolean;
  onClose: () => void;
  spec: KitItemSpec;
  kit: KitDetails;
  qrUrl: string;
}

/**
 * Full-screen, true-to-size view of a print piece or the whole home-print sheet (D119).
 * Screens differ, so a one-time check against a bank card makes millimetres real on this device.
 */
export function KitActualSize({ open, onClose, spec, kit, qrUrl }: KitActualSizeProps) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useFocusTrap(panel, open, () => closeRef.current());

  const screen = useLocalStore('kubicu.printKit.screenScale', () => ({ scale: 1, checked: false }));
  const [view, setView] = useState<'piece' | 'sheet'>('piece');
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [calibrating, setCalibrating] = useState(false);

  const k = screen.data.scale;
  const hasBack = spec.id === 'card' && kit.cardBack;
  const sheet = kitSheetSize(spec.id);
  const showSheet = view === 'sheet' && !!sheet;
  const [wMm, hMm] = showSheet && sheet ? sheet : [spec.widthMm, spec.heightMm];
  const doc = showSheet ? kitSheetDoc(spec.id, kit, qrUrl, { side: hasBack ? side : 'front' }) : kitPreviewDoc(spec.id, kit, qrUrl, hasBack ? side : 'front');
  const pxW = wMm * MM;
  const pxH = hMm * MM;

  return createPortal(
    <AnimatePresence>
      {open &&
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kit-actual-title"
        tabIndex={-1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        className="fixed inset-0 z-[85] flex flex-col bg-canvas text-fg focus:outline-none">
        
          <header className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line bg-raised px-4 py-3 sm:px-6">
            <div className="min-w-0 flex-1">
              <h2 id="kit-actual-title" className="truncate text-heading font-semibold text-fg">
                Actual size · {spec.label}
              </h2>
              <p className="text-caption text-fg-muted">
                {showSheet ? `A4 sheet, ${kitSheetCount(spec.id)} per sheet · ${wMm} × ${hMm} mm` : `${spec.widthMm} × ${spec.heightMm} mm`}
                {screen.data.checked ? ' · matched to your screen' : ' · screen not checked yet'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {sheet &&
            <Segmented<'piece' | 'sheet'>
              ariaLabel="What to show"
              size="sm"
              value={view}
              onChange={setView}
              options={[
              { value: 'piece', label: 'One piece' },
              { value: 'sheet', label: 'Whole sheet' }]
              } />

            }
              {hasBack &&
            <Segmented<'front' | 'back'>
              ariaLabel="Card side"
              size="sm"
              value={side}
              onChange={setSide}
              options={[
              { value: 'front', label: 'Front' },
              { value: 'back', label: 'Back', icon: FlipHorizontalIcon }]
              } />

            }
              <Button size="sm" variant={calibrating ? 'primary' : 'secondary'} leadingIcon={RulerIcon} onClick={() => setCalibrating((v) => !v)} aria-expanded={calibrating}>
                Match my screen
              </Button>
              <IconButton icon={XIcon} label="Close actual size" size="sm" onClick={() => closeRef.current()} />
            </div>
          </header>

          {calibrating &&
        <section aria-label="Match my screen" className="flex flex-col gap-4 border-b border-line bg-raised px-4 py-5 sm:flex-row sm:items-center sm:gap-8 sm:px-6">
              <div className="flex shrink-0 justify-center">
                <div className="relative rounded-[3mm] border-2 border-dashed border-action bg-action-soft" style={{ width: CARD_W * MM * k, height: CARD_H * MM * k }} aria-hidden>
                  <span className="absolute left-[8%] top-[34%] h-[18%] w-[16%] rounded-sm bg-line-strong" />
                  <span className="absolute bottom-[14%] left-[8%] text-caption font-medium text-fg-muted">ATM card size</span>
                </div>
              </div>
              <div className="flex max-w-md flex-1 flex-col gap-3">
                <p className="text-label text-fg">Hold any bank (ATM) card flat against your screen and move the slider until the outline matches it exactly.</p>
                <RangeInput label="Screen size" value={k} min={0.6} max={1.6} step={0.01} onChange={(v) => screen.update(() => ({ scale: v, checked: true }))} />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => {screen.update((s) => ({ ...s, checked: true }));setCalibrating(false);}}>
                    It matches
                  </Button>
                  <Button size="sm" variant="tertiary" onClick={() => screen.update(() => ({ scale: 1, checked: false }))}>
                    Reset
                  </Button>
                </div>
                <p className="text-caption text-fg-subtle">Saved on this device. Browser zoom changes it — keep zoom at 100%.</p>
              </div>
            </section>
        }

          <div className="dot-stage scroll-quiet min-h-0 flex-1 overflow-auto">
            <div className="flex min-h-full min-w-max items-center justify-center p-8 sm:p-12">
              <div className={cn('shrink-0 bg-white shadow-lg', spec.id === 'sticker' && !showSheet && 'rounded-full')} style={{ width: pxW * k, height: spec.id === 'receipt' ? undefined : pxH * k, minHeight: spec.id === 'receipt' ? pxH * k : undefined }}>
                <iframe
                title={`${spec.label}, actual size${hasBack && side === 'back' ? ', back' : ''}`}
                srcDoc={doc}
                tabIndex={-1}
                style={{ width: pxW, height: pxH, transform: `scale(${k})`, transformOrigin: 'top left', border: 0, display: 'block', background: 'transparent' }} />
              
              </div>
            </div>
          </div>

          <p className="border-t border-line bg-raised px-4 py-2.5 text-center text-caption text-fg-subtle sm:px-6">
            {screen.data.checked ? 'This is how big it prints. ' : 'Not checked against your screen yet — sizes may be a little off. '}
            Phone screens are small, so large pieces won’t fit; scroll to see the rest.
          </p>
        </motion.div>
      }
    </AnimatePresence>,
    document.body
  );
}