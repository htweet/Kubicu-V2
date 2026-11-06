import type { KitDetails, KitFont, KitItem, KitPaper, KitStyle, KitTone } from './printKit';
import { contrastRatio, mixHex } from '../contrast';

/** HTML and CSS for every printed piece (D118, D119, type refresh D238). Sizes are in millimetres so print matches the preview. */

/** Self-hosted (scripts/build-fonts.mjs). Absolute, because kit documents open in new windows and frames. */
export const kitFontsUrl = (): string => `${window.location.origin}/fonts/print-kit.css`;

const families: Record<KitFont, string> = {
  modern: "'Inter', Arial, sans-serif",
  elegant: "'Playfair Display', Georgia, serif",
  friendly: "'Nunito', Arial, sans-serif",
  heritage: "'Libre Baskerville', Georgia, serif"
};

const tones: Record<KitTone, string> = {
  natural: 'none',
  warm: 'sepia(0.22) saturate(1.18) brightness(1.02)',
  bw: 'grayscale(1) contrast(1.06)'
};

/** Pieces that have a Photo design. Receipts (black-only thermal), stamp cards and labels don't. */
export const PHOTO_ITEMS = new Set<KitItem>(['card', 'sticker', 'insert', 'hangtag', 'voucher', 'flyer', 'counter']);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const img = (src: string) => esc(src);
const num = (v: number | undefined, fallback: number, min: number, max: number) => typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

export function paperColour(paper: KitPaper, ink: string): string {
  return paper === 'cream' ? '#FBF6EC' : paper === 'tint' ? mixHex(ink, '#FFFFFF', 0.92) : '#FFFFFF';
}

/** Text that sits on the ink colour: white unless the ink is too light for it. */
export function onInk(ink: string): string {
  return contrastRatio('#FFFFFF', ink) >= 3 ? '#FFFFFF' : '#111111';
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : (parts[0] ?? 'K').slice(0, 2)).toUpperCase();
}

function vars(d: KitDetails): string {
  const paper = paperColour(d.paper, d.ink);
  const scales = `--ns:${num(d.nameScale, 1, 0.7, 1.6)};--ts:${num(d.textScale, 1, 0.8, 1.4)};--qs:${num(d.qrScale, 1, 0.8, 1.3)};--ls:${num(d.logoScale, 1, 0.6, 1.6)};--ss:${num(d.sigScale, 1, 0.5, 1.8)}`;
  return `--ink:${esc(d.ink)};--on-ink:${onInk(d.ink)};--paper:${paper};--body:${mixHex('#111111', paper, 0.12)};--muted:${mixHex('#111111', paper, 0.34)};--rule:${mixHex(d.ink, paper, 0.7)};--tint:${mixHex(d.ink, paper, 0.9)};--font:${families[d.font]};${scales}`;
}

/** Photo style only applies when there's a photo to lead with, and only on pieces that have one. */
export function kitStyleOf(item: KitItem, d: KitDetails): KitStyle {
  if (d.style !== 'photo') return d.style;
  return d.photo && PHOTO_ITEMS.has(item) ? 'photo' : 'classic';
}

const logo = (d: KitDetails, cls = 'logo') => d.logo ? `<img class="${cls}" src="${img(d.logo)}" alt=""/>` : `<span class="mono ${cls}">${esc(initials(d.name))}</span>`;
const qr = (src: string, cls = 'qr') => `<img class="${cls}" src="${img(src)}" alt="QR code"/>`;
/** A QR code inside four corner marks — a clear "scan here" target. */
const framedQr = (src: string) => `<div class="frame"><span class="c tl"></span><span class="c tr"></span><span class="c bl"></span><span class="c br"></span>${qr(src)}</div>`;

/** The photo, cropped to its frame: zoom towards the chosen focus point, plus an optional tone. */
function photoEl(d: KitDetails): string {
  if (!d.photo) return '';
  const x = num(d.photoX, 50, 0, 100);
  const y = num(d.photoY, 50, 0, 100);
  const z = num(d.photoZoom, 1, 1, 2.5);
  return `<div class="ph"><img class="phi" src="${img(d.photo)}" alt="" style="object-position:${x}% ${y}%;transform-origin:${x}% ${y}%;transform:scale(${z});filter:${tones[d.photoTone] ?? 'none'}"/></div>`;
}

function contactRows(d: KitDetails, withEmail = true): string {
  const rows: [string, string][] = [];
  if (d.phone) rows.push(['T', d.phone]);
  if (d.social) rows.push(['@', d.social.replace(/^@/, '')]);
  if (withEmail && d.email) rows.push(['E', d.email]);
  if (d.address) rows.push(['W', d.address]);
  return rows.map(([k, v]) => `<span class="row"><span class="k">${k}</span>${esc(v)}</span>`).join('');
}

const signature = (d: KitDetails) =>
d.signature || d.signer ? `<div class="sign">${d.signature ? `<img class="sig" src="${img(d.signature)}" alt="Signature"/>` : ''}${d.signer ? `<span class="signer">${esc(d.signer)}</span>` : ''}</div>` : '';

/** Curved lettering for round stickers, sized to fit the arc (the name size can grow short names). */
function stickerArc(top: string, bottom: string, ns: number): string {
  const size = (t: string, max: number) => Math.max(5.6, Math.min(max * ns, 190 / Math.max(t.length, 1)));
  return `<svg class="arc" viewBox="0 0 100 100" aria-hidden="true"><defs><path id="kt" d="M 15,50 A 35,35 0 0 1 85,50"/><path id="kb" d="M 11,50 A 39,39 0 0 0 89,50"/></defs><circle cx="12.4" cy="50" r="1.3"/><circle cx="87.6" cy="50" r="1.3"/><text style="font-size:${size(top, 10)}px;font-weight:800;letter-spacing:0.05em"><textPath href="#kt" startOffset="50%" text-anchor="middle">${esc(top.toUpperCase())}</textPath></text>${bottom ? `<text style="font-size:${size(bottom, 6.6)}px;font-weight:700;letter-spacing:0.16em"><textPath href="#kb" startOffset="50%" text-anchor="middle">${esc(bottom.toUpperCase())}</textPath></text>` : ''}</svg>`;
}

