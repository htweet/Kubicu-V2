import React, { useMemo, useState } from 'react';
import { BookmarkPlusIcon, ListFilterIcon, PencilIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Contact, SavedSegment, SegmentRule } from '../../types/ops';
import { useOps } from '../../contexts/OpsContext';
import { MAX_SEGMENTS, opsSettingsOf } from '../../utils/ops/settings';
import { describeRules, rulesMatch } from '../../utils/ops/segmentRules';
import { uid } from '../../utils/id';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { SegmentBuilder } from './SegmentBuilder';
import { cn } from '../../utils/cn';

export type SegmentFilters = Omit<SavedSegment, 'id' | 'name'>;

export const noFilters: SegmentFilters = { source: 'all', consent: 'all', tag: 'all', campaign: 'all' };

export function matchesSegment(c: Contact, f: SegmentFilters): boolean {
  return (
    (f.source === 'all' || c.sources.includes(f.source)) &&
    (f.consent === 'all' || c.consent === f.consent) &&
    (f.tag === 'all' || c.tags.includes(f.tag)) &&
    (f.campaign === 'all' || c.attribution?.campaign === f.campaign) &&
    rulesMatch(c, f.rules, f.match)
  );
}

const rulesKey = (f: SegmentFilters) => (f.rules?.length ? `${f.match ?? 'all'}|${JSON.stringify(f.rules.map(({ field, op, value }) => [field, op, value]))}` : '');
const sameFilters = (a: SegmentFilters, b: SegmentFilters) =>
  a.source === b.source && a.consent === b.consent && a.tag === b.tag && a.campaign === b.campaign && rulesKey(a) === rulesKey(b);

const filtersOf = (s: SavedSegment): SegmentFilters => ({ source: s.source, consent: s.consent, tag: s.tag, campaign: s.campaign, rules: s.rules, match: s.match });

interface SegmentBarProps {
  filters: SegmentFilters;
  onApply: (f: SegmentFilters) => void;
  canEdit: boolean;
  /** Tags offered in the rule builder. */
  tags: string[];
}

/**
 * Saved segments (D268, D272): one tap applies a saved segment; membership is live. Segments are either the
 * current filters saved, or built from "all of / any of" conditions in the rule builder.
 */
export function SegmentBar({ filters, onApply, canEdit, tags }: SegmentBarProps) {
  const { data, apply } = useOps();
  const segments = opsSettingsOf(data).segments;
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const [builder, setBuilder] = useState<{ segment: SavedSegment | null } | null>(null);
  const filtered = !sameFilters(filters, noFilters);
  const current = segments.find((s) => sameFilters(filtersOf(s), filters));
  const campaigns = useMemo(() => Array.from(new Set(data.contacts.map((c) => c.attribution?.campaign).filter((x): x is string => !!x))).sort(), [data.contacts]);
  const full = segments.length >= MAX_SEGMENTS;

  const save = (next: SavedSegment[]) => apply((d) => ({ ...d, settings: { ...d.settings, segments: next } }));

  const saveBuilt = (segName: string, rules: SegmentRule[], match: 'all' | 'any') => {
    const editing = builder?.segment;
    if (editing) {
      const next: SavedSegment = { ...editing, name: segName, rules, match, source: 'all', consent: 'all', tag: 'all', campaign: 'all' };
      if (save(segments.map((s) => (s.id === editing.id ? next : s)))) {
        toast(`Updated “${segName}”`);
        onApply(filtersOf(next));
        setBuilder(null);
      }
      return;
    }
    const seg: SavedSegment = { id: uid('seg'), name: segName, source: 'all', consent: 'all', tag: 'all', campaign: 'all', rules, match };
    if (save([...segments, seg])) {
      toast(`Saved “${seg.name}”`);
      onApply(filtersOf(seg));
      setBuilder(null);
    }
  };

  return (
    <div className="mt-6">
      <div role="group" aria-label="Segments" className="scroll-quiet -mx-5 flex items-center gap-2 overflow-x-auto overflow-y-hidden px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
        <Chip on={!filtered} onClick={() => onApply(noFilters)}>
          Everyone <span className="tabular-nums opacity-70">{data.contacts.length}</span>
        </Chip>
        {segments.map((s) => (
          <span key={s.id} className="inline-flex shrink-0 items-center">
            <Chip on={current?.id === s.id} onClick={() => onApply(filtersOf(s))} attached={canEdit}>
              {s.name} <span className="tabular-nums opacity-70">{data.contacts.filter((c) => matchesSegment(c, filtersOf(s))).length}</span>
            </Chip>
            {canEdit && (
              <button
                type="button"
                aria-label={`Delete segment ${s.name}`}
                onClick={() => {
                  if (save(segments.filter((x) => x.id !== s.id))) toast(`Deleted “${s.name}”. Contacts aren’t affected.`);
                }}
                className={cn(
                  'flex h-9 w-8 items-center justify-center rounded-r-full border border-l-0 text-fg-subtle transition-colors duration-150 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  current?.id === s.id ? 'border-action bg-action-soft' : 'border-line bg-raised',
                )}
              >
                <XIcon size={13} aria-hidden />
              </button>
            )}
          </span>
        ))}
        {canEdit && filtered && !current && !full && !filters.rules?.length && (
          <button
            type="button"
            onClick={() => setNaming(true)}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-line-strong px-3.5 text-label font-medium text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <BookmarkPlusIcon size={14} aria-hidden /> Save these filters
          </button>
        )}
        {canEdit && !full && (
          <button
            type="button"
            onClick={() => setBuilder({ segment: null })}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-label font-medium text-action hover:bg-action-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <ListFilterIcon size={14} aria-hidden /> Build a segment
          </button>
        )}
      </div>

      {filters.rules?.length ? (
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-label text-fg-muted">
          <span>
            <span className="font-semibold text-fg">{current ? `${current.name}: ` : 'Conditions: '}</span>
            {describeRules(filters.rules, filters.match)}
          </span>
          {canEdit && current && (
            <button type="button" onClick={() => setBuilder({ segment: current })} className="inline-flex items-center gap-1 text-action underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              <PencilIcon size={12} aria-hidden /> Edit
            </button>
          )}
        </p>
      ) : null}

      <Dialog
        open={naming}
        onClose={() => setNaming(false)}
        size="sm"
        title="Save as a segment"
        description="It updates by itself as people match or stop matching."
        footer={
          <>
            <Button variant="secondary" onClick={() => setNaming(false)}>
              Cancel
            </Button>
            <Button
              disabled={!name.trim()}
              onClick={() => {
                const seg: SavedSegment = { id: uid('seg'), name: name.trim().slice(0, 40), ...filters };
                if (save([...segments, seg])) {
                  toast(`Saved “${seg.name}”`);
                  setName('');
                  setNaming(false);
                }
              }}
            >
              Save segment
            </Button>
          </>
        }
      >
        <TextInput id="seg-name" label="Name" value={name} maxLength={40} placeholder="Subscribed from Instagram" onChange={(e) => setName(e.target.value)} />
      </Dialog>

      <SegmentBuilder open={!!builder} onClose={() => setBuilder(null)} segment={builder?.segment ?? null} contacts={data.contacts} tags={tags} campaigns={campaigns} onSave={saveBuilt} />
    </div>
  );
}

function Chip({ on, onClick, children, attached }: { on: boolean; onClick: () => void; children: React.ReactNode; attached?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap border px-3.5 text-label font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        attached ? 'rounded-l-full' : 'rounded-full',
        on ? 'border-action bg-action-soft text-action' : 'border-line bg-raised text-fg-muted hover:text-fg',
      )}
    >
      {children}
    </button>
  );
}
