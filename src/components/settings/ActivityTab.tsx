import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DownloadIcon, HistoryIcon } from 'lucide-react';
import type { ActivityArea } from '../../types/team';
import { useTeam } from '../../contexts/TeamContext';
import { downloadCsv, toCsv } from '../../utils/csv';
import { formatRelative, formatTimestamp } from '../../utils/format';
import { initials } from '../../utils/team';
import { Button } from '../ui/Button';
import { SelectInput } from '../ui/SelectInput';
import { EmptyState } from '../ui/EmptyState';
import { List } from '../ui/layout/ListRow';

const areaLabels: Record<ActivityArea, string> = { team: 'Team', pages: 'Pages', commerce: 'Commerce', bookings: 'Bookings', audience: 'Audience', settings: 'Settings' };
type Period = '1' | '7' | '30' | 'all';

/** Settings → Activity: who did what, newest first (D60). */
export function ActivityTab() {
  const team = useTeam();
  const [person, setPerson] = useState('all');
  const [area, setArea] = useState<'all' | ActivityArea>('all');
  const [period, setPeriod] = useState<Period>('30');
  const people = useMemo(() => Array.from(new Set(team.data.activity.map((a) => a.actor))).sort(), [team.data.activity]);

  const rows = useMemo(() => {
    const since = period === 'all' ? 0 : Date.now() - Number(period) * 86400000;
    return team.data.activity.filter((a) => (person === 'all' || a.actor === person) && (area === 'all' || a.area === area) && Date.parse(a.at) >= since);
  }, [team.data.activity, person, area, period]);

  // Group by day so the log reads like a diary.
  const groups = useMemo(() => {
    const out: {day: string;items: typeof rows;}[] = [];
    rows.forEach((r) => {
      const day = new Date(r.at).toDateString();
      const last = out[out.length - 1];
      if (last && last.day === day) last.items.push(r);else
      out.push({ day, items: [r] });
    });
    return out;
  }, [rows]);

  const exportCsv = () => downloadCsv(`kubicu-activity-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(['when', 'who', 'area', 'what'], rows.map((r) => [r.at, r.actor, r.area, r.text])));
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="grid grid-cols-2 gap-3 md:flex">
          <div className="md:w-48">
            <SelectInput id="act-person" label="Who" value={person} onChange={setPerson} options={[{ value: 'all', label: 'Everyone' }, ...people.map((p) => ({ value: p, label: p }))]} />
          </div>
          <div className="md:w-40">
            <SelectInput<'all' | ActivityArea> id="act-area" label="Area" value={area} onChange={setArea} options={[{ value: 'all', label: 'Everything' }, ...(Object.keys(areaLabels) as ActivityArea[]).map((a) => ({ value: a, label: areaLabels[a] }))]} />
          </div>
          <div className="col-span-2 md:w-40">
            <SelectInput<Period> id="act-period" label="When" value={period} onChange={setPeriod} options={[{ value: '1', label: 'Last 24 hours' }, { value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' }, { value: 'all', label: 'All time' }]} />
          </div>
        </div>
        <Button variant="secondary" leadingIcon={DownloadIcon} disabled={rows.length === 0} onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      {rows.length === 0 ?
      <EmptyState framed icon={HistoryIcon} title="Nothing here" description={team.data.activity.length ? 'No activity matches these filters.' : 'Publishing, refunds, role changes and assignments show up here as people work.'} /> :

      <div className="flex flex-col gap-6">
          {groups.map((g) =>
        <section key={g.day} aria-label={g.day}>
              <h3 className="text-caption font-semibold text-fg-subtle">{g.day === today ? 'Today' : g.day === yesterday ? 'Yesterday' : new Date(g.day).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</h3>
              <List ordered ruled className="mt-2">
                {g.items.map((a) =>
            <li key={a.id} className="flex items-start gap-3 py-2.5">
                    <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-action-soft text-caption font-semibold text-action">
                      {initials(a.actor)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-label text-fg">
                        <span className="font-semibold">{a.actor}</span> {a.href ? <Link to={a.href} className="underline-offset-2 hover:underline">{a.text}</Link> : a.text}
                      </p>
                      <p className="text-caption text-fg-subtle" title={formatTimestamp(a.at)}>
                        {areaLabels[a.area]} · {formatRelative(a.at)}
                      </p>
                    </div>
                  </li>
            )}
              </List>
            </section>
        )}
        </div>
      }
      <p className="text-caption text-fg-subtle">Kept for the last 500 changes in this prototype. Visitors’ orders and bookings appear in their own screens, not here.</p>
    </div>);

}