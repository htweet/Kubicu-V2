import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCardIcon, PackageIcon, PlusIcon, PrinterIcon, QrCodeIcon, ReceiptIcon, StickerIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useDomains } from '../../contexts/DomainsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import { useMainLink } from '../../hooks/useMainLink';
import { sellerPhone } from '../../hooks/useResolvedPage';
import { shortDisplay, shortUrl, spaceDoc } from '../../utils/domains/links';
import { qrChecks, qrSvg, styleOf, svgDataUrl } from '../../utils/domains/qr';
import { kitItems, kitPreviewDoc, printKit, type KitDetails, type KitItem } from '../../utils/domains/printKit';
import { contrastRatio } from '../../utils/contrast';
import { MAIN_SPACE_ID } from '../../utils/spaces';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { SelectInput } from '../../components/ui/SelectInput';
import { Segmented } from '../../components/ui/Segmented';
import { TextInput } from '../../components/ui/TextInput';
import { TextArea } from '../../components/ui/TextArea';
import { initialsOf } from '../../components/domains/QrDesigner';
import { cn } from '../../utils/cn';

const itemIcons: Record<KitItem, typeof CreditCardIcon> = { card: CreditCardIcon, sticker: StickerIcon, insert: PackageIcon, receipt: ReceiptIcon };
const MM = 3.78; // CSS px per millimetre
const PREVIEW_MAX = 380;

