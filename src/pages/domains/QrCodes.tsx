import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DownloadIcon, PencilIcon, PlusIcon, QrCodeIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useDomains } from '../../contexts/DomainsContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useCan, useTeam } from '../../contexts/TeamContext';
import { useMainLink } from '../../hooks/useMainLink';
import type { QrDesign } from '../../types/domains';
import { campaignStats } from '../../utils/analytics/aggregate';
import { destinationExists, destinationLabel, fallbackDestination, shortDisplay, shortUrl } from '../../utils/domains/links';
import { useOps } from '../../contexts/OpsContext';
import { downloadPng, qrChecks, qrSvg, styleOf } from '../../utils/domains/qr';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { IllustrativeTag } from '../../components/ui/IllustrativeTag';
import { QrPreview } from '../../components/domains/QrPreview';
import { QrDesigner, initialsOf } from '../../components/domains/QrDesigner';

/** QR codes for flyers, counters and packaging — each one a tracked link (D62). On every plan. */
export function QrCodes() {
  const { data, deleteQr } = useDomains();
  const { current } = useWorkspace();
  const { data: commerce } = useCommerce();
  const { data: analytics } = useAnalytics();
  const { data: ops } = useOps();
  const can = useCan('pages.edit');
  const team = useTeam();
  const { mainHandle, host } = useMainLink();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<QrDesign | null | 'new'>(null);
  const [removing, setRemoving] = useState<QrDesign | null>(null);
  const stats = useMemo(() => campaignStats(analytics.events), [analytics.events]);
  const presetId = params.get('link');
  const presetLink = presetId ? data.links.find((l) => l.id === presetId) : undefined;
  // “Get QR code” shortcuts elsewhere in the app open a new code already pointing at their page, product or block (D72).
  const presetDest = params.get('dest') ?? undefined;
  const presetName = params.get('name') ?? undefined;

  useEffect(() => {
    if (!can.allowed) return;
    if (presetLink) {
      const existing = data.qrs.find((q) => q.linkId === presetLink.id);
      setEditing(existing ?? 'new');
    } else if (presetDest) setEditing('new');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetId, presetDest]);

  const close = () => {
    setEditing(null);
    if (presetId || presetDest) setParams({}, { replace: true });
  };

  const initials = initialsOf(current.name);
  const download = async (q: QrDesign) => {
    const link = data.links.find((l) => l.id === q.linkId);
    if (!link) return;
    try {
      const svg = await qrSvg(shortUrl(mainHandle, link.slug, host), styleOf(q, initials));
      await downloadPng(svg, `kubicu-qr-${link.slug}`, q.exportSize ?? 1024);
    } catch {
      toast.error('Couldn’t make the PNG', { description: 'Open the code and try SVG instead.' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="QR codes"
        description="Print them on flyers, counters and packaging. Each scan is counted, so you know which placement works."
        actions={
        <Button leadingIcon={PlusIcon} disabled={!can.allowed} title={can.allowed ? undefined : can.reason} onClick={() => setEditing('new')}>
            New QR code
          </Button>
        } />
      

      {data.qrs.length === 0 ?
      <div className="rounded-lg border border-line bg-raised">
          <EmptyState
          icon={QrCodeIcon}
          title="No QR codes yet"
          description="Point one at your page, your shop or a single product. You can change where it goes later without reprinting."
          action={
          <Button leadingIcon={PlusIcon} disabled={!can.allowed} onClick={() => setEditing('new')}>
                New QR code
              </Button>
          } />
        
        </div> :

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.qrs.map((q) => {
          const link = data.links.find((l) => l.id === q.linkId);
          if (!link) return null;
          const scans = stats.get(link.slug)?.visits ?? 0;
          const ok = destinationExists(current, commerce, link.destination);
          const weak = qrChecks(styleOf(q, initials)).contrast.level === 'fail';
          return (
            <li key={q.id} className="flex flex-col rounded-lg border border-line bg-raised">
                <div className="rounded-t-lg border-b border-line p-5" style={{ background: q.transparent ? undefined : q.bg }}>
                  <QrPreview url={shortUrl(mainHandle, link.slug, host)} style={styleOf(q, initials)} alt={`QR code: ${link.name}`} className="mx-auto max-w-[180px]" />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <p className="flex items-center gap-2 text-label font-semibold text-fg">
                    <span className="truncate">{link.name}</span>
                    {q.id.startsWith('qr_sample') && <IllustrativeTag note="Sample QR code — scans come from sample history." />}
                  </p>
                  <p className="truncate text-caption text-fg-muted">{shortDisplay(mainHandle, link.slug, host)}</p>
                  <p className={ok ? 'truncate text-caption text-fg-subtle' : 'text-caption text-danger'}>
                    → {ok ? destinationLabel(current, commerce, link.destination, ops.services) : `Destination removed — scans go to ${destinationLabel(current, commerce, fallbackDestination(current, commerce, link.destination), ops.services)} until you choose a new one`}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-label font-semibold tabular-nums text-fg">{scans.toLocaleString()}</span>
                    <span className="text-caption text-fg-subtle">scans</span>
                    {link.archivedAt && <Badge>Link archived</Badge>}
                    {weak && <Badge tone="danger">Low contrast</Badge>}
                  </div>
                  <div className="mt-auto flex items-center gap-1 pt-3">
                    <Button size="sm" variant="secondary" leadingIcon={DownloadIcon} disabled={weak} onClick={() => download(q)}>
                      PNG
                    </Button>
                    <span className="flex-1" />
                    <IconButton icon={PencilIcon} label={`Edit ${link.name}`} size="sm" disabled={!can.allowed} onClick={() => setEditing(q)} />
                    <IconButton icon={Trash2Icon} label={`Delete ${link.name}`} size="sm" disabled={!can.allowed} onClick={() => setRemoving(q)} />
                  </div>
                </div>
              </li>);

        })}
        </ul>
      }

      <QrDesigner
        open={editing !== null}
        onClose={close}
        qr={editing && editing !== 'new' ? editing : undefined}
        presetLink={editing === 'new' ? presetLink : undefined}
        presetDest={editing === 'new' && !presetLink ? presetDest : undefined}
        presetName={editing === 'new' && !presetLink ? presetName : undefined} />
      

      <Dialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        size="sm"
        title="Delete this QR design?"
        description="Codes you’ve already printed keep working — the link stays on Campaign links. Archive the link there to stop them."
        footer={
        <>
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Keep it
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              if (removing) {
                deleteQr(removing.id);
                team.log('pages', 'deleted a QR design', '/app/domains/qr');
              }
              setRemoving(null);
            }}>
            
              Delete design
            </Button>
          </>
        } />
      
    </div>);

}