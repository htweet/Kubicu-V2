import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';
import { examplePages, goalLabels, type ExampleGoal, type ExampleStyle } from '../../data/examples';
import { TemplateThumb } from '../../components/templates/TemplateThumb';
import { EliteCollection } from '../../components/templates/EliteCollection';
import { ArtworkCollection } from '../../components/templates/ArtworkCollection';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { templatePrice } from '../../data/templateMarket';
import { useT } from '../../contexts/LocaleContext';
import { formatNaira as formatNgn } from '../../utils/format';
import { cn } from '../../utils/cn';
import { ThemeGallery } from '../../components/themes/ThemeGallery';

/** Templates set the layout; themes set the look (D164). */
function LibraryNav({ active }: {active: 'templates' | 'themes';}) {
  const { t: tr } = useT();
  const tabs = [
  { id: 'templates', label: 'Templates', to: '/templates' },
  { id: 'themes', label: 'Themes', to: '/templates?tab=themes' }] as
  const;
  return (
    <nav aria-label={tr('Library')} className="flex gap-1 border-b border-line">
      {tabs.map((t) =>
      <Link
        key={t.id}
        to={t.to}
        aria-current={active === t.id ? 'page' : undefined}
        className={cn(
          '-mb-px border-b-2 px-3 py-2.5 text-label font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
          active === t.id ? 'border-fg text-fg' : 'border-transparent text-fg-muted hover:text-fg'
        )}>
        
          {tr(t.label)}
        </Link>
      )}
    </nav>);

}

const styleLabels: Record<ExampleStyle, string> = { light: 'Light', dark: 'Dark', editorial: 'Editorial', bold: 'Bold' };

/**
 * Public templates library (D164). Translated in D326: headings, filters, counts and each template's category.
 * Example business names, “best for” lines and descriptions are sample content and stay as written; search still
 * matches the English words.
 */
