import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, PlayIcon } from 'lucide-react';
import { apiChangelog, apiResources, RATE_LIMIT_PER_MIN, RETRY_MINUTES, sandboxResponses, webhookEvents } from '../../data/developerApi';
import { SectionHeading } from '../../components/marketing/SectionHeading';
import { Button } from '../../components/ui/Button';
import { useT } from '../../contexts/LocaleContext';
import { cn } from '../../utils/cn';

const methodTone: Record<string, string> = { GET: 'text-success', POST: 'text-action', PATCH: 'text-warning' };

const curl = `curl https://api.kub.icu/v1/orders?status=paid \\
  -H "Authorization: Bearer kub_test_••••••••" \\
  -H "Kubicu-Version: 2026-10-24"`;

const verify = `import crypto from "node:crypto";

export function isFromKubicu(rawBody, header, secret) {
  const { t, v1 } = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  if (Date.now() / 1000 - Number(t) > 300) return false; // older than 5 minutes
  const expected = crypto.createHmac("sha256", secret).update(\`\${t}.\${rawBody}\`).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
}`;

const sandboxOptions = apiResources.filter((r) => r.method === 'GET');

const basics = [
['Sign in with a key', 'Send your key as a Bearer token. Test keys (kub_test_) only see sample data; live keys see real data. Each key only gets the permissions you tick.'],
['Money and phones', 'Amounts are whole naira with currency "NGN". Phones are +234. Times are ISO 8601 in West Africa Time.'],
['Limits and errors', 'Requests per minute per key: {n}. Over that you get 429 with Retry-After. Errors always carry a code and a plain message.']] as
const;

/**
 * Public developer docs with a test sandbox and changelog (D131).
 * D336: the page's wording is translated. Code samples, endpoint paths, permission names, event ids and JSON stay as written —
 * they are what a developer types. Endpoint summaries, event labels and changelog entries pass through the translator.
 */
