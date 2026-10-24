import React, { useState } from 'react';
import { LayersIcon, LockIcon, MonitorIcon, PenToolIcon, SmartphoneIcon } from 'lucide-react';
import type { ExamplePage } from '../../data/examples/build';
import { goalLabels } from '../../data/examples';
import { templatePrice } from '../../data/templateMarket';
import { plans } from '../../data/plans';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Segmented } from '../ui/Segmented';
import { TemplateThumb } from './TemplateThumb';
import { formatNaira as formatNgn } from '../../utils/format';

interface Props {
  template: ExamplePage | null;
  owned: boolean;
  canEdit: boolean;
  onClose: () => void;
  onApply: (t: ExamplePage) => void;
  onNewSpace: (t: ExamplePage) => void;
  onBuy: (t: ExamplePage) => void;
  /** Creator credit, reviews and refund for creator templates (D70). */
  extra?: React.ReactNode;
}

/** Full-page preview on phone or desktop, then apply to this page or start a campaign with it (D67). */
export function TemplatePreviewSheet({ template, owned, canEdit, onClose, onApply, onNewSpace, onBuy, extra }: Props) {
  const [device, setDevice] = useState<'phone' | 'desktop'>('phone');
  if (!template) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;
  const price = templatePrice(template.id);
  const locked = price > 0 && !owned;

  return (
    <Sheet
      open={!!template}
      onClose={onClose}
      side="right"
      size="lg"
      title={template.category}
      description={`${template.name} · ${template.city} — ${template.bestFor}`}
      footer={
      locked ?
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-caption text-fg-muted">Premium · {formatNgn(price)} once, for this workspace</span>
            <Button leadingIcon={LockIcon} onClick={() => onBuy(template)}>
              Buy for {formatNgn(price)}
            </Button>
          </div> :

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" leadingIcon={LayersIcon} disabled={!canEdit} onClick={() => onNewSpace(template)}>
              Use on a new campaign
            </Button>
            <Button leadingIcon={PenToolIcon} disabled={!canEdit} onClick={() => onApply(template)}>
              Apply to my main page
            </Button>
          </div>

      }>
      
      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {price > 0 ? <Badge tone="accent">{owned ? `${formatNgn(price)} · owned` : 'Premium'}</Badge> : <Badge tone="neutral">Free</Badge>}
            {template.goals.map((g) =>
            <Badge key={g} tone="neutral">
                {goalLabels[g]}
              </Badge>
            )}
          </div>
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
        <div className="flex justify-center overflow-hidden rounded-lg py-6" style={{ background: device === 'desktop' ? template.doc.theme.background : undefined }}>
          <div className={device === 'phone' ? 'overflow-hidden rounded-[28px] border-[6px] border-inverse' : 'overflow-hidden rounded-md'}>
            <TemplateThumb doc={template.doc} width={device === 'phone' ? 280 : 420} height={device === 'phone' ? 560 : 520} />
          </div>
        </div>
        <p className="text-label text-fg">{template.description}</p>
        <p className="text-caption text-fg-muted">
          Applying keeps your name, photo, products, links and contact details, and removes the example’s prices, links and quotes. Best on {plans[template.plan].name} or above. Undo any time from version history.
        </p>
        {extra}
      </div>
    </Sheet>);

}