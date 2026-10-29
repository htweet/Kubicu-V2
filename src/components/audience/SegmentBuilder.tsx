import React, { useEffect, useMemo, useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { Contact, SavedSegment, SegmentField, SegmentOp, SegmentRule } from '../../types/ops';
import { uid } from '../../utils/id';
import { choiceOptions, dayOptions, defaultRule, fieldDefs, opLabels, ruleComplete, rulesMatch } from '../../utils/ops/segmentRules';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Segmented } from '../ui/Segmented';
import { TextInput } from '../ui/TextInput';

export const MAX_RULES = 8;

interface SegmentBuilderProps {
  open: boolean;
  onClose: () => void;
  /** Editing an existing segment, or null for a new one. */
  segment: SavedSegment | null;
  contacts: Contact[];
  tags: string[];
  campaigns: string[];
  onSave: (name: string, rules: SegmentRule[], match: 'all' | 'any') => void;
}

const selectCls =
'h-10 w-full min-w-0 rounded-md border border-line bg-raised px-2.5 text-label text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';

/** Rule builder for segments (D272): "all of" or "any of" up to 8 conditions, with a live count. */
export function SegmentBuilder({ open, onClose, segment, contacts, tags, campaigns, onSave }: SegmentBuilderProps) {
  const [name, setName] = useState('');
  const [match, setMatch] = useState<'all' | 'any'>('all');
  const [rules, setRules] = useState<SegmentRule[]>([]);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(segment?.name ?? '');
    setMatch(segment?.match ?? 'all');
    setRules(segment?.rules?.length ? segment.rules : [defaultRule('consent', uid('rule'), tags, campaigns)]);
    setTried(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, segment]);

  const complete = rules.filter(ruleComplete);
  const count = useMemo(() => contacts.filter((c) => rulesMatch(c, complete, match)).length, [contacts, complete, match]);
  const nameError = tried && !name.trim() ? 'Give the segment a name' : '';
  const rulesError = tried && complete.length === 0 ? 'Add at least one complete condition' : '';

  const update = (id: string, patch: Partial<SegmentRule>) => setRules((rs) => rs.map((r) => r.id === id ? { ...r, ...patch } : r));
  const changeField = (id: string, field: SegmentField) => setRules((rs) => rs.map((r) => r.id === id ? defaultRule(field, r.id, tags, campaigns) : r));

  const save = () => {
    setTried(true);
    if (!name.trim() || complete.length === 0) return;
    onSave(name.trim().slice(0, 40), complete, match);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={segment ? 'Edit segment' : 'Build a segment'}
      description="Choose who belongs. Membership updates by itself as contacts change."
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{segment ? 'Save changes' : 'Save segment'}</Button>
        </>
      }>
      
      <div className="flex flex-col gap-6">
        <TextInput id="segb-name" label="Name" value={name} maxLength={40} placeholder="VIP buyers who subscribed" error={nameError} onChange={(e) => setName(e.target.value)} />

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-label font-semibold text-fg">Contacts who match</legend>
          <Segmented<'all' | 'any'>
            ariaLabel="How conditions combine"
            value={match}
            onChange={setMatch}
            options={[
            { value: 'all', label: 'All of these' },
            { value: 'any', label: 'Any of these' }]
            } />
          

          <ol className="mt-1 flex flex-col gap-2">
            {rules.map((r, i) => {
              const def = fieldDefs[r.field];
              return (
                <li key={r.id} className="flex flex-col gap-2 rounded-md bg-sunken p-3 sm:flex-row sm:items-center">
                  <span className="w-10 shrink-0 text-caption font-semibold text-fg-subtle">{i === 0 ? 'Where' : match === 'all' ? 'and' : 'or'}</span>
                  <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-[1.1fr_0.9fr_1.2fr]">
                    <select aria-label={`Condition ${i + 1}: field`} className={selectCls} value={r.field} onChange={(e) => changeField(r.id, e.target.value as SegmentField)}>
                      {(Object.keys(fieldDefs) as SegmentField[]).map((f) =>
                      <option key={f} value={f}>
                          {fieldDefs[f].label}
                        </option>
                      )}
                    </select>
                    <select aria-label={`Condition ${i + 1}: comparison`} className={selectCls} value={r.op} onChange={(e) => update(r.id, { op: e.target.value as SegmentOp })}>
                      {def.ops.map((o) =>
                      <option key={o} value={o}>
                          {opLabels[o]}
                        </option>
                      )}
                    </select>
                    {def.kind !== 'presence' &&
                    <ValueSelect rule={r} index={i} tags={tags} campaigns={campaigns} onChange={(value) => update(r.id, { value })} />
                    }
                  </div>
                  <IconButton icon={Trash2Icon} label={`Remove condition ${i + 1}`} size="sm" disabled={rules.length === 1} onClick={() => setRules((rs) => rs.filter((x) => x.id !== r.id))} className="self-end sm:self-auto" />
                </li>);

            })}
          </ol>
          {rulesError && <p className="text-caption text-danger">{rulesError}</p>}
          <div>
            <Button size="sm" variant="tertiary" leadingIcon={PlusIcon} disabled={rules.length >= MAX_RULES} onClick={() => setRules((rs) => [...rs, defaultRule('tag', uid('rule'), tags, campaigns)])}>
              Add condition
            </Button>
            {rules.length >= MAX_RULES && <span className="ml-2 text-caption text-fg-subtle">Up to {MAX_RULES} conditions.</span>}
          </div>
        </fieldset>

        <div className="border-t border-line pt-4" aria-live="polite">
          <p className="text-[1.75rem] font-semibold leading-none tabular-nums text-fg">{count}</p>
          <p className="mt-1 text-caption text-fg-muted">
            of {contacts.length} contacts match right now.
            {!complete.some((r) => r.field === 'consent') && ' Add “Consent is Subscribed” before using it for marketing.'}
          </p>
        </div>
      </div>
    </Dialog>);

}

function ValueSelect({ rule, index, tags, campaigns, onChange }: {rule: SegmentRule;index: number;tags: string[];campaigns: string[];onChange: (v: string) => void;}) {
  const kind = fieldDefs[rule.field].kind;
  const options =
  kind === 'choice' ?
  choiceOptions(rule.field) :
  kind === 'tag' ?
  tags.map((t) => ({ value: t, label: t })) :
  kind === 'campaign' ?
  campaigns.map((c) => ({ value: c, label: `/s/${c}` })) :
  dayOptions.map((d) => ({ value: d, label: `${d} days` }));
  if (options.length === 0) {
    return <p className="col-span-2 self-center text-caption text-fg-subtle sm:col-span-1">{kind === 'tag' ? 'No tags yet' : 'No short links yet'}</p>;
  }
  return (
    <select aria-label={`Condition ${index + 1}: value`} className={`${selectCls} col-span-2 sm:col-span-1`} value={rule.value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) =>
      <option key={o.value} value={o.value}>
          {o.label}
        </option>
      )}
    </select>);

}