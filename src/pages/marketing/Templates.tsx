import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';
import { examplePages, goalLabels, type ExampleGoal, type ExampleStyle } from '../../data/examples';
import { TemplateThumb } from '../../components/templates/TemplateThumb';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

const styleLabels: Record<ExampleStyle, string> = { light: 'Light', dark: 'Dark', editorial: 'Editorial', bold: 'Bold' };

export function Templates() {
  const [goal, setGoal] = useState<ExampleGoal | 'all'>('all');
  const [style, setStyle] = useState<ExampleStyle | 'all'>('all');
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return examplePages.filter(
      (e) =>
      (goal === 'all' || e.goals.includes(goal)) && (
      style === 'all' || e.styles.includes(style)) && (
      !q || [e.name, e.category, e.bestFor, e.description, e.city].some((s) => s.toLowerCase().includes(q)))
    );
  }, [goal, style, query]);

  const reset = () => {
    setGoal('all');
    setStyle('all');
    setQuery('');
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-12 md:px-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-[36px] font-semibold leading-tight tracking-[-0.028em] text-fg md:text-[44px]">Start from a page built for your goal</h1>
        <p className="mt-4 text-body text-fg-muted">
          Each template is a complete example for a fictional business. When you use one, we keep the layout and remove its prices, links and quotes, so only your details go live.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
        <FilterRow label="Goal" value={goal} onChange={setGoal} options={[['all', 'All goals'], ...(Object.entries(goalLabels) as [ExampleGoal, string][])]} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <FilterRow label="Style" value={style} onChange={setStyle} options={[['all', 'Any style'], ...(Object.entries(styleLabels) as [ExampleStyle, string][])]} />
          <label className="relative block sm:w-56">
            <span className="sr-only">Search templates</span>
            <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search, e.g. salon"
              className="h-10 w-full rounded-md border border-line-strong bg-field pl-9 pr-3 text-label text-fg placeholder:text-fg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
            
          </label>
        </div>
      </div>

      <p className="mt-6 text-caption text-fg-subtle" aria-live="polite">
        {list.length} template{list.length === 1 ? '' : 's'}
      </p>

      {list.length === 0 ?
      <div className="mt-8">
          <EmptyState icon={SearchIcon} title="No templates match" description="Try another goal or style, or start from a blank page." action={<Button variant="secondary" onClick={reset}>Clear filters</Button>} />
        </div> :

      <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((e) =>
        <li key={e.id} className="flex flex-col">
              <Link to={`/templates/${e.id}`} className="group flex flex-1 flex-col rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <span className="block transition-transform duration-150 ease-out group-hover:-translate-y-1">
                  <TemplateThumb doc={e.doc} width={220} height={330} />
                </span>
                <span className="mt-4 text-caption font-medium text-fg-subtle">{e.category}</span>
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
          'h-8 rounded-full border px-3 text-label font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
          value === v ? 'border-transparent bg-fg text-canvas' : 'border-line text-fg-muted hover:text-fg'
        )}>
        
          {text}
        </button>
      )}
    </div>);

}