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
    swatches: ['#0F1014', '#1A1C22', '#2A2D36', '#6B8CFF', '#F7F5F0'],
  },
  {
    id: 'inkCobalt',
    name: 'Ink + cobalt',
    description: 'Warm off-white, deep ink type and a confident cobalt. Editorial and trustworthy.',
    displayFont: 'Inter',
    swatches: ['#F7F5F0', '#FFFFFF', '#E3E0D8', '#2B4FD8', '#14161F'],
  },
];
