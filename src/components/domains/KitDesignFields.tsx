import React from 'react';
import { CheckIcon } from 'lucide-react';
import { kitFonts, kitPapers, kitStyles, type KitDetails, type KitItem, type KitStyle } from '../../utils/domains/printKit';
import { paperColour } from '../../utils/domains/printKitTemplates';
import { contrastRatio, isHexColor } from '../../utils/contrast';
import { Switch } from '../ui/Switch';
import { RangeInput } from '../ui/RangeInput';
import { cn } from '../../utils/cn';

export type InkMode = 'page' | 'black' | 'custom';

/** Deep, print-safe colours that read on white and cream paper. */
const presets = ['#111111', '#1E3A8A', '#14532D', '#7C2D12', '#831843', '#4C1D95', '#0F766E', '#9A3412'];

interface KitDesignFieldsProps {
  item: KitItem;
  details: KitDetails;
  set: (patch: Partial<KitDetails>) => void;
  inkMode: InkMode;
  customInk: string;
  pageInk: string;
  onInk: (mode: InkMode, custom?: string) => void;
  disabled?: boolean;
  /** Whether this piece has a Photo design. */
  photoAllowed: boolean;
}

/** Design, typeface, paper, colour and text sizes for the print kit (D118, D119). */
export function KitDesignFields({ item, details: d, set, inkMode, customInk, pageInk, onInk, disabled, photoAllowed }: KitDesignFieldsProps) {
  const paper = paperColour(d.paper, d.ink);
  const pageOk = contrastRatio(pageInk, '#FFFFFF') >= 3;

  return (
    <fieldset disabled={disabled} className="flex flex-col gap-6">
      <legend className="sr-only">Design</legend>
      <div>
        <p id="kit-style" className="mb-2 text-label font-medium text-fg">
          Design
        </p>
        <div role="radiogroup" aria-labelledby="kit-style" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {kitStyles.map((s) => {
            const off = s.id === 'photo' && !photoAllowed;
            return (
              <label
                key={s.id}
                className={cn(
                  'flex flex-col gap-2 rounded-lg border p-2.5 focus-within:ring-2 focus-within:ring-focus',
                  off ? 'cursor-not-allowed border-line bg-sunken opacity-60' : 'cursor-pointer',
                  !off && (d.style === s.id ? 'border-action bg-action-soft' : 'border-line bg-raised hover:border-line-strong'),
                )}
              >
                <input type="radio" name="kit-style" className="sr-only" checked={d.style === s.id} disabled={off} onChange={() => set({ style: s.id })} />
                <StyleThumb style={s.id} ink={d.ink} paper={paper} />
                <span>
                  <span className="block text-label font-semibold text-fg">{s.label}</span>
                  <span className="block text-caption text-fg-muted">{off ? 'Not for this piece' : s.detail}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <p id="kit-font" className="mb-2 text-label font-medium text-fg">
          Typeface
        </p>
        <div role="radiogroup" aria-labelledby="kit-font" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {kitFonts.map((f) => (
            <label key={f.id} className={cn('flex cursor-pointer flex-col rounded-lg border px-3 py-2.5 focus-within:ring-2 focus-within:ring-focus', d.font === f.id ? 'border-action bg-action-soft' : 'border-line bg-raised hover:border-line-strong')}>
              <input type="radio" name="kit-font" className="sr-only" checked={d.font === f.id} onChange={() => set({ font: f.id })} />
              <span className="truncate text-heading font-semibold text-fg" style={{ fontFamily: f.family }}>
                Aa
              </span>
              <span className="text-caption text-fg-muted">
                {f.label} · {f.detail}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p id="kit-paper" className="mb-2 text-label font-medium text-fg">
            Paper
          </p>
          <div role="radiogroup" aria-labelledby="kit-paper" className="flex flex-wrap gap-2">
            {kitPapers.map((p) => (
              <label key={p.id} className={cn('flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-label focus-within:ring-2 focus-within:ring-focus', d.paper === p.id ? 'border-action bg-action-soft font-semibold text-fg' : 'border-line bg-raised text-fg-muted hover:border-line-strong')}>
                <input type="radio" name="kit-paper" className="sr-only" checked={d.paper === p.id} onChange={() => set({ paper: p.id })} />
                <span aria-hidden className="h-4 w-4 rounded-full border border-line-strong" style={{ background: paperColour(p.id, d.ink) }} />
                {p.label}
              </label>
            ))}
          </div>
          {d.paper !== 'white' && <p className="mt-2 text-caption text-fg-subtle">Printed as a background colour at home; ordered prints use real {d.paper === 'cream' ? 'cream' : 'tinted'} card.</p>}
        </div>

        <div>
          <p id="kit-ink" className="mb-2 text-label font-medium text-fg">
            Colour
          </p>
          <div role="radiogroup" aria-labelledby="kit-ink" className="flex flex-wrap items-center gap-2">
            <Swatch label={`Your page accent${pageOk ? '' : ' (too light to print)'}`} colour={pageInk} selected={inkMode === 'page'} onSelect={() => onInk('page')} />
            {presets.map((c) => (
              <Swatch key={c} label={c === '#111111' ? 'Black' : c} colour={c} selected={(inkMode === 'black' && c === '#111111') || (inkMode === 'custom' && customInk.toUpperCase() === c)} onSelect={() => (c === '#111111' ? onInk('black') : onInk('custom', c))} />
            ))}
            <label className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-line-strong text-caption font-semibold text-fg-muted focus-within:ring-2 focus-within:ring-focus" title="Choose any colour">
              <span aria-hidden>+</span>
              <span className="sr-only">Choose any colour</span>
              <input type="color" className="absolute inset-0 cursor-pointer opacity-0" value={isHexColor(customInk) ? customInk : '#1E3A8A'} onChange={(e) => onInk('custom', e.target.value.toUpperCase())} />
            </label>
          </div>
          {inkMode === 'page' && !pageOk && <p className="mt-2 text-caption text-warning">Your accent is too light to read on paper — pick a deeper colour.</p>}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-line pt-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-label font-semibold text-fg">Text and code sizes</p>
          <button
            type="button"
            className="text-caption font-medium text-action underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
            disabled={disabled || (d.nameScale === 1 && d.textScale === 1 && d.qrScale === 1)}
            onClick={() => set({ nameScale: 1, textScale: 1, qrScale: 1 })}
          >
            Reset sizes
          </button>
        </div>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
          <RangeInput label="Name & headline" value={d.nameScale} min={0.8} max={1.5} onChange={(v) => set({ nameScale: v })} disabled={disabled} />
          <RangeInput label="Other text" value={d.textScale} min={0.85} max={1.35} onChange={(v) => set({ textScale: v })} disabled={disabled} />
          <RangeInput label="QR code" value={d.qrScale} min={0.85} max={1.25} onChange={(v) => set({ qrScale: v })} disabled={disabled} />
        </div>
        <p className="text-caption text-fg-subtle">Bigger text helps older customers and people reading from a distance. The print check warns you if something runs out of room or the code gets too small to scan.</p>
      </div>

      {item === 'card' && <Switch id="kit-back" checked={d.cardBack} onChange={(v) => set({ cardBack: v })} label="Print a back side" description="Logo and name on the back. Printed on a second sheet — flip on the long edge when printing double-sided." />}
    </fieldset>
  );
}

function Swatch({ label, colour, selected, onSelect }: { label: string; colour: string; selected: boolean; onSelect: () => void }) {
  return (
    <label className={cn('relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full ring-offset-2 ring-offset-raised focus-within:ring-2 focus-within:ring-focus', selected && 'ring-2 ring-fg')} style={{ background: colour }} title={label}>
      <input type="radio" name="kit-ink-swatch" className="sr-only" checked={selected} onChange={onSelect} aria-label={label} />
      {selected && <CheckIcon size={14} strokeWidth={3} className={contrastRatio('#FFFFFF', colour) >= 3 ? 'text-white' : 'text-black'} aria-hidden />}
    </label>
  );
}

/** Tiny wireframe of each design, painted in the chosen colour and paper. */
function StyleThumb({ style, ink, paper }: { style: KitStyle; ink: string; paper: string }) {
  const bold = style === 'bold';
  return (
    <span aria-hidden className="relative block h-12 overflow-hidden rounded border border-line" style={{ background: bold ? ink : paper }}>
      {style === 'classic' && <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: ink }} />}
      {style === 'photo' && <span className="absolute inset-y-0 left-0 w-1/3 bg-neutral-400" />}
      <span className={cn('absolute top-2.5 h-1.5 w-8 rounded-full', style === 'photo' ? 'left-[42%]' : 'left-3')} style={{ background: bold ? '#fff' : ink }} />
      <span className={cn('absolute top-5 h-1 w-6 rounded-full opacity-60', style === 'photo' ? 'left-[42%]' : 'left-3')} style={{ background: bold ? '#fff' : '#737373' }} />
      {style === 'minimal' && <span className="absolute left-3 right-12 top-[30px] h-px" style={{ background: ink }} />}
      <span className="absolute bottom-2 right-2 h-6 w-6 rounded-sm bg-white ring-1 ring-neutral-300" />
    </span>
  );
}
