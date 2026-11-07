import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileTextIcon, FlagIcon, PaperclipIcon, ScaleIcon } from 'lucide-react';
import type { SponsorApplication, SponsorBrief } from '../../types/sponsorship';
import { useT } from '../../contexts/LocaleContext';
import { addEvidence, canAppeal, openAppeal, SPONSOR_APPEAL_DAYS, canDispute, disputeOpen, disputeReasons, MAX_EVIDENCE_PER_SIDE, openDispute, replyDispute, replyDueAt, replyMissed, SPONSOR_DECIDE_DAYS } from '../../utils/sponsorships';
import { formatNgn, formatRelative, formatTimestamp } from '../../utils/format';
import { Button } from '../ui/Button';
import { SelectInput } from '../ui/SelectInput';
import { TextArea } from '../ui/TextArea';
import { InlineAlert } from '../ui/InlineAlert';

interface DisputePanelProps {
  brief: SponsorBrief;
  app: SponsorApplication;
  /** Which side is looking. */
  side: 'brand' | 'creator';
  update: (fn: (list: SponsorBrief[]) => SponsorBrief[]) => boolean;
}

/**
 * Report a problem with a sponsorship deal, answer one, and see KUBICU's decision (D453). Staff decide in
 * Super admin → Sponsorship problems (D454). While a problem is open the held money is frozen.
 */
