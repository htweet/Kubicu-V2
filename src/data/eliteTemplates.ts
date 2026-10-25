import type { EliteGoal, EliteUseCase } from './examples/build';

/** Elite Template Library (D154) — filter labels shared by the website and the app. */
export const eliteUseCaseLabels: Record<EliteUseCase, string> = {
  creators: 'Creators',
  media: 'Media',
  professionals: 'Professionals & studios',
  commerce: 'Commerce',
  services: 'Services',
  events: 'Events & community',
  impact: 'Impact'
};

export const eliteGoalLabels: Record<EliteGoal, string> = {
  audience: 'Grow an audience',
  enquiries: 'Get enquiries',
  sell: 'Sell',
  bookings: 'Get bookings',
  register: 'Get sign-ups'
};

/** Themes offered in "Try with theme" on a template's page. */
export const tryThemeIds = ['noirCream', 'midnight'] as const;