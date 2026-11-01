import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2Icon, PlugIcon, SendIcon, XCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { categoryInfo, providerById, providersIn, type ProviderCategory, type ProviderDef } from '../../data/providers';
import { useProviders, maskSecret } from '../../hooks/useProviders';
import { useCan } from '../../contexts/TeamContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { checkStorage, sendTestMessage, testConnection, type SimulatedOutcome } from '../../utils/providers/adapters';
import { formatRelative } from '../../utils/format';
import { isValidEmail, isValidPhone } from '../../utils/validation';
import { phonePlaceholder } from '../../utils/phone';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { TextInput } from '../ui/TextInput';
import { InlineAlert } from '../ui/InlineAlert';
import { Card } from '../ui/layout/Card';
import { Section } from '../ui/layout/Section';
import { List } from '../ui/layout/ListRow';
import { ProviderConnectDialog } from './integrations/ProviderConnectDialog';
import { AccountingSection } from './integrations/AccountingSection';
import { ErpSection } from './integrations/ErpSection';
import { useT } from '../../contexts/LocaleContext';

const order: ProviderCategory[] = ['email', 'sms', 'whatsapp', 'dns', 'storage'];

/** Settings → Integrations (D192): outside services for messages, domains and file storage. Payments live in Commerce → Payments. */
export function IntegrationsTab() {
  const { t: tr } = useT();
  const p = useProviders();
  const can = useCan('extensions.manage');
  const { data: commerce } = useCommerce();
  const [connecting, setConnecting] = useState<ProviderDef | null>(null);
  const [testing, setTesting] = useState<ProviderDef | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const payment = providerById(commerce.payments.provider);

  const runCheck = async (def: ProviderDef) => {
    setBusy(def.id);
    const outcome: SimulatedOutcome = 'success';
    const r = def.category === 'storage' ? await checkStorage(def, outcome) : await testConnection(def, outcome);
    setBusy(null);
    p.recordTest(def.id, r.ok, r.message);
    p.log(def.id, 'Check', r.ok, r.message);
    toast(tr(r.ok ? '{name} is working' : '{name} check failed', { name: def.name }), { description: r.message });
  };

  return (
    <div className="flex flex-col gap-10">
      <p className="max-w-2xl text-label text-fg-muted">
        {tr('Connect the services KUBICU uses to send messages, set up domains and store files. Every connection here is a placeholder: keys are checked for the right format and calls are simulated — nothing reaches the provider.')}
      </p>
      {!can.allowed && <InlineAlert tone="info" title="View only">{can.reason ?? tr('Only Owners and Admins can connect services.')}</InlineAlert>}

      <Section id="int-payments" title={categoryInfo.payments.label} description={categoryInfo.payments.description}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
          <p className="text-label text-fg">
            {payment ?
            <>
                <span className="font-semibold">{payment.name}</span> <span className="text-fg-subtle">· {tr('connected in test mode')}</span>
              </> :

            <span className="text-fg-muted">{tr('No payment provider yet — Paystack, Flutterwave, Monnify or Stripe.')}</span>
            }
          </p>
          <Link to="/app/commerce/payments" className="text-label font-medium text-action hover:underline">
            {tr(payment ? 'Manage in Commerce → Payments' : 'Connect in Commerce → Payments')}
          </Link>
        </div>
      </Section>

      {order.map((c) => {
        const list = providersIn(c);
        const active = p.active(c);
        const connectedCount = list.filter((d) => p.connected(d.id)).length;
        return (
          <Section key={c} id={`int-${c}`} title={categoryInfo[c].label} description={categoryInfo[c].description}>
            <Card as="div" body="flush">
              <List label={categoryInfo[c].label}>
                {list.map((def) => {
                  const conn = p.data.connections[def.id];
                  const on = p.connected(def.id);
                  const isActive = active?.id === def.id;
                  const firstKey = def.fields[0] ? conn?.values[def.fields[0].key] : '';
                  return (
                    <li key={def.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:gap-6 md:px-6">
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2">
                          <span className="text-label font-semibold text-fg">{def.name}</span>
                          {def.builtIn ? <Badge tone="neutral">Built in</Badge> : on ? <Badge tone="success" dot>Connected · test</Badge> : null}
                          {on && isActive && connectedCount > 1 && <Badge tone="action">In use</Badge>}
                        </p>
                        <p className="mt-0.5 text-caption text-fg-muted">{tr(def.blurb)}</p>
                        {conn &&
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-caption text-fg-subtle">
                            {firstKey && <span className="font-mono">{def.fields[0].secret ? maskSecret(firstKey) : firstKey}</span>}
                            {conn.lastTest &&
                          <span className="inline-flex items-center gap-1">
                                {conn.lastTest.ok ? <CheckCircle2Icon size={12} className="text-success" aria-hidden /> : <XCircleIcon size={12} className="text-danger" aria-hidden />}
                                {tr(conn.lastTest.ok ? 'Checked' : 'Failed')} {formatRelative(conn.lastTest.at)}
                              </span>
                          }
                          </p>
                        }
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {on && !isActive &&
                        <Button size="sm" variant="tertiary" disabled={!can.allowed} onClick={() => p.setDefault(c, def.id)}>
                            Use this one
                          </Button>
                        }
                        {on && (c === 'email' || c === 'sms' || c === 'whatsapp') &&
                        <Button size="sm" variant="secondary" leadingIcon={SendIcon} disabled={!can.allowed} onClick={() => setTesting(def)}>
                            Send a test
                          </Button>
                        }
                        {on && (c === 'dns' || c === 'storage') &&
                        <Button size="sm" variant="secondary" loading={busy === def.id} disabled={!can.allowed} onClick={() => runCheck(def)}>
                            Check
                          </Button>
                        }
                        {def.builtIn ? null : on ?
                        <Button
                          size="sm"
                          variant="tertiary"
                          disabled={!can.allowed}
                          onClick={() => {
                            p.disconnect(def.id);
                            p.log(def.id, 'Disconnect', true, 'Keys removed from this browser.');
                            toast(tr('{provider} disconnected', { provider: def.name }), { description: tr('Its keys were removed from this browser.') });
                          }}>
                          
                            Disconnect
                          </Button> :

                        <Button size="sm" variant="secondary" leadingIcon={PlugIcon} disabled={!can.allowed} onClick={() => setConnecting(def)}>
                            Connect
                          </Button>
                        }
                      </div>
                    </li>);

                })}
              </List>
            </Card>
            {c === 'storage' && active?.id !== 'browser' &&
            <p className="text-caption text-fg-subtle">{tr('New uploads would go to {name}. In the prototype, files still stay in this browser.', { name: active?.name ?? '' })}</p>
            }
            {c === 'dns' && <p className="text-caption text-fg-subtle">{tr('When you connect a domain bought from one of these, Domains offers to add the records for you.')}</p>}
          </Section>);

      })}

      <AccountingSection canManage={can.allowed} />
      <ErpSection canManage={can.allowed} />

      {p.data.log.length > 0 &&
      <Section id="int-log" title="Recent activity" description="Connections, checks and test messages on this device.">
          <List ruled label="Recent integration activity">
            {p.data.log.slice(0, 10).map((e) =>
          <li key={e.id} className="flex min-h-[48px] flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <span className="min-w-0 flex-1 text-label text-fg">
                  {providerById(e.providerId)?.name ?? e.providerId} · {e.action}
                  <span className="block truncate text-caption text-fg-subtle">{e.detail}</span>
                </span>
                <Badge tone={e.ok ? 'success' : 'danger'}>{e.ok ? 'OK' : 'Failed'}</Badge>
                <span className="text-caption text-fg-subtle">{formatRelative(e.at)}</span>
              </li>
          )}
          </List>
        </Section>
      }

      <ProviderConnectDialog def={connecting} onClose={() => setConnecting(null)} />
      <SendTestDialog def={testing} onClose={() => setTesting(null)} />
    </div>);

}

function SendTestDialog({ def, onClose }: {def: ProviderDef | null;onClose: () => void;}) {
  const { t: tr } = useT();
  const p = useProviders();
  const [to, setTo] = useState('');
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const isEmail = def?.category === 'email';
  const error = !to.trim() ? isEmail ? 'Enter an email address.' : 'Enter a phone number.' : isEmail ? isValidEmail(to) ? '' : 'Enter a valid email address.' : isValidPhone(to) ? '' : `Enter a phone number, e.g. ${phonePlaceholder()}.`;

  const send = async () => {
    if (!def) return;
    setTried(true);
    if (error) return;
    setSending(true);
    const r = await sendTestMessage(def, to.trim(), 'success');
    setSending(false);
    p.log(def.id, 'Test message', r.ok, r.message);
    toast(tr(r.ok ? 'Test sent (simulated)' : 'Test failed'), { description: r.message });
    setTo('');
    setTried(false);
    onClose();
  };

  return (
    <Dialog
      open={!!def}
      onClose={onClose}
      size="sm"
      title={def ? tr('Send a test with {name}', { name: def.name }) : 'Send a test'}
      description="Nothing is delivered in the prototype — this checks the flow and logs the result."
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={send} loading={sending}>
            Send test
          </Button>
        </>
      }>
      
      <TextInput id="prov-test-to" label={isEmail ? 'Send to (email)' : 'Send to (phone)'} inputMode={isEmail ? 'email' : 'tel'} value={to} onChange={(e) => setTo(e.target.value)} error={tried ? error || undefined : undefined} />
    </Dialog>);

}