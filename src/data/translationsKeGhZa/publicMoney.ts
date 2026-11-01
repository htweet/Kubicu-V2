import { columns, type Row3 } from './build';

/** Kiswahili, Twi, isiZulu — website amounts in local currency (D421). DRAFTS — need a native speaker's check. */
const rows: Row3[] = [
['Converted from naira at today’s rate. The amount is fixed on your invoice.', 'Imebadilishwa kutoka naira kwa kiwango cha leo. Kiasi kinawekwa kwenye ankara yako.', 'Wɔasesa afiri naira mu wɔ ɛnnɛ boɔ so. Wɔde sika dodoɔ no si wo nkrataa a wode tua ka no so.', 'Kushintshwe kusuka ku-naira ngenani lanamuhla. Inani liyagxila ku-invoyisi yakho.']];


export const publicMoney = columns(rows);