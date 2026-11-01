import type { UiLang } from '../../data/translations';
import type { UnderstandRow } from '../../data/copilotUnderstanding';
import { copilotHelpTopics, copilotQuestionWords, type CopilotHelpTopic } from '../../data/copilotHelpTopics';
import type { HelpArticle } from '../../types/help';
import { helpTopics } from '../../data/helpTopics';
import { foldSearch } from '../searchGlossary';

/**
 * Is this message a question about KUBICU rather than a page to build? (D520) Rule-based in the prototype:
 * a real model replaces this without changing the screens. Building always wins — "how do I make a page for my
 * bakery?" starts the page, not an answer.
 */
export interface QuestionRead {
  topic: CopilotHelpTopic | null;
  question: boolean;
  build: boolean;
}

const column: Record<UiLang, number> = { en: 0, pcm: 1, yo: 2, ha: 3, ig: 4, sw: 5, tw: 6, zu: 7 };

const fold = (s: string) => foldSearch(s).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

const phrases = (row: UnderstandRow, lang: UiLang) => {
  const cols = lang === 'en' ? [row[0]] : [row[0], row[column[lang]]];
  return cols.flatMap((c) => c.split('|')).map(fold).filter(Boolean);
};

/** Asking for a page — always means build, even as a question. */
const wantsPage = /\b(make|build|create|design|need|want|get|start)\b[^.?!]{0,40}\b(page|site|website|link in bio|landing|portfolio|online (shop|store))\b/i;
/** Describing the business — means build only when it isn't a question ("how do I grow my business?" is a question). */
const describesBusiness = [
/\b(i|we)\s+(sell|bake|cook|make|run|own|offer|teach|organi[sz]e|braid|style|design|photograph)\b/i,
/^\s*(my|our)\s+(business|shop|store|brand|restaurant|salon|bakery|studio|church|school)\b/i];


const words = (cell: string) => cell.split('|').map(fold).filter(Boolean);

export function readQuestion(text: string, hints: string, lang: UiLang): QuestionRead {
  const folded = fold(text);
  const padded = ` ${folded} `;
  const has = (row: UnderstandRow) => phrases(row, lang).some((p) => padded.includes(` ${p} `));

  const englishStart = words(copilotQuestionWords[0]).some((p) => folded === p || folded.startsWith(`${p} `));
  const ownLanguage = lang !== 'en' && words(copilotQuestionWords[column[lang]]).some((p) => padded.includes(` ${p} `));
  const question = text.includes('?') || englishStart || ownLanguage;

  const both = hints ? `${text}\n${hints}` : text;
  const build = wantsPage.test(both) || !question && describesBusiness.some((re) => re.test(both));

  const topic = copilotHelpTopics.find((t) => has(t.words)) ?? null;
  return { topic, question, build };
}

/**
 * D521: everything else Copilot can answer comes from the Help centre guides — every module, tool and customer page.
 * The best-matching guide wins when its question shares enough meaningful words with what was asked; otherwise
 * Copilot says it doesn't know. `hints` are English words for what was typed in another language (D518).
 */
const stopWords = new Set(
  'a an the and or but to of in on at for with from by is are was be been do does did can could should would will i me my we our you your it its this that these those how what where why when which who there here have has get got make use add set up out about into than then so if not no yes any some all more much many just also please want need know tell'.split(' ')
);

const tokens = (s: string) => fold(s).split(' ').filter((w) => w.length >= 3 && !stopWords.has(w));

interface GuideIndex {
  article: HelpArticle;
  title: Set<string>;
  body: Set<string>;
}

let index: GuideIndex[] | null = null;
const guideIndex = () =>
index ??= helpTopics.flatMap((topic) =>
topic.articles.map((article) => ({
  article,
  title: new Set(tokens(article.q)),
  body: new Set(tokens(`${article.a} ${article.where ?? ''} ${topic.title}`))
}))
);

/** Word stems match loosely, so "bookings" finds "booking" and "deliveries" finds "delivery". */
const stem = (w: string) => w.replace(/(ies|es|s|ing|ed)$/, '');

export function findGuide(text: string, hints: string): HelpArticle | null {
  const asked = [...new Set([...tokens(text), ...tokens(hints)].map(stem))];
  if (!asked.length) return null;
  let best: {article: HelpArticle;score: number;titleHits: number;} | null = null;
  for (const g of guideIndex()) {
    const title = [...g.title].map(stem);
    const body = [...g.body].map(stem);
    let score = 0;
    let titleHits = 0;
    for (const w of asked) {
      if (title.includes(w)) {
        score += 3;
        titleHits += 1;
      } else if (body.includes(w)) score += 1;
    }
    if (titleHits && (!best || score > best.score)) best = { article: g.article, score, titleHits };
  }
  // Enough overlap to be confident: two words in the guide's question, or one plus supporting words.
  if (!best || best.score < 4 || best.titleHits < 2 && asked.length > 3 && best.score < 5) return null;
  return best.article;
}