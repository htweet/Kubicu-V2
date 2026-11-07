import React, { useEffect, useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { LinkKind, LinkStage, MoneyData, PayMethod, PaymentLink } from '../../types/money';
import { MAX_LINK_STAGES, defaultLinkStages, linkStageAmounts, linkStageProblems, linkStageTemplates, stagesFromLinkTemplate } from '../../utils/money/linkStages';
import { blankLink, linkProviderFee, methodFor, methodLabels, uniqueSlug } from '../../utils/money/store';
import { uid } from '../../utils/id';
import { USSD_AVAILABLE } from '../../data/ussdBanks';
import { formatNgn } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { currencySymbol } from '../../utils/currency';

const sym = currencySymbol;
import { TextArea } from '../ui/TextArea';
import { Segmented } from '../ui/Segmented';
import { SelectInput } from '../ui/SelectInput';
import { Switch } from '../ui/Switch';
import { Field } from '../ui/Field';
import { IconButton } from '../ui/IconButton';
import { useT } from '../../contexts/LocaleContext';
import { MediaPicker } from '../media/MediaPicker';
import type { LinkQuestion, LinkQuestionType } from '../../types/money';
import { MAX_LINK_QUESTIONS, MAX_SUGGESTED_AMOUNTS, payerFeeFor, safeRedirect } from '../../utils/money/linkCheckout';
import { useOptionalCommerce } from '../../contexts/CommerceContext';
import { shopSettingsOf } from '../../utils/commerce/shopSettings';

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
  items: 'The payer picks quantities from a short list — tickets, packs, add-ons.',
};

