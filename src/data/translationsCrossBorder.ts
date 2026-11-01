/** Pidgin, Yorùbá, Hausa and Igbo drafts for cross-border checkout and product tax types (D435–D436). Drafts — need native review. */
type Dict = Record<string, string>;

// [English, Pidgin, Yorùbá, Hausa, Igbo]
const rows: [string, string, string, string, string][] = [
['Deliver to', 'Send am go', 'Fi ránṣẹ́ sí', 'Kai zuwa', 'Ziga na'],
['Express to {country}', 'Express go {country}', 'Kíákíá sí {country}', 'Gaggawa zuwa {country}', 'Ngwa ngwa gaa {country}'],
['Economy to {country}', 'Economy go {country}', 'Olówó pọ́ọ́kú sí {country}', 'Mai sauƙi zuwa {country}', 'Ọnụ ala gaa {country}'],
['3–5 business days', '3–5 working days', 'Ọjọ́ iṣẹ́ 3–5', 'Kwanakin aiki 3–5', 'Ụbọchị ọrụ 3–5'],
['7–12 business days', '7–12 working days', 'Ọjọ́ iṣẹ́ 7–12', 'Kwanakin aiki 7–12', 'Ụbọchị ọrụ 7–12'],
['tracked', 'you fit track am', 'a lè tọpinpin rẹ̀', 'ana iya bin sawu', 'enwere ike ịchọta ya'],
['Sent from {from} by courier. Import duties or taxes may be charged by {to} when it arrives — they aren’t included here.', 'Dem go send am from {from} by courier. {to} fit charge import duty or tax when e land — e no dey inside this price.', 'A ó fi ránṣẹ́ láti {from} nípasẹ̀ olùránṣẹ́. {to} lè gba owó-orí ìkówọlé nígbà tí ó bá dé — kò sí nínú iye yìí.', 'Za a aiko daga {from} ta hannun kamfanin jigilar kaya. {to} na iya karɓar harajin shigo da kaya idan ya iso — ba a haɗa shi a nan ba.', 'A ga-esi {from} ziga ya site n’aka ụlọ ọrụ nnyefe. {to} nwere ike ịnara ụtụ mbubata mgbe ọ rutere — etinyeghị ya ebe a.'],
['Tax', 'Tax', 'Owó-orí', 'Haraji', 'Ụtụ isi'],
// Checkout pickup at a branch (D437).
['Collect from', 'Collect am from', 'Gbà á ní', 'Karɓa daga', 'Nata ya na'],
['Main shop', 'Main shop', 'Ṣọ́ọ̀bù àkọ́kọ́', 'Babban shago', 'Ụlọ ahịa isi'],
['{n} places to collect from', '{n} places wey you fit collect am', 'Ibi {n} láti gbà á', 'Wurare {n} na karɓa', 'Ebe {n} ị ga-anata ya'],
['Standard rate', 'Normal rate', 'Ìwọ̀n déédéé', 'Daidaitaccen kashi', 'Ọnụego nkịtị'],
['Zero-rated', 'Zero rate', 'Ìwọ̀n òdo', 'Kashi sifili', 'Ọnụego efu'],
['Exempt', 'E no dey pay tax', 'Ó yọ̀ǹda', 'An keɓe', 'Agụpụrụ ya']];


const build = (i: 1 | 2 | 3 | 4): Dict => Object.fromEntries(rows.map((r) => [r[0], r[i]]));

export const crossBorderPcm = build(1);
export const crossBorderYo = build(2);
export const crossBorderHa = build(3);
export const crossBorderIg = build(4);