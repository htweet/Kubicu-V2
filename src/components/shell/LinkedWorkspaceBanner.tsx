
import { Link } from 'react-router-dom';
import { CloudIcon } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useImports } from '../../contexts/ImportsContext';
import { useT } from '../../contexts/LocaleContext';
import { formatDate } from '../../utils/billing';

/**
 * "Linked to your account" notice (D-UI-2), in the same frame as DemoDataBanner. Shown while the open
 * browser workspace has a live import. Only loaded with real sign-in on.
 */
export function LinkedWorkspaceBanner() {
  const { current } = useWorkspace();
  const imports = useImports();
  const { t } = useT();
  const link = imports?.linkFor(current.id);
  if (!link) return null;
  const canUndo = new Date(link.undoUntil).getTime() > Date.now();
  return (
    <div role="status" className="border-b border-line bg-info-soft">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-5 py-2.5 sm:flex-row sm:items-center md:px-10">
        <p className="flex flex-1 items-start gap-2 text-label text-info">
          <CloudIcon size={15} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            <span className="font-semibold">{t('Linked to your account.')}</span>{' '}
            {t('Workspace settings and a full copy are saved in your account; pages, shop and team still live in this browser until they move over.')}
            {canUndo && <> {t('Undo until {date}.', { date: formatDate(link.undoUntil) })}</>}
          </span>
        </p>
        <Link
          to="/app/account/workspaces"
          className="inline-flex h-9 shrink-0 items-center justify-center self-start whitespace-nowrap rounded-md border border-line bg-raised px-3 text-label font-medium text-fg hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:self-auto">
          
          {t('Manage')}
        </Link>
      </div>
    </div>);

}