export function kitItemHtml(item: KitItem, d: KitDetails, qrSrc: string): string {
  const s = kitStyleOf(item, d);
  const root = (cls: string, inner: string) => `<div class="item ${cls} s-${s}" style="${vars(d)}">${inner}</div>`;
  const name = `<p class="name">${esc(d.name)}</p>`;
  const photo = photoEl(d);
  const ns = num(d.nameScale, 1, 0.7, 1.6);

  switch (item) {
    case 'card':
      return root(
        'card',
        `${s === 'photo' ? photo : ''}<span class="bar"></span><div class="text"><div class="brand">${logo(d)}<div class="bt">${name}${d.line ? `<p class="line">${esc(d.line)}</p>` : ''}</div></div><div class="meta">${contactRows(d)}</div></div><div class="qrbox">${qr(qrSrc)}<span class="cap">Scan me</span></div>`
      );
    case 'sticker':
      return root(
        'sticker',
        `${s === 'photo' ? `${photo}<span class="veil"></span>` : ''}${s === 'minimal' ? '' : stickerArc(d.name, d.line || 'Scan me', ns)}<div class="core">${qr(qrSrc)}</div>${s === 'minimal' ? `<p class="name">${esc(d.name)}</p>` : ''}`
      );
    case 'insert':
      return root(
        'insert',
        `<div class="head">${d.photo && s !== 'minimal' ? photo : ''}<div class="brand">${logo(d)}${name}</div></div><div class="body">${d.message ? `<p class="eyebrow">A note from us</p><p class="msg">${esc(d.message)}</p>` : ''}${signature(d)}<div class="qrwrap">${framedQr(qrSrc)}<p class="cta">Scan to reorder, track or review</p></div><p class="foot">${[d.social && `@${d.social.replace(/^@/, '')}`, d.address].filter(Boolean).map((v) => esc(v as string)).join(' · ')}</p></div>`
      );
    case 'receipt':
      return root('receipt', `<div class="brand">${logo(d)}${name}</div>${d.message ? `<p class="msg">${esc(d.message)}</p>` : ''}${qr(qrSrc)}<p class="foot">${[d.address, d.phone, d.social && `@${d.social.replace(/^@/, '')}`].filter(Boolean).map((v) => esc(v as string)).join('<br/>')}</p>`);
    case 'hangtag':
      return root(
        'hangtag',
        `${s === 'photo' ? photo : ''}<span class="hole"></span><div class="top">${logo(d)}${name}${d.line ? `<p class="line">${esc(d.line)}</p>` : ''}</div><div class="fill"><span>Size</span><i></i><span>Price&nbsp;₦</span><i></i></div><div class="qrbox">${qr(qrSrc)}<span class="cap">Scan to reorder</span></div>`
      );
    case 'voucher':
      return root(
        'voucher',
        `<div class="panel">${s === 'photo' ? photo : ''}<div class="pin"><p class="kicker">${esc(d.headline || 'Gift voucher')}</p><p class="offer">${esc(d.offer || 'Your offer')}</p>${d.expiry ? `<p class="exp">Valid until ${esc(d.expiry)}</p>` : ''}</div></div><div class="side"><div class="brand">${logo(d)}${name}</div>${d.message ? `<p class="msg">${esc(d.message)}</p>` : ''}<div class="bottom"><div class="left">${d.code ? `<p class="code"><span>Code</span>${esc(d.code)}</p>` : '<p class="code blank"><span>Code</span>&nbsp;</p>'}${signature(d)}</div><div class="qrbox">${qr(qrSrc)}<span class="cap">Scan to redeem</span></div></div></div>`
      );
    case 'flyer':
      return root(
        'flyer',
        `<div class="hero">${d.photo ? photo : `<div class="mark">${logo(d, 'logo big')}</div>`}${d.offer ? `<span class="pill">${esc(d.offer)}</span>` : ''}</div><div class="body"><div class="brand">${d.photo ? logo(d) : ''}${name}</div><h1 class="hl">${esc(d.headline || d.line || 'Now taking orders')}</h1>${d.message ? `<p class="msg">${esc(d.message)}</p>` : ''}<div class="bottom">${qr(qrSrc)}<div class="info"><p class="cta">Scan to order</p><div class="meta">${contactRows(d, false)}</div></div></div></div>`
      );
    case 'counter':
      return root(
        'counter',
        `${s === 'photo' ? `${photo}<span class="veil"></span>` : ''}<div class="brand">${logo(d)}${name}</div><h1 class="hl">${esc(d.headline || 'Scan to see what’s available and order')}</h1>${framedQr(qrSrc)}${d.message ? `<p class="msg">${esc(d.message)}</p>` : ''}<p class="foot">${[d.phone && `WhatsApp ${d.phone}`, d.address].filter(Boolean).map((v) => esc(v as string)).join(' · ')}</p>`
      );
    case 'stamp':{
        const n = [6, 8, 10].includes(d.stamps) ? d.stamps : 10;
        const dots = Array.from({ length: n }, (_, i) => i === n - 1 ? '<span class="st free">FREE</span>' : `<span class="st">${i + 1}</span>`).join('');
        return root(
          'stamp',
          `<div class="top"><div class="brand">${logo(d)}<div class="bt">${name}${d.line ? `<p class="line">${esc(d.line)}</p>` : ''}</div></div>${qr(qrSrc)}</div><p class="rw">Collect ${n - 1} stamps, get <b>${esc(d.reward || 'your reward')}</b></p><div class="grid g${n}">${dots}</div>`
        );
      }
    case 'label':
      return root(
        'label',
        `<div class="hd"><div class="brand">${logo(d)}<div class="bt"><span class="k2">From</span>${name}${d.phone ? `<p class="line">${esc(d.phone)}</p>` : ''}</div></div><div class="ord"><span>Order no.</span><i></i></div></div><div class="to"><span class="k2">Deliver to</span>${['Name', 'Phone', 'Address', '', 'Nearest landmark'].
        map((l) => `<div class="ln"><span>${l}</span><i></i></div>`).
        join('')}</div>${d.note ? `<p class="note">${esc(d.note)}</p>` : ''}<div class="ft">${qr(qrSrc)}<div class="info"><p class="cta">Scan to track, reorder or review</p><div class="meta">${contactRows(d, false)}</div></div></div>`
      );
  }
}

