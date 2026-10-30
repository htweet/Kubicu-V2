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
'sparkles' |
'link' |
'message' |
'settings' |
'store';

/**
 * One element in a guide picture (D274). Pictures are drawn from these, not captured, so they stay
 * in step with the app and work in every language. `marker` ties an element to the step with that number.
 */
export type HelpShotItem =
{kind: 'heading';label: string;sub?: string;} |
{kind: 'button';label: string;primary?: boolean;marker?: number;} |
{kind: 'field';label: string;value?: string;marker?: number;} |
{kind: 'toggle';label: string;on?: boolean;marker?: number;} |
{kind: 'tabs';tabs: string[];active?: number;marker?: number;} |
{kind: 'chips';chips: string[];active?: number;marker?: number;} |
{kind: 'row';label: string;meta?: string;badge?: string;marker?: number;} |
{kind: 'stats';stats: {label: string;value: string;}[];marker?: number;} |
{kind: 'chart';label?: string;marker?: number;} |
{kind: 'note';label: string;tone?: 'info' | 'warning' | 'success';marker?: number;} |
{kind: 'chat';from: 'you' | 'them';label: string;marker?: number;};

export interface HelpShot {
  /** app: workspace screen · canvas: page editor · phone: what a phone shows · site: a public web page. */
  frame: 'app' | 'canvas' | 'phone' | 'site';
  /** Sidebar item (app) or canvas panel tab (canvas) shown as selected. */
  nav?: string;
  /** Breadcrumb (app) or address (site/phone). */
  path?: string;
  title: string;
  /** Buttons in the header, top right. */
  actions?: HelpShotItem[];
  items: HelpShotItem[];
  /** Panel title on a side sheet, when the step happens inside one. */
  sheet?: string;
}

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
  /** Labelled picture of the screen; its markers match the step numbers. */
  shot?: HelpShot;
  /** Short "good to know" notes shown after the steps. */
  tips?: string[];
  /** Other article ids worth reading next. */
  related?: string[];
  /** Shown when the feature is simulated in this version. */
  simulated?: string;
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