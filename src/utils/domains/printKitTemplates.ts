import type { KitDetails, KitFont, KitItem, KitPaper, KitStyle, KitTone } from './printKit';
import { contrastRatio, mixHex } from '../contrast';

/** HTML and CSS for every printed piece (D118, D119). Sizes are in millimetres so print matches the preview. */

export const KIT_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Libre+Baskerville:wght@400;700&family=Nunito:wght@500;700;800&family=Playfair+Display:wght@500;600;700&display=swap';

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
  return `--ink:${esc(d.ink)};--on-ink:${onInk(d.ink)};--paper:${paper};--muted:${mixHex('#111111', paper, 0.38)};--rule:${mixHex(d.ink, paper, 0.75)};--font:${families[d.font]};${scales}`;
}

/** Photo style only applies when there's a photo to lead with, and only on pieces that have one. */
export function kitStyleOf(item: KitItem, d: KitDetails): KitStyle {
  if (d.style !== 'photo') return d.style;
  return d.photo && PHOTO_ITEMS.has(item) ? 'photo' : 'classic';
}

const logo = (d: KitDetails, cls = 'logo') => d.logo ? `<img class="${cls}" src="${img(d.logo)}" alt=""/>` : `<span class="mono ${cls}">${esc(initials(d.name))}</span>`;
const qr = (src: string, cls = 'qr') => `<img class="${cls}" src="${img(src)}" alt="QR code"/>`;

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
  const size = (t: string, max: number) => Math.max(5.2, Math.min(max * ns, 190 / Math.max(t.length, 1)));
  return `<svg class="arc" viewBox="0 0 100 100" aria-hidden="true"><defs><path id="kt" d="M 15,50 A 35,35 0 0 1 85,50"/><path id="kb" d="M 11,50 A 39,39 0 0 0 89,50"/></defs><text style="font-size:${size(top, 9)}px;font-weight:700;letter-spacing:0.06em"><textPath href="#kt" startOffset="50%" text-anchor="middle">${esc(top.toUpperCase())}</textPath></text>${bottom ? `<text style="font-size:${size(bottom, 6)}px;font-weight:600;letter-spacing:0.14em"><textPath href="#kb" startOffset="50%" text-anchor="middle">${esc(bottom.toUpperCase())}</textPath></text>` : ''}</svg>`;
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
        `<div class="head">${d.photo && s !== 'minimal' ? photo : ''}<div class="brand">${logo(d)}${name}</div></div><div class="body">${d.message ? `<p class="msg">${esc(d.message)}</p>` : ''}${signature(d)}<div class="qrwrap">${qr(qrSrc)}<p class="cta">Scan to reorder, track or review</p></div><p class="foot">${[d.social && `@${d.social.replace(/^@/, '')}`, d.address].filter(Boolean).map((v) => esc(v as string)).join(' · ')}</p></div>`
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
        `${s === 'photo' ? `${photo}<span class="veil"></span>` : ''}<div class="brand">${logo(d)}${name}</div><h1 class="hl">${esc(d.headline || 'Scan to see what’s available and order')}</h1><div class="frame"><span class="c tl"></span><span class="c tr"></span><span class="c bl"></span><span class="c br"></span>${qr(qrSrc)}</div>${d.message ? `<p class="msg">${esc(d.message)}</p>` : ''}<p class="foot">${[d.phone && `WhatsApp ${d.phone}`, d.address].filter(Boolean).map((v) => esc(v as string)).join(' · ')}</p>`
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

