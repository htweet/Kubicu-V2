import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2Icon, CircleIcon, DownloadIcon, Loader2Icon } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { InlineAlert } from '../ui/InlineAlert';
import { useT } from '../../contexts/LocaleContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useImports, type ImportRecord, type Reinvite } from '../../contexts/ImportsContext';
import { ApiError, describeError, describeLimit, IMPORT_LIMIT_TITLE } from '../../utils/auth/session';
import { buildLegacyBundleFrom, LEGACY_BUNDLE_MAX_BYTES, LEGACY_UNDO_DAYS, readBrowserStorage, secretArea, type LegacyBundle } from '../../utils/legacyBundle';
import { formatDate } from '../../utils/billing';
import { roleInfo } from '../../data/permissions';

type Step = 'intro' | 'working' | 'done' | 'error';
type Progress = 'checked' | 'leftOut' | 'saving' | 'linking';

/** Areas a server finding refers to (key → screen name). Never shows a value. */
const AREA: Array<[RegExp, string]> = [
  [/^workspace$/, 'Workspace details'],
  [/^kubicu\.editor\.v1\./, 'Pages'],
  [/^kubicu\.(commerce|money|fulfilment|printOrders)\./, 'Shop and payments'],
  [/^kubicu\.team\./, 'Team'],
  [/^kubicu\.(domains|kit|printKit)/, 'Domains and links'],
  [/^kubicu\.(forms|formRate)\./, 'Forms'],
  [/^kubicu\.(ops|serviceos|erp|accounting)\./, 'Operations'],
  [/^kubicu\.(whatsapp|notifs|assistant|ai|coach|voice)\./, 'Messages and assistant'],
  [/^kubicu\.(library|mediaFolders|mediaFoldersFiled)\./, 'Media']
];
function areasIn(detail: string | undefined): string[] {
  if (!detail) return [];
  const keys = detail.split('; ').map((p) => p.split(':')[0]!.trim());
  return [...new Set(keys.map((k) => AREA.find(([re]) => re.test(k))?.[1] ?? 'Other workspace data'))];
}

function download(bundle: LegacyBundle, name: string): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kubicu-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'workspace'}-backup.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * "Bring this workspace to your account" (D-UI-2). Optional; the browser copy is never changed; secrets
 * never leave the browser; undo for 7 days. The upload is idempotent, so "Try again" never creates twice.
 */