/** Back of a business card: brand-led, no QR (the front carries it). */
export function kitCardBackHtml(d: KitDetails): string {
  const s = kitStyleOf('card', d);
  const photo = s === 'photo' && d.photo ? `${photoEl(d)}<span class="veil"></span>` : '';
  return `<div class="item card back s-${s}" style="${vars(d)}">${photo}<div class="bc">${logo(d, 'logo big')}<p class="name">${esc(d.name)}</p>${d.line ? `<p class="line">${esc(d.line)}</p>` : ''}${d.social ? `<p class="soc">@${esc(d.social.replace(/^@/, ''))}</p>` : ''}</div></div>`;
}

/**
 * Wires the size controls into the stylesheet: every font size follows the text (or name) size,
 * logos follow the logo size, signatures the signature size and QR codes the QR size.
 */
function scaleCss(css: string): string {
  const mul = (body: string, props: string[], v: string) =>
  body.replace(new RegExp(`(^|;)(${props.join('|')}):([\\d.]+)(mm|pt|px)`, 'g'), (_m, pre: string, p: string, n: string, u: string) => `${pre}${p}:calc(${n}${u} * var(${v},1))`);
  return css.replace(/([^{}]+)\{([^{}]*)\}/g, (_m, sel: string, body: string) => {
    let b = body;
    if (/\.(logo|mono)(?![\w-])/.test(sel)) b = mul(b, ['width', 'height', 'font-size'], '--ls');else
    if (/\.(name|hl|offer)(?![\w-])/.test(sel)) b = mul(b, ['font-size'], '--ns');else
    if (/\.sig(?![\w-])/.test(sel)) b = mul(b, ['height', 'max-width'], '--ss');else
    if (/\.qr(?![\w-])/.test(sel)) b = mul(b, ['width', 'height'], '--qs');
    b = mul(b, ['font-size'], '--ts');
    return `${sel}{${b}}`;
  });
}

/*
 * Type scale (D238): one display level (name / headline / offer, weight 800, tight tracking),
 * one supporting level (tagline, medium weight, muted), body copy at a comfortable reading size
 * in a near-black, and small caps labels (bold, wide tracking) for the quiet captions.
 */
