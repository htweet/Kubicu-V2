import type { LucideIcon } from 'lucide-react';
import { CalendarCheckIcon, HandHeartIcon, MegaphoneIcon, PaletteIcon, ShoppingBagIcon, SparklesIcon, TicketIcon } from 'lucide-react';
import type { FirstActionType, OnboardingGoal } from '../hooks/useOnboarding';

export const onboardingGoals: { id: OnboardingGoal; label: string; description: string; icon: LucideIcon }[] = [
  { id: 'sell', label: 'Sell products', description: 'Clothes, food, books, crafts — with WhatsApp ordering', icon: ShoppingBagIcon },
  { id: 'book', label: 'Take bookings', description: 'Appointments, calls, quotes and services', icon: CalendarCheckIcon },
  { id: 'audience', label: 'Grow an audience', description: 'Links, content, newsletter and brand deals', icon: MegaphoneIcon },
  { id: 'showcase', label: 'Show my work', description: 'Portfolio, case studies and enquiries', icon: PaletteIcon },
  { id: 'events', label: 'Run an event', description: 'Dates, tickets, venue and countdown', icon: TicketIcon },
  { id: 'support', label: 'Raise support', description: 'Donations, volunteers and community', icon: HandHeartIcon },
  { id: 'other', label: 'Something else', description: 'Start from any layout', icon: SparklesIcon },
];

/** Suggested first action per goal — the "one real action" a new page needs. */
export const defaultActionFor: Record<OnboardingGoal, FirstActionType> = {
  sell: 'whatsapp',
  book: 'booking',
  audience: 'link',
  showcase: 'form',
  events: 'link',
  support: 'link',
  other: 'whatsapp',
};

export const firstActions: { id: FirstActionType; label: string; description: string; defaultLabel: string }[] = [
  { id: 'whatsapp', label: 'Chat on WhatsApp', description: 'Visitors tap to message you. Order buttons use this number too.', defaultLabel: 'Chat with us on WhatsApp' },
  { id: 'booking', label: 'Booking link', description: 'Send people to your calendar or booking page.', defaultLabel: 'Book an appointment' },
  { id: 'link', label: 'Main link', description: 'Your shop, latest video, tickets or donation page.', defaultLabel: 'Visit my shop' },
  { id: 'form', label: 'Enquiry form', description: 'Visitors leave their details and a message.', defaultLabel: 'Send an enquiry' },
];
