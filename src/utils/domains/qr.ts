import qrcode from 'qrcode-generator';
import { contrastRatio, luminance } from '../contrast';
import type { QrCentreKind, QrDesign, QrErrorLevel, QrEyeStyle, QrFrame, QrModuleStyle, QrSize } from '../../types/domains';

/** Everything that changes how a code looks. */
export interface QrStyle {
  fg: string;
  bg: string;
  transparent: boolean;
  moduleStyle: QrModuleStyle;
  eyeStyle: QrEyeStyle;
  eyeColor: string;
  ecLevel: QrErrorLevel;
  margin: number;
  centreKind: QrCentreKind;
  /** Initials or the owner's own short text. */
  centreText: string;
  centreImage: string;
  centreSize: QrSize;
  frameText: string;
  captionPosition: 'top' | 'bottom';
  captionColor: string;
  captionSize: QrSize;
  frame: QrFrame;
}

/** Fills in defaults so codes made before the full designer look exactly as they did. */
export function styleOf(d: Partial<QrDesign>, initials: string): QrStyle {
  const kind: QrCentreKind = d.centreKind ?? (d.centre === false ? 'none' : 'initials');
  const fg = d.fg ?? '#111111';
  return {
    fg,
    bg: d.bg ?? '#FFFFFF',
    transparent: !!d.transparent,
    moduleStyle: d.moduleStyle ?? 'square',
    eyeStyle: d.eyeStyle ?? 'square',
    eyeColor: d.eyeColor ?? fg,
    ecLevel: d.ecLevel ?? 'M',
    margin: d.margin ?? 2,
    centreKind: kind,
    centreText: kind === 'initials' ? initials : d.centreText ?? '',
    centreImage: d.centreImage ?? '',
    centreSize: d.centreSize ?? 'md',
    frameText: d.frameText ?? '',
    captionPosition: d.captionPosition ?? 'bottom',
    captionColor: d.captionColor ?? fg,
    captionSize: d.captionSize ?? 'md',
    frame: d.frame ?? 'none'
  };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Something in the middle needs the strongest error correction to stay scannable. */
export function effectiveLevel(s: Pick<QrStyle, 'ecLevel' | 'centreKind'>): QrErrorLevel {
  return s.centreKind === 'none' ? s.ecLevel : 'H';
}

export const centreRatio: Record<QrSize, number> = { sm: 0.18, md: 0.23, lg: 0.28 };
const captionFont: Record<QrSize, number> = { sm: 48, md: 64, lg: 84 };

export interface QrCheck {
  level: 'ok' | 'warn' | 'fail';
  message: string;
}

/** Scannability checks (D62). `fail` blocks downloads; `warn` explains the risk. */
export function qrChecks(s: QrStyle): {ratio: number;contrast: QrCheck;others: QrCheck[];} {
  const surface = s.transparent ? '#FFFFFF' : s.bg;
  const ratio = Math.min(contrastRatio(s.fg, surface), contrastRatio(s.eyeColor, surface));
  let contrast: QrCheck;
  if (ratio < 3) contrast = { level: 'fail', message: 'Too little contrast to scan reliably. Make the code darker or the background lighter.' };else
  if (luminance(s.fg) > luminance(surface)) contrast = { level: 'warn', message: 'Light code on a dark background — some phone cameras can’t read inverted codes.' };else
  if (ratio < 4.5) contrast = { level: 'warn', message: 'Scans in good light. More contrast helps in dim markets and shops.' };else
  contrast = { level: 'ok', message: 'Good contrast — scans easily.' };

  const others: QrCheck[] = [];
  if (s.transparent) others.push({ level: 'warn', message: 'Transparent background: contrast is checked against white. Print it on a plain, light surface.' });
  if (s.margin < 2) others.push({ level: 'warn', message: 'A border under 2 squares can stop phones finding the code. Leave space around it when printing.' });
  if (s.moduleStyle === 'dots' && s.ecLevel === 'L' && s.centreKind === 'none') others.push({ level: 'warn', message: 'Dots with low error correction scan less reliably — choose Medium or higher.' });
  if (s.centreKind !== 'none' && s.centreSize === 'lg') others.push({ level: 'warn', message: 'A large centre covers more of the code. Test it with a few phones before printing.' });
  if (s.centreKind === 'image' && !s.centreImage) others.push({ level: 'warn', message: 'Upload an image for the centre, or choose another option.' });
  if (s.centreKind === 'text' && !s.centreText.trim()) others.push({ level: 'warn', message: 'Type the text for the centre, or choose another option.' });
  return { ratio, contrast, others };
}

/** Kept for earlier callers: contrast of a code colour on a background. */
export function qrContrast(fg: string, bg: string) {
  const c = qrChecks(styleOf({ fg, bg }, '')).contrast;
  return { ratio: contrastRatio(fg, bg), ...c };
}

function roundedRect(x: number, y: number, w: number, h: number, r: number): string {
  const k = Math.min(r, w / 2, h / 2);
  if (k <= 0) return `M${x} ${y}h${w}v${h}h${-w}z`;
  return `M${x + k} ${y}h${w - 2 * k}a${k} ${k} 0 0 1 ${k} ${k}v${h - 2 * k}a${k} ${k} 0 0 1 ${-k} ${k}h${-(w - 2 * k)}a${k} ${k} 0 0 1 ${-k} ${-k}v${-(h - 2 * k)}a${k} ${k} 0 0 1 ${k} ${-k}z`;
}

function circle(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
}

/** One finder pattern ("eye") at module position x, y. */
function eye(x: number, y: number, style: QrEyeStyle): {ring: string;dot: string;} {
  if (style === 'circle') return { ring: circle(x + 3.5, y + 3.5, 3.5) + circle(x + 3.5, y + 3.5, 2.5), dot: circle(x + 3.5, y + 3.5, 1.5) };
  const r = style === 'rounded' ? 1 : 0;
  return { ring: roundedRect(x, y, 7, 7, r * 1.8) + roundedRect(x + 1, y + 1, 5, 5, r * 1.2), dot: roundedRect(x + 2, y + 2, 3, 3, r * 0.8) };
}

/** A finished SVG: the code, its eyes, optional centre text or image, optional caption and frame. */
export async function qrSvg(url: string, s: QrStyle): Promise<string> {
  const qr = qrcode(0, effectiveLevel(s));
  qr.addData(url);
  qr.make();
  const n = qr.getModuleCount();
  const m = Math.max(0, Math.min(6, Math.round(s.margin)));
  const size = n + m * 2;

  // Squares under the centre are left out so text or a logo sits on a clean patch.
  const hasCentre = s.centreKind !== 'none' && (s.centreKind === 'image' ? !!s.centreImage : !!s.centreText.trim());
  const ratio = centreRatio[s.centreSize];
  const cb = ratio * size;
  const c0 = (size - cb) / 2 - 0.5;
  const c1 = (size + cb) / 2 + 0.5;
  const isEye = (r: number, c: number) => r < 7 && c < 7 || r < 7 && c >= n - 7 || r >= n - 7 && c < 7;

  let squares = '';
  let shapes = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.isDark(r, c) || isEye(r, c)) continue;
      const x = c + m;
      const y = r + m;
      if (hasCentre && x + 1 > c0 && x < c1 && y + 1 > c0 && y < c1) continue;
      if (s.moduleStyle === 'square') squares += `M${x} ${y}h1v1h-1z`;else
      if (s.moduleStyle === 'dots') shapes += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.45"/>`;else
      shapes += `<rect x="${x + 0.04}" y="${y + 0.04}" width="0.92" height="0.92" rx="0.32"/>`;
    }
  }
  const eyes = [
  [m, m],
  [m + n - 7, m],
  [m, m + n - 7]].
  map(([x, y]) => eye(x, y, s.eyeStyle));

  const code =
  `<g fill="${s.fg}">${squares ? `<path d="${squares}"/>` : ''}${shapes}</g>` +
  `<path fill="${s.eyeColor}" fill-rule="evenodd" d="${eyes.map((e) => e.ring).join('')}"/>` +
  `<path fill="${s.eyeColor}" d="${eyes.map((e) => e.dot).join('')}"/>`;

  // Layout in a 1000-wide canvas.
  const S = 1000;
  const pad = s.frame === 'border' ? 44 : s.frame === 'banner' ? 28 : 0;
  const caption = s.frameText.trim().slice(0, 40);
  const font = captionFont[s.captionSize];
  const capH = caption ? Math.round(font * 2.1) : 0;
  const W = S + pad * 2;
  const H = S + capH + pad * 2;
  const codeY = pad + (caption && s.captionPosition === 'top' ? capH : 0);
  const capY = s.captionPosition === 'top' ? pad : pad + S;
  const backdrop = s.transparent ? '#FFFFFF' : s.bg;

  let centre = '';
  if (hasCentre) {
    const box = ratio * S;
    const bx = pad + (S - box) / 2;
    const by = codeY + (S - box) / 2;
    centre += `<rect x="${bx}" y="${by}" width="${box}" height="${box}" rx="${box * 0.18}" fill="${backdrop}"/>`;
    if (s.centreKind === 'image') {
      const inset = box * 0.1;
      centre +=
      `<clipPath id="qrc"><rect x="${bx + inset}" y="${by + inset}" width="${box - inset * 2}" height="${box - inset * 2}" rx="${box * 0.12}"/></clipPath>` +
      `<image href="${esc(s.centreImage)}" x="${bx + inset}" y="${by + inset}" width="${box - inset * 2}" height="${box - inset * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#qrc)"/>`;
    } else {
      const text = s.centreText.trim().slice(0, 8);
      const fs = Math.min(box * 0.42, box * 1.55 / Math.max(1, text.length));
      centre += `<text x="${bx + box / 2}" y="${by + box / 2}" dy="0.35em" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="${fs}" fill="${s.fg}">${esc(text)}</text>`;
    }
  }

  let frame = '';
  let captionSvg = '';
  if (caption) {
    if (s.frame === 'banner') {
      frame += `<rect x="${pad}" y="${capY + 8}" width="${S}" height="${capH - 16}" rx="28" fill="${s.captionColor}"/>`;
      captionSvg = `<text x="${W / 2}" y="${capY + capH / 2}" dy="0.35em" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="${font}" fill="${backdrop}">${esc(caption)}</text>`;
    } else {
      captionSvg = `<text x="${W / 2}" y="${capY + capH / 2}" dy="0.35em" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="600" font-size="${font}" fill="${s.captionColor}">${esc(caption)}</text>`;
    }
  }
  if (s.frame === 'border') frame += `<rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="48" fill="none" stroke="${s.fg}" stroke-width="20"/>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` + (
    s.transparent ? '' : `<rect width="${W}" height="${H}" fill="${s.bg}"/>`) +
    `<svg x="${pad}" y="${codeY}" width="${S}" height="${S}" viewBox="0 0 ${size} ${size}" shape-rendering="${s.moduleStyle === 'square' && s.eyeStyle === 'square' ? 'crispEdges' : 'geometricPrecision'}">${code}</svg>` +
    centre +
    frame +
    captionSvg +
    `</svg>`);

}

