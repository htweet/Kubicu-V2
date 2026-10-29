import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { AlertCircleIcon, ArrowRightIcon, CheckIcon, CopyIcon, ShieldCheckIcon } from 'lucide-react';
import { QrPreview } from '../../domains/QrPreview';
import { styleOf } from '../../../utils/domains/qr';
import { SLUG_PATTERN, slugify } from '../../../utils/domains/links';
import { checkDestination } from '../../../utils/linkSafety';
import { cn } from '../../../utils/cn';

const channels = [
{ id: 'whatsapp', label: 'WhatsApp' },
{ id: 'instagram', label: 'Instagram' },
{ id: 'tiktok', label: 'TikTok' },
{ id: 'qr', label: 'Flyer or QR' },
{ id: 'email', label: 'Email' },
{ id: 'ads', label: 'Paid ad' }] as
const;

const RESERVED = ['admin', 'login', 'signin', 'signup', 'api', 'app', 'help'];
const DEMO_LIMIT = 5;
const COUNT_KEY = 'kubicu.shortDemo.count';
const qrStyle = styleOf({ fg: '#141412', bg: '#FFFFFF', moduleStyle: 'rounded', eyeStyle: 'rounded', centreKind: 'none' }, 'K');

interface Result {
  short: string;
  slug: string;
  destination: string;
  host: string;
  channel: string;
  tag: string;
  upgraded: boolean;
}

function demoCount(): number {
  try {
    return Number(sessionStorage.getItem(COUNT_KEY)) || 0;
  } catch {
    return 0;
  }
}

/**
 * Public short-link demo (D268): checks the address with the same rules the app uses and shows the link,
 * its tags and a QR — but saves nothing. Five tries per visit, then it asks you to sign up.
 */
