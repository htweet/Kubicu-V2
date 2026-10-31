import React from 'react';
import { toast } from 'sonner';
import { CopyPlusIcon } from 'lucide-react';
import type { Block, FaqItem } from '../../../types/page';
import type { ValidationIssue } from '../../../utils/validation';
import { useEditor } from '../../../contexts/EditorContext';
import { useT } from '../../../contexts/LocaleContext';
import { uid } from '../../../utils/id';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { InlineAlert } from '../../ui/InlineAlert';
import { Button } from '../../ui/Button';
import { ItemListEditor } from './ItemListEditor';

/** Content tab for the FAQ assistant (D342): approved answers, a way to copy them from FAQ blocks, and the fallback. */
export function FaqAssistantFields({ block, issues }: {block: Extract<Block, {type: 'faqAssistant';}>;issues: ValidationIssue[];}) {
  const { t: tr } = useT();
  const { state, actions } = useEditor();
  const c = block.content;
  const id = (f: string) => `${block.id}-${f}`;
  const warn = (f: string) => {
    const m = issues.find((i) => i.field === f)?.message;
    return m ? tr(m) : undefined;
  };
  const set = (patch: Partial<typeof c>, field: string) => actions.updateContent(block.id, 'faqAssistant', patch, field);

  const copyFromFaq = () => {
    const have = new Set(c.facts.map((f) => f.question.trim().toLowerCase()).filter(Boolean));
    const found: FaqItem[] = [];
    state.draft.blocks.forEach((b) => {
      if (b.type !== 'faq') return;
      b.content.items.forEach((i) => {
        const key = i.question.trim().toLowerCase();
        if (!key || !i.answer.trim() || have.has(key)) return;
        have.add(key);
        found.push({ id: uid('fact'), question: i.question.trim(), answer: i.answer.trim() });
      });
    });
    if (found.length === 0) {
      toast(tr('No new answered questions to copy'));
      return;
    }
    const kept = c.facts.filter((f) => f.question.trim() || f.answer.trim());
    set({ facts: [...kept, ...found] }, 'facts:add');
    toast(tr('Questions copied: {n}', { n: found.length }), { action: { label: tr('Undo'), onClick: () => actions.undo() } });
  };

  return (
    <div className="flex flex-col gap-4">
      <TextInput id={id('title')} label="Title" optional value={c.title} onChange={(e) => set({ title: e.target.value }, 'title')} />
      <TextArea id={id('intro')} label="Intro" optional rows={2} value={c.intro} onChange={(e) => set({ intro: e.target.value }, 'intro')} />
      <ItemListEditor
        legend="Approved answers"
        noun="Question"
        addLabel="Add a question"
        max={30}
        items={c.facts}
        error={warn('facts')}
        onChange={(facts, f) => set({ facts }, `facts:${f}`)}
        title={(f) => f.question}
        meta={(f) => f.answer.trim() ? undefined : tr('No answer yet')}
        create={() => ({ id: uid('fact'), question: '', answer: '' })}
        render={(f, up) =>
        <>
            <TextInput id={id(`${f.id}-q`)} label="Question" value={f.question} onChange={(e) => up({ question: e.target.value }, 'question')} />
            <TextArea id={id(`${f.id}-a`)} label="Answer" rows={3} value={f.answer} onChange={(e) => up({ answer: e.target.value }, 'answer')} />
          </>
        } />
      
      <Button variant="secondary" size="sm" leadingIcon={CopyPlusIcon} onClick={copyFromFaq} className="self-start">
        Copy answered questions from FAQ blocks
      </Button>
      <TextInput id={id('fallbackLabel')} label="Button when there’s no answer" value={c.fallbackLabel} onChange={(e) => set({ fallbackLabel: e.target.value }, 'fallbackLabel')} />
      <TextInput id={id('fallbackUrl')} label="Link for that button" type="url" hint="A WhatsApp link, contact page or form." value={c.fallbackUrl} error={warn('fallbackUrl')} onChange={(e) => set({ fallbackUrl: e.target.value }, 'fallbackUrl')} />
      <InlineAlert tone="info" title={tr('How it answers')}>
        {tr('It matches the visitor’s words to your questions and shows your answer exactly as written. It never writes new answers, prices or policies. Rule-based in this prototype — no AI provider is called.')}
      </InlineAlert>
    </div>);

}