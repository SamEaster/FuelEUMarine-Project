export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
}

export interface ComplianceBalanceResult {
  shipId: string;
  year: number;
  cb: number;
}

export interface AdjustedComplianceBalanceResult {
  shipId: string;
  year: number;
  cb_before: number;
  banked: number;
  applied: number;
  poolDelta: number;
  cb_after: number;
}

export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
}

export interface BankSurplusPayload {
  shipId: string;
  year: number;
  complianceBalance: number;
}

export interface ApplyBankedPayload {
  shipId: string;
  year: number;
  amountToApply: number;
}

export interface PoolMember {
  poolId: string;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface ShipComplianceEntry {
  shipId: string;
  cbBefore: number;
  adjustedCb: number;
  inPool: boolean;
}

export interface CreatePoolPayload {
  year: number;
  shipIds: string[];
}


export interface PoolResult {
  poolId: string;
  members: PoolMember[];
  totalBalance: number;
}

export interface CompareRoutesResult {
  percentDiff: number;
  compliant: boolean;
  baselineGhgIntensity: number;
  comparisonGhgIntensity: number;
  ghgTarget: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
