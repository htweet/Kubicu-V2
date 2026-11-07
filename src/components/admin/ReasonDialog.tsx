import React, { useEffect, useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { useT } from '../../contexts/LocaleContext';

interface ReasonDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  /** Extra fields shown above the reason (e.g. a plan picker). */
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

/**
 * Every privileged staff action asks why, and the answer goes to the audit log (D75b).
 * The dialog's own wording follows the console language (D489); the reason is kept exactly as typed.
 */
export function ReasonDialog({ open, title, description, confirmLabel, destructive, children, onClose, onConfirm }: ReasonDialogProps) {
  const { t } = useT();
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState(false);
  useEffect(() => {
    if (open) {
      setReason('');
      setTried(false);
    }
  }, [open]);
  const error = reason.trim().length < 10 ? t('Write at least a short sentence — it’s kept in the audit log.') : '';
  const confirm = () => {
    setTried(true);
    if (error) return;
    onConfirm(reason.trim());
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button variant={destructive ? 'destructive' : 'primary'} onClick={confirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {children}
        <TextArea id="admin-reason" label={t('Reason')} rows={3} value={reason} error={tried ? error || undefined : undefined} placeholder={t('e.g. Confirmed fraud reports from three buyers')} onChange={(e) => setReason(e.target.value)} />
      </div>
    </Dialog>
  );
}
