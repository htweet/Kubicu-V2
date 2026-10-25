import React, { useEffect, useState } from 'react';
import { EyeIcon, LockIcon, MonitorIcon, SmartphoneIcon } from 'lucide-react';
import type { ExamplePage } from '../../data/examples/build';
import { templatePrice } from '../../data/templateMarket';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { TemplateLivePreview } from './TemplateLivePreview';
import { formatNaira as formatNgn } from '../../utils/format';

interface TemplatePreviewDialogProps {
  template: ExamplePage | null;
  onClose: () => void;
  /** Label for the main action, e.g. "Use this layout" or "Choose this starting point". */
  useLabel: string;
  onUse: (t: ExamplePage) => void;
  /** When set and the template is paid and not owned, the main action becomes "Buy for ₦X". */
  onBuy?: (t: ExamplePage) => void;
}

/** Preview any template in full — every section, phone or desktop — before buying or using it (D155). */
export function TemplatePreviewDialog({ template, onClose, useLabel, onUse, onBuy }: TemplatePreviewDialogProps) {
  const market = useMarketplace();
  const [device, setDevice] = useState<'phone' | 'desktop'>('phone');
  useEffect(() => setDevice('phone'), [template?.id]);
  const price = template ? templatePrice(template.id) : 0;
  const locked = !!template && !!onBuy && price > 0 && !market.hasLicence(template.id);

  return (
    <Dialog
      open={!!template}
      onClose={onClose}
      size="lg"
      title={template ? `Preview: ${template.name}` : ''}
      description={template ? `${template.bestFor}. Sample business — prices, links and quotes are removed when you use it.` : ''}
      footer={
      template &&
      <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-caption text-fg-muted">{price > 0 ? locked ? `${formatNgn(price)} once, for this workspace · preview is free` : `${formatNgn(price)} · owned` : 'Free'}</span>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button variant="secondary" onClick={onClose}>
                Keep browsing
              </Button>
              {locked ?
          <Button leadingIcon={LockIcon} onClick={() => onBuy!(template)}>
                  Buy for {formatNgn(price)}
                </Button> :

          <Button onClick={() => onUse(template)} data-autofocus>
                  {useLabel}
                </Button>
          }
            </div>
          </div>

      }>
      
      {template &&
      <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-label text-fg-muted">{template.description}</p>
            <Segmented<'phone' | 'desktop'>
            ariaLabel="Preview size"
            size="sm"
            value={device}
            onChange={setDevice}
            options={[
            { value: 'phone', label: 'Phone', icon: SmartphoneIcon },
            { value: 'desktop', label: 'Desktop', icon: MonitorIcon }]
            } />
          
          </div>
          <div className="rounded-lg bg-sunken p-3 sm:p-5">
            <TemplateLivePreview doc={template.doc} plan={template.plan} device={device} name={template.name} height={560} />
          </div>
        </div>
      }
    </Dialog>);

}

/** Small "Preview" button used under template cards. */
export function PreviewTemplateButton({ name, onClick }: {name: string;onClick: () => void;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Preview the ${name} template`}
      className="inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-caption font-semibold text-action transition-colors duration-150 hover:bg-action-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
      
      <EyeIcon size={14} aria-hidden /> Preview
    </button>);

}