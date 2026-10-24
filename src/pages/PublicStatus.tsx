import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import type { Incident } from '../types/admin';
import { useAdminStore } from '../utils/admin/store';
import { activeIncidents, impactLabels, incidentStatusLabels, overallState, serviceStateLabels, serviceStates, type ServiceState } from '../utils/admin/incidents';
import { platformServices } from '../data/platformServices';
import { KubicuLogo } from '../components/shell/KubicuLogo';
import { cn } from '../utils/cn';

const HISTORY_DAYS = 14;

const stateStyle: Record<ServiceState, {text: string;bg: string;icon: typeof CheckCircle2Icon;}> = {
  operational: { text: 'text-success', bg: 'bg-success-soft', icon: CheckCircle2Icon },
  minor: { text: 'text-warning', bg: 'bg-warning-soft', icon: AlertTriangleIcon },
  major: { text: 'text-danger', bg: 'bg-danger-soft', icon: AlertTriangleIcon },
  outage: { text: 'text-danger', bg: 'bg-danger-soft', icon: XCircleIcon }
};

const when = (iso: string) => new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** Public status page `/status` (D129): service states and incident updates written by KUBICU staff. */
export function PublicStatus() {
  const [store] = useAdminStore();
  const overall = overallState(store.incidents);
  const states = serviceStates(store.incidents);
  const open = activeIncidents(store.incidents);
  const past = store.incidents.filter((i) => i.status === 'resolved' && i.resolvedAt && Date.now() - Date.parse(i.resolvedAt) < HISTORY_DAYS * 86400000);
  const O = stateStyle[overall];

  useEffect(() => {
    const prev = document.title;
    document.title = 'KUBICU status';
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-canvas text-fg">
      <header className="border-b border-line bg-raised">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" aria-label="KUBICU home">
            <KubicuLogo withWordmark />
          </Link>
          <span className="text-label font-medium text-fg-muted">System status</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-8">
        <section aria-live="polite" className={cn('flex items-center gap-3 rounded-lg px-5 py-5', O.bg)}>
          <O.icon size={24} className={cn('shrink-0', O.text)} aria-hidden />
          <div>
            <h1 className="text-title font-semibold text-fg">{overall === 'operational' ? 'Everything is working normally' : open.length === 1 ? open[0].title : `${open.length} issues right now`}</h1>
            <p className="mt-0.5 text-label text-fg-muted">{overall === 'operational' ? 'Pages, checkout and payouts are running as usual.' : 'We’re on it. Updates appear below as soon as we post them.'}</p>
          </div>
        </section>

        {open.length > 0 &&
        <section aria-labelledby="open-heading" className="mt-10">
            <h2 id="open-heading" className="text-heading font-semibold text-fg">
              Happening now
            </h2>
            <div className="mt-4 flex flex-col gap-6">
              {open.map((i) =>
            <IncidentTimeline key={i.id} incident={i} />
            )}
            </div>
          </section>
        }

        <section aria-labelledby="services-heading" className="mt-10">
          <h2 id="services-heading" className="text-heading font-semibold text-fg">
            Services
          </h2>
          <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-raised">
            {platformServices.map((s) => {
              const st = states[s.name] ?? 'operational';
              const S = stateStyle[st];
              return (
                <li key={s.name} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <span className="text-label font-medium text-fg">{s.name}</span>
                  <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-label font-medium', S.text)}>
                    <S.icon size={15} aria-hidden />
                    {serviceStateLabels[st]}
                  </span>
                </li>);

            })}
          </ul>
        </section>

        <section aria-labelledby="past-heading" className="mt-10">
          <h2 id="past-heading" className="text-heading font-semibold text-fg">
            Past {HISTORY_DAYS} days
          </h2>
          {past.length === 0 ?
          <p className="mt-3 text-label text-fg-muted">No incidents.</p> :

          <div className="mt-4 flex flex-col gap-6">
              {past.map((i) =>
            <IncidentTimeline key={i.id} incident={i} />
            )}
            </div>
          }
        </section>

        <p className="mt-12 border-t border-line pt-6 text-caption text-fg-subtle">
          Prototype: statuses here are written by KUBICU staff in the staff console, not by live monitoring. Problem with your own page or a payment? <Link to="/help" className="font-medium text-action hover:underline">Get help</Link>.
        </p>
      </main>
    </div>);

}

function IncidentTimeline({ incident: i }: {incident: Incident;}) {
  return (
    <article className="rounded-lg border border-line bg-raised px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-label font-semibold text-fg">{i.title}</h3>
        <span className="text-caption text-fg-subtle">
          {impactLabels[i.impact]} · {i.services.join(', ')}
        </span>
      </div>
      <ol className="mt-3 flex flex-col gap-3 border-l border-line pl-4">
        {[...i.updates].reverse().map((u) =>
        <li key={u.id}>
            <p className="text-caption text-fg-subtle">
              <span className="font-semibold text-fg">{incidentStatusLabels[u.status]}</span> · {when(u.at)}
            </p>
            <p className="mt-0.5 text-label text-fg-muted">{u.message}</p>
          </li>
        )}
      </ol>
    </article>);

}