import React, { useEffect, useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { LinkKind, LinkStage, MoneyData, PayMethod, PaymentLink } from '../../types/money';
import { MAX_LINK_STAGES, defaultLinkStages, linkStageAmounts, linkStageProblems, linkStageTemplates, stagesFromLinkTemplate } from '../../utils/money/linkStages';
import { blankLink, linkProviderFee, methodFor, methodLabels, uniqueSlug } from '../../utils/money/store';
import { uid } from '../../utils/id';
import { formatNgn } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { Segmented } from '../ui/Segmented';
import { SelectInput } from '../ui/SelectInput';
import { Switch } from '../ui/Switch';
import { Field } from '../ui/Field';
import { IconButton } from '../ui/IconButton';

interface PaymentLinkEditorProps {
  open: boolean;
  link: PaymentLink | null;
  data: MoneyData;
  escrowAllowed: boolean;
  onClose: () => void;
  onSave: (link: PaymentLink) => void;
}

const kindHelp: Record<LinkKind, string> = {
  fixed: 'Everyone pays the same amount — a class seat, a deposit, a consultation.',
  open: 'The payer types the amount — donations, tips, “pay what you owe”.',
  items: 'The payer picks quantities from a short list — tickets, packs, add-ons.'
};

/** Create or edit a payment link (D92). */
export function PaymentLinkEditor({ open, link, data, escrowAllowed, onClose, onSave }: PaymentLinkEditorProps) {
  const [draft, setDraft] = useState<PaymentLink>(blankLink());
  const [tried, setTried] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(link ? { ...link, items: link.items.map((i) => ({ ...i })) } : blankLink());
    setTried(false);
    setSlugTouched(!!link);
  }, [open, link]);

  const set = (patch: Partial<PaymentLink>) => setDraft((d) => ({ ...d, ...patch }));
  const staged = draft.kind === 'fixed' && !!draft.stages;
  const slug = slugTouched ? draft.slug : uniqueSlug(data, draft.title, draft.id);

  const errors = {
    title: draft.title.trim().length < 3 ? 'Give the link a name payers will recognise.' : undefined,
    amount: draft.kind === 'fixed' && draft.amountNgn < 100 ? 'Enter an amount of at least ₦100.' : undefined,
    min: draft.kind === 'open' && draft.minNgn < 100 ? 'The minimum must be at least ₦100.' : undefined,
    items: draft.kind === 'items' && (!draft.items.length || draft.items.some((i) => !i.label.trim() || i.unitNgn < 100)) ? 'Each item needs a name and a price of at least ₦100.' : undefined,
    slug: !/^[a-z0-9-]{3,40}$/.test(slug) ? 'Use 3–40 lowercase letters, numbers or dashes.' : data.links.some((l) => l.slug === slug && l.id !== draft.id) ? 'Another link already uses this address.' : undefined,
    maxUses: draft.reusable && !staged && draft.maxUses !== null && draft.maxUses < 1 ? 'Enter at least 1, or leave it empty for no limit.' : undefined,
    stages: staged ? linkStageProblems(draft.stages ?? []) : undefined
  };
  const stageAmounts = staged ? linkStageAmounts(draft) : {};
  const lockedStages = !!link && link.payments.some((p) => p.stageId);
  const setStages = (stages: LinkStage[] | undefined) => set({ stages, reusable: stages ? false : draft.reusable });
  const ok = Object.values(errors).every((e) => !e);

  const save = () => {
    setTried(true);
    if (!ok) return;
    onSave({ ...draft, title: draft.title.trim(), description: draft.description.trim(), slug, stages: staged ? draft.stages?.map((s) => ({ ...s, label: s.label.trim() })) : undefined, reusable: staged ? false : draft.reusable });
  };

  const example = draft.kind === 'fixed' ? draft.amountNgn : draft.kind === 'open' ? draft.minNgn : draft.items.reduce((s, i) => s + i.unitNgn, 0);
  const areaMethod = methodFor(data, 'links');
  const err = (k: keyof typeof errors) => tried ? errors[k] : undefined;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={link ? 'Edit payment link' : 'New payment link'}
      description="Share it on WhatsApp, Instagram or as a QR code. Payers don’t need an account."
      side="right"
      size="lg"
      footer={
      <div className="flex w-full justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{link ? 'Save changes' : 'Create link'}</Button>
        </div>
      }>
      
      <div className="flex flex-col gap-6 p-5">
        <section className="flex flex-col gap-4" aria-labelledby="pl-what">
          <h3 id="pl-what" className="text-label font-semibold text-fg">
            What it’s for
          </h3>
          <TextInput id="pl-title" label="Name" value={draft.title} onChange={(e) => set({ title: e.target.value })} error={err('title')} placeholder="e.g. Gele masterclass — one seat" />
          <TextArea id="pl-desc" label="Description" optional rows={3} value={draft.description} onChange={(e) => set({ description: e.target.value })} placeholder="What the payer gets, when and where." />
        </section>

        <section className="flex flex-col gap-4 border-t border-line pt-6" aria-labelledby="pl-amount">
          <h3 id="pl-amount" className="text-label font-semibold text-fg">
            Amount
          </h3>
          <Segmented<LinkKind>
            ariaLabel="How the amount is set"
            fullWidth
            value={draft.kind}
            onChange={(kind) => set({ kind, items: kind === 'items' && !draft.items.length ? [{ id: uid('pli'), label: '', unitNgn: 0, maxQty: 10 }] : draft.items })}
            options={[
            { value: 'fixed', label: 'Fixed' },
            { value: 'open', label: 'Payer chooses' },
            { value: 'items', label: 'Items' }]
            } />
          
          <p className="-mt-2 text-caption text-fg-subtle">{kindHelp[draft.kind]}</p>
          {draft.kind === 'fixed' && <TextInput id="pl-amount-v" label={staged ? 'Total amount' : 'Amount'} prefix="₦" inputMode="numeric" value={draft.amountNgn ? String(draft.amountNgn) : ''} disabled={lockedStages} hint={lockedStages ? 'A stage has been paid, so the total and stages are locked.' : undefined} onChange={(e) => set({ amountNgn: Number(e.target.value.replace(/\D/g, '')) || 0 })} error={err('amount')} />}
          {draft.kind === 'fixed' &&
          <div className="flex flex-col gap-3 rounded-md border border-line p-4">
              <Switch
              id="pl-staged"
              checked={staged}
              disabled={lockedStages}
              onChange={(on) => setStages(on ? defaultLinkStages() : undefined)}
              label="Pay in stages"
              description="One payer pays the total in parts, in order — e.g. half now, half on delivery. The link closes when every stage is paid." />
            
              {staged &&
            <>
                  <SelectInput<string>
                id="pl-stage-template"
                label="Start from a split"
                value=""
                disabled={lockedStages}
                options={[{ value: '', label: 'Choose a split…' }, ...linkStageTemplates.map((t) => ({ value: t.id, label: t.name }))]}
                onChange={(id) => {
                  const next = stagesFromLinkTemplate(id);
                  if (next) setStages(next);
                }} />
              
                  <ol className="flex flex-col gap-3" aria-label="Stages">
                    {(draft.stages ?? []).map((s, idx) =>
                <li key={s.id} className="flex flex-col gap-1">
                        <div className="grid grid-cols-[minmax(0,1fr)_96px_auto] items-end gap-2">
                          <TextInput id={`pls-label-${s.id}`} label={`Stage ${idx + 1}`} value={s.label} disabled={lockedStages} placeholder="e.g. Deposit" onChange={(e) => setStages((draft.stages ?? []).map((x) => x.id === s.id ? { ...x, label: e.target.value.slice(0, 40) } : x))} />
                          <TextInput id={`pls-pct-${s.id}`} label="Share (%)" inputMode="numeric" value={String(s.pct)} disabled={lockedStages} onChange={(e) => setStages((draft.stages ?? []).map((x) => x.id === s.id ? { ...x, pct: Math.min(95, Number(e.target.value.replace(/\D/g, '')) || 0) } : x))} />
                          <IconButton label={`Remove ${s.label || `stage ${idx + 1}`}`} icon={Trash2Icon} disabled={lockedStages || (draft.stages ?? []).length <= 2} onClick={() => setStages((draft.stages ?? []).filter((x) => x.id !== s.id))} />
                        </div>
                        {draft.amountNgn > 0 && <p className="text-caption tabular-nums text-fg-subtle">{formatNgn(stageAmounts[s.id] ?? 0)}{idx === 0 ? ' · paid first' : ''}</p>}
                      </li>
                )}
                  </ol>
                  {(draft.stages ?? []).length < MAX_LINK_STAGES && !lockedStages &&
              <Button size="sm" variant="tertiary" leadingIcon={PlusIcon} className="self-start" onClick={() => setStages([...(draft.stages ?? []), { id: uid('pls'), label: '', pct: 0 }])}>
                      Add stage
                    </Button>
              }
                  {err('stages') &&
              <p className="text-caption font-medium text-danger" role="alert">
                      {err('stages')}
                    </p>
              }
                </>
            }
            </div>
          }
          {draft.kind === 'open' && <TextInput id="pl-min" label="Minimum" prefix="₦" inputMode="numeric" value={draft.minNgn ? String(draft.minNgn) : ''} onChange={(e) => set({ minNgn: Number(e.target.value.replace(/\D/g, '')) || 0 })} error={err('min')} />}
          {draft.kind === 'items' &&
          <Field id="pl-items" label="Items" error={err('items')}>
              <ul className="flex flex-col gap-2">
                {draft.items.map((it, idx) =>
              <li key={it.id} className="grid grid-cols-[minmax(0,1fr)_120px_80px_auto] items-end gap-2">
                    <TextInput id={`pli-label-${it.id}`} label={idx === 0 ? 'Name' : `Item ${idx + 1} name`} value={it.label} onChange={(e) => set({ items: draft.items.map((x) => x.id === it.id ? { ...x, label: e.target.value } : x) })} />
                    <TextInput id={`pli-price-${it.id}`} label="Price" prefix="₦" inputMode="numeric" value={it.unitNgn ? String(it.unitNgn) : ''} onChange={(e) => set({ items: draft.items.map((x) => x.id === it.id ? { ...x, unitNgn: Number(e.target.value.replace(/\D/g, '')) || 0 } : x) })} />
                    <TextInput id={`pli-max-${it.id}`} label="Max qty" inputMode="numeric" value={String(it.maxQty)} onChange={(e) => set({ items: draft.items.map((x) => x.id === it.id ? { ...x, maxQty: Math.max(1, Math.min(99, Number(e.target.value.replace(/\D/g, '')) || 1)) } : x) })} />
                    <IconButton label={`Remove ${it.label || 'item'}`} icon={Trash2Icon} onClick={() => set({ items: draft.items.filter((x) => x.id !== it.id) })} disabled={draft.items.length === 1} />
                  </li>
              )}
              </ul>
              {draft.items.length < 8 &&
            <Button className="mt-2" size="sm" variant="tertiary" leadingIcon={PlusIcon} onClick={() => set({ items: [...draft.items, { id: uid('pli'), label: '', unitNgn: 0, maxQty: 10 }] })}>
                  Add item
                </Button>
            }
            </Field>
          }
          {example >= 100 &&
          <p className="rounded-md bg-sunken px-3 py-2 text-caption text-fg-muted">
              On a {formatNgn(example)} payment you receive about {formatNgn(example - linkProviderFee(example))} after the processing fee (1.5% + ₦100, example).
            </p>
          }
        </section>

        <section className="flex flex-col gap-4 border-t border-line pt-6" aria-labelledby="pl-rules">
          <h3 id="pl-rules" className="text-label font-semibold text-fg">
            Who can pay, and how often
          </h3>
          <Switch id="pl-reusable" checked={draft.reusable && !staged} disabled={staged} onChange={(reusable) => set({ reusable })} label="Reusable" description={staged ? 'Staged links are for one payer, so they can’t be reused.' : draft.reusable ? 'Many people can pay through the same link.' : 'Closes after one payment — good for a single invoice or deposit.'} />
          {draft.reusable && !staged &&
          <TextInput id="pl-max" label="Limit on payments" optional inputMode="numeric" value={draft.maxUses === null ? '' : String(draft.maxUses)} onChange={(e) => set({ maxUses: e.target.value ? Number(e.target.value.replace(/\D/g, '')) : null })} error={err('maxUses')} hint="e.g. 12 seats. Leave empty for no limit." />
          }
          <TextInput id="pl-expiry" label="Closes on" optional type="date" value={draft.expiresAt ? draft.expiresAt.slice(0, 10) : ''} onChange={(e) => set({ expiresAt: e.target.value ? `${e.target.value}T23:59:00` : null })} />
          <Field id="pl-fields" label="Ask the payer for">
            <div className="flex flex-col gap-3">
              <Switch id="pl-f-name" checked={draft.fields.name} onChange={(name) => set({ fields: { ...draft.fields, name } })} label="Name" />
              <Switch id="pl-f-phone" checked={draft.fields.phone} onChange={(phone) => set({ fields: { ...draft.fields, phone } })} label="Phone or WhatsApp" />
              <Switch id="pl-f-note" checked={draft.fields.note} onChange={(note) => set({ fields: { ...draft.fields, note } })} label="A note" description="e.g. which class date, or what they’re paying for." />
            </div>
          </Field>
        </section>

        <section className="flex flex-col gap-4 border-t border-line pt-6" aria-labelledby="pl-where">
          <h3 id="pl-where" className="text-label font-semibold text-fg">
            Where the money goes
          </h3>
          <SelectInput<PayMethod | 'default'>
            id="pl-method"
            label="Payment method"
            value={draft.method}
            onChange={(method) => set({ method })}
            options={[
            { value: 'default', label: `Payment links setting (${methodLabels[areaMethod]})` },
            { value: 'direct', label: methodLabels.direct },
            { value: 'wallet', label: methodLabels.wallet },
            { value: 'escrow', label: escrowAllowed ? `${methodLabels.escrow} — held 2 days after payment` : 'Escrow — Pro plan', disabled: !escrowAllowed }]
            } />
          
          <TextInput id="pl-slug" label="Link address" prefix="kub.icu/pay/" value={slug} onChange={(e) => (setSlugTouched(true), set({ slug: e.target.value.toLowerCase() }))} error={err('slug')} />
        </section>
      </div>
    </Sheet>);

}