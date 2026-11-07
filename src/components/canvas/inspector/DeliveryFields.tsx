import React from 'react';
import { Link } from 'react-router-dom';
import type { BlockContentMap, BlockOf } from '../../../types/page';
import { useOptionalCommerce } from '../../../contexts/CommerceContext';
import { useT } from '../../../contexts/LocaleContext';
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

/** Delivery & returns settings (D181): rates from the shop or by hand; returns always in the owner's words. Translated in D304. */
export function DeliveryFields({ block, set, id }: DeliveryFieldsProps) {
  const { t: tr } = useT();
  const c = block.content;
  const f = useOptionalCommerce()?.data.fulfilment;
  const shopSummary = !f
    ? tr('Your shop settings aren’t available here.')
    : [
        f.deliveryEnabled
          ? `${tr('Delivery areas: {n}', { n: f.zones.length })}${f.freeDeliveryOverNgn ? ` · ${tr('free over {amount}', { amount: formatNgn(f.freeDeliveryOverNgn) })}` : ''}`
          : tr('Delivery is off'),
        tr(f.pickupEnabled ? 'pickup on' : 'pickup off'),
      ].join(' · ');

  return (
    <div className="flex flex-col gap-4">
      <TextInput id={id('title')} label={tr('Title')} optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
      <TextArea id={id('intro')} label={tr('Intro')} optional rows={2} value={c.intro} onChange={(e) => set({ intro: e.target.value }, 'intro')} />

      <Field id={id('source')} label={tr('Delivery rates and pickup')}>
        <Segmented
          ariaLabel={tr('Delivery rates and pickup')}
          fullWidth
          value={c.source}
          onChange={(source) => set({ source }, 'source')}
          options={[
            { value: 'shop', label: 'From my shop' },
            { value: 'own', label: 'Write my own' },
          ]}
        />
      </Field>

      {c.source === 'shop' ? (
        <div className="rounded-md bg-sunken px-3 py-2.5">
          <p className="text-caption text-fg">{shopSummary}</p>
          <p className="mt-1 text-caption text-fg-subtle">
            {tr('Uses the same areas, prices and pickup details as checkout, so they always match.')}{' '}
            <Link to="/app/commerce/settings#delivery" className="font-semibold text-action hover:underline">
              {tr('Edit in Commerce → Settings')}
            </Link>
          </p>
        </div>
      ) : (
        <>
          <ItemListEditor
            legend="Delivery areas"
            noun="Area"
            addLabel="Add area"
            max={10}
            items={c.zones}
            onChange={(zones, fld) => set({ zones }, `zones:${fld}`)}
            title={(z) => z.area}
            meta={(z) => (z.area.trim() ? [z.price, z.time].filter(Boolean).join(' · ') || undefined : tr('Needs a name — hidden until added'))}
            create={() => ({ id: uid('dz'), area: '', price: '', time: '' })}
            render={(z, up) => (
              <>
                <TextInput id={id(`${z.id}-area`)} label={tr('Area')} placeholder={tr('e.g. Lagos Mainland')} value={z.area} onChange={(e) => up({ area: e.target.value }, 'area')} />
                <TextInput id={id(`${z.id}-price`)} label={tr('Price')} optional placeholder={tr('e.g. ₦2,500 or Free')} value={z.price} onChange={(e) => up({ price: e.target.value }, 'price')} />
                <TextInput id={id(`${z.id}-time`)} label={tr('Usually takes')} optional placeholder={tr('e.g. 1–2 days')} value={z.time} onChange={(e) => up({ time: e.target.value }, 'time')} />
              </>
            )}
          />
          <TextArea id={id('pickup')} label={tr('Pickup')} optional rows={2} placeholder={tr('e.g. Yaba studio, Mon–Sat 10am–6pm')} value={c.pickup} onChange={(e) => set({ pickup: e.target.value }, 'pickup')} />
        </>
      )}

      <TextArea
        id={id('returns')}
        label={tr('Returns')}
        optional
        rows={3}
        placeholder={tr('e.g. Exchanges within 7 days if unworn with tags. Custom pieces can’t be returned.')}
        hint={tr('Only what you actually do — visitors may hold you to it.')}
        value={c.returns}
        onChange={(e) => set({ returns: e.target.value }, 'returns')}
      />
      <TextInput id={id('note')} label={tr('Small print')} optional placeholder={tr('e.g. Waybill outside Lagos is paid on arrival')} value={c.note} onChange={(e) => set({ note: e.target.value }, 'note')} />
    </div>
  );
}
