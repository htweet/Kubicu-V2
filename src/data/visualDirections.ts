import type { VisualDirection } from '../types/direction';

export interface VisualDirectionInfo {
  id: VisualDirection;
  name: string;
  description: string;
  displayFont: string;
  /** Canvas, surface, border, accent, ink — used for previews and the switcher. */
  swatches: [string, string, string, string, string];
}

export const visualDirections: VisualDirectionInfo[] = [
{
  id: 'darkStudio',
  name: 'Dark studio',
  description: 'Charcoal chrome and a periwinkle accent. The user’s page is the only lit object on the desk.',
  displayFont: 'Inter',
  swatches: ['#0F1014', '#1A1C22', '#2A2D36', '#6B8CFF', '#F7F5F0']
},
{
  id: 'inkCobalt',
  name: 'Ink + cobalt',
  description: 'Warm off-white, deep ink type and a confident cobalt. Editorial and trustworthy.',
  displayFont: 'Inter',
  swatches: ['#F7F5F0', '#FFFFFF', '#E3E0D8', '#2B4FD8', '#14161F']
},
{
  id: 'inkViolet',
  name: 'Ink + deep violet',
  description: 'Neutral stone, near-black type and a deep violet-blue. A touch more creative.',
  displayFont: 'Inter',
  swatches: ['#F4F4F2', '#FFFFFF', '#E2E2DE', '#4B35C9', '#111114']
},
{
  id: 'navyClay',
  name: 'Navy + warm clay',
  description: 'Cream canvas, navy actions and a terracotta highlight for selection. Warm and human.',
  displayFont: 'Inter',
  swatches: ['#FAF6EF', '#FFFFFF', '#E8DFD0', '#13213D', '#C2653A']
}];