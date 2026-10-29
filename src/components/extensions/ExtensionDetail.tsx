import React, { useState } from 'react';
import { toast } from 'sonner';
import { BadgeCheckIcon, CheckIcon, EyeIcon, PauseIcon, PencilIcon, PlayIcon, RotateCcwIcon, SettingsIcon, ShieldAlertIcon, StarIcon, Trash2Icon } from 'lucide-react';
import { groupPermissions } from '../../utils/extensionPermissions';
import type { ExtensionInfo } from '../../types/marketplace';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Dialog } from '../ui/Dialog';
import { UpgradeButton } from '../ui/UpgradeButton';
import { ExtensionPreview } from './ExtensionPreview';
import { ExtensionIcon } from './ExtensionIcon';
import { WorksWith } from './WorksWith';
import { ExtensionTools } from './ExtensionTools';
import { useNavigate } from 'react-router-dom';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { usePlan } from '../../contexts/PlanContext';
import { useTeam } from '../../contexts/TeamContext';
import { averageRating, extensionCategories } from '../../data/extensions';
import { planAtLeast, plans } from '../../data/plans';
import { formatDate } from '../../utils/billing';
import { formatNaira as formatNgn } from '../../utils/format';
import { useAdminStore } from '../../utils/admin/store';

interface Props {
  ext: ExtensionInfo | null;
  onClose: () => void;
  onInstall: (ext: ExtensionInfo, mode: 'install' | 'settings') => void;
}

