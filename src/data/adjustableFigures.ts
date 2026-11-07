/**
 * Every example figure staff can change in Super admin → Figures & names (D465). Each module reads its value with
 * `figure(key)`; the default here is what the prototype used before. Add a row here when you add a new example figure.
 */
export type FigureUnit = 'naira' | 'percent' | 'days' | 'hours' | 'minutes' | 'count' | 'amount';

export interface AdjustableFigure {
  key: string;
  label: string;
  area: string;
  unit: FigureUnit;
  default: number;
  min: number;
  max: number;
  help: string;
  /** For unit 'amount': the currency symbol the figure is in (payout rules and data prices are in local money). */
  symbol?: string;
}

/**
 * Payout rules and data prices per country (D466). Defaults copied from data/payoutLimits.ts and data/countries.ts —
 * they can't be imported here because those files read their values back through `figure()`.
 */
const local = [
  { code: 'NG', name: 'Nigeria', symbol: '₦', daily: [50_000, 2_000_000, 20_000_000], cap: [300_000, 10_000_000], fee: 50, minAuto: 1_000, walletMax: 0, gb: 650 },
  { code: 'KE', name: 'Kenya', symbol: 'KSh', daily: [5_000, 150_000, 1_500_000], cap: [25_000, 800_000], fee: 10, minAuto: 100, walletMax: 250_000, gb: 100 },
  { code: 'GH', name: 'Ghana', symbol: 'GH₵', daily: [400, 15_000, 150_000], cap: [2_500, 80_000], fee: 1, minAuto: 10, walletMax: 20_000, gb: 10 },
  { code: 'ZA', name: 'South Africa', symbol: 'R', daily: [600, 25_000, 250_000], cap: [3_500, 120_000], fee: 5, minAuto: 15, walletMax: 0, gb: 50 },
] as const;

const countryFigures: AdjustableFigure[] = local.flatMap((c): AdjustableFigure[] => {
  const area = `Payouts — ${c.name}`;
  const amt = (key: string, label: string, def: number, help: string, min = 0): AdjustableFigure => ({ key: `payout.${c.code}.${key}`, label, area, unit: 'amount', symbol: c.symbol, default: def, min, max: def === 0 ? 100_000_000 : def * 100, help });
  return [
    amt('daily1', 'Daily payout limit — basic checks', c.daily[0], 'Phone and email confirmed.'),
    amt('daily2', 'Daily payout limit — ID checked', c.daily[1], 'Government ID confirmed.'),
    amt('daily3', 'Daily payout limit — business checked', c.daily[2], 'Business registration confirmed.'),
    amt('cap0', 'Wallet cap — basic checks', c.cap[0], 'Most the wallet can hold before ID checks.'),
    amt('cap2', 'Wallet cap — ID checked', c.cap[1], 'Most the wallet can hold before business checks.'),
    amt('manualFee', 'Fee for a payout you start yourself', c.fee, 'Scheduled payouts stay free.'),
    amt('minAuto', 'Smallest scheduled payout', c.minAuto, 'Smaller balances wait for the next one.'),
    ...(c.walletMax ? [amt('walletMax', 'Largest single transfer to mobile money', c.walletMax, 'The wallet network’s own limit per transfer.', 1)] : []),
    { key: `payout.${c.code}.settleHours`, label: 'Time before a sale can be paid out', area, unit: 'hours', default: 24, min: 0, max: 336, help: 'Covers card reversals and chargebacks.' },
    { key: `data.${c.code}.perGb`, label: 'Price of 1 GB of mobile data', area, unit: 'amount', symbol: c.symbol, default: c.gb, min: 1, max: c.gb * 20, help: 'Used for the canvas Check tab’s data-cost estimate.' },
  ];
});

/**
 * Print kit prices per quantity (D468). Defaults copied from utils/domains/printOrders.ts `printPrices`, which reads
 * them back through `figure()`. Quantities themselves stay fixed — they're the choices on the order form.
 */
