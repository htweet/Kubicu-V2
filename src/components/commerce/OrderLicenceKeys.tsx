import React, { useState } from 'react';
import { KeyRoundIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Order } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { ensureLicenceKeys, reissueKey, revokeKey } from '../../utils/commerce/licence';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';

/** Licence keys on an order (D125): see, revoke or replace. Issues missing keys on request. */
export function OrderLicenceKeys({ order }: {order: Order;}) {
  const commerce = useCommerce();
  const [confirm, setConfirm] = useState<{id: string;action: 'revoke' | 'reissue';} | null>(null);
  const keyed = order.items.filter((i) => i.kind === 'digital' && commerce.data.products.find((p) => p.id === i.productId)?.digital?.keys?.enabled);
  if (keyed.length === 0 && !(order.licenceKeys ?? []).length) return null;
  const keys = order.licenceKeys ?? [];
  const missing = keyed.some((i) => !keys.some((k) => k.productId === i.productId));
  const nameOf = (pid: string) => order.items.find((i) => i.productId === pid)?.name ?? 'Product';

  const run = () => {
    if (!confirm) return;
    const ok = commerce.apply((d) => confirm.action === 'revoke' ? revokeKey(d, order.id, confirm.id) : reissueKey(d, order.id, confirm.id));
    if (ok) toast.success(confirm.action === 'revoke' ? 'Key revoked' : 'New key issued', { description: confirm.action === 'reissue' ? 'It shows on the buyer’s download page. Send it to them on WhatsApp.' : 'It stops working straight away.' });
    setConfirm(null);
  };

  return (
    <div className="mt-3 flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-caption font-semibold text-fg-subtle"><KeyRoundIcon size={12} aria-hidden /> Licence keys</p>
      {keys.map((k) =>
      <div key={k.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-3 py-2">
          <div className="min-w-0">
            <code className={`block font-mono text-label font-semibold ${k.status === 'revoked' ? 'text-fg-subtle line-through' : 'text-fg'}`}>{k.key}</code>
            <span className="text-caption text-fg-muted">{nameOf(k.productId)} · {k.status === 'revoked' ? 'Revoked' : `${k.activations} of ${k.activationsAllowed} devices`}</span>
          </div>
          {k.status === 'active' &&
        <div className="flex gap-1">
              <Button size="sm" variant="tertiary" onClick={() => setConfirm({ id: k.id, action: 'reissue' })}>Replace</Button>
              <Button size="sm" variant="tertiary" onClick={() => setConfirm({ id: k.id, action: 'revoke' })}>Revoke</Button>
            </div>
        }
        </div>
      )}
      {missing &&
      <Button size="sm" variant="secondary" className="self-start" disabled={order.paymentStatus === 'pending'} onClick={() => commerce.apply((d) => ensureLicenceKeys(d, order.id)) && toast.success('Keys issued')}>
          {order.paymentStatus === 'pending' ? 'Keys issue after payment' : 'Issue keys now'}
        </Button>
      }
      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        size="sm"
        title={confirm?.action === 'revoke' ? 'Revoke this key?' : 'Replace this key?'}
        description={confirm?.action === 'revoke' ? 'It stops working on every device. Use this for refunds or misuse.' : 'The old key stops working and the buyer gets a new one with the same number of devices — useful if a key was shared.'}
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant={confirm?.action === 'revoke' ? 'destructive' : 'primary'} onClick={run}>{confirm?.action === 'revoke' ? 'Revoke key' : 'Issue new key'}</Button>
          </>
        } />
      
    </div>);

}