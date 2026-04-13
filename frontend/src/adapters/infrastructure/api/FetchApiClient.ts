import type { ApiClientPort } from '../../../core/ports/ApiClientPort';
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
} from '../../../core/domain/Types';

export class FetchApiClient implements ApiClientPort {
  private baseUrl = '/api';

  private async fetchApi<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    // Some routes might return 400 or 500 with JSON payload we want to parse
    const data = await res.json().catch(() => null);
    
    if (!res.ok) {
      if (data && data.error) {
        throw new Error(data.error);
      }
      throw new Error(`API error: ${res.status}`);
    }
    
    return data as ApiResponse<T>;
  }

  // Routes
  getRoutes() {
    return this.fetchApi<Route[]>('/routes');
  }

  setBaseline(id: string) {
    return this.fetchApi<Route>(`/routes/${id}/baseline`, { method: 'POST' });
  }

  compareRoutes(baselineId: string, comparisonId: string) {
    return this.fetchApi<CompareRoutesResult>(`/routes/comparison?baselineId=${baselineId}&comparisonId=${comparisonId}`);
  }

  // Compliance
  getComplianceBalance(shipId: string, year: number) {
    return this.fetchApi<ComplianceBalanceResult>(`/compliance/cb?shipId=${shipId}&year=${year}`);
  }

  getAdjustedComplianceBalance(shipId: string, year: number) {
    return this.fetchApi<AdjustedComplianceBalanceResult>(`/compliance/adjusted-cb?shipId=${shipId}&year=${year}`);
  }

  getAllShipsCb(year: number) {
    return this.fetchApi<ShipComplianceEntry[]>(`/compliance/adjusted-cb-all?year=${year}`);
  }

  // Banking
  getBankingRecords(shipId?: string) {
    const url = shipId ? `/banking/records?shipId=${shipId}` : '/banking/records';
    return this.fetchApi<BankEntry[]>(url);
  }

  bankSurplus(payload: BankSurplusPayload) {
    return this.fetchApi<BankEntry>('/banking/bank', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  applyBanked(payload: ApplyBankedPayload) {
    return this.fetchApi<{ remainingBanked: number, adjustedComplianceBalance: number }>('/banking/apply', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Pooling
  createPool(payload: CreatePoolPayload) {
    return this.fetchApi<PoolResult>('/pools', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

export const apiClient = new FetchApiClient();
