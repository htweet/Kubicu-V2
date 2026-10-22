import type { Space } from '../types/workspace';
import type { PersistedPage } from '../types/workspace';
import { samplePage } from './samplePage';
import { SAMPLE_CAMPAIGN_HANDLE, SAMPLE_ROOM_HANDLE } from './commerceSeed';
import { starterSpaceDoc } from '../utils/spaceStarters';
import { readPersistedPage, writePersistedPage, DEMO_WORKSPACE_ID } from '../utils/workspaceStorage';
import { spaceStorageId } from '../utils/spaces';

const day = 86400000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * day).toISOString();

/**
 * SAMPLE campaign and DealRoom for the demo workspace (labelled “sample” in their names).
 * The campaign is live with the EID20 code; the group buy has four real sample orders out of 10.
 */
export function seedSampleSpaces(): Space[] {
  const created = '2026-10-18T09:00:00.000Z';
  const spaces: Space[] = [
  { id: 'sp_sample_eid', kind: 'campaign', name: 'Eid sale (sample)', createdAt: created, archivedAt: null },
  { id: 'sp_sample_room', kind: 'dealroom', name: 'Scarf group buy (sample)', createdAt: created, archivedAt: null }];


  const campaign = starterSpaceDoc('campaign', samplePage, {
    id: `page_${DEMO_WORKSPACE_ID}_sp_sample_eid`,
    name: 'Eid sale',
    handle: SAMPLE_CAMPAIGN_HANDLE,
    campaign: { starter: 'sale', startsAt: iso(-1), endsAt: iso(5), discountId: 'sd_eid', productIds: ['sp_wrap', 'sp_ife', 'sp_scarf'] },
    discountCode: 'EID20'
  });
  const room = starterSpaceDoc('dealroom', samplePage, {
    id: `page_${DEMO_WORKSPACE_ID}_sp_sample_room`,
    name: 'Adire scarf group buy',
    handle: SAMPLE_ROOM_HANDLE,
    dealRoom: { type: 'goal', productId: 'sp_scarf', priceNgn: 14000, seats: null, goal: 10, perPersonLimit: 2, opensAt: null, deadline: iso(3), endedAt: null, extensions: [], updates: [], referralReward: 'Bring 3 friends and your scarf comes with free gift wrapping.' }
  });

  [
  [spaces[0], campaign],
  [spaces[1], room]].
  forEach(([space, doc]) => {
    const id = spaceStorageId(DEMO_WORKSPACE_ID, (space as Space).id);
    if (readPersistedPage(id)) return;
    const d = doc as typeof campaign;
    const page: PersistedPage = { draft: d, published: d, publishedAt: created, versions: [], lastSavedAt: created, scheduled: null };
    try {
      writePersistedPage(id, page);
    } catch {

      // Storage unavailable — the spaces still appear, as drafts that won't load.
    }});
  return spaces;
}