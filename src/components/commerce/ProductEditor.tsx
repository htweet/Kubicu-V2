import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArchiveIcon, CheckIcon, QrCodeIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { destinationExists, qrHref } from '../../utils/domains/links';
import { MAIN_SPACE_ID } from '../../utils/spaces';
import { STOREFRONT_PATH } from '../../utils/commerce/storefront';
import type { Product, ProductKind } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { useCan } from '../../contexts/TeamContext';
import { upsertProduct } from '../../utils/commerce/ops';
import { bulkIssues } from '../../utils/commerce/sellModes';
import { ProductSellModesField } from './ProductSellModesField';
import { regenerateVariants } from '../../utils/commerce/catalog';
import { DEFAULT_DEPOSIT_PCT, DEFAULT_LEAD_DAYS, depositPctOptions } from '../../utils/commerce/deposit';
import { uid } from '../../utils/id';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Segmented } from '../ui/Segmented';
import { Switch } from '../ui/Switch';
import { Field } from '../ui/Field';
import { Dialog } from '../ui/Dialog';
import { InlineAlert } from '../ui/InlineAlert';
import { ProductImagesField } from './ProductImagesField';
import { VariantsField } from './VariantsField';
import { ProductInstalmentsField } from './ProductInstalmentsField';
import { DigitalFileField } from './DigitalFileField';
import { cn } from '../../utils/cn';
import { MobileSection } from '../ui/MobileSection';
import { ProductBundleField } from './ProductBundleField';
import { useLocalStore } from '../../hooks/useLocalStore';
import { emptyPartnerships, partnershipKey } from '../../utils/partnerships';
import { bundleIssue } from '../../utils/commerce/bundles';
import { useT } from '../../contexts/LocaleContext';
import { shopSettingsOf } from '../../utils/commerce/shopSettings';
import { formatMoney } from '../../utils/currency';

interface ProductEditorProps {
  open: boolean;
  /** Null creates a new product. */
  productId: string | null;
  kind: ProductKind;
  onClose: () => void;
}

/** A new, empty product. `lowStockAt` comes from Commerce settings → Orders & stock when given (D222). */
export function blankProduct(kind: ProductKind, lowStockAt = 2): Product {
  const now = new Date().toISOString();
  const base: Product = {
    id: uid('prd'),
    name: '',
    description: '',
    status: 'draft',
    kind,
    priceNgn: null,
    compareAtNgn: null,
    images: [],
    options: [],
    variants: [],
    collectionIds: [],
    trackStock: kind === 'physical',
    lowStockAt,
    weightKg: null,
    createdAt: now,
    updatedAt: now
  };
  if (kind === 'digital') {
    base.digital = { fileName: '', sizeBytes: 0, status: 'processing', version: 0, versions: [], downloadLimit: 3, expiryDays: 30, licence: '' };
  }
  return { ...base, variants: regenerateVariants(base) };
}

