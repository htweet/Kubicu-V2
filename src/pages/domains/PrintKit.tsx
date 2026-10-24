import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, CheckCircle2Icon, CreditCardIcon, FlipHorizontalIcon, MegaphoneIcon, PackageCheckIcon, PackageIcon, PlusIcon, PrinterIcon, QrCodeIcon, ReceiptIcon, RotateCcwIcon, RulerIcon, StampIcon, StickerIcon, StoreIcon, TagIcon, TicketIcon, TruckIcon, XCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useDomains } from '../../contexts/DomainsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import { useMainLink } from '../../hooks/useMainLink';
import { useLocalStore } from '../../hooks/useLocalStore';
import { sellerPhone } from '../../hooks/useResolvedPage';
import { shortDisplay, shortUrl, spaceDoc } from '../../utils/domains/links';
import { qrChecks, qrSvg, styleOf, svgDataUrl } from '../../utils/domains/qr';
import { defaultKitDetails, kitItems, kitPreviewDoc, printKit, type KitDetails, type KitItem } from '../../utils/domains/printKit';
import { kitChecks } from '../../utils/domains/printKitChecks';
import { printPrices, type OrderableItem } from '../../utils/domains/printOrders';
import { contrastRatio, isHexColor } from '../../utils/contrast';
import { formatNgn } from '../../utils/format';
import { MAIN_SPACE_ID } from '../../utils/spaces';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { SelectInput } from '../../components/ui/SelectInput';
import { Segmented } from '../../components/ui/Segmented';
import { initialsOf } from '../../components/domains/QrDesigner';
import { PrintOrderSheet } from '../../components/domains/PrintOrderSheet';
import { PrintOrdersList } from '../../components/domains/PrintOrdersList';
import { KitAiPanel } from '../../components/domains/KitAiPanel';
import { KitDesignFields, type InkMode } from '../../components/domains/KitDesignFields';
import { KitContentFields } from '../../components/domains/KitContentFields';
import { KitActualSize } from '../../components/domains/KitActualSize';
import { PHOTO_ITEMS } from '../../utils/domains/printKitTemplates';
import { cn } from '../../utils/cn';

const itemIcons: Record<KitItem, typeof CreditCardIcon> = { card: CreditCardIcon, sticker: StickerIcon, insert: PackageIcon, receipt: ReceiptIcon, hangtag: TagIcon, voucher: TicketIcon, flyer: MegaphoneIcon, counter: StoreIcon, stamp: StampIcon, label: PackageCheckIcon };
const MM = 3.78; // CSS px per millimetre
const PREVIEW_W = 372;
const PREVIEW_H = 470;

type Draft = Omit<KitDetails, 'address' | 'ink'>;
interface KitStore {
  draft: Draft | null;
  item: KitItem;
  inkMode: InkMode | null;
  customInk: string;
  photoPx: number | null;
}
const kitKey = (workspaceId: string) => `kubicu.printKit.${workspaceId}`;
const emptyStore = (): KitStore => ({ draft: null, item: 'card', inkMode: null, customInk: '#1E3A8A', photoPx: null });