export function ImportWorkspaceDialog({ open, onClose, workspaceId }: {open: boolean;onClose: () => void;workspaceId: string;}) {
  const { t } = useT();
  const navigate = useNavigate();
  const imports = useImports();
  const { workspaces, switchTo } = useWorkspace();
  const ws = workspaces.find((w) => w.id === workspaceId);
  const [step, setStep] = useState<Step>('intro');
  const [progress, setProgress] = useState<Progress>('checked');
  const [prepared, setPrepared] = useState<{bundle: LegacyBundle;secretKeys: string[];} | null>(null);
  const [result, setResult] = useState<ImportRecord | null>(null);
  const [error, setError] = useState<{title: string;body: string;areas: string[];retry: boolean;} | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep('intro');
    setResult(null);
    setError(null);
    buildLegacyBundleFrom(readBrowserStorage(), workspaceId).then(setPrepared, () => setPrepared(null));
  }, [open, workspaceId]);

  if (!imports || !ws) return null;
  const secretAreas = [...new Set((prepared?.secretKeys ?? []).map(secretArea))];

  const run = async () => {
    setStep('working');
    setError(null);
    setProgress('checked');
    try {
      const fresh = await buildLegacyBundleFrom(readBrowserStorage(), workspaceId);
      setPrepared(fresh);
      if (new TextEncoder().encode(JSON.stringify(fresh.bundle)).length > LEGACY_BUNDLE_MAX_BYTES) {
        throw new ApiError(413, 'payload_too_large', 'Too large to upload', undefined, undefined, LEGACY_BUNDLE_MAX_BYTES);
      }
      setProgress('leftOut');
      setProgress('saving');
      const record = await imports.upload(fresh.bundle);
      setProgress('linking');
      await imports.refresh();
      setResult(record);
      setStep('done');
    } catch (e) {
      // Already imported by an earlier attempt (for example a lost reply): show it as linked.
      if (e instanceof ApiError && e.code === 'conflict') {
        const list = await imports.refresh().catch(() => [] as ImportRecord[]);
        const linked = list.find((i) => i.legacyWorkspaceId === workspaceId && i.mode === 'primary' && i.status === 'completed');
        if (linked) {
          setResult(linked);
          setStep('done');
          return;
        }
      }
      // The three limits use the owner-approved wording, with the numbers from the server (describeLimit).
      const d = describeLimit(e) ?? describeError(e);
      const secrets = e instanceof ApiError && e.title === 'Bundle contains secrets';
      setError({
        title: secrets ? 'Something here looks like a password or key' : d.title,
        body: secrets ? 'Remove it from the areas below (or move it to Settings → Integrations), then try again.' : d.body,
        areas: secrets ? areasIn(e.detail) : [],
        // The daily import limit lasts hours: no "Try again" for it.
        retry: e instanceof ApiError && ['network', 'unavailable', 'rate_limited', 'unknown'].includes(e.code) && e.title !== IMPORT_LIMIT_TITLE
      });
      setStep('error');
    }
  };

  const reviewInvites = (reinvites: Reinvite[]) => {
    switchTo(workspaceId);
    onClose();
    navigate('/app/settings/team', { state: { suggestedInvites: reinvites } });
  };

  const order: Progress[] = ['checked', 'leftOut', 'saving', 'linking'];
  const label: Record<Progress, string> = {
    checked: t('Checked your workspace'),
    leftOut: (prepared?.secretKeys.length ?? 0) === 1 ? t('Left out 1 saved key (it stays in this browser)') : t('Left out {n} saved keys (they stay in this browser)', { n: prepared?.secretKeys.length ?? 0 }),
    saving: t('Saving to your account'),
    linking: t('Linking this browser copy')
  };

  const title = step === 'done' ? 'Linked to your account' : step === 'error' ? 'Nothing was saved' : t('Bring {name} to your account', { name: ws.name });
  const reinvites = result?.reinvites ?? [];

  return (
    <Dialog
      open={open}
      onClose={step === 'working' ? () => undefined : onClose}
      dismissible={step !== 'working'}
      title={title}
      footer={
      step === 'intro' ?
      <>
            <Button variant="secondary" onClick={onClose}>Not now</Button>
            <Button onClick={() => void run()} disabled={!prepared}>Bring it to my account</Button>
          </> :
      step === 'done' ?
      <>
            <Button variant="secondary" onClick={onClose}>{reinvites.length ? 'Invite later' : 'Done'}</Button>
            {reinvites.length > 0 && <Button onClick={() => reviewInvites(reinvites)}>Review invites</Button>}
          </> :
      step === 'error' ?
      <>
            <Button variant="secondary" onClick={onClose}>Close</Button>
            {error?.retry && <Button onClick={() => void run()}>Try again</Button>}
          </> :
      null
      }>
      
      {step === 'intro' &&
      <div className="flex flex-col gap-4 text-label text-fg-muted">
          <p>{t('Save this workspace to your KUBICU account, so it’s backed up and ready for your team.')}</p>
          <ul className="flex list-disc flex-col gap-2 pl-5">
            <li><span className="font-semibold text-fg">{t('Optional.')}</span> {t('You can do this later from Your account → Workspaces.')}</li>
            <li><span className="font-semibold text-fg">{t('Your browser copy stays exactly as it is.')}</span> {t('You keep working here as before.')}</li>
            <li><span className="font-semibold text-fg">{t('Saved keys and passwords never leave this browser.')}</span> {secretAreas.length ? t('You’ll re-enter them later: {areas}.', { areas: secretAreas.map((a) => t(a)).join(', ') }) : t('This workspace has none.')}</li>
            <li><span className="font-semibold text-fg">{t('You can undo for {n} days.', { n: LEGACY_UNDO_DAYS })}</span> {t('Your account starts on the Free plan; nothing is charged.')}</li>
            {ws.demoData && <li>{t('Sample records are left out; only what you added yourself is saved.')}</li>}
          </ul>
          <div>
            <Button variant="tertiary" size="sm" leadingIcon={DownloadIcon} disabled={!prepared} onClick={() => prepared && download(prepared.bundle, ws.name)}>
              Save a backup file
            </Button>
            <p className="mt-1 text-caption text-fg-subtle">{t('Downloads exactly what will be uploaded.')}</p>
          </div>
        </div>
      }

      {step === 'working' &&
      <div className="flex flex-col gap-4">
          <ol aria-live="polite" className="flex flex-col gap-2.5 text-label">
            {order.map((p) => {
            const at = order.indexOf(progress);
            const i = order.indexOf(p);
            const Icon = i < at ? CheckCircle2Icon : i === at ? Loader2Icon : CircleIcon;
            return (
              <li key={p} className={i <= at ? 'flex items-center gap-2 text-fg' : 'flex items-center gap-2 text-fg-subtle'}>
                  <Icon size={16} className={i === at ? 'animate-spin motion-reduce:animate-none' : i < at ? 'text-success' : ''} aria-hidden />
                  {label[p]}
                </li>);

          })}
          </ol>
          <p className="text-caption text-fg-muted">{t('Your browser copy is not being changed.')}</p>
        </div>
      }

      {step === 'done' && result &&
      <div className="flex flex-col gap-4 text-label text-fg-muted">
          <InlineAlert tone="success" title={t('{name} is saved in your account', { name: ws.name })}>
            {t('You can undo until {date}. This browser copy is unchanged.', { date: formatDate(result.undoUntil) })}
          </InlineAlert>
          {secretAreas.length > 0 &&
        <div>
              <p className="font-semibold text-fg">{t('Re-enter these in Settings when you need them')}</p>
              <ul className="mt-1 list-disc pl-5">{secretAreas.map((a) => <li key={a}>{t(a)}</li>)}</ul>
            </div>
        }
          {reinvites.length > 0 &&
        <div>
              <p className="font-semibold text-fg">{t('Suggested invites')}</p>
              <ul className="mt-1 flex flex-col gap-1">
                {reinvites.map((r) =>
            <li key={r.contact} className="flex flex-wrap justify-between gap-2">
                    <span className="text-fg">{r.contact}</span>
                    <span>{t(roleInfo[r.role as keyof typeof roleInfo]?.label ?? r.role)}</span>
                  </li>
            )}
              </ul>
              <p className="mt-2 text-caption">{t('Nobody gets access until you invite them and they accept.')}</p>
            </div>
        }
        </div>
      }

      {step === 'error' && error &&
      <div className="flex flex-col gap-3">
          <InlineAlert tone="danger" title={error.title}>
            {error.body}
          </InlineAlert>
          {error.areas.length > 0 &&
        <p className="text-label text-fg-muted">
              {t('Found in: {areas}.', { areas: error.areas.map((a) => t(a)).join(', ') })}
            </p>
        }
          <p className="text-label text-fg-muted">{t('Nothing was saved to your account and nothing changed in this browser.')}</p>
        </div>
      }
    </Dialog>);

}
