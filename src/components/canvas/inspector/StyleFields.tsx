import React from 'react';
import { AlignCenterIcon, AlignLeftIcon, PaletteIcon } from 'lucide-react';
import type { Block } from '../../../types/page';
import { blockDefinitions } from '../../../data/blockRegistry';
import { useEditor } from '../../../contexts/EditorContext';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { Button } from '../../ui/Button';

const alignable = new Set<Block['type']>(['profile', 'heading', 'text', 'link', 'social']);

export function StyleFields({ block }: {block: Block;}) {
  const { actions } = useEditor();
  const def = blockDefinitions[block.type];

  return (
    <div className="flex flex-col gap-5">
      {alignable.has(block.type) &&
      <Field id={`${block.id}-align`} label="Alignment">
          <Segmented
          ariaLabel="Alignment"
          value={block.style.align}
          onChange={(align) => actions.updateMeta(block.id, { style: { align } })}
          options={[
          { value: 'left', label: 'Left', icon: AlignLeftIcon },
          { value: 'center', label: 'Centre', icon: AlignCenterIcon }]
          } />
        
        </Field>
      }
      {def.supportsEmphasis &&
      <Field id={`${block.id}-emphasis`} label="Emphasis" hint="Featured uses your page’s button colour. Keep it for one or two key actions.">
          <Segmented
          ariaLabel="Emphasis"
          fullWidth
          value={block.style.emphasis}
          onChange={(emphasis) => actions.updateMeta(block.id, { style: { emphasis } })}
          options={[
          { value: 'default', label: 'Standard' },
          { value: 'featured', label: 'Featured' },
          { value: 'subtle', label: 'Subtle' }]
          } />
        
        </Field>
      }
      <Field id={`${block.id}-spacing`} label="Spacing around block">
        <Segmented
          ariaLabel="Spacing"
          fullWidth
          value={block.layout.spacing}
          onChange={(spacing) => actions.updateMeta(block.id, { layout: { spacing } })}
          options={[
          { value: 'tight', label: 'Tight' },
          { value: 'normal', label: 'Normal' },
          { value: 'loose', label: 'Roomy' }]
          } />
        
      </Field>
      <div className="rounded-md border border-line bg-sunken/60 p-3.5">
        <p className="text-label font-medium text-fg">Colours, fonts and button shape</p>
        <p className="mt-0.5 text-caption text-fg-subtle">These come from the page theme, so every block stays consistent.</p>
        <Button variant="secondary" size="sm" leadingIcon={PaletteIcon} className="mt-3" onClick={() => actions.select(null)}>
          Edit page theme
        </Button>
      </div>
    </div>);

}