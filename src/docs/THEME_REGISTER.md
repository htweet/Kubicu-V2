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

Themes 13–24 arrive in Pass C.