export const kitCss = scaleCss(`
*{box-sizing:border-box}
html,body{margin:0;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
p,h1{margin:0}
.item{position:relative;overflow:hidden;background:var(--paper);font-family:var(--font);color:var(--body)}
.qr{display:block;object-fit:contain;background:#fff}
.name{font-weight:800;letter-spacing:-0.02em;color:var(--ink);line-height:1.08;overflow-wrap:anywhere}
.line{color:var(--muted);font-weight:500;line-height:1.3}
.hl,.msg{text-wrap:balance}
.logo{display:block;object-fit:contain;flex-shrink:0}
.mono{display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--ink);color:var(--on-ink);font-weight:800;letter-spacing:0.02em;flex-shrink:0;font-family:var(--font)}
.ph{position:absolute;overflow:hidden}
.phi{display:block;width:100%;height:100%;object-fit:cover}
.veil{position:absolute;inset:0;background:rgba(0,0,0,0.45)}
.brand{display:flex;align-items:center;gap:3mm;min-width:0}
.row{display:flex;gap:2mm;align-items:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3}
.k{display:inline-flex;align-items:center;justify-content:center;width:3.6mm;height:3.6mm;border-radius:50%;flex-shrink:0;font-weight:800;background:var(--ink);color:var(--on-ink);font-size:0.62em;line-height:1;font-family:Inter,Arial,sans-serif}
.s-bold .k{background:var(--on-ink);color:var(--ink)}
.s-minimal .k{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 0.25mm var(--ink)}
.frame{position:relative;background:#fff}
.c{position:absolute;border-color:var(--ink);border-style:solid;border-width:0}
.tl{top:0;left:0;border-top-width:var(--cb,1.4mm);border-left-width:var(--cb,1.4mm)}
.tr{top:0;right:0;border-top-width:var(--cb,1.4mm);border-right-width:var(--cb,1.4mm)}
.bl{bottom:0;left:0;border-bottom-width:var(--cb,1.4mm);border-left-width:var(--cb,1.4mm)}
.br{bottom:0;right:0;border-bottom-width:var(--cb,1.4mm);border-right-width:var(--cb,1.4mm)}
.eyebrow{font-family:Inter,Arial,sans-serif;font-size:6.8pt;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink)}
.cap{font-size:6.2pt;letter-spacing:0.14em;text-transform:uppercase;color:var(--ink);font-family:Inter,Arial,sans-serif;font-weight:700}
.sign{display:flex;flex-direction:column;align-items:flex-start;gap:0.8mm}
.sig{height:11mm;max-width:40mm;object-fit:contain;object-position:left}
.signer{font-size:7.5pt;font-weight:600;color:var(--body);border-top:0.25mm solid var(--rule);padding-top:1mm;min-width:30mm}

/* Business card */
.card{width:85mm;height:55mm;display:flex;gap:5mm;padding:5.5mm 5.5mm 5.5mm 9mm}
.card .bar{position:absolute;left:0;top:0;bottom:0;width:3mm;background:var(--ink)}
.card.s-classic{padding-right:0}
.card.s-classic .bar{width:2mm}
.card.s-classic .meta{padding-top:2.6mm;border-top:0.3mm solid var(--rule)}
.card.s-classic .qrbox{align-self:stretch;margin:-5.5mm 0;width:31mm;background:var(--tint);gap:2mm}
.card.s-classic .qrbox .qr{padding:1.4mm;border-radius:1.4mm;width:22mm;height:22mm}
.card .text{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:space-between}
.card .logo{width:11mm;height:11mm}
.card .mono{width:11mm;height:11mm;font-size:10pt}
.card .bt{min-width:0}
.card .name{font-size:13pt}
.card .line{font-size:7.5pt;margin-top:1mm}
.card .meta{display:flex;flex-direction:column;gap:1mm;font-size:7.2pt;font-weight:500;color:var(--body)}
.card .qrbox{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.6mm;flex-shrink:0}
.card .qr{width:23mm;height:23mm}
.card.s-bold{background:var(--ink)}
.card.s-bold .bar{display:none}
.card.s-bold .name,.card.s-bold .line,.card.s-bold .meta,.card.s-bold .k{color:var(--on-ink)}
.card.s-bold .line{opacity:0.82}
.card.s-bold .mono{background:var(--on-ink);color:var(--ink)}
.card.s-bold .qrbox{background:#fff;padding:2mm 2mm 1.4mm;border-radius:1.8mm;align-self:center}
.card.s-bold .qrbox .qr{width:20mm;height:20mm}
.card.s-bold .cap{color:#111}
.card.s-minimal{padding:6mm}
.card.s-minimal .bar{display:none}
.card.s-minimal .brand{padding-bottom:2.5mm;border-bottom:0.3mm solid var(--ink)}
.card.s-minimal .name{font-weight:700;letter-spacing:-0.01em}
.card.s-photo{padding-left:33mm}
.card.s-photo .ph{left:0;top:0;bottom:0;width:27mm}
.card.s-photo .bar{left:27mm;width:1.4mm}
.card.back{align-items:center;justify-content:center;padding:7mm;background:var(--ink)}
.card.back .bc{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;gap:2mm}
.card.back .logo.big{width:16mm;height:16mm;margin-bottom:1mm}
.card.back .mono.big{width:15mm;height:15mm;font-size:14pt;background:var(--on-ink);color:var(--ink);margin-bottom:1mm}
.card.back .name{font-size:16pt;color:var(--on-ink)}
.card.back .line{font-size:8pt;color:var(--on-ink);opacity:0.85}
.card.back .soc{font-size:7.5pt;font-weight:700;letter-spacing:0.08em;color:var(--on-ink);opacity:0.9;margin-top:1mm}
.card.back.s-bold{background:var(--paper)}
.card.back.s-bold .name{color:var(--ink)}
.card.back.s-bold .line,.card.back.s-bold .soc{color:var(--muted);opacity:1}
.card.back.s-bold .mono.big{background:var(--ink);color:var(--on-ink)}
.card.back.s-minimal{background:var(--paper)}
.card.back.s-minimal .name{color:var(--ink)}
.card.back.s-minimal .line,.card.back.s-minimal .soc{color:var(--muted);opacity:1}
.card.back.s-minimal .mono.big{background:var(--ink);color:var(--on-ink)}
.card.back.s-minimal::after{content:'';position:absolute;inset:3mm;border:0.3mm solid var(--rule)}
.card.back.s-classic::after{content:'';position:absolute;inset:3mm;border:0.3mm solid var(--on-ink);opacity:0.35;pointer-events:none}
.card.back.s-classic .bc::after{content:'';display:block;width:8mm;height:0.5mm;background:var(--on-ink);opacity:0.6;margin-top:1mm;order:2}
.card.back.s-classic .soc{order:3}
.card.back .ph{inset:0}
.card.back.s-photo .name,.card.back.s-photo .line,.card.back.s-photo .soc{color:#fff}

/* Round sticker */
.sticker{width:50mm;height:50mm;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1.4mm solid var(--ink)}
.sticker .arc{position:absolute;inset:0;width:100%;height:100%;fill:var(--ink);font-family:var(--font)}
.sticker .qr{width:22mm;height:22mm}
.sticker .core{position:relative;display:flex;align-items:center;justify-content:center}
.sticker.s-classic{background:var(--tint)}
.sticker.s-classic .core{width:31mm;height:31mm;border-radius:50%;background:#fff;box-shadow:0 0 0 0.3mm var(--rule)}
.sticker.s-classic .qr{width:20mm;height:20mm}
.sticker.s-bold{background:var(--ink)}
.sticker.s-bold .arc{fill:var(--on-ink)}
.sticker.s-bold .core{background:#fff;padding:1.6mm;border-radius:50%;width:30mm;height:30mm}
.sticker.s-bold .qr{width:19mm;height:19mm}
.sticker.s-minimal{border-width:0.4mm;gap:2mm}
.sticker.s-minimal .qr{width:25mm;height:25mm}
.sticker.s-minimal .name{font-size:7.6pt;max-width:32mm;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:0.1em;text-transform:uppercase}
.sticker.s-photo{border:1mm solid #fff;box-shadow:0 0 0 0.6mm var(--ink)}
.sticker.s-photo .ph{inset:0;border-radius:50%}
.sticker.s-photo .veil{border-radius:50%;background:rgba(0,0,0,0.5)}
.sticker.s-photo .arc{fill:#fff}
.sticker.s-photo .core{background:#fff;padding:1.4mm;border-radius:2.2mm;box-shadow:0 0 0 0.5mm var(--ink)}
.sticker.s-photo .qr{width:19mm;height:19mm}

/* Package insert */
.insert{width:105mm;height:148mm;display:flex;flex-direction:column}
.insert .head{position:relative;flex-shrink:0;height:32mm;background:var(--ink);display:flex;align-items:flex-end;padding:7mm 9mm}
.insert .head .ph{inset:0}
.insert .head .brand{position:relative;z-index:1}
.insert .head .logo{width:12mm;height:12mm;background:#fff;border-radius:1.8mm;padding:1mm}
.insert .head .mono{width:12mm;height:12mm;font-size:11pt;background:var(--on-ink);color:var(--ink)}
.insert .head .name{font-size:18pt;color:var(--on-ink)}
.insert.s-photo .head{height:54mm}
.insert.s-photo .head::after{content:'';position:absolute;left:0;right:0;bottom:0;height:24mm;background:rgba(0,0,0,0.5)}
.insert.s-photo .head .name{color:#fff}
.insert .body{flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:8mm 10mm 7mm}
.insert .eyebrow{display:flex;align-items:center;gap:2.5mm;margin-bottom:3.5mm}
.insert .eyebrow::before,.insert .eyebrow::after{content:'';width:6mm;height:0.3mm;background:var(--ink)}
.insert .msg{font-size:11.5pt;line-height:1.55;color:var(--body);max-width:80mm}
.insert .frame{padding:2.5mm;--cb:0.8mm}
.insert .c{width:6mm;height:6mm}
.insert.s-classic .head::after{content:'';position:absolute;left:9mm;right:9mm;bottom:3.5mm;height:0.3mm;background:var(--on-ink);opacity:0.4}
.insert.s-classic .head{padding-bottom:7.5mm}
.insert .sign{align-items:center;margin-top:5mm}
.insert .sig{object-position:center}
.insert .signer{text-align:center}
.insert .qrwrap{margin-top:auto;display:flex;flex-direction:column;align-items:center;gap:2.5mm}
.insert .qr{width:30mm;height:30mm}
.insert .cta{font-size:10pt;font-weight:800;letter-spacing:-0.005em;color:var(--ink)}
.insert .foot{font-size:7.5pt;font-weight:600;letter-spacing:0.04em;color:var(--muted);margin-top:3mm;padding-top:3mm;border-top:0.25mm solid var(--rule);align-self:stretch}
.insert.s-minimal .head{background:transparent;height:auto;justify-content:center;padding:11mm 10mm 0}
.insert.s-minimal .head .brand{flex-direction:column;gap:2.5mm}
.insert.s-minimal .head .name{color:var(--ink);font-size:17pt;font-weight:700}
.insert.s-minimal .head .mono{background:var(--ink);color:var(--on-ink)}
.insert.s-minimal .body{padding-top:6mm}
.insert.s-minimal .body::before{content:'';width:12mm;height:0.4mm;background:var(--ink);margin-bottom:6mm}
.insert.s-bold{background:var(--ink)}
.insert.s-bold .body{background:var(--paper);margin:0 6mm 6mm;border-radius:3mm}

/* Receipt footer */
.receipt{width:80mm;padding:5mm 5mm 7mm;display:flex;flex-direction:column;align-items:center;text-align:center;gap:2.4mm;border-top:0.4mm dashed #999;background:#fff}
.receipt .brand{flex-direction:column;gap:1.6mm}
.receipt .logo{width:12mm;height:12mm;filter:grayscale(1)}
.receipt .mono{width:11mm;height:11mm;font-size:10pt;background:#111;color:#fff}
.receipt .name{font-size:13pt;color:#111}
.receipt .msg{font-size:9pt;font-weight:500;line-height:1.45;color:#222;max-width:62mm;padding:2mm 0;border-top:0.3mm dotted #888;border-bottom:0.3mm dotted #888}
.receipt .qr{width:34mm;height:34mm;margin:1mm 0}
.receipt .foot{font-size:8pt;font-weight:500;color:#333;line-height:1.55}

/* Swing tag */
.hangtag{width:50mm;height:90mm;display:flex;flex-direction:column;align-items:center;text-align:center;padding:12mm 5.5mm 5.5mm}
.hangtag .hole{position:absolute;top:4mm;left:50%;width:4mm;height:4mm;margin-left:-2mm;border-radius:50%;border:0.3mm solid #999;background:#fff}
.hangtag .top{display:flex;flex-direction:column;align-items:center;gap:1.6mm}
.hangtag .logo{width:12mm;height:12mm}
.hangtag .mono{width:11mm;height:11mm;font-size:10pt}
.hangtag .name{font-size:12pt}
.hangtag .line{font-size:6.6pt;font-weight:700;letter-spacing:0.1em;text-transform:uppercase}
.hangtag .fill{width:100%;display:grid;grid-template-columns:auto 1fr;align-items:end;gap:3mm 2mm;margin:auto 0 0;font-size:6.6pt;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);text-align:left;font-family:Inter,Arial,sans-serif}
.hangtag .fill i{display:block;border-bottom:0.3mm solid var(--rule);height:3.4mm}
.hangtag .qrbox{display:flex;flex-direction:column;align-items:center;gap:1.4mm;margin-top:4.5mm}
.hangtag .qr{width:21mm;height:21mm}
.hangtag.s-classic::before{content:'';position:absolute;left:0;right:0;bottom:0;height:2.2mm;background:var(--ink)}
.hangtag.s-classic::after{content:'';position:absolute;left:2.5mm;right:2.5mm;top:2.5mm;bottom:4.7mm;border:0.3mm solid var(--rule);pointer-events:none}
.hangtag .top .name::after{content:'';display:block;width:6mm;height:0.5mm;background:currentColor;margin:1.8mm auto 0;opacity:0.7}
.hangtag.s-bold{background:var(--ink)}
.hangtag.s-bold .name,.hangtag.s-bold .line,.hangtag.s-bold .fill{color:var(--on-ink)}
.hangtag.s-bold .fill i{border-color:var(--on-ink)}
.hangtag.s-bold .mono{background:var(--on-ink);color:var(--ink)}
.hangtag.s-bold .qrbox{background:#fff;padding:1.6mm 1.6mm 1.2mm;border-radius:1.6mm}
.hangtag.s-bold .qrbox .qr{width:19mm;height:19mm}
.hangtag.s-minimal::after{content:'';position:absolute;inset:2.5mm;border:0.3mm solid var(--rule);pointer-events:none}
.hangtag.s-photo{padding-top:31mm}
.hangtag.s-photo .ph{left:0;right:0;top:0;height:27mm}
.hangtag.s-photo .top .logo{display:none}
.hangtag.s-photo .qr{width:19mm;height:19mm}
.hangtag.s-photo .qrbox{margin-top:3mm}
.hangtag.s-photo::before{content:'';position:absolute;left:0;right:0;top:27mm;height:1.4mm;background:var(--ink)}

/* Gift voucher */
.voucher{width:210mm;height:99mm;display:flex}
.voucher .panel{position:relative;width:76mm;flex-shrink:0;background:var(--ink);color:var(--on-ink);display:flex;align-items:center;padding:10mm 9mm}
.voucher .panel .ph{inset:0}
.voucher.s-photo .panel::after{content:'';position:absolute;inset:0;background:rgba(0,0,0,0.5)}
.voucher .panel::before{content:'';position:absolute;inset:4mm;border:0.3mm solid currentColor;opacity:0.4;z-index:1;pointer-events:none}
.voucher .pin{position:relative;z-index:1;display:flex;flex-direction:column;gap:3mm}
.voucher .kicker{font-size:8.5pt;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;opacity:0.92;font-family:Inter,Arial,sans-serif}
.voucher .offer{font-size:30pt;font-weight:800;line-height:1;letter-spacing:-0.025em;overflow-wrap:anywhere}
.voucher.s-photo .panel{color:#fff}
.voucher .exp{font-size:8pt;font-weight:600;opacity:0.92;padding-top:3mm;border-top:0.3mm solid currentColor;align-self:flex-start}
.voucher .side{flex:1;min-width:0;display:flex;flex-direction:column;padding:10mm 10mm 9mm;border-left:0.4mm dashed var(--rule)}
.voucher .logo{width:12mm;height:12mm}
.voucher .mono{width:11mm;height:11mm;font-size:10pt}
.voucher .name{font-size:16pt}
.voucher .msg{font-size:10pt;line-height:1.55;color:var(--body);margin-top:5mm;max-width:100mm}
.voucher .bottom{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:6mm}
.voucher .left{display:flex;flex-direction:column;gap:4mm}
.voucher .code{display:inline-flex;align-items:center;gap:3mm;border:0.35mm dashed var(--ink);border-radius:1.6mm;padding:2mm 3.5mm;font-family:'Courier New',monospace;font-weight:700;font-size:12.5pt;color:var(--ink);letter-spacing:0.1em}
.voucher .code span{font-family:Inter,Arial,sans-serif;font-size:6.4pt;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);font-weight:700}
.voucher .code.blank{min-width:52mm}
.voucher.s-classic .code,.voucher.s-photo .code,.voucher.s-bold .code{background:var(--tint)}
.voucher .qrbox{display:flex;flex-direction:column;align-items:center;gap:1.6mm}
.voucher .qr{width:26mm;height:26mm}
.voucher.s-minimal .panel{background:var(--paper);color:var(--ink);border-right:0.3mm solid var(--ink)}
.voucher.s-minimal .side{border-left:0}
.voucher.s-bold .side{background:var(--paper)}
.voucher.s-bold{background:var(--ink)}

/* A5 flyer */
.flyer{width:148mm;height:210mm;display:flex;flex-direction:column}
.flyer .hero{position:relative;height:94mm;flex-shrink:0;background:var(--ink);display:flex;align-items:center;justify-content:center}
.flyer .hero .ph{inset:0}
.flyer .mark .logo.big{width:34mm;height:34mm;background:#fff;border-radius:4mm;padding:3mm}
.flyer .mark .mono.big{width:30mm;height:30mm;font-size:28pt;background:var(--on-ink);color:var(--ink)}
.flyer .pill{position:absolute;right:10mm;bottom:-6.5mm;z-index:1;background:var(--paper);color:var(--ink);border:0.6mm solid var(--ink);border-radius:20mm;padding:3mm 6.5mm;font-weight:800;font-size:13pt;letter-spacing:-0.01em}
.flyer .body{flex:1;display:flex;flex-direction:column;padding:11mm 11mm 10mm}
.flyer .logo{width:9mm;height:9mm}
.flyer .mono{width:9mm;height:9mm;font-size:8.5pt}
.flyer .name{font-size:9pt;font-weight:800;letter-spacing:0.16em;text-transform:uppercase}
.flyer:not(.s-photo) .brand::before{content:'';width:8mm;height:0.6mm;background:var(--ink);flex-shrink:0}
.flyer.s-bold .brand::before{background:var(--on-ink)}
.flyer.s-classic .bottom,.flyer.s-photo .bottom{background:var(--tint);border-top:0;padding:5mm;border-radius:3mm}
.flyer.s-classic .qr,.flyer.s-photo .qr{padding:1.4mm;border-radius:1.4mm;width:29mm;height:29mm}
.flyer .hl{font-size:28pt;line-height:1.04;font-weight:800;letter-spacing:-0.025em;color:#111;margin-top:5mm;font-family:var(--font);max-width:120mm}
.flyer .msg{font-size:11pt;line-height:1.55;color:var(--body);margin-top:4.5mm;max-width:116mm}
.flyer .bottom{margin-top:auto;display:flex;align-items:center;gap:6mm;padding-top:6mm;border-top:0.35mm solid var(--rule)}
.flyer .qr{width:30mm;height:30mm;flex-shrink:0}
.flyer .cta{font-size:15pt;font-weight:800;letter-spacing:-0.015em;color:var(--ink)}
.flyer .meta{display:flex;flex-direction:column;gap:1.2mm;font-size:8.5pt;font-weight:500;color:var(--body);margin-top:2mm}
.flyer.s-bold{background:var(--ink)}
.flyer.s-bold .name,.flyer.s-bold .hl,.flyer.s-bold .msg,.flyer.s-bold .meta,.flyer.s-bold .k,.flyer.s-bold .cta{color:var(--on-ink)}
.flyer.s-bold .msg,.flyer.s-bold .meta{opacity:0.88}
.flyer.s-bold .bottom{border-color:var(--on-ink)}
.flyer.s-bold .qr{padding:1.5mm;border-radius:1.5mm}
.flyer.s-minimal .hero{background:var(--paper);border-bottom:0.35mm solid var(--ink);margin:9mm 9mm 0;height:86mm}
.flyer.s-minimal .mark .mono.big{background:var(--ink);color:var(--on-ink)}
.flyer.s-minimal .hl{font-weight:700}
.flyer.s-photo .hero{height:104mm}
.flyer.s-photo .hl{font-size:25pt}

/* Counter sign */
.counter{width:148mm;height:210mm;display:flex;flex-direction:column;align-items:center;text-align:center;padding:15mm 12mm 11mm}
.counter .brand{flex-direction:column;gap:3mm}
.counter .logo{width:16mm;height:16mm}
.counter .mono{width:15mm;height:15mm;font-size:13pt}
.counter .name{font-size:16pt}
.counter .hl{font-size:26pt;line-height:1.06;font-weight:800;letter-spacing:-0.025em;color:#111;margin-top:7mm;max-width:120mm;font-family:var(--font)}
.counter .frame{position:relative;margin-top:8mm;padding:6.5mm;background:#fff}
.counter .qr{width:70mm;height:70mm}
.counter .c{width:10mm;height:10mm}
.counter .frame::after{content:'Scan here';position:absolute;left:50%;bottom:-2.6mm;transform:translateX(-50%);background:var(--ink);color:var(--on-ink);font-family:Inter,Arial,sans-serif;font-size:7pt;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;padding:1.2mm 3.5mm;border-radius:10mm;white-space:nowrap}
.counter.s-bold .frame::after{background:var(--on-ink);color:var(--ink)}
.counter.s-minimal .frame::after{display:none}
.counter .msg{font-size:11.5pt;font-weight:500;color:var(--body);margin-top:7mm;max-width:110mm;line-height:1.45}
.counter .foot{margin-top:auto;font-size:9.5pt;font-weight:700;letter-spacing:0.02em;color:var(--muted)}
.counter.s-classic::before{content:'';position:absolute;left:0;right:0;top:0;height:5mm;background:var(--ink)}
.counter.s-classic .foot,.counter.s-photo .foot{align-self:stretch;margin:auto -12mm -11mm;padding:5mm 12mm;background:var(--ink);color:var(--on-ink)}
.counter .foot:empty{display:none}
.counter.s-bold{background:var(--ink)}
.counter.s-bold .name,.counter.s-bold .hl,.counter.s-bold .msg,.counter.s-bold .foot{color:var(--on-ink)}
.counter.s-bold .msg,.counter.s-bold .foot{opacity:0.88}
.counter.s-bold .mono{background:var(--on-ink);color:var(--ink)}
.counter.s-bold .c{border-color:var(--on-ink)}
.counter.s-minimal .c{border-width:0}
.counter.s-minimal .frame{border:0.35mm solid var(--ink)}
.counter.s-minimal .hl{font-weight:700}
.counter.s-photo{padding-top:0}
.counter.s-photo .ph{left:0;right:0;top:0;height:50mm}
.counter.s-photo .veil{bottom:auto;height:50mm}
.counter.s-photo .brand{position:relative;height:50mm;justify-content:center;flex-shrink:0}
.counter.s-photo .brand .name{color:#fff;font-size:18pt}
.counter.s-photo .brand .logo{background:#fff;border-radius:2mm;padding:1.5mm}
.counter.s-photo .hl{margin-top:6mm;font-size:22pt}
.counter.s-photo .frame{margin-top:6mm;padding:5.5mm}
.counter.s-photo .qr{width:56mm;height:56mm}
.counter.s-photo .msg{margin-top:5mm}

/* Loyalty stamp card */
.stamp{width:85mm;height:55mm;display:flex;flex-direction:column;padding:5mm 5.5mm}
.stamp .top{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm}
.stamp .logo{width:10mm;height:10mm}
.stamp .mono{width:10mm;height:10mm;font-size:9pt}
.stamp .bt{min-width:0}
.stamp .name{font-size:12pt}
.stamp .line{font-size:7pt;margin-top:0.6mm}
.stamp .qr{width:15mm;height:15mm;flex-shrink:0}
.stamp .rw{font-size:8.5pt;font-weight:600;color:var(--body);margin-top:auto}
.stamp .rw b{color:var(--ink);font-weight:800}
.stamp .grid{display:grid;gap:1.6mm;margin-top:2.2mm;grid-template-columns:repeat(5,8.5mm);justify-content:space-between}
.stamp .g6{grid-template-columns:repeat(6,8.5mm)}
.stamp .g8{grid-template-columns:repeat(8,8mm)}
.stamp .st{width:8.5mm;height:8.5mm;border-radius:50%;border:0.35mm dashed var(--rule);display:flex;align-items:center;justify-content:center;font-size:6pt;font-weight:700;color:var(--muted);font-family:Inter,Arial,sans-serif}
.stamp .g8 .st{width:8mm;height:8mm}
.stamp .free{background:var(--ink);color:var(--on-ink);border:0;font-weight:800;font-size:5.4pt;letter-spacing:0.04em}
.stamp.s-classic::before{content:'';position:absolute;left:0;right:0;top:0;height:1.8mm;background:var(--ink)}
.stamp.s-classic .grid{background:var(--tint);padding:1.8mm;border-radius:2mm}
.stamp.s-classic .g8{gap:1.2mm}
.stamp.s-classic .g8 .st{width:7mm;height:7mm}
.stamp.s-classic .g8{grid-template-columns:repeat(8,7mm)}
.stamp.s-classic .st{background:var(--paper)}
.stamp.s-classic .free{background:var(--ink)}
.stamp.s-bold{background:var(--ink)}
.stamp.s-bold .name,.stamp.s-bold .line,.stamp.s-bold .rw,.stamp.s-bold .rw b{color:var(--on-ink)}
.stamp.s-bold .mono{background:var(--on-ink);color:var(--ink)}
.stamp.s-bold .st{border-color:var(--on-ink);color:var(--on-ink);opacity:0.85}
.stamp.s-bold .free{background:var(--on-ink);color:var(--ink);opacity:1}
.stamp.s-bold .qr{padding:1mm;border-radius:1mm}
.stamp.s-minimal .st{border:0.3mm solid var(--ink)}
.stamp.s-minimal .free{background:transparent;border:0.6mm solid var(--ink);color:var(--ink)}
.stamp.s-minimal .name{font-weight:700}

/* Delivery label */
.label{width:100mm;height:150mm;display:flex;flex-direction:column;padding:6.5mm;border:0.5mm solid #111}
.label .hd{display:flex;justify-content:space-between;align-items:flex-start;gap:4mm;padding-bottom:4.5mm;border-bottom:0.6mm solid var(--ink)}
.label .logo{width:11mm;height:11mm}
.label .mono{width:11mm;height:11mm;font-size:10pt}
.label .bt{min-width:0}
.label .name{font-size:13pt}
.label .line{font-size:8pt;margin-top:0.6mm}
.label .k2{display:block;font-size:6.5pt;letter-spacing:0.16em;text-transform:uppercase;color:var(--muted);font-weight:700;font-family:Inter,Arial,sans-serif;margin-bottom:0.8mm}
.label .ord{display:flex;flex-direction:column;align-items:flex-end;gap:1.2mm;font-size:6.5pt;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);font-weight:700;font-family:Inter,Arial,sans-serif;flex-shrink:0}
.label .ord i{display:block;width:27mm;height:9mm;border:0.4mm solid var(--ink);border-radius:1mm}
.label .to{display:flex;flex-direction:column;gap:3.6mm;padding:5.5mm 0}
.label .to .k2{align-self:flex-start;font-size:9pt;letter-spacing:0.12em;background:var(--ink);color:var(--on-ink);font-weight:800;margin-bottom:0.5mm;padding:1.2mm 3mm;border-radius:0.8mm}
.label.s-minimal .to .k2{background:transparent;color:var(--ink);padding:0;border-radius:0}
.label .ln{display:grid;grid-template-columns:auto 1fr;align-items:end;gap:2.5mm;font-size:8.5pt;font-weight:600;color:var(--body)}
.label .ln i{display:block;border-bottom:0.35mm solid #888;height:5.5mm}
.label .note{border:0.6mm solid var(--ink);color:var(--ink);font-weight:800;text-align:center;padding:2.4mm;font-size:10.5pt;text-transform:uppercase;letter-spacing:0.08em}
.label .ft{margin-top:auto;display:flex;gap:5mm;align-items:center;padding-top:4.5mm;border-top:0.35mm dashed var(--rule)}
.label .qr{width:27mm;height:27mm;flex-shrink:0}
.label .cta{font-size:10.5pt;font-weight:800;line-height:1.2;letter-spacing:-0.01em;color:var(--ink)}
.label .meta{display:flex;flex-direction:column;gap:0.9mm;font-size:8pt;font-weight:500;color:var(--body);margin-top:1.6mm}
.label.s-bold .hd{background:var(--ink);margin:-6.5mm -6.5mm 0;padding:6.5mm;border-bottom:0}
.label.s-bold .hd .name,.label.s-bold .hd .line,.label.s-bold .hd .k2,.label.s-bold .ord{color:var(--on-ink)}
.label.s-bold .ord i{border-color:var(--on-ink);background:#fff}
.label.s-bold .hd .mono{background:var(--on-ink);color:var(--ink)}
.label.s-minimal{border-width:0.3mm}
.label.s-minimal .hd{border-bottom-width:0.3mm}
.label.s-minimal .note{border-width:0.3mm;font-weight:700}
`);