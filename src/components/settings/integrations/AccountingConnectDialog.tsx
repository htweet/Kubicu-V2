import React, { useEffect, useState } from 'react';
import type { AccountingProviderId } from '../../../types/accounting';
import { accountingProviders } from '../../../data/accountingProviders';
import { useT } from '../../../contexts/LocaleContext';
import { Dialog } from '../../ui/Dialog';
import { Button } from '../../ui/Button';
import { TextInput } from '../../ui/TextInput';
import { cn } from '../../../utils/cn';

interface AccountingConnectDialogProps {
  open: boolean;
  defaultOrganisation: string;
  onClose: () => void;
  onConnect: (provider: AccountingProviderId, organisation: string) => void;
}

/** Choose Xero or Sage, "sign in" (simulated) and pick the organisation to post to (D438). */
export function AccountingConnectDialog({ open, defaultOrganisation, onClose, onConnect }: AccountingConnectDialogProps) {
  const { t: tr } = useT();
  const [provider, setProvider] = useState<AccountingProviderId>('xero');
  const [step, setStep] = useState<'choose' | 'signing' | 'org'>('choose');
  const [org, setOrg] = useState('');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep('choose');
    setOrg(defaultOrganisation);
    setTried(false);
  }, [open, defaultOrganisation]);

  const name = accountingProviders[provider].name;
  const signIn = () => {
    setStep('signing');
    window.setTimeout(() => setStep('org'), 900);
  };
  const connect = () => {
    setTried(true);
    if (!org.trim()) return;
    onConnect(provider, org.trim());
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={step === 'org' ? tr('Choose your {tool} organisation', { tool: name }) : tr('Connect accounting')}
      description={step === 'org' ? 'Payments will post to this organisation’s books.' : 'You’ll sign in on the provider’s own page and allow KUBICU to post sales, fees and refunds. Simulated — nothing reaches the provider.'}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {step === 'org' ?
        <Button onClick={connect}>Connect</Button> :

        <Button onClick={signIn} loading={step === 'signing'}>
              {tr('Continue to {tool}', { tool: name })}
            </Button>
        }
        </>
      }>
      
      {step === 'org' ?
      <TextInput id="acct-org" label="Organisation" value={org} error={tried && !org.trim() ? 'Choose the organisation to post to' : undefined} hint="In a live connection you’d pick from the organisations on your account." onChange={(e) => setOrg(e.target.value)} /> :

      <fieldset className="flex flex-col gap-2" disabled={step === 'signing'}>
          <legend className="mb-2 text-label font-semibold text-fg">{tr('Accounting tool')}</legend>
          {(Object.keys(accountingProviders) as AccountingProviderId[]).map((id) =>
        <label key={id} className={cn('flex cursor-pointer items-start gap-3 rounded-md border px-3 py-3 transition-colors duration-150', provider === id ? 'border-action bg-action-soft' : 'border-line hover:bg-sunken')}>
              <input type="radio" name="acct-provider" value={id} checked={provider === id} onChange={() => setProvider(id)} className="mt-1 accent-[rgb(var(--action))]" />
              <span className="min-w-0">
                <span className="block text-label font-medium text-fg">{accountingProviders[id].name}</span>
                <span className="block text-caption text-fg-muted">{tr(accountingProviders[id].blurb)}</span>
              </span>
            </label>
        )}
        </fieldset>
      }
    </Dialog>);

}