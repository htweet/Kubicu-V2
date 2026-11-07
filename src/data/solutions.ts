/*
 * Solution pages (D268): one data shape per audience, rendered by pages/marketing/Solution.tsx.
 * Creators get their own richer page (pages/marketing/ForCreators.tsx) but share the images here.
 */

export const solutionImages = {
  creator: 'https://cdn.magicpatterns.com/patterns/generated-images/f95f1b0c-24a8-4346-ae4f-5166363abced.jpg',
  photographer: 'https://cdn.magicpatterns.com/patterns/generated-images/847145b3-0c8e-4712-acfe-63b512ee00a2.jpg',
  educator: 'https://cdn.magicpatterns.com/patterns/generated-images/0c57b6c7-c6e5-4596-a32a-7a4632c8108f.jpg',
  events: 'https://cdn.magicpatterns.com/patterns/generated-images/55f7adb0-e695-4f36-9f3c-dee6d7e60512.jpg',
  agency: 'https://cdn.magicpatterns.com/patterns/generated-images/9b39a1f5-341c-4df1-86b3-ce297754665d.jpg',
  musician: 'https://cdn.magicpatterns.com/patterns/generated-images/7da56385-9fbb-455f-8983-ee8c9b8e4c9d.jpg',
  shop: 'https://cdn.magicpatterns.com/patterns/generated-images/2a15e4ca-476f-4b7e-9986-0786ad6054e9.jpg',
  stylist: 'https://cdn.magicpatterns.com/patterns/generated-images/a061e960-5e2b-4ea9-8cf4-3a59abb0655e.jpg',
};

export type SolutionTone = 'lime' | 'cobalt' | 'pink' | 'peach' | 'forest' | 'plum' | 'sky';

export interface SolutionJob {
  title: string;
  text: string;
  /** Where it's built — a product page or marketplace listing. */
  to: string;
  linkLabel: string;
}

export interface Solution {
  id: string;
  label: string;
  title: string;
  lead: string;
  tone: SolutionTone;
  image: string;
  imageAlt: string;
  /** Three or four jobs this audience hires KUBICU for, in the order they usually happen. */
  jobs: SolutionJob[];
  /** Example page ids shown as phones. */
  examples: string[];
  /** Marketplace listing slug for the matching industry kit, if there is one. */
  kit?: string;
  /** Honest scope notes: what needs a plan, an app, or isn't built yet. */
  goodToKnow: string[];
  faqs: { q: string; a: string }[];
}