export const svgDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

function save(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadSvg(svg: string, filename: string) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  save(url, `${filename}.svg`);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** PNG at `width` pixels wide (height follows the design). */
export function downloadPng(svg: string, filename: string, width = 1024): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w0 = img.naturalWidth || 1000;
      const h0 = img.naturalHeight || 1000;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = Math.round(h0 / w0 * width);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('no canvas'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      save(canvas.toDataURL('image/png'), `${filename}.png`);
      resolve();
    };
    img.onerror = () => reject(new Error('render failed'));
    img.src = svgDataUrl(svg);
  });
}

/** Shrinks an uploaded picture to a small square-ish PNG so it can live inside the code. */
export function readCentreImage(file: File, max = 240): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('type'));
    if (file.size > 5 * 1024 * 1024) return reject(new Error('size'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export type PrintFormat = 'card' | 'poster' | 'tent';

export const printFormats: {id: PrintFormat;label: string;detail: string;}[] = [
{ id: 'card', label: 'A6 card', detail: '105 × 148 mm — counters and packages' },
{ id: 'poster', label: 'A4 poster', detail: 'Walls, windows and stalls' },
{ id: 'tent', label: 'Table tent', detail: 'A4 folded in half — tables and shelves' }];


/** Opens a print-ready sheet in a new window. Returns false if the browser blocked it. */
export function printSheet(svg: string, format: PrintFormat, title: string, address: string): boolean {
  const w = window.open('', '_blank', 'width=800,height=900');
  if (!w) return false;
  const img = `<img src="${svgDataUrl(svg)}" alt="QR code"/>`;
  const page =
  format === 'card' ?
  { size: 'A6', body: `<div class="one">${img}<p>${esc(address)}</p></div>` } :
  format === 'poster' ?
  { size: 'A4', body: `<div class="one big"><h1>${esc(title)}</h1>${img}<p>${esc(address)}</p></div>` } :
  { size: 'A4 landscape', body: `<div class="tent"><div class="half flip">${img}</div><div class="half">${img}</div></div>` };
  w.document.write(`<!doctype html><html><head><title>${esc(title)} — print</title><style>
@page{size:${page.size};margin:10mm}
html,body{margin:0;font-family:Inter,Arial,sans-serif;color:#111}
.one{display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100vh - 2px);gap:6mm}
.one img{width:80%;max-height:75vh;object-fit:contain}
.big h1{font-size:28pt;margin:0;text-align:center}
.one p{font-size:11pt;margin:0;color:#444}
.tent{display:flex;flex-direction:column;height:calc(100vh - 2px)}
.half{flex:1;display:flex;align-items:center;justify-content:center;border-bottom:1px dashed #bbb}
.half:last-child{border:0}
.half img{height:85%;object-fit:contain}
.flip{transform:rotate(180deg)}
</style></head><body>${page.body}<script>window.onload=function(){setTimeout(function(){window.print()},200)}</script></body></html>`);
  w.document.close();
  return true;
}