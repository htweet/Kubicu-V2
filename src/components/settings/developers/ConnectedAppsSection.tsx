import React, { useState } from 'react';
import { PlugIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useTeam } from '../../../contexts/TeamContext';
import { useDevelopers } from '../../../hooks/useDevelopers';
import { scopeLabel } from '../../../data/developerApi';
import type { ConnectedApp } from '../../../types/developers';
import { formatRelative } from '../../../utils/format';
import { Card } from '../../ui/layout/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';

/** Apps someone in the workspace allowed to act for it (D131). Revoking cuts access immediately. */
export function ConnectedAppsSection({ canManage }: {canManage: boolean;}) {
  const team = useTeam();
  const { data, update } = useDevelopers();
  const [revoking, setRevoking] = useState<ConnectedApp | null>(null);

  return (
    <Card id="apps" title="Connected apps" description="Outside apps that someone here allowed to work with your workspace. Each only gets the permissions shown." body="flush">
      {data.apps.length === 0 ?
      <p className="px-5 py-6 text-caption text-fg-muted md:px-6">No apps connected. When you allow one, it appears here and you can cut it off at any time.</p> :

      <ul className="divide-y divide-line">
          {data.apps.map((a) =>
        <li key={a.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:gap-4 md:px-6">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-subtle" aria-hidden>
                <PlugIcon size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2 text-label font-semibold text-fg">
                  {a.name}
                  {a.sample && <Badge tone="neutral">Sample</Badge>}
                </span>
                <span className="block text-caption text-fg-subtle">
                  by {a.developer} · allowed by {a.connectedBy} {formatRelative(a.connectedAt)}
                  {a.lastUsedAt ? ` · last used ${formatRelative(a.lastUsedAt)}` : ''}
                </span>
                <ul className="mt-2 flex flex-col gap-0.5">
                  {a.scopes.map((s) =>
              <li key={s} className="text-caption text-fg-muted">
                      · {scopeLabel(s)}
                    </li>
              )}
                </ul>
              </span>
              {canManage &&
          <Button size="sm" variant="tertiary" onClick={() => setRevoking(a)}>
                  Disconnect…
                </Button>
          }
            </li>
        )}
        </ul>
      }
      <Dialog
        open={!!revoking}
        onClose={() => setRevoking(null)}
        size="sm"
        title={`Disconnect ${revoking?.name}?`}
        description="It loses access straight away. Data it already copied stays with that app — ask its developer to delete it if you need."
        footer={
        <>
            <Button variant="secondary" onClick={() => setRevoking(null)}>
              Keep connected
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              if (!revoking) return;
              update((d) => ({ ...d, apps: d.apps.filter((x) => x.id !== revoking.id) }));
              team.log('settings', `disconnected ${revoking.name}`, '/app/settings/developers');
              toast.success(`${revoking.name} disconnected`);
              setRevoking(null);
            }}>
            
              Disconnect
            </Button>
          </>
        }>
        
        {null}
      </Dialog>
    </Card>);

}