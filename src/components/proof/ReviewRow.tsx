import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, MessageSquareReplyIcon } from 'lucide-react';
import type { HideReason, ProofData, ProofReview } from '../../types/proof';
import { hideReasons, shortDay, sourceBadge } from '../../utils/proof';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { SelectInput } from '../ui/SelectInput';
import { SampleTag } from '../commerce/StatusBadges';
import { Stars } from './Stars';

interface Props {
  review: ProofReview;
  canEdit: boolean;
  update: (fn: (d: ProofData) => ProofData) => void;
}

/** One review. The business can reply or hide it with a reason, but never edit the words (D91). */
export function ReviewRow({ review: r, canEdit, update }: Props) {
  const [mode, setMode] = useState<'view' | 'reply' | 'hide'>('view');
  const [reply, setReply] = useState(r.reply ?? '');
  const [reason, setReason] = useState<HideReason>('personal');
  const patch = (p: Partial<ProofReview>) => update((d) => ({ ...d, reviews: d.reviews.map((x) => (x.id === r.id ? { ...x, ...p } : x)) }));

  return (
    <li className="flex flex-col gap-3 px-5 py-4 md:px-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="text-warning">
          <Stars rating={r.rating} />
        </span>
        <span className="text-label font-semibold text-fg">{r.displayName}</span>
        <Badge tone="success">{sourceBadge[r.source.kind]}</Badge>
        {r.sample && <SampleTag />}
        {r.hidden ? (
          <Badge tone="neutral" icon={EyeOffIcon}>
            Hidden · {hideReasons.find((h) => h.value === r.hiddenReason)?.label ?? 'by you'}
          </Badge>
        ) : !r.permission ? (
          <Badge tone="neutral">Rating only — no permission to show words</Badge>
        ) : null}
        <span className="ml-auto text-caption text-fg-subtle">{shortDay(r.createdAt)}</span>
      </div>
      {r.text ? <p className="max-w-3xl text-body text-fg">“{r.text}”</p> : <p className="text-caption text-fg-subtle">No written review — rating only.</p>}
      <p className="text-caption text-fg-subtle">{r.source.label}</p>
      {r.reply && mode !== 'reply' && (
        <p className="max-w-3xl border-l-2 border-line pl-3 text-label text-fg-muted">
          <span className="font-semibold text-fg">Your reply:</span> {r.reply}
        </p>
      )}

      {mode === 'reply' && (
        <div className="flex max-w-2xl flex-col gap-2">
          <TextArea id={`reply-${r.id}`} label="Public reply" rows={2} maxLength={300} value={reply} onChange={(e) => setReply(e.target.value)} hint="Shown under the review on your page. Leave empty to remove." />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => (patch({ reply: reply.trim() || undefined }), setMode('view'))}>
              Save reply
            </Button>
            <Button size="sm" variant="tertiary" onClick={() => setMode('view')}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      {mode === 'hide' && (
        <div className="flex max-w-md flex-col gap-2">
          <SelectInput<HideReason> id={`hide-${r.id}`} label="Why hide it?" value={reason} onChange={setReason} options={hideReasons} />
          <p className="text-caption text-fg-subtle">Hidden reviews still count towards your rating, so hiding can’t raise your score.</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => (patch({ hidden: true, hiddenReason: reason }), setMode('view'))}>
              Hide review
            </Button>
            <Button size="sm" variant="tertiary" onClick={() => setMode('view')}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {canEdit && mode === 'view' && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="tertiary" leadingIcon={MessageSquareReplyIcon} onClick={() => setMode('reply')}>
            {r.reply ? 'Edit reply' : 'Reply'}
          </Button>
          {r.hidden ? (
            <Button size="sm" variant="tertiary" leadingIcon={EyeIcon} onClick={() => patch({ hidden: false, hiddenReason: undefined })}>
              Show again
            </Button>
          ) : (
            <Button size="sm" variant="tertiary" leadingIcon={EyeOffIcon} onClick={() => setMode('hide')}>
              Hide
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
