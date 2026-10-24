import React from 'react';
import { CheckCircle2Icon, Clock3Icon, MessageCircleIcon, Undo2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { AgreementSide } from '../../types/partnership';
import { useEditor } from '../../contexts/EditorContext';
import { useCoBrand } from '../../hooks/useCoBrand';
import { approvalScope, approve, canEditBlock, modeLabels, ownerLabel, ownerOf, revertBlock } from '../../utils/coBrand';
import { allBlocks } from '../../utils/sitePages';
import { blockName } from '../../utils/blocks';
import { formatRelative, whatsappLink } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Segmented } from '../ui/Segmented';
import { InlineAlert } from '../ui/InlineAlert';
import { PartnerAvatar } from '../partners/PartnerAvatar';
import { SplitExplainer } from '../partners/SplitExplainer';
import { PartnerComments } from '../partners/PartnerComments';
import { cn } from '../../utils/cn';

const kindText = { added: 'Added', removed: 'Removed', changed: 'Changed' } as const;

/** The partner panel for a co-branded space: who's acting, sign-off, changes since live, split and comments (D121). */
export function CoBrandSheet({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { state, actions } = useEditor();
  const co = useCoBrand();
  const { cb, partnership: p, actor, setActor, live, hasLive, needsApproval, changes, leadName, savePartnership } = co;
  if (!cb) return null;

  const selected = state.selectedId ? allBlocks(state.site).find((b) => b.id === state.selectedId) : undefined;
  const scope = approvalScope(cb, hasLive);
  const relevant = scope === 'all' ? changes : changes.filter((c) => c.owner !== 'lead');
  const approvedAt = cb.partnerApproval?.at;
  const remindText = `Hi ${p?.contactName.split(' ')[0] ?? ''}, I’ve updated our shared page “${state.site.title}”. Please take a look and approve it on KUBICU so we can publish.`;

  const doApprove = () => {
    actions.transformDocument((d) => approve(d));
    toast.success(`Approved for ${cb.partnerName}`, { description: `${leadName} can now publish this version.` });
  };
  const undo = (id: string, label: string) => {
    if (!live) return;
    actions.transformDocument((d) => revertBlock(d, live, id));
    toast(`“${label}” is back to the live version`);
  };

  return (
    <Sheet open={open} onClose={onClose} side="right" size="lg" bodyClassName="px-5 py-6 md:px-6" title="Partner panel" description={`${leadName} × ${cb.partnerName} · ${modeLabels[cb.mode].label}`} footer={<div className="flex justify-end"><Button variant="secondary" onClick={onClose}>Close</Button></div>}>
      <div className="flex flex-col gap-8">
        <section aria-label="Acting as" className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 -space-x-2.5">
              <PartnerAvatar partner={{ name: leadName, verified: true }} />
              <span className="rounded-full ring-[3px] ring-overlay">
                <PartnerAvatar partner={p?.partner ?? { name: cb.partnerName, verified: false }} />
              </span>
            </div>
            <p className="min-w-0 flex-1 text-caption text-fg-muted">
              {leadName} set this up and publishes it. {cb.partnerName} {cb.mode === 'sections' ? 'edits their own and shared blocks' : 'can edit anything'} and approves before it goes live.
            </p>
          </div>
          <Segmented<AgreementSide>
            ariaLabel="Acting as"
            value={actor}
            onChange={setActor}
            options={[
            { value: 'lead', label: leadName },
            { value: 'partner', label: cb.partnerName }]
            } />
          
          <p className="text-caption text-fg-subtle">Prototype: switch to act as {cb.partnerName}. In the real product they edit and approve from their own KUBICU or partner page.</p>
        </section>

        {/* Sign-off */}
        <section aria-labelledby="cb-approval" className="flex flex-col gap-4 border-t border-line pt-6">
          <h3 id="cb-approval" className="text-label font-semibold text-fg">
            {hasLive ? 'Approval for changes' : 'Approval for first publish'}
          </h3>
          {!needsApproval ?
          <InlineAlert tone="success" title={approvedAt ? `${cb.partnerName} approved this version` : `Nothing for ${cb.partnerName} to approve`}>
              {approvedAt ? `${formatRelative(approvedAt)}. Any change to ${scope === 'all' ? 'the page' : 'shared blocks, their blocks, the look or the link'} needs their approval again.` : 'Only changes to your own blocks since it went live — you can publish these yourself.'}
            </InlineAlert> :
          actor === 'partner' ?
          <div className="flex flex-col gap-3 rounded-lg border border-line bg-raised p-4">
              <p className="text-label text-fg">{hasLive ? `${leadName} wants to publish ${relevant.length || 'some'} change${relevant.length === 1 ? '' : 's'} that affect you.` : `${leadName} is ready to put this page live with both your names on it.`}</p>
              <p className="text-caption text-fg-muted">Preview the page first. Approving lets {leadName} publish exactly this version; any later change needs you again.</p>
              <Button className="self-start" leadingIcon={CheckCircle2Icon} onClick={doApprove}>
                Approve this version
              </Button>
            </div> :

          <div className="flex flex-col gap-3 rounded-lg border border-warning/40 bg-warning-soft/40 p-4">
              <p className="flex items-center gap-2 text-label font-semibold text-fg">
                <Clock3Icon size={15} className="text-warning" aria-hidden /> Waiting for {cb.partnerName}
              </p>
              <p className="text-caption text-fg-muted">{hasLive ? scope === 'all' ? 'With open editing, every change needs both of you.' : 'These changes touch shared blocks, their blocks, the look or the link.' : 'Both businesses approve before a shared page first goes live.'} Publish stays off until they approve.</p>
              {p?.phone &&
            <a href={whatsappLink(p.phone.replace(/\D/g, '').replace(/^0/, '234'), remindText)} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 self-start rounded-sm border border-line-strong bg-raised px-3 text-label font-medium text-fg transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <MessageCircleIcon size={14} aria-hidden /> Remind on WhatsApp
                </a>
            }
            </div>
          }
        </section>

        {/* Changes since live */}
        <section aria-labelledby="cb-changes" className="flex flex-col gap-3 border-t border-line pt-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 id="cb-changes" className="text-label font-semibold text-fg">
              Changes since it went live
            </h3>
            <span className="text-caption text-fg-subtle">{hasLive ? `${changes.length} change${changes.length === 1 ? '' : 's'}` : 'Not live yet'}</span>
          </div>
          {!hasLive ?
          <p className="text-caption text-fg-muted">Once the page is live, every change is listed here so both of you can see it — and undo it.</p> :
          changes.length === 0 ?
          <p className="text-caption text-fg-muted">The draft matches the live page.</p> :

          <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
              {changes.map((c) => {
              const block = allBlocks(state.site).find((b) => b.id === c.id) ?? allBlocks(live!).find((b) => b.id === c.id);
              const mayUndo = !!block && canEditBlock(cb, block, actor);
              return (
                <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-label font-medium text-fg">{c.label}</span>
                        <OwnerChip owner={c.owner} label={ownerLabel(c.owner, actor, cb)} />
                      </span>
                      <span className="text-caption text-fg-muted">
                        {kindText[c.kind]}
                        {scope === 'partner' && c.owner === 'lead' ? ` · ${leadName} can publish this alone` : ''}
                      </span>
                    </span>
                    <Button size="sm" variant="tertiary" leadingIcon={Undo2Icon} disabled={!mayUndo} title={mayUndo ? undefined : `Only ${ownerLabel(c.owner, actor === 'lead' ? 'partner' : 'lead', cb)} can undo this in own-sections mode`} onClick={() => undo(c.id, c.label)}>
                      Undo
                    </Button>
                  </li>);

            })}
            </ul>
          }
        </section>

        {p &&
        <section aria-label="Money" className="border-t border-line pt-6">
            <SplitExplainer leadName={leadName} partnerName={cb.partnerName} leadSharePct={p.agreement.leadSharePct} viewer={actor} compact />
            <p className="mt-2 text-caption text-fg-subtle">From your partnership agreement (version {p.agreement.version}). Change it in Collaborations → Business partners; both of you accept.</p>
          </section>
        }

        {p &&
        <div className="border-t border-line pt-6">
            <PartnerComments partnership={p} leadName={leadName} side={actor} onChange={savePartnership} spaceId={state.site.id} block={selected ? { id: selected.id, label: blockName(selected) } : null} />
          </div>
        }
      </div>
    </Sheet>);

}

export function OwnerChip({ owner, label, className }: {owner: ReturnType<typeof ownerOf>;label: string;className?: string;}) {
  return (
    <Badge tone={owner === 'shared' ? 'info' : owner === 'lead' ? 'neutral' : 'warning'} className={cn('shrink-0', className)}>
      {label}
    </Badge>);

}