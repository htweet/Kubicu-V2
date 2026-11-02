# KUBICU — Decisions waiting for sign-off

Taken from `docs/DESIGN_DECISION_REGISTER.md` (D7 – D232). Every row below is **Proposed**, **Needs validation** or **Illustrative**, which means it was built but nobody has signed it off yet. Rows already **Confirmed** or **Accepted** are left out.

**Total: about 216 decisions**, grouped by what kind of sign-off they need. A few appear in more than one group (for example a fundraiser has both wording and a provider dependency), so the groups add up to slightly more.

| Group | What you're signing off |
|---|---|
| A | Money, limits and example figures |
| B | Legal wording (needs a lawyer) |
| C | Depends on a real provider or backend |
| D | Translations (drafts for native-speaker review) |
| E | Product and design decisions |

To sign off, reply with IDs, e.g. *"Confirm all of E"*, *"Confirm D40 with KUBICU fee 1.5%"* or *"Reject D117b"*. Each one then moves to **Confirmed** in the register.

> **Outcome, 27 Oct 2026 (D233):** A confirmed · B rewritten to Draft 1.0, awaiting your lawyer · C on hold (USSD switched off) · D deferred · E no action needed.
>
> **Status refresh, 30 Oct 2026 (through D343).** What is still open:
>
> | Group | State now |
> |---|---|
> | A — Money, limits, figures | **Confirmed (D233).** The Group A table below is kept for history only; nothing in it needs action. Exception: the payment-provider fee (1.5% + ₦100) stays an example until a gateway is chosen. |
> | B — Legal wording | **Open.** Draft 1.0 awaiting a lawyer. English text applies; translated pages show a notice saying so (D332). New wording since D232 that also needs legal review: Copilot privacy notice `/about/copilot` and data-processing terms (D265–D266), hand-recorded marketing permission on older contacts (D343). |
> | C — Provider / backend | **Open.** No providers chosen. Added since D232: Copilot AI provider and chat storage (D265–D266, D284), browser speech-to-text in Voice to content (D342 — works without a provider, quality varies), server-side short-link click counting (D271, partly addressed in D343). |
> | D — Translations | **Deferred.** Since D232 the drafts cover the whole app, canvas, website and Copilot (D280–D341). All need a native speaker. |
> | E — Product / design | No action needed. D233–D343 are all product/design or translation decisions and fall here unless listed above. |
>
> Still to decide outside these groups: final plan prices (see `docs/CLAUDE_HANDOFF.md` §17.1), Copilot chat retention and AI credit costs.
>
> **Added 1 Nov 2026 (D518–D522), Copilot as KUBICU's front door:**
> - **B — Legal:** the "not advice" wording Copilot uses for legal, tax and financial questions in each country; data-processing terms for each country where a model provider handles chats and photos.
> - **C — Provider:** AI provider and model for Copilot; server storage of chats and drafts; whether signed-in users' chats sync across devices; whether Copilot may read workspace data when signed in.
> - **A — Figures (not yet confirmed):** Copilot credit costs, daily draft/change limits (3 / 10 are examples), and whether question-only use gets its own daily allowance.
> - **D — Translations:** Copilot's curated answers and word lists (`data/translationsCopilotHelp.ts`, `data/copilotUnderstanding.ts`, `data/copilotHelpTopics.ts` keyword rows) are drafts; the word lists become unnecessary once a model is connected.
> - **E — Product:** Copilot is a general KUBICU assistant with building as its main job (D520). Full engineering contract: `docs/COPILOT_AI_INTEGRATION.md`.

> **Correction:** the earlier note that D149 was used twice was wrong — it came from misreading a line number. D149 (Batch 14 checks) and D156 (Elite templates) are separate decisions; nothing was renumbered.

---

## A. Money, limits and example figures

