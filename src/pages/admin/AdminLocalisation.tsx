import React from 'react';
import { languageOptions, dateFormatOptions } from '../../data/accountOptions';
import { translations, type UiLang } from '../../data/translations';
import { VAT_RATE } from '../../data/billing';
import { kubicuRateByPlan, PROVIDER_CAP_NGN, PROVIDER_FLAT_NGN, PROVIDER_FLAT_WAIVED_UNDER_NGN, PROVIDER_RATE } from '../../utils/commerce/money';
import { planOrder, plans } from '../../data/plans';
import { useAdminStore } from '../../utils/admin/store';
import { formatNgn } from '../../utils/format';
import { currencies } from '../../utils/currency';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card } from '../../components/ui/layout/Card';
import { Badge } from '../../components/ui/Badge';
import { PhraseReviewCard } from '../../components/admin/localisation/PhraseReviewCard';
import { PolicyReleasesCard } from '../../components/admin/localisation/PolicyReleasesCard';

const pct = (n: number) => `${(n * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;

/** Account language codes → translation dictionaries. */
const dictFor = (code: string): Exclude<UiLang, 'en'> | null => (code === 'pcm' || code === 'yo' || code === 'ha' || code === 'ig' || code === 'sw' || code === 'tw' || code === 'zu' ? code : null);

/**
 * Super admin → Localisation & policies (D130, editing D135): language readiness and native review,
 * regional formats, fees and tax, and publishing policy versions.
 */
export function AdminLocalisation() {
  const [store] = useAdminStore();
  const regional = [
    ['Currencies a workspace can sell in', currencies.map((c) => c.code).join(', ')],
    ['Naira-only', 'USSD, pay on delivery, instalments, Nigerian payouts'],
    ['KUBICU plan prices', 'Always naira'],
    ['Default time zone', 'West Africa Time (Africa/Lagos)'],
    ['Countries a workspace can sell from', 'Nigeria, Kenya, Ghana, South Africa (sets currency, phone code, regions, banks, checkout)'],
    ['Phone numbers', '+234, +254, +233, +27 — local 0 accepted and converted'],
    ['Default date format', dateFormatOptions[0].label],
    ['Other date formats', dateFormatOptions.slice(1).map((d) => d.label.split(' —')[0]).join(', ')],
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader title="Localisation & policies" description="How ready each language is and the native-speaker review queue, regional formats, fees, and the policy versions customers agree to." />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
        <Card id="languages" title="Languages" description="A language is ready for launch once every phrase is approved or corrected by a native speaker." body="flush">
          <ul className="divide-y divide-line">
            {languageOptions.map((l) => {
              const dict = dictFor(l.value);
              const total = dict ? Object.keys(translations[dict]).length : 0;
              const reviewed = dict ? Object.keys(translations[dict]).filter((en) => store.phraseReviews[`${dict}::${en}`]).length : 0;
              return (
                <li key={l.value} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-6">
                  <span className="min-w-0">
                    <span className="block text-label font-medium text-fg">
                      {l.label} <span className="font-normal text-fg-subtle">· {l.value}</span>
                    </span>
                    {dict && (
                      <span className="mt-1.5 flex items-center gap-2">
                        <span className="h-1.5 w-28 overflow-hidden rounded-full bg-sunken" aria-hidden>
                          <span className="block h-full rounded-full bg-success" style={{ width: `${total ? (reviewed / total) * 100 : 0}%` }} />
                        </span>
                        <span className="text-caption tabular-nums text-fg-subtle">
                          {reviewed.toLocaleString()} of {total.toLocaleString()} reviewed
                        </span>
                      </span>
                    )}
                  </span>
                  {l.ready ? (
                    <Badge tone="success" dot>
                      Ready
                    </Badge>
                  ) : dict && reviewed === total && total > 0 ? (
                    <Badge tone="success" dot>
                      Reviewed
                    </Badge>
                  ) : l.draft ? (
                    <Badge tone="warning">Draft · needs native review</Badge>
                  ) : (
                    <Badge tone="neutral">Coming</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="flex min-w-0 flex-col gap-8">
          <Card id="regional" title="Regional formats">
            <dl className="divide-y divide-line">
              {regional.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                  <dt className="text-label text-fg-muted">{k}</dt>
                  <dd className="text-right text-label font-medium text-fg">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card id="fees" title="Fees and tax" description="KUBICU’s fee is confirmed (D105). The payment provider’s fee is an example until a partner is chosen." body="flush">
            <div className="px-5 pb-2 pt-4 md:px-6">
              <p className="text-caption font-semibold text-fg-subtle">KUBICU fee on sales, by plan</p>
              <ul className="mt-2 grid grid-cols-3 gap-x-4 gap-y-2 sm:grid-cols-6">
                {planOrder.map((p) => (
                  <li key={p}>
                    <span className="block text-caption text-fg-subtle">{plans[p].name}</span>
                    <span className="block text-label font-semibold tabular-nums text-fg">{pct(kubicuRateByPlan[p])}</span>
                  </li>
                ))}
              </ul>
            </div>
            <dl className="mt-2 divide-y divide-line border-t border-line">
              {[
                ['Payment provider (example)', `${pct(PROVIDER_RATE)} + ${formatNgn(PROVIDER_FLAT_NGN)}, capped at ${formatNgn(PROVIDER_CAP_NGN)}; no flat fee under ${formatNgn(PROVIDER_FLAT_WAIVED_UNDER_NGN)}`],
                ['VAT on KUBICU plan invoices', pct(VAT_RATE)],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 px-5 py-3 sm:flex-row sm:justify-between sm:gap-6 md:px-6">
                  <dt className="text-label text-fg-muted">{k}</dt>
                  <dd className="text-label font-medium text-fg sm:text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <PhraseReviewCard />
        <PolicyReleasesCard />
      </div>
    </div>
  );
}
