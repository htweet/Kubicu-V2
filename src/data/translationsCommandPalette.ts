/**
 * Canvas search and actions palette (D316). DRAFTS — every non-English line needs a native speaker's check.
 * Row: [English, Naijá, Yorùbá, Hausa, Igbo].
 */
export const commandPaletteRows: [string, string, string, string, string][] = [
['Command menu', 'Command menu', 'Àkójọ àṣẹ', 'Menu na umarni', 'Menu iwu'],
['Search actions and blocks', 'Search actions and blocks', 'Wá ìṣe àti búlọ́ọ̀kù', 'Nemo ayyuka da tubalai', 'Chọọ omume na blọk'],
['Add a block, find a block, or run an action…', 'Add block, find block, or run action…', 'Fi búlọ́ọ̀kù kún, wá búlọ́ọ̀kù, tàbí ṣe ìṣe kan…', 'Ƙara tubali, nemo tubali, ko gudanar da aiki…', 'Tinye blọk, chọta blọk, ma ọ bụ mee omume…'],
['Nothing matches “{query}”.', 'Nothing match “{query}”.', 'Kò sí ohun tí ó bá “{query}” mu.', 'Babu abin da ya dace da “{query}”.', 'Ọ dịghị ihe dabara “{query}”.'],
['Actions', 'Actions', 'Àwọn ìṣe', 'Ayyuka', 'Omume'],
['Add a block', 'Add block', 'Fi búlọ́ọ̀kù kún', 'Ƙara tubali', 'Tinye blọk'],
['Your sections', 'Your sections', 'Àwọn apá rẹ', 'Sassanka', 'Ngalaba gị'],
['Go to block', 'Go to block', 'Lọ sí búlọ́ọ̀kù', 'Je zuwa tubali', 'Gaa na blọk'],
['Publish…', 'Publish…', 'Tẹ̀ ẹ́ jáde…', 'Wallafa…', 'Bipụta…'],
['Preview draft', 'Preview draft', 'Wo àkọ̀tun', 'Duba daftari', 'Lee ndepụta'],
['Page theme', 'Page theme', 'Àkòrí ojú-ìwé', 'Jigon shafi', 'Isiokwu ibe'],
['Version history', 'Version history', 'Ìtàn ẹ̀yà', 'Tarihin siga', 'Akụkọ ụdị'],
['Preview on phone', 'Preview for phone', 'Wò ó lórí fóònù', 'Duba a waya', 'Lee na ekwentị'],
['Preview on tablet', 'Preview for tablet', 'Wò ó lórí tábìlẹ́ẹ̀tì', 'Duba a kwamfutar hannu', 'Lee na tablet'],
['Preview on desktop', 'Preview for computer', 'Wò ó lórí kọ̀ǹpútà', 'Duba a kwamfuta', 'Lee na kọmputa'],
['Undo', 'Undo', 'Padà sẹ́yìn', 'Soke', 'Gbanwee'],
['Redo', 'Do am again', 'Tún ṣe', 'Sake yi', 'Mee ọzọ'],
['Add product', 'Add product', 'Fi ọjà kún', 'Ƙara kaya', 'Tinye ngwaahịa'],
['Find order', 'Find order', 'Wá àṣẹ', 'Nemo oda', 'Chọta ọda'],
['Add contact', 'Add contact', 'Fi olùbásọ̀rọ̀ kún', 'Ƙara lamba', 'Tinye kọntaktị'],
['Blocks: {n}', 'Blocks: {n}', 'Búlọ́ọ̀kù: {n}', 'Tubalai: {n}', 'Blọk: {n}']];


const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(commandPaletteRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const commandPalettePcm = column(1);
export const commandPaletteYo = column(2);
export const commandPaletteHa = column(3);
export const commandPaletteIg = column(4);