import React, { useEffect, useState } from 'react';
import type { ErpProviderId } from '../../../types/erp';
import { erpProviders } from '../../../data/erpProviders';
import { erpErrors } from '../../../utils/erp/sync';
import { useT } from '../../../contexts/LocaleContext';
import { Dialog } from '../../ui/Dialog';
import { Button } from '../../ui/Button';
import { TextInput } from '../../ui/TextInput';
import { cn } from '../../../utils/cn';

interface ErpConnectDialogProps {
  open: boolean;
  onClose: () => void;
  onConnect: (provider: ErpProviderId, server: string, company: string) => void;
}

/** Choose the ERP and enter where it lives (D440). The key is checked for shape only and not kept. */
export function ErpConnectDialog({ open, onClose, onConnect }: ErpConnectDialogProps) {
  const { t: tr } = useT();
  const [provider, setProvider] = useState<ErpProviderId>('odoo');
  const [server, setServer] = useState('');
  const [company, setCompany] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setServer('');
    setCompany('');
    setApiKey('');
    setTried(false);
    setBusy(false);
  }, [open]);

  const p = erpProviders[provider];
  const errs = erpErrors(server, company);
  const keyErr = apiKey.trim().length < 16 ? 'Paste the whole key — at least 16 characters' : undefined;

  const connect = () => {
    setTried(true);
    if (errs.server || errs.company || keyErr) return;
    setBusy(true);
    window.setTimeout(() => onConnect(provider, server.trim().replace(/\/$/, ''), company.trim()), 900);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Connect inventory or ERP"
      description="Your ERP keeps the stock count; KUBICU follows it and sends paid orders back. Simulated — nothing reaches the ERP."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={connect} loading={busy}>
            Connect
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2" disabled={busy}>
          <legend className="mb-2 text-label font-semibold text-fg">{tr('System')}</legend>
          {(Object.keys(erpProviders) as ErpProviderId[]).map((id) => (
            <label key={id} className={cn('flex cursor-pointer items-start gap-3 rounded-md border px-3 py-3 transition-colors duration-150', provider === id ? 'border-action bg-action-soft' : 'border-line hover:bg-sunken')}>
              <input type="radio" name="erp-provider" value={id} checked={provider === id} onChange={() => setProvider(id)} className="mt-1 accent-[rgb(var(--action))]" />
              <span className="min-w-0">
                <span className="block text-label font-medium text-fg">{erpProviders[id].name}</span>
                <span className="block text-caption text-fg-muted">{tr(erpProviders[id].blurb)}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <TextInput id="erp-server" label={p.serverLabel} placeholder={p.serverPlaceholder} value={server} disabled={busy} error={tried ? errs.server : undefined} onChange={(e) => setServer(e.target.value)} />
        <TextInput id="erp-company" label={p.companyLabel} value={company} disabled={busy} error={tried ? errs.company : undefined} onChange={(e) => setCompany(e.target.value)} />
        <TextInput id="erp-key" label="API key" type="password" autoComplete="off" value={apiKey} disabled={busy} error={tried ? keyErr : undefined} hint="Create one for a user that can read stock and create sales orders." onChange={(e) => setApiKey(e.target.value)} />
      </div>
    </Dialog>
  );
}
