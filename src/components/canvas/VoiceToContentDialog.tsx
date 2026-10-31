import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { MicIcon, SquareIcon } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { useT } from '../../contexts/LocaleContext';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { voiceToBlocks, type VoiceShape } from '../../utils/voiceToBlocks';
import { blockName, summarizeBlock } from '../../utils/blocks';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { Segmented } from '../ui/Segmented';
import { SelectInput } from '../ui/SelectInput';
import { Field } from '../ui/Field';
import { InlineAlert } from '../ui/InlineAlert';
import { cn } from '../../utils/cn';

const speechLanguages = [
{ value: 'en-NG', label: 'English (Nigeria)' },
{ value: 'yo-NG', label: 'Yorùbá' },
{ value: 'ha-NG', label: 'Hausa' },
{ value: 'ig-NG', label: 'Igbo' },
{ value: 'sw-KE', label: 'Kiswahili' },
{ value: 'zu-ZA', label: 'isiZulu' },
{ value: 'en-KE', label: 'English (Kenya)' },
{ value: 'en-GH', label: 'English (Ghana)' },
{ value: 'en-ZA', label: 'English (South Africa)' }];

// Twi has no browser speech recognition yet, so Twi screens start on Ghanaian English and can type (D356).
const defaultFor: Record<string, string> = { en: 'en-NG', pcm: 'en-NG', yo: 'yo-NG', ha: 'ha-NG', ig: 'ig-NG', sw: 'sw-KE', tw: 'en-GH', zu: 'zu-ZA' };

/**
 * Voice to content (D342): speak (or type), check the words, choose what they become, then add them.
 * The browser does the listening; the words are always editable before anything reaches the page.
 */
export function VoiceToContentDialog({ open, onClose, onAdded }: {open: boolean;onClose: () => void;onAdded?: (id: string) => void;}) {
  const { t: tr, lang } = useT();
  const { state, actions } = useEditor();
  const [speechLang, setSpeechLang] = useState(defaultFor[lang] ?? 'en-NG');
  const [words, setWords] = useState('');
  const [shape, setShape] = useState<VoiceShape>('text');
  const speech = useSpeechToText(speechLang, (text) => setWords((w) => w.trim() ? `${w.trimEnd()} ${text}` : text));
  const blocks = useMemo(() => voiceToBlocks(words, shape), [words, shape]);

  const close = () => {
    speech.stop();
    onClose();
  };
  const add = () => {
    if (blocks.length === 0) return;
    speech.stop();
    actions.insertBlocks(blocks, tr('Voice to content'));
    toast(tr('Added from your voice'), { action: { label: tr('Undo'), onClick: () => actions.undo() } });
    setWords('');
    onAdded?.(state.selectedId ?? '');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Voice to content"
      description="Speak or type, check the words, then choose what to make."
      footer={
      <>
          <Button variant="tertiary" onClick={close}>
            Cancel
          </Button>
          <Button onClick={add} disabled={blocks.length === 0}>
            Add to page
          </Button>
        </>
      }>
      
      <div className="flex flex-col gap-5">
        {speech.supported ?
        <div className="flex flex-col items-center gap-3 rounded-lg bg-sunken px-4 py-5">
            <button
            type="button"
            onClick={speech.listening ? speech.stop : speech.start}
            aria-pressed={speech.listening}
            aria-label={speech.listening ? tr('Listening… tap to stop') : tr('Tap to speak')}
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
              speech.listening ? 'bg-danger text-white' : 'bg-action text-action-fg hover:bg-action-hover'
            )}>
            
              {speech.listening ? <SquareIcon size={20} fill="currentColor" aria-hidden /> : <MicIcon size={24} aria-hidden />}
            </button>
            <p className="text-label font-medium text-fg" role="status">
              {speech.listening ? tr('Listening… tap to stop') : tr('Tap to speak')}
            </p>
            {speech.interim && <p className="max-w-full text-center text-caption italic text-fg-muted">{speech.interim}</p>}
            <div className="w-full max-w-xs">
              <SelectInput id="voice-lang" label="Listening for" value={speechLang} onChange={setSpeechLang} options={speechLanguages} />
            </div>
            <p className="text-center text-caption text-fg-subtle">{tr('Browser support for Yorùbá, Hausa and Igbo varies. You can always type.')}</p>
          </div> :

        <InlineAlert tone="info" title={tr('This browser can’t listen. Type or paste your words instead.')} />
        }
        {speech.error && <InlineAlert tone="warning" title={tr(speech.error)} />}

        <TextArea
          id="voice-words"
          label="Your words"
          rows={6}
          hint="Edit anything before adding. For questions and answers, put a “?” after each question."
          value={words}
          onChange={(e) => setWords(e.target.value)} />
        

        <Field id="voice-shape" label="Turn it into">
          <Segmented
            ariaLabel="Turn it into"
            fullWidth
            value={shape}
            onChange={setShape}
            options={[
            { value: 'text', label: 'Paragraph' },
            { value: 'headingText', label: 'Heading and text' },
            { value: 'faq', label: 'Questions and answers' }]
            } />
          
        </Field>

        <section aria-labelledby="voice-preview">
          <h3 id="voice-preview" className="text-caption font-semibold text-fg">
            {tr('Will add')}
          </h3>
          {blocks.length === 0 ?
          <p className="mt-1 text-caption text-fg-muted">
              {words.trim() && shape === 'faq' ? tr('No questions found. Put a “?” after each question, then its answer.') : tr('Nothing to add yet — speak or type first.')}
            </p> :

          <ul className="mt-1.5 flex flex-col gap-1">
              {blocks.map((b) =>
            <li key={b.id} className="flex items-baseline gap-2 border-b border-line py-1.5 text-label last:border-b-0">
                  <span className="shrink-0 font-medium text-fg">{tr(blockName(b))}</span>
                  <span className="min-w-0 truncate text-fg-muted">{b.type === 'faq' ? tr('Questions: {n}', { n: b.content.items.length }) : summarizeBlock(b)}</span>
                </li>
            )}
            </ul>
          }
        </section>

        <p className="text-caption text-fg-subtle">{tr('Your browser turns speech into text. KUBICU doesn’t keep the recording.')}</p>
      </div>
    </Dialog>);

}