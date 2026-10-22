import { toast } from 'sonner';

/** Copies text and confirms with a short toast. */
export async function copyToClipboard(text: string, what = 'Copied'): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(what, { description: text.length > 60 ? `${text.slice(0, 57)}…` : text });
  } catch {
    toast.error('Couldn’t copy', { description: 'Select the text and copy it by hand.' });
  }
}