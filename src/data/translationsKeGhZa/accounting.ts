import { columns, type Row3 } from './build';

/** Kiswahili, Twi, isiZulu — accounting connections (D438). DRAFTS. */
const rows: Row3[] = [
  ['Accounting', 'Uhasibu', 'Akontaa', 'Ukubalwa kwezimali'],
  ['Connect accounting', 'Unganisha uhasibu', 'Ka akontaa bom', 'Xhuma ukubalwa kwezimali'],
  ['Accounting tool', 'Zana ya uhasibu', 'Akontaa adwinnade', 'Ithuluzi lokubala izimali'],
  ['Organisation', 'Shirika', 'Ahyehyɛdeɛ', 'Inhlangano'],
  ['Connect', 'Unganisha', 'Ka bom', 'Xhuma'],
  ['Disconnect', 'Tenganisha', 'Tete mu', 'Nqamula'],
  ['Sync now', 'Sawazisha sasa', 'Yɛ no pɛ seesei', 'Vumelanisa manje'],
  ['All caught up', 'Kila kitu kimesasishwa', 'Biribiara aba mu', 'Konke kuvumelanisiwe'],
  ['How payments post', 'Jinsi malipo yanavyowekwa', 'Sɛdeɛ akatua kɔ mu', 'Indlela izinkokhelo ezifakwa ngayo'],
  ['Each payment', 'Kila malipo', 'Akatua biara', 'Inkokhelo ngayinye'],
  ['One summary a day', 'Muhtasari mmoja kwa siku', 'Mmoaboa baako da biara', 'Isifinyezo esisodwa ngosuku'],
  ['Sync payments from', 'Sawazisha malipo kuanzia', 'Fa akatua firi', 'Vumelanisa izinkokhelo kusukela'],
  ['Sync once a day by itself', 'Sawazisha mara moja kwa siku yenyewe', 'Ɛno ara yɛ no pɛ da biara', 'Zivumelanise kanye ngosuku'],
  ['Account codes', 'Namba za akaunti', 'Akontaa nɔma', 'Amakhodi e-akhawunti'],
  ['Sales', 'Mauzo', 'Adetɔn', 'Ukuthengisa'],
  ['Payment fees', 'Ada za malipo', 'Akatua ka', 'Izimali zokukhokha'],
  ['Refunds', 'Marejesho', 'Sika a wɔde asan', 'Izimbuyiselo'],
  ['Tax collected', 'Kodi iliyokusanywa', 'Toɔ a wɔagye', 'Intela eqoqiwe'],
  ['Clearing account', 'Akaunti ya kusafisha', 'Clearing akontaa', 'I-akhawunti yokuhlanza'],
  ['Sync history', 'Historia ya usawazishaji', 'Pɛ abakɔsɛm', 'Umlando wokuvumelanisa'],
  ['Add the missing account codes', 'Ongeza namba za akaunti zinazokosekana', 'Fa akontaa nɔma a ɛyera ka ho', 'Engeza amakhodi e-akhawunti angekho'],
  ['Accounting disconnected', 'Uhasibu umetenganishwa', 'Wɔatete akontaa no mu', 'Ukubalwa kwezimali kunqanyuliwe'],
];

export const accounting = columns(rows);
