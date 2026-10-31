# KUBICU plan matrix (D101)

The source of truth is `data/planMatrix.ts`, which the public Pricing page renders. This document mirrors it for review. Prices, plan limits and KUBICU fees were **confirmed in D105** (23 Oct 2026). Partner-app plan placement (D101) was confirmed in D109.

> **Update, 30 Oct 2026 (D343):** rows added after D101 live in `data/planMatrix.ts`, which is the source of truth; this mirror isn't refreshed row by row. Note the conflict on prices: this file says prices were confirmed in D105, while `PROTOTYPE_STATUS.md` lists plan prices as deferred by the founder. Treat prices as **not final** until the founder confirms (see `docs/CLAUDE_HANDOFF.md` §17.1).

**Status:** Live = works in the prototype · Preview = works, partner side simulated · Coming = designed, not built.

**Rule:** every new feature gets a row here (and in `data/planMatrix.ts`) when it is designed — including ones not built yet — and its code gate must match.

| Area | Feature | Status | Free | Creator | Pro | Business | Agency | Enterprise |
|---|---|---|---|---|---|---|---|---|
| Build | Canvas editor and core blocks | Live | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Build | Pages per space | Live | 1 | 5 | 20 | 20 | 20 | Custom |
| Build | Extra spaces (campaigns, DealRooms) | Live | – | 3 | 15 | 15 | 15 | Custom |
| Build | Full photo galleries | Live | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Build | Remove “Made with KUBICU” | Live | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Build | Custom domain | Preview | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Build | QR codes, campaign links, print kit | Live | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Build | AI credits / month | Preview | 10 | 60 | 200 | 500 | 1,500 | 5,000 |
| Build | Media storage | Live | 100 MB | 1 GB | 5 GB | 5 GB | 5 GB | Custom |
| Build | Sell your own templates (70/30) | Live | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Build | Members-only pages and sections (code sign-in, D110) | Live | – | – | ✓ | ✓ | ✓ | ✓ |
| Sell | Products | Live | 5 | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
| Sell | Discounts (codes, automatic, referral) | Live | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sell | Checkout, digital downloads, subscriptions | Live | – | – | ✓ | ✓ | ✓ | ✓ |
| Sell | Paid tickets and check-in (free events: all) | Live | – | – | ✓ | ✓ | ✓ | ✓ |
| Sell | Made-to-order deposits | Live | – | – | ✓ | ✓ | ✓ | ✓ |
| Sell | Payment links (incl. staged) | Live | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sell | Wallet and payouts (after verification) | Preview | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sell | Escrow buyer protection | Preview | – | – | ✓ | ✓ | ✓ | ✓ |
| Sell | Pay on delivery, instalments (seller-run, D112) | Live | – | – | ✓ | ✓ | ✓ | ✓ |
| Sell | Seating maps (D113) | Live | – | – | ✓ | ✓ | ✓ | ✓ |
| Sell | Repeating events (D113) | Live | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Serve & grow | Bookings with deposits and balances | Live | – | – | ✓ | ✓ | ✓ | ✓ |
| Serve & grow | Quotes, invoices, jobs, milestones | Live | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Serve & grow | Audience, lead forms, newsletter | Live | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Serve & grow | Analytics, Automations, IntentFlow, Opportunities, Lightweight mode | Live | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Apps | Forms builder (₦2,500/mo add-on) | Live | – | Add-on | Add-on | Add-on | Add-on | Add-on |
| Apps | Deliveries | Preview | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Apps | WhatsApp Bridge — inbox, catalogue, greeting, welcome back, away | Preview | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Apps | WhatsApp keyword replies and order/booking updates | Preview | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Apps | Trust Passport, badge block and public passport (D111) | Preview | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Apps | Voice-to-Store | Preview | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Apps | Creator Collaboration | Preview | – | – | ✓ | ✓ | ✓ | ✓ |
| Apps | AI Business Coach (uses AI credits) | Preview | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Apps | Partner print-shop ordering | Coming | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Teams | Team seats with roles and approvals | Live | – | – | – | 5 | 25 | Custom |
| Teams | Assignments and activity log | Live | – | – | – | ✓ | ✓ | ✓ |
| Teams | Client workspaces and handover | Live | – | – | – | – | ✓ | ✓ |
| Teams | Priority support | Live | – | – | – | ✓ | ✓ | ✓ |
| Teams | Single sign-on | Coming | – | – | – | – | – | ✓ |
