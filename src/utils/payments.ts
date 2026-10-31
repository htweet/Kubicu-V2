import type { CountryInfo } from '../types/country';
import { activeCountryInfo } from './country';
import { activeCurrency } from './currency';

/**
 * Which country-specific ways to pay apply right now (D355). Mobile money and EFT only show when the
 * shop sells from that country *and* in its currency — a Kenyan shop pricing in dollars can't take M-Pesa.
 * All of them are simulated until a payment partner is chosen there.
 */
export function localPayments(): {country: CountryInfo;mobileMoney: CountryInfo['mobileMoney'];eft: boolean;} {
  const country = activeCountryInfo();
  const local = activeCurrency() === country.currency;
  return {
    country,
    mobileMoney: local ? country.mobileMoney : null,
    eft: local && country.payments.includes('eft')
  };
}