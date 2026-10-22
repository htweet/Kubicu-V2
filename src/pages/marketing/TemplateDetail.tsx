import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ExternalLinkIcon, ShieldCheckIcon } from 'lucide-react';
import { findExampleById, goalLabels } from '../../data/examples';
import { plans } from '../../data/plans';
import { RenderPlanProvider } from '../../contexts/RenderPlanContext';
import { PageSurface } from '../../components/blocks/PageSurface';
import { BlockRenderer, spacingClass } from '../../components/blocks/BlockRenderer';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { blockName } from '../../utils/blocks';
import { NotFound } from '../NotFound';

export function TemplateDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const example = findExampleById(id);
  if (!example) return <NotFound embedded />;

  const { doc } = example;
  const blockNames = Array.from(new Set(doc.blocks.map(blockName)));

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-8 md:px-8">
      <Link to="/templates" className="inline-flex items-center gap-1.5 text-label font-medium text-fg-muted hover:text-fg">
        <ArrowLeftIcon size={15} aria-hidden /> All templates
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
        <div className="order-2 flex justify-center lg:order-1">
          <div className="w-full max-w-[400px] overflow-hidden rounded-[32px] border border-line-strong shadow-3">
            <div className="h-[720px] overflow-y-auto" style={{ background: doc.theme.background }} tabIndex={0} aria-label={`Scrollable preview of ${example.name}`}>
              <RenderPlanProvider plan={plans[example.plan]}>
                <PageSurface theme={doc.theme}>
                  {doc.blocks.
                  filter((b) => !b.visibility.hidden).
                  map((block) =>
                  <div key={block.id} className={spacingClass[block.layout.spacing]}>
                        <BlockRenderer block={block} theme={doc.theme} mode="live" />
                      </div>
                  )}
                </PageSurface>
              </RenderPlanProvider>
            </div>
          </div>
        </div>

        <aside className="order-1 lg:order-2 lg:pt-6">
          <p className="text-label font-medium text-fg-subtle">
            {example.category} · {example.city}
          </p>
          <h1 className="mt-1 font-display text-[34px] font-semibold leading-tight tracking-[-0.026em] text-fg">{example.name}</h1>
          <p className="mt-4 text-body text-fg-muted">{example.description}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {example.goals.map((g) =>
            <Badge key={g}>{goalLabels[g]}</Badge>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Button size="lg" fullWidth onClick={() => navigate(`/start?kit=${example.id}`)}>
              Use this template
            </Button>
            <Button size="lg" variant="secondary" fullWidth trailingIcon={ExternalLinkIcon} onClick={() => navigate(`/p/${doc.handle}`)}>
              Open full page
            </Button>
          </div>

          <div className="mt-8 flex gap-3 border-t border-line pt-6">
            <ShieldCheckIcon size={18} className="mt-0.5 shrink-0 text-success" aria-hidden />
            <p className="text-label text-fg-muted">
              <span className="font-semibold text-fg">{example.name} is fictional.</span> Using this template keeps the layout, theme and photos. Prices, links, contact details and customer quotes are removed, and blocks that need them stay hidden until you add your own.
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-label font-semibold text-fg">Blocks in this template</h2>
            <p className="mt-2 text-label leading-relaxed text-fg-muted">{blockNames.join(' · ')}</p>
          </div>
        </aside>
      </div>
    </div>);

}