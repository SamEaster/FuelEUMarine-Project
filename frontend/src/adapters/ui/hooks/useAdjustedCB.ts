import { useState, useCallback } from 'react';
import { apiClient } from '../../infrastructure/api/FetchApiClient';
import type { ShipComplianceEntry } from '../../../core/domain/Types';

/**
 * Hook: useAdjustedCB
 * Fetches all ships and their compliance balances for a given year.
 * Powers the Pooling page ship selection table.
 */
export function useAdjustedCB(year: number) {
  const [ships, setShips] = useState<ShipComplianceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getAllShipsCb(year);
      setShips(res.data ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ship compliance data');
    } finally {
      setLoading(false);
    }
  }, [year]);

  return { ships, loading, error, fetchShips };
}
