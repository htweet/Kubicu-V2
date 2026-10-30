import React from 'react';
import type { Block } from '../../../types/page';
import { blockDefinitions } from '../../../data/blockRegistry';
import { useEditor } from '../../../contexts/EditorContext';
import { useT } from '../../../contexts/LocaleContext';
import { Switch } from '../../ui/Switch';
import { TextInput } from '../../ui/TextInput';
import { InspectorGroup } from './InspectorGroup';

/** Behaviour tab, grouped (D177): Links → Advanced. */
export function BehaviourFields({ block }: {block: Block;}) {
  const { t: tr } = useT();
  const { actions } = useEditor();
  const def = blockDefinitions[block.type];

  if (!def.clickable) {
    return <p className="text-label text-fg-muted">{tr('{name} blocks don’t link anywhere, so there’s nothing to configure here.', { name: tr(def.name) })}</p>;
  }

  const linkSummary = [block.behaviour.openInNewTab ? tr('Opens in a new tab') : tr('Opens in the same tab'), block.behaviour.trackClicks ? tr('taps counted') : tr('taps not counted')].join(' · ');

  return (
    <div className="flex flex-col">
      <InspectorGroup storeKey="behaviour.links" title={tr('When tapped')} summary={linkSummary}>
        <Switch
          id={`${block.id}-newtab`}
          label={tr('Open in a new tab')}
          description={tr('Keeps your page open behind the destination.')}
          checked={block.behaviour.openInNewTab}
          onChange={(openInNewTab) => actions.updateMeta(block.id, { behaviour: { openInNewTab } })} />
        
        <Switch
          id={`${block.id}-track`}
          label={tr('Count taps')}
          description={tr('Counts anonymous taps on this block’s links and buttons for Analytics, IntentFlow and A/B goals. Turn off to stop counting this block.')}
          checked={block.behaviour.trackClicks}
          onChange={(trackClicks) => actions.updateMeta(block.id, { behaviour: { trackClicks } })} />
        
      </InspectorGroup>
      <InspectorGroup
        storeKey="behaviour.advanced"
        title={tr('Advanced')}
        summary={block.accessibility.label ? tr('Screen readers hear “{label}”', { label: block.accessibility.label }) : tr('Screen readers use the block’s own words')}
        defaultOpen={false}>
        
        <TextInput
          id={`${block.id}-a11y`}
          label={tr('Accessible label')}
          optional
          value={block.accessibility.label}
          hint={tr('Overrides what screen readers announce, e.g. “Order the Ìfé set on WhatsApp”.')}
          onChange={(e) => actions.updateMeta(block.id, { accessibility: { label: e.target.value } }, 'a11y')} />
        
      </InspectorGroup>
    </div>);

}