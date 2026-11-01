import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckIcon, PencilIcon, SearchIcon } from 'lucide-react';
import type { UiLang } from '../../../data/translations';
import { translations } from '../../../data/translations';
import { audit, staffActor, useAdminStore } from '../../../utils/admin/store';
import { phraseKey } from '../../../utils/phraseOverrides';
import { Card } from '../../ui/layout/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Segmented } from '../../ui/Segmented';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';

type Lang = UiLang;
type Filter = 'todo' | 'done';

/** Every English phrase the app shows through the translator — what staff can reword in English (D465). */
const englishPhrases: Record<string, string> = Object.fromEntries([...new Set([...Object.keys(translations.pcm), ...Object.keys(translations.sw)])].map((k) => [k, k]));
const dictFor = (l: Lang): Record<string, string> => l === 'en' ? englishPhrases : translations[l];

const langs: {value: Lang;label: string;}[] = [
{ value: 'en', label: 'English' },
{ value: 'pcm', label: 'Naijá' },
{ value: 'yo', label: 'Yorùbá' },
{ value: 'ha', label: 'Hausa' },
{ value: 'ig', label: 'Igbo' },
{ value: 'sw', label: 'Kiswahili' },
{ value: 'tw', label: 'Twi' },
{ value: 'zu', label: 'isiZulu' }];


const PAGE = 15;

/**
 * Native-speaker review queue (D135). Approve a draft as it is, or correct it — a correction
 * replaces the draft everywhere in the app straight away.
 */