/** Domains & QR → Print kit: designed print pieces carrying a tracked QR code (D86, expanded D118). */
export function PrintKit() {
  const { data } = useDomains();
  const { current } = useWorkspace();
  const can = useCan('pages.edit');
  const team = useTeam();
  const { mainHandle, host } = useMainLink();
  const doc = useMemo(() => spaceDoc(current.id, MAIN_SPACE_ID), [current.id]);
  const pageInk = doc?.theme.accent ?? '#111111';
  const pageInkPrints = contrastRatio(pageInk, '#FFFFFF') >= 3;
  const store = useLocalStore(kitKey(current.id), emptyStore);

  const usable = data.qrs.filter((q) => data.links.some((l) => l.id === q.linkId && !l.archivedAt));
  const [qrId, setQrId] = useState(usable[0]?.id ?? '');
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [ordering, setOrdering] = useState(false);
  const [placedId, setPlacedId] = useState<string | null>(null);
  const [actual, setActual] = useState(false);

  const item: KitItem = kitItems.some((k) => k.id === store.data.item) ? store.data.item : 'card';
  const inkMode: InkMode = store.data.inkMode ?? (pageInkPrints ? 'page' : 'black');
  // Saved designs from before sizes and new pieces existed pick up the new defaults.
  const base: Draft = (({ address, ink, ...rest }) => rest)(defaultKitDetails(current.name, doc ? sellerPhone(doc) : ''));
  const draft: Draft = { ...base, ...(store.data.draft ?? {}) };
  const ink = inkMode === 'page' ? pageInk : inkMode === 'custom' && isHexColor(store.data.customInk) ? store.data.customInk : '#111111';

  const setDraft = (patch: Partial<KitDetails>) => store.update((s) => ({ ...s, draft: { ...draft, ...(s.draft ?? {}), ...patch } }));
  const setItem = (i: KitItem) => {
    store.update((s) => ({ ...s, item: i }));
    setSide('front');
  };

  const qr = usable.find((q) => q.id === qrId) ?? usable[0];
  const link = qr ? data.links.find((l) => l.id === qr.linkId) : undefined;
  // Small prints need the bare code — captions and frames from the designer would shrink it below scanning size.
  const style = useMemo(() => qr ? { ...styleOf(qr, initialsOf(current.name)), frame: 'none' as const, frameText: '' } : null, [qr, current.name]);
  const weak = style ? qrChecks(style).contrast.level === 'fail' : false;
  const kit: KitDetails = { ...draft, ink, address: link ? shortDisplay(mainHandle, link.slug, host) : '' };
  const spec = kitItems.find((k) => k.id === item)!;
  const checks = kitChecks(spec, kit, { photoPx: store.data.photoPx, qrWeak: weak });
  const blocking = checks.filter((c) => c.level === 'fail');
  const nameError = draft.name.trim() ? '' : 'Add the name customers know you by';
  const ready = !!qrUrl && !nameError && blocking.length === 0;

  useEffect(() => {
    if (!link || !style) return setQrUrl(null);
    let alive = true;
    qrSvg(shortUrl(mainHandle, link.slug, host), style).
    then((svg) => alive && setQrUrl(svgDataUrl(svg))).
    catch(() => alive && setQrUrl(null));
    return () => {
      alive = false;
    };
  }, [link, style, mainHandle, host]);

  const print = () => {
    if (!ready || !qrUrl) return;
    if (!printKit(item, kit, qrUrl)) return toast.error('Your browser blocked the print window', { description: 'Allow pop-ups for KUBICU and try again.' });
    team.log('pages', `printed ${spec.label.toLowerCase()}`, '/app/domains/kit');
  };

  const reset = () => {
    store.update((s) => ({ ...s, draft: null, inkMode: null, photoPx: null }));
    toast('Design reset', { description: 'Back to the starting layout. Your QR codes are unchanged.' });
  };

  if (usable.length === 0)
  return (
    <div className="flex flex-col gap-6">
        <PageHeader title="Print kit" description="Business cards, stickers, swing tags, vouchers, flyers and more — each carrying your QR code." />
        <div className="rounded-lg border border-line bg-raised">
          <EmptyState
          icon={QrCodeIcon}
          title="Make a QR code first"
          description="Every printed piece uses one of your QR codes, so scans are counted and you can change where it goes without reprinting."
          action={
          <Link to="/app/domains/qr" className="inline-flex h-10 items-center gap-2 rounded-md bg-action px-4 text-label font-semibold text-action-fg transition-colors duration-150 hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <PlusIcon size={16} aria-hidden /> New QR code
              </Link>
          } />
        
        </div>
      </div>);


  const scale = Math.min(1, PREVIEW_W / (spec.widthMm * MM), PREVIEW_H / (spec.heightMm * MM));
  const w = spec.widthMm * MM;
  const h = spec.heightMm * MM;
  const showBack = item === 'card' && kit.cardBack;
  const previewSide = showBack ? side : 'front';

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Print kit"
        description="Designed print pieces that carry your tracked QR code. Print at home, save a PDF for a print shop, or have them printed and delivered."
        actions={
        <Button variant="tertiary" leadingIcon={RotateCcwIcon} disabled={!store.data.draft} onClick={reset}>
            Reset design
          </Button>
        } />
      

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex min-w-0 flex-col gap-10">
          <section aria-labelledby="kit-what">
            <h2 id="kit-what" className="text-heading font-semibold text-fg">
              What to print
            </h2>
            <div role="radiogroup" aria-labelledby="kit-what" className="mt-3 grid gap-2 sm:grid-cols-2">
              {kitItems.map((k) => {
                const Icon = itemIcons[k.id];
                const selected = k.id === item;
                return (
                  <button
                    key={k.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setItem(k.id)}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border p-3.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                      selected ? 'border-action bg-action-soft' : 'border-line bg-raised hover:border-line-strong'
                    )}>
                    
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md', selected ? 'bg-action text-action-fg' : 'bg-sunken text-fg-muted')} aria-hidden>
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-label font-semibold text-fg">{k.label}</span>
                      <span className="block text-caption text-fg-muted">{k.goodFor}</span>
                      <span className="mt-0.5 block text-caption text-fg-subtle">
                        {k.detail} · {k.perSheet.toLowerCase()}
                      </span>
                    </span>
                  </button>);

              })}
            </div>
          </section>

          <KitAiPanel details={kit} spec={spec} disabled={!can.allowed} onApply={(patch) => setDraft(patch)} />

          <section aria-labelledby="kit-design" className="flex flex-col gap-4 border-t border-line pt-8">
            <h2 id="kit-design" className="text-heading font-semibold text-fg">
              Look and feel
            </h2>
            <KitDesignFields
              item={item}
              details={kit}
              set={setDraft}
              inkMode={inkMode}
              customInk={store.data.customInk}
              pageInk={pageInk}
              photoAllowed={PHOTO_ITEMS.has(item)}
              disabled={!can.allowed}
              onInk={(mode, custom) => store.update((s) => ({ ...s, inkMode: mode, customInk: custom ?? s.customInk }))} />
            
          </section>

          <section aria-labelledby="kit-content" className="flex flex-col gap-4 border-t border-line pt-8">
            <h2 id="kit-content" className="text-heading font-semibold text-fg">
              Content
            </h2>
            <SelectInput<string>
              id="kit-qr"
              label="QR code"
              value={qr?.id ?? ''}
              onChange={setQrId}
              options={usable.map((q) => ({ value: q.id, label: data.links.find((l) => l.id === q.linkId)?.name ?? 'QR code' }))}
              hint={link ? `Opens ${shortDisplay(mainHandle, link.slug, host)} — scans are counted in Analytics, and you can change where it goes without reprinting.` : undefined} />
            
            <KitContentFields
              spec={spec}
              details={kit}
              set={setDraft}
              disabled={!can.allowed}
              nameError={nameError || undefined}
              onPhoto={(url, px) => {
                setDraft({ photo: url });
                store.update((s) => ({ ...s, photoPx: url ? px ?? null : null }));
              }} />
            
          </section>
        </div>

        <aside aria-labelledby="kit-preview" className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-lg border border-line bg-raised">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <h2 id="kit-preview" className="text-label font-semibold text-fg">
                Preview · actual design
              </h2>
              {showBack ?
              <Segmented<'front' | 'back'>
                ariaLabel="Card side"
                size="sm"
                value={side}
                onChange={setSide}
                options={[
                { value: 'front', label: 'Front' },
                { value: 'back', label: 'Back', icon: FlipHorizontalIcon }]
                } /> :


              <span className="text-caption text-fg-subtle">
                  {spec.widthMm} × {spec.heightMm} mm
                </span>
              }
            </div>
            <div className="dot-stage flex min-h-[320px] items-center justify-center px-4 py-8">
              {qrUrl ?
              <div style={{ width: w * scale, height: item === 'receipt' ? undefined : h * scale }} className={cn('shadow-lg', item === 'sticker' && 'rounded-full')}>
                  <iframe
                  title={`${spec.label} preview${previewSide === 'back' ? ', back' : ''}`}
                  srcDoc={kitPreviewDoc(item, kit, qrUrl, previewSide)}
                  style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left', border: 0, background: 'transparent', display: 'block' }}
                  tabIndex={-1} />
                
                </div> :

              <QrCodeIcon size={28} className="text-fg-subtle" aria-hidden />
              }
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5">
              <span className="text-caption text-fg-subtle">Scaled to fit</span>
              <Button size="sm" variant="tertiary" leadingIcon={RulerIcon} disabled={!qrUrl} onClick={() => setActual(true)}>
                View actual size
              </Button>
            </div>

            <div className="border-t border-line px-4 py-3">
              <p className="text-caption font-semibold text-fg-subtle">Print check</p>
              <ul className="mt-2 flex flex-col gap-1.5" aria-label="Print check">
                {checks.map((c) => {
                  const Icon = c.level === 'pass' ? CheckCircle2Icon : c.level === 'warn' ? AlertTriangleIcon : XCircleIcon;
                  return (
                    <li key={c.id} className="flex items-start gap-2 text-caption">
                      <Icon size={14} className={cn('mt-0.5 shrink-0', c.level === 'pass' ? 'text-success' : c.level === 'warn' ? 'text-warning' : 'text-danger')} aria-hidden />
                      <span className={c.level === 'fail' ? 'text-fg' : 'text-fg-muted'}>
                        <span className="sr-only">{c.level === 'pass' ? 'OK: ' : c.level === 'warn' ? 'Warning: ' : 'Must fix: '}</span>
                        {c.text}
                      </span>
                    </li>);

                })}
              </ul>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-line p-4">
              <Button leadingIcon={PrinterIcon} fullWidth disabled={!can.allowed || !ready} title={can.allowed ? undefined : can.reason} onClick={print}>
                Print {spec.label.toLowerCase()} yourself
              </Button>
              {item !== 'receipt' &&
              <Button variant="secondary" leadingIcon={TruckIcon} fullWidth disabled={!can.allowed || !ready} title={can.allowed ? undefined : can.reason} onClick={() => setOrdering(true)}>
                  Order professionally printed
                </Button>
              }
              <p className="text-caption text-fg-subtle">
                {item === 'receipt' ?
                'Opens a print sheet for your 80 mm receipt printer. Print at 100% scale.' :
                `Print at home (${spec.perSheet.toLowerCase()}, at 100% scale — choose “Save as PDF” for a print shop), or have it printed and delivered anywhere in Nigeria from ${formatNgn(printPrices[item as OrderableItem][0].ngn)}.`}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <PrintOrdersList highlightId={placedId} />

      {qrUrl && <KitActualSize open={actual} onClose={() => setActual(false)} spec={spec} kit={kit} qrUrl={qrUrl} />}

      {qrUrl && link && item !== 'receipt' &&
      <PrintOrderSheet
        open={ordering}
        onClose={() => setOrdering(false)}
        initialItem={item as OrderableItem}
        kit={kit}
        qrUrl={qrUrl}
        qrLinkName={link.name}
        onPlaced={(o) => {
          setOrdering(false);
          setPlacedId(o.id);
        }} />

      }
    </div>);

}