/** Drafted translations: cross-border tracking steps in Deliveries (D451). Drafts — need native review. */
type Dict = Record<string, string>;

// [English, Pidgin, Yorùbá, Hausa, Igbo]
const rows: [string, string, string, string, string][] = [
  ['Going abroad: {from} → {to}', 'Dey go abroad: {from} → {to}', 'Ń lọ sí òkè-òkun: {from} → {to}', 'Zuwa ƙasar waje: {from} → {to}', 'Na-aga mba ọzọ: {from} → {to}'],
  ['Booked with courier', 'Don book with courier', 'A ti pe olùránṣẹ́', 'An yi odar mai jigila', 'Edokwala onye nnyefe'],
  ['Picked up', 'Dem don carry am', 'A ti gbé e', 'An ɗauka', 'Ebuterela ya'],
  ['Left {from}', 'Don comot {from}', 'Ti kúrò ní {from}', 'Ya bar {from}', 'Ahapụla {from}'],
  ['At customs in {to}', 'E dey customs for {to}', 'Ó wà ní kọ́sítọ́mù ní {to}', 'Yana kwastam a {to}', 'Ọ nọ na kọstọm na {to}'],
  ['Cleared customs', 'Customs don clear am', 'Ó ti kọjá kọ́sítọ́mù', 'Ya wuce kwastam', 'Ọ gafeela kọstọm'],
  ['Out for delivery', 'E don comot for delivery', 'Ó ti jáde fún ìfijíṣẹ́', 'Ya fita don kai wa', 'Ọ pụọla maka nnyefe'],
  ['Delivered', 'Don deliver', 'A ti fi jíṣẹ́', 'An kai', 'Ebugala'],
  ['Left {from} — on the way abroad', 'Don comot {from} — e dey road go abroad', 'Ti kúrò ní {from} — ó wà lọ́nà sí òkè-òkun', 'Ya bar {from} — yana kan hanyar zuwa ƙasar waje', 'Ahapụla {from} — ọ nọ n’ụzọ mba ọzọ'],
  ['Out for delivery in {to}', 'E don comot for delivery for {to}', 'Ó ti jáde fún ìfijíṣẹ́ ní {to}', 'Ya fita don kai wa a {to}', 'Ọ pụọla maka nnyefe na {to}'],
  ['the buyer’s country', 'the buyer country', 'orílẹ̀-èdè olùrà', 'ƙasar mai saya', 'mba onye zụrụ'],
  ['Courier has collected it', 'Courier don collect am', 'Olùránṣẹ́ ti gbà á', 'Mai jigila ya karɓa', 'Onye nnyefe anatala ya'],
  ['Prototype: next tracking update', 'Prototype: next tracking update', 'Àpẹẹrẹ: ìròyìn ìtọpinpin tó kàn', 'Samfuri: sabunta bibiya na gaba', 'Ụdị nnwale: mmelite nsochi ọzọ'],
  ['The customer’s code is used at the door once the parcel is out for delivery in {to}.', 'Customer code go work for door once the parcel don comot for delivery for {to}.', 'A máa lo kóòdù oníbàárà ní ẹnu ọ̀nà nígbà tí ẹrù náà bá ti jáde fún ìfijíṣẹ́ ní {to}.', 'Ana amfani da lambar abokin ciniki a ƙofa da zarar kunshin ya fita don kai wa a {to}.', 'A na-eji koodu onye ahịa n’ọnụ ụzọ ozugbo ngwugwu ahụ pụrụ maka nnyefe na {to}.'],
  ['Held at customs — details or duties needed', 'Customs hold am — dem need details or duty', 'Kọ́sítọ́mù dá a dúró — wọ́n nílò àlàyé tàbí owó-orí', 'Kwastam ta riƙe — ana buƙatar bayani ko haraji', 'Kọstọm jidere ya — achọrọ nkọwa ma ọ bụ ụtụ'],
  ['Returned to sender from abroad', 'E don return to sender from abroad', 'A dá a padà sí olùfiránṣẹ́ láti òkè-òkun', 'An mayar wa mai aikawa daga ƙasar waje', 'Eweghachila ya nye onye zitere site na mba ọzọ'],
];

const build = (i: 1 | 2 | 3 | 4): Dict => Object.fromEntries(rows.map((r) => [r[0], r[i]]));
export const crossBorderTrackingPcm = build(1);
export const crossBorderTrackingYo = build(2);
export const crossBorderTrackingHa = build(3);
export const crossBorderTrackingIg = build(4);
