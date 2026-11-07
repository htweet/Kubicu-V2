import React from 'react';
import { CheckIcon, AlertTriangleIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { SignatureTheme } from '../../data/signatureThemes';
import { themeMoodLabels } from '../../data/signatureThemes';
import { themeFonts } from '../../data/themeFonts';
import { useT } from '../../contexts/LocaleContext';
import { themeContrast } from '../../utils/validation';
import { CONTRAST_TARGET, formatRatio } from '../../utils/contrast';
import { Sheet } from '../ui/Sheet';
import { ThemeComponentBoard } from './ThemeComponentBoard';
import { cn } from '../../utils/cn';

interface ThemeSpecSheetProps {
  open: boolean;
  onClose: () => void;
  sig: SignatureTheme;
  theme: PageTheme;
  modeLabel: string;
}

const finishLabels = { matte: 'Matte', satin: 'Satin sheen', glass: 'Glass', lacquer: 'Lacquer' } as const;
const buttonLabels = { solid: 'Solid', gradient: 'Gradient', gloss: 'Gloss', glow: 'Glow edge' } as const;
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/**
 * The full specification of one theme version (D164): tokens, recipes, type, components, readability, fallbacks.
 * D337: labels, values and notes are translated. Colour codes, CSS recipes, font names and the theme's name stay as written.
 */
export function ThemeSpecSheet({ open, onClose, sig, theme, modeLabel }: ThemeSpecSheetProps) {
  const { t: tr } = useT();
  const m = theme.material ?? {};
  const contrast = themeContrast(theme);
  const roles: [string, string | undefined][] = [
    ['Page background', theme.background],
    ['Surface', theme.surface],
    ['Text', theme.text],
    ['Muted text', theme.mutedText],
    ['Primary action', theme.accent],
    ['Action text', theme.accentText],
    ['Secondary', m.secondary],
    ['Border', m.border],
    ['Focus ring', m.focus],
  ];
  const fallbacks = [
    m.surfaceFinish === 'glass' && 'Glass and blur become the solid surface for reduced transparency and data saver; phones get lighter blur.',
    m.backdrop && 'The atmosphere becomes the flat background in data saver.',
    m.backdropMobile && 'Phones use a simpler atmosphere.',
    m.sheen && 'The hover sheen on primary actions is off for reduced motion.',
    'Inverted sections drop glass, gradients and glow.',
  ].filter(Boolean) as string[];

  const surface = [
    tr(finishLabels[m.surfaceFinish ?? 'matte']),
    m.surfaceFinish === 'glass' ? tr('Opacity {o}% · blur {b}px', { o: m.glassOpacity ?? 60, b: m.glassBlur ?? 18 }) : '',
    m.edgeHighlight ? tr('Edge light') : '',
  ]
    .filter(Boolean)
    .join(' · ');
  const bodyFont = { fontFamily: m.bodyFont ? themeFonts[m.bodyFont].stack : undefined };
  const headingFont = { fontFamily: m.headingFont ? themeFonts[m.headingFont].stack : undefined, fontWeight: m.headingWeight, letterSpacing: m.headingTracking };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`${sig.name} · ${modeLabel}`}
      description={`${String(sig.number).padStart(2, '0')} · ${tr(themeMoodLabels[sig.mood])} — ${tr(sig.personality)}`}
      size="lg"
    >
      <div className="flex flex-col gap-8 pb-6">
        <Section title={tr('Colour roles')}>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
            {roles
              .filter(([, v]) => v)
              .map(([label, v]) => (
                <li key={label} className="flex min-w-0 items-center gap-2.5">
                  <span aria-hidden className="h-8 w-8 shrink-0 rounded-md border border-line" style={{ background: v }} />
                  <span className="min-w-0">
                    <span className="block truncate text-caption text-fg">{tr(label)}</span>
                    <span className="block truncate font-mono text-[11px] text-fg-subtle">{v}</span>
                  </span>
                </li>
              ))}
          </ul>
        </Section>

        <Section title={tr('Materials')}>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-caption">
            <Row k={tr('Surface')} v={surface} />
            <Row k={tr('Depth')} v={tr(m.shadow ? cap(m.shadow) : 'None')} />
            <Row k={tr('Corners')} v={tr(m.radius ? cap(m.radius) : 'From button shape')} />
            <Row k={tr('Primary action')} v={tr(buttonLabels[m.buttonFinish ?? 'solid'])} />
            <Row k={tr('Photo frame')} v={tr(cap(m.imageFrame ?? 'none'))} />
            <Row k={tr('Links')} v={tr(cap(m.linkStyle ?? 'underline'))} />
          </dl>
          {m.backdrop && (
            <div className="mt-4">
              <p className="text-caption text-fg-muted">{tr('Atmosphere recipe')}</p>
              <div className="mt-1.5 flex gap-3">
                <span aria-hidden className="h-16 w-12 shrink-0 rounded-md border border-line" style={{ background: m.backdrop }} />
                <code className="min-w-0 flex-1 break-all rounded-md bg-sunken p-2 font-mono text-[11px] leading-relaxed text-fg-muted">{m.backdrop}</code>
              </div>
            </div>
          )}
        </Section>

        <Section title={tr('Type')}>
          <div className="rounded-md border border-line p-4" style={{ background: theme.background, color: theme.text }}>
            <p className="text-[30px] leading-[1.05]" style={headingFont}>
              {tr('Display heading')}
            </p>
            <p className="mt-2 text-[20px] leading-tight" style={headingFont}>
              {tr('Section heading')}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed" style={bodyFont}>
              {tr('Body text sits comfortably at 15–17px with relaxed line height.')}
            </p>
            <p className="mt-1 text-[12.5px]" style={{ ...bodyFont, color: theme.mutedText }}>
              {tr('Caption · metadata · 12–13px')}
            </p>
          </div>
          <p className="mt-2 text-caption text-fg-subtle">
            {m.headingFont ? themeFonts[m.headingFont].name : tr('Pair default')} {m.headingWeight ?? ''} · {tr('tracking {t}', { t: m.headingTracking ?? '0' })} / {m.bodyFont ? themeFonts[m.bodyFont].name : 'Inter'}
          </p>
        </Section>

        <Section title={tr('Components')}>
          <ThemeComponentBoard theme={theme} />
        </Section>

        <Section title={tr('Readability')}>
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
            {(
              [
                ['Text on background (worst atmosphere colour)', contrast.text],
                ['Muted text', contrast.muted],
                ['Primary action text (both gradient ends)', contrast.button],
              ] as const
            ).map(([label, r]) => {
              const pass = r >= CONTRAST_TARGET;
              const large = r >= 3;
              return (
                <li key={label} className="flex items-center justify-between gap-3 px-3 py-2.5 text-caption">
                  <span className="text-fg-muted">{tr(label)}</span>
                  <span className={cn('inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-semibold tabular-nums', pass ? 'text-success' : large ? 'text-warning' : 'text-danger')}>
                    {pass ? <CheckIcon size={12} aria-hidden /> : <AlertTriangleIcon size={12} aria-hidden />}
                    {formatRatio(r)} · {pass ? 'AA' : tr(large ? 'Large text only' : 'Fails')}
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title={tr('Switches off automatically')}>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-caption text-fg-muted">
            {fallbacks.map((f) => (
              <li key={f}>{tr(f)}</li>
            ))}
          </ul>
        </Section>
      </div>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-label font-semibold text-fg">{title}</h3>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-fg-subtle">{k}</dt>
      <dd className="mt-0.5 truncate text-fg">{v}</dd>
    </div>
  );
}
