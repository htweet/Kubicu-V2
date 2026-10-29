import React from 'react';
import { useEditor } from '../../../contexts/EditorContext';
import { Switch } from '../../ui/Switch';
import { findPage, sitePages } from '../../../utils/sitePages';
import { robotsFor } from '../../../utils/seo';

/** One line on what search engines are told, for summaries (D221). */
export function indexingSummary(site: {branding?: {hideFromSearch?: boolean;noFollowLinks?: boolean;};}, pageSeo: {noIndex?: boolean;}): string {
  if (site.branding?.hideFromSearch) return 'Hidden from Google and other search engines';
  if (pageSeo.noIndex) return 'This page is hidden from search';
  return site.branding?.noFollowLinks ? 'Listed on Google · links not followed' : 'Listed on Google';
}

/**
 * Search engine instructions (D221): list the space, list this page, follow links.
 * Used in Page settings → Search engines and in the Publish window. Takes effect when published.
 */
export function IndexingFields({ idPrefix }: {idPrefix: string;}) {
  const { state, actions } = useEditor();
  const site = state.site;
  const spaceHidden = !!site.branding?.hideFromSearch;
  const multi = sitePages(site).length > 0;
  const page = findPage(site, state.activePageId);
  const pageName = page ? `the ${page.title} page` : multi ? 'the home page' : 'this page';
  const pageHidden = !!state.draft.seo.noIndex;
  const robots = robotsFor(site, state.draft.seo) ?? 'index, follow';

  return (
    <div className="flex flex-col gap-4">
      <Switch
        id={`${idPrefix}-index-space`}
        label="Show in search results"
        description={spaceHidden ? 'Hidden: Google and others are asked not to list any page here. People with the link can still open it.' : 'Google and others can list your pages, shop and products.'}
        checked={!spaceHidden}
        onChange={(on) => actions.updateBranding({ hideFromSearch: !on })} />
      
      {!spaceHidden && (multi || pageHidden) &&
      <Switch
        id={`${idPrefix}-index-page`}
        label={`List ${pageName}`}
        description={pageHidden ? 'This page is kept out of search and the sitemap. The rest of the site is still listed.' : 'Turn off for pages like thank-you or private offer pages.'}
        checked={!pageHidden}
        onChange={(on) => actions.updatePage({ seo: { noIndex: on ? undefined : true } }, 'seoNoIndex')} />

      }
      <Switch
        id={`${idPrefix}-follow`}
        label="Let search engines follow your links"
        description={
        site.branding?.noFollowLinks ?
        'Not followed: links to other sites don’t pass on your page’s standing. Use this if your page is mostly paid or affiliate links.' :
        'Followed: the usual choice. Search engines can discover the sites and profiles you link to.'
        }
        checked={!site.branding?.noFollowLinks}
        onChange={(on) => actions.updateBranding({ noFollowLinks: on ? undefined : true })} />
      
      <p className="text-caption text-fg-subtle">
        Tells search engines: <code className="rounded-sm bg-sunken px-1 py-0.5 font-mono text-[11.5px] text-fg-muted">{robots}</code>. Changes apply when you publish. New pages usually appear on Google within days to a few weeks — listing isn’t guaranteed.
      </p>
    </div>);

}