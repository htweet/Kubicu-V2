/**
 * USSD payments are switched off for now (D233). Every place that offers USSD checks this flag, so
 * turning it back on later is a one-line change. Sellers' saved USSD choices are kept untouched.
 */
export const USSD_AVAILABLE = false;

/** Nigerian banks with a USSD service, and their short codes (D136). Payment references are simulated. */
export interface UssdBank {
  id: string;
  name: string;
  /** The bank's own short code, without the closing #. */
  base: string;
}

export const ussdBanks: UssdBank[] = [
{ id: 'gtbank', name: 'GTBank', base: '*737' },
{ id: 'access', name: 'Access Bank', base: '*901' },
{ id: 'firstbank', name: 'First Bank', base: '*894' },
{ id: 'uba', name: 'UBA', base: '*919' },
{ id: 'zenith', name: 'Zenith Bank', base: '*966' },
{ id: 'fidelity', name: 'Fidelity Bank', base: '*770' },
{ id: 'union', name: 'Union Bank', base: '*826' },
{ id: 'sterling', name: 'Sterling Bank', base: '*822' },
{ id: 'wema', name: 'Wema Bank', base: '*945' },
{ id: 'fcmb', name: 'FCMB', base: '*329' },
{ id: 'stanbic', name: 'Stanbic IBTC', base: '*909' },
{ id: 'ecobank', name: 'Ecobank', base: '*326' },
{ id: 'polaris', name: 'Polaris Bank', base: '*833' },
{ id: 'keystone', name: 'Keystone Bank', base: '*7111' }];


/** A dial code stays valid this long. Example figure (D136). */
export const USSD_MINUTES = 10;