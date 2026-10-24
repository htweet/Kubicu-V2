import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircleIcon, LockIcon, MicIcon, PackagePlusIcon, SquareIcon, Trash2Icon, WandIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useCan } from '../contexts/TeamContext';
import { usePlan } from '../contexts/PlanContext';
import { useUpgrade } from '../contexts/UpgradeContext';
import { planAtLeast } from '../data/plans';
import { useLocalStore } from '../hooks/useLocalStore';
import {
  SAMPLE_TRANSCRIPT,
  VOICE_PLAN,
  draftIssue,
  emptyVoice,
  parseTranscript,
  speechRecognition,
  voiceKey,
  voiceLanguages,
  type SpeechRecognitionLike,
  type VoiceDraft } from
'../utils/voiceToStore';
import { blankProduct } from '../components/commerce/ProductEditor';
import { formatNgn, formatTimestamp } from '../utils/format';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TextArea } from '../components/ui/TextArea';
import { TextInput } from '../components/ui/TextInput';
import { currencySymbol } from '../utils/currency';
import { SelectInput } from '../components/ui/SelectInput';
import { IconButton } from '../components/ui/IconButton';
import { InlineAlert } from '../components/ui/InlineAlert';
import { cn } from '../utils/cn';

type Status = 'idle' | 'listening' | 'unsupported' | 'denied';

