/**
 * Printed identity kit (D86, expanded D118, D119): business cards (with optional backs), round stickers,
 * package inserts, receipt footers, swing tags, gift vouchers, A5 flyers, counter signs,
 * loyalty stamp cards and delivery labels — each carrying a tracked QR code, in four designs,
 * four typefaces and three paper tones, with your logo, a photo and a signature, all resizable.
 */
import { kitItemHtml as renderItem, kitCardBackHtml, kitCss, kitFontsUrl } from './printKitTemplates';

export type KitItem = 'card' | 'sticker' | 'insert' | 'receipt' | 'hangtag' | 'voucher' | 'flyer' | 'counter' | 'stamp' | 'label';
export type KitStyle = 'classic' | 'bold' | 'minimal' | 'photo';
export type KitFont = 'modern' | 'elegant' | 'friendly' | 'heritage';
export type KitPaper = 'white' | 'cream' | 'tint';
export type KitTone = 'natural' | 'bw' | 'warm';
export type KitField = 'line' | 'message' | 'headline' | 'offer' | 'code' | 'expiry' | 'signer' | 'social' | 'email' | 'reward' | 'note';
export type KitImage = 'logo' | 'photo' | 'signature';

export interface KitDetails {
  name: string;
  line: string;
  phone: string;
  /** The tracked short link printed under the code. */
  address: string;
  message: string;
  /** Colour for names, bars and panels. Must read on the chosen paper. */
  ink: string;
  social: string;
  email: string;
  /** Big line on flyers and counter signs. */
  headline: string;
  /** Voucher amount or offer — always the seller's own words, never suggested. */
  offer: string;
  code: string;
  expiry: string;
  signer: string;
  /** Loyalty card: what a full card earns — the seller's own words. */
  reward: string;
  /** Loyalty card: how many stamps, the last one being the reward. */
  stamps: number;
  /** Delivery label: a handling note printed in a box. */
  note: string;
  logo: string | null;
  photo: string | null;
  signature: string | null;
  style: KitStyle;
  font: KitFont;
  paper: KitPaper;
  /** Business cards: also print a back side. */
  cardBack: boolean;
  /** Size multipliers (1 = designed size). */
  nameScale: number;
  textScale: number;
  qrScale: number;
  logoScale: number;
  sigScale: number;
  /** Photo crop: zoom (1–2.5) and focus point in percent. */
  photoZoom: number;
  photoX: number;
  photoY: number;
  photoTone: KitTone;
}

export interface KitItemSpec {
  id: KitItem;
  label: string;
  detail: string;
  perSheet: string;
  widthMm: number;
  heightMm: number;
  /** Text fields this item uses, in form order. */
  fields: KitField[];
  images: KitImage[];
  /** What it's for — shown under the label. */
  goodFor: string;
  /** Designed QR size in mm, for the scan-size check. */
  qrMm: number;
}

export const kitItems: KitItemSpec[] = [
{ id: 'card', label: 'Business cards', detail: '85 × 55 mm, front and optional back', perSheet: '10 on an A4 sheet', widthMm: 85, heightMm: 55, fields: ['line', 'social', 'email'], images: ['logo', 'photo'], goodFor: 'Handing out at markets, events and meetings', qrMm: 24 },
{ id: 'sticker', label: 'Round stickers', detail: '50 mm with curved lettering', perSheet: '12 on an A4 sheet', widthMm: 50, heightMm: 50, fields: ['line'], images: ['logo', 'photo'], goodFor: 'Sealing bags, boxes, jars and food packs', qrMm: 22 },
{ id: 'insert', label: 'Package inserts', detail: 'A6 thank-you card, signed', perSheet: '4 on an A4 sheet', widthMm: 105, heightMm: 148, fields: ['message', 'signer', 'social'], images: ['logo', 'photo', 'signature'], goodFor: 'Inside every order — turns buyers into repeat buyers', qrMm: 36 },
{ id: 'receipt', label: 'Receipt footer', detail: '80 mm strip for receipt printers', perSheet: 'One per print', widthMm: 80, heightMm: 112, fields: ['message', 'social'], images: ['logo'], goodFor: 'Bottom of every POS receipt', qrMm: 34 },
{ id: 'hangtag', label: 'Swing tags', detail: '50 × 90 mm with hole, size and price lines', perSheet: '12 on an A4 sheet', widthMm: 50, heightMm: 90, fields: ['line', 'social'], images: ['logo', 'photo'], goodFor: 'Clothing, bags, jewellery and crafts', qrMm: 22 },
{ id: 'voucher', label: 'Gift vouchers', detail: '210 × 99 mm, numbered code and signature', perSheet: '3 on an A4 sheet', widthMm: 210, heightMm: 99, fields: ['headline', 'offer', 'code', 'expiry', 'message', 'signer'], images: ['logo', 'photo', 'signature'], goodFor: 'Gifts, giveaways, loyalty rewards and festive promos', qrMm: 26 },
{ id: 'flyer', label: 'A5 flyers', detail: '148 × 210 mm, photo-led', perSheet: '2 on an A4 sheet', widthMm: 148, heightMm: 210, fields: ['headline', 'line', 'message', 'offer', 'social'], images: ['logo', 'photo'], goodFor: 'Shop windows, churches, campuses, estates and events', qrMm: 30 },
{ id: 'counter', label: 'Counter & table signs', detail: 'A5 “Scan to order” sign', perSheet: '2 on an A4 sheet', widthMm: 148, heightMm: 210, fields: ['headline', 'message'], images: ['logo', 'photo'], goodFor: 'Counters, tables, stalls and reception desks', qrMm: 72 },
{ id: 'stamp', label: 'Loyalty stamp cards', detail: '85 × 55 mm, 6, 8 or 10 stamps', perSheet: '10 on an A4 sheet', widthMm: 85, heightMm: 55, fields: ['reward', 'line'], images: ['logo'], goodFor: 'Salons, food spots, laundries — “the 10th one is free”', qrMm: 16 },
{ id: 'label', label: 'Delivery labels', detail: '100 × 150 mm with To and landmark lines', perSheet: '2 on an A4 sheet, or one per 4×6 label', widthMm: 100, heightMm: 150, fields: ['note', 'social'], images: ['logo'], goodFor: 'Every parcel you send with a rider or through a park', qrMm: 28 }];


