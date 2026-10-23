import type { HelpCategory } from '../../types/help';

export const serveAndRunHelp: HelpCategory[] = [
{
  id: 'bookings',
  title: 'Bookings and services',
  summary: 'Services, availability, deposits and no-shows.',
  icon: 'calendar',
  group: 'Serve & grow',
  articles: [
  { id: 'services', q: 'How do I set up a service?', a: 'Add a name, length, price and optional deposit. Link it to a Booking block on your page.', where: 'Bookings → Services' },
  { id: 'availability', q: 'How do I set my working hours?', a: 'Set weekly hours, breaks, time off and how far ahead people can book.', where: 'Bookings → Availability' },
  { id: 'deposit', q: 'Can I take a deposit and the balance later?', a: 'Yes. Ask for a booking fee when they book and the balance before the appointment. Unpaid balances show in Opportunities.' },
  { id: 'reschedule', q: 'How do I reschedule or cancel?', a: 'Open the booking in the Schedule. Customers are shown the change on their booking page.' }]

},
{
  id: 'audience',
  title: 'Audience, forms and messages',
  summary: 'Contacts, consent, forms, WhatsApp and follow-ups.',
  icon: 'users',
  group: 'Serve & grow',
  articles: [
  { id: 'contacts', q: 'Where do my customers appear?', a: 'Everyone who buys, books, subscribes or fills in a form is added to Audience with a timeline of what they did.', where: 'Audience' },
  { id: 'consent', q: 'How is marketing consent handled?', a: 'People are marked as agreeing to marketing only if they ticked the box. Copy their preferences link to let them unsubscribe — only they can opt back in.' },
  { id: 'forms', q: 'How do I build a custom form?', a: 'Install Forms from Extensions. Build multi-step forms with 14 field types, show-or-hide rules, spam checks and an optional payment field, then add a Form block to your page.', plan: 'Add-on · ₦2,500/month' },
  { id: 'whatsapp', q: 'How does the WhatsApp Commerce Bridge work?', a: 'Connect your business number to reply to chats, send products and pay links, and set automatic greetings, away messages and quick replies. WhatsApp is simulated in this version.', where: 'Extensions → WhatsApp Commerce Bridge' },
  { id: 'opportunities', q: 'What is Opportunities?', a: 'One list of money and leads still on the table — unpaid checkouts, failed renewals, unpaid balances, enquiries with no reply — biggest first, each with a WhatsApp nudge.', where: 'Opportunities' }]

},
{
  id: 'growth',
  title: 'Analytics and growth',
  summary: 'Know what works, personalise by source, and grow with partners.',
  icon: 'chart',
  group: 'Serve & grow',
  articles: [
  { id: 'analytics', q: 'What does Analytics show?', a: 'Visits, taps, where visitors came from and step-by-step drop-off for shop, bookings, tickets, forms and subscriptions. No personal data is stored.', where: 'Analytics' },
  { id: 'link-intel', q: 'What is Link Intelligence?', a: 'Up to three plain suggestions with the evidence behind them. They’re hints, not proof.' },
  { id: 'intentflow', q: 'What is IntentFlow?', a: 'Show different blocks to visitors from WhatsApp, Instagram, TikTok, QR codes or campaign links. Preview each audience, pause any rule instantly, and see results once there are enough visits.', where: 'IntentFlow' },
  { id: 'campaigns', q: 'How do campaign pages work?', a: 'A campaign space has Before, Live and Ended versions that switch automatically, with countdowns and an optional discount applied while live.' },
  { id: 'dealrooms', q: 'What is a DealRoom?', a: 'A group-buy page. Buyers pay now; if the goal is reached everyone gets the room price, if not everyone is refunded automatically. Buyers get personal referral links.' },
  { id: 'collab', q: 'How does Creator Collaboration work?', a: 'Invite a creator or reseller with a commission rate and terms. They share their own tracked link; commission is worked out from real orders after discounts and refunds and becomes payable once delivered. Pay from your wallet or record it as paid.', plan: 'Pro and above' },
  { id: 'trust', q: 'What is Trust Passport?', a: 'A trust score out of 100 built only from records KUBICU holds — verification, verified reviews, completed orders, escrow history and few disputes. Show it on your page with the badge.' },
  { id: 'coach', q: 'What does the AI Business Coach do?', a: 'A weekly brief and answers to five questions, based only on your records — what to restock, what isn’t selling and where money is waiting.', plan: 'Creator and above · uses AI credits' },
  { id: 'automations', q: 'How do automations work?', a: 'Choose a starting event (order paid, booking made, form sent, payment due…) and steps like sending a WhatsApp message, tagging or creating a task.', where: 'Automations' }]

},
{
  id: 'team',
  title: 'Team and permissions',
  summary: 'Invite people, roles, approvals and assignments.',
  icon: 'briefcase',
  group: 'Run your workspace',
  articles: [
  { id: 'invite', q: 'How do I invite my team?', a: 'Invite by email with a role: Admin, Editor, Sales or Viewer. Each role sees only what it can act on.', where: 'Settings → Team', plan: 'Business 5 seats · Agency 25' },
  { id: 'approvals', q: 'Can edits be approved before going live?', a: 'Yes. For spaces that need review, an Editor’s Publish becomes “Send for review”. Admins see the live and proposed versions side by side and approve or ask for changes.' },
  { id: 'assign', q: 'Can I assign work to someone?', a: 'Orders, bookings, contacts, follow-ups and form responses have an “Assigned to” field and a “Mine” filter. Automations can notify a team member.' },
  { id: 'activity', q: 'Can I see who changed what?', a: 'The activity log lists every change with who made it and when, and can be exported.', where: 'Settings → Activity' }]

},
{
  id: 'billing',
  title: 'Plans and billing',
  summary: 'Change plan, trials, invoices and what each plan includes.',
  icon: 'zap',
  group: 'Run your workspace',
  articles: [
  { id: 'change-plan', q: 'How do I change my plan?', a: 'Upgrades start straight away and you pay only for the rest of the period. Downgrades happen at renewal, list what goes over the new limits first, and never delete anything.', where: 'Settings → Plan & billing' },
  { id: 'trial', q: 'Is there a free trial?', a: 'A 14-day Pro trial, once per workspace, with no card needed. You’re reminded 3 days before it ends.' },
  { id: 'failed-plan', q: 'What if my plan payment fails?', a: 'A 7-day grace period starts with a banner and a retry button. If it isn’t fixed, the workspace moves to Free without deleting anything.' },
  { id: 'invoices', q: 'Where are my invoices?', a: 'Plan & billing lists paid, failed and upcoming invoices. Each opens a printable invoice with VAT.' },
  { id: 'compare', q: 'What does each plan include?', a: 'The Pricing page has the full comparison, with each feature marked Live, Preview or Coming.' }]

},
{
  id: 'extensions',
  title: 'Extensions and templates marketplace',
  summary: 'Install tools, and buy or sell templates.',
  icon: 'puzzle',
  group: 'Run your workspace',
  articles: [
  { id: 'install', q: 'How do I install an extension?', a: 'Open it in Extensions, review the permissions and press Install. It appears in your sidebar. Pause, uninstall or roll back any time.', where: 'Extensions' },
  { id: 'sell-template', q: 'Can I sell my own templates?', a: 'Yes. Submit a space as a template; personal details are removed and KUBICU staff review it. You keep 70% of each sale and can pay out from ₦5,000.', where: 'Templates → My templates' },
  { id: 'buy-template', q: 'Can I get a refund on a premium template?', a: 'Within 7 days of buying.' }]

},
{
  id: 'mobile',
  title: 'Using KUBICU on your phone',
  summary: 'Everything works on a phone, including checkout and check-in.',
  icon: 'phone',
  group: 'Run your workspace',
  articles: [
  { id: 'phone-app', q: 'Can I run my business from my phone?', a: 'Yes. Every screen works on a phone: lists become cards, details open full screen and main buttons stay at the bottom. Use “More” for the rest of the menu.' },
  { id: 'phone-canvas', q: 'Can I edit my page on a phone?', a: 'Yes. Tap blocks to edit them, and use the bottom bar for blocks, theme, layers, pages and settings.' }]

},
{
  id: 'account',
  title: 'Your account and security',
  summary: 'Profile, sign-in, two-step codes, preferences and your data.',
  icon: 'user',
  group: 'Run your workspace',
  articles: [
  { id: 'profile', q: 'Where are my personal settings?', a: 'Open the menu at the bottom of the sidebar (or the top of “More” on phones) and choose Your account. Workspace Settings apply to everyone; Your account is just you.' },
  { id: '2fa', q: 'How do I turn on two-step sign-in?', a: 'Use an authenticator app or text message, then save your 10 backup codes somewhere safe.', where: 'Your account → Sign-in & security' },
  { id: 'devices', q: 'How do I sign out other devices?', a: 'Sign-in & security lists signed-in devices. Sign them out one at a time or all at once.' },
  { id: 'export', q: 'Can I download my data?', a: 'Request a copy in Your account → Data & privacy. The download link lasts 7 days.' },
  { id: 'delete', q: 'How do I delete my account?', a: 'Your account → Data & privacy → Delete account. It lists the workspaces that would go with it, and you have 14 days to change your mind.' }]

},
{
  id: 'customers',
  title: 'What your customers see',
  summary: 'Order, ticket, booking, subscription and protection pages.',
  icon: 'sparkles',
  group: 'Your customers',
  articles: [
  { id: 'c-order', q: 'Where can customers follow their order?', a: 'After paying they land on their order page with progress, receipt, tickets or downloads, and a link to report a problem if escrow applies.' },
  { id: 'c-ticket', q: 'Where is a guest’s ticket?', a: 'Each ticket has its own page with a QR code, seat, short code and Add to calendar, linked from the order page. Guests can share it on WhatsApp.' },
  { id: 'c-booking', q: 'What does a customer see after booking?', a: 'A booking page with the time, deposit paid, balance due and how to reach you.' },
  { id: 'c-protect', q: 'How do buyers confirm delivery or report a problem?', a: 'From their buyer-protection page, opened with the last 4 digits of their phone number.' },
  { id: 'c-preferences', q: 'How do customers stop marketing messages?', a: 'From the preferences link at the bottom of your messages. Order and booking messages aren’t affected.' },
  { id: 'c-safety', q: 'How do I keep my customers safe from scams?', a: 'Your passport page reminds buyers never to pay into a private account they were sent. Encourage checkout or payment links over transfers.' }]

},
{
  id: 'safety',
  title: 'Trust, safety and support',
  summary: 'Reporting pages, appeals and getting help from a person.',
  icon: 'lifebuoy',
  group: 'Your customers',
  articles: [
  { id: 'report', q: 'How do I report a page?', a: 'Use “Report this page” at the bottom of any KUBICU page. Our Trust & safety team reviews every report.' },
  { id: 'appeal', q: 'My page was taken down — can I appeal?', a: 'Yes. The banner in your workspace has “Appeal this decision”. A different staff member reviews it and you see their note word for word.' },
  { id: 'support', q: 'How do I contact support?', a: 'Signed in, use Help → Contact support for the fastest reply and follow it in My requests. Otherwise use the Contact page.' }]

}];