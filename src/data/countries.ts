import type { CountryCode, CountryInfo } from '../types/country';
import { figure, onOpsSettings } from '../utils/opsSettings';

/**
 * Everything that changes by country (D352). One table, so currency, phone numbers, regions, banks and
 * checkout options always agree. Banks, VAT and mobile money are example figures for the prototype —
 * real partners and tax rules need the founder (DECISIONS_FOR_SIGNOFF Group F).
 */
export const countries: CountryInfo[] = [
{
  code: 'NG',
  name: 'Nigeria',
  currency: 'NGN',
  dialCode: '234',
  nationalLength: 10,
  phoneExample: '0803 123 4567',
  regionLabel: 'State',
  regions: [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta',
  'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'],

  defaultRegion: 'Lagos',
  banks: [
  'Access Bank', 'Citibank', 'Ecobank', 'Fidelity Bank', 'First Bank', 'FCMB', 'Globus Bank', 'GTBank', 'Heritage Bank', 'Jaiz Bank',
  'Keystone Bank', 'Kuda', 'Lotus Bank', 'Moniepoint', 'OPay', 'PalmPay', 'Parallex Bank', 'Polaris Bank', 'Providus Bank', 'Stanbic IBTC',
  'Standard Chartered', 'Sterling Bank', 'SunTrust Bank', 'Titan Trust Bank', 'Union Bank', 'UBA', 'Unity Bank', 'VFD Microfinance Bank', 'Wema Bank', 'Zenith Bank'],

  accountNumber: { min: 10, max: 10, label: '10 digits' },
  payments: ['card', 'transfer', 'ussd', 'pay_on_delivery', 'instalments'],
  mobileMoney: null,
  vatPct: 7.5,
  dataPerGb: 650,
  localLanguage: { code: 'yo', name: 'Yorùbá' },
  mainCity: 'Lagos'
},
{
  code: 'KE',
  name: 'Kenya',
  currency: 'KES',
  dialCode: '254',
  nationalLength: 9,
  phoneExample: '0712 345 678',
  regionLabel: 'County',
  regions: [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
  'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
  'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang’a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
  'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'],

  defaultRegion: 'Nairobi',
  banks: [
  'Absa Bank Kenya', 'Bank of Africa Kenya', 'Co-operative Bank', 'Diamond Trust Bank', 'Equity Bank', 'Family Bank',
  'I&M Bank', 'KCB Bank', 'NCBA Bank', 'Prime Bank', 'Stanbic Bank Kenya', 'Standard Chartered Kenya'],

  accountNumber: { min: 10, max: 16, label: '10–16 digits' },
  payments: ['mpesa', 'card'],
  // Paybill number is an example (D433).
  mobileMoney: { id: 'mpesa', name: 'M-Pesa', approveHint: 'enter your M-Pesa PIN', paybill: '522 533', codeLabel: 'M-Pesa code', payoutArrival: 'within minutes' },
  vatPct: 16,
  dataPerGb: 100,
  localLanguage: { code: 'sw', name: 'Kiswahili' },
  mainCity: 'Nairobi'
},
{
  code: 'GH',
  name: 'Ghana',
  currency: 'GHS',
  dialCode: '233',
  nationalLength: 9,
  phoneExample: '024 123 4567',
  regionLabel: 'Region',
  regions: [
  'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'North East',
  'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Volta', 'Western', 'Western North'],

  defaultRegion: 'Greater Accra',
  banks: [
  'Absa Bank Ghana', 'Access Bank Ghana', 'Agricultural Development Bank', 'CalBank', 'Consolidated Bank Ghana', 'Ecobank Ghana',
  'Fidelity Bank Ghana', 'GCB Bank', 'Republic Bank Ghana', 'Stanbic Bank Ghana', 'Standard Chartered Ghana', 'Zenith Bank Ghana'],

  accountNumber: { min: 10, max: 16, label: '10–16 digits' },
  payments: ['momo', 'card'],
  // MTN, Telecel and AirtelTigo (D433). Number starts are examples to confirm with the partner.
  mobileMoney: {
    id: 'momo',
    name: 'Mobile money',
    approveHint: 'enter your mobile money PIN',
    codeLabel: 'Transaction ID',
    payoutArrival: 'within minutes',
    networks: [
    { id: 'mtn', name: 'MTN MoMo', approveHint: 'enter your MoMo PIN', prefixes: ['024', '025', '053', '054', '055', '059'] },
    { id: 'telecel', name: 'Telecel Cash', approveHint: 'enter your Telecel Cash PIN', prefixes: ['020', '050'], voucher: true },
    { id: 'airteltigo', name: 'AirtelTigo Money', approveHint: 'enter your AirtelTigo Money PIN', prefixes: ['026', '027', '056', '057'] }]

  },
  vatPct: 15,
  dataPerGb: 10,
  localLanguage: { code: 'tw', name: 'Twi' },
  mainCity: 'Accra'
},
{
  code: 'ZA',
  name: 'South Africa',
  currency: 'ZAR',
  dialCode: '27',
  nationalLength: 9,
  phoneExample: '082 123 4567',
  regionLabel: 'Province',
  regions: ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'],
  defaultRegion: 'Gauteng',
  banks: ['Absa', 'African Bank', 'Bank Zero', 'Capitec', 'Discovery Bank', 'FNB', 'Investec', 'Nedbank', 'Standard Bank', 'TymeBank'],
  accountNumber: { min: 9, max: 11, label: '9–11 digits' },
  payments: ['card', 'eft'],
  mobileMoney: null,
  vatPct: 15,
  dataPerGb: 50,
  localLanguage: { code: 'zu', name: 'isiZulu' },
  mainCity: 'Johannesburg'
}];


export const countryCodes: CountryCode[] = countries.map((c) => c.code);

// Data price per GB is an example figure staff can change in Figures & names (D466).
onOpsSettings(() => {
  countries.forEach((c) => {
    c.dataPerGb = figure(`data.${c.code}.perGb`);
  });
});

/** The plain English names of each checkout option, for settings and the staff console. */
export const paymentOptionLabels = {
  card: 'Card',
  transfer: 'Bank transfer',
  ussd: 'USSD',
  pay_on_delivery: 'Pay on delivery',
  instalments: 'Pay in instalments',
  mpesa: 'M-Pesa',
  momo: 'MTN MoMo',
  eft: 'EFT bank transfer'
} as const;