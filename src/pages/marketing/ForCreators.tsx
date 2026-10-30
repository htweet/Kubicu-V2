import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, InfoIcon, SparklesIcon } from 'lucide-react';
import { PillarHero } from '../../components/marketing/PillarHero';
import { ExamplePhone } from '../../components/marketing/ExamplePhone';
import { ExampleDesktop } from '../../components/marketing/ExampleDesktop';
import { SectionHeading } from '../../components/marketing/SectionHeading';
import { FaqList } from '../../components/marketing/FaqList';
import { PillarCrossLinks } from '../../components/marketing/PillarCrossLinks';
import { ClosingCta } from '../../components/marketing/home/ClosingCta';
import { CreatorTypePicker } from '../../components/marketing/creators/CreatorTypePicker';
import { solutionById, solutionToneColours } from '../../data/solutions';
import { creatorCopilotChat, creatorFaqs, creatorGoodToKnow, creatorPath } from '../../data/creatorsPage';
import { findExampleById } from '../../data/examples';
import { useT } from '../../contexts/LocaleContext';
import { cn } from '../../utils/cn';

/** /for/creators — the dedicated creators page (D273). Shares its hero image and tone with data/solutions.ts. Translated in D323. */
export function ForCreators() {
  const { t: tr } = useT();
  const s = solutionById.creators;
  const tone = solutionToneColours[s.tone];
  const signature = findExampleById('elite-signature-creator');
  const mediaKit = findExampleById('elite-media-kit');

  return (
    <>
      <PillarHero
        id="cr-hero"
        crumb={[{ label: 'Solutions' }, { label: s.label }]}
        title="One page for everything you make."
        lead="Your links, your best work, brand-deal enquiries, things you sell and a list of fans you own — on one page that looks like you, not like everyone else’s."
        bg={tone.bg}
        fg={tone.fg}
        primary={{ label: 'Create your page free', to: '/signup', bg: tone.btnBg, fg: tone.btnFg }}
        secondary={{ label: 'Start with Copilot', to: '/copilot' }}
        visual={
        <div className="relative mx-auto w-full max-w-[460px] pb-10 pl-10 sm:pl-16">
            <img src={s.image} alt={tr(s.imageAlt)} className="aspect-[4/5] w-full rounded-[36px] object-cover shadow-3" />
            {signature &&
          <div className="absolute bottom-0 left-0">
                <ExamplePhone doc={signature.doc} width={150} />
              </div>
          }
          </div>
        } />
      

      {/* Creator types */}
      <section aria-labelledby="cr-types" className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <SectionHeading id="cr-types" title={tr('Made for the way you create')} lead={tr('Pick what you do. Each starts from a template built around it — what it leads with is the decision that matters.')} />
        <CreatorTypePicker />
      </section>

      {/* Path from a page to getting paid */}
      <section aria-labelledby="cr-path" className="bg-[rgb(246_243_236)]">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <SectionHeading id="cr-path" title={tr('Start simple. Grow into selling.')} lead={tr('Nobody needs a shop on day one. Each step is there when you’re ready for it — and says plainly what it needs.')} />
          <ol className="mt-12 grid gap-0 md:grid-cols-4 md:gap-6">
            {creatorPath.map((p, i) => {
              const free = p.needs === 'Free';
              return (
                <li key={p.title} className="relative flex gap-5 pb-10 last:pb-0 md:flex-col md:gap-0 md:pb-0">
                  {/* Connector: vertical on phones, horizontal on wide screens. */}
                  {i < creatorPath.length - 1 &&
                  <>
                      <span aria-hidden className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-px bg-[rgb(214_207_190)] md:hidden" />
                      <span aria-hidden className="absolute left-12 right-[-1.5rem] top-5 hidden h-px bg-[rgb(214_207_190)] md:block" />
                    </>
                  }
                  <span className={cn('relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold', free ? 'bg-white text-fg ring-1 ring-[rgb(214_207_190)]' : 'bg-[rgb(20_20_18)] text-white')}>{i + 1}</span>
                  <div className="min-w-0 md:mt-6">
                    <h3 className="text-[20px] font-extrabold leading-tight text-fg">{tr(p.title)}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">{tr(p.text)}</p>
                    <p className={cn('mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold', free ? 'text-[rgb(var(--kb-forest))]' : 'text-fg')}>
                      {free && <CheckIcon size={14} aria-hidden />}
                      {tr(p.needs)}
                    </p>
                    <Link to={p.to} className="mt-2 flex items-center gap-1.5 text-[14px] font-bold text-fg underline-offset-4 hover:underline">
                      {tr(p.linkLabel)} <ArrowRightIcon size={14} aria-hidden />
                    </Link>
                  </div>
                </li>);

            })}
          </ol>
        </div>
      </section>

      {/* Media kit and collaborations */}
      <section aria-labelledby="cr-deals" style={{ backgroundColor: tone.bg, color: tone.fg }}>
        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          {mediaKit &&
          <Link to={`/templates/${mediaKit.id}`} aria-label={tr('See the template: {name}', { name: mediaKit.name })} className="group order-2 mx-auto rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current lg:order-1">
              <ExamplePhone doc={mediaKit.doc} width={250} className="transition-transform duration-200 ease-out group-hover:-translate-y-1" />
            </Link>
          }
          <div className="order-1 lg:order-2">
            <h2 id="cr-deals" className="kb-display text-[38px] leading-[1.02] md:text-[56px]">
              {tr('Brand deals, without the back-and-forth.')}
            </h2>
            <div className="mt-10 grid gap-10 sm:grid-cols-2">
              <div>
                <h3 className="text-[20px] font-extrabold">{tr('Media kit')}</h3>
                <p className="mt-2 text-[15px] leading-relaxed opacity-90">
                  {tr('Your niche, audience, past collaborations, the formats you offer and rates if you want them shown — with an enquiry form brands fill in properly, instead of a DM.')}
                </p>
                <Link to={mediaKit ? `/templates/${mediaKit.id}` : '/templates'} className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold underline-offset-4 hover:underline">
                  {tr('See the media kit template')} <ArrowRightIcon size={14} aria-hidden />
                </Link>
              </div>
              <div>
                <h3 className="text-[20px] font-extrabold">{tr('Collaborations')}</h3>
                <p className="mt-2 text-[15px] leading-relaxed opacity-90">
                  {tr('Let other creators promote what you sell for a commission you set. Each partner gets their own link, and you see the orders it brought.')}
                </p>
                <Link to="/features#commerce" className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold underline-offset-4 hover:underline">
                  {tr('How selling works')} <ArrowRightIcon size={14} aria-hidden />
                </Link>
              </div>
            </div>
            <p className="mt-10 flex gap-2.5 border-t border-current pt-6 text-[14px] font-medium leading-relaxed opacity-90">
              <InfoIcon size={17} aria-hidden className="mt-0.5 shrink-0" />
              {tr('Follower counts and engagement on a media kit are the numbers you type. KUBICU never fills them in for you, and asks you to confirm them before publishing.')}
            </p>
          </div>
        </div>
      </section>

      {/* Phone and computer */}
      {signature &&
      <section aria-labelledby="cr-devices" className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <SectionHeading
          id="cr-devices"
          title={tr('Built for the phone. Good on a laptop too.')}
          lead={tr('Most people will tap your link from an app. Brands and promoters often open it on a computer. The same page rearranges itself for both — you don’t design it twice.')} />
        
          <div className="relative mt-12 flex justify-center">
            <div className="hidden lg:block">
              <ExampleDesktop doc={signature.doc} width={860} height={500} address="kub.icu/temi" />
            </div>
            <div className="hidden sm:block lg:hidden">
              <ExampleDesktop doc={signature.doc} width={600} height={360} address="kub.icu/temi" />
            </div>
            <div className="sm:hidden">
              <ExampleDesktop doc={signature.doc} width={330} height={210} address="kub.icu/temi" />
            </div>
            <div className="absolute -bottom-8 right-0 sm:right-4 lg:right-[max(0px,calc(50%-500px))]">
              <ExamplePhone doc={signature.doc} width={170} />
            </div>
          </div>
          <p className="mt-16 text-center text-[14px] text-fg-muted">
            {tr('{name} — on a computer, and on a phone.', { name: signature.name })}{' '}
            <Link to={`/templates/${signature.id}`} className="font-bold text-fg underline-offset-4 hover:underline">
              {tr('Open the template')}
            </Link>
          </p>
        </section>
      }

      {/* Copilot */}
      <section aria-labelledby="cr-copilot" className="bg-[rgb(var(--kb-forest))] text-[rgb(var(--kb-lime))]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="inline-flex items-center gap-2 text-[14px] font-bold">
              <SparklesIcon size={16} aria-hidden /> KUBICU Copilot
            </p>
            <h2 id="cr-copilot" className="kb-display mt-4 text-[38px] leading-[1.02] md:text-[56px]">
              {tr('Not sure where to start? Just describe yourself.')}
            </h2>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed opacity-90">
              {tr('Copilot asks a few questions — what you make, who it’s for, what visitors should do first — and builds a draft from KUBICU’s templates. You edit everything, and nothing goes live until you publish.')}
            </p>
            <Link
              to="/copilot"
              className="mt-8 inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-[rgb(var(--kb-lime))] px-6 text-[15px] font-bold text-[rgb(var(--kb-forest))] transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--kb-forest))]">
              
              {tr('Start with Copilot')} <ArrowRightIcon size={16} aria-hidden />
            </Link>
          </div>
          <figure className="rounded-[32px] bg-[rgb(255_255_255/0.06)] p-5 ring-1 ring-[rgb(255_255_255/0.12)] md:p-8">
            <ol className="flex flex-col gap-3" aria-label={tr('Example conversation')}>
              {creatorCopilotChat.map((m, i) =>
              <li key={i} className={cn('flex', m.from === 'you' ? 'justify-end' : 'justify-start')}>
                  <p
                  className={cn(
                    'max-w-[85%] rounded-[20px] px-4 py-3 text-[15px] leading-snug',
                    m.from === 'you' ? 'rounded-br-md bg-[rgb(var(--kb-lime))] text-[rgb(var(--kb-forest))]' : 'rounded-bl-md bg-white text-[rgb(20_20_18)]'
                  )}>
                  
                    <span className="sr-only">{m.from === 'you' ? `${tr('You')}: ` : 'Copilot: '}</span>
                    {tr(m.text)}
                  </p>
                </li>
              )}
            </ol>
            <figcaption className="mt-5 text-[13px] opacity-75">{tr('An example conversation, shortened.')}</figcaption>
          </figure>
        </div>
      </section>

      <section aria-labelledby="cr-know" className="mx-auto w-full max-w-4xl px-5 py-20 md:px-8">
        <h2 id="cr-know" className="text-[22px] font-extrabold text-fg">
          {tr('Good to know')}
        </h2>
        <ul className="mt-4 flex flex-col gap-3">
          {creatorGoodToKnow.map((g) =>
          <li key={g} className="flex gap-2.5 text-[15px] leading-relaxed text-fg-muted">
              <InfoIcon size={17} aria-hidden className="mt-1 shrink-0 text-fg-subtle" /> {tr(g)}
            </li>
          )}
        </ul>
        <div className="mt-12">
          <FaqList items={creatorFaqs} />
        </div>
      </section>

      <PillarCrossLinks current="creators" />
      <ClosingCta />
    </>);

}