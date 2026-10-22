import React from 'react';
import { CalendarClockIcon } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { formatSchedule } from '../../utils/schedule';
import { Badge } from '../ui/Badge';

export function PageStatusBadge({ className }: {className?: string;}) {
  const { state, hasUnpublishedChanges } = useEditor();
  if (state.scheduled) {
    return (
      <Badge tone="info" icon={CalendarClockIcon} className={className}>
        <span title={`Goes live ${formatSchedule(state.scheduled.at)}`}>Scheduled · {formatSchedule(state.scheduled.at)}</span>
      </Badge>);

  }
  if (!state.published) {
    return (
      <Badge tone="neutral" dot className={className}>
        Draft · not published
      </Badge>);

  }
  if (hasUnpublishedChanges) {
    return (
      <Badge tone="accent" dot className={className}>
        Unpublished changes
      </Badge>);

  }
  return (
    <Badge tone="success" dot className={className}>
      Live
    </Badge>);

}