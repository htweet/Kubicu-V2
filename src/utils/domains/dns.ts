import type { CustomDomain, DomainsData } from '../../types/domains';

/** Two-part endings where the registrable domain has three labels (adaeze.com.ng). */
const SECOND_LEVEL = ['com.ng', 'org.ng', 'net.ng', 'edu.ng', 'gov.ng', 'co.uk', 'org.uk', 'co.za', 'co.ke', 'com.gh', 'com.au'];

const HOST_PATTERN = /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

/** Turns whatever was pasted (https://www.Adaeze.com/) into a bare host. */
export function cleanHost(input: string): string {
  return input.
  trim().
  toLowerCase().
  replace(/^[a-z]+:\/\//, '').
  replace(/\/.*$/, '').
  replace(/\.$/, '');
}

export function guessKind(host: string): 'root' | 'subdomain' {
  const labels = host.split('.');
  const base = SECOND_LEVEL.some((s) => host.endsWith(`.${s}`)) ? 3 : 2;
  return labels.length > base ? 'subdomain' : 'root';
}

/** The part before the registrable domain (“shop” in shop.adaeze.com). */
export function subLabel(host: string): string {
  const labels = host.split('.');
  const base = SECOND_LEVEL.some((s) => host.endsWith(`.${s}`)) ? 3 : 2;
  return labels.slice(0, Math.max(0, labels.length - base)).join('.');
}

export function hostError(host: string, data: DomainsData): string | undefined {
  if (!host) return 'Enter the domain you own, like adaeze.com or shop.adaeze.com.';
  if (!HOST_PATTERN.test(host)) return 'That doesn’t look like a domain. Check the spelling — no spaces or special characters.';
  if (host === 'kub.icu' || host.endsWith('.kub.icu')) return 'kub.icu addresses are already yours — connect a domain you bought elsewhere.';
  if (data.domains.some((d) => d.host === host)) return 'This domain is already connected to this workspace.';
  return undefined;
}

export interface DnsRecord {
  type: 'A' | 'CNAME' | 'TXT';
  name: string;
  value: string;
  purpose: string;
}

/** Records to add at the registrar. Target values are illustrative until hosting is chosen (D62). */
export function dnsRecords(d: Pick<CustomDomain, 'host' | 'kind' | 'token'>): DnsRecord[] {
  const sub = subLabel(d.host);
  const verifyName = d.kind === 'root' ? '_kubicu' : `_kubicu.${sub}`;
  const routing: DnsRecord[] =
  d.kind === 'root' ?
  [
  { type: 'A', name: '@', value: '76.76.21.21', purpose: 'Points your domain at KUBICU' },
  { type: 'CNAME', name: 'www', value: 'cname.kub.icu', purpose: 'Makes www work too' }] :

  [{ type: 'CNAME', name: sub, value: 'cname.kub.icu', purpose: 'Points this subdomain at KUBICU' }];
  return [...routing, { type: 'TXT', name: verifyName, value: `kubicu-verify=${d.token}`, purpose: 'Proves the domain is yours' }];
}

export const registrars = [
{ id: 'whogohost', name: 'Whogohost', tip: 'Client area → Domains → Manage → DNS Management. Leave “TTL” at the default.' },
{ id: 'qservers', name: 'Qservers', tip: 'My Domains → Manage → DNS Zone Editor. Use “Add Record” for each line.' },
{ id: 'namecheap', name: 'Namecheap', tip: 'Domain List → Manage → Advanced DNS → Add New Record. Use “@” for the root.' },
{ id: 'godaddy', name: 'GoDaddy', tip: 'My Products → DNS → Add. GoDaddy adds your domain to the name automatically — type only the part shown.' },
{ id: 'cloudflare', name: 'Cloudflare', tip: 'DNS → Records → Add record. Turn the orange cloud off (DNS only) until the domain shows Live.' },
{ id: 'other', name: 'Somewhere else', tip: 'Look for “DNS”, “Zone editor” or “Manage records” where you bought the domain.' }] as
const;

export type RegistrarId = (typeof registrars)[number]['id'];

export const statusSteps: {id: 'waiting_dns' | 'verifying' | 'issuing' | 'live';label: string;}[] = [
{ id: 'waiting_dns', label: 'DNS records' },
{ id: 'verifying', label: 'Verifying' },
{ id: 'issuing', label: 'Certificate' },
{ id: 'live', label: 'Live' }];


export function randomToken(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}