/**
 * Template preview and buy windows (D315). DRAFTS — every non-English line needs a native speaker's check.
 * Row: [English, Naijá, Yorùbá, Hausa, Igbo].
 */
export const templateWindowsRows: [string, string, string, string, string][] = [
['Preview: {name}', 'Preview: {name}', 'Àwòtẹ́lẹ̀: {name}', 'Dubawa: {name}', 'Nlele: {name}'],
['Sample business — prices, links and quotes are removed when you use it.', 'Sample business — we go comot prices, links and quotes when you use am.', 'Iṣẹ́ àpẹẹrẹ — a ó yọ iye owó, ìjápọ̀ àti ọ̀rọ̀ kúrò nígbà tí o bá lò ó.', 'Kasuwancin misali — ana cire farashi, hanyoyi da maganganu idan ka yi amfani da shi.', 'Azụmahịa ihe atụ — a na-ewepụ ọnụahịa, njikọ na okwu mgbe ị jiri ya.'],
['{price} once, for this workspace · preview is free', '{price} one time, for this workspace · preview na free', '{price} lẹ́ẹ̀kan, fún ibi iṣẹ́ yìí · àwòtẹ́lẹ̀ jẹ́ ọ̀fẹ́', '{price} sau ɗaya, don wannan wurin aiki · dubawa kyauta ne', '{price} otu ugboro, maka ebe ọrụ a · nlele bụ n’efu'],
['{price} · owned', '{price} · you get am', '{price} · tìrẹ ni', '{price} · naka ne', '{price} · nke gị'],
['Free', 'Free', 'Ọ̀fẹ́', 'Kyauta', 'N’efu'],
['Keep browsing', 'Continue to look', 'Máa wò ó lọ', 'Ci gaba da dubawa', 'Gaa n’ihu na-elele'],
['Buy for {price}', 'Buy for {price}', 'Rà á ní {price}', 'Saya a {price}', 'Zụta na {price}'],
['Preview size', 'Preview size', 'Ìwọ̀n àwòtẹ́lẹ̀', 'Girman dubawa', 'Nha nlele'],
['Phone', 'Phone', 'Fóònù', 'Waya', 'Ekwentị'],
['Desktop', 'Computer', 'Kọ̀ǹpútà', 'Kwamfuta', 'Kọmputa'],
['Preview', 'Preview', 'Àwòtẹ́lẹ̀', 'Dubawa', 'Nlele'],
['Buy this template: {name}', 'Buy this template: {name}', 'Ra àwòṣe yìí: {name}', 'Saya wannan samfuri: {name}', 'Zụta ndebiri a: {name}'],
['{price} + VAT, once. Use it on any space in {workspace}.', '{price} + VAT, one time. Use am for any space inside {workspace}.', '{price} + VAT, lẹ́ẹ̀kan. Lò ó lórí àyè èyíkéyìí nínú {workspace}.', '{price} + VAT, sau ɗaya. Yi amfani da shi a kowane wuri a {workspace}.', '{price} + VAT, otu ugboro. Jiri ya na ohere ọ bụla n’ime {workspace}.'],
['Pay {amount}', 'Pay {amount}', 'San {amount}', 'Biya {amount}', 'Kwụọ {amount}'],
['Template bought', 'Template don buy', 'A ti ra àwòṣe', 'An sayi samfuri', 'Azụtala ndebiri'],
['It’s yours for this workspace. The invoice is in Plan & billing.', 'E don be your own for this workspace. The invoice dey Plan & billing.', 'Ó jẹ́ tìrẹ fún ibi iṣẹ́ yìí. Ìwé owó wà nínú Ètò & ìsanwó.', 'Naka ne don wannan wurin aiki. Takardar kuɗi tana a Tsari & biyan kuɗi.', 'Ọ bụ nke gị maka ebe ọrụ a. Akwụkwọ ụgwọ dị na Atụmatụ & ịkwụ ụgwọ.'],
['Ask the Owner to buy it.', 'Ask the Owner make e buy am.', 'Béèrè lọ́wọ́ Onílé láti rà á.', 'Nemi Mai shi ya saya.', 'Rịọ Onye nwe ka ọ zụta ya.']];


const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(templateWindowsRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const templateWindowsPcm = column(1);
export const templateWindowsYo = column(2);
export const templateWindowsHa = column(3);
export const templateWindowsIg = column(4);