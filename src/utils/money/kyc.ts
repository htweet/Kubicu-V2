import type { BankAccount, KycTier } from '../../types/money';
import type { CheckResult, EntityType, KycCase, KycPerson, KycStepId } from '../../types/kyc';
import { uid } from '../id';

/** Business verification (D93): which steps apply, what each needs, simulated partner checks and review decisions. */

export const entityInfo: Record<EntityType, {label: string;short: string;blurb: string;needs: string[];tier: KycTier;}> = {
  individual: {
    label: 'Individual or freelancer',
    short: 'Individual',
    blurb: 'You sell under your own name and aren’t registered with CAC.',
    needs: ['BVN and NIN', 'A government ID and a selfie', 'Proof of address', 'A bank account in your name'],
    tier: 2
  },
  business_name: {
    label: 'Registered business name',
    short: 'Business name (BN)',
    blurb: 'Registered with CAC as a business name or sole proprietorship (BN number).',
    needs: ['Everything for individuals', 'CAC certificate and BN number', 'Proprietors listed', 'A bank account in the business name'],
    tier: 3
  },
  company: {
    label: 'Limited company',
    short: 'Company (RC)',
    blurb: 'Registered with CAC as a limited liability company (RC number).',
    needs: ['The person applying: BVN, ID, selfie', 'CAC certificate, status report and MEMART', 'Directors and owners of 25% or more', 'A corporate bank account'],
    tier: 3
  }
};

export const stepLabels: Record<KycStepId, {label: string;hint: string;}> = {
  type: { label: 'Business type', hint: 'Who is getting paid' },
  identity: { label: 'Your identity', hint: 'BVN, NIN, ID and selfie' },
  address: { label: 'Address', hint: 'Where you live or trade' },
  business: { label: 'Business details', hint: 'CAC registration and documents' },
  people: { label: 'Directors & owners', hint: 'Everyone who controls the business' },
  payout: { label: 'Payout account', hint: 'Must match the verified name' },
  declarations: { label: 'Declarations', hint: 'Expected volume and source of funds' },
  review: { label: 'Review & submit', hint: 'Check everything once' }
};

export function stepsFor(entity: EntityType | null): KycStepId[] {
  if (entity === 'company' || entity === 'business_name') return ['type', 'identity', 'address', 'business', 'people', 'payout', 'declarations', 'review'];
  return ['type', 'identity', 'address', 'payout', 'declarations', 'review'];
}

export const nigerianStates = [
'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'];


export const volumeLabels = { under_500k: 'Under ₦500,000', '500k_2m': '₦500,000 – ₦2 million', '2m_10m': '₦2 – 10 million', '10m_50m': '₦10 – 50 million', over_50m: 'Over ₦50 million' } as const;
export const fundsLabels = { sales: 'Selling products', services: 'Providing services', savings: 'Personal savings', investment: 'Investment or loan', other: 'Something else' } as const;
export const idTypeLabels = { nin: 'NIN slip or card', passport: 'International passport', licence: 'Driver’s licence', voters: 'Voter’s card' } as const;
export const proofLabels = { utility: 'Utility bill (last 3 months)', bank_statement: 'Bank statement (last 3 months)', tenancy: 'Tenancy agreement', lga_letter: 'Letter from your LGA' } as const;

export const blankKyc = (): KycCase => ({
  status: 'not_started',
  entity: null,
  identity: {
    legalName: '', dob: '', phone: '', phoneVerified: false, bvn: '', nin: '', idType: 'nin', idNumber: '', idExpiry: '', idFront: null, selfie: false,
    checks: { bvn: 'not_run', nin: 'not_run', liveness: 'not_run', nameOnBvn: '' }
  },
  address: { line1: '', city: '', state: 'Lagos', proofType: 'utility', proof: null },
  business: {
    registeredName: '', number: '', incorporatedOn: '', tin: '', industry: '', description: '', website: '', certificate: null, statusReport: null, memart: null,
    checks: { cac: 'not_run', registeredNameOnCac: '', tin: 'not_run' }
  },
  people: [],
  payoutBankId: null,
  declarations: { monthlyVolume: '', sourceOfFunds: '', sourceDetail: '', pep: false, pepDetail: '', accurate: false, terms: false },
  submittedAt: null,
  decidedAt: null,
  decidedBy: null,
  note: null,
  requests: [],
  history: [],
  attempts: 0
});

/** Brings an older stored case up to the current shape. */
export function normaliseKyc(raw: Partial<KycCase> | undefined): KycCase {
  const base = blankKyc();
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    identity: { ...base.identity, ...raw.identity, checks: { ...base.identity.checks, ...raw.identity?.checks } },
    address: { ...base.address, ...raw.address },
    business: { ...base.business, ...raw.business, checks: { ...base.business.checks, ...raw.business?.checks } },
    declarations: { ...base.declarations, ...raw.declarations },
    people: raw.people ?? [],
    requests: raw.requests ?? [],
    history: raw.history ?? []
  };
}

// ——— Simulated partner checks (deterministic so testers can force outcomes) ———

