/** Drafted translations: NFC tags page, ordering, tag editing and the tap page (D444). Drafts — need native review. */
type Dict = Record<string, string>;

// [English, Pidgin, Yorùbá, Hausa, Igbo]
const rows: [string, string, string, string, string][] = [
  // ——— Names and sources ———
  ['NFC tags', 'NFC tags', 'Àmì NFC', 'Alamomin NFC', 'Akara NFC'],
  ['NFC tag', 'NFC tag', 'Àmì NFC', 'Alamar NFC', 'Akara NFC'],
  ['NFC tap', 'NFC tap', 'Fífọwọ́kan NFC', 'Taɓa NFC', 'Mmetụ NFC'],
  ['Want customers to tap instead of scan?', 'You want make customers tap instead of scan?', 'Ṣé o fẹ́ kí oníbàárà fọwọ́kàn dípò kí wọ́n ṣàyẹ̀wò?', 'Kana so abokan ciniki su taɓa maimakon su duba?', 'Ị chọrọ ka ndị ahịa metụ kama ịnyocha?'],
  ['Order NFC tags', 'Order NFC tags', 'Bèrè àmì NFC', 'Yi odar alamomin NFC', 'Tụọ akara NFC'],
  ['Order tags', 'Order tags', 'Bèrè àwọn àmì', 'Yi odar alamomi', 'Tụọ akara'],

  // ——— Page ———
  ['Stickers, cards and keyrings customers tap with their phone to open your page. Point each one anywhere, change it later, or switch it off if it’s lost.', 'Stickers, cards and keyrings wey customers go tap with their phone to open your page. Point each one anywhere, change am later, or off am if e lost.', 'Sítíkà, káàdì àti òrùka kọ́kọ́rọ́ tí oníbàárà ń fi fóònù fọwọ́kàn láti ṣí ojú-ìwé rẹ. Darí ọ̀kọ̀ọ̀kan sí ibikíbi, yí i padà lẹ́yìn náà, tàbí pa á tí ó bá sọnù.', 'Sitika, katuna da zoben maɓalli da abokan ciniki ke taɓawa da wayarsu don buɗe shafinka. Tura kowanne ko’ina, canza shi daga baya, ko kashe shi idan ya ɓace.', 'Stika, kaadị na mgbanaka igodo ndị ahịa na-eji ekwentị ha metụ iji mepee ibe gị. Tụọ nke ọ bụla ebe ọ bụla, gbanwee ya emesịa, ma ọ bụ gbanyụọ ya ma ọ furu efu.'],
  ['Delivered in Nigeria only for now', 'Na only Nigeria we dey deliver for now', 'Ní Nàìjíríà nìkan la ń fi ránṣẹ́ báyìí', 'A Najeriya kaɗai ake kai wa a yanzu', 'Ọ bụ naanị na Naịjirịa ka anyị na-ezipụ ugbu a'],
  ['Tags you already have keep working everywhere. Ordering outside Nigeria is coming.', 'Tags wey you don get go still work everywhere. Ordering outside Nigeria dey come.', 'Àwọn àmì tí o ti ní ṣì ń ṣiṣẹ́ níbi gbogbo. Bíbèrè ní ìta Nàìjíríà ń bọ̀.', 'Alamomin da kake da su suna ci gaba da aiki ko’ina. Yin odar a wajen Najeriya na zuwa.', 'Akara ị nwerela na-arụ ọrụ ebe niile. Ịtụ n’èzí Naịjirịa na-abịa.'],
  ['No tags yet', 'No tags yet', 'Kò sí àmì kankan síbẹ̀', 'Babu alamomi tukuna', 'Enweghị akara ka ọ dị ugbu a'],
  ['Put one on your counter, a product box or a rider’s keyring. Taps are counted here, separately from QR scans.', 'Put one for your counter, product box or rider keyring. We dey count taps here, separate from QR scans.', 'Fi ọ̀kan sí orí káńtà rẹ, àpótí ọjà tàbí òrùka kọ́kọ́rọ́ ẹlẹ́ṣin. A ń ka fífọwọ́kàn níbí, lọ́tọ̀ sí ìṣàyẹ̀wò QR.', 'Sanya ɗaya a kan kantinka, akwatin kaya ko zoben maɓallin mahayi. Ana ƙirga taɓawa a nan, daban da duba QR.', 'Tinye otu na kanta gị, igbe ngwaahịa ma ọ bụ mgbanaka igodo onye na-agba ọgba tum tum. A na-agụ mmetụ ebe a, iche na nyocha QR.'],
  ['Taps in the last 7 days: {n} · Tags: {tags}', 'Taps for last 7 days: {n} · Tags: {tags}', 'Fífọwọ́kàn ní ọjọ́ 7 sẹ́yìn: {n} · Àmì: {tags}', 'Taɓawa a kwanaki 7 da suka wuce: {n} · Alamomi: {tags}', 'Mmetụ n’ụbọchị 7 gara aga: {n} · Akara: {tags}'],
  ['QR scans are in QR codes', 'QR scans dey for QR codes', 'Ìṣàyẹ̀wò QR wà nínú àwọn kóòdù QR', 'Duba QR yana cikin lambobin QR', 'Nyocha QR dị na koodu QR'],
  ['On the way · {ref}', 'E dey road · {ref}', 'Ó wà lójú ọ̀nà · {ref}', 'Yana kan hanya · {ref}', 'Ọ nọ n’ụzọ · {ref}'],
  ['opens {where}', 'dey open {where}', 'ń ṣí {where}', 'yana buɗe {where}', 'na-emepe {where}'],
  ['Main page', 'Main page', 'Ojú-ìwé àkọ́kọ́', 'Babban shafi', 'Ibe isi'],
  ['Short link · {name}', 'Short link · {name}', 'Ìjápọ̀ kúkúrú · {name}', 'Gajeriyar hanyar haɗi · {name}', 'Njikọ dị mkpụmkpụ · {name}'],
  ['Short link removed — opens main page', 'Short link don comot — e dey open main page', 'A ti yọ ìjápọ̀ kúkúrú — ó ń ṣí ojú-ìwé àkọ́kọ́', 'An cire gajeriyar hanyar haɗi — yana buɗe babban shafi', 'E wepụla njikọ dị mkpụmkpụ — ọ na-emepe ibe isi'],
  ['this week · total {total}', 'this week · total {total}', 'ọ̀sẹ̀ yìí · àpapọ̀ {total}', 'wannan mako · jimla {total}', 'izu a · ngụkọta {total}'],
  ['Actions for {name}', 'Wetin you fit do for {name}', 'Àwọn ìṣe fún {name}', 'Ayyuka don {name}', 'Omume maka {name}'],
  ['Rename or re-point', 'Change name or where e dey point', 'Yí orúkọ tàbí ibi tí ó ń darí sí padà', 'Canza suna ko inda yake nunawa', 'Gbanwee aha ma ọ bụ ebe ọ na-atụ'],
  ['Test a tap', 'Test one tap', 'Dán fífọwọ́kàn wò', 'Gwada taɓawa', 'Nwalee mmetụ'],
  ['Turn off (lost or stolen)', 'Off am (e lost or dem steal am)', 'Pa á (ó sọnù tàbí wọ́n jí i)', 'Kashe (ya ɓace ko an sace shi)', 'Gbanyụọ (ọ furu efu ma ọ bụ e zuru ya)'],
  ['Turn back on', 'On am back', 'Tàn án padà', 'Sake kunna', 'Gbanye ya ọzọ'],
  ['“Test a tap” opens the tag’s address in a new tab and counts as a tap. Ordering and delivery are simulated.', '“Test one tap” go open the tag address for new tab and e go count as tap. Ordering and delivery na simulation.', '“Dán fífọwọ́kàn wò” ń ṣí àdírẹ́sì àmì náà ní táàbù tuntun, ó sì ń kà á sí fífọwọ́kàn. Bíbèrè àti ìfiránṣẹ́ jẹ́ àfarawé.', '“Gwada taɓawa” yana buɗe adireshin alamar a sabon shafi kuma yana ƙirga a matsayin taɓawa. Yin oda da kai kaya kwaikwayo ne.', '“Nwalee mmetụ” na-emepe adreesị akara ahụ na taabụ ọhụrụ ma gụọ ya dịka mmetụ. Ịtụ na nnyefe bụ ihe eserese.'],
  ['{name} turned off', '{name} don off', 'A ti pa {name}', 'An kashe {name}', 'Agbanyụọla {name}'],
  ['{name} is on again', '{name} don on again', '{name} ti tàn padà', '{name} ya sake kunnawa', '{name} na-arụ ọrụ ọzọ'],
  ['Taps now show a “turned off” notice instead of your page.', 'Taps go now show “e don off” notice instead of your page.', 'Fífọwọ́kàn yóò fi àkíyèsí “a ti pa á” hàn báyìí dípò ojú-ìwé rẹ.', 'Taɓawa yanzu tana nuna sanarwar “an kashe” maimakon shafinka.', 'Mmetụ ga-egosi ọkwa “agbanyụọla ya” kama ibe gị.'],

  // ——— Kinds ———
  ['Round stickers', 'Round stickers', 'Sítíkà roboto', 'Sitika masu zagaye', 'Stika okirikiri'],
  ['Round sticker', 'Round sticker', 'Sítíkà roboto', 'Sitika mai zagaye', 'Stika okirikiri'],
  ['Tap cards', 'Tap cards', 'Káàdì fífọwọ́kàn', 'Katunan taɓawa', 'Kaadị mmetụ'],
  ['Tap card', 'Tap card', 'Káàdì fífọwọ́kàn', 'Katin taɓawa', 'Kaadị mmetụ'],
  ['Keyrings', 'Keyrings', 'Òrùka kọ́kọ́rọ́', 'Zoben maɓalli', 'Mgbanaka igodo'],
  ['Keyring', 'Keyring', 'Òrùka kọ́kọ́rọ́', 'Zoben maɓalli', 'Mgbanaka igodo'],
  ['30 mm · for counters, packaging and windows', '30 mm · for counters, packaging and windows', '30 mm · fún káńtà, àpò ọjà àti fèrèsé', '30 mm · don kantuna, marufi da tagogi', '30 mm · maka kanta, ngwugwu na windo'],
  ['Card size · for your wallet or a till', 'Card size · for your wallet or till', 'Ìwọ̀n káàdì · fún àpò owó rẹ tàbí ibi ìsanwó', 'Girman kati · don jakar kuɗinka ko wurin biya', 'Nha kaadị · maka akpa ego gị ma ọ bụ ebe ịkwụ ụgwọ'],
  ['Epoxy fob · for staff and delivery riders', 'Epoxy fob · for staff and delivery riders', 'Fóòbù epoxy · fún òṣìṣẹ́ àti ẹlẹ́ṣin ìfiránṣẹ́', 'Fob na epoxy · don ma’aikata da mahayan kai kaya', 'Fob epoxy · maka ndị ọrụ na ndị na-ebu ngwongwo'],

  // ——— Ordering ———
  ['Customers tap their phone on the tag to open your page — no app or camera needed. Change where each tag points any time.', 'Customers go tap their phone for the tag to open your page — no need app or camera. Change where each tag dey point anytime.', 'Oníbàárà ń fi fóònù wọn kan àmì náà láti ṣí ojú-ìwé rẹ — kò sí ìdí fún áàpù tàbí kámẹ́rà. Yí ibi tí àmì kọ̀ọ̀kan ń darí sí padà nígbàkígbà.', 'Abokan ciniki suna taɓa wayarsu a kan alamar don buɗe shafinka — babu buƙatar manhaja ko kyamara. Canza inda kowace alama ke nunawa a kowane lokaci.', 'Ndị ahịa na-emetụ ekwentị ha n’akara ahụ iji mepee ibe gị — ọ dịghị mkpa ngwa ma ọ bụ igwefoto. Gbanwee ebe akara ọ bụla na-atụ mgbe ọ bụla.'],
  ['Pay with test card', 'Pay with test card', 'Sanwó pẹ̀lú káàdì ìdánwò', 'Biya da katin gwaji', 'Kwụọ ụgwọ na kaadị nnwale'],
  ['{price} each', '{price} each', '{price} ọ̀kọ̀ọ̀kan', '{price} kowanne', '{price} nke ọ bụla'],
  ['How many', 'How many', 'Mélòó', 'Nawa', 'Ole ka'],
  ['Between 1 and {max}', 'Between 1 and {max}', 'Láàrin 1 sí {max}', 'Tsakanin 1 da {max}', 'N’etiti 1 na {max}'],
  ['All tags in this order start here. You can point each one somewhere else later.', 'All tags for this order go start here. You fit point each one go another place later.', 'Gbogbo àmì inú àṣẹ yìí ń bẹ̀rẹ̀ níbí. O lè darí ọ̀kọ̀ọ̀kan sí ibòmíràn lẹ́yìn náà.', 'Duk alamomin wannan oda suna farawa a nan. Kana iya tura kowanne zuwa wani wuri daga baya.', 'Akara niile dị n’usoro a na-amalite ebe a. Ị nwere ike ịtụ nke ọ bụla ebe ọzọ emesịa.'],
  ['Deliver to', 'Deliver go', 'Fi ránṣẹ́ sí', 'Kai zuwa', 'Zipụ na'],
  ['Address in Nigeria', 'Address for Nigeria', 'Àdírẹ́sì ní Nàìjíríà', 'Adireshi a Najeriya', 'Adreesị na Naịjirịa'],
  ['Delivery (about 5 days)', 'Delivery (about 5 days)', 'Ìfiránṣẹ́ (bí ọjọ́ 5)', 'Kai kaya (kusan kwanaki 5)', 'Nnyefe (ihe dị ka ụbọchị 5)'],
  ['Prices are examples. Works with most phones from the last few years — iPhones tap from the lock screen, and Android needs NFC switched on.', 'Prices na examples. E dey work with most phones of the last few years — iPhone fit tap from lock screen, Android need make NFC dey on.', 'Àpẹẹrẹ ni iye owó. Ó ń ṣiṣẹ́ pẹ̀lú ọ̀pọ̀ fóònù ọdún díẹ̀ sẹ́yìn — iPhone lè fọwọ́kàn láti ojú títìpa, Android sì nílò kí NFC wà ní títàn.', 'Farashi misalai ne. Yana aiki da yawancin wayoyin ’yan shekarun nan — iPhone na taɓawa daga allon kulle, Android kuma yana buƙatar a kunna NFC.', 'Ọnụahịa bụ ihe atụ. Ọ na-arụ ọrụ na ọtụtụ ekwentị nke afọ ole na ole gara aga — iPhone na-emetụ site na ihuenyo mkpọchi, Android chọrọ ka agbanye NFC.'],
  ['Add the street address, area and state', 'Add street address, area and state', 'Ṣàfikún àdírẹ́sì òpópónà, àdúgbò àti ìpínlẹ̀', 'Ƙara adireshin titi, unguwa da jiha', 'Tinye adreesị okporo ụzọ, mpaghara na steeti'],
  ['So the rider can reach you', 'So the rider fit reach you', 'Kí ẹlẹ́ṣin lè kàn sí ọ', 'Don mahayin ya iya samunka', 'Ka onye na-ebu ngwongwo nwee ike ịkpọtụrụ gị'],
  ['Order {ref} placed', 'Order {ref} don enter', 'A ti fi àṣẹ {ref} sílẹ̀', 'An sanya oda {ref}', 'Etinyela usoro {ref}'],
  ['{total} paid (test mode). Your tags are ready to point now and arrive in about 5 days.', '{total} don pay (test mode). Your tags ready to point now and dem go arrive for about 5 days.', 'A ti san {total} (ìpò ìdánwò). Àwọn àmì rẹ ti ṣetán láti darí báyìí, wọ́n á sì dé ní bí ọjọ́ 5.', 'An biya {total} (yanayin gwaji). Alamominka a shirye suke a tura su yanzu kuma za su iso cikin kusan kwanaki 5.', 'Akwụọla {total} (ọnọdụ nnwale). Akara gị adịla njikere ịtụ ugbu a ma ha ga-abịa n’ihe dị ka ụbọchị 5.'],

  // ——— Destination ———
  ['When someone taps it, open', 'When person tap am, open', 'Nígbà tí ẹnìkan bá fọwọ́kàn án, ṣí', 'Idan wani ya taɓa shi, buɗe', 'Mgbe mmadụ metụrụ ya, mepee'],
  ['Your main page', 'Your main page', 'Ojú-ìwé àkọ́kọ́ rẹ', 'Babban shafinka', 'Ibe isi gị'],
  ['One of your short links', 'One of your short links', 'Ọ̀kan nínú àwọn ìjápọ̀ kúkúrú rẹ', 'Ɗaya daga cikin gajerun hanyoyin haɗinka', 'Otu n’ime njikọ mkpụmkpụ gị'],
  ['Another web address', 'Another web address', 'Àdírẹ́sì wẹ́ẹ̀bù mìíràn', 'Wani adireshin yanar gizo', 'Adreesị weebụ ọzọ'],
  ['Short links keep their own campaign and stats too.', 'Short links still keep their own campaign and stats.', 'Àwọn ìjápọ̀ kúkúrú náà ń pa ìpolongo àti ìṣirò tiwọn mọ́.', 'Gajerun hanyoyin haɗi ma suna riƙe kamfen da ƙididdigarsu.', 'Njikọ mkpụmkpụ na-edebekwa mkpọsa na ọnụ ọgụgụ nke ha.'],
  ['Short link', 'Short link', 'Ìjápọ̀ kúkúrú', 'Gajeriyar hanyar haɗi', 'Njikọ dị mkpụmkpụ'],
  ['Web address', 'Web address', 'Àdírẹ́sì wẹ́ẹ̀bù', 'Adireshin yanar gizo', 'Adreesị weebụ'],
  ['Enter a full address starting with https://', 'Put full address wey start with https://', 'Tẹ àdírẹ́sì kíkún tí ó bẹ̀rẹ̀ pẹ̀lú https://', 'Shigar da cikakken adireshi mai farawa da https://', 'Tinye adreesị zuru oke na-amalite na https://'],

  // ——— One tag ———
  ['Total taps: {total} · This week: {week}', 'All taps: {total} · This week: {week}', 'Àpapọ̀ fífọwọ́kàn: {total} · Ọ̀sẹ̀ yìí: {week}', 'Jimlar taɓawa: {total} · Wannan mako: {week}', 'Ngụkọta mmetụ: {total} · Izu a: {week}'],
  ['Where it is, so you can tell tags apart — e.g. Front counter, Rider Tunde.', 'Where e dey, so you fit know which tag be which — e.g. Front counter, Rider Tunde.', 'Ibi tí ó wà, kí o lè dá àwọn àmì mọ̀ — fún àpẹẹrẹ Káńtà iwájú, Ẹlẹ́ṣin Túndé.', 'Inda yake, don ka bambanta alamomi — misali Kantin gaba, Mahayi Tunde.', 'Ebe ọ dị, ka ị mata akara dị iche — dịka Kanta n’ihu, Onye na-ebu Tunde.'],
  ['Give it a name', 'Give am name', 'Fún un ní orúkọ', 'Ba shi suna', 'Nye ya aha'],
  ['Written on the chip:', 'Wetin dey written for the chip:', 'Ohun tí a kọ sórí ṣíìpù:', 'Abin da aka rubuta a kan cip:', 'Ihe e dere na chip:'],
  ['Last tap {when}', 'Last tap {when}', 'Fífọwọ́kàn tó kẹ́yìn {when}', 'Taɓawa ta ƙarshe {when}', 'Mmetụ ikpeazụ {when}'],
  ['Tag updated', 'Tag don update', 'A ti ṣàtúnṣe àmì', 'An sabunta alama', 'Emelitela akara'],
  ['The next tap goes to the new place. Nothing to reprint.', 'Next tap go reach the new place. Nothing to print again.', 'Fífọwọ́kàn tó kàn yóò lọ sí ibi tuntun. Kò sí nǹkan láti tẹ̀ lẹ́ẹ̀kan sí i.', 'Taɓawa ta gaba za ta tafi sabon wurin. Babu abin da za a sake bugawa.', 'Mmetụ ọzọ ga-aga n’ebe ọhụrụ. Ọ dịghị ihe a ga-ebipụta ọzọ.'],

  // ——— Tap page ———
  ['Opening…', 'E dey open…', 'Ó ń ṣí…', 'Ana buɗewa…', 'Ọ na-emepe…'],
  ['This tag has been turned off', 'Dem don off this tag', 'A ti pa àmì yìí', 'An kashe wannan alamar', 'Agbanyụọla akara a'],
  ['This tag isn’t linked to anything', 'This tag no connect to anything', 'Àmì yìí kò so mọ́ nǹkan kankan', 'Wannan alamar ba ta haɗu da komai ba', 'Akara a ejikọghị na ihe ọ bụla'],
  ['The business switched it off — it may have been lost. You can still visit their page.', 'The business don off am — e fit don lost. You fit still visit their page.', 'Iṣẹ́ ajé náà ti pa á — ó lè ti sọnù. O ṣì lè ṣàbẹ̀wò sí ojú-ìwé wọn.', 'Kasuwancin ya kashe shi — wataƙila ya ɓace. Har yanzu kana iya ziyartar shafinsu.', 'Azụmahịa ahụ gbanyụrụ ya — o nwere ike ịbụ na ọ furu efu. Ị ka nwere ike ịga ibe ha.'],
  ['It may be an old or test tag.', 'E fit be old or test tag.', 'Ó lè jẹ́ àmì àtijọ́ tàbí ti ìdánwò.', 'Wataƙila tsohuwar alama ce ko ta gwaji.', 'O nwere ike ịbụ akara ochie ma ọ bụ nke nnwale.'],
  ['Go to their page', 'Go their page', 'Lọ sí ojú-ìwé wọn', 'Je zuwa shafinsu', 'Gaa n’ibe ha'],
];

const build = (i: 1 | 2 | 3 | 4): Dict => Object.fromEntries(rows.map((r) => [r[0], r[i]]));
export const nfcPcm = build(1);
export const nfcYo = build(2);
export const nfcHa = build(3);
export const nfcIg = build(4);
