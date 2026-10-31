/** The countries a workspace can sell from (D352). Each sets defaults, never locks. */
export type CountryCode = 'NG' | 'KE' | 'GH' | 'ZA';

/** How a buyer can pay at checkout. Which ones show depends on the seller's country and currency. */
export type PaymentOptionId = 'card' | 'transfer' | 'ussd' | 'pay_on_delivery' | 'instalments' | 'mpesa' | 'momo' | 'eft';

/** A bank and the length its account numbers must be. */
export interface CountryBank {
  name: string;
}

export interface AccountNumberRule {
  min: number;
  max: number;
  /** Shown in the field label, e.g. "10 digits" or "9–11 digits". */
  label: string;
}

/** A mobile money wallet that can receive payments and payouts. */
export interface MobileMoneyInfo {
  id: 'mpesa' | 'momo';
  name: string;
  /** What the buyer approves on their phone. */
  approveHint: string;
}

export interface CountryInfo {
  code: CountryCode;
  name: string;
  currency: 'NGN' | 'KES' | 'GHS' | 'ZAR';
  /** International dialling code, without the plus. */
  dialCode: string;
  /** Digits after the country code (the leading 0 dropped). */
  nationalLength: number;
  /** Local example with the leading 0, for placeholders. */
  phoneExample: string;
  /** What a first-level region is called here. */
  regionLabel: 'State' | 'County' | 'Region' | 'Province';
  regions: string[];
  /** A sensible first choice for new addresses. */
  defaultRegion: string;
  banks: string[];
  accountNumber: AccountNumberRule;
  /** Checkout options in the order they're offered. */
  payments: PaymentOptionId[];
  mobileMoney: MobileMoneyInfo | null;
  /** Standard VAT rate shown to sellers as a guide — example figure, not tax advice. */
  vatPct: number;
  /** BCP-47 tag of the main local language this country adds, for defaults and speech input. */
  localLanguage: {code: string;name: string;};
  /** Biggest cities, used for delivery areas. */
  mainCity: string;
}