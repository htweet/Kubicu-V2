/**
 * Copilot chats in the workspace sidebar (D284). DRAFTS — every non-English line needs a native speaker's check.
 * Row: [English, Naijá, Yorùbá, Hausa, Igbo].
 */
export const copilotChatsRows: [string, string, string, string, string][] = [
  ['Copilot chats', 'Copilot chats', 'Ìjíròrò Copilot', 'Hirarrakin Copilot', 'Nkata Copilot'],
  ['Your Copilot chats show here. Pin the ones you come back to.', 'Your Copilot chats go show here. Pin the ones wey you dey come back to.', 'Ìjíròrò Copilot rẹ ń hàn níbí. Pín àwọn tí o máa ń padà sí mọ́lẹ̀.', 'Hirarrakin Copilot ɗinka suna bayyana a nan. Liƙa waɗanda kake komawa gare su.', 'Nkata Copilot gị na-egosi ebe a. Kọọ ndị ị na-alaghachi na ha.'],
  ['Start a chat', 'Start chat', 'Bẹ̀rẹ̀ ìjíròrò', 'Fara hira', 'Malite nkata'],
  ['Pinned', 'Pinned', 'Tí a pín mọ́lẹ̀', 'An liƙa', 'Akọrọ'],
  ['Recent', 'Recent', 'Àìpẹ́', 'Na kwanan nan', 'Nso nso a'],
  ['See all chats', 'See all chats', 'Wo gbogbo ìjíròrò', 'Duba duk hirarraki', 'Hụ nkata niile'],
  ['New chat', 'New chat', 'Ìjíròrò tuntun', 'Sabuwar hira', 'Nkata ọhụrụ'],
  ['Pin “{name}”', 'Pin “{name}”', 'Pín “{name}” mọ́lẹ̀', 'Liƙa “{name}”', 'Kọọ “{name}”'],
  ['Unpin “{name}”', 'Unpin “{name}”', 'Yọ “{name}” kúrò ní pínpín', 'Cire liƙa “{name}”', 'Wepụ “{name}” n’ọkọ'],
  // IntentFlow (D285)
  ['Show different blocks depending on where a visit came from — your TikTok, a WhatsApp status, a QR code on your counter.', 'Show different blocks based on where visit come from — your TikTok, WhatsApp status, QR code for your counter.', 'Fi àwọn búlọ́ọ̀kù ọ̀tọ̀ hàn gẹ́gẹ́ bí ibi tí ìbẹ̀wò ti wá — TikTok rẹ, ipò WhatsApp, kóòdù QR lórí kántà rẹ.', 'Nuna tubala daban-daban bisa inda ziyara ta fito — TikTok ɗinka, matsayin WhatsApp, lambar QR a kantinka.', 'Gosi blọk dị iche dabere n’ebe nleta si — TikTok gị, ọnọdụ WhatsApp, koodu QR n’elu tebụl ahịa gị.'],
  ['Rules use only the source of a visit — never age, gender, location or anything about the person. Every page keeps at least one block for everyone, and pausing applies instantly.', 'Rules dey use only where visit come from — never age, gender, location or anything about the person. Every page go keep at least one block for everybody, and pause dey work immediately.', 'Òfin ń lo orísun ìbẹ̀wò nìkan — kì í ṣe ọjọ́ orí, akọ tàbí abo, ibùdó tàbí ohunkóhun nípa ẹni náà. Gbogbo ojú-ìwé ń pa búlọ́ọ̀kù kan mọ́ fún gbogbo ènìyàn, dídá dúró sì ń ṣiṣẹ́ lẹ́sẹ̀kẹsẹ̀.', 'Dokoki suna amfani da tushen ziyara kawai — ba shekaru, jinsi, wuri ko wani abu game da mutumin ba. Kowane shafi yana riƙe aƙalla tubali ɗaya ga kowa, kuma dakatarwa tana aiki nan take.', 'Iwu na-eji naanị ebe nleta si — ọ bụghị afọ, nwoke ma ọ bụ nwanyị, ebe ma ọ bụ ihe ọ bụla gbasara onye ahụ. Ibe ọ bụla na-edebe opekata mpe otu blọk maka onye ọ bụla, ma nkwụsịtụ na-arụ ọrụ ozugbo.'],
  ['No source rules yet', 'No source rules yet', 'Kò sí òfin orísun síbẹ̀', 'Babu dokokin tushe tukuna', 'Enwebeghị iwu isi mmalite'],
  ['In the canvas, select a block, open Visibility and choose “Show by visitor source”. For example, show a TikTok welcome only to TikTok visitors.', 'For canvas, select block, open Visibility and choose “Show by visitor source”. Like, show TikTok welcome only to TikTok visitors.', 'Nínú kánfásì, yan búlọ́ọ̀kù kan, ṣí Ìhànsí kí o yan “Fi hàn gẹ́gẹ́ bí orísun àlejò”. Fún àpẹẹrẹ, fi ìkíni TikTok hàn fún àlejò TikTok nìkan.', 'A cikin zane, zaɓi tubali, buɗe Ganuwa kuma zaɓi “Nuna bisa tushen baƙo”. Misali, nuna maraba ta TikTok ga baƙin TikTok kawai.', 'Na kanvas, họrọ blọk, mepee Ọhụhụ ma họrọ “Gosi dabere n’ebe onye ọbịa si”. Dịka, gosi nnabata TikTok naanị ndị ọbịa TikTok.'],
  ['Open canvas', 'Open canvas', 'Ṣí kánfásì', 'Buɗe zane', 'Mepee kanvas'],
  ['Source rules', 'Source rules', 'Òfin orísun', 'Dokokin tushe', 'Iwu isi mmalite'],
  ['Not published yet', 'Never publish', 'Kò tíì tẹ̀ jáde', 'Ba a buga ba tukuna', 'E bipụtabeghị'],
  ['Live · changes unpublished', 'Live · changes never publish', 'Láàyè · àyípadà kò tíì tẹ̀ jáde', 'Yana aiki · ba a buga canje-canje ba', 'Ndụ · mgbanwe e bipụtabeghị'],
  ['Everyone (no sources picked)', 'Everybody (no source pick)', 'Gbogbo ènìyàn (kò sí orísun tí a yàn)', 'Kowa (ba a zaɓi tushe ba)', 'Onye ọ bụla (ahọrọghị isi mmalite)'],
  ['Only visits from {list}', 'Only visits from {list}', 'Ìbẹ̀wò láti {list} nìkan', 'Ziyara daga {list} kawai', 'Naanị nleta si {list}'],
  ['Everyone except visits from {list}', 'Everybody except visits from {list}', 'Gbogbo ènìyàn àyàfi ìbẹ̀wò láti {list}', 'Kowa banda ziyara daga {list}', 'Onye ọ bụla ma e wezụga nleta si {list}'],
  ['Goal:', 'Goal:', 'Àfojúsùn:', 'Manufa:', 'Ebumnuche:'],
  ['Taps on this block', 'Taps for this block', 'Títẹ̀ lórí búlọ́ọ̀kù yìí', 'Taɓawa a kan wannan tubali', 'Mpịaka n’elu blọk a'],
  ['Orders', 'Orders', 'Àṣẹ', 'Oda', 'Ọda'],
  ['Enquiries and sign-ups', 'Enquiries and sign-ups', 'Ìbéèrè àti ìforúkọsílẹ̀', 'Tambayoyi da rajista', 'Ajụjụ na ndebanye aha'],
  ['Bookings', 'Bookings', 'Ìfiṣura', 'Ajiye wuri', 'Ndebanye'],
  ['Too early to tell', 'E too early to know', 'Ó ti tètè jù láti sọ', 'Ya yi wuri a faɗa', 'O kachasị n’oge ịkọ'],
  ['{a} of {min} targeted visits · {b} of {min} others, since the rule was made.', '{a} of {min} targeted visits · {b} of {min} others, since dem make the rule.', '{a} nínú {min} ìbẹ̀wò àfojúsùn · {b} nínú {min} àwọn mìíràn, láti ìgbà tí a ṣe òfin náà.', '{a} cikin {min} ziyarar da aka nufa · {b} cikin {min} wasu, tun da aka yi dokar.', '{a} n’ime {min} nleta e lekwasịrị anya · {b} n’ime {min} ndị ọzọ, kemgbe emere iwu ahụ.'],
  ['Visits it targets', 'Visits wey e target', 'Ìbẹ̀wò tí ó dojú kọ', 'Ziyarar da yake nufa', 'Nleta ọ na-elekwasị anya'],
  ['Everyone else', 'Everybody else', 'Gbogbo àwọn yòókù', 'Kowa da kowa', 'Ndị ọzọ niile'],
  ['{a} of {b}', '{a} of {b}', '{a} nínú {b}', '{a} cikin {b}', '{a} n’ime {b}'],
  ['Different audiences behave differently anyway — this shows a pattern, not proof the block caused it.', 'Different audiences dey behave different anyway — this one show pattern, no be proof say na the block cause am.', 'Àwọn olùgbọ́ ọ̀tọ̀ọ̀tọ̀ ń hùwà lọ́nà ọ̀tọ̀ bákan náà — èyí ń fi àpẹẹrẹ hàn, kì í ṣe ẹ̀rí pé búlọ́ọ̀kù ló fà á.', 'Masu sauraro daban-daban suna nuna halaye daban-daban ko ta yaya — wannan yana nuna tsari, ba hujja cewa tubalin ne ya jawo ba.', 'Ndị na-ege ntị dị iche na-akpa àgwà dị iche n’agbanyeghị — nke a na-egosi usoro, ọ bụghị ihe akaebe na blọk ahụ kpatara ya.'],
  ['Pause', 'Pause', 'Dá dúró', 'Dakatar', 'Kwụsịtụ'],
  ['Roll back', 'Roll back', 'Dá padà', 'Mayar baya', 'Laghachi azụ'],
  ['Edit in canvas', 'Edit for canvas', 'Ṣàtúnṣe nínú kánfásì', 'Gyara a zane', 'Dezie na kanvas'],
  ['Rule resumed', 'Rule don continue', 'Òfin ti tẹ̀síwájú', 'Doka ta ci gaba', 'Iwu amaliteghachila'],
  ['Rule paused', 'Rule don pause', 'A ti dá òfin dúró', 'An dakatar da doka', 'Akwụsịtụla iwu'],
  ['Rule removed', 'Rule don comot', 'A ti yọ òfin kúrò', 'An cire doka', 'Ewepụla iwu'],
  ['Applies to your live page straight away — no publish needed.', 'E go show for your live page immediately — no need to publish.', 'Ó kan ojú-ìwé rẹ tí ó wà láàyè lẹ́sẹ̀kẹsẹ̀ — kò nílò títẹ̀ jáde.', 'Yana aiki a shafinka mai aiki nan take — babu buƙatar bugawa.', 'Ọ na-emetụta ibe gị dị ndụ ozugbo — achọghị mbipụta.'],
  ['“Roll back” removes the rule so everyone sees the block again. Check what each audience sees with “Preview as” in the canvas.', '“Roll back” go comot the rule so everybody go see the block again. Check wetin each audience dey see with “Preview as” for canvas.', '“Dá padà” ń yọ òfin kúrò kí gbogbo ènìyàn tún rí búlọ́ọ̀kù náà. Ṣàyẹ̀wò ohun tí olùgbọ́ kọ̀ọ̀kan ń rí pẹ̀lú “Wò bí” nínú kánfásì.', '“Mayar baya” yana cire dokar don kowa ya sake ganin tubalin. Duba abin da kowane rukuni yake gani da “Duba a matsayin” a zane.', '“Laghachi azụ” na-ewepụ iwu ahụ ka onye ọ bụla hụ blọk ahụ ọzọ. Lelee ihe otu ọ bụla na-ahụ site na “Lelee dịka” na kanvas.'],
];

const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(copilotChatsRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const copilotChatsPcm = column(1);
export const copilotChatsYo = column(2);
export const copilotChatsHa = column(3);
export const copilotChatsIg = column(4);
