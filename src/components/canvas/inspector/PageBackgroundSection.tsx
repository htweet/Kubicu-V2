import React, { useRef, useState } from 'react';
import { ImageIcon, LockIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import type { BackgroundFocus, PageBackgroundMode, PageGradient, PageTheme } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useT } from '../../../contexts/LocaleContext';
import { usePlan } from '../../../contexts/PlanContext';
import { useUpgrade } from '../../../contexts/UpgradeContext';
import { planAtLeast } from '../../../data/plans';
import { readImageFile, prepareImage } from '../../../utils/domains/kitImages';
import { FOCUS_POINTS, GRADIENT_ANGLES, averageTone, backgroundMode, defaultGradient, gradientCss, gradientSuggestions } from '../../../utils/pageBackground';
import { Button } from '../../ui/Button';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { Switch } from '../../ui/Switch';
import { ColorField } from './ColorField';
import { cn } from '../../../utils/cn';

const MAX_UPLOAD = 5 * 1024 * 1024;

/**
 * Canvas → Theme → Page background (D182): Theme default, Solid, Gradient or Image.
 * Solid is on every plan; Gradient and Image need Creator (pages that drop a plan keep theirs until edited).
 */
export function PageBackgroundSection() {
  const { t: tr } = useT();
  const { state, actions } = useEditor();
  const theme = state.draft.theme;
  const mode = backgroundMode(theme);
  const creator = planAtLeast(usePlan().id, 'creator');
  const { openUpgrade } = useUpgrade();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState('');
  const [busy, setBusy] = useState(false);
  const hasSignatureBackdrop = Boolean(theme.material?.backdrop);

  const update = (patch: Partial<PageTheme>, field: string) => actions.updateTheme(patch, `bg-${field}`);
  const gradient = theme.backgroundGradient ?? defaultGradient(theme);
  const setGradient = (patch: Partial<PageGradient>, field: string) => update({ backgroundGradient: { ...gradient, ...patch } }, field);

  const choose = (next: PageBackgroundMode) => {
    if ((next === 'gradient' || next === 'image') && !creator && mode !== next) {
      openUpgrade({ plan: 'creator', feature: next === 'gradient' ? 'Gradient page backgrounds' : 'Your own background image' });
      return;
    }
    const patch: Partial<PageTheme> = { backgroundMode: next };
    if (next === 'gradient' && !theme.backgroundGradient) patch.backgroundGradient = defaultGradient(theme);
    update(patch, 'mode');
  };

  const upload = async (file: File) => {
    setUploadError('');
    if (file.size > MAX_UPLOAD) {
      setUploadError('That image is over 5 MB. Choose a smaller one.');
      return;
    }
    setBusy(true);
    try {
      const img = await readImageFile(file);
      const prepared = prepareImage(img, 1800, { jpeg: true });
      update({ backgroundMode: 'image', backgroundImage: prepared.dataUrl, backgroundTone: averageTone(img), backgroundVeil: theme.backgroundVeil ?? 40 }, 'image');
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'We couldn’t use that image.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const modeOptions: {value: PageBackgroundMode;label: string;locked: boolean;}[] = [
  { value: 'theme', label: 'Theme', locked: false },
  { value: 'solid', label: 'Solid', locked: false },
  { value: 'gradient', label: 'Gradient', locked: !creator && mode !== 'gradient' },
  { value: 'image', label: 'Image', locked: !creator && mode !== 'image' }];


  return (
    <section aria-labelledby="theme-page-bg" className="flex flex-col gap-3.5 border-t border-line pt-5">
      <h3 id="theme-page-bg" className="text-label font-medium text-fg">
        {tr('Page background')}
      </h3>

      <div role="radiogroup" aria-labelledby="theme-page-bg" className="grid grid-cols-4 gap-1.5">
        {modeOptions.map((o) => {
          const active = mode === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => choose(o.value)}
              className={cn(
                'flex min-w-0 flex-col items-center gap-1 rounded-sm border px-1 pb-1.5 pt-1.5 text-[11.5px] font-medium transition-[border-color,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                active ? 'border-select bg-select/10 text-fg' : 'border-line text-fg-muted hover:border-line-strong'
              )}>
              
              <span aria-hidden className="h-7 w-full rounded-[4px] border border-line" style={{ background: swatchFor(o.value, theme, gradient) }} />
              <span className="flex items-center gap-1 truncate">
                {tr(o.label)}
                {o.locked && <LockIcon size={10} aria-label={tr('Creator plan and above')} />}
              </span>
            </button>);

        })}
      </div>

      {mode === 'theme' &&
      <p className="text-caption text-fg-subtle">
          {tr(hasSignatureBackdrop ? 'Using this theme’s own atmosphere.' : theme.backgroundImage ? 'Using this template’s artwork.' : 'Using the theme’s background colour.')} {tr('Pick another option to use your own.')}
        </p>
      }

      {mode === 'solid' &&
      <>
          <ColorField id="bg-solid" label={tr('Colour')} value={theme.background} onChange={(background) => update({ background, presetId: 'custom' }, 'solid')} />
          <p className="text-caption text-fg-subtle">
            {tr(hasSignatureBackdrop || theme.backgroundImage ? 'Replaces the theme’s gradient and artwork. Cards, fonts and buttons stay as they are.' : 'One plain colour behind the whole page.')}
          </p>
        </>
      }

      {mode === 'gradient' &&
      <div className="flex flex-col gap-3.5">
          <div aria-hidden className="h-12 rounded-sm border border-line" style={{ background: gradientCss(gradient) }} />
          <div>
            <p className="mb-1.5 text-caption text-fg-muted">{tr('Start from your colours')}</p>
            <div className="grid grid-cols-4 gap-1.5">
              {gradientSuggestions(theme).map((s) =>
            <button
              key={s.name}
              type="button"
              onClick={() => update({ backgroundGradient: s.gradient }, 'suggest')}
              className="flex min-w-0 flex-col gap-1 rounded-sm text-[11px] text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              
                  <span aria-hidden className="h-7 w-full rounded-[4px] border border-line" style={{ background: gradientCss(s.gradient) }} />
                  <span className="truncate">{tr(s.name)}</span>
                </button>
            )}
            </div>
          </div>
          <fieldset className="flex min-w-0 flex-col gap-2">
            <legend className="mb-1 text-caption text-fg-muted">{tr('Colours')}</legend>
            {gradient.stops.map((stop, i) =>
          <div key={i} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <ColorField
                id={`bg-stop-${i}`}
                label={tr(['First colour', 'Second colour', 'Third colour'][i])}
                value={stop}
                onChange={(v) => setGradient({ stops: gradient.stops.map((s, j) => j === i ? v : s) }, `stop-${i}`)} />
              
                </div>
                {gradient.stops.length > 2 &&
            <button
              type="button"
              aria-label={tr(['Remove first colour', 'Remove second colour', 'Remove third colour'][i])}
              onClick={() => setGradient({ stops: gradient.stops.filter((_, j) => j !== i) }, 'remove-stop')}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-fg-subtle hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              
                    <Trash2Icon size={14} aria-hidden />
                  </button>
            }
              </div>
          )}
            {gradient.stops.length < 3 &&
          <Button size="sm" variant="tertiary" className="self-start" leadingIcon={PlusIcon} onClick={() => setGradient({ stops: [...gradient.stops, theme.background] }, 'add-stop')}>
                {tr('Add a third colour')}
              </Button>
          }
          </fieldset>
          <Field id="bg-kind" label="Shape">
            <Segmented
            ariaLabel="Gradient shape"
            fullWidth
            size="sm"
            value={gradient.kind}
            onChange={(kind) => setGradient({ kind }, 'kind')}
            options={[
            { value: 'linear', label: 'Straight' },
            { value: 'radial', label: 'Radial' }]
            } />
          
          </Field>
          <fieldset className="min-w-0">
            <legend className="mb-1.5 text-caption text-fg-muted">{tr(gradient.kind === 'radial' ? 'Light comes from' : 'Direction')}</legend>
            <div className="grid grid-cols-8 gap-1">
              {GRADIENT_ANGLES.map((a) =>
            <button
              key={a}
              type="button"
              aria-pressed={gradient.angle === a}
              aria-label={tr(directionName(a))}
              onClick={() => setGradient({ angle: a }, 'angle')}
              className={cn(
                'flex h-9 items-center justify-center rounded-sm border text-fg-muted transition-[border-color,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                gradient.angle === a ? 'border-select bg-select/10 text-fg' : 'border-line hover:border-line-strong'
              )}>
              
                  <span aria-hidden className="text-[14px] leading-none" style={{ transform: `rotate(${a}deg)` }}>
                    ↑
                  </span>
                </button>
            )}
            </div>
          </fieldset>
          <Switch
          id="bg-calm"
          label="Calmer on phones"
          description="A gentle two-colour fade on small screens, so text stays easy to read."
          checked={gradient.calmOnPhones}
          onChange={(calmOnPhones) => setGradient({ calmOnPhones }, 'calm')} />
        
        </div>
      }

      {mode === 'image' &&
      <div className="flex flex-col gap-3.5">
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" tabIndex={-1} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          {theme.backgroundImage ?
        <div className="flex items-center gap-3">
              <img src={theme.backgroundImage} alt="" className="h-16 w-12 shrink-0 rounded-sm border border-line object-cover" style={{ objectPosition: theme.backgroundFocus ?? 'center' }} />
              <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                <Button size="sm" variant="secondary" loading={busy} onClick={() => fileRef.current?.click()}>
                  {tr('Replace')}
                </Button>
                <Button size="sm" variant="tertiary" onClick={() => update({ backgroundImage: undefined, backgroundTone: undefined }, 'remove-image')}>
                  {tr('Remove')}
                </Button>
              </div>
            </div> :

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex flex-col items-center gap-1.5 rounded-sm border border-dashed border-line-strong px-3 py-5 text-center text-caption text-fg-muted hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          
              <ImageIcon size={18} aria-hidden />
              <span className="font-medium text-fg">{tr(busy ? 'Preparing image…' : 'Upload an image')}</span>
              <span>{tr('PNG, JPG or WebP, under 5 MB. We shrink it for you.')}</span>
            </button>
        }
          {uploadError &&
        <p role="alert" className="text-caption text-danger">
              {tr(uploadError)}
            </p>
        }
          {theme.backgroundImage &&
        <>
              <fieldset className="min-w-0">
                <legend className="mb-1.5 text-caption text-fg-muted">{tr('Keep in view when cropped')}</legend>
                <div className="grid w-[120px] grid-cols-3 gap-1">
                  {FOCUS_POINTS.map((p) => {
                const active = (theme.backgroundFocus ?? 'center') === p;
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={active}
                    aria-label={tr('Keep in view: {spot}', { spot: tr(p) })}
                    onClick={() => update({ backgroundFocus: p as BackgroundFocus }, 'focus')}
                    className={cn(
                      'flex h-9 items-center justify-center rounded-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                      active ? 'border-select bg-select/10' : 'border-line hover:border-line-strong'
                    )}>
                    
                        <span aria-hidden className={cn('h-2 w-2 rounded-full', active ? 'bg-select' : 'bg-line-strong')} />
                      </button>);

              })}
                </div>
              </fieldset>
              <Switch
            id="bg-scroll"
            label="Scroll with the page"
            description={theme.backgroundScroll ? 'The image covers the full page and moves as visitors scroll.' : 'Off: the image stays put while content scrolls over it.'}
            checked={Boolean(theme.backgroundScroll)}
            onChange={(backgroundScroll) => update({ backgroundScroll }, 'scroll')} />
          
              <VeilSlider theme={theme} onChange={(v) => update({ backgroundVeil: v }, 'veil')} />
              <p className="text-caption text-fg-subtle">
                {tr(
              theme.backgroundTone ?
              'Readability is checked against the image’s average colour under the veil — busy areas can still be harder to read, so preview before publishing.' :
              'This image hasn’t been measured, so readability is checked against the background colour only. Preview before publishing.'
            )}
              </p>
            </>
        }
        </div>
      }

      {mode === 'theme' && theme.backgroundImage &&
      <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <img src={theme.backgroundImage} alt="" className="h-16 w-10 shrink-0 rounded-sm border border-line object-cover" />
            <p className="min-w-0 flex-1 text-caption text-fg-subtle">{tr('Stays behind your page as visitors scroll. Raise the veil if text gets hard to read, or pick Image to replace it.')}</p>
          </div>
          <VeilSlider theme={theme} onChange={(v) => update({ backgroundVeil: v }, 'veil')} />
          <Button size="sm" variant="secondary" className="self-start" onClick={() => update({ backgroundImage: undefined }, 'remove-art')}>
            {tr('Remove artwork')}
          </Button>
        </div>
      }

      {(mode === 'gradient' || mode === 'image') &&
      <p className="text-caption text-fg-subtle">{tr('Devices set to reduce transparency, and data-saving mode, show the plain background colour instead.')}</p>
      }
    </section>);

}

