import { HandshakeIcon, MapPinIcon, PackageCheckIcon, PackageIcon, ReceiptIcon, StoreIcon, TruckIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { StageKey } from '../../utils/commerce/tracking';

/** One icon per tracking stage, shared by the seller panel and the customer's tracking card (D144). */
export const trackingStageIcons: Record<StageKey, LucideIcon> = {
  confirmed: ReceiptIcon,
  preparing: PackageIcon,
  handed: TruckIcon,
  on_the_way: MapPinIcon,
  delivered: PackageCheckIcon,
  ready: StoreIcon,
  collected: HandshakeIcon,
};
