# Public site, Marketplace, Short Links & Audience Manager — register (D268)

Traceability for `docs/KUBICU_LINKTREE_PARITY_AND_UPGRADE_MAGIC_PATTERNS.md`. Status: **Built** (works in the prototype), **Simulated** (works without the outside service production needs), **Planned** (labelled, not usable).

## Routes

| Route | Page | Shared parts | Connects to | Status |
|---|---|---|---|---|
| (every marketing page) | `MegaMenu`, `MobileSiteMenu` | `data/siteMenu.ts` (one schema) | All routes below | Built |
| `/features` | `pages/marketing/Features.tsx` | `data/featureIndex.ts`, `PillarCrossLinks` | Anchors `#canvas #sites #commerce #bookings #audience #links #analytics #ai` | Built |
| `/for/:segment` (8) | `pages/marketing/Solution.tsx` | `data/solutions.ts`, `ExamplePhone` | Templates, kits, product pages | Built |
| `/marketplace` | `marketplace/MarketplaceHome.tsx` | `MarketplaceBrowser`, `ListingCard` | All listing kinds | Built |
| `/marketplace/apps` | `marketplace/MarketplaceCategory.tsx` | same | Extensions | Built |
| `/marketplace/categories/:category` | same | same | Templates, themes, blocks, recipes, kits, AI (planned) | Built |
| `/marketplace/:slug` | `marketplace/MarketplaceListing.tsx` | `InstallPanel` | `/app/extensions?ext=`, `/templates/:id`, `/app/automations?recipe=`, `/app/templates?tab=kits`, canvas | Built |
| `/tools/short-links` | `ShortLinksLanding.tsx` | `ShortLinkDemo`, `LinkStatsSample`, `utils/linkSafety.ts` | `/app/campaign-links` | Built (demo saves nothing) |
| `/features/audience-manager` | `AudienceManagerLanding.tsx` | `AudienceFlow`, `AudienceDashboardSample` | `/app/audience` | Built |
| `/themes`, `/blocks`, `/resources` | redirects | — | `/templates?tab=themes`, `/marketplace/categories/blocks`, `/about/help` | Built |

## Listings

`utils/marketplaceListings.ts` builds every listing from the app's own catalogues: extensions (not retired), templates, Signature themes, 13 block packs, 24 section presets, automation recipes, industry kits, and planned AI items. No popularity sort or ratings (no real data). Install panel states: available, installed, needs plan, role can't install, planned.

## In-app changes

- **Short links** (`/app/campaign-links`): links can go to another website (checked on save and on every tap by `checkDestination`), tags, pause/resume, destination history (who and when). Paused, ended and blocked links show a clear page instead of redirecting.
- **Audience**: saved segments (live membership), a Sources view (way in · channel · short link), first-touch attribution and a consent record (wording + time) on new sign-ups, CSV export with those columns, and every export logged in the activity log.

## Honest limits

- Phishing screening uses a sample block list until a screening service is connected.
- Clicks on website short links aren't recorded in Analytics yet (own-page links are).
- Email/WhatsApp sends and email-tool syncs are previews.
- Contacts created before D268 have no channel or consent record; the Sources view says so.

## Still to check by hand

Mega menu with a screen reader and keyboard only; 320px phone menu; Marketplace search with long result lists on a low-end Android phone.