const printTable: { item: string; name: string; tiers: [number, number][] }[] = [
  { item: 'card', name: 'Business cards', tiers: [[100, 9000], [250, 16000], [500, 27000], [1000, 45000]] },
  { item: 'sticker', name: 'Stickers', tiers: [[50, 7500], [100, 12000], [250, 25000], [500, 42000]] },
  { item: 'insert', name: 'Thank-you inserts', tiers: [[100, 10000], [250, 20000], [500, 35000], [1000, 60000]] },
  { item: 'hangtag', name: 'Swing tags', tiers: [[100, 9500], [250, 18000], [500, 30000], [1000, 52000]] },
  { item: 'voucher', name: 'Gift vouchers', tiers: [[25, 7500], [50, 12500], [100, 21000], [250, 45000]] },
  { item: 'flyer', name: 'Flyers', tiers: [[100, 15000], [250, 30000], [500, 50000], [1000, 85000]] },
  { item: 'counter', name: 'Counter QR stands', tiers: [[2, 6000], [5, 12500], [10, 22000], [25, 48000]] },
  { item: 'stamp', name: 'Loyalty cards', tiers: [[100, 8500], [250, 15000], [500, 25000], [1000, 42000]] },
  { item: 'label', name: 'Delivery labels', tiers: [[100, 9000], [250, 19000], [500, 33000], [1000, 58000]] },
];

const printPriceFigures: AdjustableFigure[] = [
  { key: 'print.doubleSidedPct', label: 'Extra for double-sided business cards', area: 'Print kit prices', unit: 'percent', default: 30, min: 0, max: 200, help: 'Added on top of the card price and finish.' },
  ...printTable.flatMap((p) =>
    p.tiers.map(([qty, ngn]): AdjustableFigure => ({ key: `print.price.${p.item}.${qty}`, label: `${p.name} — ${qty.toLocaleString('en')}`, area: 'Print kit prices', unit: 'naira', default: ngn, min: 500, max: ngn * 10, help: 'Before the finish and delivery. Rounded to the nearest ₦50.' })),
  ),
];

