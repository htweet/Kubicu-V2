import type { PageDocument } from '../types/page';
import { pageThemePresets } from './pageThemes';

/** The "start blank" option. Every other template is one of the twelve example pages (D32). */
export const blankTemplateDoc: PageDocument = {
  id: 'tpl_blank',
  schemaVersion: 1,
  handle: 'blank',
  title: 'Untitled page',
  updatedAt: '2026-10-01T09:00:00.000Z',
  seo: { title: 'Untitled page', description: '' },
  theme: pageThemePresets[0].theme,
  blocks: [
  {
    id: 'tpl_b_profile',
    type: 'profile',
    schemaVersion: 1,
    style: { align: 'center', emphasis: 'default' },
    layout: { spacing: 'normal' },
    behaviour: { trackClicks: true, openInNewTab: true },
    visibility: { hidden: false },
    accessibility: { label: '' },
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
    content: { name: 'Your name', tagline: '', avatarUrl: '', avatarAlt: '', location: '' }
  }]

};