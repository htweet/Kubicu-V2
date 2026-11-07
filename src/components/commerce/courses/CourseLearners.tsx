import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DownloadIcon, UserPlusIcon, UserMinusIcon, AwardIcon } from 'lucide-react';
import { useCommerce } from '../../../contexts/CommerceContext';
import { addLearner, courseAccess, enrolSourceLabels, enrolmentsFor, findCourse, progressOf, removeLearner } from '../../../utils/commerce/courses';
import { isMobileNumber } from '../../../utils/members';
import { phoneIssue } from '../../../utils/phone';
import { isValidEmail } from '../../../utils/validation';
import { downloadCsv, toCsv } from '../../../utils/csv';
import { formatTimestamp } from '../../../utils/format';
import { Sheet } from '../../ui/Sheet';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { TextInput } from '../../ui/TextInput';
import { PhoneInput } from '../../ui/PhoneInput';
import { Badge } from '../../ui/Badge';
import { Dialog } from '../../ui/Dialog';

interface Props {
  courseId: string | null;
  onClose: () => void;
}

/** Everyone enrolled in a course, with their progress (D197). */
export function CourseLearners({ courseId, onClose }: Props) {
  const { data, apply } = useCommerce();
  const course = findCourse(data, courseId ?? undefined);
  const [adding, setAdding] = useState(false);
  const [who, setWho] = useState({ name: '', phone: '', email: '' });
  const [tried, setTried] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (!course) return [];
    return enrolmentsFor(data, course.id)
      .map((e) => {
        const session = e.phone ? { contact: e.phone, channel: 'phone' as const, signedInAt: '', expiresAt: '' } : { contact: e.email, channel: 'email' as const, signedInAt: '', expiresAt: '' };
        return { e, p: progressOf(course, e), access: courseAccess(data, course, session) };
      })
      .sort((a, b) => Date.parse(b.e.lastAt ?? b.e.enrolledAt) - Date.parse(a.e.lastAt ?? a.e.enrolledAt));
  }, [data, course]);

  if (!course) return <Sheet open={false} onClose={onClose} title="Learners">{null}</Sheet>;

  const phoneErr = who.phone && !isMobileNumber(who.phone) ? phoneIssue(who.phone) ?? 'Phone number looks incomplete' : undefined;
  const emailErr = who.email && !isValidEmail(who.email) ? 'Enter a valid email' : undefined;
  const missing = tried && !who.phone.trim() && !who.email.trim() ? 'Add a phone number or email — it’s how they sign in' : undefined;

  const add = () => {
    setTried(true);
    if (phoneErr || emailErr || (!who.phone.trim() && !who.email.trim())) return;
    if (apply((d) => addLearner(d, course.id, who))) {
      toast.success(`${who.name || 'Learner'} added`, { description: 'They sign in on the course page with that phone or email.' });
      setWho({ name: '', phone: '', email: '' });
      setTried(false);
      setAdding(false);
    }
  };

  const exportCsv = () =>
    downloadCsv(
      `${course.title || 'course'}-learners.csv`,
      toCsv(
        ['Name', 'Phone', 'Email', 'How they joined', 'Enrolled', 'Lessons done', 'Progress %', 'Last active', 'Completed', 'Certificate'],
        rows.map(({ e, p }) => [e.name, e.phone, e.email, enrolSourceLabels[e.source], e.enrolledAt, `${p.done}/${p.total}`, String(p.pct), e.lastAt ?? '', e.completedAt ?? '', e.certificateNo ?? '']),
      ),
    );

  return (
    <>
      <Sheet
        open={!!courseId}
        onClose={onClose}
        side="right"
        size="lg"
        title={`Learners · ${course.title || 'Untitled course'}`}
        description={`${rows.length} enrolled · ${rows.filter((r) => r.e.completedAt).length} finished`}
        headerActions={rows.length ? <IconButton icon={DownloadIcon} label="Export learners as CSV" onClick={exportCsv} /> : undefined}
        bodyClassName="p-0"
      >
        <div className="border-b border-line px-5 py-4">
          {adding ? (
            <div className="flex flex-col gap-3">
              <TextInput id="lrn-name" label="Name" optional value={who.name} onChange={(e) => setWho((w) => ({ ...w, name: e.target.value }))} />
              <div className="grid gap-3 sm:grid-cols-2">
                <PhoneInput id="lrn-phone" label="Phone" value={who.phone} error={phoneErr ?? missing} onChange={(phone) => setWho((w) => ({ ...w, phone }))} />
                <TextInput id="lrn-email" label="Email" type="email" value={who.email} error={emailErr} onChange={(e) => setWho((w) => ({ ...w, email: e.target.value }))} />
              </div>
              <p className="text-caption text-fg-subtle">For people who paid another way, such as a bank transfer. They get access straight away, whatever the course’s price.</p>
              <div className="flex gap-2">
                <Button onClick={add}>Add learner</Button>
                <Button variant="tertiary" onClick={() => setAdding(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" leadingIcon={UserPlusIcon} onClick={() => setAdding(true)}>
              Add a learner
            </Button>
          )}
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-label text-fg-muted">No one has enrolled yet. Share the course page, or add someone by hand.</p>
        ) : (
          <ul aria-label="Learners">
            {rows.map(({ e, p, access }) => (
              <li key={e.id} className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-label font-semibold text-fg">{e.name || e.phone || e.email}</span>
                    {e.completedAt && (
                      <Badge tone="success">
                        <AwardIcon size={12} aria-hidden /> Finished
                      </Badge>
                    )}
                    {!access.ok && !e.completedAt && <Badge tone="warning">{access.reason === 'refunded' ? 'Refunded' : access.reason === 'payment_pending' ? 'Payment pending' : access.reason === 'membership_lapsed' || access.reason === 'no_membership' ? 'Membership ended' : 'No access'}</Badge>}
                  </p>
                  <p className="mt-0.5 truncate text-caption text-fg-subtle">
                    {[e.name ? e.phone || e.email : '', enrolSourceLabels[e.source], `last active ${formatTimestamp(e.lastAt ?? e.enrolledAt)}`].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="hidden w-36 shrink-0 sm:block">
                  <p className="text-right text-caption tabular-nums text-fg">
                    <span className="font-semibold">{p.done}</span> <span className="text-fg-subtle">of {p.total}</span>
                  </p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.pct} aria-label={`${e.name || 'Learner'}: ${p.pct}% done`}>
                    <div className="h-full rounded-full bg-action" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
                <span className="text-caption font-semibold tabular-nums text-fg sm:hidden">{p.pct}%</span>
                <IconButton size="sm" icon={UserMinusIcon} label={`Remove ${e.name || 'learner'}`} onClick={() => setRemoving(e.id)} />
              </li>
            ))}
          </ul>
        )}
      </Sheet>

      <Dialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="Remove this learner?"
        description="They lose access to the course straight away. Paid orders aren’t refunded — do that in Orders if you need to."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Keep
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (removing && apply((d) => removeLearner(d, removing))) toast.success('Learner removed');
                setRemoving(null);
              }}
            >
              Remove
            </Button>
          </div>
        }
      >
        {null}
      </Dialog>
    </>
  );
}
