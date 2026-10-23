import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2Icon, FlagIcon, MailIcon, ShieldIcon } from 'lucide-react';
import { InfoHero } from '../../components/legal/InfoHero';
import { TextInput } from '../../components/ui/TextInput';
import { TextArea } from '../../components/ui/TextArea';
import { SelectInput } from '../../components/ui/SelectInput';
import { Button } from '../../components/ui/Button';
import { isValidEmail } from '../../utils/validation';

const topics = ['A question before signing up', 'My account or billing', 'Selling and payouts', 'Partnerships', 'Press'];

const channels = [
{ icon: MailIcon, title: 'Email', text: 'hello@kub.icu — we reply within 1 working day.' },
{ icon: ShieldIcon, title: 'Privacy', text: 'privacy@kub.icu for data requests under the NDPA.' },
{ icon: FlagIcon, title: 'A page you’ve seen', text: 'Use Report a page so our moderation team sees it.', to: '/about/report' }];


export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', topic: topics[0], message: '', trap: '' });
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const errors = {
    name: form.name.trim() ? '' : 'Add your name',
    email: isValidEmail(form.email) ? '' : 'Add an email we can reply to',
    message: form.message.trim().length >= 10 ? '' : 'Tell us a little more (10 characters or more)'
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (errors.name) return nameRef.current?.focus();
    if (errors.email) return emailRef.current?.focus();
    if (errors.message) return messageRef.current?.focus();
    if (form.trap) return setSent(true); // spam trap: pretend success
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 700);
  };

  return (
    <>
      <InfoHero crumb="Company" title="Contact us" intro="Questions about KUBICU, your account or a partnership. A person reads every message." />
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 md:px-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
        <div className="nm-frame rounded-2xl">
          <div className="rounded-[15px] bg-raised p-6 md:p-8">
            {sent ?
            <div role="status" className="flex flex-col items-center gap-3 py-10 text-center">
                <CheckCircle2Icon size={36} className="text-success" aria-hidden />
                <h2 className="text-title font-semibold text-fg">Message sent</h2>
                <p className="max-w-sm text-label text-fg-muted">Thanks, {form.name.split(' ')[0]}. We’ll reply to {form.email} within 1 working day. (Prototype: nothing was actually sent.)</p>
                <Button variant="secondary" className="mt-3" onClick={() => {setSent(false);setTried(false);setForm({ name: '', email: '', topic: topics[0], message: '', trap: '' });}}>
                  Send another
                </Button>
              </div> :

            <form noValidate onSubmit={submit} className="relative flex flex-col gap-5">
                <h2 className="text-title font-semibold text-fg">Send a message</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput ref={nameRef} id="c-name" label="Your name" autoComplete="name" value={form.name} error={tried ? errors.name || undefined : undefined} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <TextInput ref={emailRef} id="c-email" label="Email" type="email" autoComplete="email" value={form.email} error={tried ? errors.email || undefined : undefined} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <SelectInput id="c-topic" label="What’s it about?" value={form.topic} options={topics.map((t) => ({ value: t, label: t }))} onChange={(v) => setForm({ ...form, topic: v })} />
                <TextArea ref={messageRef} id="c-message" label="Message" rows={5} value={form.message} error={tried ? errors.message || undefined : undefined} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                <div aria-hidden className="absolute -left-[9999px]">
                  <label>
                    Leave this empty
                    <input tabIndex={-1} autoComplete="off" value={form.trap} onChange={(e) => setForm({ ...form, trap: e.target.value })} />
                  </label>
                </div>
                <p className="text-caption text-fg-subtle">
                  We use your details only to reply. See our <Link to="/about/privacy" className="underline hover:text-fg">privacy policy</Link>.
                </p>
                <Button type="submit" variant="brand" size="lg" loading={sending} className="self-start">
                  Send message
                </Button>
              </form>
            }
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
          <p className="mt-6 text-caption text-fg-subtle">KUBICU · Lagos, Nigeria. Office hours Monday–Friday, 9am–6pm WAT.</p>
        </aside>
      </div>
    </>);

}