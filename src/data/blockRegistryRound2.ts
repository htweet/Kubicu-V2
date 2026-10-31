import {
  ArrowUpToLineIcon,
  BotMessageSquareIcon,
  CalendarRangeIcon,
  CodeXmlIcon,
  CreditCardIcon,
  FileTextIcon,
  GalleryHorizontalIcon,
  LanguagesIcon,
  ListTreeIcon,
  QrCodeIcon,
  StarIcon,
  StoreIcon,
  TagsIcon,
  ThumbsUpIcon,
  UsersRoundIcon,
  VoteIcon,
  WandSparklesIcon } from
'lucide-react';
import type { BlockDefinition } from './blockRegistry';
import { uid } from '../utils/id';

/** Round 2 of the expanded block library (D170): media, commerce, audience and rule-based smart blocks. */
export type Round2BlockType =
'carousel' | 'brandHeader' | 'linkCollection' | 'qrCode' | 'document' | 'embed' | 'shopCategories' | 'checkoutButton' |
'poll' | 'community' | 'reviewSummary' | 'languageSwitch' | 'smartButton' | 'campaignSpotlight' | 'recommendations' | 'backToTop' |
'faqAssistant';

const base = { supportsEmphasis: false, defaultAlign: 'left' as const };

export const round2BlockDefinitions: { [K in Round2BlockType]: BlockDefinition<K> } = {
  carousel: {
    ...base,
    type: 'carousel',
    name: 'Carousel',
    description: 'Slides visitors move through with buttons, swipes or arrow keys. Never moves on its own.',
    category: 'Showcase',
    icon: GalleryHorizontalIcon,
    keywords: ['carousel', 'slider', 'slideshow', 'slides', 'swipe'],
    clickable: true,
    minPlan: 'creator',
    defaults: () => ({ title: '', aspect: 'wide', slides: [{ id: uid('sl'), imageUrl: '', imageAlt: '', title: 'First slide', text: '', url: '' }] })
  },
  brandHeader: {
    ...base,
    type: 'brandHeader',
    name: 'Brand header',
    description: 'Your logo, business name and tagline, with an optional button.',
    category: 'Foundation',
    icon: StoreIcon,
    keywords: ['brand', 'logo', 'business', 'header', 'company', 'name'],
    clickable: true,
    defaultAlign: 'center',
    defaults: () => ({ logoUrl: '', logoAlt: '', name: '', tagline: '', ctaLabel: '', url: '', align: 'center' })
  },
  linkCollection: {
    ...base,
    type: 'linkCollection',
    name: 'Link collection',
    description: 'Many links, grouped under headings, as a list or a grid.',
    category: 'Foundation',
    icon: ListTreeIcon,
    keywords: ['links', 'link list', 'groups', 'categories', 'directory', 'resources'],
    clickable: true,
    defaults: () => ({ title: '', layout: 'list', groups: [{ id: uid('lgp'), name: 'Favourites', links: [{ id: uid('cl'), label: 'Your first link', url: '', description: '' }] }] })
  },
  qrCode: {
    ...base,
    type: 'qrCode',
    name: 'QR code',
    description: 'A scannable code for this page or any link — handy on screens at events and in shops.',
    category: 'Conversion',
    icon: QrCodeIcon,
    keywords: ['qr', 'qr code', 'scan', 'offline', 'print'],
    clickable: false,
    defaultAlign: 'center',
    defaults: () => ({ target: 'page', url: '', caption: 'Scan to open on your phone', size: 'md' })
  },
  document: {
    ...base,
    type: 'document',
    name: 'Document',
    description: 'A PDF or document with its cover, page count and an open button.',
    category: 'Foundation',
    icon: FileTextIcon,
    keywords: ['document', 'pdf', 'brochure', 'menu pdf', 'deck', 'presentation', 'portfolio pdf'],
    clickable: true,
    defaults: () => ({ title: '', description: '', url: '', coverUrl: '', coverAlt: '', fileType: 'PDF', pages: '' })
  },
  embed: {
    ...base,
    type: 'embed',
    name: 'Embed',
    description: 'Content from a supported site. Anything else shows as a safe link card — no custom code.',
    category: 'Foundation',
    icon: CodeXmlIcon,
    keywords: ['embed', 'iframe', 'spotify', 'soundcloud', 'calendly', 'google maps', 'widget'],
    clickable: false,
    defaults: () => ({ url: '', title: '', caption: '' })
  },
  shopCategories: {
    ...base,
    type: 'shopCategories',
    name: 'Shop categories',
    description: 'Your Commerce collections as shortcuts into your shop.',
    category: 'Commerce',
    icon: TagsIcon,
    keywords: ['categories', 'collections', 'shop', 'browse', 'departments'],
    clickable: true,
    defaults: () => ({ title: 'Shop by category', collectionIds: [], layout: 'cards' })
  },
  checkoutButton: {
    ...base,
    type: 'checkoutButton',
    name: 'Checkout button',
    description: 'One button that adds a product to your checkout, or opens your own payment link — clearly labelled which.',
    category: 'Commerce',
    icon: CreditCardIcon,
    keywords: ['buy', 'buy now', 'pay', 'checkout', 'payment link', 'order'],
    clickable: true,
    defaults: () => ({ mode: 'checkout', productId: null, url: '', label: 'Buy now', note: '' })
  },
  poll: {
    ...base,
    type: 'poll',
    name: 'Poll',
    description: 'One quick question with up to 6 answers. Results show after voting, or never.',
    category: 'Conversion',
    icon: VoteIcon,
    keywords: ['poll', 'vote', 'survey', 'feedback', 'question', 'opinion'],
    clickable: true,
    defaults: () => ({ question: 'What should we make next?', options: [{ id: uid('po'), label: 'Option A' }, { id: uid('po'), label: 'Option B' }], showResults: 'after' })
  },
  community: {
    ...base,
    type: 'community',
    name: 'Community join',
    description: 'Invite visitors into your WhatsApp group, Telegram, Discord or other community.',
    category: 'Conversion',
    icon: UsersRoundIcon,
    keywords: ['community', 'group', 'join', 'whatsapp group', 'telegram', 'discord', 'members', 'club'],
    clickable: true,
    defaults: () => ({ platform: 'whatsapp', name: '', description: '', url: '', ctaLabel: 'Join the group', rules: '' })
  },
  reviewSummary: {
    ...base,
    type: 'reviewSummary',
    name: 'Review summary',
    description: 'Your average rating and latest verified reviews, with where they came from.',
    category: 'Conversion',
    icon: StarIcon,
    keywords: ['reviews', 'rating', 'stars', 'testimonials', 'verified'],
    clickable: false,
    requiresApp: 'proof',
    defaults: () => ({ title: 'What customers say', limit: 3 })
  },
  languageSwitch: {
    ...base,
    type: 'languageSwitch',
    name: 'Language switch',
    description: 'Let visitors read your page’s buttons and labels in Pidgin, Yorùbá, Hausa or Igbo.',
    category: 'Foundation',
    icon: LanguagesIcon,
    keywords: ['language', 'translate', 'pidgin', 'yoruba', 'hausa', 'igbo', 'locale'],
    clickable: true,
    defaults: () => ({ label: 'Language' })
  },
  smartButton: {
    ...base,
    type: 'smartButton',
    name: 'Smart button',
    description: 'One button that changes its words and link by where the visitor came from.',
    category: 'Conversion',
    icon: WandSparklesIcon,
    keywords: ['smart', 'dynamic', 'personalised', 'intentflow', 'source', 'adaptive button'],
    clickable: true,
    minPlan: 'creator',
    defaults: () => ({ label: 'Get in touch', url: '', rules: [] })
  },
  campaignSpotlight: {
    ...base,
    type: 'campaignSpotlight',
    name: 'Campaign spotlight',
    description: 'A featured offer or launch that shows only between the dates you set.',
    category: 'Commerce',
    icon: CalendarRangeIcon,
    keywords: ['campaign', 'promo', 'sale', 'launch', 'limited time', 'offer', 'spotlight'],
    clickable: true,
    minPlan: 'creator',
    defaults: () => ({ title: 'Launch week', text: '', ctaLabel: 'See the offer', url: '', imageUrl: '', imageAlt: '', startsAt: null, endsAt: null, afterText: '' })
  },
  recommendations: {
    ...base,
    type: 'recommendations',
    name: 'Recommendations',
    description: 'Your own picks, in the order you choose, each with why you recommend it.',
    category: 'Showcase',
    icon: ThumbsUpIcon,
    keywords: ['recommendations', 'picks', 'favourites', 'start here', 'guide', 'my setup'],
    clickable: true,
    defaults: () => ({ title: 'Start here', intro: '', items: [{ id: uid('rec'), title: '', text: '', url: '', imageUrl: '', imageAlt: '', reason: '' }] })
  },
  backToTop: {
    ...base,
    type: 'backToTop',
    name: 'Back to top',
    description: 'A quiet link at the end of a long page that returns visitors to the top.',
    category: 'Foundation',
    icon: ArrowUpToLineIcon,
    keywords: ['back to top', 'scroll up', 'top of page'],
    clickable: true,
    defaultAlign: 'center',
    defaults: () => ({ label: 'Back to top' })
  },
  // Built in D342 (was Planned): matching is rule-based, answers are always the owner's own words.
  faqAssistant: {
    ...base,
    type: 'faqAssistant',
    name: 'AI FAQ assistant',
    description: 'Answers visitor questions using only facts you’ve approved — never invents prices or policies.',
    category: 'Conversion',
    icon: BotMessageSquareIcon,
    keywords: ['assistant', 'ask', 'questions', 'chatbot', 'help', 'answers', 'faq bot'],
    clickable: true,
    defaults: () => ({
      title: 'Ask us anything',
      intro: '',
      facts: [{ id: uid('fact'), question: '', answer: '' }],
      fallbackLabel: 'Message us',
      fallbackUrl: ''
    })
  }
};

export const round2BlockOrder: Round2BlockType[] = [
'brandHeader', 'carousel', 'linkCollection', 'qrCode', 'document', 'embed', 'shopCategories', 'checkoutButton',
'poll', 'community', 'reviewSummary', 'languageSwitch', 'smartButton', 'campaignSpotlight', 'recommendations', 'faqAssistant', 'backToTop'];