export function Developers() {
  const { t: tr } = useT();
  const [picked, setPicked] = useState(`${sandboxOptions[0].method} ${sandboxOptions[0].path}`);
  const [ran, setRan] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const navigate = useNavigate();
  const retries = RETRY_MINUTES.map((m) => m >= 60 ? `${m / 60}h` : `${m}m`).join(', ');

  const run = () => {
    setRunning(true);
    window.setTimeout(() => {
      setRan(JSON.stringify(sandboxResponses[picked] ?? { error: { code: 'not_found' } }, null, 2));
      setRunning(false);
    }, 250);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-14 md:px-8 md:pt-20">
      <header className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <h1 className="kb-display text-[44px] leading-[0.98] text-fg md:text-[64px]">
            {tr('Build on')} <span className="nm-text">KUBICU.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-fg-muted">
            {tr('Read orders, sync stock with your shop till, and get a signed message the moment someone pays — in naira, with Nigerian phone formats, from day one.')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="brand" trailingIcon={ArrowRightIcon} onClick={() => navigate('/signup')}>
              {tr('Get a test key')}
            </Button>
            <Button variant="secondary" onClick={() => document.getElementById('sandbox')?.scrollIntoView({ behavior: 'smooth' })}>
              {tr('Try the sandbox')}
            </Button>
          </div>
          <p className="mt-4 text-caption text-fg-subtle">{tr('Developer preview · test mode only. Keys live in Settings → Developers.')}</p>
        </div>
        <pre className="overflow-x-auto rounded-2xl border border-line bg-raised p-5 font-mono text-[13px] leading-relaxed text-fg">{curl}</pre>
      </header>

      <section className="mt-24" aria-labelledby="basics">
        <SectionHeading id="basics" title={tr('The basics')} />
        <dl className="mt-8 grid gap-x-10 gap-y-6 border-t border-line pt-8 md:grid-cols-3">
          {basics.map(([t, d]) =>
          <div key={t}>
              <dt className="text-label font-semibold text-fg">{tr(t)}</dt>
              <dd className="mt-1.5 text-label leading-relaxed text-fg-muted">{tr(d, { n: RATE_LIMIT_PER_MIN })}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="mt-24" aria-labelledby="resources">
        <SectionHeading id="resources" title={tr('Endpoints')} lead={tr('Version {v}. Every list is paged with a cursor and newest first.', { v: '2026-10-24' })} />
        <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[640px] text-left">
            <caption className="sr-only">{tr('API endpoints')}</caption>
            <thead className="border-b border-line bg-raised/60">
              <tr className="text-caption text-fg-subtle">
                <th scope="col" className="px-5 py-3 font-semibold">
                  {tr('Request')}
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  {tr('What it does')}
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  {tr('Permission')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {apiResources.map((r) =>
              <tr key={`${r.method}${r.path}`}>
                  <th scope="row" className="whitespace-nowrap px-5 py-3 font-mono text-[13px] font-normal text-fg">
                    <span className={cn('mr-2 font-semibold', methodTone[r.method])}>{r.method}</span>
                    {r.path}
                  </th>
                  <td className="px-5 py-3 text-label text-fg-muted">{tr(r.summary)}</td>
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-caption text-fg-subtle">{r.scope}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section id="sandbox" className="mt-24 scroll-mt-24" aria-labelledby="sandbox-h">
        <SectionHeading id="sandbox-h" title={tr('Sandbox')} lead={tr('Run a request against sample data. Nothing leaves your browser.')} />
        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="flex flex-col gap-3">
            <label htmlFor="sb-req" className="text-label font-medium text-fg">
              {tr('Request')}
            </label>
            <select
              id="sb-req"
              value={picked}
              onChange={(e) => {
                setPicked(e.target.value);
                setRan(null);
              }}
              className="h-11 rounded-md border border-line bg-raised px-3 font-mono text-[13px] text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              
              {sandboxOptions.map((r) =>
              <option key={r.path} value={`${r.method} ${r.path}`}>
                  {r.method} {r.path}
                </option>
              )}
            </select>
            <Button variant="brand" leadingIcon={PlayIcon} loading={running} onClick={run} className="self-start">
              {tr('Send request')}
            </Button>
          </div>
          <div aria-live="polite">
            <pre className="min-h-[220px] overflow-auto rounded-2xl border border-line bg-raised p-5 font-mono text-[13px] leading-relaxed text-fg">{ran ? `HTTP/1.1 200 OK\n\n${ran}` : `// ${tr('The response appears here')}`}</pre>
          </div>
        </div>
      </section>

      <section className="mt-24" aria-labelledby="webhooks">
        <SectionHeading id="webhooks" title={tr('Webhooks')} lead={tr('Signed with your endpoint’s secret. Failed deliveries retry after: {list}.', { list: retries })} />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {webhookEvents.map((e) =>
            <li key={e.id} className="border-b border-line py-2.5">
                <span className="block font-mono text-[13px] text-fg">{e.id}</span>
                <span className="block text-caption text-fg-subtle">{tr(e.label)}</span>
              </li>
            )}
          </ul>
          <div>
            <p className="text-label font-semibold text-fg">{tr('Check the signature (Node.js)')}</p>
            <pre className="mt-3 overflow-x-auto rounded-2xl border border-line bg-raised p-5 font-mono text-[12.5px] leading-relaxed text-fg">{verify}</pre>
          </div>
        </div>
      </section>

      <section className="mt-24" aria-labelledby="changelog">
        <SectionHeading id="changelog" title={tr('Changelog')} />
        <ol className="mt-8 border-t border-line">
          {apiChangelog.map((c) =>
          <li key={c.title} className="grid gap-1 border-b border-line py-5 md:grid-cols-[160px_minmax(0,1fr)] md:gap-8">
              <span className="text-caption tabular-nums text-fg-subtle">{c.date}</span>
              <span>
                <span className="block text-label font-semibold text-fg">{tr(c.title)}</span>
                <span className="mt-1 block text-label text-fg-muted">{tr(c.body)}</span>
              </span>
            </li>
          )}
        </ol>
      </section>
    </div>);

}