function VeilSlider({ theme, onChange }: {theme: PageTheme;onChange: (v: number) => void;}) {
  const { t: tr } = useT();
  const value = theme.backgroundVeil ?? 40;
  return (
    <div>
      <label htmlFor="theme-veil" className="mb-1 flex items-center justify-between text-caption text-fg-muted">
        <span>{tr('Readability layer')}</span>
        <span className="tabular-nums">{value}%</span>
      </label>
      <input id="theme-veil" type="range" min={0} max={90} step={5} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--color-action,#2563eb)]" />
    </div>);

}

function swatchFor(mode: PageBackgroundMode, theme: PageTheme, gradient: PageGradient): string {
  switch (mode) {
    case 'solid':
      return theme.background;
    case 'gradient':
      return gradientCss(gradient);
    case 'image':
      return theme.backgroundImage && theme.backgroundMode === 'image' ? `center / cover url("${theme.backgroundImage}")` : `repeating-linear-gradient(45deg, ${theme.surface} 0 6px, ${theme.background} 6px 12px)`;
    default:
      return theme.material?.backdrop ?? theme.background;
  }
}

function directionName(angle: number): string {
  return ['Towards top', 'Towards top right', 'Towards right', 'Towards bottom right', 'Towards bottom', 'Towards bottom left', 'Towards left', 'Towards top left'][Math.round(angle / 45) % 8];
}