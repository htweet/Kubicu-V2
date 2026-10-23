import React, { useState } from 'react';
import { toast } from 'sonner';
import { KeyRoundIcon, LaptopIcon, LogOutIcon, ShieldCheckIcon, ShieldAlertIcon, SmartphoneIcon, RefreshCwIcon } from 'lucide-react';
import type { LoginProvider } from '../../types/account';
import { useAccount, updateAccount, formatAccountDate, newBackupCodes } from '../../utils/account/store';
import { formatRelative } from '../../utils/format';
import { Card } from '../ui/layout/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Switch } from '../ui/Switch';
import { Dialog } from '../ui/Dialog';
import { PasswordDialog } from './PasswordDialog';
import { TwoStepDialog } from './TwoStepDialog';

const providerLabel: Record<LoginProvider, string> = { google: 'Google', apple: 'Apple' };
const outcomeLabel = { ok: 'Signed in', wrong_password: 'Wrong password', blocked_two_step: 'Stopped at two-step' } as const;

/** Account → Sign-in & security (D80). Everything is simulated; no real credentials exist. */
export function SecurityTab() {
  const account = useAccount();
  const s = account.security;
  const [dialog, setDialog] = useState<'password' | 'twostep' | 'disable' | 'codes' | 'signout-all' | null>(null);
  const others = account.sessions.filter((x) => !x.current);
  const daysSincePw = Math.floor((Date.now() - Date.parse(s.passwordSetAt)) / 86400000);
  const on = s.twoStep !== 'none';

  const connect = (provider: LoginProvider) => {
    updateAccount((a) => ({ ...a, connected: [...a.connected, { provider, email: a.profile.email, connectedAt: new Date().toISOString() }] }));
    toast.success(`${providerLabel[provider]} connected`, { description: 'Prototype — no real account was linked.' });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card
        id="sec-status"
        emphasis="primary"
        title={
        <span className="flex items-center gap-2">
            {on ? <ShieldCheckIcon size={18} className="text-success" aria-hidden /> : <ShieldAlertIcon size={18} className="text-warning" aria-hidden />}
            {on ? 'Your account is well protected' : 'Add a second step to protect your account'}
          </span>
        }
        description={on ? `Two-step sign-in has been on since ${formatAccountDate(s.twoStepSince ?? s.passwordSetAt, account.prefs, false)}.` : 'Your workspaces hold orders, payouts and customer details. A password alone is easy to steal.'}
        body="flush">
        
        <ul className="divide-y divide-line">
          <Row
            icon={KeyRoundIcon}
            title="Password"
            meta={`Changed ${daysSincePw === 0 ? 'today' : `${daysSincePw} days ago`}`}
            action={
            <Button size="sm" variant="secondary" onClick={() => setDialog('password')}>
                Change
              </Button>
            } />
          
          <Row
            icon={SmartphoneIcon}
            title="Two-step sign-in"
            meta={on ? s.twoStep === 'app' ? 'Authenticator app' : `Text message to ${account.profile.phone}` : 'Off'}
            badge={on ? <Badge tone="success">On</Badge> : <Badge tone="warning">Off</Badge>}
            action={
            on ?
            <Button size="sm" variant="tertiary" onClick={() => setDialog('disable')}>
                  Turn off
                </Button> :

            <Button size="sm" onClick={() => setDialog('twostep')}>
                  Turn on
                </Button>

            } />
          
          {on &&
          <Row
            icon={RefreshCwIcon}
            title="Backup codes"
            meta={`${s.backupCodes.length} of 10 left · each works once`}
            badge={s.backupCodes.length <= 3 ? <Badge tone="warning">Running low</Badge> : undefined}
            action={
            <Button size="sm" variant="secondary" onClick={() => setDialog('codes')}>
                  Make new codes
                </Button>
            } />

          }
        </ul>
        <div className="border-t border-line px-5 py-4 md:px-6">
          <Switch id="sec-alerts" label="Email me about sign-ins from new devices" description="So you can act quickly if it wasn’t you." checked={s.signInAlerts} onChange={(signInAlerts) => updateAccount((a) => ({ ...a, security: { ...a.security, signInAlerts } }))} />
        </div>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card
          id="sec-sessions"
          title="Where you’re signed in"
          description={`${account.sessions.length} ${account.sessions.length === 1 ? 'device' : 'devices'}`}
          body="flush"
          actions={
          others.length > 0 &&
          <Button size="sm" variant="tertiary" onClick={() => setDialog('signout-all')}>
                Sign out others
              </Button>

          }>
          
          <ul className="divide-y divide-line">
            {account.sessions.map((x) =>
            <Row
              key={x.id}
              icon={/android|iphone|phone/i.test(x.device) ? SmartphoneIcon : LaptopIcon}
              title={`${x.device} · ${x.browser}`}
              meta={`${x.place} · ${x.current ? 'Active now' : formatRelative(x.lastActiveAt)}`}
              badge={x.current ? <Badge tone="info">This device</Badge> : undefined}
              action={
              !x.current &&
              <Button
                size="sm"
                variant="tertiary"
                leadingIcon={LogOutIcon}
                onClick={() => {
                  updateAccount((a) => ({ ...a, sessions: a.sessions.filter((y) => y.id !== x.id) }));
                  toast.success(`Signed out of ${x.device}`);
                }}>
                
                      Sign out
                    </Button>

              } />

            )}
          </ul>
        </Card>

        <Card id="sec-history" title="Recent sign-ins" description={`Times in ${account.prefs.timeZone.replace('_', ' ').split('/')[1]} time.`} body="flush">
          <ul className="divide-y divide-line">
            {account.signIns.map((e) =>
            <li key={e.id} className="flex items-center gap-3 px-5 py-3 md:px-6">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-label font-medium text-fg">{e.device}</span>
                  <span className="block truncate text-caption text-fg-subtle">
                    {e.place} · <span className="tabular-nums">{formatAccountDate(e.at, account.prefs)}</span>
                  </span>
                </span>
                <Badge tone={e.outcome === 'ok' ? 'neutral' : 'danger'}>{outcomeLabel[e.outcome]}</Badge>
              </li>
            )}
          </ul>
          <p className="border-t border-line px-5 py-3 text-caption text-fg-muted md:px-6">Don’t recognise one? Change your password and sign out of other devices.</p>
        </Card>
      </div>

      <Card id="sec-connected" title="Sign in with" description="Use another account instead of typing your password." body="flush">
        <ul className="divide-y divide-line">
          {(['google', 'apple'] as LoginProvider[]).map((p) => {
            const c = account.connected.find((x) => x.provider === p);
            return (
              <Row
                key={p}
                icon={KeyRoundIcon}
                title={providerLabel[p]}
                meta={c ? `${c.email} · connected ${formatAccountDate(c.connectedAt, account.prefs, false)}` : 'Not connected'}
                action={
                c ?
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={() => {
                    updateAccount((a) => ({ ...a, connected: a.connected.filter((x) => x.provider !== p) }));
                    toast(`${providerLabel[p]} disconnected`, { description: 'You can still sign in with your email and password.' });
                  }}>
                  
                      Disconnect
                    </Button> :

                <Button size="sm" variant="secondary" onClick={() => connect(p)}>
                      Connect
                    </Button>

                } />);


          })}
        </ul>
      </Card>

      <PasswordDialog open={dialog === 'password'} onClose={() => setDialog(null)} />
      <TwoStepDialog open={dialog === 'twostep'} onClose={() => setDialog(null)} />

      <Dialog
        open={dialog === 'disable'}
        onClose={() => setDialog(null)}
        size="sm"
        title="Turn off two-step sign-in?"
        description="Anyone with your password could then sign in to your account and every workspace you’re in."
        footer={
        <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Keep it on
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              updateAccount((a) => ({ ...a, security: { ...a.security, twoStep: 'none', twoStepSince: null, backupCodes: [] } }));
              toast('Two-step sign-in is off');
              setDialog(null);
            }}>
            
              Turn off
            </Button>
          </>
        } />
      

      <Dialog
        open={dialog === 'codes'}
        onClose={() => setDialog(null)}
        size="sm"
        title="Make new backup codes?"
        description="Your old codes stop working straight away. You’ll see the new ones once."
        footer={
        <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
            onClick={() => {
              const codes = newBackupCodes();
              updateAccount((a) => ({ ...a, security: { ...a.security, backupCodes: codes } }));
              navigator.clipboard?.writeText(codes.join('\n')).catch(() => undefined);
              toast.success('New codes made and copied', { description: codes.slice(0, 2).join(', ') + ' …' });
              setDialog(null);
            }}>
            
              Make and copy
            </Button>
          </>
        } />
      

      <Dialog
        open={dialog === 'signout-all'}
        onClose={() => setDialog(null)}
        size="sm"
        title={`Sign out of ${others.length} other ${others.length === 1 ? 'device' : 'devices'}?`}
        description="You’ll stay signed in here. Anyone on those devices will need your password again."
        footer={
        <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              updateAccount((a) => ({ ...a, sessions: a.sessions.filter((x) => x.current) }));
              toast.success('Signed out of other devices');
              setDialog(null);
            }}>
            
              Sign out others
            </Button>
          </>
        } />
      
    </div>);

}

function Row({ icon: Icon, title, meta, badge, action }: {icon: typeof KeyRoundIcon;title: string;meta: string;badge?: React.ReactNode;action?: React.ReactNode;}) {
  return (
    <li className="flex items-center gap-4 px-5 py-4 md:px-6">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted">
        <Icon size={17} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-label font-semibold text-fg">{title}</span>
          {badge}
        </span>
        <span className="block truncate text-caption text-fg-subtle">{meta}</span>
      </span>
      {action && <span className="shrink-0">{action}</span>}
    </li>);

}