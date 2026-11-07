import { columns, type Row3 } from './build';

/** Kiswahili, Twi, isiZulu — inventory and ERP connections (D440). DRAFTS. */
const rows: Row3[] = [
  ['Inventory & ERP', 'Hesabu ya bidhaa na ERP', 'Nneɛma ho akontaa ne ERP', 'Isitoko ne-ERP'],
  ['Connect inventory or ERP', 'Unganisha hesabu ya bidhaa au ERP', 'Ka nneɛma akontaa anaa ERP bom', 'Xhuma isitoko noma i-ERP'],
  ['System', 'Mfumo', 'Nhyehyɛeɛ', 'Uhlelo'],
  ['API key', 'Ufunguo wa API', 'API safoa', 'Ukhiye we-API'],
  ['Warehouses', 'Maghala', 'Nneɛma korabea', 'Izindlu zokugcina'],
  ['Stock matches', 'Bidhaa zinalingana', 'Nneɛma no hyia', 'Isitoko siyafana'],
  ['Map a warehouse to start', 'Linganisha ghala ili kuanza', 'Fa korabea bi hyɛ ase', 'Hlanganisa indlu yokugcina ukuze uqale'],
  ['Sync every hour by itself', 'Sawazisha kila saa yenyewe', 'Ɛno ara yɛ no pɛ dɔnhwere biara', 'Zivumelanise njalo ngehora'],
  ['ERP disconnected', 'ERP imetenganishwa', 'Wɔatete ERP no mu', 'I-ERP inqanyuliwe'],
];

export const erp = columns(rows);
