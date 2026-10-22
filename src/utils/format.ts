import { formatDistanceToNow, format } from 'date-fns';

const ngn = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

export function formatNgn(amount: number): string {
  return ngn.format(amount);
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function formatTimestamp(iso: string): string {
  return format(new Date(iso), "d MMM yyyy, HH:mm");
}

export function whatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  const text = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : '';
  return `https://wa.me/${digits}${text}`;
}

export function publicUrl(handle: string): string {
  return `kub.icu/${handle}`;
}