/*
 * Outside services KUBICU can plug into (D192). Placeholder adapters: connecting stores test
 * credentials in this browser, checks their format, and simulates every call — nothing is sent to
 * the provider. Real adapters replace `utils/providers/adapters.ts` without changing these screens.
 */

export type ProviderCategory = 'payments' | 'sms' | 'whatsapp' | 'email' | 'dns' | 'storage';

export interface ProviderField {
  key: string;
  label: string;
  placeholder?: string;
  secret?: boolean;
  optional?: boolean;
  hint?: string;
  /** Shape check only — the format the provider issues. */
  pattern?: RegExp;
  patternMessage?: string;
  /** Matches a live/production key, which the prototype refuses. */
  livePattern?: RegExp;
}

export interface ProviderDef {
  id: string;
  name: string;
  category: ProviderCategory;
  blurb: string;
  /** Short facts shown on the card, e.g. payment methods or regions. */
  tags: string[];
  fields: ProviderField[];
  /** Where an owner finds the keys. */
  whereToFind: string;
  /** Built in and always on (browser storage). */
  builtIn?: boolean;
}

export const categoryInfo: Record<ProviderCategory, { label: string; description: string }> = {
  payments: { label: 'Payments', description: 'Takes card, transfer, USSD and mobile money payments at checkout.' },
  sms: { label: 'SMS', description: 'Order updates, booking reminders and sign-in codes by text.' },
  whatsapp: { label: 'WhatsApp', description: 'Order updates and reminders on WhatsApp Business.' },
  email: { label: 'Email', description: 'Receipts, confirmations and sign-in codes by email.' },
  dns: { label: 'Domains & DNS', description: 'Adds the records for a custom domain for you, instead of by hand.' },
  storage: { label: 'File storage', description: 'Where uploaded photos, files and digital products are kept.' },
};

const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const e164 = /^\+[1-9]\d{7,14}$/;
const awsKey = { key: 'accessKeyId', label: 'Access key ID', placeholder: 'AKIA…', pattern: /^AKIA[0-9A-Z]{16}$/, patternMessage: 'Starts with AKIA, then 16 capital letters or digits.' };
const awsSecret = { key: 'secretAccessKey', label: 'Secret access key', secret: true, pattern: /^[A-Za-z0-9/+=]{40}$/, patternMessage: '40 characters.' };

