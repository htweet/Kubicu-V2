import { HomeIcon, MegaphoneIcon, UsersRoundIcon, type LucideIcon } from 'lucide-react';
import type { SpaceKind } from '../types/workspace';

export const spaceKinds: Record<SpaceKind, {label: string;icon: LucideIcon;blurb: string;example: string;}> = {
  main: {
    label: 'Main page',
    icon: HomeIcon,
    blurb: 'Your everyday page or site. One per workspace.',
    example: 'Links, shop, bookings, about'
  },
  campaign: {
    label: 'Campaign',
    icon: MegaphoneIcon,
    blurb: 'A sale, launch or event with its own link, a start and an end.',
    example: 'Eid sale · New collection drop · Pop-up'
  },
  dealroom: {
    label: 'DealRoom',
    icon: UsersRoundIcon,
    blurb: 'A limited drop or group buy with real stock, a deadline and honest progress.',
    example: 'Ankara group buy · 20 seats for a workshop'
  }
};