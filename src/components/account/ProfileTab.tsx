import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CameraIcon, CheckCircle2Icon, MailIcon, PhoneIcon, Trash2Icon } from 'lucide-react';
import { useAccount, updateAccount } from '../../utils/account/store';
import { squarePhoto } from '../../utils/account/photo';
import { isValidEmail } from '../../utils/validation';
import { useTeam } from '../../contexts/TeamContext';
import { Card } from '../ui/layout/Card';
import { AsideNote } from '../ui/layout/AsideNote';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Dialog } from '../ui/Dialog';
import { AccountAvatar } from './AccountAvatar';
import { useT } from '../../contexts/LocaleContext';

/** Account → Profile: who you are to teammates, and how KUBICU reaches you (D80). */
export function ProfileTab() {
  const { t: tr } = useT();
  const account = useAccount();
  const team = useTeam();
  const p = account.profile;
  const [draft, setDraft] = useState({ name: p.name, displayName: p.displayName, jobTitle: p.jobTitle, bio: p.bio });
  const [tried, setTried] = useState(false);
  const [dialog, setDialog] = useState<'email' | 'phone' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft({ name: p.name, displayName: p.displayName, jobTitle: p.jobTitle, bio: p.bio }), [p.name, p.displayName, p.jobTitle, p.bio]);

  const dirty = draft.name !== p.name || draft.displayName !== p.displayName || draft.jobTitle !== p.jobTitle || draft.bio !== p.bio;
  const nameError = tried && draft.name.trim().length < 2 ? 'Add your full name' : undefined;

  const syncMember = (patch: {name?: string;contact?: string;}) => {
    // Previewing another role uses a stand-in, which has no account to sync.
    if (!team.me.id.startsWith('preview_') && team.me.role === 'owner') team.updateMember(team.me.id, patch);
  };

  const save = () => {
    setTried(true);
    if (draft.name.trim().length < 2) return;
    const name = draft.name.trim();
    const displayName = draft.displayName.trim() || name.split(/\s+/)[0];
    if (!updateAccount((a) => ({ ...a, profile: { ...a.profile, name, displayName, jobTitle: draft.jobTitle.trim(), bio: draft.bio.trim() } }))) return toast.error(tr('Couldn’t save'), { description: tr('Your browser storage is full.') });
    syncMember({ name });
    setTried(false);
    toast.success(tr('Profile saved'));
  };

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      const photo = await squarePhoto(file);
      if (!updateAccount((a) => ({ ...a, profile: { ...a.profile, photo } }))) throw new Error('storage');
      toast.success(tr('Photo updated'));
    } catch (e) {
      const m = (e as Error).message;
      toast.error(tr('Couldn’t use that photo'), { description: tr(m === 'type' ? 'Choose a JPG, PNG, WebP or GIF.' : m === 'size' ? 'Choose a photo under 5 MB.' : 'Try a different photo.') });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
      <div className="flex flex-col gap-6">
        <Card
          id="acc-profile"
          title="Your profile"
          description="How you appear to teammates in every workspace."
          footer={
          <div className="flex items-center justify-end gap-2">
              {dirty &&
            <Button variant="tertiary" onClick={() => setDraft({ name: p.name, displayName: p.displayName, jobTitle: p.jobTitle, bio: p.bio })}>
                  Discard
                </Button>
            }
              <Button disabled={!dirty} onClick={save}>
                Save profile
              </Button>
            </div>
          }>
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-5">
              <AccountAvatar name={draft.name || p.name} photo={p.photo} size="lg" />
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" leadingIcon={CameraIcon} onClick={() => fileRef.current?.click()}>
                    {p.photo ? 'Change photo' : 'Add a photo'}
                  </Button>
                  {p.photo &&
                  <Button size="sm" variant="tertiary" leadingIcon={Trash2Icon} onClick={() => updateAccount((a) => ({ ...a, profile: { ...a.profile, photo: null } }))}>
                      Remove
                    </Button>
                  }
                </div>
                <p className="text-caption text-fg-subtle">{tr('Square works best. JPG, PNG or WebP, up to 5 MB.')}</p>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput id="acc-name" label="Full name" autoComplete="name" value={draft.name} maxLength={60} error={nameError} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
              <TextInput id="acc-display" label="Display name" optional value={draft.displayName} maxLength={30} hint="Shown in approvals and the activity log." onChange={(e) => setDraft((d) => ({ ...d, displayName: e.target.value }))} />
            </div>
            <TextInput id="acc-title" label="Job title" optional value={draft.jobTitle} maxLength={40} placeholder="e.g. Founder, Sales lead" onChange={(e) => setDraft((d) => ({ ...d, jobTitle: e.target.value }))} />
            <TextArea id="acc-bio" label="About you" optional rows={3} maxLength={200} value={draft.bio} hint={`${draft.bio.length}/200 · ${tr('Teammates see this on the Team screen.')}`} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))} />
          </div>
        </Card>

        <Card id="acc-contact" title="Contact" description="Where KUBICU sends sign-in codes, receipts and security alerts." body="flush">
          <ul className="divide-y divide-line">
            <ContactRow
              icon={MailIcon}
              label="Email"
              value={p.email}
              status={account.pendingEmail ? <Badge tone="warning">Change pending</Badge> : account.emailVerified ? <Badge tone="success">Verified</Badge> : <Badge tone="warning">Not verified</Badge>}
              note={account.pendingEmail ? tr('Waiting for you to confirm {next}. Until then, we keep using {current}.', { next: account.pendingEmail, current: p.email }) : undefined}
              action={
              <Button size="sm" variant="secondary" onClick={() => setDialog('email')}>
                  {account.pendingEmail ? 'Review' : 'Change'}
                </Button>
              } />
            
            <ContactRow
              icon={PhoneIcon}
              label="Phone"
              value={p.phone || tr('Not added')}
              status={p.phone ? account.phoneVerified ? <Badge tone="success">Verified</Badge> : <Badge tone="warning">Not verified</Badge> : null}
              note={p.phone ? undefined : tr('Needed for text-message codes and WhatsApp alerts.')}
              action={
              <Button size="sm" variant="secondary" onClick={() => setDialog('phone')}>
                  {p.phone ? account.phoneVerified ? 'Change' : 'Verify' : 'Add phone'}
                </Button>
              } />
            
          </ul>
        </Card>
      </div>

      <aside className="flex flex-col divide-y divide-line">
        <AsideNote id="acc-team" title="What teammates see" text="Your photo, display name, job title and about — in approvals, comments and the activity log." />
        <AsideNote id="acc-private" title="What stays private" text="Your email and phone are visible only to workspace Owners and Admins." />
        <AsideNote id="acc-customers" title="What customers see" text="Nothing from your personal account. Public pages use each workspace’s own profile." />
        <AsideNote id="acc-since" title="Member since" text={new Date(account.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
      </aside>

      <EmailDialog open={dialog === 'email'} onClose={() => setDialog(null)} onConfirmed={(email) => syncMember({ contact: email })} />
      <PhoneDialog open={dialog === 'phone'} onClose={() => setDialog(null)} />
    </div>);

}

