import type { FlagId } from '../types/admin';

/** Flags that genuinely switch something off in the prototype (D75b). */
export const featureFlags: {id: FlagId;name: string;description: string;affects: string;planTargeted: boolean;}[] = [
{
  id: 'ai_page_setup',
  name: 'AI page setup',
  description: 'The “Describe your business” draft in the canvas and “Describe it with AI” in sign-up.',
  affects: 'Canvas → Page panel, onboarding',
  planTargeted: true
},
{
  id: 'storefront',
  name: 'Storefront',
  description: 'The auto-built shop at /shop. Turning it off hides every workspace’s storefront; pages keep working.',
  affects: 'Public /shop pages',
  planTargeted: false
}];


export const reportReasonLabels = {
  scam: 'Scam or fraud',
  counterfeit: 'Fake or counterfeit goods',
  hate: 'Hate or harassment',
  adult: 'Adult or violent content',
  impersonation: 'Pretending to be someone else',
  copyright: 'Uses my work without permission',
  fundraising: 'Fundraising scam or misuse',
  other: 'Something else'
} as const;

export const ticketTopicLabels = {
  billing: 'Plan & billing',
  payments: 'Payments & payouts',
  pages: 'Pages & domains',
  account: 'Account & team',
  other: 'Something else'
} as const;