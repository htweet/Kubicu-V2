import { columns, type Row3 } from './build';

/** Kiswahili, Twi, isiZulu — NFC tags page, ordering, tag editing and the tap page (D444). DRAFTS. */
const rows: Row3[] = [
// ——— Names and sources ———
['NFC tags', 'Vibandiko vya NFC', 'NFC nkyerɛnsodeɛ', 'Amathegi e-NFC'],
['NFC tag', 'Kibandiko cha NFC', 'NFC nkyerɛnsodeɛ', 'Ithegi le-NFC'],
['NFC tap', 'Mguso wa NFC', 'NFC mfa so', 'Ukuthinta kwe-NFC'],
['Want customers to tap instead of scan?', 'Unataka wateja waguse badala ya kuskani?', 'Wopɛ sɛ wo adetɔfoɔ de fon no ka mmom sen sɛ wɔbɛ scan?', 'Ufuna amakhasimende athinte esikhundleni sokuskena?'],
['Order NFC tags', 'Agiza vibandiko vya NFC', 'Tɔ NFC nkyerɛnsodeɛ', 'Oda amathegi e-NFC'],
['Order tags', 'Agiza vibandiko', 'Tɔ nkyerɛnsodeɛ', 'Oda amathegi'],

// ——— Page ———
['Stickers, cards and keyrings customers tap with their phone to open your page. Point each one anywhere, change it later, or switch it off if it’s lost.', 'Vibandiko, kadi na vishikio vya funguo ambavyo wateja huvigusa kwa simu ili kufungua ukurasa wako. Elekeza kila kimoja popote, kibadilishe baadaye, au kizime kikipotea.', 'Stika, kaad ne safoa nkyekyerɛ a adetɔfoɔ de wɔn fon ka na ɛbue wo krataafa. Kyerɛ biara kwan baabiara, sesa no akyire, anaa dum no sɛ ɛyera a.', 'Izitikha, amakhadi nezindandatho zokhiye amakhasimende azithinta ngefoni ukuze kuvuleke ikhasi lakho. Qondisa ngalinye noma kuphi, ulishintshe kamuva, noma ulicime uma lilahlekile.'],
['Delivered in Nigeria only for now', 'Zinaletwa Nigeria pekee kwa sasa', 'Yɛde kɔ Nigeria nko ara seesei', 'Kulethwa eNigeria kuphela okwamanje'],
['Tags you already have keep working everywhere. Ordering outside Nigeria is coming.', 'Vibandiko ulivyonavyo vinaendelea kufanya kazi kila mahali. Kuagiza nje ya Nigeria kunakuja.', 'Nkyerɛnsodeɛ a wowɔ dada no yɛ adwuma baabiara. Wobɛtumi atɔ wɔ Nigeria akyi nkyɛ.', 'Amathegi osunawo ayaqhubeka esebenza yonke indawo. Ukuoda ngaphandle kweNigeria kuyeza.'],
['No tags yet', 'Bado hakuna vibandiko', 'Nkyerɛnsodeɛ biara nni hɔ ɛ', 'Awekho amathegi okwamanje'],
['Put one on your counter, a product box or a rider’s keyring. Taps are counted here, separately from QR scans.', 'Weka kimoja kaunta yako, kwenye boksi la bidhaa au kishikio cha funguo cha mpanda pikipiki. Miguso huhesabiwa hapa, tofauti na skani za QR.', 'Fa baako si wo kaunta so, adeɛ adaka so anaa okwan so ka-sofo safoa nkyekyerɛ ho. Yɛkan mfa so wɔ ha, ɛne QR scan nni nkitaho.', 'Beka elilodwa ekhawuntareni lakho, ebhokisini lomkhiqizo noma endandatho yokhiye yomgibeli. Ukuthinta kubalwa lapha, kwehlukile ekuskeneni kwe-QR.'],
['Taps in the last 7 days: {n} · Tags: {tags}', 'Miguso katika siku 7 zilizopita: {n} · Vibandiko: {tags}', 'Mfa so nnansa 7 a atwam: {n} · Nkyerɛnsodeɛ: {tags}', 'Ukuthinta ezinsukwini ezi-7 ezedlule: {n} · Amathegi: {tags}'],
['QR scans are in QR codes', 'Skani za QR ziko kwenye misimbo ya QR', 'QR scan wɔ QR kood mu', 'Ukuskena kwe-QR kukumakhodi e-QR'],
['On the way · {ref}', 'Ziko njiani · {ref}', 'Ɛreba · {ref}', 'Kusendleleni · {ref}'],
['opens {where}', 'inafungua {where}', 'ɛbue {where}', 'kuvula {where}'],
['Main page', 'Ukurasa mkuu', 'Krataafa titire', 'Ikhasi elikhulu'],
['Short link · {name}', 'Kiungo kifupi · {name}', 'Link tiawa · {name}', 'Isixhumanisi esifushane · {name}'],
['Short link removed — opens main page', 'Kiungo kifupi kimeondolewa — kinafungua ukurasa mkuu', 'Wɔayi link tiawa no — ɛbue krataafa titire', 'Isixhumanisi esifushane sisusiwe — kuvula ikhasi elikhulu'],
['this week · total {total}', 'wiki hii · jumla {total}', 'nnawɔtwe yi · ne nyinaa {total}', 'leli sonto · isamba {total}'],
['Actions for {name}', 'Vitendo vya {name}', 'Nneɛma a wobɛtumi ayɛ ama {name}', 'Izenzo ze-{name}'],
['Rename or re-point', 'Badilisha jina au mahali kinapoelekeza', 'Sesa din anaa baabi a ɛkyerɛ', 'Shintsha igama noma lapho likhomba khona'],
['Test a tap', 'Jaribu mguso', 'Sɔ mfa so hwɛ', 'Zama ukuthinta'],
['Turn off (lost or stolen)', 'Zima (kimepotea au kimeibwa)', 'Dum (ayera anaa wɔawia)', 'Cisha (lilahlekile noma lintshontshiwe)'],
['Turn back on', 'Washa tena', 'Sɔ no bio', 'Livule futhi'],
['“Test a tap” opens the tag’s address in a new tab and counts as a tap. Ordering and delivery are simulated.', '“Jaribu mguso” hufungua anwani ya kibandiko kwenye kichupo kipya na huhesabiwa kama mguso. Kuagiza na kuleta ni majaribio.', '“Sɔ mfa so hwɛ” bue nkyerɛnsodeɛ no address wɔ tab foforɔ mu na wɔkan no sɛ mfa so. Tɔ ne de-brɛ yɛ nhwɛsoɔ.', '“Zama ukuthinta” kuvula ikheli lethegi kuthebhu entsha futhi kubalwa njengokuthinta. Ukuoda nokulethwa kuyalingiswa.'],
['{name} turned off', '{name} kimezimwa', 'Wɔadum {name}', '{name} licishiwe'],
['{name} is on again', '{name} kimewashwa tena', '{name} asɔ bio', '{name} liyasebenza futhi'],
['Taps now show a “turned off” notice instead of your page.', 'Miguso sasa inaonyesha ilani ya “kimezimwa” badala ya ukurasa wako.', 'Mfa so kyerɛ “wɔadum” nkaebɔ seesei mmom sen wo krataafa.', 'Ukuthinta manje kubonisa isaziso esithi “licishiwe” esikhundleni sekhasi lakho.'],

// ——— Kinds ———
['Round stickers', 'Vibandiko vya mviringo', 'Stika kurukuruwa', 'Izitikha eziyindilinga'],
['Round sticker', 'Kibandiko cha mviringo', 'Stika kurukuruwa', 'Isitikha esiyindilinga'],
['Tap cards', 'Kadi za kugusa', 'Mfa-so kaad', 'Amakhadi okuthinta'],
['Tap card', 'Kadi ya kugusa', 'Mfa-so kaad', 'Ikhadi lokuthinta'],
['Keyrings', 'Vishikio vya funguo', 'Safoa nkyekyerɛ', 'Izindandatho zokhiye'],
['Keyring', 'Kishikio cha funguo', 'Safoa nkyekyerɛ', 'Indandatho yokhiye'],
['30 mm · for counters, packaging and windows', 'mm 30 · kwa kaunta, vifungashio na madirisha', '30 mm · ma kaunta, adeɛ kotokuo ne mfɛnsere', '30 mm · yamakhawunta, amaphakethe namafasitela'],
['Card size · for your wallet or a till', 'Ukubwa wa kadi · kwa pochi yako au mahali pa kulipia', 'Kaad kɛseɛ · ma wo sika kotokuo anaa beaeɛ a wɔtua ka', 'Usayizi wekhadi · wesikhwama sakho noma lapho kukhokhelwa khona'],
['Epoxy fob · for staff and delivery riders', 'Kishikio cha epoxy · kwa wafanyakazi na wapanda pikipiki wa kuleta mizigo', 'Epoxy fob · ma adwumayɛfoɔ ne wɔn a wɔde nneɛma kɔ', 'I-fob ye-epoxy · yabasebenzi nabagibeli abalethayo'],

// ——— Ordering ———
['Customers tap their phone on the tag to open your page — no app or camera needed. Change where each tag points any time.', 'Wateja hugusa simu zao kwenye kibandiko ili kufungua ukurasa wako — hakuna haja ya programu wala kamera. Badilisha mahali kila kibandiko kinapoelekeza wakati wowote.', 'Adetɔfoɔ de wɔn fon ka nkyerɛnsodeɛ no na ɛbue wo krataafa — wonhia app anaa kamera. Sesa baabi a nkyerɛnsodeɛ biara kyerɛ berɛ biara.', 'Amakhasimende athinta ifoni yawo ethegini ukuze kuvuleke ikhasi lakho — akudingeki uhlelo lokusebenza noma ikhamera. Shintsha lapho ithegi ngayinye ikhomba khona noma nini.'],
['Pay with test card', 'Lipa kwa kadi ya majaribio', 'Tua ka wɔ sɔhwɛ kaad so', 'Khokha ngekhadi lokuhlola'],
['{price} each', '{price} kila kimoja', '{price} biara', '{price} ngayinye'],
['How many', 'Ngapi', 'Ahe', 'Mangaki'],
['Between 1 and {max}', 'Kati ya 1 na {max}', 'Ntam 1 ne {max}', 'Phakathi kuka-1 no-{max}'],
['All tags in this order start here. You can point each one somewhere else later.', 'Vibandiko vyote katika agizo hili vinaanzia hapa. Unaweza kuelekeza kila kimoja mahali pengine baadaye.', 'Nkyerɛnsodeɛ nyinaa a ɛwɔ order yi mu fi ase wɔ ha. Wobɛtumi akyerɛ biara kwan kɔ baabi foforɔ akyire.', 'Wonke amathegi kule oda aqala lapha. Ungaqondisa ngalinye kwenye indawo kamuva.'],
['Deliver to', 'Leta kwa', 'De kɔ', 'Hambisa ku'],
['Address in Nigeria', 'Anwani nchini Nigeria', 'Address wɔ Nigeria', 'Ikheli eNigeria'],
['Delivery (about 5 days)', 'Uletaji (karibu siku 5)', 'De-brɛ (bɛyɛ nnansa 5)', 'Ukulethwa (cishe izinsuku ezi-5)'],
['Prices are examples. Works with most phones from the last few years — iPhones tap from the lock screen, and Android needs NFC switched on.', 'Bei ni mifano. Inafanya kazi na simu nyingi za miaka ya karibuni — iPhone hugusa kutoka skrini iliyofungwa, na Android inahitaji NFC iwe imewashwa.', 'Bo yɛ nhwɛsoɔ. Ɛne fon pii a ɛfiri mfeɛ kakra a atwam yɛ adwuma — iPhone tumi fa so firi lock screen so, na Android hia sɛ wɔsɔ NFC.', 'Amanani ayizibonelo. Kusebenza namafoni amaningi eminyaka embalwa edlule — ama-iPhone athinta esikrinini esikhiyiwe, kanti i-Android idinga ukuthi i-NFC ivulwe.'],
['Add the street address, area and state', 'Ongeza anwani ya mtaa, eneo na jimbo', 'Fa kwan address, mpɔtam ne state ka ho', 'Engeza ikheli lomgwaqo, indawo nesifundazwe'],
['So the rider can reach you', 'Ili mpanda pikipiki aweze kukufikia', 'Sɛdeɛ ka-sofo no bɛtumi afrɛ wo', 'Ukuze umgibeli akuthole'],
['Order {ref} placed', 'Agizo {ref} limewekwa', 'Wɔde order {ref} ato hɔ', 'I-oda {ref} ifakiwe'],
['{total} paid (test mode). Your tags are ready to point now and arrive in about 5 days.', '{total} imelipwa (hali ya majaribio). Vibandiko vyako viko tayari kuelekezwa sasa na vitafika baada ya siku 5 hivi.', 'Wɔatua {total} (sɔhwɛ mu). Wo nkyerɛnsodeɛ asiesie sɛ wobɛkyerɛ no kwan seesei na ɛbɛduru bɛyɛ nnansa 5 mu.', 'Kukhokhelwe u-{total} (imodi yokuhlola). Amathegi akho asekulungele ukuqondiswa manje futhi azofika ezinsukwini ezi-5 noma ngaphezulu.'],

// ——— Destination ———
['When someone taps it, open', 'Mtu akiigusa, fungua', 'Sɛ obi de fa so a, bue', 'Uma othile elithinta, vula'],
['Your main page', 'Ukurasa wako mkuu', 'Wo krataafa titire', 'Ikhasi lakho elikhulu'],
['One of your short links', 'Moja ya viungo vyako vifupi', 'Wo link tiawa no mu baako', 'Esinye sezixhumanisi zakho ezifushane'],
['Another web address', 'Anwani nyingine ya wavuti', 'Wɛb address foforɔ', 'Elinye ikheli lewebhu'],
['Short links keep their own campaign and stats too.', 'Viungo vifupi pia huhifadhi kampeni na takwimu zao.', 'Link tiawa nso kora wɔn ankasa kampeen ne akontaabuo.', 'Izixhumanisi ezifushane nazo zigcina umkhankaso nezibalo zazo.'],
['Short link', 'Kiungo kifupi', 'Link tiawa', 'Isixhumanisi esifushane'],
['Web address', 'Anwani ya wavuti', 'Wɛb address', 'Ikheli lewebhu'],
['Enter a full address starting with https://', 'Weka anwani kamili inayoanza na https://', 'Hyɛ address a ɛyɛ pɛ a ɛfiri ase https://', 'Faka ikheli eliphelele eliqala ngo-https://'],

// ——— One tag ———
['Total taps: {total} · This week: {week}', 'Jumla ya miguso: {total} · Wiki hii: {week}', 'Mfa so nyinaa: {total} · Nnawɔtwe yi: {week}', 'Ukuthinta kukonke: {total} · Leli sonto: {week}'],
['Where it is, so you can tell tags apart — e.g. Front counter, Rider Tunde.', 'Kilipo, ili utofautishe vibandiko — mf. Kaunta ya mbele, Mpanda pikipiki Juma.', 'Baabi a ɛwɔ, sɛdeɛ wobɛhunu nsonsonoeɛ — sɛ Kaunta anim, Ka-sofo Kofi.', 'Lapho likhona, ukuze uhlukanise amathegi — isb. Ikhawunta yangaphambili, Umgibeli uSipho.'],
['Give it a name', 'Kipe jina', 'Ma no din', 'Linike igama'],
['Written on the chip:', 'Imeandikwa kwenye chipu:', 'Deɛ wɔakyerɛw wɔ chip no so:', 'Kubhalwe kushiphu:'],
['Last tap {when}', 'Mguso wa mwisho {when}', 'Mfa so a ɛtwa toɔ {when}', 'Ukuthinta kokugcina {when}'],
['Tag updated', 'Kibandiko kimesasishwa', 'Wɔasesa nkyerɛnsodeɛ no', 'Ithegi libuyekeziwe'],
['The next tap goes to the new place. Nothing to reprint.', 'Mguso unaofuata utaenda mahali papya. Hakuna cha kuchapisha upya.', 'Mfa so a ɛdi hɔ bɛkɔ baabi foforɔ no. Biribiara nni hɔ a wobɛtintim bio.', 'Ukuthinta okulandelayo kuya endaweni entsha. Akukho okudinga ukuphrintwa kabusha.'],

// ——— Tap page ———
['Opening…', 'Inafungua…', 'Ɛrebue…', 'Kuyavula…'],
['This tag has been turned off', 'Kibandiko hiki kimezimwa', 'Wɔadum nkyerɛnsodeɛ yi', 'Leli thegi licishiwe'],
['This tag isn’t linked to anything', 'Kibandiko hiki hakijaunganishwa na chochote', 'Nkyerɛnsodeɛ yi ne biribiara nni nkitaho', 'Leli thegi alixhunyiwe nalutho'],
['The business switched it off — it may have been lost. You can still visit their page.', 'Biashara imekizima — huenda kimepotea. Bado unaweza kutembelea ukurasa wao.', 'Adwuma no adum no — ebia ayera. Wobɛtumi akɔ wɔn krataafa so ara.', 'Ibhizinisi lilicishile — kungenzeka lilahlekile. Usengavakashela ikhasi labo.'],
['It may be an old or test tag.', 'Huenda ni kibandiko cha zamani au cha majaribio.', 'Ebia ɛyɛ nkyerɛnsodeɛ dada anaa sɔhwɛ deɛ.', 'Kungenzeka kuyithegi elidala noma lokuhlola.'],
['Go to their page', 'Nenda kwenye ukurasa wao', 'Kɔ wɔn krataafa so', 'Iya ekhasini labo']];


export const nfc = columns(rows);