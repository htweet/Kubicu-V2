import type { NfcDestination, NfcKind, NfcTag } from '../types/nfc';
import type { CountryCode, CountryInfo } from '../types/country';
import { countryInfo } from './country';
import { uid } from './id';
import { figure, onOpsSettings } from './opsSettings';

/**
 * NFC tags (D442). Each tag holds a fixed tap address (/p/{handle}/t/{code}); where it sends people is
 * stored here, so it can be changed or turned off without reprinting. Taps are counted on the tag,
 * separately from QR scans. Tags from every workspace live under one key so the tap page can find them.
 */
export const NFC_KEY = 'kubicu.nfc';
export const NFC_EVENT = 'kubicu:nfc';
export let NFC_MAX_ORDER = 50;

/** `one` is the singular, used in tag lists and default names. Every label is a translation key (D444). */
export const nfcKinds: Record<NfcKind, { label: string; one: string; detail: string; unitNgn: number }> = {
  sticker: { label: 'Round stickers', one: 'Round sticker', detail: '30 mm · for counters, packaging and windows', unitNgn: 1_500 },
  card: { label: 'Tap cards', one: 'Tap card', detail: 'Card size · for your wallet or a till', unitNgn: 4_000 },
  keyring: { label: 'Keyrings', one: 'Keyring', detail: 'Epoxy fob · for staff and delivery riders', unitNgn: 3_000 },
};

export let NFC_DELIVERY_NGN = 2_500;

// Prices, delivery and order size are example figures staff can change (D465).
onOpsSettings(() => {
  nfcKinds.sticker.unitNgn = figure('nfc.stickerNgn');
  nfcKinds.card.unitNgn = figure('nfc.cardNgn');
  nfcKinds.keyring.unitNgn = figure('nfc.keyringNgn');
  NFC_DELIVERY_NGN = figure('nfc.deliveryNgn');
  NFC_MAX_ORDER = figure('nfc.maxOrder');
});

/**
 * Prices in the workspace country's own money (D471). Nigeria keeps the naira figures above; Kenya, Ghana and
 * South Africa have their own example prices (Figures & names → NFC tags), each delivered within that country.
 */
export function nfcPrices(country: CountryCode): { unit: Record<NfcKind, number>; delivery: number; currency: CountryInfo['currency'] } {
  const currency = countryInfo(country).currency;
  if (country === 'NG') return { unit: { sticker: nfcKinds.sticker.unitNgn, card: nfcKinds.card.unitNgn, keyring: nfcKinds.keyring.unitNgn }, delivery: NFC_DELIVERY_NGN, currency };
  const f = (k: string) => figure(`nfc.${country}.${k}`);
  return { unit: { sticker: f('sticker'), card: f('card'), keyring: f('keyring') }, delivery: f('delivery'), currency };
}

export function readTags(): NfcTag[] {
  try {
    return JSON.parse(localStorage.getItem(NFC_KEY) ?? '[]') as NfcTag[];
  } catch {
    return [];
  }
}

export function writeTags(list: NfcTag[]): boolean {
  try {
    localStorage.setItem(NFC_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(NFC_EVENT));
    return true;
  } catch {
    return false;
  }
}

const code = () => Math.random().toString(36).slice(2, 8);

export function orderTags(workspaceId: string, handle: string, kind: NfcKind, qty: number, destination: NfcDestination): { tags: NfcTag[]; ref: string } {
  const ref = `NFC-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const now = new Date();
  const arrivesBy = new Date(now.getTime() + 5 * 86_400_000).toISOString();
  const tags = Array.from({ length: qty }, (_, i): NfcTag => ({
    id: uid('nfc'),
    code: code(),
    workspaceId,
    handle,
    kind,
    label: `${nfcKinds[kind].one} ${i + 1}`,
    destination,
    status: 'active',
    orderRef: ref,
    arrivesBy,
    createdAt: now.toISOString(),
    taps: [],
  }));
  return { tags, ref };
}

export const tapPath = (t: Pick<NfcTag, 'handle' | 'code'>) => `/p/${t.handle}/t/${t.code}`;

export const tapsSince = (t: NfcTag, days: number) => {
  const since = Date.now() - days * 86_400_000;
  return t.taps.filter((x) => Date.parse(x) >= since).length;
};

export const arrived = (t: NfcTag) => Date.parse(t.arrivesBy) <= Date.now();

export function urlError(url: string): string | undefined {
  return /^https:\/\/[^\s]+\.[^\s]+/.test(url.trim()) ? undefined : 'Enter a full address starting with https://';
}

/** Records a tap and returns the tag, or null when there's no such tag. */
export function recordTap(handle: string, tapCode: string): NfcTag | null {
  const list = readTags();
  const tag = list.find((t) => t.code === tapCode && t.handle === handle);
  if (!tag) return null;
  if (tag.status === 'active') writeTags(list.map((t) => (t.id === tag.id ? { ...t, taps: [new Date().toISOString(), ...t.taps].slice(0, 500) } : t)));
  return tag;
}
