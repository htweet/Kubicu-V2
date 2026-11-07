import type { KitDetails, KitItemSpec } from './printKit';
import { paperColour, onInk, PHOTO_ITEMS } from './printKitTemplates';
import { contrastRatio } from '../contrast';
import { printDpi } from './kitImages';

export type KitCheckLevel = 'pass' | 'warn' | 'fail';
export interface KitCheck {
  id: string;
  level: KitCheckLevel;
  text: string;
}

/** Text limits per item before it starts to squeeze. */
const nameLimit: Record<string, number> = { card: 26, sticker: 22, insert: 26, receipt: 30, hangtag: 18, voucher: 30, flyer: 30, counter: 28, stamp: 22, label: 28 };
/** Small pieces where bigger text quickly runs out of room. */
const small = new Set(['card', 'sticker', 'hangtag', 'stamp']);
/** Width the photo fills on each piece, in mm — for the sharpness check. */
const photoWidth: Record<string, number> = { card: 27, sticker: 50, insert: 105, hangtag: 50, voucher: 74, flyer: 148, counter: 148 };

/** Print-readiness review shown beside the preview (D118, D119). Fails block printing and ordering. */
export function kitChecks(spec: KitItemSpec, d: KitDetails, opts: { photoPx: number | null; qrWeak: boolean }): KitCheck[] {
  const out: KitCheck[] = [];
  const paper = paperColour(d.paper, d.ink);

  const qrMm = Math.round(spec.qrMm * (d.qrScale || 1));
  if (opts.qrWeak) out.push({ id: 'qr', level: 'fail', text: 'The QR code’s colours are too close to scan. Raise the contrast in QR codes.' });
  else if (qrMm < 15) out.push({ id: 'qr', level: 'fail', text: `The QR code would print at ${qrMm} mm — too small for most phones. Make it bigger.` });
  else if (qrMm < 18) out.push({ id: 'qr', level: 'warn', text: `The QR code prints at ${qrMm} mm. It scans up close; a little bigger is safer.` });
  else out.push({ id: 'qr', level: 'pass', text: `QR code prints at ${qrMm} mm — large and clear enough to scan.` });

  const inkRatio = contrastRatio(d.ink, paper);
  if (inkRatio < 3) out.push({ id: 'ink', level: 'fail', text: `Your colour is too light on ${d.paper} paper (${inkRatio.toFixed(1)}:1). Choose a darker one.` });
  else if (inkRatio < 4.5) out.push({ id: 'ink', level: 'warn', text: `Small text in your colour may look faint on ${d.paper} paper. A darker shade prints more clearly.` });
  else out.push({ id: 'ink', level: 'pass', text: 'Colours read clearly on the paper.' });

  if (d.style === 'bold' && contrastRatio(onInk(d.ink), d.ink) < 4.5) out.push({ id: 'bold', level: 'warn', text: 'Text on your solid colour is a little faint. A deeper colour works better for Bold.' });

  if (d.name.length > (nameLimit[spec.id] ?? 28)) out.push({ id: 'name', level: 'warn', text: `Your business name is long for ${spec.label.toLowerCase()} and will be squeezed. A shorter version reads better.` });

  if (small.has(spec.id) && ((d.nameScale || 1) > 1.15 || (d.textScale || 1) > 1.15))
    out.push({ id: 'big', level: 'warn', text: 'Larger text can run out of room on small pieces. Check it in the actual-size view before printing.' });
  if ((d.textScale || 1) < 0.9 && small.has(spec.id)) out.push({ id: 'tiny', level: 'warn', text: 'Smaller body text may be hard to read on a small card — especially for older customers.' });

  if (spec.fields.includes('message') && d.message.length > (spec.id === 'receipt' ? 120 : 220)) out.push({ id: 'msg', level: 'warn', text: 'The message is long for this size — keep it to two or three short sentences.' });

  const usesPhoto = spec.images.includes('photo') && (d.style === 'photo' || spec.id === 'flyer' || spec.id === 'insert');
  if (usesPhoto && d.photo && opts.photoPx) {
    const dpi = Math.round(printDpi(opts.photoPx, photoWidth[spec.id] ?? 50) / (d.photoZoom || 1));
    if (dpi < 150) out.push({ id: 'photo', level: 'warn', text: `Your photo is small for this size${(d.photoZoom || 1) > 1 ? ' at this zoom' : ''} (about ${dpi} dpi) and may print blurry. Zoom out or use a larger original.` });
  }
  if (d.style === 'photo' && !d.photo && PHOTO_ITEMS.has(spec.id)) out.push({ id: 'nophoto', level: 'warn', text: 'The Photo design needs a photo — until you add one, Classic is used.' });
  if (d.style === 'photo' && !PHOTO_ITEMS.has(spec.id)) out.push({ id: 'nophotoitem', level: 'warn', text: `${spec.label} don’t have a Photo design — Classic is used.` });

  if (spec.id === 'voucher') {
    if (!d.offer.trim()) out.push({ id: 'offer', level: 'fail', text: 'Add what the voucher is worth, e.g. “₦5,000” or “Free gele tying”.' });
    if (!d.expiry.trim()) out.push({ id: 'exp', level: 'warn', text: 'Add an expiry date so customers know when to use it.' });
  }
  if (spec.id === 'stamp' && !d.reward.trim()) out.push({ id: 'reward', level: 'fail', text: 'Add what a full card earns, e.g. “Free wash & set”.' });
  if (spec.id === 'sticker' && d.paper !== 'white') out.push({ id: 'stickerpaper', level: 'warn', text: 'Sticker paper is usually white — the paper tone prints as a colour fill.' });
  if (spec.id === 'receipt' && (d.logo || d.style !== 'classic')) out.push({ id: 'thermal', level: 'pass', text: 'Receipt printers print in black only — your logo is printed in greyscale.' });
  if (spec.id === 'label' && !d.phone.trim()) out.push({ id: 'labelphone', level: 'warn', text: 'Add your phone so riders can reach you if they can’t find the address.' });

  return out;
}
