import React from 'react';
import { HandleClaim } from '../HandleClaim';
import { KbShape } from './KbShape';
import { RiseText } from './RiseText';
import { Reveal } from '../Reveal';
import { useT } from '../../../contexts/LocaleContext';

/** Last call: claim your link, framed by moving brand geometry (D260). The title is translated here (D318). */
export function ClosingCta({ title = 'Start with one link. Grow into a whole business.' }: { title?: string }) {
  const { t: tr } = useT();
  return (
    // data-mbar-skip: the closing call to action stays open on phones (D558).
    <section aria-labelledby="cta-heading" data-mbar-skip="" className="relative overflow-hidden bg-[rgb(var(--kb-pink))] text-[rgb(var(--kb-plum))]">
      <KbShape kind="kube" color="rgb(var(--kb-plum))" size={110} motion="spin" className="absolute -left-6 top-10 hidden md:block" />
      <KbShape kind="circle" color="rgb(var(--kb-lime))" size={150} motion="bob" className="absolute -bottom-12 right-[6%] hidden md:block" />
      <KbShape kind="arch" color="rgb(var(--kb-cobalt))" size={84} motion="sway" phase={0.6} className="absolute right-[12%] top-12 hidden lg:block" />
      <KbShape kind="diamond" color="rgb(255 255 255)" size={54} motion="float" phase={1.2} className="absolute bottom-16 left-[12%] hidden lg:block" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-5 py-24 text-center md:px-8 md:py-32">
        <h2 id="cta-heading" className="kb-display text-[44px] leading-[0.95] sm:text-[64px] lg:text-[80px]">
          <RiseText text={tr(title)} stagger={0.04} />
        </h2>
        <Reveal delay={0.2} className="mt-10 flex w-full justify-center text-left">
          <HandleClaim />
        </Reveal>
      </div>
    </section>
  );
}
