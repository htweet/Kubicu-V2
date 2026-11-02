import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Branch } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { useT } from '../../contexts/LocaleContext';
import { branchErrors, branchesOf, emptyBranch, upsertBranch } from '../../utils/commerce/branches';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { Switch } from '../ui/Switch';
import { Segmented } from '../ui/Segmented';
import { Field } from '../ui/Field';

interface BranchSheetProps {
  /** A branch to edit, `'new'` to add one, or null when closed. */
  branch: Branch | 'new' | null;
  onClose: () => void;
}

/** Add or edit a branch: where it is, whether buyers can collect there, and franchise terms (D437). */
export function BranchSheet({ branch, onClose }: BranchSheetProps) {
  const { t: tr } = useT();
  const { data, apply } = useCommerce();
  const [draft, setDraft] = useState<Branch>(emptyBranch);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!branch) return;
    setDraft(branch === 'new' ? emptyBranch() : branch);
    setTried(false);
  }, [branch]);

  const isNew = branch === 'new';
  const errors = branchErrors(draft, branchesOf(data));
  const show = (k: keyof typeof errors) => tried && errors[k] ? tr(errors[k] as string) : undefined;
  const patch = (p: Partial<Branch>) => setDraft((d) => ({ ...d, ...p }));
  const franchise = draft.franchise ?? { operator: '', royaltyPct: 5, since: new Date().toISOString().slice(0, 10) };

  const save = () => {
    setTried(true);
    if (Object.keys(errors).length) return;
    if (apply((d) => upsertBranch(d, draft))) {
      toast.success(isNew ? tr('{name} added', { name: draft.name.trim() }) : tr('{name} saved', { name: draft.name.trim() }), {
        description: isNew ? tr('Move stock to it from Branches → Stock by location.') : undefined
      });
      onClose();
    }
  };

  return (
    <Sheet
      open={!!branch}
      onClose={onClose}
      side="right"
      bodyClassName="px-5 py-6"
      title={isNew ? tr('Add a branch') : draft.name ? tr('Edit {name}', { name: draft.name }) : tr('Edit branch')}
      description={tr('Another place you sell from. Stock is counted separately here, and buyers can collect from it.')}
      footer={
      <div className="flex w-full justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {tr('Cancel')}
          </Button>
          <Button onClick={save}>{isNew ? tr('Add branch') : tr('Save')}</Button>
        </div>
      }>
      
      <div className="flex flex-col gap-5">
        <TextInput id="br-name" label={tr('Name')} placeholder={tr('e.g. Ikeja branch')} maxLength={40} value={draft.name} error={show('name')} onChange={(e) => patch({ name: e.target.value })} />
        <TextInput id="br-address" label={tr('Address')} placeholder={tr('Street, area, city')} value={draft.address} error={show('address')} onChange={(e) => patch({ address: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput id="br-hours" label={tr('Opening hours')} optional placeholder={tr('e.g. Mon–Sat 9am–6pm')} value={draft.hours} onChange={(e) => patch({ hours: e.target.value })} />
          <TextInput id="br-phone" label={tr('Phone')} optional inputMode="tel" value={draft.phone} onChange={(e) => patch({ phone: e.target.value })} />
        </div>
        <Switch id="br-pickup" label={tr('Buyers can collect orders here')} checked={draft.pickup} onChange={(pickup) => patch({ pickup })} />
        <Switch id="br-open" label={tr('Open')} checked={draft.status === 'open'} onChange={(on) => patch({ status: on ? 'open' : 'closed' })} />
        {draft.status === 'closed' && <p className="-mt-3 text-caption text-fg-muted">{tr('Closed branches keep their stock but don’t show at checkout.')}</p>}

        <div className="flex flex-col gap-4 border-t border-line pt-5">
          <Field id="br-kind" label={tr('Who runs it?')}>
            <Segmented<Branch['kind']>
              ariaLabel={tr('Who runs this branch')}
              fullWidth
              value={draft.kind}
              onChange={(kind) => patch({ kind, franchise: kind === 'franchise' ? franchise : undefined })}
              options={[
              { value: 'owned', label: tr('You') },
              { value: 'franchise', label: tr('A franchise partner') }]
              } />
            
          </Field>
          {draft.kind === 'franchise' &&
          <>
              <p className="text-caption text-fg-muted">{tr('The partner runs the branch under your brand and pays you a share of its sales. You see its stock and orders; they don’t see yours.')}</p>
              <TextInput id="br-operator" label={tr('Partner’s business name')} value={franchise.operator} error={show('operator')} onChange={(e) => patch({ franchise: { ...franchise, operator: e.target.value } })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                id="br-royalty"
                label={tr('Royalty (% of sales)')}
                inputMode="decimal"
                value={String(franchise.royaltyPct)}
                error={show('royalty')}
                hint={tr('Worked out on sales after discounts and refunds.')}
                onChange={(e) => patch({ franchise: { ...franchise, royaltyPct: Number(e.target.value.replace(/[^\d.]/g, '')) || 0 } })} />
              
                <TextInput id="br-since" label={tr('Agreement start')} type="date" value={franchise.since} onChange={(e) => patch({ franchise: { ...franchise, since: e.target.value } })} />
              </div>
            </>
          }
        </div>
      </div>
    </Sheet>);

}