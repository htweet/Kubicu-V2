# KUBICU Signature Theme Register

Themes change only the look of a page — never its layout (D161). Source of truth: `data/signatureThemes.ts`; the material layer is `PageTheme.material` (`types/page.ts`), read centrally by `components/blocks/pageStyle.ts`.

**Token roles (every theme):** background · surface · text · mutedText · accent (primary action) · accentText · secondary · border · focus · backdrop (+ phone variant, `backdropStops` for contrast) · surfaceFinish (+ glass opacity/blur) · shadow · edgeHighlight · radius · buttonFinish (+ gradient, sheen) · imageFrame · linkStyle · headingFont · bodyFont · headingWeight · headingTracking. Status colours (success/warning/error/info) fall back to the app defaults unless set.

**Effects that switch off automatically:** glass blur and translucency → solid surface for reduced transparency and data saver; atmosphere → flat background in data saver; sheen sweep → off for reduced motion; phones get lighter blur and a simpler backdrop where `backdropMobile` is set. Inverted sections drop glass, gradients and glow.

**Readability:** body text ≥ 4.5:1 against the background *and* every backdrop stop; button text ≥ 4.5:1 against both ends of a gradient action. Checked by `themeContrast()`; values below are design targets to be confirmed in the Pass E audit.

## Pass B — themes 01–12 (D162)

| # | Theme | Modes | Mood | Atmosphere | Surface | Buttons | Type (heading / body) | Free plan |
|---|---|---|---|---|---|---|---|---|
| 01 | Aurora Glass | Dark · Light | Glass & gloss | Three radial glows: cyan, violet, mint | Glass 52% / 70%, blur 22, edge light, violet glow | Gradient mint→cyan (dark) / indigo→blue (light), sheen | Sora 600 / Manrope | — |
| 02 | Obsidian Chrome | Dark | Dark luxury | Top light falloff on near-black | Lacquer, chrome hairline, lifted | Gloss chrome | Manrope 600 / Inter | — |
| 03 | Pearl Atelier | Light | Editorial | Pearl light from top over ivory | Satin, champagne hairline, mat-framed photos | Solid ink | Cormorant 500 / Manrope | ✓ |
| 04 | Cobalt Liquid | Dark · Light | Bold | Cobalt glows top-right and left | Satin + edge light (dark) / matte (light) | Gradient cobalt, sheen | Sora 600 / Inter | — |
| 05 | Rose Quartz Studio | Light · Dark | Warm & natural | Blush and mauve glows | Glass 70% / 50%, edge light | Gradient rose→mauve | DM Serif Display / Manrope | — |
| 06 | Emerald Luxe | Dark · Light | Dark luxury | Emerald top glow, deep falloff | Lacquer + gold hairline (dark) / satin (light) | Gloss pale gold (dark) / solid emerald (light) | Playfair 600 / Inter | — |
| 07 | Solar Bloom | Light | Warm & natural | Amber sun top-right, citrus left | Matte, soft shadow | Gloss amber | Outfit 600 / Inter | — |
| 08 | Midnight Cosmos | Dark | Dark luxury | Violet bloom, blue haze, navy falloff | Glass 58%, violet glow | Magenta with glow edge | Syne 700 / Manrope | — |
| 09 | Electric Orchid | Dark | Bold | Orchid and magenta corners | Lacquer, orchid hairline and glow | Gradient orchid→magenta, sheen | Bricolage 700 / Inter | — |
| 10 | Champagne Glass | Light · Dark | Glass & gloss | Champagne glow, white bloom | Glass 64% / 50%, edge light, mat frames | Solid brown (light) / gloss champagne (dark) | Fraunces 500 / Manrope | — |
| 11 | Arctic Prism | Light | Light & airy | Cyan, lilac and mint prism corners | Glass 78%, edge light | Solid ink | Outfit 600 / Inter | — |
| 12 | Sunset Haze | Light · Dark | Warm & natural | Coral, rose and violet bands | Matte cream, soft / lifted shadow | Gradient coral→violet | DM Serif Display / Manrope | — |

## Pass C — themes 13–24 (D163)

