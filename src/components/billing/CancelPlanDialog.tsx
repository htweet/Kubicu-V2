import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { ImpactList } from './ImpactList';
import { useBilling } from '../../contexts/BillingContext';
import { usePlan } from '../../contexts/PlanContext';
import { useDowngradeImpact } from '../../hooks/useDowngradeImpact';
import { cancelReasons } from '../../data/billing';
import { formatDate } from '../../utils/billing';
import { cn } from '../../utils/cn';

/** One reason question, what's lost, then the plan ends at the period end (D65). */
export function CancelPlanDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const billing = useBilling();
  const plan = usePlan();
  const impact = useDowngradeImpact('free');
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState(false);
  const end = billing.data.periodEnd ? formatDate(billing.data.periodEnd) : 'the end of this period';

  useEffect(() => {
    if (open) {
      setReason('');
      setTried(false);
    }
  }, [open]);

  const confirm = () => {
    setTried(true);
    if (!reason) return;
    billing.cancelPlan(reason);
    toast.success(`${plan.name} ends on ${end}`, { description: 'You keep everything until then. Resume any time before.' });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="md"
      title={`Cancel ${plan.name}?`}
      description={`You keep ${plan.name} until ${end}, then move to Free. No further charges.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Keep {plan.name}
          </Button>
          <Button variant="destructive" onClick={confirm}>
            Cancel at {end}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <fieldset>
          <legend className="text-label font-semibold text-fg">What’s the main reason?</legend>
          {tried && !reason && (
            <p className="mt-1 text-caption text-danger" role="alert">
              Choose a reason — it helps us improve.
            </p>
          )}
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {cancelReasons.map((r) => (
              <label key={r} className={cn('flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md border px-3 text-label text-fg transition-colors duration-150', reason === r ? 'border-action bg-action-soft' : 'border-line hover:bg-sunken')}>
                <input type="radio" name="cancel-reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
                {r}
              </label>
            ))}
          </div>
        </fieldset>
        <ImpactList items={impact} target="free" />
      </div>
    </Dialog>
  );
}
