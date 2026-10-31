import { columns, type Row3 } from './build';

/** IntentFlow screen (pass 17, D374) and the floating "Ask me anything" bar. */
const rows: Row3[] = [
// Ask bar
['Ask me anything', 'Niulize chochote', 'Bisa me biribiara', 'Ngibuze noma yini'],
['Ask KUBICU Copilot', 'Uliza KUBICU Copilot', 'Bisa KUBICU Copilot', 'Buza i-KUBICU Copilot'],
['Minimise', 'Punguza', 'Tew so', 'Nciphisa'],
['Listening…', 'Inasikiliza…', 'Meretie…', 'Kulalelwa…'],
['Speak your question', 'Sema swali lako', 'Ka wo asɛmmisa', 'Khuluma umbuzo wakho'],
['Stop listening', 'Acha kusikiliza', 'Gyae tie', 'Yeka ukulalela'],
['Send to Copilot', 'Tuma kwa Copilot', 'Fa kɔ Copilot', 'Thumela ku-Copilot'],
['Open Copilot', 'Fungua Copilot', 'Bue Copilot', 'Vula i-Copilot'],
// IntentFlow
['Show different blocks depending on where a visit came from — your TikTok, a WhatsApp status, a QR code on your counter.', 'Onyesha vipande tofauti kulingana na ziara ilikotoka — TikTok yako, hali ya WhatsApp, msimbo wa QR kwenye kaunta yako.', 'Kyerɛ blɔk ahorow sɛnea nsrahwɛ no firi baabi — wo TikTok, WhatsApp status, QR kood a ɛwɔ wo ɔpon so.', 'Bonisa amabhulokhi ahlukene ngokuya ngokuthi ukuvakasha kuvelaphi — i-TikTok yakho, isimo se-WhatsApp, ikhodi ye-QR ekhawunteni yakho.'],
['Rules use only the source of a visit — never age, gender, location or anything about the person. Every page keeps at least one block for everyone, and pausing applies instantly.', 'Kanuni zinatumia chanzo cha ziara pekee — kamwe si umri, jinsia, mahali wala chochote kuhusu mtu. Kila ukurasa unabaki na angalau kipande kimoja kwa kila mtu, na kusimamisha kunatumika mara moja.', 'Mmara de baabi a nsrahwɛ firi nko ara di dwuma — ɛmfa mfeɛ, ɔbarima anaa ɔbaa, beaeɛ anaa biribiara a ɛfa onipa no ho da. Krataafa biara kura blɔk baako dodo ma obiara, na gyina so yɛ adwuma ntɛm ara.', 'Imithetho isebenzisa umthombo wokuvakasha kuphela — hhayi iminyaka, ubulili, indawo noma okunye ngomuntu. Ikhasi ngalinye ligcina okungenani ibhulokhi elilodwa labo bonke, futhi ukumisa kusebenza ngokushesha.'],
['No source rules yet', 'Hakuna kanuni za chanzo bado', 'Baabi a ɛfiri mmara biara nni hɔ seesei', 'Ayikho imithetho yemithombo okwamanje'],
['In the canvas, select a block, open Visibility and choose “Show by visitor source”. For example, show a TikTok welcome only to TikTok visitors.', 'Kwenye turubai, chagua kipande, fungua Mwonekano na uchague “Onyesha kwa chanzo cha mgeni”. Kwa mfano, onyesha karibu ya TikTok kwa wageni wa TikTok pekee.', 'Wɔ canvas no so, paw blɔk bi, bue Sɛnea ɛda adi na paw “Kyerɛ denam baabi a ɔhɔhoɔ firi”. Sɛ nhwɛsoɔ, kyerɛ TikTok akwaaba ma TikTok ahɔhoɔ nko ara.', 'Ku-canvas, khetha ibhulokhi, vula Ukubonakala bese ukhetha “Bonisa ngomthombo wesivakashi”. Isibonelo, bonisa ukwamukela kwe-TikTok kuzivakashi ze-TikTok kuphela.'],
['Open canvas', 'Fungua turubai', 'Bue canvas', 'Vula i-canvas'],
['Source rules', 'Kanuni za chanzo', 'Baabi a ɛfiri mmara', 'Imithetho yemithombo'],
['Everyone (no sources picked)', 'Kila mtu (hakuna vyanzo vilivyochaguliwa)', 'Obiara (wɔmpaw baabi biara)', 'Wonke umuntu (ayikho imithombo ekhethiwe)'],
['Only visits from {list}', 'Ziara kutoka {list} pekee', 'Nsrahwɛ a ɛfiri {list} nko ara', 'Ukuvakasha okuvela ku-{list} kuphela'],
['Everyone except visits from {list}', 'Kila mtu isipokuwa ziara kutoka {list}', 'Obiara gye nsrahwɛ a ɛfiri {list}', 'Wonke umuntu ngaphandle kokuvakasha okuvela ku-{list}'],
['Rule resumed', 'Kanuni imeendelea', 'Mmara no akɔ so', 'Umthetho uqhubekile'],
['Rule paused', 'Kanuni imesimamishwa', 'Wɔagyina mmara no so', 'Umthetho umisiwe'],
['Rule removed', 'Kanuni imeondolewa', 'Wɔayi mmara no', 'Umthetho ususiwe'],
['Applies to your live page straight away — no publish needed.', 'Inatumika kwenye ukurasa wako hai mara moja — hakuna haja ya kuchapisha.', 'Ɛfa wo krataafa a ɛreyɛ adwuma ho ntɛm ara — ɛnhia sɛ wopue.', 'Kusebenza ekhasini lakho elibukhoma ngokushesha — akudingeki ukushicilela.'],
['Paused', 'Imesimamishwa', 'Wɔagyina so', 'Kumisiwe'],
['Not published yet', 'Bado haijachapishwa', 'Wɔmpue no ɛ', 'Akukashicilelwa'],
['Live · changes unpublished', 'Hai · mabadiliko hayajachapishwa', 'Ɛreyɛ adwuma · wɔmpue nsesaeɛ no', 'Kubukhoma · izinguquko azishicilelwanga'],
['Live', 'Hai', 'Ɛreyɛ adwuma', 'Kubukhoma'],
['Goal:', 'Lengo:', 'Botaeɛ:', 'Inhloso:'],
['Too early to tell', 'Mapema mno kujua', 'Ɛyɛ ntɛm dodo sɛ yɛbɛka', 'Kusesekuseni kakhulu ukusho'],
['{a} of {min} targeted visits · {b} of {min} others, since the rule was made.', 'Ziara {a} kati ya {min} zilizolengwa · {b} kati ya {min} nyingine, tangu kanuni ilipotengenezwa.', 'Nsrahwɛ a wɔde ani asi so {a} wɔ {min} mu · afoforɔ {b} wɔ {min} mu, firi bere a wɔyɛɛ mmara no.', 'Ukuvakasha okuqondiwe okungu-{a} kokungu-{min} · okunye okungu-{b} kokungu-{min}, kusukela umthetho wenziwa.'],
['Visits it targets', 'Ziara inazolenga', 'Nsrahwɛ a ɛde ani si so', 'Ukuvakasha okuqondiwe'],
['Everyone else', 'Kila mtu mwingine', 'Obiara foforɔ', 'Bonke abanye'],
['{a} of {b}', '{a} kati ya {b}', '{a} wɔ {b} mu', '{a} kokungu-{b}'],
['Different audiences behave differently anyway — this shows a pattern, not proof the block caused it.', 'Hadhira tofauti hutenda tofauti hata hivyo — hii inaonyesha mwenendo, si ushahidi kwamba kipande kilisababisha.', 'Nkurɔfoɔ ahorow yɛ wɔn ade soronko dada — yei kyerɛ sɛnea nneɛma kɔ, ɛnyɛ adanseɛ sɛ blɔk no na ɛmaa ɛbaeɛ.', 'Izethameli ezihlukene ziziphatha ngokuhlukile noma kunjalo — lokhu kubonisa iphethini, hhayi ubufakazi bokuthi ibhulokhi likubangele.'],
['Resume', 'Endelea', 'Kɔ so', 'Qhubeka'],
['Pause', 'Simamisha', 'Gyina so', 'Misa'],
['Roll back', 'Rudisha nyuma', 'San akyi', 'Buyisela emuva'],
['Edit in canvas', 'Hariri kwenye turubai', 'Sesa wɔ canvas so', 'Hlela ku-canvas'],
['“Roll back” removes the rule so everyone sees the block again. Check what each audience sees with “Preview as” in the canvas.', '“Rudisha nyuma” inaondoa kanuni ili kila mtu aone kipande tena. Kagua kile kila hadhira inachoona kwa “Hakiki kama” kwenye turubai.', '“San akyi” yi mmara no fi hɔ sɛnea obiara bɛsan ahu blɔk no. Hwɛ deɛ nkurɔfoɔ kuo biara hu denam “Hwɛ sɛ” wɔ canvas so.', '“Buyisela emuva” kususa umthetho ukuze wonke umuntu abone ibhulokhi futhi. Hlola okubonwa yizethameli ngazinye nge-“Buka kuqala njenge” ku-canvas.']];


export const intentAsk = columns(rows);