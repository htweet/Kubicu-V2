/**
 * The workspace's one Business WhatsApp number (D214). Set once in Settings → Business (or during
 * setup); every WhatsApp button, menu, product, shop, booking page and status page uses it unless
 * that block has its own number typed in (e.g. a branch line).
 *
 * Chat buttons are plain wa.me links — no WhatsApp API, account approval or connection needed.
 * Only automatic messages and the shared inbox need the WhatsApp Business API (a Meta partner).
 *
 * Like the active currency, it's set before rendering by the app shell (your workspace) and by
 * public pages (the page owner's workspace), so blocks, checks and previews read the same value.
 */
let active = '';

export function setActiveBusinessWhatsApp(phone: string | undefined): void {
  active = (phone ?? '').trim();
}

export function businessWhatsApp(): string {
  return active;
}

/** A block's own number if it has one, otherwise the business number. */
export function waNumber(own: string | undefined | null): string {
  return (own ?? '').trim() || active;
}

/** Whether this field is falling back to the business number. */
export function usesBusinessWhatsApp(own: string | undefined | null): boolean {
  return !(own ?? '').trim() && !!active;
}

/** Inspector hint for any WhatsApp number field. */
export function waFieldHint(own: string | undefined | null, extra?: string): string {
  const base = (own ?? '').trim()
    ? active
      ? 'Uses this number instead of your business number. Clear it to use the business number again.'
      : ''
    : active
      ? `Using your business number, ${active}. Type a number only to send this somewhere else.`
      : 'Include the country code. Tip: set it once in Settings → Business and every WhatsApp button uses it.';
  return [base, extra].filter(Boolean).join(' ');
}

type Translate = (text: string, vars?: Record<string, string | number>) => string;

/** Same hint in the editor's language (D296). */
export function waFieldHintIn(tr: Translate, own: string | undefined | null, extra?: string): string {
  const base = (own ?? '').trim()
    ? active
      ? tr('Uses this number instead of your business number. Clear it to use the business number again.')
      : ''
    : active
      ? tr('Using your business number, {phone}. Type a number only to send this somewhere else.', { phone: active })
      : tr('Include the country code. Tip: set it once in Settings → Business and every WhatsApp button uses it.');
  return [base, extra].filter(Boolean).join(' ');
}

/** Error text when neither the block nor the business has a number. */
export const NO_WA_NUMBER = 'Add a WhatsApp number here, or set your business number in Settings → Business';
