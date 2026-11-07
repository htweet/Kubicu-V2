import { columns, type Row3 } from './build';

/** Kiswahili, Twi, isiZulu — cross-border tracking steps in Deliveries (D451). DRAFTS. */
const rows: Row3[] = [
  ['Going abroad: {from} → {to}', 'Inakwenda nje: {from} → {to}', 'Ɛrekɔ amannɔne: {from} → {to}', 'Kuya phesheya: {from} → {to}'],
  ['Booked with courier', 'Imewekwa kwa msafirishaji', 'Wɔahyɛ courier', 'Kubhukhwe nenkampani yokuthumela'],
  ['Picked up', 'Imechukuliwa', 'Wɔafa', 'Kulandiwe'],
  ['Left {from}', 'Imeondoka {from}', 'Afiri {from}', 'Kushiye i-{from}'],
  ['At customs in {to}', 'Iko forodhani {to}', 'Ɛwɔ kastom wɔ {to}', 'Kusemasikweni e-{to}'],
  ['Cleared customs', 'Imepita forodha', 'Afiri kastom mu', 'Kudlule emasikweni'],
  ['Out for delivery', 'Iko njiani kuletwa', 'Ɛrekɔ ama wɔde ama', 'Kuphumile ukuze kulethwe'],
  ['Delivered', 'Imefikishwa', 'Wɔde ama', 'Kulethiwe'],
  ['Left {from} — on the way abroad', 'Imeondoka {from} — iko njiani kwenda nje', 'Afiri {from} — ɛrekɔ amannɔne', 'Kushiye i-{from} — kusendleleni kuya phesheya'],
  ['Out for delivery in {to}', 'Iko njiani kuletwa {to}', 'Ɛrekɔ ama wɔde ama wɔ {to}', 'Kuphumile ukuze kulethwe e-{to}'],
  ['the buyer’s country', 'nchi ya mnunuzi', 'ɔtɔfoɔ no man', 'izwe lomthengi'],
  ['Courier has collected it', 'Msafirishaji ameichukua', 'Courier no afa', 'Inkampani yokuthumela ikulandile'],
  ['Prototype: next tracking update', 'Mfano: taarifa inayofuata ya ufuatiliaji', 'Nhwɛsoɔ: di akyi nsɛm a ɛdi hɔ', 'Isibonelo: isibuyekezo esilandelayo sokulandelela'],
  ['The customer’s code is used at the door once the parcel is out for delivery in {to}.', 'Msimbo wa mteja hutumika mlangoni kifurushi kikiwa njiani kuletwa {to}.', 'Wɔde adetɔfoɔ no kood di dwuma wɔ ɛpono ano berɛ a nneɛma kotokuo no rekɔ ama wɔde ama wɔ {to}.', 'Ikhodi yekhasimende isetshenziswa emnyango uma iphasela selikhishelwe ukulethwa e-{to}.'],
  ['Held at customs — details or duties needed', 'Imezuiliwa forodhani — maelezo au ushuru unahitajika', 'Kastom akura mu — wɔhia nsɛm anaa toɔ', 'Kubanjwe emasikweni — kudingeka imininingwane noma intela'],
  ['Returned to sender from abroad', 'Imerudishwa kwa mtumaji kutoka nje', 'Wɔde asan ama ɔsomafoɔ firi amannɔne', 'Kubuyiselwe kumthumeli kusuka phesheya'],
];

export const crossBorderTracking = columns(rows);
