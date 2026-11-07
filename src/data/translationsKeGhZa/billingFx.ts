import { columns, type Row3 } from './build';

/** Kiswahili, Twi, isiZulu — billing in local currency (D432). DRAFTS — need a native speaker's check. */
const rows: Row3[] = [
  [
    'Converted from {price} at today’s rate ({rate}). The amount is fixed on each invoice, and an unpaid invoice keeps its amount for 7 days.',
    'Imebadilishwa kutoka {price} kwa kiwango cha leo ({rate}). Kiasi kinawekwa kwenye kila ankara, na ankara isiyolipwa hubaki na kiasi chake kwa siku 7.',
    'Wɔasesa afiri {price} mu wɔ ɛnnɛ boɔ so ({rate}). Sika dodoɔ no tim wɔ nkrataa biara so, na nkrataa a wɔntuaeɛ no kura ne sika dodoɔ nnanson.',
    'Kushintshwe kusuka ku-{price} ngenani lanamuhla ({rate}). Inani liyagxila ku-invoyisi ngayinye, futhi i-invoyisi engakhokhelwanga igcina inani layo izinsuku ezi-7.',
  ],
  [
    'The rate has moved {pct}% since your last payment, so your next charge will differ from the last one.',
    'Kiwango kimebadilika kwa {pct}% tangu malipo yako ya mwisho, kwa hivyo malipo yajayo yatatofautiana na ya mwisho.',
    'Boɔ no asesa {pct}% firi wo tua a ɛtwa toɔ no, enti wo tua a ɛdi hɔ no bɛyɛ soronko.',
    'Inani lishintshe ngo-{pct}% kusukela enkokhelweni yakho yokugcina, ngakho inkokhelo elandelayo izohluka.',
  ],
  [
    'Your KUBICU plan is billed in {currency} from your next renewal, at that day’s rate. The current period isn’t charged again.',
    'Mpango wako wa KUBICU utatozwa kwa {currency} kuanzia usasishaji ujao, kwa kiwango cha siku hiyo. Kipindi cha sasa hakitozwi tena.',
    'Wɔbɛgye wo KUBICU nhyehyɛeɛ no ho ka wɔ {currency} mu firi wo nsesamu a ɛdi hɔ, wɔ saa da no boɔ so. Wɔrennye mprempren berɛ no ho ka bio.',
    'Uhlelo lwakho lwe-KUBICU luzokhokhiswa nge-{currency} kusukela ekuvuseleleni okulandelayo, ngenani langalolo suku. Isikhathi samanje asikhokhiswa futhi.',
  ],
];

export const billingFx = columns(rows);
