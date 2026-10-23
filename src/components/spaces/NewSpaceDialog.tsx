import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeftIcon, CheckIcon, LockIcon } from 'lucide-react';
import type { SpaceKind } from '../../types/workspace';
import type { CampaignSettings, CampaignStarter, DealRoomSettings, DealRoomType, PageDocument } from '../../types/page';
import { CurrencyInput } from '../ui/CurrencyInput';
import { useCommerce } from '../../contexts/CommerceContext';
import { starterLabels } from '../../utils/campaign';
import { DateTimeInput } from '../ui/DateTimeInput';
import { fieldControlClass } from '../ui/Field';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { usePlan } from '../../contexts/PlanContext';
import { plans, planOrder } from '../../data/plans';
import { spaceKinds } from '../../data/spaceKinds';
import { activeExtraSpaces, extraSpaceLimits } from '../../utils/spaces';
import { starterSpaceDoc } from '../../utils/spaceStarters';
import { prepareStarter } from '../../utils/starterKit';
import { handleStatus, suggestHandles, takenHandles } from '../../utils/handles';
import { publicUrl } from '../../utils/format';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { InlineAlert } from '../ui/InlineAlert';
import { IllustrativeTag } from '../ui/IllustrativeTag';
import { UpgradeButton } from '../ui/UpgradeButton';
import { cn } from '../../utils/cn';

type NewKind = Exclude<SpaceKind, 'main'>;

interface NewSpaceDialogProps {
  open: boolean;
  onClose: () => void;
  /** The main page — new spaces start with its look. */
  mainDoc: PageDocument;
  initialKind?: NewKind | null;
  /** Start the new space from a marketplace template's layout and look (D67). */
  template?: {name: string;doc: PageDocument;} | null;
}

const statusText: Record<string, string> = {
  empty: 'Choose a link.',
  invalid: '3–30 characters: lowercase letters, numbers and hyphens.',
  reserved: 'KUBICU uses that address.',
  taken: 'Someone already uses that link.'
};

function hoursFromNow(h: number): string {
  const d = new Date(Date.now() + h * 3600000);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

function toLink(value: string): string {
  return value.
  toLowerCase().
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/&/g, 'and').
  replace(/[^a-z0-9]+/g, '-').
  replace(/^-+|-+$/g, '').
  slice(0, 30).
  replace(/-+$/g, '');
}

