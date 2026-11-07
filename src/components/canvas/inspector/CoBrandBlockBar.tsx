import React, { useEffect } from 'react';
import { HandshakeIcon, LockIcon } from 'lucide-react';
import type { Block, BlockOwner } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useCoBrand } from '../../../hooks/useCoBrand';
import { canEditBlock, canReassign, ownerLabel, ownerOf, setOwner } from '../../../utils/coBrand';
import { Segmented } from '../../ui/Segmented';

/**
 * Who looks after this block in a co-branded space (D121). New blocks belong to whoever adds them.
 * In own-sections mode, the other business's blocks are read-only here.
 */
export function CoBrandBlockBar({ block }: { block: Block }) {
  const { actions } = useEditor();
  const { cb, actor } = useCoBrand();

  // A block just added belongs to the business that added it.
  useEffect(() => {
    if (!cb || block.owner) return;
    if (Date.now() - Date.parse(block.createdAt) < 8000 && Date.parse(block.createdAt) > Date.parse(cb.startedAt)) actions.transformDocument((d) => setOwner(d, block.id, actor));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id, cb?.partnershipId]);

  if (!cb) return null;
  const owner = ownerOf(block);
  const editable = canEditBlock(cb, block, actor);
  const reassign = canReassign(cb, block, actor);
  const other = actor === 'lead' ? 'partner' : 'lead';

  return (
    <div className="flex flex-col gap-2.5 rounded-md border border-line bg-sunken/60 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <HandshakeIcon size={14} className="shrink-0 text-fg-muted" aria-hidden />
        <p className="min-w-0 flex-1 text-caption text-fg-muted">
          Looked after by <span className="font-semibold text-fg">{owner === 'shared' ? 'both of you' : ownerLabel(owner, actor, cb) === 'Yours' ? 'you' : ownerLabel(owner, actor, cb)}</span>
        </p>
      </div>
      {cb.mode === 'sections' &&
        (reassign ? (
          <Segmented<BlockOwner>
            ariaLabel="Who looks after this block"
            size="sm"
            fullWidth
            value={owner}
            onChange={(next) => actions.transformDocument((d) => setOwner(d, block.id, next))}
            options={[
              { value: actor, label: 'Yours' },
              { value: 'shared', label: 'Shared' },
              { value: other, label: other === 'lead' ? cb.leadName : cb.partnerName },
            ]}
          />
        ) : null)}
      {!editable && (
        <p className="flex items-start gap-1.5 text-caption text-fg-muted">
          <LockIcon size={12} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            This is {ownerLabel(owner, actor, cb)}’s block, so you can’t change it. Leave them a comment in the partner panel, or ask them to make it shared.
          </span>
        </p>
      )}
      {cb.mode === 'open' && <p className="text-caption text-fg-subtle">Open editing: both of you can change it. Changes are listed in the partner panel.</p>}
    </div>
  );
}
