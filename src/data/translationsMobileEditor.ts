/**
 * Phone page editor (D317). DRAFTS — every non-English line needs a native speaker's check.
 * Row: [English, Naijá, Yorùbá, Hausa, Igbo]. Words already drafted elsewhere (Undo, Layers, Pages…) win over these.
 */
export const mobileEditorRows: [string, string, string, string, string][] = [
  ['Back to My Spaces', 'Go back to My Spaces', 'Padà sí Àwọn Àyè Mi', 'Koma zuwa Wuraren Nawa', 'Laghachi na Ohere M'],
  ['Untitled page', 'Page wey no get name', 'Ojú-ìwé aláìlórúkọ', 'Shafi mara suna', 'Ibe enweghị aha'],
  ['Preview', 'Preview', 'Àwòtẹ́lẹ̀', 'Dubawa', 'Nlele'],
  ['Publish', 'Publish', 'Tẹ̀ jáde', 'Wallafa', 'Bipụta'],
  ['Live', 'Live', 'Ń lọ lọ́wọ́', 'Kai tsaye', 'Dị ndụ'],
  ['Canvas', 'Canvas', 'Ojú iṣẹ́', 'Zane', 'Kanvas'],
  ['Add block', 'Add block', 'Fi búlọ́ọ̀kù kún', 'Ƙara tubali', 'Tinye blọk'],
  ['Editor tools', 'Editor tools', 'Irinṣẹ́ olóòtú', 'Kayan aikin edita', 'Ngwaọrụ onye ndezi'],
  ['Blocks', 'Blocks', 'Búlọ́ọ̀kù', 'Tubalai', 'Blọk'],
  ['Design', 'Design', 'Àpẹẹrẹ', 'Zane', 'Nhazi'],
  ['Layers', 'Layers', 'Ìpele', 'Matakai', 'Ọkwa'],
  ['Pages', 'Pages', 'Ojú-ìwé', 'Shafuka', 'Ibe'],
  ['Settings', 'Settings', 'Ètò', 'Saituna', 'Ntọala'],
  ['Tap a page to edit it', 'Tap page to edit am', 'Tẹ ojú-ìwé kan láti ṣàtúnṣe rẹ̀', 'Taɓa shafi don gyara shi', 'Pịa ibe iji dezie ya'],
  ['Page settings', 'Page settings', 'Ètò ojú-ìwé', 'Saitunan shafi', 'Ntọala ibe'],
  ['Status', 'Status', 'Ipò', 'Matsayi', 'Ọnọdụ'],
  ['Editor language', 'Editor language', 'Èdè olóòtú', 'Harshen edita', 'Asụsụ onye ndezi'],
  ['Changes the editor only, not your page.', 'E dey change only the editor, no be your page.', 'Ó ń yí olóòtú nìkan padà, kì í ṣe ojú-ìwé rẹ.', 'Yana canza edita kawai, ba shafinka ba.', 'Ọ na-agbanwe naanị onye ndezi, ọ bụghị ibe gị.'],
  ['Block', 'Block', 'Búlọ́ọ̀kù', 'Tubali', 'Blọk'],
  ['Changes appear on the canvas as you type', 'Changes go show for canvas as you dey type', 'Àyípadà ń hàn lójú iṣẹ́ bí o ṣe ń tẹ̀', 'Canje-canje suna bayyana a zane yayin da kake rubutu', 'Mgbanwe na-apụta na kanvas ka ị na-ede'],
  ['Done', 'Done', 'Ó parí', 'An gama', 'Emechaala'],
];

const column = (i: 1 | 2 | 3 | 4) => Object.fromEntries(mobileEditorRows.map((r) => [r[0], r[i]])) as Record<string, string>;

export const mobileEditorPcm = column(1);
export const mobileEditorYo = column(2);
export const mobileEditorHa = column(3);
export const mobileEditorIg = column(4);
