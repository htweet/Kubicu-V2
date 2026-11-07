/*
 * Destination checks for short links (D268). Runs before a link is saved and again before a redirect
 * is followed. A live version adds a reputation/phishing service on the server; this list stands in for it.
 */

export type DestinationProblem =
  | 'empty'
  | 'notUrl'
  | 'scheme'
  | 'credentials'
  | 'private'
  | 'loop'
  | 'blocked'
  | 'tooLong';

export type DestinationCheck = { ok: true; url: string; host: string; upgraded: boolean } | { ok: false; problem: DestinationProblem; message: string };

/** Sample of hosts a screening service would flag. Illustrative only. */
const BLOCKED_HOSTS = ['free-airtime-ng.example', 'bank-verify-login.example', 'bvn-update.example'];
const SHORT_HOSTS = ['kub.icu', 'www.kub.icu'];
const MAX_LENGTH = 2048;

const messages: Record<DestinationProblem, string> = {
  empty: 'Paste the address you want to shorten.',
  notUrl: 'That doesn’t look like a web address. It should look like example.com/page.',
  scheme: 'Only web addresses (https://) can be shortened. App links, files and scripts aren’t allowed.',
  credentials: 'Remove the username or password from the address — they’d be visible to everyone.',
  private: 'That address only works inside one network or computer, so visitors couldn’t open it.',
  loop: 'That’s already a KUBICU short link. Shortening it again would send people in a circle.',
  blocked: 'This address has been reported as unsafe, so it can’t be shortened.',
  tooLong: 'That address is longer than 2,048 characters. Shorten its tracking tags and try again.',
};

function isPrivateHost(host: string): boolean {
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return true;
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return host === '[::1]';
  const [a, b] = [Number(m[1]), Number(m[2])];
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

export function checkDestination(input: string): DestinationCheck {
  const raw = input.trim();
  const fail = (problem: DestinationProblem): DestinationCheck => ({ ok: false, problem, message: messages[problem] });
  if (!raw) return fail('empty');
  if (raw.length > MAX_LENGTH) return fail('tooLong');
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw);
  if (hasScheme && !/^https?:\/\//i.test(raw)) return fail('scheme');
  let url: URL;
  try {
    url = new URL(hasScheme ? raw : `https://${raw}`);
  } catch {
    return fail('notUrl');
  }
  const host = url.hostname.toLowerCase();
  if (!host.includes('.') && host !== 'localhost') return fail('notUrl');
  if (url.username || url.password) return fail('credentials');
  if (isPrivateHost(host)) return fail('private');
  if (SHORT_HOSTS.includes(host)) return fail('loop');
  if (BLOCKED_HOSTS.some((b) => host === b || host.endsWith(`.${b}`))) return fail('blocked');
  const upgraded = url.protocol === 'http:';
  if (upgraded) url.protocol = 'https:';
  return { ok: true, url: url.toString(), host, upgraded };
}
