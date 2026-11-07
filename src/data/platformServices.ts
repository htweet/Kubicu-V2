/** Services the real platform depends on, shown in Security & health and on /status (D129). */
export const platformServices = [
  { name: 'Public pages', note: 'Serving kub.icu and custom domains' },
  { name: 'Checkout & payments', note: 'Test mode — no provider connected' },
  { name: 'Wallet & payouts', note: 'Simulated — no payment partner connected' },
  { name: 'Media storage', note: 'Images are kept in this browser' },
  { name: 'Email & WhatsApp', note: 'Not connected — messages are previews' },
  { name: 'AI page setup', note: 'Rule-based preview, no AI provider' },
  { name: 'Workspace app', note: 'Canvas, commerce and settings' },
];

export const platformServiceNames = platformServices.map((s) => s.name);
