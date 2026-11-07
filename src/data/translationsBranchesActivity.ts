/** Drafted translations: the rest of Commerce → Branches, moving stock, and the activity-log download window (D450). Drafts — need native review. */
type Dict = Record<string, string>;

// [English, Pidgin, Yorùbá, Hausa, Igbo]
const rows: [string, string, string, string, string][] = [
  // ——— Branches page ———
  ['Sell from more than one place. Each branch has its own stock count and can be a pickup point; franchised branches pay you a royalty on their sales.', 'Sell from more than one place. Each branch get its own stock count and fit be pickup point; franchise branches dey pay you royalty from their sales.', 'Ta láti ibi ju ọ̀kan lọ. Ẹ̀ka kọ̀ọ̀kan ní iye ọjà tirẹ̀ ó sì lè jẹ́ ibi gbígbà; àwọn ẹ̀ka franchise ń san ìpín fún ọ láti inú títà wọn.', 'Sayar daga wuri fiye da ɗaya. Kowane reshe yana da adadin kayansa kuma yana iya zama wurin karɓa; rassan franchise suna biyan ka kaso daga tallace-tallacensu.', 'Ree site n’ebe karịrị otu. Alaka ọ bụla nwere ọnụ ọgụgụ ngwongwo nke ya ma nwee ike ịbụ ebe a na-anata; alaka franchise na-akwụ gị òkè site n’ọrịre ha.'],
  ['Branches are on {plan}', 'Branches dey for {plan}', 'Àwọn ẹ̀ka wà lórí {plan}', 'Rassa suna kan {plan}', 'Alaka dị na {plan}'],
  ['Branches you already added keep their stock and orders.', 'Branches wey you don add go keep their stock and orders.', 'Àwọn ẹ̀ka tí o ti ṣàfikún máa pa ọjà àti àṣẹ wọn mọ́.', 'Rassan da ka riga ka ƙara suna riƙe kayansu da odarsu.', 'Alaka ị tinyelarị na-edebe ngwongwo na usoro ha.'],
  ['Add a branch when you open a second location or sign a franchise partner. Your current stock stays at the main shop until you move some.', 'Add branch when you open second location or sign franchise partner. Your stock go stay for main shop until you move some.', 'Ṣàfikún ẹ̀ka nígbà tí o bá ṣí ibùdó kejì tàbí fọwọ́ sí alábàáṣiṣẹ́ franchise. Ọjà rẹ máa wà ní ṣọ́ọ̀bù àkọ́kọ́ títí o fi gbé díẹ̀ lọ.', 'Ƙara reshe idan ka buɗe wuri na biyu ko ka sa hannu da abokin franchise. Kayanka za su zauna a babban shago har sai ka matsar da wasu.', 'Tinye alaka mgbe ị mepere ebe nke abụọ ma ọ bụ bịanye aka na onye mmekọ franchise. Ngwongwo gị ga-anọ n’ụlọ ahịa isi ruo mgbe ị bugharịrị ụfọdụ.'],
  ['Sales in the last {n} days', 'Sales for last {n} days', 'Títà ní ọjọ́ {n} sẹ́yìn', 'Tallace-tallace a kwanaki {n} da suka wuce', 'Ọrịre n’ụbọchị {n} gara aga'],
  ['royalties due', 'royalty wey dem owe', 'ìpín tó yẹ kí wọ́n san', 'kason da ake bi', 'òkè a ga-akwụ'],
  ['Franchise', 'Franchise', 'Franchise', 'Franchise', 'Franchise'],
  ['Orders: {n}', 'Orders: {n}', 'Àṣẹ: {n}', 'Oda: {n}', 'Usoro: {n}'],
  ['royalty {amount} ({pct}%)', 'royalty {amount} ({pct}%)', 'ìpín {amount} ({pct}%)', 'kaso {amount} ({pct}%)', 'òkè {amount} ({pct}%)'],
  ['Edit', 'Edit', 'Ṣàtúnṣe', 'Gyara', 'Dezie'],
  ['Remove', 'Remove', 'Yọ kúrò', 'Cire', 'Wepụ'],
  ['Set the address in Commerce settings → Delivery & pickup', 'Set the address for Commerce settings → Delivery & pickup', 'Ṣètò àdírẹ́sì ní Commerce settings → Delivery & pickup', 'Saita adireshin a Commerce settings → Delivery & pickup', 'Debe adreesị na Commerce settings → Delivery & pickup'],
  ['Sales count orders collected at each location. Delivered orders count toward the main shop. Royalties are worked out here for your records — settle them with each partner directly.', 'Sales dey count orders wey dem collect for each location. Orders wey we deliver dey count for main shop. We calculate royalties here for your records — settle am with each partner yourself.', 'Títà ń ka àṣẹ tí a gbà ní ibùdó kọ̀ọ̀kan. Àṣẹ tí a fi jíṣẹ́ ń kà sí ṣọ́ọ̀bù àkọ́kọ́. A ṣírò ìpín níbí fún àkọsílẹ̀ rẹ — yanjú rẹ̀ pẹ̀lú alábàáṣiṣẹ́ kọ̀ọ̀kan fúnra rẹ.', 'Tallace-tallace suna ƙirga odar da aka karɓa a kowane wuri. Odar da aka kai suna ƙirguwa ga babban shago. Ana lissafa kaso a nan don bayananka — ka daidaita da kowane abokin hulɗa kai tsaye.', 'Ọrịre na-agụ usoro anatara n’ebe ọ bụla. Usoro ebugara na-agụ maka ụlọ ahịa isi. A na-agbakọ òkè ebe a maka ndekọ gị — kwụọ ya na onye mmekọ ọ bụla n’onwe gị.'],
  ['No products with tracked stock yet.', 'No product with tracked stock yet.', 'Kò sí ọjà tí a ń ka iye rẹ̀ síbẹ̀.', 'Babu kayan da ake bin adadinsu tukuna.', 'Enweghị ngwaahịa a na-agụ ngwongwo ya ka ọ dị ugbu a.'],
  ['Product', 'Product', 'Ọjà', 'Kaya', 'Ngwaahịa'],
  ['Remove {name}?', 'Remove {name}?', 'Yọ {name} kúrò?', 'Cire {name}?', 'Wepụ {name}?'],
  ['Remove branch?', 'Remove branch?', 'Yọ ẹ̀ka kúrò?', 'Cire reshe?', 'Wepụ alaka?'],
  ['Its stock goes back to the main shop and buyers can no longer collect there. Past orders keep their pickup details.', 'Its stock go go back to main shop and buyers no fit collect there again. Old orders go keep their pickup details.', 'Ọjà rẹ̀ máa padà sí ṣọ́ọ̀bù àkọ́kọ́, olùrà kò sì ní lè gbà níbẹ̀ mọ́. Àṣẹ àtẹ̀yìnwá máa pa àlàyé gbígbà wọn mọ́.', 'Kayansa za su koma babban shago kuma masu saya ba za su iya karɓa a can ba kuma. Odar da suka gabata suna riƙe bayanan karɓarsu.', 'Ngwongwo ya ga-alaghachi n’ụlọ ahịa isi, ndị zụrụ agaghịkwa anata ebe ahụ. Usoro gara aga na-edebe nkọwa ịnata ha.'],
  ['Keep it', 'Keep am', 'Pa á mọ́', 'Ajiye shi', 'Debe ya'],
  ['{name} is open', '{name} don open', '{name} ti ṣí', '{name} a buɗe yake', '{name} meghere'],
  ['{name} closed', '{name} don close', '{name} ti tì', 'An rufe {name}', 'Emechiela {name}'],
  ['It keeps its stock but won’t show at checkout.', 'E go keep its stock but e no go show for checkout.', 'Ó máa pa ọjà rẹ̀ mọ́ ṣùgbọ́n kò ní hàn ní ibi ìsanwó.', 'Yana riƙe kayansa amma ba zai bayyana a wurin biya ba.', 'Ọ na-edebe ngwongwo ya mana ọ gaghị egosi n’ebe ịkwụ ụgwọ.'],
  ['{name} removed', '{name} don comot', 'A ti yọ {name} kúrò', 'An cire {name}', 'Ewepụla {name}'],
  ['Its stock went back to the main shop. Past orders keep their pickup details.', 'Its stock don go back to main shop. Old orders still keep their pickup details.', 'Ọjà rẹ̀ ti padà sí ṣọ́ọ̀bù àkọ́kọ́. Àṣẹ àtẹ̀yìnwá ṣì ní àlàyé gbígbà wọn.', 'Kayansa sun koma babban shago. Odar da suka gabata suna riƙe bayanan karɓarsu.', 'Ngwongwo ya alaghachila n’ụlọ ahịa isi. Usoro gara aga ka nwere nkọwa ịnata ha.'],

  // ——— Add or edit a branch ———
  ['{name} added', '{name} don enter', 'A ti ṣàfikún {name}', 'An ƙara {name}', 'Etinyela {name}'],
  ['{name} saved', '{name} don save', 'A ti fi {name} pamọ́', 'An adana {name}', 'Echekwala {name}'],
  ['Move stock to it from Branches → Stock by location.', 'Move stock enter am from Branches → Stock by location.', 'Gbé ọjà lọ sí i láti Branches → Stock by location.', 'Matsar da kaya zuwa gare shi daga Branches → Stock by location.', 'Bugharịa ngwongwo gaa ya site na Branches → Stock by location.'],
  ['Edit {name}', 'Edit {name}', 'Ṣàtúnṣe {name}', 'Gyara {name}', 'Dezie {name}'],
  ['Edit branch', 'Edit branch', 'Ṣàtúnṣe ẹ̀ka', 'Gyara reshe', 'Dezie alaka'],
  ['Another place you sell from. Stock is counted separately here, and buyers can collect from it.', 'Another place wey you dey sell from. We dey count stock separate here, and buyers fit collect from am.', 'Ibòmíràn tí o ti ń tà. A ń ka ọjà lọ́tọ̀ níbí, olùrà sì lè gbà láti ibẹ̀.', 'Wani wuri da kake sayarwa. Ana ƙirga kaya daban a nan, kuma masu saya na iya karɓa daga gare shi.', 'Ebe ọzọ ị na-ere. A na-agụ ngwongwo iche ebe a, ndị zụrụ nwekwara ike ịnata site na ya.'],
  ['Add branch', 'Add branch', 'Ṣàfikún ẹ̀ka', 'Ƙara reshe', 'Tinye alaka'],
  ['e.g. Ikeja branch', 'e.g. Ikeja branch', 'àpẹẹrẹ ẹ̀ka Ikeja', 'misali reshen Ikeja', 'dịka alaka Ikeja'],
  ['Street, area, city', 'Street, area, city', 'Òpópónà, àdúgbò, ìlú', 'Titi, unguwa, birni', 'Okporo ụzọ, mpaghara, obodo'],
  ['e.g. Mon–Sat 9am–6pm', 'e.g. Mon–Sat 9am–6pm', 'àpẹẹrẹ Ajé–Àbámẹ́ta 9 àárọ̀–6 ìrọ̀lẹ́', 'misali Lit–Asa 9 safe–6 yamma', 'dịka Mọn–Sat 9 ụtụtụ–6 mgbede'],
  ['Open', 'Open', 'Ṣí sílẹ̀', 'A buɗe', 'Meghere'],
  ['Closed branches keep their stock but don’t show at checkout.', 'Branches wey close dey keep their stock but dem no dey show for checkout.', 'Àwọn ẹ̀ka tí a tì ń pa ọjà wọn mọ́ ṣùgbọ́n wọn kò hàn ní ibi ìsanwó.', 'Rassan da aka rufe suna riƙe kayansu amma ba sa bayyana a wurin biya.', 'Alaka emechiri emechi na-edebe ngwongwo ha mana ha anaghị egosi n’ebe ịkwụ ụgwọ.'],
  ['Who runs this branch', 'Who dey run this branch', 'Ta ló ń ṣàkóso ẹ̀ka yìí', 'Wa ke tafiyar da wannan reshe', 'Onye na-elekọta alaka a'],
  ['The partner runs the branch under your brand and pays you a share of its sales. You see its stock and orders; they don’t see yours.', 'The partner dey run the branch under your brand and dey pay you share from its sales. You go see its stock and orders; dem no go see your own.', 'Alábàáṣiṣẹ́ ń ṣàkóso ẹ̀ka náà lábẹ́ orúkọ rẹ, ó sì ń san ìpín nínú títà rẹ̀ fún ọ. O ń rí ọjà àti àṣẹ rẹ̀; wọn kò rí tìrẹ.', 'Abokin hulɗar yana tafiyar da reshen a ƙarƙashin alamarka kuma yana biyan ka rabo daga tallace-tallacensa. Kana ganin kayansa da odarsa; su ba sa ganin naka.', 'Onye mmekọ na-elekọta alaka ahụ n’okpuru aha gị ma na-akwụ gị òkè n’ọrịre ya. Ị na-ahụ ngwongwo na usoro ya; ha anaghị ahụ nke gị.'],
  ['Worked out on sales after discounts and refunds.', 'We calculate am from sales after discounts and refunds.', 'A ṣírò rẹ̀ lórí títà lẹ́yìn ẹ̀dínwó àti owó tí a dá padà.', 'Ana lissafa shi kan tallace-tallace bayan rangwame da maidawa.', 'A na-agbakọ ya n’ọrịre mgbe mbelata na nlọghachi ego gasịrị.'],
  ['Give the branch a name', 'Give the branch name', 'Fún ẹ̀ka náà ní orúkọ', 'Ba reshen suna', 'Nye alaka ahụ aha'],
  ['You already have a location with this name', 'You don get location with this name already', 'O ti ní ibùdó pẹ̀lú orúkọ yìí', 'Ka riga kana da wuri mai wannan suna', 'Ị nweelarị ebe nwere aha a'],
  ['Add the street address', 'Add the street address', 'Ṣàfikún àdírẹ́sì òpópónà', 'Ƙara adireshin titi', 'Tinye adreesị okporo ụzọ'],
  ['Who runs this branch?', 'Who dey run this branch?', 'Ta ló ń ṣàkóso ẹ̀ka yìí?', 'Wa ke tafiyar da wannan reshe?', 'Onye na-elekọta alaka a?'],
  ['Between 0% and 50%', 'Between 0% and 50%', 'Láàrin 0% sí 50%', 'Tsakanin 0% da 50%', 'N’etiti 0% na 50%'],

  // ——— Move stock ———
  ['Moved to {place}: {n}', 'Don move go {place}: {n}', 'A ti gbé lọ sí {place}: {n}', 'An matsar zuwa {place}: {n}', 'Ebugharịala gaa {place}: {n}'],
  ['Total stock stays the same. The move is recorded at both locations.', 'Total stock go remain the same. We go record the move for both locations.', 'Àpapọ̀ ọjà máa wà bákan náà. A máa kọ ìgbéjáde náà sílẹ̀ ní ibùdó méjèèjì.', 'Jimlar kaya za ta kasance iri ɗaya. Ana rubuta matsarwar a wuraren biyu.', 'Ngụkọta ngwongwo ga-anọ otu. A na-edekọ mbugharị ahụ n’ebe abụọ ahụ.'],
  ['Variant', 'Variant', 'Oríṣi', 'Nau’i', 'Ụdị'],
  ['At {place}: {n}', 'For {place}: {n}', 'Ní {place}: {n}', 'A {place}: {n}', 'Na {place}: {n}'],
  ['Choose two different locations', 'Choose two different locations', 'Yan ibùdó méjì tó yàtọ̀', 'Zaɓi wurare biyu daban-daban', 'Họrọ ebe abụọ dị iche'],
  ['Enter a whole number above 0', 'Put whole number wey pass 0', 'Tẹ nọ́mbà odidi tó ju 0 lọ', 'Shigar da cikakken lamba sama da 0', 'Tinye nọmba zuru oke karịrị 0'],
  ['That product is gone', 'That product no dey again', 'Ọjà yẹn kò sí mọ́', 'Wannan kayan ya tafi', 'Ngwaahịa ahụ adịghịzi'],

  // ——— Activity-log download ———
  ['Events: {n}', 'Events: {n}', 'Ìṣẹ̀lẹ̀: {n}', 'Abubuwa: {n}', 'Ihe omume: {n}'],
  ['Downloaded. Keep this fingerprint with the file — if anyone changes even one character, the fingerprint won’t match.', 'E don download. Keep this fingerprint with the file — if anybody change even one letter, the fingerprint no go match.', 'A ti gbà á sílẹ̀. Pa ìka-àmì yìí mọ́ pẹ̀lú fáìlì náà — tí ẹnikẹ́ni bá yí kódà lẹ́tà kan padà, ìka-àmì kò ní bá a mu.', 'An sauke. Ajiye wannan hoton yatsa tare da fayil ɗin — idan wani ya canza ko harafi ɗaya, hoton yatsan ba zai dace ba.', 'Ebudatala. Debe akara mkpịsị aka a na faịlụ ahụ — ọ bụrụ na mmadụ agbanwee ọbụna otu mkpụrụedemede, akara ahụ agaghị adakọ.'],
  ['Copy', 'Copy', 'Ṣẹ̀dà', 'Kwafi', 'Detuo'],
  ['JSON Lines', 'JSON Lines', 'JSON Lines', 'JSON Lines', 'JSON Lines'],
  ['One event per line, for security tools like Splunk, Microsoft Sentinel or Datadog.', 'One event for each line, for security tools like Splunk, Microsoft Sentinel or Datadog.', 'Ìṣẹ̀lẹ̀ kan ní ìlà kọ̀ọ̀kan, fún irinṣẹ́ ààbò bí Splunk, Microsoft Sentinel tàbí Datadog.', 'Abu ɗaya a kowane layi, don kayan tsaro kamar Splunk, Microsoft Sentinel ko Datadog.', 'Otu ihe omume kwa ahịrị, maka ngwa nchekwa dịka Splunk, Microsoft Sentinel ma ọ bụ Datadog.'],
  ['Workspaces: {n}', 'Workspaces: {n}', 'Ibi iṣẹ́: {n}', 'Wuraren aiki: {n}', 'Ebe ọrụ: {n}'],
  ['all time', 'all time', 'gbogbo ìgbà', 'duk lokaci', 'oge niile'],
  ['last 24 hours', 'last 24 hours', 'wákàtí 24 sẹ́yìn', 'awanni 24 da suka wuce', 'awa 24 gara aga'],
  ['last {n} days', 'last {n} days', 'ọjọ́ {n} sẹ́yìn', 'kwanaki {n} da suka wuce', 'ụbọchị {n} gara aga'],
];

const build = (i: 1 | 2 | 3 | 4): Dict => Object.fromEntries(rows.map((r) => [r[0], r[i]]));
export const branchesActivityPcm = build(1);
export const branchesActivityYo = build(2);
export const branchesActivityHa = build(3);
export const branchesActivityIg = build(4);
