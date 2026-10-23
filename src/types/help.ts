export type HelpIcon =
'rocket' |
'layout' |
'blocks' |
'palette' |
'globe' |
'bag' |
'wallet' |
'shield' |
'ticket' |
'calendar' |
'repeat' |
'users' |
'chart' |
'zap' |
'puzzle' |
'briefcase' |
'phone' |
'user' |
'lifebuoy' |
'sparkles';

export interface HelpArticle {
  id: string;
  q: string;
  a: string;
  /** Numbered steps, when the answer is a task. */
  steps?: string[];
  /** Where to find it in the app, e.g. "Commerce → Events". */
  where?: string;
  /** Plan needed, when it isn't every plan. */
  plan?: string;
}

export interface HelpCategory {
  id: string;
  title: string;
  summary: string;
  icon: HelpIcon;
  /** Which part of the guide it belongs to. */
  group: 'Start' | 'Build' | 'Sell & get paid' | 'Serve & grow' | 'Run your workspace' | 'Your customers';
  articles: HelpArticle[];
}