| # | Theme | Modes | Mood | Atmosphere | Surface | Buttons | Type (heading / body) | Free plan |
|---|---|---|---|---|---|---|---|---|
| 13 | Monochrome Editorial | Light · Dark | Editorial | None — flat paper / ink | Matte, hairline rules, no shadow, sharp corners | Solid ink, outline standard buttons | Newsreader 500 / Inter | ✓ |
| 14 | Soft Clay | Light | Warm & natural | Faint terracotta light from top | Matte, generous radius, soft shadow | Solid terracotta, tinted standard | Lora 600 / Manrope | ✓ |
| 15 | Neo-Gloss Pop | Light · Dark | Bold | Orange and blue corner pops | Matte with bold ink outlines, lifted | Gloss coral (light) / gloss yellow (dark) | Syne 800 / Outfit | — |
| 16 | Citrus Studio | Light | Light & airy | One citron glow top-right | Matte, soft corners | Gradient citron (dark text) | Manrope 700 / Inter | — |
| 17 | Burgundy Velvet | Light · Dark | Editorial | Wine glow from top | Satin (light) / lacquer + edge light (dark), mat frames | Solid wine (light) / gloss rose-gold (dark) | Playfair 500 / Manrope | — |
| 18 | Indigo Depth | Light · Dark | Light & airy | Indigo fade from top / indigo bloom | Matte (light) / glass 60% (dark) | Gradient indigo | Manrope 600 / Inter | ✓ |
| 19 | Oceanic Glass | Light · Dark | Glass & gloss | Sea-glass teal and ocean blue glows | Glass 72% / 55%, edge light | Gradient teal→ocean | Outfit 600 / Manrope | — |
| 20 | Sandstone Modern | Light | Warm & natural | Limestone fade | Matte, no shadow | Solid olive, square | Archivo 700 / Inter | — |
| 21 | Cyber Mint | Dark | Bold | Mint and cyan corner glows | Glass 72%, mint hairline, fine glow, sharp | Mint with glow edge | Sora 600 / Inter | — |
| 22 | Lavender Mist | Light | Light & airy | Lilac and periwinkle soft focus | Glass 74%, edge light | Gradient violet→periwinkle | Instrument Serif / Manrope | — |
| 23 | Copper Noir | Dark | Dark luxury | Single copper glow top-right | Lacquer, copper hairline, lifted | Gloss copper | DM Serif Display / Inter | — |
| 24 | Future Frost | Light | Glass & gloss | Pale blue bloom, silver corner | Glass 82%, blur 24, near-invisible borders | Gradient graphite, sheen | Outfit 500 / Inter | — |

## Pass E — audit (D165)

Done by reading the code and computing contrast from the token values; not yet viewed in a browser.

**Readability (body text ≥ 4.5:1 against background and every backdrop stop; action text ≥ 4.5:1 on both gradient ends).** All 35 versions pass. Closest to the line, still passing: Indigo Depth Dark action (≈ 4.6:1 on the lighter gradient end), Copper Noir action (≈ 4.6:1 on the darker copper), Cobalt Liquid Dark action (≈ 4.7:1), Rose Quartz Light muted text on the blush glow (≈ 4.8:1), Champagne Glass Light muted text (≈ 4.8:1). Any edit that darkens these should be re-checked in the spec sheet, which shows the live figures.

**Layout never moves.** A theme only changes colours, surfaces, corners, shadows, button finish, photo frame and fonts. Checked against three structurally different pages — a photo-heavy Elite page (cover hero, grids, pairs), a commerce page (product grid, pricing, checkout sheets) and a classic link page — every block reads its look from `pageStyle.ts`; no theme field changes widths, order, pairing or visibility. Font metrics differ between themes (expected). The "mat" photo frame adds 6px inside the image's own box.

**Fixes made in this pass**
- Cover heroes: actions over a photo now always use white-on-ink; a theme's gradient, glow or sheen is dropped there (it would have failed contrast on photos).
- Theme cards: one keyboard stop per card (the duplicate text hit area is out of the tab order).

**Phones, zoom, motion, transparency, keyboard**
- Glass blur drops to 10px on phones; atmosphere uses the simpler `backdropMobile` where set; data saver and reduced transparency give solid surfaces with no blur and a flat background.
- Sheen sweep is hover-only and off for reduced motion; no theme animates on load.
- Every theme sets a focus colour; Signature pages draw a 2px focus ring in it.
- Gallery: cards stack to one column on phones, the preview follows below; compare stacks vertically; all controls are buttons/checkboxes with labels.

**Still needs hands-on checking:** scroll performance of glass themes on a low-end Android phone; the 35 versions at 320px and 200% zoom in a real browser; VoiceOver/TalkBack through the gallery and spec sheet.

**Totals:** 24 themes, 35 versions (11 with Light and Dark). Free-plan themes: none (D191) — all 24 need Creator or above; every theme can be previewed on any plan, and the 6 Classic themes stay on every plan.
