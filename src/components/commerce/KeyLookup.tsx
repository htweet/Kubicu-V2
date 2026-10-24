import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';
import { useCommerce } from '../../contexts/CommerceContext';
import { findKey } from '../../utils/commerce/licence';
import { formatTimestamp } from '../../utils/format';
import { TextInput } from '../ui/TextInput';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Section } from '../ui/layout/Section';

/** Check a licence key a customer sends you (D125): whose it is, and whether it still works. */
export function KeyLookup() {
  const { data } = useCommerce();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const issued = data.orders.reduce((n, o) => n + (o.licenceKeys?.length ?? 0), 0);
  if (issued === 0 && !data.products.some((p) => p.digital?.keys?.enabled)) return null;
  const hit = findKey(data, q);
  const name = hit ? hit.order.items.find((i) => i.productId === hit.key.productId)?.name : '';

  return (
    <Section id="keys" title="Check a licence key" description={`${issued} key${issued === 1 ? '' : 's'} issued. Paste one a customer sent you.`}>
      <TextInput id="key-lookup" label="Licence key" value={q} placeholder="e.g. ADAZ-7K2Q-M4XP-9WTR" onChange={(e) => setQ(e.target.value.toUpperCase())} />
      {q.trim().length >= 4 &&
      <div className="mt-3 rounded-md border border-line px-3 py-3" role="status">
          {hit ?
        <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-label font-semibold text-fg">{hit.order.customer.name}</span>
                <Badge tone={hit.key.status === 'active' ? 'success' : 'neutral'}>{hit.key.status === 'active' ? 'Valid' : 'Revoked'}</Badge>
              </div>
              <span className="text-caption text-fg-muted">{name} · order #{hit.order.number} · issued {formatTimestamp(hit.key.issuedAt)}</span>
              <span className="text-caption text-fg-muted">{hit.key.activations} of {hit.key.activationsAllowed} devices used</span>
              <Button size="sm" variant="secondary" className="mt-1 self-start" onClick={() => navigate(`/app/commerce/orders?order=${hit.order.id}`)}>Open order</Button>
            </div> :

        <p className="flex items-center gap-2 text-label text-fg-muted"><SearchIcon size={14} aria-hidden /> No key matches. It may be mistyped or not from your shop.</p>
        }
        </div>
      }
    </Section>);

}