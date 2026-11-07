/** Delivery batches from the design plan §12. `done` reflects the prototype today (audited 22 Oct 2026). */
export const roadmapBatches = [
  { batch: 1, name: 'Design system', done: true },
  { batch: 2, name: 'Canvas', done: true },
  { batch: 3, name: 'Pages & onboarding', done: true },
  { batch: 4, name: 'Commerce & customers', done: true },
  { batch: 5, name: 'Analytics, domains & AI', done: true },
  { batch: 6, name: 'Admin & marketplace', done: true },
  { batch: 7, name: 'QA & refinement', done: true },
];

export type RoadmapStatus = 'live' | 'preview' | 'planned';

/** Public roadmap (docs/DESIGN_GAP_AUDIT.md is the source). Live = works in the prototype; preview = simulated or partial. */
export const roadmapItems: { area: string; items: { name: string; status: RoadmapStatus; note?: string }[] }[] = [
  {
    area: 'Build your page',
    items: [
      { name: 'Canvas editor, 27 blocks, themes and templates', status: 'live' },
      { name: 'Multi-page sites, media library, version history', status: 'live' },
      { name: 'AI page setup and block suggestions', status: 'preview', note: 'Rule-based preview — no AI service yet' },
      { name: 'Forms builder (premium add-on)', status: 'planned', note: 'In progress — will install from Extensions' },
      { name: 'Voice-to-Store', status: 'planned' },
    ],
  },
  {
    area: 'Sell and serve',
    items: [
      { name: 'Products, storefront, checkout, discounts', status: 'live', note: 'Payments in test mode' },
      { name: 'Bookings, events and ticket check-in', status: 'live' },
      { name: 'Subscriptions and memberships', status: 'live' },
      { name: 'Campaign pages and DealRooms', status: 'live' },
      { name: 'WhatsApp Commerce Bridge (official API)', status: 'planned', note: 'Today: WhatsApp ordering links' },
      { name: 'Local delivery partners', status: 'planned' },
    ],
  },
  {
    area: 'Grow',
    items: [
      { name: 'Analytics, Link Intelligence and IntentFlow', status: 'live' },
      { name: 'Custom domains, QR codes and campaign links', status: 'preview', note: 'Domain checks simulated' },
      { name: 'Audience CRM and automations', status: 'preview', note: 'Messages are previews' },
      { name: 'Creator collaborations and affiliates', status: 'planned' },
      { name: 'AI Business Coach', status: 'planned' },
    ],
  },
  {
    area: 'Trust and teams',
    items: [
      { name: 'Teams, roles, approvals and activity log', status: 'live' },
      { name: 'Plans, billing and invoices', status: 'preview', note: 'Test mode' },
      { name: 'Report a page, takedowns, trust centre', status: 'live' },
      { name: 'Proof of work: verified reviews and delivered work', status: 'preview' },
      { name: 'Trust Passport', status: 'planned' },
      { name: 'Lightweight mode for low data', status: 'preview' },
    ],
  },
];
