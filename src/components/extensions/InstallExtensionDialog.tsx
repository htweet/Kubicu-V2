import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2Icon, ShieldCheckIcon } from 'lucide-react';
import type { ExtensionInfo } from '../../types/marketplace';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { PaymentStep } from '../billing/PaymentStep';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { useBilling } from '../../contexts/BillingContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { formatNaira as formatNgn } from '../../utils/format';
import { withVat } from '../../utils/billing';
import { BANK_TRANSFER_ID, accountIssue, accountsToSettings, parseAccounts, type TransferDetails } from '../../utils/commerce/bankTransfer';
import { BankAccountsEditor } from './BankAccountsEditor';

type Step = 'permissions' | 'pay' | 'setup' | 'done';

/** Permissions first, then payment for paid add-ons, then any setup (D67). */
export function InstallExtensionDialog({ ext, onClose, mode = 'install' }: { ext: ExtensionInfo | null; onClose: () => void; mode?: 'install' | 'settings' }) {
  const market = useMarketplace();
  const billing = useBilling();
  const { current } = useWorkspace();
  const [step, setStep] = useState<Step>('permissions');
  const [values, setValues] = useState<Record<string, string>>({});
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!ext) return;
    setStep(mode === 'settings' ? 'setup' : 'permissions');
    setValues(market.data.installed[ext.id]?.settings ?? {});
    setTried(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ext?.id, mode]);

  if (!ext) return <Dialog open={false} onClose={onClose} title="" />;
  // Bank transfer payments has its own setup: one or more accounts, each with its account name (D223).
  const bankSetup = ext.id === BANK_TRANSFER_ID;
  const accounts: TransferDetails[] = bankSetup ? (parseAccounts(values).length ? parseAccounts(values) : [{ bank: '', account: '', accountName: '' }]) : [];
  const fields = ext.setup ?? [];
  const errors = bankSetup ? {} : Object.fromEntries(fields.map((f) => [f.id, f.pattern.test((values[f.id] ?? '').trim()) ? undefined : f.error]));
  const valid = bankSetup ? accounts.every((a) => Object.values(accountIssue(a)).every((e) => !e)) : Object.values(errors).every((e) => !e);
  const total = withVat(ext.priceNgn).total;

  const finish = () => {
    const settings = bankSetup ? accountsToSettings(accounts) : Object.fromEntries(fields.map((f) => [f.id, (values[f.id] ?? '').trim()]));
    if (mode === 'settings') {
      market.updateSettings(ext.id, settings);
      toast.success(`${ext.name} settings saved`);
      onClose();
      return;
    }
    market.install(ext.id, settings);
    setStep('done');
  };

  const afterPermissions = () => (ext.priceNgn > 0 ? setStep('pay') : fields.length ? setStep('setup') : finish());

  return (
    <Dialog
      open={!!ext}
      onClose={onClose}
      title={step === 'done' ? `${ext.name} is installed` : mode === 'settings' ? `${ext.name} settings` : `Install ${ext.name}?`}
      description={step === 'permissions' ? `By ${ext.publisher}. Version ${ext.version}.` : undefined}
      footer={
        step === 'permissions' ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={afterPermissions}>{ext.priceNgn > 0 ? `Allow and continue` : fields.length ? 'Allow and continue' : 'Allow and install'}</Button>
          </>
        ) : step === 'setup' ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setTried(true);
                if (valid) finish();
              }}
            >
              {mode === 'settings' ? 'Save' : 'Finish install'}
            </Button>
          </>
        ) : step === 'done' ? (
          <Button onClick={onClose}>Done</Button>
        ) : undefined
      }
    >
      {step === 'permissions' && (
        <div className="flex flex-col gap-3">
          <p className="text-label font-semibold text-fg">It will be able to:</p>
          <ul className="flex flex-col gap-2">
            {ext.permissions.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-label text-fg">
                <ShieldCheckIcon size={16} className="mt-0.5 shrink-0 text-action" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
          <p className="text-caption text-fg-muted">It can’t see your payouts, team, billing or anything not listed. You can pause or uninstall it any time — {ext.uninstallNote.charAt(0).toLowerCase() + ext.uninstallNote.slice(1)}</p>
          {ext.priceNgn > 0 && (
            <p className="rounded-md bg-sunken px-3 py-2 text-caption text-fg-muted">
              Add-on: {formatNgn(ext.priceNgn)}/month + VAT, charged today and added to your invoices. Cancel by uninstalling.
            </p>
          )}
        </div>
      )}
      {step === 'pay' && (
        <PaymentStep
          payLabel={`Pay ${formatNgn(total)}`}
          savedCard={billing.data.card}
          defaultHolder={current.ownerName}
          onBack={() => setStep('permissions')}
          onPaid={(card) => {
            billing.charge([{ label: `${ext.name} add-on (first month)`, amountNgn: ext.priceNgn }], card);
            if (fields.length) setStep('setup');
            else finish();
          }}
        />
      )}
      {step === 'setup' && bankSetup && <BankAccountsEditor accounts={accounts} showErrors={tried} onChange={(list) => setValues(accountsToSettings(list))} />}
      {step === 'setup' && !bankSetup && (
        <div className="flex flex-col gap-4">
          {fields.map((f) => (
            <TextInput key={f.id} id={`ext-${f.id}`} label={f.label} placeholder={f.placeholder} hint={f.hint} value={values[f.id] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))} error={tried ? errors[f.id] : undefined} />
          ))}
        </div>
      )}
      {step === 'done' && (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <CheckCircle2Icon size={30} className="text-success" aria-hidden />
          <ul className="flex flex-col gap-1 text-label text-fg">
            {ext.adds.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          {ext.preview && <p className="text-caption text-fg-muted">This is a preview: it shows what it would do, but nothing external is connected yet.</p>}
        </div>
      )}
    </Dialog>
  );
}