export const adjustableFigures: AdjustableFigure[] = [
  // KUBICU billing (D467)
  { key: 'billing.trialDays', label: 'Free trial length', area: 'KUBICU billing', unit: 'days', default: 14, min: 0, max: 60, help: 'Length of the Pro trial for new workspaces.' },
  { key: 'billing.trialReminderDays', label: 'Trial ending reminder', area: 'KUBICU billing', unit: 'days', default: 3, min: 1, max: 14, help: 'Days before the trial ends that the owner is reminded.' },
  { key: 'billing.graceDays', label: 'Grace period after a failed payment', area: 'KUBICU billing', unit: 'days', default: 7, min: 0, max: 30, help: 'Paid features keep working this long while the card is fixed.' },
  { key: 'billing.yearlyMonths', label: 'Months charged for a yearly plan', area: 'KUBICU billing', unit: 'count', default: 10, min: 6, max: 12, help: '10 means “2 months free”. Shown on Pricing and in the plan picker.' },
  // Escrow and buyer protection (D467)
  { key: 'escrow.respondHours', label: 'Seller’s time to reply to a buyer’s problem', area: 'Escrow and buyer protection', unit: 'hours', default: 48, min: 12, max: 336, help: 'After this, the case goes to KUBICU automatically.' },
  { key: 'escrow.decideHours', label: 'KUBICU’s target to decide a case', area: 'Escrow and buyer protection', unit: 'hours', default: 72, min: 24, max: 720, help: 'Shown to buyers and sellers; later cases show as overdue to staff.' },
  { key: 'escrow.maxFiles', label: 'Evidence files per side', area: 'Escrow and buyer protection', unit: 'count', default: 5, min: 1, max: 20, help: 'How many files a buyer or seller can add to a case.' },
  { key: 'subs.graceDays', label: 'Customer subscription grace period', area: 'Escrow and buyer protection', unit: 'days', default: 7, min: 0, max: 30, help: 'A buyer’s subscription stays active this long after a failed renewal.' },
  // Workspace rules (D467)
  { key: 'stock.expiryWarnDays', label: '“Expires soon” warning', area: 'Workspace rules', unit: 'days', default: 30, min: 1, max: 365, help: 'Inventory flags batches expiring within this many days.' },
  { key: 'events.maxTicketTypes', label: 'Most ticket types per event', area: 'Workspace rules', unit: 'count', default: 8, min: 1, max: 30, help: 'For example General, VIP and Early bird.' },
  { key: 'events.lowSeatsAt', label: '“Few seats left” shows from', area: 'Workspace rules', unit: 'count', default: 10, min: 1, max: 100, help: 'Buyers see a low-seats note when this many or fewer are left.' },
  { key: 'team.inviteDays', label: 'Team invite expires after', area: 'Workspace rules', unit: 'days', default: 7, min: 1, max: 30, help: 'Unused invites stop working after this.' },
  { key: 'money.bankCooldownHours', label: 'Wait before a new bank account gets payouts', area: 'Workspace rules', unit: 'hours', default: 24, min: 0, max: 168, help: 'Protects sellers if someone else changes their bank account.' },
  { key: 'account.deletionGraceDays', label: 'Time to undo deleting an account', area: 'Workspace rules', unit: 'days', default: 14, min: 1, max: 60, help: 'The account can be restored within this time.' },
  // Print kit (D467)
  { key: 'print.days', label: 'Working days to print', area: 'Print kit', unit: 'days', default: 2, min: 0, max: 14, help: 'Added before delivery time on every print order.' },
  { key: 'print.lagosNgn', label: 'Delivery within Lagos', area: 'Print kit', unit: 'naira', default: 2_500, min: 0, max: 50_000, help: 'Per print order.' },
  { key: 'print.majorNgn', label: 'Delivery to Abuja, Port Harcourt, Ibadan or Kano', area: 'Print kit', unit: 'naira', default: 4_500, min: 0, max: 50_000, help: 'Per print order.' },
  { key: 'print.otherNgn', label: 'Delivery to other states', area: 'Print kit', unit: 'naira', default: 6_000, min: 0, max: 50_000, help: 'Per print order.' },
  // Checkout and sign-up
  { key: 'checkout.seatHoldMinutes', label: 'Seats held during checkout', area: 'Checkout and sign-up', unit: 'minutes', default: 10, min: 3, max: 60, help: 'How long event seats stay reserved once a buyer starts checking out.' },
  { key: 'checkout.stockHoldMinutes', label: 'Stock held during checkout', area: 'Checkout and sign-up', unit: 'minutes', default: 15, min: 3, max: 60, help: 'For shops that keep items for buyers at checkout.' },
  { key: 'signup.claimHoldMinutes', label: 'Link held while signing up', area: 'Checkout and sign-up', unit: 'minutes', default: 30, min: 5, max: 1_440, help: 'A link claimed on the website is held this long for the new account.' },
  // Templates and partners
  { key: 'templates.refundDays', label: 'Template refund window', area: 'Templates and partners', unit: 'days', default: 7, min: 0, max: 60, help: 'Buyers can ask for a refund within this time; sellers are paid after it.' },
  { key: 'templates.payoutMinNgn', label: 'Smallest template payout', area: 'Templates and partners', unit: 'naira', default: 5_000, min: 0, max: 1_000_000, help: 'Template sellers can pay out once this much has cleared.' },
  { key: 'collabs.holdDays', label: 'Default commission wait', area: 'Templates and partners', unit: 'days', default: 7, min: 0, max: 60, help: 'For new workspaces: days after payment before a partner’s commission is payable. Sellers can change their own.' },
  // Sponsorships
  { key: 'sponsor.feePct', label: 'Marketplace fee on sponsorships', area: 'Sponsorships', unit: 'percent', default: 10, min: 0, max: 50, help: 'Added on top of each creator’s fee when a brand accepts them.' },
  { key: 'sponsor.replyHours', label: 'Time to reply to a problem', area: 'Sponsorships', unit: 'hours', default: 48, min: 12, max: 336, help: 'After this, KUBICU decides from what was sent.' },
  { key: 'sponsor.decideDays', label: 'KUBICU’s target to decide a problem', area: 'Sponsorships', unit: 'days', default: 3, min: 1, max: 30, help: 'Shown to both sides; problems past it show as overdue to staff.' },
  { key: 'sponsor.appealDays', label: 'Time to appeal a decision', area: 'Sponsorships', unit: 'days', default: 7, min: 1, max: 60, help: 'The side a decision went against can appeal once within this time.' },
  { key: 'sponsor.evidencePerSide', label: 'Evidence files per side', area: 'Sponsorships', unit: 'count', default: 5, min: 1, max: 20, help: 'How many files each side can add to a problem.' },
  // NFC tags
  { key: 'nfc.stickerNgn', label: 'Round sticker price', area: 'NFC tags', unit: 'naira', default: 1_500, min: 100, max: 100_000, help: 'Each, before delivery.' },
  { key: 'nfc.cardNgn', label: 'Tap card price', area: 'NFC tags', unit: 'naira', default: 4_000, min: 100, max: 100_000, help: 'Each, before delivery.' },
  { key: 'nfc.keyringNgn', label: 'Keyring price', area: 'NFC tags', unit: 'naira', default: 3_000, min: 100, max: 100_000, help: 'Each, before delivery.' },
  { key: 'nfc.deliveryNgn', label: 'NFC delivery fee', area: 'NFC tags', unit: 'naira', default: 2_500, min: 0, max: 50_000, help: 'Per order.' },
  // NFC tags outside Nigeria, in local money (D471). Rounded to local habits, not converted.
  ...([
    ['KE', 'Kenya', 'KSh', [150, 400, 300, 300]],
    ['GH', 'Ghana', 'GH₵', [15, 40, 30, 30]],
    ['ZA', 'South Africa', 'R', [25, 70, 50, 60]],
  ] as const).flatMap(([code, name, symbol, [sticker, card, keyring, delivery]]): AdjustableFigure[] =>
    (
      [
        ['sticker', 'Round sticker price', sticker, 'Each, before delivery.'],
        ['card', 'Tap card price', card, 'Each, before delivery.'],
        ['keyring', 'Keyring price', keyring, 'Each, before delivery.'],
        ['delivery', 'NFC delivery fee', delivery, 'Per order.'],
      ] as const
    ).map(([k, label, def, help]) => ({ key: `nfc.${code}.${k}`, label: `${label} — ${name}`, area: 'NFC tags', unit: 'amount' as const, symbol, default: def, min: k === 'delivery' ? 0 : 1, max: def * 20, help })),
  ),
  { key: 'nfc.maxOrder', label: 'Most tags in one order', area: 'NFC tags', unit: 'count', default: 50, min: 1, max: 500, help: 'Larger orders go through sales.' },
  // Deliveries
  { key: 'delivery.codeAttempts', label: 'Wrong delivery codes allowed', area: 'Deliveries', unit: 'count', default: 3, min: 1, max: 10, help: 'After this many, the handover stops and the order comes back to the seller.' },
  { key: 'crossBorder.expressBaseNgn', label: 'Express abroad — first 0.5 kg', area: 'Cross-border delivery', unit: 'naira', default: 18_000, min: 0, max: 500_000, help: 'Shown in the shop’s currency at the day’s rate.' },
  { key: 'crossBorder.expressPerKgNgn', label: 'Express abroad — each extra kg', area: 'Cross-border delivery', unit: 'naira', default: 6_000, min: 0, max: 200_000, help: 'Added for every kg over the first 0.5 kg.' },
  { key: 'crossBorder.economyBaseNgn', label: 'Economy abroad — first 0.5 kg', area: 'Cross-border delivery', unit: 'naira', default: 9_000, min: 0, max: 500_000, help: 'Shown in the shop’s currency at the day’s rate.' },
  { key: 'crossBorder.economyPerKgNgn', label: 'Economy abroad — each extra kg', area: 'Cross-border delivery', unit: 'naira', default: 3_500, min: 0, max: 200_000, help: 'Added for every kg over the first 0.5 kg.' },
  ...printPriceFigures,
  ...countryFigures,
];

export const figureByKey = Object.fromEntries(adjustableFigures.map((f) => [f.key, f])) as Record<string, AdjustableFigure>;
