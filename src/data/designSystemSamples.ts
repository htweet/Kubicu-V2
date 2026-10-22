/** Illustrative rows and points for the design-system reference. Not real platform data. */

export interface SampleTenant {
  id: string;
  workspace: string;
  owner: string;
  plan: string;
  pages: number;
  status: 'Active' | 'Trial' | 'Suspended';
  joined: string;
}

export const sampleTenants: SampleTenant[] = [
{ id: 't1', workspace: 'Adaeze Atelier', owner: 'Adaeze Okonkwo', plan: 'Free', pages: 1, status: 'Active', joined: '2026-09-02' },
{ id: 't2', workspace: 'Kemi Bakes Ikeja', owner: 'Kemi Adeyemi', plan: 'Creator', pages: 2, status: 'Active', joined: '2026-08-14' },
{ id: 't3', workspace: 'Studio Nnamdi', owner: 'Nnamdi Eze', plan: 'Pro', pages: 3, status: 'Trial', joined: '2026-10-11' },
{ id: 't4', workspace: 'Glow by Halima', owner: 'Halima Bello', plan: 'Creator', pages: 1, status: 'Active', joined: '2026-07-29' },
{ id: 't5', workspace: 'Lagos Bookshelf', owner: 'Tunde Afolabi', plan: 'Business', pages: 6, status: 'Suspended', joined: '2026-05-03' }];


export const sampleWeeklyTaps = [
{ label: 'Mon', value: 18 },
{ label: 'Tue', value: 24 },
{ label: 'Wed', value: 21 },
{ label: 'Thu', value: 33 },
{ label: 'Fri', value: 41 },
{ label: 'Sat', value: 52 },
{ label: 'Sun', value: 29 }];