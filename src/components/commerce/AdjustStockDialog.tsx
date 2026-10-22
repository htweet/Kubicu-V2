import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Product, StockReason } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { moveStock } from '../../utils/commerce/ops';
import { variantLabel } from '../../utils/commerce/catalog';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { Field } from '../ui/Field';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';

type Mode = 'received' | 'correction' | 'damaged';

interface AdjustStockDialogProps {
  product: Product | null;
  variantId?: string;
  onClose: () => void;
}

/** Receive new stock, correct a count or write off damage — always with a reason. */
export function AdjustStockDialog({ product, variantId, onClose }: AdjustStockDialogProps) {
  const { apply } = useCommerce();
  const [mode, setMode] = useState<Mode>('received');
  const [vid, setVid] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!product) return;
    setMode('received');
    setVid(variantId ?? product.variants[0]?.id ?? '');
    setAmount('');
    setNote('');
    setTried(false);
  }, [product, variantId]);

  const variant = product?.variants.find((v) => v.id === vid);
  const n = Number(amount);
  const valid = amount !== '' && Number.isInteger(n) && n >= 0 && (mode !== 'correction' || n !== variant?.stock) && (mode === 'correction' || n > 0);
  const delta = !variant ? 0 : mode === 'received' ? n : mode === 'damaged' ? -Math.min(n, variant.stock) : n - variant.stock;
  const after = variant ? Math.max(0, variant.stock + delta) : 0;
  const reasonNeeded = mode !== 'received' && !note.trim();

  const save = () => {
    setTried(true);
    if (!product || !variant || !valid || reasonNeeded) return;
    const reason: StockReason = mode;
    if (apply((d) => moveStock(d, product.id, variant.id, delta, reason, note.trim()))) {
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
      }>
      
      {product &&
      <div className="flex flex-col gap-4">
          {product.variants.length > 1 &&
        <SelectInput id="adj-variant" label="Variant" value={vid} onChange={setVid} options={product.variants.map((v) => ({ value: v.id, label: `${variantLabel(v)} · ${v.stock} in stock` }))} />
        }
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
            { value: 'damaged', label: 'Damaged' }]
            } />
          
          </Field>
          <TextInput
          id="adj-amount"
          label={mode === 'received' ? 'How many arrived?' : mode === 'damaged' ? 'How many to write off?' : 'Actual count on hand'}
          inputMode="numeric"
          value={amount}
          error={tried && !valid ? mode === 'correction' ? 'Enter a count different from the current one' : 'Enter a whole number above 0' : undefined}
          hint={variant ? `Now ${variant.stock}${amount !== '' && valid ? ` → ${after} after saving` : ''}` : undefined}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} />
        
          <TextInput
          id="adj-note"
          label="Reason"
          optional={mode === 'received'}
          placeholder={mode === 'received' ? 'e.g. New batch from tailor' : mode === 'damaged' ? 'e.g. Stain on the hem' : 'e.g. Counted at the studio'}
          value={note}
          error={tried && reasonNeeded ? 'Add a short reason for your records' : undefined}
          onChange={(e) => setNote(e.target.value)} />
        
        </div>
      }
    </Dialog>);

}