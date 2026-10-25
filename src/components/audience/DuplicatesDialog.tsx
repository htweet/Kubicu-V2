import React from 'react';
import { toast } from 'sonner';
import { useOps } from '../../contexts/OpsContext';
import { duplicatePairs, mergeContacts } from '../../utils/ops/ops';
import { sourceLabels } from '../../data/audience';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { ConsentBadge } from './ContactDetail';
import { useT } from '../../contexts/LocaleContext';

/** Review possible duplicates one pair at a time; nothing merges automatically. */
export function DuplicatesDialog({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { data, apply } = useOps();
  const { t: tr } = useT();
  const pairs = duplicatePairs(data.contacts);
  const pair = pairs[0];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={pairs.length ? tr('Possible duplicates · {n}', { n: pairs.length }) : 'No duplicates'}
      description={pairs.length ? 'Same email, phone or name. Choose which record to keep — the other’s history, tags and tasks are folded in. An opt-out on either is kept.' : 'Every contact looks unique.'}
      footer={<Button variant="secondary" onClick={onClose}>Done</Button>}>
      
      {pair &&
      <div className="grid gap-3 sm:grid-cols-2">
          {pair.map((c, i) =>
        <div key={c.id} className="flex flex-col gap-2 rounded-md border border-line p-4">
              <p className="text-label font-semibold text-fg">{c.name || tr('(no name)')}</p>
              <p className="text-caption text-fg-muted">{c.email || tr('No email')}</p>
              <p className="text-caption text-fg-muted">{c.phone || tr('No phone')}</p>
              <p className="text-caption text-fg-subtle">{c.sources.map((s) => tr(sourceLabels[s])).join(', ')} · {tr('{n} activities', { n: c.activity.length })}</p>
              <ConsentBadge consent={c.consent} />
              <Button
            size="sm"
            className="mt-2"
            onClick={() => {
              const other = pair[i === 0 ? 1 : 0];
              if (apply((d) => mergeContacts(d, c.id, other.id))) toast(tr('Merged into {name}', { name: c.name || tr('contact') }));
            }}>
            
                {tr('Keep this one')}
              </Button>
            </div>
        )}
          <p className="text-caption text-fg-subtle sm:col-span-2">{tr('Not the same person? Edit one of them so their details differ, and they’ll stop showing here.')}</p>
        </div>
      }
    </Dialog>);

}