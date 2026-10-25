import {
  ArrowRightLeftIcon,
  AwardIcon,
  CalendarClockIcon,
  ClockIcon,
  GitCommitVerticalIcon,
  MegaphoneIcon,
  MousePointerClickIcon,
  NavigationIcon,
  NewspaperIcon,
  PhoneCallIcon,
  QuoteIcon,
  Share2Icon,
  ShieldCheckIcon,
  TableIcon,
  TruckIcon,
  UsersIcon } from
'lucide-react';
import type { BlockDefinition } from './blockRegistry';
import { uid } from '../utils/id';
import { defaultHours } from '../utils/openHours';

/** Round 1 of the expanded block library (D169). Merged into `blockDefinitions`. */
export type StoryBlockType =
'announcement' | 'cta' | 'quote' | 'timeline' | 'comparison' | 'beforeAfter' | 'team' | 'credentials' |
'press' | 'hours' | 'agenda' | 'contactActions' | 'share' | 'anchorNav' | 'policies' | 'delivery';

const base = { supportsEmphasis: false, defaultAlign: 'left' as const };

export const storyBlockDefinitions: { [K in StoryBlockType]: BlockDefinition<K> } = {
  announcement: {
    ...base,
    type: 'announcement',
    name: 'Announcement bar',
    description: 'One short line for a launch, offer or notice, with an optional link.',
    category: 'Foundation',
    icon: MegaphoneIcon,
    keywords: ['announcement', 'banner', 'notice', 'news', 'offer', 'alert'],
    clickable: true,
    defaults: () => ({ text: 'New collection drops Friday', linkLabel: '', url: '', tone: 'accent' })
  },
  cta: {
    ...base,
    type: 'cta',
    name: 'Call to action',
    description: 'A prominent ask — book, buy, subscribe — with one main button and an optional second.',
    category: 'Conversion',
    icon: MousePointerClickIcon,
    keywords: ['cta', 'call to action', 'button', 'book now', 'get started', 'banner'],
    clickable: true,
    defaults: () => ({ title: 'Ready when you are', text: '', primaryLabel: 'Get in touch', primaryUrl: '', secondaryLabel: '', secondaryUrl: '', layout: 'band' })
  },
  quote: {
    ...base,
    type: 'quote',
    name: 'Pull quote',
    description: 'A memorable line set large, with who said it.',
    category: 'Foundation',
    icon: QuoteIcon,
    keywords: ['quote', 'pull quote', 'statement', 'motto'],
    clickable: false,
    defaults: () => ({ text: '', name: '', role: '', style: 'editorial' })
  },
  timeline: {
    ...base,
    type: 'timeline',
    name: 'Timeline',
    description: 'Milestones in order — your story, a project or a company history.',
    category: 'Foundation',
    icon: GitCommitVerticalIcon,
    keywords: ['timeline', 'history', 'journey', 'milestones', 'story'],
    clickable: false,
    defaults: () => ({ title: 'Our story', intro: '', items: [{ id: uid('tl'), date: '2019', title: 'Where it started', text: '' }, { id: uid('tl'), date: '2022', title: 'A turning point', text: '' }] })
  },
  comparison: {
    ...base,
    type: 'comparison',
    name: 'Comparison table',
    description: 'Compare packages or options side by side. One card per option on phones.',
    category: 'Conversion',
    icon: TableIcon,
    keywords: ['compare', 'comparison', 'table', 'packages', 'plans', 'versus'],
    clickable: false,
    minPlan: 'creator',
    defaults: () => ({
      title: 'Compare packages',
      intro: '',
      columns: [
      { id: uid('cc'), name: 'Basic', price: '', highlight: false },
      { id: uid('cc'), name: 'Standard', price: '', highlight: true }],

      rows: [
      { id: uid('cr'), label: 'What’s included', values: ['', ''] },
      { id: uid('cr'), label: 'Turnaround', values: ['', ''] }]

    })
  },
  beforeAfter: {
    ...base,
    type: 'beforeAfter',
    name: 'Before & after',
    description: 'Show a transformation with a slider visitors can drag, tap or use with arrow keys.',
    category: 'Showcase',
    icon: ArrowRightLeftIcon,
    keywords: ['before after', 'comparison', 'transformation', 'makeover', 'result', 'slider'],
    clickable: false,
    minPlan: 'creator',
    defaults: () => ({ title: '', beforeUrl: '', beforeAlt: '', afterUrl: '', afterAlt: '', beforeLabel: 'Before', afterLabel: 'After', caption: '', permission: false })
  },
  team: {
    ...base,
    type: 'team',
    name: 'Team',
    description: 'People with photos, roles and short bios. Also works for speakers and performers.',
    category: 'Showcase',
    icon: UsersIcon,
    keywords: ['team', 'people', 'staff', 'speakers', 'performers', 'hosts', 'about us'],
    clickable: true,
    defaults: () => ({ title: 'Meet the team', intro: '', variant: 'team', items: [{ id: uid('tm'), name: 'Your name', role: '', bio: '', imageUrl: '', imageAlt: '', url: '' }] })
  },
  credentials: {
    ...base,
    type: 'credentials',
    name: 'Credentials & experience',
    description: 'Qualifications, certifications and roles — or a compact CV with a download.',
    category: 'Showcase',
    icon: AwardIcon,
    keywords: ['credentials', 'certifications', 'qualifications', 'experience', 'cv', 'resume', 'career'],
    clickable: false,
    defaults: () => ({ title: 'Experience', variant: 'credentials', summary: '', items: [{ id: uid('cd'), title: '', org: '', year: '', text: '' }], cvUrl: '' })
  },
  press: {
    ...base,
    type: 'press',
    name: 'Press & publications',
    description: 'Articles, interviews, books and talks you were part of, linked to the source.',
    category: 'Showcase',
    icon: NewspaperIcon,
    keywords: ['press', 'media', 'featured in', 'publications', 'articles', 'interviews', 'books'],
    clickable: true,
    defaults: () => ({ title: 'In the press', items: [{ id: uid('pr'), outlet: '', title: '', date: '', url: '', kind: 'article' }] })
  },
  hours: {
    ...base,
    type: 'hours',
    name: 'Business hours',
    description: 'Opening hours with a live “open now” label, in your time zone.',
    category: 'Conversion',
    icon: ClockIcon,
    keywords: ['hours', 'opening hours', 'open', 'times', 'schedule'],
    clickable: false,
    defaults: () => ({ title: 'Opening hours', timeZone: 'Africa/Lagos', hours: defaultHours(), note: '' })
  },
  agenda: {
    ...base,
    type: 'agenda',
    name: 'Agenda',
    description: 'The running order for an event — times, sessions and who’s on.',
    category: 'Commerce',
    icon: CalendarClockIcon,
    keywords: ['agenda', 'schedule', 'programme', 'program', 'running order', 'lineup', 'sessions'],
    clickable: false,
    defaults: () => ({ title: 'Agenda', date: '', items: [{ id: uid('ag'), time: '10:00', title: 'Doors open', speaker: '', text: '' }, { id: uid('ag'), time: '11:00', title: 'First session', speaker: '', text: '' }] })
  },
  contactActions: {
    ...base,
    type: 'contactActions',
    name: 'Contact buttons',
    description: 'Call, email, WhatsApp and website as one tidy set of buttons.',
    category: 'Conversion',
    icon: PhoneCallIcon,
    keywords: ['contact', 'call', 'email', 'whatsapp', 'phone', 'reach'],
    clickable: true,
    defaults: () => ({ title: '', phone: '', email: '', whatsapp: '', website: '', layout: 'row' })
  },
  share: {
    ...base,
    type: 'share',
    name: 'Share this page',
    description: 'Let visitors share your page on WhatsApp, X, Facebook, email or by copying the link.',
    category: 'Conversion',
    icon: Share2Icon,
    keywords: ['share', 'social share', 'copy link', 'spread the word'],
    clickable: true,
    defaults: () => ({ title: 'Share this page', text: '' })
  },
  anchorNav: {
    ...base,
    type: 'anchorNav',
    name: 'Jump links',
    description: 'A short index of sections on a long page. Becomes a “Jump to” menu on phones.',
    category: 'Showcase',
    icon: NavigationIcon,
    keywords: ['anchor', 'jump', 'table of contents', 'index', 'menu', 'navigation', 'sections'],
    clickable: true,
    defaults: () => ({ title: '', items: [] })
  },
  policies: {
    ...base,
    type: 'policies',
    name: 'Policies & assurance',
    description: 'Support, guarantees, terms and other promises — only what you write yourself.',
    category: 'Conversion',
    icon: ShieldCheckIcon,
    keywords: ['policies', 'refunds', 'guarantee', 'support', 'terms', 'assurance'],
    clickable: false,
    defaults: () => ({ title: 'Good to know', intro: '', items: [{ id: uid('pol'), title: 'Support', text: '' }, { id: uid('pol'), title: 'Guarantee', text: '' }] })
  },
  delivery: {
    ...base,
    type: 'delivery',
    name: 'Delivery & returns',
    description: 'Where you deliver, what it costs, pickup and your returns policy. Rates can come straight from your shop settings.',
    category: 'Conversion',
    icon: TruckIcon,
    keywords: ['delivery', 'shipping', 'returns', 'pickup', 'collection', 'dispatch', 'courier', 'refund policy', 'exchange'],
    clickable: false,
    defaults: () => ({ title: 'Delivery & returns', intro: '', source: 'shop', zones: [], pickup: '', returns: '', note: '' })
  }
};

export const storyBlockOrder: StoryBlockType[] = [
'announcement', 'cta', 'quote', 'timeline', 'comparison', 'beforeAfter', 'team', 'credentials',
'press', 'hours', 'agenda', 'contactActions', 'share', 'anchorNav', 'policies', 'delivery'];