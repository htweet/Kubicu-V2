import type { BankAccount, KycTier } from '../../types/money';
import type { CheckResult, EntityType, IdType, KycAddress, KycCase, KycPerson, KycStepId } from '../../types/kyc';
import { phoneIssue } from '../phone';
import type { CountryCode } from '../../types/country';
import { uid } from '../id';
import { activeCountry, activeCountryInfo, countryInfo } from '../country';

const kycCountryName = (code: CountryCode) => countryInfo(code).name;
import { kycCountries, proofLabelsFor, type KycCountryRules } from '../../data/kycCountries';

/**
 * Business verification (D93): which steps apply, what each needs, simulated partner checks and review decisions.
 * Labels, number formats and registries follow the workspace's country (D424); the lookups below are getters, so
 * they always read the country on screen.
 */

/** The verification rules for the workspace on screen. */
export const kycRules = (country?: CountryCode): KycCountryRules => kycCountries[country ?? activeCountry()] ?? kycCountries.NG;

const tiers: Record<EntityType, KycTier> = { individual: 2, business_name: 3, company: 3 };
const entityEntry = (id: EntityType) => ({
  get label() {return kycRules().entities[id].label;},
  get short() {return kycRules().entities[id].short;},
  get blurb() {return kycRules().entities[id].blurb;},
  get needs() {return kycRules().entities[id].needs;},
  tier: tiers[id]
});

export const entityInfo: Record<EntityType, {label: string;short: string;blurb: string;needs: string[];tier: KycTier;}> = {
  individual: entityEntry('individual'),
  business_name: entityEntry('business_name'),
  company: entityEntry('company')
};

export const stepLabels: Record<KycStepId, {label: string;hint: string;}> = {
  type: { label: 'Business type', hint: 'Who is getting paid' },
  identity: { label: 'Your identity', get hint() {return kycRules().identityHint;} },
  address: { label: 'Address', hint: 'Where you live or trade' },
  business: { label: 'Business details', get hint() {return `${kycRules().registry.short} registration and documents`;} },
  people: { label: 'Directors & owners', hint: 'Everyone who controls the business' },
  payout: { label: 'Payout account', hint: 'Must match the verified name' },
  declarations: { label: 'Declarations', hint: 'Expected volume and source of funds' },
  review: { label: 'Review & submit', hint: 'Check everything once' }
};

export function stepsFor(entity: EntityType | null): KycStepId[] {
  if (entity === 'company' || entity === 'business_name') return ['type', 'identity', 'address', 'business', 'people', 'payout', 'declarations', 'review'];
  return ['type', 'identity', 'address', 'payout', 'declarations', 'review'];
}



type VolumeKey = Exclude<KycCase['declarations']['monthlyVolume'], ''>;
const volumeKeys: VolumeKey[] = ['under_500k', '500k_2m', '2m_10m', '10m_50m', 'over_50m'];
/** Monthly sales bands in the country's own currency (D424). Keys are kept so saved answers still load. */
export const volumeLabels = Object.defineProperties({} as Record<VolumeKey, string>, Object.fromEntries(volumeKeys.map((k) => [k, { enumerable: true, get: () => kycRules().volume[k] }])));
export const fundsLabels = { sales: 'Selling products', services: 'Providing services', savings: 'Personal savings', investment: 'Investment or loan', other: 'Something else' } as const;
const idTypeKeys: IdType[] = ['nin', 'passport', 'licence', 'voters'];
/** Label for any stored ID type; `idTypeOptions` lists only the ones the country accepts. */
export const idTypeLabels = Object.defineProperties({} as Record<IdType, string>, Object.fromEntries(idTypeKeys.map((k) => [k, { enumerable: true, get: () => kycRules().idTypes.find((t) => t.value === k)?.label ?? kycCountries.NG.idTypes.find((t) => t.value === k)?.label ?? k }])));
export const idTypeOptions = () => kycRules().idTypes;
export const idNeedsExpiry = (t: IdType) => kycRules().expiring.includes(t);
const proofKeys: KycAddress['proofType'][] = ['utility', 'bank_statement', 'tenancy', 'lga_letter'];
export const proofLabels = Object.defineProperties({} as Record<KycAddress['proofType'], string>, Object.fromEntries(proofKeys.map((k) => [k, { enumerable: true, get: () => proofLabelsFor(kycRules())[k] }])));