export function ShortLinkDemo() {
  const reduce = useReducedMotion();
  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [channel, setChannel] = useState<string>('whatsapp');
  const [tag, setTag] = useState('');
  const [error, setError] = useState<{field: 'url' | 'slug';text: string;} | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [count, setCount] = useState(demoCount);
  const limited = count >= DEMO_LIMIT;

  const suggested = useMemo(() => {
    const c = checkDestination(url);
    if (!c.ok) return '';
    const u = new URL(c.url);
    return slugify(u.pathname.split('/').filter(Boolean).pop() ?? u.hostname.split('.')[0]) || 'my-link';
  }, [url]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (limited) return;
    const check = checkDestination(url);
    if (!check.ok) return setError({ field: 'url', text: check.message });
    const s = (slug || suggested).trim();
    if (!SLUG_PATTERN.test(s)) return setError({ field: 'slug', text: 'Use lowercase letters, numbers and hyphens (up to 40).' });
    if (RESERVED.includes(s)) return setError({ field: 'slug', text: `“${s}” is reserved by KUBICU. Try another.` });
    setError(null);
    const next = count + 1;
    try {
      sessionStorage.setItem(COUNT_KEY, String(next));
    } catch {

      /* private mode: the limit just resets */}
    setCount(next);
    setResult({ short: `kub.icu/yourname/s/${s}`, slug: s, destination: check.url, host: check.host, channel: channels.find((c) => c.id === channel)!.label, tag: tag.trim(), upgraded: check.upgraded });
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(`https://${result.short}`);
      toast.success('Copied — it’s a demo address, so it won’t open yet');
    } catch {
      toast.error('Couldn’t copy. Select the link and copy it yourself.');
    }
  };

  const field = 'h-12 w-full rounded-2xl border border-line bg-raised px-4 text-[15px] text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-focus';

  return (
    <div className="rounded-[32px] bg-white p-5 text-[rgb(20_20_18)] shadow-3 md:p-7">
      <form noValidate onSubmit={submit} aria-describedby="demo-note">
        <label htmlFor="demo-url" className="text-[14px] font-bold">
          Long address
        </label>
        <input
          id="demo-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error?.field === 'url') setError(null);
          }}
          placeholder="https://yourshop.com/products/ankara-wrap-dress?ref=story"
          aria-invalid={error?.field === 'url' || undefined}
          aria-describedby={error?.field === 'url' ? 'demo-url-err' : undefined}
          className={cn(field, 'mt-2', error?.field === 'url' && 'border-danger')} />
        
        {error?.field === 'url' &&
        <p id="demo-url-err" className="mt-2 flex items-start gap-1.5 text-[13px] text-danger">
            <AlertCircleIcon size={14} aria-hidden className="mt-0.5 shrink-0" /> {error.text}
          </p>
        }

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="demo-slug" className="text-[14px] font-bold">
              Short name <span className="font-medium text-fg-subtle">(optional)</span>
            </label>
            <div className={cn('mt-2 flex h-12 items-center rounded-2xl border border-line bg-raised pl-4 focus-within:ring-2 focus-within:ring-focus', error?.field === 'slug' && 'border-danger')}>
              <span className="shrink-0 text-[14px] text-fg-subtle" aria-hidden>
                …/s/
              </span>
              <input
                id="demo-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  if (error?.field === 'slug') setError(null);
                }}
                placeholder={suggested || 'wrap-dress'}
                maxLength={40}
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={error?.field === 'slug' || undefined}
                aria-describedby={error?.field === 'slug' ? 'demo-slug-err' : undefined}
                className="h-full min-w-0 flex-1 bg-transparent pr-3 text-[15px] text-fg placeholder:text-fg-subtle focus:outline-none" />
              
            </div>
            {error?.field === 'slug' &&
            <p id="demo-slug-err" className="mt-2 text-[13px] text-danger">
                {error.text}
              </p>
            }
          </div>
          <div>
            <label htmlFor="demo-tag" className="text-[14px] font-bold">
              Campaign tag <span className="font-medium text-fg-subtle">(optional)</span>
            </label>
            <input id="demo-tag" value={tag} onChange={(e) => setTag(e.target.value.slice(0, 40))} placeholder="december-sale" className={cn(field, 'mt-2')} />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-[14px] font-bold">Where you’ll share it</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {channels.map((c) =>
            <label
              key={c.id}
              className={cn(
                'inline-flex h-10 cursor-pointer items-center rounded-full px-4 text-[14px] font-semibold transition-colors duration-150 focus-within:ring-2 focus-within:ring-focus',
                channel === c.id ? 'bg-[rgb(20_20_18)] text-white' : 'bg-[rgb(238_233_221)] hover:bg-[rgb(224_217_202)]'
              )}>
              
                <input type="radio" name="demo-channel" value={c.id} checked={channel === c.id} onChange={() => setChannel(c.id)} className="sr-only" />
                {c.label}
              </label>
            )}
          </div>
        </fieldset>

        {limited ?
        <div role="status" className="mt-6 rounded-2xl bg-[rgb(238_233_221)] p-4">
            <p className="text-[15px] font-bold">You’ve tried {DEMO_LIMIT} demo links this visit</p>
            <p className="mt-1 text-[14px] text-[rgb(70_68_62)]">That’s the limit for the demo. Make real, saved links free in your workspace.</p>
            <Link to="/signup" className="mt-3 inline-flex h-11 items-center gap-2 rounded-full bg-[rgb(20_20_18)] px-5 text-[14px] font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              Sign up free <ArrowRightIcon size={15} aria-hidden />
            </Link>
          </div> :

        <button
          type="submit"
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[rgb(20_20_18)] px-6 text-[15px] font-bold text-white transition-transform duration-150 ease-out hover:scale-[1.01] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 sm:w-auto">
          
            Shorten it <ArrowRightIcon size={16} aria-hidden />
          </button>
        }
        <p id="demo-note" className="mt-3 text-[12px] text-fg-subtle">
          Demo only: nothing is saved and the link won’t open. {DEMO_LIMIT - Math.min(count, DEMO_LIMIT)} of {DEMO_LIMIT} tries left this visit.
        </p>
      </form>

      <AnimatePresence>
        {result &&
        <motion.div
          key={result.short + count}
          initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          className="mt-6 grid gap-5 rounded-[24px] bg-[rgb(var(--kb-lime))] p-5 text-[rgb(var(--kb-forest))] sm:grid-cols-[minmax(0,1fr)_128px]"
          aria-live="polite">
          
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.08em]">
                <ShieldCheckIcon size={14} aria-hidden /> Address checked
              </p>
              <p className="mt-2 break-all text-[20px] font-extrabold leading-tight md:text-[22px]">{result.short}</p>
              <p className="mt-2 truncate text-[13px] font-medium">Opens {result.host}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[12px] font-semibold">
                <span className="rounded-full bg-white/70 px-2.5 py-1">Source: {result.channel}</span>
                {result.tag && <span className="rounded-full bg-white/70 px-2.5 py-1">Tag: {result.tag}</span>}
                {result.upgraded &&
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1">
                    <CheckIcon size={11} aria-hidden /> Switched to https
                  </span>
              }
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={copy} className="inline-flex h-11 items-center gap-2 rounded-full bg-[rgb(var(--kb-forest))] px-5 text-[14px] font-bold text-[rgb(var(--kb-lime))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--kb-forest))] focus-visible:ring-offset-2">
                  <CopyIcon size={15} aria-hidden /> Copy
                </button>
                <Link to="/signup" className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-bold text-[rgb(20_20_18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--kb-forest))]">
                  Make it real <ArrowRightIcon size={15} aria-hidden />
                </Link>
              </div>
            </div>
            <div className="w-32 justify-self-start rounded-2xl bg-white p-2 sm:justify-self-end">
              <QrPreview url={`https://${result.short}`} style={qrStyle} alt={`QR code preview for ${result.short}`} />
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}