/**
 * Website templates and themes library, /templates (D326): headings, filters, counts and city names.
 * Template categories and "Premium · {price}" come from translationsTemplatesTab (D312).
 * DRAFTS — every non-English line needs a native speaker's check. Row: [English, Naijá, Yorùbá, Hausa, Igbo].
 */
export const siteTemplatesRows: [string, string, string, string, string][] = [
  ['Library', 'Library', 'Ibi ìkówèésí', 'Ɗakin karatu', 'Ọba akwụkwọ'],
  ['Choose the look,', 'Choose the look,', 'Yan ìrísí,', 'Zaɓi kama,', 'Họrọ ọdịdị,'],
  ['keep your layout', 'keep your layout', 'pa ìtòlẹ́sẹẹsẹ rẹ mọ́', 'riƙe tsarinka', 'debe nhazi gị'],
  ['24 Signature themes — glass, gloss, editorial and quiet luxury. A theme changes colours, surfaces, buttons and type; your page’s content and layout stay exactly where they are.', '24 Signature themes — glass, gloss, editorial and quiet luxury. Theme dey change colours, surfaces, buttons and fonts; your page content and layout go stay exactly where dem dey.', 'Àkòrí Signature 24 — dígí, dídán, oníròyìn àti ọlá pẹ̀lẹ́. Àkòrí ń yí àwọ̀, ojú, bọ́tìnnì àti lẹ́tà padà; àkóónú àti ìtòlẹ́sẹẹsẹ ojú-ìwé rẹ wà níbi tí wọ́n wà gan-an.', 'Jigogi Signature 24 — gilashi, mai sheƙi, irin na mujalla da alatu mai natsuwa. Jigo yana canza launuka, saman, maɓallai da rubutu; abun ciki da tsarin shafinka suna nan inda suke.', 'Isiokwu Signature 24 — iko, na-egbuke egbuke, ụdị magazin na okomoko dị jụụ. Isiokwu na-agbanwe agba, elu, bọtịnụ na mkpụrụedemede; ọdịnaya na nhazi ibe gị na-anọ kpọmkwem ebe ha dị.'],
  ['Start from a page', 'Start from page', 'Bẹ̀rẹ̀ láti ojú-ìwé kan', 'Fara daga shafi', 'Malite site n’ibe'],
  ['built for your goal', 'wey we build for your goal', 'tí a kọ́ fún ète rẹ', 'da aka gina don manufarka', 'ewuru maka ebumnuche gị'],
  ['Each template is a complete example for a fictional business. When you use one, we keep the layout and remove its prices, links and quotes, so only your details go live.', 'Each template na complete example for business wey no real. When you use one, we go keep the layout and comot im prices, links and quotes, so na only your details go live.', 'Àwòṣe kọ̀ọ̀kan jẹ́ àpẹẹrẹ kíkún fún iṣẹ́ àròsọ. Nígbà tí o bá lo ọ̀kan, a pa ìtòlẹ́sẹẹsẹ mọ́, a sì yọ iye owó, ìjápọ̀ àti ọ̀rọ̀ rẹ̀ kúrò, kí àlàyé tìrẹ nìkan lè jáde.', 'Kowane samfuri cikakken misali ne na kasuwancin ƙirƙira. Idan ka yi amfani da ɗaya, muna riƙe tsarin kuma muna cire farashi, hanyoyi da maganganunsa, don bayananka kawai su fito.', 'Ndebiri ọ bụla bụ ihe atụ zuru ezu maka azụmahịa akụkọ ifo. Mgbe i jiri otu, anyị na-edebe nhazi ma wepụ ọnụahịa, njikọ na okwu ya, ka naanị nkọwa gị pụta.'],
  ['All templates', 'All templates', 'Gbogbo àwòṣe', 'Duk samfura', 'Ndebiri niile'],
  ['Goal', 'Goal', 'Ète', 'Manufa', 'Ebumnuche'],
  ['All goals', 'All goals', 'Gbogbo ète', 'Duk manufofi', 'Ebumnuche niile'],
  ['Style', 'Style', 'Àṣà', 'Salo', 'Ụdị'],
  ['Any style', 'Any style', 'Àṣà èyíkéyìí', 'Kowane salo', 'Ụdị ọ bụla'],
  ['Light', 'Light', 'Ìmọ́lẹ̀', 'Haske', 'Ìhè'],
  ['Dark', 'Dark', 'Òkùnkùn', 'Duhu', 'Ọchịchịrị'],
  ['Bold', 'Bold', 'Àìbẹ̀rù', 'Mai ƙarfi', 'Siri ike'],
  ['Search templates', 'Search templates', 'Wá àwòṣe', 'Nemo samfura', 'Chọọ ndebiri'],
  ['Search, e.g. salon', 'Search, like salon', 'Wá, bí salon', 'Nemo, misali salon', 'Chọọ, dịka salọn'],
  ['Price', 'Price', 'Iye owó', 'Farashi', 'Ọnụahịa'],
  ['Free and premium', 'Free and premium', 'Ọ̀fẹ́ àti ààyò', 'Kyauta da na musamman', 'N’efu na pụrụ iche'],
  ['Premium', 'Premium', 'Ààyò', 'Na musamman', 'Pụrụ iche'],
  ['Region', 'Area', 'Agbègbè', 'Yanki', 'Mpaghara'],
  ['Everywhere', 'Everywhere', 'Níbi gbogbo', 'Ko’ina', 'Ebe niile'],
  ['Templates: {n}', 'Templates: {n}', 'Àwòṣe: {n}', 'Samfura: {n}', 'Ndebiri: {n}'],
  ['No templates match', 'No template match', 'Kò sí àwòṣe tí ó bá a mu', 'Babu samfurin da ya dace', 'Ọ dịghị ndebiri dabara'],
  ['Try another goal or style, or start from a blank page.', 'Try another goal or style, or start from empty page.', 'Gbìyànjú ète tàbí àṣà mìíràn, tàbí bẹ̀rẹ̀ láti ojú-ìwé òfo.', 'Gwada wata manufa ko salo, ko fara daga shafi mara komai.', 'Nwaa ebumnuche ma ọ bụ ụdị ọzọ, ma ọ bụ malite site n’ibe efu.'],
  ['Clear filters', 'Clear filters', 'Pa àlẹ̀ rẹ́', 'Share tacewa', 'Hichapụ nzacha'],
  // Cities
  ['Ibadan', 'Ibadan', 'Ìbàdàn', 'Ibadan', 'Ibadan'],
  ['Port Harcourt', 'Port Harcourt', 'Port Harcourt', 'Fatakwal', 'Port Harcourt'],
  ['Enugu', 'Enugu', 'Ènúgú', 'Enugu', 'Enugwu'],
  ['Kano', 'Kano', 'Kánò', 'Kano', 'Kano'],
  ['Calabar', 'Calabar', 'Kàlábàr', 'Calabar', 'Calabar'],
  ['Kaduna', 'Kaduna', 'Kàdúná', 'Kaduna', 'Kaduna'],
  ['Abeokuta', 'Abeokuta', 'Abẹ́òkúta', 'Abeokuta', 'Abeokuta'],
];

const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(siteTemplatesRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const siteTemplatesPcm = column(1);
export const siteTemplatesYo = column(2);
export const siteTemplatesHa = column(3);
export const siteTemplatesIg = column(4);
