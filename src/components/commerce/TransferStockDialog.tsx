import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Product } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { useT } from '../../contexts/LocaleContext';
import { MAIN_BRANCH, branchesOf, locationName, stockAt, transferStock } from '../../utils/commerce/branches';
import { variantLabel } from '../../utils/commerce/catalog';
import { OWNER_ACTOR } from '../../utils/commerce/ops';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { SelectInput } from '../ui/SelectInput';
import { TextInput } from '../ui/TextInput';

interface TransferStockDialogProps {
  product: Product | null;
  onClose: () => void;
}

/** Move units of one product between the main shop and branches (D437). */
export function TransferStockDialog({ product, onClose }: TransferStockDialogProps) {
  const { t: tr } = useT();
  const { data, apply } = useCommerce();
  const branches = branchesOf(data);
  const [vid, setVid] = useState('');
  const [from, setFrom] = useState(MAIN_BRANCH);
  const [to, setTo] = useState('');
  const [qty, setQty] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!product) return;
    setVid(product.variants[0]?.id ?? '');
    setFrom(MAIN_BRANCH);
    setTo(branches[0]?.id ?? '');
    setQty('');
    setError('');
  }, [product]); // eslint-disable-line react-hooks/exhaustive-deps

  const live = product ? data.products.find((p) => p.id === product.id) ?? product : null;
  const variant = live?.variants.find((v) => v.id === vid);
  const nameOf = (id: string) => (id === MAIN_BRANCH ? tr('Main shop') : locationName(data, id));
  const locations = [{ value: MAIN_BRANCH, label: tr('Main shop') }, ...branches.map((b) => ({ value: b.id, label: b.name }))];

  const save = () => {
    if (!live || !variant) return;
    let message = '';
    const ok = apply((d) => {
      const r = transferStock(d, live.id, variant.id, from, to, Number(qty), OWNER_ACTOR);
      if (!r.ok) {
        message = r.message;
        return d;
      }
      return r.data;
    });
    if (message) return setError(tr(message));
    if (ok) {
      toast.success(tr('Moved to {place}: {n}', { place: nameOf(to), n: qty }), { description: `${live.name}${Object.keys(variant.options).length ? ` · ${variantLabel(variant)}` : ''}` });
      onClose();
    }
  };

  return (
    <Dialog
      open={!!product}
      onClose={onClose}
      size="sm"
      title={live ? `${tr('Move stock')} · ${live.name}` : tr('Move stock')}
      description={tr('Total stock stays the same. The move is recorded at both locations.')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {tr('Cancel')}
          </Button>
          <Button onClick={save} disabled={!qty || from === to}>
            {tr('Move')}
          </Button>
        </>
      }
    >
      {live && variant && (
        <div className="flex flex-col gap-4">
          {live.variants.length > 1 && <SelectInput id="tr-variant" label={tr('Variant')} value={vid} onChange={setVid} options={live.variants.map((v) => ({ value: v.id, label: variantLabel(v) }))} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput id="tr-from" label={tr('From')} value={from} onChange={(v) => (setFrom(v), setError(''))} options={locations.map((l) => ({ ...l, label: `${l.label} · ${stockAt(variant, l.value)}` }))} />
            <SelectInput id="tr-to" label={tr('To')} value={to} onChange={(v) => (setTo(v), setError(''))} options={locations.map((l) => ({ ...l, disabled: l.value === from }))} />
          </div>
          <TextInput
            id="tr-qty"
            label={tr('How many?')}
            inputMode="numeric"
            value={qty}
            error={error || undefined}
            hint={tr('At {place}: {n}', { place: nameOf(from), n: stockAt(variant, from) })}
            onChange={(e) => {
              setQty(e.target.value.replace(/[^0-9]/g, '').slice(0, 5));
              setError('');
            }}
          />
        </div>
      )}
    </Dialog>
  );
}
