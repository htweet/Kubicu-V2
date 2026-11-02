/** Inventory and ERP connections (D440): Odoo, SAP Business One or Sage X3. Simulated — nothing reaches the ERP. */
export type ErpProviderId = 'odoo' | 'sap_b1' | 'sage_x3';

export interface ErpRun {
  id: string;
  at: string;
  trigger: 'manual' | 'auto';
  /** Stock lines changed to match the ERP. */
  updated: number;
  /** Units added (positive) and removed (negative) in total. */
  unitsIn: number;
  unitsOut: number;
  /** Paid orders sent to the ERP as sales orders. */
  ordersSent: number;
  /** New batches (lots with expiry dates) received from the ERP (D476). Missing on older runs. */
  batchesIn?: number;
  unmatched: number;
}

export interface ErpState {
  provider: ErpProviderId | null;
  /** Server or tenant address, and the company/database in it. */
  server: string;
  company: string;
  connectedAt: string | null;
  /** KUBICU location id ('main' or a branch id) → ERP warehouse code. Unmapped locations aren't synced. */
  warehouses: Record<string, string>;
  /** Send paid orders to the ERP as sales orders. */
  pushOrders: boolean;
  auto: boolean;
  /** Orders already sent, by order id. */
  sentOrders: Record<string, string>;
  runs: ErpRun[];
}