| ID | Topic | What was decided | Figures to confirm |
|---|---|---|---|
| D40 | Fees | Every order shows subtotal, delivery, fees, refunds and net separately | Provider 1.5% + ₦100 (waived under ₦2,500, cap ₦2,000); KUBICU 2% on Free → 0% on Agency |
| D41 | Plan gates | Free gets 5 products and WhatsApp ordering; checkout and digital delivery need Pro | Plan boundaries |
| D47 | Media library | One library per workspace; replacing a file updates every use | Storage per plan |
| D50 | Spaces per workspace | Main space plus campaigns and DealRooms | Space limits per plan |
| D59 | Seats and downgrades | Seats include Owner and pending invites; downgrade turns extras into Viewers | Free/Creator/Pro owner only, Business 5, Agency 25 |
| D95 | Milestone payments | Quotes paid as deposit + balance or in stages | Stage rules |
| D99 | Trust Passport | 0–100 score from six checked signals | All score thresholds |
| D103 | Creator Collaboration | Partners earn commission, held pending 7 days | 1–50% range, 7-day hold |
| D112 | Pay on delivery & instalments | POD for physical items with a seller cap; instalments in 2–4 parts | POD cap ₦100,000; instalment minimum ₦20,000 |
| D113 | Seating & repeating events | Theatre/banquet/standing layouts; 2–12 repeat dates | Limits |
| D114 | Ordering prints | Quantity tiers, paper, proof check, delivery, pay from wallet | Print prices and tiers |
| D118 | Print kit, expanded | Eight pieces, four designs, print-shop ordering | Print prices |
| D119 | Print kit sizing | Ten pieces incl. stamp cards and delivery labels | Sizes and prices |
| D126 | Guidance & quality | Ten business kits; Check tab; Trust Passport lapses | 12-month lapse |
| D127 | Site kits & A/B tests | Tests judged by taps, orders, enquiries or bookings | 30 visits per version minimum |
| D129 | Staff safety | Second-person approval, backup codes, access reviews | 24 h approval expiry; 90-day reviews |
| D131 | Developer tools | Webhooks, API keys, connected apps, 11 events | 120 requests/minute |
| D134 | Selling extensions | Extensions sold on paid plans | Price caps Creator ₦5K → Enterprise ₦100K; 80/20 split |
| D135 | Staff editing tools | Plans, trials, codes, credit grants | Trial and credit amounts |
| D141 | Policy re-acceptance | Changed policies need re-accepting; automations on real events | Max 5 runs per check |
| D144 | Order tracking | One tracking view per order with promise date and health | Lateness thresholds |
| D154 | Elite library | Elite collection, detail page, first six templates | Template prices |
| D156 | Last six Elite + kits | Elite 18, 20–24; seven new business kits | Template prices |
| D158 | Elite price cut, Artwork | Prices cut by a third; 8 Artwork templates | New prices |
| D183 | Pop-up shop | Sessions, products, stall stock limits | Up to 5 sessions |
| D193 | Six richer form fields | Name, date range, signature, scale, image choice, product picker | Field limits |
| D197 | Courses | Up to 20 modules of 30 lessons; free, paid or membership | Limits |
| D198 | Group classes | 2–50 seats per class time; cancelling a class refunds all | Seat range |
| D200 | Demo data | Offered only during setup; removing deletes only sample records | 7-day lifetime |
| D202 | Pre-orders, gift cards, bulk prices | Up to 4 bulk price levels, up to 6 gift card amounts | Limits |
| D224 | Payment links | Payer-chooses amounts, questions, payer covers fee, VAT | VAT 7.5% |
| D232 | 8 new extensions | TikTok, Clarity, Product feed, Loyalty, Email/Sheets sync, Accounting, SEO | 1 point per ₦100; 500 points = ₦500 |
| — | Plan prices (D65) | Creator ₦3,000, Pro ₦8,000, Business ₦20,000, Agency ₦50,000 a month | Prices, 7-day grace, 14-day trial |
| — | Commerce defaults (D222) | Stock hold and transfer-account windows | 15-minute stock hold; 30-minute transfer accounts |
| — | Data retention (D61) | Visits kept, then deleted | 90 days |

## B. Legal wording (needs a lawyer)

| ID | Topic | What needs reviewing |
|---|---|---|
| D9 | Embed allowlist | Which outside sites may be embedded (security review) |
| D35 | Legal & help pages | Full legal text |
| D42 | Disputes & refunds | Refund and dispute wording |
| D55 | Refund fees | Customers refunded exactly what they paid; who absorbs fees |
| D61 | Analytics & privacy | Visitor notice and data retention under Nigeria's data protection law |
| D69 | Customer subscriptions | Membership and product-box terms |
| D70 | Template sales | 70/30 creator split, 7-day refund window |
| D73 | Event ticketing | Ticket terms and refunds |
| D78 | Legal, trust & company pages | All pages marked "Draft — pending legal review" |
| D82 | Staff screens | 30-day data-request deadline |
| D110 | Members-only content | Sign-in and access wording |
| D120 | Business partnerships | Plain-words partnership agreement |
| D121 | Co-branded spaces | Partner approval terms |
| D124 | Support block | Pay-what-you-want / donation wording |
| D132 | Developer submissions | Data-use declaration |
| D152 | Verification (translated) | Legal confirmations in four languages |
| D179 | Fundraiser | "Not a tax-deductible donation" wording, charity rules |
| D213 | Certificates | "Not an accredited qualification" wording |
| D94 | Buyer protection & escrow | Escrow wording (referenced from gap audit) |
| D211 | AI page assistant | Licence for AI-composed layouts saved as templates |

## C. Depends on a real provider or backend

