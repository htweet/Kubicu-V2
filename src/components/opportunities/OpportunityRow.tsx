import React from "react";
import { useNavigate } from "react-router-dom";
import { AlarmClockIcon, ArrowRightIcon, BanknoteIcon, CalendarXIcon, CheckIcon, CreditCardIcon, MessageCircleIcon, MoreHorizontalIcon, PackageXIcon, RotateCcwIcon, UserRoundIcon, WorkflowIcon, ListTodoIcon, BoxIcon } from "lucide-react";
import { Opportunity, OpportunityKind, kindLabels } from "../../utils/opportunities";
import { formatNgn, formatRelative, whatsappLink } from "../../utils/format";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { Menu } from "../ui/Menu";
import { SampleTag } from "../commerce/StatusBadges";
const kindIcons: Record<OpportunityKind, BoxIcon> = {
  unpaid: BanknoteIcon,
  renewal: CreditCardIcon,
  deposit: CalendarXIcon,
  noshow: CalendarXIcon,
  lead: UserRoundIcon,
  followup: ListTodoIcon,
  soldout: PackageXIcon,
  automation: WorkflowIcon
};
interface OpportunityRowProps {
  item: Opportunity;
  /** Set when the row is in the snoozed/dismissed list. */
  hiddenNote?: string;
  onSnooze: (days: number) => void;
  onDismiss: () => void;
  onRestore: () => void;
}

/** One opportunity: what it is, why, what's at stake and the one next step (D81). */
export function OpportunityRow({
  item,
  hiddenNote,
  onSnooze,
  onDismiss,
  onRestore
}: OpportunityRowProps) {
  const navigate = useNavigate();
  const Icon = kindIcons[item.kind];
  return <li className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-3 px-5 py-4 md:grid-cols-[auto_minmax(0,1fr)_7.5rem_auto] md:items-center md:px-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-sunken text-fg-muted" aria-hidden>
        <Icon size={18} strokeWidth={2.1} />
      </span>

      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption font-medium text-fg-subtle">
          <span>{kindLabels[item.kind]}</span>
          <span aria-hidden>·</span>
          <span>{hiddenNote ?? `waiting ${formatRelative(item.since).replace(/ ago$/, '')}`}</span>
          {item.sample && <SampleTag />}
        </p>
        <p className="mt-0.5 truncate text-label font-semibold text-fg">{item.title}</p>
        <p className="mt-0.5 text-caption text-fg-muted">{item.reason}</p>
      </div>

      <p className="col-start-2 text-label font-semibold tabular-nums text-fg md:col-start-auto md:text-right">
        {item.valueNgn !== null ? formatNgn(item.valueNgn) : <span className="font-normal text-fg-subtle">No amount</span>}
      </p>

      <div className="col-start-2 flex items-center gap-2 md:col-start-auto md:justify-end">
        {hiddenNote ? <Button size="sm" variant="secondary" leadingIcon={RotateCcwIcon} onClick={onRestore}>
            Bring back
          </Button> : <>
            {item.nudge ? <a href={whatsappLink(item.nudge.phone, item.nudge.message)} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-sm bg-action px-3 text-label font-medium text-action-fg transition-colors duration-150 hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas">
                <MessageCircleIcon size={14} aria-hidden /> Message<span className="sr-only"> {item.title} on WhatsApp (opens in a new tab)</span>
              </a> : <Button size="sm" variant="secondary" trailingIcon={ArrowRightIcon} onClick={() => navigate(item.to)}>
                Open
              </Button>}
            <Menu trigger={(p) => <IconButton {...p} icon={MoreHorizontalIcon} label={`More for ${item.title}`} size="sm" />} items={[...(item.nudge ? [{
          id: 'open',
          label: 'Open in the app',
          icon: ArrowRightIcon,
          onSelect: () => navigate(item.to)
        }] : []), {
          id: 'done',
          label: 'Mark as handled',
          icon: CheckIcon,
          onSelect: onDismiss
        }, {
          id: 'snooze1',
          label: 'Remind me tomorrow',
          icon: AlarmClockIcon,
          onSelect: () => onSnooze(1)
        }, {
          id: 'snooze7',
          label: 'Remind me next week',
          icon: AlarmClockIcon,
          onSelect: () => onSnooze(7)
        }]} />
          </>}
      </div>
    </li>;
}