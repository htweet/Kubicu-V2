/** Pidgin, Yorùbá, Hausa and Igbo drafts for the buyer card step (D433). Drafts — need native review. */
type Dict = Record<string, string>;

// [English, Pidgin, Yorùbá, Hausa, Igbo]
const rows: [string, string, string, string, string][] = [
['Pay by card', 'Pay with card', 'Sanwó pẹ̀lú káàdì', 'Biya da kati', 'Kwụọ ụgwọ site na kaadị'],
['Visa, Mastercard and local cards. Your card details go to the payment provider, never to the seller.', 'Visa, Mastercard and local cards. Your card details dey go to the payment company, e no dey go to the seller.', 'Visa, Mastercard àti àwọn káàdì ìbílẹ̀. Àlàyé káàdì rẹ ń lọ sọ́dọ̀ olùpèsè ìsanwó, kì í ṣe sí olùtajà.', 'Visa, Mastercard da katunan gida. Bayanan katinka suna zuwa wurin mai bada sabis na biya, ba wurin mai sayarwa ba.', 'Visa, Mastercard na kaadị obodo. Nkọwa kaadị gị na-aga n’aka onye na-enye ọrụ ịkwụ ụgwọ, ọ dịghị mgbe ọ na-aga n’aka onye na-ere ahịa.'],
['The payment didn’t go through', 'The payment no go through', 'Ìsanwó náà kò lọ', 'Biyan bai wuce ba', 'Ịkwụ ụgwọ agaghị'],
['Nothing was charged.', 'Dem no collect any money.', 'A kò gba owó kankan.', 'Ba a cire kome ba.', 'Ewepụghị ego ọ bụla.'],
['Confirm with your bank', 'Confirm with your bank', 'Fìdí rẹ̀ múlẹ̀ pẹ̀lú báǹkì rẹ', 'Tabbatar da bankinka', 'Kwado ya na ụlọ akụ gị'],
['Your bank wants to check it’s you before paying {payee}. In real life this opens your banking app or sends a one-time code.', 'Your bank wan check say na you before e pay {payee}. For real life, e go open your bank app or send one-time code.', 'Báǹkì rẹ fẹ́ ríi dájú pé ìwọ ni kí ó tó san fún {payee}. Ní ti gidi, yóò ṣí áàpù báǹkì rẹ tàbí fi kóòdù ẹ̀ẹ̀kan ránṣẹ́.', 'Bankinka yana so ya tabbatar kai ne kafin ya biya {payee}. A zahiri, wannan yana buɗe manhajar bankinka ko aika lambar sau ɗaya.', 'Ụlọ akụ gị chọrọ ịlele na ọ bụ gị tupu ịkwụ {payee}. N’ezie, nke a na-emepe ngwa ụlọ akụ gị ma ọ bụ ziga koodu otu oge.'],
['Your bank wants to confirm it’s you.', 'Your bank wan confirm say na you.', 'Báǹkì rẹ fẹ́ fìdí rẹ̀ múlẹ̀ pé ìwọ ni.', 'Bankinka yana so ya tabbatar kai ne.', 'Ụlọ akụ gị chọrọ ikwado na ọ bụ gị.'],
['Approve in my bank', 'Approve am for my bank', 'Fọwọ́ sí i nínú báǹkì mi', 'Amince a bankina', 'Kwado ya n’ụlọ akụ m'],
['Test: the check fails', 'Test: the check fail', 'Ìdánwò: àyẹ̀wò kùnà', 'Gwaji: binciken ya kasa', 'Nnwale: nlele adaala'],
['Card number', 'Card number', 'Nọ́mbà káàdì', 'Lambar kati', 'Nọmba kaadị'],
['Expiry', 'Expiry', 'Ọjọ́ ìparí', 'Ƙarewa', 'Mgbe ọ ga-agwụ'],
['Enter the 16-digit card number', 'Put the 16-digit card number', 'Tẹ nọ́mbà káàdì oní-nọ́mbà 16', 'Shigar da lambar kati mai lambobi 16', 'Tinye nọmba kaadị nwere ọnụọgụ 16'],
['In test mode, use one of the test cards below', 'For test mode, use one of the test cards for down', 'Ní ipò ìdánwò, lo ọ̀kan nínú àwọn káàdì ìdánwò ìsàlẹ̀', 'A yanayin gwaji, yi amfani da ɗaya daga katunan gwaji a ƙasa', 'N’ọnọdụ nnwale, jiri otu n’ime kaadị nnwale dị n’okpuru'],
['Enter the 3 digits on the back', 'Put the 3 digits wey dey back', 'Tẹ nọ́mbà mẹ́ta tó wà lẹ́yìn', 'Shigar da lambobi 3 na baya', 'Tinye ọnụọgụ 3 dị n’azụ'],
['Test cards — choose what happens', 'Test cards — choose wetin go happen', 'Àwọn káàdì ìdánwò — yan ohun tó máa ṣẹlẹ̀', 'Katunan gwaji — zaɓi abin da zai faru', 'Kaadị nnwale — họrọ ihe ga-eme'],
['Any future expiry and any 3-digit CVC.', 'Any future expiry and any 3-digit CVC.', 'Ọjọ́ ìparí èyíkéyìí lọ́jọ́ iwájú àti CVC oní-nọ́mbà 3 èyíkéyìí.', 'Kowace ranar ƙarewa ta gaba da kowace CVC mai lambobi 3.', 'Ụbọchị mgbe ọ ga-agwụ n’ọdịnihu ọ bụla na CVC ọnụọgụ 3 ọ bụla.'],
['Pays', 'E go pay', 'Ó sanwó', 'Yana biya', 'Ọ na-akwụ'],
['Asks your bank to confirm', 'E go ask your bank to confirm', 'Ó ní kí báǹkì rẹ fìdí rẹ̀ múlẹ̀', 'Yana neman bankinka ya tabbatar', 'Ọ na-arịọ ụlọ akụ gị ka ọ kwado'],
['Declined', 'Dem decline am', 'A kọ̀ ọ́', 'An ƙi', 'Ajụrụ ya'],
['Expired card', 'Card wey don expire', 'Káàdì tó ti parí', 'Katin da ya ƙare', 'Kaadị gwụrụ agwụ'],
['Not enough money', 'Money no reach', 'Owó kò tó', 'Kuɗi bai isa ba', 'Ego ezughị'],
['Your bank declined the payment. Try another card or ask your bank.', 'Your bank decline the payment. Try another card or ask your bank.', 'Báǹkì rẹ kọ ìsanwó náà. Gbìyànjú káàdì mìíràn tàbí bi báǹkì rẹ.', 'Bankinka ya ƙi biyan. Gwada wani kati ko ka tambayi bankinka.', 'Ụlọ akụ gị jụrụ ịkwụ ụgwọ ahụ. Nwaa kaadị ọzọ ma ọ bụ jụọ ụlọ akụ gị.'],
['Your bank says this card has expired. Use another card.', 'Your bank talk say this card don expire. Use another card.', 'Báǹkì rẹ sọ pé káàdì yìí ti parí. Lo káàdì mìíràn.', 'Bankinka ya ce katin nan ya ƙare. Yi amfani da wani kati.', 'Ụlọ akụ gị kwuru na kaadị a agwụla. Jiri kaadị ọzọ.'],
['There isn’t enough money on this card. Top it up or use another card.', 'Money no reach for this card. Add money or use another card.', 'Owó kò tó lórí káàdì yìí. Fi owó kún un tàbí lo káàdì mìíràn.', 'Babu isasshen kuɗi a katin nan. Ƙara kuɗi ko yi amfani da wani kati.', 'Ego ezughị na kaadị a. Tinye ego ma ọ bụ jiri kaadị ọzọ.'],
['Processing…', 'E dey process…', 'Ó ń ṣiṣẹ́…', 'Ana aiki…', 'Ọ na-arụ ọrụ…']];


const build = (i: 1 | 2 | 3 | 4): Dict => Object.fromEntries(rows.map((r) => [r[0], r[i]]));

export const cardPayPcm = build(1);
export const cardPayYo = build(2);
export const cardPayHa = build(3);
export const cardPayIg = build(4);