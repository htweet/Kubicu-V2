import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, CalendarClockIcon, FileTextIcon, PackageIcon, SparklesIcon, WorkflowIcon } from 'lucide-react';
import type { BusinessKit } from '../../../types/kit';
import { findExampleById } from '../../../data/examples';
import { kitPhotos } from '../../../data/kitPhotos';
import { recipes } from '../../../data/automationRecipes';
import { templatePrice } from '../../../data/templateMarket';
import { formatNgn } from '../../../utils/format';
import { TemplateThumb } from '../../templates/TemplateThumb';

/**
 * The example half of a kit's Marketplace page (D279): who it's for, the real page it starts you with
 * (and the optional Elite look), and the exact starter items it adds — so nothing is a mystery before applying.
 */
export function KitShowcase({ kit }: {kit: BusinessKit;}) {
  const photo = kitPhotos[kit.id];
  const starter = findExampleById(kit.templateId);
  const elite = kit.eliteTemplateId ? findExampleById(kit.eliteTemplateId) : undefined;
  const kitRecipes = kit.recipes.map((id) => recipes.find((r) => r.id === id)).filter((r): r is (typeof recipes)[number] => !!r);
  const policies = [
  { label: 'Refunds', text: kit.policies.refunds },
  { label: 'Delivery', text: kit.policies.delivery },
  { label: 'Cancellation', text: kit.policies.cancellation }].
  filter((p) => p.text);

  return (
    <div className="flex flex-col gap-12">
      {photo &&
      <figure className="overflow-hidden rounded-[28px] bg-sunken">
          <img src={photo.url} alt={photo.alt} className="aspect-[16/9] w-full object-cover" />
          <figcaption className="px-5 py-3 text-[13px] text-fg-muted">
            {kit.forWho} <span className="text-fg-subtle">· Illustration, not a KUBICU customer</span>
          </figcaption>
        </figure>
      }

      {starter &&
      <section aria-labelledby="kit-pages">
          <h2 id="kit-pages" className="text-[22px] font-extrabold text-fg">
            The page it starts you with
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-fg-muted">
            A real, editable page — shown here with its example business. When you apply the kit, the sample name, photos and wording are yours to replace.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <PagePreview label="Included free" title={starter.name} note={starter.bestFor} doc={starter.doc} to={`/templates/${starter.id}`} />
            {elite && <PagePreview label={`Optional upgrade · ${formatNgn(templatePrice(elite.id))} once`} title={elite.name} note="Same content, an Elite look. You can switch any time." doc={elite.doc} to={`/templates/${elite.id}`} />}
          </div>
        </section>
      }

      <section aria-labelledby="kit-items">
        <h2 id="kit-items" className="text-[22px] font-extrabold text-fg">
          Exactly what it adds
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-fg-muted">Everything arrives as a draft without prices, so nothing goes live until you’ve checked it.</p>
        <div className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {kit.products.length > 0 &&
          <ItemGroup icon={PackageIcon} title={`Starter products · ${kit.products.length}`}>
              {kit.products.map((p) =>
            <Item key={p.name} name={p.name} text={p.description} tag={p.kind === 'digital' ? 'Digital' : undefined} />
            )}
            </ItemGroup>
          }
          {kit.services.length > 0 &&
          <ItemGroup icon={CalendarClockIcon} title={`Starter services · ${kit.services.length}`}>
              {kit.services.map((s) =>
            <Item key={s.name} name={s.name} text={s.description} tag={`${s.durationMin} min`} />
            )}
            </ItemGroup>
          }
          {policies.length > 0 &&
          <ItemGroup icon={FileTextIcon} title="Draft policies">
              {policies.map((p) =>
            <Item key={p.label} name={p.label} text={p.text} clamp />
            )}
            </ItemGroup>
          }
          {kitRecipes.length > 0 &&
          <ItemGroup icon={WorkflowIcon} title={`Automations · ${kitRecipes.length}`}>
              {kitRecipes.map((r) =>
            <Item key={r.id} name={r.name} text={r.description} />
            )}
            </ItemGroup>
          }
        </div>
        <p className="mt-6 flex items-start gap-2 text-[13px] text-fg-subtle">
          <SparklesIcon size={14} aria-hidden className="mt-0.5 shrink-0" />
          Example wording only. KUBICU never invents prices, reviews or results for your business.
        </p>
      </section>
    </div>);

}

function PagePreview({ label, title, note, doc, to }: {label: string;title: string;note: string;doc: Parameters<typeof TemplateThumb>[0]['doc'];to: string;}) {
  return (
    <Link
      to={to}
      className="group flex flex-col overflow-hidden rounded-[24px] border border-line bg-raised transition-colors duration-150 hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
      
      <div aria-hidden className="flex justify-center bg-sunken px-6 pt-6">
        <div className="overflow-hidden rounded-t-[18px] border-[4px] border-b-0 border-[rgb(18_18_20)] bg-[rgb(18_18_20)] shadow-2">
          <TemplateThumb doc={doc} width={180} height={300} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <span className="text-[12px] font-semibold text-fg-subtle">{label}</span>
        <span className="text-[17px] font-bold text-fg">{title}</span>
        <span className="text-[14px] leading-snug text-fg-muted">{note}</span>
        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-[14px] font-semibold text-fg">
          Open full preview <ArrowUpRightIcon size={15} aria-hidden className="transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>);

}

function ItemGroup({ icon: Icon, title, children }: {icon: typeof PackageIcon;title: string;children: React.ReactNode;}) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-[15px] font-bold text-fg">
        <Icon size={16} aria-hidden className="text-fg-subtle" />
        {title}
      </h3>
      <ul className="mt-3 flex flex-col divide-y divide-line border-y border-line">{children}</ul>
    </div>);

}

function Item({ name, text, tag, clamp }: {name: string;text: string;tag?: string;clamp?: boolean;}) {
  return (
    <li className="py-3">
      <p className="flex items-baseline justify-between gap-3 text-[15px] font-semibold text-fg">
        {name}
        {tag && <span className="shrink-0 text-[12px] font-medium text-fg-subtle">{tag}</span>}
      </p>
      <p className={clamp ? 'mt-0.5 line-clamp-2 text-[14px] leading-snug text-fg-muted' : 'mt-0.5 text-[14px] leading-snug text-fg-muted'}>{text}</p>
    </li>);

}