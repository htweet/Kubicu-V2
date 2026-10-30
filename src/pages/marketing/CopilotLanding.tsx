import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, CheckCheckIcon, GlobeIcon, InfoIcon, MessageCircleIcon, ShieldCheckIcon } from 'lucide-react';
import { RiseText } from '../../components/marketing/home/RiseText';
import { KbShape } from '../../components/marketing/home/KbShape';
import { BackButton } from '../../components/shell/BackButton';
import { Reveal } from '../../components/marketing/Reveal';
import { TemplateThumb } from '../../components/templates/TemplateThumb';
import { findExampleById } from '../../data/examples';
import { useCopilotSim } from '../../contexts/CopilotSimContext';
import { useT } from '../../contexts/LocaleContext';
import { DRAFT_DAYS } from '../../utils/copilot/store';

const kitchen = findExampleById('mama-put-kitchen')!;
const ease = [0.23, 1, 0.32, 1] as const;

/** Example starts: the label is translated; the opening message stays English because the chat itself is English for now. */
const starts = [
{ label: 'A caterer in Lekki', text: 'I make small chops and party trays for events in Lekki, and people order on WhatsApp.' },
{ label: 'A wedding photographer', text: 'I’m a wedding and portrait photographer in Abuja and I want a portfolio that gets enquiries.' },
{ label: 'A hair studio', text: 'I run a braids and wig studio in Ikeja and want people to book appointments.' }];


const steps = [
{ title: 'Chat', text: 'Say what you’re creating in your own words. Copilot asks 3–6 short questions — only what it doesn’t already know.' },
{ title: 'Check the brief', text: 'See the sections, look and main action it plans to use, and what’s left for you to fill in. Nothing is made until you say so.' },
{ title: 'See your draft', text: 'A picture of your page on a phone, plus a private link to scroll through it. Ask for changes in plain words.' },
{ title: 'Continue in KUBICU', text: 'Sign up or sign in to claim the draft. It opens in the editor as a normal page — publish only when you’re ready.' }];


const promises = [
'Nothing is published until you choose to publish it inside KUBICU.',
'Prices, reviews, opening hours and policies are never made up — missing details stay clearly marked.',
'Drafts are private and not in search. Unclaimed drafts are deleted after {n} days.',
'Copilot never asks for passwords, card numbers, BVN or NIN, and never creates an account for you.',
'Free to try: 3 drafts and 10 changes a day. AI credits only start once you’re in KUBICU.'];


