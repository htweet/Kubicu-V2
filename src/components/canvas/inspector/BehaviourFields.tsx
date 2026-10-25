import React from 'react';
import type { Block } from '../../../types/page';
import { blockDefinitions } from '../../../data/blockRegistry';
import { useEditor } from '../../../contexts/EditorContext';
import { Switch } from '../../ui/Switch';
import { TextInput } from '../../ui/TextInput';
import { InspectorGroup } from './InspectorGroup';

/** Behaviour tab, grouped (D177): Links → Advanced. */
export function BehaviourFields({ block }: {block: Block;}) {
  const { actions } = useEditor();
  const def = blockDefinitions[block.type];

  if (!def.clickable) {
    return <p className="text-label text-fg-muted">{def.name} blocks don’t link anywhere, so there’s nothing to configure here.</p>;
  }

  const linkSummary = [block.behaviour.openInNewTab ? 'Opens in a new tab' : 'Opens in the same tab', block.behaviour.trackClicks ? 'taps counted' : 'taps not counted'].join(' · ');

  return (
    <div className="flex flex-col">
      <InspectorGroup storeKey="behaviour.links" title="When tapped" summary={linkSummary}>
        <Switch
          id={`${block.id}-newtab`}
          label="Open in a new tab"
          description="Keeps your page open behind the destination."
          checked={block.behaviour.openInNewTab}
          onChange={(openInNewTab) => actions.updateMeta(block.id, { behaviour: { openInNewTab } })} />
        
        <Switch
          id={`${block.id}-track`}
          label="Count taps"
          description="Counts anonymous taps on this block’s links and buttons for Analytics, IntentFlow and A/B goals. Turn off to stop counting this block."
          checked={block.behaviour.trackClicks}
          onChange={(trackClicks) => actions.updateMeta(block.id, { behaviour: { trackClicks } })} />
        
      </InspectorGroup>
      <InspectorGroup
        storeKey="behaviour.advanced"
        title="Advanced"
        summary={block.accessibility.label ? `Screen readers hear “${block.accessibility.label}”` : 'Screen readers use the block’s own words'}
        defaultOpen={false}>
        
        <TextInput
          id={`${block.id}-a11y`}
          label="Accessible label"
          optional
          value={block.accessibility.label}
          hint="Overrides what screen readers announce, e.g. “Order the Ìfé set on WhatsApp”."
          onChange={(e) => actions.updateMeta(block.id, { accessibility: { label: e.target.value } }, 'a11y')} />
        
      </InspectorGroup>
    </div>);

}