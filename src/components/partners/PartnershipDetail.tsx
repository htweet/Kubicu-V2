import React, { useEffect, useState } from 'react';
import { ArrowLeftRightIcon, CopyIcon, ExternalLinkIcon, EyeIcon, MessageCircleIcon, PencilIcon, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Agreement, AgreementSide, Partnership } from '../../types/partnership';
import { partnerDirectory } from '../../data/partnerDirectory';
import { acceptInvite, answerChange, cancelEnding, declineInvite, deliveryLabels, endPartnership, guestReady, inviteUrl, isExpired, proposeChange, resendInvite, statusLabels, statusTones, supportLabels, trustLabels, upgradeGuest, withdrawChange } from '../../utils/partnerships';
import { formatDate, formatTimestamp, whatsappLink } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Switch } from '../ui/Switch';
import { InlineAlert } from '../ui/InlineAlert';
import { SelectInput } from '../ui/SelectInput';
import { TextInput } from '../ui/TextInput';
import { PartnerAvatar } from './PartnerAvatar';
import { AgreementFields } from './AgreementFields';
import { AgreementSummary } from './AgreementSummary';
import { SplitExplainer } from './SplitExplainer';
import { PartnerComments } from './PartnerComments';
import { PartnerSales } from './PartnerSales';
import { useCommerce } from '../../contexts/CommerceContext';

interface PartnershipDetailProps {
  partnership: Partnership | null;
  leadName: string;
  canEdit: boolean;
  onChange: (p: Partnership) => void;
  onClose: () => void;
}

const endReasons = ['We’ve finished what we planned', 'The split isn’t working for us', 'Customers had problems with their part', 'Something else'];

