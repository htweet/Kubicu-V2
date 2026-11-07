import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangleIcon, CheckIcon, MinusIcon, PencilIcon, PlusIcon, RefreshCwIcon } from 'lucide-react';
import { useTeam } from '../../contexts/TeamContext';
import { useEditor } from '../../contexts/EditorContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { changedBlocks, publishStored, sameDoc, settingsChanged } from '../../utils/reviews';
import { MAIN_SPACE_ID, spaceStorageId } from '../../utils/spaces';
import { formatRelative } from '../../utils/format';
import { formatSchedule } from '../../utils/schedule';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { InlineAlert } from '../ui/InlineAlert';
import { PageMiniPreview } from '../overview/PageMiniPreview';
import { CommentThread } from '../team/CommentThread';
import { cn } from '../../utils/cn';

const changeIcon = { added: PlusIcon, removed: MinusIcon, changed: PencilIcon };

/** One review: live vs proposed side by side, what changed, and the decision (D58). */
export function ReviewDetail({ reviewId, onClose }: { reviewId: string | null; onClose: () => void }) {
  const team = useTeam();
  const { actions } = useEditor();
  const { current } = useWorkspace();
  const review = reviewId ? team.data.reviews.find((r) => r.id === reviewId) : undefined;
  const [comment, setComment] = useState('');
  const [tried, setTried] = useState(false);
  // The version on screen when you opened it; approving needs you to have seen the latest.
  const [seenAt, setSeenAt] = useState<string | null>(null);

  useEffect(() => {
    setComment('');
    setTried(false);
    setSeenAt(review?.updatedAt ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewId]);

  if (!review) return <Sheet open={!!reviewId} onClose={onClose} side="right" size="lg" title="Review not found"><p className="p-5 text-label text-fg-muted">It may have been withdrawn.</p></Sheet>;

  const reviewer = team.can('approvals.review');
  const changedSince = !!seenAt && review.updatedAt !== seenAt;
  const changes = changedBlocks(review.live, review.doc);
  const settings = settingsChanged(review.live, review.doc);
  const isPending = review.status === 'pending';
  const nothingNew = sameDoc(review.live, review.doc);

  const approve = () => {
    if (!reviewer.allowed || changedSince) return;
    const note = review.note || `Approved by ${team.me.name}`;
    const future = !!review.scheduleAt && Date.parse(review.scheduleAt) > Date.now();
    // The main space is open in the editor on workspace screens; other spaces are published from storage.
    const ok =
      review.spaceId === MAIN_SPACE_ID
        ? future
          ? actions.schedulePublish(review.scheduleAt as string, note, review.doc)
          : actions.publish(note, review.doc)
        : publishStored(spaceStorageId(current.id, review.spaceId), review.doc, note, review.scheduleAt);
    if (!ok) {
      toast.error('Couldn’t publish', { description: 'Browser storage is full. Nothing changed.' });
      return;
    }
    team.decideReview(review.id, 'approved', '');
    toast.success(future ? `${review.spaceName} approved and scheduled` : `${review.spaceName} approved and live`, { description: `${review.requestedBy} is told in KUBICU.` });
    onClose();
  };

  const requestChanges = () => {
    setTried(true);
    if (!comment.trim()) return;
    team.decideReview(review.id, 'changes', comment.trim());
    toast(`Changes requested from ${review.requestedBy}`);
    onClose();
  };

  return (
    <Sheet
      open={!!reviewId}
      onClose={onClose}
      side="right"
      size="lg"
      title={review.spaceName}
      description={`Sent by ${review.requestedBy} ${formatRelative(review.createdAt)}${review.updatedAt !== review.createdAt ? ` · updated ${formatRelative(review.updatedAt)}` : ''}`}
      footer={
        isPending && reviewer.allowed ? (
          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            <Button variant="secondary" onClick={requestChanges}>
              Request changes
            </Button>
            <Button leadingIcon={CheckIcon} onClick={approve} disabled={changedSince}>
              {review.scheduleAt && Date.parse(review.scheduleAt) > Date.now() ? 'Approve & schedule' : 'Approve & publish'}
            </Button>
          </div>
        ) : isPending && review.requestedById === team.me.id ? (
          <div className="flex w-full justify-end">
            <Button variant="secondary" onClick={() => { team.withdrawReview(review.id); toast('Request withdrawn'); onClose(); }}>
              Withdraw request
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-6 px-5 py-5">
        {!isPending && (
          <InlineAlert tone={review.status === 'approved' ? 'success' : review.status === 'changes' ? 'warning' : 'info'} title={review.status === 'approved' ? `Approved by ${review.decidedBy}` : review.status === 'changes' ? `${review.decidedBy} asked for changes` : 'Withdrawn'}>
            {review.comment ? `“${review.comment}”` : review.decidedAt ? formatRelative(review.decidedAt) : null}
          </InlineAlert>
        )}
        {isPending && changedSince && (
          <InlineAlert tone="warning" title="Changed since you opened this" action={<Button size="sm" variant="secondary" leadingIcon={RefreshCwIcon} onClick={() => setSeenAt(review.updatedAt)}>I’ve checked the latest</Button>}>
            {review.requestedBy} kept editing. Look over the latest version before approving — approving publishes exactly what’s shown.
          </InlineAlert>
        )}
        {isPending && !reviewer.allowed && review.requestedById !== team.me.id && <p className="text-caption text-fg-muted">{reviewer.reason}</p>}

        {(review.note || review.scheduleAt) && (
          <div className="flex flex-col gap-1 text-label">
            {review.note && <p className="text-fg">“{review.note}”</p>}
            {review.scheduleAt && <p className="text-fg-muted">Asked to go live {formatSchedule(review.scheduleAt)}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {[
            ['Live now', review.live],
            ['Proposed', review.doc],
          ].map(([label, doc]) => (
            <figure key={label as string} className="flex flex-col items-center gap-2">
              <figcaption className={cn('text-caption font-semibold', label === 'Proposed' ? 'text-action' : 'text-fg-subtle')}>{label as string}</figcaption>
              {doc ? (
                <PageMiniPreview doc={doc as typeof review.doc} scale={0.4} height={360} />
              ) : (
                <div className="flex h-[360px] w-[156px] items-center justify-center rounded-[18px] border border-dashed border-line-strong text-center text-caption text-fg-subtle">Not published yet</div>
              )}
            </figure>
          ))}
        </div>

        <section aria-labelledby="changes-heading">
          <h3 id="changes-heading" className="text-label font-semibold text-fg">
            What changed
          </h3>
          {nothingNew ? (
            <p className="mt-2 text-caption text-fg-muted">Nothing differs from the live version.</p>
          ) : (
            <ul className="mt-2 flex flex-col divide-y divide-line border-y border-line">
              {settings.map((s) => (
                <li key={s} className="flex items-center gap-2.5 py-2 text-label text-fg">
                  <AlertTriangleIcon size={14} className="shrink-0 text-fg-subtle" aria-hidden />
                  {s}
                </li>
              ))}
              {changes.map((c) => {
                const Icon = changeIcon[c.kind];
                return (
                  <li key={`${c.kind}-${c.id}`} className="flex items-center gap-2.5 py-2 text-label">
                    <Icon size={14} className={cn('shrink-0', c.kind === 'added' ? 'text-success' : c.kind === 'removed' ? 'text-danger' : 'text-info')} aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-fg">{c.label}</span>
                    <span className="shrink-0 text-caption text-fg-subtle">
                      {c.kind} · {c.page}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {isPending && reviewer.allowed && (
          <TextArea id="review-comment" label="Decision note" optional={false} rows={3} value={comment} placeholder="Needed to request changes, e.g. “Use the new photo for the hero”" error={tried && !comment.trim() ? 'Say what needs changing.' : undefined} onChange={(e) => setComment(e.target.value)} />
        )}

        <CommentThread subject={`review:${review.id}`} subjectLabel={`the ${review.spaceName} review`} href={`/app/settings/approvals?review=${review.id}`} area="pages" className="border-t border-line pt-6" />
      </div>
    </Sheet>
  );
}
