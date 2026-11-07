import React from 'react';
import { toast } from 'sonner';
import { ClipboardCheckIcon } from 'lucide-react';
import type { AccessReview } from '../../types/admin';
import { audit, staffActor, useAdminStore } from '../../utils/admin/store';
import { roleInfo } from '../../data/staffRoles';
import { formatRelative } from '../../utils/format';
import { uid } from '../../utils/id';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

/** How often staff access should be re-checked. Example figure (D129). */
export const ACCESS_REVIEW_DAYS = 90;
const QUIET_DAYS = 30;

/** Staff & access → Access review: confirm every account still needs what it has (D129). */
export function AccessReviewSection() {
  const [store, setStore] = useAdminStore();
  const open = store.accessReviews.find((r) => !r.completedAt);
  const last = store.accessReviews.find((r) => r.completedAt);
  const daysSince = last?.completedAt ? Math.floor((Date.now() - Date.parse(last.completedAt)) / 86400000) : null;
  const due = daysSince === null || daysSince >= ACCESS_REVIEW_DAYS;
  const people = store.staff.filter((m) => m.status !== 'disabled');
  const decided = open ? people.filter((m) => open.decisions[m.id]).length : 0;

  const start = () => {
    const r: AccessReview = { id: uid('arv'), startedAt: new Date().toISOString(), startedBy: staffActor(store), completedAt: null, decisions: {} };
    setStore((s) => audit({ ...s, accessReviews: [r, ...s.accessReviews] }, { area: 'access', action: 'Started an access review', target: `${people.length} staff accounts`, reason: due ? 'Quarterly access review due.' : 'Access review started early.' }));
  };
  const decide = (staffId: string, d: 'keep' | 'change') => {
    if (!open) return;
    setStore((s) => ({ ...s, accessReviews: s.accessReviews.map((r) => (r.id === open.id ? { ...r, decisions: { ...r.decisions, [staffId]: d } } : r)) }));
  };
  const finish = () => {
    if (!open) return;
    const flagged = people.filter((m) => open.decisions[m.id] === 'change');
    setStore((s) =>
      audit(
        { ...s, accessReviews: s.accessReviews.map((r) => (r.id === open.id ? { ...r, completedAt: new Date().toISOString() } : r)) },
        { area: 'access', action: 'Completed an access review', target: `${people.length} accounts · ${flagged.length} need a change`, reason: flagged.length ? `Needs a change: ${flagged.map((m) => m.name).join(', ')}.` : 'Every account confirmed as still needed.' },
      ),
    );
    toast.success('Access review complete', { description: flagged.length ? `Use Change role or Disable for ${flagged.map((m) => m.name.split(' ')[0]).join(', ')} — each needs a second lead.` : 'Every account is confirmed.' });
  };

  return (
    <section aria-labelledby="review-heading" className="mt-12 border-t border-line pt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <h2 id="review-heading" className="flex items-center gap-2 text-heading font-semibold text-fg">
            Access review
            {!open && due && <Badge tone="warning">Due</Badge>}
          </h2>
          <p className="mt-1 text-label text-fg-muted">
            Every {ACCESS_REVIEW_DAYS} days, confirm each person still needs their role. {last?.completedAt ? `Last completed ${formatRelative(last.completedAt)} by ${last.startedBy.split(' ·')[0]}.` : 'No review has been done yet.'}
          </p>
        </div>
        {!open && (
          <Button variant={due ? 'primary' : 'secondary'} leadingIcon={ClipboardCheckIcon} onClick={start} className="shrink-0">
            Start review
          </Button>
        )}
      </div>

      {open && (
        <div className="mt-6">
          <p className="text-caption text-fg-subtle" aria-live="polite">
            {decided} of {people.length} reviewed · started {formatRelative(open.startedAt)}
          </p>
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {people.map((m) => {
              const quietDays = m.lastActiveAt ? Math.floor((Date.now() - Date.parse(m.lastActiveAt)) / 86400000) : null;
              const d = open.decisions[m.id];
              return (
                <li key={m.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:gap-6">
                  <div className="min-w-0 flex-1">
                    <p className="text-label font-semibold text-fg">
                      {m.name} <span className="font-normal text-fg-subtle">· {roleInfo(m.role).label}</span>
                    </p>
                    <p className="mt-0.5 text-caption text-fg-subtle">
                      {m.status === 'invited' ? `Invited ${formatRelative(m.invitedAt)}, never signed in` : m.lastActiveAt ? `Last active ${formatRelative(m.lastActiveAt)}` : 'Never active'}
                      {quietDays !== null && quietDays >= QUIET_DAYS && <span className="font-medium text-warning"> · Quiet for {quietDays} days — does this role still fit?</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5" role="group" aria-label={`Decision for ${m.name}`}>
                    {(['keep', 'change'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        aria-pressed={d === opt}
                        onClick={() => decide(m.id, opt)}
                        className={cn(
                          'min-h-[36px] whitespace-nowrap rounded-md border px-3 text-label font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                          d === opt ? (opt === 'keep' ? 'border-transparent bg-success-soft text-success' : 'border-transparent bg-warning-soft text-warning') : 'border-line text-fg-muted hover:text-fg',
                        )}
                      >
                        {opt === 'keep' ? 'Still needed' : 'Needs a change'}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={finish} disabled={decided < people.length}>
              Finish review
            </Button>
            {decided < people.length && <span className="text-caption text-fg-subtle">Decide for everyone to finish.</span>}
          </div>
        </div>
      )}
    </section>
  );
}
