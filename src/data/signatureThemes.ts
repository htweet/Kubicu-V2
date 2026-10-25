import type { PageTheme, ThemeMaterial } from '../types/page';

/*
 * KUBICU Signature Theme Library (D161–D162). Each theme changes only the look of a page — colours,
 * atmosphere, surfaces, depth, buttons and type — never its layout. Dual-mode themes ship a light and a
 * dark version that are tuned separately (not inverted). Full specs: docs/THEME_REGISTER.md.
 */

export type ThemeMood = 'glass' | 'dark' | 'light' | 'warm' | 'bold' | 'editorial';
export type ThemeMode = 'light' | 'dark';

export interface SignatureTheme {
  id: string;
  number: number;
  name: string;
  /** One-line personality, shown on cards. */
  personality: string;
  mood: ThemeMood;
  modes: Partial<Record<ThemeMode, PageTheme>>;
  defaultMode: ThemeMode;
  /** Usable on the Free plan (D162); every theme can be previewed on any plan. */
  free?: boolean;
}

export const themeMoodLabels: Record<ThemeMood, string> = {
  glass: 'Glass & gloss',
  dark: 'Dark luxury',
  light: 'Light & airy',
  warm: 'Warm & natural',
  bold: 'Bold',
  editorial: 'Editorial'
};

type Base = Omit<PageTheme, 'presetId' | 'material'>;
const mode = (id: string, m: ThemeMode, base: Base, material: ThemeMaterial): PageTheme => ({ presetId: `sig:${id}:${m}`, ...base, material });

