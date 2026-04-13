import { useEffect, useState } from 'react';
import { useRoutes } from '../hooks/useFuelEU';

export function RoutesTab() {
  const { routes, loading, error, fetchRoutes, setBaseline } = useRoutes();
  const [filterYear, setFilterYear] = useState<string>('');

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const filteredRoutes = filterYear
    ? routes.filter((r) => r.year.toString() === filterYear)
    : routes;

  if (loading && routes.length === 0) return <div className="p-4 text-gray-500">Loading routes...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">Routes Registry</h2>
        <select
          title="Filter by Year"
          className="p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">All Years</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <th className="p-3">Route ID</th>
              <th className="p-3">Year</th>
              <th className="p-3">GHG Intensity</th>
              <th className="p-3">Fuel Cons. (t)</th>
              <th className="p-3">Baseline</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoutes.map((route) => (
              <tr key={route.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-medium text-slate-800">{route.routeId}</td>
                <td className="p-3 text-slate-600">{route.year}</td>
                <td className="p-3 text-slate-600">{route.ghgIntensity}</td>
                <td className="p-3 text-slate-600">{route.fuelConsumption}</td>
                <td className="p-3">
                  {route.isBaseline ? (
                     <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active Baseline</span>
                  ) : (
                     <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full">Comparison</span>
                  )}
                </td>
                <td className="p-3">
                  {!route.isBaseline && (
                    <button
                      onClick={() => setBaseline(route.id)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors"
                    >
                      Set as Baseline
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredRoutes.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-500">No routes found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