export function DisputePanel({ brief, app, side, update }: DisputePanelProps) {
  const { t: tr } = useT();
  const reasons = disputeReasons[side];
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<string>(reasons[0]);
  const [note, setNote] = useState('');
  const [reply, setReply] = useState('');
  const [tried, setTried] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [appealing, setAppealing] = useState(false);
  const [appealText, setAppealText] = useState('');
  const d = app.dispute;
  const other = side === 'brand' ? app.creatorName : brief.brandName;

  const report = () => {
    setTried(true);
    if (note.trim().length < 10) return;
    if (update((l) => openDispute(l, brief.id, app.id, side, reason, note))) {
      toast(tr('Problem reported'), { description: tr('The held money is frozen until KUBICU decides. {name} can reply here.', { name: other }) });
      setReporting(false);
      setNote('');
      setTried(false);
    }
  };

  const sendReply = () => {
    if (reply.trim().length < 5) return toast.error(tr('Write a short reply'));
    if (update((l) => replyDispute(l, brief.id, app.id, reply))) {
      toast.success(tr('Reply sent'));
      setReply('');
    }
  };

  // Decided: show the outcome to both sides, and the appeal if there is one (D464).
  if (d?.outcome) {
    const title = d.outcome === 'creator' ? tr('KUBICU paid the creator') : d.outcome === 'brand' ? tr('KUBICU refunded the brand') : tr('KUBICU split the held money');
    const ap = d.appeal;
    return (
      <div className="flex flex-col gap-3">
        <InlineAlert tone="info" title={title}>
          {[tr('To the creator: {amount}', { amount: formatNgn(d.toCreatorNgn ?? 0) }), tr('Back to the brand: {amount}', { amount: formatNgn(d.toBrandNgn ?? 0) })].join(' · ')}
          {d.decisionNote && <span className="mt-1 block">“{d.decisionNote}”</span>}
          {ap?.result && ap.note && <span className="mt-1 block">{tr(ap.result === 'changed' ? 'Changed on appeal: “{note}”' : 'Kept on appeal: “{note}”', { note: ap.note })}</span>}
          <span className="mt-1 block">{tr('The deal is closed. Test mode — no money moved.')}</span>
        </InlineAlert>
        {ap && !ap.result && <p className="text-caption text-fg-muted">{tr(ap.by === side ? 'You appealed. A different KUBICU reviewer will look again and reply here.' : '{name} appealed. A different KUBICU reviewer will look again and reply here.', { name: other })}</p>}
        {!ap && canAppeal(app, side) &&
          (appealing ? (
            <div className="flex flex-col gap-2 rounded-md border border-line px-4 py-3">
              <TextArea id={`appeal-${app.id}`} label={tr('Why should KUBICU look again?')} rows={3} value={appealText} error={tried && appealText.trim().length < 20 ? tr('Explain what was missed (20 characters or more)') : undefined} onChange={(e) => setAppealText(e.target.value)} />
              <div className="flex justify-end gap-2">
                <Button variant="tertiary" onClick={() => setAppealing(false)}>
                  {tr('Cancel')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setTried(true);
                    if (appealText.trim().length < 20) return;
                    if (update((l) => openAppeal(l, brief.id, app.id, side, appealText))) {
                      toast(tr('Appeal sent'), { description: tr('A different KUBICU reviewer will look again.') });
                      setAppealing(false);
                      setTried(false);
                    }
                  }}
                >
                  {tr('Send appeal')}
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="tertiary" className="self-start" onClick={() => setAppealing(true)}>
              {tr('Appeal this decision (within {n} days)', { n: SPONSOR_APPEAL_DAYS })}
            </Button>
          ))}
      </div>
    );
  }

  if (d && disputeOpen(app)) {
    const mine = d.by === side;
    const mineCount = (d.evidence ?? []).filter((e) => e.by === side).length;
    return (
      <section aria-labelledby={`dsp-${app.id}`} className="flex flex-col gap-3 rounded-md border border-line bg-warning-soft px-4 py-3">
        <h4 id={`dsp-${app.id}`} className="flex items-center gap-2 text-label font-semibold text-fg">
          <FlagIcon size={14} className="text-warning" aria-hidden />
          {mine ? tr('You reported a problem') : tr('{name} reported a problem', { name: other })}
        </h4>
        <p className="text-caption text-fg">
          <strong>{tr(d.reason)}</strong> · {formatRelative(d.openedAt)}
          <span className="mt-1 block text-fg-muted">“{d.note}”</span>
        </p>
        {d.reply ? (
          <p className="text-caption text-fg-muted">
            <strong className="text-fg">{mine ? tr('Their reply') : tr('Your reply')}:</strong> “{d.reply}”
          </p>
        ) : replyMissed(d) ? (
          <p className="text-caption text-fg-muted">{tr(mine ? 'No reply came in time. KUBICU will decide from what you sent.' : 'The time to reply has passed. KUBICU will decide from what was sent.')}</p>
        ) : !mine ? (
          <div className="flex flex-col gap-1">
          <p className="text-caption font-medium text-fg">{tr('Reply by {when}', { when: formatTimestamp(replyDueAt(d.openedAt)) })}</p>
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <TextArea id={`dsp-reply-${app.id}`} label={tr('Your side of it')} rows={2} value={reply} onChange={(e) => setReply(e.target.value)} />
            </div>
            <Button variant="secondary" onClick={sendReply}>
              {tr('Send')}
            </Button>
          </div>
          </div>
        ) : (
          <p className="text-caption text-fg-muted">{tr('Waiting for {name} to reply by {when}.', { name: other, when: formatTimestamp(replyDueAt(d.openedAt)) })}</p>
        )}
        <div className="flex flex-col gap-1.5">
          <p className="text-caption font-medium text-fg">{tr('Evidence')}</p>
          {(d.evidence ?? []).length === 0 ? (
            <p className="text-caption text-fg-muted">{tr('Screenshots of the post, chats or the brief help KUBICU decide.')}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {(d.evidence ?? []).map((e) => (
                <li key={e.id} className="flex min-w-0 items-center gap-2 text-caption text-fg">
                  <FileTextIcon size={13} className="shrink-0 text-fg-subtle" aria-hidden />
                  <span className="truncate">{e.name}</span>
                  <span className="shrink-0 text-fg-subtle">· {e.by === side ? tr('you') : other}</span>
                </li>
              ))}
            </ul>
          )}
          {mineCount < MAX_EVIDENCE_PER_SIDE && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && update((l) => addEvidence(l, brief.id, app.id, side, f.name))) toast.success(tr('Evidence added'), { description: f.name });
                  e.target.value = '';
                }}
              />
              <Button size="sm" variant="tertiary" leadingIcon={PaperclipIcon} className="self-start" onClick={() => fileRef.current?.click()}>
                {tr('Add evidence')}
              </Button>
            </>
          )}
        </div>
        <p className="text-caption text-fg-muted">{tr('Held money is frozen: {amount}. KUBICU looks at the brief, the links sent and both replies, then decides.', { amount: formatNgn(app.heldNgn) })}</p>
        <p className="flex items-center gap-1.5 border-t border-line pt-3 text-caption font-medium text-fg-muted">
          <ScaleIcon size={13} aria-hidden /> {tr('KUBICU aims to decide within {n} days. You’ll both see the decision here.', { n: SPONSOR_DECIDE_DAYS })}
        </p>
      </section>
    );
  }

  if (!canDispute(app)) return null;

  return reporting ? (
    <section aria-labelledby={`dsp-new-${app.id}`} className="flex flex-col gap-3 rounded-md border border-line px-4 py-3">
      <h4 id={`dsp-new-${app.id}`} className="text-label font-semibold text-fg">
        {tr('Report a problem')}
      </h4>
      <SelectInput id={`dsp-reason-${app.id}`} label={tr('What’s wrong?')} value={reason} onChange={setReason} options={reasons.map((r) => ({ value: r, label: tr(r) }))} />
      <TextArea id={`dsp-note-${app.id}`} label={tr('What happened')} rows={3} value={note} error={tried && note.trim().length < 10 ? tr('A sentence or two, please (10 characters or more)') : undefined} onChange={(e) => setNote(e.target.value)} />
      <p className="text-caption text-fg-subtle">{tr('Talk to {name} first if you can. Reporting freezes the held money until KUBICU decides.', { name: other })}</p>
      <div className="flex justify-end gap-2">
        <Button variant="tertiary" onClick={() => setReporting(false)}>
          {tr('Cancel')}
        </Button>
        <Button variant="secondary" onClick={report}>
          {tr('Report')}
        </Button>
      </div>
    </section>
  ) : (
    <Button size="sm" variant="tertiary" leadingIcon={FlagIcon} className="self-start" onClick={() => setReporting(true)}>
      {tr('Report a problem')}
    </Button>
  );
}
