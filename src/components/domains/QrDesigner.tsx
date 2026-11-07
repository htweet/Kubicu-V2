import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { DownloadIcon, ImagePlusIcon, PrinterIcon, Trash2Icon } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { Switch } from '../ui/Switch';
import { Segmented } from '../ui/Segmented';
import { Tabs } from '../ui/Tabs';
import { InlineAlert } from '../ui/InlineAlert';
import { DestinationSelect } from './DestinationSelect';
import { QrPreview } from './QrPreview';
import { useDomains } from '../../contexts/DomainsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useTeam } from '../../contexts/TeamContext';
import { useOps } from '../../contexts/OpsContext';
import { useOptionalMedia } from '../../contexts/MediaContext';
import { useMainLink } from '../../hooks/useMainLink';
import type { CampaignLink, QrCentreKind, QrDesign, QrErrorLevel, QrExportSize, QrEyeStyle, QrFrame, QrModuleStyle, QrSize } from '../../types/domains';
import { decodeDestination, destinationOptions, encodeDestination, shortDisplay, shortUrl, slugError, slugify } from '../../utils/domains/links';
import { downloadPng, downloadSvg, effectiveLevel, printFormats, printSheet, qrChecks, readCentreImage, styleOf, type PrintFormat, type QrStyle } from '../../utils/domains/qr';
import { MAIN_SPACE_ID } from '../../utils/spaces';
import { uid } from '../../utils/id';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Editing an existing code. */
  qr?: QrDesign;
  /** Making a code for an existing campaign link. */
  presetLink?: CampaignLink;
  /** “Get QR code” from a product, space, block or service: a new code already pointing there (D72). */
  presetDest?: string;
  presetName?: string;
}

type Section = 'link' | 'pattern' | 'centre' | 'caption' | 'export';

const presets: { fg: string; bg: string; label: string }[] = [
  { fg: '#111111', bg: '#FFFFFF', label: 'Black on white' },
  { fg: '#1E3A5F', bg: '#FFFFFF', label: 'Navy on white' },
  { fg: '#7A2E12', bg: '#FFF7ED', label: 'Clay on cream' },
  { fg: '#14532D', bg: '#F0FDF4', label: 'Green on mint' },
];

const levelInfo: Record<QrErrorLevel, string> = {
  L: 'Low — smallest code, ~7% can be damaged',
  M: 'Medium — standard, ~15%',
  Q: 'Quartile — ~25%, good for rough surfaces',
  H: 'High — ~30%, needed for a centre logo or text',
};

export function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'K'
  );
}

type Look = Omit<QrStyle, 'centreText'> & { centreText: string; exportSize: QrExportSize };

function lookFrom(qr: QrDesign | undefined, initials: string): Look {
  const s = styleOf(qr ?? { frameText: 'Scan to order' }, initials);
  return { ...s, centreText: qr?.centreText ?? '', exportSize: qr?.exportSize ?? 1024 };
}

