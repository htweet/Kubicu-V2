import React from 'react';
import { CalendarClockIcon } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { useT } from '../../contexts/LocaleContext';
import { formatSchedule } from '../../utils/schedule';
import { Badge } from '../ui/Badge';

export function PageStatusBadge({ className }: { className?: string }) {
  const { t: tr } = useT();
  const { state, hasUnpublishedChanges } = useEditor();
  if (state.scheduled) {
    const when = formatSchedule(state.scheduled.at);
    return (
      <Badge tone="info" icon={CalendarClockIcon} className={className}>
        <span title={tr('Goes live {when}', { when })}>{tr('Scheduled · {when}', { when })}</span>
      </Badge>
    );
  }
  if (!state.published) {
    return (
      <Badge tone="neutral" dot className={className}>
        {tr('Draft · not published')}
      </Badge>
    );
  }
  if (hasUnpublishedChanges) {
    return (
      <Badge tone="accent" dot className={className}>
        {tr('Unpublished changes')}
      </Badge>
    );
  }
  return (
    <Badge tone="success" dot className={className}>
      {tr('Live')}
    </Badge>
  );
}
