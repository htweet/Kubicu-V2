import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, CompassIcon, FlaskConicalIcon, LightbulbIcon, MapPinIcon, SparklesIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { HelpScreenshot } from '../../components/help/HelpScreenshot';
import { HelpStillStuck } from '../../components/help/HelpStillStuck';
import { helpIcons } from '../../components/help/helpIcons';
import { EmptyState } from '../../components/ui/EmptyState';
import { findHelpArticle, helpArticleHref, shotFor } from '../../utils/help';

const FEEDBACK_KEY = 'kubicu.help.feedback';

/** /about/help/:articleId (D274): one guide — answer, picture with numbered markers, steps, notes, what to read next. */
export function HelpArticlePage() {
  const { articleId } = useParams();
  const found = findHelpArticle(articleId);
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    try {
      const saved = JSON.parse(localStorage.getItem(FEEDBACK_KEY) ?? '{}') as Record<string, 'yes' | 'no'>;
      setFeedback(articleId ? saved[articleId] ?? null : null);
    } catch {
      setFeedback(null);
    }
    const current = findHelpArticle(articleId);
    if (current) document.title = `${current.article.q} · KUBICU Help`;
  }, [articleId]);

  if (!found) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-24 md:px-8">
        <EmptyState
          icon={CompassIcon}
          title="That guide doesn’t exist"
          description="It may have moved. Search the help centre for what you need."
          action={
          <Link to="/about/help" className="inline-flex h-10 items-center rounded-md bg-action px-4 text-label font-medium text-action-fg">
              Go to the help centre
            </Link>
          } />
        
      </div>);

  }

  const { article: a, topic, index } = found;
  const shot = shotFor(a);
  const Icon = helpIcons[topic.icon];
  const prev = topic.articles[index - 1];
  const next = topic.articles[index + 1];
  const related = (a.related ?? []).map((id) => findHelpArticle(id)).filter((r): r is NonNullable<typeof r> => !!r && r.article.id !== a.id);

  const vote = (v: 'yes' | 'no') => {
    setFeedback(v);
    try {
      const saved = JSON.parse(localStorage.getItem(FEEDBACK_KEY) ?? '{}') as Record<string, string>;
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify({ ...saved, [a.id]: v }));
    } catch {

      /* Storage full or blocked — the thanks still shows. */}
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 md:px-8 md:pt-14">
      <nav aria-label="Breadcrumb" className="text-caption text-fg-subtle">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/about/help" className="hover:text-fg hover:underline">
              Help centre
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link to={`/about/help#topic-${topic.id}`} className="hover:text-fg hover:underline">
              {topic.title}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article aria-labelledby="help-title" className="min-w-0">
          <p className="flex items-center gap-2 text-caption font-semibold text-fg-subtle">
            <Icon size={16} className="text-[rgb(var(--nm-3))]" aria-hidden /> {topic.group}
          </p>
          <h1 id="help-title" className="mt-2 font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-fg md:text-[40px]">
            {a.q}
          </h1>
          <p className="mt-4 max-w-2xl text-body leading-relaxed text-fg-muted">{a.a}</p>

          {(a.where || a.plan || a.simulated) &&
          <div className="mt-5 flex flex-wrap gap-2">
              {a.where &&
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-caption text-fg-muted">
                  <MapPinIcon size={13} aria-hidden /> <span className="sr-only">Where: </span>
                  {a.where}
                </span>
            }
              {a.plan &&
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-caption text-fg-muted">
                  <SparklesIcon size={13} aria-hidden /> <span className="sr-only">Plan: </span>
                  {a.plan}
                </span>
            }
              {a.simulated &&
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-caption text-warning">
                  <FlaskConicalIcon size={13} aria-hidden /> {a.simulated}
                </span>
            }
            </div>
          }

          {(shot || a.steps) &&
          <div className={shot && a.steps ? 'mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] xl:items-start' : 'mt-10 flex flex-col gap-8'}>
              {shot && <HelpScreenshot shot={shot} />}
              {a.steps &&
            <section aria-labelledby="help-steps">
                  <h2 id="help-steps" className="text-heading font-semibold text-fg">
                    Step by step
                  </h2>
                  <ol className="mt-4 flex flex-col gap-4">
                    {a.steps.map((s, i) =>
                <li key={s} className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-3 text-body leading-relaxed text-fg">
                        <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-action text-caption font-bold tabular-nums text-action-fg">{i + 1}</span>
                        {s}
                      </li>
                )}
                  </ol>
                </section>
            }
            </div>
          }

          {a.tips && a.tips.length > 0 &&
          <aside aria-label="Good to know" className="mt-10 rounded-xl bg-info-soft p-5">
              <p className="flex items-center gap-2 text-label font-semibold text-info">
                <LightbulbIcon size={16} aria-hidden /> Good to know
              </p>
              <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-label leading-relaxed text-fg">
                {a.tips.map((t) =>
              <li key={t}>{t}</li>
              )}
              </ul>
            </aside>
          }

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6" aria-live="polite">
            {feedback ?
            <p className="text-label text-fg-muted">{feedback === 'yes' ? 'Thanks — glad it helped.' : 'Thanks. If you’re still stuck, contact us below and a person will reply.'}</p> :

            <>
                <p className="text-label font-medium text-fg">Did this guide help?</p>
                <button type="button" onClick={() => vote('yes')} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line-strong px-3 text-label text-fg hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <ThumbsUpIcon size={15} aria-hidden /> Yes
                </button>
                <button type="button" onClick={() => vote('no')} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line-strong px-3 text-label text-fg hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <ThumbsDownIcon size={15} aria-hidden /> No
                </button>
              </>
            }
          </div>

          {(prev || next) &&
          <nav aria-label="More in this topic" className="mt-8 grid gap-3 sm:grid-cols-2">
              {prev ?
            <Link to={helpArticleHref(prev.id)} className="flex flex-col gap-1 rounded-xl border border-line p-4 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <span className="inline-flex items-center gap-1 text-caption text-fg-subtle">
                    <ArrowLeftIcon size={13} aria-hidden /> Previous
                  </span>
                  <span className="text-label font-semibold text-fg">{prev.q}</span>
                </Link> :

            <span className="hidden sm:block" />
            }
              {next &&
            <Link to={helpArticleHref(next.id)} className="flex flex-col gap-1 rounded-xl border border-line p-4 text-right hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <span className="inline-flex items-center justify-end gap-1 text-caption text-fg-subtle">
                    Next <ArrowRightIcon size={13} aria-hidden />
                  </span>
                  <span className="text-label font-semibold text-fg">{next.q}</span>
                </Link>
            }
            </nav>
          }
        </article>

        <aside aria-label="In this topic" className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-8">
            {related.length > 0 &&
            <div>
                <p className="text-caption font-semibold text-fg-subtle">Read next</p>
                <ul className="mt-2 flex flex-col gap-2">
                  {related.map((r) =>
                <li key={r.article.id}>
                      <Link to={helpArticleHref(r.article.id)} className="text-label text-fg hover:underline">
                        {r.article.q}
                      </Link>
                    </li>
                )}
                </ul>
              </div>
            }
            <div>
              <p className="text-caption font-semibold text-fg-subtle">{topic.title}</p>
              <ul className="mt-2 flex flex-col gap-1 border-l border-line">
                {topic.articles.map((t) =>
                <li key={t.id}>
                    <Link
                    to={helpArticleHref(t.id)}
                    aria-current={t.id === a.id ? 'page' : undefined}
                    className={t.id === a.id ? '-ml-px block border-l-2 border-fg py-1 pl-3 text-label font-semibold text-fg' : '-ml-px block border-l border-transparent py-1 pl-3 text-label text-fg-muted hover:border-fg hover:text-fg'}>
                    
                      {t.q}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 &&
      <section aria-labelledby="help-related-m" className="mt-10 lg:hidden">
          <h2 id="help-related-m" className="text-heading font-semibold text-fg">
            Read next
          </h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {related.map((r) =>
          <li key={r.article.id}>
                <Link to={helpArticleHref(r.article.id)} className="block py-3 text-label font-medium text-fg">
                  {r.article.q}
                </Link>
              </li>
          )}
          </ul>
        </section>
      }

      <HelpStillStuck />
    </div>);

}