import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PauseIcon, PlayIcon, PlusIcon, RotateCcwIcon, SettingsIcon, WorkflowIcon } from 'lucide-react';
import { opsSettingsOf } from '../utils/ops/settings';
import { AutomationSettingsSheet } from '../components/automations/AutomationSettingsSheet';
import { toast } from 'sonner';
import type { Automation, AutomationRun } from '../types/ops';
import { useOps } from '../contexts/OpsContext';
import { useAccountMode } from '../contexts/AccountModeContext';
import { recipeGroups, recipes, triggerLabels, type RecipeGroup } from '../data/automationRecipes';
import { Segmented } from '../components/ui/Segmented';
import { addRun, testRun } from '../utils/ops/automation';
import { formatRelative, formatTimestamp } from '../utils/format';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InlineAlert } from '../components/ui/InlineAlert';
import { Dialog } from '../components/ui/Dialog';
import { AutomationBuilder, newAutomation, useStepLabel } from '../components/automations/AutomationBuilder';
import { RunSteps } from '../components/automations/RunSteps';
import { PendingDrafts } from '../components/automations/PendingDrafts';
import { SampleTag } from '../components/commerce/StatusBadges';
import { Section } from '../components/ui/layout/Section';
import { Card } from '../components/ui/layout/Card';
import { List } from '../components/ui/layout/ListRow';
import { AutomationsTabs } from '../components/accountMode/aiRuns/AutomationsTabs';
import { Tabs } from '../components/ui/Tabs';
import { useT } from '../contexts/LocaleContext';

type LibraryTab = 'yours' | 'recipes';

const statusTone = { active: 'success', paused: 'warning', draft: 'neutral' } as const;
const statusText = { active: 'On', paused: 'Paused', draft: 'Draft' } as const;

