/**
 * Canvas page panel, special-page cards part 1 (D307): Campaign, Booking page and Members area settings.
 * DRAFTS — every non-English line needs a native speaker's check. Row: [English, Naijá, Yorùbá, Hausa, Igbo].
 */
export const specialPages1Rows: [string, string, string, string, string][] = [
  // Campaign
  ['Campaign', 'Campaign', 'Ìpolongo', 'Kamfen', 'Mkpọsa'],
  ['Sale', 'Sale', 'Títà ẹ̀dínwó', 'Rangwame', 'Ọrịre mbelata'],
  ['Product launch', 'Product launch', 'Ìfilọ́lẹ̀ ọjà', 'Ƙaddamar da kaya', 'Mwepụta ngwaahịa'],
  ['Now: {phase}', 'Now: {phase}', 'Báyìí: {phase}', 'Yanzu: {phase}', 'Ugbu a: {phase}'],
  ['Before', 'Before', 'Ṣáájú', 'Kafin', 'Tupu'],
  ['Starts {when}', 'E go start {when}', 'Ó bẹ̀rẹ̀ {when}', 'Zai fara {when}', 'Ọ ga-amalite {when}'],
  ['Ends {when}', 'E go end {when}', 'Ó parí {when}', 'Zai ƙare {when}', 'Ọ ga-agwụ {when}'],
  ['Ended {when}', 'E don end {when}', 'Ó parí {when}', 'Ya ƙare {when}', 'Ọ gwụrụ {when}'],
  ['No end date', 'No end date', 'Kò ní ọjọ́ ìparí', 'Babu ranar ƙarewa', 'Enweghị ụbọchị njedebe'],
  ['Empty = starts as soon as it’s published.', 'Empty = e go start as soon as you publish am.', 'Òfo = ó bẹ̀rẹ̀ ní kété tí a bá tẹ̀ ẹ́ jáde.', 'Babu komai = zai fara da zarar an wallafa.', 'Efu = ọ na-amalite ozugbo ebipụtara ya.'],
  ['Needed to publish.', 'You need am to publish.', 'Ó pọn dandan láti tẹ̀ ẹ́ jáde.', 'Ana buƙata don wallafa.', 'Achọrọ ya iji bipụta.'],
  ['Times are in {zone}. Visitors see the Before, Live and Ended versions automatically.', 'Times dey for {zone}. Visitors go see Before, Live and Ended versions by themselves.', 'Àkókò wà ní {zone}. Àwọn àlejò ń rí ẹ̀yà Ṣáájú, Ń lọ àti Ti parí fúnra wọn.', 'Lokuta suna cikin {zone}. Baƙi suna ganin sigar Kafin, Kai tsaye da Ya ƙare ta atomatik.', 'Oge dị na {zone}. Ndị ọbịa na-ahụ ụdị Tupu, Dị ndụ na Agwụla n’onwe ha.'],
  ['Discount code', 'Discount code', 'Kóòdù ẹ̀dínwó', 'Lambar rangwame', 'Koodu mbelata'],
  ['optional', 'optional', 'àṣàyàn', 'na zaɓi', 'nhọrọ'],
  ['No discount', 'No discount', 'Kò sí ẹ̀dínwó', 'Babu rangwame', 'Enweghị mbelata'],
  ['Applied automatically at checkout while the campaign is live.', 'E go apply by itself for checkout while the campaign dey live.', 'Ó ń ṣiṣẹ́ fúnra rẹ̀ nígbà ìsanwó nígbà tí ìpolongo ń lọ lọ́wọ́.', 'Ana amfani da shi ta atomatik a wurin biya yayin da kamfen ke gudana.', 'A na-etinye ya n’onwe ya mgbe ịkwụ ụgwọ mgbe mkpọsa na-aga.'],
  ['Manage discounts', 'Manage discounts', 'Ṣàkóso ẹ̀dínwó', 'Sarrafa rangwame', 'Jikwaa mbelata'],
  ['Featured products', 'Main products', 'Àwọn ọjà àfihàn', 'Kayayyakin da aka fifita', 'Ngwaahịa pụrụ iche'],
  ['No products yet.', 'No products yet.', 'Kò sí ọjà síbẹ̀.', 'Babu kaya tukuna.', 'Enwebeghị ngwaahịa.'],
  ['Add products', 'Add products', 'Fi ọjà kún', 'Ƙara kaya', 'Tinye ngwaahịa'],
  ['Checked before publishing for stock and status. Add a Product grid block to show them.', 'We dey check stock and status before you publish. Add Product grid block to show dem.', 'A ń ṣàyẹ̀wò ọjà tí ó kù àti ipò kí a tó tẹ̀ ẹ́ jáde. Fi búlọ́ọ̀kù Àwọ̀n ọjà kún láti fi wọ́n hàn.', 'Ana duba adadin kaya da matsayi kafin wallafa. Ƙara tubalin Grid na kaya don nuna su.', 'A na-enyocha ngwaahịa fọdụrụ na ọnọdụ tupu ibipụta. Tinye blọk Grid ngwaahịa iji gosi ha.'],
  ['Orders', 'Orders', 'Àwọn àṣẹ', 'Oda', 'Ọda'],
  ['Revenue', 'Money wey enter', 'Owó-wíwọlé', 'Kuɗin shiga', 'Ego enwetara'],
  ['Discounted', 'Discount', 'Ẹ̀dínwó', 'Rangwame', 'Mbelata'],
  // Booking page
  ['Booking page', 'Booking page', 'Ojú-ìwé ìfiṣura', 'Shafin ajiya', 'Ibe ndebanye'],
  ['Services: {n}', 'Services: {n}', 'Iṣẹ́: {n}', 'Sabis: {n}', 'Ọrụ: {n}'],
  ['with free times: {n}', 'with free time: {n}', 'pẹ̀lú àkókò tí ó ṣófo: {n}', 'da lokacin kyauta: {n}', 'nwere oge efu: {n}'],
  ['No services showing', 'No services dey show', 'Kò sí iṣẹ́ tí ń hàn', 'Babu sabis da ake nunawa', 'Ọ dịghị ọrụ na-egosi'],
  ['Needs services', 'E need services', 'Ó nílò iṣẹ́', 'Yana buƙatar sabis', 'Ọ chọrọ ọrụ'],
  ['Taking bookings', 'We dey take bookings', 'Ń gba ìfiṣura', 'Ana karɓar ajiya', 'Na-anara ndebanye'],
  ['Fully booked', 'E don full', 'Ti kún', 'Ya cika', 'Ọ juru'],
  ['Book an appointment', 'Book appointment', 'Fiṣura ìpàdé', 'Yi ajiyar ganawa', 'Debanye oge nzukọ'],
  ['{n} of up to {max}', '{n} of up to {max}', '{n} nínú {max}', '{n} daga har zuwa {max}', '{n} n’ime ruo {max}'],
  ['No services in Bookings yet.', 'No services for Bookings yet.', 'Kò sí iṣẹ́ nínú Ìfiṣura síbẹ̀.', 'Babu sabis a Ajiya tukuna.', 'Enwebeghị ọrụ na Ndebanye.'],
  ['Switched off in Bookings — won’t show', 'E don off for Bookings — e no go show', 'A ti pa á nínú Ìfiṣura — kò ní hàn', 'An kashe a Ajiya — ba zai bayyana ba', 'Agbanyụrụ ya na Ndebanye — ọ gaghị egosi'],
  ['Next free: {when}', 'Next free time: {when}', 'Àkókò tí ó ṣófo tó ń bọ̀: {when}', 'Na gaba mara aiki: {when}', 'Oge efu na-esote: {when}'],
  ['No free times', 'No free time', 'Kò sí àkókò tí ó ṣófo', 'Babu lokacin kyauta', 'Enweghị oge efu'],
  ['Prices, durations, deposits, hours and cancellation rules come from Bookings — change them there.', 'Prices, how long, deposits, hours and cancellation rules dey come from Bookings — change dem there.', 'Iye owó, ìgbà, ìsanwó-àkọ́kọ́, wákàtí àti òfin ìfagilé wá láti Ìfiṣura — yí wọn padà níbẹ̀.', 'Farashi, tsawon lokaci, ajiya, sa’o’i da ƙa’idojin sokewa suna fitowa daga Ajiya — canza su a can.', 'Ọnụahịa, ogologo oge, nkwụnye ego, awa na iwu nkagbu si na Ndebanye — gbanwee ha ebe ahụ.'],
  ['When there are no free times', 'When no free time dey', 'Nígbà tí kò bá sí àkókò tí ó ṣófo', 'Idan babu lokacin kyauta', 'Mgbe enweghị oge efu'],
  ['Use the full number, e.g. 0803 123 4567.', 'Use the full number, like 0803 123 4567.', 'Lo nọ́ńbà kíkún, bí 0803 123 4567.', 'Yi amfani da cikakkiyar lamba, misali 0803 123 4567.', 'Jiri nọmba zuru ezu, dịka 0803 123 4567.'],
  ['e.g. 0803 123 4567', 'like 0803 123 4567', 'bí 0803 123 4567', 'misali 0803 123 4567', 'dịka 0803 123 4567'],
  ['Offered as “Message on WhatsApp”.', 'We go offer am as “Message on WhatsApp”.', 'A ń fúnni bí “Fi ìfiránṣẹ́ ránṣẹ́ lórí WhatsApp”.', 'Ana bayarwa a matsayin “Aika saƙo a WhatsApp”.', 'A na-enye ya dịka “Ziga ozi na WhatsApp”.'],
  ['Empty = not offered.', 'Empty = we no go offer am.', 'Òfo = a kò fúnni.', 'Babu komai = ba a bayar ba.', 'Efu = anaghị enye ya.'],
  ['The “Join the waitlist” button jumps to the waitlist sign-up on this page.', 'The “Join the waitlist” button go jump to the waitlist sign-up for this page.', 'Bọ́tìnnì “Darapọ̀ mọ́ àkójọ ìdúró” ń fò sí ìforúkọsílẹ̀ àkójọ ìdúró lórí ojú-ìwé yìí.', 'Maɓallin “Shiga jerin jira” yana tsalle zuwa rajistar jerin jira a wannan shafi.', 'Bọtịnụ “Sonye na ndepụta nchere” na-awụ gaa na ndebanye ndepụta nchere na ibe a.'],
  ['The waitlist sign-up has been removed or hidden, so only WhatsApp is offered.', 'The waitlist sign-up don comot or hide, so na only WhatsApp we dey offer.', 'A ti yọ ìforúkọsílẹ̀ àkójọ ìdúró kúrò tàbí fi pamọ́, nítorí náà WhatsApp nìkan ni a ń fúnni.', 'An cire ko an ɓoye rajistar jerin jira, don haka WhatsApp kawai ake bayarwa.', 'Ewepụla ma ọ bụ zoo ndebanye ndepụta nchere, ya mere naanị WhatsApp ka a na-enye.'],
  ['Hours & rules', 'Hours & rules', 'Wákàtí & òfin', 'Sa’o’i & ƙa’idoji', 'Awa & iwu'],
  ['QR code for flyers', 'QR code for flyers', 'Kóòdù QR fún ìwé ìpolówó', 'Lambar QR don takardun talla', 'Koodu QR maka akwụkwọ mgbasa ozi'],
  // Members area
  ['Members area', 'Members area', 'Agbègbè ọmọ ẹgbẹ́', 'Yankin mambobi', 'Mpaghara ndị otu'],
  ['People with access right now:', 'People wey get access now:', 'Àwọn tí ó ní ìwọlé báyìí:', 'Mutanen da ke da damar shiga yanzu:', 'Ndị nwere ohere ugbu a:'],
  ['Members only', 'Members only', 'Ọmọ ẹgbẹ́ nìkan', 'Mambobi kawai', 'Ndị otu naanị'],
  ['Who gets in', 'Who fit enter', 'Ta ni ó lè wọlé', 'Wa ke shiga', 'Onye na-abanye'],
  ['No membership plans yet.', 'No membership plans yet.', 'Kò sí ètò ọmọ ẹgbẹ́ síbẹ̀.', 'Babu tsarin zama memba tukuna.', 'Enwebeghị atụmatụ ndị otu.'],
  ['Create one in Subscriptions', 'Create one for Subscriptions', 'Ṣẹ̀dá ọ̀kan nínú Ìforúkọsílẹ̀', 'Ƙirƙiri ɗaya a Biyan kuɗi na lokaci-lokaci', 'Mepụta otu na Ndebanye aha'],
  ['{price} a week', '{price} every week', '{price} lọ́sẹ̀', '{price} a mako', '{price} kwa izu'],
  ['{price} a month', '{price} every month', '{price} lóṣù', '{price} a wata', '{price} kwa ọnwa'],
  ['{price} a quarter', '{price} every three months', '{price} ní oṣù mẹ́ta', '{price} a kowane wata uku', '{price} kwa ọnwa atọ'],
  ['{price} a year', '{price} every year', '{price} lọ́dún', '{price} a shekara', '{price} kwa afọ'],
  ['archived, nobody new can join', 'archived, nobody new fit join', 'ní ìpamọ́, kò sí ẹni tuntun tí ó lè darapọ̀', 'an adana, babu sabon da zai iya shiga', 'edebere, ọ dịghị onye ọhụrụ nwere ike isonye'],
  ['Active and trial subscribers get in. Cancelled members keep access until the end of the period they paid for; failed payments keep access during the grace period. Paused and ended subscriptions don’t get in.', 'Active and trial subscribers fit enter. Members wey cancel go keep access until the end of the time wey dem pay for; failed payments go keep access during grace period. Paused and ended subscriptions no fit enter.', 'Àwọn olùforúkọsílẹ̀ tí ń ṣiṣẹ́ àti ti ìdánwò ń wọlé. Àwọn tí ó fagilé ń ní ìwọlé títí di òpin àsìkò tí wọ́n sanwó fún; ìsanwó tí ó kùnà ń ní ìwọlé nígbà àkókò àánú. Àwọn tí a dá dúró àti tí ó ti parí kò ní wọlé.', 'Masu biyan kuɗi masu aiki da na gwaji suna shiga. Mambobin da suka soke suna riƙe damar shiga har ƙarshen lokacin da suka biya; biyan da ya gaza yana riƙe damar a lokacin alheri. Waɗanda aka dakatar da waɗanda suka ƙare ba sa shiga.', 'Ndị debanyere aha na-arụ ọrụ na ndị nnwale na-abanye. Ndị kagburu na-edebe ohere ruo njedebe oge ha kwụrụ ụgwọ ya; ịkwụ ụgwọ dara ada na-edebe ohere n’oge amara. Ndebanye akwụsịtụrụ na ndị gwụrụ anaghị abanye.'],
  ['Welcome card for everyone else', 'Welcome card for everybody else', 'Káàdì káàbọ̀ fún gbogbo àwọn yòókù', 'Katin maraba ga kowa', 'Kaadị nnabata maka ndị ọzọ niile'],
  ['Members get the full course here', 'Members go get the full course here', 'Àwọn ọmọ ẹgbẹ́ ń gba ẹ̀kọ́ kíkún níbí', 'Mambobi suna samun cikakken kwas a nan', 'Ndị otu na-enweta ọmụmụ zuru ezu ebe a'],
  ['What members get', 'Wetin members go get', 'Ohun tí àwọn ọmọ ẹgbẹ́ ń gbà', 'Abin da mambobi ke samu', 'Ihe ndị otu na-enweta'],
  ['Shown above Join and Sign in. Only promise what you actually provide.', 'E go show above Join and Sign in. Promise only wetin you dey provide for real.', 'Ó ń hàn lókè Darapọ̀ àti Wọlé. Ṣèlérí ohun tí o ń pèsè gan-an nìkan.', 'Ana nunawa sama da Shiga da Shiga ciki. Yi alkawarin abin da kake bayarwa da gaske kawai.', 'Egosiri ya n’elu Sonye na Banye. Kwe nkwa naanị ihe ị na-enye n’ezie.'],
  ['Become a member', 'Become member', 'Di ọmọ ẹgbẹ́', 'Zama memba', 'Bụrụ onye otu'],
  ['With more than one plan, visitors see a Join button per plan instead.', 'If plans pass one, visitors go see Join button for each plan instead.', 'Pẹ̀lú ètò tí ó ju ọ̀kan lọ, àwọn àlejò ń rí bọ́tìnnì Darapọ̀ fún ètò kọ̀ọ̀kan dípò.', 'Idan tsare-tsare sun fi ɗaya, baƙi suna ganin maɓallin Shiga ga kowane tsari maimakon haka.', 'Ma atụmatụ karịrị otu, ndị ọbịa na-ahụ bọtịnụ Sonye maka atụmatụ ọ bụla kama.'],
  ['Privacy is simulated in this prototype', 'Privacy na pretend for this prototype', 'A ṣe àfarawé àṣírí nínú àpẹẹrẹ yìí', 'An kwaikwayi sirri a wannan samfurin', 'E mere ka nzuzo dị na ihe nlereanya a'],
  ['One-time sign-in codes aren’t really sent, and page content and files aren’t stored privately — so this area is only as private as that simulation. Don’t put anything truly confidential here yet.', 'We no dey really send one-time sign-in codes, and page content and files no dey stored privately — so this area private only like that pretend. No put anything wey really secret here yet.', 'A kò fi kóòdù wíwọlé ẹ̀ẹ̀kan ránṣẹ́ gan-an, a kò sì tọ́jú àkóónú ojú-ìwé àti fáìlì ní àṣírí — nítorí náà agbègbè yìí jẹ́ àṣírí bí àfarawé yẹn nìkan. Má ṣe fi ohunkóhun tí ó jẹ́ àṣírí gidi síbí síbẹ̀.', 'Ba a aika lambobin shiga na sau ɗaya da gaske ba, kuma ba a adana abubuwan shafi da fayiloli a sirri ba — don haka wannan yanki sirri ne kawai kamar wannan kwaikwayo. Kada ka saka wani abu na sirri na gaske a nan tukuna.', 'Anaghị ezipụ koodu ịbanye otu ugboro n’ezie, anaghịkwa echekwa ọdịnaya ibe na faịlụ na nzuzo — ya mere mpaghara a dị nzuzo naanị dịka nṅomi ahụ. Etinyela ihe ọ bụla bụ ezigbo nzuzo ebe a ugbu a.'],
  ['Subscriptions & members', 'Subscriptions & members', 'Ìforúkọsílẹ̀ & ọmọ ẹgbẹ́', 'Biyan kuɗi & mambobi', 'Ndebanye aha & ndị otu'],
];

const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(specialPages1Rows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const specialPages1Pcm = column(1);
export const specialPages1Yo = column(2);
export const specialPages1Ha = column(3);
export const specialPages1Ig = column(4);
