import { useEffect, useState } from 'react';
import { useRoutes, useCompare } from '../hooks/useFuelEU';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function CompareTab() {
  const { routes, fetchRoutes } = useRoutes();
  const { result, loading, error, compare } = useCompare();

  const [baselineId, setBaselineId] = useState('');
  const [comparisonId, setComparisonId] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

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
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Baseline Route</label>
            <select
              title="Baseline Route"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={baselineId}
              onChange={(e) => setBaselineId(e.target.value)}
            >
              <option value="">Select Route</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.routeId} ({r.year})</option>)}
            </select>
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
              {routes.map(r => <option key={r.id} value={r.id}>{r.routeId} ({r.year})</option>)}
            </select>
          </div>

          <button
            onClick={handleCompare}
            disabled={!baselineId || !comparisonId || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Comparing...' : 'Compare'}
          </button>
        </div>
        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex flex-col justify-center">
            <div className="mb-6">
              <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Percent Difference</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-5xl font-bold ${result.percentDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {result.percentDiff > 0 ? '+' : ''}{result.percentDiff.toFixed(2)}%
                </span>
                <span className="text-slate-500 text-sm">vs Baseline</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Compliance Status</h3>
              <div className={`mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium ${result.compliant ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {result.compliant ? '✓ Compliant with Target' : '✕ Exceeds Target'}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 h-80">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                 <XAxis dataKey="name" />
                 <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                 <Tooltip formatter={(value: any) => [`${value} gCO2eq/MJ`, 'Intensity']} />
                 <ReferenceLine y={result.ghgTarget} stroke="#eab308" strokeDasharray="3 3" label="Target" />
                 <Bar dataKey="intensity" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
