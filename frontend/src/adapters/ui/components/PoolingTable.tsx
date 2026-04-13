import type { ShipComplianceEntry } from '../../../core/domain/Types';

interface PoolingTableProps {
  ships: ShipComplianceEntry[];
  selectedShips: ShipComplianceEntry[];
  onToggle: (ship: ShipComplianceEntry) => void;
  onToggleAll: () => void;
}

export function PoolingTable({ ships, selectedShips, onToggle, onToggleAll }: PoolingTableProps) {
  const selectedIds = new Set(selectedShips.map(s => s.shipId));
  const allSelected = ships.length > 0 && ships.every(s => selectedIds.has(s.shipId));

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
            <th className="p-3 w-10">
              <input
                type="checkbox"
                aria-label="Select all ships"
                checked={allSelected}
                onChange={onToggleAll}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
              />
            </th>
            <th className="p-3 font-semibold uppercase tracking-wider">Ship ID</th>
            <th className="p-3 font-semibold uppercase tracking-wider text-right">CB Before</th>
            <th className="p-3 font-semibold uppercase tracking-wider text-center">Status</th>
            <th className="p-3 font-semibold uppercase tracking-wider text-center">Pool</th>
          </tr>
        </thead>
        <tbody>
          {ships.map((ship) => {
            const isSelected = selectedIds.has(ship.shipId);
            const isSurplus = ship.cbBefore >= 0;

            return (
              <tr
                key={ship.shipId}
                onClick={() => onToggle(ship)}
                className={`border-b border-slate-100 cursor-pointer transition-colors ${
                  isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'
                }`}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${ship.shipId}`}
                    checked={isSelected}
                    onChange={() => onToggle(ship)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                  />
                </td>
                <td className="p-3 font-medium text-slate-800">{ship.shipId}</td>
                <td className={`p-3 text-right font-mono font-semibold ${isSurplus ? 'text-emerald-600' : 'text-red-500'}`}>
                  {ship.cbBefore > 0 ? '+' : ''}{ship.cbBefore.toFixed(2)}
                </td>
                <td className="p-3 text-center">
                  {isSurplus ? (
                    <span className="px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                      Surplus
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                      Deficit
                    </span>
                  )}
                </td>
                <td className="p-3 text-center">
                  {ship.inPool ? (
                    <span className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-500 rounded-full">
                      In Pool
                    </span>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            );
          })}

          {ships.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">
                No ships found for selected year.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