/** One business partnership: agreement, split, invite, changes, guest setup, comments and history (D120, D121). */
export function PartnershipDetail({ partnership: p, leadName, canEdit, onChange, onClose }: PartnershipDetailProps) {
  const [asPartner, setAsPartner] = useState(false);
  const [editing, setEditing] = useState<Agreement | null>(null);
  const [ending, setEnding] = useState(false);
  const [reason, setReason] = useState(endReasons[0]);
  const [other, setOther] = useState('');
  const [safety, setSafety] = useState(false);
  const [upgradeTo, setUpgradeTo] = useState('');
  const commerce = useCommerce();

  useEffect(() => {
    setAsPartner(false);
    setEditing(null);
    setEnding(false);
    setSafety(false);
    setOther('');
    setReason(endReasons[0]);
  }, [p?.id]);

  if (!p) return <Sheet open={false} onClose={onClose} side="right" title="">{null}</Sheet>;

  const side: AgreementSide = asPartner ? 'partner' : 'lead';
  const me = side === 'lead' ? leadName : p.partner.name;
  const them = side === 'lead' ? p.partner.name : leadName;
  const expired = isExpired(p);
  const live = p.status === 'active' || p.status === 'ending';
  const act = canEdit || asPartner;
  const url = inviteUrl(p.token);
  const msg = `Hi ${p.contactName.split(' ')[0]}, here’s the link to work with ${leadName} on KUBICU: ${url}`;
  const a = p.agreement;

  const commit = (next: Partnership, toastText: string, description?: string) => {
    onChange(next);
    toast.success(toastText, { description });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Invite link copied');
    } catch {
      toast.error('Couldn’t copy the link');
    }
  };

  const confirmEnd = () => {
    const why = reason === 'Something else' ? other.trim() || 'No reason given' : reason;
    commit(endPartnership(p, side, why, safety), safety || p.status === 'invited' ? 'Partnership ended' : `Notice given — ends in ${a.noticeDays} days`, safety ? 'Shared pages come off the internet now. Money already paid still settles.' : undefined);
    setEnding(false);
  };

  const unused = partnerDirectory.filter((b) => b.name !== p.partner.name);

  return (
    <Sheet
      open={!!p}
      onClose={onClose}
      side="right"
      size="lg"
      bodyClassName="px-5 py-6 md:px-6"
      title={`${leadName} × ${p.partner.name}`}
      description={p.kind === 'connected' ? `KUBICU business · @${p.partner.handle}` : `Guest partner · ${p.contactName}`}
      footer={
      <div className="flex flex-wrap items-center justify-between gap-2">
          {live || p.status === 'invited' ?
        <Button variant="tertiary" className="text-danger" disabled={!act || ending} onClick={() => setEnding(true)}>
              {p.status === 'invited' ? 'Cancel invite' : 'End partnership'}
            </Button> :

        <span />
        }
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }>
      
      <div className="flex flex-col gap-8">
        {/* Who + status */}
        <section aria-label="Partner" className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="flex shrink-0 -space-x-3">
              <PartnerAvatar partner={{ name: leadName, verified: true }} size="lg" />
              <span className="rounded-full ring-4 ring-overlay">
                <PartnerAvatar partner={p.partner} size="lg" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone={expired ? 'warning' : statusTones[p.status]} dot>
                  {expired ? 'Invite expired' : statusLabels[p.status]}
                </Badge>
                {p.partner.trustLevel && <Badge tone="neutral">{trustLabels[p.partner.trustLevel]}</Badge>}
                {p.sample && <Badge tone="neutral">Sample</Badge>}
              </div>
              <p className="mt-1.5 text-caption text-fg-muted">
                {p.partner.verified ? 'Verified by KUBICU' : 'Not verified yet'}
                {p.acceptedAt ? ` · Together since ${formatDate(p.acceptedAt)}` : ` · Invited ${formatDate(p.invitedAt)}`}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 overflow-hidden rounded-lg border border-line bg-raised sm:grid-cols-4">
            <Fact label="Split" value={`${a.leadSharePct}% · ${100 - a.leadSharePct}%`} />
            <Fact label="Delivers" value={a.delivery === 'each' ? 'Each their own' : a.delivery === 'lead' ? leadName : p.partner.name} title={deliveryLabels[a.delivery]} />
            <Fact label="Customers" value={a.support === 'each' ? 'Each their own' : a.support === 'lead' ? leadName : p.partner.name} title={supportLabels[a.support]} />
            <Fact label="Notice" value={`${a.noticeDays} days`} />
          </dl>
          <dl className="-mt-1 grid gap-1.5 text-caption">
            <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2">
              <dt className="text-fg-subtle">Delivery</dt>
              <dd className="text-fg-muted">{deliveryLabels[a.delivery]}</dd>
            </div>
            <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2">
              <dt className="text-fg-subtle">Customers</dt>
              <dd className="text-fg-muted">{supportLabels[a.support]}</dd>
            </div>
          </dl>

          <div className="flex items-start gap-3 rounded-lg border border-dashed border-line-strong px-4 py-3">
            <ArrowLeftRightIcon size={16} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />
            <Switch id="pns-as-partner" checked={asPartner} onChange={setAsPartner} label="See as partner" description={`Prototype: act for ${p.partner.name}, exactly as they would${p.kind === 'guest' ? ' on their partner page' : ' in their own KUBICU'}.`} />
          </div>
        </section>

        {/* Invite state */}
        {p.status === 'invited' && (
        asPartner ?
        expired ?
        <InlineAlert tone="warning" title="This invite link has expired">Ask {leadName} to send a new one.</InlineAlert> :

        <InlineAlert
          tone="info"
          title={`${leadName} wants to work with you`}
          action={
          <div className="flex gap-2">
                    <Button size="sm" onClick={() => commit(acceptInvite(p), 'Invite accepted', p.kind === 'guest' ? 'Next: verify your phone and add your bank on the partner page.' : 'You can now build a co-branded space or bundle together.')}>
                      Accept
                    </Button>
                    <Button size="sm" variant="tertiary" onClick={() => commit(declineInvite(p), 'Invite declined')}>
                      Decline
                    </Button>
                  </div>
          }>
          
                Read the agreement and how the money is split below. Accepting means you agree to both.
              </InlineAlert> :


        <Section title="Invite">
              <p className="text-label text-fg-muted">{expired ? `The invite link expired on ${formatDate(p.expiresAt)}.` : `Waiting for ${p.partner.name} to accept. The link works until ${formatDate(p.expiresAt)}.`}</p>
              {!expired && <p className="break-all rounded-md border border-line bg-sunken px-3 py-2.5 font-mono text-caption text-fg">{url}</p>}
              <div className="flex flex-wrap gap-2">
                {expired ?
            <Button size="sm" leadingIcon={RefreshCwIcon} disabled={!canEdit} onClick={() => commit(resendInvite(p), 'New invite link ready', 'The old link no longer works.')}>
                    Send a new link
                  </Button> :

            <>
                    {p.phone &&
              <a href={whatsappLink(p.phone.replace(/^0/, '234'), msg)} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-action px-3 text-label font-semibold text-action-fg transition-colors duration-150 hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                        <MessageCircleIcon size={14} aria-hidden /> WhatsApp
                      </a>
              }
                    <Button size="sm" variant="secondary" leadingIcon={CopyIcon} onClick={copy}>
                      Copy link
                    </Button>
                    <Button size="sm" variant="tertiary" leadingIcon={RefreshCwIcon} disabled={!canEdit} onClick={() => commit(resendInvite(p), 'New invite link ready', 'The old link no longer works.')}>
                      New link
                    </Button>
                  </>
            }
              </div>
            </Section>)
        }

        {p.status === 'ending' && p.endsAt &&
        <InlineAlert
          tone="warning"
          title={`Ending on ${formatDate(p.endsAt)}`}
          action={
          act ?
          <Button size="sm" variant="secondary" onClick={() => commit(cancelEnding(p, side), 'Notice cancelled')}>
                  Keep working together
                </Button> :
          undefined
          }>
          
            {p.endReason}. Shared pages come off the internet then; money already paid still settles.
          </InlineAlert>
        }
        {p.status === 'ended' && <InlineAlert tone="info" title={`Ended ${p.endsAt ? formatDate(p.endsAt) : ''}`}>{p.endReason ?? 'This partnership has ended.'} Each of you keeps a copy of your own sections as a draft.</InlineAlert>}
        {p.status === 'declined' && <InlineAlert tone="info" title={`${p.partner.name} declined`}>You can invite them again with different terms.</InlineAlert>}

        {ending &&
        <section aria-label={p.status === 'invited' ? 'Cancel invite' : 'End partnership'} className="flex flex-col gap-4 rounded-lg border border-danger/30 bg-danger-soft/40 p-4">
            <p className="text-label font-semibold text-fg">{p.status === 'invited' ? 'Cancel this invite?' : `End working with ${them}?`}</p>
            {p.status !== 'invited' &&
          <>
                <SelectInput<string> id="pns-end-reason" label="Why?" value={reason} onChange={setReason} options={endReasons.map((r) => ({ value: r, label: r }))} />
                {reason === 'Something else' && <TextInput id="pns-end-other" label="Tell them why" value={other} maxLength={140} onChange={(e) => setOther(e.target.value)} />}
                <label className="flex items-start gap-2 text-label text-fg">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[rgb(var(--danger))]" checked={safety} onChange={(e) => setSafety(e.target.checked)} />
                  <span>
                    End straight away — there’s a safety problem
                    <span className="block text-caption text-fg-muted">Otherwise it ends after {a.noticeDays} days’ notice, as agreed.</span>
                  </span>
                </label>
              </>
          }
            <div className="flex flex-wrap gap-2">
              <Button variant="destructive" onClick={confirmEnd}>
                {p.status === 'invited' ? 'Cancel invite' : safety ? 'End now' : `Give ${a.noticeDays} days’ notice`}
              </Button>
              <Button variant="tertiary" onClick={() => setEnding(false)}>
                Keep it
              </Button>
            </div>
          </section>
        }

        {/* Proposed change */}
        {p.pending &&
        <section aria-label="Proposed new terms" className="flex flex-col gap-4 rounded-lg border border-warning/40 bg-warning-soft/40 p-4">
            <p className="text-label font-semibold text-fg">{p.pending.by === side ? `Waiting for ${them} to accept your new terms` : `${them} proposed new terms`}</p>
            {p.pending.agreement.leadSharePct !== a.leadSharePct &&
          <p className="rounded-md bg-raised px-3 py-2 text-caption text-fg">
                Split changes from <span className="font-semibold tabular-nums">{a.leadSharePct}% · {100 - a.leadSharePct}%</span> to <span className="font-semibold tabular-nums">{p.pending.agreement.leadSharePct}% · {100 - p.pending.agreement.leadSharePct}%</span>. It only applies to sales after both accept.
              </p>
          }
            <AgreementSummary agreement={p.pending.agreement} leadName={leadName} partnerName={p.partner.name} title="Proposed" />
            <p className="text-caption text-fg-muted">Version {a.version} still applies until both accept.</p>
            <div className="flex flex-wrap gap-2">
              {p.pending.by === side ?
            <Button size="sm" variant="secondary" disabled={!act} onClick={() => commit(withdrawChange(p, side), 'Proposal withdrawn')}>
                  Withdraw
                </Button> :

            <>
                  <Button size="sm" disabled={!act} onClick={() => commit(answerChange(p, side, true), 'New terms accepted', `Version ${p.pending!.agreement.version} now applies.`)}>
                    Accept new terms
                  </Button>
                  <Button size="sm" variant="tertiary" disabled={!act} onClick={() => commit(answerChange(p, side, false), 'Proposal turned down')}>
                    Turn down
                  </Button>
                </>
            }
            </div>
          </section>
        }

        {/* Money + agreement */}
        <Section title="Money and agreement" border>
          {editing ?
          <div className="flex flex-col gap-5 rounded-lg border border-line bg-raised p-4">
              <p className="text-label font-semibold text-fg">Propose new terms</p>
              <AgreementFields value={editing} onChange={setEditing} leadName={leadName} partnerName={p.partner.name} />
              <div className="flex flex-wrap gap-2">
                <Button
                onClick={() => {
                  commit(proposeChange(p, editing, side), 'New terms sent', `${them} needs to accept before they apply.`);
                  setEditing(null);
                }}>
                
                  Send to {them}
                </Button>
                <Button variant="tertiary" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </div> :

          <>
              <SplitExplainer leadName={leadName} partnerName={p.partner.name} leadSharePct={a.leadSharePct} viewer={side} compact />
              <div className="rounded-lg border border-line bg-raised p-4">
                <AgreementSummary agreement={a} leadName={leadName} partnerName={p.partner.name} />
              </div>
              {live && !p.pending &&
            <Button size="sm" variant="secondary" leadingIcon={PencilIcon} disabled={!act} className="self-start" onClick={() => setEditing({ ...a })}>
                  Propose changes
                </Button>
            }
            </>
          }
        </Section>

        {(live || p.status === 'ended') &&
        <Section title="Selling together" border>
            <PartnerSales partnershipId={p.id} orders={commerce.data.orders} products={commerce.data.products} leadName={leadName} partnerName={p.partner.name} viewer={side} />
          </Section>
        }

        {/* Guest setup */}
        {p.kind === 'guest' &&
        <Section title="Their partner page" border>
            <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-6 gap-y-2.5 text-label">
              <dt className="text-fg-muted">Phone</dt>
              <dd className="text-fg">{p.guest?.phoneVerifiedAt ? `${p.phone} · confirmed` : `${p.phone} · not confirmed yet`}</dd>
              <dt className="text-fg-muted">Bank for payouts</dt>
              <dd className="text-fg">{p.guest?.bank ? `${p.guest.bank.bankName} ····${p.guest.bank.last4} · ${p.guest.bank.accountName}` : 'Not added yet'}</dd>
            </dl>
            {live && !guestReady(p) && <p className="text-caption text-warning">They can’t be paid until they confirm their phone and add a bank account in their own name.</p>}
            <a href={`/partner/${p.token}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 self-start text-label font-medium text-action underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              <EyeIcon size={14} aria-hidden /> Open their partner page <ExternalLinkIcon size={12} aria-hidden />
            </a>
            {live && asPartner &&
          <div className="flex flex-col gap-3 rounded-lg bg-sunken p-4">
                <p className="text-caption text-fg-muted">Prototype: if they make their own KUBICU page, they become a connected partner and keep all history.</p>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[200px] flex-1">
                    <SelectInput<string> id="pns-upgrade" label="Their new KUBICU page" value={upgradeTo} onChange={setUpgradeTo} options={[{ value: '', label: 'Choose…' }, ...unused.map((b) => ({ value: b.handle, label: `${b.name} (@${b.handle})` }))]} />
                  </div>
                  <Button size="sm" variant="secondary" disabled={!upgradeTo} onClick={() => commit(upgradeGuest(p, upgradeTo), 'Now a connected partner')}>
                    Connect
                  </Button>
                </div>
              </div>
          }
          </Section>
        }

        {live &&
        <div className="border-t border-line pt-6">
            <PartnerComments partnership={p} leadName={leadName} side={side} onChange={onChange} disabled={!act} />
          </div>
        }

        {/* History */}
        <Section title="History" border>
          <ol className="flex flex-col gap-3">
            {p.events.map((e) =>
            <li key={e.id} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 text-caption">
                <span className="tabular-nums text-fg-subtle">{formatTimestamp(e.at)}</span>
                <span className="text-fg-muted">
                  <span className="font-medium text-fg">{e.by === 'system' ? 'KUBICU' : e.by === 'lead' ? leadName : p.partner.name}</span> · {e.text}
                </span>
              </li>
            )}
          </ol>
        </Section>
        <p className="text-caption text-fg-subtle">You’re seeing this as {me}. The agreement wording needs legal review; notice and invite periods are example figures (D120).</p>
      </div>
    </Sheet>);

}

function Section({ title, border, children }: {title: string;border?: boolean;children: React.ReactNode;}) {
  return (
    <section className={border ? 'flex flex-col gap-4 border-t border-line pt-6' : 'flex flex-col gap-3'}>
      <h3 className="text-label font-semibold text-fg">{title}</h3>
      {children}
    </section>);

}

function Fact({ label, value, title }: {label: string;value: string;title?: string;}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 border-line px-3.5 py-3 [&:not(:last-child)]:border-r max-sm:[&:nth-child(2)]:border-r-0 max-sm:[&:nth-child(-n+2)]:border-b" title={title}>
      <dt className="text-meta text-fg-subtle">{label}</dt>
      <dd className="truncate text-label font-semibold tabular-nums text-fg">{value}</dd>
    </div>);

}