import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCheckIcon, ExternalLinkIcon, ImageOffIcon, ListIcon, ReplyIcon } from 'lucide-react';
import type { CopilotMessage, CopilotReply, CopilotSession } from '../../../types/copilot';
import { CopilotPagePicture } from '../CopilotPagePicture';
import { useT } from '../../../contexts/LocaleContext';
import { readDraft } from '../../../utils/copilot/store';
import { expiryLabel, previewDisplayUrl } from '../../../utils/copilot/links';
import { translateCopilotText } from '../../../utils/copilot/translateMessage';
import { briefText, optionsFor, timeOf, wa } from './waStyle';

interface Props {
  session: CopilotSession;
  /** Preview pictures that failed to render (simulated), by message id. */
  failedPictures: Set<string>;
  onReply: (r: CopilotReply) => void;
  onOpenList: (title: string, rows: CopilotReply[]) => void;
}

/**
 * The simulated WhatsApp conversation (D263): text, buttons, lists, images and link previews only.
 * D519: follows the chosen language like the browser chat — Copilot's messages through translateCopilotText,
 * buttons and tapped answers through the translator; anything the person typed shows exactly as written.
 */
export function WaThread({ session, failedPictures, onReply, onOpenList }: Props) {
  const { t: tr, lang } = useT();
  const end = useRef<HTMLDivElement>(null);
  const latestId = [...session.messages].reverse().find((m) => m.from === 'copilot')?.id;
  const lastBriefId = [...session.messages].reverse().find((m) => m.card === 'brief')?.id;

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [session.messages.length]);

  return (
    <ol className="flex flex-col gap-1.5 px-3 py-3" aria-label={tr('WhatsApp chat with KUBICU Copilot')} aria-live="polite">
      <li className="mx-auto list-none rounded-lg px-2.5 py-1 text-[12px] font-medium" style={{ background: 'rgb(255 255 255 / 0.9)', color: wa.meta }}>
        {tr('Today')}
      </li>
      <li className="mx-auto my-1 max-w-[92%] list-none rounded-lg px-3 py-2 text-center text-[12.5px] leading-snug" style={{ background: wa.notice, color: 'rgb(84 69 20)' }}>
        {tr('This chat is with KUBICU’s AI agent. Messages are processed by KUBICU to make your page and aren’t end-to-end encrypted like your personal chats. Never send passwords, card numbers, BVN or NIN.')}{' '}
        <Link to="/about/copilot" className="font-semibold underline underline-offset-2">
          {tr('Learn more')}
        </Link>
      </li>
      {session.messages.map((m) => {
        const isLatest = m.id === latestId;
        const { buttons, list } = optionsFor(m, session, isLatest);
        if (m.from === 'user') return <UserBubble key={m.id} m={m} />;
        if (m.card === 'preview' && m.draftId) {
          return <PreviewMessage key={m.id} m={m} pictureFailed={failedPictures.has(m.id)} buttons={buttons} onReply={onReply} />;
        }
        const said = translateCopilotText(m.text, tr, lang);
        const title = tr(m.card === 'looks' ? 'Choose a look' : 'Choose an option');
        return (
          <li key={m.id} className="flex max-w-[86%] list-none flex-col self-start">
            <div className="rounded-lg rounded-tl-none px-2.5 pb-1 pt-1.5 shadow-[0_1px_0.5px_rgb(0_0_0/0.13)]" style={{ background: wa.incoming, color: wa.text }}>
              <WaText text={m.card === 'brief' && m.id === lastBriefId ? `${said}\n\n${briefText(session, tr)}` : said} />
              {m.links?.map((l) => (
                <a key={l.to} href={l.to} target="_blank" rel="noopener" className="mt-1 flex items-center gap-1 text-[14.5px] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2" style={{ color: wa.action }}>
                  {tr(l.label)} <ExternalLinkIcon size={13} aria-hidden />
                </a>
              ))}
              {m.card === 'progress' && session.stage === 'generating' && <p className="mt-1 text-[13px]" style={{ color: wa.meta }}>{tr('This usually takes under a minute.')}</p>}
              <Meta time={m.createdAt} />
            </div>
            <ReplyButtons buttons={buttons} onReply={onReply} />
            {list.length > 0 && (
              <button
                type="button"
                onClick={() => onOpenList(title, list)}
                className="mt-0.5 flex h-10 items-center justify-center gap-2 rounded-lg text-[14.5px] font-medium shadow-[0_1px_0.5px_rgb(0_0_0/0.13)] focus-visible:outline-none focus-visible:ring-2"
                style={{ background: wa.incoming, color: wa.action }}
              >
                <ListIcon size={16} aria-hidden /> {title}
              </button>
            )}
          </li>
        );
      })}
      <div ref={end} />
    </ol>
  );
}

