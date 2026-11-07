import type { MediaFolder } from '../types/media';

/**
 * Default folders every workspace has. Uploads from brand or product fields land in these automatically.
 * Add an entry here (and pass its id as `folder` on the relevant MediaPicker) to create another default folder.
 */
export const systemMediaFolders: MediaFolder[] = [
  {
    id: 'brand',
    name: 'Brand assets',
    system: true,
    description: 'Logos, profile photos, shop banners and other brand images. Brand uploads anywhere in KUBICU land here.',
  },
  {
    id: 'products',
    name: 'Product images',
    system: true,
    description: 'Product photos from Commerce and product blocks land here.',
  },
];

export type SystemMediaFolderId = 'brand' | 'products';

export const isSystemFolder = (id: string | undefined) => !!id && systemMediaFolders.some((f) => f.id === id);
