import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  CopyIcon,
  ExternalLinkIcon,
  ArrowRightIcon,
  PaletteIcon,
  WandSparklesIcon } from
'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { blockName } from '../../utils/blocks';
import { allBlocks, pageOfBlock } from '../../utils/sitePages';
import { publicUrl, formatRelative } from '../../utils/format';
import type { ValidationIssue } from '../../utils/validation';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { InlineAlert } from '../ui/InlineAlert';
import { UpgradeButton } from '../ui/UpgradeButton';
import { useTeam } from '../../contexts/TeamContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { ChevronDownIcon, Link2Icon, QrCodeIcon, SearchIcon, SendIcon } from 'lucide-react';
import { ShortLinkQuick } from './ShortLinkQuick';
import { SearchSharingFields, seoSummary } from './inspector/SearchSharingFields';
import { IndexingFields, indexingSummary } from './inspector/IndexingFields';
import { qrHref } from '../../utils/domains/links';
import { Segmented } from '../ui/Segmented';
import { DateTimeInput } from '../ui/DateTimeInput';
import { formatSchedule, timeZoneLabel } from '../../utils/schedule';

interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
  onGoToBlock?: (id: string) => void;
  /** Opens the page theme panel (desktop inspector or mobile Design sheet). */
  onOpenTheme?: () => void;
}

type Phase = 'review' | 'success' | 'scheduled' | 'failed' | 'sent';
type Mode = 'now' | 'schedule';