export const kitStyles: {id: KitStyle;label: string;detail: string;}[] = [
{ id: 'classic', label: 'Classic', detail: 'Colour bar, clean and trusted' },
{ id: 'bold', label: 'Bold', detail: 'Solid colour, stands out' },
{ id: 'minimal', label: 'Minimal', detail: 'Hairlines and space' },
{ id: 'photo', label: 'Photo', detail: 'Led by your photo' }];


export const kitFonts: {id: KitFont;label: string;family: string;detail: string;}[] = [
{ id: 'modern', label: 'Modern', family: "'Inter', Arial, sans-serif", detail: 'Inter' },
{ id: 'elegant', label: 'Elegant', family: "'Playfair Display', Georgia, serif", detail: 'Playfair Display' },
{ id: 'friendly', label: 'Friendly', family: "'Nunito', Arial, sans-serif", detail: 'Nunito' },
{ id: 'heritage', label: 'Heritage', family: "'Libre Baskerville', Georgia, serif", detail: 'Libre Baskerville' }];


export const kitPapers: {id: KitPaper;label: string;}[] = [
{ id: 'white', label: 'White' },
{ id: 'cream', label: 'Cream' },
{ id: 'tint', label: 'Tinted' }];


export const kitTones: {id: KitTone;label: string;}[] = [
{ id: 'natural', label: 'Natural' },
{ id: 'warm', label: 'Warm' },
{ id: 'bw', label: 'Black & white' }];


/** Sizes as designed — used by "Reset sizes". */
export const kitDefaultSizes = { nameScale: 1, textScale: 1, qrScale: 1, logoScale: 1, sigScale: 1, photoZoom: 1, photoX: 50, photoY: 50 } as const;

export function defaultKitDetails(name: string, phone: string): KitDetails {
  return {
    name,
    line: '',
    phone,
    address: '',
    message: 'Thank you for buying from us! Scan to reorder, track your order or leave a review.',
    ink: '#111111',
    social: '',
    email: '',
    headline: '',
    offer: '',
    code: '',
    expiry: '',
    signer: '',
    reward: '',
    stamps: 10,
    note: '',
    logo: null,
    photo: null,
    signature: null,
    style: 'classic',
    font: 'modern',
    paper: 'white',
    cardBack: false,
    ...kitDefaultSizes,
    photoTone: 'natural'
  };
}

/** One item as HTML — used for both the on-screen preview and the print sheet. */
export function kitItemHtml(item: KitItem, d: KitDetails, qrDataUrl: string, side: 'front' | 'back' = 'front'): string {
  return side === 'back' && item === 'card' ? kitCardBackHtml(d) : renderItem(item, d, qrDataUrl);
}

/** A standalone document holding one item, for a preview iframe. */
export function kitPreviewDoc(item: KitItem, d: KitDetails, qrDataUrl: string, side: 'front' | 'back' = 'front'): string {
  return `<!doctype html><html><head><link rel="stylesheet" href="${kitFontsUrl()}"/><style>${kitCss}body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:transparent}</style></head><body>${kitItemHtml(item, d, qrDataUrl, side)}</body></html>`;
}

