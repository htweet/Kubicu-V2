import type { Incident, IncidentImpact, IncidentStatus } from '../../types/admin';
import { platformServiceNames } from '../../data/platformServices';

export const incidentStatusLabels: Record<IncidentStatus, string> = {
  investigating: 'Investigating',
  identified: 'Cause found',
  monitoring: 'Fix in place, watching',
  resolved: 'Resolved'
};

export const impactLabels: Record<IncidentImpact, string> = {
  minor: 'Slower than usual',
  major: 'Partly down',
  outage: 'Down'
};

export type ServiceState = 'operational' | IncidentImpact;

const rank: Record<ServiceState, number> = { operational: 0, minor: 1, major: 2, outage: 3 };

export const serviceStateLabels: Record<ServiceState, string> = {
  operational: 'Working normally',
  minor: 'Slower than usual',
  major: 'Partly down',
  outage: 'Down'
};

export const activeIncidents = (list: Incident[]) => list.filter((i) => i.status !== 'resolved');

/** Each service's state is the worst impact among the open incidents that affect it. */
export function serviceStates(list: Incident[]): Record<string, ServiceState> {
  const out: Record<string, ServiceState> = Object.fromEntries(platformServiceNames.map((n) => [n, 'operational' as ServiceState]));
  for (const i of activeIncidents(list)) for (const s of i.services) if (rank[i.impact] > rank[out[s] ?? 'operational']) out[s] = i.impact;
  return out;
}

export function overallState(list: Incident[]): ServiceState {
  return Object.values(serviceStates(list)).reduce<ServiceState>((w, s) => rank[s] > rank[w] ? s : w, 'operational');
}