/**
 * Canvas Content tab for the Delivery & returns block and the smart selling blocks: Shop categories,
 * Checkout button, Reviews summary, Smart button, Campaign spotlight, Recommendations (D304).
 * DRAFTS — every non-English line needs a native speaker's check. Row: [English, Naijá, Yorùbá, Hausa, Igbo].
 */
export const smartBlockFieldsRows: [string, string, string, string, string][] = [
  // Delivery
  ['Your shop settings aren’t available here.', 'Your shop settings no dey available here.', 'Ètò ṣọ́ọ̀bù rẹ kò sí níbí.', 'Saitunan shagonka ba su samu a nan ba.', 'Ntọala ụlọ ahịa gị adịghị ebe a.'],
  ['Delivery areas: {n}', 'Delivery areas: {n}', 'Àgbègbè ìfijiṣẹ́: {n}', 'Yankunan isarwa: {n}', 'Mpaghara nnyefe: {n}'],
  ['free over {amount}', 'free if e pass {amount}', 'ọ̀fẹ́ tí ó bá ju {amount} lọ', 'kyauta idan ya wuce {amount}', 'efu ma ọ karịrị {amount}'],
  ['Delivery is off', 'Delivery dey off', 'Ìfijiṣẹ́ ti pa', 'An kashe isarwa', 'Agbanyụrụ nnyefe'],
  ['pickup on', 'pickup dey on', 'gbígbà ti tàn', 'ɗauka yana kunne', 'ịbịa nara gbanyere'],
  ['pickup off', 'pickup dey off', 'gbígbà ti pa', 'ɗauka a kashe', 'ịbịa nara agbanyụrụ'],
  ['Delivery rates and pickup', 'Delivery price and pickup', 'Owó ìfijiṣẹ́ àti gbígbà', 'Farashin isarwa da ɗauka', 'Ọnụahịa nnyefe na ịbịa nara'],
  ['From my shop', 'From my shop', 'Láti ṣọ́ọ̀bù mi', 'Daga shagona', 'Site n’ụlọ ahịa m'],
  ['Write my own', 'Write my own', 'Kọ tèmi', 'Rubuta nawa', 'Dee nke m'],
  ['Uses the same areas, prices and pickup details as checkout, so they always match.', 'E dey use the same areas, prices and pickup details as checkout, so dem go always match.', 'Ó ń lo àgbègbè, iye owó àti àlàyé gbígbà kan náà bí ìsanwó, nítorí náà wọ́n máa ń bá ara wọn mu.', 'Yana amfani da yankuna, farashi da bayanan ɗauka iri ɗaya da biya, don haka koyaushe suna daidai.', 'Ọ na-eji otu mpaghara, ọnụahịa na nkọwa ịbịa nara dịka ịkwụ ụgwọ, ya mere ha na-adakọ mgbe niile.'],
  ['Edit in Commerce → Settings', 'Edit for Commerce → Settings', 'Ṣàtúnṣe nínú Ìṣòwò → Ètò', 'Gyara a Kasuwanci → Saituna', 'Dezie na Azụmahịa → Ntọala'],
  ['Area', 'Area', 'Àgbègbè', 'Yanki', 'Mpaghara'],
  ['Add area', 'Add area', 'Fi àgbègbè kún', 'Ƙara yanki', 'Tinye mpaghara'],
  ['Needs a name — hidden until added', 'E need name — e go hide until you add am', 'Ó nílò orúkọ — ó farapamọ́ títí a ó fi fi kún', 'Yana buƙatar suna — a ɓoye har sai an ƙara', 'Ọ chọrọ aha — ezoro ezo ruo mgbe etinyere ya'],
  ['e.g. Lagos Mainland', 'like Lagos Mainland', 'bí Lagos Mainland', 'misali Lagos Mainland', 'dịka Lagos Mainland'],
  ['e.g. ₦2,500 or Free', 'like ₦2,500 or Free', 'bí ₦2,500 tàbí Ọ̀fẹ́', 'misali ₦2,500 ko Kyauta', 'dịka ₦2,500 ma ọ bụ Efu'],
  ['Usually takes', 'E dey usually take', 'Ó máa ń gbà', 'Yawanci yana ɗaukar', 'Ọ na-ewekarị'],
  ['e.g. 1–2 days', 'like 1–2 days', 'bí ọjọ́ 1–2', 'misali kwanaki 1–2', 'dịka ụbọchị 1–2'],
  ['Pickup', 'Pickup', 'Gbígbà', 'Ɗauka', 'Ịbịa nara'],
  ['e.g. Yaba studio, Mon–Sat 10am–6pm', 'like Yaba studio, Mon–Sat 10am–6pm', 'bí Ilé-iṣẹ́ Yaba, Ajé–Àbámẹ́ta 10 àárọ̀–6 ìrọ̀lẹ́', 'misali Ɗakin Yaba, Litinin–Asabar 10 safe–6 yamma', 'dịka Ụlọ ọrụ Yaba, Mọnde–Satọdee 10 ụtụtụ–6 mgbede'],
  ['Returns', 'Returns', 'Ìdápadà', 'Maidowa', 'Nlọghachi'],
  ['e.g. Exchanges within 7 days if unworn with tags. Custom pieces can’t be returned.', 'like Exchange inside 7 days if you never wear am and tags still dey. Custom pieces no fit return.', 'bí Pàṣípààrọ̀ láàárín ọjọ́ 7 tí a kò bá wọ̀ ọ́ tí àmì sì wà. A kò lè dá aṣọ àdáni padà.', 'misali Musanya cikin kwanaki 7 idan ba a sa ba tare da alamomi. Ba za a iya mayar da kayan da aka ɗinka na musamman ba.', 'dịka Mgbanwe n’ime ụbọchị 7 ma ọ bụrụ na eyighị ya ma akara ka dị. Enweghị ike ịlaghachi ihe e mere pụrụ iche.'],
  ['Only what you actually do — visitors may hold you to it.', 'Only wetin you dey do for real — visitors fit hold you to am.', 'Ohun tí o ń ṣe gan-an nìkan — àwọn àlejò lè dì ọ́ mú sí i.', 'Abin da kake yi da gaske kawai — baƙi za su iya riƙe ka da shi.', 'Naanị ihe ị na-eme n’ezie — ndị ọbịa nwere ike ijide gị na ya.'],
  ['Small print', 'Small print', 'Àkọsílẹ̀ kékeré', 'Ƙaramin rubutu', 'Obere ederede'],
  ['e.g. Waybill outside Lagos is paid on arrival', 'like Waybill outside Lagos na pay when e reach', 'bí Owó ọkọ̀ ẹrù lóde Èkó ni a ń san nígbà tí ó bá dé', 'misali Kuɗin jigila wajen Legas ana biya idan ya iso', 'dịka A na-akwụ ụgwọ ụgbọ ibu n’èzí Lagos mgbe o ruru'],
  // Shop categories
  ['Cards', 'Cards', 'Káàdì', 'Katuna', 'Kaadị'],
  ['Chips', 'Small buttons', 'Bọ́tìnnì kékeré', 'Ƙananan maɓallai', 'Obere bọtịnụ'],
  ['Create collections in Commerce → Products. Collections with no active products stay hidden.', 'Create collections for Commerce → Products. Collections wey no get active products go hide.', 'Ṣẹ̀dá àkójọ nínú Ìṣòwò → Àwọn ọjà. Àkójọ tí kò ní ọjà tí ń ṣiṣẹ́ yóò farapamọ́.', 'Ƙirƙiri tari a Kasuwanci → Kayayyaki. Tarin da ba shi da kayan da ke aiki zai kasance a ɓoye.', 'Mepụta mkpokọta na Azụmahịa → Ngwaahịa. Mkpokọta na-enweghị ngwaahịa na-arụ ọrụ ga-anọ ezoro ezo.'],
  ['Collections to show', 'Collections to show', 'Àkójọ láti fi hàn', 'Tarin da za a nuna', 'Mkpokọta a ga-egosi'],
  ['None ticked shows all of them.', 'If you no tick any, all of dem go show.', 'Bí a kò bá fi àmì sí ọ̀kankan, gbogbo wọn yóò hàn.', 'Idan ba a yi alama a kowanne ba, duka za su bayyana.', 'Ọ bụrụ na akaghị akara n’ọ bụla, ha niile ga-egosi.'],
  // Checkout button
  ['When tapped', 'When person tap am', 'Nígbà tí a bá tẹ̀ ẹ́', 'Idan an taɓa', 'Mgbe a pịara ya'],
  ['Your checkout', 'Your checkout', 'Ìsanwó rẹ', 'Biyanka', 'Ịkwụ ụgwọ gị'],
  ['A payment link', 'Payment link', 'Ìjápọ̀ ìsanwó kan', 'Hanyar biya', 'Njikọ ịkwụ ụgwọ'],
  ['Checkout is on the {plan} plan', 'Checkout dey {plan} plan', 'Ìsanwó wà lórí ètò {plan}', 'Biya yana kan tsarin {plan}', 'Ịkwụ ụgwọ dị na atụmatụ {plan}'],
  ['Until then, use a payment link instead.', 'Until then, use payment link instead.', 'Títí di ìgbà náà, lo ìjápọ̀ ìsanwó dípò.', 'Har zuwa lokacin, yi amfani da hanyar biya maimakon haka.', 'Ruo mgbe ahụ, jiri njikọ ịkwụ ụgwọ kama.'],
  ['Choose a product…', 'Choose product…', 'Yan ọjà kan…', 'Zaɓi kaya…', 'Họrọ ngwaahịa…'],
  ['No active products yet', 'No active products yet', 'Kò sí ọjà tí ń ṣiṣẹ́ síbẹ̀', 'Babu kayan da ke aiki tukuna', 'Enwebeghị ngwaahịa na-arụ ọrụ'],
  ['Payment link', 'Payment link', 'Ìjápọ̀ ìsanwó', 'Hanyar biya', 'Njikọ ịkwụ ụgwọ'],
  ['Visitors are told they’ll pay on that site.', 'We go tell visitors say dem go pay for that site.', 'A sọ fún àwọn àlejò pé wọn yóò sanwó lórí ojúlé yẹn.', 'Ana gaya wa baƙi cewa za su biya a wannan shafin.', 'A na-agwa ndị ọbịa na ha ga-akwụ ụgwọ na saịtị ahụ.'],
  ['e.g. Ships in 2–3 days', 'like E go ship in 2–3 days', 'bí A ó fi ránṣẹ́ láàárín ọjọ́ 2–3', 'misali Ana aikawa cikin kwanaki 2–3', 'dịka A na-ezipụ n’ime ụbọchị 2–3'],
  // Reviews summary
  ['Latest reviews to show', 'Latest reviews to show', 'Àtúnyẹ̀wò tuntun láti fi hàn', 'Sabbin sharhi da za a nuna', 'Nyocha ọhụrụ a ga-egosi'],
  ['Only verified reviews', 'Only verified reviews', 'Àtúnyẹ̀wò tí a fìdí múlẹ̀ nìkan', 'Sharhin da aka tabbatar kawai', 'Naanị nyocha ekwenyesiri'],
  ['The average and count come from reviews tied to a real order, booking or job in Proof. You can’t type reviews in here.', 'The average and count dey come from reviews wey tie to real order, booking or job for Proof. You no fit type reviews here.', 'Ìpíndọ́gba àti iye wá láti inú àtúnyẹ̀wò tí a so mọ́ àṣẹ, ìfiṣura tàbí iṣẹ́ gidi nínú Ẹ̀rí. O kò lè tẹ àtúnyẹ̀wò síbí.', 'Matsakaici da adadi suna fitowa daga sharhin da aka haɗa da oda, ajiya ko aiki na gaske a Shaida. Ba za ka iya rubuta sharhi a nan ba.', 'Nkezi na ọnụ ọgụgụ si na nyocha ejikọrọ na ezigbo ọda, ndebanye ma ọ bụ ọrụ na Ihe akaebe. Ị pụghị ide nyocha ebe a.'],
  // Smart button
  ['Default words', 'Normal words', 'Ọ̀rọ̀ àkọ́kọ́', 'Kalmomin asali', 'Okwu nkịtị'],
  ['What everyone else sees.', 'Wetin everybody else go see.', 'Ohun tí gbogbo àwọn yòókù ń rí.', 'Abin da kowa ke gani.', 'Ihe onye ọ bụla ọzọ na-ahụ.'],
  ['Default link', 'Normal link', 'Ìjápọ̀ àkọ́kọ́', 'Hanyar asali', 'Njikọ nkịtị'],
  ['Versions by where visitors came from', 'Versions by where visitors come from', 'Oríṣi gẹ́gẹ́ bí ibi tí àwọn àlejò ti wá', 'Siga bisa inda baƙi suka fito', 'Ụdị dịka ebe ndị ọbịa si'],
  ['Version', 'Version', 'Oríṣi', 'Siga', 'Ụdị'],
  ['Add a version', 'Add version', 'Fi oríṣi kan kún', 'Ƙara siga', 'Tinye ụdị'],
  ['Uses the same visit source as IntentFlow and Analytics. Nothing personal is used.', 'E dey use the same visit source as IntentFlow and Analytics. We no dey use anything personal.', 'Ó ń lo orísun ìbẹ̀wò kan náà bí IntentFlow àti Àtúpalẹ̀. A kò lo nǹkan àdáni.', 'Yana amfani da tushen ziyara iri ɗaya da IntentFlow da Nazari. Ba a amfani da komai na sirri.', 'Ọ na-eji otu ebe nleta si dịka IntentFlow na Nyocha data. Anaghị eji ihe nkeonwe.'],
  ['Visitors from {source}', 'Visitors from {source}', 'Àwọn àlejò láti {source}', 'Baƙi daga {source}', 'Ndị ọbịa si {source}'],
  ['No words yet', 'No words yet', 'Kò sí ọ̀rọ̀ síbẹ̀', 'Babu kalmomi tukuna', 'Enwebeghị okwu'],
  ['Visitors from', 'Visitors from', 'Àwọn àlejò láti', 'Baƙi daga', 'Ndị ọbịa si'],
  ['Words', 'Words', 'Ọ̀rọ̀', 'Kalmomi', 'Okwu'],
  ['e.g. Saw us on TikTok? Get 10% off', 'like You see us for TikTok? Get 10% off', 'bí Ṣé o rí wa lórí TikTok? Gba ẹ̀dínwó 10%', 'misali Ka gan mu a TikTok? Samu rangwame 10%', 'dịka Ị hụrụ anyị na TikTok? Nweta mbelata 10%'],
  ['Check each version with “Preview as” above the canvas.', 'Check each version with “Preview as” for top of the canvas.', 'Ṣàyẹ̀wò oríṣi kọ̀ọ̀kan pẹ̀lú “Wò bí” lókè kanfasi.', 'Duba kowace siga da “Duba a matsayin” a saman zane.', 'Lelee ụdị ọ bụla site na “Lee dịka” n’elu kanvas.'],
  // Campaign spotlight
  ['Details', 'Details', 'Àlàyé', 'Bayanai', 'Nkọwa'],
  ['Starts showing', 'E go start to show', 'Ó bẹ̀rẹ̀ sí hàn', 'Yana fara nunawa', 'Ọ na-amalite igosi'],
  ['Empty = shows as soon as it’s published.', 'Empty = e go show as soon as you publish am.', 'Òfo = ó ń hàn ní kété tí a bá tẹ̀ ẹ́ jáde.', 'Babu komai = yana bayyana da zarar an wallafa.', 'Efu = ọ na-egosi ozugbo ebipụtara ya.'],
  ['Stops showing', 'E go stop to show', 'Ó dáwọ́ dúró láti hàn', 'Yana daina nunawa', 'Ọ na-akwụsị igosi'],
  ['End after it starts.', 'End am after e start.', 'Parí rẹ̀ lẹ́yìn tí ó bá bẹ̀rẹ̀.', 'Ƙare shi bayan ya fara.', 'Kwụsị ya mgbe ọ malitere.'],
  ['Image', 'Image', 'Àwòrán', 'Hoto', 'Onyonyo'],
  ['Describe the image', 'Describe the image', 'Ṣàpèjúwe àwòrán', 'Bayyana hoton', 'Kọwaa onyonyo'],
  ['After it ends, show', 'After e end, show', 'Lẹ́yìn tí ó bá parí, fi hàn', 'Bayan ya ƙare, nuna', 'Mgbe ọ gwụsịrị, gosi'],
  ['Leave empty to hide it', 'Leave am empty to hide am', 'Fi sílẹ̀ ní òfo láti fi pamọ́', 'Bar shi babu komai don ɓoye shi', 'Hapụ ya efu iji zoo ya'],
  // Recommendations
  ['e.g. New here? These three are where most people start.', 'like You new here? Na these three most people dey start from.', 'bí Ṣé o jẹ́ tuntun níbí? Àwọn mẹ́ta yìí ni ọ̀pọ̀ ènìyàn ti ń bẹ̀rẹ̀.', 'misali Sabon zuwa? Waɗannan uku ne inda yawancin mutane suka fara.', 'dịka Ị bụ onye ọhụrụ? Ndị atọ a bụ ebe ọtụtụ mmadụ na-amalite.'],
  ['Your picks, in order', 'Your picks, in order', 'Àwọn àṣàyàn rẹ, ní ìtòlẹ́sẹẹsẹ', 'Zaɓinka, a jere', 'Nhọrọ gị, n’usoro'],
  ['Pick', 'Pick', 'Àṣàyàn', 'Zaɓi', 'Nhọrọ'],
  ['Add pick', 'Add pick', 'Fi àṣàyàn kún', 'Ƙara zaɓi', 'Tinye nhọrọ'],
  ['Short description', 'Short description', 'Àpèjúwe kúkúrú', 'Gajeren bayani', 'Obere nkọwa'],
  ['Why you recommend it', 'Why you recommend am', 'Ìdí tí o fi dábàá rẹ̀', 'Me yasa kake ba da shawarar sa', 'Ihe mere i ji tụọ aro ya'],
  ['If you earn from any of these links, say so in the description.', 'If you dey earn from any of these links, talk am for the description.', 'Bí o bá ń jẹ èrè láti inú èyíkéyìí nínú àwọn ìjápọ̀ yìí, sọ bẹ́ẹ̀ nínú àpèjúwe.', 'Idan kana samun kuɗi daga kowace daga cikin waɗannan hanyoyin, faɗi haka a bayani.', 'Ọ bụrụ na ị na-enweta ego site na njikọ ndị a, kwuo ya na nkọwa.'],
];

const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(smartBlockFieldsRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const smartBlockFieldsPcm = column(1);
export const smartBlockFieldsYo = column(2);
export const smartBlockFieldsHa = column(3);
export const smartBlockFieldsIg = column(4);
