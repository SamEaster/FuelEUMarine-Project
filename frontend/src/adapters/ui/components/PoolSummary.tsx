import type { ShipComplianceEntry } from '../../../core/domain/Types';

interface PoolSummaryProps {
  selectedShips: ShipComplianceEntry[];
  onCreatePool: () => void;
  loading: boolean;
  onReset: () => void;
}

export function PoolSummary({ selectedShips, onCreatePool, loading, onReset }: PoolSummaryProps) {
  const totalCB = selectedShips.reduce((sum, s) => sum + s.cbBefore, 0);
  const isValid = selectedShips.length >= 2 && totalCB >= 0;

  const getValidationMessage = () => {
    if (selectedShips.length < 2) return 'Select at least 2 ships to form a pool.';
    if (totalCB < 0) return `Pool must have total CB ≥ 0. Current total: ${totalCB.toFixed(2)}`;
    return null;
  };

  const validationMsg = getValidationMessage();

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <h3 className="font-semibold text-slate-700">Pool Summary</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Selected Ships</span>
          <span className="text-2xl font-bold text-slate-800">{selectedShips.length}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Total CB</span>
          <span className={`text-2xl font-bold ${totalCB >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {totalCB > 0 ? '+' : ''}{totalCB.toFixed(2)}
          </span>
        </div>
      </div>

      {validationMsg && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <span>⚠️</span>
          <span>{validationMsg}</span>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          onClick={onCreatePool}
          disabled={!isValid || loading}
          className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Creating Pool...
            </>
          ) : (
            'Create Pool'
          )}
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
