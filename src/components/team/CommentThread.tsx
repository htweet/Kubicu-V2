import React, { useMemo, useState } from 'react';
import { CheckCircle2Icon, CornerDownRightIcon, MessageSquareIcon, RotateCcwIcon } from 'lucide-react';
import { useTeam } from '../../contexts/TeamContext';
import type { ActivityArea, Member, TeamComment } from '../../types/team';
import { formatRelative } from '../../utils/format';
import { initials } from '../../utils/team';
import { CommentComposer } from './CommentComposer';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface CommentThreadProps {
  /** `<kind>:<id>`, e.g. `order:ord_12`. */
  subject: string;
  /** Shown in notifications and the activity log, e.g. "Order #1007". */
  subjectLabel: string;
  href?: string;
  area: ActivityArea;
  className?: string;
}

/** Team comments on one piece of work: threads, replies, @mentions and resolve (D116). */
export function CommentThread({ subject, subjectLabel, href, area, className }: CommentThreadProps) {
  const team = useTeam();
  const [showResolved, setShowResolved] = useState(false);
  const all = useMemo(() => team.data.comments.filter((c) => c.subject === subject), [team.data.comments, subject]);
  const threads = all.filter((c) => !c.parentId);
  const open = threads.filter((t) => !t.resolvedAt);
  const resolved = threads.filter((t) => t.resolvedAt);
  const live = all.filter((c) => !c.deletedAt).length;
  const headingId = `cmt-h-${subject.replace(/[^a-z0-9]/gi, '-')}`;

  const post = (text: string, parentId?: string) => !!team.addComment({ subject, subjectLabel, href, area, text, parentId });

  return (
    <section aria-labelledby={headingId} className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={headingId} className="flex items-center gap-2 text-label font-semibold text-fg">
          <MessageSquareIcon size={15} className="text-fg-subtle" aria-hidden />
          Team comments
          {live > 0 && <span className="text-caption font-normal tabular-nums text-fg-subtle">{live}</span>}
        </h3>
        <span className="text-caption text-fg-subtle">Only your team sees these</span>
      </div>

      {open.length > 0 &&
      <ol className="flex flex-col divide-y divide-line border-y border-line">
          {open.map((t) =>
        <ThreadItem key={t.id} thread={t} replies={all.filter((r) => r.parentId === t.id)} onReply={(text) => post(text, t.id)} />
        )}
        </ol>
      }

      {resolved.length > 0 &&
      <div>
          <button type="button" onClick={() => setShowResolved((v) => !v)} aria-expanded={showResolved} className="inline-flex items-center gap-1.5 text-caption font-medium text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            <CheckCircle2Icon size={13} aria-hidden />
            {showResolved ? 'Hide' : 'Show'} {resolved.length} resolved
          </button>
          {showResolved &&
        <ol className="mt-2 flex flex-col divide-y divide-line border-y border-line opacity-80">
              {resolved.map((t) =>
          <ThreadItem key={t.id} thread={t} replies={all.filter((r) => r.parentId === t.id)} onReply={(text) => post(text, t.id)} />
          )}
            </ol>
        }
        </div>
      }

      <CommentComposer id={`cmt-new-${subject}`} label={open.length ? 'Start a new thread' : 'Add a comment'} onSubmit={(text) => post(text)} />
    </section>);

}

