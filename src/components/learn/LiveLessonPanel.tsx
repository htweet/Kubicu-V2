import React, { useEffect, useState } from 'react';
import { CalendarPlusIcon, VideoIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { CourseLesson } from '../../types/courses';
import { parseEmbed } from '../../utils/embeds';
import { JOIN_EARLY_MIN, appName, formatLiveWhen, joinUrl, liveIcs, liveState } from '../../utils/commerce/liveLessons';
import { buttonStyle, cardStyle, mix } from '../blocks/pageStyle';

interface Props {
  theme: PageTheme;
  lesson: CourseLesson;
  courseTitle: string;
}

/** What a student sees for a live session: when it is, Join near the start, then the recording (D229). */
export function LiveLessonPanel({ theme: t, lesson: l, courseTitle }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const state = liveState(l, now);
  const url = joinUrl(l.live);
  const when = l.live?.startsAt ? formatLiveWhen(l.live.startsAt) : '';
  const muted = { color: t.mutedText };
  const recording = l.videoUrl.trim() ? parseEmbed(l.videoUrl) : null;
  const hasRecording = !!(recording?.ok && recording.kind === 'video');

  const downloadIcs = () => {
    const ics = liveIcs(l, courseTitle);
    if (!ics) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = `${(l.title || 'live-session').replace(/[^\w-]+/g, '-').toLowerCase()}.ics`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  if (state === 'ended' && hasRecording && recording?.ok) {
    return (
      <div className="flex flex-col gap-2">
        <div className="overflow-hidden" style={{ ...cardStyle(t), padding: 0, aspectRatio: recording.frame.type === 'ratio' ? recording.frame.ratio : '16 / 9' }}>
          <iframe title={`${l.title} — recording`} src={recording.src} allow={recording.allow} sandbox={recording.sandbox} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full border-0" allowFullScreen />
        </div>
        <p className="text-[12.5px]" style={muted}>
          Recording of the live session on {when}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-5 sm:p-6" style={cardStyle(t)}>
      <div className="flex items-start gap-3">
        <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md" style={{ background: mix(t.text, 6), color: t.text }}>
          <VideoIcon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-medium" style={muted}>
            {state === 'open' ? 'Live now' : state === 'ended' ? 'Session ended' : state === 'upcoming' ? 'Live session' : 'Live session — time to be confirmed'}
          </p>
          <p className="text-[18px] font-semibold leading-snug" style={{ color: t.text }}>
            {when || 'The course owner hasn’t set the time yet'}
          </p>
          {l.minutes > 0 && (
            <p className="text-[13px]" style={muted}>
              About {l.minutes} min{l.live ? ` · on ${appName(l.live)}` : ''}
            </p>
          )}
        </div>
      </div>

      {state === 'open' && (
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 px-6 text-[15px] font-semibold sm:self-start" style={buttonStyle(t, 'featured')}>
            <VideoIcon size={17} aria-hidden /> Join the session
          </a>
        ) : (
          <p className="text-[14px]" style={{ color: t.text }} role="status">
            The meeting link isn’t ready. Contact the course owner.
          </p>
        )
      )}

      {state === 'upcoming' && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="button" onClick={downloadIcs} className="flex h-11 items-center justify-center gap-2 px-5 text-[14px] font-semibold" style={buttonStyle(t, 'default')}>
            <CalendarPlusIcon size={16} aria-hidden /> Add to my calendar
          </button>
          <p className="text-[13px]" style={muted}>
            The Join button appears here {JOIN_EARLY_MIN} minutes before the start. Your calendar reminds you 30 minutes before.
          </p>
        </div>
      )}

      {state === 'ended' && (
        <p className="text-[14px]" style={{ color: t.text }}>
          {l.videoUrl.trim() && !hasRecording ? 'The recording can’t be shown right now. Ask the course owner to check the link.' : 'The recording will appear here once the course owner adds it.'}
        </p>
      )}
    </div>
  );
}
