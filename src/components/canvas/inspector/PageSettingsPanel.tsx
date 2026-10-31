import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';
import { useEditor } from '../../../contexts/EditorContext';
import { useT } from '../../../contexts/LocaleContext';
import { TextInput } from '../../ui/TextInput';
import { PlanLock } from '../../ui/PlanLock';
import { UpgradeButton } from '../../ui/UpgradeButton';
import { CampaignSettingsPanel } from './CampaignSettingsPanel';
import { DealRoomSettingsPanel } from './DealRoomSettingsPanel';
import { EventSpaceSettingsPanel } from './EventSpaceSettingsPanel';
import { FundraiserSettingsPanel } from './FundraiserSettingsPanel';
import { PopupSettingsPanel } from './PopupSettingsPanel';
import { BookingPageSettingsPanel } from './BookingPageSettingsPanel';
import { MembersAreaSettingsPanel } from './MembersAreaSettingsPanel';
import { CoBrandSettingsPanel } from './CoBrandSettingsPanel';
import { Switch } from '../../ui/Switch';
import { usePlan } from '../../../contexts/PlanContext';
import { badgeRemovalPlanName } from '../../../data/plans';
import { showsKubicuBadge } from '../../../utils/branding';
import { pageTitle, sitePages } from '../../../utils/sitePages';
import { SelectInput } from '../../ui/SelectInput';
import { SearchEnginesSection } from './SearchEnginesSection';
import { SearchSharingFields } from './SearchSharingFields';
import { ShortLinkQuick } from '../ShortLinkQuick';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { blockName, summarizeBlock } from '../../../utils/blocks';

const pageLanguages = [
{ value: 'en', label: 'English' },
{ value: 'pcm', label: 'Nigerian Pidgin' },
{ value: 'yo', label: 'Yorùbá' },
{ value: 'ig', label: 'Igbo' },
{ value: 'ha', label: 'Hausa' },
{ value: 'sw', label: 'Swahili' },
{ value: 'tw', label: 'Twi' },
{ value: 'zu', label: 'Zulu' },
{ value: 'fr', label: 'French' }];