/** Create or edit a payment link (D92). */
export function PaymentLinkEditor({ open, link, data, escrowAllowed, onClose, onSave }: PaymentLinkEditorProps) {
  const { t: tr } = useT();
  const shop = shopSettingsOf(useOptionalCommerce()?.data);
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
    stages: staged ? linkStageProblems(draft.stages ?? []) : undefined,
    max: draft.kind === 'open' && draft.maxNgn && draft.maxNgn <= draft.minNgn ? 'The maximum must be more than the minimum.' : undefined,
    suggested: draft.kind === 'open' && (draft.suggested ?? []).some((a) => a < draft.minNgn || (!!draft.maxNgn && a > draft.maxNgn)) ? 'Suggested amounts must sit between the minimum and maximum.' : undefined,
    questions: (draft.questions ?? []).some((q) => !q.label.trim() || (q.type === 'choice' && q.options.filter((o) => o.trim()).length < 2)) ? 'Each question needs a label; choice questions need at least 2 options.' : undefined,
    redirect: draft.after?.redirectUrl.trim() && !safeRedirect(draft.after.redirectUrl) ? 'Use a full https:// address.' : undefined,
    ways: draft.methods && !draft.methods.card && !draft.methods.transfer && !(USSD_AVAILABLE && draft.methods.ussd) ? 'Keep at least one way to pay on.' : undefined,
  };
  const stageAmounts = staged ? linkStageAmounts(draft) : {};
  const lockedStages = !!link && link.payments.some((p) => p.stageId);
  const setStages = (stages: LinkStage[] | undefined) => set({ stages, reusable: stages ? false : draft.reusable });
  const ok = Object.values(errors).every((e) => !e);

  const save = () => {
    setTried(true);
    if (!ok) return;
    onSave({
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      slug,
      stages: staged ? draft.stages?.map((s) => ({ ...s, label: s.label.trim() })) : undefined,
      reusable: staged ? false : draft.reusable,
      suggested: draft.kind === 'open' && draft.suggested?.length ? [...draft.suggested].sort((a, b) => a - b) : undefined,
      maxNgn: draft.kind === 'open' ? draft.maxNgn || null : null,
      questions: draft.questions?.length ? draft.questions.map((q) => ({ ...q, label: q.label.trim(), options: q.options.map((o) => o.trim()).filter(Boolean) })) : undefined,
      after: draft.after && (draft.after.message.trim() || draft.after.redirectUrl.trim()) ? { message: draft.after.message.trim(), redirectUrl: safeRedirect(draft.after.redirectUrl) } : undefined,
    });
  };
  const fundraiser = !!draft.fundraiser;
  const ask = draft.ask ?? { email: 'off', address: 'off' };
  const questions = draft.questions ?? [];
  const setQ = (id: string, p: Partial<LinkQuestion>) => set({ questions: questions.map((q) => (q.id === id ? { ...q, ...p } : q)) });

  const example = draft.kind === 'fixed' ? draft.amountNgn : draft.kind === 'open' ? draft.minNgn : draft.items.reduce((s, i) => s + i.unitNgn, 0);
  const areaMethod = methodFor(data, 'links');
  const err = (k: keyof typeof errors) => (tried ? errors[k] : undefined);

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
      }
    >
      <div className="flex flex-col gap-6 p-5">
        <section className="flex flex-col gap-4" aria-labelledby="pl-what">
          <h3 id="pl-what" className="text-label font-semibold text-fg">
            {tr('What it’s for')}
          </h3>
          <TextInput id="pl-title" label="Name" value={draft.title} onChange={(e) => set({ title: e.target.value })} error={err('title')} placeholder={tr('e.g. Gele masterclass — one seat')} />
          <TextArea id="pl-desc" label="Description" optional rows={4} maxLength={1000} value={draft.description} onChange={(e) => set({ description: e.target.value })} placeholder={tr('What the payer gets, when and where.')} />
          {!fundraiser && <MediaPicker id="pl-image" label="Image on the pay page" optional aspect="16:9" folder="products" value={draft.imageUrl ?? ''} onChange={(imageUrl) => set({ imageUrl: imageUrl || undefined })} />}
        </section>

        <section className="flex flex-col gap-4 border-t border-line pt-6" aria-labelledby="pl-amount">
          <h3 id="pl-amount" className="text-label font-semibold text-fg">
            {tr('Amount')}
          </h3>
          <Segmented<LinkKind>
            ariaLabel="How the amount is set"
            fullWidth
            value={draft.kind}
            onChange={(kind) => set({ kind, items: kind === 'items' && !draft.items.length ? [{ id: uid('pli'), label: '', unitNgn: 0, maxQty: 10 }] : draft.items })}
            options={[
              { value: 'fixed', label: 'Fixed' },
              { value: 'open', label: 'Payer chooses' },
              { value: 'items', label: 'Items' },
            ]}
          />
          <p className="-mt-2 text-caption text-fg-subtle">{tr(kindHelp[draft.kind])}</p>
          {draft.kind === 'fixed' && <TextInput id="pl-amount-v" label={staged ? 'Total amount' : 'Amount'} prefix={sym()} inputMode="numeric" value={draft.amountNgn ? String(draft.amountNgn) : ''} disabled={lockedStages} hint={lockedStages ? 'A stage has been paid, so the total and stages are locked.' : undefined} onChange={(e) => set({ amountNgn: Number(e.target.value.replace(/\D/g, '')) || 0 })} error={err('amount')} />}
          {draft.kind === 'fixed' && (
            <div className="flex flex-col gap-3 rounded-md border border-line p-4">
              <Switch
                id="pl-staged"
                checked={staged}
                disabled={lockedStages}
                onChange={(on) => setStages(on ? defaultLinkStages() : undefined)}
                label="Pay in stages"
                description="One payer pays the total in parts, in order — e.g. half now, half on delivery. The link closes when every stage is paid."
              />
              {staged && (
                <>
                  <SelectInput<string>
                    id="pl-stage-template"
                    label="Start from a split"
                    value=""
                    disabled={lockedStages}
                    options={[{ value: '', label: tr('Choose a split…') }, ...linkStageTemplates.map((t) => ({ value: t.id, label: tr(t.name) }))]}
                    onChange={(id) => {
                      const next = stagesFromLinkTemplate(id);
                      if (next) setStages(next);
                    }}
                  />
                  <ol className="flex flex-col gap-3" aria-label={tr('Stages')}>
                    {(draft.stages ?? []).map((s, idx) => (
                      <li key={s.id} className="flex flex-col gap-1">
                        <div className="grid grid-cols-[minmax(0,1fr)_96px_auto] items-end gap-2">
                          <TextInput id={`pls-label-${s.id}`} label={tr('Stage {n}', { n: idx + 1 })} value={s.label} disabled={lockedStages} placeholder={tr('e.g. Deposit')} onChange={(e) => setStages((draft.stages ?? []).map((x) => (x.id === s.id ? { ...x, label: e.target.value.slice(0, 40) } : x)))} />
                          <TextInput id={`pls-pct-${s.id}`} label="Share (%)" inputMode="numeric" value={String(s.pct)} disabled={lockedStages} onChange={(e) => setStages((draft.stages ?? []).map((x) => (x.id === s.id ? { ...x, pct: Math.min(95, Number(e.target.value.replace(/\D/g, '')) || 0) } : x)))} />
                          <IconButton label={tr('Remove {name}', { name: s.label || tr('Stage {n}', { n: idx + 1 }) })} icon={Trash2Icon} disabled={lockedStages || (draft.stages ?? []).length <= 2} onClick={() => setStages((draft.stages ?? []).filter((x) => x.id !== s.id))} />
                        </div>
                        {draft.amountNgn > 0 && <p className="text-caption tabular-nums text-fg-subtle">{formatNgn(stageAmounts[s.id] ?? 0)}{idx === 0 ? ` · ${tr('paid first')}` : ''}</p>}
                      </li>
                    ))}
                  </ol>
                  {(draft.stages ?? []).length < MAX_LINK_STAGES && !lockedStages && (
                    <Button size="sm" variant="tertiary" leadingIcon={PlusIcon} className="self-start" onClick={() => setStages([...(draft.stages ?? []), { id: uid('pls'), label: '', pct: 0 }])}>
                      {tr('Add stage')}
                    </Button>
                  )}
                  {err('stages') && (
                    <p className="text-caption font-medium text-danger" role="alert">
                      {tr(err('stages') as string)}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
          {draft.kind === 'open' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput id="pl-min" label="Minimum" prefix={sym()} inputMode="numeric" value={draft.minNgn ? String(draft.minNgn) : ''} onChange={(e) => set({ minNgn: Number(e.target.value.replace(/\D/g, '')) || 0 })} error={err('min')} />
              {!fundraiser && <TextInput id="pl-max" label="Maximum" optional prefix={sym()} inputMode="numeric" value={draft.maxNgn ? String(draft.maxNgn) : ''} placeholder="No maximum" onChange={(e) => set({ maxNgn: Number(e.target.value.replace(/\D/g, '')) || null })} error={err('max')} />}
            </div>
          )}
          {draft.kind === 'open' && !fundraiser && (
            <Field id="pl-suggested" label="Amounts to tap" hint={tr('Up to {n}. The payer can still type their own.', { n: MAX_SUGGESTED_AMOUNTS })} error={err('suggested')}>
              <div className="flex flex-wrap items-end gap-2">
                {(draft.suggested ?? []).map((a, i) => (
                  <div key={i} className="flex items-end gap-1">
                    <TextInput id={`pl-sug-${i}`} label={tr('Amount {n}', { n: i + 1 })} fieldClassName="w-32 [&>div:first-child]:sr-only" prefix={sym()} inputMode="numeric" value={a ? String(a) : ''} onChange={(e) => set({ suggested: (draft.suggested ?? []).map((x, n) => (n === i ? Number(e.target.value.replace(/\D/g, '')) || 0 : x)) })} />
                    <IconButton icon={Trash2Icon} size="sm" label={tr('Remove amount {n}', { n: i + 1 })} onClick={() => set({ suggested: (draft.suggested ?? []).filter((_, n) => n !== i) })} />
                  </div>
                ))}
                {(draft.suggested ?? []).length < MAX_SUGGESTED_AMOUNTS && (
                  <Button size="sm" variant="tertiary" leadingIcon={PlusIcon} onClick={() => set({ suggested: [...(draft.suggested ?? []), Math.max(draft.minNgn, 1000)] })}>
                    {tr('Add amount')}
                  </Button>
                )}
              </div>
            </Field>
          )}
          {draft.kind === 'items' && (
            <Field id="pl-items" label="Items" error={err('items')}>
              <ul className="flex flex-col gap-2">
                {draft.items.map((it, idx) => (
                  <li key={it.id} className="grid grid-cols-[minmax(0,1fr)_120px_80px_auto] items-end gap-2">
                    <TextInput id={`pli-label-${it.id}`} label={idx === 0 ? 'Name' : tr('Item {n} name', { n: idx + 1 })} value={it.label} onChange={(e) => set({ items: draft.items.map((x) => (x.id === it.id ? { ...x, label: e.target.value } : x)) })} />
                    <TextInput id={`pli-price-${it.id}`} label="Price" prefix={sym()} inputMode="numeric" value={it.unitNgn ? String(it.unitNgn) : ''} onChange={(e) => set({ items: draft.items.map((x) => (x.id === it.id ? { ...x, unitNgn: Number(e.target.value.replace(/\D/g, '')) || 0 } : x)) })} />
                    <TextInput id={`pli-max-${it.id}`} label="Max qty" inputMode="numeric" value={String(it.maxQty)} onChange={(e) => set({ items: draft.items.map((x) => (x.id === it.id ? { ...x, maxQty: Math.max(1, Math.min(99, Number(e.target.value.replace(/\D/g, '')) || 1)) } : x)) })} />
                    <IconButton label={tr('Remove {name}', { name: it.label || tr('item') })} icon={Trash2Icon} onClick={() => set({ items: draft.items.filter((x) => x.id !== it.id) })} disabled={draft.items.length === 1} />
                  </li>
                ))}
              </ul>
              {draft.items.length < 8 && (
                <Button className="mt-2" size="sm" variant="tertiary" leadingIcon={PlusIcon} onClick={() => set({ items: [...draft.items, { id: uid('pli'), label: '', unitNgn: 0, maxQty: 10 }] })}>
                  {tr('Add item')}
                </Button>
              )}
            </Field>
          )}
          {example >= 100 && (
            <p className="rounded-md bg-sunken px-3 py-2 text-caption text-fg-muted">
              {tr('On a {amount} payment you receive about {net} after the processing fee (1.5% + ₦100, example).', { amount: formatNgn(example), net: formatNgn(example - linkProviderFee(example)) })}
            </p>
          )}
        </section>

        <section className="flex flex-col gap-4 border-t border-line pt-6" aria-labelledby="pl-rules">
          <h3 id="pl-rules" className="text-label font-semibold text-fg">
            {tr('Who can pay, and how often')}
          </h3>
          <Switch id="pl-reusable" checked={draft.reusable && !staged} disabled={staged} onChange={(reusable) => set({ reusable })} label="Reusable" description={staged ? 'Staged links are for one payer, so they can’t be reused.' : draft.reusable ? 'Many people can pay through the same link.' : 'Closes after one payment — good for a single invoice or deposit.'} />
          {draft.reusable && !staged && (
            <TextInput id="pl-max" label="Limit on payments" optional inputMode="numeric" value={draft.maxUses === null ? '' : String(draft.maxUses)} onChange={(e) => set({ maxUses: e.target.value ? Number(e.target.value.replace(/\D/g, '')) : null })} error={err('maxUses')} hint="e.g. 12 seats. Leave empty for no limit." />
          )}
          <TextInput id="pl-expiry" label="Closes on" optional type="date" value={draft.expiresAt ? draft.expiresAt.slice(0, 10) : ''} onChange={(e) => set({ expiresAt: e.target.value ? `${e.target.value}T23:59:00` : null })} />
          <Field id="pl-fields" label="Ask the payer for">
            <div className="flex flex-col gap-3">
              <Switch id="pl-f-name" checked={draft.fields.name} onChange={(name) => set({ fields: { ...draft.fields, name } })} label="Name" />
              <Switch id="pl-f-phone" checked={draft.fields.phone} onChange={(phone) => set({ fields: { ...draft.fields, phone } })} label="Phone or WhatsApp" />
              <Switch id="pl-f-note" checked={draft.fields.note} onChange={(note) => set({ fields: { ...draft.fields, note } })} label="A note" description="e.g. which class date, or what they’re paying for." />
            </div>
          </Field>
          {!fundraiser && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {(['email', 'address'] as const).map((k) => (
                  <Field key={k} id={`pl-ask-${k}`} label={k === 'email' ? 'Email' : 'Address'}>
                    <Segmented
                      ariaLabel={k === 'email' ? 'Ask for email' : 'Ask for address'}
                      fullWidth
                      size="sm"
                      value={ask[k]}
                      onChange={(v) => set({ ask: { ...ask, [k]: v } })}
                      options={[
                        { value: 'required', label: 'Required' },
                        { value: 'optional', label: 'Optional' },
                        { value: 'off', label: 'Off' },
                      ]}
                    />
                  </Field>
                ))}
              </div>
              <Field id="pl-questions" label="Your own questions" hint={tr('Up to {n} — e.g. “Size” or “Event date”.', { n: MAX_LINK_QUESTIONS })} error={err('questions')}>
                <ol className="flex flex-col gap-3">
                  {questions.map((q, i) => (
                    <li key={q.id} className="flex flex-col gap-3 rounded-md border border-line p-3">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_auto]">
                        <TextInput id={`plq-l-${q.id}`} label={tr('Question {n}', { n: i + 1 })} value={q.label} placeholder={tr('e.g. Dress size')} onChange={(e) => setQ(q.id, { label: e.target.value.slice(0, 80) })} />
                        <div className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto">
                          <SelectInput<LinkQuestionType> id={`plq-t-${q.id}`} label="Answer" value={q.type} onChange={(type) => setQ(q.id, { type, options: type === 'choice' && q.options.length < 2 ? ['', ''] : q.options })} options={[{ value: 'text', label: tr('Short text') }, { value: 'choice', label: tr('Choice') }, { value: 'date', label: tr('Date') }]} />
                        </div>
                        <IconButton icon={Trash2Icon} label={tr('Remove question {n}', { n: i + 1 })} onClick={() => set({ questions: questions.filter((x) => x.id !== q.id) })} />
                      </div>
                      {q.type === 'choice' && (
                        <TextArea id={`plq-o-${q.id}`} label="Options" rows={3} hint={tr('One per line.')} value={q.options.join('\n')} onChange={(e) => setQ(q.id, { options: e.target.value.split('\n').slice(0, 12) })} />
                      )}
                      <Switch id={`plq-r-${q.id}`} label="Required" checked={q.required} onChange={(required) => setQ(q.id, { required })} />
                    </li>
                  ))}
                </ol>
                {questions.length < MAX_LINK_QUESTIONS && (
                  <Button className="mt-2" size="sm" variant="tertiary" leadingIcon={PlusIcon} onClick={() => set({ questions: [...questions, { id: uid('plq'), label: '', type: 'text', options: [], required: false }] })}>
                    {tr('Add question')}
                  </Button>
                )}
              </Field>
            </>
          )}
        </section>

        {!fundraiser && (
          <section className="flex flex-col gap-4 border-t border-line pt-6" aria-labelledby="pl-paying">
            <h3 id="pl-paying" className="text-label font-semibold text-fg">
              {tr('Paying')}
            </h3>
            <Switch
              id="pl-fee"
              checked={!!draft.payerCoversFee}
              onChange={(payerCoversFee) => set({ payerCoversFee: payerCoversFee || undefined })}
              label="Payer covers the processing fee"
              description={example >= 100 ? tr('The pay page shows “{amount} + {fee} processing fee”, and you receive the full {amount}.', { amount: formatNgn(example), fee: formatNgn(payerFeeFor(example)) }) : 'The pay page shows the fee as its own line, and you receive the full amount.'}
            />
            <Switch
              id="pl-ways"
              checked={!!draft.methods}
              onChange={(on) => set({ methods: on ? { card: shop.methods.card, transfer: shop.methods.transfer, ussd: shop.methods.ussd } : undefined })}
              label="Choose ways to pay for this link"
              description={draft.methods ? 'Only the ways ticked below are offered.' : 'Off: follows Commerce settings → Payment methods.'}
            />
            {draft.methods && (
              <fieldset className="flex flex-wrap gap-x-6 gap-y-2 border-l-2 border-line pl-4">
                <legend className="sr-only">{tr('Ways to pay')}</legend>
                {(USSD_AVAILABLE ? (['card', 'transfer', 'ussd'] as const) : (['card', 'transfer'] as const)).map((k) => (
                  <label key={k} className="flex min-h-[36px] items-center gap-2 text-label text-fg">
                    <input type="checkbox" className="h-4 w-4" checked={draft.methods![k]} onChange={(e) => set({ methods: { ...draft.methods!, [k]: e.target.checked } })} />
                    {k === 'card' ? tr('Card') : k === 'transfer' ? tr('Bank transfer') : 'USSD'}
                  </label>
                ))}
                {err('ways') && <p className="basis-full text-caption text-danger">{tr(err('ways') as string)}</p>}
              </fieldset>
            )}
            {shop.tax.enabled && (
              <Switch id="pl-vat" checked={!draft.noVat} onChange={(on) => set({ noVat: on ? undefined : true })} label="Charge VAT on this link" description={draft.noVat ? 'No VAT on this link — e.g. a deposit or a refundable fee.' : tr('Follows Commerce settings → Tax ({rate}, {mode}).', { rate: `${shop.tax.ratePct}%`, mode: shop.tax.inclusive ? tr('included in the amount') : tr('added on top') })} />
            )}
          </section>
        )}

        {!fundraiser && (
          <section className="flex flex-col gap-4 border-t border-line pt-6" aria-labelledby="pl-after">
            <h3 id="pl-after" className="text-label font-semibold text-fg">
              {tr('After paying')}
            </h3>
            <TextArea id="pl-thanks" label="Thank-you message" optional rows={2} maxLength={300} placeholder={tr('e.g. See you on Saturday! Bring your own fabric.')} value={draft.after?.message ?? ''} onChange={(e) => set({ after: { message: e.target.value, redirectUrl: draft.after?.redirectUrl ?? '' } })} />
            <TextInput id="pl-redirect" label="Then send them to" optional type="url" inputMode="url" placeholder="https://" value={draft.after?.redirectUrl ?? ''} hint="A button on the receipt opens it. Their receipt stays available." error={err('redirect')} onChange={(e) => set({ after: { message: draft.after?.message ?? '', redirectUrl: e.target.value } })} />
          </section>
        )}

        <section className="flex flex-col gap-4 border-t border-line pt-6" aria-labelledby="pl-where">
          <h3 id="pl-where" className="text-label font-semibold text-fg">
            {tr('Where the money goes')}
          </h3>
          <SelectInput<PayMethod | 'default'>
            id="pl-method"
            label="Payment method"
            value={draft.method}
            onChange={(method) => set({ method })}
            options={[
              { value: 'default', label: tr('Payment links setting ({method})', { method: tr(methodLabels[areaMethod]) }) },
              { value: 'direct', label: tr(methodLabels.direct) },
              { value: 'wallet', label: tr(methodLabels.wallet) },
              { value: 'escrow', label: escrowAllowed ? tr('Escrow — held 2 days after payment') : tr('Escrow — Pro plan'), disabled: !escrowAllowed },
            ]}
          />
          <TextInput id="pl-slug" label="Link address" prefix="kub.icu/pay/" value={slug} onChange={(e) => (setSlugTouched(true), set({ slug: e.target.value.toLowerCase() }))} error={err('slug')} />
        </section>
      </div>
    </Sheet>
  );
}
