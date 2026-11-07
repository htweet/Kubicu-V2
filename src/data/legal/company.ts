/**
 * The legal entity behind KUBICU, taken from the CAC certified extract (13 Jan 2024),
 * certificate of incorporation and FIRS TaxPro Max record supplied by the owner (D234).
 * Directors', shareholders' and secretary's personal details are deliberately NOT stored here —
 * they are not needed on public pages and publishing them would breach the NDPA principle of minimisation.
 */
export const kubicuCompany = {
  legalName: 'Saintstartup Technologies Ltd',
  product: 'KUBICU',
  rcNumber: 'RC 7298088',
  incorporated: '12 January 2024',
  type: 'private company limited by shares',
  statute: 'Companies and Allied Matters Act 2020',
  registeredAddress: 'Plot 235, Zone A, Apo Resettlement, Abuja, FCT, Nigeria',
  tin: '31897848-0001',
  /** kub.icu is KUBICU's only domain. Three public addresses only (D235). */
  legalEmail: 'legal@kub.icu',
  salesEmail: 'sales@kub.icu',
  generalEmail: 'hello@kub.icu',
};

/** One-line identification used in legal pages, invoices and the footer. */
export const companyLine = `${kubicuCompany.legalName} (${kubicuCompany.rcNumber}), a ${kubicuCompany.type} incorporated in Nigeria under the ${kubicuCompany.statute}, with its registered office at ${kubicuCompany.registeredAddress}`;
