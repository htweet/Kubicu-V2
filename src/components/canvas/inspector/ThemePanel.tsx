import React from 'react';
import { CheckIcon, AlertTriangleIcon, AlertCircleIcon } from 'lucide-react';
import { CONTRAST_MIN_PUBLISH, CONTRAST_TARGET } from '../../../utils/contrast';
import { contrastCopy, suggestContrastFix, type ContrastFix } from '../../../utils/contrastFixes';
import { Button } from '../../ui/Button';
import type { PageTheme } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { fontPairs, pageThemePresets } from '../../../data/pageThemes';
import { themeContrast } from '../../../utils/validation';
import { formatRatio } from '../../../utils/contrast';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { ColorField } from './ColorField';
import { SavedThemes, ThemeSwatch } from './SavedThemes';
import { cn } from '../../../utils/cn';
import { parseSignatureId, signatureTheme, signatureThemes, type ThemeMode } from '../../../data/signatureThemes';

type ColorKey = 'background' | 'surface' | 'text' | 'mutedText' | 'accent' | 'accentText';

export function ThemePanel() {
  const { state, actions } = useEditor();
  const theme = state.draft.theme;
  const contrast = themeContrast(theme);
  const setColor = (key: ColorKey) => (value: string) => {
    const patch: Partial<PageTheme> = { presetId: 'custom' };
    patch[key] = value;
    actions.updateTheme(patch, key);
  };

  const signature = parseSignatureId(theme.presetId);
  const sigModes = signature ? Object.keys(signature.theme.modes) as ThemeMode[] : [];

  return (
    // min-w-0 + overflow-x-hidden: nothing in the panel may push it wider than the inspector.
    <div className="flex min-w-0 flex-col gap-6 overflow-x-hidden">
      <section aria-labelledby="theme-signature">
        <div className="mb-2.5 flex items-baseline justify-between gap-2">
          <h3 id="theme-signature" className="text-label font-medium text-fg">
            Signature themes
          </h3>
          <span className="text-caption text-fg-subtle">{signatureThemes.length}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {signatureThemes.map((t) =>
          <ThemeSwatch
            key={t.id}
            name={t.name}
            theme={signatureTheme(t)}
            active={signature?.theme.id === t.id}
            onClick={() => actions.applyThemePreset(signatureTheme(t))} />

          )}
        </div>
        {signature &&
        <div className="mt-3 flex flex-col gap-2">
            <p className="text-caption text-fg-subtle">{signature.theme.personality}</p>
            {sigModes.length > 1 &&
          <Segmented
            ariaLabel="Theme mode"
            fullWidth
            size="sm"
            value={signature.mode}
            onChange={(m) => actions.applyThemePreset(signatureTheme(signature.theme, m as ThemeMode))}
            options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' }]
            } />

          }
          </div>
        }
      </section>

      <section aria-labelledby="theme-presets" className="border-t border-line pt-5">
        <h3 id="theme-presets" className="mb-2.5 text-label font-medium text-fg">
          Classic
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {pageThemePresets.map((preset) =>
          <ThemeSwatch
            key={preset.id}
            name={preset.name}
            theme={preset.theme}
            active={theme.presetId === preset.id}
            onClick={() => actions.applyThemePreset(preset.theme)} />

          )}
        </div>
        {theme.presetId === 'custom' &&
        <p className="mt-2 text-caption text-fg-subtle">Custom colours — save them below to reuse, or pick a theme to reset.</p>
        }
      </section>

      <SavedThemes />

      <section aria-labelledby="theme-colours" className="flex flex-col gap-2.5 border-t border-line pt-5">
        <h3 id="theme-colours" className="mb-0.5 text-label font-medium text-fg">
          Colours
        </h3>
        <ColorField id="c-bg" label="Background" value={theme.background} onChange={setColor('background')} />
        <ColorField id="c-surface" label="Cards" value={theme.surface} onChange={setColor('surface')} />
        <ColorField id="c-text" label="Text" value={theme.text} onChange={setColor('text')} />
        <ColorField id="c-muted" label="Secondary text" value={theme.mutedText} onChange={setColor('mutedText')} />
        <ColorField id="c-accent" label="Featured button" value={theme.accent} onChange={setColor('accent')} />
        <ColorField id="c-accent-text" label="Featured button text" value={theme.accentText} onChange={setColor('accentText')} />
      </section>

      {theme.backgroundImage &&
      <section aria-labelledby="theme-artwork" className="flex flex-col gap-3 border-t border-line pt-5">
          <h3 id="theme-artwork" className="text-label font-medium text-fg">
            Background artwork
          </h3>
          <div className="flex items-center gap-3">
            <img src={theme.backgroundImage} alt="" className="h-16 w-10 shrink-0 rounded-sm border border-line object-cover" />
            <p className="min-w-0 flex-1 text-caption text-fg-subtle">Stays behind your page as visitors scroll. Raise the veil if text gets hard to read.</p>
          </div>
          <label htmlFor="theme-veil" className="flex items-center justify-between text-caption text-fg-muted">
            <span>Veil</span>
            <span className="tabular-nums">{theme.backgroundVeil ?? 40}%</span>
          </label>
          <input
          id="theme-veil"
          type="range"
          min={0}
          max={90}
          step={5}
          value={theme.backgroundVeil ?? 40}
          onChange={(e) => actions.updateTheme({ backgroundVeil: Number(e.target.value) }, 'backgroundVeil')}
          className="w-full accent-[var(--color-action,#2563eb)]" />
        
          <Button size="sm" variant="secondary" className="self-start" onClick={() => actions.updateTheme({ backgroundImage: undefined }, 'backgroundImage')}>
            Remove artwork
          </Button>
        </section>
      }

      <section aria-labelledby="theme-contrast" className="rounded-md border border-line p-3">
        <h3 id="theme-contrast" className="text-label font-medium text-fg">
          Readability
        </h3>
        <p className="mb-2.5 text-caption text-fg-subtle">
          Aim for {CONTRAST_TARGET}:1 or more. Below {CONTRAST_MIN_PUBLISH}:1 you can’t publish until it’s fixed.
        </p>
        <ul className="flex flex-col divide-y divide-line">
          {(
          [
          { key: 'text', label: 'Text on background', ratio: contrast.text },
          { key: 'muted', label: 'Secondary text', ratio: contrast.muted },
          { key: 'button', label: 'Featured button', ratio: contrast.button }] as
          const).
          map((row) =>
          <ContrastRow
            key={row.key}
            label={row.label}
            ratio={row.ratio}
            guidance={contrastCopy[row.key].guidance}
            fix={row.ratio < CONTRAST_TARGET ? suggestContrastFix(theme, row.key) : null}
            onApply={(patch) => actions.updateTheme(patch, `fix-${row.key}-${Date.now()}`)} />

          )}
        </ul>
      </section>

      <section className="flex flex-col gap-4 border-t border-line pt-5">
        {/* Eight pairings don't fit one segmented row — that was pushing the panel sideways. A 4-column grid wraps instead. */}
        <fieldset className="min-w-0">
          <legend className="mb-1.5 text-label font-medium text-fg">Typography</legend>
          <div className="grid grid-cols-4 gap-1.5">
            {fontPairs.map((f) => {
              const active = theme.fontPair === f.id && !theme.material?.headingFont;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => actions.updateTheme({ fontPair: f.id, ...(theme.material ? { material: { ...theme.material, headingFont: undefined, bodyFont: undefined } } : {}) }, 'fontPair')}
                  className={cn(
                    'flex min-w-0 flex-col items-center gap-0.5 rounded-sm border px-1 py-1.5 transition-[border-color,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                    active ? 'border-select bg-select/10 text-fg' : 'border-line text-fg-muted hover:border-line-strong'
                  )}>
                  
                  <span className="text-[17px] leading-none text-fg" style={{ fontFamily: f.display }} aria-hidden>
                    Aa
                  </span>
                  <span className="w-full truncate text-center text-[11px]">{f.name}</span>
                </button>);

            })}
          </div>
          {theme.material?.headingFont && <p className="mt-1.5 text-caption text-fg-subtle">Using the Signature theme’s own fonts. Pick a pairing to replace them.</p>}
        </fieldset>
        <Field id="theme-shape" label="Button shape">
          <Segmented
            ariaLabel="Button shape"
            fullWidth
            size="sm"
            value={theme.buttonShape}
            onChange={(buttonShape) => actions.updateTheme({ buttonShape }, 'buttonShape')}
            options={[
            { value: 'pill', label: 'Pill' },
            { value: 'rounded', label: 'Rounded' },
            { value: 'square', label: 'Square' }]
            } />
          
        </Field>
        <Field id="theme-style" label="Standard buttons">
          <Segmented
            ariaLabel="Standard button style"
            fullWidth
            size="sm"
            value={theme.buttonStyle}
            onChange={(buttonStyle) => actions.updateTheme({ buttonStyle }, 'buttonStyle')}
            options={[
            { value: 'solid', label: 'Card' },
            { value: 'outline', label: 'Outline' },
            { value: 'soft', label: 'Tinted' }]
            } />
          
        </Field>
      </section>
    </div>);

}

