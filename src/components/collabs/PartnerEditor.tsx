import React, { useEffect, useState } from 'react';
import type { Product } from '../../types/commerce';
import { MAX_RATE, defaultCollabSettings, makePartnerCode, platformLabels, termsFor, type CollabSettings, type Partner, type PartnerPlatform } from '../../utils/collabs';
import { uid } from '../../utils/id';
import { useT } from '../../contexts/LocaleContext';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { PhoneInput } from '../ui/PhoneInput';
import { TextArea } from '../ui/TextArea';
import { SelectInput } from '../ui/SelectInput';
import { Segmented } from '../ui/Segmented';

interface PartnerEditorProps {
  open: boolean;
  partner: Partner | null;
  partners: Partner[];
  products: Product[];
  onClose: () => void;
  onSave: (p: Partner) => void;
  /** Collaborations settings: starting rate, terms and payout timing for new invites (D259). */
  defaults?: CollabSettings;
}

interface Form {
  name: string;
  handle: string;
  phone: string;
  platform: PartnerPlatform;
  code: string;
  rate: string;
  scope: 'all' | 'some';
  productIds: string[];
  terms: string;
}

const toForm = (p: Partner | null, defaults: CollabSettings): Form => ({
  name: p?.name ?? '',
  handle: p?.handle ?? '',
  phone: p?.phone ?? '',
  platform: p?.platform ?? 'instagram',
  code: p?.code ?? '',
  rate: p ? String(p.ratePct) : String(defaults.defaultRatePct),
  scope: p?.productIds.length ? 'some' : 'all',
  productIds: p?.productIds ?? [],
  terms: p?.terms ?? defaults.defaultTerms,
});

/**
 * Invite or edit a partner. The code is locked once they've accepted, so links already shared keep working.
 * The terms text itself stays as typed — it's what the partner reads and agrees to.
 */