export function PhraseReviewCard() {
  const [store, setStore] = useAdminStore();
  const [lang, setLang] = useState<Lang>('pcm');
  const isEnglish = lang === 'en';
  const [filter, setFilter] = useState<Filter>('todo');
  const [q, setQ] = useState('');
  const [shown, setShown] = useState(PAGE);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const entries = useMemo(() => Object.entries(dictFor(lang)), [lang]);
  const reviewedCount = (l: Lang) => Object.keys(dictFor(l)).filter((en) => store.phraseReviews[phraseKey(l, en)]).length;
  const undo = (en: string) => {
    setStore((s) => {
      const next = { ...s.phraseReviews };
      delete next[phraseKey(lang, en)];
      return audit({ ...s, phraseReviews: next }, { area: 'localisation', action: `Restored the original ${langs.find((l) => l.value === lang)?.label} wording`, target: en.slice(0, 80), reason: 'Back to the original' });
    });
    toast('Original wording restored');
  };
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return entries.filter(([en, tr]) => {
      const reviewed = !!store.phraseReviews[phraseKey(lang, en)];
      if (filter === 'todo' === reviewed) return false;
      return !needle || en.toLowerCase().includes(needle) || tr.toLowerCase().includes(needle);
    });
  }, [entries, store.phraseReviews, lang, filter, q]);

  const record = (en: string, status: 'approved' | 'edited', text?: string) => {
    setStore((s) => audit({ ...s, phraseReviews: { ...s.phraseReviews, [phraseKey(lang, en)]: { status, text, by: staffActor(s), at: new Date().toISOString() } } }, { area: 'localisation', action: `${status === 'approved' ? 'Approved' : 'Corrected'} a ${langs.find((l) => l.value === lang)?.label} phrase`, target: en.slice(0, 80), reason: status === 'edited' ? `Now: ${text}` : 'Approved as drafted' }));
  };

  const saveEdit = (en: string) => {
    const text = draft.trim();
    if (!text) return;
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
    if (placeholders(text) !== placeholders(en)) {
      toast.error('Keep the {placeholders}', { description: `This phrase needs exactly: ${placeholders(en) || 'none'}.` });
      return;
    }
    record(en, 'edited', text);
    setEditing(null);
    toast.success('Correction saved', { description: 'It replaces the draft everywhere in the app.' });
  };

  return (
    <Card
      id="review"
      title="Wording and translation review"
      description="English: change any label, button, placeholder, message or name the app shows — it updates everywhere at once, and languages without their own draft follow it. Other languages: native speakers approve or correct each draft. {placeholders} must stay."
      body="flush">
      
      <div className="flex flex-col gap-3 px-5 pt-4 md:px-6">
        <div className="scroll-quiet overflow-x-auto">
          <Segmented<Lang> ariaLabel="Language" size="sm" value={lang} onChange={(v) => (setLang(v), setShown(PAGE), setEditing(null))} options={langs.map((l) => ({ value: l.value, label: l.value === 'en' ? `${l.label} · changed ${reviewedCount('en')}` : `${l.label} · ${reviewedCount(l.value)}/${Object.keys(dictFor(l.value)).length}` }))} />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Segmented<Filter>
            ariaLabel="Show"
            size="sm"
            value={filter}
            onChange={(v) => (setFilter(v), setShown(PAGE))}
            options={
            isEnglish ?
            [
            { value: 'todo', label: 'Original' },
            { value: 'done', label: 'Changed' }] :

            [
            { value: 'todo', label: 'To review' },
            { value: 'done', label: 'Reviewed' }]

            } />
          
          <div className="relative sm:ml-auto sm:w-64">
            <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-fg-subtle" aria-hidden />
            <TextInput id="phrase-search" label="Search phrases" placeholder="Search phrases" value={q} onChange={(e) => (setQ(e.target.value), setShown(PAGE))} fieldClassName="[&>div:first-child]:sr-only [&_input]:pl-9" />
          </div>
        </div>
      </div>

      {list.length === 0 ?
      <p className="px-5 py-6 text-label text-fg-muted md:px-6">{isEnglish ? filter === 'todo' ? 'No match.' : 'No English wording changed yet.' : filter === 'todo' ? 'Every phrase in this language has been reviewed.' : 'Nothing reviewed yet.'}</p> :

      <ul className="mt-3 divide-y divide-line border-t border-line">
          {list.slice(0, shown).map(([en, tr]) => {
          const review = store.phraseReviews[phraseKey(lang, en)];
          const current = review?.status === 'edited' ? review.text ?? tr : tr;
          return (
            <li key={en} className="flex flex-col gap-2 px-5 py-3.5 md:px-6">
                <p className="text-caption text-fg-subtle">{isEnglish ? 'Original' : en}{isEnglish && review?.status === 'edited' ? ` · ${en}` : ''}</p>
                {editing === en ?
              <div className="flex flex-col gap-2">
                    <TextArea id={`phrase-${en.slice(0, 20)}`} label={isEnglish ? 'New wording' : 'Correct wording'} rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(en)} disabled={!draft.trim()}>
                        Save correction
                      </Button>
                      <Button size="sm" variant="tertiary" onClick={() => setEditing(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div> :

              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                    <p className="min-w-0 flex-1 text-label text-fg" lang={lang}>
                      {current}
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
                      {review &&
                  <Badge tone={review.status === 'edited' ? 'info' : 'success'} dot>
                          {review.status === 'edited' ? 'Corrected' : 'Approved'} · {review.by.split(' ·')[0]}
                        </Badge>
                  }
                      <Button size="sm" variant="tertiary" leadingIcon={PencilIcon} onClick={() => (setEditing(en), setDraft(current))}>
                        {isEnglish ? 'Change' : 'Correct'}
                      </Button>
                      {review?.status === 'edited' &&
                  <Button size="sm" variant="tertiary" onClick={() => undo(en)}>
                          Restore original
                        </Button>
                  }
                      {!review && !isEnglish &&
                  <Button size="sm" variant="secondary" leadingIcon={CheckIcon} onClick={() => record(en, 'approved')}>
                          Approve
                        </Button>
                  }
                    </div>
                  </div>
              }
              </li>);

        })}
        </ul>
      }
      {list.length > shown &&
      <div className="border-t border-line px-5 py-3 md:px-6">
          <Button size="sm" variant="tertiary" onClick={() => setShown((n) => n + PAGE)}>
            Show {Math.min(PAGE, list.length - shown)} more of {list.length - shown}
          </Button>
        </div>
      }
    </Card>);

}