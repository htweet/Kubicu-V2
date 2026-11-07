/** Pidgin, Yorùbá, Hausa and Igbo drafts for template filters by country and city (D434). Drafts — need native review. */
type Dict = Record<string, string>;

// [English, Pidgin, Yorùbá, Hausa, Igbo]
const rows: [string, string, string, string, string][] = [
  ['Country', 'Country', 'Orílẹ̀-èdè', 'Ƙasa', 'Obodo'],
  ['All countries', 'All countries', 'Gbogbo orílẹ̀-èdè', 'Duk ƙasashe', 'Obodo niile'],
  ['City', 'City', 'Ìlú', 'Birni', 'Obodo mepere emepe'],
  ['Every city', 'Every city', 'Gbogbo ìlú', 'Kowane birni', 'Obodo mepere emepe niile'],
  ['Food & drink', 'Food & drink', 'Oúnjẹ àti ohun mímu', 'Abinci da abin sha', 'Nri na ihe ọṅụṅụ'],
  ['Home services', 'Home services', 'Iṣẹ́ ilé', 'Ayyukan gida', 'Ọrụ ụlọ'],
  ['Repairs', 'Repairs', 'Àtúnṣe', 'Gyare-gyare', 'Mmezi'],
  ['Musician', 'Musician', 'Olórin', 'Mawaƙi', 'Onye egwu'],
  ['Photographer', 'Photographer', 'Ayàwòrán', 'Mai ɗaukar hoto', 'Onye na-ese foto'],
  ['Education', 'Education', 'Ẹ̀kọ́', 'Ilimi', 'Agụmakwụkwọ'],
];

const build = (i: 1 | 2 | 3 | 4): Dict => Object.fromEntries(rows.map((r) => [r[0], r[i]]));

export const starterFiltersPcm = build(1);
export const starterFiltersYo = build(2);
export const starterFiltersHa = build(3);
export const starterFiltersIg = build(4);
