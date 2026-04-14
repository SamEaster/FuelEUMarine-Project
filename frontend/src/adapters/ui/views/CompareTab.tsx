import { useEffect, useState } from 'react';
import { useRoutes, useCompare } from '../hooks/useFuelEU';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, LabelList } from 'recharts';

export function CompareTab() {
  const { routes, fetchRoutes } = useRoutes();
  const { result, loading, error, compare } = useCompare();

  const [comparisonId, setComparisonId] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const activeBaseline = routes.find(r => r.isBaseline);
  const baselineId = activeBaseline?.id;

  const handleCompare = () => {
    if (baselineId && comparisonId) {
      compare(baselineId, comparisonId);
    }
  };

  const chartData = result ? [
    { name: 'Baseline', intensity: result.baselineGhgIntensity, fill: '#94a3b8' },
    { name: 'Comparison', intensity: result.comparisonGhgIntensity, fill: result.compliant ? '#22c55e' : '#ef4444' }
  ] : [];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Route GHG Comparison</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full bg-slate-50 p-3 rounded-md border border-slate-200">
            <label className="block text-sm font-medium text-slate-500 mb-1">Active Baseline Route</label>
            <div className="font-semibold text-slate-700">
              {activeBaseline ? `${activeBaseline.routeId} (${activeBaseline.year})` : 'No baseline selected in Routes tab'}
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Comparison Route</label>
            <select
              title="Comparison Route"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={comparisonId}
              onChange={(e) => setComparisonId(e.target.value)}
            >
              <option value="">Select Route</option>
              {routes.filter(r => !r.isBaseline).map(r => <option key={r.id} value={r.id}>{r.routeId} ({r.year})</option>)}
            </select>
          </div>

          <button
            onClick={handleCompare}
            disabled={!baselineId || !comparisonId || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            style={{ height: '42px' }}
          >
            {loading ? 'Comparing...' : 'Compare'}
          </button>
        </div>
        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
      </div>

      {result && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between">
            <h3 className="text-blue-800 font-medium">FuelEU Target Threshold</h3>
            <div className="text-xl font-bold text-blue-900">
              Target: {result.ghgTarget} gCO₂e/MJ <span className="text-sm font-normal text-blue-700">(2 % below 91.16)</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-4 w-1/3">Metric</th>
                  <th className="p-4 w-1/3">Baseline</th>
                  <th className="p-4 w-1/3">Comparison</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700">GHG Intensity</td>
                  <td className="p-4 text-slate-600">{result.baselineGhgIntensity}</td>
                  <td className="p-4 text-slate-600 font-semibold">{result.comparisonGhgIntensity}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700">% Difference</td>
                  <td className="p-4 text-slate-400">—</td>
                  <td className={`p-4 font-bold ${result.percentDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {result.percentDiff > 0 ? '+' : ''}{result.percentDiff.toFixed(2)}%
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700">Compliance</td>
                  <td className="p-4 text-slate-400">—</td>
                  <td className="p-4">
                    {result.compliant ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                        ✅ Compliant
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                        ❌ Exceeds Target
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 h-96">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 5 }}>
                 <XAxis dataKey="name" />
                 <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                 <Tooltip formatter={(value: any) => [`${value} gCO2eq/MJ`, 'Intensity']} cursor={{fill: 'transparent'}} />
                 <ReferenceLine y={result.ghgTarget} stroke="#eab308" strokeDasharray="3 3" label="Target" />
                 <Bar dataKey="intensity" radius={[4, 4, 0, 0]}>
                   <LabelList dataKey="intensity" position="top" fill="#475569" fontWeight="bold" />
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
