import type { DomainsData } from '../types/domains';
import { MAIN_SPACE_ID } from '../utils/spaces';

/** Demo workspace: two labelled sample short links and one QR code (D62). Sample visits use the same slugs. */
export function sampleDomains(): Pick<DomainsData, 'links' | 'qrs'> {
  const at = new Date(Date.now() - 32 * 86400000).toISOString();
  return {
    links: [
    { id: 'lnk_sample_ig', slug: 'ig', name: 'Instagram bio (sample)', source: 'instagram', destination: { spaceId: MAIN_SPACE_ID, path: '' }, createdAt: at, archivedAt: null },
    { id: 'lnk_sample_flyer', slug: 'flyer', name: 'Market flyer (sample)', source: 'qr', destination: { spaceId: MAIN_SPACE_ID, path: '' }, createdAt: at, archivedAt: null }],

    qrs: [{ id: 'qr_sample_flyer', linkId: 'lnk_sample_flyer', fg: '#111111', bg: '#FFFFFF', centre: true, frameText: 'Scan to order', createdAt: at }]
  };
}