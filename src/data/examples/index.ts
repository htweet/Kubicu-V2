import type { ExamplePage } from './build';
import { ifeSounds, kemiPresets, studioNnamdi, toluMakes } from './creative';
import { adaezeAtelier, lagosBookshelf, mamaPutKitchen } from './commerce';
import { belloAndCo, fixRightPlumbing, glowByHalima } from './services';
import { afrobeatsBrunch, ikejaFoodBank } from './community';

export type { ExamplePage, ExampleGoal, ExampleStyle } from './build';

/** Twelve fictional example pages. Each is also a starter template (D32). */
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
ikejaFoodBank];


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