const sheets: Record<KitItem, {page: string;count: number;grid: string;sizeMm: [number, number] | null;}> = {
  card: { page: 'A4;margin:10mm', count: 10, grid: 'display:grid;grid-template-columns:repeat(2,85mm);grid-auto-rows:55mm;gap:0;justify-content:center', sizeMm: [210, 297] },
  sticker: { page: 'A4;margin:12mm', count: 12, grid: 'display:grid;grid-template-columns:repeat(3,50mm);grid-auto-rows:50mm;gap:10mm 12mm;justify-content:center', sizeMm: [210, 297] },
  insert: { page: 'A4;margin:0', count: 4, grid: 'display:grid;grid-template-columns:repeat(2,105mm);grid-auto-rows:148mm;gap:0', sizeMm: [210, 297] },
  receipt: { page: '80mm auto;margin:0', count: 1, grid: 'display:block', sizeMm: null },
  hangtag: { page: 'A4;margin:8mm 5mm', count: 12, grid: 'display:grid;grid-template-columns:repeat(4,50mm);grid-auto-rows:90mm;gap:0;justify-content:center', sizeMm: [210, 297] },
  voucher: { page: 'A4;margin:0', count: 3, grid: 'display:grid;grid-template-columns:210mm;grid-auto-rows:99mm;gap:0', sizeMm: [210, 297] },
  flyer: { page: 'A4 landscape;margin:0', count: 2, grid: 'display:grid;grid-template-columns:repeat(2,148mm);grid-auto-rows:210mm;gap:0;justify-content:center', sizeMm: [297, 210] },
  counter: { page: 'A4 landscape;margin:0', count: 2, grid: 'display:grid;grid-template-columns:repeat(2,148mm);grid-auto-rows:210mm;gap:0;justify-content:center', sizeMm: [297, 210] },
  stamp: { page: 'A4;margin:10mm', count: 10, grid: 'display:grid;grid-template-columns:repeat(2,85mm);grid-auto-rows:55mm;gap:0;justify-content:center', sizeMm: [210, 297] },
  label: { page: 'A4;margin:0', count: 2, grid: 'display:grid;grid-template-columns:repeat(2,100mm);grid-auto-rows:150mm;gap:0;justify-content:center;padding-top:10mm', sizeMm: [210, 297] }
};

/** Paper size of the home-print sheet, or null for receipts (continuous roll). */
export const kitSheetSize = (item: KitItem): [number, number] | null => sheets[item].sizeMm;
export const kitSheetCount = (item: KitItem): number => sheets[item].count;

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** The full print sheet as a document. `withPrint` adds the auto-print script. */
export function kitSheetDoc(item: KitItem, d: KitDetails, qrDataUrl: string, opts: {withPrint?: boolean;side?: 'front' | 'back' | 'both';} = {}): string {
  const s = sheets[item];
  const side = opts.side ?? 'both';
  const cut = item === 'sticker' || item === 'receipt' ? '' : '.sheet>.item{outline:0.2mm dashed #c8c8c8;outline-offset:-0.1mm}';
  const front = `<div class="sheet">${Array.from({ length: s.count }, () => kitItemHtml(item, d, qrDataUrl)).join('')}</div>`;
  // Card backs go on a second page in the same positions, ready for double-sided (flip on long edge) printing.
  const hasBack = item === 'card' && d.cardBack;
  const back = hasBack ? `<div class="sheet"${side === 'both' ? ' style="break-before:page"' : ''}>${Array.from({ length: s.count }, () => kitItemHtml(item, d, qrDataUrl, 'back')).join('')}</div>` : '';
  const body = side === 'front' ? front : side === 'back' && hasBack ? back : `${front}${back}`;
  const page = opts.withPrint ? `@page{size:${s.page}}` : `body{background:#fff;${s.sizeMm ? `width:${s.sizeMm[0]}mm;min-height:${s.sizeMm[1]}mm;padding:${s.page.split('margin:')[1] ?? '0'}` : ''}}`;
  const script = opts.withPrint ? `<script>window.onload=function(){var go=function(){setTimeout(function(){window.print()},250)};(document.fonts&&document.fonts.ready?document.fonts.ready.then(go):go())}</script>` : '';
  return `<!doctype html><html><head><title>${esc(d.name)} — ${item} print</title><link rel="stylesheet" href="${kitFontsUrl()}"/><style>${kitCss}${page}${cut}.sheet{${s.grid}}</style></head><body>${body}${script}</body></html>`;
}

/** Opens a print-ready sheet in a new window. Returns false if the browser blocked it. */
export function printKit(item: KitItem, d: KitDetails, qrDataUrl: string): boolean {
  const w = window.open('', '_blank', 'width=900,height=960');
  if (!w) return false;
  w.document.write(kitSheetDoc(item, d, qrDataUrl, { withPrint: true }));
  w.document.close();
  return true;
}