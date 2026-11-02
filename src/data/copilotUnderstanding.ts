/**
 * Everyday words Copilot understands when typed in another language (D518). Each row: the English words the
 * Copilot engine already understands, then Pidgin, Yorùbá, Hausa, Igbo, Kiswahili, Twi, isiZulu. "|" separates
 * alternatives. Matching ignores tone marks and special letters, so "ọ", "ɛ" and plain letters all work.
 * DRAFTS — need a native speaker's check. Business and product words come from the search glossary instead.
 */
export type UnderstandRow = [string, string, string, string, string, string, string, string];

/** Reply meanings that change how Copilot answers, rather than adding facts. */
export const copilotIntentRows: Record<'skip' | 'decide' | 'confused', UnderstandRow> = {
  skip: [
  'skip',
  'skip|leave am|later|no be now|i no get|nothing|no',
  'fo o|ko si|rara|ni igba mii|mi o ni|beeko',
  'tsallake|babu|a a|daga baya|ba ni da|ba komai',
  'wufee|enweghi|mba|emesia|o dighi|enweghi m',
  'ruka|baadaye|hapana|sina|hakuna|si sasa',
  'twa mu|akyire|daabi|menni|biribiara nni ho',
  'yeqa|kamuva|cha|anginayo|lutho|hhayi manje'],

  decide: [
  'you decide',
  'you choose|you decide|anything|any one|i no sure|na you sabi',
  'iwo yan|o wu mi|ohunkohun|ko da mi loju',
  'kai ka zaba|ka zaba|komai|ban tabbata ba',
  'gi horo|i horo|ihe obula|amaghi m',
  'wewe chagua|chagua wewe|amua wewe|chochote|sina uhakika',
  'wo na yi|yi biara|biara|mennim',
  'wena khetha|khetha wena|noma yini|anginaso isiqiniseko'],

  confused: [
  'explain',
  'i no understand|wetin you mean|explain am|wetin be that',
  'ko ye mi|ki lo tumo si|salaye|kini yen',
  'ban gane ba|me kake nufi|bayyana min|menene wannan',
  'aghotaghi m|gini ka i putara|kowaa|gini bu nke a',
  'sielewi|unamaanisha nini|eleza|hii ni nini',
  'mente ase|kyere mu|eye den',
  'angiqondi|usho ukuthini|chaza|yini lokhu']

};

