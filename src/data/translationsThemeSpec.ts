/**
 * Theme gallery spec sheet and compare window (D337). Colour codes, CSS recipes, font and theme names stay as written.
 * DRAFTS — every non-English line needs a native speaker's check. Row: [English, Naijá, Yorùbá, Hausa, Igbo].
 */
export const themeSpecRows: [string, string, string, string, string][] = [
// Compare window
['Compare themes', 'Compare themes', 'Fi àkòrí wé ara wọn', 'Kwatanta jigogi', 'Tụnyere isiokwu'],
['Same page, same content — only the theme changes.', 'Same page, same content — na only the theme dey change.', 'Ojú-ìwé kan náà, àkóónú kan náà — àkòrí nìkan ló ń yí padà.', 'Shafi ɗaya, abun ciki ɗaya — jigo kawai ke canzawa.', 'Otu ibe, otu ọdịnaya — naanị isiokwu na-agbanwe.'],
['Preview size', 'Preview size', 'Ìwọ̀n àwòtẹ́lẹ̀', 'Girman dubawa', 'Nha nlele'],
// Spec sheet sections
['Colour roles', 'Colour roles', 'Ipa àwọ̀', 'Matsayin launuka', 'Ọrụ agba'],
['Page background', 'Page background', 'Ẹ̀yìn ojú-ìwé', 'Bayan shafi', 'Azụ ibe'],
['Surface', 'Surface', 'Ojú', 'Saman', 'Elu'],
['Text', 'Text', 'Ọ̀rọ̀', 'Rubutu', 'Ederede'],
['Muted text', 'Soft text', 'Ọ̀rọ̀ rírọ̀', 'Rubutu mara ƙarfi', 'Ederede dị nro'],
['Primary action', 'Main action', 'Ìṣe àkọ́kọ́', 'Babban aiki', 'Omume isi'],
['Action text', 'Action text', 'Ọ̀rọ̀ ìṣe', 'Rubutun aiki', 'Ederede omume'],
['Secondary', 'Secondary', 'Kejì', 'Na biyu', 'Nke abụọ'],
['Border', 'Border', 'Ààlà', 'Iyaka', 'Ókè'],
['Focus ring', 'Focus ring', 'Òrùka àfojúsùn', 'Zoben mayar da hankali', 'Mgbanaka nlebara anya'],
['Materials', 'Materials', 'Ohun èlò', 'Kayayyaki', 'Ihe eji eme'],
['Depth', 'Depth', 'Jíjìn', 'Zurfi', 'Omimi'],
['Corners', 'Corners', 'Igun', 'Kusurwa', 'Nkuku'],
['Photo frame', 'Photo frame', 'Férémù fọ́tò', 'Firam ɗin hoto', 'Okpokoro foto'],
['Links', 'Links', 'Ìjápọ̀', 'Hanyoyi', 'Njikọ'],
['Atmosphere recipe', 'Atmosphere recipe', 'Ìlànà àyíká', 'Girke-girken yanayi', 'Usoro ikuku'],
['Type', 'Fonts', 'Lẹ́tà', 'Rubutu', 'Mkpụrụedemede'],
['Display heading', 'Display heading', 'Àkọlé ìfihàn', 'Babban kanun labari', 'Isiokwu ngosi'],
['Section heading', 'Section heading', 'Àkọlé apá', 'Kanun sashe', 'Isiokwu ngalaba'],
['Body text sits comfortably at 15–17px with relaxed line height.', 'Body text dey sit well for 15–17px with relaxed line height.', 'Ọ̀rọ̀ ara jókòó dáadáa ní 15–17px pẹ̀lú gíga ìlà tí ó rọ̀.', 'Rubutun jiki yana zaune cikin jin daɗi a 15–17px tare da tsayin layi mai sassauci.', 'Ederede ahụ na-anọ nke ọma na 15–17px nwere ogo ahịrị dị nro.'],
['Caption · metadata · 12–13px', 'Caption · metadata · 12–13px', 'Àkọlé kékeré · dátà àfikún · 12–13px', 'Taken bayani · metadata · 12–13px', 'Nkọwa · metadata · 12–13px'],
['Pair default', 'Pair default', 'Àṣàyàn àkọ́kọ́ àpapọ̀', 'Tsohon haɗin', 'Ndabere njikọ'],
['tracking {t}', 'spacing {t}', 'àlàfo lẹ́tà {t}', 'tazara {t}', 'oghere {t}'],
['Components', 'Components', 'Ẹ̀yà ara', 'Abubuwa', 'Akụkụ'],
['Readability', 'Readability', 'Kíkà rọrùn', 'Saukin karantawa', 'Ịgụ nke ọma'],
['Text on background (worst atmosphere colour)', 'Text on background (worst atmosphere colour)', 'Ọ̀rọ̀ lórí ẹ̀yìn (àwọ̀ àyíká tó burú jù)', 'Rubutu a bayan fage (launin yanayi mafi muni)', 'Ederede n’azụ (agba ikuku kacha njọ)'],
['Primary action text (both gradient ends)', 'Main action text (both gradient ends)', 'Ọ̀rọ̀ ìṣe àkọ́kọ́ (òpin méjèèjì àdàpọ̀ àwọ̀)', 'Rubutun babban aiki (ƙarshen gradient biyu)', 'Ederede omume isi (nsọtụ abụọ nke ngwakọta agba)'],
['Large text only', 'Big text only', 'Ọ̀rọ̀ ńlá nìkan', 'Babban rubutu kawai', 'Naanị ederede buru ibu'],
['Fails', 'E fail', 'Ó kùnà', 'Ya gaza', 'Ọ dara ada'],
['Switches off automatically', 'E dey off by itself', 'Ó ń pa ara rẹ̀ láìfọwọ́kàn', 'Yana kashe kansa ta atomatik', 'Ọ na-agbanyụ onwe ya'],
['Glass and blur become the solid surface for reduced transparency and data saver; phones get lighter blur.', 'Glass and blur go turn solid surface for reduced transparency and data saver; phones go get lighter blur.', 'Gíláàsì àti ìbòjú di ojú líle fún ìdínkù ìfihàn àti ìpamọ́ dátà; fóònù ń gba ìbòjú tí ó fúyẹ́.', 'Gilashi da duhu suna zama saman tsayayye don rage bayyanawa da ajiye bayanai; wayoyi suna samun duhu mai sauƙi.', 'Iko na ndọ na-aghọ elu siri ike maka mbelata nghọta na nchekwa data; ekwentị na-enweta ndọ dị mfe.'],
['The atmosphere becomes the flat background in data saver.', 'The atmosphere go turn flat background for data saver.', 'Àyíká di ẹ̀yìn pẹrẹsẹ nínú ìpamọ́ dátà.', 'Yanayin yana zama bayan fage mai lebur a ajiye bayanai.', 'Ikuku na-aghọ azụ dị larịị na nchekwa data.'],
['Phones use a simpler atmosphere.', 'Phones dey use simpler atmosphere.', 'Fóònù ń lo àyíká tí ó rọrùn jù.', 'Wayoyi suna amfani da yanayi mafi sauƙi.', 'Ekwentị na-eji ikuku dị mfe karị.'],
['The hover sheen on primary actions is off for reduced motion.', 'The hover shine for main actions dey off for reduced motion.', 'Dídán nígbà tí a bá rábàbà lórí ìṣe àkọ́kọ́ wà ní pípa fún ìdínkù ìṣípòpadà.', 'Sheƙin shawagi akan manyan ayyuka yana kashe don rage motsi.', 'Nchapụta mgbe a na-efegharị n’omume isi gbanyụrụ maka mbelata mmegharị.'],
['Inverted sections drop glass, gradients and glow.', 'Inverted sections dey drop glass, gradients and glow.', 'Àwọn apá tí a yí padà ń fi gíláàsì, àdàpọ̀ àwọ̀ àti ìtànná sílẹ̀.', 'Sassan da aka juya suna barin gilashi, gradient da haske.', 'Ngalaba atụgharịrị na-ahapụ iko, ngwakọta agba na nchapụta.'],
['Opacity {o}% · blur {b}px', 'Opacity {o}% · blur {b}px', 'Àìríkọjá {o}% · ìbòjú {b}px', 'Rashin bayyana {o}% · duhu {b}px', 'Opacity {o}% · ndọ {b}px'],
['Edge light', 'Edge light', 'Ìmọ́lẹ̀ etí', 'Hasken gefe', 'Ìhè nsọtụ'],
['From button shape', 'From button shape', 'Láti ìrísí bọ́tìnnì', 'Daga siffar maɓalli', 'Site n’ọdịdị bọtịnụ'],
// Material values
['Matte', 'Matte', 'Àìdán', 'Mara sheƙi', 'Enweghị nchapụta'],
['Satin sheen', 'Satin shine', 'Dídán sátínì', 'Sheƙin satin', 'Nchapụta satin'],
['Glass', 'Glass', 'Gíláàsì', 'Gilashi', 'Iko'],
['Lacquer', 'Lacquer', 'Ìkunra dídán', 'Fenti mai sheƙi', 'Lacquer'],
['Solid', 'Solid', 'Líle', 'Tsayayye', 'Siri ike'],
['Gradient', 'Gradient', 'Àdàpọ̀ àwọ̀', 'Gradient', 'Ngwakọta agba'],
['Gloss', 'Gloss', 'Dídán', 'Sheƙi', 'Nchapụta'],
['Glow edge', 'Glow edge', 'Etí tí ń tàn', 'Gefe mai haske', 'Nsọtụ na-enwu'],
['None', 'None', 'Kò sí', 'Babu', 'Ọ dịghị'],
['Soft', 'Soft', 'Rírọ̀', 'Mai laushi', 'Dị nro'],
['Lifted', 'Lifted', 'Gbígbé sókè', 'Ɗagagge', 'Ebuliri elu'],
['Glow', 'Glow', 'Ìtànná', 'Haske', 'Nchapụta'],
['Round', 'Round', 'Yíká', 'Zagaye', 'Gburugburu'],
['Sharp', 'Sharp', 'Mímú', 'Kaifi', 'Dị nkọ'],
['Generous', 'Very round', 'Yíká púpọ̀', 'Zagaye sosai', 'Gburugburu nke ukwuu'],
['Hairline', 'Thin line', 'Ìlà tínín-ín', 'Siririn layi', 'Ahịrị dị gịrịgịrị'],
['Mat', 'Mat', 'Àlà fọ́tò', 'Gefen hoto', 'Oghere foto'],
['Shadow', 'Shadow', 'Òjìji', 'Inuwa', 'Onyinyo'],
['Arrow', 'Arrow', 'Ọfà', 'Kibiya', 'Akụ'],
['Underline', 'Underline', 'Ìlà nísàlẹ̀', 'Layin ƙasa', 'Ahịrị n’okpuru'],
['Accent', 'Accent colour', 'Àwọ̀ àfihàn', 'Launin haske', 'Agba ntụpọ']];


const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(themeSpecRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const themeSpecPcm = column(1);
export const themeSpecYo = column(2);
export const themeSpecHa = column(3);
export const themeSpecIg = column(4);