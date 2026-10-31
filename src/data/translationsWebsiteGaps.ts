/**
 * Drafts for D343: website short-link clicks in Analytics, and filling in where older contacts came from.
 * DRAFTS — every non-English line needs a native speaker's check. Row: [English, Naijá, Yorùbá, Hausa, Igbo].
 */
export const websiteGapsRows: [string, string, string, string, string][] = [
['Links that go to another website or a WhatsApp chat count each real click, because those visitors don’t open your page. Bots and repeat taps are left out.', 'Links wey dey go another website or WhatsApp chat dey count each real click, because those visitors no dey open your page. We no dey count bots and repeat taps.', 'Ìjápọ̀ tí ó ń lọ sí ojú-òpó mìíràn tàbí ìjíròrò WhatsApp ń ka títẹ̀ gidi kọ̀ọ̀kan, nítorí àwọn àlejò wọ̀nyẹn kò ṣí ojú-ìwé rẹ. A kò ka bọ́ọ̀tì àti títẹ̀ àtúnṣe.', 'Hanyoyin da ke zuwa wani shafi ko hirar WhatsApp suna ƙidaya kowane danna na gaske, saboda waɗannan masu ziyara ba sa buɗe shafinka. Ba a ƙidaya bot da maimaita dannawa.', 'Njikọ na-aga weebụsaịtị ọzọ ma ọ bụ mkparịta ụka WhatsApp na-agụ ịpị ọ bụla n’ezie, n’ihi na ndị ọbịa ahụ anaghị emepe ibe gị. Anaghị agụ bọt na ịpị ugboro ugboro.'],
['First came from', 'First come from', 'Ibi tí ó ti kọ́kọ́ wá', 'Ya fara zuwa daga', 'Bụ ụzọ si'],
['added by you', 'na you add am', 'ìwọ ni o fi kún un', 'kai ka ƙara', 'ị tinyere ya'],
['Not recorded — added before channels were tracked', 'We no record am — dem add am before we start to track channels', 'A kò kọ ọ́ sílẹ̀ — a fi kún un kí a tó máa tọpa ọ̀nà', 'Ba a rubuta ba — an ƙara kafin a fara bin hanyoyi', 'Edeghị ya — etinyere ya tupu amalite ịchọpụta ụzọ'],
['Add', 'Add', 'Fi kún un', 'Ƙara', 'Tinye'],
['Permission for marketing', 'Permission for marketing', 'Ìyọ̀ǹda fún ìpolówó', 'Izinin talla', 'Ikike maka mgbasa ozi'],
['Agreed {date}', 'Agree {date}', 'Ó gbà ní {date}', 'Ya amince {date}', 'Kwetara {date}'],
['recorded by you', 'na you record am', 'ìwọ ni o kọ ọ́ sílẹ̀', 'kai ka rubuta', 'ị dekọrọ ya'],
['Not recorded', 'We no record am', 'A kò kọ ọ́ sílẹ̀', 'Ba a rubuta ba', 'Edeghị ya'],
['Record it', 'Record am', 'Kọ ọ́ sílẹ̀', 'Rubuta shi', 'Dekọọ ya'],
['Not subscribed, so nothing to record', 'Dem never subscribe, so nothing to record', 'Kò forúkọsílẹ̀, nítorí náà kò sí ohun tí a ó kọ', 'Bai yi rajista ba, don haka babu abin da za a rubuta', 'Ọ debanyeghị aha, ya mere ọ dịghị ihe a ga-edekọ'],
['Where they first found you', 'Where dem first find you', 'Ibi tí wọ́n ti kọ́kọ́ rí ọ', 'Inda suka fara samun ka', 'Ebe ha bu ụzọ hụ gị'],
['What they agreed to', 'Wetin dem agree to', 'Ohun tí wọ́n gbà', 'Abin da suka amince da shi', 'Ihe ha kwetara'],
['Their words or the wording they saw, e.g. a WhatsApp reply or a sign-up sheet. Keep the original as proof.', 'Their words or wetin dem see, like WhatsApp reply or sign-up sheet. Keep the original as proof.', 'Ọ̀rọ̀ wọn tàbí ọ̀rọ̀ tí wọ́n rí, bí èsì WhatsApp tàbí ìwé ìforúkọsílẹ̀. Tọ́jú ti àkọ́kọ́ bí ẹ̀rí.', 'Kalmominsu ko rubutun da suka gani, misali amsar WhatsApp ko takardar rajista. Ajiye na asali a matsayin shaida.', 'Okwu ha ma ọ bụ ihe ha hụrụ, dịka azịza WhatsApp ma ọ bụ mpempe akwụkwọ ndebanye. Debe nke mbụ dịka akaebe.'],
['When', 'When', 'Ìgbà wo', 'Yaushe', 'Mgbe'],
['Open a contact to add where they first found you.', 'Open contact to add where dem first find you.', 'Ṣí olùbásọ̀rọ̀ kan láti fi ibi tí wọ́n ti kọ́kọ́ rí ọ kún un.', 'Buɗe lambar sadarwa don ƙara inda suka fara samun ka.', 'Mepee kọntaktị iji tinye ebe ha bu ụzọ hụ gị.'],
['Where they came from was added by hand', 'Dem add where dem come from by hand', 'A fi ibi tí wọ́n ti wá kún un pẹ̀lú ọwọ́', 'An ƙara inda suka fito da hannu', 'Etinyere ebe ha si n’aka'],
['Permission recorded by hand', 'Permission wey dem record by hand', 'A kọ ìyọ̀ǹda sílẹ̀ pẹ̀lú ọwọ́', 'An rubuta izini da hannu', 'Edekọrọ ikike n’aka']];


const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(websiteGapsRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const websiteGapsPcm = column(1);
export const websiteGapsYo = column(2);
export const websiteGapsHa = column(3);
export const websiteGapsIg = column(4);