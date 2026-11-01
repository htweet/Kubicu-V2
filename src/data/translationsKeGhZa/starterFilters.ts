import { columns, type Row3 } from './build';

/** Kiswahili, Twi, isiZulu — template filters by country and city, new starter categories (D434). DRAFTS. */
const rows: Row3[] = [
['Country', 'Nchi', 'Ɔman', 'Izwe'],
['All countries', 'Nchi zote', 'Aman nyinaa', 'Wonke amazwe'],
['City', 'Jiji', 'Kuro', 'Idolobha'],
['Every city', 'Kila jiji', 'Kuro biara', 'Wonke amadolobha'],
['Food & drink', 'Chakula na vinywaji', 'Aduane ne nsa', 'Ukudla neziphuzo'],
['Home services', 'Huduma za nyumbani', 'Fie mu nnwuma', 'Izinsizakalo zasekhaya'],
['Repairs', 'Matengenezo', 'Nsiesie', 'Ukulungisa'],
['Musician', 'Mwanamuziki', 'Nnwomtoni', 'Umculi'],
['Photographer', 'Mpiga picha', 'Mfonitwafoɔ', 'Umthwebuli'],
['Education', 'Elimu', 'Nwomasua', 'Imfundo']];


export const starterFilters = columns(rows);