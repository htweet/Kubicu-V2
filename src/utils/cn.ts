import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge needs to know our custom type scale. Without this it reads `text-label`,
 * `text-body` etc. as text colours and silently drops real colours like `text-action-fg`
 * (e.g. primary buttons lost their label colour in Navy + warm clay).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'title', 'heading', 'body', 'label', 'caption', 'meta'] }],
      shadow: [{ shadow: ['1', '2', '3'] }]
    }
  }
});

export function cn(...classes: Array<string | false | null | undefined>): string {
  return twMerge(classes.filter(Boolean).join(' '));
}