function UserBubble({ m }: { m: CopilotMessage }) {
  const { t: tr } = useT();
  return (
    <li className="flex max-w-[86%] list-none flex-col self-end">
      <div className="rounded-lg rounded-tr-none px-1 pb-1 pt-1 shadow-[0_1px_0.5px_rgb(0_0_0/0.13)]" style={{ background: wa.outgoing, color: wa.text }}>
        {m.images && m.images.length > 0 && (
          <div className="grid grid-cols-2 gap-1">
            {m.images.slice(0, 4).map((src, i) => (
              <img key={i} src={src} alt={tr('Photo {n} you sent', { n: i + 1 })} className="aspect-square w-[110px] rounded-md object-cover" />
            ))}
          </div>
        )}
        {m.text && (
          <div className="px-1.5 pt-0.5">
            {/* A tapped button reads in the chosen language; typed text has no entry, so it shows as written. */}
            <WaText text={tr(m.text)} />
          </div>
        )}
        <Meta time={m.createdAt} read />
      </div>
    </li>
  );
}

function PreviewMessage({ m, pictureFailed, buttons, onReply }: { m: CopilotMessage; pictureFailed: boolean; buttons: CopilotReply[]; onReply: (r: CopilotReply) => void }) {
  const { t: tr, lang } = useT();
  const draft = readDraft(m.draftId!);
  if (!draft) return null;
  const withRetry = pictureFailed && buttons.length ? [...buttons.slice(0, 2), { value: '__picture', label: 'Send picture again' }] : buttons;
  return (
    <>
      <li className="flex max-w-[86%] list-none flex-col self-start">
        <div className="overflow-hidden rounded-lg rounded-tl-none shadow-[0_1px_0.5px_rgb(0_0_0/0.13)]" style={{ background: wa.incoming, color: wa.text }}>
          {pictureFailed ? (
            <div className="flex items-center gap-2 px-2.5 pt-2 text-[13.5px]" style={{ color: wa.meta }}>
              <ImageOffIcon size={16} aria-hidden /> {tr('I couldn’t make the picture this time. Your draft is fine — the link below opens it.')}
            </div>
          ) : (
            <div className="p-1">
              <div className="overflow-hidden rounded-md">
                <CopilotPagePicture doc={draft.doc} width={236} />
              </div>
            </div>
          )}
          <div className="px-2.5 pb-1 pt-1.5">
            <WaText text={translateCopilotText(m.text, tr, lang)} />
            <Meta time={m.createdAt} />
          </div>
        </div>
        <ReplyButtons buttons={withRetry} onReply={onReply} />
      </li>
      <li className="flex max-w-[86%] list-none flex-col self-start">
        <div className="overflow-hidden rounded-lg rounded-tl-none p-1 shadow-[0_1px_0.5px_rgb(0_0_0/0.13)]" style={{ background: wa.incoming, color: wa.text }}>
          <div className="rounded-md px-2.5 py-2" style={{ background: 'rgb(245 246 246)' }}>
            <p className="text-[14px] font-semibold">{tr('{title} — draft preview', { title: draft.doc.title })}</p>
            <p className="text-[12.5px]" style={{ color: wa.meta }}>
              {tr('Not published')} · {expiryLabel(draft, Date.now(), tr)}
            </p>
            <p className="mt-0.5 text-[12px]" style={{ color: wa.meta }}>
              {previewDisplayUrl(draft.id).split('/')[0]}
            </p>
          </div>
          <div className="px-1.5 pb-1 pt-1.5">
            <button type="button" onClick={() => onReply({ value: 'open', label: 'Open preview' })} className="break-all text-left text-[14.5px] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2" style={{ color: wa.action }}>
              https://{previewDisplayUrl(draft.id)}
            </button>
            <Meta time={m.createdAt} />
          </div>
        </div>
      </li>
    </>
  );
}

function ReplyButtons({ buttons, onReply }: { buttons: CopilotReply[]; onReply: (r: CopilotReply) => void }) {
  const { t: tr } = useT();
  if (!buttons.length) return null;
  return (
    <div className="mt-0.5 flex flex-col gap-0.5">
      {buttons.map((b) => (
        <button
          key={b.value}
          type="button"
          onClick={() => onReply(b)}
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-[14.5px] font-medium shadow-[0_1px_0.5px_rgb(0_0_0/0.13)] transition-colors duration-150 hover:bg-[rgb(250_250_250)] focus-visible:outline-none focus-visible:ring-2"
          style={{ background: wa.incoming, color: wa.action }}
        >
          {b.value === 'open' ? <ExternalLinkIcon size={15} aria-hidden /> : <ReplyIcon size={15} aria-hidden />}
          <span className="truncate">{tr(b.label)}</span>
        </button>
      ))}
    </div>
  );
}

function Meta({ time, read }: { time: string; read?: boolean }) {
  const { t: tr } = useT();
  return (
    <span className="float-right ml-3 mt-1 flex translate-y-0.5 items-center gap-1 text-[11px]" style={{ color: wa.meta }}>
      {timeOf(time)}
      {read && <CheckCheckIcon size={14} aria-label={tr('Read')} style={{ color: 'rgb(83 189 235)' }} />}
    </span>
  );
}

/** WhatsApp formatting: *bold* and _italic_. */
function WaText({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-line text-[14.5px] leading-[1.4]">
      {text.split(/(\*[^*\n]+\*|_[^_\n]+_)/g).map((part, i) => {
        if (/^\*[^*]+\*$/.test(part)) return <strong key={i}>{part.slice(1, -1)}</strong>;
        if (/^_[^_]+_$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>;
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </p>
  );
}
