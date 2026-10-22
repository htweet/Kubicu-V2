/** Honest availability shown on the website. Update as batches ship. */
export const capabilityStatus = [
{ name: 'Pages, canvas editor and 26 blocks', detail: 'Design, publish, version history', status: 'Ready in prototype', ready: true },
{ name: 'WhatsApp ordering and enquiry forms', detail: 'Forms don’t store submissions yet', status: 'Ready in prototype', ready: true },
{ name: 'Products, orders and payments', detail: 'Checkout through a verified provider', status: 'Coming next', ready: false },
{ name: 'Bookings and calendars', detail: 'Services, availability, reminders', status: 'Coming next', ready: false },
{ name: 'Custom domains, QR codes and analytics', detail: 'Connect your own domain, see what works', status: 'Planned', ready: false },
{ name: 'AI page setup', detail: 'Describe your business, review a draft', status: 'Planned', ready: false }];


export const legalTopics: Record<string, {title: string;summary: string;}> = {
  terms: { title: 'Terms of service', summary: 'The agreement between you and KUBICU for using the platform.' },
  privacy: { title: 'Privacy policy', summary: 'What we collect, why, how long we keep it, and your rights under the NDPA.' },
  cookies: { title: 'Cookies and consent', summary: 'Which cookies we use and how to change your preferences.' },
  'acceptable-use': { title: 'Acceptable use', summary: 'What can’t be published on KUBICU, and how reports and appeals work.' },
  help: { title: 'Help centre', summary: 'Guides for building, publishing and sharing your page.' },
  contact: { title: 'Contact us', summary: 'Questions about your account, billing or a page you’ve seen.' },
  about: { title: 'About KUBICU', summary: 'Who we are and what we’re building.' }
};