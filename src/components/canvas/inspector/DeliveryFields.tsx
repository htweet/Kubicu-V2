import React from 'react';
import { Link } from 'react-router-dom';
import type { BlockContentMap, BlockOf } from '../../../types/page';
import { useOptionalCommerce } from '../../../contexts/CommerceContext';
import { uid } from '../../../utils/id';
import { formatNgn } from '../../../utils/format';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { Segmented } from '../../ui/Segmented';
import { Field } from '../../ui/Field';
import { ItemListEditor } from './ItemListEditor';

interface DeliveryFieldsProps {
  block: BlockOf<'delivery'>;
  set: (patch: Partial<BlockContentMap['delivery']>, field: string) => void;
  id: (field: string) => string;
}

/** Delivery & returns settings (D181): rates from the shop or by hand; returns always in the owner's words. */
export function DeliveryFields({ block, set, id }: DeliveryFieldsProps) {
  const c = block.content;
  const f = useOptionalCommerce()?.data.fulfilment;
  const shopSummary = !f ?
  'Your shop settings aren’t available here.' :
  [
  f.deliveryEnabled ? `${f.zones.length} delivery ${f.zones.length === 1 ? 'area' : 'areas'}${f.freeDeliveryOverNgn ? `, free over ${formatNgn(f.freeDeliveryOverNgn)}` : ''}` : 'Delivery is off',
  f.pickupEnabled ? 'pickup on' : 'pickup off'].
  join(' · ');

  return (
    <div className="flex flex-col gap-4">
      <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
      <TextArea id={id('intro')} label="Intro" optional rows={2} value={c.intro} onChange={(e) => set({ intro: e.target.value }, 'intro')} />

      <Field id={id('source')} label="Delivery rates and pickup">
        <Segmented
          ariaLabel="Delivery rates and pickup"
          fullWidth
          value={c.source}
          onChange={(source) => set({ source }, 'source')}
          options={[
          { value: 'shop', label: 'From my shop' },
          { value: 'own', label: 'Write my own' }]
          } />
        
      </Field>

      {c.source === 'shop' ?
      <div className="rounded-md bg-sunken px-3 py-2.5">
          <p className="text-caption text-fg">{shopSummary}</p>
          <p className="mt-1 text-caption text-fg-subtle">
            Uses the same areas, prices and pickup details as checkout, so they always match.{' '}
            <Link to="/app/commerce/settings#delivery" className="font-semibold text-action hover:underline">
              Edit in Commerce → Settings
            </Link>
          </p>
        </div> :

      <>
          <ItemListEditor
          legend="Delivery areas"
          noun="Area"
          addLabel="Add area"
          max={10}
          items={c.zones}
          onChange={(zones, fld) => set({ zones }, `zones:${fld}`)}
          title={(z) => z.area}
          meta={(z) => z.area.trim() ? [z.price, z.time].filter(Boolean).join(' · ') || undefined : 'Needs a name — hidden until added'}
          create={() => ({ id: uid('dz'), area: '', price: '', time: '' })}
          render={(z, up) =>
          <>
                <TextInput id={id(`${z.id}-area`)} label="Area" placeholder="e.g. Lagos Mainland" value={z.area} onChange={(e) => up({ area: e.target.value }, 'area')} />
                <TextInput id={id(`${z.id}-price`)} label="Price" optional placeholder="e.g. ₦2,500 or Free" value={z.price} onChange={(e) => up({ price: e.target.value }, 'price')} />
                <TextInput id={id(`${z.id}-time`)} label="Usually takes" optional placeholder="e.g. 1–2 days" value={z.time} onChange={(e) => up({ time: e.target.value }, 'time')} />
              </>
          } />
        
          <TextArea id={id('pickup')} label="Pickup" optional rows={2} placeholder="e.g. Yaba studio, Mon–Sat 10am–6pm" value={c.pickup} onChange={(e) => set({ pickup: e.target.value }, 'pickup')} />
        </>
      }

      <TextArea
        id={id('returns')}
        label="Returns"
        optional
        rows={3}
        placeholder="e.g. Exchanges within 7 days if unworn with tags. Custom pieces can’t be returned."
        hint="Only what you actually do — visitors may hold you to it."
        value={c.returns}
        onChange={(e) => set({ returns: e.target.value }, 'returns')} />
      
      <TextInput id={id('note')} label="Small print" optional placeholder="e.g. Waybill outside Lagos is paid on arrival" value={c.note} onChange={(e) => set({ note: e.target.value }, 'note')} />
    </div>);

}