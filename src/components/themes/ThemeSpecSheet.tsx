import React from 'react';
import { CheckIcon, AlertTriangleIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { SignatureTheme } from '../../data/signatureThemes';
import { themeMoodLabels } from '../../data/signatureThemes';
import { themeFonts } from '../../data/themeFonts';
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

/** The full specification of one theme version (D164): tokens, recipes, type, components, readability, fallbacks. */
export function ThemeSpecSheet({ open, onClose, sig, theme, modeLabel }: ThemeSpecSheetProps) {
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
  ['Focus ring', m.focus]];

  const fallbacks = [
  m.surfaceFinish === 'glass' && 'Glass and blur become the solid surface for reduced transparency and data saver; phones get lighter blur.',
  m.backdrop && 'The atmosphere becomes the flat background in data saver.',
  m.backdropMobile && 'Phones use a simpler atmosphere.',
  m.sheen && 'The hover sheen on primary actions is off for reduced motion.',
  'Inverted sections drop glass, gradients and glow.'].
  filter(Boolean) as string[];

  return (
    <Sheet open={open} onClose={onClose} title={`${sig.name} · ${modeLabel}`} description={`${String(sig.number).padStart(2, '0')} · ${themeMoodLabels[sig.mood]} — ${sig.personality}`} size="lg">
      <div className="flex flex-col gap-8 pb-6">
        <Section title="Colour roles">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
            {roles.filter(([, v]) => v).map(([label, v]) =>
            <li key={label} className="flex min-w-0 items-center gap-2.5">
                <span aria-hidden className="h-8 w-8 shrink-0 rounded-md border border-line" style={{ background: v }} />
                <span className="min-w-0">
                  <span className="block truncate text-caption text-fg">{label}</span>
                  <span className="block truncate font-mono text-[11px] text-fg-subtle">{v}</span>
                </span>
              </li>
            )}
          </ul>
        </Section>

        <Section title="Materials">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-caption">
            <Row k="Surface" v={`${finishLabels[m.surfaceFinish ?? 'matte']}${m.surfaceFinish === 'glass' ? ` · ${m.glassOpacity ?? 60}% · blur ${m.glassBlur ?? 18}px` : ''}${m.edgeHighlight ? ' · edge light' : ''}`} />
            <Row k="Depth" v={m.shadow ? m.shadow[0].toUpperCase() + m.shadow.slice(1) : 'None'} />
            <Row k="Corners" v={m.radius ? m.radius[0].toUpperCase() + m.radius.slice(1) : 'From button shape'} />
            <Row k="Primary action" v={buttonLabels[m.buttonFinish ?? 'solid']} />
            <Row k="Photo frame" v={m.imageFrame ?? 'none'} />
            <Row k="Links" v={m.linkStyle ?? 'underline'} />
          </dl>
          {m.backdrop &&
          <div className="mt-4">
              <p className="text-caption text-fg-muted">Atmosphere recipe</p>
              <div className="mt-1.5 flex gap-3">
                <span aria-hidden className="h-16 w-12 shrink-0 rounded-md border border-line" style={{ background: m.backdrop }} />
                <code className="min-w-0 flex-1 break-all rounded-md bg-sunken p-2 font-mono text-[11px] leading-relaxed text-fg-muted">{m.backdrop}</code>
              </div>
            </div>
          }
        </Section>

        <Section title="Type">
          <div className="rounded-md border border-line p-4" style={{ background: theme.background, color: theme.text }}>
            <p className="text-[30px] leading-[1.05]" style={{ fontFamily: m.headingFont ? themeFonts[m.headingFont].stack : undefined, fontWeight: m.headingWeight, letterSpacing: m.headingTracking }}>Display heading</p>
            <p className="mt-2 text-[20px] leading-tight" style={{ fontFamily: m.headingFont ? themeFonts[m.headingFont].stack : undefined, fontWeight: m.headingWeight, letterSpacing: m.headingTracking }}>Section heading</p>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ fontFamily: m.bodyFont ? themeFonts[m.bodyFont].stack : undefined }}>Body text sits comfortably at 15–17px with relaxed line height.</p>
            <p className="mt-1 text-[12.5px]" style={{ color: theme.mutedText, fontFamily: m.bodyFont ? themeFonts[m.bodyFont].stack : undefined }}>Caption · metadata · 12–13px</p>
          </div>
          <p className="mt-2 text-caption text-fg-subtle">
            {m.headingFont ? themeFonts[m.headingFont].name : 'Pair default'} {m.headingWeight ?? ''} · tracking {m.headingTracking ?? '0'} / {m.bodyFont ? themeFonts[m.bodyFont].name : 'Inter'}
          </p>
        </Section>

        <Section title="Components">
          <ThemeComponentBoard theme={theme} />
        </Section>

        <Section title="Readability">
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
            {(
            [
            ['Text on background (worst atmosphere colour)', contrast.text],
            ['Muted text', contrast.muted],
            ['Primary action text (both gradient ends)', contrast.button]] as
            const).
            map(([label, r]) => {
              const pass = r >= CONTRAST_TARGET;
              const large = r >= 3;
              return (
                <li key={label} className="flex items-center justify-between gap-3 px-3 py-2.5 text-caption">
                  <span className="text-fg-muted">{label}</span>
                  <span className={cn('inline-flex shrink-0 items-center gap-1 font-semibold tabular-nums', pass ? 'text-success' : large ? 'text-warning' : 'text-danger')}>
                    {pass ? <CheckIcon size={12} aria-hidden /> : <AlertTriangleIcon size={12} aria-hidden />}
                    {formatRatio(r)} · {pass ? 'AA' : large ? 'Large text only' : 'Fails'}
                  </span>
                </li>);

            })}
          </ul>
        </Section>

        <Section title="Switches off automatically">
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-caption text-fg-muted">
            {fallbacks.map((f) =>
            <li key={f}>{f}</li>
            )}
          </ul>
        </Section>
      </div>
    </Sheet>);

}

function Section({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <section>
      <h3 className="mb-3 text-label font-semibold text-fg">{title}</h3>
      {children}
    </section>);

}

function Row({ k, v }: {k: string;v: string;}) {
  return (
    <div className="min-w-0">
      <dt className="text-fg-subtle">{k}</dt>
      <dd className="mt-0.5 truncate capitalize text-fg">{v}</dd>
    </div>);

}