/** /copilot (D262): the easiest way into KUBICU — start a chat on WhatsApp (proposed) or here in the browser. Translated in D329. */
export function CopilotLanding() {
  const { t: tr } = useT();
  const { whatsapp } = useCopilotSim();
  const reduce = useReducedMotion();
  const pop = (delay: number) => reduce ? {} : { initial: { opacity: 0, y: 10, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.28, delay, ease } };

  return (
    <>
      <section aria-labelledby="copilot-heading" className="relative -mt-[88px] overflow-hidden bg-[rgb(var(--kb-cobalt))] pt-[88px] text-white">
        <KbShape kind="kube" color="rgb(var(--kb-lime))" size={88} motion="spin" className="absolute right-[4%] top-28 hidden lg:block" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-10 md:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pt-16">
          <div className="max-w-2xl">
            <BackButton fallback="/" className="-ml-2.5 mb-6 text-white/85 hover:bg-white/10 hover:text-white focus-visible:ring-white" />
            <p className="text-label font-bold text-white/80">KUBICU Copilot</p>
            <h1 id="copilot-heading" className="kb-display mt-3 text-[48px] leading-[0.95] sm:text-[68px] lg:text-[80px]">
              <RiseText text={tr('Tell KUBICU what you want to build.')} />
            </h1>
            <p className="mt-6 max-w-lg text-[18px] font-medium leading-relaxed text-white/90">
              {tr('Describe your business or idea in a chat. See what your page could look like, then continue into KUBICU when you’re ready — no templates or design words needed.')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/copilot/chat" className="inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-7 text-[16px] font-bold text-[rgb(20_20_18)] transition-transform duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--kb-cobalt))]">
                <GlobeIcon size={18} aria-hidden /> {tr('Chat here in your browser')}
              </Link>
              {whatsapp === 'available' &&
              <Link to="/copilot/whatsapp" className="inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-white/70 px-7 text-[16px] font-bold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-white/10 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  <MessageCircleIcon size={18} aria-hidden /> {tr('Try it on WhatsApp')}
                </Link>
              }
            </div>
            {whatsapp === 'available' ?
            <p className="mt-4 flex items-start gap-2 text-caption text-white/80">
                <InfoIcon size={14} className="mt-0.5 shrink-0" aria-hidden />
                {tr('WhatsApp is a proposed channel, shown here as a simulation. The browser chat asks the same questions and makes the same draft.')}
              </p> :

            <p role="status" className="mt-4 max-w-lg rounded-2xl bg-white/10 px-4 py-3 text-label text-white">
                {tr('Copilot on WhatsApp isn’t available where you are yet. The browser chat is the same conversation and works on any phone.')}
              </p>
            }
            <p className="mt-4 text-caption text-white/75">{tr('Copilot understands typed answers in English for now — tapping its buttons works in any language.')}</p>
            <div className="mt-8">
              <p className="text-caption font-semibold text-white/80">{tr('Or start with an example')}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {starts.map((s) =>
                <li key={s.label}>
                    <Link to={`/copilot/chat?start=${encodeURIComponent(s.text)}`} className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/15 px-4 text-label font-semibold text-white transition-colors duration-150 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                      {tr(s.label)} <ArrowRightIcon size={14} aria-hidden />
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <figure className="relative mx-auto w-full max-w-[360px]" aria-label={tr('An example Copilot conversation on a phone')}>
            {/* Phone mock (D272): bezel, status bar, chat header, thread, composer. */}
            <div className="rounded-[52px] bg-[rgb(18_18_20)] p-[11px] shadow-3 ring-1 ring-white/15">
              <div className="relative flex h-[640px] flex-col overflow-hidden rounded-[42px] bg-[rgb(236_229_221)] text-[rgb(20_20_18)]">
                <div aria-hidden className="absolute left-1/2 top-2.5 z-10 h-[26px] w-[96px] -translate-x-1/2 rounded-full bg-[rgb(18_18_20)]" />
                <div aria-hidden className="flex h-11 shrink-0 items-end justify-between bg-[rgb(0_92_75)] px-7 pb-1 text-[12px] font-semibold text-white">
                  <span>09:41</span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-4 rounded-[3px] border border-white/90" />
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2.5 bg-[rgb(0_92_75)] px-4 pb-3 pt-1 text-white">
                  <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[13px] font-extrabold text-[rgb(var(--kb-cobalt))]">
                    K
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold leading-tight">KUBICU Copilot</span>
                    <span className="block text-[11px] text-white/80">{tr('AI agent · business account')}</span>
                  </span>
                </div>
                <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden p-3.5">
                  <motion.p {...pop(0.2)} className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-[rgb(217_253_211)] px-3.5 py-2 text-[14px]">
                    {tr('I make small chops and party trays in Lekki. People order on WhatsApp.')}
                  </motion.p>
                  <motion.p {...pop(0.45)} className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2 text-[14px]">
                    {tr('Lovely. What name should visitors see at the top?')}
                  </motion.p>
                  <motion.p {...pop(0.7)} className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-[rgb(217_253_211)] px-3.5 py-2 text-[14px]">
                    Tolu’s Kitchen
                  </motion.p>
                  <motion.div {...pop(0.95)} className="flex max-w-[85%] flex-col gap-2 rounded-2xl rounded-bl-md bg-white p-2">
                    <div className="overflow-hidden rounded-xl">
                      <TemplateThumb doc={kitchen.doc} width={230} height={230} />
                    </div>
                    <p className="px-1.5 text-[14px]">{tr('Your draft is ready. It’s not published — only people you share the link with can see it.')}</p>
                    <p className="flex items-center justify-end gap-1 px-1.5 text-[11px] text-[rgb(104_100_92)]">
                      09:41 <CheckCheckIcon size={14} className="text-[rgb(83_189_235)]" aria-hidden />
                    </p>
                  </motion.div>
                </div>
                <div aria-hidden className="flex shrink-0 items-center gap-2 px-2.5 pb-6 pt-1">
                  <span className="flex h-10 flex-1 items-center rounded-full bg-white px-4 text-[14px] text-[rgb(104_100_92)]">{tr('Message')}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(0_168_132)] text-white">
                    <MessageCircleIcon size={17} />
                  </span>
                </div>
                <div aria-hidden className="absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-[rgb(20_20_18)]/70" />
              </div>
            </div>
            <figcaption className="mt-3 text-center text-caption text-white/80">{tr('Example conversation · fictional business')}</figcaption>
          </figure>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <h2 id="how-heading" className="kb-display max-w-2xl text-[40px] leading-[1] text-fg md:text-[56px]">
          {tr('From an idea to a page you can edit.')}
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((s, i) =>
          <li key={s.title} className="border-t-2 border-fg pt-5">
              <Reveal delay={i * 0.05}>
                <span className="kb-display block text-[40px] leading-none text-fg">{i + 1}</span>
                <h3 className="mt-4 text-[20px] font-bold text-fg">{tr(s.title)}</h3>
                <p className="mt-2 text-body text-fg-muted">{tr(s.text)}</p>
              </Reveal>
            </li>
          )}
        </ol>
      </section>

      <section aria-labelledby="honest-heading" className="bg-[rgb(var(--kb-forest))] text-[rgb(var(--kb-lime))]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:py-24">
          <h2 id="honest-heading" className="kb-display text-[40px] leading-[1] md:text-[56px]">
            {tr('Your draft, your call.')}
          </h2>
          <ul className="flex flex-col gap-5 text-[17px] font-medium text-white">
            {promises.map((t) =>
            <li key={t} className="flex gap-3">
                <ShieldCheckIcon size={20} className="mt-0.5 shrink-0 text-[rgb(var(--kb-lime))]" aria-hidden />
                {tr(t, { n: DRAFT_DAYS })}
              </li>
            )}
            <li>
              <Link to="/about/copilot" className="inline-flex items-center gap-1.5 font-bold text-[rgb(var(--kb-lime))] underline-offset-4 hover:underline">
                {tr('Read the Copilot privacy notice')} <ArrowRightIcon size={16} aria-hidden />
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>);

}