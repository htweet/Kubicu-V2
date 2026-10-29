/**
 * Full business verification (KYC for individuals, KYB for registered businesses) — D93.
 * Checks are run by the licensed payment partner's identity service (simulated). KUBICU keeps results, not raw documents.
 * Payouts stay off until a case is approved.
 */

/** Who is getting paid. Decides which steps apply. */
export type EntityType = 'individual' | 'business_name' | 'company';

export type KycStatus = 'not_started' | 'in_progress' | 'in_review' | 'needs_info' | 'approved' | 'rejected';

export type KycStepId = 'type' | 'identity' | 'address' | 'business' | 'people' | 'payout' | 'declarations' | 'review';

/** Result of one automated check from the partner. */
export type CheckResult = 'not_run' | 'pass' | 'review' | 'fail';

export type IdType = 'nin' | 'passport' | 'licence' | 'voters';

/** Only the file name and size are kept in the prototype — nothing is uploaded. */
export interface KycDoc {
  name: string;
  sizeKb: number;
  uploadedAt: string;
  /** Photos only: a reduced copy kept on this device so you can check what you added. Never put in Media. */
  previewUrl?: string;
  kind?: 'image' | 'pdf';
}

export interface KycIdentity {
  legalName: string;
  dob: string;
  phone: string;
  phoneVerified: boolean;
  bvn: string;
  nin: string;
  idType: IdType;
  idNumber: string;
  idExpiry: string;
  idFront: KycDoc | null;
  selfie: boolean;
  checks: {bvn: CheckResult;nin: CheckResult;liveness: CheckResult;nameOnBvn: string;};
}

export interface KycAddress {
  line1: string;
  city: string;
  state: string;
  proofType: 'utility' | 'bank_statement' | 'tenancy' | 'lga_letter';
  proof: KycDoc | null;
}

export interface KycBusiness {
  registeredName: string;
  number: string;
  incorporatedOn: string;
  tin: string;
  industry: string;
  /** What the business sells and how — used for risk review. */
  description: string;
  website: string;
  certificate: KycDoc | null;
  /** CAC status report (companies) or BN application form (business names). */
  statusReport: KycDoc | null;
  /** Memorandum & articles — companies only. */
  memart: KycDoc | null;
  checks: {cac: CheckResult;registeredNameOnCac: string;tin: CheckResult;};
}

export type PersonRole = 'director' | 'owner' | 'both';

export interface KycPerson {
  id: string;
  fullName: string;
  role: PersonRole;
  /** Ownership share; 25% or more makes them a beneficial owner. */
  ownershipPct: number;
  dob: string;
  bvn: string;
  pep: boolean;
  check: CheckResult;
}

export interface KycDeclarations {
  monthlyVolume: '' | 'under_500k' | '500k_2m' | '2m_10m' | '10m_50m' | 'over_50m';
  sourceOfFunds: '' | 'sales' | 'services' | 'savings' | 'investment' | 'other';
  sourceDetail: string;
  pep: boolean;
  pepDetail: string;
  accurate: boolean;
  terms: boolean;
}

export interface KycRequest {
  step: KycStepId;
  message: string;
}

export interface KycEvent {
  at: string;
  label: string;
  by?: string;
}

export interface KycCase {
  status: KycStatus;
  entity: EntityType | null;
  identity: KycIdentity;
  address: KycAddress;
  business: KycBusiness;
  people: KycPerson[];
  /** Bank account chosen to receive payouts — its name must match the verified name. */
  payoutBankId: string | null;
  declarations: KycDeclarations;
  submittedAt: string | null;
  decidedAt: string | null;
  decidedBy: string | null;
  /** Reviewer's note shown to the owner word for word (rejection or approval note). */
  note: string | null;
  /** What KUBICU asked to be fixed when status is needs_info. */
  requests: KycRequest[];
  history: KycEvent[];
  /** Number of submissions so far — re-submitting after needs_info increments it. */
  attempts: number;
}