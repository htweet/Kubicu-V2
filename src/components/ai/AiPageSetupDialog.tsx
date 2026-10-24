import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangleIcon, ArrowLeftIcon, CheckIcon, EyeOffIcon, PencilLineIcon, RefreshCwIcon, SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useEditor } from '../../contexts/EditorContext';
import { useTeam } from '../../contexts/TeamContext';
import { examplePages } from '../../data/examples';
import { aiCost } from '../../data/aiLimits';
import { useAiUsage } from '../../hooks/useAiUsage';
import { analyzeBrief, MIN_BRIEF, questionsFor, type AiAction, type BriefAnalysis, type BriefAnswers } from '../../utils/ai/brief';
import { buildDraft, DraftFailure, hasPlaceholder, type DraftResult } from '../../utils/ai/draft';
import { blockName } from '../../utils/blocks';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { Segmented } from '../ui/Segmented';
import { Switch } from '../ui/Switch';
import { InlineAlert } from '../ui/InlineAlert';
import { TemplateThumb } from '../templates/TemplateThumb';
import { AiPreviewTag } from './AiPreviewTag';
import { AiUsageMeter } from './AiUsageMeter';
import { cn } from '../../utils/cn';

type Step = 'brief' | 'questions' | 'working' | 'review' | 'failed';
type Simulate = 'ok' | 'fail';

const actionOptions: {value: AiAction;label: string;}[] = [
{ value: 'whatsapp', label: 'WhatsApp' },
{ value: 'booking', label: 'Book' },
{ value: 'shop', label: 'Buy' },
{ value: 'link', label: 'A link' }];


interface Props {
  open: boolean;
  onClose: () => void;
}

