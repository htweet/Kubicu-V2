/* Content for the dedicated Creators page, /for/creators (D273). Example ids point at real Elite templates. */

export interface CreatorType {
  id: string;
  label: string;
  /** What this kind of creator's page leads with. */
  leads: string;
  /** The blocks that do the work, in page order. */
  blocks: string[];
  example: string;
}

export const creatorTypes: CreatorType[] = [
{
  id: 'personal',
  label: 'Personal brand',
  leads: 'Your face, one line on who you are, and your three most important links — ranked, not dumped.',
  blocks: ['Profile', 'Featured link', 'Socials', 'Newsletter'],
  example: 'elite-signature-creator'
},
{
  id: 'music',
  label: 'Music',
  leads: 'Your latest release with every streaming link, then shows, then a booking enquiry for promoters.',
  blocks: ['Release', 'Streaming links', 'Events', 'Booking enquiry'],
  example: 'elite-music-artist'
},
{
  id: 'video',
  label: 'Video & YouTube',
  leads: 'One featured video, your series as playlists, and the channels to follow — no endless feed.',
  blocks: ['Featured video', 'Playlist', 'Socials', 'Brand enquiry'],
  example: 'elite-video-creator'
},
{
  id: 'fashion',
  label: 'Fashion & style',
  leads: 'Looks first, as an editorial gallery, with the pieces you recommend and a route for brands.',
  blocks: ['Gallery', 'Recommendations', 'Products', 'Brand enquiry'],
  example: 'elite-fashion'
},
{
  id: 'writing',
  label: 'Writing & commentary',
  leads: 'Your best pieces up top in a reading-friendly layout, then the newsletter that keeps readers.',
  blocks: ['Featured stories', 'Archive', 'Newsletter', 'Contact'],
  example: 'elite-editorial-creator'
},
{
  id: 'podcast',
  label: 'Podcasts',
  leads: 'The newest episode playing first, recent episodes as a list, and guest or sponsor enquiries.',
  blocks: ['Episode', 'Episode list', 'Listen on', 'Sponsor enquiry'],
  example: 'elite-podcast'
}];


export interface CreatorStep {
  title: string;
  text: string;
  /** What it needs — said plainly. */
  needs: string;
  to: string;
  linkLabel: string;
}

export const creatorPath: CreatorStep[] = [
{
  title: 'A page with your links',
  text: 'Profile, socials and your important links in an order you choose. Put the address in every bio.',
  needs: 'Free',
  to: '/features#canvas',
  linkLabel: 'The page builder'
},
{
  title: 'A short link for every post',
  text: 'One link per platform or campaign, so you can see what brought people in — and a QR for events.',
  needs: 'Free',
  to: '/tools/short-links',
  linkLabel: 'Short links'
},
{
  title: 'A list you own',
  text: 'Newsletter sign-ups with clear consent, kept in Audience — not rented from an algorithm.',
  needs: 'Free',
  to: '/features/audience-manager',
  linkLabel: 'Audience Manager'
},
{
  title: 'Get paid',
  text: 'Brand-deal enquiries from your media kit, then digital products, tips or bookings when you’re ready.',
  needs: 'Creator plan · payout account',
  to: '/pricing',
  linkLabel: 'Plans'
}];


/** An illustrative Copilot exchange, labelled as an example on the page. */
export const creatorCopilotChat: {from: 'you' | 'copilot';text: string;}[] = [
{ from: 'you', text: 'I’m a fashion creator in Lagos. I want brands to reach me and I sell Lightroom presets.' },
{ from: 'copilot', text: 'Got it. What should visitors do first — contact you about a brand deal, buy presets, or follow you?' },
{ from: 'you', text: 'Brand deals first.' },
{ from: 'copilot', text: 'Here’s your draft: media kit at the top, presets below, socials at the end. Your follower numbers are left for you to fill in — I won’t guess them.' }];


export const creatorGoodToKnow = [
'Audience figures on a media kit are your own numbers. They’re marked for you to confirm before the page can publish.',
'Selling needs the Creator plan and a connected payout account. Links, sign-ups and short links are free.',
'Collaborations — partners promoting your products for a commission — is an app you switch on in your workspace.'];


export const creatorFaqs = [
{ q: 'Is it free?', a: 'Yes. A page with links, socials, newsletter sign-ups and short links is free. Paid plans add premium themes, a custom domain and selling tools.' },
{ q: 'Can I start without writing anything?', a: 'Describe yourself to Copilot in a chat. It asks a few questions and builds a draft page you can edit — nothing goes live until you publish.' },
{ q: 'Will brands see real numbers?', a: 'Only the ones you type. KUBICU doesn’t invent follower counts or engagement rates, and figures you add are shown as yours.' },
{ q: 'Can I move from Linktree?', a: 'Yes — paste your links into a new page, or let Copilot set it up from a description. Your old link keeps working until you switch your bio.' }];