function ContactRow({ icon: Icon, label, value, status, note, action }: {icon: typeof MailIcon;label: string;value: string;status: React.ReactNode;note?: string;action: React.ReactNode;}) {
  label = useT().t(label);
  return (
    <li className="flex items-start gap-4 px-5 py-4 md:px-6">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted">
        <Icon size={17} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-caption text-fg-subtle">{label}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-label font-semibold text-fg">{value}</span>
          {status}
        </div>
        {note && <p className="mt-1 text-caption text-fg-muted">{note}</p>}
      </div>
      <div className="shrink-0">{action}</div>
    </li>);

}

function EmailDialog({ open, onClose, onConfirmed }: {open: boolean;onClose: () => void;onConfirmed: (email: string) => void;}) {
  const { t: tr } = useT();
  const account = useAccount();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail('');
      setPassword('');
      setTried(false);
    }
  }, [open]);

  const emailError = !tried ? undefined : !isValidEmail(email) ? 'Enter a valid email address' : email.trim().toLowerCase() === account.profile.email.toLowerCase() ? 'That’s already your email' : undefined;
  const pwError = tried && password.length < 8 ? 'Enter your current password' : undefined;

  const request = () => {
    setTried(true);
    if (!isValidEmail(email) || email.trim().toLowerCase() === account.profile.email.toLowerCase() || password.length < 8) return;
    updateAccount((a) => ({ ...a, pendingEmail: email.trim() }));
    toast.success(tr('Check your new inbox'), { description: tr('We sent a link to {email}. Nothing is actually sent in the prototype.', { email: email.trim() }) });
  };

  const confirm = () => {
    const next = account.pendingEmail;
    if (!next) return;
    updateAccount((a) => ({ ...a, pendingEmail: null, emailVerified: true, profile: { ...a.profile, email: next } }));
    onConfirmed(next);
    toast.success(tr('Email changed'), { description: tr('A notice went to your old address in case this wasn’t you.') });
    onClose();
  };

  if (account.pendingEmail)
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Confirm your new email"
      description={tr('We sent a link to {email}. The change happens when you open it. The link expires in 24 hours.', { email: account.pendingEmail })}
      footer={
      <>
            <Button
          variant="tertiary"
          onClick={() => {
            updateAccount((a) => ({ ...a, pendingEmail: null }));
            toast(tr('Email change cancelled'));
            onClose();
          }}>
          
              Cancel the change
            </Button>
            <Button variant="secondary" onClick={() => toast.success(tr('Link sent again'), { description: tr('Preview only — nothing is sent.') })}>
              Resend link
            </Button>
            <Button leadingIcon={CheckCircle2Icon} onClick={confirm}>
              Prototype: open the link
            </Button>
          </>
      } />);



  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Change your email"
      description="We’ll send a link to the new address. Your current email keeps working until you confirm."
      footer={
      <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={request}>Send link</Button>
        </>
      }>
      
      <div className="flex flex-col gap-4">
        <TextInput id="acc-new-email" label="New email" type="email" autoComplete="email" value={email} error={emailError} onChange={(e) => setEmail(e.target.value)} />
        <TextInput id="acc-email-pw" label="Current password" type="password" autoComplete="current-password" value={password} error={pwError} hint="So nobody else can change it from an unlocked device." onChange={(e) => setPassword(e.target.value)} />
      </div>
    </Dialog>);

}

