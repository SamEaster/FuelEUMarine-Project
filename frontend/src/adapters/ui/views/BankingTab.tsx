import { useEffect, useState } from 'react';
import { useBanking } from '../hooks/useFuelEU';

export function BankingTab() {
  const { records, loading, error, fetchRecords, bank, apply } = useBanking();
  
  const [shipId, setShipId] = useState('');
  const [year, setYear] = useState<number>(2025);
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleBank = () => {
    if (shipId && amount) {
      bank(shipId, year, amount);
    }
  };

  const handleApply = () => {
    if (shipId && amount) {
      apply(shipId, year, amount);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Actions Panel */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Banking Operations</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ship ID</label>
              <input
                type="text"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. SHIP-001"
                value={shipId}
                onChange={(e) => setShipId(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
              <input
                type="number"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (gCO2eq)</label>
              <input
                type="number"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">{error}</div>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleBank}
                disabled={!shipId || !amount || loading}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 disabled:bg-slate-300 transition-colors"
              >
                Bank Surplus
              </button>
              <button
                onClick={handleApply}
                disabled={!shipId || !amount || loading}
                className="flex-1 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
              >
                Apply Banked
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Panel */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
             <h2 className="text-lg font-semibold text-slate-800">Banking Ledger</h2>
             <button onClick={() => fetchRecords()} className="text-sm text-blue-600 hover:underline">Refresh</button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-sm">
                <th className="p-4">Entry ID</th>
                <th className="p-4">Ship ID</th>
                <th className="p-4">Year</th>
                <th className="p-4 text-right">Amount (CB)</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">No banking records found.</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 text-sm text-slate-500 font-mono">{record.id.slice(0, 8)}...</td>
                    <td className="p-4 font-medium text-slate-800">{record.shipId}</td>
                    <td className="p-4 text-slate-600">{record.year}</td>
                    <td className={`p-4 text-right font-medium ${record.amountGco2eq > 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {record.amountGco2eq > 0 ? '+' : ''}{record.amountGco2eq}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
