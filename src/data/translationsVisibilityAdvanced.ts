/**
 * Visibility tab → advanced (D314): the visitor-source rule and the A/B test.
 * DRAFTS — every non-English line needs a native speaker's check. Row: [English, Naijá, Yorùbá, Hausa, Igbo].
 */
export const visibilityAdvancedRows: [string, string, string, string, string][] = [
// Visitor source
['Show by visitor source', 'Show by where visitor come from', 'Fi hàn nípa orísun àlejò', 'Nuna ta tushen baƙo', 'Gosi site n’ebe onye ọbịa si'],
['IntentFlow · based only on where the visit came from — a link, a QR code or the site that sent them.', 'IntentFlow · na only where the visit come from — link, QR code or the site wey send dem.', 'IntentFlow · ó dá lórí ibi tí ìbẹ̀wò ti wá nìkan — ìjápọ̀, kóòdù QR tàbí ojú-òpó tí ó rán wọn.', 'IntentFlow · bisa inda ziyarar ta fito kawai — hanya, lambar QR ko shafin da ya aiko su.', 'IntentFlow · dabere naanị n’ebe nleta si — njikọ, koodu QR ma ọ bụ saịtị zitere ha.'],
['Paused', 'E don pause', 'Ó dúró', 'An dakatar', 'Akwụsịtụrụ'],
['Rule on', 'Rule dey on', 'Òfin ń ṣiṣẹ́', 'Ƙa’ida tana aiki', 'Iwu na-arụ ọrụ'],
['Who sees this block', 'Who go see this block', 'Ta ni ó ń rí búlọ́ọ̀kù yìí', 'Wa ke ganin wannan tubali', 'Onye na-ahụ blọk a'],
['Everyone', 'Everybody', 'Gbogbo ènìyàn', 'Kowa', 'Onye ọ bụla'],
['Only', 'Only', 'Nìkan', 'Kawai', 'Naanị'],
['All except', 'Everybody except', 'Gbogbo àyàfi', 'Duka sai', 'Ha niile ma e wezụga'],
['Show only to visits from', 'Show only to visits from', 'Fi hàn fún ìbẹ̀wò láti ibí nìkan', 'Nuna ga ziyara daga kawai', 'Gosi naanị nleta si'],
['Hide from visits from', 'Hide from visits from', 'Fi pamọ́ fún ìbẹ̀wò láti', 'Ɓoye daga ziyara daga', 'Zoo nleta si'],
['Everyone (no sources picked)', 'Everybody (no source picked)', 'Gbogbo ènìyàn (a kò yan orísun kankan)', 'Kowa (ba a zaɓi tushe ba)', 'Onye ọ bụla (ahọrọghị ebe ọ bụla)'],
['Only visits from {list}', 'Only visits from {list}', 'Ìbẹ̀wò láti {list} nìkan', 'Ziyara daga {list} kawai', 'Naanị nleta si {list}'],
['Everyone except visits from {list}', 'Everybody except visits from {list}', 'Gbogbo ènìyàn àyàfi ìbẹ̀wò láti {list}', 'Kowa sai ziyara daga {list}', 'Onye ọ bụla ma e wezụga nleta si {list}'],
['Everyone else doesn’t see it.', 'Everybody else no go see am.', 'Àwọn yòókù kò rí i.', 'Sauran ba sa ganinsa.', 'Ndị ọzọ anaghị ahụ ya.'],
['Everyone else sees it as normal.', 'Everybody else go see am as normal.', 'Àwọn yòókù ń rí i bí ó ti máa ń rí.', 'Sauran suna ganinsa kamar yadda aka saba.', 'Ndị ọzọ na-ahụ ya dịka ọ dị.'],
['Goal to measure', 'Goal to measure', 'Ète láti wọ̀n', 'Manufar aunawa', 'Ebumnuche a ga-atụ'],
['Taps on this block', 'Taps for this block', 'Ìtẹ̀ lórí búlọ́ọ̀kù yìí', 'Taɓawa a kan wannan tubali', 'Mpị na blọk a'],
['Orders', 'Orders', 'Àwọn àṣẹ', 'Oda', 'Ọda'],
['Enquiries and sign-ups', 'Enquiries and sign-ups', 'Ìbéèrè àti ìforúkọsílẹ̀', 'Tambayoyi da rajista', 'Ajụjụ na ndebanye'],
['Bookings', 'Bookings', 'Ìfiṣura', 'Ajiya', 'Ndebanye'],
['Shown on the IntentFlow screen, compared with visitors the rule doesn’t target.', 'E go show for IntentFlow screen, compare with visitors wey the rule no target.', 'Ó ń hàn lójú-ìbojú IntentFlow, a fi wé àwọn àlejò tí òfin kò dojú kọ.', 'Ana nunawa a allon IntentFlow, an kwatanta da baƙin da ƙa’idar ba ta nufa ba.', 'Egosiri ya na ihuenyo IntentFlow, a tụnyere ya na ndị ọbịa iwu ahụ anaghị elekwasị anya.'],
['Pause this rule', 'Pause this rule', 'Dá òfin yìí dúró', 'Dakatar da wannan ƙa’ida', 'Kwụsịtụ iwu a'],
['Paused, everyone sees the block. Your choices are kept.', 'When e pause, everybody go see the block. We go keep your choices.', 'Nígbà tí ó bá dúró, gbogbo ènìyàn ń rí búlọ́ọ̀kù. A pa àṣàyàn rẹ mọ́.', 'Idan an dakatar, kowa yana ganin tubalin. Ana ajiye zaɓuɓɓukanka.', 'Mgbe akwụsịtụrụ, onye ọ bụla na-ahụ blọk ahụ. A na-edobe nhọrọ gị.'],
['Preview as: {source}', 'Preview as: {source}', 'Wò ó bí: {source}', 'Duba a matsayin: {source}', 'Lee dịka: {source}'],
['See results', 'See results', 'Wo àbájáde', 'Duba sakamako', 'Hụ nsonaazụ'],
// A/B test
['A/B test', 'A/B test', 'Ìdánwò A/B', 'Gwajin A/B', 'Nnwale A/B'],
['Try two versions — a different headline, photo or button — and see which gets more results. Half of visits see each.', 'Try two versions — different headline, photo or button — and see which one go bring more results. Half of visits go see each.', 'Gbìyànjú ẹ̀yà méjì — àkọlé, fọ́tò tàbí bọ́tìnnì tó yàtọ̀ — kí o sì wo èyí tí ó mú àbájáde púpọ̀ wá. Ìdajì ìbẹ̀wò ń rí ọ̀kọ̀ọ̀kan.', 'Gwada siga biyu — kanun labari, hoto ko maɓalli daban — ka ga wanda ya fi samun sakamako. Rabin ziyara suna ganin kowanne.', 'Nwalee ụdị abụọ — isiokwu, foto ma ọ bụ bọtịnụ dị iche — hụ nke na-enweta nsonaazụ karịa. Ọkara nleta na-ahụ nke ọ bụla.'],
['Judge it by', 'Judge am by', 'Ṣe ìdájọ́ rẹ̀ nípa', 'Yi hukunci ta', 'Kpee ya ikpe site na'],
['Version B added below', 'Version B don add for below', 'A ti fi ẹ̀yà B kún nísàlẹ̀', 'An ƙara siga B a ƙasa', 'Etinyela ụdị B n’okpuru'],
['Change something in version B, then publish to start the test.', 'Change something for version B, then publish to start the test.', 'Yí nǹkan padà nínú ẹ̀yà B, lẹ́yìn náà tẹ̀ ẹ́ jáde láti bẹ̀rẹ̀ ìdánwò.', 'Canza wani abu a siga B, sannan ka wallafa don fara gwajin.', 'Gbanwee ihe na ụdị B, wee bipụta iji malite nnwale.'],
['Test a different version', 'Test different version', 'Dán ẹ̀yà mìíràn wò', 'Gwada wata siga', 'Nwalee ụdị ọzọ'],
['The other version was deleted.', 'The other version don delete.', 'A ti pa ẹ̀yà kejì rẹ́.', 'An share ɗayan sigar.', 'Ehichapụla ụdị nke ọzọ.'],
['End test and keep this one', 'End test and keep this one', 'Parí ìdánwò kí o sì pa èyí mọ́', 'Kawo ƙarshen gwaji ka ajiye wannan', 'Kwụsị nnwale ma debe nke a'],
['This is version {arm}.', 'This na version {arm}.', 'Èyí ni ẹ̀yà {arm}.', 'Wannan siga {arm} ce.', 'Nke a bụ ụdị {arm}.'],
['Judged by: {goal}.', 'Judged by: {goal}.', 'A ń ṣe ìdájọ́ nípa: {goal}.', 'Ana hukunci ta: {goal}.', 'A na-ekpe ikpe site na: {goal}.'],
['Both versions show here; visitors see one.', 'Both versions dey show here; visitors go see one.', 'Ẹ̀yà méjèèjì ń hàn níbí; àwọn àlejò ń rí ọ̀kan.', 'Duka sigogi suna bayyana a nan; baƙi suna ganin ɗaya.', 'Ụdị abụọ ahụ na-egosi ebe a; ndị ọbịa na-ahụ otu.'],
['Version {arm}', 'Version {arm}', 'Ẹ̀yà {arm}', 'Siga {arm}', 'Ụdị {arm}'],
['ahead', 'dey lead', 'ń léwájú', 'yana gaba', 'na-edu'],
['{hits} of {visits} visits', '{hits} out of {visits} visits', '{hits} nínú ìbẹ̀wò {visits}', '{hits} daga ziyara {visits}', '{hits} n’ime nleta {visits}'],
['Too early to tell — visits needed on each version: {n}.', 'E too early to know — visits wey each version need: {n}.', 'Ó ti tètè jù láti sọ — ìbẹ̀wò tí ẹ̀yà kọ̀ọ̀kan nílò: {n}.', 'Ya yi wuri a faɗa — ziyarar da kowace siga ke buƙata: {n}.', 'Ọ ka dị oke ngwa ịma — nleta ụdị ọ bụla chọrọ: {n}.'],
['Version {arm} is clearly ahead. A difference isn’t proof — seasons and paydays move results too.', 'Version {arm} dey clearly lead. Difference no be proof — season and salary time dey move results too.', 'Ẹ̀yà {arm} ń léwájú gbangba. Ìyàtọ̀ kì í ṣe ẹ̀rí — àsìkò àti ọjọ́ owó oṣù náà ń yí àbájáde padà.', 'Siga {arm} tana gaba a fili. Bambanci ba hujja ba ne — lokuta da ranakun albashi ma suna motsa sakamako.', 'Ụdị {arm} na-edu n’ụzọ doro anya. Ọdịiche abụghị ihe akaebe — oge na ụbọchị ụgwọ ọnwa na-agbanwekwa nsonaazụ.'],
['No clear winner yet. Keep it running, or keep the one you prefer.', 'No clear winner yet. Make e continue, or keep the one wey you like.', 'Kò sí olùborí tí ó ṣe kedere síbẹ̀. Jẹ́ kí ó máa lọ, tàbí pa èyí tí o fẹ́ mọ́.', 'Babu bayyananne mai nasara tukuna. Bar shi yana gudana, ko ajiye wanda ka fi so.', 'Enwebeghị onye mmeri doro anya. Hapụ ya ka ọ gaa n’ihu, ma ọ bụ debe nke ị masịrị.'],
['Pause the test', 'Pause the test', 'Dá ìdánwò dúró', 'Dakatar da gwajin', 'Kwụsịtụ nnwale'],
['Everyone sees version A until you resume.', 'Everybody go see version A until you continue.', 'Gbogbo ènìyàn ń rí ẹ̀yà A títí o fi tún bẹ̀rẹ̀.', 'Kowa yana ganin siga A har sai ka ci gaba.', 'Onye ọ bụla na-ahụ ụdị A ruo mgbe ị malitere ọzọ.'],
['Kept version {arm}', 'Keep version {arm}', 'A pa ẹ̀yà {arm} mọ́', 'An ajiye siga {arm}', 'Edobere ụdị {arm}'],
['The other version was removed. Publish to show it to everyone.', 'The other version don comot. Publish make everybody see am.', 'A ti yọ ẹ̀yà kejì kúrò. Tẹ̀ ẹ́ jáde láti fi hàn fún gbogbo ènìyàn.', 'An cire ɗayan sigar. Wallafa don nuna wa kowa.', 'Ewepụla ụdị nke ọzọ. Bipụta ka onye ọ bụla hụ ya.'],
['Keep {arm}', 'Keep {arm}', 'Pa {arm} mọ́', 'Ajiye {arm}', 'Debe {arm}']];


const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(visibilityAdvancedRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const visibilityAdvancedPcm = column(1);
export const visibilityAdvancedYo = column(2);
export const visibilityAdvancedHa = column(3);
export const visibilityAdvancedIg = column(4);