export function ProductEditor({ open, productId, kind, onClose }: ProductEditorProps) {
  const { data, apply } = useCommerce();
  const { current } = useWorkspace();
  const navigate = useNavigate();
  // Sales can change stock and details, not prices (D57).
  const pricesAllowed = useCan('prices.edit');
  const { t: tr } = useT();
  const existing = productId ? data.products.find((p) => p.id === productId) : undefined;
  const [draft, setDraft] = useState<Product>(() => existing ?? blankProduct(kind, shopSettingsOf(data).orders.lowStockDefault));
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [triedSave, setTriedSave] = useState(false);
  // Phones show one section at a time.
  const [section, setSection] = useState<'details' | 'photos' | 'stock' | 'partner' | 'collections'>('details');
  const partnerStore = useLocalStore(partnershipKey(current.id), emptyPartnerships);
  const partnerships = partnerStore.data.partnerships;
  const toggle = (s: typeof section) => setSection((cur) => cur === s ? cur : s);

  useEffect(() => {
    if (!open) return;
    setDraft(existing ?? blankProduct(kind, shopSettingsOf(data).orders.lowStockDefault));
    setTriedSave(false);
    setSection('details');
    // Only reset when a different product opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, productId, kind]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(existing ?? null) && (!!existing || draft.name.trim() !== '' || draft.images.length > 0), [draft, existing]);
  const referenced = !!existing && data.orders.some((o) => o.items.some((i) => i.productId === existing.id));
  const patch = (p: Partial<Product>) => setDraft((d) => ({ ...d, ...p }));

  // Errors pass through the field, which translates them (D133e).
  const nameError = triedSave && !draft.name.trim() ? 'Give the product a name' : undefined;
  const fileError = triedSave && draft.kind === 'digital' && draft.status === 'active' && draft.digital?.status !== 'ready' ? tr('Upload a file and wait for the scan before making this active') : undefined;
  const priceWarning = draft.status === 'active' && draft.priceNgn === null && draft.variants.every((v) => v.priceNgn === null);
  const bundlePartnership = draft.bundle ? partnerships.find((p) => p.id === draft.bundle!.partnershipId) : undefined;
  const bundleError = triedSave && draft.bundle ? bundleIssue(draft.bundle, draft.priceNgn, draft.status, bundlePartnership) : null;

  const save = () => {
    setTriedSave(true);
    if (!draft.name.trim()) {
      setSection('details');
      return;
    }
    if (draft.digital && (draft.digital.status === 'processing' || draft.digital.status === 'scanning')) {
      toast('Wait for the scan to finish', { description: 'It takes a couple of seconds.' });
      return;
    }
    if (draft.kind === 'digital' && draft.status === 'active' && draft.digital?.status !== 'ready') {
      setSection('stock');
      return;
    }
    if (bulkIssues(draft) || draft.preorder && !draft.preorder.shipsBy) {
      setSection('stock');
      return;
    }
    if (draft.bundle && bundleIssue(draft.bundle, draft.priceNgn, draft.status, bundlePartnership)) {
      setSection('partner');
      return;
    }
    // The agreed split is re-read on every save so new sales follow the current agreement (D122).
    const bundle = draft.bundle && bundlePartnership ? { ...draft.bundle, partnerName: bundlePartnership.partner.name, partnerKind: bundlePartnership.kind, leadSharePct: bundlePartnership.agreement.leadSharePct, partnerPart: draft.bundle.partnerPart.trim() } : draft.bundle;
    const next = { ...draft, bundle, name: draft.name.trim(), variants: draft.variants.length ? draft.variants : regenerateVariants(draft) };
    if (apply((d) => upsertProduct(d, next))) {
      toast(existing ? 'Product saved' : 'Product added', { description: existing ? 'Linked page blocks update straight away.' : 'Link it to a block on your page to start selling.' });
      onClose();
    }
  };

  const requestClose = () => dirty ? setConfirmClose(true) : onClose();

  const archive = () => {
    if (!existing) return;
    const status = existing.status === 'archived' ? 'draft' : 'archived';
    if (apply((d) => upsertProduct(d, { ...existing, status }))) {
      toast(status === 'archived' ? 'Product archived' : 'Product restored as a draft', { description: status === 'archived' ? 'It’s hidden from your page. Past orders keep their details.' : undefined });
      onClose();
    }
  };

  const remove = () => {
    if (!existing) return;
    if (apply((d) => ({ ...d, products: d.products.filter((p) => p.id !== existing.id), movements: d.movements.filter((m) => m.productId !== existing.id) }))) {
      toast('Product deleted');
      setConfirmDelete(false);
      onClose();
    }
  };

  const title = existing ? tr('Edit {name}', { name: existing.name }) : kind === 'digital' ? 'New digital product' : 'New product';
  // “QR code” opens Domains & QR with a code already pointing at this product's shop page (D72).
  const productDest = existing ? { spaceId: MAIN_SPACE_ID, path: `${STOREFRONT_PATH}/${existing.id}` } : null;
  const productQr = productDest && destinationExists(current, data, productDest) ? productDest : null;

  return (
    <>
      <Sheet
        open={open}
        onClose={requestClose}
        side="right"
        size="lg"
        title={title}
        description={dirty ? 'Unsaved changes' : existing ? 'All changes saved' : undefined}
        footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1">
              {existing &&
            <Button variant="tertiary" size="sm" leadingIcon={existing.status === 'archived' ? RotateCcwIcon : ArchiveIcon} onClick={archive}>
                  {existing.status === 'archived' ? 'Restore' : 'Archive'}
                </Button>
            }
              {existing &&
            <Button
              variant="tertiary"
              size="sm"
              leadingIcon={QrCodeIcon}
              disabled={!productQr}
              title={tr(productQr ? 'A printable code that opens this product in your shop' : existing.status !== 'active' ? 'Make the product active first.' : 'Turn on the storefront to give products their own page.')}
              onClick={() => productQr && navigate(qrHref(productQr, existing.name))}>
              
                  QR code
                </Button>
            }
              {existing && !referenced &&
            <Button variant="tertiary" size="sm" leadingIcon={Trash2Icon} className="text-danger hover:text-danger" onClick={() => setConfirmDelete(true)}>
                  Delete
                </Button>
            }
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={requestClose}>
                Cancel
              </Button>
              <Button leadingIcon={CheckIcon} onClick={save} disabled={!!existing && !dirty}>
                {existing ? 'Save changes' : 'Add product'}
              </Button>
            </div>
          </div>
        }>
        
        <div className="flex flex-col gap-6 px-5 py-5 max-md:gap-0 max-md:py-0">
          {existing?.status === 'archived' &&
          <InlineAlert tone="info" title="This product is archived">
              It’s hidden from your page and can’t be bought. Restore it to sell again.
            </InlineAlert>
          }

          <MobileSection id="prd-sec-details" title="Details" summary={[draft.name || tr('No name yet'), tr(draft.status === 'active' ? 'Active' : 'Draft'), draft.priceNgn !== null ? formatMoney(draft.priceNgn) : tr('No price')].join(' · ')} open={section === 'details'} onToggle={() => toggle('details')} invalid={!!nameError}>
          <Field id="prd-status" label="Status" hint={draft.status === 'draft' ? 'Drafts never appear on your page.' : 'Visible on any page block that links to it.'}>
            <Segmented
                ariaLabel="Status"
                value={draft.status === 'archived' ? 'draft' : draft.status}
                onChange={(status) => patch({ status })}
                options={[
                { value: 'active', label: 'Active' },
                { value: 'draft', label: 'Draft' }]
                } />
              
          </Field>

          <TextInput id="prd-name" label="Name" value={draft.name} error={nameError} placeholder={tr(kind === 'digital' ? 'e.g. Lightroom preset pack' : 'e.g. Linen two-piece')} onChange={(e) => patch({ name: e.target.value })} />
          <TextArea id="prd-desc" label="Description" optional rows={3} value={draft.description} onChange={(e) => patch({ description: e.target.value })} />

          <div className="grid gap-4 sm:grid-cols-2">
            <CurrencyInput id="prd-price" label="Price" value={draft.priceNgn} placeholder={tr('Price on request')} disabled={!pricesAllowed.allowed} hint={!pricesAllowed.allowed ? pricesAllowed.reason : priceWarning ? 'No price — checkout can’t sell it until you add one.' : undefined} onChange={(priceNgn) => patch({ priceNgn })} />
            <CurrencyInput id="prd-compare" label="Compare-at price" optional value={draft.compareAtNgn} disabled={!pricesAllowed.allowed} hint="Shown struck through, e.g. before a sale." onChange={(compareAtNgn) => patch({ compareAtNgn })} />
          </div>
          </MobileSection>

          <MobileSection id="prd-sec-photos" title="Photos" summary={draft.images.length ? tr(draft.images.length === 1 ? '{n} photo' : '{n} photos', { n: draft.images.length }) : tr('No photos yet')} open={section === 'photos'} onToggle={() => toggle('photos')}>
            <ProductImagesField images={draft.images} onChange={(images) => patch({ images })} />
          </MobileSection>

          <MobileSection
            id="prd-sec-stock"
            title={kind === 'digital' ? 'File & access' : 'Stock & options'}
            summary={kind === 'digital' ? draft.digital?.fileName || tr('No file yet') : draft.trackStock ? tr('{v} variants · {n} in stock', { v: draft.variants.length, n: draft.variants.reduce((s, v) => s + v.stock, 0) }) : tr('Stock not tracked')}
            open={section === 'stock'}
            onToggle={() => toggle('stock')}
            invalid={!!fileError}>
            
          {kind === 'digital' && draft.digital ?
            <DigitalFileField product={draft} onChange={patch} error={fileError} /> :

            <>
              <Switch
                id="prd-track"
                label="Track stock"
                description="Orders reduce stock automatically and the item shows Sold out at zero."
                checked={draft.trackStock}
                onChange={(trackStock) => patch({ trackStock })} />
              
              {kind === 'physical' &&
              <div id="prd-how-pay" className="border-t border-border pt-5">
                  <h3 className="text-label font-semibold text-fg">{tr('How buyers pay')}</h3>
                  <p className="mt-0.5 text-caption text-fg-muted">{tr('Pay in full is always on. Add instalments, a deposit or pre-orders for this product.')}</p>
                </div>
              }
              {kind === 'physical' && !draft.bundle && <ProductInstalmentsField product={draft} onChange={patch} />}
              {kind === 'physical' &&
              <div className="flex flex-col gap-4 border-t border-border pt-4">
                  <Switch
                  id="prd-mto"
                  label="Made to order — take a deposit"
                  description="Buyers pay a deposit at checkout and the rest before you send it out. You can’t mark it out for delivery until the balance is in."
                  checked={!!draft.madeToOrder}
                  disabled={!!draft.instalments || !!draft.bundle}
                  onChange={(on) => patch({ madeToOrder: on ? { depositPct: DEFAULT_DEPOSIT_PCT, leadDays: DEFAULT_LEAD_DAYS } : undefined })} />
                
                  {draft.madeToOrder &&
                <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="prd-mto-pct" label="Deposit at checkout" hint={draft.priceNgn ? tr('{now} now, {later} before dispatch', { now: formatMoney(Math.round(draft.priceNgn * draft.madeToOrder.depositPct / 100)), later: formatMoney(draft.priceNgn - Math.round(draft.priceNgn * draft.madeToOrder.depositPct / 100)) }) : 'Share of the price paid now.'}>
                        <select
                      id="prd-mto-pct"
                      className="h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-body text-fg"
                      value={draft.madeToOrder.depositPct}
                      onChange={(e) => patch({ madeToOrder: { ...draft.madeToOrder!, depositPct: Number(e.target.value) } })}>
                      
                          {depositPctOptions.map((p) =>
                      <option key={p} value={p}>
                              {p}%
                            </option>
                      )}
                        </select>
                      </Field>
                      <TextInput
                    id="prd-mto-days"
                    label="Usually ready in (days)"
                    inputMode="numeric"
                    value={String(draft.madeToOrder.leadDays)}
                    hint="Shown to buyers at checkout."
                    onChange={(e) => patch({ madeToOrder: { ...draft.madeToOrder!, leadDays: Math.min(90, Number(e.target.value.replace(/[^0-9]/g, '').slice(0, 2) || '0')) } })} />
                  
                    </div>
                }
                </div>
              }
              {kind === 'physical' && !draft.giftCard && <ProductSellModesField product={draft} onChange={patch} pricesLocked={!pricesAllowed.allowed} showErrors={triedSave} />}
              {kind === 'physical' && draft.bundle && <p className="border-t border-border pt-4 text-caption text-fg-muted">{tr('Deposits and instalments are off while this is sold with {name}.', { name: draft.bundle.partnerName })}</p>}
              <VariantsField product={draft} onChange={patch} />
              <div className="grid gap-4 sm:grid-cols-2">
                {draft.trackStock &&
                <TextInput
                  id="prd-low"
                  label="Low-stock alert at"
                  inputMode="numeric"
                  value={String(draft.lowStockAt)}
                  hint="Per variant."
                  onChange={(e) => patch({ lowStockAt: Number(e.target.value.replace(/[^0-9]/g, '').slice(0, 4) || '0') })} />

                }
                <TextInput
                  id="prd-weight"
                  label="Weight (kg)"
                  optional
                  inputMode="decimal"
                  value={draft.weightKg === null ? '' : String(draft.weightKg)}
                  hint="For your delivery partner."
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.]/g, '');
                    patch({ weightKg: v === '' ? null : Number(v) });
                  }} />
                
              </div>
            </>
            }
          </MobileSection>

          <MobileSection
            id="prd-sec-partner"
            title="Sold with a partner"
            summary={draft.bundle ? `${tr('With {name}', { name: draft.bundle.partnerName })} · ${draft.bundle.split === 'agreement' ? `${draft.bundle.leadSharePct}/${100 - draft.bundle.leadSharePct}` : tr('exact amount')}` : tr('Just you')}
            open={section === 'partner'}
            onToggle={() => toggle('partner')}
            invalid={!!bundleError}>
            
            <ProductBundleField product={draft} onChange={patch} leadName={current.name} partnerships={partnerships} error={bundleError} disabled={!pricesAllowed.allowed} />
          </MobileSection>

          {data.collections.length > 0 &&
          <MobileSection id="prd-sec-coll" title="Collections" summary={draft.collectionIds.length ? data.collections.filter((c) => draft.collectionIds.includes(c.id)).map((c) => c.name).join(', ') : tr('None')} open={section === 'collections'} onToggle={() => toggle('collections')}>
            <fieldset>
              <legend className="mb-2 text-label font-medium text-fg">{tr('Collections')}</legend>
              <div className="flex flex-wrap gap-1.5">
                {data.collections.map((c) => {
                  const on = draft.collectionIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => patch({ collectionIds: on ? draft.collectionIds.filter((x) => x !== c.id) : [...draft.collectionIds, c.id] })}
                      className={cn(
                        'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-label font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                        on ? 'border-transparent bg-fg text-canvas' : 'border-line-strong text-fg-muted hover:text-fg'
                      )}>
                      
                      {on && <CheckIcon size={13} strokeWidth={3} aria-hidden />}
                      {c.name}
                    </button>);

                })}
              </div>
            </fieldset>
            </MobileSection>
          }
        </div>
      </Sheet>

      <Dialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        size="sm"
        title="Discard your changes?"
        description="You have edits that haven’t been saved."
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirmClose(false)} data-autofocus>
              Keep editing
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              setConfirmClose(false);
              onClose();
            }}>
            
              Discard
            </Button>
          </>
        } />
      
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        size="sm"
        title={tr('Delete “{name}”?', { name: existing?.name ?? '' })}
        description="This can’t be undone. Page blocks linked to it will show a warning until you pick another product."
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)} data-autofocus>
              Cancel
            </Button>
            <Button variant="destructive" onClick={remove}>
              Delete product
            </Button>
          </>
        } />
      
    </>);

}