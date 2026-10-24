import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';
import type { Block, BlockContentMap, BlockType } from '../../../types/page';
import type { ValidationIssue } from '../../../utils/validation';
import { useEditor } from '../../../contexts/EditorContext';
import { useCommerce } from '../../../contexts/CommerceContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useMoney } from '../../../hooks/useMoney';
import { blankLink, linkView, linkViewLabels, uniqueSlug } from '../../../utils/money/store';
import { uid } from '../../../utils/id';
import { formatNgn } from '../../../utils/format';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { Switch } from '../../ui/Switch';
import { Segmented } from '../../ui/Segmented';
import { Field } from '../../ui/Field';
import { SelectInput } from '../../ui/SelectInput';
import { CurrencyInput } from '../../ui/CurrencyInput';
import { InlineAlert } from '../../ui/InlineAlert';
import { MediaPicker } from '../../media/MediaPicker';
import { ItemListEditor } from './ItemListEditor';
import { AudioFileField } from './AudioFileField';
import { supportWordingLabels } from '../../blocks/SupportBlock';

interface Props {
  block: Block;
  issues: ValidationIssue[];
}

/** Inspector fields for the Batch 12 blocks: Audio, Playlist, Collection, Support (D124). */
export function MediaSupportFields({ block, issues }: Props) {
  const { actions } = useEditor();
  const commerce = useCommerce().data;
  const err = (field: string) => issues.find((i) => i.field === field && i.severity === 'error')?.message;
  const warn = (field: string) => issues.find((i) => i.field === field && i.severity === 'warning')?.message;
  const id = (field: string) => `${block.id}-${field}`;
  const setter =
  <K extends BlockType,>(type: K) =>
  (patch: Partial<BlockContentMap[K]>, field: string) =>
  actions.updateContent(block.id, type, patch, field);
  const stack = 'flex flex-col gap-4';

  switch (block.type) {
    case 'audio':{
        const c = block.content;
        const set = setter('audio');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" value={c.title} placeholder="e.g. Episode 4 — Pricing your work" onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextInput id={id('artist')} label="Artist or speaker" optional value={c.artist} onChange={(e) => set({ artist: e.target.value }, 'artist')} />
          <AudioFileField id={id('url')} url={c.url} fileName={c.fileName} error={err('url')} onChange={(p) => set(p, 'url')} />
          <MediaPicker id={id('cover')} label="Cover" optional aspect="1:1" value={c.coverUrl} onChange={(coverUrl, meta) => set(meta?.alt && !c.coverAlt ? { coverUrl, coverAlt: meta.alt } : { coverUrl }, 'coverUrl')} />
          {c.coverUrl && <TextInput id={id('coverAlt')} label="Cover description" value={c.coverAlt} hint={warn('coverAlt') ?? 'Read aloud by screen readers.'} onChange={(e) => set({ coverAlt: e.target.value }, 'coverAlt')} />}
          <TextArea id={id('transcript')} label="Transcript or description" optional rows={4} value={c.transcript} hint={warn('transcript') ?? 'Shown behind “Read transcript” for deaf and hard-of-hearing visitors.'} onChange={(e) => set({ transcript: e.target.value }, 'transcript')} />
          <Switch id={id('dl')} label="Let visitors download it" description="Off keeps it play-only on your page. Anyone can still record what plays." checked={c.allowDownload} onChange={(allowDownload) => set({ allowDownload }, 'allowDownload')} />
        </div>);

      }
    case 'playlist':{
        const c = block.content;
        const set = setter('playlist');
        const digital = commerce.products.filter((p) => p.kind === 'digital' && p.status !== 'archived');
        return (
          <div className={stack}>
          <TextInput id={id('title')} label="Title" optional placeholder="e.g. Lagos Nights EP" value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <TextInput id={id('artist')} label="Artist" optional value={c.artist} onChange={(e) => set({ artist: e.target.value }, 'artist')} />
          <MediaPicker id={id('cover')} label="Cover" optional aspect="1:1" value={c.coverUrl} onChange={(coverUrl, meta) => set(meta?.alt && !c.coverAlt ? { coverUrl, coverAlt: meta.alt } : { coverUrl }, 'coverUrl')} />
          {c.coverUrl && <TextInput id={id('coverAlt')} label="Cover description" value={c.coverAlt} hint={warn('coverAlt')} onChange={(e) => set({ coverAlt: e.target.value }, 'coverAlt')} />}
          <ItemListEditor
              legend="Tracks"
              noun="Track"
              items={c.tracks}
              max={20}
              min={1}
              onChange={(tracks, f) => set({ tracks }, f)}
              title={(t, i) => t.title || `Track ${i + 1}`}
              meta={(t) => !t.url ? 'No audio yet' : t.productId ? 'For sale' : undefined}
              create={() => ({ id: uid('tr'), title: '', artist: '', url: '', fileName: '', duration: '', productId: null })}
              addLabel="Add track"
              error={err('tracks')}
              hint={warn('tracks')}
              render={(t, update) =>
              <>
                <TextInput id={id(`t-${t.id}`)} label="Track title" value={t.title} onChange={(e) => update({ title: e.target.value }, 'tracks')} />
                <TextInput id={id(`a-${t.id}`)} label="Featuring" optional value={t.artist} onChange={(e) => update({ artist: e.target.value }, 'tracks')} />
                <AudioFileField id={id(`u-${t.id}`)} url={t.url} fileName={t.fileName} onChange={(p) => update(p, 'tracks')} />
                <TextInput id={id(`d-${t.id}`)} label="Length" optional placeholder="3:42" value={t.duration} onChange={(e) => update({ duration: e.target.value }, 'tracks')} />
                {digital.length ?
                <SelectInput
                  id={id(`p-${t.id}`)}
                  label="Sell this track"
                  value={t.productId ?? ''}
                  onChange={(v) => update({ productId: v || null }, 'tracks')}
                  options={[{ value: '', label: 'Not for sale' }, ...digital.map((p) => ({ value: p.id, label: `${p.name}${p.priceNgn !== null ? ` · ${formatNgn(p.priceNgn)}` : ''}${p.status === 'draft' ? ' (draft)' : ''}` }))]}
                  hint="Buyers get the full file by secure link, with your download limits." /> :


                <p className="text-caption text-fg-muted">
                    To sell tracks, add them as digital products first.{' '}
                    <Link to="/app/commerce/digital?new=1" className="inline-flex items-center gap-0.5 font-semibold text-action hover:underline">
                      Add one <ArrowUpRightIcon size={12} aria-hidden />
                    </Link>
                  </p>
                }
              </>
              } />
            
          <Switch id={id('dl')} label="Let visitors download free tracks" description="Tracks for sale are never downloadable from the player." checked={c.allowDownload} onChange={(allowDownload) => set({ allowDownload }, 'allowDownload')} />
        </div>);

      }
    case 'collection':{
        const c = block.content;
        const set = setter('collection');
        return (
          <div className={stack}>
          {commerce.collections.length ?
            <SelectInput
              id={id('collectionId')}
              label="Collection"
              value={c.collectionId ?? ''}
              onChange={(v) => set({ collectionId: v || null }, 'collectionId')}
              options={[{ value: '', label: 'Choose…' }, ...commerce.collections.map((col) => ({ value: col.id, label: `${col.name} · ${commerce.products.filter((p) => p.collectionIds.includes(col.id)).length}` }))]}
              hint={err('collectionId') ?? 'New products added to it appear automatically.'} /> :


            <InlineAlert tone="info" title="No collections yet">
              Group products into collections in Commerce → Products, then pick one here.
            </InlineAlert>
            }
          <TextInput id={id('title')} label="Title" optional placeholder="Uses the collection name" value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
          <Field id={id('layout')} label="Layout">
            <Segmented ariaLabel="Collection layout" fullWidth value={c.layout} onChange={(layout) => set({ layout }, 'layout')} options={[{ value: 'strip', label: 'Swipe strip' }, { value: 'grid', label: 'Grid' }]} />
          </Field>
          <SelectInput id={id('limit')} label="Show up to" value={String(c.limit)} onChange={(v) => set({ limit: Number(v) }, 'limit')} options={[4, 6, 8, 12].map((n) => ({ value: String(n), label: `${n} products` }))} />
          <Switch id={id('seeAll')} label="“See all” link" description="Opens your shop filtered to this collection." checked={c.showSeeAll} onChange={(showSeeAll) => set({ showSeeAll }, 'showSeeAll')} />
        </div>);

      }
    case 'support':
      return <SupportFields block={block} issues={issues} />;
    default:
      return null;
  }
}

