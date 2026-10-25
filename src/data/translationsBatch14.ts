/** Drafted translations for Batch 14 visitor text: safe embeds and policy notices (D142). Drafts — need native review. */
type Dict = Record<string, string>;

// [English, Pidgin, Yorùbá, Hausa, Igbo]
const rows: [string, string, string, string, string][] = [
['Play video: {title}', 'Play video: {title}', 'Ṣe fídíò: {title}', 'Kunna bidiyo: {title}', 'Kpọọ vidiyo: {title}'],
['Load {title}', 'Load {title}', 'Ṣí {title}', 'Buɗe {title}', 'Mepee {title}'],
['Paused to save data — loads from {site}', 'We pause am to save data — e go load from {site}', 'A dá a dúró láti fi dátà pamọ́ — yóò wá láti {site}', 'An dakatar don adana data — zai zo daga {site}', 'Akwụsịrị ya iji chekwaa data — ọ ga-esi na {site} bata'],
['Embedded content from {site}', 'Content from {site}', 'Àkóónú láti {site}', 'Abun ciki daga {site}', 'Ọdịnaya si na {site}']];


const build = (i: 1 | 2 | 3 | 4): Dict => Object.fromEntries(rows.map((r) => [r[0], r[i]]));

export const batch14Pcm = build(1);
export const batch14Yo = build(2);
export const batch14Ha = build(3);
export const batch14Ig = build(4);