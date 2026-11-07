import { columns, type Row3 } from './build';

/** Kiswahili, Twi, isiZulu — activity log exports and the combined log (D439). DRAFTS. */
const rows: Row3[] = [
  ['Export', 'Hamisha', 'Twe', 'Khipha'],
  ['Export activity', 'Hamisha shughuli', 'Twe dwumadie', 'Khipha umsebenzi'],
  ['Workspaces', 'Nafasi za kazi', 'Adwumabea', 'Izindawo zokusebenza'],
  ['This workspace', 'Nafasi hii ya kazi', 'Adwumabea yi', 'Le ndawo yokusebenza'],
  ['Format', 'Muundo', 'Nhyehyɛeɛ', 'Ifomethi'],
  ['Spreadsheet (CSV)', 'Jedwali (CSV)', 'Spreadsheet (CSV)', 'Isipredishithi (CSV)'],
  ['Opens in Excel or Google Sheets.', 'Hufunguka kwenye Excel au Google Sheets.', 'Ɛbue wɔ Excel anaa Google Sheets mu.', 'Ivuleka ku-Excel noma ku-Google Sheets.'],
  ['Download', 'Pakua', 'Twe', 'Landa'],
  ['Done', 'Imekamilika', 'Awie', 'Kwenziwe'],
  ['Fingerprint copied', 'Alama imenakiliwa', 'Wɔafa nsateaa ho mfonini', 'Isigxivizo sikopishiwe'],
  ['The export itself is recorded in the activity log.', 'Uhamishaji wenyewe unarekodiwa kwenye kumbukumbu ya shughuli.', 'Wɔakyerɛw twe no ankasa wɔ dwumadie nhoma mu.', 'Ukukhipha ngokwako kubhalwa kurekhodi yomsebenzi.'],
];

export const activityExport = columns(rows);
