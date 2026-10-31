import React from 'react';
import { useShopSection } from '../../../hooks/useShopSection';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { TextInput } from '../../ui/TextInput';
import { PhoneInput } from '../../ui/PhoneInput';
import { TextArea } from '../../ui/TextArea';
import { MediaPicker } from '../../media/MediaPicker';
import { MediaImage } from '../../media/MediaImage';
import { SettingsSection } from './SettingsSection';
import { isValidEmail } from '../../../utils/validation';
import { formatNgn } from '../../../utils/format';

/** Business details printed on receipts and invoices (D222), with a live preview. */
export function BusinessReceiptsSection() {
  const s = useShopSection('business', 'Receipt details saved');
  const { current } = useWorkspace();
  const b = s.draft;
  const emailError = b.email.trim() && !isValidEmail(b.email) ? 'Enter a valid email' : '';
  const name = b.tradingName.trim() || current.name;
  const ids = [b.regNumber.trim(), b.tin.trim() && `TIN ${b.tin.trim()}`].filter(Boolean).join(' · ');
  const contact = [b.phone.trim(), b.email.trim()].filter(Boolean).join(' · ');

  return (
    <SettingsSection id="business" title="Business & receipts" description="Shown on order receipts, payment-link receipts and printed invoices." dirty={s.dirty} justSaved={s.justSaved} onSave={() => s.save()} onReset={s.reset} saveDisabled={!!emailError}>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextInput id="biz-name" label="Trading name" optional placeholder={current.name} value={b.tradingName} hint="Leave blank to use your workspace name." onChange={(e) => s.patch({ tradingName: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <TextArea id="biz-address" label="Business address" optional rows={2} value={b.address} onChange={(e) => s.patch({ address: e.target.value })} />
          </div>
          <TextInput id="biz-reg" label="CAC number" optional placeholder="e.g. RC 1234567 or BN 1234567" value={b.regNumber} onChange={(e) => s.patch({ regNumber: e.target.value.slice(0, 20) })} />
          <TextInput id="biz-tin" label="Tax ID (TIN)" optional inputMode="numeric" value={b.tin} onChange={(e) => s.patch({ tin: e.target.value.replace(/[^\d-]/g, '').slice(0, 15) })} />
          <PhoneInput id="biz-phone" label="Support phone" optional value={b.phone} onChange={(phone) => s.patch({ phone })} />
          <TextInput id="biz-email" label="Support email" optional type="email" inputMode="email" value={b.email} error={emailError || undefined} onChange={(e) => s.patch({ email: e.target.value })} />
          <div className="sm:col-span-2">
            <MediaPicker id="biz-logo" label="Receipt logo" optional aspect="1:1" folder="brand" value={b.logoUrl} onChange={(logoUrl) => s.patch({ logoUrl })} />
          </div>
          <div className="sm:col-span-2">
            <TextInput id="biz-footer" label="Footer note" optional maxLength={140} placeholder="e.g. Thank you for shopping small!" value={b.receiptFooter} hint={`${b.receiptFooter.length}/140`} onChange={(e) => s.patch({ receiptFooter: e.target.value })} />
          </div>
        </div>

        <figure className="m-0 lg:sticky lg:top-24">
          <figcaption className="mb-2 text-caption font-medium text-fg-muted">Receipt preview</figcaption>
          <div className="rounded-md border border-line bg-canvas p-4 text-caption text-fg-muted" aria-hidden>
            <div className="flex items-start gap-3">
              {b.logoUrl ? <MediaImage src={b.logoUrl} alt="" className="h-10 w-10 shrink-0 rounded-sm object-contain" /> : <span className="h-10 w-10 shrink-0 rounded-sm bg-sunken" />}
              <div className="min-w-0">
                <p className="truncate text-label font-semibold text-fg">{name}</p>
                {b.address.trim() && <p className="line-clamp-2">{b.address.trim()}</p>}
                {ids && <p>{ids}</p>}
                {contact && <p className="truncate">{contact}</p>}
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1 border-t border-line pt-3">
              <p className="flex justify-between gap-3"><span>1 × Ankara wrap dress</span><span className="tabular-nums text-fg">{formatNgn(28000)}</span></p>
              <p className="flex justify-between gap-3"><span>Delivery</span><span className="tabular-nums text-fg">{formatNgn(2500)}</span></p>
              <p className="flex justify-between gap-3 border-t border-line pt-1.5 font-semibold text-fg"><span>Total</span><span className="tabular-nums">{formatNgn(30500)}</span></p>
            </div>
            {b.receiptFooter.trim() && <p className="mt-3 text-fg">{b.receiptFooter.trim()}</p>}
            <p className="mt-3 text-[11px] text-fg-subtle">Example order</p>
          </div>
        </figure>
      </div>
    </SettingsSection>);

}