/** Brief → up to four questions → a draft to review before anything changes (D63). */
export function AiPageSetupDialog({ open, onClose }: Props) {
  const { state, actions } = useEditor();
  const team = useTeam();
  const usage = useAiUsage();
  const [step, setStep] = useState<Step>('brief');
  const [brief, setBrief] = useState('');
  const [tried, setTried] = useState(false);
  const [analysis, setAnalysis] = useState<BriefAnalysis | null>(null);
  const [answers, setAnswers] = useState<BriefAnswers>({});
  const [result, setResult] = useState<DraftResult | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [useLook, setUseLook] = useState(true);
  const [simulate, setSimulate] = useState<Simulate>('ok');
  const timer = useRef<number>();

  useEffect(() => {
    if (!open) return;
    setStep('brief');
    setTried(false);
    setResult(null);
    setSimulate('ok');
    return () => window.clearTimeout(timer.current);
  }, [open]);

  const questions = analysis ? questionsFor(analysis) : [];
  const briefError = brief.trim().length < MIN_BRIEF ? `Tell us a little more — at least ${MIN_BRIEF} characters, like what you sell and who it’s for.` : undefined;
  const enough = usage.canSpend(aiCost.page);
  const pageHasContent = state.draft.blocks.length > 1;

  const startQuestions = () => {
    setTried(true);
    if (briefError) return;
    const a = analyzeBrief(brief);
    setAnalysis(a);
    setAnswers({ action: a.suggestedAction, phone: a.phone });
    setStep('questions');
  };

  const generate = () => {
    if (!analysis || !enough) return;
    setStep('working');
    timer.current = window.setTimeout(() => {
      try {
        if (simulate === 'fail') throw new DraftFailure('Simulated failure');
        const r = buildDraft(brief, answers, analysis);
        usage.spend(aiCost.page, 'AI page setup');
        setResult(r);
        setPicked(new Set(r.doc.blocks.map((b) => b.id)));
        setUseLook(true);
        setStep('review');
      } catch {
        setStep('failed');
      }
    }, 700);
  };

  const apply = () => {
    if (!result) return;
    const blocks = result.doc.blocks.filter((b) => picked.has(b.id) || b.type === 'profile');
    actions.replaceBlocks(blocks, useLook ? result.doc.theme : undefined);
    team.log('pages', `used AI page setup to draft ${state.draft.title || 'a page'}`);
    toast.success('Draft added to your page', {
      description: 'Nothing is live until you publish. Fill the marked gaps first.',
      action: { label: 'Undo', onClick: () => actions.undo() }
    });
    onClose();
  };

  const placeholders = result ? result.doc.blocks.filter((b) => picked.has(b.id) && hasPlaceholder(b)).length : 0;
  const previewDoc = useMemo(() => result ? { ...result.doc, theme: useLook ? result.doc.theme : state.draft.theme, blocks: result.doc.blocks.filter((b) => picked.has(b.id) || b.type === 'profile') } : null, [result, picked, useLook, state.draft.theme]);

  const footer = (() => {
    if (step === 'brief')
    return (
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={startQuestions}>Continue</Button>
        </>);

    if (step === 'questions')
    return (
      <>
          <Button variant="tertiary" leadingIcon={ArrowLeftIcon} onClick={() => setStep('brief')}>
            Edit brief
          </Button>
          <Button variant="ai" leadingIcon={SparklesIcon} disabled={!enough} onClick={generate}>
            Draft my page
          </Button>
        </>);

    if (step === 'review')
    return (
      <>
          <Button variant="secondary" onClick={onClose}>
            Discard draft
          </Button>
          <Button variant="ai" leadingIcon={CheckIcon} onClick={apply}>
            {picked.size >= (result?.doc.blocks.length ?? 0) ? 'Use this draft' : `Use ${picked.size} selected block${picked.size === 1 ? '' : 's'}`}
          </Button>
        </>);

    if (step === 'failed')
    return (
      <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
          leadingIcon={RefreshCwIcon}
          onClick={() => {
            setSimulate('ok');
            setStep('questions');
          }}>
          
            Try again
          </Button>
        </>);

    return undefined;
  })();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={step === 'review' ? 'Review your draft' : 'Set up this page with AI'}
      description={
      <span className="flex flex-wrap items-center gap-2">
          <AiPreviewTag />
          <span>{step === 'review' ? 'Before and after. Nothing changes until you choose.' : 'Describe your business in your own words. We never make up prices, reviews or promises.'}</span>
        </span>
      }
      footer={footer}>
      
      {step === 'brief' &&
      <div className="flex flex-col gap-4">
          <TextArea
          id="ai-brief"
          label="About your business"
          rows={5}
          data-autofocus
          placeholder="Halima’s Glow is a home beauty studio in Lekki. I do bridal makeup, gele and lashes, and clients book by WhatsApp."
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          error={tried ? briefError : undefined}
          hint="What you offer, who it’s for, where you are and how people reach you." />
        
          {pageHasContent &&
        <InlineAlert tone="info" title="Your current page is safe">
              You’ll see the draft next to your page first. If you use it, one Undo brings everything back.
            </InlineAlert>
        }
          <AiUsageMeter cost={aiCost.page} />
        </div>
      }

      {step === 'questions' && analysis &&
      <div className="flex flex-col gap-5">
          <p className="text-label text-fg-muted">
            {questions.length === 1 ? 'One quick question' : `${questions.length} quick questions`} — only for what your brief didn’t say.
          </p>
          {questions.includes('category') &&
        <SelectInput
          id="ai-q-category"
          label="Which is closest to your business?"
          value={answers.category ?? ''}
          options={[{ value: '', label: 'Choose one' }, ...examplePages.map((e) => ({ value: e.id, label: `${e.category} — like ${e.name}` }))]}
          onChange={(v) => setAnswers((a) => ({ ...a, category: v || undefined }))} />

        }
          {questions.includes('name') && <TextInput id="ai-q-name" label="What’s your business called?" value={answers.name ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, name: e.target.value }))} />}
          <div className="flex flex-col gap-1.5">
            <span className="text-label font-medium text-fg">What should visitors do first?</span>
            <Segmented<AiAction> ariaLabel="First action" fullWidth value={answers.action ?? 'whatsapp'} onChange={(action) => setAnswers((a) => ({ ...a, action }))} options={actionOptions} />
          </div>
          {answers.action === 'whatsapp' &&
        <TextInput id="ai-q-phone" label="WhatsApp number" optional type="tel" inputMode="tel" placeholder="0803 123 4567" value={answers.phone ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, phone: e.target.value }))} hint="Left empty, the WhatsApp button stays hidden until you add it." />
        }
          {answers.action === 'link' && <TextInput id="ai-q-link" label="Link" type="url" inputMode="url" placeholder="https://" value={answers.link ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, link: e.target.value }))} />}
          {questions.includes('city') && <TextInput id="ai-q-city" label="Where are you based?" optional placeholder="e.g. Yaba, Lagos" value={answers.city ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, city: e.target.value }))} />}
          {analysis.matched.length > 0 &&
        <p className="text-caption text-fg-subtle">
              From your brief: {analysis.matched.slice(0, 4).map((w) => `“${w}”`).join(', ')}
              {analysis.name && ` · name “${analysis.name}”`}
              {analysis.city && ` · ${analysis.city}`}
            </p>
        }
          <div className="border-t border-line pt-4">
            <AiUsageMeter cost={aiCost.page} />
          </div>
          <fieldset className="flex flex-col gap-1.5 rounded-md border border-dashed border-line-strong p-3">
            <legend className="px-1 text-caption font-medium text-fg-muted">Prototype: what happens</legend>
            <Segmented<Simulate>
            ariaLabel="Simulate result"
            size="sm"
            value={simulate}
            onChange={setSimulate}
            options={[
            { value: 'ok', label: 'Draft works' },
            { value: 'fail', label: 'Service fails' }]
            } />
          
          </fieldset>
        </div>
      }

      {step === 'working' &&
      <div className="flex flex-col items-center gap-4 py-10" role="status" aria-live="polite">
          <div className="flex gap-3">
            {[0, 1, 2].map((i) =>
          <motion.span
            key={i}
            className="ai-fill h-24 w-16 rounded-md"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }} />

          )}
          </div>
          <p className="text-label text-fg-muted">Drafting from your brief…</p>
        </div>
      }

      {step === 'failed' &&
      <div className="flex flex-col gap-3 py-2">
          <InlineAlert tone="danger" title="We couldn’t draft your page">
            The drafting service didn’t respond. Your page hasn’t changed and no credits were used.
          </InlineAlert>
          <p className="text-caption text-fg-subtle">You can try again, or pick a starter from the Templates tab instead.</p>
        </div>
      }

      {step === 'review' && result && previewDoc &&
      <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <figure className="flex flex-col items-center gap-2">
              <TemplateThumb doc={state.draft} width={170} height={250} />
              <figcaption className="text-caption text-fg-muted">Now</figcaption>
            </figure>
            <figure className="flex flex-col items-center gap-2">
              <span className="ai-frame rounded-[16px]">
                <span className="block rounded-[15px] bg-overlay p-1">
                  <TemplateThumb doc={previewDoc} width={170} height={250} />
                </span>
              </span>
              <figcaption className="flex items-center gap-1.5 text-caption font-medium text-fg">
                <SparklesIcon size={12} aria-hidden /> Draft · {result.exampleName.split(' · ')[0]}
              </figcaption>
            </figure>
          </div>

          <section aria-labelledby="ai-assumed" className="ai-soft rounded-md p-3">
            <h3 id="ai-assumed" className="text-label font-semibold text-fg">
              What we assumed
            </h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {result.assumptions.map((a) =>
            <li key={a} className="flex gap-2 text-label text-fg-muted">
                  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-fg-subtle" />
                  {a}
                </li>
            )}
            </ul>
          </section>

          <section aria-labelledby="ai-blocks">
            <div className="flex items-baseline justify-between gap-3">
              <h3 id="ai-blocks" className="text-label font-semibold text-fg">
                Blocks to use
              </h3>
              <button
              type="button"
              className="text-caption font-medium text-action hover:underline"
              onClick={() => setPicked(picked.size === result.doc.blocks.length ? new Set(result.doc.blocks.filter((b) => b.type === 'profile').map((b) => b.id)) : new Set(result.doc.blocks.map((b) => b.id)))}>
              
                {picked.size === result.doc.blocks.length ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <ul className="mt-2 divide-y divide-line border-y border-line">
              {result.doc.blocks.map((b) => {
              const profile = b.type === 'profile';
              const checked = profile || picked.has(b.id);
              return (
                <li key={b.id}>
                    <label className={cn('flex min-h-11 items-center gap-3 py-2', profile ? 'cursor-default' : 'cursor-pointer')}>
                      <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0 accent-action"
                      checked={checked}
                      disabled={profile}
                      onChange={() =>
                      setPicked((s) => {
                        const n = new Set(s);
                        if (n.has(b.id)) n.delete(b.id);else
                        n.add(b.id);
                        return n;
                      })
                      } />
                    
                      <span className="min-w-0 flex-1 truncate text-label text-fg">{blockName(b)}</span>
                      {profile && <span className="text-caption text-fg-subtle">Always kept</span>}
                      {b.visibility.hidden &&
                    <span className="flex items-center gap-1 text-caption text-fg-subtle">
                          <EyeOffIcon size={12} aria-hidden /> Hidden until filled
                        </span>
                    }
                      {!b.visibility.hidden && hasPlaceholder(b) &&
                    <span className="flex items-center gap-1 text-caption text-warning">
                          <PencilLineIcon size={12} aria-hidden /> Fill the gap
                        </span>
                    }
                    </label>
                  </li>);

            })}
            </ul>
          </section>

          <Switch id="ai-look" label="Use the draft’s look" description="Colours and fonts from the starter. Off keeps your current theme." checked={useLook} onChange={setUseLook} />

          {placeholders > 0 &&
        <p className="flex items-start gap-2 text-caption text-fg-muted">
              <AlertTriangleIcon size={14} className="mt-0.5 shrink-0 text-warning" aria-hidden />
              {placeholders} block{placeholders === 1 ? ' has' : 's have'} [Add …] gaps. Publishing is blocked until you replace them with your own words.
            </p>
        }
          {pageHasContent && <p className="text-caption text-fg-subtle">Using the draft replaces the blocks on this page. Undo brings them back.</p>}
        </div>
      }
    </Dialog>);

}