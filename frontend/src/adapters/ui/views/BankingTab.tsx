import { useEffect, useState } from 'react';
import { useBanking } from '../hooks/useFuelEU';
import { useAdjustedCB } from '../hooks/useAdjustedCB';

export function BankingTab() {
  const [year, setYear] = useState<number>(2024);

  // Fetch all ships for the selected year — populates the Ship dropdown
  const { ships, fetchShips } = useAdjustedCB(year);

  const {
    records, currentCb, bankingKpis, loading, error,
    fetchRecords, fetchCurrentCb, fetchBankingKpis, bank, apply, setError,
  } = useBanking();

  const [shipId, setShipId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reload ships + ledger whenever year changes
  useEffect(() => {
    fetchShips();
    fetchRecords();
    setShipId('');
    setAmount(0);
    setSuccessMsg(null);
  }, [fetchShips, fetchRecords, year]);

  // Net banked amount available for the selected ship (from ledger)
  const availableBanked = records
    .filter(r => r.shipId === shipId)
    .reduce((sum, r) => sum + r.amountGco2eq, 0);

  const handleCheckBalance = async () => {
    if (!shipId) return;
    setSuccessMsg(null);
    await fetchCurrentCb(shipId, year);
    await fetchBankingKpis(shipId, year);
  };

  const handleBank = async () => {
    if (!shipId || !amount || !selectedShipEntry) return;
    setSuccessMsg(null);
    if (amount > selectedShipEntry.adjustedCb) {
      setError(`Cannot bank ${amount}. Only ${selectedShipEntry.adjustedCb.toFixed(0)} surplus available to bank.`);
      return;
    }
    try {
      await bank(shipId, year, amount);
      setSuccessMsg(`Successfully banked ${amount.toLocaleString()} gCO₂e for ${shipId}.`);
      setAmount(0);
      await fetchShips();
    } catch {
      // error handled by hook
    }
  };

  const handleApply = async () => {
    if (!shipId || !amount) return;
    setSuccessMsg(null);
    if (amount > availableBanked) {
      setError(`Cannot apply ${amount}. Only ${availableBanked.toFixed(0)} available.`);
      return;
    }
    try {
      await apply(shipId, year, amount);
      setSuccessMsg(`Successfully applied ${amount.toLocaleString()} gCO₂e for ${shipId}.`);
      setAmount(0);
      await fetchShips();
    } catch {
      // handled in hook
    }
  };

  const selectedShipEntry = ships.find(s => s.shipId === shipId);

  const isBankDisabled  = !shipId || !amount || loading || !selectedShipEntry || selectedShipEntry.adjustedCb <= 0;
  const isApplyDisabled = !shipId || !amount || loading || availableBanked <= 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ─── Left: Operations panel ─── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Banking Operations</h2>

            <div className="space-y-4">

              {/* Year + Ship selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                  <select
                    title="Select reporting year"
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ship</label>
                  <select
                    title="Select ship"
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    value={shipId}
                    onChange={e => { setShipId(e.target.value); setSuccessMsg(null); setError(''); }}
                  >
                    <option value="">Select ship…</option>
                    {ships.map(s => (
                      <option key={s.shipId} value={s.shipId}>{s.shipId}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick CB badge shown immediately on ship selection */}
              {selectedShipEntry && (
                <div className={`flex items-center justify-between px-4 py-2 rounded-md border text-sm font-medium
                  ${selectedShipEntry.cbBefore >= 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'}`}
                >
                  <span>CB (snapshot)</span>
                  <span className="font-bold">
                    {selectedShipEntry.cbBefore >= 0 ? '+' : ''}
                    {selectedShipEntry.cbBefore.toFixed(0)} gCO₂e
                  </span>
                </div>
              )}

              {/* Check live balance */}
              <button
                onClick={handleCheckBalance}
                disabled={!shipId || loading}
                className="w-full py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                {loading && currentCb === null ? 'Checking…' : 'Check Live Balance'}
              </button>

              {/* Live CB banner */}
              {currentCb !== null && (
                <div className={`p-4 rounded-lg flex items-center justify-between border
                  ${currentCb > 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'}`}
                >
                  <span className="font-medium">CB (Live)</span>
                  <span className="text-xl font-bold">
                    {currentCb > 0 ? '+' : ''}{currentCb.toFixed(0)}
                  </span>
                </div>
              )}

              <hr className="border-slate-100" />

              {/* Amount input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (gCO₂e)</label>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Enter amount to bank / apply</span>
                  <span>
                    Available in bank:&nbsp;
                    <b className={availableBanked > 0 ? 'text-emerald-600' : ''}>
                      {availableBanked.toFixed(0)}
                    </b>
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  value={amount || ''}
                  onChange={e => setAmount(Number(e.target.value))}
                />
              </div>

              {/* Feedback messages */}
              {error      && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">{error}</div>}
              {successMsg && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-md border border-emerald-100">{successMsg}</div>}

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleBank}
                  disabled={isBankDisabled}
                  title={selectedShipEntry && selectedShipEntry.adjustedCb <= 0 ? 'Cannot bank — No surplus available' : ''}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:bg-slate-300 transition-colors"
                >
                  {loading && !error && !successMsg ? 'Processing…' : 'Bank Surplus'}
                </button>
                <button
                  onClick={handleApply}
                  disabled={isApplyDisabled}
                  title={availableBanked <= 0 ? 'No banked surplus available' : ''}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-40 disabled:bg-slate-300 transition-colors"
                >
                  Apply Banked
                </button>
              </div>
            </div>
          </div>

          {/* Post-action KPI panel */}
          {bankingKpis && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase mb-4">
                Post-Action KPIs
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-600 font-medium">CB</span>
                  <span className="font-bold text-slate-800">
                    {bankingKpis.cb_before > 0 ? '+' : ''}{bankingKpis.cb_before.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-100">
                  <span className="text-blue-800 font-medium">Banked</span>
                  <span className="font-bold text-blue-700">+{bankingKpis.banked.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded border border-purple-100">
                  <span className="text-purple-800 font-medium">Applied</span>
                  <span className="font-bold text-purple-700">−{bankingKpis.applied.toFixed(0)}</span>
                </div>
                <div className={`flex justify-between items-center p-3 rounded border
                  ${bankingKpis.cb_after >= 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'}`}
                >
                  <span className="font-medium text-lg">
                    CB After <span className="text-xs font-normal opacity-70">(Adjusted)</span>
                  </span>
                  <span className="font-bold text-xl">
                    {bankingKpis.cb_after > 0 ? '+' : ''}{bankingKpis.cb_after.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Right: Banking Ledger ─── */}
        <div className="lg:col-span-7 bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden h-max">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Banking Ledger</h2>
            <button
              onClick={() => fetchRecords()}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-sm">
                  <th className="p-4">Entry ID</th>
                  <th className="p-4">Ship ID</th>
                  <th className="p-4">Year</th>
                  <th className="p-4 text-right">Amount (gCO₂e)</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No banking records yet.
                    </td>
                  </tr>
                ) : (
                  records.map(record => (
                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 text-sm text-slate-500 font-mono">{record.id.slice(0, 8)}…</td>
                      <td className="p-4 font-medium text-slate-800">{record.shipId}</td>
                      <td className="p-4 text-slate-600">{record.year}</td>
                      <td className={`p-4 text-right font-bold ${record.amountGco2eq > 0 ? 'text-emerald-600' : 'text-purple-600'}`}>
                        {record.amountGco2eq > 0 ? '+' : '−'}{Math.abs(record.amountGco2eq).toFixed(0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
