/** Drafted translations for Batch 13 customer screens: USSD, watermarks, currency notes (D138). Drafts — need native review. */
type Dict = Record<string, string>;

// [English, Pidgin, Yorùbá, Hausa, Igbo]
const rows: [string, string, string, string, string][] = [
// Checkout: how to pay now
['Pay with', 'Pay with', 'Sanwó pẹ̀lú', 'Biya da', 'Kwụọ ụgwọ site na'],
['Card or transfer', 'Card or transfer', 'Káàdì tàbí ìfiránṣẹ́', 'Kati ko tura kuɗi', 'Kaadị ma ọ bụ nnyefe'],
['USSD code', 'USSD code', 'Kóòdù USSD', 'Lambar USSD', 'Koodu USSD'],
['No card or data needed — dial a code from your bank phone and approve with your PIN.', 'You no need card or data — dial code from di phone wey your bank dey and approve with your PIN.', 'O kò nílò káàdì tàbí dátà — tẹ kóòdù láti fóònù báǹkì rẹ kí o sì fọwọ́ sí i pẹ̀lú PIN rẹ.', 'Ba ka buƙatar kati ko data — buga lamba daga wayar bankinka ka amince da PIN ɗinka.', 'Ịchọghị kaadị ma ọ bụ data — pịa koodu site na ekwentị ụlọ akụ gị ma kwado ya na PIN gị.'],
['Get a USSD code for {amount}', 'Collect USSD code for {amount}', 'Gba kóòdù USSD fún {amount}', 'Karɓi lambar USSD don {amount}', 'Nweta koodu USSD maka {amount}'],
['No card? Pay the deposit with USSD', 'No card? Pay di deposit with USSD', 'Kò sí káàdì? San owó ìdógò pẹ̀lú USSD', 'Babu kati? Biya ajiya da USSD', 'Enweghị kaadị? Kwụọ ego nkwado site na USSD'],
['No card? Pay with a USSD code', 'No card? Pay with USSD code', 'Kò sí káàdì? Sanwó pẹ̀lú kóòdù USSD', 'Babu kati? Biya da lambar USSD', 'Enweghị kaadị? Kwụọ site na koodu USSD'],
// USSD flow
['Pay with USSD', 'Pay with USSD', 'Sanwó pẹ̀lú USSD', 'Biya da USSD', 'Kwụọ site na USSD'],
['No card or data needed. Dial a code from the phone your bank account is on and approve with your PIN.', 'You no need card or data. Dial code from di phone wey dey your bank account, then approve with your PIN.', 'O kò nílò káàdì tàbí dátà. Tẹ kóòdù láti orí fóònù tí àkọọ́lẹ̀ báǹkì rẹ wà lórí rẹ̀, kí o sì fọwọ́ sí i pẹ̀lú PIN rẹ.', 'Ba ka buƙatar kati ko data. Buga lamba daga wayar da asusun bankinka yake kai, ka amince da PIN ɗinka.', 'Ịchọghị kaadị ma ọ bụ data. Pịa koodu site na ekwentị akaụntụ ụlọ akụ gị dị na ya, ma kwado ya na PIN gị.'],
['Amount', 'Amount', 'Iye', 'Adadi', 'Ego'],
['Choose your bank', 'Choose your bank', 'Yan báǹkì rẹ', 'Zaɓi bankinka', 'Họrọ ụlọ akụ gị'],
['Dial this on your {bank} phone', 'Dial dis one for your {bank} phone', 'Tẹ èyí lórí fóònù {bank} rẹ', 'Buga wannan a wayar {bank} ɗinka', 'Pịa nke a na ekwentị {bank} gị'],
['Code expires in {m} minutes {s} seconds', 'Code go expire for {m} minutes {s} seconds', 'Kóòdù yóò parí ní ìṣẹ́jú {m} ìṣẹ́jú-àáyá {s}', 'Lambar za ta ƙare cikin mintuna {m} daƙiƙa {s}', 'Koodu ga-agwụ n’ime nkeji {m} sekọnd {s}'],
['Expires in {time}', 'E go expire for {time}', 'Yóò parí ní {time}', 'Zai ƙare cikin {time}', 'Ọ ga-agwụ n’ime {time}'],
['Dial now', 'Dial am now', 'Tẹ ẹ́ báyìí', 'Buga yanzu', 'Pịa ugbu a'],
['Copy', 'Copy', 'Dà á kọ', 'Kwafa', 'Depụta'],
['Copied', 'E don copy', 'Ó ti dà kọ', 'An kwafa', 'E depụtala'],
['Dial the code from the phone number linked to your {bank} account.', 'Dial di code from di phone number wey dey your {bank} account.', 'Tẹ kóòdù náà láti nọ́ńbà fóònù tí ó so mọ́ àkọọ́lẹ̀ {bank} rẹ.', 'Buga lambar daga lambar wayar da ke haɗe da asusun {bank} ɗinka.', 'Pịa koodu ahụ site na nọmba ekwentị jikọtara na akaụntụ {bank} gị.'],
['Check the amount and the name KUBICU, then enter your USSD PIN.', 'Check di amount and di name KUBICU, then put your USSD PIN.', 'Ṣàyẹ̀wò iye náà àti orúkọ KUBICU, lẹ́yìn náà tẹ PIN USSD rẹ.', 'Duba adadin da sunan KUBICU, sannan ka shigar da PIN ɗin USSD ɗinka.', 'Lelee ego ahụ na aha KUBICU, wee tinye PIN USSD gị.'],
['Come back here and tap “I’ve dialled it”.', 'Come back here come press “I don dial am”.', 'Padà síbí kí o tẹ “Mo ti tẹ ẹ́”.', 'Dawo nan ka taɓa “Na buga”.', 'Laghachi ebe a pịa “Apịala m ya”.'],
['Your bank may charge a small USSD fee on your airtime. Never share your PIN — not even with the seller.', 'Your bank fit remove small USSD charge from your airtime. No ever give anybody your PIN — even di seller.', 'Báǹkì rẹ lè gba owó USSD díẹ̀ lórí káàdì ìpè rẹ. Má ṣe fi PIN rẹ han ẹnikẹ́ni — kódà olùtajà.', 'Bankinka na iya cire ɗan kuɗin USSD daga katin wayarka. Kada ka taɓa ba kowa PIN ɗinka — har mai sayarwa.', 'Ụlọ akụ gị nwere ike iwepụ obere ego USSD na kaadị oku gị. Ekesala onye ọ bụla PIN gị — ọbụna onye na-ere ahịa.'],
['Test mode — choose what the bank does', 'Test mode — choose wetin di bank go do', 'Ìdánwò — yan ohun tí báǹkì yóò ṣe', 'Gwaji — zaɓi abin da banki zai yi', 'Nnwale — họrọ ihe ụlọ akụ ga-eme'],
['Bank confirms', 'Bank confirm am', 'Báǹkì fọwọ́ sí i', 'Banki ya tabbatar', 'Ụlọ akụ kwadoro'],
['Bank is slow to confirm', 'Bank dey slow to confirm', 'Báǹkì ń pẹ́ láti fọwọ́ sí i', 'Banki yana jinkirin tabbatarwa', 'Ụlọ akụ na-egbu oge ịkwado'],
['Bank declines', 'Bank no gree', 'Báǹkì kọ̀ ọ́', 'Banki ya ƙi', 'Ụlọ akụ jụrụ'],
['Waiting for your bank', 'We dey wait for your bank', 'À ń dúró de báǹkì rẹ', 'Muna jiran bankinka', 'Anyị na-eche ụlọ akụ gị'],
['Keep this page open. It usually takes a few seconds after you enter your PIN.', 'No close dis page. E dey take few seconds after you put your PIN.', 'Jẹ́ kí ojú-ewé yìí ṣí sílẹ̀. Ó máa ń gba ìṣẹ́jú-àáyá díẹ̀ lẹ́yìn tí o bá tẹ PIN rẹ.', 'Bar wannan shafin a buɗe. Yawanci yana ɗaukar ƴan daƙiƙoƙi bayan ka shigar da PIN ɗinka.', 'Hapụ ibe a ka ọ dị mepere emepe. Ọ na-ewe sekọnd ole na ole mgbe ị tinyere PIN gị.'],
['Your bank declined the payment', 'Your bank no gree di payment', 'Báǹkì rẹ kọ ìsanwó náà', 'Bankinka ya ƙi biyan', 'Ụlọ akụ gị jụrụ ịkwụ ụgwọ ahụ'],
['That code has expired', 'Dat code don expire', 'Kóòdù yẹn ti parí', 'Wannan lambar ta ƙare', 'Koodu ahụ agwụla'],
['No money left your account. Check your balance or daily USSD limit, or try another bank or a card.', 'No money comot your account. Check your balance or your daily USSD limit, or try another bank or card.', 'Kò sí owó tó kúrò nínú àkọọ́lẹ̀ rẹ. Ṣàyẹ̀wò ìyókù owó rẹ tàbí òpin USSD ojoojúmọ́, tàbí gbìyànjú báǹkì míì tàbí káàdì.', 'Babu kuɗin da ya fita daga asusunka. Duba ragowar kuɗinka ko iyakar USSD na yau, ko gwada wani banki ko kati.', 'Ọ dịghị ego si n’akaụntụ gị pụọ. Lelee ego fọdụrụ ma ọ bụ oke USSD kwa ụbọchị, ma ọ bụ nwalee ụlọ akụ ọzọ ma ọ bụ kaadị.'],
['Codes work for {n} minutes. Get a new one — nothing was charged.', 'Code dey work for {n} minutes. Collect new one — nobody charge you.', 'Kóòdù máa ń ṣiṣẹ́ fún ìṣẹ́jú {n}. Gba tuntun — a kò gba owó kankan.', 'Lambobi suna aiki na mintuna {n}. Karɓi sabuwa — ba a cire komai ba.', 'Koodu na-arụ ọrụ maka nkeji {n}. Nweta nke ọhụrụ — ewepụghị ego ọ bụla.'],
['I’ve dialled it', 'I don dial am', 'Mo ti tẹ ẹ́', 'Na buga', 'Apịala m ya'],
['Get a new code', 'Collect new code', 'Gba kóòdù tuntun', 'Karɓi sabuwar lamba', 'Nweta koodu ọhụrụ'],
['Try another bank', 'Try another bank', 'Gbìyànjú báǹkì míì', 'Gwada wani banki', 'Nwalee ụlọ akụ ọzọ'],
['Change bank', 'Change bank', 'Yí báǹkì padà', 'Canza banki', 'Gbanwee ụlọ akụ'],
['Pay another way', 'Pay another way', 'Sanwó lọ́nà míì', 'Biya ta wata hanya', 'Kwụọ n’ụzọ ọzọ'],
// Watermarks
['Preview of your first page', 'Preview of your first page', 'Àwòkọ́ṣe ojú-ewé àkọ́kọ́ rẹ', 'Samfoti na shafinka na farko', 'Ihe nlele nke ibe mbụ gị'],
['Preview of the mark on your image', 'Preview of di mark wey dey your picture', 'Àwòkọ́ṣe àmì tó wà lórí àwòrán rẹ', 'Samfoti na alamar da ke kan hotonka', 'Ihe nlele nke akara dị na foto gị'],
['Your copy carries a faint “{stamp}” mark, so a shared copy points back to this order.', 'Your copy get light “{stamp}” mark, so if person share am, e go show say na from dis order.', 'Ẹ̀dà rẹ ní àmì “{stamp}” tí kò hàn kedere, kí ẹ̀dà tí wọ́n pín lè tọ́ka padà sí ìbéèrè yìí.', 'Kwafinka yana ɗauke da alamar “{stamp}” mara ƙarfi, don kwafin da aka raba ya nuna wannan odar.', 'Mbipụta gị nwere akara “{stamp}” na-adịghị ike, ka mbipụta e kesara gosi na ọ si n’iwu a.'],
// Wallet outside naira
['Payouts in {currency} need a partner in your country', 'Payout for {currency} need partner for your country', 'Ìgbàjáde ní {currency} nílò alábàáṣiṣẹ́pọ̀ ní orílẹ̀-èdè rẹ', 'Cirewa a {currency} na buƙatar abokin hulɗa a ƙasarku', 'Mwepụta na {currency} chọrọ onye mmekọ na mba gị'],
['Your balance is kept in your currency. Paying out to Nigerian banks only works in naira — a payout account in your country is added once KUBICU has a payment partner there.', 'We keep your balance for your currency. To pay out to Naija bank only work for naira — we go add payout account for your country once KUBICU get payment partner there.', 'A ń pa ìyókù owó rẹ mọ́ ní owó rẹ. Ìgbàjáde sí báǹkì Nàìjíríà ń ṣiṣẹ́ ní náírà nìkan — a ó fi àkọọ́lẹ̀ ìgbàjáde ní orílẹ̀-èdè rẹ kún un nígbà tí KUBICU bá ní alábàáṣiṣẹ́pọ̀ ìsanwó níbẹ̀.', 'Ana ajiye ragowar kuɗinka a kuɗinka. Cirewa zuwa bankunan Najeriya yana aiki da naira kawai — za a ƙara asusun cirewa a ƙasarku idan KUBICU ta sami abokin biyan kuɗi a can.', 'A na-edobe ego fọdụrụ gị na ego gị. Mwepụta n’ụlọ akụ Naịjirịa na-arụ naanị na naịra — a ga-agbakwunye akaụntụ mwepụta na mba gị mgbe KUBICU nwere onye mmekọ ịkwụ ụgwọ ebe ahụ.']];


const build = (i: 1 | 2 | 3 | 4): Dict => Object.fromEntries(rows.map((r) => [r[0], r[i]]));

export const batch13Pcm = build(1);
export const batch13Yo = build(2);
export const batch13Ha = build(3);
export const batch13Ig = build(4);