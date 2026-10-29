# Extension register

The rule (D231): every extension KUBICU lists must connect to **at least two core modules** (Orders, Products, Checkout, Storefront, Payment links, Sales report, Wallet, Pages, Bookings, Audience, Automations, Analytics, Notifications, Forms, Campaign links, Quotes & jobs, Proof of work). Anything that only repeats a core feature is folded into that feature. Connections are declared in `data/extensions.ts` (`worksWith`) and shown on each extension's detail page as **Works with**, with a link to each screen.

Status: **Real** = works fully in the browser · **Partly real** = real in the browser, outside service simulated · **Simulated** = believable log only, needs a backend.

## Kept

| Extension | Works with | Status |
|---|---|---|
| Domains & QR | Pages · Analytics · Orders | Real (domain checks simulated) |
| Bookings | Pages · Audience · Automations · Sales report | Real (calendar sync, meeting links simulated) |
| Quotes & jobs | Orders (invoices) · Sales report · Automations · Notifications | Real |
| Proof of work | Orders · Bookings · Pages | Real |
| Trust Passport | Orders · Proof of work · Pages | Partly real (partner checks simulated) |
| Voice-to-Store | Products · Storefront | Partly real (local-language speech simulated) |
| Creator Collaboration | Checkout · Orders · Wallet | Partly real (partner sign-up simulated) |
| AI Business Coach | Orders · Products · Wallet | Rule-based preview |
| Deliveries | Orders · Wallet | Partly real (couriers simulated) |
| Opportunities | Orders · Bookings · Audience | Real |
| Automations | Orders · Bookings · Audience · Notifications | Real (messages previewed, not sent) |
| IntentFlow | Pages · Analytics · Campaign links | Real |
| Forms | Pages · Audience · Automations · Notifications | Real (payments test mode) |
| Meta Pixel | Pages · Checkout · Campaign links | Real |
| Google tag | Pages · Checkout · Campaign links | Real |
| WhatsApp Commerce Bridge | Products · Checkout · Audience | Simulated (no WhatsApp partner yet) |
| Bank transfer payments | Checkout · Payment links · Orders | Real (account name not bank-checked) |
| TikTok Pixel | Pages · Checkout · Campaign links | Real (loads after consent; "Complete payment" on paid checkout) |
| Product feed | Products · Storefront · Analytics | Partly real (CSV file real; auto-updating feed address needs backend) |
| Loyalty points | Checkout · Orders · Audience | Real (points derived from paid orders; 500 points → one-time ₦500 code) |
| Email marketing sync | Audience · Forms | Simulated sending (who-would-be-sent list and download are real) |
| Google Sheets sync | Orders · Bookings · Forms | Simulated sending (per-tab downloads are real) |
| Accounting export | Sales report · Payment links · Quotes & jobs | Real (QuickBooks, Zoho Books, spreadsheet CSV) |
| Search Console & SEO | Pages · Storefront | Real (verification tag on live pages; sitemap.xml download) |
| Microsoft Clarity | Pages · Analytics | Real (loads after consent) |

## Not built (rule check)

| Idea | Why |
|---|---|
| Webhooks (Zapier / Make) | Already a core feature: Settings → Developers has webhook endpoints, signed deliveries and retries, and Automations has a "Call a webhook" step. An extension would duplicate it. |
| Discount codes | Already in Commerce → Discounts. |
| Referral rewards in Loyalty | Referral codes already exist in Commerce → Discounts; Loyalty doesn't add a second referral system. |

## Retired (moved into a core feature)

| Extension | Moved to | What happens to existing installs |
|---|---|---|
| Abandoned-cart recovery | Automations recipe "Abandoned checkout nudge" (also "Recover unpaid checkouts" on Orders) | The automation keeps running. "Move" removes the old entry. |
| Order invoices | Quotes & jobs | Invoice button keeps working; "Move" installs Quotes & jobs (free). The button now shows whenever Quotes & jobs is on. |
| Review requests | Proof of work | "Move" installs Proof of work (free), which sends one-time review links only for completed records. |
| Lagos delivery partners | Removed (D232) | Both connections were inside Commerce and rates were examples. Zones it added stay as the seller's own delivery zones; courier booking is in Deliveries. "Move" just removes the entry. |

Retired extensions are hidden from Browse, stay in the Installed tab marked "Moved to …", and show a one-time notice inside the app.
