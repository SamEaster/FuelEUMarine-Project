import { useEffect, useState } from 'react';
import { useAdjustedCB } from '../hooks/useAdjustedCB';
import { usePooling } from '../hooks/useFuelEU';
import { PoolingTable } from '../components/PoolingTable';
import { PoolSummary } from '../components/PoolSummary';
import { PoolResultPanel } from '../components/PoolResult';
import type { ShipComplianceEntry } from '../../../core/domain/Types';

export function PoolingTab() {
  const [year, setYear] = useState<number>(2025);
  const [selectedShips, setSelectedShips] = useState<ShipComplianceEntry[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { ships, loading: shipsLoading, error: shipsError, fetchShips } = useAdjustedCB(year);
  const { poolResult, loading: poolLoading, error: poolError, createPool } = usePooling();

  useEffect(() => {
    fetchShips();
    setSelectedShips([]); // Reset selection on year change
  }, [fetchShips, year]);

  const handleToggle = (ship: ShipComplianceEntry) => {
    setSelectedShips(prev =>
      prev.some(s => s.shipId === ship.shipId)
        ? prev.filter(s => s.shipId !== ship.shipId)
        : [...prev, ship]
    );
  };

  const handleToggleAll = () => {
    const allSelected = ships.every(s => selectedShips.some(sel => sel.shipId === s.shipId));
    setSelectedShips(allSelected ? [] : [...ships]);
  };

  const handleCreatePool = async () => {
    setSuccessMsg(null);
    try {
      await createPool(year, selectedShips.map(s => s.shipId));
      setSuccessMsg('Pool created successfully!');
      setSelectedShips([]);
      await fetchShips(); // Refresh to show updated inPool flags
    } catch {
      // error is shown by the usePooling hook's error state
    }
  };

  const handleReset = () => {
    setSelectedShips([]);
    setSuccessMsg(null);
  };

  return (
    <div className="space-y-6">

      {/* Year selector header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Compliance Pooling</h2>
          <p className="text-sm text-slate-500 mt-0.5">Select ships to form a compliance pool using the greedy algorithm.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600">Year:</label>
          <select
            title="Select reporting year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
          <button
            onClick={fetchShips}
            className="px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-medium text-sm flex items-center gap-2">
          <span>✓</span> {successMsg}
        </div>
      )}

      {/* Pool error banner */}
      {poolError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium text-sm flex items-center gap-2">
          <span>✕</span> {poolError}
        </div>
      )}

      {/* Main content: ships table + summary side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Ships Table */}
        <div className="lg:col-span-2">
          {shipsLoading ? (
            <div className="flex items-center justify-center h-48 bg-white rounded-lg border border-slate-200">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading ships...</span>
              </div>
            </div>
          ) : shipsError ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{shipsError}</div>
          ) : (
            <PoolingTable
              ships={ships}
              selectedShips={selectedShips}
              onToggle={handleToggle}
              onToggleAll={handleToggleAll}
            />
          )}
        </div>

        {/* Pool Summary */}
        <div className="lg:col-span-1">
          <PoolSummary
            selectedShips={selectedShips}
            onCreatePool={handleCreatePool}
            loading={poolLoading}
            onReset={handleReset}
          />
        </div>

      </div>

      {/* Pool Result */}
      {poolResult && (
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-3">Pool Results</h3>
          <PoolResultPanel result={poolResult} />
        </div>
      )}

    </div>
  );
}
