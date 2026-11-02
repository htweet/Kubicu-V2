import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, FlaskConicalIcon, GlobeIcon, RotateCcwIcon } from 'lucide-react';
import type { CopilotReply } from '../../types/copilot';
import { PlatformLook } from '../../components/marketing/PlatformLook';
import { KubicuLogo } from '../../components/shell/KubicuLogo';
import { WaThread } from '../../components/copilot/whatsapp/WaThread';
import { WaComposer } from '../../components/copilot/whatsapp/WaComposer';
import { WaListSheet } from '../../components/copilot/whatsapp/WaListSheet';
import { wa, MAX_BUTTONS, MAX_LIST_ROWS } from '../../components/copilot/whatsapp/waStyle';
import { useCopilot } from '../../hooks/useCopilot';
import { useCopilotSim } from '../../contexts/CopilotSimContext';
import { useT } from '../../contexts/LocaleContext';
import { previewPath } from '../../utils/copilot/links';
import { CHANGES_PER_DAY, DRAFTS_PER_DAY } from '../../utils/copilot/store';
import { startClaim } from '../../utils/copilot/claim';

/** The number this simulated chat "comes from". Only used for daily limits — never to create an account. */
const SAMPLE_CHAT_PHONE = '+2348035550142';
const SAMPLE_CHAT_PHONE_SHOWN = '+234 803 555 0142';

/** /copilot/whatsapp (D263): Copilot as a proposed WhatsApp agent, simulated inside a phone. D519: follows the chosen language. */
export function CopilotWhatsApp() {
  const sim = useCopilotSim();
  const { t: tr } = useT();

  useEffect(() => {
    document.title = tr('KUBICU Copilot on WhatsApp (proposed)');
  }, [tr]);

  if (sim.whatsapp === 'unavailable') return <ChannelUnavailable />;
  return <WhatsAppChannel />;
}

