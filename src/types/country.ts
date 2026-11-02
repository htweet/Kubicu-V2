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

/** One mobile money network in a country with several (Ghana, D433). */
export interface MobileNetwork {
  id: 'mtn' | 'telecel' | 'airteltigo';
  name: string;
  approveHint: string;
  /** Local number starts used to guess the network from the number. */
  prefixes: string[];
  /** The buyer makes a 6-digit voucher on their phone first and types it in (Telecel Cash). */
  voucher?: boolean;
}

/** A mobile money wallet that can receive payments and payouts. */
export interface MobileMoneyInfo {
  id: 'mpesa' | 'momo';
  name: string;
  /** What the buyer approves on their phone. */
  approveHint: string;
  /** Ghana: the buyer picks their network (D433). */
  networks?: MobileNetwork[];
  /** Kenya: pay by Paybill if the prompt doesn't arrive (D433). Example number. */
  paybill?: string;
  /** What the receipt calls the payment's code, e.g. "M-Pesa code". */
  codeLabel: string;
  /** Payouts to this wallet usually arrive within… */
  payoutArrival: string;
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
  /** Typical price of 1 GB of mobile data, in this country's currency — example figure for page-weight estimates (D404). */
  dataPerGb: number;
  /** BCP-47 tag of the main local language this country adds, for defaults and speech input. */
  localLanguage: {code: string;name: string;};
  /** Biggest cities, used for delivery areas. */
  mainCity: string;
}