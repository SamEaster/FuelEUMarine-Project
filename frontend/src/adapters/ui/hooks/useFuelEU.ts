import { useState, useCallback } from 'react';
import { apiClient } from '../../infrastructure/api/FetchApiClient';
import type { 
  Route, 
  CompareRoutesResult, 
  BankEntry, 
  PoolResult 
} from '../../../core/domain/Types';

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getRoutes();
      if (res.data) setRoutes(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  }, []);

  const setBaseline = async (id: string) => {
    try {
      await apiClient.setBaseline(id);
      await fetchRoutes(); // Refresh
    } catch (err: any) {
      setError(err.message || 'Failed to set baseline');
    }
  };

  return { routes, loading, error, fetchRoutes, setBaseline };
}

export function useCompare() {
  const [result, setResult] = useState<CompareRoutesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compare = async (baselineId: string, comparisonId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.compareRoutes(baselineId, comparisonId);
      if (res.data) setResult(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to compare routes');
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, compare };
}

export function useBanking() {
  const [records, setRecords] = useState<BankEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (shipId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getBankingRecords(shipId);
      if (res.data) setRecords(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  }, []);

  const bank = async (shipId: string, year: number, complianceBalance: number) => {
    try {
      await apiClient.bankSurplus({ shipId, year, complianceBalance });
      await fetchRecords();
    } catch (err: any) {
      setError(err.message || 'Failed to bank amount');
    }
  };

  const apply = async (shipId: string, year: number, amountToApply: number) => {
    try {
      await apiClient.applyBanked({ shipId, year, amountToApply });
      await fetchRecords();
    } catch (err: any) {
      setError(err.message || 'Failed to apply amount');
    }
  };

  return { records, loading, error, fetchRecords, bank, apply };
}

export function usePooling() {
  const [poolResult, setPoolResult] = useState<PoolResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPool = async (year: number, shipIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.createPool({ year, shipIds });
      if (res.data) setPoolResult(res.data);
    } catch (err: any) {
      const msg = err.message || 'Failed to create pool';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { poolResult, loading, error, createPool };
}
