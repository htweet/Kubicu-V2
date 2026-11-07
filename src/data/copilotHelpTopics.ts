import type { UnderstandRow } from './copilotUnderstanding';

/**
 * Quick answers Copilot gives when someone asks about KUBICU instead of asking for a page (D520).
 * Copilot answers in two or three sentences and links to the screen where the person does it themselves. It never
 * moves money, changes an account or gives legal advice from the chat.
 * `words`: phrases that point to the topic: English, Pidgin, Yorùbá, Hausa, Igbo, Kiswahili, Twi, isiZulu. "|"
 * separates alternatives. Matching ignores tone marks. English always counts, because people mix languages.
 * DRAFTS — the non-English words need a native speaker's check. Answers are translated in data/translationsCopilotHelp.ts.
 */
export interface CopilotHelpLink {
  label: string;
  to: string;
}

export interface CopilotHelpTopic {
  id: string;
  words: UnderstandRow;
  answer: string;
  links: CopilotHelpLink[];
}

export const copilotHelpTopics: CopilotHelpTopic[] = [
  {
    id: 'capability',
    words: [
      'what can you do|what do you do|who are you|what are you|what is copilot|what s copilot|how does this work|what is kubicu|what s kubicu|whats kubicu',
      'wetin you fit do|wetin you dey do|who you be|wetin be copilot|how this one dey work',
      'kini o le se|ta ni e|kini copilot|bawo ni eyi se n sise',
      'me za ka iya yi|wane ne kai|menene copilot|yaya wannan ke aiki',
      'gini ka i nwere ike ime|onye ka i bu|gini bu copilot|kedu ka nke a si aru oru',
      'unaweza kufanya nini|wewe ni nani|copilot ni nini|hii inafanyaje kazi',
      'deen na wobetumi ayo|wo ne hwan|deen ne copilot|eye adwuma sen',
      'ungenzani|ungubani|yini i copilot|lokhu kusebenza kanjani',
    ],
    answer: 'My main job is making your page: tell me about your business and I’ll draft it in a few minutes. I can also answer quick questions about KUBICU and point you to the right screen. For jobs inside your workspace, the Assistant can help.',
    links: [{ label: 'Open the Assistant', to: '/app/assistant' }],
  },
  {
    id: 'payouts',
    words: [
      'get paid|payout|payouts|withdraw|withdrawal|wallet|bank account|cash out|receive money|receive payments|mobile money|my money',
      'collect my money|my money|withdraw|wallet|cash out|bank account',
      'gba owo mi|owo mi|yo owo|apamowo|akaunti banki',
      'karbi kudi|kudina|cire kudi|walat|asusun banki',
      'nata ego m|ego m|wepu ego|akpa ego|akauntu ulo aku',
      'kulipwa|pesa yangu|kutoa pesa|pochi|akaunti ya benki|mpesa',
      'me sika|gye me sika|yi sika|sika kotoku|bank akawnt|momo',
      'ukukhokhelwa|imali yami|ukukhipha imali|isikhwama|i akhawunti yasebhange',
    ],
    answer: 'Money from your sales goes into your KUBICU wallet. Add your bank or mobile money account in Wallet — payouts start once your business is verified. I can’t move money from this chat.',
    links: [{ label: 'Open Wallet', to: '/app/commerce/wallet' }],
  },
  {
    id: 'verify',
    words: [
      'verify|verified|verification|kyc|trust passport|badge|blue tick|id check',
      'verify|verification|kyc|badge|trust passport',
      'ijerisi|fidi mule|baaji|kyc',
      'tabbatarwa|tantancewa|baji|kyc',
      'nkwenye|nyochaa|baj|kyc',
      'uthibitisho|kuthibitisha|beji|kyc',
      'adansedie|si so dua|baagye|kyc',
      'ukuqinisekisa|qinisekisa|ibheji|kyc',
    ],
    answer: 'Verification checks who you are and your business, so you can receive payouts and earn the Trust Passport badge. Start it in Verification — you’ll need an ID and a few details about your business.',
    links: [
      { label: 'Open Verification', to: '/app/commerce/verification' },
      { label: 'Open Trust Passport', to: '/app/trust' },
    ],
  },
  {
    id: 'domain',
    words: [
      'domain|own web address|my own address|dot com|.com|custom address',
      'domain|my own address|dot com',
      'adiresi ti ara mi|domeeni|dot com',
      'adireshin kaina|domain|dot com',
      'adreesi nke m|domain|dot com',
      'kikoa|anwani yangu mwenyewe|dot com',
      'me ankasa address|domain|dot com',
      'isizinda|ikheli lami|dot com',
    ],
    answer: 'You can use your own web address, like yourname.com, on the Creator plan. In Domains, add the address and KUBICU shows you the records to copy into your domain provider.',
    links: [{ label: 'Open Domains', to: '/app/domains' }],
  },
  {
    id: 'links',
    words: [
      'short link|short links|shorten|qr|qr code|qr codes',
      'short link|shorten link|qr|qr code',
      'ijapo kukuru|koodu qr|qr',
      'gajeren hanya|lambar qr|qr',
      'njikọ dị mkpụmkpụ|koodu qr|qr',
      'kiungo kifupi|msimbo qr|qr',
      'link tiawa|qr koodu|qr',
      'isixhumanisi esifushane|ikhodi ye qr|qr',
    ],
    answer: 'Short links and QR codes live in Domains & QR. Make a short link for each place you share, and a QR code for print — both show how many people tapped.',
    links: [
      { label: 'Open short links', to: '/app/links' },
      { label: 'Open QR codes', to: '/app/qr' },
    ],
  },
  {
    id: 'bookings',
    words: [
      'booking|bookings|appointment|appointments|availability|my schedule|deposit',
      'booking|appointment|my schedule|deposit',
      'ifiṣura|ipade|akoko ti mo wa|idogo',
      'alƙawari|ajiyar lokaci|jadawali|ajiya',
      'nhazi oge|ọkwa|oge m di|nkwụnye ego',
      'miadi|kuweka nafasi|ratiba yangu|amana',
      'nhyiamu|bere a mewo ho|deposit',
      'ukubhuka|isikhathi sokuhlangana|ishejuli yami|idiphozithi',
    ],
    answer: 'In Bookings, add your services, set the hours you’re free, and customers pick a time on your page. You can ask for a deposit to hold each slot.',
    links: [{ label: 'Open Bookings', to: '/app/bookings' }],
  },
  {
    id: 'products',
    words: [
      'add products|add a product|add my products|upload products|stock|inventory|my products',
      'add product|add my goods|my goods|stock',
      'fi oja kun|oja mi|eru',
      'kara kaya|kayana|haja',
      'tinye ngwaahịa|ngwaahịa m|ngwa',
      'ongeza bidhaa|bidhaa zangu|hisa',
      'fa nneema ka ho|me nneema|stock',
      'engeza imikhiqizo|imikhiqizo yami|isitoko',
    ],
    answer: 'Add what you sell in Products — photos, price and stock. Then put a Products block on your page so people can order.',
    links: [{ label: 'Open Products', to: '/app/commerce/products' }],
  },
  {
    id: 'orders',
    words: [
      'my orders|an order|order status|track order|track my order|refund|delivery status',
      'my orders|order status|track order|refund',
      'awon ibere mi|ibere|dapada owo',
      'odar dina|odar|mayar da kudi',
      'iwu m|ọda|nloghachi ego',
      'oda zangu|oda|kurejesha pesa',
      'me oda|oda|sika san',
      'ama oda ami|i oda|ukubuyiselwa imali',
    ],
    answer: 'Every order lands in Orders, where you confirm it, arrange delivery and keep the customer updated. Refunds are done there too — I can’t refund from this chat.',
    links: [{ label: 'Open Orders', to: '/app/commerce/orders' }],
  },
  {
    id: 'analytics',
    words: [
      'analytics|stats|statistics|how many visitors|how many people|views|clicks|traffic',
      'analytics|stats|how many people see|views|clicks',
      'iṣiro|awon alejo melo|iworan',
      'kididdiga|masu ziyara nawa|kallo',
      'ọnụ ọgụgụ|ndị ọbịa ole|nlele',
      'takwimu|wageni wangapi|mibofyo',
      'akontaabuo|ahohoo dodow|nhwe',
      'izibalo|izivakashi ezingaki|ukuchofoza',
    ],
    answer: 'Analytics shows visits, taps and where visitors came from, for each page and link.',
    links: [{ label: 'Open Analytics', to: '/app/analytics' }],
  },
  {
    id: 'forms',
    words: [
      'form|forms|survey|questionnaire|registration form|sign up form',
      'form|forms|survey',
      'fọọmu|iwadi',
      'fom|tambayoyi',
      'fọm|ajụjụ',
      'fomu|dodoso',
      'krataa a wohye mu|form',
      'ifomu|inhlolovo',
    ],
    answer: 'Forms lets you collect sign-ups, orders, enquiries and payments. Responses arrive in the Forms inbox.',
    links: [{ label: 'Open Forms', to: '/app/forms' }],
  },
  {
    id: 'whatsapp',
    words: [
      'connect whatsapp|link whatsapp|whatsapp business|whatsapp number',
      'connect whatsapp|whatsapp business|my whatsapp',
      'so whatsapp po|whatsapp mi',
      'hada whatsapp|whatsapp dina',
      'jikọọ whatsapp|whatsapp m',
      'unganisha whatsapp|whatsapp yangu',
      'ka whatsapp bo ho|me whatsapp',
      'xhuma i whatsapp|i whatsapp yami',
    ],
    answer: 'Connect your WhatsApp business number in WhatsApp, so orders and enquiries from your page come straight to your chats.',
    links: [{ label: 'Open WhatsApp', to: '/app/whatsapp' }],
  },
  {
    id: 'pricing',
    words: [
      'price of kubicu|how much is kubicu|how much does it cost|pricing|plans|subscription|is it free|upgrade|creator plan',
      'how much e cost|pricing|plans|e free',
      'elo ni|owo melo ni|se ofe ni',
      'nawa ne|farashin kubicu|kyauta ne',
      'ego ole|ọ bụ n efu',
      'bei gani|inagharimu kiasi gani|ni bure',
      'eye sen|eye kwa',
      'kubiza malini|mahhala yini',
    ],
    answer: 'You can start free. Paid plans add things like your own domain and lower fees — Pricing compares them all.',
    links: [{ label: 'See pricing', to: '/pricing' }],
  },
  {
    id: 'team',
    words: [
      'team|staff|teammate|teammates|invite someone|add someone|add my staff|employee',
      'my staff|my workers|add person|invite person',
      'osise mi|egbe mi|pe enikan',
      'maaikatana|gayyaci wani',
      'ndị ọrụ m|kpọọ mmadụ',
      'wafanyakazi|timu|alika mtu',
      'adwumayefo|to nsa fre obi',
      'abasebenzi|ithimba|mema othile',
    ],
    answer: 'Invite teammates in Settings, under Team, and choose what each person can see and do.',
    links: [{ label: 'Open Settings', to: '/app/settings' }],
  },
  {
    id: 'account',
    words: [
      'password|sign in|log in|login|my account|change language|language|delete account',
      'password|login|my account|language',
      'ọrọ igbaniwọle|wọle|akaunti mi|ede',
      'kalmar sirri|shiga|asusuna|harshe',
      'okwuntughe|banye|akaụntụ m|asụsụ',
      'nenosiri|kuingia|akaunti yangu|lugha',
      'password|kɔ mu|me akawnt|kasa',
      'iphasiwedi|ngena|i akhawunti yami|ulimi',
    ],
    answer: 'Your password, sign-in and language are in Account settings. You can also change the language from the picker at the top of any screen.',
    links: [{ label: 'Open Account settings', to: '/app/account' }],
  },
  {
    id: 'coach',
    words: [
      'grow my business|more customers|more sales|marketing|advice|business advice|sell more',
      'grow my business|more customers|more sales|advice',
      'mu owo mi gbooro|onibara si|imoran',
      'bunkasa kasuwanci|karin kwastomomi|shawara',
      'tolite azụmahịa m|ndị ahịa ọzọ|ndụmọdụ',
      'kukuza biashara|wateja zaidi|ushauri',
      'ma me adwuma nkɔ so|adetɔfo pii|afotu',
      'ukukhulisa ibhizinisi|amakhasimende amaningi|iseluleko',
    ],
    answer: 'For advice on growing your business, Business Coach is the better place — it looks at your own numbers and suggests next steps.',
    links: [{ label: 'Open Business Coach', to: '/app/coach' }],
  },
  {
    id: 'help',
    words: [
      'help centre|help center|support|customer care|talk to someone|talk to a person|human|contact kubicu|complaint',
      'customer care|support|talk to person|complain',
      'iranlọwọ|ba enikan soro|ẹdun',
      'taimako|yi magana da mutum|koke',
      'enyemaka|gwa mmadụ okwu|mkpesa',
      'msaada|ongea na mtu|malalamiko',
      'mmoa|ne obi nkasa|anwiinwii',
      'usizo|khuluma nomuntu|isikhalazo',
    ],
    answer: 'The Help centre has step-by-step guides, and from there you can reach our support team.',
    links: [{ label: 'Open the Help centre', to: '/about/help' }],
  },
];

