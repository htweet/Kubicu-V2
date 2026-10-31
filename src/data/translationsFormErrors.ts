/**
 * Visitor form messages (D344): errors, buttons and thank-you lines on sellers' forms, lead forms, newsletter sign-ups
 * and the website contact form. The seller's own labels, help and consent wording stay as written. Also the help-centre
 * search note. DRAFTS — every non-English line needs a native speaker's check. Row: [English, Naijá, Yorùbá, Hausa, Igbo].
 */
export const formErrorRows: [string, string, string, string, string][] = [
['This is required', 'You need fill this one', 'Èyí pọn dandan', 'Wannan ya zama dole', 'Nke a dị mkpa'],
['Attach a file', 'Add file', 'So fáìlì mọ́ ọn', 'Haɗa fayil', 'Tinye faịlụ'],
['Add your signature', 'Put your signature', 'Fi ìbuwọ́lù rẹ sí i', 'Saka sa hannunka', 'Tinye mbinye aka gị'],
['Choose one', 'Choose one', 'Yan ọ̀kan', 'Zaɓi ɗaya', 'Họrọ otu'],
['Type your full name to sign', 'Type your full name to sign', 'Tẹ orúkọ rẹ ní kíkún láti buwọ́lù', 'Rubuta cikakken sunanka don sa hannu', 'Pịnye aha gị zuru ezu iji binye aka'],
['Keep it under {n} characters', 'Make e no pass {n} letters', 'Má jẹ́ kó ju lẹ́tà {n} lọ', 'Kada ya wuce haruffa {n}', 'Edela ya karịa mkpụrụedemede {n}'],
['Enter an email like name@example.com', 'Put email like name@example.com', 'Tẹ ímeèlì bíi name@example.com', 'Shigar da imel kamar name@example.com', 'Tinye email dịka name@example.com'],
['Enter a web address like example.com, or a handle like @yourname', 'Put website like example.com, or handle like @yourname', 'Tẹ àdírẹ́sì wẹ́ẹ̀bù bíi example.com, tàbí orúkọ bíi @yourname', 'Shigar da adireshin yanar gizo kamar example.com, ko suna kamar @yourname', 'Tinye adreesị weebụ dịka example.com, ma ọ bụ aha dịka @yourname'],
['Enter a phone number, e.g. +234 803 000 0000', 'Put phone number, e.g. +234 803 000 0000', 'Tẹ nọ́mbà fóònù, fún àpẹẹrẹ +234 803 000 0000', 'Shigar da lambar waya, misali +234 803 000 0000', 'Tinye nọmba ekwentị, dịka +234 803 000 0000'],
['Enter numbers only', 'Na only numbers', 'Tẹ nọ́mbà nìkan', 'Shigar da lambobi kawai', 'Tinye naanị nọmba'],
['Add your last name', 'Add your surname', 'Fi orúkọ ìdílé rẹ kún un', 'Ƙara sunan mahaifinka', 'Tinye aha nna gị'],
['Add your first name', 'Add your first name', 'Fi orúkọ àkọ́kọ́ rẹ kún un', 'Ƙara sunanka na farko', 'Tinye aha mbụ gị'],
['Enter your first and last name', 'Put your first name and surname', 'Tẹ orúkọ àkọ́kọ́ àti orúkọ ìdílé rẹ', 'Shigar da sunanka na farko da na mahaifi', 'Tinye aha mbụ na aha nna gị'],
['Keep each name under 60 characters', 'Make each name no pass 60 letters', 'Má jẹ́ kí orúkọ kọ̀ọ̀kan ju lẹ́tà 60 lọ', 'Kada kowane suna ya wuce haruffa 60', 'Edela ka aha ọ bụla ghara karịa mkpụrụedemede 60'],
['Choose your country', 'Choose your country', 'Yan orílẹ̀-èdè rẹ', 'Zaɓi ƙasarka', 'Họrọ obodo gị'],
['Choose your state', 'Choose your state', 'Yan ìpínlẹ̀ rẹ', 'Zaɓi jiharka', 'Họrọ steeti gị'],
['Add your state or region', 'Add your state or region', 'Fi ìpínlẹ̀ tàbí agbègbè rẹ kún un', 'Ƙara jiharka ko yankinka', 'Tinye steeti ma ọ bụ mpaghara gị'],
['Add your bank details', 'Add your bank details', 'Fi àlàyé báńkì rẹ kún un', 'Ƙara bayanan bankinka', 'Tinye nkọwa ụlọ akụ gị'],
['Choose your bank', 'Choose your bank', 'Yan báńkì rẹ', 'Zaɓi bankinka', 'Họrọ ụlọ akụ gị'],
['Account numbers have 10 digits', 'Account number get 10 digits', 'Nọ́mbà àkáǹtì ní díjíìtì 10', 'Lambar asusu tana da lambobi 10', 'Nọmba akaụntụ nwere ọnụọgụ 10'],
['Add the name on the account', 'Add the name wey dey the account', 'Fi orúkọ tó wà lórí àkáǹtì kún un', 'Ƙara sunan da ke kan asusun', 'Tinye aha dị na akaụntụ ahụ'],
['Choose a time', 'Choose time', 'Yan àkókò', 'Zaɓi lokaci', 'Họrọ oge'],
['Choose a start and end date', 'Choose start and end date', 'Yan ọjọ́ ìbẹ̀rẹ̀ àti ìparí', 'Zaɓi ranar farawa da ta ƙarewa', 'Họrọ ụbọchị mmalite na njedebe'],
['Choose an end date', 'Choose end date', 'Yan ọjọ́ ìparí', 'Zaɓi ranar ƙarewa', 'Họrọ ụbọchị njedebe'],
['Choose a start date', 'Choose start date', 'Yan ọjọ́ ìbẹ̀rẹ̀', 'Zaɓi ranar farawa', 'Họrọ ụbọchị mmalite'],
['The end date must be on or after the start date', 'End date suppose be the same day or after start date', 'Ọjọ́ ìparí gbọ́dọ̀ jẹ́ ọjọ́ ìbẹ̀rẹ̀ tàbí lẹ́yìn rẹ̀', 'Ranar ƙarewa dole ta kasance ranar farawa ko bayanta', 'Ụbọchị njedebe ga-abụ ụbọchị mmalite ma ọ bụ mgbe ọ gachara'],
['Choose at least one item', 'Choose at least one item', 'Yan ó kéré tán ọjà kan', 'Zaɓi aƙalla abu ɗaya', 'Họrọ opekata mpe otu ihe'],
['Answer each row', 'Answer every row', 'Dáhùn ìlà kọ̀ọ̀kan', 'Amsa kowane layi', 'Zaa ahịrị ọ bụla'],
['Answer: {rows}{more}', 'Answer: {rows}{more}', 'Dáhùn: {rows}{more}', 'Amsa: {rows}{more}', 'Zaa: {rows}{more}'],
['Put these in order with the arrows, or choose “This order is right”', 'Arrange dem with the arrows, or choose “This order correct”', 'Tò wọ́n pẹ̀lú àwọn ọfà, tàbí yan “Ètò yìí tọ̀nà”', 'Jera su da kibiyoyi, ko zaɓi “Wannan tsarin daidai ne”', 'Hazie ha n’usoro site na akụ, ma ọ bụ họrọ “Usoro a ziri ezi”'],
['This order is right', 'This order correct', 'Ètò yìí tọ̀nà', 'Wannan tsarin daidai ne', 'Usoro a ziri ezi'],
['Complete the payment to continue', 'Finish the payment to continue', 'Parí ìsanwó láti tẹ̀síwájú', 'Kammala biyan kuɗi don ci gaba', 'Mezue ịkwụ ụgwọ iji gaa n’ihu'],
['That was quick — please check your answers and send again.', 'E quick o — abeg check your answers and send again.', 'Ó yára jù — jọ̀wọ́ ṣàyẹ̀wò ìdáhùn rẹ kí o sì tún fi ránṣẹ́.', 'Ka yi sauri — da fatan ka duba amsoshinka ka sake aikawa.', 'Ọ dị ngwa — biko lelee azịza gị ma ziga ọzọ.'],
['You’ve sent this form a few times today. Please try again tomorrow.', 'You don send this form plenty times today. Abeg try again tomorrow.', 'O ti fi fọ́ọ̀mù yìí ránṣẹ́ ní ọ̀pọ̀ ìgbà lónìí. Jọ̀wọ́ gbìyànjú lọ́la.', 'Ka aika wannan fom sau da yawa yau. Da fatan ka sake gwadawa gobe.', 'Iziteela fọm a ọtụtụ ugboro taa. Biko nwaa ọzọ echi.'],
['Something went wrong. Please try again.', 'Something no work. Abeg try again.', 'Nǹkan kan ṣàṣìṣe. Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kan sí i.', 'Wani abu ya faru ba daidai ba. Da fatan ka sake gwadawa.', 'Ihe adịghị mma mere. Biko nwaa ọzọ.'],
['Please tell us your name.', 'Abeg tell us your name.', 'Jọ̀wọ́ sọ orúkọ rẹ fún wa.', 'Da fatan ka faɗa mana sunanka.', 'Biko gwa anyị aha gị.'],
['Please enter a valid email address.', 'Abeg put correct email address.', 'Jọ̀wọ́ tẹ àdírẹ́sì ímeèlì tó tọ̀nà.', 'Da fatan ka shigar da ingantaccen adireshin imel.', 'Biko tinye adreesị email ziri ezi.'],
['Please add a phone number so we can reply.', 'Abeg add phone number so we fit reply.', 'Jọ̀wọ́ fi nọ́mbà fóònù kún un kí a lè fèsì.', 'Da fatan ka ƙara lambar waya don mu iya amsawa.', 'Biko tinye nọmba ekwentị ka anyị nwee ike ịza.'],
['Thanks — we’ve got it', 'Thank you — we don get am', 'O ṣé — a ti rí i gbà', 'Na gode — mun karɓa', 'Daalụ — anyị enwetala ya'],
['Preview — nothing was saved.', 'Preview — nothing save.', 'Àyẹ̀wò — a kò fi nǹkan kan pamọ́.', 'Samfoti — ba a ajiye komai ba.', 'Nlele — e chekwaghị ihe ọ bụla.'],
['Run again', 'Run am again', 'Tún ṣe é', 'Sake gudanarwa', 'Mee ọzọ'],
['Form progress', 'How far for the form', 'Ìlọsíwájú fọ́ọ̀mù', 'Ci gaban fom', 'Ọganihu fọm'],
['Back', 'Back', 'Padà', 'Koma', 'Laghachi'],
['Next', 'Next', 'Èyí tó kàn', 'Na gaba', 'Ọzọ'],
['Send', 'Send', 'Fi ránṣẹ́', 'Aika', 'Ziga'],
['Thanks — your message is in.', 'Thank you — your message don enter.', 'O ṣé — ìfiránṣẹ́ rẹ ti dé.', 'Na gode — saƙonka ya iso.', 'Daalụ — ozi gị abatala.'],
['The owner will get back to you.', 'The owner go get back to you.', 'Ẹni tó ni í yóò kàn sí ọ.', 'Mai shi zai dawo maka.', 'Onye nwe ya ga-alaghachikwute gị.'],
['Demo page: nothing was actually sent.', 'Demo page: nothing really send.', 'Ojú-ìwé àpẹẹrẹ: a kò fi nǹkan kan ránṣẹ́ ní tòótọ́.', 'Shafin gwaji: ba a aika komai da gaske ba.', 'Ibe ngosi: e zigaghị ihe ọ bụla n’ezie.'],
['Turn on at least one field in the inspector.', 'On at least one field for the inspector.', 'Tan ó kéré tán àpótí kan nínú olùṣàyẹ̀wò.', 'Kunna aƙalla fili ɗaya a mai dubawa.', 'Gbanye opekata mpe otu ubi na onye nyocha.'],
['Also send me occasional updates (optional)', 'Also dey send me updates sometimes (optional)', 'Máa fi ìròyìn ránṣẹ́ sí mi lẹ́ẹ̀kọ̀ọ̀kan (kò pọn dandan)', 'Kuma ka riƙa aiko min da labarai lokaci-lokaci (zaɓi ne)', 'Zitekwara m mmelite mgbe ụfọdụ (nhọrọ)'],
['You’re on the list.', 'You don enter the list.', 'O ti wà nínú àkọsílẹ̀.', 'Kana cikin jerin.', 'Ị nọ na ndepụta.'],
['You can unsubscribe any time.', 'You fit comot any time.', 'O lè jáwọ́ nígbàkigbà.', 'Kana iya cire rajista kowane lokaci.', 'Ị nwere ike ịpụ oge ọ bụla.'],
['Demo page: no email was stored.', 'Demo page: we no keep any email.', 'Ojú-ìwé àpẹẹrẹ: a kò tọ́jú ímeèlì kankan.', 'Shafin gwaji: ba a ajiye imel ba.', 'Ibe ngosi: e chekwaghị email ọ bụla.'],
['Email address', 'Email address', 'Àdírẹ́sì ímeèlì', 'Adireshin imel', 'Adreesị email'],
['Subscribe', 'Subscribe', 'Forúkọsílẹ̀', 'Yi rajista', 'Debanye aha'],
['The guides are in English for now. Search in your language with everyday words, or in English.', 'The guides dey English for now. Search with everyday words for your language, or for English.', 'Àwọn ìtọ́sọ́nà wà ní Gẹ̀ẹ́sì fún báyìí. Wá pẹ̀lú ọ̀rọ̀ ojoojúmọ́ ní èdè rẹ, tàbí ní Gẹ̀ẹ́sì.', 'Jagororin suna cikin Turanci a yanzu. Nema da kalmomin yau da kullum a harshenka, ko da Turanci.', 'Ntụziaka dị na Bekee ugbu a. Chọọ site n’okwu kwa ụbọchị n’asụsụ gị, ma ọ bụ na Bekee.']];


const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(formErrorRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const formErrorsPcm = column(1);
export const formErrorsYo = column(2);
export const formErrorsHa = column(3);
export const formErrorsIg = column(4);