/** BVN/NIN ending in 0000 fails; ending in 9 returns a partial name match that needs review. */
export function simulateIdCheck(num: string): CheckResult {
  if (!/^\d{11}$/.test(num)) return 'not_run';
  if (num.endsWith('0000')) return 'fail';
  if (num.endsWith('9')) return 'review';
  return 'pass';
}

export function nameOnBvn(legalName: string, result: CheckResult): string {
  const upper = legalName.trim().toUpperCase();
  if (!upper) return '';
  if (result === 'review') {
    const parts = upper.split(/\s+/);
    return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].slice(0, 1)}. ${parts.slice(1, -1).join(' ')}`.trim() : `${upper} A.`;
  }
  return result === 'pass' ? upper : '';
}

/** CAC numbers ending in 000 aren't found; ending in 7 are found but "inactive" (needs review). */
export function simulateCac(num: string): CheckResult {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 4) return 'not_run';
  if (digits.endsWith('000')) return 'fail';
  if (digits.endsWith('7')) return 'review';
  return 'pass';
}

export const checkLabels: Record<CheckResult, string> = { not_run: 'Not checked', pass: 'Matched', review: 'Needs a closer look', fail: 'Didn’t match' };
export const checkTones = { not_run: 'neutral', pass: 'success', review: 'warning', fail: 'danger' } as const;

// ——— Validation per step ———

export type StepErrors = Record<string, string>;

const ageOf = (dob: string) => dob ? (Date.now() - Date.parse(dob)) / (365.25 * 86_400_000) : 0;

export function stepErrors(k: KycCase, step: KycStepId, banks: BankAccount[]): StepErrors {
  const e: StepErrors = {};
  const i = k.identity;
  const b = k.business;
  switch (step) {
    case 'type':
      if (!k.entity) e.entity = 'Choose how your business is set up.';
      break;
    case 'identity':
      if (i.legalName.trim().split(/\s+/).length < 2) e.legalName = 'Enter your first and last name exactly as on your BVN.';
      if (!i.dob) e.dob = 'Enter your date of birth.';else
      if (ageOf(i.dob) < 18) e.dob = 'You must be 18 or older to receive payouts.';
      if (!/^0\d{10}$/.test(i.phone.replace(/\s/g, ''))) e.phone = 'Enter an 11-digit Nigerian number starting with 0.';else
      if (!i.phoneVerified) e.phone = 'Confirm your phone with the code we send.';
      if (!/^\d{11}$/.test(i.bvn)) e.bvn = 'A BVN has 11 digits.';else
      if (i.checks.bvn === 'fail') e.bvn = 'This BVN didn’t match our partner’s records. Check the number.';
      if (!/^\d{11}$/.test(i.nin)) e.nin = 'A NIN has 11 digits.';else
      if (i.checks.nin === 'fail') e.nin = 'This NIN didn’t match. Check the number.';
      if (i.idNumber.trim().length < 6) e.idNumber = 'Enter the number on your ID.';
      if (i.idType !== 'nin' && i.idType !== 'voters') {
        if (!i.idExpiry) e.idExpiry = 'Enter the expiry date.';else
        if (Date.parse(i.idExpiry) < Date.now()) e.idExpiry = 'This ID has expired. Use a valid one.';
      }
      if (!i.idFront) e.idFront = 'Upload a clear photo of your ID.';
      if (!i.selfie) e.selfie = 'Take a selfie so we can match it to your ID.';
      break;
    case 'address':
      if (k.address.line1.trim().length < 6) e.line1 = 'Enter your street address.';
      if (k.address.city.trim().length < 2) e.city = 'Enter your city or town.';
      if (!k.address.proof) e.proof = 'Upload a proof of address dated in the last 3 months.';
      break;
    case 'business':
      if (b.registeredName.trim().length < 3) e.registeredName = 'Enter the name exactly as on your CAC certificate.';
      if (k.entity === 'company' ? !/^(RC)?\s?\d{4,8}$/i.test(b.number.trim()) : !/^(BN)?\s?\d{4,8}$/i.test(b.number.trim()))
      e.number = k.entity === 'company' ? 'Enter your RC number, e.g. RC 1234567.' : 'Enter your BN number, e.g. BN 3456789.';else
      if (b.checks.cac === 'fail') e.number = 'We couldn’t find this number at CAC. Check it and try again.';
      if (!b.incorporatedOn) e.incorporatedOn = 'Enter the registration date.';
      if (k.entity === 'company' && !/^\d{8}-\d{4}$/.test(b.tin.trim())) e.tin = 'Enter your TIN, e.g. 12345678-0001.';
      if (!b.industry) e.industry = 'Choose what the business does.';
      if (b.description.trim().length < 20) e.description = 'Describe what you sell and how in a sentence or two.';
      if (!b.certificate) e.certificate = 'Upload your CAC certificate.';
      if (!b.statusReport) e.statusReport = k.entity === 'company' ? 'Upload a recent CAC status report.' : 'Upload your BN application form (Form BN/1).';
      if (k.entity === 'company' && !b.memart) e.memart = 'Upload your memorandum and articles of association.';
      break;
    case 'people':{
        if (!k.people.length) e.people = k.entity === 'company' ? 'Add every director and anyone who owns 25% or more.' : 'Add every proprietor.';
        const bad = k.people.find((p) => personErrors(p).length);
        if (bad) e.people = `Finish the details for ${bad.fullName || 'each person'}.`;
        if (k.entity === 'company' && k.people.length && !k.people.some((p) => p.role !== 'owner')) e.people = 'Add at least one director.';
        const total = k.people.reduce((s, p) => s + (p.role === 'director' ? 0 : p.ownershipPct), 0);
        if (total > 100) e.people = `Ownership adds up to ${total}%. It can’t be more than 100%.`;
        break;
      }
    case 'payout':{
        const bank = banks.find((x) => x.id === k.payoutBankId);
        if (!bank) e.payoutBankId = 'Choose the account that will receive payouts.';else
        if (bank.nameMatch === 'mismatch') e.payoutBankId = 'The name on this account doesn’t match. Choose an account in the verified name.';
        break;
      }
    case 'declarations':{
        const d = k.declarations;
        if (!d.monthlyVolume) e.monthlyVolume = 'Choose your expected monthly sales.';
        if (!d.sourceOfFunds) e.sourceOfFunds = 'Choose where your money mainly comes from.';
        if (d.sourceOfFunds === 'other' && d.sourceDetail.trim().length < 5) e.sourceDetail = 'Tell us a little more.';
        if (d.pep && d.pepDetail.trim().length < 5) e.pepDetail = 'Say which public role and who holds it.';
        if (!d.accurate) e.accurate = 'Confirm the information is true.';
        if (!d.terms) e.terms = 'Agree to the partner’s terms to continue.';
        break;
      }
    case 'review':
      break;
  }
  return e;
}

export function personErrors(p: KycPerson): string[] {
  const out: string[] = [];
  if (p.fullName.trim().split(/\s+/).length < 2) out.push('full name');
  if (!p.dob) out.push('date of birth');
  if (!/^\d{11}$/.test(p.bvn)) out.push('BVN');
  if (p.role !== 'director' && (p.ownershipPct < 25 || p.ownershipPct > 100)) out.push('ownership 25–100%');
  return out;
}

export const stepDone = (k: KycCase, step: KycStepId, banks: BankAccount[]) => step !== 'review' && Object.keys(stepErrors(k, step, banks)).length === 0;

export function readyToSubmit(k: KycCase, banks: BankAccount[]): KycStepId | null {
  return stepsFor(k.entity).find((s) => s !== 'review' && !stepDone(k, s, banks)) ?? null;
}

export const blankPerson = (): KycPerson => ({ id: uid('kp'), fullName: '', role: 'director', ownershipPct: 0, dob: '', bvn: '', pep: false, check: 'not_run' });

/** The name a payout account must match: the person for individuals, the registered name for businesses. */
export const verifiedName = (k: KycCase) => k.entity === 'individual' || !k.entity ? k.identity.legalName : k.business.registeredName;

export const industries = ['Fashion & clothing', 'Beauty & wellness', 'Food & drinks', 'Events & entertainment', 'Home services', 'Education & coaching', 'Electronics & gadgets', 'Health products', 'Digital products', 'Professional services', 'Other'];

/** The owner can only edit while drafting or fixing what was asked. */
export const kycEditable = (k: KycCase) => k.status === 'not_started' || k.status === 'in_progress' || k.status === 'needs_info';

/** Things a reviewer should look at, worked out from the case. */
export function kycRisks(k: KycCase): string[] {
  const r: string[] = [];
  if (k.identity.checks.bvn === 'review') r.push('BVN name partly matches');
  if (k.identity.checks.nin === 'review') r.push('NIN needs a closer look');
  if (k.business.checks.cac === 'review') r.push('CAC record shows inactive');
  if (k.declarations.pep || k.people.some((p) => p.pep)) r.push('Politically exposed person');
  if (k.people.some((p) => p.check === 'review')) r.push('A director’s BVN needs review');
  if (k.declarations.monthlyVolume === 'over_50m' || k.declarations.monthlyVolume === '10m_50m') r.push('High expected volume');
  if (k.attempts > 2) r.push(`Submitted ${k.attempts} times`);
  return r;
}

export const statusLabels: Record<KycCase['status'], string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  in_review: 'In review',
  needs_info: 'Action needed',
  approved: 'Verified',
  rejected: 'Not approved'
};
export const statusTones = { not_started: 'neutral', in_progress: 'info', in_review: 'info', needs_info: 'warning', approved: 'success', rejected: 'danger' } as const;

/** Reviewer target: one business day (example figure). */
export const REVIEW_HOURS = 24;

export const withEvent = (k: KycCase, label: string, by?: string): KycCase => ({ ...k, history: [{ at: new Date().toISOString(), label, by }, ...k.history].slice(0, 50) });