interface ContrastRowProps {
  label: string;
  ratio: number;
  guidance: string;
  fix: ContrastFix | null;
  onApply: (patch: Partial<PageTheme>) => void;
}

function ContrastRow({ label, ratio, guidance, fix, onApply }: ContrastRowProps) {
  const pass = ratio >= CONTRAST_TARGET;
  const blocking = ratio < CONTRAST_MIN_PUBLISH;
  const Icon = pass ? CheckIcon : blocking ? AlertCircleIcon : AlertTriangleIcon;
  const status = pass ? 'Pass' : blocking ? 'Blocks publishing' : 'Low';

  return (
    <li className="flex flex-col gap-2 py-2 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-2 text-caption">
        <span className="text-fg-muted">{label}</span>
        <span
          className={cn(
            'inline-flex items-center gap-1 font-semibold tabular-nums',
            pass ? 'text-success' : blocking ? 'text-danger' : 'text-warning'
          )}>
          
          <Icon size={12} aria-hidden />
          {formatRatio(ratio)} · {status}
        </span>
      </div>
      {fix &&
      <div className={cn('rounded-sm px-2.5 py-2', blocking ? 'bg-danger-soft' : 'bg-warning-soft')}>
          {blocking && <p className="text-caption text-fg">{guidance}</p>}
          <div className={cn('flex items-center justify-between gap-2', blocking && 'mt-2')}>
            <span className="flex min-w-0 items-center gap-2 text-caption text-fg">
              <span aria-hidden className="h-4 w-4 shrink-0 rounded-[4px] border border-line-strong" style={{ background: Object.values(fix.theme).find((v) => typeof v === 'string' && v.startsWith('#')) as string }} />
              <span className="truncate">Suggested · {formatRatio(fix.ratio)}</span>
            </span>
            <Button size="sm" variant="secondary" onClick={() => onApply(fix.theme)}>
              {fix.label}
            </Button>
          </div>
        </div>
      }
    </li>);

}