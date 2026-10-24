import React from 'react';
import { Link } from 'react-router-dom';
import { FlagIcon, MailIcon, ShieldIcon } from 'lucide-react';
import { InfoHero } from '../../components/legal/InfoHero';
import { FormRunner, type RunnerSubmit } from '../../components/forms/FormRunner';
import { appSkin } from '../../components/forms/formSkin';
import { contactFormDef, contactTopics } from '../../data/contactForm';
import { updateAdminStore } from '../../utils/admin/store';
import { uid } from '../../utils/id';

const channels = [
{ icon: MailIcon, title: 'Email', text: 'hello@kub.icu — we reply within 1 working day.' },
{ icon: ShieldIcon, title: 'Privacy', text: 'privacy@kub.icu for data requests under the NDPA.' },
{ icon: FlagIcon, title: 'A page you’ve seen', text: 'Use Report a page so our moderation team sees it.', to: '/about/report' }];


const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(', ') : v ?? '').trim();

/** Website contact page (D125): the Forms engine, feeding the staff support queue. */
export function Contact() {
  const submit = ({ answers }: RunnerSubmit) => {
    const name = str(answers.name);
    const topicLabel = str(answers.topic);
    const topic = contactTopics.find((t) => t.label === topicLabel)?.topic ?? 'other';
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
        subject: `${topicLabel} — from the website`,
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
            <FormRunner form={contactFormDef} skin={appSkin} mode="live" headingLevel="h2" onSubmit={submit} />
          </div>
        </div>

        <aside aria-labelledby="channels-h">
          <h2 id="channels-h" className="text-heading font-semibold text-fg">
            Other ways to reach us
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {channels.map((c) =>
            <li key={c.title} className="flex gap-4 py-5">
                <c.icon size={20} strokeWidth={2.2} className="mt-0.5 shrink-0 text-[rgb(var(--nm-1))]" aria-hidden />
                <div>
                  <h3 className="text-label font-semibold text-fg">{c.title}</h3>
                  <p className="mt-1 text-label text-fg-muted">
                    {c.text}{' '}
                    {c.to &&
                  <Link to={c.to} className="font-semibold text-fg underline">
                        Report a page
                      </Link>
                  }
                  </p>
                </div>
              </li>
            )}
          </ul>
          <p className="mt-6 text-caption text-fg-subtle">KUBICU · Lagos, Nigeria. Office hours Monday–Friday, 9am–6pm WAT. Messages land in our support queue — you’ll get a reference by email.</p>
        </aside>
      </div>
    </>);

}