export function PartnerEditor({ open, partner, partners, products, onClose, onSave, defaults = defaultCollabSettings }: PartnerEditorProps) {
  const { t: tr } = useT();
  const [f, setF] = useState<Form>(() => toForm(partner, defaults));
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (open) {
      setF(toForm(partner, defaults));
      setTried(false);
    }
  }, [open, partner]); // eslint-disable-line react-hooks/exhaustive-deps

  const taken = new Set(partners.filter((p) => p.id !== partner?.id).map((p) => p.code));
  const code = (f.code || makePartnerCode(f.name, taken)).toUpperCase();
  const rate = Number(f.rate);
  const codeLocked = !!partner?.acceptedAt;
  const errors = {
    name: !f.name.trim() ? tr('Add their name.') : '',
    phone: f.phone.replace(/\D/g, '').length < 10 ? tr('Add a phone number so you can send the invite.') : '',
    code: !/^[A-Z0-9-]{3,20}$/.test(code) ? tr('Use 3–20 letters, numbers or dashes.') : taken.has(code) ? tr('Another partner already uses this code.') : '',
    rate: !Number.isFinite(rate) || rate < 1 || rate > MAX_RATE ? tr('Between 1% and {max}%', { max: MAX_RATE }) : '',
    products: f.scope === 'some' && !f.productIds.length ? tr('Pick at least one product.') : '',
  };
  const valid = Object.values(errors).every((e) => !e);
  const set = (p: Partial<Form>) => setF((x) => ({ ...x, ...p }));

  const save = () => {
    setTried(true);
    if (!valid) return;
    const now = new Date().toISOString();
    onSave({
      id: partner?.id ?? uid('ptn'),
      name: f.name.trim(),
      handle: f.handle.trim(),
      phone: f.phone.trim(),
      platform: f.platform,
      code,
      ratePct: Math.round(rate * 10) / 10,
      productIds: f.scope === 'some' ? f.productIds : [],
      terms: f.terms.trim() || termsFor(Math.round(rate * 10) / 10, defaults.holdDays),
      status: partner?.status ?? 'invited',
      invitedAt: partner?.invitedAt ?? now,
      acceptedAt: partner?.acceptedAt,
      sample: partner?.sample,
      sampleOrderIds: partner?.sampleOrderIds,
    });
  };

  const sellable = products.filter((p) => p.status !== 'archived' && p.kind !== 'ticket');

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="right"
      size="lg"
      title={partner ? tr('Edit {name}', { name: partner.name }) : tr('Invite a partner')}
      description={tr('Creators, stylists or resellers who share your link and earn a commission on what sells.')}
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="tertiary" onClick={onClose}>
            {tr('Cancel')}
          </Button>
          <Button onClick={save}>{partner ? tr('Save changes') : tr('Create invite')}</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 px-5 py-5 md:px-6">
        <TextInput id="pt-name" label={tr('Name')} value={f.name} maxLength={60} error={tried ? errors.name : undefined} onChange={(e) => set({ name: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput id="pt-platform" label={tr('Where they post')} value={f.platform} options={(Object.keys(platformLabels) as PartnerPlatform[]).map((v) => ({ value: v, label: tr(platformLabels[v]) }))} onChange={(v) => set({ platform: v })} />
          <TextInput id="pt-handle" label={tr('Handle')} optional placeholder="@name" value={f.handle} maxLength={40} onChange={(e) => set({ handle: e.target.value })} />
        </div>
        <PhoneInput id="pt-phone" label={tr('WhatsApp number')} value={f.phone} error={tried ? errors.phone : undefined} onChange={(phone) => set({ phone })} />
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
          <TextInput
            id="pt-code"
            label={tr('Link code')}
            hint={codeLocked ? tr('Locked — they’re already sharing it.') : tr('Shown in their link as ?partner=CODE')}
            value={code}
            disabled={codeLocked}
            error={tried ? errors.code : undefined}
            onChange={(e) => set({ code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') })}
          />
          <TextInput id="pt-rate" label={tr('Commission')} inputMode="decimal" value={f.rate} error={tried ? errors.rate : undefined} onChange={(e) => set({ rate: e.target.value.replace(/[^0-9.]/g, '') })} />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-label font-medium text-fg">{tr('Earns on')}</p>
          <Segmented
            ariaLabel={tr('Products the commission applies to')}
            value={f.scope}
            onChange={(v) => set({ scope: v })}
            options={[
              { value: 'all', label: tr('Every product') },
              { value: 'some', label: tr('Chosen products') },
            ]}
          />
          {f.scope === 'some' && (
            <fieldset className="flex max-h-56 flex-col gap-1 overflow-y-auto rounded-md border border-line p-2">
              <legend className="sr-only">{tr('Products')}</legend>
              {sellable.length === 0 && <p className="px-2 py-3 text-caption text-fg-muted">{tr('No products yet.')}</p>}
              {sellable.map((p) => (
                <label key={p.id} className="flex min-h-[36px] cursor-pointer items-center gap-3 rounded px-2 text-label text-fg hover:bg-sunken">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[rgb(var(--action))]"
                    checked={f.productIds.includes(p.id)}
                    onChange={(e) => set({ productIds: e.target.checked ? [...f.productIds, p.id] : f.productIds.filter((x) => x !== p.id) })}
                  />
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                </label>
              ))}
            </fieldset>
          )}
          {tried && errors.products && <p className="text-caption text-danger">{errors.products}</p>}
        </div>

        <TextArea id="pt-terms" label={tr('Terms they’ll see')} optional rows={3} maxLength={400} placeholder={tr('e.g. 10% on every sale through your link, paid weekly once delivered.')} value={f.terms} onChange={(e) => set({ terms: e.target.value })} />
        <p className="text-caption text-fg-subtle">{tr('Commission is worked out on what the customer paid for the products, after discounts and refunds. Delivery fees never count.')}</p>
      </div>
    </Sheet>
  );
}
