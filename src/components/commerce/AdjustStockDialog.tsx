import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Product, StockReason } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { moveStock } from '../../utils/commerce/ops';
import { variantLabel } from '../../utils/commerce/catalog';
import { addBatch, formatExpiry, todayIso } from '../../utils/commerce/batches';
import { locationName } from '../../utils/commerce/branches';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { Field } from '../ui/Field';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { useT } from '../../contexts/LocaleContext';

type Mode = 'received' | 'correction' | 'damaged';

interface AdjustStockDialogProps {
  product: Product | null;
  variantId?: string;
  /** Opens straight on a write-off of one batch, e.g. expired stock (D476). */
  initialMode?: Mode;
  initialBatchId?: string;
  onClose: () => void;
}

/** Receive new stock, correct a count or write off damage — always with a reason. */
export function AdjustStockDialog({ product, variantId, initialMode, initialBatchId, onClose }: AdjustStockDialogProps) {
  const { apply, data } = useCommerce();
  const { t: tr } = useT();
  const [mode, setMode] = useState<Mode>('received');
  const [vid, setVid] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);
  // Batches and expiry (D476): optional when receiving; write-offs can name the batch.
  const [lot, setLot] = useState('');
  const [expiresOn, setExpiresOn] = useState('');
  const [batchId, setBatchId] = useState('');

  useEffect(() => {
    if (!product) return;
    setMode(initialMode ?? 'received');
    setVid(variantId ?? product.variants[0]?.id ?? '');
    setAmount('');
    setNote('');
    setLot('');
    setExpiresOn('');
    setBatchId(initialBatchId ?? '');
    setTried(false);
  }, [product, variantId, initialMode, initialBatchId]);

  const variant = product?.variants.find((v) => v.id === vid);
  const batches = variant?.batches ?? [];
  const chosenBatch = batches.find((b) => b.id === batchId);
  const n = Number(amount);
  const valid = amount !== '' && Number.isInteger(n) && n >= 0 && (mode !== 'correction' || n !== variant?.stock) && (mode === 'correction' || n > 0);
  const cap = mode === 'damaged' && chosenBatch ? chosenBatch.qty : variant?.stock ?? 0;
  const delta = !variant ? 0 : mode === 'received' ? n : mode === 'damaged' ? -Math.min(n, cap) : n - variant.stock;
  const after = variant ? Math.max(0, variant.stock + delta) : 0;
  const reasonNeeded = mode !== 'received' && !note.trim();
  const expiryError = mode === 'received' && expiresOn && expiresOn < todayIso() ? tr('This date has passed — check the label') : undefined;

  const save = () => {
    setTried(true);
    if (!product || !variant || !valid || reasonNeeded || expiryError) return;
    const reason: StockReason = mode;
    const batchNote = mode === 'received' && (lot.trim() || expiresOn) ? [lot.trim() && `Batch ${lot.trim()}`, expiresOn && `expires ${formatExpiry(expiresOn)}`].filter(Boolean).join(', ') : mode === 'damaged' && chosenBatch ? `Batch ${chosenBatch.code || formatExpiry(chosenBatch.expiresOn ?? '')}` : '';
    const fullNote = [note.trim(), batchNote].filter(Boolean).join(' · ');
    const ok = apply((d) => {
      const moved = moveStock(d, product.id, variant.id, delta, reason, fullNote, undefined, mode === 'damaged' ? chosenBatch?.branchId : undefined, mode === 'damaged' && chosenBatch ? chosenBatch.id : undefined);
      if (mode !== 'received' || (!lot.trim() && !expiresOn)) return moved;
      return { ...moved, products: moved.products.map((p) => (p.id === product.id ? { ...p, variants: p.variants.map((v) => (v.id === variant.id ? addBatch(v, lot, expiresOn || null, n) : v)) } : p)) };
    });
    if (ok) {
      toast(`Stock updated: ${variant.stock} → ${after}`, { description: `${product.name}${Object.keys(variant.options).length ? ` · ${variantLabel(variant)}` : ''}` });
      onClose();
    }
  };

  return (
    <Dialog
      open={!!product}
      onClose={onClose}
      size="sm"
      title={`Adjust stock${product ? ` · ${product.name}` : ''}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </>
      }
    >
      {product && (
        <div className="flex flex-col gap-4">
          {product.variants.length > 1 && (
            <SelectInput id="adj-variant" label="Variant" value={vid} onChange={setVid} options={product.variants.map((v) => ({ value: v.id, label: `${variantLabel(v)} · ${v.stock} in stock` }))} />
          )}
          <Field id="adj-mode" label="What happened?">
            <Segmented<Mode>
              ariaLabel="Adjustment type"
              fullWidth
              value={mode}
              onChange={(m) => {
                setMode(m);
                setAmount('');
              }}
              options={[
                { value: 'received', label: 'Received' },
                { value: 'correction', label: 'Recount' },
                { value: 'damaged', label: 'Damaged' },
              ]}
            />
          </Field>
          <TextInput
            id="adj-amount"
            label={mode === 'received' ? 'How many arrived?' : mode === 'damaged' ? 'How many to write off?' : 'Actual count on hand'}
            inputMode="numeric"
            value={amount}
            error={tried && !valid ? (mode === 'correction' ? 'Enter a count different from the current one' : 'Enter a whole number above 0') : undefined}
            hint={variant ? `Now ${variant.stock}${amount !== '' && valid ? ` → ${after} after saving` : ''}` : undefined}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          />
          {mode === 'received' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput id="adj-lot" label={tr('Batch or lot number')} optional placeholder="L2611-04" value={lot} onChange={(e) => setLot(e.target.value.slice(0, 30))} />
              <TextInput id="adj-expiry" label={tr('Expiry date')} optional type="date" min={todayIso()} value={expiresOn} error={tried ? expiryError : undefined} onChange={(e) => setExpiresOn(e.target.value)} />
            </div>
          )}
          {mode === 'received' && <p className="-mt-2 text-caption text-fg-subtle">{tr('For food, cosmetics and medicines. Sales use the batch that expires soonest first.')}</p>}
          {mode === 'damaged' && batches.length > 0 && (
            <SelectInput
              id="adj-batch"
              label={tr('Which batch?')}
              value={batchId}
              onChange={setBatchId}
              options={[
                { value: '', label: tr('Soonest to expire first') },
                ...batches.map((b) => ({
                  value: b.id,
                  label: [b.code || tr('No batch number'), b.expiresOn ? tr('Expires {date}', { date: formatExpiry(b.expiresOn) }) : '', tr('Units: {n}', { n: b.qty }), b.branchId ? locationName(data, b.branchId) : ''].filter(Boolean).join(' · '),
                })),
              ]}
            />
          )}
          <TextInput
            id="adj-note"
            label="Reason"
            optional={mode === 'received'}
            placeholder={mode === 'received' ? 'e.g. New batch from tailor' : mode === 'damaged' ? 'e.g. Stain on the hem' : 'e.g. Counted at the studio'}
            value={note}
            error={tried && reasonNeeded ? 'Add a short reason for your records' : undefined}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      )}
    </Dialog>
  );
}
