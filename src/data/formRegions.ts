import { countryInfo } from '../utils/country';

/** Lists for the Country & state and Bank details form fields (D194). States and banks now come from `data/countries.ts` (D352). */

export const nigerianStates = countryInfo('NG').regions;

/** Nigeria first, then the countries KUBICU sellers most often ship to or hear from. */
export const formCountries = [
'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Cameroon', 'Benin', 'Togo', 'Côte d’Ivoire', 'Senegal', 'Rwanda',
'Uganda', 'Tanzania', 'Egypt', 'United Kingdom', 'Ireland', 'United States', 'Canada', 'Germany', 'France', 'Netherlands',
'Italy', 'Spain', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'China', 'India', 'Australia', 'Brazil', 'Other'];


export const nigerianBanks = countryInfo('NG').banks;