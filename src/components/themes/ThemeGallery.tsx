import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileTextIcon, LockIcon, MonitorIcon, SmartphoneIcon, SparklesIcon } from 'lucide-react';
import type { PageDocument, PageTheme } from '../../types/page';
import { signatureTheme, signatureThemes, themeMoodLabels, type SignatureTheme, type ThemeMode, type ThemeMood } from '../../data/signatureThemes';
import { themeReferencePage } from '../../data/themeReferencePage';
import { Segmented } from '../ui/Segmented';
import { Button } from '../ui/Button';
import { TemplateLivePreview } from '../templates/TemplateLivePreview';
import { ThemeCard } from './ThemeCard';
import { ThemeSpecSheet } from './ThemeSpecSheet';
import { ThemeCompareSheet } from './ThemeCompareSheet';
import { cn } from '../../utils/cn';
import { backgroundMode } from '../../utils/pageBackground';

interface ThemeGalleryProps {
  /** In the app: whether this workspace may apply the theme. Omitted on the public site (preview only). */
  canUse?: (t: SignatureTheme) => boolean;
  onUse?: (theme: PageTheme, t: SignatureTheme) => void;
  onUpgrade?: () => void;
  /** The workspace's open page, for "Try on my page". */
  myPage?: PageDocument;
  /** Public site: where "Use this theme" sends visitors. */
  signUpHref?: string;
}

type Source = 'reference' | 'mine';

/**
 * Signature Theme Library gallery (D164): filter by mood, pick a theme on the left, and the same
 * reference page re-skins live on the right. Compare up to three; open a full spec for any version.
 */
