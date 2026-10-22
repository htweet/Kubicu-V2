import React from 'react';
import type { Block } from '../../../types/page';
import { blockDefinitions } from '../../../data/blockRegistry';
import { useEditor } from '../../../contexts/EditorContext';
import { Switch } from '../../ui/Switch';
import { TextInput } from '../../ui/TextInput';

export function BehaviourFields({ block }: {block: Block;}) {
  const { actions } = useEditor();
  const def = blockDefinitions[block.type];

  if (!def.clickable) {
    return <p className="text-label text-fg-muted">{def.name} blocks don’t link anywhere, so there’s nothing to configure here.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <Switch
        id={`${block.id}-newtab`}
        label="Open in a new tab"
        description="Keeps your page open behind the destination."
        checked={block.behaviour.openInNewTab}
        onChange={(openInNewTab) => actions.updateMeta(block.id, { behaviour: { openInNewTab } })} />
      
      <Switch
        id={`${block.id}-track`}
        label="Count clicks"
        description="Will count anonymous clicks once Analytics launches in Batch 5. Nothing is tracked yet."
        checked={block.behaviour.trackClicks}
        onChange={(trackClicks) => actions.updateMeta(block.id, { behaviour: { trackClicks } })} />
      
      <TextInput
        id={`${block.id}-a11y`}
        label="Accessible label"
        optional
        value={block.accessibility.label}
        hint="Overrides what screen readers announce, e.g. “Order the Ìfé set on WhatsApp”."
        onChange={(e) => actions.updateMeta(block.id, { accessibility: { label: e.target.value } }, 'a11y')} />
      
    </div>);

}