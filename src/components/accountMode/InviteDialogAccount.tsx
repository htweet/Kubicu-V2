import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckIcon, CopyIcon, MessageCircleIcon } from 'lucide-react';
import type { Role } from '../../types/team';
import type { AccountInvite } from '../../types/accountMode';
import { useAccountMode } from '../../contexts/AccountModeContext';
import { useTeam } from '../../contexts/TeamContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useT } from '../../contexts/LocaleContext';
import { roleInfo } from '../../data/permissions';
import { INVITE_EXPIRY_DAYS } from '../../data/accountModeSamples';
import { simulate } from '../../utils/accountModeSim';
import { isValidEmail, isValidPhone } from '../../utils/validation';
import { dialPrefix } from '../../utils/phone';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { InlineAlert } from '../ui/InlineAlert';
import { RolePicker } from '../settings/RolePicker';
import { SpaceAccessField } from '../settings/SpaceAccessField';
import { BranchAccessField } from '../settings/BranchAccessField';
import { AccountStateAlert, isScreenFailure } from '../account/AccountStates';
import type { AccountFailure } from '../../types/accountMode';

interface InviteDialogAccountProps {
  open: boolean;
  onClose: () => void;
  onCreated: (invite: AccountInvite) => void;
  /** Lower-cased contacts already in the team or with a pending invite. */
  existingContacts: string[];
  seatLimit: number;
  planName: string;
  /** Prefill for "Cancel and invite again". */
  initialContact?: string;
  onScreenFailure: (f: AccountFailure) => void;
}

/** Account mode invite (D533): nothing is sent; the server returns a link shown once. */
export function InviteDialogAccount({ open, onClose, onCreated, existingContacts, seatLimit, planName, initialContact = '', onScreenFailure }: InviteDialogAccountProps) {
  const { t: tr } = useT();
  const navigate = useNavigate();
  const team = useTeam();
  const { current } = useWorkspace();
  const { simulation, withStepUp } = useAccountMode();
  const [contact, setContact] = useState('');
  const [role, setRole] = useState<Role>('editor');
  const [spaceIds, setSpaceIds] = useState<string[] | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const [creating, setCreating] = useState(false);
  const [failure, setFailure] = useState<AccountFailure | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setContact(initialContact);
    setRole('editor');
    setSpaceIds(null);
    setBranchId(null);
    setTried(false);
    setCreating(false);
    setFailure(null);
    setLink(null);
    setCopied(false);
  }, [open, initialContact]);

  const c = contact.trim().toLowerCase();
  const error = !c ? tr('Enter an email or phone number.') : !isValidEmail(c) && !isValidPhone(c) ? tr('That doesn’t look like an email or a phone number.') : existingContacts.includes(c) ? tr('Already invited or a member.') : '';
  const billing = team.can('billing.manage');

  const create = async () => {
    setTried(true);
    if (error) return;
    setCreating(true);
    setFailure(null);
    const r = await withStepUp(() => simulate('invite.create', simulation, { stepUp: role === 'admin' }));
    setCreating(false);
    if (!r.ok) {
      if (r.code === 'cancelled') return;
      if (isScreenFailure(r.code)) {
        onClose();
        onScreenFailure(r);
        return;
      }
      setFailure(r);
      return;
    }
    const token = `acc_${Math.random().toString(36).slice(2, 12)}`;
    const url = `${window.location.origin}/invite/${token}`;
    setLink(url);
    onCreated({ id: token, contact: contact.trim(), role, expiresAt: new Date(Date.now() + INVITE_EXPIRY_DAYS * 86400000).toISOString() });
  };

  const copy = () => {
    if (!link) return;
    void navigator.clipboard?.writeText(link);
    setCopied(true);
    toast(tr('Invite link copied'));
    window.setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    if (!link) return;
    const text = tr('Join {workspace} on Kubicu: {link}', { workspace: current.name, link });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={link ? tr('Invite ready') : tr('Invite people')}
      description={link ? tr('Kubicu doesn’t send invites yet. Share this link with {contact} yourself. It expires in {n} days.', { contact: contact.trim(), n: INVITE_EXPIRY_DAYS }) : tr('They join {workspace} with the role you pick. You can change it any time.', { workspace: current.name })}
      footer={
        link ? (
          <Button onClick={onClose}>{tr('Done')}</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              {tr('Cancel')}
            </Button>
            <Button loading={creating} onClick={() => void create()}>
              {creating ? tr('Creating…') : tr('Create invite')}
            </Button>
          </>
        )
      }
    >
      {link ? (
        <div className="flex flex-col gap-3">
          <InlineAlert tone="warning" title={tr('This link is shown only once')}>
            {tr('Copy it now. If it’s lost, cancel the invite and create a new one.')}
          </InlineAlert>
          <div className="flex items-center gap-2 rounded-md bg-sunken px-3 py-2.5">
            <span className="min-w-0 flex-1 truncate font-mono text-caption text-fg">{link}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" leadingIcon={copied ? CheckIcon : CopyIcon} onClick={copy}>
              {copied ? tr('Copied') : tr('Copy link')}
            </Button>
            <Button size="sm" variant="secondary" leadingIcon={MessageCircleIcon} onClick={share}>
              {tr('Share on WhatsApp')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {failure?.code === 'no_seats' ? (
            <InlineAlert
              tone="danger"
              title={tr('No seats left')}
              action={
                billing.allowed ? (
                  <Button size="sm" variant="secondary" onClick={() => navigate('/app/settings/billing')}>
                    {tr('Change plan')}
                  </Button>
                ) : undefined
              }
            >
              {`${tr('The {plan} plan includes {n} seat(s), and all are taken or invited.', { plan: planName, n: seatLimit })}${billing.allowed ? '' : ` ${tr('Ask the Owner to free a seat or change plan.')}`}`}
            </InlineAlert>
          ) : failure ? (
            <AccountStateAlert failure={failure} onRetry={() => void create()} />
          ) : null}
          <TextInput id="acc-invite-contact" label={tr('Email or phone')} value={contact} placeholder={`name@example.com or ${dialPrefix()}`} error={tried ? error || undefined : undefined} onChange={(e) => setContact(e.target.value)} />
          <RolePicker value={role} onChange={setRole} />
          {role !== 'admin' && <SpaceAccessField value={spaceIds} onChange={setSpaceIds} />}
          {role !== 'admin' && <BranchAccessField id="acc-invite-branch" value={branchId} onChange={setBranchId} />}
          {role === 'admin' && <p className="text-caption text-fg-muted">{tr('Admins can always edit every space. You’ll be asked to confirm it’s you.')}</p>}
          <p className="text-caption text-fg-subtle">{tr(roleInfo[role].summary)}</p>
        </div>
      )}
    </Dialog>
  );
}
