import { columns, type Row3 } from './build';

/** Kiswahili, Twi, isiZulu — new accessibility labels (D430). DRAFTS — need a native speaker's check. */
const rows: Row3[] = [
['Play moving examples', 'Cheza mifano inayosonga', 'Ma nhwɛsoɔ a ɛkeka ho no nkɔ so', 'Dlala izibonelo ezihambayo'],
['Pause moving examples', 'Simamisha mifano inayosonga', 'Gyina nhwɛsoɔ a ɛkeka ho no so', 'Misa izibonelo ezihambayo'],
['Workspace shortcuts', 'Njia za mkato za eneo la kazi', 'Adwumayɛbea ntɛmkwan', 'Izinqamuleli zendawo yokusebenza'],
['Site links', 'Viungo vya tovuti', 'Wɛbsaet links', 'Izixhumanisi zesayithi']];


export const a11yLabels = columns(rows);