export function Automations() {
  const { t: tr } = useT();
  const label = useStepLabel();
  const { data, apply } = useOps();
  // Account mode (D549): Automations · Runs · Approvals tabs. Browser mode renders exactly as before.
  const { active: account } = useAccountMode();
  // ?recipe=<id> opens that recipe as a draft — e.g. "Recover unpaid checkouts" from Orders (D231).
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<Automation | null>(() => {
    const r = params.get('recipe');
    return r && recipes.some((x) => x.id === r) ? newAutomation(r) : null;
  });
  useEffect(() => {
    if (params.get('recipe')) setParams({}, { replace: true });
  }, [params, setParams]);
  const [group, setGroup] = useState<'all' | RecipeGroup>('all');
  // Your automations and recipes share one tabbed area (D554). Start on recipes when there's nothing yet.
  const [libraryTab, setLibraryTab] = useState<LibraryTab>(() => (data.automations.length > 0 ? 'yours' : 'recipes'));
  const [runView, setRunView] = useState<{ automation: Automation; run: AutomationRun } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const quiet = opsSettingsOf(data).quietHours;

  const runs = data.automations.flatMap((a) => a.runs.map((r) => ({ automation: a, run: r }))).sort((x, y) => Date.parse(y.run.at) - Date.parse(x.run.at)).slice(0, 20);
  const failed = runs.filter((r) => r.run.status === 'failed' && !r.run.test).length;
  const liveRuns = runs.filter((r) => !r.run.test).length;

  const togglePause = () => {
    if (apply((d) => ({ ...d, automationsPaused: !d.automationsPaused }))) toast(tr(data.automationsPaused ? 'Automations resumed' : 'All automations paused'));
  };

  const retry = (a: Automation, r: AutomationRun) => {
    const run = { ...testRun(a, data.automationsPaused), test: false, subject: `Retry · ${r.subject}` };
    run.steps = run.steps.map((s) => (s.detail.startsWith('Preview') ? { ...s, detail: 'Previewed (prototype doesn’t send)' } : s));
    if (apply((d) => addRun(d, a.id, run))) {
      toast(tr('Retried'), { description: tr('Logged as a new run.') });
      setRunView(null);
    }
  };

  const automationsColumn = (
    <div>
      <Tabs<LibraryTab>
        ariaLabel={tr('Automations and recipes')}
        idPrefix="auto-library"
        value={libraryTab}
        onChange={setLibraryTab}
        items={[
          { id: 'yours', label: 'Your automations' },
          { id: 'recipes', label: 'Start from a recipe' },
        ]}
      />
      <div role="tabpanel" id={`auto-library-panel-${libraryTab}`} aria-labelledby={`auto-library-tab-${libraryTab}`} tabIndex={0} className="pt-5 focus-visible:outline-none">
      {libraryTab === 'yours' && (
        data.automations.length === 0 ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-label text-fg-muted">{tr('None yet. Start from a ready-made recipe.')}</p>
            <Button variant="secondary" size="sm" onClick={() => setLibraryTab('recipes')}>
              Browse recipes
            </Button>
          </div>
        ) : (
          <Card as="div" body="flush">
            <List label="Your automations">
              {data.automations.map((a) => (
                <li key={a.id}>
                  <button type="button" onClick={() => setEditing(a)} className="flex w-full flex-col gap-1.5 px-5 py-4 text-left md:px-6 transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-label font-semibold text-fg">{a.name}</span>
                      <Badge tone={statusTone[a.status]} dot>
                        {statusText[a.status]}
                      </Badge>
                      {a.sample && <SampleTag />}
                    </span>
                    <span className="text-caption text-fg-muted">
                      {tr(triggerLabels[a.trigger].label)} → {a.steps.map(label).join(' → ')}
                    </span>
                    <span className="text-caption text-fg-subtle">
                      {tr('{n} runs · edited {when}', { n: a.runs.filter((r) => !r.test).length, when: formatRelative(a.updatedAt) })}
                    </span>
                  </button>
                </li>
              ))}
            </List>
          </Card>
        )
      )}

      {libraryTab === 'recipes' && (
      <>
        <p className="mb-4 text-label text-fg-muted">{tr('{n} ready-made follow-ups. Each opens as a draft you can change before switching it on.', { n: recipes.length })}</p>
        <div className="mb-4 -mx-1 overflow-x-auto overflow-y-hidden px-1">
          <Segmented<'all' | RecipeGroup>
            ariaLabel="Recipe type"
            size="sm"
            value={group}
            onChange={setGroup}
            options={[{ value: 'all', label: 'All' }, ...recipeGroups.map((g) => ({ value: g.id, label: g.label }))]}
          />
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {recipes
            .filter((r) => group === 'all' || r.group === group)
            .map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => setEditing(newAutomation(r.id))} className="flex h-full w-full flex-col rounded-md border border-line p-4 text-left transition-colors duration-150 hover:border-line-strong hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <WorkflowIcon size={18} strokeWidth={2.25} className="text-action" aria-hidden />
                  <span className="mt-3 text-label font-semibold text-fg">{tr(r.name)}</span>
                  <span className="mt-1 text-caption text-fg-muted">{tr(r.description)}</span>
                  <span className="mt-auto pt-3 text-caption text-fg-subtle">
                    {tr(triggerLabels[r.trigger].label)}
                    {r.marketing ? ` · ${tr('Opted-in contacts only')}` : ''}
                    {r.needs ? ` · ${tr('Needs {what}', { what: tr(r.needs) })}` : ''}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      </>
      )}
      </div>
    </div>
  );

  const historySection = (
    <Section id="runs" title={account ? 'Earlier test and live runs' : 'Run history'} description={`${tr('{n} runs', { n: liveRuns })}${failed > 0 ? ` · ${tr('{n} failed', { n: failed })}` : ''} · ${tr('usage isn’t billed in this prototype')}`}>
      {runs.length === 0 ? (
        <p className="text-label text-fg-muted">{tr('No runs yet. Use “Test run” in any automation.')}</p>
      ) : (
        <List ruled label="Run history">
          {runs.map(({ automation, run }) => (
            <li key={run.id}>
              <button type="button" onClick={() => setRunView({ automation, run })} className="flex w-full items-start gap-3 py-3 text-left hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <Badge tone={run.status === 'succeeded' ? 'success' : run.status === 'failed' ? 'danger' : 'neutral'}>{run.test ? 'Test' : run.status === 'succeeded' ? 'Done' : run.status === 'failed' ? 'Failed' : 'Skipped'}</Badge>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-label font-medium text-fg">{automation.name}</span>
                  <span className="block truncate text-caption text-fg-subtle">{run.subject}</span>
                </span>
                <span className="shrink-0 text-caption text-fg-subtle">{formatRelative(run.at)}</span>
              </button>
            </li>
          ))}
        </List>
      )}
    </Section>
  );

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 md:px-10 md:py-12">
      <PageHeader
        title="Automations"
        description="Follow-ups that run on their own, written as plain steps you can read."
        actions={
          <>
            <Button variant="tertiary" leadingIcon={SettingsIcon} onClick={() => setSettingsOpen(true)}>
              Settings
            </Button>
            <Button variant="secondary" leadingIcon={data.automationsPaused ? PlayIcon : PauseIcon} onClick={togglePause}>
              {data.automationsPaused ? 'Resume all' : 'Pause all'}
            </Button>
            <Button leadingIcon={PlusIcon} onClick={() => setEditing(newAutomation(null))}>
              New automation
            </Button>
          </>
        }
      />
      <InlineAlert tone="info" title="Automations that are on run for real" className="mt-6">
        {tr('Every trigger reacts to real orders, bookings, forms, stock, subscriptions, due dates, unfinished checkouts, campaigns and quiet contacts — only things that happen after you switch it on. Tags and follow-ups are added, reports and notices land in your notifications, and AI drafts wait below for you. Customer emails and WhatsApp messages are written but not sent until a messaging partner is connected. In this prototype, runs happen while KUBICU is open in a tab.')}
      </InlineAlert>
      {data.automationsPaused && (
        <InlineAlert tone="warning" title="Everything is paused" className="mt-3">
          {tr('No automation runs until you resume. Useful while you change prices or close for a holiday.')}
        </InlineAlert>
      )}

      {quiet.on && (
        <p className="mt-3 text-caption text-fg-muted">
          {tr('Quiet hours {from}–{to}: customer messages written then wait until {to}.', { from: quiet.from, to: quiet.to })}
        </p>
      )}
      <AutomationSettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {account ? (
        <AutomationsTabs
          automations={data.automations}
          automationsPanel={
            <>
              <PendingDrafts />
              <div className="mt-8">{automationsColumn}</div>
            </>
          }
          earlierRuns={historySection}
        />
      ) : (
        <>
          <PendingDrafts />
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {automationsColumn}
            {historySection}
          </div>
        </>
      )}

      <AutomationBuilder automation={editing} onClose={() => setEditing(null)} />
      <Dialog
        open={!!runView}
        onClose={() => setRunView(null)}
        title={runView ? `${runView.automation.name}` : ''}
        description={runView ? `${runView.run.subject} · ${formatTimestamp(runView.run.at)}` : undefined}
        footer={
          runView?.run.status === 'failed' ? (
            <Button leadingIcon={RotateCcwIcon} onClick={() => runView && retry(runView.automation, runView.run)}>
              Retry
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setRunView(null)}>
              Close
            </Button>
          )
        }
      >
        {runView && <RunSteps run={runView.run} />}
      </Dialog>
    </div>
  );
}