function ThreadItem({ thread, replies, onReply }: {thread: TeamComment;replies: TeamComment[];onReply: (text: string) => boolean;}) {
  const team = useTeam();
  const [replying, setReplying] = useState(false);
  const everyoneGone = thread.deletedAt && replies.every((r) => r.deletedAt);
  if (everyoneGone) return null;

  return (
    <li className="flex flex-col gap-3 py-3.5">
      <CommentItem comment={thread} />
      {replies.length > 0 &&
      <ol className="ml-9 flex flex-col gap-3 border-l border-line pl-4">
          {replies.map((r) =>
        <li key={r.id}>
              <CommentItem comment={r} />
            </li>
        )}
        </ol>
      }
      <div className="ml-9 flex flex-wrap items-center gap-x-4 gap-y-1">
        {thread.resolvedAt ?
        <>
            <span className="inline-flex items-center gap-1.5 text-caption text-success">
              <CheckCircle2Icon size={13} aria-hidden /> Resolved by {thread.resolvedBy} · {formatRelative(thread.resolvedAt)}
            </span>
            <LinkButton icon={RotateCcwIcon} onClick={() => team.resolveThread(thread.id, false)}>
              Reopen
            </LinkButton>
          </> :

        !replying &&
        <>
              <LinkButton icon={CornerDownRightIcon} onClick={() => setReplying(true)}>
                Reply
              </LinkButton>
              <LinkButton icon={CheckCircle2Icon} onClick={() => team.resolveThread(thread.id, true)}>
                Resolve
              </LinkButton>
            </>

        }
      </div>
      {replying &&
      <div className="ml-9">
          <CommentComposer id={`cmt-reply-${thread.id}`} label={`Reply to ${thread.authorName}`} submitLabel="Reply" autoFocus onCancel={() => setReplying(false)} onSubmit={(text) => {const ok = onReply(text);if (ok) setReplying(false);return ok;}} />
        </div>
      }
    </li>);

}

function CommentItem({ comment: c }: {comment: TeamComment;}) {
  const team = useTeam();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const mine = c.authorId === team.me.id;
  const canDelete = mine || team.role === 'owner' || team.role === 'admin';

  if (c.deletedAt)
  return <p className="pl-9 text-caption italic text-fg-subtle">Comment deleted</p>;

  return (
    <article className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-2.5">
      <span aria-hidden className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-sunken text-[11px] font-semibold text-fg">
        {initials(c.authorName)}
      </span>
      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline gap-x-2 text-caption">
          <span className="font-semibold text-fg">{mine ? `${c.authorName} (you)` : c.authorName}</span>
          <time dateTime={c.at} className="text-fg-subtle">
            {formatRelative(c.at)}
            {c.editedAt ? ' · edited' : ''}
          </time>
        </p>
        {editing ?
        <div className="mt-2">
            <CommentComposer id={`cmt-edit-${c.id}`} label="Edit comment" initial={c.text} submitLabel="Save" autoFocus onCancel={() => setEditing(false)} onSubmit={(text) => {team.editComment(c.id, text);setEditing(false);}} />
          </div> :

        <p className="mt-1 whitespace-pre-wrap break-words text-label leading-relaxed text-fg">
            <MentionText text={c.text} members={team.data.members} meId={team.me.id} />
          </p>
        }
        {!editing && (mine || canDelete) &&
        <div className="mt-1.5 flex items-center gap-3">
            {confirming ?
          <>
                <span className="text-caption text-fg-muted">Delete this comment?</span>
                <LinkButton tone="danger" onClick={() => team.deleteComment(c.id)}>
                  Delete
                </LinkButton>
                <LinkButton onClick={() => setConfirming(false)}>Keep</LinkButton>
              </> :

          <>
                {mine && <LinkButton onClick={() => setEditing(true)}>Edit</LinkButton>}
                {canDelete && <LinkButton onClick={() => setConfirming(true)}>Delete</LinkButton>}
              </>
          }
          </div>
        }
      </div>
    </article>);

}

function MentionText({ text, members, meId }: {text: string;members: Member[];meId: string;}) {
  const names = [...members].sort((a, b) => b.name.length - a.name.length);
  if (!names.length) return <>{text}</>;
  const pattern = new RegExp(`@(${names.map((m) => m.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    const member = names.find((x) => x.name.toLowerCase() === m[1].toLowerCase());
    parts.push(
      <span key={idx} className={cn('rounded px-0.5 font-medium', member?.id === meId ? 'bg-action-soft text-action' : 'bg-sunken text-fg')}>
        @{member?.name ?? m[1]}
      </span>
    );
    last = idx + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function LinkButton({ children, onClick, icon: Icon, tone }: {children: React.ReactNode;onClick: () => void;icon?: typeof CheckCircle2Icon;tone?: 'danger';}) {
  return (
    <Button size="sm" variant="tertiary" onClick={onClick} className={cn('h-auto px-0 py-0.5 text-caption hover:bg-transparent hover:underline', tone === 'danger' ? 'text-danger' : 'text-fg-muted')}>
      {Icon && <Icon size={13} aria-hidden className="mr-1" />}
      {children}
    </Button>);

}