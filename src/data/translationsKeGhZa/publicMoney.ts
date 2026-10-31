import { columns, type Row3 } from './build';

/** Kiswahili, Twi, isiZulu — website amounts in local currency (D421). DRAFTS — need a native speaker's check. */
const rows: Row3[] = [
['Shown in {currency} at an example rate. The final price is confirmed when you pay.', 'Imeonyeshwa kwa {currency} kwa kiwango cha mfano. Bei ya mwisho inathibitishwa unapolipa.', 'Wɔde {currency} akyerɛ wɔ nhwɛsoɔ boɔ so. Wɔsi boɔ a ɛtwa toɔ no so dua bere a woretua.', 'Kuboniswa nge-{currency} ngenani lesibonelo. Inani lokugcina liqinisekiswa uma ukhokha.']];


export const publicMoney = columns(rows);