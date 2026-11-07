import { columns, type Row3 } from './build';

/** Kiswahili, Twi, isiZulu — branches and franchises, plus the checkout pickup choice (D437). DRAFTS. */
const rows: Row3[] = [
  ['Branches', 'Matawi', 'Baa ahorow', 'Amagatsha'],
  ['Add a branch', 'Ongeza tawi', 'Fa baa ka ho', 'Engeza igatsha'],
  ['Main shop', 'Duka kuu', 'Adetɔnbea titire', 'Isitolo esikhulu'],
  ['Locations', 'Maeneo', 'Mmeae', 'Izindawo'],
  ['Stock by location', 'Bidhaa kwa kila eneo', 'Nneɛma wɔ beae biara', 'Isitoko ngendawo'],
  ['Move stock', 'Hamisha bidhaa', 'Tu nneɛma', 'Hambisa isitoko'],
  ['Move', 'Hamisha', 'Tu', 'Hambisa'],
  ['From', 'Kutoka', 'Firi', 'Kusuka'],
  ['To', 'Hadi', 'Kɔ', 'Kuya'],
  ['How many?', 'Ngapi?', 'Ahe?', 'Zingaki?'],
  ['Close branch', 'Funga tawi', 'To baa no mu', 'Vala igatsha'],
  ['Reopen', 'Fungua tena', 'Bue bio', 'Vula futhi'],
  ['Closed', 'Imefungwa', 'Wɔato mu', 'Kuvaliwe'],
  ['No pickup', 'Hakuna kuchukua', 'Wɔnnfa nneɛma wɔ ha', 'Akulandwa lapha'],
  ['Who runs it?', 'Nani anaiendesha?', 'Hena na ɔhwɛ so?', 'Ubani oliphethe?'],
  ['A franchise partner', 'Mshirika wa franchise', 'Franchise hokafoɔ', 'Uzakwethu we-franchise'],
  ['You', 'Wewe', 'Wo', 'Wena'],
  ['Partner’s business name', 'Jina la biashara ya mshirika', 'Hokafoɔ no adwuma din', 'Igama lebhizinisi likazakwethu'],
  ['Royalty (% of sales)', 'Mrabaha (% ya mauzo)', 'Royalty (% wɔ adetɔn mu)', 'Inkokhelo (% yokuthengisa)'],
  ['Agreement start', 'Mwanzo wa makubaliano', 'Apam no mfitiaseɛ', 'Ukuqala kwesivumelwano'],
  ['Buyers can collect orders here', 'Wanunuzi wanaweza kuchukua oda hapa', 'Atɔfoɔ betumi abegye wɔn nneɛma wɔ ha', 'Abathengi bangalanda ama-oda lapha'],
  ['Opening hours', 'Saa za kufungua', 'Bere a yɛbue', 'Amahora okuvula'],
  ['Collect from', 'Chukua kutoka', 'Begye firi', 'Landa kusuka'],
  ['{n} places to collect from', 'Maeneo {n} ya kuchukua', 'Mmeae {n} a wobɛgye', 'Izindawo ezi-{n} zokulanda'],
  ['Just your main shop for now', 'Duka lako kuu tu kwa sasa', 'Wo adetɔnbea titire nko ara seesei', 'Isitolo sakho esikhulu kuphela okwamanje'],
];

export const branches = columns(rows);