export const signatureThemes: SignatureTheme[] = [
{
  id: 'aurora-glass',
  number: 1,
  name: 'Aurora Glass',
  personality: 'Luminous layered glass over cyan, violet and mint light.',
  mood: 'glass',
  defaultMode: 'dark',
  modes: {
    dark: mode('aurora-glass', 'dark',
    { background: '#0B1030', surface: '#1A2150', text: '#EEF1FF', mutedText: '#B4BCE6', accent: '#7CF3D4', accentText: '#071A2A', fontPair: 'modern', buttonShape: 'pill', buttonStyle: 'solid' },
    {
      secondary: '#5CC8FF', focus: '#7CF3D4', border: 'rgba(200,210,255,0.16)',
      backdrop: 'radial-gradient(60% 50% at 12% 8%, rgba(64,224,255,0.34), transparent 70%), radial-gradient(55% 45% at 88% 18%, rgba(139,124,255,0.42), transparent 70%), radial-gradient(70% 50% at 50% 100%, rgba(124,243,212,0.22), transparent 70%), #0B1030',
      backdropMobile: 'radial-gradient(90% 40% at 50% 0%, rgba(139,124,255,0.38), transparent 70%), #0B1030',
      backdropStops: ['#1E3D66', '#2E2A6B'],
      surfaceFinish: 'glass', glassOpacity: 52, glassBlur: 22, edgeHighlight: true, shadow: 'glow', glow: '#8B7CFF',
      radius: 'round', buttonFinish: 'gradient', buttonGradient: 'linear-gradient(135deg, #7CF3D4, #5CC8FF)', sheen: true,
      imageFrame: 'hairline', linkStyle: 'arrow', headingFont: 'sora', bodyFont: 'manrope', headingWeight: 600, headingTracking: '-0.02em'
    }),
    light: mode('aurora-glass', 'light',
    { background: '#F4F6FF', surface: '#FFFFFF', text: '#141838', mutedText: '#4A5180', accent: '#4B3FD9', accentText: '#FFFFFF', fontPair: 'modern', buttonShape: 'pill', buttonStyle: 'solid' },
    {
      secondary: '#1769B8', focus: '#4B3FD9', border: 'rgba(20,24,56,0.09)',
      backdrop: 'radial-gradient(60% 50% at 10% 0%, rgba(64,200,255,0.20), transparent 70%), radial-gradient(55% 45% at 90% 15%, rgba(139,124,255,0.22), transparent 70%), radial-gradient(70% 50% at 50% 100%, rgba(124,243,212,0.16), transparent 70%), #F4F6FF',
      backdropStops: ['#DCE6FB', '#E3DDFB'],
      surfaceFinish: 'glass', glassOpacity: 70, glassBlur: 20, edgeHighlight: true, shadow: 'soft',
      radius: 'round', buttonFinish: 'gradient', buttonGradient: 'linear-gradient(135deg, #4B3FD9, #1769B8)', sheen: true,
      imageFrame: 'hairline', linkStyle: 'arrow', headingFont: 'sora', bodyFont: 'manrope', headingWeight: 600, headingTracking: '-0.02em'
    })
  }
},
{
  id: 'obsidian-chrome',
  number: 2,
  name: 'Obsidian Chrome',
  personality: 'Near-black lacquer with chrome hairlines. Precise and confident.',
  mood: 'dark',
  defaultMode: 'dark',
  modes: {
    dark: mode('obsidian-chrome', 'dark',
    { background: '#0A0A0B', surface: '#161618', text: '#F2F2F3', mutedText: '#A3A3A8', accent: '#E6E7EA', accentText: '#0A0A0B', fontPair: 'modern', buttonShape: 'rounded', buttonStyle: 'solid' },
    {
      secondary: '#B9BDC4', focus: '#E6E7EA', border: 'rgba(255,255,255,0.10)',
      backdrop: 'radial-gradient(80% 55% at 50% -10%, rgba(255,255,255,0.09), transparent 60%), linear-gradient(180deg, #0A0A0B, #111113)',
      backdropStops: ['#1A1A1C'],
      surfaceFinish: 'lacquer', edgeHighlight: true, shadow: 'lifted', radius: 'soft',
      buttonFinish: 'gloss', buttonGradient: 'linear-gradient(180deg, #F4F5F7, #C9CCD2)',
      imageFrame: 'hairline', linkStyle: 'arrow', headingFont: 'manrope', bodyFont: 'inter', headingWeight: 600, headingTracking: '-0.03em'
    })
  }
},
{
  id: 'pearl-atelier',
  number: 3,
  name: 'Pearl Atelier',
  personality: 'Ivory and pearl satin, champagne hairlines, a quiet serif.',
  mood: 'editorial',
  defaultMode: 'light',
  free: true,
  modes: {
    light: mode('pearl-atelier', 'light',
    { background: '#F6F1E9', surface: '#FCFAF6', text: '#2A241D', mutedText: '#6B6052', accent: '#2A241D', accentText: '#F6F1E9', fontPair: 'luxe', buttonShape: 'pill', buttonStyle: 'solid' },
    {
      secondary: '#B89B6A', focus: '#8C6E3E', border: '#E3D8C6',
      backdrop: 'radial-gradient(70% 50% at 50% 0%, rgba(255,255,255,0.9), transparent 70%), linear-gradient(180deg, #F8F4EC, #F1EADF)',
      backdropStops: ['#F1EADF'],
      surfaceFinish: 'satin', shadow: 'soft', radius: 'soft', buttonFinish: 'solid',
      imageFrame: 'mat', linkStyle: 'underline', headingFont: 'cormorant', bodyFont: 'manrope', headingWeight: 500, headingTracking: '-0.01em'
    })
  }
},
{
  id: 'cobalt-liquid',
  number: 4,
  name: 'Cobalt Liquid',
  personality: 'Rich cobalt depth and liquid blue actions. Bold technology.',
  mood: 'bold',
  defaultMode: 'dark',
  modes: {
    dark: mode('cobalt-liquid', 'dark',
    { background: '#070D24', surface: '#0F1A44', text: '#EEF3FF', mutedText: '#A9B6E0', accent: '#2F6BFF', accentText: '#FFFFFF', fontPair: 'modern', buttonShape: 'rounded', buttonStyle: 'solid' },
    {
      secondary: '#1A3FD1', focus: '#7FA6FF', border: 'rgba(127,166,255,0.18)',
      backdrop: 'radial-gradient(60% 45% at 85% 0%, rgba(47,107,255,0.45), transparent 70%), radial-gradient(50% 40% at 0% 60%, rgba(30,79,224,0.28), transparent 70%), #070D24',
      backdropMobile: 'radial-gradient(90% 40% at 70% 0%, rgba(47,107,255,0.40), transparent 70%), #070D24',
      backdropStops: ['#14307A'],
      surfaceFinish: 'satin', edgeHighlight: true, shadow: 'lifted', radius: 'soft',
      buttonFinish: 'gradient', buttonGradient: 'linear-gradient(135deg, #2F6BFF, #1A3FD1)', sheen: true,
      imageFrame: 'shadow', linkStyle: 'arrow', headingFont: 'sora', bodyFont: 'inter', headingWeight: 600, headingTracking: '-0.025em'
    }),
    light: mode('cobalt-liquid', 'light',
    { background: '#F3F6FF', surface: '#FFFFFF', text: '#0B1640', mutedText: '#44507A', accent: '#1F4FE0', accentText: '#FFFFFF', fontPair: 'modern', buttonShape: 'rounded', buttonStyle: 'solid' },
    {
      secondary: '#1438B0', focus: '#1F4FE0', border: '#DCE3F5',
      backdrop: 'radial-gradient(60% 45% at 90% 0%, rgba(47,107,255,0.16), transparent 70%), #F3F6FF',
      backdropStops: ['#E0E8FF'],
      surfaceFinish: 'matte', shadow: 'soft', radius: 'soft',
      buttonFinish: 'gradient', buttonGradient: 'linear-gradient(135deg, #1F4FE0, #1438B0)', sheen: true,
      imageFrame: 'shadow', linkStyle: 'arrow', headingFont: 'sora', bodyFont: 'inter', headingWeight: 600, headingTracking: '-0.025em'
    })
  }
},
{
  id: 'rose-quartz',
  number: 5,
  name: 'Rose Quartz Studio',
  personality: 'Dusty rose and mauve with soft blush translucency.',
  mood: 'warm',
  defaultMode: 'light',
  modes: {
    light: mode('rose-quartz', 'light',
    { background: '#F8EEEE', surface: '#FFF8F7', text: '#3A2228', mutedText: '#7A5560', accent: '#B04E6A', accentText: '#FFFFFF', fontPair: 'expressive', buttonShape: 'pill', buttonStyle: 'soft' },
    {
      secondary: '#8E5C8A', focus: '#B04E6A', border: 'rgba(122,85,96,0.16)',
      backdrop: 'radial-gradient(60% 50% at 18% 0%, rgba(230,170,185,0.45), transparent 70%), radial-gradient(50% 40% at 100% 40%, rgba(196,170,210,0.32), transparent 70%), #F8EEEE',
      backdropStops: ['#F0D6DC'],
      surfaceFinish: 'glass', glassOpacity: 70, glassBlur: 16, edgeHighlight: true, shadow: 'soft', radius: 'round',
      buttonFinish: 'gradient', buttonGradient: 'linear-gradient(135deg, #B04E6A, #8E5C8A)',
      imageFrame: 'none', linkStyle: 'accent', headingFont: 'dmSerif', bodyFont: 'manrope', headingWeight: 400, headingTracking: '-0.01em'
    }),
    dark: mode('rose-quartz', 'dark',
    { background: '#22151B', surface: '#33222A', text: '#F8E9EC', mutedText: '#CDAFB7', accent: '#E8A3B4', accentText: '#2A161D', fontPair: 'expressive', buttonShape: 'pill', buttonStyle: 'soft' },
    {
      secondary: '#C9A3D6', focus: '#E8A3B4', border: 'rgba(232,163,180,0.18)',
      backdrop: 'radial-gradient(60% 50% at 18% 0%, rgba(232,163,180,0.22), transparent 70%), radial-gradient(50% 40% at 100% 50%, rgba(201,163,214,0.18), transparent 70%), #22151B',
      backdropStops: ['#3A2430'],
      surfaceFinish: 'glass', glassOpacity: 50, glassBlur: 18, edgeHighlight: true, shadow: 'soft', radius: 'round',
      buttonFinish: 'gradient', buttonGradient: 'linear-gradient(135deg, #E8A3B4, #C9A3D6)',
      imageFrame: 'none', linkStyle: 'accent', headingFont: 'dmSerif', bodyFont: 'manrope', headingWeight: 400, headingTracking: '-0.01em'
    })
  }
},
{
  id: 'emerald-luxe',
  number: 6,
  name: 'Emerald Luxe',
  personality: 'Polished emerald and pale gold. Grounded, premium, assured.',
  mood: 'dark',
  defaultMode: 'dark',
  modes: {
    dark: mode('emerald-luxe', 'dark',
    { background: '#07201A', surface: '#0E3027', text: '#F1EEDC', mutedText: '#BFC7B3', accent: '#D8BE7A', accentText: '#10241C', fontPair: 'editorial', buttonShape: 'rounded', buttonStyle: 'solid' },
    {
      secondary: '#C2A35E', focus: '#D8BE7A', border: 'rgba(216,190,122,0.18)',
      backdrop: 'radial-gradient(70% 50% at 50% 0%, rgba(26,120,88,0.45), transparent 70%), linear-gradient(180deg, #07201A, #051712)',
      backdropStops: ['#0F4A39'],
      surfaceFinish: 'lacquer', edgeHighlight: true, shadow: 'lifted', radius: 'soft',
      buttonFinish: 'gloss', buttonGradient: 'linear-gradient(180deg, #E3CB8C, #C2A35E)',
      imageFrame: 'hairline', linkStyle: 'underline', headingFont: 'playfair', bodyFont: 'inter', headingWeight: 600, headingTracking: '-0.01em'
    }),
    light: mode('emerald-luxe', 'light',
    { background: '#F2F4EE', surface: '#FFFFFF', text: '#0D2A21', mutedText: '#4D6158', accent: '#0F5B43', accentText: '#FFFFFF', fontPair: 'editorial', buttonShape: 'rounded', buttonStyle: 'solid' },
    {
      secondary: '#0B4634', focus: '#0F5B43', border: '#D9E0D6',
      backdrop: 'radial-gradient(70% 50% at 50% 0%, rgba(15,91,67,0.10), transparent 70%), #F2F4EE',
      backdropStops: ['#E4EBE4'],
      surfaceFinish: 'satin', shadow: 'soft', radius: 'soft', buttonFinish: 'solid',
      imageFrame: 'hairline', linkStyle: 'underline', headingFont: 'playfair', bodyFont: 'inter', headingWeight: 600, headingTracking: '-0.01em'
    })
  }
},
{
  id: 'solar-bloom',
  number: 7,
  name: 'Solar Bloom',
  personality: 'Sunlit cream, citrus light and a glossy amber action.',
  mood: 'warm',
  defaultMode: 'light',
  modes: {
    light: mode('solar-bloom', 'light',
    { background: '#FFF7E8', surface: '#FFFFFF', text: '#2A1E0A', mutedText: '#6E5A35', accent: '#FFC23D', accentText: '#2A1E0A', fontPair: 'modern', buttonShape: 'pill', buttonStyle: 'solid' },
    {
      secondary: '#F29A12', focus: '#B46A00', border: 'rgba(42,30,10,0.09)',
      backdrop: 'radial-gradient(70% 55% at 88% 0%, rgba(255,196,64,0.45), transparent 70%), radial-gradient(50% 40% at 0% 30%, rgba(255,150,60,0.18), transparent 70%), #FFF7E8',
      backdropStops: ['#FFE6B0'],
      surfaceFinish: 'matte', shadow: 'soft', radius: 'round',
      buttonFinish: 'gloss', buttonGradient: 'linear-gradient(180deg, #FFC23D, #F29A12)',
      imageFrame: 'none', linkStyle: 'arrow', headingFont: 'outfit', bodyFont: 'inter', headingWeight: 600, headingTracking: '-0.02em'
    })
  }
},
{
  id: 'midnight-cosmos',
  number: 8,
  name: 'Midnight Cosmos',
  personality: 'Navy-to-violet depth with a single magenta spark.',
  mood: 'dark',
  defaultMode: 'dark',
  modes: {
    dark: mode('midnight-cosmos', 'dark',
    { background: '#080A1F', surface: '#12153A', text: '#EEF0FF', mutedText: '#AAB0DA', accent: '#E85BC8', accentText: '#1A0820', fontPair: 'statement', buttonShape: 'pill', buttonStyle: 'solid' },
    {
      secondary: '#7A5CFF', focus: '#E85BC8', border: 'rgba(170,176,218,0.16)',
      backdrop: 'radial-gradient(80% 60% at 70% -10%, rgba(122,92,255,0.40), transparent 65%), radial-gradient(60% 40% at 0% 80%, rgba(40,80,200,0.28), transparent 70%), linear-gradient(180deg, #080A1F, #0C0B2A)',
      backdropMobile: 'radial-gradient(100% 45% at 60% 0%, rgba(122,92,255,0.38), transparent 70%), #080A1F',
      backdropStops: ['#1F1A55'],
      surfaceFinish: 'glass', glassOpacity: 58, glassBlur: 20, shadow: 'glow', glow: '#7A5CFF', radius: 'round',
      buttonFinish: 'glow',
      imageFrame: 'hairline', linkStyle: 'arrow', headingFont: 'syne', bodyFont: 'manrope', headingWeight: 700, headingTracking: '-0.02em'
    })
  }
},
{
  id: 'electric-orchid',
  number: 9,
  name: 'Electric Orchid',
  personality: 'Deep plum with controlled orchid glow. Expressive, futuristic.',
  mood: 'bold',
  defaultMode: 'dark',
  modes: {
    dark: mode('electric-orchid', 'dark',
    { background: '#14081C', surface: '#22102E', text: '#F6ECFF', mutedText: '#C7B0D8', accent: '#C85CFF', accentText: '#16061F', fontPair: 'grotesk', buttonShape: 'rounded', buttonStyle: 'outline' },
    {
      secondary: '#FF5CC6', focus: '#FF5CC6', border: 'rgba(200,92,255,0.24)',
      backdrop: 'radial-gradient(60% 45% at 10% 0%, rgba(200,92,255,0.34), transparent 70%), radial-gradient(50% 40% at 100% 100%, rgba(255,92,198,0.22), transparent 70%), #14081C',
      backdropStops: ['#2E1240'],
      surfaceFinish: 'lacquer', shadow: 'glow', glow: '#C85CFF', radius: 'soft',
      buttonFinish: 'gradient', buttonGradient: 'linear-gradient(135deg, #C85CFF, #FF5CC6)', sheen: true,
      imageFrame: 'hairline', linkStyle: 'arrow', headingFont: 'bricolage', bodyFont: 'inter', headingWeight: 700, headingTracking: '-0.025em'
    })
  }
},
{
  id: 'champagne-glass',
  number: 10,
  name: 'Champagne Glass',
  personality: 'Warm glass, taupe and fine borders. Understated opulence.',
  mood: 'glass',
  defaultMode: 'light',
  modes: {
    light: mode('champagne-glass', 'light',
    { background: '#F4ECDF', surface: '#FFFBF4', text: '#2B2118', mutedText: '#6C5B49', accent: '#3A2C20', accentText: '#F7EEDD', fontPair: 'editorial', buttonShape: 'pill', buttonStyle: 'solid' },
    {
      secondary: '#C7A877', focus: '#8C6E3E', border: 'rgba(120,90,50,0.16)',
      backdrop: 'radial-gradient(70% 50% at 30% 0%, rgba(231,206,160,0.55), transparent 70%), radial-gradient(50% 40% at 100% 60%, rgba(255,255,255,0.7), transparent 70%), #F4ECDF',
      backdropStops: ['#EBDCC0'],
      surfaceFinish: 'glass', glassOpacity: 64, glassBlur: 18, edgeHighlight: true, shadow: 'soft', radius: 'soft', buttonFinish: 'solid',
      imageFrame: 'mat', linkStyle: 'underline', headingFont: 'fraunces', bodyFont: 'manrope', headingWeight: 500, headingTracking: '-0.015em'
    }),
    dark: mode('champagne-glass', 'dark',
    { background: '#1C1611', surface: '#2A211A', text: '#F4E9D6', mutedText: '#C6B49A', accent: '#E2C58E', accentText: '#1C1611', fontPair: 'editorial', buttonShape: 'pill', buttonStyle: 'solid' },
    {
      secondary: '#B8955C', focus: '#E2C58E', border: 'rgba(226,197,142,0.16)',
      backdrop: 'radial-gradient(70% 50% at 30% 0%, rgba(226,197,142,0.18), transparent 70%), #1C1611',
      backdropStops: ['#2E2418'],
      surfaceFinish: 'glass', glassOpacity: 50, glassBlur: 18, edgeHighlight: true, shadow: 'lifted', radius: 'soft',
      buttonFinish: 'gloss', buttonGradient: 'linear-gradient(180deg, #EBD3A3, #CDAA6E)',
      imageFrame: 'mat', linkStyle: 'underline', headingFont: 'fraunces', bodyFont: 'manrope', headingWeight: 500, headingTracking: '-0.015em'
    })
  }
},
{
  id: 'arctic-prism',
  number: 11,
  name: 'Arctic Prism',
  personality: 'Icy white with prism-edge light. Crisp but never cold.',
  mood: 'light',
  defaultMode: 'light',
  modes: {
    light: mode('arctic-prism', 'light',
    { background: '#F5F8FB', surface: '#FFFFFF', text: '#0F1B2A', mutedText: '#4A5A6E', accent: '#0F1B2A', accentText: '#FFFFFF', fontPair: 'modern', buttonShape: 'pill', buttonStyle: 'solid' },
    {
      secondary: '#2C8DB8', focus: '#2C8DB8', border: 'rgba(15,27,42,0.08)',
      backdrop: 'radial-gradient(60% 40% at 0% 0%, rgba(120,210,240,0.26), transparent 70%), radial-gradient(50% 35% at 100% 10%, rgba(190,170,255,0.20), transparent 70%), radial-gradient(60% 40% at 60% 100%, rgba(150,240,220,0.18), transparent 70%), #F5F8FB',
      backdropStops: ['#E4F0F8'],
      surfaceFinish: 'glass', glassOpacity: 78, glassBlur: 16, edgeHighlight: true, shadow: 'soft', radius: 'round', buttonFinish: 'solid',
      imageFrame: 'hairline', linkStyle: 'arrow', headingFont: 'outfit', bodyFont: 'inter', headingWeight: 600, headingTracking: '-0.02em'
    })
  }
},
{
  id: 'sunset-haze',
  number: 12,
  name: 'Sunset Haze',
  personality: 'Coral-to-violet atmosphere with clear cream cards.',
  mood: 'warm',
  defaultMode: 'light',
  modes: {
    light: mode('sunset-haze', 'light',
    { background: '#FFF1EA', surface: '#FFFAF6', text: '#3A1A1A', mutedText: '#7A4A45', accent: '#C2413B', accentText: '#FFFFFF', fontPair: 'expressive', buttonShape: 'pill', buttonStyle: 'solid' },
    {
      secondary: '#8A4E9E', focus: '#C2413B', border: 'rgba(122,74,69,0.14)',
      backdrop: 'radial-gradient(70% 50% at 100% 0%, rgba(255,150,110,0.45), transparent 70%), radial-gradient(60% 45% at 0% 40%, rgba(255,120,150,0.24), transparent 70%), radial-gradient(60% 40% at 50% 100%, rgba(150,110,200,0.22), transparent 70%), #FFF1EA',
      backdropMobile: 'radial-gradient(100% 45% at 80% 0%, rgba(255,150,110,0.42), transparent 70%), #FFF1EA',
      backdropStops: ['#FFD9C8', '#F2D8E6'],
      surfaceFinish: 'matte', shadow: 'soft', radius: 'round',
      buttonFinish: 'gradient', buttonGradient: 'linear-gradient(135deg, #C2413B, #8A4E9E)',
      imageFrame: 'shadow', linkStyle: 'accent', headingFont: 'dmSerif', bodyFont: 'manrope', headingWeight: 400, headingTracking: '-0.01em'
    }),
    dark: mode('sunset-haze', 'dark',
    { background: '#1E1020', surface: '#2C1A2C', text: '#FFEDE6', mutedText: '#D6B3B0', accent: '#FF8A66', accentText: '#2A1010', fontPair: 'expressive', buttonShape: 'pill', buttonStyle: 'solid' },
    {
      secondary: '#E36A9A', focus: '#FF8A66', border: 'rgba(255,138,102,0.16)',
      backdrop: 'radial-gradient(70% 50% at 100% 0%, rgba(255,138,102,0.28), transparent 70%), radial-gradient(60% 45% at 0% 70%, rgba(150,90,200,0.24), transparent 70%), #1E1020',
      backdropStops: ['#3A1E2E'],
      surfaceFinish: 'matte', shadow: 'lifted', radius: 'round',
      buttonFinish: 'gradient', buttonGradient: 'linear-gradient(135deg, #FF8A66, #E36A9A)',
      imageFrame: 'shadow', linkStyle: 'accent', headingFont: 'dmSerif', bodyFont: 'manrope', headingWeight: 400, headingTracking: '-0.01em'
    })
  }
}];


/** The Signature theme and mode a preset id points at (`sig:<id>:<mode>`), if any. */
export function parseSignatureId(presetId: string): {theme: SignatureTheme;mode: ThemeMode;} | null {
  if (!presetId.startsWith('sig:')) return null;
  const [, id, m] = presetId.split(':');
  const theme = signatureThemes.find((t) => t.id === id);
  if (!theme) return null;
  return { theme, mode: m as ThemeMode ?? theme.defaultMode };
}

export function signatureTheme(t: SignatureTheme, m: ThemeMode = t.defaultMode): PageTheme {
  return (t.modes[m] ?? t.modes[t.defaultMode]) as PageTheme;
}