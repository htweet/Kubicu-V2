import { columns, type Row3 } from './build';

/**
 * Checkout USSD flow, download watermarks and the wallet note outside naira (mirrors translationsBatch13.ts), and safe
 * embeds on visitor pages (mirrors translationsBatch14.ts). Pass 53 (D415).
 * USSD only appears for shops selling in naira, so it's translated as written.
 */
const rows: Row3[] = [
// Checkout: how to pay now
['Pay with', 'Lipa kwa', 'Fa tua', 'Khokha nge'],
['Card or transfer', 'Kadi au uhamisho', 'Kaad anaa sika a wɔde kɔ', 'Ikhadi noma ukudlulisela'],
['USSD code', 'Msimbo wa USSD', 'USSD koodu', 'Ikhodi ye-USSD'],
['No card or data needed — dial a code from your bank phone and approve with your PIN.', 'Hakuna haja ya kadi au data — piga msimbo kutoka simu ya benki yako na uidhinishe kwa PIN yako.', 'Wonhia kaad anaa data — frɛ koodu firi fon a wo sikakorabea wɔ so na fa wo PIN pene so.', 'Akudingeki ikhadi noma idatha — shayela ikhodi ufoni wakho webhange bese uvumela nge-PIN yakho.'],
['Get a USSD code for {amount}', 'Pata msimbo wa USSD kwa {amount}', 'Nya USSD koodu ma {amount}', 'Thola ikhodi ye-USSD ka-{amount}'],
['No card? Pay the deposit with USSD', 'Huna kadi? Lipa amana kwa USSD', 'Kaad nni hɔ? Fa USSD tua sika a wode to hɔ no', 'Alikho ikhadi? Khokha idiphozithi nge-USSD'],
['No card? Pay with a USSD code', 'Huna kadi? Lipa kwa msimbo wa USSD', 'Kaad nni hɔ? Fa USSD koodu tua', 'Alikho ikhadi? Khokha ngekhodi ye-USSD'],
// USSD flow
['Pay with USSD', 'Lipa kwa USSD', 'Fa USSD tua', 'Khokha nge-USSD'],
['No card or data needed. Dial a code from the phone your bank account is on and approve with your PIN.', 'Hakuna haja ya kadi au data. Piga msimbo kutoka simu iliyounganishwa na akaunti yako ya benki na uidhinishe kwa PIN yako.', 'Wonhia kaad anaa data. Frɛ koodu firi fon a wo sikakorabea akawnt bata ho na fa wo PIN pene so.', 'Akudingeki ikhadi noma idatha. Shayela ikhodi ufoni oxhumene ne-akhawunti yakho yasebhange bese uvumela nge-PIN yakho.'],
['Amount', 'Kiasi', 'Sika dodoɔ', 'Inani'],
['Choose your bank', 'Chagua benki yako', 'Paw wo sikakorabea', 'Khetha ibhange lakho'],
['Dial this on your {bank} phone', 'Piga hii kwenye simu yako ya {bank}', 'Frɛ yei wɔ wo {bank} fon so', 'Shayela lokhu kufoni yakho ye-{bank}'],
['Code expires in {m} minutes {s} seconds', 'Msimbo unaisha baada ya dakika {m} sekunde {s}', 'Koodu bere bɛtwam simma {m} sima {s} mu', 'Ikhodi iphelelwa emizuzwini engu-{m} nemizuzwana engu-{s}'],
['Expires in {time}', 'Inaisha baada ya {time}', 'Ne bere bɛtwam {time} mu', 'Iphelelwa ku-{time}'],
['Dial now', 'Piga sasa', 'Frɛ seesei', 'Shayela manje'],
['Copy', 'Nakili', 'Kɔpi', 'Kopisha'],
['Copied', 'Imenakiliwa', 'Wɔakɔpi', 'Kukopishiwe'],
['Dial the code from the phone number linked to your {bank} account.', 'Piga msimbo kutoka nambari ya simu iliyounganishwa na akaunti yako ya {bank}.', 'Frɛ koodu no firi fon nɔma a ɛbata wo {bank} akawnt ho.', 'Shayela ikhodi enombolweni yocingo exhunywe ne-akhawunti yakho ye-{bank}.'],
['Check the amount and the name KUBICU, then enter your USSD PIN.', 'Kagua kiasi na jina KUBICU, kisha weka PIN yako ya USSD.', 'Hwɛ sika dodoɔ no ne din KUBICU, afei hyɛ wo USSD PIN.', 'Hlola inani negama elithi KUBICU, bese ufaka i-PIN yakho ye-USSD.'],
['Come back here and tap “I’ve dialled it”.', 'Rudi hapa na ugonge “Nimepiga”.', 'San bra ha na mia “Mafrɛ”.', 'Buyela lapha bese uthepha okuthi “Ngishayele”.'],
['Your bank may charge a small USSD fee on your airtime. Never share your PIN — not even with the seller.', 'Benki yako inaweza kutoza ada ndogo ya USSD kwenye salio lako. Usishiriki PIN yako kamwe — hata na muuzaji.', 'Ebia wo sikakorabea bɛgye USSD ka kakra afiri wo airtime mu. Mfa wo PIN mma obiara da — mpo adetɔnfoɔ.', 'Ibhange lakho lingakhokhisa imali encane ye-USSD ku-airtime yakho. Ungalokothi wabelane nge-PIN yakho — ngisho nomthengisi.'],
['Test mode — choose what the bank does', 'Hali ya majaribio — chagua benki inachofanya', 'Sɔhwɛ tebea — paw deɛ sikakorabea no bɛyɛ', 'Isimo sokuhlola — khetha okwenziwa yibhange'],
['Bank confirms', 'Benki inathibitisha', 'Sikakorabea si so dua', 'Ibhange liyaqinisekisa'],
['Bank is slow to confirm', 'Benki inachelewa kuthibitisha', 'Sikakorabea kyɛ ansa na asi so dua', 'Ibhange liyephuza ukuqinisekisa'],
['Bank declines', 'Benki inakataa', 'Sikakorabea po', 'Ibhange liyenqaba'],
['Waiting for your bank', 'Inasubiri benki yako', 'Ɛretwɛn wo sikakorabea', 'Kulindwe ibhange lakho'],
['Keep this page open. It usually takes a few seconds after you enter your PIN.', 'Weka ukurasa huu wazi. Kwa kawaida huchukua sekunde chache baada ya kuweka PIN yako.', 'Ma krataafa yi nna hɔ. Ɛtaa gye sima kakra bere a woahyɛ wo PIN akyi.', 'Shiya leli khasi livuliwe. Ngokuvamile kuthatha imizuzwana embalwa ngemuva kokufaka i-PIN yakho.'],
['Your bank declined the payment', 'Benki yako imekataa malipo', 'Wo sikakorabea apo tua no', 'Ibhange lakho lenqabile inkokhelo'],
['That code has expired', 'Msimbo huo umeisha muda', 'Koodu no bere atwam', 'Leyo khodi iphelelwe yisikhathi'],
['No money left your account. Check your balance or daily USSD limit, or try another bank or a card.', 'Hakuna pesa iliyotoka kwenye akaunti yako. Kagua salio lako au kikomo cha USSD cha kila siku, au jaribu benki nyingine au kadi.', 'Sika biara amfi wo akawnt mu. Hwɛ wo sika a aka anaa da biara USSD anohyeto, anaa sɔ sikakorabea foforɔ anaa kaad hwɛ.', 'Ayikho imali ephume ku-akhawunti yakho. Hlola imali osele nayo noma umkhawulo wansuku zonke we-USSD, noma uzame elinye ibhange noma ikhadi.'],
['Codes work for {n} minutes. Get a new one — nothing was charged.', 'Misimbo inafanya kazi kwa dakika {n}. Pata mpya — hakuna kilichotozwa.', 'Koodu yɛ adwuma simma {n}. Nya foforɔ — wɔannye hwee.', 'Amakhodi asebenza imizuzu engu-{n}. Thola entsha — akukho okukhokhisiwe.'],
['I’ve dialled it', 'Nimepiga', 'Mafrɛ', 'Ngishayele'],
['Get a new code', 'Pata msimbo mpya', 'Nya koodu foforɔ', 'Thola ikhodi entsha'],
['Try another bank', 'Jaribu benki nyingine', 'Sɔ sikakorabea foforɔ hwɛ', 'Zama elinye ibhange'],
['Change bank', 'Badilisha benki', 'Sesa sikakorabea', 'Shintsha ibhange'],
['Pay another way', 'Lipa kwa njia nyingine', 'Fa ɛkwan foforɔ so tua', 'Khokha ngenye indlela'],
// Watermarks
['Preview of your first page', 'Onyesho la ukurasa wako wa kwanza', 'Wo krataafa a ɛdi kan nhwɛsoɔ', 'Ukubuka ikhasi lakho lokuqala'],
['Preview of the mark on your image', 'Onyesho la alama kwenye picha yako', 'Agyiraeɛ a ɛwɔ wo mfonin so nhwɛsoɔ', 'Ukubuka uphawu esithombeni sakho'],
['Your copy carries a faint “{stamp}” mark, so a shared copy points back to this order.', 'Nakala yako ina alama hafifu ya “{stamp}”, ili nakala inayoshirikiwa ielekeze kwenye agizo hili.', 'Wo kɔpi wɔ “{stamp}” agyiraeɛ a ɛnna adi pefee, sɛnea kɔpi a wɔakyɛ bɛkyerɛ ahyɛdeɛ yi.', 'Ikhophi yakho inophawu olufiphele oluthi “{stamp}”, ukuze ikhophi eyabelwene ngayo ikhombe kule oda.'],
// Wallet outside naira
['Payouts in {currency} need a partner in your country', 'Malipo kwa {currency} yanahitaji mshirika katika nchi yako', 'Sika yi wɔ {currency} mu hia kuomni wɔ wo man mu', 'Izinkokhelo nge-{currency} zidinga uzakwethu ezweni lakho'],
['Your balance is kept in your currency. Paying out to Nigerian banks only works in naira — a payout account in your country is added once KUBICU has a payment partner there.', 'Salio lako linahifadhiwa kwa sarafu yako. Kutoa pesa kwenda benki za Nigeria kunafanya kazi kwa naira pekee — akaunti ya malipo katika nchi yako itaongezwa KUBICU ikipata mshirika wa malipo huko.', 'Wɔkora wo sika a aka wɔ wo sika mu. Sika yi kɔ Nigeria sikakorabea yɛ adwuma wɔ naira mu nko ara — wɔbɛfa sika yi akawnt wɔ wo man mu aka ho bere a KUBICU anya tua kuomni wɔ hɔ.', 'Imali yakho igcinwa ngemali yakho. Ukukhipha imali kuya emabhange aseNigeria kusebenza ngenayira kuphela — i-akhawunti yezinkokhelo ezweni lakho izokwengezwa uma i-KUBICU isinozakwethu wezinkokhelo lapho.'],
// Safe embeds
['Play video: {title}', 'Cheza video: {title}', 'Bɔ video: {title}', 'Dlala ividiyo: {title}'],
['Load {title}', 'Pakia {title}', 'Fa {title} bra', 'Layisha i-{title}'],
['Paused to save data — loads from {site}', 'Imesimamishwa kuokoa data — inapakia kutoka {site}', 'Wɔagyina so de akora data — ɛfiri {site} ba', 'Kumisiwe ukonga idatha — kulayisha ku-{site}'],
['Embedded content from {site}', 'Maudhui yaliyopachikwa kutoka {site}', 'Nsɛm a wɔde ahyɛ mu firi {site}', 'Okuqukethwe okushumekiwe kusuka ku-{site}']];


export const batch1314 = columns(rows);