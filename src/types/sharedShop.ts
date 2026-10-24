/**
 * Shared storefronts (D128): one shop link where a group of sellers — a market line, a
 * fashion collective, a church fair — show their products together. Each seller keeps their
 * own checkout, payments and delivery; the shared shop is a window, not a merged till.
 */

export type MemberStatus = 'invited' | 'joined' | 'left';

export interface SharedShopMember {
  id: string;
  name: string;
  /** KUBICU handle; checkout links go to this seller's own shop. */
  handle: string;
  /** Set when the seller's workspace is on this device, so real products can be read. */
  workspaceId: string | null;
  partnershipId: string | null;
  status: MemberStatus;
  /** Products the member chose to show. Empty = all their shop products. */
  productIds: string[];
  joinedAt?: string;
  /** Sample cards for fictional partners only, clearly labelled. */
  sampleItems?: {id: string;name: string;priceNgn: number;imageUrl: string;imageAlt: string;}[];
}

export interface SharedShop {
  id: string;
  slug: string;
  name: string;
  description: string;
  hostWorkspaceId: string;
  hostName: string;
  members: SharedShopMember[];
  /** Paused shops show a "closed for now" page. */
  paused?: boolean;
  createdAt: string;
  sample?: boolean;
}