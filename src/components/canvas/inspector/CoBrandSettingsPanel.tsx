import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, HandshakeIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { CoBrandSettings } from '../../../types/page';
import { useEditor } from '../../../contexts/EditorContext';
import { useT } from '../../../contexts/LocaleContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { usePlan } from '../../../contexts/PlanContext';
import { useCoBrand } from '../../../hooks/useCoBrand';
import { clearCoBrand, COBRAND_PLAN, modeLabels } from '../../../utils/coBrand';
import { planAtLeast, plans } from '../../../data/plans';
import { Button } from '../../ui/Button';
import { SelectInput } from '../../ui/SelectInput';
import { PlanLock } from '../../ui/PlanLock';
import { UpgradeButton } from '../../ui/UpgradeButton';
import { Badge } from '../../ui/Badge';
import { PartnerAvatar } from '../../partners/PartnerAvatar';
import { CoBrandSheet } from '../CoBrandSheet';
import { cn } from '../../../utils/cn';

type Mode = CoBrandSettings['mode'];

/** Page settings for campaign spaces: run this page together with a business partner (D121). */
export function CoBrandSettingsPanel() {
  const { t: tr } = useT();
  const { actions } = useEditor();
  const { currentSpace } = useWorkspace();
  const plan = usePlan();
  const co = useCoBrand();
  const [pick, setPick] = useState('');
  const [mode, setMode] = useState<Mode>('sections');
  const [panel, setPanel] = useState(false);
  const [confirmStop, setConfirmStop] = useState(false);
  if (currentSpace.kind !== 'campaign') return null;
  const unlocked = planAtLeast(plan.id, COBRAND_PLAN);
  const cb = co.cb;

  const start = () => {
    const p = co.activePartnerships.find((x) => x.id === pick);
    if (!p) return;
    const settings: CoBrandSettings = { partnershipId: p.id, leadName: co.leadName, partnerName: p.partner.name, partnerHandle: p.partner.handle, mode, partnerApproval: null, startedAt: new Date().toISOString() };
    actions.transformDocument((d) => ({ ...d, coBrand: settings }));
    toast.success(tr('Now run with {name}', { name: p.partner.name }), { description: tr(mode === 'sections' ? 'Existing blocks are yours. Mark any as Shared or theirs from the block settings.' : 'Both of you can edit everything. They approve before it goes live.') });
  };

  return (
    <section aria-labelledby="cobrand-heading" className="flex flex-col gap-4 border-b border-line pb-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id="cobrand-heading" className="flex items-center gap-1.5 text-label font-medium text-fg">
            <HandshakeIcon size={14} aria-hidden /> {tr('Co-branded')}
          </h3>
          <p className="mt-0.5 text-caption text-fg-subtle">{tr('Run this page with a business partner: both names on top, each edits their part, both approve.')}</p>
        </div>
        {!unlocked && <PlanLock kind="plan">{tr('{plan} plan', { plan: plans[COBRAND_PLAN].name })}</PlanLock>}
      </div>

      {cb ? (
        <>
          <div className="flex items-center gap-3 rounded-md border border-line bg-raised px-3 py-2.5">
            <PartnerAvatar partner={co.partnership?.partner ?? { name: cb.partnerName, verified: false }} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-label font-semibold text-fg">{tr('With {name}', { name: cb.partnerName })}</p>
              <p className="truncate text-caption text-fg-muted">{tr(modeLabels[cb.mode].label)}</p>
            </div>
            <Badge tone={co.needsApproval ? 'warning' : 'success'} dot>
              {tr(co.needsApproval ? 'Needs approval' : 'Approved')}
            </Badge>
          </div>
          <SelectInput<Mode>
            id="cobrand-mode"
            label={tr('How you edit together')}
            value={cb.mode}
            onChange={(m) => actions.transformDocument((d) => (d.coBrand ? { ...d, coBrand: { ...d.coBrand, mode: m } } : d))}
            options={(Object.keys(modeLabels) as Mode[]).map((m) => ({ value: m, label: modeLabels[m].label }))}
            hint={`${tr(modeLabels[cb.mode].detail)} ${tr('{name} chooses this, as the business that set it up.', { name: co.leadName })}`}
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setPanel(true)}>
              {tr('Open partner panel')}
            </Button>
            {!confirmStop ? (
              <Button size="sm" variant="tertiary" onClick={() => setConfirmStop(true)}>
                {tr('Stop co-branding')}
              </Button>
            ) : null}
          </div>
          {confirmStop && (
            <div className="flex flex-col gap-3 rounded-md border border-danger/30 bg-danger-soft/40 p-3">
              <p className="text-caption text-fg">{tr('Make this your own page again? {name}’s name comes off when you next publish, and every block becomes yours. Their comments stay in your partnership.', { name: cb.partnerName })}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    actions.transformDocument(clearCoBrand);
                    setConfirmStop(false);
                    toast(tr('Co-branding stopped'), { description: tr('Publish to update the live page.') });
                  }}
                >
                  {tr('Stop co-branding')}
                </Button>
                <Button size="sm" variant="tertiary" onClick={() => setConfirmStop(false)}>
                  {tr('Keep it')}
                </Button>
              </div>
            </div>
          )}
          <CoBrandSheet open={panel} onClose={() => setPanel(false)} />
        </>
      ) : !unlocked ? (
        <UpgradeButton plan={COBRAND_PLAN} feature="Co-branded spaces" className="self-start" />
      ) : co.activePartnerships.length === 0 ? (
        <Link to="/app/collaborations" className="inline-flex items-center gap-1 self-start text-caption font-semibold text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {tr('Start a partnership first')} <ArrowUpRightIcon size={12} aria-hidden />
        </Link>
      ) : (
        <>
          <SelectInput<string> id="cobrand-partner" label={tr('Partner')} value={pick} onChange={setPick} options={[{ value: '', label: 'Choose a partner…' }, ...co.activePartnerships.map((p) => ({ value: p.id, label: `${p.partner.name} · ${p.agreement.leadSharePct}/${100 - p.agreement.leadSharePct}` }))]} />
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-label font-medium text-fg">{tr('How you edit together')}</legend>
            {(Object.keys(modeLabels) as Mode[]).map((m) => (
              <label key={m} className={cn('flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5 transition-colors duration-150', mode === m ? 'border-action bg-action-soft' : 'border-line hover:border-line-strong')}>
                <input type="radio" name="cobrand-mode-new" className="mt-0.5 h-4 w-4 accent-[rgb(var(--action))]" checked={mode === m} onChange={() => setMode(m)} />
                <span>
                  <span className="block text-label font-medium text-fg">
                    {tr(modeLabels[m].label)}
                    {m === 'sections' ? ` (${tr('recommended')})` : ''}
                  </span>
                  <span className="block text-caption text-fg-muted">{tr(modeLabels[m].detail)}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <p className="text-caption text-fg-subtle">{tr('Either way, the first publish and changes that affect both of you need their approval. Money from things sold here is split as your partnership agrees.')}</p>
          <Button size="sm" className="self-start" disabled={!pick} onClick={start}>
            {tr('Make it co-branded')}
          </Button>
        </>
      )}
    </section>
  );
}
