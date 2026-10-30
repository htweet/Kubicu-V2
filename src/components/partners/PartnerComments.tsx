import React, { useState } from 'react';
import { CheckCircle2Icon, MessageSquareIcon, RotateCcwIcon } from 'lucide-react';
import type { AgreementSide, PartnerComment, Partnership } from '../../types/partnership';
import { formatRelative } from '../../utils/format';
import { uid } from '../../utils/id';
import { useT } from '../../contexts/LocaleContext';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { cn } from '../../utils/cn';

interface PartnerCommentsProps {
  partnership: Partnership;
  leadName: string;
  /** Which business is writing. */
  side: AgreementSide;
  onChange: (p: Partnership) => void;
  /** Limit to one co-branded space. */
  spaceId?: string;
  /** Pre-fill the "about" tag with a block. */
  block?: {id: string;label: string;} | null;
  disabled?: boolean;
  className?: string;
}

/**
 * Comments between the two businesses (D121). Unlike team comments (D116), both businesses
 * read and write here, so nothing internal should go in it. Comment text and block names show as written.
 */
export function PartnerComments({ partnership: p, leadName, side, onChange, spaceId, block, disabled, className }: PartnerCommentsProps) {
  const { t: tr } = useT();
  const [text, setText] = useState('');
  const [aboutBlock, setAboutBlock] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const all = (p.comments ?? []).filter((c) => spaceId ? c.spaceId === spaceId : true);
  const open = all.filter((c) => !c.resolvedAt);
  const resolved = all.filter((c) => c.resolvedAt);
  const name = side === 'lead' ? leadName : p.partner.name;
  const headingId = `pc-h-${p.id}-${spaceId ?? 'all'}`;

  const post = () => {
    const t = text.trim();
    if (!t) return;
    const c: PartnerComment = { id: uid('pcm'), by: side, author: name, text: t, at: new Date().toISOString(), spaceId, blockId: block && aboutBlock ? block.id : undefined, blockLabel: block && aboutBlock ? block.label : undefined };
    onChange({ ...p, comments: [c, ...(p.comments ?? [])] });
    setText('');
  };
  const setResolved = (id: string, on: boolean) => onChange({ ...p, comments: (p.comments ?? []).map((c) => c.id === id ? { ...c, resolvedAt: on ? new Date().toISOString() : undefined } : c) });

  return (
    <section aria-labelledby={headingId} className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={headingId} className="text-label font-semibold text-fg">
          {tr('Comments with {name}', { name: side === 'lead' ? p.partner.name : leadName })}
        </h3>
        <span className="text-caption text-fg-subtle">{open.length ? tr('Open: {n}', { n: open.length }) : tr('None open')}</span>
      </div>
      <p className="-mt-2 text-caption text-fg-subtle">{tr('Both businesses see these. Keep team-only notes in your team comments.')}</p>

      <div className="flex flex-col gap-2">
        <TextArea
          id={`pc-new-${p.id}-${spaceId ?? 'all'}`}
          label={tr('Comment as {name}', { name })}
          rows={2}
          maxLength={600}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          placeholder={block ? tr('e.g. Can we use the photo from the shoot on the {block}?', { block: block.label.toLowerCase() }) : tr('e.g. Can we launch on Friday?')} />
        
        <div className="flex flex-wrap items-center justify-between gap-2">
          {block ?
          <label className="flex items-center gap-2 text-caption text-fg-muted">
              <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--action))]" checked={aboutBlock} onChange={(e) => setAboutBlock(e.target.checked)} />
              {tr('About “{name}”', { name: block.label })}
            </label> :

          <span />
          }
          <Button size="sm" leadingIcon={MessageSquareIcon} disabled={disabled || !text.trim()} onClick={post}>
            {tr('Post')}
          </Button>
        </div>
      </div>

      {open.length > 0 &&
      <ol className="flex flex-col divide-y divide-line rounded-lg border border-line bg-raised">
          {open.map((c) =>
        <CommentRow key={c.id} c={c} mine={c.by === side} onResolve={() => setResolved(c.id, true)} disabled={disabled} />
        )}
        </ol>
      }
      {resolved.length > 0 &&
      <div className="flex flex-col gap-2">
          <button type="button" onClick={() => setShowResolved((v) => !v)} aria-expanded={showResolved} className="self-start rounded-sm text-caption font-medium text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            {showResolved ? tr('Hide resolved ({n})', { n: resolved.length }) : tr('Show resolved ({n})', { n: resolved.length })}
          </button>
          {showResolved &&
        <ol className="flex flex-col divide-y divide-line rounded-lg border border-line bg-raised opacity-80">
              {resolved.map((c) =>
          <CommentRow key={c.id} c={c} mine={c.by === side} onReopen={() => setResolved(c.id, false)} disabled={disabled} />
          )}
            </ol>
        }
        </div>
      }
    </section>);

}

function CommentRow({ c, mine, onResolve, onReopen, disabled }: {c: PartnerComment;mine: boolean;onResolve?: () => void;onReopen?: () => void;disabled?: boolean;}) {
  const { t: tr } = useT();
  return (
    <li className="flex flex-col gap-1.5 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-caption">
          <span className={cn('font-semibold', mine ? 'text-action' : 'text-fg')}>{c.author}</span>
          <span className="text-fg-subtle"> · {formatRelative(c.at)}</span>
        </p>
        {onResolve &&
        <button type="button" disabled={disabled} onClick={onResolve} aria-label={tr('Resolve comment from {name}', { name: c.author })} className="inline-flex shrink-0 items-center gap-1 rounded-sm text-caption font-medium text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-40">
            <CheckCircle2Icon size={13} aria-hidden /> {tr('Resolve')}
          </button>
        }
        {onReopen &&
        <button type="button" disabled={disabled} onClick={onReopen} aria-label={tr('Reopen comment from {name}', { name: c.author })} className="inline-flex shrink-0 items-center gap-1 rounded-sm text-caption font-medium text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-40">
            <RotateCcwIcon size={13} aria-hidden /> {tr('Reopen')}
          </button>
        }
      </div>
      {c.blockLabel && <span className="self-start rounded-sm bg-sunken px-1.5 py-0.5 text-meta font-medium text-fg-muted">{tr('About {name}', { name: c.blockLabel })}</span>}
      <p className="whitespace-pre-wrap text-label text-fg">{c.text}</p>
    </li>);

}