| ID | Topic | What it needs |
|---|---|---|
| D11 | Orders before Commerce | — (superseded by Commerce; confirm to close) |
| D62 | Domains, QR, campaign links | Real DNS and certificates |
| D96 | Deliveries | Real courier partners and escrow release |
| D97 | WhatsApp Commerce Bridge | WhatsApp Business API, template approval |
| D100 | WhatsApp automatic messages | WhatsApp Business API |
| D115 | Enterprise single sign-on | Google, Microsoft, Okta, SAML |
| D122 | Partner bundles | Real split payments and escrow |
| D128 | Shared shops | Each partner's own checkout connected |
| D136 | Currency, USSD, watermarks | USSD provider; watermark burned into real files |
| D137 | Calendar sync | Google and Outlook calendar APIs |
| D142 | Safe embeds | Embed security review for 11 sites |
| D143 | Live presence, multi-door check-in | Real-time server |
| D148 | Bank transfer extension | Payment provider |
| D192 | Provider adapters | Payments, SMS, WhatsApp, email, domains, storage |
| D225 | Meeting links for bookings | Google Meet, Zoom, Teams sign-in and APIs |
| D229 | Live course sessions | Same meeting providers |
| D230 | Pixels & campaign links | Confirm Meta and Google receive events |
| D231 | Extension clean-up | — (confirm the three moves) |
| D232 | New extensions | Mailchimp/Brevo, Sheets, product feed address; confirm TikTok/Clarity data |
| D63 / D211 | AI page assistant | Language model provider and backend |
| D102 | Voice-to-Store | Nigerian-language speech recognition |
| D104 | AI Business Coach | Language model provider |
| D36 | Account screens | Real sign-up, sign-in and password reset |

## D. Translations (drafts for native-speaker review)

All are Pidgin, Yorùbá, Hausa and Igbo drafts. Signing off means "a native speaker has checked them".

| ID | Screens |
|---|---|
| D133 | Translation layer, falls back to English |
| D133a – D133d | Checkout, booking, order/booking/ticket pages, downloads, payment-link pages, subscriber portal, buyer protection |
| D133e – D133r | Commerce: overview, products, orders, refunds, inventory, events, discounts, digital products, storefront, subscriptions, payment links, payments, wallet |
| D138 | Batch 13 text |
| D145 – D147 | Tracking, payouts, bank windows, payments card, verification, reports, Audience, schedule, services |
| D150 – D151 | Availability, team hours, calendar sync, booking and contact panels |
| D152 | Verification steps (also in B) |

## E. Product and design decisions

These are product choices, already built, with no figures or legal wording attached.

**Canvas, blocks and pages**
D7 page sections · D8 MVP block catalogue · D26 reusable sections · D28 scheduling · D29 edit conflicts · D30 media upload · D48 multi-page sites · D64 IntentFlow · D75 layout primitives · D153 layout sections · D166 / D166a block picker · D167 containers · D169 / D170 new blocks · D171 all 120 ideas in picker · D172 24 ready-made sections · D173 picker fix · D174 compatibility & composition · D175 section spacing and block names · D177 tidier settings · D180 drag into containers · D181 Delivery & returns block · D182 page background · D215 "Use" source switch · D216 joined bands · D217 Suggested next blocks · D218 band padding · D219 Search & sharing in Publish · D220 warnings with Open link · D221 indexing

**Templates and themes**
D27 saved themes · D32 examples as templates · D155 template preview · D157 Elite visual standard · D158a Artwork scrim · D159 Artwork templates · D160 Elite polish · D161 theme material layer · D162 / D163 Signature themes · D164 themes gallery · D165 themes audit · D191 Signature themes all paid

**Spaces**
D52 campaigns · D53 storefront · D54 DealRooms · D56 DealRoom referrals · D176 spaces list · D178 Event space · D179a samples · D184 Booking page · D185 Members area · D186 samples · D187 addresses without /p

**Commerce and money flows**
D39 checkout · D51 discounts · D72 QR never dead-ends · D74 tickets and check-in · D98 storefront settings · D113a ticket view · D196 / D196a / D196b shop looks · D201 Catalogue · D204 instalments finding · D222 Commerce settings · D223 bank accounts · D226 nothing set twice · D227 Sales report · D228 wrap-up

**Bookings, forms, courses, services**
D79 Forms add-on · D89 Quotes & jobs · D90 / D90a business kits · D91 Proof of work · D140 staff booking times · D194 / D195 / D199 forms · D86 printed identity kit · D111 Trust Passport badge

**Team, workspace and app shell**
D57 roles · D58 approvals · D60 assignments · D80 personal account · D87 apps from Extensions · D101 plan matrix · D116 / D116a comments · D117 / D117a / D117b sidebar · D139 small gaps · D206 / D205 appearances · D207 sidebar regroup · D208 media folders · D209 canvas out of sidebar · D210 sidebar expanded · D214 one WhatsApp number

**Growth, AI and audience**
D81 Opportunity Inbox · D84 claim your link · D85 / D88 Lightweight mode · D125 seller operations · D211c / D211d / D211e / D212 AI assistant passes

**KUBICU website and staff tools**
D12 demo form submissions (Illustrative) · D34 public look · D71a staff console entry · D75b / D83 / D130 / D168 staff operations · D76 accessibility baseline · D77 night-market website · D113b help centre

**Checks and polish passes** (confirm to close)
D149 Batch 14 checks · D188 / D189 / D190 layout polish · D203 shop final checks