export function ThemeGallery({ canUse, onUse, onUpgrade, myPage, signUpHref }: ThemeGalleryProps) {
  const [mood, setMood] = useState<ThemeMood | 'all'>('all');
  const [selectedId, setSelectedId] = useState(signatureThemes[0].id);
  const [mode, setMode] = useState<ThemeMode | null>(null);
  const [device, setDevice] = useState<'phone' | 'desktop'>('phone');
  const [source, setSource] = useState<Source>('reference');
  const [compare, setCompare] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [specOpen, setSpecOpen] = useState(false);
  const navigate = useNavigate();

  const list = useMemo(() => signatureThemes.filter((t) => mood === 'all' || t.mood === mood), [mood]);
  const sig = signatureThemes.find((t) => t.id === selectedId) ?? signatureThemes[0];
  const activeMode: ThemeMode = mode && sig.modes[mode] ? mode : sig.defaultMode;
  // D182: a page with its own background chooses whether to keep it when taking a theme.
  const ownBackground = myPage && backgroundMode(myPage.theme) !== 'theme' ? myPage.theme : null;
  const [keepBackground, setKeepBackground] = useState(true);
  const baseTheme = signatureTheme(sig, activeMode);
  const withOwn: PageTheme | null = ownBackground ?
  {
    ...baseTheme,
    backgroundMode: ownBackground.backgroundMode,
    backgroundGradient: ownBackground.backgroundGradient,
    backgroundImage: ownBackground.backgroundMode === 'image' ? ownBackground.backgroundImage : baseTheme.backgroundImage,
    backgroundVeil: ownBackground.backgroundMode === 'image' ? ownBackground.backgroundVeil : baseTheme.backgroundVeil,
    backgroundFocus: ownBackground.backgroundFocus,
    backgroundScroll: ownBackground.backgroundScroll,
    backgroundTone: ownBackground.backgroundTone
  } :
  null;
  const theme: PageTheme = withOwn && keepBackground && source === 'mine' ? withOwn : baseTheme;
  const themeToApply: PageTheme = withOwn && keepBackground ? withOwn : baseTheme;
  const previewDoc = source === 'mine' && myPage ? myPage : themeReferencePage;
  const locked = canUse ? !canUse(sig) : false;
  const modes = Object.keys(sig.modes) as ThemeMode[];

  const select = (id: string) => {
    setSelectedId(id);
    setMode(null);
  };
  const toggleCompare = (id: string) => setCompare((c) => c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by mood">
        {(['all', ...Object.keys(themeMoodLabels)] as (ThemeMood | 'all')[]).map((m) =>
        <button
          key={m}
          type="button"
          aria-pressed={mood === m}
          onClick={() => setMood(m)}
          className={cn(
            'h-9 whitespace-nowrap rounded-full border px-3.5 text-label transition-[background-color,border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
            mood === m ? 'border-fg bg-fg text-bg' : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
          )}>
          
            {m === 'all' ? `All ${signatureThemes.length}` : themeMoodLabels[m]}
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ul className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" aria-label="Signature themes">
          {list.map((t) =>
          <ThemeCard
            key={t.id}
            theme={t}
            referenceDoc={themeReferencePage}
            selected={t.id === sig.id}
            locked={canUse ? !canUse(t) : false}
            comparing={compare.includes(t.id)}
            compareDisabled={compare.length >= 3}
            onSelect={() => select(t.id)}
            onToggleCompare={() => toggleCompare(t.id)} />

          )}
        </ul>

        <section aria-labelledby="theme-preview-title" className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="theme-preview-title" className="text-heading font-semibold text-fg">{sig.name}</h2>
              <p className="mt-0.5 text-label text-fg-muted">{sig.personality}</p>
            </div>
            <Button size="sm" variant="secondary" leadingIcon={FileTextIcon} onClick={() => setSpecOpen(true)}>
              Spec sheet
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {modes.length > 1 &&
            <Segmented<ThemeMode>
              ariaLabel="Theme mode"
              size="sm"
              value={activeMode}
              onChange={setMode}
              options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' }]
              } />

            }
            <Segmented<'phone' | 'desktop'>
              ariaLabel="Preview size"
              size="sm"
              value={device}
              onChange={setDevice}
              options={[
              { value: 'phone', label: 'Phone', icon: SmartphoneIcon },
              { value: 'desktop', label: 'Desktop', icon: MonitorIcon }]
              } />
            
            {myPage &&
            <Segmented<Source>
              ariaLabel="Page to preview"
              size="sm"
              value={source}
              onChange={setSource}
              options={[
              { value: 'reference', label: 'Sample page' },
              { value: 'mine', label: 'My page' }]
              } />

            }
          </div>

          <div className="mt-4">
            <TemplateLivePreview doc={previewDoc} plan="pro" device={device} theme={theme} name={`${sig.name} on ${source === 'mine' ? 'your page' : 'the sample page'}`} height={device === 'phone' ? 680 : 600} />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-raised p-3">
            <p className="min-w-0 text-caption text-fg-muted">
              {locked ?
              <span className="inline-flex items-center gap-1.5"><LockIcon size={12} aria-hidden /> Creator plan and above. Preview is free.</span> :
              sig.free ?
              'Free on every plan.' :
              canUse ?
              'Included in your plan.' :

              'Free to preview · all 24 Signature themes need Creator or above.'
              }
            </p>
            {onUse ?
            locked ?
            <Button size="sm" leadingIcon={SparklesIcon} onClick={onUpgrade}>
                  Upgrade to use
                </Button> :

            <div className="flex flex-wrap items-center gap-3">
                  {ownBackground &&
              <label className="flex items-center gap-2 text-caption text-fg">
                      <input type="checkbox" checked={keepBackground} onChange={(e) => setKeepBackground(e.target.checked)} className="h-4 w-4 accent-[var(--color-action,#2563eb)]" />
                      Keep my own page background
                    </label>
              }
                  <Button size="sm" onClick={() => onUse(themeToApply, sig)}>
                    Use on my page
                  </Button>
                </div> :

            signUpHref ?
            <Button size="sm" onClick={() => navigate(signUpHref)}>
                Start with this theme
              </Button> :
            null}
          </div>
        </section>
      </div>

      {compare.length > 0 &&
      <div className="sticky bottom-4 z-20 mt-8 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-line bg-overlay py-2 pl-4 pr-2 shadow-3">
            <span className="text-label text-fg">
              {compare.length} of 3 selected
            </span>
            <Button size="sm" variant="tertiary" onClick={() => setCompare([])}>
              Clear
            </Button>
            <Button size="sm" disabled={compare.length < 2} onClick={() => setCompareOpen(true)}>
              Compare
            </Button>
          </div>
        </div>
      }

      <ThemeSpecSheet open={specOpen} onClose={() => setSpecOpen(false)} sig={sig} theme={theme} modeLabel={activeMode === 'dark' ? 'Dark' : 'Light'} />
      <ThemeCompareSheet open={compareOpen} onClose={() => setCompareOpen(false)} themes={signatureThemes.filter((t) => compare.includes(t.id))} doc={previewDoc} />
    </div>);

}