/** Words that stand for an English word the engine matches (looks, main action, offer, audience, edits). */
export const copilotWordRows: UnderstandRow[] = [
// Looks
['elegant', 'fine fine|classy|elegant', 'didan|olola|elegant', 'kyakkyawa|na alfarma', 'mara mma|nke oma', 'maridadi|ya kifahari', 'fe|ahoofe', 'enhle|ebukekayo'],
['glass', 'shine|glow', 'didan julo|tan', 'mai haske sosai|walkiya', 'na-enwu|na-egbuke', 'inayong aa|ng aa', 'hyerene', 'ekhazimulayo'],
['dark', 'dark|black', 'dudu|okunkun', 'baki|duhu', 'oji|ochichiri', 'giza|nyeusi', 'tuntum|sum', 'mnyama|kumnyama'],
['warm', 'warm|brown', 'gbona|alawo ile', 'dumi|ruwan kasa', 'oku|aja aja', 'joto|kahawia', 'hye|dodowee', 'fudumele|nsundu'],
['bold', 'bright|colourful|loud', 'larinrin|alawo pupo', 'mai launi|mai haske', 'na-acha|nwere agba', 'angavu|rangi nyingi', 'hyerenhyeren|ahosu pii', 'egqamile|enemibala'],
['simple', 'simple|clean|plain', 'rorun|mimo|pelebe', 'mai sauki|tsabta', 'di mfe|dị ọcha|di ocha', 'rahisi|safi', 'mmere|ho te', 'elula|ehlanzekile'],
// Main action
['book', 'book|appointment|reserve', 'ififorukosile|ipade|gba aaye', 'yi rajista|alkawari|ajiye wuri', 'debe oge|oge nzuko', 'weka miadi|miadi|hifadhi', 'hye da|nhyiamu', 'bhuka|ukubhuka|isikhathi'],
['buy', 'buy|shop', 'ra|raja', 'saya|siyayya', 'zuta|azumahia', 'nunua|kununua', 'to', 'thenga|ukuthenga'],
['whatsapp', 'message|chat|whatsapp|dm', 'ifiranse|whatsapp|iwiregbe', 'sako|whatsapp|hira', 'ozi|whatsapp|mkparita uka', 'ujumbe|whatsapp|soga', 'nkra|whatsapp|kasa', 'umlayezo|whatsapp|xoxa'],
['donate', 'donate|support|give', 'fi tore|atileyin|fun', 'ba da gudummawa|tallafi|bayar', 'nye onyinye|kwado|nye', 'changia|saidia|toa', 'ma ntoboa|boa|ma', 'nikela|xhasa|pha'],
['follow', 'follow|subscribe|listen|watch', 'tele|forukosile|gbo|wo', 'bi|yi rajista|saurara|kalla', 'soro|denye aha|gee nti|lee', 'fuata|jiunge|sikiliza|tazama', 'di akyi|tie|hwe', 'landela|bhalisa|lalela|buka'],
['contact', 'contact|call|reach|quote', 'kan si|pe|iye owo', 'tuntube|kira|farashi', 'kpoturu|kpoo|onu ahia', 'wasiliana|piga simu|nukuu', 'fre|bo wo fone|bo', 'xhumana|shayela|isilinganiso'],
// What they offer
['food', 'food|chop|soup|rice|cake', 'onje|ounje|iresi|keeki', 'abinci|shinkafa|miya|kek', 'nri|osikapa|ofe|keki', 'chakula|wali|keki|mlo', 'aduane|emo|nkwan|keke', 'ukudla|irayisi|ikhekhe'],
['event', 'event|party|show|ticket', 'ayeye|ariya|tikeeti', 'taro|biki|tikiti', 'emume|oriri|tiketi', 'tukio|sherehe|tiketi|tamasha', 'dwumadi|apontoo|tekiti', 'umcimbi|iphathi|ithikithi'],
['service', 'service|work|repair', 'ise|atunse', 'aiki|sabis|gyara', 'oru|ndozi', 'huduma|kazi|matengenezo', 'adwuma|siesie', 'insizakalo|umsebenzi|ukulungisa'],
['charity', 'charity|ngo|help people', 'ifunni|aanu', 'sadaka|agaji', 'enyemaka|ebere', 'hisani|msaada', 'mmoa|ahummobo', 'usizo|isisa'],
['photos', 'picture|photo|pics', 'aworan|foto', 'hoto|hotuna', 'foto|onyonyo', 'picha', 'mfonini|foto', 'isithombe|izithombe'],
['products', 'goods|market|things wey i sell|clothes|shoe|bag', 'oja|aso|bata|apo', 'kaya|kasuwa|tufafi|takalma|jaka', 'ngwa ahia|ahia|uwe|akpukpo ukwu|akpa', 'bidhaa|nguo|viatu|mkoba', 'nneema|ntade|mpaboa|kotoku', 'izimpahla|izingubo|izicathulo|isikhwama'],
// Audience
['near', 'near|area|my street', 'nitosi|adugbo', 'kusa|unguwa', 'nso|obodo anyi', 'karibu|mtaa', 'ben|mpoano yi|mpɔtam', 'eduze|endaweni'],
['nationwide', 'everywhere|all over|whole country', 'gbogbo ibi|jakejado orile ede', 'ko ina|duk fadin kasa', 'ebe niile|obodo niile', 'kila mahali|nchi nzima', 'baabiara|man no nyinaa', 'yonke indawo|izwe lonke'],
['clients', 'clients|company|business people', 'onibaara|ile ise', 'abokan ciniki|kamfanoni', 'ndi ahia|ulo oru', 'wateja|makampuni', 'adetofo|nnwumakuo', 'amakhasimende|izinkampani'],
['fans', 'fans|followers|people wey dey follow me', 'ololufe|awon ti o n tele mi', 'masoya|mabiya', 'ndi na-eso m|ndi hurú m n anya', 'mashabiki|wafuasi', 'akyidifo|nnipa a wodi m akyi', 'abalandeli|abathandi']];


/** Edits on the brief ("remove the photos"). Matched as whole phrases. */
export const copilotEditRows: UnderstandRow[] = [
['remove the photos', 'comot the picture|comot picture|remove picture|no picture', 'yo aworan|mu aworan kuro', 'cire hotuna|cire hoton', 'wepu foto|wepu onyonyo', 'ondoa picha|toa picha', 'yi mfonini|yi foto', 'susa izithombe|khipha izithombe'],
['remove the logo', 'comot logo|remove logo|no logo', 'yo logo|mu logo kuro', 'cire tambari|cire logo', 'wepu logo|wepu akara', 'ondoa nembo|toa nembo', 'yi logo', 'susa ilogo|khipha ilogo'],
['add a new logo', 'add logo|put logo|change logo|new logo', 'fi logo kun|yi logo pada|logo tuntun', 'kara tambari|canza tambari|sabon tambari', 'tinye logo|gbanwee logo|logo ohuru', 'ongeza nembo|badilisha nembo|nembo mpya', 'fa logo ka ho|sesa logo|logo foforo', 'engeza ilogo|shintsha ilogo|ilogo entsha'],
['add more photos', 'add picture|more picture|put picture|change picture', 'fi aworan kun|aworan si|yi aworan pada', 'kara hotuna|karin hotuna|canza hoto', 'tinye foto|foto ozo|gbanwee foto', 'ongeza picha|picha zaidi|badilisha picha', 'fa mfonini ka ho|mfonini foforo', 'engeza izithombe|izithombe ezengeziwe|shintsha izithombe']];


/** "Call it …" in each language, so people can rename the page while typing their own way. */
export const copilotRenameRows: UnderstandRow = [
'call it',
'call am|make the name be|name am',
'pe e ni|ki oruko re je|so o ni',
'kira shi|sunan ya zama|sanya masa suna',
'kpoo ya|ka aha ya bu|gua ya',
'iite|jina liwe|liite',
'fre no|ma ne din nye',
'yibize ngokuthi|igama libe|yiqambe'];