/** Voice-to-Store (D102): speak your products, check the drafts, add them to Commerce. */
export function VoiceToStore() {
  const { current } = useWorkspace();
  const commerce = useCommerce();
  const can = useCan('products.edit');
  const plan = usePlan();
  const { openUpgrade } = useUpgrade();
  const unlocked = planAtLeast(plan.id, VOICE_PLAN);
  const reduce = useReducedMotion();
  const { data, update } = useLocalStore(voiceKey(current.id), emptyVoice);

  const [language, setLanguage] = useState<string>('en-NG');
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [status, setStatus] = useState<Status>(() => speechRecognition() ? 'idle' : 'unsupported');
  const [drafts, setDrafts] = useState<VoiceDraft[]>([]);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => () => recRef.current?.stop(), []);

  const start = () => {
    const Rec = speechRecognition();
    if (!Rec) return setStatus('unsupported');
    const rec = new Rec();
    rec.lang = language;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let finalText = '';
      let live = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;else
        live += r[0].transcript;
      }
      if (finalText) setTranscript((t) => `${t}${t && !t.endsWith(' ') ? ' ' : ''}${finalText.trim()}`);
      setInterim(live);
    };
    rec.onerror = (e) => setStatus(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'denied' : 'idle');
    rec.onend = () => {
      setInterim('');
      setStatus((s) => s === 'listening' ? 'idle' : s);
    };
    recRef.current = rec;
    try {
      rec.start();
      setStatus('listening');
    } catch {
      setStatus('idle');
    }
  };

  const stop = () => {
    recRef.current?.stop();
    setStatus('idle');
  };

  const convert = () => {
    const parsed = parseTranscript(transcript);
    if (!parsed.length) return toast.error('No products heard', { description: 'Say a name and a price for each, and “next” between them.' });
    setDrafts(parsed);
  };

  const patch = (id: string, p: Partial<VoiceDraft>) => setDrafts((ds) => ds.map((d) => d.id === id ? { ...d, ...p } : d));
  const chosen = drafts.filter((d) => d.include);
  const blocked = chosen.filter((d) => !d.name.trim());

  const add = () => {
    if (!unlocked) return openUpgrade({ plan: VOICE_PLAN, feature: 'Voice-to-Store' });
    if (!chosen.length || blocked.length) return;
    const products = chosen.map((d) => {
      const p = blankProduct('physical');
      return {
        ...p,
        name: d.name.trim(),
        description: d.description.trim(),
        priceNgn: d.priceNgn,
        trackStock: d.qty !== null,
        variants: p.variants.map((v) => ({ ...v, stock: d.qty ?? 0 }))
      };
    });
    if (!commerce.apply((c) => ({ ...c, products: [...products, ...c.products] }))) return;
    update((v) => ({ sessions: [{ id: `vs_${Date.now()}`, at: new Date().toISOString(), language, transcript, added: products.length }, ...v.sessions].slice(0, 20) }));
    toast.success(`${products.length} draft product${products.length === 1 ? '' : 's'} added`, { description: 'Add photos, then set them live in Commerce → Products.' });
    setDrafts([]);
    setTranscript('');
  };

  const listening = status === 'listening';

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 pb-16 pt-6 md:px-10 md:pt-8">
      <PageHeader
        title="Voice-to-Store"
        context={current.name}
        description="Say your products out loud — name, price and how many — and check them before they’re added as drafts. Nothing goes live until you add photos and publish." />
      

      {!unlocked &&
      <InlineAlert
        tone="info"
        title="Voice-to-Store is on Creator and above"
        className="mt-6"
        action={
        <Button size="sm" leadingIcon={LockIcon} onClick={() => openUpgrade({ plan: VOICE_PLAN, feature: 'Voice-to-Store' })}>
              Upgrade
            </Button>
        }>
        
          You can try speaking and see the drafts. Adding them to Commerce needs Creator.
        </InlineAlert>
      }

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
        {/* Speak */}
        <section aria-labelledby="v-speak" className="flex flex-col gap-5 rounded-lg border border-line bg-raised p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="v-speak" className="text-heading font-semibold text-fg">
                1. Speak or type
              </h2>
              <p className="mt-1 text-caption text-fg-muted">Say “next” between products, e.g. “Silk gele, 8,500 naira, 10 in stock. Next…”</p>
            </div>
          </div>

          <SelectInput
            id="v-lang"
            label="Language"
            value={language}
            onChange={setLanguage}
            disabled={listening}
            options={voiceLanguages.map((l) => ({ value: l.value, label: l.ready ? l.label : `${l.label} — needs a speech partner`, disabled: !l.ready }))} />
          

          <div className="flex flex-col items-center gap-3 py-2">
            <motion.button
              type="button"
              onClick={listening ? stop : start}
              disabled={status === 'unsupported' || status === 'denied'}
              aria-pressed={listening}
              aria-label={listening ? 'Stop listening' : 'Start speaking'}
              whileTap={reduce ? undefined : { scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-full transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                listening ? 'bg-danger-soft text-danger ring-2 ring-danger' : 'bg-action text-action-fg hover:bg-action-hover'
              )}>
              
              {listening ? <SquareIcon size={26} fill="currentColor" aria-hidden /> : <MicIcon size={30} aria-hidden />}
            </motion.button>
            <p role="status" className="text-label text-fg-muted">
              {listening ? 'Listening… tap to stop' : status === 'unsupported' ? 'This browser can’t listen — type or paste instead' : status === 'denied' ? 'Microphone blocked — allow it in your browser, or type instead' : 'Tap to start speaking'}
            </p>
          </div>

          <TextArea id="v-text" label="What we heard" hint="You can correct anything here." rows={6} maxLength={4000} value={transcript + (interim ? ` ${interim}` : '')} readOnly={listening} onChange={(e) => setTranscript(e.target.value)} />

          <div className="flex flex-wrap gap-2">
            <Button leadingIcon={WandIcon} disabled={!transcript.trim() || listening} onClick={convert}>
              Turn into products
            </Button>
            <Button variant="tertiary" disabled={listening} onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}>
              Use a sample recording
            </Button>
          </div>
          <p className="text-caption text-fg-subtle">Speech is turned into text by your browser. Pidgin, Yorùbá, Hausa and Igbo wait for a speech partner (simulated preview).</p>
        </section>

        {/* Review */}
        <section aria-labelledby="v-review" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="v-review" className="text-heading font-semibold text-fg">
                2. Check the drafts
              </h2>
              <p className="mt-1 text-caption text-fg-muted">We never guess a price. Anything we couldn’t hear clearly is marked.</p>
            </div>
            {drafts.length > 0 && <span className="text-caption text-fg-subtle">{chosen.length} of {drafts.length} selected</span>}
          </div>

          {drafts.length === 0 ?
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line-strong px-6 py-12 text-center">
              <PackagePlusIcon size={26} className="text-fg-subtle" aria-hidden />
              <p className="text-label font-medium text-fg">Drafts appear here</p>
              <p className="max-w-xs text-caption text-fg-muted">Speak or paste your list, then choose “Turn into products”.</p>
            </div> :

          <ul className="flex flex-col gap-3">
              {drafts.map((d, i) => {
              const issue = draftIssue(d);
              return (
                <li key={d.id} className={cn('rounded-lg border bg-raised p-4', d.include ? 'border-line' : 'border-line opacity-60')}>
                    <div className="flex items-start gap-3">
                      <input
                      type="checkbox"
                      id={`vd-inc-${d.id}`}
                      checked={d.include}
                      onChange={(e) => patch(d.id, { include: e.target.checked })}
                      className="mt-1 h-4 w-4 shrink-0 accent-[rgb(var(--action))]"
                      aria-label={`Include product ${i + 1}`} />
                    
                      <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[minmax(0,1fr)_8rem_6rem]">
                        <TextInput id={`vd-n-${d.id}`} label="Name" value={d.name} maxLength={80} error={d.include && !d.name.trim() ? 'Add a name' : undefined} onChange={(e) => patch(d.id, { name: e.target.value })} />
                        <TextInput
                        id={`vd-p-${d.id}`}
                        label="Price"
                        prefix={currencySymbol()}
                        inputMode="numeric"
                        value={d.priceNgn ? String(d.priceNgn) : ''}
                        onChange={(e) => patch(d.id, { priceNgn: Number(e.target.value.replace(/\D/g, '')) || null })} />
                      
                        <TextInput id={`vd-q-${d.id}`} label="In stock" optional inputMode="numeric" value={d.qty === null ? '' : String(d.qty)} onChange={(e) => patch(d.id, { qty: e.target.value === '' ? null : Number(e.target.value.replace(/\D/g, '')) || 0 })} />
                        <div className="sm:col-span-3">
                          <TextInput id={`vd-d-${d.id}`} label="Description" optional value={d.description} maxLength={500} onChange={(e) => patch(d.id, { description: e.target.value })} />
                        </div>
                      </div>
                      <IconButton icon={Trash2Icon} label={`Remove product ${i + 1}`} onClick={() => setDrafts((ds) => ds.filter((x) => x.id !== d.id))} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 pl-7">
                      {issue ?
                    <Badge tone="warning" icon={AlertCircleIcon}>
                          {issue}
                        </Badge> :

                    <Badge tone="success">{`Ready · ${formatNgn(d.priceNgn ?? 0)}`}</Badge>
                    }
                      <span className="min-w-0 truncate text-caption text-fg-subtle">Heard: “{d.heard}”</span>
                    </div>
                  </li>);

            })}
            </ul>
          }

          {drafts.length > 0 &&
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-caption text-fg-muted">Added as drafts. Products without a price can’t be published until you add one.</p>
              <Button leadingIcon={unlocked ? PackagePlusIcon : LockIcon} disabled={!can.allowed || !chosen.length || blocked.length > 0} title={can.allowed ? undefined : can.reason} onClick={add}>
                {`Add ${chosen.length} to Commerce`}
              </Button>
            </div>
          }
        </section>
      </div>

      {data.sessions.length > 0 &&
      <section aria-labelledby="v-history" className="mt-12 flex flex-col gap-3">
          <h2 id="v-history" className="text-heading font-semibold text-fg">
            Earlier sessions
          </h2>
          <ul className="divide-y divide-line rounded-lg border border-line bg-raised">
            {data.sessions.map((s) =>
          <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                <span className="text-label font-medium text-fg">{`${s.added} product${s.added === 1 ? '' : 's'} added`}</span>
                <span className="text-caption text-fg-subtle">{formatTimestamp(s.at)}</span>
                <span className="min-w-0 flex-1 truncate text-caption text-fg-muted">“{s.transcript}”</span>
              </li>
          )}
          </ul>
          <Link to="/app/commerce/products" className="self-start text-label font-medium text-fg underline-offset-2 hover:underline">
            Open products
          </Link>
        </section>
      }
    </div>);

}