export function Templates() {
  const { t: tr } = useT();
  const [params] = useSearchParams();
  const initialGoal = params.get('goal');
  const [goal, setGoal] = useState<ExampleGoal | 'all'>(initialGoal && initialGoal in goalLabels ? initialGoal as ExampleGoal : 'all');
  const [style, setStyle] = useState<ExampleStyle | 'all'>('all');
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('all');
  const [price, setPrice] = useState<'all' | 'free' | 'premium'>('all');
  const regions = useMemo(() => Array.from(new Set(examplePages.map((e) => e.city))).sort(), []);
  const showThemes = params.get('tab') === 'themes';

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return examplePages.filter(
      (e) =>
      (goal === 'all' || e.goals.includes(goal)) && (
      style === 'all' || e.styles.includes(style)) && (
      region === 'all' || e.city === region) && (
      price === 'all' || (price === 'premium' ? templatePrice(e.id) > 0 : templatePrice(e.id) === 0)) && (
      !q || [e.name, e.category, tr(e.category), e.bestFor, e.description, e.city].some((s) => s.toLowerCase().includes(q)))
    );
  }, [goal, style, query, region, price, tr]);

  const reset = () => {
    setGoal('all');
    setStyle('all');
    setQuery('');
    setRegion('all');
    setPrice('all');
  };

  if (showThemes) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-14 md:px-8 md:pt-20">
        <LibraryNav active="themes" />
        <header className="mt-8 max-w-2xl">
          <h1 className="kb-display text-[44px] leading-[0.98] text-fg md:text-[72px]">
            {tr('Choose the look,')} <span className="nm-text">{tr('keep your layout')}</span>
          </h1>
          <p className="mt-4 text-body text-fg-muted">
            {tr('24 Signature themes — glass, gloss, editorial and quiet luxury. A theme changes colours, surfaces, buttons and type; your page’s content and layout stay exactly where they are.')}
          </p>
        </header>
        <ThemeGallery signUpHref="/signup" />
      </div>);

  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-14 md:px-8 md:pt-20">
      <LibraryNav active="templates" />
      <header className="mt-8 max-w-2xl">
        <h1 className="kb-display text-[44px] leading-[0.98] text-fg md:text-[72px]">
          {tr('Start from a page')} <span className="nm-text">{tr('built for your goal')}</span>
        </h1>
        <p className="mt-4 text-body text-fg-muted">
          {tr('Each template is a complete example for a fictional business. When you use one, we keep the layout and remove its prices, links and quotes, so only your details go live.')}
        </p>
      </header>

      <EliteCollection templates={examplePages} hrefFor={(e) => `/templates/${e.id}`} />
      <ArtworkCollection templates={examplePages} hrefFor={(e) => `/templates/${e.id}`} />

      <h2 className="mt-16 font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] text-fg">{tr('All templates')}</h2>
      <div className="mt-6 flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
        <FilterRow label={tr('Goal')} value={goal} onChange={setGoal} options={[['all', tr('All goals')], ...(Object.entries(goalLabels) as [ExampleGoal, string][]).map(([k, v]) => [k, tr(v)] as [ExampleGoal, string])]} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <FilterRow label={tr('Style')} value={style} onChange={setStyle} options={[['all', tr('Any style')], ...(Object.entries(styleLabels) as [ExampleStyle, string][]).map(([k, v]) => [k, tr(v)] as [ExampleStyle, string])]} />
          <label className="relative block sm:w-56">
            <span className="sr-only">{tr('Search templates')}</span>
            <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tr('Search, e.g. salon')}
              className="h-10 w-full rounded-md border border-line-strong bg-field pl-9 pr-3 text-label text-fg placeholder:text-fg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
            
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <FilterRow
          label={tr('Price')}
          value={price}
          onChange={setPrice}
          options={[
          ['all', tr('Free and premium')],
          ['free', tr('Free')],
          ['premium', tr('Premium')]]
          } />
        
        <FilterRow label={tr('Region')} value={region} onChange={setRegion} options={[['all', tr('Everywhere')], ...regions.map((r) => [r, tr(r)] as [string, string])]} />
      </div>

      <p className="mt-6 text-caption text-fg-subtle" aria-live="polite">
        {tr('Templates: {n}', { n: list.length })}
      </p>

      {list.length === 0 ?
      <div className="mt-8">
          <EmptyState
          icon={SearchIcon}
          title={tr('No templates match')}
          description={tr('Try another goal or style, or start from a blank page.')}
          action={
          <Button variant="secondary" onClick={reset}>
                {tr('Clear filters')}
              </Button>
          } />
        
        </div> :

      <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((e) =>
        <li key={e.id} className="flex flex-col">
              <Link to={`/templates/${e.id}`} className="group flex flex-1 flex-col rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <span className="nm-edge relative block rounded-[14px] transition-transform duration-150 ease-out group-hover:-translate-y-0.5">
                  <span className="block overflow-hidden rounded-[13px]">
                    <TemplateThumb doc={e.doc} width={220} height={330} />
                  </span>
                  {templatePrice(e.id) > 0 &&
              <span className="absolute left-2 top-2">
                      <Badge tone="accent">{tr('Premium · {price}', { price: formatNgn(templatePrice(e.id)) })}</Badge>
                    </span>
              }
                </span>
                <span className="mt-4 text-caption font-medium text-fg-subtle">{tr(e.category)}</span>
                <span className="mt-0.5 text-heading font-semibold text-fg">{e.name}</span>
                <span className="mt-1 text-label text-fg-muted">{e.bestFor}</span>
              </Link>
            </li>
        )}
        </ul>
      }
    </div>);

}

function FilterRow<T extends string>({ label, value, onChange, options }: {label: string;value: T;onChange: (v: T) => void;options: [T, string][];}) {
  return (
    <div role="group" aria-label={label} className="-mx-1 flex flex-wrap gap-1.5">
      {options.map(([v, text]) =>
      <button
        key={v}
        type="button"
        aria-pressed={value === v}
        onClick={() => onChange(v)}
        className={cn(
          'h-8 whitespace-nowrap rounded-full border px-3 text-label font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
          value === v ? 'nm-fill border-transparent font-semibold text-[rgb(16_14_26)]' : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
        )}>
        
          {text}
        </button>
      )}
    </div>);

}