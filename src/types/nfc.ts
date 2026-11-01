/** NFC tags (D442): ordered from KUBICU, each pointing at a page or link that can be changed after printing. */
export type NfcKind = 'sticker' | 'card' | 'keyring';

export type NfcDestination = {type: 'page';} | {type: 'link';linkId: string;} | {type: 'url';url: string;};

export interface NfcTag {
  id: string;
  /** Written into the chip: /p/{handle}/t/{code}. Never changes, so the tag can be re-pointed. */
  code: string;
  workspaceId: string;
  handle: string;
  kind: NfcKind;
  label: string;
  destination: NfcDestination;
  status: 'active' | 'off';
  orderRef: string;
  arrivesBy: string;
  createdAt: string;
  /** Tap times, newest first (kept to 500). */
  taps: string[];
}