export const kitCss = scaleCss(`
*{box-sizing:border-box}
html,body{margin:0;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact}
p,h1{margin:0}
.item{position:relative;overflow:hidden;background:var(--paper);font-family:var(--font);color:#111}
.qr{display:block;object-fit:contain;background:#fff}
.name{font-weight:700;letter-spacing:-0.01em;color:var(--ink);line-height:1.15}
.line{color:var(--muted)}
.logo{display:block;object-fit:contain;flex-shrink:0}
.mono{display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--ink);color:var(--on-ink);font-weight:700;flex-shrink:0;font-family:var(--font)}
.ph{position:absolute;overflow:hidden}
.phi{display:block;width:100%;height:100%;object-fit:cover}
.veil{position:absolute;inset:0;background:rgba(0,0,0,0.45)}
.brand{display:flex;align-items:center;gap:2.5mm;min-width:0}
.row{display:flex;gap:1.6mm;align-items:baseline;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.k{display:inline-block;width:2.6mm;flex-shrink:0;font-weight:700;color:var(--ink);font-size:0.85em}
.cap{font-size:5.6pt;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);font-family:Inter,Arial,sans-serif;font-weight:600}
.sign{display:flex;flex-direction:column;align-items:flex-start;gap:0.6mm}
.sig{height:11mm;max-width:40mm;object-fit:contain;object-position:left}
.signer{font-size:7pt;color:var(--muted);border-top:0.2mm solid var(--rule);padding-top:0.8mm;min-width:28mm}

/* Business card */
.card{width:85mm;height:55mm;display:flex;gap:4mm;padding:5mm 5mm 5mm 8mm}
.card .bar{position:absolute;left:0;top:0;bottom:0;width:2.5mm;background:var(--ink)}
.card .text{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:space-between}
.card .logo{width:10mm;height:10mm}
.card .mono{font-size:9pt}
.card .bt{min-width:0}
.card .name{font-size:11pt}
.card .line{font-size:7pt;margin-top:0.6mm}
.card .meta{display:flex;flex-direction:column;gap:0.5mm;font-size:6.6pt;color:#333}
.card .qrbox{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.2mm;flex-shrink:0}
.card .qr{width:24mm;height:24mm}
.card.s-bold{background:var(--ink)}
.card.s-bold .bar{display:none}
.card.s-bold .name,.card.s-bold .line,.card.s-bold .meta,.card.s-bold .k{color:var(--on-ink)}
.card.s-bold .mono{background:var(--on-ink);color:var(--ink)}
.card.s-bold .qrbox{background:#fff;padding:1.8mm 1.8mm 1.2mm;border-radius:1.6mm;align-self:center}
.card.s-bold .qrbox .qr{width:21mm;height:21mm}
.card.s-bold .cap{color:#333}
.card.s-minimal{padding:6mm}
.card.s-minimal .bar{display:none}
.card.s-minimal .brand{padding-bottom:2mm;border-bottom:0.25mm solid var(--ink)}
.card.s-minimal .name{font-weight:600;letter-spacing:0.01em}
.card.s-photo{padding-left:32mm}
.card.s-photo .ph{left:0;top:0;bottom:0;width:27mm}
.card.s-photo .bar{left:27mm;width:1.2mm}
.card.back{align-items:center;justify-content:center;padding:6mm;background:var(--ink)}
.card.back .bc{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;gap:1.4mm}
.card.back .logo.big{width:16mm;height:16mm}
.card.back .mono.big{width:14mm;height:14mm;font-size:13pt;background:var(--on-ink);color:var(--ink)}
.card.back .name{font-size:12pt;color:var(--on-ink)}
.card.back .line,.card.back .soc{font-size:7pt;color:var(--on-ink);opacity:0.85}
.card.back.s-bold{background:var(--paper)}
.card.back.s-bold .name{color:var(--ink)}
.card.back.s-bold .line,.card.back.s-bold .soc{color:var(--muted);opacity:1}
.card.back.s-bold .mono.big{background:var(--ink);color:var(--on-ink)}
.card.back.s-minimal{background:var(--paper)}
.card.back.s-minimal .name{color:var(--ink)}
.card.back.s-minimal .line,.card.back.s-minimal .soc{color:var(--muted);opacity:1}
.card.back.s-minimal .mono.big{background:var(--ink);color:var(--on-ink)}
.card.back.s-minimal::after{content:'';position:absolute;inset:3mm;border:0.25mm solid var(--rule)}
.card.back .ph{inset:0}
.card.back.s-photo .name,.card.back.s-photo .line,.card.back.s-photo .soc{color:#fff}

/* Round sticker */
.sticker{width:50mm;height:50mm;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1.4mm solid var(--ink)}
.sticker .arc{position:absolute;inset:0;width:100%;height:100%;fill:var(--ink);font-family:var(--font)}
.sticker .qr{width:22mm;height:22mm}
.sticker .core{position:relative;display:flex;align-items:center;justify-content:center}
.sticker.s-bold{background:var(--ink)}
.sticker.s-bold .arc{fill:var(--on-ink)}
.sticker.s-bold .core{background:#fff;padding:1.6mm;border-radius:50%;width:30mm;height:30mm}
.sticker.s-bold .qr{width:19mm;height:19mm}
.sticker.s-minimal{border-width:0.35mm;gap:1.5mm}
.sticker.s-minimal .qr{width:26mm;height:26mm}
.sticker.s-minimal .name{font-size:6.8pt;max-width:32mm;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:0.08em;text-transform:uppercase}
.sticker.s-photo{border:1mm solid #fff;box-shadow:0 0 0 0.6mm var(--ink)}
.sticker.s-photo .ph{inset:0;border-radius:50%}
.sticker.s-photo .veil{border-radius:50%;background:rgba(0,0,0,0.5)}
.sticker.s-photo .arc{fill:#fff}
.sticker.s-photo .core{background:#fff;padding:1.4mm;border-radius:2.2mm;box-shadow:0 0 0 0.5mm var(--ink)}
.sticker.s-photo .qr{width:19mm;height:19mm}

/* Package insert */
.insert{width:105mm;height:148mm;display:flex;flex-direction:column}
.insert .head{position:relative;flex-shrink:0;height:30mm;background:var(--ink);display:flex;align-items:flex-end;padding:6mm 8mm}
.insert .head .ph{inset:0}
.insert .head .brand{position:relative;z-index:1}
.insert .head .logo{width:11mm;height:11mm;background:#fff;border-radius:1.5mm;padding:1mm}
.insert .head .mono{width:11mm;height:11mm;font-size:10pt;background:var(--on-ink);color:var(--ink)}
.insert .head .name{font-size:15pt;color:var(--on-ink)}
.insert.s-photo .head{height:52mm}
.insert.s-photo .head::after{content:'';position:absolute;left:0;right:0;bottom:0;height:22mm;background:rgba(0,0,0,0.45)}
.insert.s-photo .head .name{color:#fff}
.insert .body{flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:7mm 9mm 7mm}
.insert .msg{font-size:10.5pt;line-height:1.5;color:#222}
.insert .sign{align-items:center;margin-top:4mm}
.insert .sig{object-position:center}
.insert .signer{text-align:center}
.insert .qrwrap{margin-top:auto;display:flex;flex-direction:column;align-items:center;gap:2mm}
.insert .qr{width:36mm;height:36mm}
.insert .cta{font-size:8.5pt;font-weight:700;color:var(--ink)}
.insert .foot{font-size:7pt;color:var(--muted);margin-top:2.5mm}
.insert.s-minimal .head{background:transparent;height:auto;justify-content:center;padding:10mm 9mm 0}
.insert.s-minimal .head .brand{flex-direction:column;gap:2mm}
.insert.s-minimal .head .name{color:var(--ink);font-size:14pt;font-weight:600}
.insert.s-minimal .head .mono{background:var(--ink);color:var(--on-ink)}
.insert.s-minimal .body{padding-top:5mm}
.insert.s-minimal .body::before{content:'';width:12mm;height:0.3mm;background:var(--ink);margin-bottom:5mm}
.insert.s-bold{background:var(--ink)}
.insert.s-bold .body{background:var(--paper);margin:0 6mm 6mm;border-radius:3mm}

/* Receipt footer */
.receipt{width:80mm;padding:4mm 5mm 6mm;display:flex;flex-direction:column;align-items:center;text-align:center;gap:1.8mm;border-top:0.4mm dashed #999;background:#fff}
.receipt .brand{flex-direction:column;gap:1.2mm}
.receipt .logo{width:12mm;height:12mm;filter:grayscale(1)}
.receipt .mono{width:10mm;height:10mm;font-size:9pt;background:#111;color:#fff}
.receipt .name{font-size:11pt;color:#111}
.receipt .msg{font-size:8.5pt;color:#333}
.receipt .qr{width:34mm;height:34mm;margin:1mm 0}
.receipt .foot{font-size:7.5pt;color:#444;line-height:1.5}

/* Swing tag */
.hangtag{width:50mm;height:90mm;display:flex;flex-direction:column;align-items:center;text-align:center;padding:12mm 5mm 5mm}
.hangtag .hole{position:absolute;top:4mm;left:50%;width:4mm;height:4mm;margin-left:-2mm;border-radius:50%;border:0.3mm solid #999;background:#fff}
.hangtag .top{display:flex;flex-direction:column;align-items:center;gap:1.2mm}
.hangtag .logo{width:12mm;height:12mm}
.hangtag .mono{width:11mm;height:11mm;font-size:10pt}
.hangtag .name{font-size:10pt}
.hangtag .line{font-size:6.5pt}
.hangtag .fill{width:100%;display:grid;grid-template-columns:auto 1fr;align-items:end;gap:2.5mm 1.5mm;margin:auto 0 0;font-size:6.5pt;color:var(--muted);text-align:left}
.hangtag .fill i{display:block;border-bottom:0.25mm solid var(--rule);height:3mm}
.hangtag .qrbox{display:flex;flex-direction:column;align-items:center;gap:1mm;margin-top:4mm}
.hangtag .qr{width:22mm;height:22mm}
.hangtag.s-classic::before{content:'';position:absolute;left:0;right:0;bottom:0;height:2mm;background:var(--ink)}
.hangtag.s-bold{background:var(--ink)}
.hangtag.s-bold .name,.hangtag.s-bold .line,.hangtag.s-bold .fill{color:var(--on-ink)}
.hangtag.s-bold .fill i{border-color:var(--on-ink)}
.hangtag.s-bold .mono{background:var(--on-ink);color:var(--ink)}
.hangtag.s-bold .qrbox{background:#fff;padding:1.5mm 1.5mm 1mm;border-radius:1.5mm}
.hangtag.s-bold .qrbox .qr{width:20mm;height:20mm}
.hangtag.s-minimal::after{content:'';position:absolute;inset:2.5mm;border:0.25mm solid var(--rule);pointer-events:none}
.hangtag.s-photo{padding-top:31mm}
.hangtag.s-photo .ph{left:0;right:0;top:0;height:27mm}
.hangtag.s-photo .top .logo{display:none}
.hangtag.s-photo .qr{width:20mm;height:20mm}
.hangtag.s-photo .qrbox{margin-top:3mm}
.hangtag.s-photo::before{content:'';position:absolute;left:0;right:0;top:27mm;height:1.2mm;background:var(--ink)}

/* Gift voucher */
.voucher{width:210mm;height:99mm;display:flex}
.voucher .panel{position:relative;width:74mm;flex-shrink:0;background:var(--ink);color:var(--on-ink);display:flex;align-items:center;padding:8mm}
.voucher .panel .ph{inset:0}
.voucher.s-photo .panel::after{content:'';position:absolute;inset:0;background:rgba(0,0,0,0.5)}
.voucher .pin{position:relative;z-index:1;display:flex;flex-direction:column;gap:2mm}
.voucher .kicker{font-size:8pt;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;opacity:0.9}
.voucher .offer{font-size:26pt;font-weight:800;line-height:1.02;letter-spacing:-0.02em}
.voucher.s-photo .panel{color:#fff}
.voucher .exp{font-size:7.5pt;opacity:0.9}
.voucher .side{flex:1;min-width:0;display:flex;flex-direction:column;padding:8mm 9mm;border-left:0.4mm dashed var(--rule)}
.voucher .logo{width:11mm;height:11mm}
.voucher .mono{width:10mm;height:10mm;font-size:9pt}
.voucher .name{font-size:13pt}
.voucher .msg{font-size:9pt;line-height:1.5;color:#333;margin-top:4mm;max-width:95mm}
.voucher .bottom{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:6mm}
.voucher .left{display:flex;flex-direction:column;gap:3mm}
.voucher .code{display:inline-flex;align-items:center;gap:2.5mm;border:0.3mm dashed var(--ink);border-radius:1.5mm;padding:1.6mm 3mm;font-family:'Courier New',monospace;font-weight:700;font-size:11pt;color:var(--ink);letter-spacing:0.08em}
.voucher .code span{font-family:Inter,Arial,sans-serif;font-size:6pt;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);font-weight:600}
.voucher .code.blank{min-width:48mm}
.voucher .qrbox{display:flex;flex-direction:column;align-items:center;gap:1.2mm}
.voucher .qr{width:26mm;height:26mm}
.voucher.s-minimal .panel{background:var(--paper);color:var(--ink);border-right:0.3mm solid var(--ink)}
.voucher.s-minimal .side{border-left:0}
.voucher.s-bold .side{background:var(--paper)}
.voucher.s-bold{background:var(--ink)}

/* A5 flyer */
.flyer{width:148mm;height:210mm;display:flex;flex-direction:column}
.flyer .hero{position:relative;height:96mm;flex-shrink:0;background:var(--ink);display:flex;align-items:center;justify-content:center}
.flyer .hero .ph{inset:0}
.flyer .mark .logo.big{width:34mm;height:34mm;background:#fff;border-radius:4mm;padding:3mm}
.flyer .mark .mono.big{width:30mm;height:30mm;font-size:26pt;background:var(--on-ink);color:var(--ink)}
.flyer .pill{position:absolute;right:7mm;bottom:-6mm;z-index:1;background:var(--paper);color:var(--ink);border:0.5mm solid var(--ink);border-radius:20mm;padding:3mm 6mm;font-weight:800;font-size:12pt}
.flyer .body{flex:1;display:flex;flex-direction:column;padding:10mm 10mm 9mm}
.flyer .logo{width:9mm;height:9mm}
.flyer .mono{width:9mm;height:9mm;font-size:8pt}
.flyer .name{font-size:11pt}
.flyer .hl{font-size:24pt;line-height:1.08;font-weight:800;letter-spacing:-0.02em;color:#111;margin-top:4mm;font-family:var(--font)}
.flyer .msg{font-size:10pt;line-height:1.5;color:#333;margin-top:3.5mm}
.flyer .bottom{margin-top:auto;display:flex;align-items:center;gap:5mm;padding-top:5mm;border-top:0.3mm solid var(--rule)}
.flyer .qr{width:30mm;height:30mm;flex-shrink:0}
.flyer .cta{font-size:12pt;font-weight:800;color:var(--ink)}
.flyer .meta{display:flex;flex-direction:column;gap:0.8mm;font-size:8pt;color:#333;margin-top:1.5mm}
.flyer.s-bold{background:var(--ink)}
.flyer.s-bold .name,.flyer.s-bold .hl,.flyer.s-bold .msg,.flyer.s-bold .meta,.flyer.s-bold .k,.flyer.s-bold .cta{color:var(--on-ink)}
.flyer.s-bold .bottom{border-color:var(--on-ink)}
.flyer.s-bold .qr{padding:1.5mm;border-radius:1.5mm}
.flyer.s-minimal .hero{background:var(--paper);border-bottom:0.3mm solid var(--ink);margin:8mm 8mm 0;height:88mm}
.flyer.s-minimal .mark .mono.big{background:var(--ink);color:var(--on-ink)}
.flyer.s-minimal .hl{font-weight:600}
.flyer.s-photo .hero{height:112mm}
.flyer.s-photo .hl{font-size:22pt}

/* Counter sign */
.counter{width:148mm;height:210mm;display:flex;flex-direction:column;align-items:center;text-align:center;padding:14mm 12mm 10mm}
.counter .brand{flex-direction:column;gap:2.5mm}
.counter .logo{width:16mm;height:16mm}
.counter .mono{width:14mm;height:14mm;font-size:12pt}
.counter .name{font-size:14pt}
.counter .hl{font-size:22pt;line-height:1.12;font-weight:800;letter-spacing:-0.015em;color:#111;margin-top:7mm;max-width:118mm;font-family:var(--font)}
.counter .frame{position:relative;margin-top:9mm;padding:7mm;background:#fff}
.counter .qr{width:72mm;height:72mm}
.counter .c{position:absolute;width:9mm;height:9mm;border-color:var(--ink);border-style:solid;border-width:0}
.counter .tl{top:0;left:0;border-top-width:1.2mm;border-left-width:1.2mm}
.counter .tr{top:0;right:0;border-top-width:1.2mm;border-right-width:1.2mm}
.counter .bl{bottom:0;left:0;border-bottom-width:1.2mm;border-left-width:1.2mm}
.counter .br{bottom:0;right:0;border-bottom-width:1.2mm;border-right-width:1.2mm}
.counter .msg{font-size:10.5pt;color:#333;margin-top:7mm;max-width:110mm;line-height:1.45}
.counter .foot{margin-top:auto;font-size:9pt;color:var(--muted)}
.counter.s-classic::before{content:'';position:absolute;left:0;right:0;top:0;height:5mm;background:var(--ink)}
.counter.s-bold{background:var(--ink)}
.counter.s-bold .name,.counter.s-bold .hl,.counter.s-bold .msg,.counter.s-bold .foot{color:var(--on-ink)}
.counter.s-bold .mono{background:var(--on-ink);color:var(--ink)}
.counter.s-bold .c{border-color:var(--on-ink)}
.counter.s-minimal .c{border-width:0}
.counter.s-minimal .frame{border:0.3mm solid var(--ink)}
.counter.s-minimal .hl{font-weight:600}
.counter.s-photo{padding-top:0}
.counter.s-photo .ph{left:0;right:0;top:0;height:50mm}
.counter.s-photo .veil{bottom:auto;height:50mm}
.counter.s-photo .brand{position:relative;height:50mm;justify-content:center;flex-shrink:0}
.counter.s-photo .brand .name{color:#fff}
.counter.s-photo .brand .logo{background:#fff;border-radius:2mm;padding:1.5mm}
.counter.s-photo .hl{margin-top:6mm;font-size:20pt}
.counter.s-photo .frame{margin-top:6mm;padding:6mm}
.counter.s-photo .qr{width:58mm;height:58mm}
.counter.s-photo .msg{margin-top:5mm}

/* Loyalty stamp card */
.stamp{width:85mm;height:55mm;display:flex;flex-direction:column;padding:4.5mm 5mm}
.stamp .top{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm}
.stamp .logo{width:9mm;height:9mm}
.stamp .mono{width:9mm;height:9mm;font-size:8pt}
.stamp .bt{min-width:0}
.stamp .name{font-size:10pt}
.stamp .line{font-size:6.5pt;margin-top:0.4mm}
.stamp .qr{width:16mm;height:16mm;flex-shrink:0}
.stamp .rw{font-size:7.5pt;color:#333;margin-top:auto}
.stamp .rw b{color:var(--ink)}
.stamp .grid{display:grid;gap:1.6mm;margin-top:2mm;grid-template-columns:repeat(5,8.5mm);justify-content:space-between}
.stamp .g6{grid-template-columns:repeat(6,8.5mm)}
.stamp .g8{grid-template-columns:repeat(8,8mm)}
.stamp .st{width:8.5mm;height:8.5mm;border-radius:50%;border:0.3mm dashed var(--rule);display:flex;align-items:center;justify-content:center;font-size:5.5pt;color:var(--muted);font-family:Inter,Arial,sans-serif}
.stamp .g8 .st{width:8mm;height:8mm}
.stamp .free{background:var(--ink);color:var(--on-ink);border:0;font-weight:800;font-size:5pt;letter-spacing:0.04em}
.stamp.s-classic::before{content:'';position:absolute;left:0;right:0;top:0;height:1.6mm;background:var(--ink)}
.stamp.s-bold{background:var(--ink)}
.stamp.s-bold .name,.stamp.s-bold .line,.stamp.s-bold .rw,.stamp.s-bold .rw b{color:var(--on-ink)}
.stamp.s-bold .mono{background:var(--on-ink);color:var(--ink)}
.stamp.s-bold .st{border-color:var(--on-ink);color:var(--on-ink);opacity:0.85}
.stamp.s-bold .free{background:var(--on-ink);color:var(--ink);opacity:1}
.stamp.s-bold .qr{padding:1mm;border-radius:1mm}
.stamp.s-minimal .st{border:0.25mm solid var(--ink)}
.stamp.s-minimal .free{background:transparent;border:0.6mm solid var(--ink);color:var(--ink)}
.stamp.s-minimal .name{font-weight:600}

/* Delivery label */
.label{width:100mm;height:150mm;display:flex;flex-direction:column;padding:6mm;border:0.5mm solid #111}
.label .hd{display:flex;justify-content:space-between;align-items:flex-start;gap:4mm;padding-bottom:4mm;border-bottom:0.5mm solid var(--ink)}
.label .logo{width:11mm;height:11mm}
.label .mono{width:11mm;height:11mm;font-size:10pt}
.label .bt{min-width:0}
.label .name{font-size:12pt}
.label .line{font-size:7.5pt;margin-top:0.4mm}
.label .k2{display:block;font-size:6pt;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);font-weight:700;font-family:Inter,Arial,sans-serif;margin-bottom:0.6mm}
.label .ord{display:flex;flex-direction:column;align-items:flex-end;gap:1mm;font-size:6pt;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);font-weight:700;font-family:Inter,Arial,sans-serif;flex-shrink:0}
.label .ord i{display:block;width:26mm;height:8mm;border:0.35mm solid var(--ink);border-radius:1mm}
.label .to{display:flex;flex-direction:column;gap:3.4mm;padding:5mm 0}
.label .to .k2{font-size:8pt;color:var(--ink);margin-bottom:0}
.label .ln{display:grid;grid-template-columns:auto 1fr;align-items:end;gap:2mm;font-size:8pt;color:#333}
.label .ln i{display:block;border-bottom:0.3mm solid #888;height:5mm}
.label .note{border:0.5mm solid var(--ink);color:var(--ink);font-weight:800;text-align:center;padding:2mm;font-size:10pt;text-transform:uppercase;letter-spacing:0.06em}
.label .ft{margin-top:auto;display:flex;gap:4mm;align-items:center;padding-top:4mm;border-top:0.3mm dashed var(--rule)}
.label .qr{width:28mm;height:28mm;flex-shrink:0}
.label .cta{font-size:9pt;font-weight:800;color:var(--ink)}
.label .meta{display:flex;flex-direction:column;gap:0.6mm;font-size:7.5pt;color:#333;margin-top:1.2mm}
.label.s-bold .hd{background:var(--ink);margin:-6mm -6mm 0;padding:6mm;border-bottom:0}
.label.s-bold .hd .name,.label.s-bold .hd .line,.label.s-bold .hd .k2,.label.s-bold .ord{color:var(--on-ink)}
.label.s-bold .ord i{border-color:var(--on-ink);background:#fff}
.label.s-bold .hd .mono{background:var(--on-ink);color:var(--ink)}
.label.s-minimal{border-width:0.25mm}
.label.s-minimal .hd{border-bottom-width:0.25mm}
.label.s-minimal .note{border-width:0.25mm;font-weight:700}
`);