import type { CountryCode } from '../types/country';
import type { EntityType, IdType, KycAddress, KycDeclarations } from '../types/kyc';

/**
 * Seller verification rules per country (D424). The flow, steps and storage stay the same everywhere; what each
 * country's partner checks against — national ID, tax number, business registry — comes from here.
 * `primary` is stored in `identity.bvn` (and each person's `bvn`), `secondary` in `identity.nin`; the field names
 * are kept from the Nigeria-only version so saved cases still load. Patterns and registries are example rules for
 * the prototype and need confirming with each country's licensed partner before launch.
 */

export interface IdNumberRule {
  label: string;
  hint: string;
  placeholder: string;
  pattern: RegExp;
  /** Shown when the format is wrong. */
  formatError: string;
  /** Shown when the partner's register doesn't match. */
  mismatch: string;
  maxLength: number;
  numeric: boolean;
}

export interface KycCountryRules {
  /** "Checked with … through our partner." line under Identity numbers. */
  checkedWith: string;
  primary: IdNumberRule;
  secondary: IdNumberRule | null;
  legalNameHint: string;
  legalNameError: string;
  /** "Name on BVN: {name}" in Nigeria. */
  nameOnRecord: string;
  identityHint: string;
  idTypes: {value: IdType;label: string;}[];
  /** ID types that carry an expiry date. */
  expiring: IdType[];
  officialLetter: string;
  addressPlaceholder: string;
  registry: {
    /** Short name used in labels: CAC, BRS, ORC, CIPC. */
    short: string;
    heading: string;
    nameHint: string;
    nameError: string;
    companyLabel: string;
    companyPlaceholder: string;
    companyPattern: RegExp;
    companyError: string;
    bnLabel: string;
    bnPlaceholder: string;
    bnPattern: RegExp;
    bnError: string;
    notFound: string;
    certificate: string;
    certificateError: string;
    companyRecord: string;
    companyRecordHint: string;
    companyRecordError: string;
    bnRecord: string;
    bnRecordHint: string;
    bnRecordError: string;
    constitution: string;
    constitutionError: string;
    simulated: string;
    peopleCompany: string;
    peopleBn: string;
  };
  tax: {label: string;placeholder: string;pattern: RegExp;error: string;badge: string;};
  entities: Record<EntityType, {label: string;short: string;blurb: string;needs: string[];}>;
  notSure: string;
  consent: string;
  volume: Record<Exclude<KycDeclarations['monthlyVolume'], ''>, string>;
  describeExample: string;
}

const proofBase: Omit<Record<KycAddress['proofType'], string>, 'lga_letter'> = {
  utility: 'Utility bill (last 3 months)',
  bank_statement: 'Bank statement (last 3 months)',
  tenancy: 'Tenancy agreement'
};

export const proofLabelsFor = (r: KycCountryRules): Record<KycAddress['proofType'], string> => ({ ...proofBase, lga_letter: r.officialLetter });

const simulatedIds = 'Prototype: numbers ending in 0000 fail; ending in 9 need a closer look.';

