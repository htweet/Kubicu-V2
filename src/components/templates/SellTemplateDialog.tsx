import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRightIcon, CheckIcon } from 'lucide-react';
import type { TemplateLicence, TemplateListing } from '../../types/templateListing';
import type { PageDocument } from '../../types/page';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useEditor } from '../../contexts/EditorContext';
import { useTeam } from '../../contexts/TeamContext';
import { activeExtraSpaces, mainSpace, readSpacePage } from '../../utils/spaces';
import { PRICE_MAX_NGN, PRICE_MIN_NGN, creatorShare, listingEvent, sanitiseForTemplate, updateTemplateStore } from '../../utils/templateListings';
import { uid } from '../../utils/id';
import { formatNgn } from '../../utils/format';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { SelectInput } from '../ui/SelectInput';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Segmented } from '../ui/Segmented';
import { TemplateThumb } from './TemplateThumb';
import { licenceLabels } from './CreatorListingInfo';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Update an existing listing with a new version (goes back to review). */
  listing?: TemplateListing | null;
}

const categories = ['Fashion & retail', 'Restaurant & food', 'Beauty & wellness', 'Services', 'Creative & portfolio', 'Events', 'Community & causes', 'Education'];
const regions = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Accra', 'Nairobi', 'Anywhere'];

