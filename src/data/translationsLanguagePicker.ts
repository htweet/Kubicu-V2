/**
 * Language picker (D298). DRAFTS — every non-English line needs a native speaker's check.
 * Row: [English, Naijá, Yorùbá, Hausa, Igbo].
 */
export const languagePickerRows: [string, string, string, string, string][] = [
  ['Drafts haven’t been checked by a native speaker yet. Anything not translated stays in English.', 'Native speaker never check the drafts yet. Anything wey we never translate go stay for English.', 'Olùsọ èdè abínibí kò tíì ṣàyẹ̀wò àwọn àkọ̀tun. Ohunkóhun tí a kò tíì túmọ̀ yóò wà ní Gẹ̀ẹ́sì.', 'Mai harshen asali bai duba daftarorin ba tukuna. Duk abin da ba a fassara ba zai kasance da Turanci.', 'Onye asụsụ obodo enyochabeghị ndepụta ndị a. Ihe ọ bụla a sụgharịbeghị ga-anọ n’asụsụ Bekee.'],
  ['Draft translation', 'Draft translation', 'Ìtúmọ̀ àkọ̀tun', 'Daftarin fassara', 'Ntụgharị ndepụta'],
  ['Coming later', 'E dey come later', 'Ń bọ̀ lẹ́yìn', 'Yana zuwa nan gaba', 'Na-abịa emesia'],
  ['Nigeria', 'Naija', 'Nàìjíríà', 'Najeriya', 'Naịjirịa'],
  ['United Kingdom', 'United Kingdom', 'Ìjọba Gẹ̀ẹ́sì', 'Birtaniya', 'Mba Bekee'],
  ['Nigerian Pidgin', 'Naijá', 'Pidgin Nàìjíríà', 'Pidgin na Najeriya', 'Pidgin Naịjirịa'],
  ['Yoruba', 'Yoruba', 'Yorùbá', 'Yarbanci', 'Yoruba'],
  ['Hausa', 'Hausa', 'Hausa', 'Hausa', 'Hausa'],
  ['Igbo', 'Igbo', 'Igbo', 'Igbo', 'Igbo'],
  ['Changes buttons and labels. Page text stays as written.', 'E dey change buttons and labels. Page text go stay as dem write am.', 'Ó ń yí bọ́tìnnì àti àkọlé padà. Ọ̀rọ̀ ojú-ìwé yóò wà bí a ṣe kọ ọ́.', 'Yana canza maɓallai da lakabi. Rubutun shafi zai kasance yadda aka rubuta.', 'Ọ na-agbanwe bọtịnụ na aha. Ederede ibe ga-anọ dịka e dere ya.'],
  ['the seller’s own words stay as they wrote them.', 'the seller own words go stay as dem write am.', 'ọ̀rọ̀ olùtajà fúnra rẹ̀ yóò wà bí ó ṣe kọ ọ́.', 'kalmomin mai sayarwa za su kasance yadda ya rubuta.', 'okwu onye na-ere n’onwe ya ga-anọ dịka o dere ya.'],
  ['French', 'French', 'Faransé', 'Faransanci', 'Asụsụ French'],
];

const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(languagePickerRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const languagePickerPcm = column(1);
export const languagePickerYo = column(2);
export const languagePickerHa = column(3);
export const languagePickerIg = column(4);