export const solutions: Solution[] = [
  {
    id: 'creators',
    label: 'Creators & influencers',
    title: 'One page for everything you make.',
    lead: 'Your links, latest content, brand-deal enquiries, products and a list of fans you own — on one page that looks like you.',
    tone: 'pink',
    image: solutionImages.creator,
    imageAlt: 'A content creator filming a video on her phone at home',
    jobs: [
      { title: 'Start with your links', text: 'Profile, socials and your most important links, ranked the way you want.', to: '/marketplace/blocks-links', linkLabel: 'Link blocks' },
      { title: 'Share it everywhere', text: 'A short link per post and a QR for events, so you see what brings people in.', to: '/tools/short-links', linkLabel: 'Short links' },
      { title: 'Grow a list you own', text: 'Newsletter sign-ups with honest consent, organised in Audience.', to: '/features/audience-manager', linkLabel: 'Audience Manager' },
      { title: 'Earn from it', text: 'Media kit enquiries, digital products, tips and bookings when you’re ready.', to: '/marketplace/categories/templates', linkLabel: 'Creator templates' },
    ],
    examples: ['elite-signature-creator', 'elite-media-kit', 'elite-video-creator'],
    goodToKnow: ['Audience figures on media kits are your own numbers, confirmed before publishing.', 'Selling needs Commerce and a connected payout account.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes — a page with links, socials, sign-ups and short links is free. Paid plans add themes, a custom domain and selling tools.' },
      { q: 'Can I start without writing anything?', a: 'Describe yourself to Copilot in a chat and get a draft page to edit.' },
    ],
  },
  {
    id: 'freelancers',
    label: 'Freelancers & portfolios',
    title: 'Show the work. Win the next client.',
    lead: 'A portfolio that loads fast on a phone, explains what you do in plain words, and turns interest into a proper enquiry.',
    tone: 'cobalt',
    image: solutionImages.photographer,
    imageAlt: 'A photographer holding his camera in a sunlit studio',
    jobs: [
      { title: 'Lead with your best work', text: 'Portfolio grids, case studies and before-and-after blocks that keep images sharp and captions readable.', to: '/marketplace/blocks-portfolio', linkLabel: 'Professional blocks' },
      { title: 'Say what you offer', text: 'Services with scope and starting prices you choose — or “on request” if you’d rather talk first.', to: '/marketplace/blocks-text', linkLabel: 'Pricing & packages' },
      { title: 'Get a real brief', text: 'An enquiry form that asks for budget, dates and links, and lands in Audience with where they found you.', to: '/features/audience-manager', linkLabel: 'Audience Manager' },
      { title: 'Send quotes and invoices', text: 'Turn an enquiry into a quote, a job and an invoice with a pay link.', to: '/marketplace/service-os', linkLabel: 'Quotes & jobs' },
    ],
    examples: ['elite-freelance', 'elite-design-portfolio', 'elite-photographer'],
    kit: 'kit-photographer',
    goodToKnow: ['Testimonials and client logos need your confirmation that you’re allowed to show them.', 'Quotes & jobs is a free KUBICU app you install from the Marketplace.'],
    faqs: [
      { q: 'Can I use my own domain?', a: 'Yes, on Creator and above. Until then your portfolio lives at kub.icu/yourname.' },
      { q: 'Will my photos be compressed?', a: 'They’re resized for phones so pages load quickly on mobile data, and full-size originals stay in your Media library.' },
    ],
  },
  {
    id: 'artists',
    label: 'Artists, musicians & podcasters',
    title: 'Your releases, shows and episodes — one link.',
    lead: 'Put the newest release first, every streaming platform one tap away, and bookings and brand enquiries where promoters can find them.',
    tone: 'plum',
    image: solutionImages.musician,
    imageAlt: 'A musician with headphones in a home studio',
    jobs: [
      { title: 'Feature what’s new', text: 'A release or episode block with cover art and links to every platform you’re on.', to: '/marketplace/blocks-media', linkLabel: 'Media blocks' },
      { title: 'Sell tickets to shows', text: 'Event pages with seat limits, a guest list and door check-in.', to: '/for/events', linkLabel: 'Events' },
      { title: 'Grow a list you own', text: 'A fan newsletter that doesn’t depend on any one platform’s algorithm.', to: '/features/audience-manager', linkLabel: 'Audience Manager' },
      { title: 'Know which posts work', text: 'A short link per post or flyer, so you can see what actually brought fans in.', to: '/tools/short-links', linkLabel: 'Short links' },
    ],
    examples: ['elite-music-artist', 'elite-podcast', 'ife-sounds'],
    kit: 'kit-music',
    goodToKnow: ['Streaming links open the platform’s own app — embeds play only from supported sites.', 'Ticket sales need Commerce and a connected payout account.'],
    faqs: [
      { q: 'Can fans listen on the page?', a: 'Audio and video blocks play from supported sites like YouTube, Spotify, Apple Music and Audiomack. Others show a clear link instead.' },
      { q: 'Can I take booking requests?', a: 'Yes — an enquiry form for promoters, with dates, venue and budget. It lands in Audience.' },
    ],
  },
  {
    id: 'educators',
    label: 'Educators & digital sellers',
    title: 'Teach it once. Deliver it properly.',
    lead: 'Sell guides, templates and courses with secure delivery, and keep free resources clearly separate from paid ones.',
    tone: 'sky',
    image: solutionImages.educator,
    imageAlt: 'An educator recording an online lesson at her desk',
    jobs: [
      { title: 'Sell downloads', text: 'Ebooks, presets and templates with limited download links that can’t be shared endlessly.', to: '/features#commerce', linkLabel: 'Digital products' },
      { title: 'Run courses', text: 'Lessons released on a schedule, with progress and certificates.', to: '/features#commerce', linkLabel: 'Courses' },
      { title: 'Give a free resource', text: 'A checklist or sample in return for an email — with the consent wording shown, never hidden.', to: '/marketplace/blocks-forms', linkLabel: 'Forms & audience blocks' },
      { title: 'Book live classes', text: 'Group or one-to-one sessions with a meeting link added to each booking.', to: '/marketplace/bookings', linkLabel: 'Bookings app' },
    ],
    examples: ['elite-educator', 'elite-digital', 'kemi-presets'],
    kit: 'kit-courses',
    goodToKnow: ['Meeting links from Google Meet, Zoom or Teams are simulated in this prototype.', 'Course certificates show the learner’s name and can be checked on a public page.'],
    faqs: [
      { q: 'How do buyers get their files?', a: 'After payment they get a link by email and on their receipt, valid for a limited number of downloads you set.' },
      { q: 'Can I sell in instalments?', a: 'Yes, above a minimum price, on Pro and above.' },
    ],
  },
  {
    id: 'shops',
    label: 'Shops & social sellers',
    title: 'Sell where your customers already are.',
    lead: 'A shop that works from WhatsApp, Instagram and TikTok — with stock that stays right, delivery prices by area, and payments that confirm themselves.',
    tone: 'peach',
    image: solutionImages.shop,
    imageAlt: 'A shop owner arranging products in her boutique',
    jobs: [
      { title: 'Put products on your page', text: 'Featured products, collections and categories, with sizes, colours and stock.', to: '/features#commerce', linkLabel: 'Store' },
      { title: 'Take orders your way', text: 'Card, bank transfer or pay on delivery — or an order sent straight to your WhatsApp.', to: '/features#commerce', linkLabel: 'Checkout' },
      { title: 'Track every post', text: 'A short link per post, story and sticker, credited with the orders it brought.', to: '/tools/short-links', linkLabel: 'Short links' },
      { title: 'Bring buyers back', text: 'Thank-you messages, restock alerts and loyalty points that run on their own.', to: '/marketplace/categories/recipes', linkLabel: 'Automation recipes' },
    ],
    examples: ['adaeze-atelier', 'elite-boutique', 'elite-food'],
    kit: 'kit-fashion',
    goodToKnow: ['Payments run in test mode in this prototype.', 'Delivery partners are booked from Deliveries; prices by area are set in Commerce.'],
    faqs: [
      { q: 'Do I need a website already?', a: 'No. Your shop lives on your KUBICU page at kub.icu/yourshop, and you can add your own domain later.' },
      { q: 'What happens when something sells out?', a: 'It shows “Sold out” or takes back-orders, depending on your setting, and items in someone’s checkout are held for 15 minutes so the last one isn’t sold twice.' },
    ],
  },
  {
    id: 'services',
    label: 'Service businesses',
    title: 'Fewer “are you free Saturday?” messages.',
    lead: 'Salons, repairs, consultants and studios: show your services and prices, take bookings with deposits, and keep every client in one list.',
    tone: 'pink',
    image: solutionImages.stylist,
    imageAlt: 'A hairstylist at work in her salon',
    jobs: [
      { title: 'Show your menu', text: 'Services with durations and starting prices, and a gallery of real work.', to: '/marketplace/blocks-services', linkLabel: 'Booking blocks' },
      { title: 'Take bookings', text: 'Customers pick a free time from your real availability, with optional deposits.', to: '/marketplace/bookings', linkLabel: 'Bookings app' },
      { title: 'Quote bigger jobs', text: 'Site visits, quotes, jobs and invoices for work that isn’t a fixed slot.', to: '/marketplace/service-os', linkLabel: 'Quotes & jobs' },
      { title: 'Remember every client', text: 'Bookings become contacts with their history, notes and follow-ups.', to: '/features/audience-manager', linkLabel: 'Audience Manager' },
    ],
    examples: ['glow-by-halima', 'elite-beauty', 'fix-right-plumbing'],
    kit: 'kit-salon',
    goodToKnow: ['Without the Bookings app, the booking button falls back to an enquiry or WhatsApp.', 'Deposits need Pro and a connected payout account.'],
    faqs: [
      { q: 'Can customers reschedule themselves?', a: 'Yes, within the notice period you set. Cancellations inside it keep the deposit if you choose.' },
      { q: 'Do reminders go out?', a: 'Reminder automations can be switched on; WhatsApp and email sends are previews until a messaging partner is connected.' },
    ],
  },
  {
    id: 'events',
    label: 'Events & communities',
    title: 'From announcement to door check-in.',
    lead: 'An event page that changes with the day — tickets before, directions during, a recap after — plus memberships for the community around it.',
    tone: 'lime',
    image: solutionImages.events,
    imageAlt: 'An event organiser at the entrance of a rooftop event',
    jobs: [
      { title: 'Sell tickets', text: 'Ticket types, seat limits and a waitlist when it sells out.', to: '/features#commerce', linkLabel: 'Events' },
      { title: 'Run the door', text: 'A guest list and check-in from any phone, with more than one door at once.', to: '/features#commerce', linkLabel: 'Check-in' },
      { title: 'Keep the community', text: 'A members area for subscribers, with sign-in by one-time code.', to: '/features#sites', linkLabel: 'Members area' },
      { title: 'Know where people heard', text: 'A short link per promoter, poster and post — with the tickets each one sold.', to: '/tools/short-links', linkLabel: 'Short links' },
    ],
    examples: ['elite-event', 'afrobeats-brunch', 'elite-community'],
    kit: 'kit-events',
    goodToKnow: ['Tickets and memberships need Commerce and a connected payout account.', 'Fundraisers need identity verification before they go live.'],
    faqs: [
      { q: 'Can I do free RSVPs?', a: 'Yes — free tickets work the same way, with the guest list and check-in.' },
      { q: 'What happens if I cancel?', a: 'The page shows a clear message and you can refund every ticket from the guest list.' },
    ],
  },
  {
    id: 'agencies',
    label: 'Agencies & multi-brand teams',
    title: 'Many brands. One workspace. Clear roles.',
    lead: 'Run pages for several clients or brands, with the right people on each, approvals before anything goes live, and a log of who changed what.',
    tone: 'forest',
    image: solutionImages.agency,
    imageAlt: 'A small agency team reviewing designs together',
    jobs: [
      { title: 'A space per brand', text: 'Separate pages and links per brand or campaign, each with its own address.', to: '/features#sites', linkLabel: 'Spaces' },
      { title: 'Roles that fit', text: 'Owner, Admin, Editor, Sales and Viewer — and per-space access for each person.', to: '/pricing', linkLabel: 'Plans & seats' },
      { title: 'Approve before publishing', text: 'Editors send changes for review; Admins approve or ask for changes side by side.', to: '/features#canvas', linkLabel: 'Approvals' },
      { title: 'Report clearly', text: 'Analytics per space and campaign link, exported as CSV for client reports.', to: '/features#analytics', linkLabel: 'Analytics' },
    ],
    examples: ['elite-agency', 'studio-nnamdi', 'elite-coach'],
    goodToKnow: ['Agency plan seat numbers are example figures.', 'Each client brand can have its own custom domain.'],
    faqs: [
      { q: 'Can clients log in?', a: 'Invite them with a Viewer or Editor role limited to their own space.' },
      { q: 'Can I hand a workspace over?', a: 'Yes — ownership can be transferred to the client, and the activity log goes with it.' },
    ],
  },
];