/** Domains & QR → Print kit: turn a tracked QR code into cards, stickers, inserts and receipt footers (D86). */
export function PrintKit() {
  const { data } = useDomains();
  const { current } = useWorkspace();
  const can = useCan('pages.edit');
  const team = useTeam();
  const { mainHandle, host } = useMainLink();
  const doc = useMemo(() => spaceDoc(current.id, MAIN_SPACE_ID), [current.id]);
  const pageInk = doc?.theme.accent ?? '#111111';
  const pageInkPrints = contrastRatio(pageInk, '#FFFFFF') >= 3;

  const usable = data.qrs.filter((q) => data.links.some((l) => l.id === q.linkId && !l.archivedAt));
  const [qrId, setQrId] = useState(usable[0]?.id ?? '');
  const [item, setItem] = useState<KitItem>('card');
  const [inkKind, setInkKind] = useState<'page' | 'black'>(pageInkPrints ? 'page' : 'black');
  const [details, setDetails] = useState<Omit<KitDetails, 'ink' | 'address'>>(() => ({
    name: current.name,
    line: '',
    phone: doc ? sellerPhone(doc) : '',
    message: 'Thank you for buying from us! Scan to reorder, track your order or leave a review.'
  }));
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const qr = usable.find((q) => q.id === qrId) ?? usable[0];
  const link = qr ? data.links.find((l) => l.id === qr.linkId) : undefined;
  // Small prints need the bare code — captions and frames from the designer would shrink it below scanning size.
  const style = useMemo(() => qr ? { ...styleOf(qr, initialsOf(current.name)), frame: 'none' as const, frameText: '' } : null, [qr, current.name]);
  const weak = style ? qrChecks(style).contrast.level === 'fail' : false;
  const kit: KitDetails = { ...details, ink: inkKind === 'page' ? pageInk : '#111111', address: link ? shortDisplay(mainHandle, link.slug, host) : '' };
  const spec = kitItems.find((k) => k.id === item)!;

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

  const nameError = details.name.trim() ? '' : 'Add the name customers know you by';
  const print = () => {
    if (!qrUrl || nameError || weak) return;
    if (!printKit(item, kit, qrUrl)) return toast.error('Your browser blocked the print window', { description: 'Allow pop-ups for KUBICU and try again.' });
    team.log('pages', `printed ${spec.label.toLowerCase()}`, '/app/domains/kit');
  };

  if (usable.length === 0)
  return (
    <div className="flex flex-col gap-6">
        <PageHeader title="Print kit" description="Business cards, stickers, package inserts and receipt footers that carry your QR code." />
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


  const scale = Math.min(1, PREVIEW_MAX / (spec.widthMm * MM), 460 / (spec.heightMm * MM));
  const w = spec.widthMm * MM;
  const h = spec.heightMm * MM;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Print kit" description="Business cards, stickers, package inserts and receipt footers that carry your QR code. Print at home or send the PDF to a print shop." />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex flex-col gap-8">
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
                      <span className="block text-caption text-fg-muted">{k.detail}</span>
                      <span className="block text-caption text-fg-subtle">{k.perSheet}</span>
                    </span>
                  </button>);

              })}
            </div>
          </section>

          <section aria-labelledby="kit-details" className="flex flex-col gap-4 border-t border-line pt-6">
            <h2 id="kit-details" className="text-heading font-semibold text-fg">
              Details
            </h2>
            <SelectInput<string>
              id="kit-qr"
              label="QR code"
              value={qr?.id ?? ''}
              onChange={setQrId}
              options={usable.map((q) => ({ value: q.id, label: data.links.find((l) => l.id === q.linkId)?.name ?? 'QR code' }))}
              hint={link ? `Opens ${shortDisplay(mainHandle, link.slug, host)} — scans are counted in Analytics.` : undefined} />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput id="kit-name" label="Business name" value={details.name} maxLength={40} onChange={(e) => setDetails({ ...details, name: e.target.value })} error={nameError || undefined} />
              <TextInput id="kit-phone" label="Phone or WhatsApp" value={details.phone} maxLength={24} onChange={(e) => setDetails({ ...details, phone: e.target.value })} hint="Optional" />
            </div>
            {item === 'card' && <TextInput id="kit-line" label="Second line" placeholder="e.g. Bespoke Ankara tailoring" value={details.line} maxLength={48} onChange={(e) => setDetails({ ...details, line: e.target.value })} hint="Optional — what you do, or your role" />}
            {(item === 'insert' || item === 'receipt') &&
            <TextArea id="kit-message" label="Message" rows={3} value={details.message} maxLength={160} onChange={(e) => setDetails({ ...details, message: e.target.value })} hint={`${details.message.length}/160`} />
            }
            <div>
              <p id="kit-ink" className="mb-2 text-label font-medium text-fg">
                Colour
              </p>
              <Segmented<'page' | 'black'>
                ariaLabel="Print colour"
                value={inkKind}
                onChange={setInkKind}
                options={[
                { value: 'page', label: 'Your page accent' },
                { value: 'black', label: 'Black only' }]
                } />
              
              {inkKind === 'page' && !pageInkPrints && <p className="mt-2 text-caption text-warning">Your accent is too light to read on white paper — black will print more clearly.</p>}
              <p className="mt-2 text-caption text-fg-subtle">The QR code keeps the colours from its design.</p>
            </div>
          </section>
        </div>

        <aside aria-labelledby="kit-preview" className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border border-line bg-raised">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 id="kit-preview" className="text-label font-semibold text-fg">
                Preview · actual design
              </h2>
              <span className="text-caption text-fg-subtle">
                {spec.widthMm} × {spec.heightMm} mm
              </span>
            </div>
            <div className="dot-stage flex min-h-[300px] items-center justify-center px-4 py-8">
              {qrUrl ?
              <div style={{ width: w * scale, height: h * scale }} className="shadow-lg">
                  <iframe
                  title={`${spec.label} preview`}
                  srcDoc={kitPreviewDoc(item, kit, qrUrl)}
                  style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left', border: 0, background: item === 'sticker' ? 'transparent' : '#fff' }}
                  tabIndex={-1} />
                
                </div> :

              <QrCodeIcon size={28} className="text-fg-subtle" aria-hidden />
              }
            </div>
            <div className="flex flex-col gap-3 border-t border-line p-4">
              {weak && <InlineAlert tone="danger" title="This QR code’s colours are too close to scan">Open it in QR codes and raise the contrast before printing.</InlineAlert>}
              <Button leadingIcon={PrinterIcon} fullWidth disabled={!can.allowed || !qrUrl || !!nameError || weak} title={can.allowed ? undefined : can.reason} onClick={print}>
                Print {spec.label.toLowerCase()}
              </Button>
              <p className="text-caption text-fg-subtle">Opens a print sheet ({spec.perSheet.toLowerCase()}). Choose “Save as PDF” to send it to a print shop. Print at 100% scale — don’t fit to page.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>);

}