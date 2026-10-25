import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ExternalLinkIcon, InfoIcon, MonitorIcon, ShieldCheckIcon, SmartphoneIcon } from 'lucide-react';
import { findExampleById, goalLabels } from '../../data/examples';
import { eliteGoalLabels, eliteUseCaseLabels } from '../../data/eliteTemplates';
import { pageThemePresets } from '../../data/pageThemes';
import { signatureTheme, signatureThemes } from '../../data/signatureThemes';
import { templatePrice } from '../../data/templateMarket';
import { plans } from '../../data/plans';
import { TemplateLivePreview } from '../../components/templates/TemplateLivePreview';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Segmented } from '../../components/ui/Segmented';
import { blockName } from '../../utils/blocks';
import { formatNaira as formatNgn } from '../../utils/format';
import { cn } from '../../utils/cn';
import { NotFound } from '../NotFound';

export function TemplateDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const example = findExampleById(id);
  const [view, setView] = useState<'phone' | 'desktop'>('phone');
  const [themeId, setThemeId] = useState<string>('original');
  if (!example) return <NotFound embedded />;

  const { doc, elite } = example;
  const price = templatePrice(example.id);
  // Signature themes first (D164), then two classics — preview only, the template's layout never changes.
  const tryThemes = [
  { id: 'original', name: 'As designed', theme: doc.theme },
  ...['aurora-glass', 'pearl-atelier', 'emerald-luxe', 'sunset-haze'].map((sid) => {
    const s = signatureThemes.find((t) => t.id === sid)!;
    return { id: s.id, name: s.name, theme: signatureTheme(s) };
  }),
  ...pageThemePresets.filter((p) => p.theme.presetId !== doc.theme.presetId).slice(0, 2)];

  const theme = tryThemes.find((t) => t.id === themeId)?.theme ?? doc.theme;
  const visible = doc.blocks.filter((b) => !b.visibility.hidden);
  const blockNames = Array.from(new Set(visible.map(blockName)));
  const wide = view === 'desktop';

  return (
    <div className="mx-auto w-full max-w-7xl px-5 pb-20 pt-8 md:px-8">
      <Link to="/templates" className="inline-flex items-center gap-1.5 text-label font-medium text-fg-muted hover:text-fg">
        <ArrowLeftIcon size={15} aria-hidden /> All templates
      </Link>

      <div className={cn('mt-8 grid gap-12 lg:gap-14', wide ? 'lg:grid-cols-1' : 'lg:grid-cols-[minmax(0,1fr)_400px]')}>
        <div className="order-2 flex min-w-0 flex-col items-center gap-4 lg:order-1">
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <Segmented
              ariaLabel="Preview size"
              value={view}
              onChange={setView}
              options={[
              { value: 'phone', label: 'Phone', icon: SmartphoneIcon },
              { value: 'desktop', label: 'Desktop', icon: MonitorIcon }]
              } />
            
            <div role="group" aria-label="Try with theme" className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-caption text-fg-subtle">Try with theme</span>
              {tryThemes.map((t) =>
              <button
                key={t.id}
                type="button"
                aria-pressed={themeId === t.id}
                title={t.name}
                onClick={() => setThemeId(t.id)}
                className={cn('flex h-9 items-center gap-1.5 rounded-full border px-2.5 text-caption font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', themeId === t.id ? 'border-fg text-fg' : 'border-line text-fg-muted hover:border-line-strong')}>
                
                  <span aria-hidden className="flex h-4 w-6 overflow-hidden rounded-full border border-line">
                    <span className="flex-1" style={{ background: t.theme.material?.backdrop ?? t.theme.background }} />
                    <span className="flex-1" style={{ background: t.theme.accent }} />
                  </span>
                  <span className="hidden sm:inline">{t.name}</span>
                </button>
              )}
            </div>
          </div>
          <div className="nm-frame w-full rounded-[34px]">
            <TemplateLivePreview doc={doc} plan={example.plan} device={view} theme={theme} name={example.name} height={760} />
          </div>
        </div>

        <aside className={cn('order-1 lg:order-2', !wide && 'lg:pt-14')}>
          <p className="text-label font-medium text-fg-subtle">
            {elite ? `Elite ${String(elite.number).padStart(2, '0')} · ${eliteUseCaseLabels[elite.useCase]}` : `${example.category} · ${example.city}`}
          </p>
          <h1 className="mt-2 font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-fg">{example.name}</h1>
          <p className="mt-4 text-body text-fg-muted">{example.description}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {elite ? <Badge>{eliteGoalLabels[elite.goal]}</Badge> : example.goals.map((g) => <Badge key={g}>{goalLabels[g]}</Badge>)}
            {price > 0 && <Badge tone="accent">{formatNgn(price)} · one-off</Badge>}
          </div>
          {elite && <p className="mt-4 text-label text-fg-muted"><span className="font-semibold text-fg">Structure:</span> {elite.structure}</p>}

          <div className="mt-8 flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Button size="lg" variant="brand" fullWidth onClick={() => navigate(`/start?kit=${example.id}`)}>
              {price > 0 ? `Get this template · ${formatNgn(price)}` : 'Use this template'}
            </Button>
            <Button size="lg" variant="secondary" fullWidth trailingIcon={ExternalLinkIcon} onClick={() => navigate(`/p/${doc.handle}`)}>
              Open full page
            </Button>
          </div>
          {price > 0 && <p className="mt-2 text-caption text-fg-subtle">Preview is free. You pay once per workspace when you use it (test mode, example price).</p>}

          {elite &&
          <div className="mt-8">
              <h2 className="text-label font-semibold text-fg">What’s inside</h2>
              <ol className="mt-3 flex flex-col gap-1.5">
                {elite.inside.map((s, i) =>
              <li key={s} className="flex gap-3 text-label text-fg-muted">
                    <span className="w-5 shrink-0 tabular-nums text-fg-subtle">{i + 1}</span>
                    {s}
                  </li>
              )}
              </ol>
            </div>
          }

          {elite && elite.goodToKnow.length > 0 &&
          <div className="mt-8 rounded-md bg-sunken p-4">
              <h2 className="flex items-center gap-1.5 text-label font-semibold text-fg">
                <InfoIcon size={15} aria-hidden /> Good to know
              </h2>
              <ul className="mt-2 flex flex-col gap-1.5">
                {elite.goodToKnow.map((g) =>
              <li key={g} className="text-label text-fg-muted">{g}</li>
              )}
              </ul>
            </div>
          }

          <div className="mt-8 flex gap-3 border-t border-line pt-6">
            <ShieldCheckIcon size={18} className="mt-0.5 shrink-0 text-success" aria-hidden />
            <p className="text-label text-fg-muted">
              <span className="font-semibold text-fg">{example.name} is fictional.</span> Using this template keeps the layout, theme and photos. Prices, links, contact details, figures and customer quotes are removed, and blocks that need them stay hidden until you add your own.
            </p>
          </div>

          {!elite &&
          <div className="mt-8">
              <h2 className="text-label font-semibold text-fg">Blocks in this template</h2>
              <p className="mt-2 text-label leading-relaxed text-fg-muted">{blockNames.join(' · ')}</p>
            </div>
          }
        </aside>
      </div>
    </div>);

}