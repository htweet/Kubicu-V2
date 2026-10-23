import React, { useState } from 'react';
import { CheckCircle2Icon, LockIcon, PlugIcon, XCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentProviderId } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { paymentProviders } from '../../data/commerceNav';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { TextInput } from '../../components/ui/TextInput';
import { Segmented } from '../../components/ui/Segmented';
import { Field } from '../../components/ui/Field';
import { IllustrativeTag } from '../../components/ui/IllustrativeTag';
import { TestModeStrip } from '../../components/commerce/TestModeStrip';
import { PaymentMethodsSection } from '../../components/money/PaymentMethodsSection';
import { Card } from '../../components/ui/layout/Card';
import { PageStack, Section } from '../../components/ui/layout/Section';
import { formatTimestamp } from '../../utils/format';
import { cn } from '../../utils/cn';

type ConnectState = 'form' | 'connecting' | 'success' | 'error';

export function Payments() {
  const { data, apply } = useCommerce();
  const [connecting, setConnecting] = useState<PaymentProviderId | null>(null);
  const [state, setState] = useState<ConnectState>('form');
  const [business, setBusiness] = useState('');
  const [simulate, setSimulate] = useState<'success' | 'error'>('success');
  const provider = paymentProviders.find((p) => p.id === data.payments.provider);

  const startConnect = (id: PaymentProviderId) => {
    setConnecting(id);
    setState('form');
    setBusiness(data.payments.businessName);
  };

  const connect = () => {
    if (!business.trim() || !connecting) return;
    setState('connecting');
    window.setTimeout(() => {
      if (simulate === 'error') return setState('error');
      const p = paymentProviders.find((x) => x.id === connecting)!;
      if (apply((d) => ({ ...d, payments: { ...d.payments, provider: p.id, connectedAt: new Date().toISOString(), businessName: business.trim(), methods: p.methods } }))) setState('success');
    }, 900);
  };

  const disconnect = () => {
    if (apply((d) => ({ ...d, payments: { ...d.payments, provider: null, connectedAt: null } }))) toast('Provider disconnected (prototype)');
  };

  const target = paymentProviders.find((p) => p.id === connecting);

  return (
    <>
      <PageHeader title="Payments" description="How customers pay, and where the money goes: straight to your bank, into your wallet, or through escrow." />
      <TestModeStrip className="mt-6" />

      <PageStack>
      <PaymentMethodsSection />
      <Section id="provider" title={<span className="flex items-center gap-2">Payment provider <IllustrativeTag note="Provider names and methods are illustrative. KUBICU hasn’t chosen or integrated a provider yet." /></span>} description={provider ? `One provider at a time. Disconnect ${provider.name} to switch.` : 'Connect one provider. Methods depend on the provider, your account and eligibility.'}>
        <ul className="grid gap-6 md:grid-cols-2">
          {paymentProviders.map((p) => {
              const connected = data.payments.provider === p.id;
              return (
                <li key={p.id} className={cn('flex h-full flex-col rounded-lg border bg-raised p-5 md:p-6', connected ? 'border-success shadow-1' : 'border-line')}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-heading font-semibold text-fg">{p.name}</p>
                  {connected ? <Badge tone="success" dot>Connected · test</Badge> : <Badge tone="neutral">Not connected</Badge>}
                </div>
                <p className="mt-2 text-label text-fg-muted">{p.blurb}</p>
                <div className="mb-5 mt-4 flex flex-wrap gap-1.5">
                  {p.methods.map((m) =>
                    <span key={m} className="rounded-full bg-sunken px-2.5 py-1 text-caption font-medium text-fg-muted">
                      {m}
                    </span>
                    )}
                </div>
                <div className="mt-auto border-t border-line pt-4">
                  {connected ?
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-caption text-fg-subtle">
                        {data.payments.businessName} · since {data.payments.connectedAt ? formatTimestamp(data.payments.connectedAt) : '—'}
                      </span>
                      <Button size="sm" variant="tertiary" onClick={disconnect}>
                        Disconnect
                      </Button>
                    </div> :

                    <Button variant="secondary" leadingIcon={PlugIcon} onClick={() => startConnect(p.id)} disabled={!!provider}>
                      Connect {p.name}
                    </Button>
                    }
                </div>
              </li>);

            })}
        </ul>
      </Section>

      <Card id="mode" title="Checkout mode" description="Test mode lets you try every payment outcome. Live mode needs a verified provider account and isn’t available in this prototype." actions={
        <div className="flex items-center gap-3">
          <Segmented ariaLabel="Checkout mode" value="test" onChange={() => toast('Live mode is locked in the prototype', { description: 'It opens once a provider is integrated and your business is verified.' })} options={[{ value: 'test', label: 'Test' }, { value: 'live', label: 'Live' }]} />
          <LockIcon size={15} className="text-fg-subtle" aria-label="Live mode locked" />
        </div>
        } />

      <Card id="refund-fees" title={<span className="flex items-center gap-2">Fees when you refund <IllustrativeTag note="Policy recommended for launch; confirm the provider’s refund-fee terms before going live." /></span>}>
        <dl className="grid gap-x-6 gap-y-4 md:grid-cols-3 md:divide-x md:divide-line [&>div]:md:pl-6 [&>div:first-child]:md:pl-0">
          <div>
            <dt className="text-label font-medium text-fg">Your customer</dt>
            <dd className="mt-1 text-caption text-fg-muted">Always gets back exactly what they paid. Fees are never deducted from a refund.</dd>
          </div>
          <div>
            <dt className="text-label font-medium text-fg">KUBICU fee</dt>
            <dd className="mt-1 text-caption text-fg-muted">Returned to you on full refunds, and waived automatically on group buys that miss their goal.</dd>
          </div>
          <div>
            <dt className="text-label font-medium text-fg">Provider fee</dt>
            <dd className="mt-1 text-caption text-fg-muted">Most providers keep their processing fee when a payment is refunded, so it stays a cost to you. Reports show it on its own line.</dd>
          </div>
        </dl>
      </Card>
      </PageStack>

      <Dialog
        open={!!connecting}
        onClose={() => setConnecting(null)}
        title={state === 'success' ? `${target?.name} connected` : state === 'error' ? 'Couldn’t connect' : `Connect ${target?.name ?? ''}`}
        description={state === 'form' ? 'In the live product you’d sign in to the provider and authorise KUBICU. Here we simulate it.' : undefined}
        footer={
        state === 'success' || state === 'error' ?
        <>
              {state === 'error' &&
          <Button variant="secondary" onClick={() => setState('form')}>
                  Try again
                </Button>
          }
              <Button onClick={() => setConnecting(null)}>Done</Button>
            </> :

        <>
              <Button variant="secondary" onClick={() => setConnecting(null)}>
                Cancel
              </Button>
              <Button onClick={connect} loading={state === 'connecting'} disabled={!business.trim()}>
                Connect
              </Button>
            </>

        }>
        
        {state === 'success' ?
        <p className="flex items-start gap-2 text-label text-fg-muted">
            <CheckCircle2Icon size={18} className="mt-0.5 shrink-0 text-success" aria-hidden />
            Test-mode connection ready. Checkout on your page now shows {target?.methods.join(', ')}. No secret keys are stored — the live product never shows them either.
          </p> :
        state === 'error' ?
        <p className="flex items-start gap-2 text-label text-fg-muted">
            <XCircleIcon size={18} className="mt-0.5 shrink-0 text-danger" aria-hidden />
            The provider didn’t accept the connection (simulated). Common causes: business not yet verified, or the authorisation window was closed. Nothing was changed.
          </p> :

        <div className="flex flex-col gap-4">
            <TextInput id="pay-business" label="Registered business name" value={business} placeholder="As it appears on your CAC certificate" onChange={(e) => setBusiness(e.target.value)} />
            <Field id="pay-sim" label="Prototype: simulate the result">
              <Segmented ariaLabel="Simulated result" value={simulate} onChange={setSimulate} options={[{ value: 'success', label: 'Success' }, { value: 'error', label: 'Error' }]} />
            </Field>
          </div>
        }
      </Dialog>
    </>);

}