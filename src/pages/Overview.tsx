import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLinkIcon, PenToolIcon, AlertTriangleIcon, ArrowRightIcon, SparklesIcon } from 'lucide-react';
import { useEditor } from '../contexts/EditorContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useT } from '../contexts/LocaleContext';
import { PageMiniPreview } from '../components/overview/PageMiniPreview';
import { SetupChecklist } from '../components/overview/SetupChecklist';
import { CopyLinkButton } from '../components/overview/CopyLinkButton';
import { RecentActivity } from '../components/overview/RecentActivity';
import { PageStatusBadge } from '../components/canvas/PageStatusBadge';
import { ResumeOnboardingBanner } from '../components/onboarding/ResumeOnboardingBanner';
import { NeedsAttention } from '../components/overview/NeedsAttention';
import { SpacesStrip } from '../components/overview/SpacesStrip';
import { PendingKitCard } from '../components/overview/PendingKitCard';
import { Button } from '../components/ui/Button';
import { fontPairs } from '../data/pageThemes';
import { formatRelative } from '../utils/format';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Home (D385). Every line goes through the translator so all eight languages work here. */
export function Overview() {
  const { t: tr } = useT();
  const { state, issues } = useEditor();
  const navigate = useNavigate();
  const { current } = useWorkspace();
  const { draft } = state;
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.length - errors;
  const visible = draft.blocks.filter((b) => !b.visibility.hidden).length;
  const hidden = draft.blocks.length - visible;
  const font = fontPairs.find((f) => f.id === draft.theme.fontPair)?.name ?? '—';
  const canvas = `/app/canvas/${draft.id}`;

  const facts = [
  { label: tr('Blocks'), value: `${visible}${hidden ? ` · ${tr('Hidden: {n}', { n: hidden })}` : ''}` },
  { label: tr('Last edit'), value: formatRelative(draft.updatedAt) },
  { label: tr('Published'), value: state.publishedAt ? formatRelative(state.publishedAt) : tr('Not yet') },
  { label: tr('Fonts'), value: font }];


  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 md:px-10 md:py-12">
      <header className="flex flex-col gap-1">
        <p className="text-label font-medium text-fg-subtle">
          {tr(greeting())}
          {current.ownerName ? `, ${current.ownerName}` : ''}
        </p>
        <h1 className="font-display text-title font-semibold text-fg md:text-display">{tr('Your corner of the internet')}</h1>
      </header>
      <ResumeOnboardingBanner />
      <PendingKitCard />
      <NeedsAttention />

      <section aria-labelledby="page-heading" className="mt-8 overflow-hidden rounded-lg border border-line bg-raised shadow-1">
        <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Link
            to={canvas}
            aria-label={tr('Open {name} in the canvas', { name: draft.title })}
            className="dot-stage group flex min-h-[360px] items-end justify-center overflow-hidden px-6 pt-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus lg:min-h-[440px]">
            
            <span className="block translate-y-6 transition-transform duration-200 ease-out group-hover:translate-y-3">
              <PageMiniPreview doc={draft} scale={0.66} height={440} />
            </span>
          </Link>

          <div className="flex flex-col border-t border-line p-6 md:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <PageStatusBadge />
              <span className="text-caption text-fg-subtle">{tr('Main page')}</span>
            </div>
            <h2 id="page-heading" className="mt-4 font-display text-[1.75rem] font-semibold leading-tight tracking-[-0.022em] text-fg md:text-[2rem]">
              {draft.title}
            </h2>
            <CopyLinkButton handle={draft.handle} className="mt-4 self-start" />

            {issues.length > 0 &&
            <Link
              to={canvas}
              className="group mt-5 flex items-center gap-3 self-start rounded-md bg-warning-soft px-3.5 py-2.5 text-label font-medium text-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              
                <AlertTriangleIcon size={16} strokeWidth={2.25} aria-hidden />
                <span>
                  {errors > 0 ? tr('To fix: {n}', { n: errors }) : ''}
                  {errors > 0 && warnings > 0 ? ' · ' : ''}
                  {warnings > 0 ? tr('Worth checking: {n}', { n: warnings }) : ''}
                </span>
                <ArrowRightIcon size={14} className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            }

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {facts.map((f) =>
              <div key={f.label} className="min-w-0">
                  <dt className="text-caption text-fg-subtle">{f.label}</dt>
                  <dd className="mt-1 truncate text-label font-semibold text-fg">{f.value}</dd>
                </div>
              )}
            </dl>

            <div className="mt-auto flex flex-wrap gap-2 pt-8">
              <Button size="lg" leadingIcon={PenToolIcon} onClick={() => navigate(canvas)}>
                {tr('Open canvas')}
              </Button>
              <Button size="lg" variant="ai" leadingIcon={SparklesIcon} onClick={() => navigate('/app/assistant')}>
                {tr('Build with AI')}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                trailingIcon={ExternalLinkIcon}
                disabled={!state.published}
                onClick={() => navigate(`/p/${state.published?.handle ?? draft.handle}`)}>
                
                {tr('View live page')}
              </Button>
            </div>
          </div>
        </div>
      </section>
      <SpacesStrip />

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <RecentActivity />
        <aside className="lg:border-l lg:border-line lg:pl-12">
          <SetupChecklist />
        </aside>
      </div>
    </div>);

}