import React, { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, CopyIcon, EyeOffIcon, FileTextIcon, HomeIcon, MoreHorizontalIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { UpgradeButton } from '../ui/UpgradeButton';
import { useEditor } from '../../contexts/EditorContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { spaceKinds } from '../../data/spaceKinds';
import { MAIN_SPACE_ID } from '../../utils/spaces';
import { usePlan } from '../../contexts/PlanContext';
import { plans, planOrder } from '../../data/plans';
import { homeLabel, pageCount, pageLimits, pathProblem, sitePages } from '../../utils/sitePages';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TextInput } from '../ui/TextInput';
import { Switch } from '../ui/Switch';
import { Menu } from '../ui/Menu';
import { Dialog } from '../ui/Dialog';
import { IllustrativeTag } from '../ui/IllustrativeTag';
import { cn } from '../../utils/cn';

interface PagesPanelProps {
  touch?: boolean;
  /** Called after switching page (e.g. to close a mobile sheet). */
  onOpened?: () => void;
}

/** Add, order and set up the pages of a space. The selected page is the one on the canvas. */
export function PagesPanel({ touch, onOpened }: PagesPanelProps) {
  const { state, actions } = useEditor();
  const { currentSpace, switchSpace } = useWorkspace();
  const navigate = useNavigate();
  const plan = usePlan();
  const site = state.site;
  const pages = sitePages(site);
  const limit = pageLimits[plan.id];
  const count = pageCount(site);
  const atLimit = count >= limit;
  const nextPlan = planOrder.map((id) => plans[id]).find((p) => pageLimits[p.id] > limit);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);
  const active = state.activePageId;
  const removingPage = pages.find((p) => p.id === removing);
  const livePath = (id: string) => state.published?.pages?.find((p) => p.id === id)?.path;

  const open = (id: string | null) => {
    actions.setPage(id);
    onOpened?.();
  };

  const add = () => {
    if (atLimit) return;
    actions.addPage(newTitle);
    setNewTitle('');
    setAdding(false);
    onOpened?.();
  };

  const rowCls = (on: boolean) =>
  cn(
    'flex w-full items-center gap-2.5 rounded-md px-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
    touch ? 'min-h-[48px]' : 'min-h-[40px]',
    on ? 'bg-sunken' : 'hover:bg-sunken'
  );

  if (currentSpace.kind !== 'main')
  return (
    <div className="flex flex-col gap-3 p-4">
        <p className="text-label font-semibold text-fg">One page for this {spaceKinds[currentSpace.kind].label.toLowerCase()}</p>
        <p className="text-caption text-fg-muted">Campaigns and DealRooms keep everything on one focused page with their own link. Only your main page can grow into a site with Shop, About and Book pages.</p>
        <Button
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() => {
          switchSpace(MAIN_SPACE_ID);
          navigate('/app/canvas');
        }}>
        
          Open main page
        </Button>
      </div>);


  return (
    <div className="flex flex-col gap-4 p-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="text-caption text-fg-muted">
          <span className="font-semibold tabular-nums text-fg">{count}</span> of {limit} page{limit === 1 ? '' : 's'} on {plan.name}
        </p>
        <IllustrativeTag note="Example page limits per plan — not final pricing." />
      </div>

      <ul className="flex flex-col gap-0.5" aria-label="Pages">
        <li>
          <button type="button" className={rowCls(active === null)} aria-current={active === null ? 'page' : undefined} onClick={() => open(null)}>
            <HomeIcon size={16} className={active === null ? 'text-action' : 'text-fg-subtle'} aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-label font-medium text-fg">{homeLabel(site)}</span>
              <span className="block truncate text-caption text-fg-subtle">Home · kub.icu/{site.handle}</span>
            </span>
          </button>
          {active === null && pages.length > 0 &&
          <div className="px-2.5 pb-3 pt-2">
              <TextInput id="home-label" label="Menu label" value={site.homeLabel ?? ''} placeholder="Home" onChange={(e) => actions.setHomeLabel(e.target.value)} />
            </div>
          }
        </li>
        {pages.map((p, i) => {
          const on = active === p.id;
          const problem = pathProblem(site, p.id, p.path);
          const old = livePath(p.id);
          return (
            <li key={p.id}>
              <div className="flex items-center gap-1">
                <button type="button" className={cn(rowCls(on), 'min-w-0 flex-1')} aria-current={on ? 'page' : undefined} onClick={() => open(p.id)}>
                  <FileTextIcon size={16} className={on ? 'text-action' : 'text-fg-subtle'} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-label font-medium text-fg">{p.title || 'Untitled'}</span>
                    <span className={cn('block truncate text-caption', problem ? 'text-danger' : 'text-fg-subtle')}>/{p.path || '…'}</span>
                  </span>
                  {p.hideFromNav && <EyeOffIcon size={14} className="shrink-0 text-fg-subtle" aria-label="Not in site menu" />}
                </button>
                <Menu
                  align="end"
                  items={[
                  { id: 'up', label: 'Move up', icon: ArrowUpIcon, disabled: i === 0, onSelect: () => actions.movePage(p.id, -1) },
                  { id: 'down', label: 'Move down', icon: ArrowDownIcon, disabled: i === pages.length - 1, onSelect: () => actions.movePage(p.id, 1) },
                  {
                    id: 'dup',
                    label: 'Duplicate',
                    icon: CopyIcon,
                    disabled: atLimit,
                    reason: atLimit ? `Your plan includes ${limit} pages` : undefined,
                    onSelect: () => {
                      actions.duplicatePage(p.id);
                      onOpened?.();
                    }
                  },
                  {
                    id: 'home',
                    label: 'Make this the home page',
                    icon: HomeIcon,
                    reason: `Opens at kub.icu/${site.handle}`,
                    onSelect: () => {
                      actions.makeHome(p.id);
                      toast(`“${p.title}” is now your home page`, { action: { label: 'Undo', onClick: () => actions.undo() } });
                    }
                  },
                  { id: 'del', label: 'Delete page', icon: Trash2Icon, destructive: true, onSelect: () => setRemoving(p.id) }]
                  }
                  trigger={(t) => <IconButton {...t} icon={MoreHorizontalIcon} size={touch ? 'md' : 'sm'} label={`More for ${p.title || 'page'}`} />} />
                
              </div>
              {on &&
              <div className="flex flex-col gap-3 px-2.5 pb-4 pt-2">
                  <TextInput id={`pg-title-${p.id}`} label="Name in menu" value={p.title} error={!p.title.trim() ? 'Give this page a name' : undefined} onChange={(e) => actions.renamePage(p.id, e.target.value)} />
                  <TextInput
                  id={`pg-path-${p.id}`}
                  label="Address"
                  prefix={`/${site.handle}/`}
                  value={p.path}
                  error={problem ?? undefined}
                  hint={old && old !== p.path ? `/${old} will forward here, so shared links keep working.` : 'Lowercase letters, numbers and hyphens.'}
                  onChange={(e) => actions.setPagePath(p.id, e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} />
                
                  <Switch id={`pg-nav-${p.id}`} label="Show in site menu" description="Hidden pages still open from their link." checked={!p.hideFromNav} onChange={(show) => actions.setPageHidden(p.id, !show)} />
                </div>
              }
            </li>);

        })}
      </ul>

      {adding ?
      <form
        className="flex flex-col gap-2 rounded-md border border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}>
        
          <TextInput id="new-page-title" label="Page name" placeholder="e.g. Shop, About, Book" value={newTitle} autoFocus onChange={(e) => setNewTitle(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="tertiary" type="button" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={!newTitle.trim()}>
              Add page
            </Button>
          </div>
        </form> :

      <div className="flex flex-col gap-2">
          <Button variant="secondary" leadingIcon={PlusIcon} disabled={atLimit} onClick={() => setAdding(true)} fullWidth>
            Add a page
          </Button>
          {atLimit &&
        <p className="px-1 text-caption text-fg-subtle">
              {plan.name} includes {limit} page{limit === 1 ? '' : 's'}.{nextPlan ? ` ${nextPlan.name} allows up to ${pageLimits[nextPlan.id]}.` : ''} Pages you already have are never removed.
            </p>
        }
          {atLimit && nextPlan && <UpgradeButton plan={nextPlan.id} feature="More pages on your site" className="self-start" />}
        </div>
      }

      <p className="px-1 text-caption text-fg-subtle">Every page shares your link, theme and menu, and they all publish together.</p>

      <Dialog
        open={!!removingPage}
        onClose={() => setRemoving(null)}
        size="sm"
        title={`Delete “${removingPage?.title || 'this page'}”?`}
        description={
        removingPage && livePath(removingPage.id) ?
        `Its blocks are removed from your draft. After you publish, /${livePath(removingPage.id)} forwards to your home page. You can undo on the canvas.` :
        'Its blocks are removed from your draft. You can undo on the canvas.'
        }
        footer={
        <>
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Keep it
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              if (!removingPage) return;
              actions.removePage(removingPage.id);
              setRemoving(null);
              toast(`Deleted “${removingPage.title}”`, { action: { label: 'Undo', onClick: () => actions.undo() } });
            }}>
            
              Delete page
            </Button>
          </>
        }>
        
        {null}
      </Dialog>
    </div>);

}