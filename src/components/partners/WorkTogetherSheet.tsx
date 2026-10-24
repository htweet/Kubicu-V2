import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, CheckIcon, CopyIcon, MessageCircleIcon, SearchIcon, StoreIcon, UserRoundPlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Agreement, Partnership } from '../../types/partnership';
import type { Partner } from '../../utils/collabs';
import { searchDirectory, partnerDirectory } from '../../data/partnerDirectory';
import { defaultAgreement, invite, inviteUrl, INVITE_DAYS, trustLabels } from '../../utils/partnerships';
import { isNigerianMobile } from '../../utils/members';
import { whatsappLink } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { Segmented } from '../ui/Segmented';
import { Badge } from '../ui/Badge';
import { PartnerAvatar } from './PartnerAvatar';
import { AgreementFields } from './AgreementFields';
import { AgreementSummary } from './AgreementSummary';
import { cn } from '../../utils/cn';

interface WorkTogetherSheetProps {
  open: boolean;
  onClose: () => void;
  leadName: string;
  /** Handles already connected or invited, so they aren't offered twice. */
  takenHandles: string[];
  referralPartners: Partner[];
  onCreate: (p: Partnership) => void;
}

type Step = 'who' | 'terms' | 'sent';

/** Start a partnership with another KUBICU business or a guest by invite link (D120). */
export function WorkTogetherSheet({ open, onClose, leadName, takenHandles, referralPartners, onCreate }: WorkTogetherSheetProps) {
  const [step, setStep] = useState<Step>('who');
  const [kind, setKind] = useState<Partnership['kind']>('connected');
  const [query, setQuery] = useState('');
  const [handle, setHandle] = useState<string | null>(null);
  const [fromReferral, setFromReferral] = useState<string | undefined>();
  const [guest, setGuest] = useState({ contactName: '', business: '', phone: '' });
  const [touched, setTouched] = useState(false);
  const [agreement, setAgreement] = useState<Agreement>(defaultAgreement);
  const [sent, setSent] = useState<Partnership | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep('who');
    setKind('connected');
    setQuery('');
    setHandle(null);
    setFromReferral(undefined);
    setGuest({ contactName: '', business: '', phone: '' });
    setTouched(false);
    setAgreement(defaultAgreement());
    setSent(null);
  }, [open]);

  const results = searchDirectory(query, takenHandles);
  const picked = partnerDirectory.find((b) => b.handle === handle);
  // Referral partners whose handle matches a KUBICU business can be upgraded in one tap.
  const upgradable = referralPartners.
  map((r) => ({ r, biz: partnerDirectory.find((b) => `@${b.handle}` === r.handle.toLowerCase() || b.name.toLowerCase() === r.name.toLowerCase()) })).
  filter((x): x is {r: Partner;biz: (typeof partnerDirectory)[number];} => !!x.biz && !takenHandles.includes(x.biz.handle));

  const guestErrors = {
    contactName: guest.contactName.trim().length < 2 ? 'Enter their name' : '',
    phone: !isNigerianMobile(guest.phone) ? 'Enter a Nigerian mobile number, e.g. 0803 555 0142' : ''
  };
  const partnerName = kind === 'connected' ? picked?.name ?? '' : guest.business.trim() || guest.contactName.trim();
  const canNext = kind === 'connected' ? !!picked : !guestErrors.contactName && !guestErrors.phone;

  const next = () => {
    setTouched(true);
    if (canNext) setStep('terms');
  };

  const send = () => {
    const p =
    kind === 'connected' && picked ?
    invite({ kind, partner: { ...picked }, contactName: picked.name, phone: '', agreement, referralPartnerId: fromReferral }) :
    invite({ kind: 'guest', partner: { name: partnerName, verified: false }, contactName: guest.contactName.trim(), phone: guest.phone.trim(), agreement });
    onCreate(p);
    setSent(p);
    setStep('sent');
  };

  const url = sent ? inviteUrl(sent.token) : '';
  const message = sent ? `Hi ${sent.contactName.split(' ')[0]}, ${leadName} would like to work with you on KUBICU — selling together and splitting the money automatically. See the plan and accept here: ${url} (link works for ${INVITE_DAYS} days)` : '';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Invite link copied');
    } catch {
      toast.error('Couldn’t copy — select the link and copy it instead');
    }
  };

  const footer =
  step === 'who' ?
  <div className="flex justify-end gap-2">
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={next} disabled={kind === 'connected' && !picked}>
          Next: agree the terms
        </Button>
      </div> :
  step === 'terms' ?
  <div className="flex justify-between gap-2">
        <Button variant="tertiary" leadingIcon={ArrowLeftIcon} onClick={() => setStep('who')}>
          Back
        </Button>
        <Button onClick={send}>{kind === 'guest' ? 'Accept and create invite' : `Accept and invite ${picked?.name ?? ''}`}</Button>
      </div> :

  <div className="flex justify-end">
        <Button onClick={onClose}>Done</Button>
      </div>;


  return (
    <Sheet open={open} onClose={onClose} side="right" size="lg" bodyClassName="px-5 py-6 md:px-6" title={step === 'sent' ? 'Invite ready' : 'Work together'} description={step === 'who' ? 'Run a page and sell bundles with another business. Each of you is paid your own part.' : step === 'terms' ? 'Agree the basics in plain words. They can accept, or ask for changes.' : undefined} footer={footer}>
      {step === 'who' &&
      <div className="flex flex-col gap-6">
          <Segmented<Partnership['kind']>
          ariaLabel="Who are you working with?"
          value={kind}
          onChange={setKind}
          options={[
          { value: 'connected', label: 'A KUBICU business', icon: StoreIcon },
          { value: 'guest', label: 'Someone by invite link', icon: UserRoundPlusIcon }]
          } />
        

          {kind === 'connected' ?
        <div className="flex flex-col gap-4">
              <p className="text-caption text-fg-muted">They edit in their own canvas, see results and are paid into their own wallet.</p>
              <TextInput id="wt-search" label="Find a business" placeholder="Handle, name or what they do" value={query} onChange={(e) => setQuery(e.target.value)} leadingIcon={SearchIcon} />
              {upgradable.length > 0 && !query &&
          <div className="flex flex-col gap-2">
                  <p className="text-caption font-semibold text-fg-subtle">Your referral partners on KUBICU</p>
                  {upgradable.map(({ r, biz }) =>
            <BusinessRow key={biz.handle} biz={biz} note={`Referral partner · ${r.ratePct}%`} selected={handle === biz.handle} onSelect={() => {setHandle(biz.handle);setFromReferral(r.id);}} />
            )}
                </div>
          }
              <div role="radiogroup" aria-label="KUBICU businesses" className="flex flex-col gap-2">
                {results.length === 0 ?
            <p className="rounded-md bg-sunken px-4 py-6 text-center text-label text-fg-muted">No business found. If they aren’t on KUBICU yet, invite them by link instead.</p> :

            results.map((b) => <BusinessRow key={b.handle} biz={b} selected={handle === b.handle} onSelect={() => {setHandle(b.handle);setFromReferral(undefined);}} />)
            }
              </div>
            </div> :

        <div className="flex flex-col gap-4">
              <p className="text-caption text-fg-muted">They don’t need a KUBICU page. They get a simple partner page to accept, check your shared page, see their sales and be paid to their bank.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput id="wt-name" label="Their name" value={guest.contactName} maxLength={60} onChange={(e) => setGuest((g) => ({ ...g, contactName: e.target.value }))} error={touched ? guestErrors.contactName || undefined : undefined} />
                <TextInput id="wt-phone" label="WhatsApp number" type="tel" placeholder="0803 555 0142" value={guest.phone} maxLength={20} onChange={(e) => setGuest((g) => ({ ...g, phone: e.target.value }))} error={touched ? guestErrors.phone || undefined : undefined} />
              </div>
              <TextInput id="wt-biz" label="Business name" optional placeholder="e.g. Bayo Small Chops" value={guest.business} maxLength={60} onChange={(e) => setGuest((g) => ({ ...g, business: e.target.value }))} hint="Shown to your customers next to yours. Their name is used if empty." />
            </div>
        }
        </div>
      }

      {step === 'terms' &&
      <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 rounded-lg bg-sunken px-4 py-3">
            <PartnerAvatar partner={{ name: partnerName, logo: picked?.logo, verified: !!picked?.verified }} />
            <div className="min-w-0">
              <p className="truncate text-label font-semibold text-fg">{partnerName}</p>
              <p className="truncate text-caption text-fg-muted">{kind === 'connected' ? `@${picked?.handle} · KUBICU business` : `Guest · ${guest.phone}`}</p>
            </div>
          </div>
          <AgreementFields value={agreement} onChange={setAgreement} leadName={leadName} partnerName={partnerName} />
          <div className="rounded-lg border border-line p-4">
            <AgreementSummary agreement={agreement} leadName={leadName} partnerName={partnerName} title="What both of you will accept" />
          </div>
          <p className="text-caption text-fg-subtle">By continuing you accept these terms for {leadName}. They take effect when {partnerName} accepts too.</p>
        </div>
      }

      {step === 'sent' && sent &&
      <div className="flex flex-col gap-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success" aria-hidden>
              <CheckIcon size={18} />
            </span>
            <div>
              <p className="text-label font-semibold text-fg">{sent.kind === 'connected' ? `${sent.partner.name} has been invited` : `Send ${sent.contactName.split(' ')[0]} this link`}</p>
              <p className="text-caption text-fg-muted">{sent.kind === 'connected' ? 'They’ll see it in their KUBICU notifications. You can also message them the link.' : `It works for ${INVITE_DAYS} days. You can send a new one any time.`}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="break-all rounded-md border border-line bg-sunken px-3 py-2.5 font-mono text-caption text-fg">{url}</p>
            <div className="flex flex-wrap gap-2">
              {sent.phone &&
            <a href={whatsappLink(sent.phone.replace(/^0/, '234'), message)} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-md bg-action px-4 text-label font-semibold text-action-fg transition-colors duration-150 hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <MessageCircleIcon size={16} aria-hidden /> Send on WhatsApp
                </a>
            }
              <Button variant="secondary" leadingIcon={CopyIcon} onClick={copy}>
                Copy link
              </Button>
            </div>
          </div>
          <p className="text-caption text-fg-subtle">Prototype: open the partnership and switch on “See as partner” to accept for them.</p>
        </div>
      }
    </Sheet>);

}

function BusinessRow({ biz, note, selected, onSelect }: {biz: (typeof partnerDirectory)[number];note?: string;selected: boolean;onSelect: () => void;}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn('flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', selected ? 'border-action bg-action-soft' : 'border-line bg-raised hover:border-line-strong')}>
      
      <PartnerAvatar partner={biz} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-label font-semibold text-fg">{biz.name}</span>
        <span className="block truncate text-caption text-fg-muted">
          @{biz.handle} · {biz.category} · {biz.city}
        </span>
        {note && <span className="block text-caption text-fg-subtle">{note}</span>}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        {biz.trustLevel && <Badge tone={biz.trustLevel === 'top' || biz.trustLevel === 'trusted' ? 'success' : 'neutral'}>{trustLabels[biz.trustLevel]}</Badge>}
        <span className="text-caption text-fg-subtle">{biz.verified ? 'Verified' : 'Not verified'}</span>
      </span>
    </button>);

}