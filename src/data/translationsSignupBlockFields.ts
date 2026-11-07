/**
 * Canvas Content tab for Booking, Subscription, Course and Form blocks, plus their fixed checks (D299).
 * DRAFTS — every non-English line needs a native speaker's check. Row: [English, Naijá, Yorùbá, Hausa, Igbo].
 */
export const signupBlockFieldsRows: [string, string, string, string, string][] = [
  // Booking
  ['My services', 'My services', 'Àwọn iṣẹ́ mi', 'Sabis na', 'Ọrụ m'],
  ['External booking', 'Booking from outside', 'Ìfiṣura láti ibòmíràn', 'Ajiya daga waje', 'Ndebanye site n’èzí'],
  ['A service you’ve set up in Bookings. Visitors pick a free time and book right here.', 'Service wey you don set for Bookings. Visitors go pick free time and book am right here.', 'Iṣẹ́ tí o ti ṣètò nínú Ìfiṣura. Àwọn àlejò ń yan àkókò tí ó ṣófo, wọ́n sì ń fiṣura níbí gan-an.', 'Sabis da ka saita a Ajiya. Baƙi suna zaɓar lokaci mara aiki su yi ajiya a nan.', 'Ọrụ ị setịpụrụ na Ndebanye. Ndị ọbịa na-ahọrọ oge efu ma debanye ebe a.'],
  ['Already take bookings somewhere else (Calendly, a form, another website)? Add its details and link — the button opens it.', 'You don dey take bookings for another place (Calendly, form, another website)? Add the details and link — the button go open am.', 'Ṣé o ti ń gba ìfiṣura níbòmíràn (Calendly, fọ́ọ̀mù, ojúlé mìíràn)? Fi àlàyé àti ìjápọ̀ rẹ̀ kún — bọ́tìnnì yóò ṣí i.', 'Kana karɓar ajiya a wani wuri (Calendly, fom, wani shafi)? Ƙara bayanai da hanyarsa — maɓallin zai buɗe shi.', 'Ị na-anarịrị ndebanye ebe ọzọ (Calendly, fọm, saịtị ọzọ)? Tinye nkọwa na njikọ ya — bọtịnụ ga-emepe ya.'],
  ['Built-in booking is on {plan}', 'Built-in booking dey {plan}', 'Ìfiṣura inú-ilé wà lórí {plan}', 'Ajiya ta ciki tana kan {plan}', 'Ndebanye ime dị na {plan}'],
  ['You can set it up now; it can’t be published on your current plan.', 'You fit set am up now; e no fit publish for your current plan.', 'O lè ṣètò rẹ̀ báyìí; a kò lè tẹ̀ ẹ́ jáde lórí ètò rẹ lọ́wọ́lọ́wọ́.', 'Za ka iya saita shi yanzu; ba za a iya wallafa shi a tsarinka na yanzu ba.', 'Ị nwere ike setịpụ ya ugbu a; enweghị ike ibipụta ya na atụmatụ gị ugbu a.'],
  ['No services yet', 'No services yet', 'Kò sí iṣẹ́ síbẹ̀', 'Babu sabis tukuna', 'Enwebeghị ọrụ'],
  ['Add a service', 'Add service', 'Fi iṣẹ́ kún', 'Ƙara sabis', 'Tinye ọrụ'],
  ['Service', 'Service', 'Iṣẹ́', 'Sabis', 'Ọrụ'],
  ['off', 'off', 'ti pa', 'a kashe', 'agbanyụrụ'],
  ['Synced with Bookings', 'E dey match Bookings', 'Ó bá Ìfiṣura mu', 'Yana daidai da Ajiya', 'Ọ dakọrọ na Ndebanye'],
  ['{amount} deposit', '{amount} deposit', 'Ìsanwó-àkọ́kọ́ {amount}', 'Ajiyar {amount}', 'Nkwụnye ego {amount}'],
  ['Visitors pick from your live availability.', 'Visitors go pick from the time wey you dey free.', 'Àwọn àlejò ń yàn láti inú àkókò tí o wà.', 'Baƙi suna zaɓa daga lokutan da kake samuwa.', 'Ndị ọbịa na-ahọrọ site n’oge ị dị.'],
  ['Edit in Bookings', 'Edit for Bookings', 'Ṣàtúnṣe nínú Ìfiṣura', 'Gyara a Ajiya', 'Dezie na Ndebanye'],
  ['Leave blank to use the service name.', 'Leave am empty to use the service name.', 'Fi sílẹ̀ ní òfo láti lo orúkọ iṣẹ́ náà.', 'Bar shi babu komai don amfani da sunan sabis.', 'Hapụ ya efu iji jiri aha ọrụ ahụ.'],
  ['Service name', 'Service name', 'Orúkọ iṣẹ́', 'Sunan sabis', 'Aha ọrụ'],
  ['Duration', 'How long', 'Ìgbà tí ó gbà', 'Tsawon lokaci', 'Ogologo oge'],
  ['45 min', '45 min', 'Ìṣẹ́jú 45', 'Minti 45', 'Nkeji 45'],
  ['Price note', 'Price note', 'Àkọsílẹ̀ iye owó', 'Bayanin farashi', 'Ndetu ọnụahịa'],
  ['From ₦…', 'From ₦…', 'Láti ₦…', 'Daga ₦…', 'Site na ₦…'],
  ['Booking link', 'Booking link', 'Ìjápọ̀ ìfiṣura', 'Hanyar ajiya', 'Njikọ ndebanye'],
  ['For a calendar on your page with deposits and reminders, switch to “My services” above.', 'For calendar for your page with deposits and reminders, switch to “My services” for top.', 'Fún kàlẹ́ńdà lórí ojú-ìwé rẹ pẹ̀lú ìsanwó-àkọ́kọ́ àti ìránnilétí, yí padà sí “Àwọn iṣẹ́ mi” lókè.', 'Don kalanda a shafinka mai ajiya da tunatarwa, canza zuwa “Sabis na” a sama.', 'Maka kalenda na ibe gị nwere nkwụnye ego na ncheta, gbanwee gaa na “Ọrụ m” n’elu.'],
  // Subscription
  ['Subscriptions are on {plan}', 'Subscriptions dey {plan}', 'Àwọn ìforúkọsílẹ̀ wà lórí {plan}', 'Biyan kuɗi na lokaci-lokaci yana kan {plan}', 'Ndebanye aha dị na {plan}'],
  ['Set it up now; it can’t be published on your current plan.', 'Set am up now; e no fit publish for your current plan.', 'Ṣètò rẹ̀ báyìí; a kò lè tẹ̀ ẹ́ jáde lórí ètò rẹ lọ́wọ́lọ́wọ́.', 'Saita shi yanzu; ba za a iya wallafa shi a tsarinka na yanzu ba.', 'Setịpụ ya ugbu a; enweghị ike ibipụta ya na atụmatụ gị ugbu a.'],
  ['One line on why people join', 'One line on why people dey join', 'Ìlà kan lórí ìdí tí àwọn èèyàn fi ń darapọ̀', 'Layi ɗaya kan dalilin da mutane ke shiga', 'Otu ahịrị gbasara ihe mere ndị mmadụ ji esonye'],
  ['Plans to show (up to 3)', 'Plans to show (up to 3)', 'Ètò láti fi hàn (títí dé 3)', 'Tsare-tsaren da za a nuna (har zuwa 3)', 'Atụmatụ a ga-egosi (ruo 3)'],
  ['No plans yet', 'No plans yet', 'Kò sí ètò síbẹ̀', 'Babu tsari tukuna', 'Enwebeghị atụmatụ'],
  ['Create a plan', 'Create plan', 'Ṣẹ̀dá ètò kan', 'Ƙirƙiri tsari', 'Mepụta atụmatụ'],
  ['Box', 'Box', 'Àpótí', 'Akwati', 'Igbe'],
  ['Membership', 'Membership', 'Ọmọ ẹgbẹ́', 'Zama memba', 'Ndị otu'],
  ['{n} subscribed', '{n} don subscribe', '{n} ti forúkọ sílẹ̀', '{n} sun yi rajista', '{n} edebanyela aha'],
  ['Highlight', 'Highlight', 'Ṣàfihàn', 'Haskaka', 'Mee ka ọ pụta ìhè'],
  ['None', 'None', 'Kò sí', 'Babu', 'Ọ dịghị'],
  ['Plans with a free trial say “Start free trial” instead.', 'Plans wey get free trial go talk “Start free trial” instead.', 'Ètò tí ó ní ìdánwò ọ̀fẹ́ ń sọ “Bẹ̀rẹ̀ ìdánwò ọ̀fẹ́” dípò rẹ̀.', 'Tsare-tsaren da ke da gwaji kyauta suna cewa “Fara gwaji kyauta” maimakon haka.', 'Atụmatụ nwere nnwale efu na-ekwu “Malite nnwale efu” kama.'],
  ['Synced with Subscriptions', 'E dey match Subscriptions', 'Ó bá Ìforúkọsílẹ̀ mu', 'Yana daidai da Biyan kuɗi na lokaci-lokaci', 'Ọ dakọrọ na Ndebanye aha'],
  ['Prices, trials and benefits update here when you edit the plan. Full plans show “Full right now”.', 'Prices, trials and benefits go update here when you edit the plan. Plans wey full go show “Full right now”.', 'Iye owó, ìdánwò àti àǹfààní ń ṣe àtúnṣe níbí nígbà tí o bá ṣàtúnṣe ètò. Ètò tí ó kún ń fi “Ó kún báyìí” hàn.', 'Farashi, gwaji da fa’idodi suna sabuntawa a nan idan ka gyara tsarin. Tsare-tsaren da suka cika suna nuna “Ya cika yanzu”.', 'Ọnụahịa, nnwale na uru na-emelite ebe a mgbe ị dezigharịrị atụmatụ. Atụmatụ juru eju na-egosi “Ọ juru ugbu a”.'],
  // Course
  ['No courses yet', 'No courses yet', 'Kò sí ẹ̀kọ́ síbẹ̀', 'Babu kwas tukuna', 'Enwebeghị ọmụmụ'],
  ['Build one with modules and lessons, then show it here.', 'Build one with modules and lessons, then show am here.', 'Kọ́ ọ̀kan pẹ̀lú àwọn ìpín àti ẹ̀kọ́, lẹ́yìn náà fi hàn níbí.', 'Gina ɗaya da sassa da darussa, sannan ka nuna shi a nan.', 'Wuo otu nwere akụkụ na nkuzi, wee gosi ya ebe a.'],
  ['Create a course', 'Create course', 'Ṣẹ̀dá ẹ̀kọ́ kan', 'Ƙirƙiri kwas', 'Mepụta ọmụmụ'],
  ['Course', 'Course', 'Ẹ̀kọ́', 'Kwas', 'Ọmụmụ'],
  ['Choose a course…', 'Choose course…', 'Yan ẹ̀kọ́ kan…', 'Zaɓi kwas…', 'Họrọ ọmụmụ…'],
  ['Untitled course', 'Course wey no get name', 'Ẹ̀kọ́ tí kò ní àkọlé', 'Kwas mara suna', 'Ọmụmụ enweghị aha'],
  ['Free', 'Free', 'Ọ̀fẹ́', 'Kyauta', 'Efu'],
  ['Paid', 'Paid', 'Ti sanwó', 'Da kuɗi', 'Kwụrụ ụgwọ'],
  ['With a membership', 'With membership', 'Pẹ̀lú ọmọ ẹgbẹ́', 'Tare da zama memba', 'Ya na ndị otu'],
  ['{n} lessons', '{n} lessons', 'Ẹ̀kọ́ {n}', 'Darussa {n}', 'Nkuzi {n}'],
  ['How much to show', 'How much to show', 'Iye tí a ó fi hàn', 'Nawa za a nuna', 'Ole a ga-egosi'],
  ['Card', 'Card', 'Káàdì', 'Kati', 'Kaadị'],
  ['Card + modules', 'Card + modules', 'Káàdì + àwọn ìpín', 'Kati + sassa', 'Kaadị + akụkụ'],
  ['Start free / See the course', 'Start free / See the course', 'Bẹ̀rẹ̀ lọ́fẹ̀ẹ́ / Wo ẹ̀kọ́ náà', 'Fara kyauta / Duba kwas', 'Malite n’efu / Hụ ọmụmụ ahụ'],
  ['Empty picks one to suit the course.', 'If e empty, we go pick one wey fit the course.', 'Bí ó bá ṣófo, a ó yan èyí tí ó bá ẹ̀kọ́ náà mu.', 'Idan babu komai, za a zaɓi wanda ya dace da kwas.', 'Ọ bụrụ na ọ tọgbọ chakoo, a ga-ahọrọ nke dabara na ọmụmụ ahụ.'],
  ['Synced with Courses', 'E dey match Courses', 'Ó bá Ẹ̀kọ́ mu', 'Yana daidai da Kwasa-kwasai', 'Ọ dakọrọ na Ọmụmụ'],
  ['Title, price and lessons update here. The button opens the course page, where people preview, buy, join or continue.', 'Title, price and lessons dey update here. The button dey open the course page, where people go preview, buy, join or continue.', 'Àkọlé, iye owó àti ẹ̀kọ́ ń ṣe àtúnṣe níbí. Bọ́tìnnì ń ṣí ojú-ìwé ẹ̀kọ́, níbi tí àwọn èèyàn ti ń wò ṣáájú, rà, darapọ̀ tàbí tẹ̀síwájú.', 'Taken, farashi da darussa suna sabuntawa a nan. Maɓallin yana buɗe shafin kwas, inda mutane ke dubawa, saya, shiga ko ci gaba.', 'Aha, ọnụahịa na nkuzi na-emelite ebe a. Bọtịnụ na-emepe ibe ọmụmụ, ebe ndị mmadụ na-ele, zụta, sonye ma ọ bụ gaa n’ihu.'],
  // Form
  ['Forms is a premium add-on', 'Forms na premium add-on', 'Fọ́ọ̀mù jẹ́ àfikún olówó', 'Fom ƙari ne na musamman', 'Fọm bụ mgbakwunye pụrụ iche'],
  ['Get Forms', 'Get Forms', 'Gba Fọ́ọ̀mù', 'Samu Fom', 'Nweta Fọm'],
  ['Build the block now; it publishes once Forms is installed.', 'Build the block now; e go publish once Forms don install.', 'Kọ́ búlọ́ọ̀kù náà báyìí; yóò jáde nígbà tí a bá ti fi Fọ́ọ̀mù sórí ẹ̀rọ.', 'Gina tubalin yanzu; zai wallafa da zarar an shigar da Fom.', 'Wuo blọk ahụ ugbu a; ọ ga-ebipụta ozugbo etinyere Fọm.'],
  ['Form', 'Form', 'Fọ́ọ̀mù', 'Fom', 'Fọm'],
  ['Choose a form…', 'Choose form…', 'Yan fọ́ọ̀mù kan…', 'Zaɓi fom…', 'Họrọ fọm…'],
  ['No forms yet', 'No forms yet', 'Kò sí fọ́ọ̀mù síbẹ̀', 'Babu fom tukuna', 'Enwebeghị fọm'],
  ['Live', 'Live', 'Ń lọ lọ́wọ́', 'Kai tsaye', 'Dị ndụ'],
  ['Closed', 'Closed', 'Ti tì', 'An rufe', 'Emechiri'],
  ['Show the form’s name as a heading', 'Show the form name as heading', 'Fi orúkọ fọ́ọ̀mù hàn bí àkọlé', 'Nuna sunan fom a matsayin kanun labari', 'Gosi aha fọm dịka isiokwu'],
  ['Edit this form', 'Edit this form', 'Ṣàtúnṣe fọ́ọ̀mù yìí', 'Gyara wannan fom', 'Dezie fọm a'],
  ['All forms', 'All forms', 'Gbogbo fọ́ọ̀mù', 'Duk fom', 'Fọm niile'],
  ['Fields, steps and rules are edited in Forms; changes show here straight away. Submissions go to the form’s inbox and to Audience.', 'Na for Forms you go edit fields, steps and rules; changes go show here sharp-sharp. Submissions dey go the form inbox and Audience.', 'A ń ṣàtúnṣe àwọn àyè, ìgbésẹ̀ àti òfin nínú Fọ́ọ̀mù; àyípadà ń hàn níbí lẹ́sẹ̀kẹsẹ̀. Ìfisílẹ̀ ń lọ sí àpótí fọ́ọ̀mù àti Àwọn olùgbọ́.', 'Ana gyara filaye, matakai da ƙa’idoji a Fom; canje-canje suna bayyana a nan nan take. Abubuwan da aka aika suna zuwa akwatin fom da Masu sauraro.', 'A na-edezi ubi, nzọụkwụ na iwu na Fọm; mgbanwe na-egosi ebe a ozugbo. Ihe e zigara na-aga na igbe fọm na Ndị na-ege ntị.'],
  // Checks
  ['Choose at least one plan from Commerce → Subscriptions', 'Choose at least one plan from Commerce → Subscriptions', 'Yan ètò kan ó kéré tán láti Ìṣòwò → Ìforúkọsílẹ̀', 'Zaɓi aƙalla tsari ɗaya daga Kasuwanci → Biyan kuɗi na lokaci-lokaci', 'Họrọ opekata mpe otu atụmatụ site na Azụmahịa → Ndebanye aha'],
  ['More than three plans is hard to compare on a phone', 'More than three plans hard to compare for phone', 'Ètò tí ó ju mẹ́ta lọ ṣòro láti fi wé ara wọn lórí fóònù', 'Tsare-tsare fiye da uku suna da wahalar kwatantawa a waya', 'Atụmatụ karịrị atọ siri ike itụnyere na ekwentị'],
  ['Choose a course from Commerce → Courses', 'Choose course from Commerce → Courses', 'Yan ẹ̀kọ́ kan láti Ìṣòwò → Ẹ̀kọ́', 'Zaɓi kwas daga Kasuwanci → Kwasa-kwasai', 'Họrọ ọmụmụ site na Azụmahịa → Ọmụmụ'],
  ['Choose a form from Forms', 'Choose form from Forms', 'Yan fọ́ọ̀mù kan láti Fọ́ọ̀mù', 'Zaɓi fom daga Fom', 'Họrọ fọm site na Fọm'],
  ['Choose a service from Bookings', 'Choose service from Bookings', 'Yan iṣẹ́ kan láti Ìfiṣura', 'Zaɓi sabis daga Ajiya', 'Họrọ ọrụ site na Ndebanye'],
  ['Add a service name', 'Add service name', 'Fi orúkọ iṣẹ́ kún', 'Ƙara sunan sabis', 'Tinye aha ọrụ'],
  ['Add a booking link starting with https://', 'Add booking link wey start with https://', 'Fi ìjápọ̀ ìfiṣura tí ó bẹ̀rẹ̀ pẹ̀lú https:// kún', 'Ƙara hanyar ajiya da ta fara da https://', 'Tinye njikọ ndebanye malitere na https://'],
];

const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(signupBlockFieldsRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const signupBlockFieldsPcm = column(1);
export const signupBlockFieldsYo = column(2);
export const signupBlockFieldsHa = column(3);
export const signupBlockFieldsIg = column(4);
