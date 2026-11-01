/**
 * Pidgin, Yorùbá, Hausa and Igbo drafts for the seller side of Phase 5 (D449): branches and franchises (D437),
 * tax types and cross-border shipping settings (D435–D436), and activity-log downloads (D439).
 * Same English keys as the Kiswahili/Twi/isiZulu files. Drafts — need native review.
 */
type Dict = Record<string, string>;

// [English, Pidgin, Yorùbá, Hausa, Igbo]
const rows: [string, string, string, string, string][] = [
// ——— Branches ———
['Branches', 'Branches', 'Àwọn ẹ̀ka', 'Rassa', 'Alaka'],
['Add a branch', 'Add branch', 'Ṣàfikún ẹ̀ka', 'Ƙara reshe', 'Tinye alaka'],
['Main shop', 'Main shop', 'Ṣọ́ọ̀bù àkọ́kọ́', 'Babban shago', 'Ụlọ ahịa isi'],
['Locations', 'Locations', 'Àwọn ibùdó', 'Wurare', 'Ebe dị iche iche'],
['Stock by location', 'Stock for each location', 'Ọjà ní ibùdó kọ̀ọ̀kan', 'Kaya ta kowane wuri', 'Ngwongwo kwa ebe'],
['Move stock', 'Move stock', 'Gbé ọjà lọ', 'Matsar da kaya', 'Bugharịa ngwongwo'],
['Move', 'Move', 'Gbé lọ', 'Matsar', 'Bugharịa'],
['From', 'From', 'Láti', 'Daga', 'Site na'],
['To', 'Go', 'Sí', 'Zuwa', 'Gaa'],
['How many?', 'How many?', 'Mélòó?', 'Nawa?', 'Ole ka?'],
['Close branch', 'Close branch', 'Ti ẹ̀ka', 'Rufe reshe', 'Mechie alaka'],
['Reopen', 'Open am again', 'Tún ṣí', 'Sake buɗewa', 'Meghee ọzọ'],
['Closed', 'E don close', 'Ti tì', 'An rufe', 'Emechiela'],
['No pickup', 'No pickup', 'Kò sí gbígbà níbí', 'Babu karɓa a nan', 'Enweghị ịnata ebe a'],
['Who runs it?', 'Who dey run am?', 'Ta ló ń ṣàkóso rẹ̀?', 'Wa ke tafiyar da shi?', 'Onye na-elekọta ya?'],
['A franchise partner', 'Franchise partner', 'Alábàáṣiṣẹ́ franchise', 'Abokin hulɗar franchise', 'Onye mmekọ franchise'],
['You', 'You', 'Ìwọ', 'Kai', 'Gị'],
['Partner’s business name', 'Partner business name', 'Orúkọ iṣẹ́ alábàáṣiṣẹ́', 'Sunan kasuwancin abokin hulɗa', 'Aha azụmahịa onye mmekọ'],
['Royalty (% of sales)', 'Royalty (% of sales)', 'Ìpín (% nínú títà)', 'Kaso (% na tallace-tallace)', 'Òkè (% nke ọrịre)'],
['Agreement start', 'When agreement start', 'Ìbẹ̀rẹ̀ àdéhùn', 'Farkon yarjejeniya', 'Mmalite nkwekọrịta'],
['Buyers can collect orders here', 'Buyers fit collect orders here', 'Olùrà lè gba àṣẹ níbí', 'Masu saya na iya karɓar oda a nan', 'Ndị zụrụ nwere ike ịnata usoro ebe a'],
['Opening hours', 'Opening hours', 'Àkókò ìṣísílẹ̀', 'Lokutan buɗewa', 'Oge mmeghe'],
['{n} places to collect from', 'Places to collect from: {n}', 'Ibi tí o ti lè gbà á: {n}', 'Wuraren karɓa: {n}', 'Ebe ịnata: {n}'],
['Just your main shop for now', 'Na only your main shop for now', 'Ṣọ́ọ̀bù àkọ́kọ́ rẹ nìkan fún báyìí', 'Babban shagonka kaɗai a yanzu', 'Naanị ụlọ ahịa isi gị ugbu a'],

// ——— Tax types and cross-border settings ———
['Standard rate', 'Normal rate', 'Ìwọ̀n àṣà', 'Daidaitaccen kaso', 'Ọnụego nkịtị'],
['Zero-rated', 'Zero rate', 'Ìwọ̀n òdo', 'Kaso sifili', 'Ọnụego efu'],
['Exempt', 'No tax', 'A yọ̀ ọ́ sílẹ̀', 'An keɓe', 'Ewepụrụ'],
['Most goods and services.', 'Most goods and services.', 'Ọ̀pọ̀ jùlọ ọjà àti iṣẹ́.', 'Yawancin kaya da ayyuka.', 'Ọtụtụ ngwaahịa na ọrụ.'],
['Ship abroad', 'Send go abroad', 'Fi ránṣẹ́ sí òkè-òkun', 'Aika ƙasar waje', 'Zipu mba ọzọ'],
['For delivery abroad', 'For delivery abroad', 'Fún ìfiránṣẹ́ sí òkè-òkun', 'Don kai wa ƙasar waje', 'Maka nnyefe mba ọzọ'],
['Customs declaration', 'Customs declaration', 'Ìkéde kọ́sítọ́mù', 'Sanarwar kwastam', 'Nkwupụta kọstọm'],
['Print customs form', 'Print customs form', 'Tẹ fọ́ọ̀mù kọ́sítọ́mù', 'Buga fom ɗin kwastam', 'Bipụta fọm kọstọm'],
['Book courier', 'Book courier', 'Pe olùránṣẹ́', 'Yi odar mai jigila', 'Dokwaa onye nnyefe'],
['Tax by country', 'Tax for each country', 'Owó-orí ní orílẹ̀-èdè kọ̀ọ̀kan', 'Haraji ta ƙasa', 'Ụtụ isi kwa mba'],
['Sales before tax', 'Sales before tax', 'Títà ṣáájú owó-orí', 'Tallace-tallace kafin haraji', 'Ọrịre tupu ụtụ isi'],
['Tax collected', 'Tax wey you collect', 'Owó-orí tí a gbà', 'Harajin da aka karɓa', 'Ụtụ isi anakọtara'],
['Month', 'Month', 'Oṣù', 'Wata', 'Ọnwa'],
['Rate', 'Rate', 'Ìwọ̀n', 'Kaso', 'Ọnụego'],

// ——— Activity-log downloads ———
['Export', 'Export', 'Gbé jáde', 'Fitar', 'Bupụ'],
['Export activity', 'Export activity', 'Gbé ìṣẹ̀lẹ̀ jáde', 'Fitar da ayyuka', 'Bupụ omume'],
['Workspaces', 'Workspaces', 'Àwọn ibi iṣẹ́', 'Wuraren aiki', 'Ebe ọrụ'],
['This workspace', 'This workspace', 'Ibi iṣẹ́ yìí', 'Wannan wurin aiki', 'Ebe ọrụ a'],
['Format', 'Format', 'Ìrísí fáìlì', 'Tsari', 'Usoro faịlụ'],
['Spreadsheet (CSV)', 'Spreadsheet (CSV)', 'Spreadsheet (CSV)', 'Spreadsheet (CSV)', 'Spreadsheet (CSV)'],
['Opens in Excel or Google Sheets.', 'E dey open for Excel or Google Sheets.', 'Ó ń ṣí nínú Excel tàbí Google Sheets.', 'Yana buɗewa a Excel ko Google Sheets.', 'Ọ na-emepe na Excel ma ọ bụ Google Sheets.'],
['Download', 'Download', 'Gbà sílẹ̀', 'Sauke', 'Budata'],
['Fingerprint copied', 'Fingerprint don copy', 'A ti ṣẹ̀dà ìka-àmì', 'An kwafi hoton yatsa', 'Edetuola akara mkpịsị aka'],
['The export itself is recorded in the activity log.', 'We go write the export itself for activity log.', 'A ń kọ ìgbéjáde náà fúnra rẹ̀ sínú àkọsílẹ̀ ìṣẹ̀lẹ̀.', 'Ana rubuta fitarwar kanta a cikin rajistar ayyuka.', 'A na-edekọ mbupụ ahụ n’onwe ya n’akwụkwọ omume.']];


const build = (i: 1 | 2 | 3 | 4): Dict => Object.fromEntries(rows.map((r) => [r[0], r[i]]));
export const sellerPhase5Pcm = build(1);
export const sellerPhase5Yo = build(2);
export const sellerPhase5Ha = build(3);
export const sellerPhase5Ig = build(4);