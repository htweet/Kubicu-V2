import React from 'react';
import { DicesIcon } from 'lucide-react';
import { kitTones, type KitDetails, type KitField, type KitImage, type KitItemSpec, type KitTone } from '../../utils/domains/printKit';
import { voucherCode } from '../../utils/domains/printKitAi';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { RangeInput } from '../ui/RangeInput';
import { KitImageField } from './KitImageField';

interface KitContentFieldsProps {
  spec: KitItemSpec;
  details: KitDetails;
  set: (patch: Partial<KitDetails>) => void;
  onPhoto: (dataUrl: string | null, px?: number) => void;
  nameError?: string;
  disabled?: boolean;
}

const labels: Record<KitField, { label: string; placeholder?: string; max: number; hint?: string }> = {
  line: { label: 'Tagline', placeholder: 'e.g. Bespoke Ankara tailoring', max: 48, hint: 'What you do, in a few words' },
  social: { label: 'Instagram or TikTok', placeholder: '@yourhandle', max: 32 },
  email: { label: 'Email', placeholder: 'hello@yourbusiness.com', max: 48 },
  headline: { label: 'Headline', placeholder: 'e.g. Now booking for December', max: 60 },
  offer: { label: 'Offer or value', placeholder: 'e.g. ₦5,000 or Free gele tying', max: 24, hint: 'Your own offer — we never suggest one' },
  code: { label: 'Voucher code', placeholder: 'e.g. ADUNNI-7K2Q', max: 16 },
  expiry: { label: 'Valid until', placeholder: 'e.g. 31 Dec 2026', max: 24 },
  signer: { label: 'Signed by', placeholder: 'e.g. Adunni, founder', max: 40 },
  message: { label: 'Message', max: 240 },
  reward: { label: 'Reward for a full card', placeholder: 'e.g. Free wash & set', max: 28, hint: 'Your own reward — we never suggest one' },
  note: { label: 'Note on the parcel', placeholder: 'e.g. Fragile — handle with care', max: 40, hint: 'Printed in a box riders can’t miss' },
};

const required: KitField[] = ['offer', 'reward'];

/** Words, contacts, images and image sizing for the chosen print item (D118, D119). */
export function KitContentFields({ spec, details: d, set, onPhoto, nameError, disabled }: KitContentFieldsProps) {
  const field = (f: KitField) => {
    const c = labels[f];
    if (f === 'message')
      return <TextArea key={f} id="kit-message" label={c.label} rows={3} value={d.message} maxLength={c.max} disabled={disabled} onChange={(e) => set({ message: e.target.value })} hint={`${d.message.length}/${c.max}`} />;
    if (f === 'code')
      return (
        <div key={f} className="flex items-end gap-2">
          <TextInput id="kit-code" label={c.label} placeholder={c.placeholder} value={d.code} maxLength={c.max} disabled={disabled} fieldClassName="flex-1" optional onChange={(e) => set({ code: e.target.value.toUpperCase() })} />
          <Button variant="secondary" leadingIcon={DicesIcon} disabled={disabled} onClick={() => set({ code: voucherCode(d.name) })}>
            Make one
          </Button>
        </div>
      );
    return (
      <TextInput
        key={f}
        id={`kit-${f}`}
        label={c.label}
        placeholder={c.placeholder}
        value={d[f]}
        maxLength={c.max}
        disabled={disabled}
        optional={!required.includes(f)}
        hint={c.hint}
        onChange={(e) => set({ [f]: e.target.value } as Partial<KitDetails>)}
      />
    );
  };

  // Pair short fields side by side; long ones take the full row.
  const short: KitField[] = ['social', 'email', 'offer', 'expiry', 'signer', 'reward', 'note'];
  const fields = spec.fields;

  const adjust = (k: KitImage) => {
    if (k === 'logo')
      return <RangeInput label={d.logo ? 'Logo size' : 'Initials size'} value={d.logoScale} min={0.7} max={1.5} onChange={(v) => set({ logoScale: v })} disabled={disabled} />;
    if (k === 'signature' && d.signature) return <RangeInput label="Signature size" value={d.sigScale} min={0.6} max={1.6} onChange={(v) => set({ sigScale: v })} disabled={disabled} />;
    if (k === 'photo' && d.photo)
      return (
        <div className="flex flex-col gap-3">
          <RangeInput label="Zoom" value={d.photoZoom} min={1} max={2.5} onChange={(v) => set({ photoZoom: v })} disabled={disabled} />
          <RangeInput label="Left – right" value={d.photoX} min={0} max={100} step={1} format={(v) => (v < 35 ? 'Left' : v > 65 ? 'Right' : 'Centre')} onChange={(v) => set({ photoX: v })} disabled={disabled} />
          <RangeInput label="Top – bottom" value={d.photoY} min={0} max={100} step={1} format={(v) => (v < 35 ? 'Top' : v > 65 ? 'Bottom' : 'Middle')} onChange={(v) => set({ photoY: v })} disabled={disabled} />
          <div className="flex flex-col gap-1.5">
            <span id="kit-tone" className="text-label font-medium text-fg">
              Photo tone
            </span>
            <Segmented<KitTone> ariaLabel="Photo tone" size="sm" value={d.photoTone} onChange={(v) => set({ photoTone: v })} options={kitTones.map((t) => ({ value: t.id, label: t.label }))} />
          </div>
        </div>
      );
    return null;
  };

  return (
    <div className="flex flex-col gap-6">
      <fieldset disabled={disabled} className="flex flex-col gap-4">
        <legend className="mb-1 text-label font-semibold text-fg">Words and contacts</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput id="kit-name" label="Business name" value={d.name} maxLength={40} onChange={(e) => set({ name: e.target.value })} error={nameError} />
          {spec.id !== 'sticker' && <TextInput id="kit-phone" label="Phone or WhatsApp" type="tel" value={d.phone} maxLength={24} optional onChange={(e) => set({ phone: e.target.value })} />}
        </div>
        {fields.filter((f) => !short.includes(f)).map(field)}
        {fields.some((f) => short.includes(f)) && <div className="grid gap-4 sm:grid-cols-2">{fields.filter((f) => short.includes(f)).map(field)}</div>}
        {spec.id === 'stamp' && (
          <div className="flex flex-col gap-1.5">
            <span className="text-label font-medium text-fg">Stamps on the card</span>
            <Segmented<'6' | '8' | '10'>
              ariaLabel="Stamps on the card"
              size="sm"
              value={String(d.stamps) as '6' | '8' | '10'}
              onChange={(v) => set({ stamps: Number(v) })}
              options={[
                { value: '6', label: '6' },
                { value: '8', label: '8' },
                { value: '10', label: '10' },
              ]}
            />
            <span className="text-caption text-fg-subtle">The last circle is the reward. Ten is the usual “buy 9, get 1 free”.</span>
          </div>
        )}
      </fieldset>

      <div className="flex flex-col gap-5 border-t border-line pt-6">
        <p className="text-label font-semibold text-fg">Images</p>
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
          {spec.images.map((k) => (
            <div key={k} className="flex flex-col gap-4">
              <KitImageField kind={k} value={d[k]} disabled={disabled} onChange={k === 'photo' ? onPhoto : (url) => set({ [k]: url } as Partial<KitDetails>)} />
              {adjust(k)}
            </div>
          ))}
        </div>
        <p className="text-caption text-fg-subtle">Images are shrunk and kept on this device with your design. Only use photos you own or have permission to use.</p>
      </div>
    </div>
  );
}
