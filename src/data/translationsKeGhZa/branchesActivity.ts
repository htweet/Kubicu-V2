import { columns, type Row3 } from './build';

/** Kiswahili, Twi, isiZulu — the rest of Commerce → Branches, moving stock, and the activity-log download window (D450). DRAFTS. */
const rows: Row3[] = [
  // ——— Branches page ———
  ['Sell from more than one place. Each branch has its own stock count and can be a pickup point; franchised branches pay you a royalty on their sales.', 'Uza kutoka mahali zaidi ya pamoja. Kila tawi lina hesabu yake ya bidhaa na linaweza kuwa mahali pa kuchukua; matawi ya franchise hukulipa mrabaha kutoka mauzo yao.', 'Tɔn firi baabi a ɛboro baako. Baa biara wɔ ne nneɛma akontaa na ɛtumi yɛ beaeɛ a wɔgye nneɛma; franchise baa tua wo kyɛfa firi wɔn adetɔn mu.', 'Thengisa ezindaweni ezingaphezu kweyodwa. Igatsha ngalinye linesibalo salo sesitoko futhi lingaba yindawo yokulanda; amagatsha e-franchise akukhokhela inkokhelo yokuthengisa kwawo.'],
  ['Branches are on {plan}', 'Matawi yako kwenye {plan}', 'Baa ahorow wɔ {plan} so', 'Amagatsha aku-{plan}'],
  ['Branches you already added keep their stock and orders.', 'Matawi uliyokwisha ongeza yanabaki na bidhaa na maagizo yao.', 'Baa a woaka ho dada kora wɔn nneɛma ne wɔn order.', 'Amagatsha osuwengezile agcina isitoko nama-oda awo.'],
  ['Add a branch when you open a second location or sign a franchise partner. Your current stock stays at the main shop until you move some.', 'Ongeza tawi unapofungua eneo la pili au kusaini mshirika wa franchise. Bidhaa zako za sasa zinabaki kwenye duka kuu hadi uhamishe baadhi.', 'Fa baa ka ho berɛ a wobue beaeɛ a ɛtɔ so mmienu anaa wo ne franchise hokafoɔ yɛ apam. Wo nneɛma bɛtena adetɔnbea titire kɔsi sɛ wobɛtu bi.', 'Engeza igatsha uma uvula indawo yesibili noma usayina uzakwethu we-franchise. Isitoko sakho samanje sihlala esitolo esikhulu uze uhambise esinye.'],
  ['Sales in the last {n} days', 'Mauzo katika siku {n} zilizopita', 'Adetɔn wɔ nnansa {n} a atwam mu', 'Ukuthengisa ezinsukwini ezingu-{n} ezedlule'],
  ['royalties due', 'mrabaha unaodaiwa', 'kyɛfa a ɛsɛ sɛ wɔtua', 'izinkokhelo ezifanele'],
  ['Franchise', 'Franchise', 'Franchise', 'I-franchise'],
  ['Orders: {n}', 'Maagizo: {n}', 'Order: {n}', 'Ama-oda: {n}'],
  ['royalty {amount} ({pct}%)', 'mrabaha {amount} ({pct}%)', 'kyɛfa {amount} ({pct}%)', 'inkokhelo {amount} ({pct}%)'],
  ['Edit', 'Hariri', 'Sesa', 'Hlela'],
  ['Remove', 'Ondoa', 'Yi', 'Susa'],
  ['Set the address in Commerce settings → Delivery & pickup', 'Weka anwani katika Commerce settings → Delivery & pickup', 'Hyɛ address no wɔ Commerce settings → Delivery & pickup', 'Setha ikheli ku-Commerce settings → Delivery & pickup'],
  ['Sales count orders collected at each location. Delivered orders count toward the main shop. Royalties are worked out here for your records — settle them with each partner directly.', 'Mauzo huhesabu maagizo yaliyochukuliwa kila eneo. Maagizo yaliyoletwa huhesabiwa kwa duka kuu. Mrabaha unakokotolewa hapa kwa kumbukumbu zako — malizana na kila mshirika moja kwa moja.', 'Adetɔn kan order a wɔgyee wɔ beaeɛ biara. Order a wɔde kɔmaeɛ ka adetɔnbea titire ho. Wɔbu kyɛfa wɔ ha ma wo nkrataa — wo ne hokafoɔ biara nsiesie ankasa.', 'Ukuthengisa kubala ama-oda alandwe endaweni ngayinye. Ama-oda alethiwe abalelwa esitolo esikhulu. Izinkokhelo zibalwa lapha ukuze uzigcine — ziqede nozakwethu ngamunye ngqo.'],
  ['No products with tracked stock yet.', 'Bado hakuna bidhaa zenye hesabu inayofuatiliwa.', 'Nneɛma a wɔdi wɔn akontaa akyi nni hɔ ɛ.', 'Ayikho imikhiqizo enesitoko esilandelwayo okwamanje.'],
  ['Product', 'Bidhaa', 'Adeɛ', 'Umkhiqizo'],
  ['Remove {name}?', 'Ondoa {name}?', 'Yi {name}?', 'Susa i-{name}?'],
  ['Remove branch?', 'Ondoa tawi?', 'Yi baa no?', 'Susa igatsha?'],
  ['Its stock goes back to the main shop and buyers can no longer collect there. Past orders keep their pickup details.', 'Bidhaa zake zinarudi kwenye duka kuu na wanunuzi hawawezi tena kuchukua hapo. Maagizo ya zamani yanabaki na maelezo yao ya kuchukua.', 'Ne nneɛma san kɔ adetɔnbea titire na atɔfoɔ rentumi nnye wɔ hɔ bio. Order a atwam kora wɔn gyeeɛ ho nsɛm.', 'Isitoko salo sibuyela esitolo esikhulu futhi abathengi ngeke besakwazi ukulanda khona. Ama-oda adlule agcina imininingwane yokulanda.'],
  ['Keep it', 'Libakie', 'Kora', 'Ligcine'],
  ['{name} is open', '{name} iko wazi', '{name} abue', 'I-{name} ivuliwe'],
  ['{name} closed', '{name} imefungwa', 'Wɔato {name} mu', 'I-{name} ivaliwe'],
  ['It keeps its stock but won’t show at checkout.', 'Linabaki na bidhaa zake lakini halitaonekana wakati wa kulipa.', 'Ɛkora ne nneɛma nanso ɛrempue wɔ tua ka beaeɛ.', 'Ligcina isitoko salo kodwa ngeke libonakale lapho kukhokhwa khona.'],
  ['{name} removed', '{name} imeondolewa', 'Wɔayi {name}', 'I-{name} isusiwe'],
  ['Its stock went back to the main shop. Past orders keep their pickup details.', 'Bidhaa zake zimerudi kwenye duka kuu. Maagizo ya zamani yanabaki na maelezo yao ya kuchukua.', 'Ne nneɛma asan akɔ adetɔnbea titire. Order a atwam kora wɔn gyeeɛ ho nsɛm.', 'Isitoko salo sibuyele esitolo esikhulu. Ama-oda adlule agcina imininingwane yokulanda.'],

  // ——— Add or edit a branch ———
  ['{name} added', '{name} imeongezwa', 'Wɔde {name} aka ho', 'I-{name} yengeziwe'],
  ['{name} saved', '{name} imehifadhiwa', 'Wɔakora {name}', 'I-{name} igciniwe'],
  ['Move stock to it from Branches → Stock by location.', 'Hamishia bidhaa huko kutoka Branches → Stock by location.', 'Tu nneɛma kɔ hɔ firi Branches → Stock by location.', 'Hambisa isitoko kulo kusuka ku-Branches → Stock by location.'],
  ['Edit {name}', 'Hariri {name}', 'Sesa {name}', 'Hlela i-{name}'],
  ['Edit branch', 'Hariri tawi', 'Sesa baa', 'Hlela igatsha'],
  ['Another place you sell from. Stock is counted separately here, and buyers can collect from it.', 'Mahali pengine unapouzia. Bidhaa huhesabiwa tofauti hapa, na wanunuzi wanaweza kuchukua kutoka hapo.', 'Baabi foforɔ a wotɔn. Wɔkan nneɛma soronko wɔ ha, na atɔfoɔ tumi gye firi hɔ.', 'Enye indawo othengisa kuyo. Isitoko sibalwa ngokwehlukana lapha, futhi abathengi bangalanda kuyo.'],
  ['Add branch', 'Ongeza tawi', 'Fa baa ka ho', 'Engeza igatsha'],
  ['e.g. Ikeja branch', 'mf. tawi la Westlands', 'sɛ East Legon baa', 'isb. igatsha laseSandton'],
  ['Street, area, city', 'Mtaa, eneo, jiji', 'Kwan, mpɔtam, kuro', 'Umgwaqo, indawo, idolobha'],
  ['e.g. Mon–Sat 9am–6pm', 'mf. Jtt–Jmos saa 3 asubuhi–12 jioni', 'sɛ Dwo–Mem 9am–6pm', 'isb. MsoMbuluko–MgqibeloS 9am–6pm'],
  ['Open', 'Iko wazi', 'Abue', 'Kuvuliwe'],
  ['Closed branches keep their stock but don’t show at checkout.', 'Matawi yaliyofungwa yanabaki na bidhaa zao lakini hayaonekani wakati wa kulipa.', 'Baa a wɔato mu kora wɔn nneɛma nanso wɔmpue wɔ tua ka beaeɛ.', 'Amagatsha avaliwe agcina isitoko sawo kodwa awabonakali lapho kukhokhwa khona.'],
  ['Who runs this branch', 'Nani anaendesha tawi hili', 'Hena na ɔhwɛ baa yi so', 'Ubani ophethe leli gatsha'],
  ['The partner runs the branch under your brand and pays you a share of its sales. You see its stock and orders; they don’t see yours.', 'Mshirika huendesha tawi chini ya chapa yako na hukulipa sehemu ya mauzo yake. Unaona bidhaa na maagizo yake; wao hawaoni yako.', 'Hokafoɔ no hwɛ baa no so wɔ wo din ase na ɔtua wo kyɛfa firi ne adetɔn mu. Wohunu ne nneɛma ne n’order; wɔnhunu wo deɛ.', 'Uzakwethu uphatha igatsha ngaphansi kophawu lwakho futhi akukhokhele ingxenye yokuthengisa kwalo. Ubona isitoko nama-oda alo; bona ababoni okwakho.'],
  ['Worked out on sales after discounts and refunds.', 'Hukokotolewa kwa mauzo baada ya punguzo na marejesho.', 'Wɔbu firi adetɔn mu wɔ ntesoɔ ne sika a wɔde asan akyi.', 'Kubalwa ekuthengiseni ngemuva kwezaphulelo nezimbuyiselo.'],
  ['Give the branch a name', 'Lipe tawi jina', 'Ma baa no din', 'Nika igatsha igama'],
  ['You already have a location with this name', 'Tayari una eneo lenye jina hili', 'Wowɔ beaeɛ a ɛwɔ din yi dada', 'Usunayo indawo enaleli gama'],
  ['Add the street address', 'Ongeza anwani ya mtaa', 'Fa kwan address no ka ho', 'Engeza ikheli lomgwaqo'],
  ['Who runs this branch?', 'Nani anaendesha tawi hili?', 'Hena na ɔhwɛ baa yi so?', 'Ubani ophethe leli gatsha?'],
  ['Between 0% and 50%', 'Kati ya 0% na 50%', 'Ntam 0% ne 50%', 'Phakathi kuka-0% no-50%'],

  // ——— Move stock ———
  ['Moved to {place}: {n}', 'Imehamishiwa {place}: {n}', 'Wɔatu akɔ {place}: {n}', 'Kuhanjiswe e-{place}: {n}'],
  ['Total stock stays the same. The move is recorded at both locations.', 'Jumla ya bidhaa inabaki ile ile. Uhamisho unarekodiwa katika maeneo yote mawili.', 'Nneɛma nyinaa dodoɔ nsesa. Wɔkyerɛw tu no wɔ mmeaeɛ mmienu no nyinaa.', 'Isitoko sisonke sihlala sinjalo. Ukuhambisa kubhalwa kuzo zombili izindawo.'],
  ['Variant', 'Aina', 'Ɛsu', 'Uhlobo'],
  ['At {place}: {n}', 'Huko {place}: {n}', 'Wɔ {place}: {n}', 'E-{place}: {n}'],
  ['Choose two different locations', 'Chagua maeneo mawili tofauti', 'Paw mmeaeɛ mmienu a ɛnsɛ', 'Khetha izindawo ezimbili ezihlukene'],
  ['Enter a whole number above 0', 'Weka namba kamili zaidi ya 0', 'Hyɛ nɔma a ɛyɛ mua a ɛboro 0', 'Faka inombolo ephelele engaphezu kuka-0'],
  ['That product is gone', 'Bidhaa hiyo haipo tena', 'Saa adeɛ no nni hɔ bio', 'Lowo mkhiqizo awusekho'],

  // ——— Activity-log download ———
  ['Events: {n}', 'Matukio: {n}', 'Dwumadie: {n}', 'Izenzakalo: {n}'],
  ['Downloaded. Keep this fingerprint with the file — if anyone changes even one character, the fingerprint won’t match.', 'Imepakuliwa. Weka alama hii pamoja na faili — mtu akibadilisha hata herufi moja, alama haitalingana.', 'Wɔatwe. Kora nsateaa ho mfonini yi ne fael no — sɛ obi sesa nkyerɛwdeɛ baako mpo a, ɛrenhyia.', 'Kulandiwe. Gcina lesi sigxivizo nefayela — uma othile eshintsha ngisho uhlamvu olulodwa, isigxivizo ngeke sifane.'],
  ['Copy', 'Nakili', 'Fa ho mfonini', 'Kopisha'],
  ['JSON Lines', 'JSON Lines', 'JSON Lines', 'JSON Lines'],
  ['One event per line, for security tools like Splunk, Microsoft Sentinel or Datadog.', 'Tukio moja kwa kila mstari, kwa zana za usalama kama Splunk, Microsoft Sentinel au Datadog.', 'Dwumadie baako wɔ nsensaneɛ biara so, ma ahobammɔ nnwinnade te sɛ Splunk, Microsoft Sentinel anaa Datadog.', 'Isenzakalo esisodwa emugqeni ngamunye, samathuluzi okuphepha afana ne-Splunk, i-Microsoft Sentinel noma i-Datadog.'],
  ['Workspaces: {n}', 'Nafasi za kazi: {n}', 'Adwumabea: {n}', 'Izindawo zokusebenza: {n}'],
  ['all time', 'wakati wote', 'berɛ nyinaa', 'sonke isikhathi'],
  ['last 24 hours', 'saa 24 zilizopita', 'nnɔnhwerew 24 a atwam', 'amahora angu-24 edlule'],
  ['last {n} days', 'siku {n} zilizopita', 'nnansa {n} a atwam', 'izinsuku ezingu-{n} ezedlule'],
];

export const branchesActivity = columns(rows);
