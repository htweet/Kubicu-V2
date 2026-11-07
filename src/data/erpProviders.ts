import type { ErpProviderId } from '../types/erp';

/** ERP systems KUBICU can keep stock in step with (D440). Field hints are examples. */
export const erpProviders: Record<ErpProviderId, { name: string; blurb: string; serverLabel: string; serverPlaceholder: string; companyLabel: string; warehouseHint: string }> = {
  odoo: {
    name: 'Odoo',
    blurb: 'Inventory app. Stock per warehouse comes in; paid orders go out as sales orders.',
    serverLabel: 'Odoo address',
    serverPlaceholder: 'https://yourcompany.odoo.com',
    companyLabel: 'Database',
    warehouseHint: 'Short name of the warehouse in Odoo, e.g. WH',
  },
  sap_b1: {
    name: 'SAP Business One',
    blurb: 'Through the Service Layer. Item quantities per warehouse come in; paid orders go out as sales orders.',
    serverLabel: 'Service Layer address',
    serverPlaceholder: 'https://sap.yourcompany.com:50000',
    companyLabel: 'Company database',
    warehouseHint: 'Warehouse code in SAP, e.g. 01',
  },
  sage_x3: {
    name: 'Sage X3',
    blurb: 'Through the REST API. Stock by site comes in; paid orders go out as sales orders.',
    serverLabel: 'Sage X3 address',
    serverPlaceholder: 'https://x3.yourcompany.com',
    companyLabel: 'Folder',
    warehouseHint: 'Stock site code in Sage X3, e.g. NGLAG',
  },
};

export const ERP_PLAN = 'business' as const;
