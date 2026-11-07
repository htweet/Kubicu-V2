import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon, CopyIcon, KeyRoundIcon, LockIcon, PlayIcon, PowerIcon, ShieldCheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import { useLocalStore } from '../../hooks/useLocalStore';
import { roleInfo } from '../../data/permissions';
import type { Role } from '../../types/team';
import { certFingerprint, domainError, emptySso, idpComplete, idpErrors, providerInfo, spValues, ssoKey, syncSsoIndex, type SsoConfig, type SsoProvider } from '../../utils/sso';
import { formatRelative } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { InlineAlert } from '../ui/InlineAlert';
import { SelectInput } from '../ui/SelectInput';
import { Switch } from '../ui/Switch';
import { TextArea } from '../ui/TextArea';
import { TextInput } from '../ui/TextInput';
import { UpgradeButton } from '../ui/UpgradeButton';
import { Card } from '../ui/layout/Card';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

type TestOutcome = 'success' | 'cert' | 'unassigned';
const testMessages: Record<TestOutcome, string> = {
  success: 'Signed in as your test account. Name and email came through correctly.',
  cert: 'The response was signed with a different certificate. Paste the current signing certificate from your identity provider.',
  unassigned: 'Your identity provider said this person isn’t assigned to the KUBICU app. Assign them (or a group) and try again.',
};