/** Support block fields. Creates its open payment link on first open and keeps it in sync. */
function SupportFields({ block, issues }: {block: Extract<Block, {type: 'support';}>;issues: ValidationIssue[];}) {
  const { actions, state } = useEditor();
  const { current } = useWorkspace();
  const money = useMoney(current.id);
  const c = block.content;
  const set = (patch: Partial<BlockContentMap['support']>, field: string) => actions.updateContent(block.id, 'support', patch, field);
  const link = c.linkId ? money.data.links.find((l) => l.id === c.linkId) : undefined;
  const err = issues.find((i) => i.field === 'amounts' && i.severity === 'error')?.message;
  const warn = issues.find((i) => i.field === 'amounts' && i.severity === 'warning')?.message;
  const fid = (f: string) => `${block.id}-${f}`;
  const title = c.title || supportWordingLabels[c.wording].verb;

  // Create the link the first time, or again if it was deleted from Payment links.
  const creating = useRef(false);
  useEffect(() => {
    if (link) {
      creating.current = false;
      return;
    }
    if (creating.current) return;
    creating.current = true;
    const next = { ...blankLink(), kind: 'open' as const, title, minNgn: c.minNgn, fields: { name: c.askName, phone: false, note: c.askMessage }, description: `From the “${title}” block on ${state.draft.title || 'your page'}.` };
    money.update((d) => ({ ...d, links: [{ ...next, slug: uniqueSlug(d, `${title}`) }, ...d.links] }));
    set({ linkId: next.id }, 'amounts');
  }, [link?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the link's title, minimum and questions matching the block.
  useEffect(() => {
    if (!link) return;
    if (link.title === title && link.minNgn === c.minNgn && link.fields.name === c.askName && link.fields.note === c.askMessage) return;
    money.update((d) => ({ ...d, links: d.links.map((l) => l.id === link.id ? { ...l, title, minNgn: c.minNgn, fields: { ...l.fields, name: c.askName, note: c.askMessage } } : l) }));
  }, [title, c.minNgn, c.askName, c.askMessage, link?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const amounts = [...c.amounts, 0, 0, 0, 0].slice(0, 4);
  const received = link ? link.payments.filter((p) => !p.sample).reduce((s, p) => s + p.amountNgn, 0) : 0;

  return (
    <div className="flex flex-col gap-4">
      <Field id={fid('wording')} label="Wording">
        <Segmented
          ariaLabel="Button wording"
          fullWidth
          value={c.wording}
          onChange={(wording) => set({ wording }, 'wording')}
          options={[
          { value: 'support', label: 'Support' },
          { value: 'tip', label: 'Tip' },
          { value: 'donate', label: 'Donate' }]
          } />
        
      </Field>
      {c.wording === 'donate' &&
      <InlineAlert tone="info" title="Donations aren’t tax-deductible here">
          Visitors are told this is a payment to you, not a registered charity donation. Raising money for a cause may need extra permissions — wording pending legal review.
        </InlineAlert>
      }
      <TextInput id={fid('title')} label="Heading" value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
      <TextArea id={fid('intro')} label="Why support you" optional rows={3} placeholder="e.g. Every tip helps me keep the tutorials free." value={c.intro} onChange={(e) => set({ intro: e.target.value }, 'intro')} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-label font-medium text-fg">Suggested amounts</legend>
        <div className="grid grid-cols-2 gap-2">
          {amounts.map((a, i) =>
          <CurrencyInput
            key={i}
            id={fid(`amt-${i}`)}
            label={`Amount ${i + 1}`}
            optional={i > 0}
            value={a || null}
            onChange={(v) => {
              const next = [...amounts];
              next[i] = v ?? 0;
              set({ amounts: next.filter((x) => x > 0) }, 'amounts');
            }} />

          )}
        </div>
        {(err || warn) && <p className={`text-caption font-medium ${err ? 'text-danger' : 'text-warning'}`}>{err ?? warn}</p>}
      </fieldset>
      <Switch id={fid('other')} label="Allow “Other amount”" checked={c.allowOther} onChange={(allowOther) => set({ allowOther }, 'amounts')} />
      <CurrencyInput id={fid('min')} label="Smallest amount" value={c.minNgn} onChange={(v) => set({ minNgn: Math.max(100, v ?? 100) }, 'minNgn')} hint="Keeps payment fees from eating small amounts." />
      <Switch id={fid('name')} label="Ask for their name" checked={c.askName} onChange={(askName) => set({ askName }, 'askName')} />
      <Switch id={fid('msg')} label="Let them leave a message" checked={c.askMessage} onChange={(askMessage) => set({ askMessage }, 'askMessage')} />
      {link &&
      <div className="flex flex-col gap-1 rounded-md border border-line bg-sunken px-3 py-2.5 text-caption">
          <span className="text-fg">
            Paid through the payment link <span className="font-semibold">{link.title}</span> · {linkViewLabels[linkView(link)]}
          </span>
          <span className="text-fg-muted">
            {link.payments.filter((p) => !p.sample).length} payments · {formatNgn(received)} received. Where the money goes follows Payment links in Commerce → Payments.
          </span>
          <Link to="/app/commerce/payment-links" className="mt-0.5 inline-flex items-center gap-0.5 self-start font-semibold text-action hover:underline">
            Open in Payment links <ArrowUpRightIcon size={12} aria-hidden />
          </Link>
        </div>
      }
    </div>);

}