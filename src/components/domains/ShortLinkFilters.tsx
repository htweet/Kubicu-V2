import React from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import type { SourceId } from '../../types/analytics';
import type { LinkStatus } from '../../utils/domains/linkRules';
import { sourceLabels } from '../../utils/analytics/track';
import { SelectInput } from '../ui/SelectInput';

export type StatusFilter = 'all' | Exclude<LinkStatus, 'archived'> | 'attention';
export type LinkSort = 'newest' | 'clicks' | 'recent' | 'name';

export interface LinkFilterState {
  q: string;
  channel: 'all' | SourceId;
  tag: string;
  status: StatusFilter;
  sort: LinkSort;
}

export const emptyLinkFilters: LinkFilterState = { q: '', channel: 'all', tag: 'all', status: 'all', sort: 'newest' };

interface Props {
  value: LinkFilterState;
  onChange: (next: LinkFilterState) => void;
  channels: SourceId[];
  tags: string[];
  showStatus: boolean;
  shown: number;
  total: number;
}

/** Search, filter and sort for the Short links list (D271). Filters only appear when there's something to filter by. */
export function ShortLinkFilters({ value, onChange, channels, tags, showStatus, shown, total }: Props) {
  const set = (patch: Partial<LinkFilterState>) => onChange({ ...value, ...patch });
  const active = value.q.trim() || value.channel !== 'all' || value.tag !== 'all' || value.status !== 'all';
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] md:items-end">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="links-search" className="text-label font-medium text-fg">
            Search
          </label>
          <div className="relative">
            <SearchIcon size={15} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
            <input
              id="links-search"
              type="search"
              value={value.q}
              onChange={(e) => set({ q: e.target.value })}
              placeholder="Name, short link, destination or tag"
              className="h-10 w-full rounded-md border border-line-strong bg-canvas pl-9 pr-3 text-body text-fg placeholder:text-fg-subtle focus-visible:border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
          </div>
        </div>
        <SelectInput<'all' | SourceId>
          id="links-channel"
          label="Shared on"
          value={value.channel}
          onChange={(channel) => set({ channel })}
          options={[{ value: 'all', label: 'All channels' }, ...channels.map((c) => ({ value: c, label: sourceLabels[c] }))]}
        />
        <SelectInput
          id="links-tag"
          label="Tag"
          value={value.tag}
          onChange={(tag) => set({ tag })}
          disabled={tags.length === 0}
          options={[{ value: 'all', label: tags.length ? 'All tags' : 'No tags yet' }, ...tags.map((t) => ({ value: t, label: `#${t}` }))]}
        />
        {showStatus ? (
          <SelectInput<StatusFilter>
            id="links-status"
            label="Status"
            value={value.status}
            onChange={(status) => set({ status })}
            options={[
              { value: 'all', label: 'Any status' },
              { value: 'live', label: 'Live' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'paused', label: 'Paused' },
              { value: 'ended', label: 'Ended' },
              { value: 'attention', label: 'Needs attention' },
            ]}
          />
        ) : (
          <span className="hidden md:block" />
        )}
        <SelectInput<LinkSort>
          id="links-sort"
          label="Sort by"
          value={value.sort}
          onChange={(sort) => set({ sort })}
          options={[
            { value: 'newest', label: 'Newest first' },
            { value: 'clicks', label: 'Most clicks' },
            { value: 'recent', label: 'Last clicked' },
            { value: 'name', label: 'Name (A–Z)' },
          ]}
        />
      </div>
      {active && (
        <p className="flex flex-wrap items-center gap-2 text-caption text-fg-muted" role="status">
          Showing {shown} of {total}
          <button
            type="button"
            onClick={() => onChange({ ...emptyLinkFilters, sort: value.sort })}
            className="inline-flex items-center gap-1 rounded-sm font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <XIcon size={13} aria-hidden />
            Clear filters
          </button>
        </p>
      )}
    </div>
  );
}
