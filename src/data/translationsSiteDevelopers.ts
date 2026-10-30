/**
 * Website developers page (D336). Code, paths, permission names, event ids and JSON stay as written.
 * DRAFTS — every non-English line needs a native speaker's check. Row: [English, Naijá, Yorùbá, Hausa, Igbo].
 */
export const siteDevelopersRows: [string, string, string, string, string][] = [
['Build on', 'Build on top', 'Kọ́ lórí', 'Gina akan', 'Wuo n’elu'],
['Read orders, sync stock with your shop till, and get a signed message the moment someone pays — in naira, with Nigerian phone formats, from day one.', 'Read orders, sync stock with your shop till, and get signed message the moment person pay — for naira, with Nigerian phone formats, from day one.', 'Ka àṣẹ, mú ọjà ṣiṣẹ́pọ̀ pẹ̀lú ẹ̀rọ ìsanwó ṣọ́ọ̀bù rẹ, kí o sì gba ìfiránṣẹ́ tí a fọwọ́ sí ní kété tí ẹnìkan bá sanwó — ní náírà, pẹ̀lú ìlànà fóònù Nàìjíríà, láti ọjọ́ kìíní.', 'Karanta oda, daidaita kaya da na’urar shagonka, ka sami saƙo mai sa hannu a lokacin da wani ya biya — a naira, tare da tsarin wayar Najeriya, tun daga rana ta farko.', 'Gụọ ọda, mekọrịta ngwaahịa na igbe ego ụlọ ahịa gị, ma nweta ozi ebinyere aka ozugbo mmadụ kwụrụ ụgwọ — na naịra, na usoro ekwentị Naịjirịa, site n’ụbọchị mbụ.'],
['Get a test key', 'Get test key', 'Gba kọ́kọ́rọ́ ìdánwò', 'Sami makullin gwaji', 'Nweta igodo nnwale'],
['Try the sandbox', 'Try the sandbox', 'Gbìyànjú ibi ìdánwò', 'Gwada wurin gwaji', 'Nwaa ebe nnwale'],
['Developer preview · test mode only. Keys live in Settings → Developers.', 'Developer preview · test mode only. Keys dey Settings → Developers.', 'Àwòtẹ́lẹ̀ olùgbéejáde · ipò ìdánwò nìkan. Kọ́kọ́rọ́ wà nínú Ètò → Olùgbéejáde.', 'Dubawar mai haɓakawa · yanayin gwaji kawai. Makullai suna a Saituna → Masu haɓakawa.', 'Nlele onye mmepe · ọnọdụ nnwale naanị. Igodo dị na Ntọala → Ndị mmepe.'],
['The basics', 'The basics', 'Àwọn ìpìlẹ̀', 'Abubuwan yau da kullum', 'Ihe ndị bụ isi'],
['Sign in with a key', 'Sign in with key', 'Wọlé pẹ̀lú kọ́kọ́rọ́', 'Shiga da makulli', 'Banye na igodo'],
['Send your key as a Bearer token. Test keys (kub_test_) only see sample data; live keys see real data. Each key only gets the permissions you tick.', 'Send your key as Bearer token. Test keys (kub_test_) dey see only sample data; live keys dey see real data. Each key go get only the permissions wey you tick.', 'Fi kọ́kọ́rọ́ rẹ ránṣẹ́ bí àmì Bearer. Kọ́kọ́rọ́ ìdánwò (kub_test_) ń rí dátà àpẹẹrẹ nìkan; kọ́kọ́rọ́ gidi ń rí dátà gidi. Kọ́kọ́rọ́ kọ̀ọ̀kan ń gba ìyọ̀ǹda tí o fi àmì sí nìkan.', 'Aika makullinka a matsayin alamar Bearer. Makullan gwaji (kub_test_) suna ganin bayanan misali kawai; makullan rayuwa suna ganin bayanai na gaske. Kowane makulli yana samun izinin da ka yi alama kawai.', 'Ziga igodo gị dịka akara Bearer. Igodo nnwale (kub_test_) na-ahụ naanị data ihe atụ; igodo ndụ na-ahụ ezigbo data. Igodo ọ bụla na-enweta naanị ikike ị kara akara.'],
['Money and phones', 'Money and phones', 'Owó àti fóònù', 'Kuɗi da wayoyi', 'Ego na ekwentị'],
['Amounts are whole naira with currency "NGN". Phones are +234. Times are ISO 8601 in West Africa Time.', 'Amounts na whole naira with currency "NGN". Phones na +234. Times na ISO 8601 for West Africa Time.', 'Iye owó jẹ́ náírà odidi pẹ̀lú owó "NGN". Fóònù jẹ́ +234. Àkókò jẹ́ ISO 8601 ní Àkókò Ìwọ̀-Oòrùn Áfíríkà.', 'Adadin kuɗi naira ne cikakke tare da kuɗin "NGN". Wayoyi +234 ne. Lokuta ISO 8601 ne a Lokacin Yammacin Afirka.', 'Ego bụ naịra zuru ezu nwere ego "NGN". Ekwentị bụ +234. Oge bụ ISO 8601 n’Oge Ọdịda Anyanwụ Afrịka.'],
['Limits and errors', 'Limits and errors', 'Ààlà àti àṣìṣe', 'Iyaka da kurakurai', 'Oke na njehie'],
['Requests per minute per key: {n}. Over that you get 429 with Retry-After. Errors always carry a code and a plain message.', 'Requests per minute per key: {n}. If you pass am you go get 429 with Retry-After. Errors always get code and simple message.', 'Ìbéèrè ní ìṣẹ́jú kan fún kọ́kọ́rọ́ kọ̀ọ̀kan: {n}. Bí ó bá ju bẹ́ẹ̀ lọ o ó gba 429 pẹ̀lú Retry-After. Àṣìṣe máa ń ní kóòdù àti ìfiránṣẹ́ tí ó rọrùn.', 'Buƙatu a minti ɗaya ga kowane makulli: {n}. Fiye da haka za ka sami 429 tare da Retry-After. Kurakurai koyaushe suna da lamba da saƙo mai sauƙi.', 'Arịrịọ kwa nkeji maka igodo ọ bụla: {n}. Karịa nke ahụ ị ga-enweta 429 na Retry-After. Njehie na-enwe koodu na ozi doro anya mgbe niile.'],
['Endpoints', 'Endpoints', 'Àwọn òpin ìbéèrè', 'Wuraren buƙata', 'Ebe njedebe'],
['Version {v}. Every list is paged with a cursor and newest first.', 'Version {v}. Every list dey paged with cursor and newest first.', 'Ẹ̀yà {v}. Gbogbo àkójọ ni a pín sí ojú-ìwé pẹ̀lú kọ́sọ̀ àti tuntun jù ní àkọ́kọ́.', 'Siga {v}. Kowane jeri an raba shi shafuka da kibiya kuma sabbi da farko.', 'Ụdị {v}. Ndepụta ọ bụla nwere ibe site na cursor, nke ọhụrụ na mbụ.'],
['API endpoints', 'API endpoints', 'Òpin ìbéèrè API', 'Wuraren buƙatar API', 'Ebe njedebe API'],
['Request', 'Request', 'Ìbéèrè', 'Buƙata', 'Arịrịọ'],
['What it does', 'Wetin e dey do', 'Ohun tí ó ń ṣe', 'Abin da yake yi', 'Ihe ọ na-eme'],
['Permission', 'Permission', 'Ìyọ̀ǹda', 'Izini', 'Ikike'],
['List products with price, stock and status', 'List products with price, stock and status', 'Ṣe àkójọ ọjà pẹ̀lú iye owó, iye tí ó wà àti ipò', 'Jera kaya tare da farashi, adadi da matsayi', 'Depụta ngwaahịa na ọnụahịa, ngwaahịa fọdụrụ na ọnọdụ'],
['Create a product', 'Create product', 'Ṣẹ̀dá ọjà kan', 'Ƙirƙiri kaya', 'Mepụta ngwaahịa'],
['Set stock for a product or variant', 'Set stock for product or variant', 'Ṣètò iye ọjà fún ọjà tàbí oríṣi kan', 'Saita adadi don kaya ko nau’i', 'Hazie ngwaahịa fọdụrụ maka ngwaahịa ma ọ bụ ụdị'],
['List orders, newest first, filter by status', 'List orders, newest first, filter by status', 'Ṣe àkójọ àṣẹ, tuntun ní àkọ́kọ́, ṣàlẹ̀ nípa ipò', 'Jera oda, sabbi da farko, tace ta matsayi', 'Depụta ọda, nke ọhụrụ na mbụ, họcha site n’ọnọdụ'],
['Move an order along: packed, sent, delivered', 'Move order forward: packed, sent, delivered', 'Gbé àṣẹ síwájú: a ti dì í, a ti fi ránṣẹ́, a ti fi jíṣẹ́', 'Ciyar da oda gaba: an haɗa, an aika, an isar', 'Bugharịa ọda n’ihu: ekechiri, ezigara, ebutere'],
['List bookings in a date range', 'List bookings for date range', 'Ṣe àkójọ ìfiṣura láàárín àwọn ọjọ́ kan', 'Jera ajiya a cikin kewayon kwanan wata', 'Depụta ndebanye n’oge ụbọchị'],
['List contacts with consent status', 'List contacts with consent status', 'Ṣe àkójọ olùbásọ̀rọ̀ pẹ̀lú ipò ìfọwọ́sí', 'Jera lambobin sadarwa tare da matsayin yarda', 'Depụta kọntaktị na ọnọdụ nkwenye'],
['Add a contact (consent must be recorded)', 'Add contact (consent must dey recorded)', 'Fi olùbásọ̀rọ̀ kún un (a gbọ́dọ̀ kọ ìfọwọ́sí sílẹ̀)', 'Ƙara lambar sadarwa (dole a rubuta yarda)', 'Tinye kọntaktị (a ga-edekọ nkwenye)'],
['Visits, taps and revenue for a period', 'Visits, taps and revenue for one period', 'Ìbẹ̀wò, títẹ̀ àti owó tí ó wọlé fún àkókò kan', 'Ziyara, taɓawa da kuɗin shiga na wani lokaci', 'Nleta, mpịkọta na ego batara maka oge'],
['Sandbox', 'Sandbox', 'Ibi ìdánwò', 'Wurin gwaji', 'Ebe nnwale'],
['Run a request against sample data. Nothing leaves your browser.', 'Run request on sample data. Nothing go comot your browser.', 'Ṣe ìbéèrè lórí dátà àpẹẹrẹ. Kò sí ohun tí ó ń kúrò nínú aṣàwákiri rẹ.', 'Gudanar da buƙata akan bayanan misali. Babu abin da ke barin burauzarka.', 'Mee arịrịọ na data ihe atụ. Ọ dịghị ihe na-apụ n’ihe nchọgharị gị.'],
['Send request', 'Send request', 'Fi ìbéèrè ránṣẹ́', 'Aika buƙata', 'Ziga arịrịọ'],
['The response appears here', 'The response go show here', 'Ìdáhùn yóò hàn níbí', 'Amsar za ta bayyana a nan', 'Nzaghachi ga-apụta ebe a'],
['Webhooks', 'Webhooks', 'Webhook', 'Webhooks', 'Webhooks'],
['Signed with your endpoint’s secret. Failed deliveries retry after: {list}.', 'Signed with your endpoint secret. Deliveries wey fail go try again after: {list}.', 'A fọwọ́ sí i pẹ̀lú àṣírí òpin rẹ. Ìfiránṣẹ́ tí ó kùnà ń tún gbìyànjú lẹ́yìn: {list}.', 'An sa hannu da sirrin wurin karɓarka. Isarwar da ta gaza tana sake gwadawa bayan: {list}.', 'Ebinyere aka na nzuzo ebe njedebe gị. Nnyefe dara ada na-anwa ọzọ mgbe: {list}.'],
['An order is paid', 'Order don pay', 'A ti san owó àṣẹ kan', 'An biya oda', 'A kwụọla ụgwọ ọda'],
['An order is refunded', 'Order don refund', 'A ti dá owó àṣẹ kan padà', 'An mayar da kuɗin oda', 'A kwụghachila ego ọda'],
['An order is marked delivered', 'Order don mark as delivered', 'A ti sàmì àṣẹ kan pé ó ti dé', 'An yi alamar an isar da oda', 'Akaala ọda dịka ebutere'],
['A booking is made', 'Booking don happen', 'A ti ṣe ìfiṣura kan', 'An yi ajiya', 'E mere ndebanye'],
['A booking is cancelled', 'Booking don cancel', 'A ti fagilé ìfiṣura kan', 'An soke ajiya', 'Akagbuola ndebanye'],
['A new contact is added', 'New contact don add', 'A ti fi olùbásọ̀rọ̀ tuntun kún un', 'An ƙara sabuwar lambar sadarwa', 'Agbakwunyela kọntaktị ọhụrụ'],
['A form is sent', 'Form don send', 'A ti fi fọ́ọ̀mù kan ránṣẹ́', 'An aika fom', 'Ezigala fọm'],
['A subscription renews', 'Subscription don renew', 'Ìforúkọsílẹ̀ kan ti tún bẹ̀rẹ̀', 'Biyan kuɗi ya sabunta', 'Ndebanye aha emeghariala'],
['A subscription payment fails', 'Subscription payment don fail', 'Ìsanwó ìforúkọsílẹ̀ kan kùnà', 'Biyan kuɗin rajista ya gaza', 'Ịkwụ ụgwọ ndebanye aha dara ada'],
['A guest is checked in', 'Guest don check in', 'A ti gba àlejò kan wọlé', 'An shigar da baƙo', 'Anabatala onye ọbịa'],
['A payout is sent to your bank', 'Payout don send to your bank', 'A ti fi owó ránṣẹ́ sí báńkì rẹ', 'An aika kuɗi zuwa bankinka', 'Ezigala ego n’ụlọ akụ gị'],
['Check the signature (Node.js)', 'Check the signature (Node.js)', 'Ṣàyẹ̀wò ìbuwọ́lù (Node.js)', 'Duba sa hannu (Node.js)', 'Lelee mbinye aka (Node.js)'],
['Changelog', 'Changelog', 'Àkọsílẹ̀ àyípadà', 'Rajistar canje-canje', 'Ndekọ mgbanwe'],
['Developer preview opens', 'Developer preview don open', 'Àwòtẹ́lẹ̀ olùgbéejáde ṣí', 'Dubawar mai haɓakawa ta buɗe', 'Nlele onye mmepe emeghe'],
['API keys, webhooks with signed payloads and retries, connected apps and a test sandbox. Everything is test mode until a payment partner is live.', 'API keys, webhooks with signed payloads and retries, connected apps and test sandbox. Everything na test mode until payment partner go live.', 'Kọ́kọ́rọ́ API, webhook pẹ̀lú ẹrù tí a fọwọ́ sí àti àtúngbìyànjú, ìṣàfilọ́lẹ̀ tí a so pọ̀ àti ibi ìdánwò. Ohun gbogbo wà ní ipò ìdánwò títí alábàáṣiṣẹ́pọ̀ ìsanwó yóò fi wà láàyè.', 'Makullan API, webhooks masu kaya mai sa hannu da sake gwadawa, manhajojin da aka haɗa da wurin gwaji. Komai yana yanayin gwaji har sai abokin biya ya fara aiki.', 'Igodo API, webhooks nwere ibu ebinyere aka na ịnwa ọzọ, ngwa ejikọrọ na ebe nnwale. Ihe niile nọ n’ọnọdụ nnwale ruo mgbe onye mmekọ ịkwụ ụgwọ malitere.'],
['Naira amounts are whole numbers', 'Naira amounts na whole numbers', 'Iye owó náírà jẹ́ nọ́mbà odidi', 'Adadin naira cikakkun lambobi ne', 'Ego naịra bụ ọnụ ọgụgụ zuru ezu'],
['Every amount is an integer in naira with currency "NGN". Kobo are never used.', 'Every amount na whole number for naira with currency "NGN". We no dey ever use kobo.', 'Gbogbo iye owó jẹ́ odidi nọ́mbà ní náírà pẹ̀lú owó "NGN". A kì í lo kọ́bọ̀ rárá.', 'Kowane adadi cikakken lamba ne a naira tare da kuɗin "NGN". Ba a taɓa amfani da kobo ba.', 'Ego ọ bụla bụ ọnụ ọgụgụ zuru ezu na naịra nwere ego "NGN". Anaghị eji kobo.'],
['Phone numbers in +234 format', 'Phone numbers for +234 format', 'Nọ́mbà fóònù ní ìlànà +234', 'Lambobin waya a tsarin +234', 'Nọmba ekwentị n’usoro +234'],
['Phones are returned in international format. Buyer phones are partly hidden unless the key can read orders.', 'Phones dey come back for international format. Buyer phones dey partly hidden unless the key fit read orders.', 'A ń dá fóònù padà ní ìlànà àgbáyé. A fi apá kan fóònù olùrà pamọ́ àyàfi bí kọ́kọ́rọ́ bá lè ka àṣẹ.', 'Ana mayar da wayoyi a tsarin ƙasa da ƙasa. Wayoyin masu saye an ɓoye su wani ɓangare sai dai idan makullin zai iya karanta oda.', 'A na-eweghachi ekwentị n’usoro mba ụwa. Ezochiri akụkụ ekwentị ndị na-azụ ma ọ bụrụ na igodo enweghị ike ịgụ ọda.']];


const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(siteDevelopersRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const siteDevelopersPcm = column(1);
export const siteDevelopersYo = column(2);
export const siteDevelopersHa = column(3);
export const siteDevelopersIg = column(4);