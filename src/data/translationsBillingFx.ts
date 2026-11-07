/** Pidgin, Yorùbá, Hausa and Igbo drafts for billing in local currency (D432). Drafts — need native review. */
type Dict = Record<string, string>;

// [English, Pidgin, Yorùbá, Hausa, Igbo]
const rows: [string, string, string, string, string][] = [
  [
    'Converted from {price} at today’s rate ({rate}). The amount is fixed on each invoice, and an unpaid invoice keeps its amount for 7 days.',
    'We change am from {price} with today rate ({rate}). The amount no go shift for each invoice, and invoice wey you never pay go keep im amount for 7 days.',
    'A yí i padà láti {price} ní iye òní ({rate}). Iye náà dúró lórí ìwé-owó kọ̀ọ̀kan, ìwé-owó tí a kò sanwó rẹ̀ sì máa ń di iye rẹ̀ mú fún ọjọ́ 7.',
    'An canza daga {price} a farashin yau ({rate}). Adadin yana tsayawa a kowane takardar biya, kuma takardar da ba a biya ba tana riƙe adadinta na kwanaki 7.',
    'Agbanwere ya site na {price} n’ọnụego taa ({rate}). Ego ahụ na-akwụ ọtọ n’akwụkwọ ụgwọ ọ bụla, akwụkwọ ụgwọ a na-akwụbeghị na-ejide ego ya ụbọchị 7.',
  ],
  [
    'The rate has moved {pct}% since your last payment, so your next charge will differ from the last one.',
    'The rate don move {pct}% since your last payment, so the next charge no go be the same as the last one.',
    'Iye pàṣípààrọ̀ ti yí padà ní {pct}% láti ìgbà ìsanwó rẹ tó kẹ́yìn, nítorí náà ìsanwó tó kàn yóò yàtọ̀.',
    'Farashin musaya ya canza da {pct}% tun bayan biyanka na ƙarshe, don haka cajin gaba zai bambanta.',
    'Ọnụego agbanweela {pct}% kemgbe ịkwụ ụgwọ gị ikpeazụ, ya mere ụgwọ na-esote ga-adị iche.',
  ],
  [
    'Your KUBICU plan is billed in {currency} from your next renewal, at that day’s rate. The current period isn’t charged again.',
    'From your next renewal, we go charge your KUBICU plan for {currency}, with that day rate. We no go charge this period again.',
    'A ó máa gba owó ètò KUBICU rẹ ní {currency} láti ìgbà ìsọdọ̀tun tó kàn, ní iye ọjọ́ náà. A kò ní gba owó àkókò yìí lẹ́ẹ̀kan sí i.',
    'Za a riƙa cajin shirin KUBICU ɗinka da {currency} daga sabuntawa na gaba, a farashin ranar. Ba za a sake cajin wannan lokaci ba.',
    'A ga-akwụ ụgwọ atụmatụ KUBICU gị na {currency} site na mmeghari ọhụrụ na-esote, n’ọnụego ụbọchị ahụ. A gaghị akwụ ụgwọ oge a ọzọ.',
  ],
];

const build = (i: 1 | 2 | 3 | 4): Dict => Object.fromEntries(rows.map((r) => [r[0], r[i]]));

export const billingFxPcm = build(1);
export const billingFxYo = build(2);
export const billingFxHa = build(3);
export const billingFxIg = build(4);
