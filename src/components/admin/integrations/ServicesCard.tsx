import React, { useState } from 'react';
import { toast } from 'sonner';
import { SendIcon } from 'lucide-react';
import { audit, staffActor, useAdminStore } from '../../../utils/admin/store';
import { integrationServices, type IntegrationService } from '../../../data/integrationServices';
import { formatRelative } from '../../../utils/format';
import { Card } from '../../ui/layout/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { IllustrativeTag } from '../../ui/IllustrativeTag';

/** Each outside service with its mode, last test and a "Send test" (D135). Simulated until partners are connected. */
export function ServicesCard() {
  const [store, setStore] = useAdminStore();
  const [busy, setBusy] = useState<string | null>(null);

  const test = (svc: IntegrationService) => {
    setBusy(svc.id);
    window.setTimeout(() => {
      const ok = !svc.failsWith;
      const message = ok ? `Test ${svc.mode === 'test' ? 'transaction' : 'message'} accepted by the simulated ${svc.name.toLowerCase()} service` : svc.failsWith!;
      setStore((s) => audit({ ...s, integrationTests: { ...s.integrationTests, [svc.id]: { at: new Date().toISOString(), ok, message, by: staffActor(s) } } }, { area: 'integrations', action: `Sent a test to ${svc.name} — ${ok ? 'passed' : 'failed'}`, target: svc.name, reason: message }));
      setBusy(null);
      if (ok) toast.success(`${svc.name}: test passed`, { description: message });
      else toast.error(`${svc.name}: test failed`, { description: message });
    }, 700);
  };

  return (
    <Card id="services" title="Outside services" description="What each connection is for, whether it’s in test or preview, and the last test result." body="flush" actions={<IllustrativeTag note="No partner is connected in the prototype. Tests are simulated and two are set to fail so the error state can be seen." />}>
      <ul className="divide-y divide-line">
        {integrationServices.map((svc) => {
          const last = store.integrationTests[svc.id];
          return (
            <li key={svc.id} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4 md:px-6">
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2 text-label font-semibold text-fg">
                  {svc.name}
                  <Badge tone={svc.mode === 'test' ? 'info' : 'neutral'}>{svc.mode === 'test' ? 'Test mode' : 'Preview'}</Badge>
                  {last && (
                    <Badge tone={last.ok ? 'success' : 'danger'} dot>
                      {last.ok ? 'Last test passed' : 'Last test failed'}
                    </Badge>
                  )}
                </span>
                <span className="block text-caption text-fg-subtle">
                  {svc.purpose} · needs: {svc.partner}
                </span>
                {last && (
                  <span className={last.ok ? 'block text-caption text-fg-muted' : 'block text-caption text-danger'}>
                    {last.message} · {last.by.split(' ·')[0]} · {formatRelative(last.at)}
                  </span>
                )}
              </span>
              <Button size="sm" variant="secondary" leadingIcon={SendIcon} loading={busy === svc.id} onClick={() => test(svc)}>
                Send test
              </Button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
