import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, CheckCircle2Icon, HandshakeIcon } from 'lucide-react';
import type { Product, ProductBundle } from '../../types/commerce';
import type { Partnership } from '../../types/partnership';
import { formatNgn } from '../../utils/format';
import { GUEST_FEE_RATE, partnerUnitNgn } from '../../utils/commerce/bundles';
import { Switch } from '../ui/Switch';
import { SelectInput } from '../ui/SelectInput';
import { TextInput } from '../ui/TextInput';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Segmented } from '../ui/Segmented';
import { Button } from '../ui/Button';
import { InlineAlert } from '../ui/InlineAlert';
import { SplitExplainer } from '../partners/SplitExplainer';

interface ProductBundleFieldProps {
  product: Product;
  onChange: (patch: Partial<Product>) => void;
  leadName: string;
  partnerships: Partnership[];
  error?: string | null;
  disabled?: boolean;
}

/** "Sold with a partner" (D122): turns a product into a partner bundle with its own split. */
export function ProductBundleField({ product, onChange, leadName, partnerships, error, disabled }: ProductBundleFieldProps) {
  const b = product.bundle;
  const usable = partnerships.filter((p) => p.status === 'active' || p.status === 'ending');
  const current = b ? partnerships.find((p) => p.id === b.partnershipId) : undefined;
  const conflict = product.madeToOrder ? 'Turn off “Made to order” first — deposits can’t be split between two businesses.' : product.instalments ? 'Turn off instalments first — later parts can’t be split between two businesses.' : null;

  const setBundle = (patch: Partial<ProductBundle>) => b && onChange({ bundle: { ...b, ...patch } });
  const start = (p: Partnership) =>
    onChange({
      bundle: {
        partnershipId: p.id,
        partnerName: p.partner.name,
        partnerKind: p.kind,
        partnerPart: b?.partnershipId === p.id ? b.partnerPart : '',
        split: 'agreement',
        leadSharePct: p.agreement.leadSharePct,
      },
    });

  const price = product.priceNgn ?? 0;
  const theirs = b && price ? partnerUnitNgn(b, price) : 0;
  const leadPct = b ? (b.split === 'agreement' ? b.leadSharePct : price ? Math.round(((price - theirs) / price) * 100) : b.leadSharePct) : 60;

  return (
    <div className="flex flex-col gap-5">
      <Switch
        id="prd-bundle"
        label="Sell this together with a partner"
        description="One product, one checkout. Each business’s share is split off the moment the customer pays."
        checked={!!b}
        disabled={disabled || (!b && (!usable.length || !!conflict))}
        onChange={(on) => (on ? usable[0] && start(usable[0]) : onChange({ bundle: undefined }))}
      />

      {!b && !usable.length && (
        <p className="flex flex-wrap items-center gap-1.5 text-caption text-fg-muted">
          <HandshakeIcon size={13} aria-hidden /> You need an active business partner first.
          <Link to="/app/collaborations" className="inline-flex items-center gap-0.5 font-semibold text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            Start a partnership <ArrowUpRightIcon size={12} aria-hidden />
          </Link>
        </p>
      )}
      {!b && usable.length > 0 && conflict && <p className="text-caption text-fg-muted">{conflict}</p>}

      {b && (
        <>
          {error && <InlineAlert tone="danger" title={error} />}
          {current && current.status === 'ending' && <InlineAlert tone="warning" title={`This partnership is ending`}>Sales stop when it ends. Money already paid still settles normally.</InlineAlert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput<string>
              id="prd-bundle-partner"
              label="Partner"
              value={b.partnershipId}
              onChange={(id) => {
                const p = partnerships.find((x) => x.id === id);
                if (p) start(p);
              }}
              options={[...(current && !usable.includes(current) ? [{ value: current.id, label: `${current.partner.name} (not active)` }] : []), ...usable.map((p) => ({ value: p.id, label: `${p.partner.name}${p.kind === 'guest' ? ' · guest' : ''}` }))]}
            />
            <TextInput id="prd-bundle-part" label={`What ${b.partnerName} provides`} optional placeholder="e.g. Gele tying on the day" value={b.partnerPart} maxLength={60} hint="Shown to buyers on the product." onChange={(e) => setBundle({ partnerPart: e.target.value })} />
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-label font-medium text-fg">How the money is split</p>
            <Segmented
              ariaLabel="How the money is split"
              value={b.split}
              onChange={(split) => setBundle({ split, partnerAcceptedAt: undefined, partnerFixedNgn: split === 'fixed' ? b.partnerFixedNgn ?? (price ? partnerUnitNgn({ ...b, split: 'agreement' }, price) : undefined) : undefined })}
              options={[
                { value: 'agreement', label: `Agreed split · ${b.leadSharePct}/${100 - b.leadSharePct}` },
                { value: 'fixed', label: 'Exact amount' },
              ]}
            />
            {b.split === 'agreement' ? (
              <p className="text-caption text-fg-muted">Uses the split you both accepted in your partnership. If either of you changes it there, new sales follow the new split once it’s accepted.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <CurrencyInput
                  id="prd-bundle-fixed"
                  label={`${b.partnerName} gets for each one sold`}
                  value={b.partnerFixedNgn ?? null}
                  hint={price ? `You keep ${formatNgn(Math.max(0, price - (b.partnerFixedNgn ?? 0)))} of the ${formatNgn(price)} price, before discounts and fees.` : 'Add a price first to see what you keep.'}
                  onChange={(v) => setBundle({ partnerFixedNgn: v ?? undefined, partnerAcceptedAt: undefined })}
                />
                {b.partnerAcceptedAt ? (
                  <p className="flex items-center gap-1.5 text-caption font-medium text-success">
                    <CheckCircle2Icon size={14} aria-hidden /> {b.partnerName} accepted this amount
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 rounded-md border border-warning/40 bg-warning-soft/40 p-3">
                    <p className="text-caption text-fg">An exact amount needs {b.partnerName} to accept it before the product can be active. Changing the amount asks them again.</p>
                    <Button size="sm" variant="secondary" className="self-start" disabled={!b.partnerFixedNgn} onClick={() => setBundle({ partnerAcceptedAt: new Date().toISOString() })}>
                      Accept as {b.partnerName} (prototype)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {b.partnerKind === 'connected' ? (
            <Switch id="prd-bundle-escrow" label={`Hold ${b.partnerName}’s share in escrow until delivery`} description="Their share is released when the buyer confirms, or when the checking time ends. Your own share follows your Payments settings." checked={!!b.partnerEscrow} onChange={(partnerEscrow) => setBundle({ partnerEscrow })} />
          ) : (
            <p className="text-caption text-fg-muted">
              {b.partnerName} is a guest partner: their share is sent to their bank once delivery is confirmed, after a {Math.round(GUEST_FEE_RATE * 100)}% KUBICU fee.
            </p>
          )}

          <SplitExplainer leadName={leadName} partnerName={b.partnerName} leadSharePct={leadPct} exampleNgn={price || 100_000} viewer="lead" compact />
          <p className="text-caption text-fg-subtle">Pay on delivery and instalments aren’t offered on this product, because they can’t be split between two businesses.</p>
        </>
      )}
    </div>
  );
}