export const providers: ProviderDef[] = [
  // ——— Payments (connected from Commerce → Payments) ———
  {
    id: 'paystack',
    name: 'Paystack',
    category: 'payments',
    blurb: 'Cards, bank transfer, USSD and Apple Pay for Nigerian businesses.',
    tags: ['Card', 'Bank transfer', 'USSD', 'Apple Pay'],
    whereToFind: 'Paystack dashboard → Settings → API Keys & Webhooks. Use the Test keys.',
    fields: [
      { key: 'publicKey', label: 'Test public key', placeholder: 'pk_test_…', pattern: /^pk_(test|live)_[A-Za-z0-9]{20,}$/, patternMessage: 'Starts with pk_test_.', livePattern: /^pk_live_/ },
      { key: 'secretKey', label: 'Test secret key', placeholder: 'sk_test_…', secret: true, pattern: /^sk_(test|live)_[A-Za-z0-9]{20,}$/, patternMessage: 'Starts with sk_test_.', livePattern: /^sk_live_/ },
    ],
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    category: 'payments',
    blurb: 'Cards, bank transfer, USSD and mobile money across Africa.',
    tags: ['Card', 'Bank transfer', 'USSD', 'Mobile money'],
    whereToFind: 'Flutterwave dashboard → Settings → API Keys, with Test mode switched on.',
    fields: [
      { key: 'publicKey', label: 'Test public key', placeholder: 'FLWPUBK_TEST-…-X', pattern: /^FLWPUBK(_TEST)?-[A-Za-z0-9]{16,}-X$/, patternMessage: 'Looks like FLWPUBK_TEST-…-X.', livePattern: /^FLWPUBK-/ },
      { key: 'secretKey', label: 'Test secret key', placeholder: 'FLWSECK_TEST-…-X', secret: true, pattern: /^FLWSECK(_TEST)?-[A-Za-z0-9]{16,}-X$/, patternMessage: 'Looks like FLWSECK_TEST-…-X.', livePattern: /^FLWSECK-/ },
    ],
  },
  {
    id: 'monnify',
    name: 'Monnify',
    category: 'payments',
    blurb: 'Bank transfer to reserved accounts, cards and USSD.',
    tags: ['Bank transfer', 'Card', 'USSD'],
    whereToFind: 'Monnify dashboard → Developer → API Keys & Contracts (sandbox).',
    fields: [
      { key: 'apiKey', label: 'Sandbox API key', placeholder: 'MK_TEST_…', pattern: /^MK_(TEST|PROD)_[A-Z0-9]{8,}$/, patternMessage: 'Starts with MK_TEST_.', livePattern: /^MK_PROD_/ },
      { key: 'secretKey', label: 'Secret key', secret: true, pattern: /^[A-Za-z0-9]{16,}$/, patternMessage: 'At least 16 letters or digits.' },
      { key: 'contractCode', label: 'Contract code', placeholder: '1234567890', pattern: /^\d{8,12}$/, patternMessage: '8 to 12 digits.' },
    ],
  },
  // Mobile money for Kenya and Ghana (D355). Simulated like every provider here.
  {
    id: 'mpesa-daraja',
    name: 'M-Pesa (Daraja)',
    category: 'payments',
    blurb: 'M-Pesa payment requests (STK push) for Kenyan businesses, through Safaricom’s Daraja API.',
    tags: ['Kenya', 'Mobile money', 'STK push'],
    whereToFind: 'Safaricom Daraja portal → My Apps → your sandbox app. Use the sandbox consumer key and secret, and test shortcode 174379.',
    fields: [
      { key: 'consumerKey', label: 'Sandbox consumer key', pattern: /^[A-Za-z0-9]{20,}$/, patternMessage: 'At least 20 letters or digits.' },
      { key: 'consumerSecret', label: 'Sandbox consumer secret', secret: true, pattern: /^[A-Za-z0-9]{12,}$/, patternMessage: 'At least 12 letters or digits.' },
      { key: 'shortcode', label: 'Paybill or till number', placeholder: '174379', pattern: /^\d{5,7}$/, patternMessage: '5 to 7 digits.' },
    ],
  },
  {
    id: 'mtn-momo',
    name: 'MTN MoMo',
    category: 'payments',
    blurb: 'MTN Mobile Money payment requests for Ghanaian businesses, through the MoMo Collections API.',
    tags: ['Ghana', 'Mobile money', 'Request to pay'],
    whereToFind: 'MTN MoMo developer portal → Subscriptions → Collections. Create a sandbox API user and key.',
    fields: [
      { key: 'subscriptionKey', label: 'Collections subscription key', secret: true, pattern: /^[a-f0-9]{32}$/, patternMessage: '32 letters (a–f) or digits.' },
      { key: 'apiUser', label: 'Sandbox API user', placeholder: 'a UUID', pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, patternMessage: 'A UUID like 3f2b…-…' },
      { key: 'apiKey', label: 'Sandbox API key', secret: true, pattern: /^[a-f0-9]{32}$/, patternMessage: '32 letters (a–f) or digits.' },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'payments',
    blurb: 'International cards for buyers abroad. Settles in foreign currency.',
    tags: ['Card', 'Apple Pay', 'Google Pay'],
    whereToFind: 'Stripe dashboard → Developers → API keys, in Test mode.',
    fields: [
      { key: 'publicKey', label: 'Test publishable key', placeholder: 'pk_test_…', pattern: /^pk_(test|live)_[A-Za-z0-9]{20,}$/, patternMessage: 'Starts with pk_test_.', livePattern: /^pk_live_/ },
      { key: 'secretKey', label: 'Test secret key', placeholder: 'sk_test_…', secret: true, pattern: /^sk_(test|live)_[A-Za-z0-9]{20,}$/, patternMessage: 'Starts with sk_test_.', livePattern: /^sk_live_/ },
    ],
  },

  // ——— SMS ———
  {
    id: 'termii',
    name: 'Termii',
    category: 'sms',
    blurb: 'Nigerian SMS with registered sender IDs and DND-safe routes.',
    tags: ['Nigeria', 'Sender ID', 'OTP'],
    whereToFind: 'Termii dashboard → API Settings. Sender IDs need approval first.',
    fields: [
      { key: 'apiKey', label: 'API key', secret: true, pattern: /^[A-Za-z0-9$]{20,}$/, patternMessage: 'At least 20 characters.' },
      { key: 'senderId', label: 'Sender ID', placeholder: 'ADAEZE', pattern: /^[A-Za-z0-9]{3,11}$/, patternMessage: '3 to 11 letters or digits, no spaces.' },
    ],
  },
  {
    id: 'twilio-sms',
    name: 'Twilio',
    category: 'sms',
    blurb: 'Global SMS from a Twilio number.',
    tags: ['Global', 'OTP'],
    whereToFind: 'Twilio Console → Account info. Use a test Account SID for trying it.',
    fields: [
      { key: 'accountSid', label: 'Account SID', placeholder: 'AC…', pattern: /^AC[a-f0-9]{32}$/, patternMessage: 'AC followed by 32 lowercase letters or digits.' },
      { key: 'authToken', label: 'Auth token', secret: true, pattern: /^[a-f0-9]{32}$/, patternMessage: '32 lowercase letters or digits.' },
      { key: 'from', label: 'From number', placeholder: '+15005550006', pattern: e164, patternMessage: 'International format, e.g. +2348031234567.' },
    ],
  },
  {
    id: 'africastalking',
    name: 'Africa’s Talking',
    category: 'sms',
    blurb: 'SMS across African networks, with a free sandbox.',
    tags: ['Africa', 'Sandbox'],
    whereToFind: 'Africa’s Talking → Sandbox app → Settings → API Key. The username is “sandbox”.',
    fields: [
      { key: 'username', label: 'Username', placeholder: 'sandbox', pattern: /^[a-z0-9_-]{3,}$/i, patternMessage: 'Your app username, e.g. sandbox.' },
      { key: 'apiKey', label: 'API key', secret: true, pattern: /^[A-Za-z0-9]{32,}$/, patternMessage: 'At least 32 letters or digits.' },
    ],
  },

  // ——— WhatsApp ———
  {
    id: 'meta-whatsapp',
    name: 'WhatsApp Cloud API (Meta)',
    category: 'whatsapp',
    blurb: 'Message customers from your WhatsApp Business number, with approved templates.',
    tags: ['Templates', 'Official'],
    whereToFind: 'Meta for Developers → your app → WhatsApp → API Setup.',
    fields: [
      { key: 'phoneNumberId', label: 'Phone number ID', placeholder: '1234567890123', pattern: /^\d{10,20}$/, patternMessage: '10 to 20 digits.' },
      { key: 'accessToken', label: 'Access token', secret: true, placeholder: 'EAA…', pattern: /^EAA[A-Za-z0-9]{20,}$/, patternMessage: 'Starts with EAA.' },
    ],
  },
  {
    id: 'twilio-whatsapp',
    name: 'Twilio for WhatsApp',
    category: 'whatsapp',
    blurb: 'WhatsApp through Twilio, using the same account as SMS.',
    tags: ['Sandbox', 'Templates'],
    whereToFind: 'Twilio Console → Messaging → Try it out → Send a WhatsApp message.',
    fields: [
      { key: 'accountSid', label: 'Account SID', placeholder: 'AC…', pattern: /^AC[a-f0-9]{32}$/, patternMessage: 'AC followed by 32 lowercase letters or digits.' },
      { key: 'authToken', label: 'Auth token', secret: true, pattern: /^[a-f0-9]{32}$/, patternMessage: '32 lowercase letters or digits.' },
      { key: 'from', label: 'WhatsApp number', placeholder: '+14155238886', pattern: e164, patternMessage: 'International format, e.g. +14155238886.' },
    ],
  },

  // ——— Email ———
  {
    id: 'resend',
    name: 'Resend',
    category: 'email',
    blurb: 'Transactional email from your own domain.',
    tags: ['Your domain', 'Receipts'],
    whereToFind: 'Resend → API Keys. Verify your sending domain under Domains.',
    fields: [
      { key: 'apiKey', label: 'API key', secret: true, placeholder: 're_…', pattern: /^re_[A-Za-z0-9_]{16,}$/, patternMessage: 'Starts with re_.' },
      { key: 'from', label: 'Send from', placeholder: 'orders@adaeze.com', pattern: email, patternMessage: 'An email address on your verified domain.' },
    ],
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'email',
    blurb: 'Transactional and marketing email at volume.',
    tags: ['Volume', 'Templates'],
    whereToFind: 'SendGrid → Settings → API Keys → Create (Mail Send access).',
    fields: [
      { key: 'apiKey', label: 'API key', secret: true, placeholder: 'SG.…', pattern: /^SG\.[\w-]{16,}\.[\w-]{16,}$/, patternMessage: 'Looks like SG.xxxx.yyyy.' },
      { key: 'from', label: 'Send from', placeholder: 'orders@adaeze.com', pattern: email, patternMessage: 'A verified sender address.' },
    ],
  },
  {
    id: 'amazon-ses',
    name: 'Amazon SES',
    category: 'email',
    blurb: 'Low-cost email through your AWS account.',
    tags: ['AWS', 'Low cost'],
    whereToFind: 'AWS console → IAM → a user with SES send access → Security credentials.',
    fields: [
      awsKey,
      awsSecret,
      { key: 'region', label: 'Region', placeholder: 'eu-west-1', pattern: /^[a-z]{2}-[a-z]+-\d$/, patternMessage: 'Like eu-west-1.' },
      { key: 'from', label: 'Send from', placeholder: 'orders@adaeze.com', pattern: email, patternMessage: 'A verified identity in SES.' },
    ],
  },

  // ——— Domains & DNS ———
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    category: 'dns',
    blurb: 'Adds the records in your Cloudflare zone, set to DNS only.',
    tags: ['DNS', 'Free plan'],
    whereToFind: 'Cloudflare → My Profile → API Tokens → Create Token → “Edit zone DNS”.',
    fields: [{ key: 'apiToken', label: 'API token', secret: true, pattern: /^[A-Za-z0-9_-]{40}$/, patternMessage: '40 characters.' }],
  },
  {
    id: 'hostinger',
    name: 'Hostinger',
    category: 'dns',
    blurb: 'Adds the records to a domain bought or managed at Hostinger.',
    tags: ['DNS', 'Registrar'],
    whereToFind: 'Hostinger hPanel → Profile → API → Generate token.',
    fields: [{ key: 'apiToken', label: 'API token', secret: true, pattern: /^[A-Za-z0-9]{32,}$/, patternMessage: 'At least 32 letters or digits.' }],
  },
  {
    id: 'namecheap',
    name: 'Namecheap',
    category: 'dns',
    blurb: 'Adds the records to a Namecheap domain. Needs API access switched on.',
    tags: ['DNS', 'Registrar'],
    whereToFind: 'Namecheap → Profile → Tools → API Access. Whitelist KUBICU’s address.',
    fields: [
      { key: 'apiUser', label: 'API user', pattern: /^[A-Za-z0-9_-]{3,}$/, patternMessage: 'Your Namecheap username.' },
      { key: 'apiKey', label: 'API key', secret: true, pattern: /^[a-f0-9]{32}$/, patternMessage: '32 lowercase letters or digits.' },
    ],
  },
  {
    id: 'godaddy',
    name: 'GoDaddy',
    category: 'dns',
    blurb: 'Adds the records to a GoDaddy domain.',
    tags: ['DNS', 'Registrar'],
    whereToFind: 'developer.godaddy.com → API Keys → Create (OTE for testing).',
    fields: [
      { key: 'apiKey', label: 'API key', pattern: /^[A-Za-z0-9_]{20,}$/, patternMessage: 'At least 20 characters.' },
      { key: 'apiSecret', label: 'API secret', secret: true, pattern: /^[A-Za-z0-9]{16,}$/, patternMessage: 'At least 16 letters or digits.' },
    ],
  },

  // ——— Storage ———
  {
    id: 'browser',
    name: 'This browser',
    category: 'storage',
    blurb: 'Files stay on this device. Fine for trying KUBICU; nobody else can see them.',
    tags: ['Built in', 'This device only'],
    whereToFind: 'Nothing to set up.',
    builtIn: true,
    fields: [],
  },
  {
    id: 'amazon-s3',
    name: 'Amazon S3',
    category: 'storage',
    blurb: 'Your own S3 bucket. Files are served through KUBICU links.',
    tags: ['AWS', 'Your bucket'],
    whereToFind: 'AWS console → S3 → your bucket; IAM user with access to only that bucket.',
    fields: [
      { key: 'bucket', label: 'Bucket name', placeholder: 'adaeze-kubicu', pattern: /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/, patternMessage: '3–63 lowercase letters, digits, dots or dashes.' },
      { key: 'region', label: 'Region', placeholder: 'eu-west-1', pattern: /^[a-z]{2}-[a-z]+-\d$/, patternMessage: 'Like eu-west-1.' },
      awsKey,
      awsSecret,
    ],
  },
  {
    id: 'cloudflare-r2',
    name: 'Cloudflare R2',
    category: 'storage',
    blurb: 'S3-compatible storage with no download fees.',
    tags: ['No egress fees', 'Your bucket'],
    whereToFind: 'Cloudflare → R2 → Manage R2 API Tokens → Create API token.',
    fields: [
      { key: 'accountId', label: 'Account ID', pattern: /^[a-f0-9]{32}$/, patternMessage: '32 lowercase letters or digits.' },
      { key: 'bucket', label: 'Bucket name', placeholder: 'adaeze-media', pattern: /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/, patternMessage: '3–63 lowercase letters, digits or dashes.' },
      { key: 'accessKeyId', label: 'Access key ID', pattern: /^[a-f0-9]{32}$/, patternMessage: '32 lowercase letters or digits.' },
      { key: 'secretAccessKey', label: 'Secret access key', secret: true, pattern: /^[a-f0-9]{64}$/, patternMessage: '64 lowercase letters or digits.' },
    ],
  },
];

export const providersIn = (c: ProviderCategory) => providers.filter((p) => p.category === c);
export const providerById = (id: string | null | undefined) => providers.find((p) => p.id === id);

/** Which DNS integration handles a registrar picked in the Connect domain dialog. */
export const registrarProvider: Record<string, string> = { cloudflare: 'cloudflare', hostinger: 'hostinger', namecheap: 'namecheap', godaddy: 'godaddy' };