/** Page panel → page settings. Shared inputs translate their own labels; headings, notes and built lines here (D305). */
export function PageSettingsPanel() {
  const { t: tr } = useT();
  const { state, actions, issues } = useEditor();
  const { draft } = state;
  const handleError = issues.find((i) => i.id === 'page:handle')?.message;
  const plan = usePlan();
  const badgeShown = showsKubicuBadge(draft, plan);
  const multi = sitePages(state.site).length > 0;
  const bar = state.site.layout?.actionBar ?? null;
  const targets = draft.blocks.filter((b) => !b.visibility.hidden).map((b) => ({ value: b.id, label: `${tr(blockName(b))} — ${summarizeBlock(b).slice(0, 32) || tr('untitled')}` }));

  return (
    <div className="flex flex-col gap-5">
      <CampaignSettingsPanel />
      <EventSpaceSettingsPanel />
      <FundraiserSettingsPanel />
      <PopupSettingsPanel />
      <BookingPageSettingsPanel />
      <MembersAreaSettingsPanel />
      <CoBrandSettingsPanel />
      <DealRoomSettingsPanel />
      {multi &&
      <p className="rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">
          {tr('Editing page:')} <span className="font-semibold text-fg">{pageTitle(state.site, state.activePageId)}</span>. {tr('Link, theme and branding are shared by every page; search & sharing below is for this page only.')}
        </p>
      }
      <TextInput id="page-title" label={multi ? 'Site name' : 'Page name'} value={draft.title} hint={multi ? 'Shown at the top of your site menu.' : 'Only you see this in the workspace.'} onChange={(e) => actions.updatePage({ title: e.target.value }, 'title')} />
      <SelectInput<string>
        id="page-language"
        label="Page language"
        value={state.site.language ?? 'en'}
        options={pageLanguages}
        onChange={(v) => actions.setLanguage(v)}
        hint="Helps screen readers pronounce your page and browsers offer translation." />
      
      <TextInput
        id="page-handle"
        label="Page link"
        prefix="kub.icu/"
        value={draft.handle}
        error={handleError}
        hint="Lowercase letters, numbers and hyphens."
        onChange={(e) => actions.updatePage({ handle: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }, 'handle')} />
      
      <div className="flex items-start justify-between gap-3 rounded-md border border-dashed border-line-strong p-3">
        <div>
          <p className="text-label font-medium text-fg">{tr('Custom domain')}</p>
          <p className="mt-0.5 text-caption text-fg-subtle">{tr('Use your own address, like adaezeatelier.com.')}</p>
        </div>
        <Link to="/app/domains" className="inline-flex shrink-0 items-center gap-1 text-caption font-semibold text-action hover:underline">
          {tr('Domains')} <ArrowUpRightIcon size={12} aria-hidden />
        </Link>
      </div>

      <section className="flex flex-col gap-4 border-t border-line pt-5" aria-labelledby="layout-heading">
        <h3 id="layout-heading" className="text-label font-medium text-fg">
          {tr('Layout')}
        </h3>
        <Field id="layout-width" label="Reading width" hint="How wide text columns are on computers. Blocks set to Wide or Edge to edge ignore it.">
          <Segmented
            ariaLabel="Reading width"
            fullWidth
            value={state.site.layout?.contentWidth ?? 'standard'}
            onChange={(contentWidth) => actions.updateLayout({ contentWidth }, 'contentWidth')}
            options={[
            { value: 'narrow', label: 'Narrow' },
            { value: 'standard', label: 'Standard' },
            { value: 'wide', label: 'Wide' }]
            } />
          
        </Field>
        <Field id="layout-density" label="Section spacing" hint="Space around wide sections and coloured bands, across every page. Roomy is the default.">
          <Segmented
            ariaLabel="Section spacing"
            fullWidth
            value={state.site.layout?.density ?? 'comfortable'}
            onChange={(density) => actions.updateLayout({ density }, 'density')}
            options={[
            { value: 'comfortable', label: 'Roomy' },
            { value: 'compact', label: 'Compact' }]
            } />
          
        </Field>
        <Switch
          id="layout-bar"
          label="Sticky action bar on phones"
          description="One main action pinned to the bottom of phone screens, like Book, Shop or Subscribe. It steps aside while the cart is open."
          checked={!!bar?.enabled}
          onChange={(enabled) => actions.updateLayout({ actionBar: { label: bar?.label ?? 'Book now', blockId: bar?.blockId ?? null, url: bar?.url ?? '', enabled } }, 'actionBar')} />
        
        {bar?.enabled &&
        <div className="flex flex-col gap-3 border-l-2 border-line pl-3">
            <TextInput id="layout-bar-label" label="Button label" value={bar.label} maxLength={28} error={bar.label.trim() ? undefined : 'Add a short label'} onChange={(e) => actions.updateLayout({ actionBar: { ...bar, label: e.target.value } }, 'actionBarLabel')} />
            <SelectInput<string>
            id="layout-bar-target"
            label="Takes visitors to"
            value={bar.blockId ?? '__url'}
            options={[...targets, { value: '__url', label: 'A link…' }]}
            onChange={(v) => actions.updateLayout({ actionBar: { ...bar, blockId: v === '__url' ? null : v } }, 'actionBarTarget')} />
          
            {!bar.blockId && <TextInput id="layout-bar-url" label="Link" placeholder="https://" value={bar.url} onChange={(e) => actions.updateLayout({ actionBar: { ...bar, url: e.target.value } }, 'actionBarUrl')} />}
          </div>
        }
      </section>

      <section className="flex flex-col gap-3 border-t border-line pt-5" aria-labelledby="branding-heading">
        <div className="flex items-start justify-between gap-3">
          <h3 id="branding-heading" className="text-label font-medium text-fg">
            {tr('Branding')}
          </h3>
          {!plan.canHideBadge && <PlanLock kind="plan">{tr('{plan} plan', { plan: badgeRemovalPlanName })}</PlanLock>}
        </div>
        <Switch
          id="branding-badge"
          label="Show “Made with KUBICU”"
          description={
          plan.canHideBadge ?
          'A small footer at the bottom of your page. Your plan lets you turn it off.' :
          tr('Free pages always show it. Upgrade to {plan} or above to remove it.', { plan: badgeRemovalPlanName })
          }
          checked={badgeShown}
          disabled={!plan.canHideBadge}
          onChange={(shown) => actions.updateBranding({ hideKubicuBadge: !shown })} />
        
        {!plan.canHideBadge && <UpgradeButton plan="creator" feature="Removing “Made with KUBICU”" className="self-start" />}
        <Switch
          id="branding-lightweight"
          label="Open in data saver for everyone"
          description="Photos and videos wait until visitors tap them, and animations stay still — good if most customers are on mobile data. Visitors can turn it off, and slow connections get it anyway."
          checked={!!draft.branding?.startLightweight}
          onChange={(on) => actions.updateBranding({ startLightweight: on })} />
        
        {!plan.canHideBadge && draft.branding?.hideKubicuBadge &&
        <p className="text-caption text-fg-subtle">
            {tr('Your earlier choice to hide it is saved and will apply again if you move to a paid plan.')}
          </p>
        }
      </section>

      <section className="flex flex-col gap-4 border-t border-line pt-5" aria-labelledby="seo-heading">
        <div>
          <h3 id="seo-heading" className="text-label font-medium text-fg">
            {tr('Search & sharing')}
          </h3>
          <p className="text-caption text-fg-subtle">{tr('How your page appears on Google and when shared on WhatsApp or X.')}</p>
        </div>
        <SearchSharingFields idPrefix="seo" />
      </section>

      <section className="flex flex-col gap-4 border-t border-line pt-5" aria-labelledby="shortlink-heading">
        <ShortLinkQuick />
      </section>

      <SearchEnginesSection />
    </div>);

}