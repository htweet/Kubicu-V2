import React from 'react';
import { useEditor } from '../../../contexts/EditorContext';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { MediaPicker } from '../../media/MediaPicker';
import { MediaImage } from '../../media/MediaImage';
import { publicUrl } from '../../../utils/format';
import { findPage } from '../../../utils/sitePages';
import { cn } from '../../../utils/cn';

export const SEO_TITLE_MAX = 60;
export const SEO_DESC_MAX = 160;

/** The page's title, description and share image as visitors' apps will show them. */
export function seoSummary(seo: {title: string;description: string;image?: string;}): {filled: number;missing: string[];} {
  const missing = [!seo.title.trim() && 'title', !seo.description.trim() && 'description', !seo.image && 'share image'].filter(Boolean) as string[];
  return { filled: 3 - missing.length, missing };
}

/**
 * Search & sharing fields (D219): shared by Page settings and the Publish dialog so both edit the same values.
 * Title and description fall back to the page name; the share image falls back to the profile photo.
 */
export function SearchSharingFields({ idPrefix, compact = false }: {idPrefix: string;compact?: boolean;}) {
  const { state, actions } = useEditor();
  const { draft } = state;
  const current = findPage(state.site, state.activePageId);
  const shareUrl = `${publicUrl(draft.handle)}${current ? `/${current.path}` : ''}`;
  const profile = draft.blocks.find((b) => b.type === 'profile');
  const avatar = profile?.type === 'profile' ? profile.content.avatarUrl : '';
  const image = draft.seo.image || avatar;
  const fallbackTitle = current ? `${current.title} · ${draft.title}` : draft.title;
  const titleLen = draft.seo.title.length;
  const descLen = draft.seo.description.length;

  return (
    <div className="flex flex-col gap-4">
      <TextInput
        id={`${idPrefix}-title`}
        label="Title"
        placeholder={fallbackTitle}
        value={draft.seo.title}
        hint={titleLen > SEO_TITLE_MAX ? `${titleLen}/${SEO_TITLE_MAX} — Google may cut it short` : `${titleLen}/${SEO_TITLE_MAX} · Leave blank to use “${fallbackTitle}”`}
        onChange={(e) => actions.updatePage({ seo: { title: e.target.value } }, 'seoTitle')} />
      
      <TextArea
        id={`${idPrefix}-desc`}
        label="Description"
        rows={compact ? 2 : 3}
        placeholder="One or two sentences on what you offer and where."
        value={draft.seo.description}
        hint={descLen > SEO_DESC_MAX ? `${descLen}/${SEO_DESC_MAX} — longer text is cut off in search and chats` : `${descLen}/${SEO_DESC_MAX} characters`}
        onChange={(e) => actions.updatePage({ seo: { description: e.target.value } }, 'seoDesc')} />
      
      <MediaPicker
        id={`${idPrefix}-image`}
        label="Share image"
        optional
        aspect="16:9"
        value={draft.seo.image ?? ''}
        hint={draft.seo.image ? 'Shown when your link is shared on WhatsApp, X or Facebook.' : avatar ? 'Using your profile photo for now. A wide photo looks better in chats.' : 'Shown when your link is shared on WhatsApp, X or Facebook.'}
        onChange={(src, meta) => actions.updatePage({ seo: { image: src || undefined, imageAlt: src ? meta?.alt || draft.seo.imageAlt || '' : undefined } }, 'seoImage')} />
      
      {draft.seo.image &&
      <TextInput
        id={`${idPrefix}-image-alt`}
        label="Image description"
        optional
        placeholder="e.g. Rails of Ankara two-pieces in the studio"
        value={draft.seo.imageAlt ?? ''}
        onChange={(e) => actions.updatePage({ seo: { imageAlt: e.target.value } }, 'seoImageAlt')} />

      }

      <figure className="m-0">
        <figcaption className="mb-1.5 text-caption font-medium text-fg-muted">Preview when shared</figcaption>
        <div className="overflow-hidden rounded-md border border-line bg-canvas">
          {draft.seo.image ?
          <MediaImage src={draft.seo.image} alt="" className="aspect-[1.91/1] w-full object-cover" /> :
          null}
          <div className={cn('flex gap-3 p-3', draft.seo.image && 'pt-2.5')}>
            {!draft.seo.image && (
            image ? <MediaImage src={image} alt="" className="h-14 w-14 shrink-0 rounded-sm object-cover" /> : <div className="h-14 w-14 shrink-0 rounded-sm bg-sunken" aria-hidden />)}
            <div className="min-w-0">
              <p className="truncate text-caption text-fg-subtle">{shareUrl}</p>
              <p className="truncate text-label font-semibold text-fg">{draft.seo.title || fallbackTitle}</p>
              <p className="line-clamp-2 text-caption text-fg-muted">{draft.seo.description || 'Add a description to improve how your link looks when shared.'}</p>
            </div>
          </div>
        </div>
      </figure>
    </div>);

}