export const blankKyc = (): KycCase => ({
  country: activeCountry(),
  status: 'not_started',
  entity: null,
  identity: {
    legalName: '', dob: '', phone: '', phoneVerified: false, bvn: '', nin: '', idType: 'nin', idNumber: '', idExpiry: '', idFront: null, selfie: false,
    checks: { bvn: 'not_run', nin: 'not_run', liveness: 'not_run', nameOnBvn: '' }
  },
  address: { line1: '', city: '', state: activeCountryInfo().defaultRegion, proofType: 'utility', proof: null },
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
    // Cases saved before D425 have no country: they were Nigerian, unless still being drafted elsewhere.
    country: raw.country ?? (raw.status && raw.status !== 'not_started' && raw.status !== 'in_progress' ? 'NG' : base.country),
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

/**
 * An ID number in the country's format whose digits end in 0000 fails; ending in 9 returns a partial name match
 * that needs review. `pattern` defaults to the country's main ID number (BVN in Nigeria).
 */
export function simulateIdCheck(num: string, pattern: RegExp = kycRules().primary.pattern): CheckResult {
  if (!pattern.test(num.trim())) return 'not_run';
  const digits = num.replace(/\D/g, '');
  if (digits.endsWith('0000')) return 'fail';
  if (digits.endsWith('9')) return 'review';
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
    case 'identity':{
        const r = kycRules();
        if (i.legalName.trim().split(/\s+/).length < 2) e.legalName = r.legalNameError;
        if (!i.dob) e.dob = 'Enter your date of birth.';else
        if (ageOf(i.dob) < 18) e.dob = 'You must be 18 or older to receive payouts.';
        if (!i.phone.trim() || phoneIssue(i.phone) !== null) e.phone = activeCountry() === 'NG' && !i.phone.trim().startsWith('+') ? 'Enter an 11-digit Nigerian number starting with 0.' : 'Enter a complete mobile number.';else
        if (!i.phoneVerified) e.phone = 'Confirm your phone with the code we send.';
        if (!r.primary.pattern.test(i.bvn.trim())) e.bvn = r.primary.formatError;else
        if (i.checks.bvn === 'fail') e.bvn = r.primary.mismatch;
        if (r.secondary) {
          if (!r.secondary.pattern.test(i.nin.trim())) e.nin = r.secondary.formatError;else
          if (i.checks.nin === 'fail') e.nin = r.secondary.mismatch;
        }
        if (i.idNumber.trim().length < 6) e.idNumber = 'Enter the number on your ID.';
        if (idNeedsExpiry(i.idType)) {
          if (!i.idExpiry) e.idExpiry = 'Enter the expiry date.';else
          if (Date.parse(i.idExpiry) < Date.now()) e.idExpiry = 'This ID has expired. Use a valid one.';
        }
        if (!i.idFront) e.idFront = 'Upload a clear photo of your ID.';
        if (!i.selfie) e.selfie = 'Take a selfie so we can match it to your ID.';
        break;
      }
    case 'address':
      if (k.address.line1.trim().length < 6) e.line1 = 'Enter your street address.';
      if (k.address.city.trim().length < 2) e.city = 'Enter your city or town.';
      if (!k.address.proof) e.proof = 'Upload a proof of address dated in the last 3 months.';
      break;
    case 'business':{
        const reg = kycRules().registry;
        const tax = kycRules().tax;
        const company = k.entity === 'company';
        if (b.registeredName.trim().length < 3) e.registeredName = reg.nameError;
        if (!(company ? reg.companyPattern : reg.bnPattern).test(b.number.trim())) e.number = company ? reg.companyError : reg.bnError;else
        if (b.checks.cac === 'fail') e.number = reg.notFound;
        if (!b.incorporatedOn) e.incorporatedOn = 'Enter the registration date.';
        if (company && !tax.pattern.test(b.tin.trim())) e.tin = tax.error;
        if (!b.industry) e.industry = 'Choose what the business does.';
        if (b.description.trim().length < 20) e.description = 'Describe what you sell and how in a sentence or two.';
        if (!b.certificate) e.certificate = reg.certificateError;
        if (!b.statusReport) e.statusReport = company ? reg.companyRecordError : reg.bnRecordError;
        if (company && !b.memart) e.memart = reg.constitutionError;
        break;
      }
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
  if (!kycRules().primary.pattern.test(p.bvn.trim())) out.push(kycRules().primary.label);
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
  // Named for the case's own country, whatever country the staff console runs as (D427).
  const rules = kycRules(k.country);
  if (k.identity.checks.bvn === 'review') r.push(`${rules.primary.label} name partly matches`);
  if (rules.secondary && k.identity.checks.nin === 'review') r.push(`${rules.secondary.label} needs a closer look`);
  if (k.business.checks.cac === 'review') r.push(`${rules.registry.short} record shows inactive`);
  if (k.declarations.pep || k.people.some((p) => p.pep)) r.push('Politically exposed person');
  if (k.people.some((p) => p.check === 'review')) r.push(`A director’s ${rules.primary.label} needs review`);
  if (k.country && k.country !== 'NG') r.push(`Applying from ${kycCountryName(k.country)} — check against that country’s rules`);
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