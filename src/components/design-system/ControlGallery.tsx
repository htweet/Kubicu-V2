import React, { useState } from 'react';
import { PlusIcon, Trash2Icon, CopyIcon, SmartphoneIcon, TabletIcon, MonitorIcon, ArrowRightIcon, SearchIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TextInput } from '../ui/TextInput';
import { Switch } from '../ui/Switch';
import { Segmented } from '../ui/Segmented';
import { Tabs } from '../ui/Tabs';
import { SelectInput } from '../ui/SelectInput';
import { DsLabel } from './DsSection';
import { CurrencyInput } from '../ui/CurrencyInput';
import { DateTimeInput } from '../ui/DateTimeInput';
import { TimezoneSelect, type TimeZoneId } from '../ui/TimezoneSelect';
import { MediaPicker } from '../media/MediaPicker';

export function ControlGallery() {
  const [on, setOn] = useState(true);
  const [vp, setVp] = useState<'phone' | 'tablet' | 'desktop'>('phone');
  const [tab, setTab] = useState<'content' | 'style' | 'behaviour'>('content');
  const [shape, setShape] = useState<'pill' | 'rounded' | 'square'>('pill');
  const [price, setPrice] = useState<number | null>(45000);
  const [when, setWhen] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>('09:00');
  const [tz, setTz] = useState<TimeZoneId>('Africa/Lagos');
  const [media, setMedia] = useState('');

  return (
    <div className="flex flex-col gap-10">
      <div>
        <DsLabel>Buttons — default · disabled · loading</DsLabel>
        <div className="flex flex-col gap-3">
          {(['primary', 'secondary', 'tertiary', 'destructive'] as const).map((v) =>
          <div key={v} className="flex flex-wrap items-center gap-3">
              <span className="w-24 font-mono text-caption text-fg-subtle">{v}</span>
              <Button variant={v} leadingIcon={v === 'destructive' ? Trash2Icon : undefined}>
                {v === 'destructive' ? 'Delete block' : v === 'primary' ? 'Publish' : v === 'secondary' ? 'Preview' : 'Cancel'}
              </Button>
              <Button variant={v} disabled>
                Disabled
              </Button>
              <Button variant={v} loading>
                Saving
              </Button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-24 font-mono text-caption text-fg-subtle">sizes</span>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg" trailingIcon={ArrowRightIcon}>
              Large
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-24 font-mono text-caption text-fg-subtle">icon</span>
            <IconButton icon={CopyIcon} label="Duplicate" />
            <IconButton icon={CopyIcon} label="Duplicate (active)" active />
            <IconButton icon={PlusIcon} label="Add" variant="outline" />
            <IconButton icon={PlusIcon} label="Add" variant="solid" />
            <IconButton icon={Trash2Icon} label="Delete (disabled)" disabled />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <DsLabel>Text fields</DsLabel>
          <TextInput id="ds-default" label="Button label" defaultValue="Shop the Harmattan drop" />
          <TextInput id="ds-hint" label="Page link" prefix="kub.icu/" defaultValue="adaeze" hint="Lowercase letters, numbers and hyphens." />
          <TextInput id="ds-icon" label="Search" leadingIcon={SearchIcon} placeholder="Search blocks" />
        </div>
        <div className="flex flex-col gap-4">
          <DsLabel>Validation & disabled</DsLabel>
          <TextInput id="ds-error" label="Destination" defaultValue="adaezeatelier" error="Destination must be a full link starting with https://" />
          <TextInput id="ds-optional" label="Location" optional placeholder="e.g. Lekki, Lagos" />
          <TextInput id="ds-disabled" label="Custom domain" disabled placeholder="Available in Batch 5" />
          <SelectInput
            id="ds-select"
            label="Heading size"
            value="h2"
            onChange={() => undefined}
            options={[
            { value: 'h2', label: 'Section' },
            { value: 'h3', label: 'Sub-section' }]
            } />
          
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <DsLabel>Money, dates & time zones</DsLabel>
          <CurrencyInput id="ds-currency" label="Price" value={price} onChange={setPrice} placeholder="Price on request" hint="Whole naira. Leave blank for “Price on request”." />
          <DateTimeInput id="ds-datetime" label="Go live on" value={when} onChange={setWhen} clearable />
          <div className="grid grid-cols-2 gap-3">
            <DateTimeInput id="ds-date" label="Date" mode="date" value={date} onChange={setDate} />
            <DateTimeInput id="ds-time" label="Time" mode="time" value={time} onChange={setTime} hint="24-hour" />
          </div>
          <TimezoneSelect id="ds-tz" value={tz} onChange={setTz} hint="Bookings and schedules use the workspace time zone." />
        </div>
        <div className="flex flex-col gap-4">
          <DsLabel>Media — upload, crop, or link</DsLabel>
          <MediaPicker id="ds-media" label="Product photo" aspect="4:5" value={media} onChange={setMedia} />
          <MediaPicker id="ds-avatar" label="Logo" aspect="1:1" round optional value="" onChange={() => undefined} disabled hint="Disabled state." />
          <p className="text-caption text-fg-subtle">
            Uploads are checked (JPG, PNG, WebP, 10 MB), resized to 1280px and compressed so pages stay fast on mobile data.
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <DsLabel>Selection</DsLabel>
          <Switch id="ds-switch" label="Open in a new tab" description="Keeps your page open behind the destination." checked={on} onChange={setOn} />
          <Switch id="ds-switch-off" label="Show by visitor source" description="Disabled until IntentFlow launches." checked={false} onChange={() => undefined} disabled />
          <Segmented
            ariaLabel="Preview width"
            value={vp}
            onChange={setVp}
            options={[
            { value: 'phone', label: 'Phone', icon: SmartphoneIcon, iconOnly: true },
            { value: 'tablet', label: 'Tablet', icon: TabletIcon, iconOnly: true },
            { value: 'desktop', label: 'Desktop', icon: MonitorIcon, iconOnly: true }]
            } />
          
          <Segmented
            ariaLabel="Button shape"
            value={shape}
            onChange={setShape}
            options={[
            { value: 'pill', label: 'Pill' },
            { value: 'rounded', label: 'Rounded' },
            { value: 'square', label: 'Square' }]
            } />
          
        </div>
        <div>
          <DsLabel>Tabs</DsLabel>
          <Tabs
            idPrefix="ds"
            ariaLabel="Example tabs"
            value={tab}
            onChange={setTab}
            items={[
            { id: 'content', label: 'Content', badge: 2 },
            { id: 'style', label: 'Style' },
            { id: 'behaviour', label: 'Behaviour' }]
            } />
          
          <p className="pt-4 text-label text-fg-muted">Arrow keys move between tabs. The badge counts issues in that tab.</p>
        </div>
      </div>
    </div>);

}