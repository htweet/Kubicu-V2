import type { HelpCategory } from '../types/help';
import { startAndBuildHelp } from './help/startAndBuild';
import { sellHelp } from './help/sell';
import { serveAndRunHelp } from './help/serveAndRun';
import { canvasBlocksHelp } from './help/canvasBlocks';
import { growthGuides } from './help/growthGuides';
import { businessGuides } from './help/businessGuides';
import { guideEnrichments } from './help/guideEnrichments';

const groupOrder: HelpCategory['group'][] = ['Start', 'Build', 'Sell & get paid', 'Serve & grow', 'Run your workspace', 'Your customers'];

/** The full user guide (D113b, D274): every module, tool and customer-facing page, with steps and pictures. */
export const helpTopics: HelpCategory[] = [...startAndBuildHelp, ...canvasBlocksHelp, ...sellHelp, ...serveAndRunHelp, ...growthGuides, ...businessGuides]
  .map((t) => ({ ...t, articles: t.articles.map((a) => ({ ...a, ...guideEnrichments[a.id] })) }))
  .sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group));

export const helpGroups = groupOrder;