export const solutionById = Object.fromEntries(solutions.map((s) => [s.id, s])) as Record<string, Solution>;

export const solutionToneColours: Record<SolutionTone, { bg: string; fg: string; btnBg: string; btnFg: string }> = {
  lime: { bg: 'rgb(var(--kb-lime))', fg: 'rgb(var(--kb-forest))', btnBg: 'rgb(var(--kb-forest))', btnFg: 'rgb(var(--kb-lime))' },
  cobalt: { bg: 'rgb(var(--kb-cobalt))', fg: '#ffffff', btnBg: 'rgb(var(--kb-lime))', btnFg: 'rgb(var(--kb-forest))' },
  pink: { bg: 'rgb(var(--kb-pink))', fg: 'rgb(var(--kb-plum))', btnBg: 'rgb(var(--kb-plum))', btnFg: '#ffffff' },
  peach: { bg: 'rgb(var(--kb-peach))', fg: 'rgb(var(--kb-clay))', btnBg: 'rgb(var(--kb-clay))', btnFg: '#ffffff' },
  forest: { bg: 'rgb(var(--kb-forest))', fg: 'rgb(var(--kb-lime))', btnBg: 'rgb(var(--kb-lime))', btnFg: 'rgb(var(--kb-forest))' },
  plum: { bg: 'rgb(var(--kb-plum))', fg: 'rgb(var(--kb-pink))', btnBg: 'rgb(var(--kb-pink))', btnFg: 'rgb(var(--kb-plum))' },
  sky: { bg: 'rgb(var(--kb-sky))', fg: 'rgb(var(--kb-cobalt))', btnBg: 'rgb(var(--kb-cobalt))', btnFg: '#ffffff' },
};
