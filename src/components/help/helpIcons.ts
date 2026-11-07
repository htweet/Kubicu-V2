import { BlocksIcon, BriefcaseIcon, CalendarIcon, GlobeIcon, LayoutTemplateIcon, LifeBuoyIcon, LineChartIcon, Link2Icon, MessageCircleIcon, PaletteIcon, PuzzleIcon, RepeatIcon, RocketIcon, SettingsIcon, ShieldCheckIcon, ShoppingBagIcon, SmartphoneIcon, SparklesIcon, StoreIcon, TicketIcon, UserIcon, UsersIcon, WalletIcon, ZapIcon, type LucideIcon } from 'lucide-react';
import type { HelpIcon } from '../../types/help';

/** Icon for each guide topic. */
export const helpIcons: Record<HelpIcon, LucideIcon> = {
  rocket: RocketIcon,
  layout: LayoutTemplateIcon,
  blocks: BlocksIcon,
  palette: PaletteIcon,
  globe: GlobeIcon,
  bag: ShoppingBagIcon,
  wallet: WalletIcon,
  shield: ShieldCheckIcon,
  ticket: TicketIcon,
  calendar: CalendarIcon,
  repeat: RepeatIcon,
  users: UsersIcon,
  chart: LineChartIcon,
  zap: ZapIcon,
  puzzle: PuzzleIcon,
  briefcase: BriefcaseIcon,
  phone: SmartphoneIcon,
  user: UserIcon,
  lifebuoy: LifeBuoyIcon,
  sparkles: SparklesIcon,
  link: Link2Icon,
  message: MessageCircleIcon,
  settings: SettingsIcon,
  store: StoreIcon,
};