/** Words that make a message a question, not a description. English counts at the start; other languages anywhere. */
export const copilotQuestionWords: UnderstandRow = [
  'how|where|what|why|when|which|who|can i|can you|do you|does|is there|is it|should i',
  'how|wetin|where|why|when|which|who|i fit|you fit|abeg how',
  'bawo|nibo|kini|ki ni|kilode|nigba wo|ewo|tani|se mo le',
  'yaya|ina|me|meye|wane|yaushe|wanne|zan iya|shin',
  'kedu|ebee|gini|olee|mgbe ole|onye|enwere m ike',
  'vipi|namna gani|wapi|nini|kwa nini|lini|ipi|nani|naweza',
  'sen|ehe|deen|aden|daben|hwan|metumi',
  'kanjani|kuphi|yini|kungani|nini|yiphi|ubani|ngingakwazi',
];

/** D521: before an answer taken from a Help centre guide. Guides stay in English on purpose. */
export const COPILOT_GUIDE_LEAD = 'Here’s what the Help centre guide says:';
export const COPILOT_UNKNOWN_ANSWER = 'I’m not sure about that one yet, and I’d rather not guess. The Help centre has guides on everything in KUBICU.';
export const COPILOT_ANSWER_THEN_KIND = 'Want a page too? Tell me what you’re creating, or pick one below.';
export const COPILOT_ANSWER_THEN_QUESTION = 'Back to your page:';
export const COPILOT_ANSWER_THEN_DRAFT = 'Your draft is still here — carry on whenever you’re ready.';
