import React, { useState } from 'react';
import { LockIcon, PlugIcon } from 'lucide-react';
import { providerById } from '../../data/providers';
import { maskSecret, useProviders } from '../../hooks/useProviders';
import { ProviderConnectDialog } from '../../components/settings/integrations/ProviderConnectDialog';
import { toast } from 'sonner';
import type { PaymentProviderId } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { paymentProviders } from '../../data/commerceNav';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TextInput } from '../../components/ui/TextInput';
import { Segmented } from '../../components/ui/Segmented';
import { IllustrativeTag } from '../../components/ui/IllustrativeTag';
import { TestModeStrip } from '../../components/commerce/TestModeStrip';
import { PaymentMethodsSection } from '../../components/money/PaymentMethodsSection';
import { Card } from '../../components/ui/layout/Card';
import { PageStack, Section } from '../../components/ui/layout/Section';
import { formatTimestamp } from '../../utils/format';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

export function Payments() {
  const { t: tr } = useT();
  const { data, apply } = useCommerce();
  const providers = useProviders();
  const [connecting, setConnecting] = useState<PaymentProviderId | null>(null);
  const [business, setBusiness] = useState('');
  const provider = paymentProviders.find((p) => p.id === data.payments.provider);

  const startConnect = (id: PaymentProviderId) => {
    setConnecting(id);
    setBusiness(data.payments.businessName);
  };

  // Keys are checked and stored by the shared provider dialog (D192); checkout reads the provider from Commerce.
  const onConnected = () => {
    const p = paymentProviders.find((x) => x.id === connecting);
    if (!p) return;
    apply((d) => ({ ...d, payments: { ...d.payments, provider: p.id, connectedAt: new Date().toISOString(), businessName: business.trim(), methods: p.methods } }));
  };

  const disconnect = () => {
    if (provider) providers.disconnect(provider.id);
    if (apply((d) => ({ ...d, payments: { ...d.payments, provider: null, connectedAt: null } }))) toast(tr('Provider disconnected'), { description: tr('Its test keys were removed from this browser.') });
  };

  const keys = provider ? providers.data.connections[provider.id]?.values : undefined;

  return (
    <>
      <PageHeader title={tr('Payments')} description={tr('How customers pay, and where the money goes: straight to your bank, into your wallet, or through escrow.')} />
      <TestModeStrip className="mt-6" />

      <PageStack>
      <PaymentMethodsSection />
      <Section id="provider" title={<span className="flex items-center gap-2">{tr('Payment provider')} <IllustrativeTag note={tr('Placeholder connections: test keys are format-checked and every payment is simulated. KUBICU hasn’t integrated a provider yet.')} /></span>} description={provider ? tr('One provider at a time. Disconnect {name} to switch.', { name: provider.name }) : tr('Connect one provider. Methods depend on the provider, your account and eligibility.')}>
        <ul className="grid gap-6 md:grid-cols-2">
          {paymentProviders.map((p) => {
              const connected = data.payments.provider === p.id;
              return (
                <li key={p.id} className="flex">
                <Card as="article" className={cn('w-full', connected && 'border-success shadow-1')}>
                <div className="flex h-full flex-col">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-heading font-semibold text-fg">{p.name}</p>
                  {connected ? <Badge tone="success" dot>{tr('Connected · test')}</Badge> : <Badge tone="neutral">{tr('Not connected')}</Badge>}
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
                        {data.payments.businessName} · {tr('since {date}', { date: data.payments.connectedAt ? formatTimestamp(data.payments.connectedAt) : '—' })}
                        {keys?.publicKey || keys?.apiKey ? <span className="block font-mono">{maskSecret(keys.publicKey || keys.apiKey)}</span> : null}
                      </span>
                      <Button size="sm" variant="tertiary" onClick={disconnect}>
                        {tr('Disconnect')}
                      </Button>
                    </div> :

                        <Button variant="secondary" leadingIcon={PlugIcon} onClick={() => startConnect(p.id)} disabled={!!provider}>
                      {tr('Connect {name}', { name: p.name })}
                    </Button>
                        }
                </div>
                </div>
                </Card>
              </li>);

            })}
        </ul>
      </Section>

      <Card id="mode" title={tr('Checkout mode')} description={tr('Test mode lets you try every payment outcome. Live mode needs a verified provider account and isn’t available in this prototype.')} actions={
        <div className="flex items-center gap-3">
          <Segmented ariaLabel={tr('Checkout mode')} value="test" onChange={() => toast(tr('Live mode is locked in the prototype'), { description: tr('It opens once a provider is integrated and your business is verified.') })} options={[{ value: 'test', label: tr('Test') }, { value: 'live', label: tr('Live') }]} />
          <LockIcon size={15} className="text-fg-subtle" aria-label={tr('Live mode locked')} />
        </div>
        } />

      <Card id="refund-fees" title={<span className="flex items-center gap-2">{tr('Fees when you refund')} <IllustrativeTag note={tr('Policy recommended for launch; confirm the provider’s refund-fee terms before going live.')} /></span>}>
        <dl className="grid gap-x-6 gap-y-4 md:grid-cols-3 md:divide-x md:divide-line [&>div]:md:pl-6 [&>div:first-child]:md:pl-0">
          <div>
            <dt className="text-label font-medium text-fg">{tr('Your customer')}</dt>
            <dd className="mt-1 text-caption text-fg-muted">{tr('Always gets back exactly what they paid. Fees are never deducted from a refund.')}</dd>
          </div>
          <div>
            <dt className="text-label font-medium text-fg">{tr('KUBICU fee')}</dt>
            <dd className="mt-1 text-caption text-fg-muted">{tr('Returned to you on full refunds, and waived automatically on group buys that miss their goal.')}</dd>
          </div>
          <div>
            <dt className="text-label font-medium text-fg">{tr('Provider fee')}</dt>
            <dd className="mt-1 text-caption text-fg-muted">{tr('Most providers keep their processing fee when a payment is refunded, so it stays a cost to you. Reports show it on its own line.')}</dd>
          </div>
        </dl>
      </Card>
      </PageStack>

      <ProviderConnectDialog
        def={providerById(connecting)}
        onClose={() => setConnecting(null)}
        extraValid={!!business.trim()}
        onConnected={onConnected}
        extra={
        <TextInput
          id="pay-business"
          label={tr('Registered business name')}
          value={business}
          placeholder={tr('As it appears on your CAC certificate')}
          hint={tr('Shown on your customers’ bank statements.')}
          onChange={(e) => setBusiness(e.target.value)} />

        } />
      
    </>);

}