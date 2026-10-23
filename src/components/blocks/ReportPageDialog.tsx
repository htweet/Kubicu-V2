import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon } from 'lucide-react';
import type { ReportReason } from '../../types/admin';
import { reportReasonLabels } from '../../data/featureFlags';
import { updateAdminStore } from '../../utils/admin/store';
import { isValidEmail } from '../../utils/validation';
import { uid } from '../../utils/id';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { TextInput } from '../ui/TextInput';
import { cn } from '../../utils/cn';

/** A visitor’s report goes to Super admin → Moderation & trust (D75b). */
export function ReportPageDialog({ open, onClose, handle, workspaceId }: {open: boolean;onClose: () => void;handle: string;workspaceId: string | null;}) {
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
    email: email.trim() && !isValidEmail(email) ? 'Email looks wrong' : ''
  };
  const submit = () => {
    setTried(true);
    if (Object.values(errors).some(Boolean) || !reason) return;
    updateAdminStore((s) => ({
      ...s,
      reports: [{ id: uid('rep'), handle, workspaceId, reason, details: details.trim(), reporterEmail: email.trim(), createdAt: new Date().toISOString(), status: 'open', decision: null, decidedAt: null }, ...s.reports]
    }));
    setSent(true);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={sent ? 'Thanks — we’ve got it' : 'Report this page'}
      description={sent ? undefined : `Tell KUBICU about a problem with kub.icu/${handle}. The page owner isn’t told who reported it.`}
      footer={
      sent ?
      <Button onClick={onClose}>Done</Button> :

      <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit}>Send report</Button>
          </>

      }>
      
      {sent ?
      <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2Icon size={32} className="text-success" aria-hidden />
          <p className="max-w-sm text-label text-fg-muted">A person on the KUBICU team reviews every report. If you lost money, also contact your bank — they can act faster than we can.</p>
        </div> :

      <div className="flex flex-col gap-4">
          <fieldset>
            <legend className="text-label font-medium text-fg">What’s wrong?</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(Object.keys(reportReasonLabels) as ReportReason[]).map((r) =>
            <label key={r} className={cn('flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-label transition-colors duration-150', reason === r ? 'border-fg bg-sunken' : 'border-line hover:border-line-strong')}>
                  <input type="radio" name="report-reason" checked={reason === r} onChange={() => setReason(r)} className="accent-current" />
                  {reportReasonLabels[r]}
                </label>
            )}
            </div>
            {tried && errors.reason && <p className="mt-1.5 text-caption font-medium text-danger">{errors.reason}</p>}
          </fieldset>
          <TextArea id="report-details" label="What happened?" rows={3} value={details} error={tried ? errors.details || undefined : undefined} onChange={(e) => setDetails(e.target.value)} />
          <TextInput id="report-email" label="Your email" optional type="email" value={email} error={tried ? errors.email || undefined : undefined} hint="Only if you’re happy for staff to ask you more." onChange={(e) => setEmail(e.target.value)} />
        </div>
      }
    </Dialog>);

}