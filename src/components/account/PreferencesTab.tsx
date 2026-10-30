import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowUpRightIcon, BellIcon, PaletteIcon } from 'lucide-react';
import type { AccountPrefs } from '../../types/account';
import { useAccount, updateAccount, formatAccountDate } from '../../utils/account/store';
import { languageOptions, dateFormatOptions, startPageOptions } from '../../data/accountOptions';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Card } from '../ui/layout/Card';
import { SelectInput } from '../ui/SelectInput';
import { TimezoneSelect } from '../ui/TimezoneSelect';
import { Segmented } from '../ui/Segmented';
import { Field } from '../ui/Field';
import { toUiLang, translatorFor, useT } from '../../contexts/LocaleContext';

/** Account → Preferences: personal, follows you into every workspace (D80). */
export function PreferencesTab() {
  const { t: tr } = useT();
  const account = useAccount();
  const { current } = useWorkspace();
  const p = account.prefs;
  const set = (patch: Partial<AccountPrefs>, message = 'Preference saved') => {
    // Saved before the toast, so a language change shows its confirmation in the new language.
    if (updateAccount((a) => ({ ...a, prefs: { ...a.prefs, ...patch } }))) toast.success(patch.language ? translatorFor(toUiLang(patch.language))(message) : tr(message));
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Card id="pref-region" title="Language & region" description="How dates and times are written for you.">
        <div className="flex flex-col gap-4">
          <SelectInput
            id="pref-lang"
            label="Language"
            value={p.language}
            hint="Naijá, Yorùbá, Hausa and Igbo are drafts: menus, screen names and buttons change first, and anything not translated yet stays in English. French is coming later."
            options={languageOptions.map((o) => ({ value: o.value, label: o.ready ? o.label : o.draft ? `${o.label} — ${tr('draft')}` : `${o.label} — ${tr('coming soon')}`, disabled: !o.ready && !o.draft }))}
            onChange={(language) => set({ language }, 'Language saved')} />
          
          {!!languageOptions.find((o) => o.value === p.language)?.draft &&
          <p className="rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">
              {tr('These words were drafted and haven’t been checked by a native speaker yet. If something reads wrong, tell us from Help → Contact support. Your customers choose their own language at the bottom of your page.')}
            </p>
          }
          <TimezoneSelect id="pref-tz" value={p.timeZone} onChange={(timeZone) => set({ timeZone }, 'Time zone saved')} hint="Used for your sign-in history and scheduled times you see." />
          <SelectInput id="pref-date" label="Date format" value={p.dateFormat} options={dateFormatOptions} onChange={(dateFormat) => set({ dateFormat }, 'Date format saved')} />
          <p className="rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">
            {tr('Right now it’s')} <span className="font-semibold tabular-nums text-fg">{formatAccountDate(new Date().toISOString(), p)}</span> {tr('for you.')}
          </p>
        </div>
      </Card>

      <Card id="pref-comfort" title="Comfort" description="Make KUBICU easier on your eyes. Only changes what you see.">
        <div className="flex flex-col gap-5">
          <Field id="pref-text" label="Text size">
            <Segmented
              ariaLabel="Text size"
              value={p.textSize}
              fullWidth
              options={[
              { value: 'default', label: 'Standard' },
              { value: 'large', label: 'Larger' }]
              }
              onChange={(textSize) => set({ textSize }, textSize === 'large' ? 'Larger text on' : 'Standard text size')} />
            
          </Field>
          <Field id="pref-motion" label="Motion" hint="“Always reduce” calms animations even if your device allows them.">
            <Segmented
              ariaLabel="Motion"
              value={p.motion}
              fullWidth
              options={[
              { value: 'device', label: 'Follow my device' },
              { value: 'reduce', label: 'Always reduce' }]
              }
              onChange={(motion) => set({ motion }, 'Motion preference saved')} />
            
          </Field>
        </div>
      </Card>

      <Card id="pref-start" title="When you sign in" description="The first screen you land on.">
        <SelectInput id="pref-startpage" label="Open on" value={p.startPage} options={startPageOptions.map(({ value, label }) => ({ value, label }))} onChange={(startPage) => set({ startPage }, 'Start screen saved')} />
      </Card>

      <Card id="pref-elsewhere" title="Set in each workspace" description="These depend on the workspace, so they live there." body="flush">
        <ul className="divide-y divide-line">
          <LinkRow icon={BellIcon} to="/app/settings/notifications" title="Your notifications" meta={tr('Which events reach you in {workspace}, by app, email or WhatsApp.', { workspace: current.name })} />
          <LinkRow icon={PaletteIcon} to="/app" title="Workspace appearance" meta="Chosen by the Owner for everyone — from Appearance at the bottom of the sidebar." />
        </ul>
      </Card>
    </div>);

}

function LinkRow({ icon: Icon, to, title, meta }: {icon: typeof BellIcon;to: string;title: string;meta: string;}) {
  const { t } = useT();
  title = t(title);
  meta = t(meta);
  return (
    <li>
      <Link to={to} className="flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus md:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted">
          <Icon size={17} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-label font-semibold text-fg">{title}</span>
          <span className="block text-caption text-fg-subtle">{meta}</span>
        </span>
        <ArrowUpRightIcon size={16} className="shrink-0 text-fg-subtle" aria-hidden />
      </Link>
    </li>);

}