/**
 * Signature theme gallery (D328) — the website's Themes tab and the app's theme library share it.
 * Theme descriptions come from translationsPagePanel (D305). DRAFTS — every non-English line needs a native speaker's check.
 * Row: [English, Naijá, Yorùbá, Hausa, Igbo]. Theme names stay as names.
 */
export const themeGalleryRows: [string, string, string, string, string][] = [
  ['Filter by mood', 'Filter by mood', 'Ṣàlẹ̀ nípa ìmọ̀lára', 'Tace ta yanayi', 'Họcha site n’ọnọdụ'],
  ['All: {n}', 'All: {n}', 'Gbogbo: {n}', 'Duka: {n}', 'Ha niile: {n}'],
  ['Glass & gloss', 'Glass & shine', 'Dígí & dídán', 'Gilashi & sheƙi', 'Iko & nchapụta'],
  ['Dark luxury', 'Dark luxury', 'Ọlá òkùnkùn', 'Alatu mai duhu', 'Okomoko ọchịchịrị'],
  ['Light & airy', 'Light & airy', 'Ìmọ́lẹ̀ & afẹ́fẹ́', 'Haske & iska', 'Ìhè & ikuku'],
  ['Warm & natural', 'Warm & natural', 'Gbígbóná & àdánidá', 'Ɗumi & na halitta', 'Ọkụ & eke'],
  ['Signature themes', 'Signature themes', 'Àkòrí Signature', 'Jigogin Signature', 'Isiokwu Signature'],
  ['Spec sheet', 'Spec sheet', 'Ìwé àlàyé', 'Takardar bayani', 'Mpempe nkọwa'],
  ['Theme mode', 'Theme mode', 'Ipò àkòrí', 'Yanayin jigo', 'Ọnọdụ isiokwu'],
  ['Page to preview', 'Page to preview', 'Ojú-ìwé láti wò', 'Shafin dubawa', 'Ibe a ga-ele'],
  ['Sample page', 'Sample page', 'Ojú-ìwé àpẹẹrẹ', 'Shafin misali', 'Ibe ihe atụ'],
  ['My page', 'My page', 'Ojú-ìwé mi', 'Shafina', 'Ibe m'],
  ['{theme} on your page', '{theme} for your page', '{theme} lórí ojú-ìwé rẹ', '{theme} a shafinka', '{theme} na ibe gị'],
  ['{theme} on the sample page', '{theme} for the sample page', '{theme} lórí ojú-ìwé àpẹẹrẹ', '{theme} a shafin misali', '{theme} na ibe ihe atụ'],
  ['Creator plan and above. Preview is free.', 'Creator plan and above. Preview na free.', 'Ètò Creator àti èyí tí ó ga jù. Àwòtẹ́lẹ̀ jẹ́ ọ̀fẹ́.', 'Tsarin Creator da sama. Dubawa kyauta ne.', 'Atụmatụ Creator na nke dị elu. Nlele bụ n’efu.'],
  ['Creator plan and above', 'Creator plan and above', 'Ètò Creator àti èyí tí ó ga jù', 'Tsarin Creator da sama', 'Atụmatụ Creator na nke dị elu'],
  ['Free on every plan.', 'Free for every plan.', 'Ọ̀fẹ́ lórí gbogbo ètò.', 'Kyauta a kowane tsari.', 'N’efu na atụmatụ ọ bụla.'],
  ['Included in your plan.', 'E dey inside your plan.', 'Ó wà nínú ètò rẹ.', 'An haɗa a tsarinka.', 'Gụnyere n’atụmatụ gị.'],
  ['Free to preview · all 24 Signature themes need Creator or above.', 'Free to preview · all 24 Signature themes need Creator or above.', 'Ọ̀fẹ́ láti wò · gbogbo àkòrí Signature 24 nílò Creator tàbí èyí tí ó ga jù.', 'Kyauta don dubawa · duk jigogin Signature 24 suna buƙatar Creator ko sama.', 'N’efu ile · isiokwu Signature 24 niile chọrọ Creator ma ọ bụ nke dị elu.'],
  ['Upgrade to use', 'Upgrade to use am', 'Gbé e sókè láti lò ó', 'Haɓaka don amfani', 'Kwalite iji ya'],
  ['Keep my own page background', 'Keep my own page background', 'Pa ẹ̀yìn ojú-ìwé tèmi mọ́', 'Riƙe bangon shafina', 'Debe azụ ibe nke m'],
  ['Use on my page', 'Use for my page', 'Lò ó lórí ojú-ìwé mi', 'Yi amfani a shafina', 'Jiri ya na ibe m'],
  ['Start with this theme', 'Start with this theme', 'Bẹ̀rẹ̀ pẹ̀lú àkòrí yìí', 'Fara da wannan jigo', 'Malite na isiokwu a'],
  ['Preview: {name}', 'Preview: {name}', 'Àwòtẹ́lẹ̀: {name}', 'Dubawa: {name}', 'Nlele: {name}'],
  ['On every plan', 'For every plan', 'Lórí gbogbo ètò', 'A kowane tsari', 'Na atụmatụ ọ bụla'],
];

const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(themeGalleryRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const themeGalleryPcm = column(1);
export const themeGalleryYo = column(2);
export const themeGalleryHa = column(3);
export const themeGalleryIg = column(4);
