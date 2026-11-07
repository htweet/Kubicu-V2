import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon } from 'lucide-react';
import type { ReportReason } from '../../types/admin';
import { reportReasonLabels } from '../../data/featureFlags';
import { useT } from '../../contexts/LocaleContext';
import { updateAdminStore } from '../../utils/admin/store';
import { isValidEmail } from '../../utils/validation';
import { uid } from '../../utils/id';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { TextInput } from '../ui/TextInput';
import { cn } from '../../utils/cn';

/** A visitor’s report goes to Super admin → Moderation & trust (D75b). Follows the visitor's language (D497). */
export function ReportPageDialog({ open, onClose, handle, workspaceId }: { open: boolean; onClose: () => void; handle: string; workspaceId: string | null }) {
  const { t: tr } = useT();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (open) {
      setReason(null);
      setDetails('');
      setEmail('');
      setTried(false);
      setSent(false);
    }
  }, [open]);

  const errors = {
    reason: reason ? '' : 'Choose what’s wrong',
    details: details.trim().length < 10 ? 'Tell us a little more so staff can check' : '',
    email: email.trim() && !isValidEmail(email) ? 'Email looks wrong' : '',
  };
  const submit = () => {
    setTried(true);
    if (Object.values(errors).some(Boolean) || !reason) return;
    updateAdminStore((s) => ({
      ...s,
      reports: [{ id: uid('rep'), handle, workspaceId, reason, details: details.trim(), reporterEmail: email.trim(), createdAt: new Date().toISOString(), status: 'open', decision: null, decidedAt: null }, ...s.reports],
    }));
    setSent(true);
  };

  return (
    <Dialog
      centered
      open={open}
      onClose={onClose}
      title={sent ? tr('Thanks — we’ve got it') : tr('Report this page')}
      description={sent ? undefined : tr('Tell KUBICU about a problem with {page}. The page owner isn’t told who reported it.', { page: `kub.icu/${handle}` })}
      footer={
        sent ? (
          <Button onClick={onClose}>{tr('Done')}</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              {tr('Cancel')}
            </Button>
            <Button onClick={submit}>{tr('Send report')}</Button>
          </>
        )
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2Icon size={32} className="text-success" aria-hidden />
          <p className="max-w-sm text-label text-fg-muted">{tr('A person on the KUBICU team reviews every report. If you lost money, also contact your bank — they can act faster than we can.')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <fieldset>
            <legend className="text-label font-medium text-fg">{tr('What’s wrong?')}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(Object.keys(reportReasonLabels) as ReportReason[]).map((r) => (
                <label key={r} className={cn('flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-label transition-colors duration-150', reason === r ? 'border-fg bg-sunken' : 'border-line hover:border-line-strong')}>
                  <input type="radio" name="report-reason" checked={reason === r} onChange={() => setReason(r)} className="accent-current" />
                  {tr(reportReasonLabels[r])}
                </label>
              ))}
            </div>
            {tried && errors.reason && <p className="mt-1.5 text-caption font-medium text-danger">{tr(errors.reason)}</p>}
          </fieldset>
          <TextArea id="report-details" label={tr('What happened?')} rows={3} value={details} error={tried && errors.details ? tr(errors.details) : undefined} onChange={(e) => setDetails(e.target.value)} />
          <TextInput id="report-email" label={tr('Your email')} optional type="email" value={email} error={tried && errors.email ? tr(errors.email) : undefined} hint={tr('Only if you’re happy for staff to ask you more.')} onChange={(e) => setEmail(e.target.value)} />
        </div>
      )}
    </Dialog>
  );
}
