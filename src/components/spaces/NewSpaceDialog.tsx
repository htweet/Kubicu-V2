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
import { extraSpaceKindOrder, spaceKinds } from '../../data/spaceKinds';
import type { CommerceEvent } from '../../types/commerce';
import { blankEvent, blankTicketType, eventDisplay, eventDisplayLabel, eventPhase, eventsOf, findEvent, upsertEvent } from '../../utils/commerce/tickets';
import { eventSpaceLinks } from '../../utils/eventSpace';
import { formatEventDate } from '../../utils/eventTime';
import { useCheckoutAllowed } from '../canvas/inspector/CatalogFields';
import { Segmented } from '../ui/Segmented';
import { SelectInput } from '../ui/SelectInput';
import { Switch } from '../ui/Switch';
import { TextArea } from '../ui/TextArea';
import type { FundraiserSettings, PopupSession, PopupSettings } from '../../types/page';
import { Field } from '../ui/Field';
import { PopupSessionsEditor, defaultSession } from '../popup/PopupSessionsEditor';
import { sessionEnd } from '../../utils/popup';
import type { BookingPageSettings } from '../../types/page';
import { useOptionalOps } from '../../contexts/OpsContext';
import { extensionActive, readMarketplace } from '../../utils/marketplace';
import { MAX_BOOKING_SERVICES, validWhatsapp } from '../../utils/bookingPage';
import { durationLabel } from '../../utils/ops/slots';
import type { MembersAreaSettings } from '../../types/page';
import { membershipPlans as commerceMembershipPlans } from '../../utils/membersArea';
import { formatNgn } from '../../utils/format';
import { withSymbol } from '../../utils/currency';
import { CHECKOUT_PLAN } from '../../utils/commerce/linkIssues';
import { useMoney } from '../../hooks/useMoney';
import { blankLink, isVerified, uniqueSlug } from '../../utils/money/store';
import { syncFundraiserLink } from '../../utils/fundraiser';
import { updateAdminStore } from '../../utils/admin/store';
import { uid } from '../../utils/id';
import { phonePlaceholder } from '../../utils/phone';
import { activeExtraSpaces, extraSpaceLimits } from '../../utils/spaces';
import { starterSpaceDoc } from '../../utils/spaceStarters';
import { prepareStarter } from '../../utils/starterKit';
import { handleStatus, suggestHandles, takenHandles } from '../../utils/handles';
import { publicUrl } from '../../utils/format';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { InlineAlert } from '../ui/InlineAlert';
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
  // Event spaces (D178): link a Commerce event, or create one here (it's saved in Commerce → Events).
  const { apply: applyCommerce } = useCommerce();
  const { allowed: checkoutAllowed, needed: checkoutPlan } = useCheckoutAllowed();
  const [evMode, setEvMode] = useState<'existing' | 'new'>('existing');
  const [evId, setEvId] = useState('');
  const [evOnline, setEvOnline] = useState(false);
  const [evVenue, setEvVenue] = useState('');
  const [evAddress, setEvAddress] = useState('');
  const [evCapacity, setEvCapacity] = useState('');
  const [ttPrice, setTtPrice] = useState<number | null>(null);
  const [ttQty, setTtQty] = useState('100');
  const [onSaleNow, setOnSaleNow] = useState(true);
  // Fundraisers (D179): verified workspaces only; money goes through one open payment link.
  const money = useMoney(current.id);
  const verified = isVerified(money.data);
  const [fGoal, setFGoal] = useState<number | null>(null);
  const [fEnds, setFEnds] = useState<string | null>(null);
  const [fOrganiser, setFOrganiser] = useState('');
  const [fPurpose, setFPurpose] = useState('');
  const [fBeneficiary, setFBeneficiary] = useState('');
  const [fAmounts, setFAmounts] = useState('2000, 5000, 10000, 20000');
  const [fMin, setFMin] = useState<number | null>(500);
  const [fAskMessage, setFAskMessage] = useState(true);
  // Pop-up shops (D183): a place, 1–5 sessions, products and how buyers pay.
  const [pVenue, setPVenue] = useState('');
  const [pAddress, setPAddress] = useState('');
  const [pSessions, setPSessions] = useState<PopupSession[]>(() => [defaultSession()]);
  const [pProducts, setPProducts] = useState<string[]>([]);
  const [pLimits, setPLimits] = useState<Record<string, string>>({});
  const [pPayment, setPPayment] = useState<PopupSettings['payment']>('both');
  // Booking pages (D184): services from the Bookings app and an optional WhatsApp fallback.
  const opsData = useOptionalOps()?.data ?? null;
  const bookingsOn = useMemo(() => open ? extensionActive(readMarketplace(current.id), 'bookings') : false, [open, current.id]);
  const bookableServices = (opsData?.services ?? []).filter((s) => s.active);
  const [bServices, setBServices] = useState<string[]>([]);
  const [bWhatsapp, setBWhatsapp] = useState('');
  // Members areas (D185): which membership plans get in, and the welcome for everyone else.
  const memberPlans = commerceMembershipPlans(commerce).filter((p) => p.status === 'active');
  const [mPlans, setMPlans] = useState<string[]>([]);
  const [mTitle, setMTitle] = useState('');
  const [mTeaser, setMTeaser] = useState('');

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
    setEvId('');
    setEvOnline(false);
    setEvVenue('');
    setEvAddress('');
    setEvCapacity('');
    setTtPrice(null);
    setTtQty('100');
    setOnSaleNow(true);
    setFGoal(null);
    setFEnds(null);
    setFOrganiser(current.name);
    setFPurpose('');
    setFBeneficiary('');
    setFAmounts('2000, 5000, 10000, 20000');
    setFMin(500);
    setFAskMessage(true);
    setPVenue('');
    setPAddress('');
    setPSessions([defaultSession()]);
    setPProducts([]);
    setPLimits({});
    setPPayment('both');
    setBServices([]);
    setBWhatsapp('');
    // Every live membership plan gets in by default; untick any that shouldn't.
    setMPlans(commerceMembershipPlans(commerce).filter((p) => p.status === 'active').map((p) => p.id));
    setMTitle('');
    setMTeaser('');
    if (initialKind === 'event') eventDefaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialKind]);

  /** Events default to two weeks out, 6–9pm, rather than the campaign window. */
  function eventDefaults() {
    const start = new Date(Date.now() + 14 * 86400_000);
    start.setHours(18, 0, 0, 0);
    setStartsAt(start.toISOString());
    setEndsAt(new Date(start.getTime() + 3 * 3600_000).toISOString());
  }

  const pickKind = (k: NewKind) => {
    if (k === 'event') eventDefaults();else
    if (kind === 'event') {
      setStartsAt(hoursFromNow(24));
      setEndsAt(hoursFromNow(24 * 8));
    }
    setKind(k);
  };

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

  // One event, one page: events already linked to an Event space (or past/cancelled) aren't offered.
  const linked = useMemo(() => open ? new Set(eventSpaceLinks(current).map((l) => l.eventId)) : new Set<string>(), [open, current]);
  const linkableEvents = eventsOf(commerce).filter((e) => e.status !== 'cancelled' && eventPhase(e) !== 'past' && !linked.has(e.id));
  const evMissingStart = !startsAt || Date.parse(startsAt) <= Date.now();
  const eventError =
  evMode === 'existing' ?
  !evId ?
  linkableEvents.length ? 'Choose the event.' : 'No upcoming events without a page yet — create one instead.' :
  '' :
  evMissingStart ?
  'Set a start time in the future.' :
  endsAt && startsAt && Date.parse(endsAt) <= Date.parse(startsAt) ?
  'End after it starts.' :
  !evOnline && !evVenue.trim() ?
  'Add the venue, or mark it as online.' :
  !(Number(ttQty) >= 1) ?
  'How many tickets are available?' :
  (ttPrice ?? 0) > 0 && !checkoutAllowed ?
  `Paid tickets need ${checkoutPlan}. Leave the price empty for free registration.` :
  '';

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

  const fundAmounts = fAmounts.
  split(/[,\s]+/).
  map((s) => Math.floor(Number(s.replace(/[^\d]/g, '')))).
  filter((n) => n > 0).
  slice(0, 4);
  const fundError = !verified ?
  'Fundraisers need a verified workspace.' :
  !fPurpose.trim() ?
  'Say what the money is for.' :
  !(fGoal && fGoal > 0) ?
  'Set a goal amount.' :
  !fOrganiser.trim() ?
  'Add the organiser’s name.' :
  fEnds && Date.parse(fEnds) <= Date.now() ?
  'Set an end date in the future, or leave it empty.' :
  fundAmounts.some((a) => a < (fMin ?? 0)) ?
  'Suggested amounts can’t be below the minimum.' :
  '';

  const popupError = !pVenue.trim() ?
  'Add where the pop-up is.' :
  pSessions.some((s) => !s.date || !s.from || !s.to) ?
  'Every session needs a date, a start and an end time.' :
  pSessions.every((s) => sessionEnd(s) <= Date.now()) ?
  'At least one session must be in the future.' :
  !pProducts.length ?
  'Choose at least one product for the stall.' :
  '';

  const bookingError = !bookingsOn ?
  'Install the Bookings app in Extensions first.' :
  !bServices.length ?
  'Choose at least one service.' :
  bWhatsapp.trim() && !validWhatsapp(bWhatsapp) ?
  'The WhatsApp number looks too short.' :
  '';

  const membersError = !checkoutAllowed ?
  `Members areas need ${checkoutPlan}, because members join through subscriptions.` :
  !memberPlans.length ?
  'Create a membership plan in Commerce → Subscriptions first.' :
  !mPlans.length ?
  'Choose at least one plan that gets in.' :
  '';

  const create = () => {
    setTried(true);
    if (kind === 'members' && membersError) return;
    if (kind === 'fundraiser' && fundError) return;
    if (kind === 'popup' && popupError) return;
    if (kind === 'booking' && bookingError) return;
    if (!kind || locked || !name.trim() || status !== 'available') return;
    if (kind === 'campaign' && datesError) return;
    if (kind === 'dealroom' && roomError) return;
    if (kind === 'event' && eventError) return;
    let event: CommerceEvent | undefined;
    if (kind === 'event') {
      if (evMode === 'existing') event = findEvent(commerce, evId);else
      {
        const blank = blankEvent();
        const tt = { ...blankTicketType('General admission'), priceNgn: ttPrice ?? 0, quantity: Math.floor(Number(ttQty)) };
        const cap = Math.floor(Number(evCapacity));
        event = {
          ...blank,
          name: name.trim(),
          startsAt: startsAt!,
          endsAt,
          online: evOnline,
          venue: evOnline ? '' : evVenue.trim(),
          address: evOnline ? '' : evAddress.trim(),
          capacity: cap > 0 ? cap : null,
          status: onSaleNow ? 'on_sale' : 'draft',
          ticketTypes: [tt]
        };
        const saved = event;
        if (!applyCommerce((d) => upsertEvent(d, saved))) {
          toast.error('Couldn’t save the event', { description: 'Your browser storage is full or blocked.' });
          return;
        }
      }
      if (!event) return;
    }
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
    let fundraiser: FundraiserSettings | undefined;
    if (kind === 'fundraiser') {
      const linkId = uid('pl');
      fundraiser = {
        linkId,
        goalNgn: fGoal ?? 0,
        endsAt: fEnds,
        closedAt: null,
        organiser: fOrganiser.trim(),
        purpose: fPurpose.trim(),
        beneficiary: fBeneficiary.trim(),
        amounts: fundAmounts,
        minNgn: Math.max(100, fMin ?? 100),
        askMessage: fAskMessage,
        updates: [],
        extensions: []
      };
      const settings = fundraiser;
      money.update((d) => {
        const link = syncFundraiserLink({ ...blankLink(), id: linkId, slug: uniqueSlug(d, name.trim() || 'fundraiser') }, settings, name.trim(), handle, true);
        return { ...d, links: [link, ...d.links] };
      });
      updateAdminStore((s) => ({ ...s, fundraisers: [{ handle, workspaceId: current.id, workspaceName: current.name, name: name.trim(), goalNgn: settings.goalNgn, createdAt: new Date().toISOString() }, ...(s.fundraisers ?? [])] }));
    }
    const popup: PopupSettings | undefined =
    kind === 'popup' ?
    {
      venue: pVenue.trim(),
      address: pAddress.trim(),
      sessions: pSessions,
      productIds: pProducts,
      stallLimits: Object.fromEntries(
        Object.entries(pLimits).
        filter(([id, v]) => pProducts.includes(id) && Number(v) >= 0 && v.trim() !== '').
        map(([id, v]) => [id, Math.floor(Number(v))])
      ),
      payment: pPayment,
      closedAt: null
    } :
    undefined;
    const membersArea: MembersAreaSettings | undefined =
    kind === 'members' ?
    { rule: { access: 'plans', planIds: mPlans }, title: mTitle.trim() || `${name.trim()} is for members`, teaser: mTeaser.trim(), joinLabel: 'Become a member' } :
    undefined;
    const bookingPage: BookingPageSettings | undefined = kind === 'booking' ? { serviceIds: bServices, intro: 'Book an appointment', whatsapp: bWhatsapp.trim(), waitlistBlockId: null } : undefined;
    try {
      const space = createSpace({
        kind,
        name,
        buildDoc: ({ pageId }) => {
          const built = starterSpaceDoc(kind, mainDoc, { id: pageId, name: name.trim(), handle, campaign, discountCode, dealRoom, event, fundraiser, popup, bookingPage, membersArea });
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
            <Button onClick={create} disabled={locked || kind === 'fundraiser' && !verified}>
              Create and open
            </Button>
          </>

      }>
      
      {step === 'type' ?
      <div className="flex flex-col gap-4">
          <ul className="grid gap-3 sm:grid-cols-3">
            {extraSpaceKindOrder.map((k) => {
            const K = spaceKinds[k];
            return (
              <li key={k}>
                  <button
                  type="button"
                  onClick={() => pickKind(k)}
                  disabled={locked}
                  className="flex h-full w-full flex-col items-start gap-2 rounded-lg border border-line bg-raised p-4 text-left transition-colors duration-150 hover:border-line-strong hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-raised">
                  
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-action-soft text-action">
                      <K.icon size={18} strokeWidth={2.25} aria-hidden />
                    </span>
                    <span className="text-label font-semibold text-fg">{K.label}</span>
                    <span className="text-caption text-fg-muted">{K.blurb}</span>
                    {K.useWhen && <span className="text-caption font-medium text-fg">{K.useWhen}</span>}
                    {k === 'fundraiser' && !verified &&
                  <span className="inline-flex items-center gap-1 text-caption font-medium text-warning">
                        <LockIcon size={12} aria-hidden /> Verify your workspace first
                      </span>
                  }
                    <span className="mt-auto pt-1 text-caption text-fg-subtle">{K.example}</span>
                  </button>
                </li>);

          })}
          </ul>
          <div className="flex items-center justify-between gap-3 text-caption text-fg-muted">
            <span>
              {limit === 0 ?
            `${plan.name} doesn’t include extra spaces` :

            <>
                  <span className="font-semibold tabular-nums text-fg">{used}</span> of {limit} extra spaces on {plan.name}
                </>
            }
            </span>

          </div>
          {locked &&
        <InlineAlert
          tone="info"
          title={limit === 0 ? `${plan.name} includes your main page only` : 'You’ve used every space on your plan'}
          action={nextPlan ? <UpgradeButton plan={nextPlan.id} feature="Extra spaces" variant="primary" /> : undefined}>
          
              <span className="inline-flex items-center gap-1.5">
                <LockIcon size={13} aria-hidden />
                {nextPlan ? `${nextPlan.name} includes ${extraSpaceLimits[nextPlan.id]}. ` : ''}
                {limit > 0 ? 'Archiving a space frees its slot. ' : ''}Nothing is ever deleted.
              </span>
            </InlineAlert>
        }
        </div> :

      <div className="flex flex-col gap-4">
          <TextInput
          id="space-name"
          label="Name"
          value={name}
          placeholder={kind === 'page' ? 'e.g. My portfolio' : kind === 'campaign' ? 'e.g. Eid sale' : kind === 'event' ? 'e.g. Lagos design meetup' : kind === 'popup' ? 'e.g. Christmas market stall' : kind === 'booking' ? 'e.g. Book a braids appointment' : kind === 'members' ? 'e.g. Sewing school members' : kind === 'fundraiser' ? 'e.g. Apprentice machines' : 'e.g. Ankara group buy'}
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
            <button key={s} type="button" onClick={() => setHandle(s)} className="inline-flex min-h-[40px] items-center rounded-full border border-line px-3 font-mono text-fg hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
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
          {kind === 'event' &&
        <>
              <Segmented<'existing' | 'new'>
            ariaLabel="Which event"
            fullWidth
            value={evMode}
            onChange={setEvMode}
            options={[
            { value: 'existing', label: 'An event in Commerce' },
            { value: 'new', label: 'Create a new event' }]
            } />
          
              {evMode === 'existing' ?
          linkableEvents.length ?
          <SelectInput
            id="ev-new-pick"
            label="Event"
            value={evId}
            onChange={setEvId}
            hint="Events that already have a page, are cancelled or have ended aren’t listed — one event, one page."
            options={[{ value: '', label: 'Choose…' }, ...linkableEvents.map((e) => ({ value: e.id, label: `${e.name || 'Untitled event'} · ${formatEventDate(e.startsAt, e.timeZone)} · ${eventDisplayLabel[eventDisplay(commerce, e)]}` }))]} /> :


          <p className="rounded-md border border-dashed border-line-strong px-3 py-3 text-caption text-fg-muted">
                    No upcoming events without a page. Switch to <span className="font-medium text-fg">Create a new event</span> — it’s saved in Commerce → Events.
                  </p> :


          <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DateTimeInput id="ev-new-start" label="Starts" value={startsAt} onChange={setStartsAt} />
                    <DateTimeInput id="ev-new-end" label="Ends" optional clearable value={endsAt} onChange={setEndsAt} />
                  </div>
                  <Switch id="ev-new-online" label="Online event" description="Guests get the join link on their ticket." checked={evOnline} onChange={setEvOnline} />
                  {!evOnline &&
            <div className="grid gap-3 sm:grid-cols-2">
                      <TextInput id="ev-new-venue" label="Venue" value={evVenue} placeholder="e.g. The Hall, Yaba" onChange={(e) => setEvVenue(e.target.value)} />
                      <TextInput id="ev-new-address" label="Address" optional value={evAddress} onChange={(e) => setEvAddress(e.target.value)} />
                    </div>
            }
                  <div className="grid gap-3 sm:grid-cols-3">
                    <CurrencyInput id="ev-new-price" label="Ticket price" optional value={ttPrice} onChange={setTtPrice} hint="Empty = free" />
                    <TextInput id="ev-new-qty" label="Tickets available" type="number" min={1} value={ttQty} onChange={(e) => setTtQty(e.target.value)} />
                    <TextInput id="ev-new-cap" label="Capacity" optional type="number" min={1} value={evCapacity} onChange={(e) => setEvCapacity(e.target.value)} hint="Overall limit" />
                  </div>
                  <Switch id="ev-new-sale" label="Put tickets on sale now" description="Off keeps it as a draft in Commerce → Events." checked={onSaleNow} onChange={setOnSaleNow} />
                  <p className="text-caption text-fg-subtle">One “General admission” ticket to start. Add VIP, early bird or seating later in Commerce → Events.</p>
                </>
          }
              {tried && eventError && <p className="text-caption font-medium text-danger">{eventError}</p>}
            </>
        }
          {kind === 'fundraiser' &&
        <>
              {!verified &&
          <InlineAlert
            tone="warning"
            title="Verify your workspace to start a fundraiser"
            action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                onClose();
                navigate('/app/commerce/verification');
              }}>
              
                      Go to verification
                    </Button>
            }>
            
                  Supporters need to know who they’re paying, so KUBICU checks the organiser’s identity first. You can fill this in now; creating it waits until you’re verified.
                </InlineAlert>
          }
              <TextArea
            id="fund-new-purpose"
            label="What the money is for"
            rows={2}
            value={fPurpose}
            placeholder="e.g. School fees and books for 20 pupils at Ìrẹ̀tí Primary"
            hint="Shown at the top of the page. Be specific — supporters give to clear goals."
            error={tried && !fPurpose.trim() ? 'Say what the money is for.' : undefined}
            onChange={(e) => setFPurpose(e.target.value)} />
          
              <div className="grid gap-3 sm:grid-cols-2">
                <CurrencyInput id="fund-new-goal" label="Goal" value={fGoal} onChange={setFGoal} hint="A target, not a condition — you keep what’s raised." />
                <DateTimeInput id="fund-new-end" label="Ends" optional clearable value={fEnds} onChange={setFEnds} hint="Empty = open until you close it" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput id="fund-new-org" label="Organiser" value={fOrganiser} onChange={(e) => setFOrganiser(e.target.value)} hint="The person or group supporters are paying." />
                <TextInput id="fund-new-ben" label="Who benefits" optional value={fBeneficiary} placeholder="e.g. Pupils of Ìrẹ̀tí Primary, Ibadan" onChange={(e) => setFBeneficiary(e.target.value)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <TextInput id="fund-new-amounts" label={withSymbol('Suggested amounts (₦)')} value={fAmounts} onChange={(e) => setFAmounts(e.target.value)} hint="Up to 4, separated by commas. Supporters can also enter their own." />
                <CurrencyInput id="fund-new-min" label="Minimum" value={fMin} onChange={setFMin} />
              </div>
              <Switch id="fund-new-msg" label="Let supporters leave a message" description="Messages come to you; they aren’t shown on the page." checked={fAskMessage} onChange={setFAskMessage} />
              {tried && fundError && verified && <p className="text-caption font-medium text-danger">{fundError}</p>}
            </>
        }
          {kind === 'popup' &&
        <>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput id="pop-new-venue" label="Venue" value={pVenue} placeholder="e.g. Ikoyi Christmas Market, stall 14" error={tried && !pVenue.trim() ? 'Add where the pop-up is.' : undefined} onChange={(e) => setPVenue(e.target.value)} />
                <TextInput id="pop-new-address" label="Address" optional value={pAddress} placeholder="e.g. 12 Bourdillon Rd, Ikoyi, Lagos" onChange={(e) => setPAddress(e.target.value)} />
              </div>
              <PopupSessionsEditor sessions={pSessions} onChange={setPSessions} idPrefix="pop-new" />
              <fieldset>
                <legend className="mb-1.5 text-label font-medium text-fg">Products at the stall</legend>
                {physicalProducts.length === 0 ?
            <p className="text-caption text-fg-subtle">Add an active physical product in Commerce first.</p> :

            <ul className="scroll-quiet flex max-h-48 flex-col overflow-y-auto rounded-md border border-line">
                    {physicalProducts.map((p) => {
                const on = pProducts.includes(p.id);
                return (
                  <li key={p.id} className="flex min-h-[44px] items-center gap-2.5 border-b border-line px-3 py-1.5 last:border-0">
                          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-label text-fg">
                            <input type="checkbox" className="h-4 w-4" checked={on} onChange={() => setPProducts((ids) => on ? ids.filter((x) => x !== p.id) : [...ids, p.id])} />
                            <span className="truncate">{p.name}</span>
                          </label>
                          {on &&
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      aria-label={`Most to sell at the stall: ${p.name}`}
                      placeholder="No limit"
                      value={pLimits[p.id] ?? ''}
                      onChange={(e) => setPLimits((l) => ({ ...l, [p.id]: e.target.value }))}
                      className={cn(fieldControlClass, 'h-9 w-24 px-2 text-caption')} />

                    }
                        </li>);

              })}
                  </ul>
            }
                <p className="mt-1.5 text-caption text-fg-subtle">Optional limit per product: the most this pop-up may sell. Empty = up to your normal stock.</p>
              </fieldset>
              <Field id="pop-new-pay" label="How buyers pay">
                <Segmented<PopupSettings['payment']>
              ariaLabel="How buyers pay"
              fullWidth
              value={pPayment}
              onChange={setPPayment}
              options={[
              { value: 'both', label: 'Their choice' },
              { value: 'online', label: 'Online now' },
              { value: 'stall', label: 'At the stall' }]
              } />
            
              </Field>
              {tried && popupError && <p className="text-caption font-medium text-danger">{popupError}</p>}
            </>
        }
          {kind === 'booking' &&
        <>
              {!bookingsOn &&
          <InlineAlert
            tone="warning"
            title="Booking pages use the Bookings app"
            action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                onClose();
                navigate('/app/extensions?ext=bookings');
              }}>
              
                      Go to Extensions
                    </Button>
            }>
            
                  Install it (free) to set up services, hours and rules. This page then shows them.
                </InlineAlert>
          }
              <fieldset>
                <legend className="mb-1.5 text-label font-medium text-fg">
                  Services to show <span className="font-normal tabular-nums text-fg-subtle">· up to {MAX_BOOKING_SERVICES}</span>
                </legend>
                {bookableServices.length === 0 ?
            <p className="rounded-md border border-dashed border-line-strong px-3 py-3 text-caption text-fg-muted">No services switched on in Bookings yet. Add one in Bookings → Services first.</p> :

            <ul className="scroll-quiet flex max-h-56 flex-col overflow-y-auto rounded-md border border-line">
                    {bookableServices.map((s) => {
                const on = bServices.includes(s.id);
                const full = !on && bServices.length >= MAX_BOOKING_SERVICES;
                return (
                  <li key={s.id} className="border-b border-line last:border-0">
                          <label className={cn('flex min-h-[44px] cursor-pointer items-center gap-2.5 px-3 py-1.5 text-label text-fg hover:bg-sunken', full && 'cursor-not-allowed opacity-60')}>
                            <input type="checkbox" className="h-4 w-4" checked={on} disabled={full} onChange={() => setBServices((ids) => on ? ids.filter((x) => x !== s.id) : [...ids, s.id])} />
                            <span className="min-w-0 flex-1 truncate">{s.name}</span>
                            <span className="shrink-0 text-caption text-fg-subtle">{durationLabel(s.durationMin)}</span>
                          </label>
                        </li>);

              })}
                  </ul>
            }
                <p className="mt-1.5 text-caption text-fg-subtle">Prices, deposits, hours and cancellation rules come from Bookings, so this page always matches.</p>
              </fieldset>
              <TextInput
            id="bp-new-whatsapp"
            label="WhatsApp number"
            optional
            inputMode="tel"
            value={bWhatsapp}
            placeholder={`e.g. ${phonePlaceholder()}`}
            hint="Offered when there are no free times, next to a waitlist sign-up."
            onChange={(e) => setBWhatsapp(e.target.value)} />
          
              {tried && bookingError && <p className="text-caption font-medium text-danger">{bookingError}</p>}
            </>
        }
          {kind === 'members' &&
        <>
              {!checkoutAllowed &&
          <InlineAlert tone="info" title={`Members areas are on ${checkoutPlan}`} action={<UpgradeButton plan={CHECKOUT_PLAN} feature="Members areas" variant="primary" />}>
                  Members join through subscriptions, which take payment at checkout.
                </InlineAlert>
          }
              <fieldset>
                <legend className="mb-1.5 text-label font-medium text-fg">Who gets in</legend>
                {memberPlans.length === 0 ?
            <p className="rounded-md border border-dashed border-line-strong px-3 py-3 text-caption text-fg-muted">No live membership plans yet. Create one in Commerce → Subscriptions first.</p> :

            <ul className="scroll-quiet flex max-h-48 flex-col overflow-y-auto rounded-md border border-line">
                    {memberPlans.map((p) => {
                const on = mPlans.includes(p.id);
                return (
                  <li key={p.id} className="border-b border-line last:border-0">
                          <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 px-3 py-1.5 text-label text-fg hover:bg-sunken">
                            <input type="checkbox" className="h-4 w-4" checked={on} onChange={() => setMPlans((ids) => on ? ids.filter((x) => x !== p.id) : [...ids, p.id])} />
                            <span className="min-w-0 flex-1 truncate">{p.name}</span>
                            <span className="shrink-0 text-caption text-fg-subtle">
                              {formatNgn(p.priceNgn)} a {p.interval}
                            </span>
                          </label>
                        </li>);

              })}
                  </ul>
            }
                <p className="mt-1.5 text-caption text-fg-subtle">Active and trial subscribers to these plans get in. Paused, ended and lapsed subscriptions don’t.</p>
              </fieldset>
              <TextInput id="ma-new-title" label="Welcome heading for non-members" optional value={mTitle} placeholder={name.trim() ? `${name.trim()} is for members` : 'e.g. The full course lives here'} onChange={(e) => setMTitle(e.target.value)} />
              <TextArea id="ma-new-teaser" label="What members get" optional rows={2} value={mTeaser} placeholder="e.g. Weekly pattern videos, printable guides and a monthly live Q&A." onChange={(e) => setMTeaser(e.target.value)} />
              {tried && membersError && <p className="text-caption font-medium text-danger">{membersError}</p>}
            </>
        }
          <p className="rounded-md bg-sunken px-3.5 py-3 text-caption text-fg-muted">
            {kind === 'members' ?
          'Starts as a draft with a members’ welcome and “This month” section to fill in. Non-members see only a welcome card with Join and Sign in; members sign in with a one-time code.' :
          kind === 'booking' ?
          'Starts as a draft that opens on your chosen services with each one’s next free time. “Choose a time” uses your normal booking sheet; with nothing free, visitors get the waitlist or WhatsApp instead of a dead end.' :
          kind === 'popup' ?
          'Starts as a draft with an Open/Closed panel (place and sessions) above a Before, Open and Closed version. Orders from it are pickup only at the stall; your main shop keeps delivering as usual.' :
          kind === 'fundraiser' ?
          'Starts as a draft with a progress panel (purpose, organiser, raised so far, giving and fixed terms) above an editable story. Every payment goes to your wallet as it arrives; counts only ever come from real payments.' :
          kind === 'campaign' ?
          'Starts as a draft with your main page’s look and a Before, Live and Ended version you can edit in the canvas. Visitors see the right one automatically.' :
          kind === 'event' ?
          'Starts as a draft with a Before, During and After version that switch at the event’s own start and end times. Tickets, seats, guest list and check-in stay in Commerce → Events.' :
          'Starts as a draft with the room offer, live progress and plain terms at the top, and a short “How it works”. Counts only ever come from real orders. DealRooms take payment at checkout (Pro).'}
          </p>
        </div>
      }
    </Dialog>);

}