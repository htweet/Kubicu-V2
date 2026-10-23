import type { HelpCategory } from '../types/help';
import { startAndBuildHelp } from './help/startAndBuild';
import { sellHelp } from './help/sell';
import { serveAndRunHelp } from './help/serveAndRun';

/** The full user guide (D113b): every module, tool and customer-facing page. */
export const helpTopics: HelpCategory[] = [...startAndBuildHelp, ...sellHelp, ...serveAndRunHelp];

export const helpGroups: HelpCategory['group'][] = ['Start', 'Build', 'Sell & get paid', 'Serve & grow', 'Run your workspace', 'Your customers'];