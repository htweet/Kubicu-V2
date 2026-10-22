import type { FirstActionType, OnboardingGoal } from '../hooks/useOnboarding';

export const onboardingGoals: {id: OnboardingGoal;label: string;description: string;}[] = [
{ id: 'sell', label: 'Sell products', description: 'Clothes, food, books, crafts — with WhatsApp ordering' },
{ id: 'book', label: 'Take bookings', description: 'Appointments, calls, quotes and services' },
{ id: 'audience', label: 'Grow an audience', description: 'Links, content, newsletter and brand deals' },
{ id: 'showcase', label: 'Show my work', description: 'Portfolio, case studies and enquiries' },
{ id: 'events', label: 'Run an event', description: 'Dates, tickets, venue and countdown' },
{ id: 'support', label: 'Raise support', description: 'Donations, volunteers and community' },
{ id: 'other', label: 'Something else', description: 'Start from any layout' }];


/** Suggested first action per goal — the "one real action" a new page needs. */
export const defaultActionFor: Record<OnboardingGoal, FirstActionType> = {
  sell: 'whatsapp',
  book: 'booking',
  audience: 'link',
  showcase: 'form',
  events: 'link',
  support: 'link',
  other: 'whatsapp'
};

export const firstActions: {id: FirstActionType;label: string;description: string;defaultLabel: string;}[] = [
{ id: 'whatsapp', label: 'Chat on WhatsApp', description: 'Visitors tap to message you. Order buttons use this number too.', defaultLabel: 'Chat with us on WhatsApp' },
{ id: 'booking', label: 'Booking link', description: 'Send people to your calendar or booking page.', defaultLabel: 'Book an appointment' },
{ id: 'link', label: 'Main link', description: 'Your shop, latest video, tickets or donation page.', defaultLabel: 'Visit my shop' },
{ id: 'form', label: 'Enquiry form', description: 'Visitors leave their details and a message.', defaultLabel: 'Send an enquiry' }];