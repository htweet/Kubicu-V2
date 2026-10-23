import React, { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLinkIcon, FastForwardIcon, GavelIcon, PaperclipIcon, ShieldCheckIcon, TruckIcon } from 'lucide-react';
import type { EscrowCase } from '../../types/escrow';
import { useMoney } from '../../hooks/useMoney';
import { caseSummary, escalate, fastForward, issueLabels, markDelivered, markOrderDelivered, sellerRespond, stageLabels, stageTones } from '../../utils/money/escrow';
import { formatNgn, formatTimestamp } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { TextInput } from '../ui/TextInput';
import { ProofPicker } from './ProofPicker';
import { EscrowTimeline } from './EscrowTimeline';
import { cn } from '../../utils/cn';

type ReplyKind = 'full_refund' | 'partial' | 'contest';

/** Seller side of an escrow case inside the order sheet (D94). */
export function EscrowPanel({ workspaceId, orderId, handle }: {workspaceId: string;orderId: string;handle: string;}) {
  const { data, update } = useMoney(workspaceId);
  const c = data.escrow.find((x) => x.orderId === orderId);
  if (!c) return null;
  return <CaseView c={c} workspaceId={workspaceId} handle={handle} update={update} />;
}

function CaseView({ c, workspaceId, handle, update }: {c: EscrowCase;workspaceId: string;handle: string;update: ReturnType<typeof useMoney>['update'];}) {
  const [note, setNote] = useState('');
  const [proof, setProof] = useState<string[]>([]);
  const [reply, setReply] = useState<ReplyKind>('contest');
  const [partial, setPartial] = useState('');
  const [text, setText] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [tried, setTried] = useState(false);
  const [escNote, setEscNote] = useState('');
  const d = c.dispute;

  const deliver = () => {
    if (c.stage !== 'held') return;
    update((m) => markDelivered(m, c.id, { note, proof }));
    markOrderDelivered(workspaceId, c.orderId);
    toast.success('Marked delivered', { description: `The buyer has ${c.inspectionDays} day${c.inspectionDays === 1 ? '' : 's'} to check it. Then the money is released to your wallet.` });
  };

  const partialNgn = Number(partial) || 0;
  const errors = {
    partial: reply === 'partial' && (partialNgn <= 0 || partialNgn >= c.grossNgn) ? `Enter an amount between ₦1 and ${formatNgn(c.grossNgn - 1)}.` : undefined,
    text: reply !== 'full_refund' && text.trim().length < 20 ? 'Explain your side in at least 20 characters — the buyer and KUBICU will read it.' : undefined
  };

  const respond = () => {
    setTried(true);
    if (errors.partial || errors.text) return;
    update((m) => sellerRespond(workspaceId, m, c.id, { kind: reply, partialNgn: reply === 'partial' ? partialNgn : undefined, text: reply === 'full_refund' ? text || 'Refund agreed.' : text, evidence }));
    toast.success(reply === 'full_refund' ? 'Refunded in full' : 'Reply sent', { description: reply === 'full_refund' ? 'The case is closed and the buyer gets their money back.' : 'The buyer can accept, or either of you can ask KUBICU to decide.' });
  };

  return (
    <section aria-labelledby={`esc-${c.id}`} className="flex flex-col gap-4 rounded-lg border border-line p-4 md:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={`esc-${c.id}`} className="flex items-center gap-2 text-label font-semibold text-fg">
            <ShieldCheckIcon size={16} className="text-fg-subtle" aria-hidden /> {c.kind === 'goal' ? 'Group-goal escrow' : 'Escrow'}
          </h3>
          <p className="mt-0.5 text-caption text-fg-subtle">Held by our licensed payment partner · Test mode</p>
        </div>
        <Badge tone={stageTones[c.stage]}>{stageLabels[c.stage]}</Badge>
      </header>

      <dl className="grid grid-cols-2 gap-3 text-label">
        <div>
          <dt className="text-caption text-fg-subtle">Buyer paid</dt>
          <dd className="font-semibold tabular-nums text-fg">{formatNgn(c.grossNgn)}</dd>
        </div>
        <div>
          <dt className="text-caption text-fg-subtle">For you after fees</dt>
          <dd className="font-semibold tabular-nums text-fg">{formatNgn(c.netNgn)}</dd>
        </div>
      </dl>
      <p className="text-label text-fg-muted">{caseSummary(c)}</p>

      {c.stage === 'held' &&
      <div className="flex flex-col gap-3 border-t border-line pt-4">
          <TextArea id={`esc-note-${c.id}`} label="Delivery note" optional rows={2} placeholder="e.g. Delivered to the gate by GIG rider, signed by Ada" value={note} onChange={(e) => setNote(e.target.value)} />
          <ProofPicker label="Proof of delivery" hint="A photo of the parcel, a rider’s receipt or a signed note helps if the buyer reports a problem." value={proof} onChange={setProof} />
          <Button leadingIcon={TruckIcon} onClick={deliver} className="self-start">
            Mark delivered
          </Button>
        </div>
      }

      {c.stage === 'delivered' && c.proof.length > 0 && <FileList label="Your proof" files={c.proof.map((f) => f.name)} />}

      {d &&
      <div className="flex flex-col gap-3 border-t border-line pt-4">
          <div>
            <p className="text-label font-semibold text-fg">{issueLabels[d.issue]}</p>
            <p className="text-caption text-fg-subtle">
              Reported {formatTimestamp(d.openedAt)} · wants {d.wants === 'full' ? 'a full refund' : `${formatNgn(d.partialNgn ?? 0)} back`}
            </p>
            <blockquote className="mt-2 border-l-2 border-line-strong pl-3 text-label text-fg-muted">“{d.details}”</blockquote>
            {d.evidence.length > 0 && <FileList label="Buyer’s evidence" files={d.evidence.map((f) => f.name)} />}
          </div>

          {c.stage === 'disputed' && !d.response &&
        <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-label font-semibold text-fg">
                Your reply · due {formatTimestamp(d.respondBy)}
              </legend>
              {(
          [
          ['full_refund', 'Refund in full', `${formatNgn(c.grossNgn)} goes back to the buyer and the case closes.`],
          ['partial', 'Offer a partial refund', 'If the buyer accepts, the rest is released to you.'],
          ['contest', 'Disagree and explain', 'Share your side and proof. The buyer can then accept or ask KUBICU to decide.']] as
          const).
          map(([k, title, desc]) =>
          <label key={k} className={cn('flex cursor-pointer gap-3 rounded-md border px-3 py-2.5', reply === k ? 'border-action bg-action-soft' : 'border-line')}>
                  <input type="radio" name={`reply-${c.id}`} className="mt-1" checked={reply === k} onChange={() => setReply(k)} />
                  <span>
                    <span className="block text-label font-medium text-fg">{title}</span>
                    <span className="block text-caption text-fg-subtle">{desc}</span>
                  </span>
                </label>
          )}
              {reply === 'partial' && <TextInput id={`esc-partial-${c.id}`} label="Amount to refund (₦)" inputMode="numeric" value={partial} onChange={(e) => setPartial(e.target.value.replace(/\D/g, ''))} error={tried ? errors.partial : undefined} />}
              {reply !== 'full_refund' &&
          <>
                  <TextArea id={`esc-text-${c.id}`} label="Your side" rows={3} value={text} onChange={(e) => setText(e.target.value)} error={tried ? errors.text : undefined} />
                  <ProofPicker label="Your evidence" value={evidence} onChange={setEvidence} />
                </>
          }
              <Button onClick={respond} variant={reply === 'full_refund' ? 'destructive' : 'primary'} className="self-start">
                {reply === 'full_refund' ? `Refund ${formatNgn(c.grossNgn)}` : 'Send reply'}
              </Button>
            </fieldset>
        }

          {d.response &&
        <div className="rounded-md bg-sunken px-3 py-2.5">
              <p className="text-label font-semibold text-fg">
                You {d.response.kind === 'partial' ? `offered ${formatNgn(d.response.partialNgn ?? 0)} back` : d.response.kind === 'full_refund' ? 'refunded in full' : 'disagreed'} · {formatTimestamp(d.response.at)}
              </p>
              {d.response.kind !== 'full_refund' && <p className="mt-1 text-label text-fg-muted">“{d.response.text}”</p>}
            </div>
        }

          {c.stage === 'disputed' && d.response &&
        <div className="flex flex-col gap-2">
              <TextArea id={`esc-escalate-${c.id}`} label="Ask KUBICU to decide" optional rows={2} placeholder="Anything staff should know" value={escNote} onChange={(e) => setEscNote(e.target.value)} />
              <Button
            variant="secondary"
            leadingIcon={GavelIcon}
            className="self-start"
            onClick={() => {
              update((m) => escalate(m, c.id, 'seller', escNote));
              toast('Passed to KUBICU', { description: 'Staff review both sides. The money stays reserved until they decide.' });
            }}>
            
                Ask KUBICU to decide
              </Button>
            </div>
        }

          {d.decision &&
        <div className="rounded-md bg-sunken px-3 py-2.5">
              <p className="text-label font-semibold text-fg">KUBICU decided: {d.decision.outcome === 'release' ? 'released to you' : d.decision.outcome === 'refund' ? 'full refund to the buyer' : `${formatNgn(d.decision.partialNgn ?? 0)} back to the buyer`}</p>
              <p className="mt-1 text-label text-fg-muted">“{d.decision.note}”</p>
            </div>
        }
        </div>
      }

      <div className="border-t border-line pt-4">
        <EscrowTimeline events={c.events} id={`esc-tl-${c.id}`} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-dashed border-line pt-3">
        <a href={`/p/${handle}/protect/${c.orderId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-label font-semibold text-action hover:underline">
          <ExternalLinkIcon size={14} aria-hidden /> Buyer’s protection page
        </a>
        {(c.stage === 'delivered' || c.stage === 'disputed' && !d?.response) &&
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-label font-medium text-fg-subtle hover:text-fg"
          onClick={() => {
            update((m) => fastForward(m, c.id));
            toast('Prototype: time skipped', { description: c.stage === 'delivered' ? 'The inspection window has ended.' : 'The 48-hour reply window has passed.' });
          }}>
          
            <FastForwardIcon size={14} aria-hidden /> Prototype: {c.stage === 'delivered' ? 'end inspection window' : 'let 48 hours pass'}
          </button>
        }
      </div>
    </section>);

}

function FileList({ label, files }: {label: string;files: string[];}) {
  return (
    <div className="mt-2">
      <p className="text-caption font-semibold text-fg-subtle">{label}</p>
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {files.map((f, i) =>
        <li key={`${f}-${i}`} className="inline-flex items-center gap-1 rounded-md bg-sunken px-2 py-1 text-caption text-fg">
            <PaperclipIcon size={12} aria-hidden /> {f}
          </li>
        )}
      </ul>
    </div>);

}