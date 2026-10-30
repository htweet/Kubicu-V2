import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BriefcaseIcon, FlagIcon, MailIcon, ShieldIcon } from 'lucide-react';
import { InfoHero } from '../../components/legal/InfoHero';
import { FormRunner, type RunnerSubmit } from '../../components/forms/FormRunner';
import { appSkin } from '../../components/forms/formSkin';
import { contactFormDef, contactTopics, LEGAL_TOPIC_LABEL } from '../../data/contactForm';
import { findLegalDoc } from '../../data/legal';
import { updateAdminStore } from '../../utils/admin/store';
import { uid } from '../../utils/id';
import { useT } from '../../contexts/LocaleContext';

const channels = [
{ icon: MailIcon, title: 'Email', text: '{email} — we reply within 1 working day.', email: 'hello@kub.icu' },
{ icon: ShieldIcon, title: 'Legal & privacy', text: '{email} for legal notices and data requests under the NDPA.', email: 'legal@kub.icu' },
{ icon: BriefcaseIcon, title: 'Sales', text: '{email} for Enterprise plans and partnerships.', email: 'sales@kub.icu' },
{ icon: FlagIcon, title: 'A page you’ve seen', text: 'Use Report a page so our moderation team sees it.', to: '/about/report' }];


const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(', ') : v ?? '').trim();

/**
 * Website contact page (D125): the Forms engine, feeding the staff support queue.
 * D331 translated the page; D338 translates the form too. The visitor sees topics in their language, but the ticket
 * is filed with the English topic label so staff and queue routing are unchanged. The visitor's message is kept as typed.
 */
export function Contact() {
  const { t: tr } = useT();
  // Legal pages link here with ?topic=legal&doc=<slug> so the topic is already chosen (D236).
  const [params] = useSearchParams();
  const fromLegal = params.get('topic') === 'legal';
  const aboutDoc = fromLegal ? findLegalDoc(params.get('doc') ?? '') : undefined;
  const initialAnswers = fromLegal ? { topic: tr(LEGAL_TOPIC_LABEL) } : undefined;

  // Same form, shown in the chosen language. Field ids and the show-if rule keep working because the rule value is translated with the options.
  const form = useMemo(
    () => ({
      ...contactFormDef,
      // A different id per language resets the runner cleanly if the language changes mid-form.
      id: `${contactFormDef.id}_${tr('Send a message')}`,
      name: tr(contactFormDef.name),
      fields: contactFormDef.fields.map((f) => ({
        ...f,
        label: tr(f.label),
        help: f.help ? tr(f.help) : '',
        options: f.options.map((o) => tr(o)),
        rule: f.rule ? { ...f.rule, value: tr(f.rule.value) } : null
      })),
      settings: {
        ...contactFormDef.settings,
        submitLabel: tr(contactFormDef.settings.submitLabel),
        successTitle: tr(contactFormDef.settings.successTitle),
        successText: tr(contactFormDef.settings.successText),
        privacyNote: tr(contactFormDef.settings.privacyNote)
      }
    }),
    [tr]
  );

  const submit = ({ answers }: RunnerSubmit) => {
    const name = str(answers.name);
    const shown = str(answers.topic);
    // Back to English for the staff queue.
    const match = contactTopics.find((t) => tr(t.label) === shown || t.label === shown);
    const topicLabel = match?.label ?? shown;
    const topic = match?.topic ?? 'other';
    const lines = [str(answers.message), '', `Reply to: ${str(answers.email)}${str(answers.phone) ? ` · WhatsApp ${str(answers.phone)}` : ''}`, str(answers.handle) ? `Their link: ${str(answers.handle)}` : ''].filter((l, i) => l || i === 1);
    const now = new Date().toISOString();
    return updateAdminStore((s) => ({
      ...s,
      tickets: [
      {
        id: uid('tkt'),
        number: Math.max(1000, ...s.tickets.map((t) => t.number)) + 1,
        workspaceId: 'website',
        workspaceName: str(answers.handle) || 'Website visitor',
        from: name,
        topic,
        subject: topic === 'legal' && aboutDoc ? `${topicLabel} — about ${aboutDoc.title}` : `${topicLabel} — from the website`,
        status: 'open',
        createdAt: now,
        updatedAt: now,
        messages: [{ id: uid('msg'), by: 'customer', name, text: lines.join('\n'), at: now }]
      },
      ...s.tickets]

    }));
  };

  return (
    <>
      <InfoHero crumb="Company" title="Contact us" intro="Questions about KUBICU, your account or a partnership. A person reads every message." />
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 md:px-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
        <div className="nm-frame rounded-2xl">
          <div className="rounded-[15px] bg-raised p-6 md:p-8">
            {aboutDoc &&
            <p className="mb-6 border-b border-line pb-4 text-label text-fg-muted">
                {tr('About:')}{' '}
                <Link to={`/about/${aboutDoc.slug}`} className="font-semibold text-fg underline">
                  {tr(aboutDoc.title)}
                </Link>
                . {tr('Prefer email? Write to')}{' '}
                <a href="mailto:legal@kub.icu" className="font-semibold text-fg underline">
                  legal@kub.icu
                </a>
                .
              </p>
            }
            <FormRunner form={form} skin={appSkin} mode="live" headingLevel="h2" onSubmit={submit} initialAnswers={initialAnswers} />
          </div>
        </div>

        <aside aria-labelledby="channels-h">
          <h2 id="channels-h" className="text-heading font-semibold text-fg">
            {tr('Other ways to reach us')}
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {channels.map((c) =>
            <li key={c.title} className="flex gap-4 py-5">
                <c.icon size={20} strokeWidth={2.2} className="mt-0.5 shrink-0 text-[rgb(var(--nm-1))]" aria-hidden />
                <div>
                  <h3 className="text-label font-semibold text-fg">{tr(c.title)}</h3>
                  <p className="mt-1 text-label text-fg-muted">
                    {'email' in c && c.email ? tr(c.text, { email: c.email }) : tr(c.text)}{' '}
                    {c.to &&
                  <Link to={c.to} className="font-semibold text-fg underline">
                        {tr('Report a page')}
                      </Link>
                  }
                  </p>
                </div>
              </li>
            )}
          </ul>
          <p className="mt-6 text-caption text-fg-subtle">{tr('KUBICU · Lagos, Nigeria. Office hours Monday–Friday, 9am–6pm WAT. Messages land in our support queue — you’ll get a reference by email.')}</p>
        </aside>
      </div>
    </>);

}