/** Settings → Single sign-on (Enterprise): connect an identity provider, verify the domain, test, then turn on (D115). */
export function SsoTab() {
  const { t: tr } = useT();
  const { current } = useWorkspace();
  const team = useTeam();
  const can = useCan('team.manage');
  const { data: c, update } = useLocalStore(ssoKey(current.id), emptySso);
  const [tried, setTried] = useState(false);
  const [checking, setChecking] = useState(false);
  const [testing, setTesting] = useState(false);
  const [outcome, setOutcome] = useState<TestOutcome>('success');

  useEffect(() => syncSsoIndex(current.id, current.name, c), [current.id, current.name, c]);

  if (current.plan !== 'enterprise')
    return (
      <div className="flex max-w-2xl flex-col gap-5">
        <div className="flex items-start gap-3">
          <LockIcon size={20} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />
          <div>
            <h2 className="text-heading font-semibold text-fg">{tr('Single sign-on is on Enterprise')}</h2>
            <p className="mt-1 text-label text-fg-muted">{tr('Let your team sign in with their Google Workspace, Microsoft or Okta work account. When someone leaves your company, removing them there removes their access here.')}</p>
          </div>
        </div>
        <ul className="flex flex-col divide-y divide-line border-y border-line text-label text-fg">
          {['Works with Google Workspace, Microsoft Entra ID, Okta and any SAML 2.0 provider', 'Require it for everyone on your company domain', 'New staff can join automatically with a role you choose', 'The Owner can always get in with password and two-step sign-in'].map((t) => (
            <li key={t} className="flex items-center gap-2.5 py-2.5">
              <CheckCircle2Icon size={15} className="shrink-0 text-success" aria-hidden />
              {tr(t)}
            </li>
          ))}
        </ul>
        <div>
          <UpgradeButton plan="enterprise" feature="Single sign-on (SSO)" variant="primary" />
        </div>
      </div>
    );

  const set = (patch: Partial<SsoConfig>) => update((d) => ({ ...d, ...patch, updatedAt: new Date().toISOString() }));
  const readOnly = !can.allowed;
  const sp = spValues(current.id);
  const errs = idpErrors(c);
  const dErr = domainError(c.domain);
  const idpOk = idpComplete(c);
  const tested = !!c.lastTest?.ok;
  const ready = idpOk && !!c.domainVerifiedAt && tested;
  const steps = [idpOk, !!c.domainVerifiedAt, tested, c.status === 'on'];

  const copy = (v: string, label: string) => {
    void navigator.clipboard?.writeText(v);
    toast.success(tr('{label} copied', { label: tr(label) }));
  };

  const checkDomain = () => {
    setTried(true);
    if (dErr) return;
    setChecking(true);
    window.setTimeout(() => {
      setChecking(false);
      set({ domainVerifiedAt: new Date().toISOString(), domain: c.domain.trim().toLowerCase() });
      team.log('settings', `verified ${c.domain.trim().toLowerCase()} for single sign-on`, '/app/settings/sso');
      toast.success(tr('Domain verified'), { description: tr('We found the TXT record. You can remove it later — we check it again every 30 days.') });
    }, 900);
  };

  const runTest = () => {
    if (!idpOk || !c.domainVerifiedAt) return;
    setTesting(true);
    window.setTimeout(() => {
      setTesting(false);
      const ok = outcome === 'success';
      set({ lastTest: { at: new Date().toISOString(), ok, message: testMessages[outcome] } });
      if (ok) toast.success(tr('Test sign-in worked'));
      else toast.error(tr('Test sign-in failed'), { description: tr(testMessages[outcome]) });
    }, 1100);
  };

  const turn = (on: boolean) => {
    set({ status: on ? 'on' : 'off', requireSso: on ? c.requireSso : false });
    team.log('settings', on ? `turned on single sign-on with ${providerInfo[c.provider].label}` : 'turned off single sign-on', '/app/settings/sso');
    toast.success(tr(on ? 'Single sign-on is on' : 'Single sign-on is off'), { description: on ? tr('People with an @{domain} email can now sign in with {provider}.', { domain: c.domain, provider: providerInfo[c.provider].label }) : tr('Everyone signs in with their password again.') });
  };

  // Changing the provider details after a test means testing again.
  const setIdp = (patch: Partial<SsoConfig>) => set({ ...patch, lastTest: null });

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex min-w-0 flex-col gap-10">
        <div className={cn('flex flex-wrap items-center justify-between gap-4 rounded-lg border px-5 py-4 md:px-6', c.status === 'on' ? 'border-transparent bg-success-soft' : 'border-line bg-raised')}>
          <div className="flex items-start gap-3">
            <ShieldCheckIcon size={20} className={cn('mt-0.5 shrink-0', c.status === 'on' ? 'text-success' : 'text-fg-subtle')} aria-hidden />
            <div>
              <p className="text-label font-semibold text-fg">{c.status === 'on' ? `${tr('On')} · ${providerInfo[c.provider].label}` : tr(c.status === 'off' ? 'Turned off' : 'Not set up yet')}</p>
              <p className="text-caption text-fg-muted">
                {c.status === 'on' ? `@${c.domain} · ${tr(c.requireSso ? 'required for everyone' : 'optional — passwords still work')}` : tr('Finish the steps below, then turn it on.')}
              </p>
            </div>
          </div>
          {c.status === 'on' ? (
            <Button variant="secondary" leadingIcon={PowerIcon} disabled={readOnly} onClick={() => turn(false)}>
              Turn off
            </Button>
          ) : (
            <Button leadingIcon={PowerIcon} disabled={readOnly || !ready} title={ready ? undefined : tr('Finish steps 1–3 first')} onClick={() => turn(true)}>
              Turn on
            </Button>
          )}
        </div>
        {readOnly && <p className="-mt-6 text-caption text-fg-muted">{can.reason}</p>}

        <Step n={1} done={idpOk} title="Connect your identity provider">
          <fieldset disabled={readOnly} className="flex flex-col gap-5">
            <legend className="sr-only">Identity provider</legend>
            <div role="radiogroup" aria-label="Identity provider" className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(providerInfo) as SsoProvider[]).map((p) => (
                <label key={p} className={cn('flex cursor-pointer flex-col rounded-lg border p-3 focus-within:ring-2 focus-within:ring-focus', c.provider === p ? 'border-action bg-action-soft' : 'border-line bg-raised hover:border-line-strong')}>
                  <input type="radio" name="sso-provider" className="sr-only" checked={c.provider === p} onChange={() => setIdp({ provider: p })} />
                  <span className="text-label font-semibold text-fg">{providerInfo[p].label}</span>
                  <span className="text-caption text-fg-muted">{tr(providerInfo[p].detail)}</span>
                </label>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-label text-fg-muted">{tr(providerInfo[c.provider].where)}</p>
              <dl className="flex flex-col divide-y divide-line rounded-md border border-line bg-sunken">
                {[
                  ['Reply URL (ACS URL)', sp.acsUrl],
                  ['Entity ID (Audience)', sp.entityId],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <dt className="text-caption text-fg-subtle">{tr(k)}</dt>
                      <dd className="truncate font-mono text-caption text-fg">{v}</dd>
                    </div>
                    <Button size="sm" variant="tertiary" leadingIcon={CopyIcon} onClick={() => copy(v, k)}>
                      Copy
                    </Button>
                  </div>
                ))}
              </dl>
              <p className="text-caption text-fg-subtle">{tr('Send name and email as attributes. Email must match the address people are invited with.')}</p>
            </div>
            <TextInput id="sso-meta" label="Metadata URL" optional placeholder="https://…/metadata.xml" value={c.metadataUrl} error={tried ? errs.metadataUrl || undefined : undefined} onChange={(e) => setIdp({ metadataUrl: e.target.value })} hint="Easiest — paste it and we read the rest. Or fill in the three fields below." />
            {!c.metadataUrl.trim() && (
              <div className="flex flex-col gap-4 border-l-2 border-line pl-4">
                <TextInput id="sso-url" label="Sign-in URL (SSO URL)" placeholder="https://accounts.google.com/o/saml2/idp?idpid=…" value={c.idpSsoUrl} error={tried ? errs.idpSsoUrl || undefined : undefined} onChange={(e) => setIdp({ idpSsoUrl: e.target.value })} />
                <TextInput id="sso-entity" label="Issuer / Entity ID" value={c.idpEntityId} error={tried ? errs.idpEntityId || undefined : undefined} onChange={(e) => setIdp({ idpEntityId: e.target.value })} />
                <TextArea id="sso-cert" label="Signing certificate" rows={4} className="font-mono text-caption" placeholder={'-----BEGIN CERTIFICATE-----\n…\n-----END CERTIFICATE-----'} value={c.certificate} error={tried ? errs.certificate || undefined : undefined} onChange={(e) => setIdp({ certificate: e.target.value })} hint={!errs.certificate && c.certificate ? `${tr('Fingerprint')} ${certFingerprint(c.certificate)}` : undefined} />
              </div>
            )}
            {!idpOk && (
              <Button variant="secondary" className="self-start" onClick={() => setTried(true)}>
                Check details
              </Button>
            )}
          </fieldset>
        </Step>

        <Step n={2} done={!!c.domainVerifiedAt} title="Verify your email domain">
          <fieldset disabled={readOnly} className="flex flex-col gap-4">
            <legend className="sr-only">Domain</legend>
            <TextInput id="sso-domain" label="Company email domain" placeholder="adunniatelier.com" value={c.domain} disabled={!!c.domainVerifiedAt} error={tried && !c.domainVerifiedAt ? dErr || undefined : undefined} onChange={(e) => set({ domain: e.target.value })} />
            {c.domainVerifiedAt ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge tone="success" icon={CheckCircle2Icon}>
                  {tr('Verified')} {formatRelative(c.domainVerifiedAt)}
                </Badge>
                <Button size="sm" variant="tertiary" onClick={() => set({ domainVerifiedAt: null, status: c.status === 'on' ? 'off' : c.status, lastTest: null })}>
                  Change domain
                </Button>
              </div>
            ) : (
              <>
                <p className="text-label text-fg-muted">{tr('Add this TXT record where your domain is managed (e.g. Whogohost, Qservers, GoDaddy or Cloudflare), then check. It can take up to an hour to show.')}</p>
                <dl className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-md border border-line bg-sunken px-3 py-2.5 text-caption">
                  <dt className="text-fg-subtle">Type</dt>
                  <dd className="font-mono text-fg">TXT</dd>
                  <span />
                  <dt className="text-fg-subtle">Name</dt>
                  <dd className="font-mono text-fg">@</dd>
                  <span />
                  <dt className="text-fg-subtle">Value</dt>
                  <dd className="truncate font-mono text-fg">kubicu-sso={c.domainToken}</dd>
                  <Button size="sm" variant="tertiary" leadingIcon={CopyIcon} onClick={() => copy(`kubicu-sso=${c.domainToken}`, 'TXT value')}>
                    Copy
                  </Button>
                </dl>
                <Button variant="secondary" className="self-start" loading={checking} onClick={checkDomain}>
                  Check now
                </Button>
              </>
            )}
          </fieldset>
        </Step>

        <Step n={3} done={tested} title="Test a sign-in">
          <div className="flex flex-col gap-4">
            <p className="text-label text-fg-muted">{tr('Sign in once through {provider} before anyone else does. This doesn’t change how your team signs in.', { provider: providerInfo[c.provider].label })}</p>
            <fieldset disabled={readOnly || !idpOk || !c.domainVerifiedAt} className="rounded-md border border-dashed border-line-strong p-3 disabled:opacity-60">
              <legend className="px-1 text-caption font-medium text-fg-muted">{tr('Prototype — choose what the provider sends back')}</legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {(
                  [
                    ['success', 'Works'],
                    ['cert', 'Wrong certificate'],
                    ['unassigned', 'Person not assigned'],
                  ] as [TestOutcome, string][]
                ).map(([v, l]) => (
                  <label key={v} className="flex min-h-[32px] cursor-pointer items-center gap-2 text-label text-fg">
                    <input type="radio" name="sso-test" className="h-4 w-4 accent-[rgb(var(--action))]" checked={outcome === v} onChange={() => setOutcome(v)} />
                    {tr(l)}
                  </label>
                ))}
              </div>
            </fieldset>
            <Button variant="secondary" leadingIcon={PlayIcon} className="self-start" loading={testing} disabled={readOnly || !idpOk || !c.domainVerifiedAt} title={!idpOk || !c.domainVerifiedAt ? tr('Finish steps 1 and 2 first') : undefined} onClick={runTest}>
              Run test sign-in
            </Button>
            {c.lastTest && (
              <InlineAlert tone={c.lastTest.ok ? 'success' : 'danger'} title={c.lastTest.ok ? `${tr('Test passed')} ${formatRelative(c.lastTest.at)}` : 'Test failed'}>
                {tr(c.lastTest.message)}
              </InlineAlert>
            )}
          </div>
        </Step>

        <Step n={4} done={c.status === 'on'} title="Choose how your team signs in">
          <fieldset disabled={readOnly} className="flex flex-col gap-5">
            <legend className="sr-only">Sign-in rules</legend>
            <Switch id="sso-require" checked={c.requireSso} onChange={(v) => set({ requireSso: v })} label={tr('Require single sign-on for @{domain} emails', { domain: c.domain || tr('your domain') })} description="Passwords stop working for these people. Members with other emails (e.g. freelancers on Gmail) keep their password." />
            <Switch id="sso-join" checked={c.autoJoin} onChange={(v) => set({ autoJoin: v })} label="Let new staff join without an invite" description="Anyone your identity provider lets in joins this workspace — seats permitting." />
            {c.autoJoin && (
              <SelectInput<Role>
                id="sso-role"
                label="They join as"
                value={c.joinRole}
                options={(['viewer', 'sales', 'editor'] as Role[]).map((r) => ({ value: r, label: roleInfo[r].label }))}
                onChange={(r) => set({ joinRole: r })}
                hint="Start low — an Admin can raise it later."
              />
            )}
            <InlineAlert tone="info" title="The Owner can never be locked out">
              {tr('If your identity provider is down, the Owner can still sign in with their password and two-step code. Turn on two-step sign-in in Your account if you haven’t.')}
            </InlineAlert>
          </fieldset>
        </Step>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <Card id="sso-progress" as="div" icon={KeyRoundIcon} title="Progress">
          <ol className="flex flex-col gap-2.5">
            {['Identity provider', 'Domain verified', 'Test passed', 'Turned on'].map((l, i) => (
              <li key={l} className={cn('flex items-center gap-2 text-label', steps[i] ? 'text-fg' : 'text-fg-subtle')}>
                {steps[i] ? <CheckCircle2Icon size={15} className="text-success" aria-hidden /> : <span aria-hidden className="h-[15px] w-[15px] rounded-full border border-line-strong" />}
                {tr(l)}
                <span className="sr-only">— {tr(steps[i] ? 'done' : 'not yet')}</span>
              </li>
            ))}
          </ol>
        </Card>
        <p className="text-caption text-fg-subtle">{tr('Simulated: domain checks, test sign-ins and the provider redirect are stand-ins until a real sign-in service is connected.')}</p>
      </aside>
    </div>
  );
}

function Step({ n, title, done, children }: { n: number; title: string; done: boolean; children: React.ReactNode }) {
  const { t } = useT();
  title = t(title);
  return (
    <section aria-labelledby={`sso-step-${n}`} className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-4">
      <span aria-hidden className={cn('flex h-7 w-7 items-center justify-center rounded-full text-caption font-semibold', done ? 'bg-success text-white' : 'border border-line-strong text-fg-muted')}>
        {done ? <CheckCircle2Icon size={15} /> : n}
      </span>
      <div className="flex min-w-0 flex-col gap-4">
        <h2 id={`sso-step-${n}`} className="pt-0.5 text-heading font-semibold text-fg">
          {title}
          {done && <span className="sr-only"> — {t('done')}</span>}
        </h2>
        {children}
      </div>
    </section>
  );
}
