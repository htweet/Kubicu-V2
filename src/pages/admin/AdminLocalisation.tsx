import React from 'react';
import { Link } from 'react-router-dom';
import { languageOptions, dateFormatOptions } from '../../data/accountOptions';
import { allLegalDocs } from '../../data/legal';
import { translatedStringCount } from '../../data/translations';
import { VAT_RATE } from '../../data/billing';
import { kubicuRateByPlan, PROVIDER_CAP_NGN, PROVIDER_FLAT_NGN, PROVIDER_FLAT_WAIVED_UNDER_NGN, PROVIDER_RATE } from '../../utils/commerce/money';
import { planOrder, plans } from '../../data/plans';
import { formatNgn } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card } from '../../components/ui/layout/Card';
import { Badge } from '../../components/ui/Badge';

const pct = (n: number) => `${(n * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;

/** Super admin → Localisation & policies (D130): languages, regional formats, fees and tax, and policy versions. Read-only — these ship with a release. */
export function AdminLocalisation() {
  const regional = [
  ['Currency', 'Nigerian naira (₦, NGN) only'],
  ['Default time zone', 'West Africa Time (Africa/Lagos)'],
  ['Phone numbers', '+234, local 0 accepted and converted'],
  ['Default date format', dateFormatOptions[0].label],
  ['Other date formats', dateFormatOptions.slice(1).map((d) => d.label.split(' —')[0]).join(', ')]];


  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Localisation & policies" description="Languages, regional formats, fees and the policy versions customers agree to. These ship with a release, so this screen is read-only and every value here is what the app actually uses." />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
        <Card id="languages" title="Languages" description="Translations marked “needs review” are drafts until a native speaker checks them." body="flush">
          <ul className="divide-y divide-line">
            {languageOptions.map((l) =>
            <li key={l.value} className="flex items-center justify-between gap-4 px-5 py-3 md:px-6">
                <span className="text-label font-medium text-fg">
                  {l.label} <span className="font-normal text-fg-subtle">· {l.value}</span>
                </span>
                {l.ready ?
              <Badge tone="success" dot>
                    Ready
                  </Badge> :
              l.draft ?
              <Badge tone="warning">Draft · {translatedStringCount} strings · needs native review</Badge> :

              <Badge tone="neutral">Coming</Badge>
              }
              </li>
            )}
          </ul>
        </Card>

        <Card id="regional" title="Regional formats">
          <dl className="divide-y divide-line">
            {regional.map(([k, v]) =>
            <div key={k} className="flex justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                <dt className="text-label text-fg-muted">{k}</dt>
                <dd className="text-right text-label font-medium text-fg">{v}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card id="fees" title="Fees and tax" description="KUBICU’s fee is confirmed (D105). The payment provider’s fee is an example until a partner is chosen." body="flush">
          <div className="px-5 pb-2 pt-4 md:px-6">
            <p className="text-caption font-semibold text-fg-subtle">KUBICU fee on sales, by plan</p>
            <ul className="mt-2 grid grid-cols-3 gap-x-4 gap-y-2 sm:grid-cols-6">
              {planOrder.map((p) =>
              <li key={p}>
                  <span className="block text-caption text-fg-subtle">{plans[p].name}</span>
                  <span className="block text-label font-semibold tabular-nums text-fg">{pct(kubicuRateByPlan[p])}</span>
                </li>
              )}
            </ul>
          </div>
          <dl className="mt-2 divide-y divide-line border-t border-line">
            {[
            ['Payment provider (example)', `${pct(PROVIDER_RATE)} + ${formatNgn(PROVIDER_FLAT_NGN)}, capped at ${formatNgn(PROVIDER_CAP_NGN)}; no flat fee under ${formatNgn(PROVIDER_FLAT_WAIVED_UNDER_NGN)}`],
            ['VAT on KUBICU plan invoices', pct(VAT_RATE)]].
            map(([k, v]) =>
            <div key={k} className="flex flex-col gap-0.5 px-5 py-3 sm:flex-row sm:justify-between sm:gap-6 md:px-6">
                <dt className="text-label text-fg-muted">{k}</dt>
                <dd className="text-label font-medium text-fg sm:text-right">{v}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card id="policies" title="Policy versions" description="What customers agree to today. Changing wording means a new version and notice to customers." body="flush">
          <ul className="divide-y divide-line">
            {allLegalDocs.map((d) =>
            <li key={d.slug}>
                <Link to={`/about/${d.slug}`} target="_blank" className="flex items-center justify-between gap-4 px-5 py-3 transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus md:px-6">
                  <span className="min-w-0 truncate text-label font-medium text-fg">{d.title}</span>
                  <span className="shrink-0 text-caption tabular-nums text-fg-subtle">
                    v{d.version} · {d.updated}
                  </span>
                </Link>
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>);

}