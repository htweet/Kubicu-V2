/** Pidgin, Yorùbá, Hausa and Igbo drafts for the D430 accessibility labels (D431). Drafts — need native review. */
type Dict = Record<string, string>;

// [English, Pidgin, Yorùbá, Hausa, Igbo]
const rows: [string, string, string, string, string][] = [
  ['Play moving examples', 'Make the examples move again', 'Jẹ́ kí àwọn àpẹẹrẹ máa rìn', 'Kunna misalan masu motsi', 'Mee ka ihe atụ na-agagharị gaa n’ihu'],
  ['Pause moving examples', 'Stop the examples wey dey move', 'Dá àwọn àpẹẹrẹ tó ń rìn dúró', 'Dakatar da misalan masu motsi', 'Kwụsịtụ ihe atụ na-agagharị'],
  ['Workspace shortcuts', 'Quick links for your workspace', 'Àwọn ọ̀nà àbùjá ibi iṣẹ́', 'Gajerun hanyoyin wurin aiki', 'Ụzọ mkpirisi ebe ọrụ'],
  ['Site links', 'Site links', 'Àwọn ìjápọ̀ ojúlé', 'Hanyoyin shafin', 'Njikọ saịtị'],
];

const build = (i: 1 | 2 | 3 | 4): Dict => Object.fromEntries(rows.map((r) => [r[0], r[i]]));

export const a11yLabelsPcm = build(1);
export const a11yLabelsYo = build(2);
export const a11yLabelsHa = build(3);
export const a11yLabelsIg = build(4);
