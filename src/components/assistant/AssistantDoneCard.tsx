import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRightIcon, CalendarIcon, CheckCircle2Icon, LayoutTemplateIcon, PackageIcon, PencilLineIcon, PenToolIcon, QrCodeIcon, TicketIcon, Undo2Icon, BoxIcon } from "lucide-react";
import { AssistantSession } from "../../types/assistant";
import { Button } from "../ui/Button";
interface AssistantDoneCardProps {
  session: AssistantSession;
  onUndo: () => void;
}

/** The finished build: what was made, what's left, and where to go next (D211). */
export function AssistantDoneCard({
  session,
  onUndo
}: AssistantDoneCardProps) {
  const navigate = useNavigate();
  const plan = session.plan;
  if (!plan) return null;
  if (session.removed) return <div className="rounded-lg border border-line bg-raised p-4 text-caption text-fg-muted">This build was removed. Start over to build again.</div>;
  const canvas = `/app/canvas/${session.pageId}`;
  const created = session.created ?? {
    productIds: [],
    serviceIds: []
  };
  return <div className="rounded-lg border border-line bg-raised p-4">
      <div className="flex items-start gap-2.5">
        <CheckCircle2Icon size={20} className="mt-0.5 shrink-0 text-success" aria-hidden />
        <div className="min-w-0">
          <p className="text-label font-semibold text-fg">{session.answers.mode === 'add' ? 'New sections added to your page' : 'Your page is ready to finish'}</p>
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {plan.creates.map(c => <li key={c} className="text-caption text-fg-muted">
                · {c}
              </li>)}
          </ul>
          {session.savedTemplateId && <p className="mt-2 flex items-center gap-1.5 text-caption text-fg-muted">
              <LayoutTemplateIcon size={13} aria-hidden /> Saved privately as “{plan.source.name}” in your templates.
            </p>}
        </div>
      </div>

      {(created.productIds.length > 0 || created.serviceIds.length > 0 || created.qrId || plan.suggestSpace) && <ul className="mt-3 flex flex-wrap gap-1.5">
          {created.productIds.length > 0 && <QuickLink to="/app/commerce/products" icon={PackageIcon} label={`${created.productIds.length} product${created.productIds.length === 1 ? '' : 's'} in Commerce`} />}
          {created.serviceIds.length > 0 && <QuickLink to="/app/bookings/services" icon={CalendarIcon} label={`${created.serviceIds.length} service${created.serviceIds.length === 1 ? '' : 's'} in Bookings`} />}
          {created.qrId && <QuickLink to="/app/qr" icon={QrCodeIcon} label="Your QR code" />}
          {plan.suggestSpace === 'event' && <QuickLink to="/app/spaces" icon={TicketIcon} label="Selling tickets? Add an Event space" />}
        </ul>}

      {plan.gaps.length > 0 && <div className="mt-4 border-t border-line pt-3">
          <p className="text-caption font-semibold text-fg">Before you publish</p>
          <ul className="mt-1.5 flex flex-col divide-y divide-line">
            {plan.gaps.map(g => <li key={g} className="flex items-center gap-2 py-1.5">
                <PencilLineIcon size={13} className="shrink-0 text-warning" aria-hidden />
                <span className="min-w-0 flex-1 text-caption text-fg">{g}</span>
                <button type="button" onClick={() => navigate(canvas)} className="shrink-0 text-caption font-semibold text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  Fix
                </button>
              </li>)}
          </ul>
        </div>}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <Button leadingIcon={PenToolIcon} onClick={() => navigate(canvas)}>
          Open in canvas
        </Button>
        <Button variant="secondary" onClick={() => navigate('/app')}>
          Keep as draft
        </Button>
        {!session.removed && <Button variant="tertiary" leadingIcon={Undo2Icon} onClick={onUndo}>
            Remove everything
          </Button>}
      </div>
      <p className="mt-2 text-caption text-fg-subtle">Publish from the canvas when the gaps are filled — the usual checks run first.</p>
    </div>;
}
function QuickLink({
  to,
  icon: Icon,
  label
}: {
  to: string;
  icon: BoxIcon;
  label: string;
}) {
  return <li>
      <Link to={to} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-caption font-medium text-fg transition-colors duration-150 hover:border-line-strong hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        <Icon size={13} aria-hidden /> {label} <ArrowUpRightIcon size={12} className="text-fg-subtle" aria-hidden />
      </Link>
    </li>;
}