function WhatsAppChannel() {
  const sim = useCopilotSim();
  const { t: tr } = useT();
  const { session, send, retry, restart, addPhotos, limits } = useCopilot('whatsapp', SAMPLE_CHAT_PHONE);
  const [sheet, setSheet] = useState<{title: string;rows: CopilotReply[];} | null>(null);
  const [retried, setRetried] = useState<Set<string>>(new Set());
  const [confirmRestart, setConfirmRestart] = useState(false);

  const failedPictures = useMemo(() => {
    if (sim.failure !== 'previewImage') return new Set<string>();
    return new Set(session.messages.filter((m) => m.card === 'preview' && !retried.has(m.id)).map((m) => m.id));
  }, [sim.failure, session.messages, retried]);

  const onReply = (r: CopilotReply) => {
    setSheet(null);
    if (r.value === 'create') return send({ kind: 'create' });
    if (r.value === 'change') return send({ kind: 'change' });
    if (r.value === 'more') return send({ kind: 'more' });
    if (r.value === 'retry') return retry();
    if (r.value === '__skip') return send({ kind: 'skip' });
    if (r.value === '__picture') {
      const last = [...session.messages].reverse().find((m) => m.card === 'preview');
      if (last) setRetried((s) => new Set(s).add(last.id));
      return undefined;
    }
    if (r.value === 'open') {
      if (session.draftId) window.open(previewPath(session.draftId), '_blank', 'noopener');
      return undefined;
    }
    // In WhatsApp the button opens a one-time continue link in the phone's browser.
    if (r.value === 'continue') {
      if (session.draftId && startClaim(session.draftId)) window.open('/copilot/continue', '_blank', 'noopener');
      return undefined;
    }
    return send({ kind: 'choice', value: r.value, label: r.label });
  };

  const chat =
  <div className="relative flex h-full min-h-0 flex-col overflow-hidden" style={{ background: wa.wall, color: wa.text }}>
      <header className="flex h-14 shrink-0 items-center gap-2 px-2 text-white" style={{ background: wa.header }}>
        <Link to="/copilot" aria-label={tr('Leave the chat')} className="flex h-10 w-9 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <ArrowLeftIcon size={20} aria-hidden />
        </Link>
        <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[15px] font-black" style={{ color: wa.header }}>
          K
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold leading-tight">KUBICU Copilot</p>
          <p className="truncate text-[12.5px] leading-tight text-white/85" aria-live="polite">
            {session.stage === 'generating' ? tr('typing…') : tr('AI agent · business account')}
          </p>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <WaThread session={session} failedPictures={failedPictures} onReply={onReply} onOpenList={(title, rows) => setSheet({ title, rows })} />
      </div>
      <WaComposer question={session.question} stage={session.stage} onText={(text) => send({ kind: 'text', text })} onPhotos={addPhotos} />
      <AnimatePresence>{sheet && <WaListSheet title={sheet.title} rows={sheet.rows} onPick={onReply} onClose={() => setSheet(null)} />}</AnimatePresence>
    </div>;


  return (
    <PlatformLook night>
      {/* Phones: the chat fills the screen under a slim "simulated" strip. */}
      <div className="flex h-[100dvh] flex-col lg:hidden">
        <p className="flex shrink-0 flex-wrap items-center justify-center gap-x-1.5 bg-canvas px-3 py-1.5 text-center text-caption text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <FlaskConicalIcon size={12} aria-hidden /> {tr('Simulated WhatsApp · proposed channel')} ·
          </span>
          <Link to="/copilot/chat" className="whitespace-nowrap font-semibold text-fg underline-offset-2 hover:underline">
            {tr('Use the browser chat')}
          </Link>
        </p>
        <div className="min-h-0 flex-1">{chat}</div>
      </div>

      {/* Desktop: the phone beside a short explanation of what's real. */}
      <div className="hidden min-h-[100dvh] w-full bg-canvas lg:block">
        <div className="mx-auto grid min-h-[100dvh] w-full max-w-6xl grid-cols-[minmax(0,1fr)_400px] items-center gap-16 px-8 py-10">
          <div className="max-w-md">
            <Link to="/copilot" aria-label={tr('KUBICU Copilot home')} className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              <KubicuLogo />
            </Link>
            <p className="mt-10 inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-caption font-semibold text-fg">
              <FlaskConicalIcon size={12} aria-hidden /> {tr('Proposed channel · simulated')}
            </p>
            <h1 className="mt-4 text-[34px] font-bold leading-tight text-fg">{tr('Copilot on WhatsApp')}</h1>
            <p className="mt-3 text-body text-fg-muted">{tr('The same conversation as the browser chat, shaped to what WhatsApp allows — so this is how it would really feel.')}</p>
            <ul className="mt-6 flex flex-col gap-2.5 text-label text-fg-muted">
              <li>• {tr('Up to {buttons} reply buttons per message; longer choices open a list of up to {rows}.', { buttons: MAX_BUTTONS, rows: MAX_LIST_ROWS })}</li>
              <li>• {tr('Photos are sent as attachments. The draft comes back as a picture plus a private link.')}</li>
              <li>• {tr('No website runs inside the chat — the link opens the preview in the phone’s browser.')}</li>
              <li>
                • {tr('Free each day per WhatsApp number — drafts: {drafts}, changes: {changes}.', { drafts: DRAFTS_PER_DAY, changes: CHANGES_PER_DAY })}{' '}
                {tr('Left today — drafts: {drafts}, changes: {changes}.', { drafts: limits.drafts, changes: limits.changes })}
              </li>
              <li>• {tr('The chat number (a sample, {phone}) only counts the daily limit. It never creates an account.', { phone: SAMPLE_CHAT_PHONE_SHOWN })}</li>
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Link to="/copilot/chat" className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full border border-line-strong px-5 text-label font-semibold text-fg hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <GlobeIcon size={16} aria-hidden /> {tr('Use the browser chat')}
              </Link>
              {confirmRestart ?
              <span className="flex items-center gap-1.5">
                  <button type="button" onClick={() => {restart();setConfirmRestart(false);setRetried(new Set());}} className="h-11 whitespace-nowrap rounded-full bg-action px-4 text-label font-semibold text-action-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    {tr('Start a new chat')}
                  </button>
                  <button type="button" onClick={() => setConfirmRestart(false)} className="h-11 whitespace-nowrap rounded-full px-4 text-label text-fg-muted hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    {tr('Keep this one')}
                  </button>
                </span> :

              <button type="button" onClick={() => setConfirmRestart(true)} className="inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-label font-medium text-fg-muted hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <RotateCcwIcon size={15} aria-hidden /> {tr('Start over')}
                </button>
              }
            </div>
            <p className="mt-6 text-caption text-fg-subtle">{tr('Replies follow written rules, not a live AI model. Nothing is sent to WhatsApp, and everything stays in this browser.')}</p>
          </div>
          <div className="h-[780px] max-h-[calc(100dvh-80px)] overflow-hidden rounded-[44px] border-[10px] border-[rgb(24_24_22)] shadow-3">{chat}</div>
        </div>
      </div>
    </PlatformLook>);

}

function ChannelUnavailable() {
  const { t: tr } = useT();
  return (
    <PlatformLook night>
      <main className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-canvas px-5 py-16 text-center">
        <KubicuLogo />
        <h1 className="mt-10 max-w-md text-[28px] font-bold leading-tight text-fg">{tr('Copilot isn’t on WhatsApp where you are yet')}</h1>
        <p className="mt-3 max-w-md text-body text-fg-muted">{tr('The browser chat asks the same questions and makes the same draft. It works on any phone, and you can share the preview link on WhatsApp yourself.')}</p>
        <Link to="/copilot/chat" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-action px-6 text-label font-semibold text-action-fg transition-transform duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <GlobeIcon size={16} aria-hidden /> {tr('Continue in your browser')}
        </Link>
        <Link to="/copilot" className="mt-4 text-label font-medium text-fg-muted underline-offset-2 hover:underline">
          {tr('Back to Copilot')}
        </Link>
      </main>
    </PlatformLook>);

}