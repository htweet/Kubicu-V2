import type { PageTheme } from '../types/page';

export interface PageThemePreset {
  id: string;
  name: string;
  theme: PageTheme;
}

export const pageThemePresets: PageThemePreset[] = [
  {
    id: 'noirCream',
    name: 'Noir & cream',
    theme: {
      presetId: 'noirCream',
      background: '#F3EDE3',
      surface: '#FBF8F2',
      text: '#121212',
      mutedText: '#5E574D',
      accent: '#121212',
      accentText: '#F3EDE3',
      fontPair: 'editorial',
      buttonShape: 'pill',
      buttonStyle: 'solid',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    theme: {
      presetId: 'midnight',
      background: '#111111',
      surface: '#1C1C1C',
      text: '#F3EDE3',
      mutedText: '#B5ADA0',
      accent: '#E9DCC4',
      accentText: '#111111',
      fontPair: 'editorial',
      buttonShape: 'pill',
      buttonStyle: 'solid',
    },
  },
  {
    id: 'sand',
    name: 'Sand',
    theme: {
      presetId: 'sand',
      background: '#EADFCC',
      surface: '#F6F0E4',
      text: '#2B2118',
      mutedText: '#665544',
      accent: '#8A4B2A',
      accentText: '#FFFFFF',
      fontPair: 'classic',
      buttonShape: 'rounded',
      buttonStyle: 'solid',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    theme: {
      presetId: 'forest',
      background: '#E9EFE8',
      surface: '#FFFFFF',
      text: '#13261C',
      mutedText: '#4B5F53',
      accent: '#1F5135',
      accentText: '#FFFFFF',
      fontPair: 'modern',
      buttonShape: 'rounded',
      buttonStyle: 'soft',
    },
  },
  {
    id: 'studio',
    name: 'Studio white',
    theme: {
      presetId: 'studio',
      background: '#FFFFFF',
      surface: '#F4F4F5',
      text: '#111827',
      mutedText: '#52525B',
      accent: '#2B4FD8',
      accentText: '#FFFFFF',
      fontPair: 'modern',
      buttonShape: 'square',
      buttonStyle: 'outline',
    },
  },
  {
    id: 'blush',
    name: 'Blush',
    theme: {
      presetId: 'blush',
      background: '#F7E9E4',
      surface: '#FFF8F5',
      text: '#2E1A1A',
      mutedText: '#6B4C48',
      accent: '#A63D48',
      accentText: '#FFFFFF',
      fontPair: 'expressive',
      buttonShape: 'pill',
      buttonStyle: 'solid',
    },
  },
];

export const fontPairs: { id: PageTheme['fontPair']; name: string; display: string; body: string }[] = [
  { id: 'editorial', name: 'Editorial', display: "'Fraunces', Georgia, serif", body: "'Inter', system-ui, sans-serif" },
  { id: 'modern', name: 'Modern', display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
  { id: 'classic', name: 'Classic', display: "'Newsreader', Georgia, serif", body: "'Inter', system-ui, sans-serif" },
  {
    id: 'expressive',
    name: 'Expressive',
    display: "'Instrument Serif', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
  },
  { id: 'statement', name: 'Statement', display: "'Archivo', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
  { id: 'warm', name: 'Warm', display: "'Lora', Georgia, serif", body: "'Inter', system-ui, sans-serif" },
  // D157 — two display faces for the Elite library: a high-contrast luxury serif and a characterful grotesk.
  { id: 'luxe', name: 'Luxe', display: "'Cormorant Garamond', Georgia, serif", body: "'Inter', system-ui, sans-serif" },
  { id: 'grotesk', name: 'Grotesk', display: "'Bricolage Grotesque', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
];
