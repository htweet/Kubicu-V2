import React, { useEffect, useState } from 'react';
import { SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Block } from '../../types/page';
import { useEditor } from '../../contexts/EditorContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useCan } from '../../contexts/TeamContext';
import { useAiUsage } from '../../hooks/useAiUsage';
import { aiCost } from '../../data/aiLimits';
import { buttonOptions, faqAnswer, headingOptions, pageFacts, productDescription } from '../../utils/ai/suggest';
import { PLACEHOLDER } from '../../utils/ai/draft';
import { Button } from '../ui/Button';
import { AiPreviewTag } from './AiPreviewTag';
import { AiUsageMeter } from './AiUsageMeter';

type Supported = Extract<Block, {type: 'heading' | 'link' | 'product' | 'faq';}>;

export function supportsSuggest(block: Block): block is Supported {
  return block.type === 'heading' || block.type === 'link' || block.type === 'product' || block.type === 'faq';
}

const labels: Record<Supported['type'], string> = {
  heading: 'Suggest a clearer heading',
  link: 'Suggest a button label',
  product: 'Write a description from the product’s details',
  faq: 'Draft answers from your page'
};

/** One-click suggestions for a single block (D63). Every suggestion is shown first; nothing is applied on its own. */
export function BlockSuggest({ block }: {block: Supported;}) {
  const { state, actions } = useEditor();
  const commerce = useCommerce();
  const usage = useAiUsage();
  const can = useCan('pages.edit');
  const [options, setOptions] = useState<string[] | null>(null);
  const [answers, setAnswers] = useState<{id: string;question: string;answer: string;fromFacts: boolean;}[] | null>(null);
  const [out, setOut] = useState(false);

  useEffect(() => {
    setOptions(null);
    setAnswers(null);
    setOut(false);
  }, [block.id]);

  const linkedProduct = block.type === 'product' && block.content.productId ? commerce.data.products.find((p) => p.id === block.content.productId) : undefined;

  const run = () => {
    if (!usage.canSpend(aiCost.block)) {
      setOut(true);
      return;
    }
    if (block.type === 'faq') {
      const facts = pageFacts(state.draft);
      const todo = block.content.items.filter((i) => i.question.trim() && (!i.answer.trim() || i.answer.includes(PLACEHOLDER)));
      if (todo.length === 0) {
        toast('Every question already has an answer', { description: 'Clear an answer first if you want a draft for it.' });
        return;
      }
      setAnswers(todo.map((i) => ({ id: i.id, question: i.question, ...faqAnswer(i.question, facts) })));
    } else if (block.type === 'heading') {
      setOptions(headingOptions(block.content.text, pageFacts(state.draft).name));
    } else if (block.type === 'link') {
      setOptions(buttonOptions(block.content.label, block.content.url));
    } else {
      setOptions([productDescription(linkedProduct, commerce.data.collections, block.content.name)]);
    }
    usage.spend(aiCost.block, 'Block suggestions');
  };

  const use = (value: string) => {
    if (block.type === 'heading') actions.updateContent(block.id, 'heading', { text: value }, 'text');else
    if (block.type === 'link') actions.updateContent(block.id, 'link', { label: value }, 'label');else
    if (block.type === 'product') {
      if (linkedProduct) {
        const ok = commerce.apply((d) => ({ ...d, products: d.products.map((p) => p.id === linkedProduct.id ? { ...p, description: value, updatedAt: new Date().toISOString() } : p) }));
        if (!ok) return;
        toast.success('Description saved to the product in Commerce', { description: 'Every block showing this product updates.' });
      } else actions.updateContent(block.id, 'product', { description: value }, 'description');
    }
    setOptions(null);
  };

  const useAnswers = () => {
    if (block.type !== 'faq' || !answers) return;
    const map = new Map(answers.map((a) => [a.id, a.answer]));
    actions.updateContent(block.id, 'faq', { items: block.content.items.map((i) => map.has(i.id) ? { ...i, answer: map.get(i.id)! } : i) }, 'items');
    setAnswers(null);
  };

  if (!can.allowed) return null;
  if (!usage.featureOn('block_suggest'))
  return (
    <section aria-label="AI suggestions" className="border-t border-line pt-4">
        <p className="text-caption text-fg-subtle">AI suggestions are paused by KUBICU for now. Your blocks aren’t affected.</p>
      </section>);


  return (
    <section aria-label="AI suggestions" className="flex flex-col gap-3 border-t border-line pt-4">
      {!options && !answers &&
      <div className="flex flex-col gap-2">
          <Button size="sm" variant="ai" leadingIcon={SparklesIcon} onClick={run} className="self-start">
            {labels[block.type]}
          </Button>
          {out ? <AiUsageMeter cost={aiCost.block} /> : <p className="text-caption text-fg-subtle">Uses {aiCost.block} credit · {usage.remaining} left this month. Only rephrases your words or uses facts already in KUBICU.</p>}
        </div>
      }

      {options &&
      <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <AiPreviewTag />
            <button type="button" className="text-caption font-medium text-fg-muted hover:text-fg" onClick={() => setOptions(null)}>
              Dismiss
            </button>
          </div>
          {options.length === 0 && <p className="text-caption text-fg-muted">Your wording is already short and clear — nothing to suggest.</p>}
          <ul className="flex flex-col gap-2">
            {options.map((o) =>
          <li key={o} className="ai-soft flex items-start gap-3 rounded-md px-3 py-2.5">
                <p className="min-w-0 flex-1 text-label text-fg">{o}</p>
                <Button size="sm" variant="secondary" onClick={() => use(o)}>
                  Use
                </Button>
              </li>
          )}
          </ul>
          {block.type === 'product' && <p className="text-caption text-fg-subtle">{linkedProduct ? 'Built from this product’s options, files and collections in Commerce. Saved to the product, not just this block.' : 'Link this block to a Commerce product for a description built from its real details.'} Replace the [Add …] part before publishing.</p>}
        </div>
      }

      {answers &&
      <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <AiPreviewTag />
            <button type="button" className="text-caption font-medium text-fg-muted hover:text-fg" onClick={() => setAnswers(null)}>
              Dismiss
            </button>
          </div>
          <ul className="ai-soft flex flex-col divide-y divide-line rounded-md px-3">
            {answers.map((a) =>
          <li key={a.id} className="py-2">
                <p className="text-caption font-medium text-fg">{a.question}</p>
                <p className={a.fromFacts ? 'mt-0.5 text-label text-fg' : 'mt-0.5 text-label text-fg-subtle'}>{a.answer}</p>
              </li>
          )}
          </ul>
          <p className="text-caption text-fg-subtle">Answers come from your profile location and WhatsApp number. Policies, delivery and refunds are left for you to write.</p>
          <Button size="sm" variant="ai" onClick={useAnswers} className="self-start">
            Use {answers.length === 1 ? 'this answer' : 'these answers'}
          </Button>
        </div>
      }
    </section>);

}