import React, { useState } from 'react';
import { CalendarOffIcon, ClockIcon, PencilIcon, UsersIcon } from 'lucide-react';
import type { Availability, Booking, StaffHours } from '../../types/ops';
import { useTeam } from '../../contexts/TeamContext';
import { Card } from '../ui/layout/Card';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StaffHoursDialog } from './StaffHoursDialog';
import { dateKeyInTz } from '../../utils/ops/slots';
import { initialsOf } from '../../utils/ops/staff';
import { providerName } from '../../utils/ops/calendarSync';
import { useT } from '../../contexts/LocaleContext';

interface Props {
  draft: Availability;
  bookings: Booking[];
  onChange: (staff: StaffHours[]) => void;
}

const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Bookings → Availability → Team hours (D140). */
export function TeamHoursCard({ draft, bookings, onChange }: Props) {
  const team = useTeam();
  const { t: tr } = useT();
  const [editing, setEditing] = useState<string | null>(null);
  const staff = draft.staff ?? [];
  const tz = draft.timeZone;
  const today = dateKeyInTz(Date.now(), tz);
  const members = team.data.members;
  // Everyone on the team has a row; people who left keep theirs (not bookable) until removed.
  const rows: {s: StaffHours;left: boolean;}[] = [
  ...members.map((m) => ({ s: staff.find((x) => x.memberId === m.id) ?? { memberId: m.id, name: m.name, photo: null, bookable: false, weekly: null, timeOff: [], calendarId: null }, left: false })),
  ...staff.filter((x) => !members.some((m) => m.id === x.memberId)).map((s) => ({ s: { ...s, bookable: false }, left: true }))];

  const upsert = (s: StaffHours) => {
    const exists = staff.some((x) => x.memberId === s.memberId);
    onChange(exists ? staff.map((x) => x.memberId === s.memberId ? s : x) : [...staff, s]);
  };
  const bookableCount = rows.filter((r) => r.s.bookable && !r.left).length;
  const editingRow = rows.find((r) => r.s.memberId === editing)?.s ?? null;

  const summary = (s: StaffHours) => {
    if (!s.weekly) return tr('Follows business hours');
    const open = s.weekly.filter((h) => !h.closed);
    if (!open.length) return tr('No working days set');
    return open.map((h) => `${tr(dayShort[h.day])} ${h.open}–${h.close}`).slice(0, 3).join(' · ') + (open.length > 3 ? ` +${open.length - 3}` : '');
  };

  return (
    <Card
      id="team-hours"
      title="Team hours"
      icon={UsersIcon}
      description={bookableCount ? tr(bookableCount === 1 ? '{n} person customers can book. A time shows when someone who does the service is free.' : '{n} people customers can book. A time shows when someone who does the service is free.', { n: bookableCount }) : 'Customers book your business as one. Turn people on to let customers choose who they see.'}
      body="flush">
      
      <ul className="flex flex-col divide-y divide-line">
        {rows.map(({ s, left }) => {
          const away = s.timeOff.find((t) => t.to >= today);
          const cal = s.calendarId ? (draft.calendars ?? []).find((c) => c.id === s.calendarId) : null;
          return (
            <li key={s.memberId} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center md:px-6">
              <span className="flex min-w-0 flex-1 items-center gap-3">
                <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sunken text-caption font-semibold text-fg-muted">
                  {initialsOf(s.name)}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-label font-semibold text-fg">{s.name}</span>
                    {left && <Badge tone="neutral">{tr('Left the team')}</Badge>}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-caption text-fg-subtle">
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon size={12} aria-hidden />
                      {summary(s)}
                    </span>
                    {away &&
                    <span className="inline-flex items-center gap-1 text-fg-muted">
                        <CalendarOffIcon size={12} aria-hidden />
                        {tr('Away {dates}', { dates: away.from === away.to ? away.from : `${away.from} → ${away.to}` })}
                      </span>
                    }
                    {cal && <span>{tr('{provider} connected', { provider: providerName(cal.provider) })}</span>}
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <Switch id={`bk-${s.memberId}`} label={tr('Customers can book {name}', { name: s.name.split(' ')[0] })} hideLabel checked={s.bookable && !left} disabled={left} onChange={(v) => upsert({ ...s, name: members.find((m) => m.id === s.memberId)?.name ?? s.name, bookable: v })} />
                <Button size="sm" variant="secondary" leadingIcon={PencilIcon} onClick={() => setEditing(s.memberId)} disabled={left}>
                  Hours
                </Button>
              </span>
            </li>);

        })}
      </ul>
      <StaffHoursDialog open={!!editing} onClose={() => setEditing(null)} staff={editingRow} availability={draft} bookings={bookings} onSave={upsert} />
    </Card>);

}