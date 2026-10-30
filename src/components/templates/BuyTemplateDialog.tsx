import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog } from '../ui/Dialog';
import { PaymentStep } from '../billing/PaymentStep';
import { TemplateThumb } from './TemplateThumb';
import { useBilling } from '../../contexts/BillingContext';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTeam } from '../../contexts/TeamContext';
import { useT } from '../../contexts/LocaleContext';
import type { ExamplePage } from '../../data/examples/build';
import { templatePrice } from '../../data/templateMarket';
import { withVat } from '../../utils/billing';
import { formatNaira as formatNgn } from '../../utils/format';
import { creatorShare, findListing, updateTemplateStore } from '../../utils/templateListings';
import { uid } from '../../utils/id';

/** One-off premium template purchase; licence for this workspace (D67). Translated in D315; the invoice line stays English. */
export function BuyTemplateDialog({ template, onClose, onBought }: {template: ExamplePage | null;onClose: () => void;onBought?: (t: ExamplePage) => void;}) {
  const { t: tr } = useT();
  const billing = useBilling();
  const market = useMarketplace();
  const { current } = useWorkspace();
  const can = useTeam().can('billing.manage');
  const [key, setKey] = useState(0);
  useEffect(() => setKey((k) => k + 1), [template?.id]);
  if (!template) return <Dialog open={false} onClose={onClose} title="" />;
  const price = templatePrice(template.id);
  const total = withVat(price).total;

  return (
    <Dialog
      open={!!template}
      onClose={onClose}
      title={tr('Buy this template: {name}', { name: tr(template.category) })}
      description={tr('{price} + VAT, once. Use it on any space in {workspace}.', { price: formatNgn(price), workspace: current.name })}>
      
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="shrink-0 self-center overflow-hidden rounded-[14px]">
          <TemplateThumb doc={template.doc} width={120} height={180} />
        </div>
        <div className="min-w-0 flex-1">
          {can.allowed ?
          <PaymentStep
            key={key}
            payLabel={tr('Pay {amount}', { amount: formatNgn(total) })}
            savedCard={billing.data.card}
            defaultHolder={current.ownerName}
            onPaid={(card) => {
              const listing = findListing(template.id);
              billing.charge([{ label: listing ? `Template by ${listing.creatorName}: ${listing.name}` : `Premium template: ${template.category} (${template.name})`, amountNgn: price }], card);
              market.addLicence(template.id);
              // Creator templates (D70): record the sale with the version bought; the creator earns their share.
              if (listing?.listedDoc) {
                const doc = listing.listedDoc;
                updateTemplateStore((s) => ({
                  ...s,
                  sales: [{ id: uid('sale'), listingId: listing.id, buyerWorkspaceId: current.id, buyerName: current.name, priceNgn: price, creatorShareNgn: creatorShare(price), version: listing.listedVersion, doc, at: new Date().toISOString(), refundedAt: null }, ...s.sales]
                }));
              }
              toast.success(tr('Template bought'), { description: tr('It’s yours for this workspace. The invoice is in Plan & billing.') });
              onBought?.(template);
              onClose();
            }} /> :


          <p className="text-label text-fg-muted">
              {tr(can.reason ?? '')} {tr('Ask the Owner to buy it.')}
            </p>
          }
        </div>
      </div>
    </Dialog>);

}