/** What it does, versions, plans, price, reviews — and install / manage (D67). */
export function ExtensionDetail({ ext, onClose, onInstall }: Props) {
  const market = useMarketplace();
  const plan = usePlan();
  const can = useTeam().can('extensions.manage');
  const navigate = useNavigate();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [adminStore] = useAdminStore();
  if (!ext) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;

  const rec = market.data.installed[ext.id];
  const allowedPlan = planAtLeast(plan.id, ext.minPlan);
  const rating = averageRating(ext);
  const pull = adminStore.extensionPulls[ext.id];
  const perms = groupPermissions(ext.permissions);
  const canRollback = !!rec && rec.version === ext.version && ext.versions.length > 1 && pull?.pulledVersion !== ext.version;

  const retired = ext.retired;
  const footer = retired ?
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-caption text-fg-muted">{rec ? 'Still working. Move when you’re ready.' : `Now part of ${retired.movedTo}.`}</span>
      {rec ?
    <Button
      disabled={!can.allowed}
      onClick={() => {
        market.moveRetired(ext.id);
        toast(`Moved to ${retired.movedTo}`, { description: 'Everything you set up keeps working.' });
        onClose();
        navigate(retired.href);
      }}>
      
          Move to {retired.movedTo}
        </Button> :

    <Button
      onClick={() => {
        onClose();
        navigate(retired.href);
      }}>
      
          Open {retired.movedTo}
        </Button>
    }
    </div> :
  rec ?
  <div className="flex flex-wrap items-center gap-2">
      {ext.setup &&
    <Button variant="secondary" size="sm" leadingIcon={SettingsIcon} disabled={!can.allowed} onClick={() => onInstall(ext, 'settings')}>
          Settings
        </Button>
    }
      <Button variant="secondary" size="sm" leadingIcon={rec.paused ? PlayIcon : PauseIcon} disabled={!can.allowed} onClick={() => market.setPaused(ext.id, !rec.paused)}>
        {rec.paused ? 'Resume' : 'Pause'}
      </Button>
      <Button variant="tertiary" size="sm" leadingIcon={Trash2Icon} disabled={!can.allowed} onClick={() => setConfirmRemove(true)} className="ml-auto">
        Uninstall
      </Button>
    </div> :

  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-caption text-fg-muted">{!can.allowed ? can.reason : !allowedPlan ? `Needs ${plans[ext.minPlan].name} or above.` : ext.priceNgn ? `${formatNgn(ext.priceNgn)}/month + VAT` : 'Free'}</span>
      {allowedPlan ?
    <Button disabled={!can.allowed} onClick={() => onInstall(ext, 'install')}>
          {ext.preview ? 'Install preview' : 'Install'}
        </Button> :

    <UpgradeButton plan={ext.minPlan} feature={ext.name} variant="primary" />
    }
    </div>;


  return (
    <>
      <Sheet open={!!ext} onClose={onClose} side="right" size="lg" title={ext.name} description={ext.summary} footer={footer}>
        <div className="flex flex-col gap-7 p-5">
          <div className="flex items-start gap-4">
            <ExtensionIcon ext={ext} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-label text-fg">
                {ext.publisher}
                {ext.verified === 'kubicu' ? <BadgeCheckIcon size={15} className="text-action" aria-label="Built by KUBICU" /> : <Badge tone="neutral">{ext.verified === 'community' ? 'Independent developer · reviewed' : 'Reviewed partner'}</Badge>}
              </p>
              <p className="mt-1 text-caption text-fg-muted">
                {extensionCategories[ext.category]} · v{rec?.version ?? ext.version} · {plans[ext.minPlan].name} and above
                {rating !== null && ` · ★ ${rating.toFixed(1)} (${ext.reviews.length})`}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {retired ? <Badge tone="info">Moved to {retired.movedTo}</Badge> : rec && <Badge tone={rec.paused ? 'warning' : 'success'} dot>{rec.paused ? 'Paused' : 'Installed'}</Badge>}
                {ext.preview && <Badge tone="info">Preview</Badge>}
              </div>
            </div>
          </div>

          {retired &&
          <div className="rounded-md border border-info/40 bg-info-soft px-4 py-3">
              <p className="text-label font-semibold text-fg">Now part of {retired.movedTo}</p>
              <p className="mt-1 text-caption text-fg">{retired.note}</p>
            </div>
          }

          <p className="text-body text-fg">{ext.description}</p>

          {rec && !rec.paused && !retired && <ExtensionTools id={ext.id} rec={rec} onNavigate={onClose} />}

          {ext.worksWith && <WorksWith connections={ext.worksWith} onNavigate={onClose} />}

          <section aria-label="What it adds" className="rounded-lg bg-sunken p-4">
            <h3 className="text-label font-semibold text-fg">What it adds</h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {ext.adds.map((a) =>
              <li key={a} className="flex items-start gap-2 text-label text-fg">
                  <CheckIcon size={14} className="mt-0.5 shrink-0 text-success" aria-hidden />
                  {a}
                </li>
              )}
            </ul>
          </section>

          {ext.preview && rec && <ExtensionPreview id={ext.id} />}

          <section aria-labelledby="ext-access-h">
            <h3 id="ext-access-h" className="text-label font-semibold text-fg">What it can access</h3>
            <p className="mt-1 text-caption text-fg-subtle">Only what’s listed here. It never sees your password, card details or other workspaces.</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {(['see', 'change'] as const).map((k) => {
                const list = perms[k];
                const Icon = k === 'see' ? EyeIcon : PencilIcon;
                return (
                  <div key={k}>
                    <h4 className="flex items-center gap-1.5 text-caption font-semibold text-fg">
                      <Icon size={13} className="text-fg-muted" aria-hidden />
                      {k === 'see' ? 'Can see' : 'Can change or do'}
                    </h4>
                    {list.length ?
                    <ul className="mt-1.5 flex flex-col divide-y divide-line">
                        {list.map((p) =>
                      <li key={p.text} className="flex items-start justify-between gap-3 py-2 text-label text-fg">
                            <span className="min-w-0">{p.text}</span>
                            {p.sensitive &&
                        <Badge tone="warning" className="shrink-0">
                                Sensitive
                              </Badge>
                        }
                          </li>
                      )}
                      </ul> :

                    <p className="mt-1.5 text-label text-fg-subtle">Nothing</p>
                    }
                  </div>);

              })}
            </div>
            {perms.see.concat(perms.change).some((p) => p.sensitive) &&
            <p className="mt-3 flex items-start gap-1.5 text-caption text-fg-muted">
                <ShieldAlertIcon size={13} className="mt-px shrink-0 text-warning" aria-hidden />
                “Sensitive” means it touches customers’ personal details, money or your device. You can pause or uninstall it any time.
              </p>
            }
          </section>

          <section aria-label="Versions">
            {pull &&
            <p className="mb-3 rounded-md border border-warning/40 bg-warning-soft px-3 py-2.5 text-caption text-fg">
                <span className="font-semibold">KUBICU withdrew {pull.pulledVersion}</span> on {formatDate(pull.at)} and moved everyone to {pull.to}. Reason: {pull.reason}
              </p>
            }
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-label font-semibold text-fg">Versions</h3>
              {canRollback &&
              <Button
                size="sm"
                variant="tertiary"
                leadingIcon={RotateCcwIcon}
                disabled={!can.allowed}
                onClick={() => {
                  market.rollback(ext.id);
                  toast(`${ext.name} rolled back to ${ext.versions[1].version}`, { description: 'Use this if the latest version caused a problem.' });
                }}>
                
                  Roll back to {ext.versions[1].version}
                </Button>
              }
            </div>
            <ol className="mt-2 flex flex-col gap-2">
              {ext.versions.map((v) =>
              <li key={v.version} className="text-label">
                  <span className="font-medium text-fg">{v.version}</span> <span className="text-caption text-fg-subtle">· {formatDate(v.date)}</span>
                  {rec?.version === v.version && <span className="text-caption text-action"> · running</span>}
                  {pull?.pulledVersion === v.version && <span className="text-caption font-medium text-warning"> · withdrawn by KUBICU</span>}
                  <p className="text-caption text-fg-muted">{v.notes}</p>
                </li>
              )}
            </ol>
          </section>

          <section aria-label="Reviews">
            <h3 className="text-label font-semibold text-fg">Reviews</h3>
            {ext.reviews.length === 0 ?
            <p className="mt-1 text-caption text-fg-muted">No reviews yet.</p> :

            <ul className="mt-2 flex flex-col gap-3">
                {ext.reviews.map((r) =>
              <li key={r.name}>
                    <p className="flex items-center gap-1 text-caption text-fg-subtle">
                      <span className="flex" aria-label={`${r.rating} out of 5`}>
                        {Array.from({ length: 5 }, (_, i) =>
                    <StarIcon key={i} size={12} className={i < r.rating ? 'fill-current text-warning' : 'text-line-strong'} aria-hidden />
                    )}
                      </span>
                      {r.name} · {r.business}
                    </p>
                    <p className="mt-0.5 text-label text-fg">{r.text}</p>
                  </li>
              )}
              </ul>
            }
            <p className="mt-2 text-caption text-fg-subtle">Reviews are checked by KUBICU before they show. Sample reviews.</p>
          </section>
        </div>
      </Sheet>
      <Dialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        title={`Uninstall ${ext.name}?`}
        description={ext.uninstallNote}
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirmRemove(false)}>
              Keep it
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              market.uninstall(ext.id);
              setConfirmRemove(false);
              toast(`${ext.name} uninstalled`);
            }}>
            
              Uninstall
            </Button>
          </>
        } />
      
    </>);

}