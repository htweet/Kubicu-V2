import { CalendarClockIcon, CalendarDaysIcon, FileTextIcon, HandHeartIcon, KeyRoundIcon, HomeIcon, MegaphoneIcon, StoreIcon, UsersRoundIcon, type LucideIcon } from 'lucide-react';
import type { SpaceKind } from '../types/workspace';

export const spaceKinds: Record<SpaceKind, { label: string; plural: string; icon: LucideIcon; blurb: string; example: string; useWhen?: string }> = {
  main: {
    label: 'Main page',
    plural: 'Main pages',
    icon: HomeIcon,
    blurb: 'Your everyday page or site. One per workspace.',
    example: 'Links, shop, bookings, about',
  },
  campaign: {
    label: 'Campaign',
    plural: 'Campaigns',
    icon: MegaphoneIcon,
    blurb: 'A sale, launch or simple event promo with its own link, a start and an end.',
    example: 'Eid sale · New collection drop · Pop-up',
    useWhen: 'Use for a time-limited offer, or an event without KUBICU tickets.',
  },
  dealroom: {
    label: 'DealRoom',
    plural: 'DealRooms',
    icon: UsersRoundIcon,
    blurb: 'A limited drop or group buy with real stock, a deadline and honest progress.',
    example: 'Ankara group buy · 20 seats for a workshop',
    useWhen: 'Use to sell one product as a drop or a group goal.',
  },
  event: {
    label: 'Event',
    plural: 'Events',
    icon: CalendarDaysIcon,
    blurb: 'One ticketed event on its own link — on sale before, directions during, a recap after.',
    example: 'Lagos design meetup · Album listening party',
    useWhen: 'Use when you sell or give out KUBICU tickets with seat limits and door check-in.',
  },
  fundraiser: {
    label: 'Fundraiser',
    plural: 'Fundraisers',
    icon: HandHeartIcon,
    blurb: 'A cause with a goal and an honest “raised so far” from real payments only.',
    example: 'School fees for 20 pupils · Clinic roof repair',
    useWhen: 'Use to raise money for a cause. Needs a verified workspace.',
  },
  popup: {
    label: 'Pop-up shop',
    plural: 'Pop-up shops',
    icon: StoreIcon,
    blurb: 'A market stall or pop-up with a place, opening times and pickup-only orders.',
    example: 'Christmas market stall · Weekend fair',
    useWhen: 'Use when people collect in person at a stall. For an online sale that ships, use a Campaign.',
  },
  booking: {
    label: 'Booking page',
    plural: 'Booking pages',
    icon: CalendarClockIcon,
    blurb: 'One short link that opens straight onto your services and their next free times.',
    example: 'Braids & cornrows · Free 20-min consultation',
    useWhen: 'Use for a link on flyers and in messages. To add booking to your main page, use the Booking block.',
  },
  members: {
    label: 'Members area',
    plural: 'Members areas',
    icon: KeyRoundIcon,
    blurb: 'A whole space only active subscribers to your membership plans can open.',
    example: 'Course material · Community resources',
    useWhen: 'Use for a separate members’ home. To lock one section or page of your main site, use the Members-only block.',
  },
  page: {
    label: 'Page',
    plural: 'Pages',
    icon: FileTextIcon,
    blurb: 'An ordinary page on its own link — no dates, stock or rules. Build it with any blocks or template.',
    example: 'A second business · A portfolio · A link list',
    useWhen: 'Use when none of the special types fit.',
  },
};

/** Extra spaces, in the order they're offered. A plain Page comes first (D267). */
export const extraSpaceKindOrder = ['page', 'campaign', 'dealroom', 'event', 'fundraiser', 'popup', 'booking', 'members'] as const;
