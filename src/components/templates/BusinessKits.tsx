import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2Icon, PackageIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { BusinessKit, KitPart, KitPolicies } from '../../types/kit';
import { businessKits, kitById, kitPartLabels, kitParts, kitTemplateFor, policyFields } from '../../data/businessKits';
import { activeCountry } from '../../utils/country';
import { useEditor } from '../../contexts/EditorContext';
import { createBlock } from '../../utils/blocks';
import { uid } from '../../utils/id';
import { findExampleById } from '../../data/examples';
import { useBusinessKit } from '../../hooks/useBusinessKit';
import { useCan } from '../../contexts/TeamContext';
import { Card } from '../ui/layout/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TextArea } from '../ui/TextArea';
import { Dialog } from '../ui/Dialog';
import { InlineAlert } from '../ui/InlineAlert';
import { TemplateThumb } from './TemplateThumb';
import { ApplyKitDialog } from './ApplyKitDialog';
import { TemplatePreviewDialog } from './TemplatePreviewDialog';
import { BuyTemplateDialog } from './BuyTemplateDialog';
import { useApplyTemplate } from '../../hooks/useApplyTemplate';
import { templatePrice } from '../../data/templateMarket';
import { formatNaira as formatNgn } from '../../utils/format';
import type { ExamplePage } from '../../data/examples/build';
import { formatDay } from '../../utils/serviceOs';

const partLinks: Partial<Record<KitPart, {label: string;to: string;}>> = {
  page: { label: 'Open canvas', to: '/app/canvas' },
  products: { label: 'Products', to: '/app/commerce/products' },
  services: { label: 'Services', to: '/app/bookings/services' },
  automations: { label: 'Automations', to: '/app/automations' },
  apps: { label: 'Extensions', to: '/app/extensions' }
};

