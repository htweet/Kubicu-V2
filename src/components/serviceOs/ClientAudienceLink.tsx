import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, UserPlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { ServiceClient } from '../../types/serviceOs';
import { useOps } from '../../contexts/OpsContext';
import { matchContact, upsertContact } from '../../utils/ops/ops';
import { Button } from '../ui/Button';

/**
 * Links a Quotes & jobs client to their Audience contact (D125), matched by phone or email.
 * Shows the match, or adds them as a contact (source "manual", consent transactional — a quote
 * is never marketing consent).
 */
export function ClientAudienceLink({ client, label, linkedId, canEdit }: { client: ServiceClient; label: string; linkedId: string; canEdit: boolean }) {
  const ops = useOps();
  const match = matchContact(ops.data.contacts, { name: client.name, email: client.email, phone: client.phone });
  const add = () => {
    const ok = ops.apply((d) => upsertContact(d, { name: client.name, email: client.email, phone: client.phone }, 'manual', label, { linkedId, consent: 'transactional' }));
    if (ok) toast.success(`${client.name} added to Audience`);
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-caption text-fg-subtle">In Audience</p>
        <p className="truncate text-label text-fg">{match ? `${match.name} · ${match.tags.length ? match.tags.join(', ') : match.stage}` : 'Not a contact yet'}</p>
      </div>
      {match ? (
        <Link to={`/app/audience?contact=${match.id}`} className="inline-flex shrink-0 items-center gap-1 text-caption font-semibold text-action hover:underline">
          Open contact <ArrowUpRightIcon size={12} aria-hidden />
        </Link>
      ) : (
        <Button size="sm" variant="secondary" leadingIcon={UserPlusIcon} disabled={!canEdit || (!client.phone && !client.email)} onClick={add}>
          Add
        </Button>
      )}
    </div>
  );
}
