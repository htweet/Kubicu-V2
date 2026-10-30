/**
 * Canvas Content tab for layout & showcase blocks: Hero, Feature grid, Steps, Logo strip, Figures,
 * Media list and Listings, plus their fixed checks (D302).
 * DRAFTS — every non-English line needs a native speaker's check. Row: [English, Naijá, Yorùbá, Hausa, Igbo].
 */
export const layoutBlockFieldsRows: [string, string, string, string, string][] = [
// Hero
['Split — text beside a photo', 'Split — text near photo', 'Pínpín — ọ̀rọ̀ lẹ́gbẹ̀ẹ́ fọ́tò', 'Rabe — rubutu kusa da hoto', 'Kewaa — ederede n’akụkụ foto'],
['Portrait — centred identity', 'Portrait — you for centre', 'Àwòrán ènìyàn — ìdánimọ̀ ní àárín', 'Hoton mutum — shaida a tsakiya', 'Onyonyo mmadụ — onye ị bụ n’etiti'],
['Cover — text over a full photo', 'Cover — text on top full photo', 'Ìbòrí — ọ̀rọ̀ lórí fọ́tò kíkún', 'Murfi — rubutu a kan cikakken hoto', 'Mkpuchi — ederede n’elu foto zuru ezu'],
['Masthead — editorial nameplate', 'Masthead — big name like magazine', 'Àkọlé ìwé ìròyìn — orúkọ ńlá', 'Kanun mujalla — babban suna', 'Isiokwu magazin — aha buru ibu'],
['Poster — event-style big type', 'Poster — big letters like event', 'Pósítà — lẹ́tà ńlá bí ìṣẹ̀lẹ̀', 'Fosta — manyan haruffa irin na taro', 'Pọsta — mkpụrụedemede buru ibu dịka mmemme'],
['Product — one product to buy', 'Product — one product to buy', 'Ọjà — ọjà kan láti rà', 'Kaya — kaya ɗaya da za a saya', 'Ngwaahịa — otu ngwaahịa a ga-azụ'],
['Small line above', 'Small line for top', 'Ìlà kékeré lókè', 'Ƙaramin layi a sama', 'Obere ahịrị n’elu'],
['Headline', 'Headline', 'Àkọlé ńlá', 'Babban kanun labari', 'Isiokwu ukwu'],
['Supporting line', 'Supporting line', 'Ìlà àtìlẹ́yìn', 'Layin tallafi', 'Ahịrị nkwado'],
['Date and venue', 'Date and venue', 'Ọjọ́ àti ibi', 'Kwanan wata da wuri', 'Ụbọchị na ebe'],
['Price line', 'Price line', 'Ìlà iye owó', 'Layin farashi', 'Ahịrị ọnụahịa'],
['Small note', 'Small note', 'Àkọsílẹ̀ kékeré', 'Ƙaramin bayani', 'Obere ndetu'],
['Keep in view when cropped', 'Keep am for view when you crop', 'Pa á mọ́ lójú nígbà tí a bá gé e', 'Ajiye a gani idan an yanke', 'Debe ya ka a hụ mgbe ebipụrụ ya'],
['Focal point', 'Main point', 'Ojú àfiyèsí', 'Wurin da aka mayar da hankali', 'Ebe a na-elekwasị anya'],
['Top', 'Top', 'Òkè', 'Sama', 'Elu'],
['Centre', 'Centre', 'Àárín', 'Tsakiya', 'Etiti'],
['Bottom', 'Bottom', 'Ìsàlẹ̀', 'Ƙasa', 'Ala'],
['Main button', 'Main button', 'Bọ́tìnnì àkọ́kọ́', 'Babban maɓalli', 'Bọtịnụ isi'],
['Main button link', 'Main button link', 'Ìjápọ̀ bọ́tìnnì àkọ́kọ́', 'Hanyar babban maɓalli', 'Njikọ bọtịnụ isi'],
['https:// or #section', 'https:// or #section', 'https:// tàbí #apá', 'https:// ko #sashe', 'https:// ma ọ bụ #ngalaba'],
['Second button', 'Second button', 'Bọ́tìnnì kejì', 'Maɓalli na biyu', 'Bọtịnụ nke abụọ'],
['Second button link', 'Second button link', 'Ìjápọ̀ bọ́tìnnì kejì', 'Hanyar maɓalli na biyu', 'Njikọ bọtịnụ nke abụọ'],
// Feature grid & steps
['Columns on wide screens', 'Columns for big screens', 'Àwọn ọ̀wọ̀n lórí ojú-ìbojú fífẹ̀', 'Ginshiƙai a manyan allo', 'Kọlụm na nnukwu ihuenyo'],
['Columns', 'Columns', 'Àwọn ọ̀wọ̀n', 'Ginshiƙai', 'Kọlụm'],
['Small line', 'Small line', 'Ìlà kékeré', 'Ƙaramin layi', 'Obere ahịrị'],
['e.g. From ₦45,000', 'like From ₦45,000', 'bí Láti ₦45,000', 'misali Daga ₦45,000', 'dịka Site na ₦45,000'],
['Text', 'Text', 'Ọ̀rọ̀', 'Rubutu', 'Ederede'],
['Link', 'Link', 'Ìjápọ̀', 'Hanya', 'Njikọ'],
['Steps', 'Steps', 'Àwọn ìgbésẹ̀', 'Matakai', 'Nzọụkwụ'],
['Step', 'Step', 'Ìgbésẹ̀', 'Mataki', 'Nzọụkwụ'],
['Add step', 'Add step', 'Fi ìgbésẹ̀ kún', 'Ƙara mataki', 'Tinye nzọụkwụ'],
['Detail', 'Detail', 'Àlàyé', 'Cikakken bayani', 'Nkọwa'],
// Logo strip & figures
['Names or logos', 'Names or logos', 'Orúkọ tàbí àmì', 'Sunaye ko tambura', 'Aha ma ọ bụ akara'],
['Logo', 'Logo', 'Àmì', 'Tambari', 'Akara'],
['Add a name', 'Add name', 'Fi orúkọ kún', 'Ƙara suna', 'Tinye aha'],
['These brands agreed to be shown', 'These brands don agree make we show dem', 'Àwọn ilé-iṣẹ́ yìí gbà kí a fi wọ́n hàn', 'Waɗannan kamfanoni sun amince a nuna su', 'Ụlọ ọrụ ndị a kwetara ka e gosi ha'],
['The strip stays hidden on your live page until this is on.', 'The strip go hide for your live page until you on am.', 'Ìlà náà yóò farapamọ́ lórí ojú-ìwé rẹ títí èyí yóò fi tàn.', 'Layin zai kasance a ɓoye a shafinka kai tsaye har sai an kunna wannan.', 'Ahịrị ahụ ga-anọ ezoro ezo na ibe gị dị ndụ ruo mgbe agbanyere nke a.'],
['Figures', 'Numbers', 'Àwọn nọ́ńbà', 'Alkaluma', 'Ọnụọgụ'],
['Figure', 'Number', 'Nọ́ńbà', 'Adadi', 'Ọnụọgụ'],
['Add figure', 'Add number', 'Fi nọ́ńbà kún', 'Ƙara adadi', 'Tinye ọnụọgụ'],
['Number', 'Number', 'Nọ́ńbà', 'Lamba', 'Nọmba'],
['What it counts', 'Wetin e dey count', 'Ohun tí ó ń kà', 'Abin da yake ƙirgawa', 'Ihe ọ na-agụ'],
['These are real figures I can stand behind', 'These na real numbers wey I fit stand behind', 'Àwọn nọ́ńbà gidi ni wọ̀nyí tí mo lè dúró tì', 'Waɗannan alkaluma ne na gaske da zan iya tsayawa a kai', 'Ndị a bụ ezigbo ọnụọgụ m nwere ike iguzo n’azụ ha'],
['Until this is on, visitors see an “Example figures” label.', 'Until you on am, visitors go see “Example figures” label.', 'Títí èyí yóò fi tàn, àwọn àlejò ń rí àmì “Nọ́ńbà àpẹẹrẹ”.', 'Har sai an kunna wannan, baƙi suna ganin alamar “Alkaluman misali”.', 'Ruo mgbe agbanyere nke a, ndị ọbịa na-ahụ akara “Ọnụọgụ ihe atụ”.'],
// Media list
['What this lists', 'Wetin this one dey list', 'Ohun tí èyí ń kà sílẹ̀', 'Abin da wannan ke lissafawa', 'Ihe nke a na-edepụta'],
['Episodes', 'Episodes', 'Àwọn apá', 'Kashi-kashi', 'Akụkụ'],
['Tracks or releases', 'Tracks or releases', 'Orin tàbí ìtújáde', 'Waƙoƙi ko fitarwa', 'Egwu ma ọ bụ mwepụta'],
['Videos', 'Videos', 'Àwọn fídíò', 'Bidiyoyi', 'Vidiyo'],
['Chapters or stories', 'Chapters or stories', 'Orí tàbí ìtàn', 'Babi ko labarai', 'Isi ma ọ bụ akụkọ'],
['Date, guest or format', 'Date, guest or format', 'Ọjọ́, àlejò tàbí ìrísí', 'Kwanan wata, baƙo ko tsari', 'Ụbọchị, onye ọbịa ma ọ bụ ụdị'],
['e.g. 42 min', 'like 42 min', 'bí ìṣẹ́jú 42', 'misali minti 42', 'dịka nkeji 42'],
['Thumbnail', 'Small picture', 'Àwòrán kékeré', 'Ƙaramin hoto', 'Obere onyonyo'],
['Listen or watch on', 'Listen or watch for', 'Gbọ́ tàbí wò lórí', 'Saurara ko kalla a', 'Gee ntị ma ọ bụ lee na'],
['Add a platform', 'Add platform', 'Fi pẹpẹ kan kún', 'Ƙara dandali', 'Tinye ikpo okwu'],
['Label', 'Label', 'Àkọlé', 'Lakabi', 'Aha'],
['e.g. Spotify', 'like Spotify', 'bí Spotify', 'misali Spotify', 'dịka Spotify'],
// Listings
['Listings', 'Listings', 'Àwọn àkójọ', 'Jerin abubuwa', 'Ndepụta'],
['Listing', 'Listing', 'Àkójọ', 'Abu a jeri', 'Ihe ndepụta'],
['Add listing', 'Add listing', 'Fi àkójọ kún', 'Ƙara abu', 'Tinye ihe ndepụta'],
['Example listing', 'Example listing', 'Àkójọ àpẹẹrẹ', 'Abun misali', 'Ihe ndepụta ihe atụ'],
['Key facts', 'Main facts', 'Òtítọ́ pàtàkì', 'Muhimman bayanai', 'Eziokwu ndị dị mkpa'],
['e.g. 3 bed · 2 bath · 180 m²', 'like 3 bed · 2 bath · 180 m²', 'bí yàrá 3 · balùwẹ̀ 2 · 180 m²', 'misali ɗakuna 3 · banɗaki 2 · 180 m²', 'dịka ime ụlọ 3 · ụlọ ịsa ahụ 2 · 180 m²'],
['Location', 'Location', 'Ibùdó', 'Wuri', 'Ebe'],
['Enquiry link', 'Enquiry link', 'Ìjápọ̀ ìbéèrè', 'Hanyar tambaya', 'Njikọ ajụjụ'],
['Show “Example listing” label', 'Show “Example listing” label', 'Fi àmì “Àkójọ àpẹẹrẹ” hàn', 'Nuna alamar “Abun misali”', 'Gosi akara “Ihe ndepụta ihe atụ”'],
// Checks
['Add a headline', 'Add headline', 'Fi àkọlé ńlá kún', 'Ƙara babban kanun labari', 'Tinye isiokwu ukwu'],
['Describe the photo for screen readers', 'Describe the photo for screen readers', 'Ṣàpèjúwe fọ́tò fún àwọn olùka ojú-ìbojú', 'Bayyana hoton don masu karanta allo', 'Kọwaa foto maka ndị na-agụ ihuenyo'],
['This layout is designed around a photo — add one', 'This layout na for photo — add one', 'A ṣe ètò yìí yí fọ́tò ká — fi ọ̀kan kún', 'An tsara wannan tsari ne a kan hoto — ƙara ɗaya', 'E mere nhazi a gburugburu foto — tinye otu'],
['Main button link must start with https:// or #', 'Main button link must start with https:// or #', 'Ìjápọ̀ bọ́tìnnì àkọ́kọ́ gbọ́dọ̀ bẹ̀rẹ̀ pẹ̀lú https:// tàbí #', 'Hanyar babban maɓalli dole ta fara da https:// ko #', 'Njikọ bọtịnụ isi ga-amalite na https:// ma ọ bụ #'],
['A grid reads best with at least two items', 'Grid dey read better with at least two items', 'Àwọ̀n máa ń kà dáadáa pẹ̀lú ohun méjì ó kéré tán', 'Grid ya fi kyau da aƙalla abubuwa biyu', 'Grid na-agụ nke ọma na opekata mpe ihe abụọ'],
['Describe each photo for screen readers', 'Describe each photo for screen readers', 'Ṣàpèjúwe fọ́tò kọ̀ọ̀kan fún àwọn olùka ojú-ìbojú', 'Bayyana kowane hoto don masu karanta allo', 'Kọwaa foto ọ bụla maka ndị na-agụ ihuenyo'],
['Add at least two steps', 'Add at least two steps', 'Fi ìgbésẹ̀ méjì kún ó kéré tán', 'Ƙara aƙalla matakai biyu', 'Tinye opekata mpe nzọụkwụ abụọ'],
['Hidden on your live page until you confirm you have permission to show these names', 'E go hide for your live page until you confirm say you get permission to show these names', 'Ó farapamọ́ lórí ojú-ìwé rẹ títí o fi jẹ́rìísí pé o ní àṣẹ láti fi orúkọ wọ̀nyí hàn', 'A ɓoye a shafinka kai tsaye har sai ka tabbatar kana da izinin nuna waɗannan sunaye', 'Ezoro ezo na ibe gị dị ndụ ruo mgbe ị kwadoro na ị nwere ikike igosi aha ndị a'],
['Visitors see “Example figures” until you confirm these are real', 'Visitors go see “Example figures” until you confirm say dem real', 'Àwọn àlejò ń rí “Nọ́ńbà àpẹẹrẹ” títí o fi jẹ́rìísí pé wọ́n jẹ́ gidi', 'Baƙi suna ganin “Alkaluman misali” har sai ka tabbatar na gaske ne', 'Ndị ọbịa na-ahụ “Ọnụọgụ ihe atụ” ruo mgbe ị kwadoro na ha bụ eziokwu'],
['Add at least one item', 'Add at least one item', 'Fi ohun kan kún ó kéré tán', 'Ƙara aƙalla abu ɗaya', 'Tinye opekata mpe otu ihe'],
['Some listings are still examples — replace them with your own', 'Some listings still be examples — change dem to your own', 'Àwọn àkójọ kan ṣì jẹ́ àpẹẹrẹ — fi tìrẹ rọ́pò wọn', 'Wasu abubuwa har yanzu misalai ne — maye gurbinsu da naka', 'Ụfọdụ ndepụta ka bụ ihe atụ — jiri nke gị dochie ha'],
['Describe each listing photo for screen readers', 'Describe each listing photo for screen readers', 'Ṣàpèjúwe fọ́tò àkójọ kọ̀ọ̀kan fún àwọn olùka ojú-ìbojú', 'Bayyana kowane hoton abu don masu karanta allo', 'Kọwaa foto ndepụta ọ bụla maka ndị na-agụ ihuenyo'],
['This block is hidden, so its side-by-side partner shows on its own', 'This block dey hide, so the one wey dey near am go show alone', 'Búlọ́ọ̀kù yìí farapamọ́, nítorí náà èyí tí ó wà lẹ́gbẹ̀ẹ́ rẹ̀ yóò hàn nìkan', 'Wannan tubalin a ɓoye yake, don haka abokinsa na gefe zai bayyana shi kaɗai', 'Ezoro blọk a, ya mere onye ibe ya nọ n’akụkụ ga-egosi naanị ya'],
['The “hide after” time must be later than the “show from” time', 'The “hide after” time must dey after the “show from” time', 'Àkókò “fi pamọ́ lẹ́yìn” gbọ́dọ̀ pẹ́ ju àkókò “fi hàn láti”', 'Lokacin “ɓoye bayan” dole ya kasance bayan lokacin “nuna daga”', 'Oge “zoo mgbe” ga-abịa mgbe oge “gosi site na” gasịrị'],
['This block’s schedule has ended, so visitors no longer see it', 'This block schedule don end, so visitors no dey see am again', 'Ìṣètò búlọ́ọ̀kù yìí ti parí, nítorí náà àwọn àlejò kò rí i mọ́', 'Jadawalin wannan tubalin ya ƙare, don haka baƙi ba sa ganinsa kuma', 'Usoro oge blọk a agwụla, ya mere ndị ọbịa anaghịzi ahụ ya']];


const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(layoutBlockFieldsRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const layoutBlockFieldsPcm = column(1);
export const layoutBlockFieldsYo = column(2);
export const layoutBlockFieldsHa = column(3);
export const layoutBlockFieldsIg = column(4);