/** Templates → Business kits (D90): a page plus the business setup behind it, in one go. */
export function BusinessKits() {
  const navigate = useNavigate();
  const can = useCan('pages.edit');
  const { applied, apply, removeAdded, savePolicies } = useBusinessKit();
  const { actions } = useEditor();
  const [choosing, setChoosing] = useState<BusinessKit | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [previewKit, setPreviewKit] = useState<{kit: BusinessKit;ex: ExamplePage;} | null>(null);
  const [previewElite, setPreviewElite] = useState<ExamplePage | null>(null);
  const [buyingElite, setBuyingElite] = useState<ExamplePage | null>(null);
  const applyTemplate = useApplyTemplate();
  const eliteOf = (kit: BusinessKit) => kit.eliteTemplateId ? findExampleById(kit.eliteTemplateId) : undefined;
  const [policies, setPolicies] = useState<KitPolicies | null>(applied?.policies ?? null);
  const appliedKit = applied ? kitById(applied.kitId) : undefined;

  useEffect(() => setPolicies(applied?.policies ?? null), [applied?.policies]);

  const onApply = (kit: BusinessKit, parts: KitPart[]) => {
    apply(kit, parts);
    setChoosing(null);
    toast.success(`${kit.name} kit applied`, { description: 'Everything was added as a draft. Your checklist below shows where to finish.' });
  };

  const dirty = !!policies && JSON.stringify(policies) !== JSON.stringify(applied?.policies);
  const filled = policies ? policyFields.filter((f) => (policies[f.key] ?? '').trim()) : [];

  return (
    <div className="flex flex-col gap-10">
      {applied && appliedKit && !applied.removedAt &&
      <Card
        emphasis="primary"
        icon={PackageIcon}
        title={`Your ${appliedKit.name} kit`}
        description={`Applied ${formatDay(applied.appliedAt.slice(0, 10))}. Finish each part, then publish.`}
        actions={
        can.allowed &&
        <Button variant="tertiary" size="sm" onClick={() => setConfirmRemove(true)}>
                Remove untouched items
              </Button>

        }>
        
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {applied.parts.map((p) => {
            const link = partLinks[p];
            const count = p === 'products' ? applied.productIds.length : p === 'services' ? applied.serviceIds.length : p === 'automations' ? applied.automationIds.length : p === 'apps' ? applied.installedApps.length : null;
            return (
              <li key={p} className="flex items-start gap-3">
                  <CheckCircle2Icon size={18} className="mt-0.5 shrink-0 text-success" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-label font-medium text-fg">
                      {kitPartLabels[p].label}
                      {count !== null && <span className="font-normal text-fg-muted"> · {count === 0 ? 'already there' : `${count} added`}</span>}
                    </span>
                    {link &&
                  <Link to={link.to} className="text-caption font-medium text-action hover:underline">
                        {link.label}
                      </Link>
                  }
                  </span>
                </li>);

          })}
          </ul>

          {policies &&
        <div className="mt-6 border-t border-line pt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-label font-semibold text-fg">Draft policies</h3>
                <span className="text-caption text-fg-subtle">
                  {filled.length} of {policyFields.length} will show
                </span>
              </div>
              <p className="mt-0.5 max-w-3xl text-caption text-fg-subtle">
                Replace anything in [brackets] with your own terms. <strong className="font-semibold text-fg-muted">Leave a box empty to hide that policy</strong> — it won’t be copied or added to your page.
              </p>
              <InlineAlert tone="warning" className="mt-3">
                Example wording, not legal advice. Check it matches how you actually work before customers rely on it.
              </InlineAlert>
              <div className="mt-4 grid gap-x-4 gap-y-5 md:grid-cols-2 lg:grid-cols-3">
                {policyFields.map((f) =>
            <TextArea
              key={f.key}
              id={`kit-pol-${f.key}`}
              label={f.label}
              rows={5}
              value={policies[f.key] ?? ''}
              disabled={!can.allowed}
              hint={(policies[f.key] ?? '').trim() ? undefined : 'Empty — hidden from your page'}
              onChange={(e) => setPolicies({ ...policies, [f.key]: e.target.value })} />

            )}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" disabled={!dirty} onClick={() => (savePolicies(policies), toast.success('Policies saved'))}>
                  Save policies
                </Button>
                <Button
              size="sm"
              variant="secondary"
              disabled={filled.length === 0 || !can.allowed}
              onClick={() => {
                savePolicies(policies);
                const faq = createBlock('faq');
                faq.content = { title: 'Policies', items: filled.map((f) => ({ id: uid('faq'), question: f.question, answer: (policies[f.key] ?? '').trim() })) };
                actions.insertBlocks([faq]);
                toast.success(`Added ${filled.length} polic${filled.length === 1 ? 'y' : 'ies'} to your page`, { description: 'As an FAQ block in your draft. Publish when you’re happy with it.', action: { label: 'Open canvas', onClick: () => navigate('/app/canvas') } });
              }}>
              
                  Add to page as FAQ
                </Button>
                <Button
              size="sm"
              variant="tertiary"
              disabled={filled.length === 0}
              onClick={() => {
                void navigator.clipboard?.writeText(filled.map((f) => `${f.label}\n${(policies[f.key] ?? '').trim()}`).join('\n\n'));
                toast(`Copied ${filled.length} polic${filled.length === 1 ? 'y' : 'ies'}`);
              }}>
              
                  Copy all
                </Button>
              </div>
            </div>
        }
        </Card>
      }

      <section aria-labelledby="kits-heading">
        <h2 id="kits-heading" className="text-heading font-semibold text-fg">
          Start with a business kit
        </h2>
        <p className="mt-1 max-w-2xl text-body text-fg-muted">A kit sets up your page and the tools behind it together — products or services, draft policies, automations and the right apps. Prices are never filled in for you.</p>

        <ul className="mt-6 grid gap-5 md:grid-cols-2">
          {businessKits.map((kit) => {
            const ex = findExampleById(kitTemplateFor(kit, activeCountry()));
            const Icon = kit.icon;
            const isApplied = applied?.kitId === kit.id && !applied.removedAt;
            return (
              <li key={kit.id} className="flex">
                <article className="flex w-full flex-col overflow-hidden rounded-lg border border-line bg-raised sm:flex-row">
                  {ex &&
                  <div className="hidden shrink-0 items-center justify-center bg-sunken p-4 sm:flex">
                      <TemplateThumb doc={ex.doc} width={112} height={160} />
                    </div>
                  }
                  <div className="flex min-w-0 flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="flex items-center gap-2 text-heading font-semibold text-fg">
                        <Icon size={18} strokeWidth={2.25} className="shrink-0 text-fg-subtle" aria-hidden />
                        {kit.name}
                      </h3>
                      {isApplied && <Badge tone="success">Applied</Badge>}
                    </div>
                    <p className="mt-0.5 text-caption text-fg-subtle">{kit.forWho}</p>
                    <p className="mt-3 text-label text-fg-muted">{kit.summary}</p>
                    <p className="mt-3 text-caption text-fg-subtle">Includes: {kitParts(kit).map((p) => kitPartLabels[p].label.toLowerCase()).join(' · ')}</p>
                    {eliteOf(kit) &&
                    <p className="mt-2 text-caption text-fg-subtle">
                        Upgrade the look (optional):{' '}
                        <button type="button" onClick={() => setPreviewElite(eliteOf(kit)!)} className="font-semibold text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                          {eliteOf(kit)!.name} · {formatNgn(templatePrice(eliteOf(kit)!.id))}
                        </button>
                      </p>
                    }
                    <div className="mt-auto flex flex-wrap gap-2 pt-5">
                      <Button size="sm" disabled={!can.allowed} onClick={() => setChoosing(kit)}>
                        Use this kit
                      </Button>
                      {ex &&
                      <Button size="sm" variant="tertiary" onClick={() => setPreviewKit({ kit, ex })}>
                          Preview the page
                        </Button>
                      }
                    </div>
                  </div>
                </article>
              </li>);

          })}
        </ul>
        {!can.allowed && <p className="mt-4 text-caption text-fg-subtle">{can.reason}</p>}
      </section>

      <TemplatePreviewDialog
        template={previewKit?.ex ?? null}
        onClose={() => setPreviewKit(null)}
        useLabel={can.allowed ? 'Use this kit' : 'Close'}
        onUse={() => {
          const k = previewKit?.kit ?? null;
          setPreviewKit(null);
          if (can.allowed) setChoosing(k);
        }} />
      
      <TemplatePreviewDialog
        template={previewElite}
        onClose={() => setPreviewElite(null)}
        useLabel="Use this look on my page"
        onUse={(t) => {
          setPreviewElite(null);
          if (can.allowed) applyTemplate(t.name, t.doc);
        }}
        onBuy={(t) => {
          setPreviewElite(null);
          setBuyingElite(t);
        }} />
      
      <BuyTemplateDialog template={buyingElite} onClose={() => setBuyingElite(null)} onBought={(t) => can.allowed && applyTemplate(t.name, t.doc)} />
      <ApplyKitDialog kit={choosing} replacing={!!applied && !applied.removedAt} onClose={() => setChoosing(null)} onApply={onApply} />
      <Dialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        title="Remove untouched kit items?"
        description="Removes products still in draft with no price or photos, services still switched off with no price, and automations that are still drafts and never ran. Anything you’ve edited stays. Your page and installed apps aren’t changed — use version history and Extensions for those."
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirmRemove(false)}>
              Cancel
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              const r = removeAdded();
              setConfirmRemove(false);
              toast(`Removed ${r.removed} item${r.removed === 1 ? '' : 's'}`, { description: r.kept ? `${r.kept} you’ve worked on ${r.kept === 1 ? 'was' : 'were'} kept.` : undefined });
            }}>
            
              Remove
            </Button>
          </>
        } />
      
    </div>);

}