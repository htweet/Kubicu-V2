import type { PartnerBusiness } from '../types/partnership';

/**
 * KUBICU businesses you can find by handle when starting a partnership (D120).
 * In the prototype these stand in for other workspaces on the platform.
 */
export const partnerDirectory: (PartnerBusiness & {handle: string;})[] = [
{ name: 'Halima Gele Studio', handle: 'halimagele', verified: true, trustLevel: 'trusted', plan: 'creator', category: 'Gele & headwraps', city: 'Lagos' },
{ name: 'Tolu’s Cake Kitchen', handle: 'tolucakes', verified: true, trustLevel: 'top', plan: 'pro', category: 'Cakes & small chops', city: 'Lagos' },
{ name: 'Lens by Chuka', handle: 'lensbychuka', verified: true, trustLevel: 'building', plan: 'pro', category: 'Event photography', city: 'Abuja' },
{ name: 'Ankara by Ify', handle: 'ankarabyify', verified: false, trustLevel: 'new', plan: 'free', category: 'Fabrics', city: 'Onitsha' },
{ name: 'Mama Bisi Catering', handle: 'mamabisi', verified: true, trustLevel: 'trusted', plan: 'business', category: 'Owambe catering', city: 'Ibadan' },
{ name: 'Owambe Rentals PH', handle: 'owamberentals', verified: false, trustLevel: 'building', plan: 'creator', category: 'Chairs, canopies & décor', city: 'Port Harcourt' }];


export function searchDirectory(q: string, exclude: string[] = []) {
  const s = q.trim().toLowerCase().replace(/^@/, '').replace(/^kub\.icu\//, '');
  return partnerDirectory.filter((b) => !exclude.includes(b.handle) && (!s || b.handle.includes(s) || b.name.toLowerCase().includes(s) || (b.category ?? '').toLowerCase().includes(s)));
}