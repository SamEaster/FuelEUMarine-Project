import type {
  Route,
  ApiResponse,
  ComplianceBalanceResult,
  AdjustedComplianceBalanceResult,
  ShipComplianceEntry,
  BankEntry,
  BankSurplusPayload,
  ApplyBankedPayload,
  CreatePoolPayload,
  PoolResult,
  CompareRoutesResult,
} from '../domain/Types';

export interface ApiClientPort {
  // Routes
  getRoutes(): Promise<ApiResponse<Route[]>>;
  setBaseline(id: string): Promise<ApiResponse<Route>>;
  compareRoutes(baselineId: string, comparisonId: string): Promise<ApiResponse<CompareRoutesResult>>;

  // Compliance
  getComplianceBalance(shipId: string, year: number): Promise<ApiResponse<ComplianceBalanceResult>>;
  getAdjustedComplianceBalance(shipId: string, year: number): Promise<ApiResponse<AdjustedComplianceBalanceResult>>;
  getAllShipsCb(year: number): Promise<ApiResponse<ShipComplianceEntry[]>>;

  // Banking
  getBankingRecords(shipId?: string): Promise<ApiResponse<BankEntry[]>>;
  bankSurplus(payload: BankSurplusPayload): Promise<ApiResponse<BankEntry>>;
  applyBanked(payload: ApplyBankedPayload): Promise<ApiResponse<{ remainingBanked: number, adjustedComplianceBalance: number }>>;

  // Pooling
  createPool(payload: CreatePoolPayload): Promise<ApiResponse<PoolResult>>;
}