/** Sell a space as a template: details, then a side-by-side check of what's removed, then submit for review (D70). */
export function SellTemplateDialog({ open, onClose, listing = null }: Props) {
  const { current, currentSpace } = useWorkspace();
  const { state } = useEditor();
  const team = useTeam();
  const spaces = [mainSpace(current), ...activeExtraSpaces(current)];
  const [step, setStep] = useState<'details' | 'check'>('details');
  const [spaceId, setSpaceId] = useState(listing?.sourceSpaceId ?? currentSpace.id);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [region, setRegion] = useState('Lagos');
  const [description, setDescription] = useState('');
  const [paid, setPaid] = useState<'free' | 'paid'>('paid');
  const [price, setPrice] = useState<number | null>(3000);
  const [licence, setLicence] = useState<TemplateLicence>('standard');
  const [photosOk, setPhotosOk] = useState(false);
  const [tried, setTried] = useState(false);
  const [kind, setKind] = useState<'page' | 'theme'>('page');

  useEffect(() => {
    if (!open) return;
    setStep('details');
    setTried(false);
    setPhotosOk(false);
    setSpaceId(listing?.sourceSpaceId ?? currentSpace.id);
    setName(listing?.name ?? '');
    setCategory(listing?.category ?? categories[0]);
    setRegion(listing?.region ?? 'Lagos');
    setDescription(listing?.description ?? '');
    setPaid(listing && listing.priceNgn === 0 ? 'free' : 'paid');
    setPrice(listing?.priceNgn || 3000);
    setLicence(listing?.licence ?? 'standard');
    setKind(listing?.kind ?? 'page');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const source: PageDocument | null = useMemo(() => {
    if (!open) return null;
    if (spaceId === currentSpace.id) return state.draft;
    const p = readSpacePage(current.id, spaceId);
    return p?.draft ?? p?.published ?? null;
  }, [open, spaceId, currentSpace.id, state.draft, current.id]);
  const clean = useMemo(() => source ? sanitiseForTemplate(source) : null, [source]);

  const errors = {
    name: name.trim().length < 3 ? 'Give it a name buyers will recognise.' : '',
    description: description.trim().length < 20 ? 'Say who it’s for in a sentence or two (20+ characters).' : '',
    price: paid === 'paid' && (!price || price < PRICE_MIN_NGN || price > PRICE_MAX_NGN) ? `Between ${formatNgn(PRICE_MIN_NGN)} and ${formatNgn(PRICE_MAX_NGN)}.` : '',
    source: !source || source.blocks.length < 3 ? 'This space needs at least three blocks to make a useful template.' : ''
  };
  const err = (k: keyof typeof errors) => tried ? errors[k] || undefined : undefined;
  const finalPrice = paid === 'free' ? 0 : price ?? 0;

  const submit = () => {
    if (!clean || !photosOk) return;
    const now = new Date().toISOString();
    const ok = updateTemplateStore((s) => {
      if (listing) {
        const nextVersion = Math.max(listing.listedVersion, listing.pendingVersion ?? 0) + 1;
        return {
          ...s,
          listings: s.listings.map((l) =>
          l.id === listing.id ?
          {
            ...l,
            name: name.trim(),
            category,
            region,
            description: description.trim(),
            priceNgn: finalPrice,
            licence,
            kind,
            sourceSpaceId: spaceId,
            pendingDoc: clean,
            pendingVersion: nextVersion,
            status: l.status === 'listed' ? 'listed' : 'in_review',
            reviewNote: null,
            submittedAt: now,
            events: [listingEvent(`Sent v${nextVersion} for review${l.status === 'listed' ? ' — v' + l.listedVersion + ' stays on sale meanwhile' : ''}`, 'creator'), ...l.events]
          } :
          l
          )
        };
      }
      const created: TemplateListing = {
        id: uid('ctl'),
        workspaceId: current.id,
        creatorName: current.name,
        sourceSpaceId: spaceId,
        name: name.trim(),
        category,
        region,
        description: description.trim(),
        priceNgn: finalPrice,
        licence,
        kind,
        status: 'in_review',
        listedDoc: null,
        listedVersion: 0,
        pendingDoc: clean,
        pendingVersion: 1,
        reviewNote: null,
        submittedAt: now,
        listedAt: null,
        events: [listingEvent('Submitted for review', 'creator')],
        reviews: []
      };
      return { ...s, listings: [created, ...s.listings] };
    });
    if (!ok) {
      toast.error('Couldn’t submit', { description: 'Browser storage is full.' });
      return;
    }
    team.log('pages', `${listing ? 'sent an update to' : 'submitted'} the template “${name.trim()}” for KUBICU review`, '/app/templates?tab=mine');
    toast.success(listing ? 'Update sent for review' : 'Sent for review', { description: 'KUBICU checks templates within 2 working days (example). You’ll get a notice either way.' });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={listing ? `Update “${listing.name}”` : 'Sell a template'}
      description={step === 'details' ? 'Turn one of your spaces into a template other businesses can use. KUBICU reviews every template before it’s listed.' : 'Check what buyers get. Your details are removed — the layout, look and words you wrote stay.'}
      footer={
      step === 'details' ?
      <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
          trailingIcon={ArrowRightIcon}
          onClick={() => {
            setTried(true);
            if (Object.values(errors).some(Boolean)) return;
            setStep('check');
          }}>
          
              Check what’s shared
            </Button>
          </> :

      <>
            <Button variant="secondary" onClick={() => setStep('details')}>
              Back
            </Button>
            <Button leadingIcon={CheckIcon} disabled={!photosOk} onClick={submit}>
              {listing ? 'Send update for review' : 'Submit for review'}
            </Button>
          </>

      }>
      
      {step === 'details' ?
      <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-label font-medium text-fg">What you’re selling</legend>
            <Segmented<'page' | 'theme'>
            ariaLabel="What you’re selling"
            value={kind}
            onChange={setKind}
            options={[
            { value: 'page', label: 'Whole template' },
            { value: 'theme', label: 'Theme (look only)' }]
            } />
          
            <p className="text-caption text-fg-muted">
              {kind === 'theme' ?
            'Buyers get your colours, fonts, button shape and background. Their own blocks and words stay exactly as they are.' :
            'Buyers get your layout, blocks and look, with your details removed.'}
            </p>
          </fieldset>
          <SelectInput<string> id="sell-space" label="Space to share" value={spaceId} onChange={setSpaceId} options={spaces.map((s) => ({ value: s.id, label: s.kind === 'main' ? `${s.name} (main page)` : s.name }))} />
          {err('source') && <p className="-mt-2 text-caption font-medium text-danger">{err('source')}</p>}
          <TextInput id="sell-name" label="Template name" value={name} error={err('name')} placeholder="e.g. Bukka menu" onChange={(e) => setName(e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput<string> id="sell-cat" label="Category" value={category} onChange={setCategory} options={categories.map((c) => ({ value: c, label: c }))} />
            <SelectInput<string> id="sell-region" label="Region" value={region} onChange={setRegion} options={regions.map((r) => ({ value: r, label: r }))} />
          </div>
          <TextArea id="sell-desc" label="Description" rows={3} value={description} error={err('description')} placeholder="Who it’s for and what it does well" onChange={(e) => setDescription(e.target.value)} />
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-label font-medium text-fg">Price</legend>
            <Segmented<'free' | 'paid'>
            ariaLabel="Price"
            value={paid}
            onChange={setPaid}
            options={[
            { value: 'paid', label: 'Paid' },
            { value: 'free', label: 'Free' }]
            } />
          
            {paid === 'paid' &&
          <CurrencyInput id="sell-price" label="Price per workspace" value={price} error={err('price')} hint={price ? `You earn ${formatNgn(creatorShare(price))} a sale (70%). KUBICU keeps 30%. Example split.` : undefined} onChange={setPrice} />
          }
          </fieldset>
          <SelectInput<TemplateLicence> id="sell-licence" label="Licence" value={licence} onChange={setLicence} options={(Object.keys(licenceLabels) as TemplateLicence[]).map((k) => ({ value: k, label: licenceLabels[k] }))} hint="Buyers can never resell the template itself." />
          {listing?.status === 'listed' && <p className="rounded-md bg-sunken px-3 py-2 text-caption text-fg-muted">v{listing.listedVersion} stays on sale while the update is reviewed. People who already bought it keep their version.</p>}
        </div> :

      <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <figure className="flex flex-col items-center gap-2">
              <div className="overflow-hidden rounded-[16px] border border-line">{source && <TemplateThumb doc={source} width={200} height={340} />}</div>
              <figcaption className="text-caption text-fg-muted">Your space</figcaption>
            </figure>
            <figure className="flex flex-col items-center gap-2">
              <div className="overflow-hidden rounded-[16px] border-2 border-action">{clean && <TemplateThumb doc={clean} width={200} height={340} />}</div>
              <figcaption className="text-caption font-medium text-fg">What buyers get</figcaption>
            </figure>
          </div>
          {kind === 'theme' &&
        <p className="rounded-md bg-sunken px-3 py-2 text-caption text-fg-muted">
              This is a theme: buyers apply only the look. The preview above shows it on your sample layout so buyers can judge it.
            </p>
        }
          <ul className="flex flex-col gap-1.5 text-label text-fg-muted">
            {['Your name, tagline, profile photo and location', 'Prices, dates and countdowns', 'Phone, WhatsApp, email, address and every link', 'Customer quotes', 'Links to your products, services, plans and discounts'].map((t) =>
          <li key={t} className="flex items-start gap-2">
                <CheckIcon size={15} className="mt-0.5 shrink-0 text-success" aria-hidden /> Removed: {t.toLowerCase()}
              </li>
          )}
          </ul>
          <label className="flex items-start gap-3 rounded-md border border-line p-3 text-label text-fg">
            <input type="checkbox" className="mt-0.5 h-4 w-4" checked={photosOk} onChange={(e) => setPhotosOk(e.target.checked)} />
            <span>
              The photos that stay are mine to share, and anyone shown in them has agreed.
              <span className="block text-caption text-fg-muted">Remove any photo you’re unsure about from the space first. KUBICU checks again during review.</span>
            </span>
          </label>
        </div>
      }
    </Dialog>);

}