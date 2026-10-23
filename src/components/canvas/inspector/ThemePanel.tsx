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

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="theme-presets">
        <h3 id="theme-presets" className="mb-2.5 text-label font-medium text-fg">
          Theme
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
        <Field id="theme-font" label="Typography">
          <Segmented
            ariaLabel="Font pairing"
            fullWidth
            size="sm"
            value={theme.fontPair}
            onChange={(fontPair) => actions.updateTheme({ fontPair }, 'fontPair')}
            options={fontPairs.map((f) => ({ value: f.id, label: f.name }))} />
          
        </Field>
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