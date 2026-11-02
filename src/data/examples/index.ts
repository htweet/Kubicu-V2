import type { ExamplePage } from './build';
import { ifeSounds, kemiPresets, studioNnamdi, toluMakes } from './creative';
import { adaezeAtelier, lagosBookshelf, mamaPutKitchen } from './commerce';
import { belloAndCo, fixRightPlumbing, glowByHalima } from './services';
import { afrobeatsBrunch, ikejaFoodBank } from './community';
import { eliteCreators } from './elite/creators';
import { eliteProfessionals } from './elite/professionals';
import { eliteCommerce } from './elite/commerce';
import { eliteCommunityPages } from './elite/community';
import { artworkPages } from './artwork';
import { countryStarters } from './countries';
import type { CountryCode } from '../../types/country';
import { luminance } from '../../utils/contrast';

export type { ExamplePage, ExampleGoal, ExampleStyle } from './build';

// Declared before `examplePages` — it calls ambientArt while the module is still initialising (D160).
const texture = {
  paper: "/b302067a-ca94-4dcb-a2d2-c16683e5ff30.jpg",
  geometry: "/803bd918-ec6c-4c9f-9621-db3ed9639d97.jpg",
  warm: "/68df290d-1847-408d-9509-5c0beb660edc.jpg",
  ink: "/775ad695-ba49-475f-854e-a50d6965e990.jpg",
  deep: "/049d4687-bf81-4022-82fd-0822eeffa678.jpg"
};

/** Light-page texture per Elite number, chosen for the template's mood (D160). */
const lightTexture: Record<number, keyof typeof texture> = {
  1: 'warm', 2: 'paper', 3: 'geometry', 4: 'geometry', 6: 'geometry', 7: 'paper', 10: 'geometry', 11: 'warm', 12: 'warm',
  14: 'paper', 15: 'geometry', 16: 'paper', 17: 'geometry', 19: 'paper', 20: 'geometry', 21: 'paper', 22: 'warm', 23: 'geometry', 24: 'paper'
};
const darkTexture: Record<number, keyof typeof texture> = { 8: 'deep', 18: 'deep', 23: 'deep' };

/** Fictional example pages — twelve Nigerian and twelve from Kenya, Ghana and South Africa (D434). Each is also a starter template (D32). */
export const examplePages: ExamplePage[] = [
adaezeAtelier,
toluMakes,
studioNnamdi,
lagosBookshelf,
glowByHalima,
mamaPutKitchen,
fixRightPlumbing,
afrobeatsBrunch,
kemiPresets,
belloAndCo,
ifeSounds,
ikejaFoodBank,
// Starters from Kenya, Ghana and South Africa (D434).
...countryStarters,
// Elite Template Library (D154); text passages use the editorial style (D157).
// Each also gets a quiet AI-generated ambient texture behind it (D160).
...[...eliteCreators, ...eliteProfessionals, ...eliteCommerce, ...eliteCommunityPages].map(editorialText).map(ambientArt),
// Artwork collection (D158): classic pages over an AI-generated background, ₦3,000 or less.
...artworkPages];


function editorialText(e: ExamplePage): ExamplePage {
  return {
    ...e,
    doc: { ...e.doc, blocks: e.doc.blocks.map((b) => b.type === 'text' ? { ...b, content: { ...b.content, variant: 'editorial' } } as typeof b : b) }
  };
}

function ambientArt(e: ExamplePage): ExamplePage {
  if (!e.elite || e.doc.theme.backgroundImage) return e;
  const dark = luminance(e.doc.theme.background) < 0.25;
  const key = dark ? darkTexture[e.elite.number] ?? 'ink' : lightTexture[e.elite.number] ?? 'paper';
  return { ...e, doc: { ...e.doc, theme: { ...e.doc.theme, backgroundImage: texture[key], backgroundVeil: dark ? 25 : 20 } } };
}

/** The country an example's business is in; older examples are Nigerian (D434). */
export const exampleCountry = (e: ExamplePage): CountryCode => e.country ?? 'NG';

/** Same list with the given country's examples first, keeping the original order within each group (D434). */
export function countryFirst<T extends ExamplePage>(list: T[], country: CountryCode): T[] {
  return [...list.filter((e) => exampleCountry(e) === country), ...list.filter((e) => exampleCountry(e) !== country)];
}

export function findExampleByHandle(handle: string): ExamplePage | undefined {
  return examplePages.find((e) => e.doc.handle === handle);
}

export function findExampleById(id: string): ExamplePage | undefined {
  return examplePages.find((e) => e.id === id);
}

export const goalLabels: Record<ExamplePage['goals'][number], string> = {
  sell: 'Sell products',
  book: 'Take bookings',
  audience: 'Grow an audience',
  showcase: 'Show my work',
  events: 'Run an event',
  support: 'Raise support'
};