function PhoneDialog({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { t: tr } = useT();
  const account = useAccount();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'number' | 'code'>('number');
  const [code, setCode] = useState('');
  const [tried, setTried] = useState(false);
  const digits = phone.replace(/\D/g, '');

  useEffect(() => {
    if (!open) return;
    const existing = account.profile.phone;
    setPhone(existing);
    setStep(existing && !account.phoneVerified ? 'code' : 'number');
    setCode('');
    setTried(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const phoneError = tried && step === 'number' && (digits.length < 10 || digits.length > 14) ? 'Enter a phone number with its country code, e.g. +234 803 000 0000' : undefined;
  const codeError = tried && step === 'code' && !/^\d{6}$/.test(code) ? 'Enter the 6-digit code' : tried && step === 'code' && code === '000000' ? 'That code isn’t right. Check the latest message.' : undefined;

  const send = () => {
    setTried(true);
    if (digits.length < 10 || digits.length > 14) return;
    updateAccount((a) => ({ ...a, profile: { ...a.profile, phone: phone.trim() }, phoneVerified: false }));
    setStep('code');
    setTried(false);
    toast(tr('Code sent'), { description: tr('Prototype: any 6 digits work except 000000.') });
  };

  const verify = () => {
    setTried(true);
    if (!/^\d{6}$/.test(code) || code === '000000') return;
    updateAccount((a) => ({ ...a, phoneVerified: true }));
    toast.success(tr('Phone verified'));
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title={step === 'number' ? account.profile.phone ? 'Change your phone' : 'Add your phone' : 'Enter the code'}
      description={step === 'number' ? 'We’ll text a 6-digit code to confirm it’s yours.' : tr('We texted a code to {phone}. It expires in 10 minutes.', { phone: account.profile.phone })}
      footer={
      step === 'number' ?
      <>
            {account.profile.phone &&
        <Button
          variant="tertiary"
          className="mr-auto"
          disabled={account.security.twoStep === 'sms'}
          title={account.security.twoStep === 'sms' ? tr('Switch two-step sign-in off text messages first') : undefined}
          onClick={() => {
            updateAccount((a) => ({ ...a, profile: { ...a.profile, phone: '' }, phoneVerified: false }));
            toast(tr('Phone removed'));
            onClose();
          }}>
          
                Remove phone
              </Button>
        }
            <Button variant="tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={send}>Send code</Button>
          </> :

      <>
            <Button variant="tertiary" onClick={() => setStep('number')}>
              Change number
            </Button>
            <Button onClick={verify}>Verify</Button>
          </>

      }>
      
      {step === 'number' ?
      <TextInput id="acc-phone" label="Phone number" type="tel" autoComplete="tel" inputMode="tel" placeholder="+234 803 000 0000" value={phone} error={phoneError} onChange={(e) => setPhone(e.target.value)} /> :

      <TextInput id="acc-phone-code" label="6-digit code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} error={codeError} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
      }
    </Dialog>);

}