function tomorrowAtNine(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

export function PublishDialog({ open, onClose, onGoToBlock, onOpenTheme }: PublishDialogProps) {
  const { state, actions, issues, hasUnpublishedChanges } = useEditor();
  const navigate = useNavigate();
  const [note, setNote] = useState('');
  const [phase, setPhase] = useState<Phase>('review');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>('now');
  const [when, setWhen] = useState<string | null>(tomorrowAtNine());
  const [seoOpen, setSeoOpen] = useState(false);
  const seo = seoSummary(state.draft.seo);

  useEffect(() => {
    if (open) {
      setPhase('review');
      setNote('');
      setMode('now');
      setWhen(tomorrowAtNine());
      // Search & sharing (D219): open straight away when the description is still empty.
      setSeoOpen(!state.draft.seo.description.trim());
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const whenError =
  mode === 'schedule' ?
  !when ?
  'Choose a date and time' :
  Date.parse(when) < Date.now() + 2 * 60 * 1000 ?
  'Choose a time at least a couple of minutes from now' :
  undefined :
  undefined;

  const schedule = () => {
    if (!when || whenError) return;
    if (team.needsReview) return sendForReview(when);
    const ok = actions.schedulePublish(when, note);
    if (ok) team.log('pages', `scheduled ${currentSpace.name} to publish`, '/app/spaces');
    setPhase(ok ? 'scheduled' : 'failed');
  };

  // Approvals (D58): Editors send the exact site for review instead of publishing.
  const team = useTeam();
  const { currentSpace } = useWorkspace();
  const pendingMine = team.data.reviews.find((r) => r.spaceId === currentSpace.id && r.status === 'pending');
  const sendForReview = (scheduleAt: string | null) => {
    team.requestReview({ spaceId: currentSpace.id, spaceName: currentSpace.name, handle: state.site.handle, doc: state.site, live: state.published, note: note.trim(), scheduleAt });
    setPhase('sent');
  };

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const url = publicUrl(state.draft.handle);

  const publish = () => {
    if (team.needsReview) return sendForReview(null);
    setBusy(true);
    window.setTimeout(() => {
      const ok = actions.publish(note);
      if (ok) team.log('pages', `published ${currentSpace.name}`, `/p/${state.draft.handle}`);
      setBusy(false);
      setPhase(ok ? 'success' : 'failed');
    }, 450);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${url}`);
      toast('Link copied');
    } catch {
      toast('Couldn’t copy — select the link and copy it manually.');
    }
  };

  const openLive = () => {
    onClose();
    navigate(`/p/${state.draft.handle}`);
  };

  const describe = (issue: ValidationIssue) => {
    const block = allBlocks(state.site).find((b) => b.id === issue.blockId);
    return block ? blockName(block) : issue.id.startsWith('theme') ? 'Page theme · readability' : 'Page';
  };

  const applyFix = (issue: ValidationIssue) => {
    if (!issue.fix) return;
    actions.updateTheme(issue.fix.theme, `fix-${issue.id}-${Date.now()}`);
    toast('Suggestion applied', { description: issue.fix.description, action: { label: 'Undo', onClick: () => actions.undo() } });
  };

  const handlers = {
    describe,
    onApplyFix: applyFix,
    onGo: onGoToBlock ?
    (id: string) => {
      onClose();
      // The block may be on another page of the site: open that page first.
      const pageId = pageOfBlock(state.site, id);
      if (pageId !== undefined) actions.setPage(pageId);
      onGoToBlock(id);
    } :
    undefined,
    onOpenTheme: onOpenTheme ?
    () => {
      onClose();
      onOpenTheme();
    } :
    undefined
  };

  if (phase === 'scheduled' && state.scheduled) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        title="Publish scheduled"
        footer={
        <Button onClick={onClose} data-autofocus>
            Done
          </Button>
        }>
        
        <div className="flex flex-col gap-3 pb-2">
          <div className="flex items-center gap-3 rounded-md bg-info-soft px-3.5 py-3 text-info">
            <CalendarClockIcon size={18} aria-hidden />
            <p className="text-label font-semibold">Goes live {formatSchedule(state.scheduled.at)} · {timeZoneLabel()}</p>
          </div>
          <p className="text-label text-fg-muted">
            We saved this exact version. Edits you make from now on won’t be included unless you publish or reschedule.
          </p>
          <p className="text-caption text-fg-subtle">
            Prototype note: scheduled publishing runs while KUBICU is open in this browser. In production it runs on our servers.
          </p>
        </div>
      </Dialog>);

  }

  if (phase === 'sent') {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        title="Sent for review"
        footer={
        <Button onClick={onClose} data-autofocus>
            Keep editing
          </Button>
        }>
        
        <div className="flex flex-col gap-3 pb-2">
          <div className="flex items-center gap-3 rounded-md bg-info-soft px-3.5 py-3 text-info">
            <SendIcon size={18} aria-hidden />
            <p className="text-label font-semibold">An Owner or Admin will review it{mode === 'schedule' && when ? ` — you asked for it to go live ${formatSchedule(when)}` : ''}.</p>
          </div>
          <p className="text-label text-fg-muted">Your live page doesn’t change until it’s approved. You can keep editing — the request updates with your latest draft, and the reviewer is told.</p>
        </div>
      </Dialog>);

  }

  if (phase === 'success') {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        title="Your page is live"
        footer={
        <>
            <Button variant="secondary" onClick={onClose}>
              Keep editing
            </Button>
            <Button trailingIcon={ExternalLinkIcon} onClick={openLive} data-autofocus>
              Open live page
            </Button>
          </>
        }>
        
        <div className="flex flex-col gap-4 pb-2">
          <div className="flex items-center gap-3 rounded-md bg-success-soft px-3.5 py-3 text-success">
            <CheckCircle2Icon size={18} aria-hidden />
            <p className="text-label font-semibold">Published just now. Visitors see this version.</p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-line bg-canvas p-1.5 pl-3">
            <span className="min-w-0 flex-1 truncate font-mono text-label text-fg">{url}</span>
            <Button variant="secondary" size="sm" leadingIcon={CopyIcon} onClick={copy}>
              Copy
            </Button>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(qrHref({ spaceId: currentSpace.id, path: '' }, currentSpace.kind === 'main' ? 'Main page' : currentSpace.name));
            }}
            className="flex items-center gap-2 self-start rounded-sm text-label font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
            <QrCodeIcon size={16} aria-hidden />
            Make a QR code for flyers and your counter
          </button>
          <details className="group rounded-md border border-line">
            <summary className="flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2.5 text-label font-medium text-fg hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              <Link2Icon size={16} aria-hidden className="text-fg-muted" />
              <span className="flex-1">Make a short link to share</span>
              <ChevronDownIcon size={16} aria-hidden className="text-fg-subtle transition-transform duration-150 ease-out group-open:rotate-180" />
            </summary>
            <div className="border-t border-line p-3">
              <ShortLinkQuick compact />
            </div>
          </details>
          <p className="text-caption text-fg-subtle">
            Prototype note: the kub.icu address is yours, but hosting isn’t connected yet. “Open live page” shows the published version inside this prototype.
          </p>
        </div>
      </Dialog>);

  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={hasUnpublishedChanges ? 'Publish your changes' : 'Your live page is up to date'}
      description={state.publishedAt ? `Last published ${formatRelative(state.publishedAt)} · ${url}` : `First publish · ${url}`}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            {hasUnpublishedChanges ? 'Cancel' : 'Close'}
          </Button>
          {hasUnpublishedChanges ?
        mode === 'schedule' ?
        <Button onClick={schedule} disabled={errors.length > 0 || !!whenError} leadingIcon={team.needsReview ? SendIcon : CalendarClockIcon}>
                {errors.length > 0 ? `Fix ${errors.length} to schedule` : team.needsReview ? 'Send for review' : state.scheduled ? 'Reschedule' : 'Schedule publish'}
              </Button> :

        <Button onClick={publish} loading={busy} disabled={errors.length > 0} leadingIcon={team.needsReview ? SendIcon : undefined}>
                {busy ? 'Publishing…' : errors.length > 0 ? `Fix ${errors.length} to ${team.needsReview ? 'send' : 'publish'}` : team.needsReview ? pendingMine ? 'Send again' : 'Send for review' : 'Publish now'}
              </Button> :


        <Button trailingIcon={ExternalLinkIcon} onClick={openLive}>
              Open live page
            </Button>
        }
        </>
      }>
      
      <div className="flex flex-col gap-5 pb-2">
        {phase === 'failed' &&
        <InlineAlert tone="danger" title="We couldn’t publish">
            Your draft is safe on this device and your live page hasn’t changed. Check your storage space and try again.
          </InlineAlert>
        }

        {team.needsReview && hasUnpublishedChanges &&
        <InlineAlert tone="info" title={pendingMine ? `Waiting for review since ${formatRelative(pendingMine.createdAt)}` : 'Approvals are on for this workspace'}>
            {pendingMine ? 'Sending again replaces that request with your latest draft.' : 'You send it to an Owner or Admin, who publishes it. Your live page stays as it is until then.'}
          </InlineAlert>
        }

        {errors.length === 0 && warnings.length === 0 &&
        <InlineAlert tone="success" title="Everything checks out">
            Links are complete, images are described and colours are readable.
          </InlineAlert>
        }

        {errors.length > 0 && <IssueGroup title={`${errors.length} must be fixed before publishing`} tone="error" issues={errors} {...handlers} />}
        {warnings.length > 0 && <IssueGroup title={`${warnings.length} worth checking`} tone="warning" issues={warnings} {...handlers} />}

        {state.scheduled &&
        <div className="flex flex-col gap-2 rounded-md border border-line bg-info-soft px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-label text-fg">
              <CalendarClockIcon size={15} className="mt-0.5 shrink-0 text-info" aria-hidden />
              <span>
                A version is scheduled for <span className="font-semibold">{formatSchedule(state.scheduled.at)}</span>. Publishing now or rescheduling replaces it.
              </span>
            </p>
            <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              actions.cancelSchedule();
              toast('Schedule cancelled', { description: 'Your live page stays as it is.' });
            }}>
            
              Cancel schedule
            </Button>
          </div>
        }

        {hasUnpublishedChanges &&
        <div className="flex flex-col gap-3">
            <Segmented<Mode>
            ariaLabel="When to publish"
            fullWidth
            value={mode}
            onChange={setMode}
            options={[
            { value: 'now', label: 'Publish now' },
            { value: 'schedule', label: 'Schedule' }]
            } />
          
            {mode === 'schedule' &&
          <DateTimeInput id="publish-when" label="Go live on" value={when} onChange={setWhen} error={whenError} />
          }
          </div>
        }

        <section className="rounded-md border border-line" aria-labelledby="publish-seo-heading">
          <h3 id="publish-seo-heading" className="m-0">
            <button
              type="button"
              aria-expanded={seoOpen}
              aria-controls="publish-seo-body"
              onClick={() => setSeoOpen((v) => !v)}
              className="flex w-full items-center gap-3 rounded-md px-3.5 py-3 text-left transition-colors duration-150 ease-out hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              
              <SearchIcon size={16} className="shrink-0 text-fg-muted" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-label font-semibold text-fg">Search & sharing</span>
                <span className="block text-caption text-fg-muted">
                  {indexingSummary(state.site, state.draft.seo)} · {seo.missing.length === 0 ? 'title, description and share image set' : `not set yet: ${seo.missing.join(', ')}`}
                </span>
              </span>
              <ChevronDownIcon size={16} className={`shrink-0 text-fg-subtle transition-transform duration-150 ease-out ${seoOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>
          </h3>
          {seoOpen &&
          <div id="publish-seo-body" className="border-t border-line px-3.5 pb-4 pt-4">
              <p className="mb-4 text-caption text-fg-subtle">
                How {state.activePageId ? 'this page' : 'your page'} appears on Google and when the link is shared on WhatsApp or X. The same settings are in Page settings → Search & sharing.
                {hasUnpublishedChanges ? '' : ' Changing them here means you’ll need to publish again.'}
              </p>
              <SearchSharingFields idPrefix="publish-seo" compact />
              <div className="mt-5 border-t border-line pt-4">
                <h4 className="mb-3 text-label font-semibold text-fg">Search engines</h4>
                <IndexingFields idPrefix="publish" />
              </div>
            </div>
          }
        </section>

        {hasUnpublishedChanges &&
        <TextInput
          id="publish-note"
          label="What changed?"
          optional
          placeholder="e.g. Added the Harmattan drop"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          hint="Saved with this version so you can find it later." />

        }
      </div>
    </Dialog>);

}

interface IssueGroupProps {
  title: string;
  tone: 'error' | 'warning';
  issues: ValidationIssue[];
  describe: (issue: ValidationIssue) => string;
  onGo?: (blockId: string) => void;
  onApplyFix: (issue: ValidationIssue) => void;
  onOpenTheme?: () => void;
}

function IssueGroup({ title, tone, issues, describe, onGo, onApplyFix, onOpenTheme }: IssueGroupProps) {
  const Icon = tone === 'error' ? AlertCircleIcon : AlertTriangleIcon;
  return (
    <section>
      <h3 className={`mb-2 flex items-center gap-1.5 text-label font-semibold ${tone === 'error' ? 'text-danger' : 'text-warning'}`}>
        <Icon size={15} aria-hidden />
        {title}
      </h3>
      <ul className="divide-y divide-line overflow-hidden rounded-md border border-line">
        {issues.map((issue) => {
          const isTheme = issue.id.startsWith('theme:');
          return (
            <li key={issue.id} className="flex flex-col gap-2 px-3.5 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-caption font-medium text-fg-subtle">{describe(issue)}</p>
                  <p className="text-label text-fg">{issue.message}</p>
                </div>
                {onGo && issue.blockId &&
                <Button variant="tertiary" size="sm" trailingIcon={ArrowRightIcon} onClick={() => onGo(issue.blockId as string)}>
                    Go to block
                  </Button>
                }
              </div>
              {issue.upgradeTo && <UpgradeButton plan={issue.upgradeTo} feature={issue.upgradeFeature ?? 'This feature'} className="self-start" />}
              {issue.guidance && tone === 'error' &&
              <p className="max-w-prose text-caption text-fg-muted">
                  <span className="font-semibold text-fg">Why it matters: </span>
                  {issue.guidance}
                </p>
              }
              {isTheme && (issue.fix || onOpenTheme) &&
              <div className="flex flex-wrap items-center gap-2">
                  {issue.fix &&
                <Button size="sm" variant={tone === 'error' ? 'primary' : 'secondary'} leadingIcon={WandSparklesIcon} onClick={() => onApplyFix(issue)}>
                      {issue.fix.label}
                    </Button>
                }
                  {onOpenTheme &&
                <Button size="sm" variant="tertiary" leadingIcon={PaletteIcon} onClick={onOpenTheme}>
                      Adjust colours myself
                    </Button>
                }
                  {issue.fix && <span className="text-caption text-fg-subtle">{issue.fix.description}</span>}
                </div>
              }
            </li>);

        })}
      </ul>
    </section>);

}