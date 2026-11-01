import { columns, type Row3 } from './build';

/** Kiswahili, Twi, isiZulu — cross-border checkout, tax types, tax and shipping settings (D435–D436). DRAFTS. */
const rows: Row3[] = [
['Deliver to', 'Peleka kwa', 'Fa kɔ', 'Hambisa e-'],
['Express to {country}', 'Haraka hadi {country}', 'Ntɛm kɔ {country}', 'Okusheshayo kuya e-{country}'],
['Economy to {country}', 'Nafuu hadi {country}', 'Ka a ɛyɛ mmerɛ kɔ {country}', 'Okushibhile kuya e-{country}'],
['3–5 business days', 'Siku 3–5 za kazi', 'Adwuma nna 3–5', 'Izinsuku zomsebenzi ezi-3–5'],
['7–12 business days', 'Siku 7–12 za kazi', 'Adwuma nna 7–12', 'Izinsuku zomsebenzi ezi-7–12'],
['tracked', 'inafuatiliwa', 'wobetumi adi akyi', 'kuyalandelwa'],
['Sent from {from} by courier. Import duties or taxes may be charged by {to} when it arrives — they aren’t included here.', 'Hutumwa kutoka {from} kwa msafirishaji. {to} inaweza kutoza ushuru wa kuingiza bidhaa itakapofika — haujajumuishwa hapa.', 'Wɔde bɛfiri {from} denam courier so. {to} betumi agye mfasoɔ toɔ bere a ɛbɛduru — ɛnka ho wɔ ha.', 'Kuthunyelwa kusuka e-{from} ngenkampani yokuthumela. I-{to} ingakhokhisa intela yokungenisa uma kufika — akufakiwe lapha.'],
['Tax', 'Kodi', 'Toɔ', 'Intela'],
['Standard rate', 'Kiwango cha kawaida', 'Boɔ a ɛtaa da hɔ', 'Izinga elijwayelekile'],
['Zero-rated', 'Kiwango sifuri', 'Boɔ hwee', 'Izinga elinguziro'],
['Exempt', 'Imesamehewa', 'Wɔayi afiri mu', 'Ikhululiwe'],
['Most goods and services.', 'Bidhaa na huduma nyingi.', 'Nneɛma ne nnwuma dodoɔ no ara.', 'Izimpahla nezinsizakalo eziningi.'],
['Ship abroad', 'Safirisha nje ya nchi', 'Fa kɔ amannɔne', 'Thumela phesheya'],
['For delivery abroad', 'Kwa usafirishaji nje ya nchi', 'Ma amannɔne soma', 'Ukuthumela phesheya'],
['Customs declaration', 'Tamko la forodha', 'Kastom nkra', 'Isimemezelo samasiko'],
['Print customs form', 'Chapisha fomu ya forodha', 'Tintim kastom krataa', 'Phrinta ifomu yamasiko'],
['Book courier', 'Weka msafirishaji', 'Hyɛ courier', 'Bhukha inkampani yokuthumela'],
['Tax by country', 'Kodi kwa nchi', 'Toɔ wɔ ɔman biara mu', 'Intela ngezwe'],
['Sales before tax', 'Mauzo kabla ya kodi', 'Adetɔn ansa na toɔ', 'Ukuthengisa ngaphambi kwentela'],
['Tax collected', 'Kodi iliyokusanywa', 'Toɔ a wɔagye', 'Intela eqoqiwe'],
['Month', 'Mwezi', 'Bosome', 'Inyanga'],
['Rate', 'Kiwango', 'Boɔ', 'Izinga'],
['Export', 'Pakua', 'Twe', 'Khipha']];


export const crossBorder = columns(rows);