export const kycCountries: Record<CountryCode, KycCountryRules> = {
  NG: {
    checkedWith: 'Checked with NIBSS and NIMC through our partner. We only see whether your details match — never your bank balance.',
    primary: { label: 'BVN', hint: 'Dial *565*0# to get it.', placeholder: '', pattern: /^\d{11}$/, formatError: 'A BVN has 11 digits.', mismatch: 'This BVN didn’t match our partner’s records. Check the number.', maxLength: 11, numeric: true },
    secondary: { label: 'NIN', hint: 'On your NIN slip or the NIMC app.', placeholder: '', pattern: /^\d{11}$/, formatError: 'A NIN has 11 digits.', mismatch: 'This NIN didn’t match. Check the number.', maxLength: 11, numeric: true },
    legalNameHint: 'Exactly as registered with your bank (BVN).',
    legalNameError: 'Enter your first and last name exactly as on your BVN.',
    nameOnRecord: 'Name on BVN: {name}',
    identityHint: 'BVN, NIN, ID and selfie',
    idTypes: [
    { value: 'nin', label: 'NIN slip or card' },
    { value: 'passport', label: 'International passport' },
    { value: 'licence', label: 'Driver’s licence' },
    { value: 'voters', label: 'Voter’s card' }],

    expiring: ['passport', 'licence'],
    officialLetter: 'Letter from your LGA',
    addressPlaceholder: '12 Admiralty Way, Lekki Phase 1',
    registry: {
      short: 'CAC',
      heading: 'CAC registration',
      nameHint: 'Exactly as printed on your CAC certificate.',
      nameError: 'Enter the name exactly as on your CAC certificate.',
      companyLabel: 'RC number',
      companyPlaceholder: 'RC 1234567',
      companyPattern: /^(RC)?\s?\d{4,8}$/i,
      companyError: 'Enter your RC number, e.g. RC 1234567.',
      bnLabel: 'BN number',
      bnPlaceholder: 'BN 3456789',
      bnPattern: /^(BN)?\s?\d{4,8}$/i,
      bnError: 'Enter your BN number, e.g. BN 3456789.',
      notFound: 'We couldn’t find this number at CAC. Check it and try again.',
      certificate: 'CAC certificate',
      certificateError: 'Upload your CAC certificate.',
      companyRecord: 'CAC status report',
      companyRecordHint: 'Lists your directors and shareholders. Download it from the CAC portal.',
      companyRecordError: 'Upload a recent CAC status report.',
      bnRecord: 'BN application form (Form BN/1)',
      bnRecordHint: 'Shows the proprietors’ names and address.',
      bnRecordError: 'Upload your BN application form (Form BN/1).',
      constitution: 'Memorandum & articles of association',
      constitutionError: 'Upload your memorandum and articles of association.',
      simulated: 'Prototype: CAC numbers ending in 000 aren’t found; ending in 7 show as inactive.',
      peopleCompany: 'List every director, and anyone who owns or controls 25% or more of the company. They should match your CAC status report.',
      peopleBn: 'List every proprietor named on your BN registration.'
    },
    tax: { label: 'Tax ID (TIN)', placeholder: '12345678-0001', pattern: /^\d{8}-\d{4}$/, error: 'Enter your TIN, e.g. 12345678-0001.', badge: 'FIRS' },
    entities: {
      individual: { label: 'Individual or freelancer', short: 'Individual', blurb: 'You sell under your own name and aren’t registered with CAC.', needs: ['BVN and NIN', 'A government ID and a selfie', 'Proof of address', 'A bank account in your name'] },
      business_name: { label: 'Registered business name', short: 'Business name (BN)', blurb: 'Registered with CAC as a business name or sole proprietorship (BN number).', needs: ['Everything for individuals', 'CAC certificate and BN number', 'Proprietors listed', 'A bank account in the business name'] },
      company: { label: 'Limited company', short: 'Company (RC)', blurb: 'Registered with CAC as a limited liability company (RC number).', needs: ['The person applying: BVN, ID, selfie', 'CAC certificate, status report and MEMART', 'Directors and owners of 25% or more', 'A corporate bank account'] }
    },
    notSure: 'Not sure? If you have a CAC certificate, choose the type printed on it. Registered businesses get higher payout limits.',
    consent: 'I agree that KUBICU’s licensed payment partner can check these details with NIBSS, NIMC, CAC and FIRS, and keep the results as the law requires.',
    volume: { under_500k: 'Under ₦500,000', '500k_2m': '₦500,000 – ₦2 million', '2m_10m': '₦2 – 10 million', '10m_50m': '₦10 – 50 million', over_50m: 'Over ₦50 million' },
    describeExample: 'For example: “Made-to-order Ankara dresses, sold on Instagram and delivered across Lagos.”'
  },
  KE: {
    checkedWith: 'Checked with IPRS and KRA through our partner. We only see whether your details match — never your bank balance.',
    primary: { label: 'National ID number', hint: 'On the front of your Kenyan ID card.', placeholder: '12345678', pattern: /^\d{7,8}$/, formatError: 'A Kenyan ID number has 7 or 8 digits.', mismatch: 'This ID number didn’t match the national register. Check the number.', maxLength: 8, numeric: true },
    secondary: { label: 'KRA PIN', hint: 'On your KRA PIN certificate or in iTax.', placeholder: 'A123456789B', pattern: /^[AP]\d{9}[A-Z]$/i, formatError: 'A KRA PIN looks like A123456789B.', mismatch: 'This KRA PIN didn’t match. Check it.', maxLength: 11, numeric: false },
    legalNameHint: 'Exactly as on your national ID.',
    legalNameError: 'Enter your first and last name exactly as on your ID.',
    nameOnRecord: 'Name on record: {name}',
    identityHint: 'National ID, KRA PIN and selfie',
    idTypes: [
    { value: 'nin', label: 'National ID card' },
    { value: 'passport', label: 'Passport' },
    { value: 'licence', label: 'Driving licence' }],

    expiring: ['passport', 'licence'],
    officialLetter: 'Letter from your chief',
    addressPlaceholder: 'Ngong Road, Kilimani',
    registry: {
      short: 'BRS',
      heading: 'Business Registration Service (BRS)',
      nameHint: 'Exactly as printed on your BRS certificate.',
      nameError: 'Enter the name exactly as on your BRS certificate.',
      companyLabel: 'Company number',
      companyPlaceholder: 'PVT-AB1C2D3E',
      companyPattern: /^(PVT|CPR)-?[A-Z0-9]{6,10}$/i,
      companyError: 'Enter your company number, e.g. PVT-AB1C2D3E.',
      bnLabel: 'Business name number',
      bnPlaceholder: 'BN-XY12Z3A4',
      bnPattern: /^BN-?[A-Z0-9]{6,10}$/i,
      bnError: 'Enter your business name number, e.g. BN-XY12Z3A4.',
      notFound: 'We couldn’t find this number at BRS. Check it and try again.',
      certificate: 'Certificate of registration or incorporation',
      certificateError: 'Upload your certificate of registration or incorporation.',
      companyRecord: 'CR12 (directors and shareholders)',
      companyRecordHint: 'Lists your directors and shareholders. Request it on eCitizen.',
      companyRecordError: 'Upload a recent CR12.',
      bnRecord: 'Business name search (BN2)',
      bnRecordHint: 'Shows the proprietors’ names and address.',
      bnRecordError: 'Upload your business name search (BN2).',
      constitution: 'Memorandum & articles of association',
      constitutionError: 'Upload your memorandum and articles of association.',
      simulated: 'Prototype: registry numbers ending in 000 aren’t found; ending in 7 show as inactive.',
      peopleCompany: 'List every director, and anyone who owns or controls 25% or more of the company. They should match your CR12.',
      peopleBn: 'List every proprietor named on your business name registration.'
    },
    tax: { label: 'Company KRA PIN', placeholder: 'P051234567X', pattern: /^P\d{9}[A-Z]$/i, error: 'Enter the company’s KRA PIN, e.g. P051234567X.', badge: 'KRA' },
    entities: {
      individual: { label: 'Individual or freelancer', short: 'Individual', blurb: 'You sell under your own name and aren’t registered with BRS.', needs: ['National ID and KRA PIN', 'A government ID and a selfie', 'Proof of address', 'A bank or M-Pesa account in your name'] },
      business_name: { label: 'Registered business name', short: 'Business name (BN)', blurb: 'Registered with BRS as a business name or sole proprietorship.', needs: ['Everything for individuals', 'BRS certificate and business name number', 'Proprietors listed', 'An account in the business name'] },
      company: { label: 'Limited company', short: 'Company (PVT)', blurb: 'Registered with BRS as a private limited company.', needs: ['The person applying: ID, KRA PIN, selfie', 'Certificate of incorporation, CR12 and articles', 'Directors and owners of 25% or more', 'A company bank account'] }
    },
    notSure: 'Not sure? If you have a BRS certificate, choose the type printed on it. Registered businesses get higher payout limits.',
    consent: 'I agree that KUBICU’s licensed payment partner can check these details with IPRS, KRA and the Business Registration Service, and keep the results as the law requires.',
    volume: { under_500k: 'Under KSh 50,000', '500k_2m': 'KSh 50,000 – 200,000', '2m_10m': 'KSh 200,000 – 1 million', '10m_50m': 'KSh 1 – 5 million', over_50m: 'Over KSh 5 million' },
    describeExample: 'For example: “Made-to-order kitenge dresses, sold on Instagram and delivered across Nairobi.”'
  },
  GH: {
    checkedWith: 'Checked with the National Identification Authority and GRA through our partner. We only see whether your details match — never your bank balance.',
    primary: { label: 'Ghana Card number', hint: 'On the front of your Ghana Card. It’s also your tax number.', placeholder: 'GHA-123456789-0', pattern: /^GHA-?\d{9}-?\d$/i, formatError: 'A Ghana Card number looks like GHA-123456789-0.', mismatch: 'This Ghana Card number didn’t match the national register. Check it.', maxLength: 15, numeric: false },
    secondary: null,
    legalNameHint: 'Exactly as on your Ghana Card.',
    legalNameError: 'Enter your first and last name exactly as on your Ghana Card.',
    nameOnRecord: 'Name on record: {name}',
    identityHint: 'Ghana Card, ID and selfie',
    idTypes: [
    { value: 'nin', label: 'Ghana Card' },
    { value: 'passport', label: 'Passport' },
    { value: 'licence', label: 'Driver’s licence' },
    { value: 'voters', label: 'Voter ID card' }],

    expiring: ['nin', 'passport', 'licence'],
    officialLetter: 'Letter from your assembly member',
    addressPlaceholder: '12 Oxford Street, Osu',
    registry: {
      short: 'ORC',
      heading: 'Office of the Registrar of Companies (ORC)',
      nameHint: 'Exactly as printed on your ORC certificate.',
      nameError: 'Enter the name exactly as on your ORC certificate.',
      companyLabel: 'Company number',
      companyPlaceholder: 'CS123456789',
      companyPattern: /^C[SG]\d{6,9}$/i,
      companyError: 'Enter your company number, e.g. CS123456789.',
      bnLabel: 'Business name number',
      bnPlaceholder: 'BN123456789',
      bnPattern: /^BN\d{6,9}$/i,
      bnError: 'Enter your business name number, e.g. BN123456789.',
      notFound: 'We couldn’t find this number at the ORC. Check it and try again.',
      certificate: 'Certificate of registration or incorporation',
      certificateError: 'Upload your certificate of registration or incorporation.',
      companyRecord: 'Company profile (directors and shareholders)',
      companyRecordHint: 'Lists your directors and shareholders. Request it from the ORC.',
      companyRecordError: 'Upload a recent company profile from the ORC.',
      bnRecord: 'Business name registration form',
      bnRecordHint: 'Shows the proprietors’ names and address.',
      bnRecordError: 'Upload your business name registration form.',
      constitution: 'Company constitution',
      constitutionError: 'Upload your company constitution.',
      simulated: 'Prototype: registry numbers ending in 000 aren’t found; ending in 7 show as inactive.',
      peopleCompany: 'List every director, and anyone who owns or controls 25% or more of the company. They should match your company profile.',
      peopleBn: 'List every proprietor named on your business name registration.'
    },
    tax: { label: 'Company TIN', placeholder: 'C0012345678', pattern: /^C\d{10}$/i, error: 'Enter the company’s TIN, e.g. C0012345678.', badge: 'GRA' },
    entities: {
      individual: { label: 'Individual or freelancer', short: 'Individual', blurb: 'You sell under your own name and aren’t registered with the ORC.', needs: ['Ghana Card number', 'A government ID and a selfie', 'Proof of address', 'A bank or mobile money account in your name'] },
      business_name: { label: 'Registered business name', short: 'Business name (BN)', blurb: 'Registered with the ORC as a business name or sole proprietorship.', needs: ['Everything for individuals', 'ORC certificate and business name number', 'Proprietors listed', 'An account in the business name'] },
      company: { label: 'Limited company', short: 'Company (Ltd)', blurb: 'Registered with the ORC as a company limited by shares.', needs: ['The person applying: Ghana Card, ID, selfie', 'Certificate of incorporation, company profile and constitution', 'Directors and owners of 25% or more', 'A company bank account'] }
    },
    notSure: 'Not sure? If you have an ORC certificate, choose the type printed on it. Registered businesses get higher payout limits.',
    consent: 'I agree that KUBICU’s licensed payment partner can check these details with the National Identification Authority, GRA and the ORC, and keep the results as the law requires.',
    volume: { under_500k: 'Under GH₵ 5,000', '500k_2m': 'GH₵ 5,000 – 20,000', '2m_10m': 'GH₵ 20,000 – 100,000', '10m_50m': 'GH₵ 100,000 – 500,000', over_50m: 'Over GH₵ 500,000' },
    describeExample: 'For example: “Made-to-order kente dresses, sold on Instagram and delivered across Accra.”'
  },
  ZA: {
    checkedWith: 'Checked with Home Affairs and SARS through our partner. We only see whether your details match — never your bank balance.',
    primary: { label: 'SA ID number', hint: 'The 13-digit number on your smart ID card or green ID book.', placeholder: '9001015009087', pattern: /^\d{13}$/, formatError: 'A South African ID number has 13 digits.', mismatch: 'This ID number didn’t match Home Affairs. Check the number.', maxLength: 13, numeric: true },
    secondary: null,
    legalNameHint: 'Exactly as on your ID.',
    legalNameError: 'Enter your first and last name exactly as on your ID.',
    nameOnRecord: 'Name on record: {name}',
    identityHint: 'SA ID, photo ID and selfie',
    idTypes: [
    { value: 'nin', label: 'Smart ID card or green ID book' },
    { value: 'passport', label: 'Passport' },
    { value: 'licence', label: 'Driving licence' }],

    expiring: ['passport', 'licence'],
    officialLetter: 'Letter from your ward councillor',
    addressPlaceholder: '12 Jan Smuts Avenue, Rosebank',
    registry: {
      short: 'CIPC',
      heading: 'CIPC registration',
      nameHint: 'Exactly as printed on your CIPC certificate.',
      nameError: 'Enter the name exactly as on your CIPC certificate.',
      companyLabel: 'Registration number',
      companyPlaceholder: '2020/123456/07',
      companyPattern: /^\d{4}\/\d{6}\/0[67]$/,
      companyError: 'Enter your registration number, e.g. 2020/123456/07.',
      bnLabel: 'CK number',
      bnPlaceholder: '1998/123456/23',
      bnPattern: /^(CK)?\s?\d{4}\/\d{6}\/23$/i,
      bnError: 'Enter your CK number, e.g. 1998/123456/23.',
      notFound: 'We couldn’t find this number at CIPC. Check it and try again.',
      certificate: 'CIPC registration certificate (CoR 14.3)',
      certificateError: 'Upload your CIPC registration certificate.',
      companyRecord: 'CIPC disclosure certificate',
      companyRecordHint: 'Lists your directors. Download it from the CIPC website.',
      companyRecordError: 'Upload a recent CIPC disclosure certificate.',
      bnRecord: 'Founding statement (CK1)',
      bnRecordHint: 'Shows the members’ names and their interest.',
      bnRecordError: 'Upload your founding statement (CK1).',
      constitution: 'Memorandum of incorporation (MOI)',
      constitutionError: 'Upload your memorandum of incorporation.',
      simulated: 'Prototype: registration numbers ending in 000 aren’t found; ending in 7 show as inactive.',
      peopleCompany: 'List every director, and anyone who owns or controls 25% or more of the company. They should match your CIPC disclosure certificate.',
      peopleBn: 'List every member named on your founding statement.'
    },
    tax: { label: 'Income tax number', placeholder: '9012345678', pattern: /^\d{10}$/, error: 'Enter the 10-digit SARS income tax number.', badge: 'SARS' },
    entities: {
      individual: { label: 'Individual or sole proprietor', short: 'Individual', blurb: 'You sell under your own name. Sole proprietors don’t register with CIPC.', needs: ['SA ID number', 'A government ID and a selfie', 'Proof of address', 'A bank account in your name'] },
      business_name: { label: 'Close corporation', short: 'Close corporation (CC)', blurb: 'Registered with CIPC as a close corporation (CK number).', needs: ['Everything for individuals', 'CIPC certificate and CK number', 'Members listed', 'A bank account in the CC’s name'] },
      company: { label: 'Private company', short: 'Company (Pty) Ltd', blurb: 'Registered with CIPC as a private company, (Pty) Ltd.', needs: ['The person applying: SA ID, photo ID, selfie', 'CIPC certificate, disclosure certificate and MOI', 'Directors and owners of 25% or more', 'A company bank account'] }
    },
    notSure: 'Not sure? If you have a CIPC certificate, choose the type printed on it. Registered businesses get higher payout limits.',
    consent: 'I agree that KUBICU’s licensed payment partner can check these details with Home Affairs, SARS and CIPC, and keep the results as the law requires.',
    volume: { under_500k: 'Under R 10,000', '500k_2m': 'R 10,000 – 40,000', '2m_10m': 'R 40,000 – 200,000', '10m_50m': 'R 200,000 – 1 million', over_50m: 'Over R 1 million' },
    describeExample: 'For example: “Made-to-order shweshwe dresses, sold on Instagram and delivered across Johannesburg.”'
  }
};

export { simulatedIds };