/** Design, test and download a QR code that encodes a tracked short link (D62). */
export function QrDesigner({ open, onClose, qr, presetLink, presetDest, presetName }: Props) {
  const { t: tr } = useT();
  const { data, saveQr } = useDomains();
  const { current } = useWorkspace();
  const { data: commerce } = useCommerce();
  const { data: ops } = useOps();
  const team = useTeam();
  const media = useOptionalMedia();
  const { mainHandle, host } = useMainLink();
  const options = useMemo(() => destinationOptions(current, commerce, ops.services), [current, commerce, ops.services]);
  const existingLink = qr ? data.links.find((l) => l.id === qr.linkId) : presetLink;
  const initials = initialsOf(current.name);
  const fileRef = useRef<HTMLInputElement>(null);

  const [section, setSection] = useState<Section>('link');
  const [name, setName] = useState('');
  const [dest, setDest] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [look, setLook] = useState<Look>(() => lookFrom(undefined, initials));
  const [eyeMatches, setEyeMatches] = useState(true);
  const [format, setFormat] = useState<PrintFormat>('card');
  const [svg, setSvg] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSection('link');
    setName(existingLink?.name ?? presetName ?? '');
    setDest(existingLink ? encodeDestination(existingLink.destination) : presetDest && options.some((o) => o.value === presetDest) ? presetDest : (options[0]?.value ?? encodeDestination({ spaceId: MAIN_SPACE_ID, path: '' })));
    setSlug(existingLink?.slug ?? '');
    setSlugTouched(!!existingLink);
    const l = lookFrom(qr, initials);
    setLook(l);
    setEyeMatches(l.eyeColor.toUpperCase() === l.fg.toUpperCase());
    setTried(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, qr?.id, presetLink?.id, presetDest]);

  const set = (p: Partial<Look>) => setLook((l) => ({ ...l, ...p, ...(eyeMatches && p.fg ? { eyeColor: p.fg } : {}), ...(p.fg && l.captionColor === l.fg ? { captionColor: p.fg } : {}) }));
  const style: QrStyle = { ...look, centreText: look.centreKind === 'initials' ? initials : look.centreText };
  const checks = qrChecks(style);

  const effectiveSlug = slugTouched ? slug : slugify(name);
  const url = shortUrl(mainHandle, effectiveSlug || 'your-code', host);
  const filename = `kubicu-qr-${effectiveSlug || 'code'}`;
  const errors = {
    name: name.trim() ? undefined : 'Name it after where it’ll be printed, like “Market flyer”.',
    slug: existingLink ? undefined : slugError(effectiveSlug, data),
    dest: options.some((o) => o.value === dest) ? undefined : 'Choose where the code goes.',
  };
  const valid = !errors.name && !errors.slug && !errors.dest;
  const canDownload = !!svg && checks.contrast.level !== 'fail' && (existingLink ? true : !errors.slug);

  const save = () => {
    setTried(true);
    if (!valid) {
      setSection('link');
      return;
    }
    const link: CampaignLink = existingLink
      ? { ...existingLink, name: name.trim(), destination: decodeDestination(dest) }
      : { id: uid('lnk'), slug: effectiveSlug, name: name.trim(), source: 'qr', destination: decodeDestination(dest), createdAt: new Date().toISOString(), archivedAt: null };
    const design: QrDesign = {
      id: qr?.id ?? uid('qr'),
      linkId: link.id,
      createdAt: qr?.createdAt ?? new Date().toISOString(),
      fg: look.fg,
      bg: look.bg,
      centre: look.centreKind !== 'none',
      frameText: look.frameText.trim(),
      transparent: look.transparent,
      moduleStyle: look.moduleStyle,
      eyeStyle: look.eyeStyle,
      eyeColor: look.eyeColor,
      ecLevel: look.ecLevel,
      margin: look.margin,
      centreKind: look.centreKind,
      centreText: look.centreText.trim(),
      centreImage: look.centreKind === 'image' ? look.centreImage : '',
      centreSize: look.centreSize,
      captionPosition: look.captionPosition,
      captionColor: look.captionColor,
      captionSize: look.captionSize,
      frame: look.frame,
      exportSize: look.exportSize,
    };
    if (!saveQr(design, link)) return;
    team.log('pages', `${qr ? 'updated' : 'created'} the QR code “${link.name}”`, '/app/qr');
    toast.success(tr(qr ? 'QR code saved' : 'QR code created'), { description: tr('Scans show in Analytics and on Campaign links.') });
    onClose();
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const centreImage = await readCentreImage(file);
      set({ centreImage, centreKind: 'image' });
      // A logo for a QR code is a brand asset: keep a copy in Media → Brand assets.
      if (media?.available) void media.addDataUrl(centreImage, file.name.replace(/\.[^.]+$/, '') || 'QR centre image', '', 'brand').catch(() => undefined);
    } catch (e) {
      const why = (e as Error).message;
      toast.error(tr('Couldn’t use that image'), { description: tr(why === 'size' ? 'Choose an image under 5 MB.' : why === 'type' ? 'Choose a PNG, JPG, SVG or WebP image.' : 'Try another image.') });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="right"
      size="lg"
      title={qr ? 'Edit QR code' : 'New QR code'}
      description="Every scan opens a tracked link, so you can see what it brings in."
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{qr ? 'Save' : 'Create QR code'}</Button>
        </div>
      }
    >
      <div className="grid gap-8 p-5 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Tabs<Section>
            idPrefix="qr"
            ariaLabel="QR code settings"
            value={section}
            onChange={setSection}
            className="scroll-quiet -mx-1 overflow-x-auto overflow-y-hidden px-1"
            items={[
              { id: 'link', label: 'Link', badge: tried && !valid ? 1 : undefined },
              { id: 'pattern', label: 'Pattern' },
              { id: 'centre', label: 'Centre' },
              { id: 'caption', label: 'Caption' },
              { id: 'export', label: 'Export' },
            ]}
          />

          <div role="tabpanel" id={`qr-panel-${section}`} aria-labelledby={`qr-tab-${section}`} className="flex flex-col gap-5">
            {section === 'link' && (
              <>
                {!!presetDest && !qr && !options.some((o) => o.value === presetDest) && (
                  <InlineAlert tone="warning" title="That isn’t live yet">
                    {tr('Codes can only open what’s published. Publish it first, or pick somewhere else for now — you can change where the code goes later without reprinting.')}
                  </InlineAlert>
                )}
                <TextInput id="qr-name" label="Name" placeholder={tr('Market flyer, Shop counter…')} value={name} onChange={(e) => setName(e.target.value)} error={tried ? errors.name : undefined} />
                <DestinationSelect id="qr-dest" label="Opens" value={dest} options={options} onChange={setDest} error={tried ? errors.dest : undefined} hint="You can change this later without reprinting." />
                {existingLink ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-label font-medium text-fg">{tr('Encodes')}</span>
                    <p className="break-all text-label text-fg">{shortDisplay(mainHandle, existingLink.slug, host)}</p>
                    <p className="text-caption text-fg-subtle">{tr('Fixed — it may already be printed.')}</p>
                  </div>
                ) : (
                  <TextInput
                    id="qr-slug"
                    label="Short address"
                    prefix="…/s/"
                    value={effectiveSlug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(e.target.value.toLowerCase());
                    }}
                    error={errors.slug && (tried || slugTouched) ? errors.slug : undefined}
                    hint={`${shortDisplay(mainHandle, effectiveSlug || 'your-code', host)} · ${tr('fixed once created')}`}
                  />
                )}
              </>
            )}

            {section === 'pattern' && (
              <>
                <div className="flex flex-wrap gap-2" role="group" aria-label={tr('Colour presets')}>
                  {presets.map((p) => {
                    const on = p.fg === look.fg && p.bg === look.bg;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set({ fg: p.fg, bg: p.bg })}
                        className={cn('flex h-9 items-center gap-2 rounded-md border px-2.5 text-caption text-fg transition-colors duration-150 ease-out', on ? 'border-action bg-action-soft' : 'border-line hover:bg-sunken')}
                      >
                        <span aria-hidden className="h-4 w-4 rounded-sm border border-line" style={{ background: p.bg, boxShadow: `inset 0 0 0 4px ${p.bg}, inset 0 0 0 8px ${p.fg}` }} />
                        {tr(p.label)}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ColourInput id="qr-fg" label="Code colour" value={look.fg} onChange={(fg) => set({ fg })} />
                  <ColourInput id="qr-bg" label="Background" value={look.bg} onChange={(bg) => set({ bg })} disabled={look.transparent} />
                </div>
                <Switch id="qr-transparent" label="Transparent background" description="For printing straight onto packaging or a coloured flyer. PNG and SVG keep the transparency." checked={look.transparent} onChange={(transparent) => set({ transparent })} />
                <Choice<QrModuleStyle>
                  label="Squares"
                  value={look.moduleStyle}
                  onChange={(moduleStyle) => set({ moduleStyle })}
                  options={[
                    { value: 'square', label: 'Square' },
                    { value: 'rounded', label: 'Rounded' },
                    { value: 'dots', label: 'Dots' },
                  ]}
                />
                <Choice<QrEyeStyle>
                  label="Corner markers"
                  value={look.eyeStyle}
                  onChange={(eyeStyle) => set({ eyeStyle })}
                  options={[
                    { value: 'square', label: 'Square' },
                    { value: 'rounded', label: 'Rounded' },
                    { value: 'circle', label: 'Circle' },
                  ]}
                />
                <Switch
                  id="qr-eye-match"
                  label="Corner markers match the code colour"
                  checked={eyeMatches}
                  onChange={(on) => {
                    setEyeMatches(on);
                    if (on) setLook((l) => ({ ...l, eyeColor: l.fg }));
                  }}
                />
                {!eyeMatches && <ColourInput id="qr-eye" label="Corner marker colour" value={look.eyeColor} onChange={(eyeColor) => setLook((l) => ({ ...l, eyeColor }))} />}
                <SelectInput<QrErrorLevel>
                  id="qr-ec"
                  label="Error correction"
                  value={look.ecLevel}
                  options={(['L', 'M', 'Q', 'H'] as QrErrorLevel[]).map((v) => ({ value: v, label: levelInfo[v] }))}
                  onChange={(ecLevel) => set({ ecLevel })}
                  hint={effectiveLevel(style) !== look.ecLevel ? 'Using High while something sits in the centre.' : 'Higher survives scratches and folds, but makes the code denser.'}
                />
                <SelectInput<string>
                  id="qr-margin"
                  label="Border around the code"
                  value={String(look.margin)}
                  options={[1, 2, 3, 4, 6].map((v) => ({ value: String(v), label: `${v === 1 ? tr('1 square') : tr('{n} squares', { n: v })}${v === 2 ? ` (${tr('default')})` : v === 4 ? ` (${tr('print standard')})` : ''}` }))}
                  onChange={(v) => set({ margin: Number(v) })}
                />
              </>
            )}

            {section === 'centre' && (
              <>
                <Choice<QrCentreKind>
                  label="In the middle"
                  value={look.centreKind}
                  onChange={(centreKind) => set({ centreKind })}
                  options={[
                    { value: 'none', label: 'Nothing' },
                    { value: 'initials', label: initials },
                    { value: 'text', label: 'Text' },
                    { value: 'image', label: 'Image' },
                  ]}
                />
                {look.centreKind === 'initials' && <p className="text-caption text-fg-muted">{tr('Your workspace initials. Changes if you rename the workspace.')}</p>}
                {look.centreKind === 'text' && (
                  <TextInput id="qr-centre-text" label="Centre text" maxLength={8} placeholder="SCAN, MENU, ₦…" value={look.centreText} onChange={(e) => set({ centreText: e.target.value })} hint={`${look.centreText.length}/8 · ${tr('short words scan best')}`} />
                )}
                {look.centreKind === 'image' && (
                  <div className="flex flex-col gap-2">
                    <span className="text-label font-medium text-fg">{tr('Centre image')}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-sunken">
                        {look.centreImage ? <img src={look.centreImage} alt={tr('Centre image')} className="h-full w-full object-cover" /> : <ImagePlusIcon size={20} className="text-fg-subtle" aria-hidden />}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" leadingIcon={ImagePlusIcon} loading={uploading} onClick={() => fileRef.current?.click()}>
                          {look.centreImage ? 'Replace' : 'Upload image'}
                        </Button>
                        {look.centreImage && (
                          <Button size="sm" variant="tertiary" leadingIcon={Trash2Icon} onClick={() => set({ centreImage: '' })}>
                            Remove
                          </Button>
                        )}
                      </div>
                      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => upload(e.target.files?.[0])} />
                    </div>
                    <p className="text-caption text-fg-subtle">{tr('Your logo works best: simple, square, high contrast. Shrunk to fit — up to 5 MB.')}</p>
                  </div>
                )}
                {look.centreKind !== 'none' && (
                  <Choice<QrSize>
                    label="Centre size"
                    value={look.centreSize}
                    onChange={(centreSize) => set({ centreSize })}
                    options={[
                      { value: 'sm', label: 'Small' },
                      { value: 'md', label: 'Medium' },
                      { value: 'lg', label: 'Large' },
                    ]}
                  />
                )}
              </>
            )}

            {section === 'caption' && (
              <>
                <TextInput id="qr-frame" label="Caption" optional maxLength={40} value={look.frameText} onChange={(e) => set({ frameText: e.target.value })} hint="Tell people what they get: “Scan to order”, “See today’s menu”." />
                <Choice<'top' | 'bottom'>
                  label="Position"
                  value={look.captionPosition}
                  onChange={(captionPosition) => set({ captionPosition })}
                  options={[
                    { value: 'top', label: 'Above' },
                    { value: 'bottom', label: 'Below' },
                  ]}
                />
                <Choice<QrSize>
                  label="Caption size"
                  value={look.captionSize}
                  onChange={(captionSize) => set({ captionSize })}
                  options={[
                    { value: 'sm', label: 'Small' },
                    { value: 'md', label: 'Medium' },
                    { value: 'lg', label: 'Large' },
                  ]}
                />
                <ColourInput id="qr-caption-colour" label={look.frame === 'banner' ? 'Banner colour' : 'Caption colour'} value={look.captionColor} onChange={(captionColor) => setLook((l) => ({ ...l, captionColor }))} />
                <Choice<QrFrame>
                  label="Frame"
                  value={look.frame}
                  onChange={(frame) => set({ frame })}
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'border', label: 'Outline' },
                    { value: 'banner', label: 'Banner' },
                  ]}
                />
                {look.frame === 'banner' && !look.frameText.trim() && <p className="text-caption text-fg-muted">{tr('Add a caption to show the banner.')}</p>}
              </>
            )}

            {section === 'export' && (
              <>
                <Choice<string>
                  label="PNG size"
                  value={String(look.exportSize)}
                  onChange={(v) => set({ exportSize: Number(v) as QrExportSize })}
                  options={[
                    { value: '512', label: '512 px' },
                    { value: '1024', label: '1024 px' },
                    { value: '2048', label: '2048 px' },
                  ]}
                />
                <p className="-mt-3 text-caption text-fg-subtle">{tr('2048 px for posters and banners. SVG scales to any size — best for print shops.')}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" leadingIcon={DownloadIcon} disabled={!canDownload} onClick={() => svg && downloadPng(svg, filename, look.exportSize).catch(() => toast.error(tr('Couldn’t make the PNG — try SVG.')))}>
                    PNG
                  </Button>
                  <Button variant="secondary" leadingIcon={DownloadIcon} disabled={!canDownload} onClick={() => svg && downloadSvg(svg, filename)}>
                    SVG
                  </Button>
                </div>
                <div className="flex flex-col gap-2 border-t border-line pt-4">
                  <SelectInput<PrintFormat> id="qr-format" label="Print sheet" value={format} options={printFormats.map((f) => ({ value: f.id, label: f.label }))} onChange={setFormat} hint={tr(printFormats.find((f) => f.id === format)?.detail ?? '')} />
                  <Button
                    variant="secondary"
                    leadingIcon={PrinterIcon}
                    disabled={!canDownload}
                    className="self-start"
                    onClick={() => {
                      if (svg && !printSheet(svg, format, name || current.name, shortDisplay(mainHandle, effectiveSlug, host))) toast.error(tr('Your browser blocked the print window'), { description: tr('Allow pop-ups for KUBICU and try again.') });
                    }}
                  >
                    Print
                  </Button>
                </div>
                {checks.contrast.level === 'fail' && <p className="text-caption text-danger">{tr('Downloads are off until the code has enough contrast.')}</p>}
              </>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-3 md:sticky md:top-0 md:self-start" aria-label={tr('Preview and checks')}>
          <div className="rounded-lg border border-line p-3" style={{ background: look.transparent ? undefined : look.bg }}>
            <QrPreview url={url} style={style} alt={tr('QR code for {name}', { name: url })} onReady={setSvg} />
          </div>
          <InlineAlert tone={checks.contrast.level === 'fail' ? 'danger' : checks.contrast.level === 'warn' ? 'warning' : 'success'} title={`${tr('Contrast')} ${checks.ratio.toFixed(1)}:1`}>
            {tr(checks.contrast.message)}
          </InlineAlert>
          {checks.others.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {checks.others.map((c) => (
                <li key={c.message} className="text-caption text-fg-muted">
                  {tr(c.message)}
                </li>
              ))}
            </ul>
          )}
          <p className="text-caption text-fg-subtle">{tr('Test it with your phone camera before printing. In this prototype the kub.icu address isn’t hosted — use “Open” on Campaign links to simulate a scan.')}</p>
          {section !== 'export' && (
            <Button size="sm" variant="tertiary" leadingIcon={DownloadIcon} className="self-start" onClick={() => setSection('export')}>
              Download or print
            </Button>
          )}
        </aside>
      </div>
    </Sheet>
  );
}

function Choice<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  label = useT().t(label);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-label font-medium text-fg">{label}</span>
      <Segmented<T> ariaLabel={label} fullWidth size="sm" value={value} onChange={onChange} options={options} />
    </div>
  );
}

function ColourInput({ id, label, value, onChange, disabled }: { id: string; label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  label = useT().t(label);
  return (
    <div className={cn('flex flex-col gap-1.5', disabled && 'opacity-50')}>
      <label htmlFor={id} className="text-label font-medium text-fg">
        {label}
      </label>
      <div className="flex h-10 items-center gap-2 rounded-md border border-line-strong bg-field px-2">
        <input id={id} type="color" disabled={disabled} value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent p-0 disabled:cursor-not-allowed" />
        <span className="font-mono text-caption text-fg-muted">{value.toUpperCase()}</span>
      </div>
    </div>
  );
}
