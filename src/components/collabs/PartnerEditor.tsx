import React, { useEffect, useState } from 'react';
import type { Product } from '../../types/commerce';
import { MAX_RATE, defaultCollabSettings, makePartnerCode, platformLabels, termsFor, type CollabSettings, type Partner, type PartnerPlatform } from '../../utils/collabs';
import { uid } from '../../utils/id';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
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
  terms: p?.terms ?? defaults.defaultTerms
});

/** Invite or edit a partner. The code is locked once they've accepted, so links already shared keep working. */
export function PartnerEditor({ open, partner, partners, products, onClose, onSave, defaults = defaultCollabSettings }: PartnerEditorProps) {
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
    name: !f.name.trim() ? 'Add their name.' : '',
    phone: f.phone.replace(/\D/g, '').length < 10 ? 'Add a phone number so you can send the invite.' : '',
    code: !/^[A-Z0-9-]{3,20}$/.test(code) ? 'Use 3–20 letters, numbers or dashes.' : taken.has(code) ? 'Another partner already uses this code.' : '',
    rate: !Number.isFinite(rate) || rate < 1 || rate > MAX_RATE ? `Between 1% and ${MAX_RATE}%.` : '',
    products: f.scope === 'some' && !f.productIds.length ? 'Pick at least one product.' : ''
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
      sampleOrderIds: partner?.sampleOrderIds
    });
  };

  const sellable = products.filter((p) => p.status !== 'archived' && p.kind !== 'ticket');

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="right"
      size="lg"
      title={partner ? `Edit ${partner.name}` : 'Invite a partner'}
      description="Creators, stylists or resellers who share your link and earn a commission on what sells."
      footer={
      <div className="flex w-full justify-end gap-2">
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{partner ? 'Save changes' : 'Create invite'}</Button>
        </div>
      }>
      
      <div className="flex flex-col gap-5 px-5 py-5 md:px-6">
        <TextInput id="pt-name" label="Name" value={f.name} maxLength={60} error={tried ? errors.name : undefined} onChange={(e) => set({ name: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput id="pt-platform" label="Where they post" value={f.platform} options={(Object.keys(platformLabels) as PartnerPlatform[]).map((v) => ({ value: v, label: platformLabels[v] }))} onChange={(v) => set({ platform: v })} />
          <TextInput id="pt-handle" label="Handle" optional placeholder="@name" value={f.handle} maxLength={40} onChange={(e) => set({ handle: e.target.value })} />
        </div>
        <TextInput id="pt-phone" label="WhatsApp number" type="tel" value={f.phone} error={tried ? errors.phone : undefined} onChange={(e) => set({ phone: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
          <TextInput
            id="pt-code"
            label="Link code"
            hint={codeLocked ? 'Locked — they’re already sharing it.' : 'Shown in their link as ?partner=CODE'}
            value={code}
            disabled={codeLocked}
            error={tried ? errors.code : undefined}
            onChange={(e) => set({ code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') })} />
          
          <TextInput id="pt-rate" label="Commission" inputMode="decimal" value={f.rate} error={tried ? errors.rate : undefined} onChange={(e) => set({ rate: e.target.value.replace(/[^0-9.]/g, '') })} />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-label font-medium text-fg">Earns on</p>
          <Segmented
            ariaLabel="Products the commission applies to"
            value={f.scope}
            onChange={(v) => set({ scope: v })}
            options={[
            { value: 'all', label: 'Every product' },
            { value: 'some', label: 'Chosen products' }]
            } />
          
          {f.scope === 'some' &&
          <fieldset className="flex max-h-56 flex-col gap-1 overflow-y-auto rounded-md border border-line p-2">
              <legend className="sr-only">Products</legend>
              {sellable.length === 0 && <p className="px-2 py-3 text-caption text-fg-muted">No products yet.</p>}
              {sellable.map((p) =>
            <label key={p.id} className="flex min-h-[36px] cursor-pointer items-center gap-3 rounded px-2 text-label text-fg hover:bg-sunken">
                  <input
                type="checkbox"
                className="h-4 w-4 accent-[rgb(var(--action))]"
                checked={f.productIds.includes(p.id)}
                onChange={(e) => set({ productIds: e.target.checked ? [...f.productIds, p.id] : f.productIds.filter((x) => x !== p.id) })} />
              
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                </label>
            )}
            </fieldset>
          }
          {tried && errors.products && <p className="text-caption text-danger">{errors.products}</p>}
        </div>

        <TextArea id="pt-terms" label="Terms they’ll see" optional rows={3} maxLength={400} placeholder="e.g. 10% on every sale through your link, paid weekly once delivered." value={f.terms} onChange={(e) => set({ terms: e.target.value })} />
        <p className="text-caption text-fg-subtle">Commission is worked out on what the customer paid for the products, after discounts and refunds. Delivery fees never count.</p>
      </div>
    </Sheet>);

}