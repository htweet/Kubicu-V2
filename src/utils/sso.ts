import type { Role } from '../types/team';

/**
 * Enterprise single sign-on (D115). The identity provider is simulated: domain checks,
 * test sign-ins and redirects are stand-ins until a real SAML/OIDC service is connected.
 */

export type SsoProvider = 'google' | 'microsoft' | 'okta' | 'saml';
export type SsoStatus = 'draft' | 'on' | 'off';

export interface SsoTest {
  at: string;
  ok: boolean;
  message: string;
}

export interface SsoConfig {
  provider: SsoProvider;
  /** Metadata URL, or the three values entered by hand. */
  metadataUrl: string;
  idpSsoUrl: string;
  idpEntityId: string;
  certificate: string;
  domain: string;
  domainToken: string;
  domainVerifiedAt: string | null;
  lastTest: SsoTest | null;
  status: SsoStatus;
  /** Everyone with an @domain email must use SSO (the Owner keeps a password + two-step way in). */
  requireSso: boolean;
  /** Role for people who sign in through SSO for the first time without an invite. */
  joinRole: Role;
  autoJoin: boolean;
  updatedAt: string;
}

export const ssoKey = (workspaceId: string) => `kubicu.sso.${workspaceId}`;
const INDEX_KEY = 'kubicu.sso.index';

export const emptySso = (): SsoConfig => ({
  provider: 'google',
  metadataUrl: '',
  idpSsoUrl: '',
  idpEntityId: '',
  certificate: '',
  domain: '',
  domainToken: Math.random().toString(36).slice(2, 12),
  domainVerifiedAt: null,
  lastTest: null,
  status: 'draft',
  requireSso: false,
  joinRole: 'viewer',
  autoJoin: false,
  updatedAt: new Date().toISOString()
});

export const providerInfo: Record<SsoProvider, {label: string;detail: string;where: string;}> = {
  google: { label: 'Google Workspace', detail: 'Admin console → Apps → Web and mobile apps', where: 'In Google Admin, add a custom SAML app and paste the two KUBICU values below.' },
  microsoft: { label: 'Microsoft Entra ID', detail: 'Formerly Azure AD', where: 'In Entra, create an Enterprise application (non-gallery) and set up SAML single sign-on.' },
  okta: { label: 'Okta', detail: 'Applications → Create App Integration', where: 'In Okta, create a SAML 2.0 app integration and paste the two KUBICU values below.' },
  saml: { label: 'Other (SAML 2.0)', detail: 'Any SAML 2.0 identity provider', where: 'Create a SAML 2.0 application in your identity provider and paste the two KUBICU values below.' }
};

export const spValues = (workspaceId: string) => ({
  acsUrl: `https://auth.kub.icu/sso/${workspaceId}/acs`,
  entityId: `https://auth.kub.icu/sso/${workspaceId}`
});

/** Free email providers can't be claimed for company sign-in. */
const PUBLIC_DOMAINS = ['gmail.com', 'yahoo.com', 'yahoo.co.uk', 'outlook.com', 'hotmail.com', 'live.com', 'icloud.com', 'aol.com', 'proton.me', 'protonmail.com', 'ymail.com'];

export function domainError(domain: string): string {
  const d = domain.trim().toLowerCase();
  if (!d) return 'Enter your company’s email domain';
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)) return 'Enter just the domain, e.g. adunniatelier.com';
  if (PUBLIC_DOMAINS.includes(d)) return 'Free email domains like this can’t be used — use your company’s own domain';
  return '';
}

export function idpErrors(c: SsoConfig): {metadataUrl: string;idpSsoUrl: string;idpEntityId: string;certificate: string;} {
  const https = (v: string) => /^https:\/\/[^\s]+\.[^\s]+/.test(v.trim());
  const usingMetadata = !!c.metadataUrl.trim();
  return {
    metadataUrl: usingMetadata && !https(c.metadataUrl) ? 'Must start with https://' : '',
    idpSsoUrl: usingMetadata ? '' : !c.idpSsoUrl.trim() ? 'Paste the sign-in URL, or use a metadata URL instead' : !https(c.idpSsoUrl) ? 'Must start with https://' : '',
    idpEntityId: usingMetadata ? '' : c.idpEntityId.trim() ? '' : 'Paste the issuer / entity ID',
    certificate: usingMetadata ? '' : !c.certificate.trim() ? 'Paste the signing certificate' : !/-----BEGIN CERTIFICATE-----[\s\S]+-----END CERTIFICATE-----/.test(c.certificate.trim()) ? 'Paste the whole certificate, including the BEGIN and END lines' : ''
  };
}

export const idpComplete = (c: SsoConfig) => !Object.values(idpErrors(c)).some(Boolean);

/** Short fingerprint shown instead of the whole certificate. */
export function certFingerprint(cert: string): string {
  let h = 0;
  for (const ch of cert.replace(/\s/g, '')) h = h * 31 + ch.charCodeAt(0) >>> 0;
  const hex = h.toString(16).toUpperCase().padStart(8, '0');
  return `${hex.slice(0, 2)}:${hex.slice(2, 4)}:${hex.slice(4, 6)}:${hex.slice(6, 8)}`;
}

interface IndexEntry {
  workspaceId: string;
  workspaceName: string;
  provider: SsoProvider;
  requireSso: boolean;
}

function readIndex(): Record<string, IndexEntry> {
  try {
    return JSON.parse(window.localStorage.getItem(INDEX_KEY) ?? '{}') as Record<string, IndexEntry>;
  } catch {
    return {};
  }
}

/** Keeps the sign-in page's domain lookup in step with each workspace's SSO status. */
export function syncSsoIndex(workspaceId: string, workspaceName: string, c: SsoConfig): void {
  const idx = readIndex();
  for (const [d, e] of Object.entries(idx)) if (e.workspaceId === workspaceId) delete idx[d];
  if (c.status === 'on' && c.domainVerifiedAt && c.domain) idx[c.domain.toLowerCase()] = { workspaceId, workspaceName, provider: c.provider, requireSso: c.requireSso };
  try {
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
  } catch {

    /* storage full */}
}

export function ssoForEmail(email: string): IndexEntry | null {
  const domain = email.trim().toLowerCase().split('@')[1];
  if (!domain) return null;
  return readIndex()[domain] ?? null;
}