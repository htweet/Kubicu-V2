# Commerce upgrade — settings, payment links, Sales report

Plan: "Commerce upgrade — settings, payment links, Sales report". Decisions D222 (settings), D224 (payment links), D226 (no duplicate settings), D227 (Sales report), D228 (checks, sample data, this doc).

## What was built

| Pass | Area | Where | Key files |
|---|---|---|---|
| A | Commerce settings — nine sections with a contents list | Commerce → Settings | `pages/commerce/Settings*.tsx`, `components/commerce/settings/*`, `utils/commerce/shopSettings.ts` |
| B | Standard payment links | Commerce → Payment links | `components/money/PaymentLinkEditor.tsx`, `pages/PayLinkPage.tsx`, `utils/money/linkCheckout.ts` |
| C | Sales report covering all money in | Commerce → Sales report | `pages/commerce/Reports.tsx`, `components/commerce/reports/*`, `utils/commerce/salesReport.ts`, `utils/commerce/salesReportPrint.ts` |
| D | Phone / accessibility review, sample data, docs | — | this file |

## Single source for each setting (D226)

| Setting | Set in | Shown/linked from |
|---|---|---|
| Currency, business WhatsApp | Settings → Business | Commerce settings |
| Payment provider, pay on delivery, instalments | Commerce → Payments | Commerce settings → Payment methods |
| Seller's own bank accounts (up to 3) | Bank transfer app | Checkout, payment links |
| Payout bank | Wallet | Commerce settings |
| WhatsApp order updates | WhatsApp app → automatic messages | Commerce settings → Customer messages (email only) |
| Opening hours | Commerce settings → Store status | Pickup, shop |
| Returns policy | Commerce settings → Policies | Storefront, checkout, receipts, Delivery & returns block |
| VAT | Commerce settings → Tax | Payment links (can switch off per link), Sales report |
| Low-stock level | Commerce settings (default) | Each product can override |

## Sales report: what counts

- **Shop orders:** paid orders (not pending or cancelled), gross minus gift cards bought inside them.
- **Gift cards sold:** split out of their order, so no double counting.
- **Bookings:** deposits on the day of booking, balances on the day paid; cancelled bookings left out.
- **Invoices:** each invoice payment, void invoices left out.
- **Payment links:** each payment minus refunds. Own-account transfers count only after the seller confirms.
- **Memberships:** subscription payments without a box order (box renewals are already orders).
- **Fees** are itemised for shop orders only; other income is shown as received.
- **Space filter:** invoices, payment links and gift cards have no space and are left out when a space is chosen.
- **Visitor sources** come from Analytics events (`order_paid`, `ticket_paid`), so only sales in a recorded visit appear there.

## Sample data (demo workspace)

- The sample "Gele tying masterclass" link now asks "Which class?", collects an optional email, has a thank-you message, and has one own-account transfer **waiting to be confirmed** (Ngozi E.). Payments show answers and how they paid.
- Only fresh demo workspaces get these; existing ones keep their data. Use Your account → Workspaces → remove and re-add the demo workspace to see them.

## Phone and accessibility review (code reading only)

Checked by reading the code, not on a device:

- Sales report period control scrolls sideways inside its own strip at 320px instead of widening the page; the source table scrolls inside its frame; the transactions table drops method, fees and refunds on phones.
- The chart is hidden from screen readers and replaced by a written summary (best day, comparison note); every bar list writes its figure as text.
- Change arrows carry "vs previous period" for screen readers and use + / − as well as colour.
- Customer messages table now has two columns (event, email), so it fits phone width.

## Still to check by hand

- VoiceOver and TalkBack on Commerce settings, a payment link pay page and the Sales report.
- 320px width and 200% zoom on the pay page with five questions.
- The PDF summary in Chrome, Safari and on Android (pop-up blockers).
- Real provider behaviour: transfer accounts, USSD, refunds and fee figures are simulated.
