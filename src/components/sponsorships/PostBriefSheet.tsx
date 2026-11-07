import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PlusIcon, XIcon } from 'lucide-react';
import type { SponsorBrief, SponsorPlatform } from '../../types/sponsorship';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useT } from '../../contexts/LocaleContext';
import { useSponsorships } from '../../hooks/useSponsorships';
import { briefErrors, platformLabels, sponsorCategories, SPONSOR_FEE_PCT } from '../../utils/sponsorships';
import { uid } from '../../utils/id';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { SelectInput } from '../ui/SelectInput';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Field } from '../ui/Field';
import { cn } from '../../utils/cn';

const inTwoWeeks = () => new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);

/** Post a brief for creators (D441). */
export function PostBriefSheet({ open, onClose, edit }: { open: boolean; onClose: () => void; /** A declined brief to fix and send again (D460). */ edit?: SponsorBrief | null }) {
  const { t: tr } = useT();
  const { current } = useWorkspace();
  const { update } = useSponsorships();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(sponsorCategories[0]);
  const [platforms, setPlatforms] = useState<SponsorPlatform[]>([]);
  const [deliverables, setDeliverables] = useState<string[]>(['']);
  const [budget, setBudget] = useState<number | null>(null);
  const [slots, setSlots] = useState('3');
  const [applyBy, setApplyBy] = useState(inTwoWeeks);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(edit?.title ?? '');
    setDescription(edit?.description ?? '');
    setCategory(edit?.category ?? sponsorCategories[0]);
    setPlatforms(edit?.platforms ?? []);
    setDeliverables(edit?.deliverables.length ? edit.deliverables : ['']);
    setBudget(edit?.budgetNgn ?? null);
    setSlots(String(edit?.slots ?? 3));
    setApplyBy(edit && edit.applyBy >= new Date().toISOString().slice(0, 10) ? edit.applyBy : inTwoWeeks());
    setTried(false);
  }, [open, edit]);

  const errs = briefErrors({ title, description, platforms, deliverables, budgetNgn: budget ?? 0, slots: Number(slots), applyBy });
  const show = (k: keyof typeof errs) => (tried && errs[k] ? tr(errs[k] as string) : undefined);

  const post = () => {
    setTried(true);
    if (Object.keys(errs).length) return;
    if (edit) {
      // Fixed and sent again: same brief, back in KUBICU's queue, old note cleared (D460).
      const fixed = { title: title.trim(), description: description.trim(), category, platforms, deliverables: deliverables.map((d) => d.trim()).filter(Boolean), budgetNgn: budget as number, slots: Number(slots), applyBy };
      if (update((list) => list.map((b) => (b.id === edit.id ? { ...b, ...fixed, status: 'review' as const, reviewNote: undefined, reviewedAt: undefined } : b)))) {
        toast.success(tr('Brief sent for review'), { description: tr('KUBICU checks it, usually within a day, then creators can apply. You’re only charged when you accept someone.') });
        onClose();
      }
      return;
    }
    const brief: SponsorBrief = {
      id: uid('brief'),
      brandWorkspaceId: current.id,
      brandName: current.name,
      title: title.trim(),
      description: description.trim(),
      category,
      platforms,
      deliverables: deliverables.map((d) => d.trim()).filter(Boolean),
      budgetNgn: budget as number,
      slots: Number(slots),
      applyBy,
      // KUBICU checks every new brief before creators see it (D459).
      status: 'review',
      createdAt: new Date().toISOString(),
      applications: [],
    };
    if (update((list) => [brief, ...list])) {
      toast.success(tr('Brief sent for review'), { description: tr('KUBICU checks it, usually within a day, then creators can apply. You’re only charged when you accept someone.') });
      onClose();
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="right"
      size="lg"
      bodyClassName="px-5 py-6"
      title={edit ? 'Fix and send again' : 'Post a brief'}
      description={edit?.reviewNote ? tr('KUBICU’s note: {note}', { note: edit.reviewNote }) : 'Tell creators what you need. You choose who to work with, and pay only for work you approve.'}
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {tr('Cancel')}
          </Button>
          <Button onClick={post}>{edit ? tr('Send for review') : tr('Post brief')}</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <TextInput id="pb-title" label={tr('Title')} placeholder={tr('e.g. Launch of our new hair oil')} maxLength={70} value={title} error={show('title')} onChange={(e) => setTitle(e.target.value)} />
        <TextArea id="pb-desc" label={tr('What you want')} rows={4} value={description} error={show('description')} hint={tr('The idea, the tone, and anything creators must or mustn’t say.')} onChange={(e) => setDescription(e.target.value)} />
        <SelectInput id="pb-cat" label={tr('Category')} value={category} onChange={setCategory} options={sponsorCategories.map((c) => ({ value: c, label: tr(c) }))} />
        <Field id="pb-platforms" label={tr('Where')} error={show('platforms')}>
          <div className="flex flex-wrap gap-2" role="group" aria-label={tr('Platforms')}>
            {(Object.keys(platformLabels) as SponsorPlatform[]).map((p) => {
              const on = platforms.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPlatforms(on ? platforms.filter((x) => x !== p) : [...platforms, p])}
                  className={cn('h-9 rounded-full border px-3.5 text-label transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', on ? 'border-action bg-action-soft text-fg' : 'border-line text-fg-muted hover:bg-sunken')}
                >
                  {tr(platformLabels[p])}
                </button>
              );
            })}
          </div>
        </Field>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-label font-semibold text-fg">{tr('What each creator delivers')}</legend>
          {deliverables.map((d, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <TextInput id={`pb-d-${i}`} label={tr('Deliverable {n}', { n: i + 1 })} placeholder={tr('e.g. 1 Reel, 30–60 seconds')} value={d} error={i === 0 ? show('deliverables') : undefined} onChange={(e) => setDeliverables(deliverables.map((x, j) => (j === i ? e.target.value : x)))} />
              </div>
              {deliverables.length > 1 && <IconButton icon={XIcon} label={tr('Remove deliverable {n}', { n: i + 1 })} variant="ghost" onClick={() => setDeliverables(deliverables.filter((_, j) => j !== i))} />}
            </div>
          ))}
          {deliverables.length < 5 && (
            <Button size="sm" variant="tertiary" leadingIcon={PlusIcon} className="self-start" onClick={() => setDeliverables([...deliverables, ''])}>
              {tr('Add another')}
            </Button>
          )}
          <p className="text-caption text-fg-subtle">{tr('Each one is approved on its own and releases its share of the fee.')}</p>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-3">
          <CurrencyInput id="pb-budget" label={tr('Budget per creator')} value={budget} error={show('budget')} onChange={setBudget} />
          <TextInput id="pb-slots" label={tr('Creators')} inputMode="numeric" value={slots} error={show('slots')} onChange={(e) => setSlots(e.target.value.replace(/\D/g, '').slice(0, 2))} />
          <TextInput id="pb-by" label={tr('Apply by')} type="date" value={applyBy} error={show('applyBy')} onChange={(e) => setApplyBy(e.target.value)} />
        </div>
        <p className="text-caption text-fg-muted">{tr('A {pct}% marketplace fee is added on top of each creator’s fee when you accept them. Example figure.', { pct: SPONSOR_FEE_PCT })}</p>
      </div>
    </Sheet>
  );
}
