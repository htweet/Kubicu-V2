import React from "react";
import { BarChart3Icon, FileTextIcon, LandmarkIcon, MessageCircleIcon, MessageSquareQuoteIcon, ShoppingCartIcon, TargetIcon, TruckIcon, BoxIcon } from "lucide-react";
import { ExtensionInfo } from "../../types/marketplace";
import { cn } from "../../utils/cn";
const icons: Record<string, BoxIcon> = {
  'abandoned-cart': ShoppingCartIcon,
  'meta-pixel': TargetIcon,
  'google-tag': BarChart3Icon,
  'delivery-partners': TruckIcon,
  'invoice-generator': FileTextIcon,
  'review-requests': MessageSquareQuoteIcon,
  'whatsapp-catalogue': MessageCircleIcon,
  'bank-transfer': LandmarkIcon
};
export function ExtensionIcon({
  ext,
  size = 'md'



}: {ext: ExtensionInfo;size?: 'md' | 'lg';}) {
  const Icon = icons[ext.id] ?? FileTextIcon;
  return <span className={cn('flex shrink-0 items-center justify-center rounded-md bg-action-soft text-action', size === 'lg' ? 'h-14 w-14' : 'h-10 w-10')}>
      <Icon size={size === 'lg' ? 26 : 19} strokeWidth={2.1} aria-hidden />
    </span>;
}