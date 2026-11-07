import React, { useState } from 'react';
import { BookmarkPlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useDomains } from '../../contexts/DomainsContext';
import type { UtmPreset } from '../../types/domains';
import { UTM_PATTERN } from '../../utils/domains/links';
import { uid } from '../../utils/id';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';

interface Props {
  medium: string;
  campaign: string;
  content: string;
  onChange: (patch: Partial<{ medium: string; campaign: string; content: string }>) => void;
  mediumPlaceholder: string;
  campaignPlaceholder: string;
  error?: string;
}

const MAX_PRESETS = 12;

/** The three campaign tags, plus saved sets you can reuse on any link (D271). */
export function UtmTagsFields({ medium, campaign, content, onChange, mediumPlaceholder, campaignPlaceholder, error }: Props) {
  const { data, apply } = useDomains();
  const presets = data.utmPresets ?? [];
  const [naming, setNaming] = useState(false);
  const [presetName, setPresetName] = useState('');
  const matching = presets.find((p) => p.medium === medium.trim() && p.campaign === campaign.trim() && p.content === content.trim());
  const empty = !medium.trim() && !campaign.trim() && !content.trim();
  const valid = [medium, campaign, content].every((v) => UTM_PATTERN.test(v.trim()));

  const savePreset = () => {
    const name = presetName.trim();
    if (!name) return;
    const preset: UtmPreset = { id: uid('utm'), name: name.slice(0, 40), medium: medium.trim(), campaign: campaign.trim(), content: content.trim() };
    if (apply((d) => ({ ...d, utmPresets: [...(d.utmPresets ?? []), preset] }))) {
      toast(`Saved “${preset.name}”`, { description: 'Choose it on any new link to fill these tags.' });
      setNaming(false);
      setPresetName('');
    }
  };

  const removePreset = (p: UtmPreset) => {
    apply((d) => ({ ...d, utmPresets: (d.utmPresets ?? []).filter((x) => x.id !== p.id) }));
    toast(`Removed “${p.name}”`, { description: 'Links that used it keep their tags.' });
  };

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-label font-medium text-fg">Tags for Google Analytics and ad tools</legend>
      <p className="-mt-1 text-caption text-fg-subtle">Only needed if you use those tools. KUBICU Analytics works without them. Leave blank to use the grey defaults.</p>

      {presets.length > 0 && (
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <SelectInput
              id="cl-preset"
              label="Use a saved set"
              value={matching?.id ?? ''}
              options={[{ value: '', label: matching ? '' : 'Choose a set…' }, ...presets.map((p) => ({ value: p.id, label: p.name }))].filter((o) => o.label)}
              onChange={(id) => {
                const p = presets.find((x) => x.id === id);
                if (p) onChange({ medium: p.medium, campaign: p.campaign, content: p.content });
              }}
            />
          </div>
          {matching && (
            <div className="mb-0.5">
              <IconButton icon={Trash2Icon} label={`Remove the saved set ${matching.name}`} onClick={() => removePreset(matching)} />
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <TextInput id="cl-medium" label="Type of channel" optional value={medium} placeholder={mediumPlaceholder} onChange={(e) => onChange({ medium: e.target.value })} hint="utm_medium" />
        <TextInput id="cl-campaign" label="Campaign" optional value={campaign} placeholder={campaignPlaceholder} onChange={(e) => onChange({ campaign: e.target.value })} hint="utm_campaign" />
        <TextInput id="cl-content" label="Post or version" optional value={content} placeholder="e.g. story-1" onChange={(e) => onChange({ content: e.target.value })} hint="utm_content" />
      </div>
      {error && <p className="text-caption text-danger">{error}</p>}

      {!empty && valid && !matching && (
        naming ? (
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <TextInput id="cl-preset-name" label="Name this set" value={presetName} placeholder="e.g. December sale ads" autoFocus onChange={(e) => setPresetName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), savePreset())} />
            </div>
            <Button size="sm" variant="secondary" onClick={() => setNaming(false)} className="mb-0.5">
              Cancel
            </Button>
            <Button size="sm" onClick={savePreset} disabled={!presetName.trim()} className="mb-0.5">
              Save set
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="tertiary"
            leadingIcon={BookmarkPlusIcon}
            className="self-start"
            disabled={presets.length >= MAX_PRESETS}
            title={presets.length >= MAX_PRESETS ? `Up to ${MAX_PRESETS} saved sets. Remove one first.` : undefined}
            onClick={() => setNaming(true)}
          >
            Save these tags as a set
          </Button>
        )
      )}
    </fieldset>
  );
}
