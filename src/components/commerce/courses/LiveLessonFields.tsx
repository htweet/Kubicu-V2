import React from 'react';
import { Link } from 'react-router-dom';
import { CopyIcon, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { CourseLesson, LessonLive } from '../../../types/courses';
import type { MeetingApp } from '../../../types/ops';
import { useOptionalOps } from '../../../contexts/OpsContext';
import { connectionFor, meetingAppIds, meetingApps } from '../../../utils/ops/meetings';
import { blankLive, fromLocalInput, joinUrl, renewLiveMeeting, toLocalInput, withApp } from '../../../utils/commerce/liveLessons';
import { TextInput } from '../../ui/TextInput';
import { Button } from '../../ui/Button';
import { cn } from '../../../utils/cn';

interface Props {
  lesson: CourseLesson;
  onChange: (patch: Partial<CourseLesson>) => void;
  showErrors: boolean;
}

/** Date, time and meeting link for a live course session (D229). Meeting apps are the ones connected in Bookings (D225). */
export function LiveLessonFields({ lesson: l, onChange, showErrors }: Props) {
  const ops = useOptionalOps();
  const live = l.live ?? blankLive();
  const set = (next: LessonLive) => onChange({ live: next });
  const id = (f: string) => `${l.id}-${f}`;
  const connected = ops ? meetingAppIds.filter((a) => connectionFor(ops.data.availability, a)) : [];
  const choices: (MeetingApp | 'own')[] = [...connected, 'own'];
  // An app chosen earlier but since disconnected keeps its link; it's listed so the choice stays visible.
  if (live.app !== 'own' && !choices.includes(live.app)) choices.unshift(live.app);

  const whenError = showErrors && !live.startsAt ? 'Set the date and time' : undefined;
  const ownError = live.app === 'own' && (live.ownUrl.trim() || showErrors) && !joinUrl(live) ? 'Paste the full link, starting https://' : undefined;

  return (
    <div className="flex flex-col gap-4">
      <TextInput
        id={id('when')}
        type="datetime-local"
        label="Date and time"
        value={toLocalInput(live.startsAt)}
        error={whenError}
        hint="In your device’s time zone. Students see it in theirs."
        onChange={(e) => set({ ...live, startsAt: fromLocalInput(e.target.value) })}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-label font-medium text-fg">Meeting link</legend>
        <div role="radiogroup" aria-label="Meeting link" className="flex flex-wrap gap-2">
          {choices.map((c) => {
            const on = live.app === c;
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => set(withApp(l.id, live, c))}
                className={cn(
                  'h-9 rounded-md border px-3 text-label font-medium transition-[background-color,border-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  on ? 'border-action bg-action-soft text-fg' : 'border-line-strong text-fg-muted hover:bg-sunken hover:text-fg',
                )}
              >
                {c === 'own' ? 'I’ll add my own link' : meetingApps[c].name}
              </button>
            );
          })}
        </div>
        {connected.length === 0 && (
          <p className="text-caption text-fg-subtle">
            Connect Google Meet, Zoom or Teams in{' '}
            <Link to="/app/bookings/availability" className="font-medium text-action hover:underline">
              Bookings → Availability
            </Link>{' '}
            to have a link made for you.
          </p>
        )}
      </fieldset>

      {live.app === 'own' ? (
        <TextInput id={id('own')} label="Your meeting link" value={live.ownUrl} placeholder="https://…" error={ownError} hint="Only students with access to the course can see it." onChange={(e) => set({ ...live, ownUrl: e.target.value })} />
      ) : live.meeting ? (
        <div className="flex flex-col gap-2 rounded-md border border-line bg-sunken px-3 py-2.5">
          <span className="text-caption text-fg-subtle">{meetingApps[live.meeting.app].name} link for this session</span>
          <span className="break-all text-label text-fg">{live.meeting.url}</span>
          {live.meeting.code && <span className="text-caption text-fg-muted">{live.meeting.app === 'zoom' ? 'Passcode' : 'Meeting ID'}: {live.meeting.code}</span>}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="tertiary"
              leadingIcon={CopyIcon}
              onClick={() => {
                navigator.clipboard?.writeText(live.meeting?.url ?? '').then(() => toast('Link copied'), () => toast.error('Couldn’t copy'));
              }}
            >
              Copy
            </Button>
            <Button size="sm" variant="tertiary" leadingIcon={RefreshCwIcon} onClick={() => set(renewLiveMeeting(l.id, live))}>
              New link
            </Button>
          </div>
          <span className="text-caption text-fg-subtle">Prototype: the link looks real but doesn’t open a meeting.</span>
        </div>
      ) : null}
    </div>
  );
}
