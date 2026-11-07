import React, { useMemo, useState } from 'react';
import { DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useCommerce } from '../../../contexts/CommerceContext';
import { useEditor } from '../../../contexts/EditorContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { buildFeed, feedChannels, type FeedChannel } from '../../../utils/productFeed';
import { downloadCsv } from '../../../utils/csv';
import { Button } from '../../ui/Button';
import { Segmented } from '../../ui/Segmented';
import { ToolSection, ToolStat } from './ToolSection';

export function ProductFeedTool() {
  const { data } = useCommerce();
  const { state } = useEditor();
  const { current } = useWorkspace();
  const [channel, setChannel] = useState<FeedChannel>('meta');
  const handle = state.published?.handle ?? state.site.handle;
  const feed = useMemo(() => buildFeed(data, handle, current.name, channel), [data, handle, current.name, channel]);

  return (
    <ToolSection title="Your feed" simulated="The file is real. An address that Meta and Google re-read every day needs the KUBICU backend, so upload the file again after big changes.">
      <Segmented<FeedChannel> size="sm" ariaLabel="Catalogue" value={channel} onChange={setChannel} options={[{ value: 'meta', label: 'Meta' }, { value: 'google', label: 'Google' }]} />
      <dl className="grid grid-cols-2 gap-4">
        <ToolStat label="Products in the feed" value={feed.included} />
        <ToolStat label="Left out" value={feed.skipped.length} />
      </dl>
      {feed.skipped.length > 0 && (
        <div>
          <h4 className="text-caption font-semibold text-fg">Left out, and why</h4>
          <ul className="mt-1.5 flex max-h-48 flex-col divide-y divide-line overflow-y-auto">
            {feed.skipped.map((s) => (
              <li key={s.id} className="flex items-baseline justify-between gap-3 py-2 text-label">
                <span className="min-w-0 truncate text-fg">{s.name}</span>
                <span className="shrink-0 text-caption text-fg-muted">{s.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-caption text-fg-muted">Upload in {feedChannels[channel].where}.</p>
        <Button
          size="sm"
          leadingIcon={DownloadIcon}
          disabled={feed.included === 0}
          onClick={() => {
            downloadCsv(`kubicu-${channel}-product-feed.csv`, feed.csv);
            toast.success('Feed downloaded', { description: `${feed.included} products` });
          }}
        >
          Download feed
        </Button>
      </div>
    </ToolSection>
  );
}
