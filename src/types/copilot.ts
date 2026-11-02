import type { AssistantAnswers, AssistantFeel, AssistantImage } from './assistant';
import type { PageDocument } from './page';

/**
 * KUBICU Copilot (D262): signed-out, chat-first page creation. Its own conversation (separate from the
 * in-app assistant), but the page it makes is an ordinary page document built from the same starters,
 * sections and blocks (`utils/assistant/layout.ts`). Every reply comes from `utils/copilot/engine.ts`.
 */

export type CopilotChannel = 'whatsapp' | 'web';

/** What the person said they're creating, from the opening question. */
export type CopilotKind = 'business' | 'portfolio' | 'creator' | 'shop' | 'service' | 'event' | 'other';

export type CopilotStage = 'welcome' | 'asking' | 'brief' | 'generating' | 'ready' | 'failed' | 'limit';

export type CopilotTopic = 'kind' | 'about' | 'name' | 'goal' | 'look' | 'logo' | 'photos' | 'items' | 'phone' | 'city' | 'change' | 'more';

/** A reply option. WhatsApp shows up to 3 as buttons, more as a list (max 10). */
export interface CopilotReply {
  value: string;
  label: string;
  description?: string;
  /** Look replies carry the feel they lead to, so a theme preview can be shown. */
  feel?: AssistantFeel;
}

export interface CopilotQuestion {
  topic: CopilotTopic;
  text: string;
  replies: CopilotReply[];
  input: 'choice' | 'text' | 'tel' | 'images';
  placeholder?: string;
  skippable: boolean;
  /** A plain-language line under the question for people who've never made a website (D265). */
  help?: string;
  /** For photo questions: how many it takes at once (the logo question takes 1). */
  maxImages?: number;
}

export type CopilotCard = 'brief' | 'progress' | 'preview' | 'failed' | 'limit' | 'privacy' | 'looks';

export interface CopilotMessage {
  id: string;
  from: 'copilot' | 'user';
  text: string;
  card?: CopilotCard;
  images?: string[];
  /** Replies offered under this message (only the latest message's are tappable). */
  replies?: CopilotReply[];
  draftId?: string;
  tone?: 'default' | 'warning';
  /** D520: screens an answer points to ("Open Wallet" → /app/commerce/wallet). Copilot links; the person acts there. */
  links?: {label: string;to: string;}[];
  createdAt: string;
}

/** The confirmed understanding shown before anything is generated. */
export interface CopilotBrief {
  kindLabel: string;
  name: string;
  audience: string;
  goal: string;
  action: string;
  look: string;
  /** Section names in order, from the real plan. */
  sections: string[];
  /** "Template: Food & catering" or "A new layout". */
  layout: string;
  layoutReason: string;
  /** Facts that stay as editable placeholders. */
  gaps: string[];
}

export interface CopilotSession {
  id: string;
  channel: CopilotChannel;
  stage: CopilotStage;
  kind?: CopilotKind;
  answers: AssistantAnswers;
  /** Topics already asked, in order (the opening "kind" question isn't counted toward the 3–6). */
  asked: CopilotTopic[];
  question: CopilotQuestion | null;
  messages: CopilotMessage[];
  images: AssistantImage[];
  brief: CopilotBrief | null;
  /** Latest draft made from this session. */
  draftId?: string;
  /** Which generation step is showing (0–4) while generating. */
  progress: number;
  /** The simulated failure has already happened once, so a retry succeeds. */
  failedOnce?: boolean;
  /** The phone number the chat came from (WhatsApp only). Used for daily limits, never to create an account. */
  chatPhone?: string;
  createdAt: string;
  updatedAt: string;
}

/** A draft made by Copilot. Held on this device in the prototype; on a server in production. */
export interface CopilotDraft {
  id: string;
  sessionId: string;
  /** One-time code that lets the chat that made the draft claim it. Never shown in the preview or URLs to others. */
  claimCode: string;
  doc: PageDocument;
  brief: CopilotBrief;
  themeName: string;
  createdAt: string;
  expiresAt: string;
  revisions: number;
  claimed?: {workspaceId: string;spaceId?: string;pageId: string;at: string;};
}

export type CopilotInput =
{kind: 'text';text: string;} |
{kind: 'choice';value: string;label: string;} |
{kind: 'images';items: AssistantImage[];} |
{kind: 'skip';} |
{kind: 'create';} |
{kind: 'change';} |
{kind: 'more';};