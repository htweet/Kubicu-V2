import React, { useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useCommerce } from '../../contexts/CommerceContext';
import { uid } from '../../utils/id';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TextInput } from '../ui/TextInput';
import { SampleTag } from './StatusBadges';

/** Collections group products, e.g. a seasonal drop. A product grid can show a whole collection. */
export function CollectionsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, apply } = useCommerce();
  const [name, setName] = useState('');

  const add = () => {
    const n = name.trim();
    if (!n) return;
    if (data.collections.some((c) => c.name.toLowerCase() === n.toLowerCase())) {
      toast('A collection with that name already exists');
      return;
    }
    if (apply((d) => ({ ...d, collections: [...d.collections, { id: uid('col'), name: n, description: '' }] }))) setName('');
  };

  const rename = (id: string, value: string) => apply((d) => ({ ...d, collections: d.collections.map((c) => (c.id === id ? { ...c, name: value } : c)) }));

  const remove = (id: string) => {
    const col = data.collections.find((c) => c.id === id);
    if (!col) return;
    apply((d) => ({ ...d, collections: d.collections.filter((c) => c.id !== id), products: d.products.map((p) => ({ ...p, collectionIds: p.collectionIds.filter((x) => x !== id) })) }));
    toast(`Deleted “${col.name}”`, {
      description: 'Products stay; they’re just no longer grouped.',
      action: { label: 'Undo', onClick: () => apply((d) => ({ ...d, collections: [...d.collections, col] })) },
    });
  };

  return (
    <Sheet open={open} onClose={onClose} side="right" title="Collections" description="Group products for your page">
      <div className="flex flex-col gap-5 px-5 py-5">
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <TextInput id="col-new" label="New collection" placeholder="e.g. Harmattan drop" value={name} fieldClassName="flex-1" onChange={(e) => setName(e.target.value)} />
          <Button type="submit" leadingIcon={PlusIcon} disabled={!name.trim()}>
            Add
          </Button>
        </form>
        {data.collections.length === 0 ? (
          <p className="text-label text-fg-muted">No collections yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line border-y border-line">
            {data.collections.map((c) => {
              const count = data.products.filter((p) => p.collectionIds.includes(c.id)).length;
              return (
                <li key={c.id} className="flex items-center gap-2 py-2.5">
                  <label htmlFor={`col-${c.id}`} className="sr-only">
                    Collection name
                  </label>
                  <input
                    id={`col-${c.id}`}
                    value={c.name}
                    onChange={(e) => rename(c.id, e.target.value)}
                    className="h-9 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 text-label font-semibold text-fg hover:border-line focus:border-action focus:outline-none"
                  />
                  {c.sample && <SampleTag />}
                  <span className="shrink-0 text-caption tabular-nums text-fg-subtle">
                    {count} product{count === 1 ? '' : 's'}
                  </span>
                  <IconButton icon={Trash2Icon} size="sm" label={`Delete ${c.name}`} onClick={() => remove(c.id)} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Sheet>
  );
}
