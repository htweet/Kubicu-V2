/** Printed identity kit: business cards, stickers, package inserts and receipt footers carrying a tracked QR code (D86). */

export type KitItem = 'card' | 'sticker' | 'insert' | 'receipt';

export interface KitDetails {
  name: string;
  line: string;
  phone: string;
  address: string;
  message: string;
  /** Colour for the name, accent bar and sticker ring. Dark enough to print on white. */
  ink: string;
}

export const kitItems: {id: KitItem;label: string;detail: string;perSheet: string;widthMm: number;heightMm: number;}[] = [
{ id: 'card', label: 'Business cards', detail: '85 × 55 mm, single-sided', perSheet: '10 on an A4 sheet', widthMm: 85, heightMm: 55 },
{ id: 'sticker', label: 'Round stickers', detail: '50 mm — bags, boxes, jars', perSheet: '12 on an A4 sheet', widthMm: 50, heightMm: 50 },
{ id: 'insert', label: 'Package inserts', detail: 'A6 thank-you card for orders', perSheet: '4 on an A4 sheet', widthMm: 105, heightMm: 148 },
{ id: 'receipt', label: 'Receipt footer', detail: '80 mm strip for receipt printers', perSheet: 'One per print', widthMm: 80, heightMm: 112 }];


const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const baseCss = `
*{box-sizing:border-box}
html,body{margin:0;font-family:Inter,Arial,sans-serif;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.item{position:relative;overflow:hidden;background:#fff}
.qr{display:block;object-fit:contain}
.name{font-weight:700;letter-spacing:-0.01em;margin:0}
.muted{color:#555;margin:0}
.card{width:85mm;height:55mm;display:flex;align-items:center;gap:4mm;padding:5mm 5mm 5mm 8mm}
.card .bar{position:absolute;left:0;top:0;bottom:0;width:3mm}
.card .text{flex:1;min-width:0;display:flex;flex-direction:column;gap:1.2mm}
.card .name{font-size:12pt;line-height:1.15}
.card .line{font-size:8pt}
.card .meta{font-size:7.5pt;margin-top:1.5mm}
.card .qr{width:27mm;height:27mm;flex-shrink:0}
.sticker{width:50mm;height:50mm;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1mm;border:1.6mm solid}
.sticker .qr{width:28mm;height:28mm}
.sticker .name{font-size:7pt;max-width:34mm;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.insert{width:105mm;height:148mm;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 9mm 9mm}
.insert .band{width:calc(100% + 18mm);padding:7mm 9mm;color:#fff}
.insert .band .name{font-size:15pt}
.insert .msg{font-size:10.5pt;line-height:1.45;margin:7mm 0 0}
.insert .qr{width:46mm;height:46mm;margin-top:auto}
.insert .cta{font-size:9pt;font-weight:600;margin:3mm 0 1mm}
.insert .addr{font-size:8pt}
.receipt{width:80mm;padding:4mm 5mm 6mm;display:flex;flex-direction:column;align-items:center;text-align:center;gap:1.5mm;border-top:0.4mm dashed #999}
.receipt .name{font-size:11pt}
.receipt .msg{font-size:8.5pt}
.receipt .qr{width:36mm;height:36mm;margin:2mm 0}
.receipt .addr{font-size:7.5pt}
`;

/** One item as HTML — used for both the on-screen preview and the print sheet. */
export function kitItemHtml(item: KitItem, d: KitDetails, qrDataUrl: string): string {
  const qr = `<img class="qr" src="${qrDataUrl}" alt="QR code"/>`;
  const name = `<p class="name" style="color:${esc(d.ink)}">${esc(d.name)}</p>`;
  switch (item) {
    case 'card':
      return `<div class="item card"><span class="bar" style="background:${esc(d.ink)}"></span><div class="text">${name}${d.line ? `<p class="muted line">${esc(d.line)}</p>` : ''}<p class="muted meta">${[d.phone, d.address].filter(Boolean).map(esc).join('<br/>')}</p></div>${qr}</div>`;
    case 'sticker':
      return `<div class="item sticker" style="border-color:${esc(d.ink)}">${qr}<p class="name" style="color:${esc(d.ink)}">${esc(d.name)}</p></div>`;
    case 'insert':
      return `<div class="item insert"><div class="band" style="background:${esc(d.ink)}"><p class="name">${esc(d.name)}</p></div>${d.message ? `<p class="msg">${esc(d.message)}</p>` : ''}${qr}<p class="cta">Scan to reorder, track or review</p><p class="muted addr">${esc(d.address)}</p></div>`;
    case 'receipt':
      return `<div class="item receipt">${name}${d.message ? `<p class="muted msg">${esc(d.message)}</p>` : ''}${qr}<p class="muted addr">${esc(d.address)}${d.phone ? `<br/>${esc(d.phone)}` : ''}</p></div>`;
  }
}

/** A standalone document holding one item, for a preview iframe. */
export function kitPreviewDoc(item: KitItem, d: KitDetails, qrDataUrl: string): string {
  return `<!doctype html><html><head><style>${baseCss}body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:transparent}</style></head><body>${kitItemHtml(item, d, qrDataUrl)}</body></html>`;
}

const sheets: Record<KitItem, {page: string;count: number;grid: string;}> = {
  card: { page: 'A4;margin:10mm', count: 10, grid: 'display:grid;grid-template-columns:repeat(2,85mm);grid-auto-rows:55mm;gap:0;justify-content:center' },
  sticker: { page: 'A4;margin:12mm', count: 12, grid: 'display:grid;grid-template-columns:repeat(3,50mm);grid-auto-rows:50mm;gap:10mm 12mm;justify-content:center' },
  insert: { page: 'A4;margin:0', count: 4, grid: 'display:grid;grid-template-columns:repeat(2,105mm);grid-auto-rows:148mm;gap:0' },
  receipt: { page: '80mm auto;margin:0', count: 1, grid: 'display:block' }
};

/** Opens a print-ready sheet in a new window. Returns false if the browser blocked it. */
export function printKit(item: KitItem, d: KitDetails, qrDataUrl: string): boolean {
  const w = window.open('', '_blank', 'width=820,height=960');
  if (!w) return false;
  const s = sheets[item];
  const cut = item === 'card' || item === 'insert' ? '.item{outline:0.2mm dashed #ccc;outline-offset:-0.1mm}' : '';
  const body = Array.from({ length: s.count }, () => kitItemHtml(item, d, qrDataUrl)).join('');
  w.document.write(`<!doctype html><html><head><title>${esc(d.name)} — ${item} print</title><style>${baseCss}@page{size:${s.page}}${cut}.sheet{${s.grid}}</style></head><body><div class="sheet">${body}</div><script>window.onload=function(){setTimeout(function(){window.print()},250)}</script></body></html>`);
  w.document.close();
  return true;
}