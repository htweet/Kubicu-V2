import React, { useState } from 'react';
import type { AccountFailure } from '../../../types/accountMode';
import type { Automation } from '../../../types/ops';
import { useT } from '../../../contexts/LocaleContext';
import { Tabs } from '../../ui/Tabs';
import { AccountStateAlert } from '../../account/AccountStates';
import { useAiRuns } from './useAiRuns';
import { RunsTab } from './RunsTab';
import { ApprovalsTab } from './ApprovalsTab';
import { RunDetailSheet } from './RunDetailSheet';
import { StartRunDialog } from './StartRunDialog';

type Tab = 'automations' | 'runs' | 'approvals';

interface AutomationsTabsProps {
  automations: Automation[];
  /** Today's Automations page content (without Run history). */
  automationsPanel: React.ReactNode;
  /** Today's Run history section. */
  earlierRuns: React.ReactNode;
}

/** Account mode only (D549): Automations · Runs · Approvals on the existing page. */
export function AutomationsTabs({ automations, automationsPanel, earlierRuns }: AutomationsTabsProps) {
  const { t: tr } = useT();
  const state = useAiRuns();
  const [tab, setTab] = useState<Tab>('automations');
  const [openRunId, setOpenRunId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [screenFailure, setScreenFailure] = useState<AccountFailure | null>(null);
  const pending = state.approvals.filter((a) => a.status === 'pending').length;
  const openRun = state.runs.find((r) => r.id === openRunId) ?? null;

  if (screenFailure) return <AccountStateAlert failure={screenFailure} className="mt-6" />;

  return (
    <div className="mt-6">
      <Tabs<Tab>
        ariaLabel={tr('Automations sections')}
        idPrefix="automations"
        value={tab}
        onChange={setTab}
        items={[
          { id: 'automations', label: 'Automations' },
          { id: 'runs', label: 'Runs' },
          { id: 'approvals', label: 'Approvals', badge: pending },
        ]}
      />
      <div role="tabpanel" id={`automations-panel-${tab}`} aria-labelledby={`automations-tab-${tab}`} tabIndex={0} className="pt-6 focus-visible:outline-none">
        {tab === 'automations' && automationsPanel}
        {tab === 'runs' && <RunsTab state={state} onOpen={setOpenRunId} onStart={() => setStarting(true)} earlierRuns={earlierRuns} />}
        {tab === 'approvals' && <ApprovalsTab state={state} onOpenRun={setOpenRunId} />}
      </div>

      <RunDetailSheet run={openRun} state={state} onClose={() => setOpenRunId(null)} onScreenFailure={setScreenFailure} />
      <StartRunDialog
        open={starting}
        onClose={() => setStarting(false)}
        automations={automations}
        state={state}
        onScreenFailure={setScreenFailure}
        onStarted={() => {
          setStarting(false);
          setTab('runs');
        }}
      />
    </div>
  );
}