/** Pick a type, then a name and link. Opens the new space in the canvas (D50). */
export function NewSpaceDialog({ open, onClose, mainDoc, initialKind = null, template = null }: NewSpaceDialogProps) {
  const { current, workspaces, createSpace, switchSpace } = useWorkspace();
  const plan = usePlan();
  const navigate = useNavigate();
  const [kind, setKind] = useState<NewKind | null>(initialKind);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [handleTouched, setHandleTouched] = useState(false);
  const [tried, setTried] = useState(false);
  const { data: commerce } = useCommerce();
  const [starter, setStarter] = useState<CampaignStarter>('sale');
  const [startsAt, setStartsAt] = useState<string | null>(null);
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [discountId, setDiscountId] = useState('');
  const [roomType, setRoomType] = useState<DealRoomType>('goal');
  const [roomProduct, setRoomProduct] = useState('');
  const [roomPrice, setRoomPrice] = useState<number | null>(null);
  const [roomSize, setRoomSize] = useState('10');
  const [roomLimit, setRoomLimit] = useState('2');

  useEffect(() => {
    if (!open) return;
    setKind(initialKind);
    setName('');
    setHandle('');
    setHandleTouched(false);
    setTried(false);
    setStarter('sale');
    setStartsAt(hoursFromNow(24));
    setEndsAt(hoursFromNow(24 * 8));
    setProductIds([]);
    setDiscountId('');
    setRoomType('goal');
    setRoomProduct('');
    setRoomPrice(null);
    setRoomSize('10');
    setRoomLimit('2');
  }, [open, initialKind]);

  const codes = commerce.discounts.filter((d) => d.kind === 'code');
  const activeProducts = commerce.products.filter((p) => p.status === 'active' && p.kind !== 'ticket');
  const physicalProducts = activeProducts.filter((p) => p.kind === 'physical');
  const roomError = !roomProduct ?
  'Choose the product.' :
  !endsAt || Date.parse(endsAt) <= Date.now() ?
  'Set a deadline in the future.' :
  roomType === 'goal' && !(Number(roomSize) >= 2) ?
  'A group goal needs at least 2 buyers.' :
  roomType === 'drop' && !(Number(roomSize) >= 1) ?
  'How many are in the drop?' :
  '';
  const datesError = !endsAt ? 'Choose when it ends.' : startsAt && Date.parse(endsAt) <= Date.parse(startsAt) ? 'End after it starts.' : undefined;

  const used = activeExtraSpaces(current).length;
  const limit = extraSpaceLimits[plan.id];
  const locked = used >= limit;
  const nextPlan = planOrder.map((id) => plans[id]).find((p) => extraSpaceLimits[p.id] > limit);
  const taken = useMemo(() => open ? takenHandles(workspaces) : new Set<string>(), [open, workspaces]);
  const status = handleStatus(handle, taken);
  const suggestions = useMemo(() => status === 'taken' && name ? suggestHandles(`${mainDoc.handle}${name}`, taken) : [], [status, name, mainDoc.handle, taken]);

  const onName = (v: string) => {
    setName(v);
    if (!handleTouched) setHandle(v.trim() ? toLink(`${mainDoc.handle}-${v}`) : '');
  };

  const create = () => {
    setTried(true);
    if (!kind || locked || !name.trim() || status !== 'available') return;
    if (kind === 'campaign' && datesError) return;
    if (kind === 'dealroom' && roomError) return;
    const size = Math.floor(Number(roomSize));
    const dealRoom: DealRoomSettings | undefined =
    kind === 'dealroom' ?
    {
      type: roomType,
      productId: roomProduct,
      priceNgn: roomPrice,
      seats: roomType === 'drop' ? size : null,
      goal: roomType === 'goal' ? size : null,
      perPersonLimit: Math.max(1, Math.floor(Number(roomLimit)) || 1),
      opensAt: null,
      deadline: endsAt,
      endedAt: null,
      extensions: [],
      updates: []
    } :
    undefined;
    const campaign: CampaignSettings | undefined = kind === 'campaign' ? { starter, startsAt, endsAt, discountId: discountId || null, productIds } : undefined;
    const discountCode = codes.find((d) => d.id === discountId)?.code;
    try {
      const space = createSpace({
        kind,
        name,
        buildDoc: ({ pageId }) => {
          const built = starterSpaceDoc(kind, mainDoc, { id: pageId, name: name.trim(), handle, campaign, discountCode, dealRoom });
          if (!template) return built;
          const profile = mainDoc.blocks.find((b) => b.type === 'profile');
          const identity = profile?.type === 'profile' ? { name: profile.content.name, tagline: profile.content.tagline, avatarUrl: profile.content.avatarUrl, location: profile.content.location } : { name: mainDoc.title };
          const { doc } = prepareStarter(template.doc, identity);
          return { ...built, theme: doc.theme, blocks: doc.blocks };
        }
      });
      switchSpace(space.id);
      onClose();
      navigate('/app/canvas');
      toast(`${spaceKinds[kind].label} created`, { description: `A draft at ${publicUrl(handle)}. It shares your products, orders and contacts.` });
    } catch {
      toast.error('Couldn’t create the space', { description: 'Your browser storage is full or blocked. Free some space and try again.' });
    }
  };

  const step = kind ? 'details' : 'type';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={step === 'type' ? 'New space' : `New ${spaceKinds[kind!].label.toLowerCase()}`}
      description={step === 'type' ? 'Each space has its own link, look and publishing — and shares this workspace’s products, orders and contacts.' : spaceKinds[kind!].blurb}
      footer={
      step === 'type' ?
      <>
            <Button variant="tertiary" onClick={() => navigate('/start')}>
              New workspace instead
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </> :

      <>
            <Button variant="secondary" leadingIcon={ArrowLeftIcon} onClick={() => setKind(null)}>
              Back
            </Button>
            <Button onClick={create} disabled={locked}>
              Create and open
            </Button>
          </>

      }>
      
      {step === 'type' ?
      <div className="flex flex-col gap-4">
          <ul className="grid gap-3 sm:grid-cols-2">
            {(['campaign', 'dealroom'] as NewKind[]).map((k) => {
            const K = spaceKinds[k];
            return (
              <li key={k}>
                  <button
                  type="button"
                  onClick={() => setKind(k)}
                  disabled={locked}
                  className="flex h-full w-full flex-col items-start gap-2 rounded-lg border border-line bg-raised p-4 text-left transition-colors duration-150 hover:border-line-strong hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-raised">
                  
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-action-soft text-action">
                      <K.icon size={18} strokeWidth={2.25} aria-hidden />
                    </span>
                    <span className="text-label font-semibold text-fg">{K.label}</span>
                    <span className="text-caption text-fg-muted">{K.blurb}</span>
                    <span className="mt-auto pt-1 text-caption text-fg-subtle">{K.example}</span>
                  </button>
                </li>);

          })}
          </ul>
          <div className="flex items-center justify-between gap-3 text-caption text-fg-muted">
            <span>
              {limit === 0 ?
            `${plan.name} doesn’t include campaigns or DealRooms` :

            <>
                  <span className="font-semibold tabular-nums text-fg">{used}</span> of {limit} campaigns and DealRooms on {plan.name}
                </>
            }
            </span>
            <IllustrativeTag note="Example space limits per plan — not final pricing." />
          </div>
          {locked &&
        <InlineAlert
          tone="info"
          title={limit === 0 ? `${plan.name} includes your main page only` : 'You’ve used every space on your plan'}
          action={nextPlan ? <UpgradeButton plan={nextPlan.id} feature="Campaigns and DealRooms" variant="primary" /> : undefined}>
          
              <span className="inline-flex items-center gap-1.5">
                <LockIcon size={13} aria-hidden />
                {nextPlan ? `${nextPlan.name} includes ${extraSpaceLimits[nextPlan.id]}. ` : ''}
                {limit > 0 ? 'Archiving a campaign or DealRoom frees its slot. ' : ''}Nothing is ever deleted.
              </span>
            </InlineAlert>
        }
        </div> :

      <div className="flex flex-col gap-4">
          <TextInput
          id="space-name"
          label="Name"
          value={name}
          placeholder={kind === 'campaign' ? 'e.g. Eid sale' : 'e.g. Ankara group buy'}
          error={tried && !name.trim() ? 'Give it a name.' : undefined}
          onChange={(e) => onName(e.target.value)} />
        
          <div>
            <TextInput
            id="space-handle"
            label="Link"
            value={handle}
            error={(tried || handleTouched) && status !== 'available' ? statusText[status] : undefined}
            onChange={(e) => {
              setHandleTouched(true);
              setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30));
            }} />
          
            <p className={cn('mt-1.5 flex items-center gap-1.5 font-mono text-caption', status === 'available' ? 'text-success' : 'text-fg-subtle')}>
              {status === 'available' && <CheckIcon size={13} aria-hidden />}
              {publicUrl(handle || 'your-link')}
            </p>
            {suggestions.length > 0 &&
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-caption text-fg-muted">
                Try:
                {suggestions.map((s) =>
            <button key={s} type="button" onClick={() => setHandle(s)} className="rounded-full border border-line px-2.5 py-1 font-mono text-fg hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    {s}
                  </button>
            )}
              </div>
          }
          </div>
          {kind === 'campaign' &&
        <>
              <fieldset>
                <legend className="mb-2 text-label font-medium text-fg">Starter</legend>
                <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
                  {(Object.keys(starterLabels) as CampaignStarter[]).map((s) =>
              <label
                key={s}
                className={cn(
                  'flex cursor-pointer flex-col gap-0.5 rounded-md border p-3 transition-colors duration-150 focus-within:ring-2 focus-within:ring-focus',
                  starter === s ? 'border-select bg-action-soft' : 'border-line hover:bg-sunken'
                )}>
                
                      <input type="radio" name="campaign-starter" className="sr-only" checked={starter === s} onChange={() => setStarter(s)} />
                      <span className="text-label font-semibold text-fg">{starterLabels[s].label}</span>
                      <span className="text-caption text-fg-muted">{starterLabels[s].blurb}</span>
                    </label>
              )}
                </div>
              </fieldset>
              <div className="grid gap-3 sm:grid-cols-2">
                <DateTimeInput id="camp-new-start" label="Starts" optional clearable value={startsAt} onChange={setStartsAt} hint="Empty = when published" />
                <DateTimeInput id="camp-new-end" label="Ends" clearable value={endsAt} onChange={setEndsAt} error={tried ? datesError : undefined} />
              </div>
              {activeProducts.length > 0 &&
          <fieldset>
                  <legend className="mb-1.5 text-label font-medium text-fg">
                    Featured products <span className="font-normal text-fg-subtle">· optional</span>
                  </legend>
                  <ul className="scroll-quiet flex max-h-36 flex-col overflow-y-auto rounded-md border border-line">
                    {activeProducts.map((p) =>
              <li key={p.id} className="border-b border-line last:border-0">
                        <label className="flex min-h-[40px] cursor-pointer items-center gap-2.5 px-3 py-1.5 text-label text-fg hover:bg-sunken">
                          <input type="checkbox" className="h-4 w-4" checked={productIds.includes(p.id)} onChange={() => setProductIds((ids) => ids.includes(p.id) ? ids.filter((x) => x !== p.id) : [...ids, p.id])} />
                          <span className="truncate">{p.name}</span>
                        </label>
                      </li>
              )}
                  </ul>
                </fieldset>
          }
              {codes.length > 0 &&
          <div className="flex flex-col gap-1.5">
                  <label htmlFor="camp-new-discount" className="text-label font-medium text-fg">
                    Discount code <span className="font-normal text-fg-subtle">· optional</span>
                  </label>
                  <select id="camp-new-discount" value={discountId} onChange={(e) => setDiscountId(e.target.value)} className={cn(fieldControlClass, 'h-10')}>
                    <option value="">No discount</option>
                    {codes.map((d) =>
              <option key={d.id} value={d.id}>
                        {d.code} — {d.title}
                      </option>
              )}
                  </select>
                </div>
          }
            </>
        }
          {kind === 'dealroom' &&
        <>
              <fieldset>
                <legend className="mb-2 text-label font-medium text-fg">Type</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(
              [
              ['goal', 'Group goal', 'Buyers pay now. If not enough join by the deadline, everyone is refunded automatically.'],
              ['drop', 'Limited drop', 'A set number at a special price until the deadline or until they’re gone.']] as
              [DealRoomType, string, string][]).
              map(([value, label, blurb]) =>
              <label key={value} className={cn('flex cursor-pointer flex-col gap-0.5 rounded-md border p-3 transition-colors duration-150 focus-within:ring-2 focus-within:ring-focus', roomType === value ? 'border-select bg-action-soft' : 'border-line hover:bg-sunken')}>
                      <input type="radio" name="room-type" className="sr-only" checked={roomType === value} onChange={() => setRoomType(value)} />
                      <span className="text-label font-semibold text-fg">{label}</span>
                      <span className="text-caption text-fg-muted">{blurb}</span>
                    </label>
              )}
                </div>
              </fieldset>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="room-new-product" className="text-label font-medium text-fg">
                  Product
                </label>
                <select id="room-new-product" value={roomProduct} onChange={(e) => setRoomProduct(e.target.value)} className={cn(fieldControlClass, 'h-10')}>
                  <option value="">Choose a product</option>
                  {physicalProducts.map((p) =>
              <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
              )}
                </select>
                {physicalProducts.length === 0 && <p className="text-caption text-fg-subtle">Add an active product in Commerce first.</p>}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <CurrencyInput id="room-new-price" label="Room price" optional value={roomPrice} onChange={setRoomPrice} hint="Empty = normal price" />
                <TextInput id="room-new-size" label={roomType === 'goal' ? 'Buyers needed' : 'Units in the drop'} type="number" min={1} value={roomSize} onChange={(e) => setRoomSize(e.target.value)} />
                <TextInput id="room-new-limit" label="Per person" type="number" min={1} value={roomLimit} onChange={(e) => setRoomLimit(e.target.value)} />
              </div>
              <DateTimeInput id="room-new-deadline" label="Deadline" clearable value={endsAt} onChange={setEndsAt} />
              {tried && roomError && <p className="text-caption font-medium text-danger">{roomError}</p>}
              {roomType === 'goal' &&
          <p className="text-caption text-fg-muted">
                  If the goal is missed, buyers get 100% back automatically. KUBICU waives its fee on those orders; your payment provider usually keeps its processing fee (about 1.5% + ₦100 per order — illustrative), so a missed goal has a small cost to you.
                </p>
          }
            </>
        }
          <p className="rounded-md bg-sunken px-3.5 py-3 text-caption text-fg-muted">
            {kind === 'campaign' ?
          'Starts as a draft with your main page’s look and a Before, Live and Ended version you can edit in the canvas. Visitors see the right one automatically.' :
          'Starts as a draft with the room offer, live progress and plain terms at the top, and a short “How it works”. Counts only ever come from real orders. DealRooms take payment at checkout (Pro).'}
          </p>
        </div>
      }
    </Dialog>);

}