import { useEffect, useState, useMemo } from 'react';
import { useRoutes } from '../hooks/useFuelEU';

export function RoutesTab() {
  const { routes, loading, error, fetchRoutes, setBaseline } = useRoutes();
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterVesselType, setFilterVesselType] = useState<string>('');
  const [filterFuelType, setFilterFuelType] = useState<string>('');

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const uniqueVesselTypes = useMemo(() => {
    return Array.from(new Set(routes.map(r => r.vesselType).filter(Boolean)));
  }, [routes]);

  const uniqueFuelTypes = useMemo(() => {
    return Array.from(new Set(routes.map(r => r.fuelType).filter(Boolean)));
  }, [routes]);

  const filteredRoutes = routes.filter((r) => {
    const yearMatch = filterYear ? r.year.toString() === filterYear : true;
    const vesselMatch = filterVesselType ? r.vesselType === filterVesselType : true;
    const fuelMatch = filterFuelType ? r.fuelType === filterFuelType : true;
    return yearMatch && vesselMatch && fuelMatch;
  });

  if (loading && routes.length === 0) return <div className="p-4 text-gray-500">Loading routes...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Routes Registry</h2>
        <div className="flex flex-wrap gap-4">
          <select
            title="Filter by Year"
            className="flex-1 min-w-[150px] p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
          <select
            title="Filter by Vessel Type"
            className="flex-1 min-w-[150px] p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterVesselType}
            onChange={(e) => setFilterVesselType(e.target.value)}
          >
            <option value="">All Vessel Types</option>
            {uniqueVesselTypes.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select
            title="Filter by Fuel Type"
            className="flex-1 min-w-[150px] p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterFuelType}
            onChange={(e) => setFilterFuelType(e.target.value)}
          >
            <option value="">All Fuel Types</option>
            {uniqueFuelTypes.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <th className="p-3">Route ID</th>
              <th className="p-3">Vessel Type</th>
              <th className="p-3">Fuel Type</th>
              <th className="p-3">Year</th>
              <th className="p-3">GHG Intensity</th>
              <th className="p-3">Fuel Cons. (t)</th>
              <th className="p-3">Distance (km)</th>
              <th className="p-3">Total Emissions (t)</th>
              <th className="p-3">Baseline</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoutes.map((route) => (
              <tr key={route.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-medium text-slate-800">{route.routeId}</td>
                <td className="p-3 text-slate-600">{route.vesselType}</td>
                <td className="p-3 text-slate-600">{route.fuelType}</td>
                <td className="p-3 text-slate-600">{route.year}</td>
                <td className="p-3 text-slate-600">{route.ghgIntensity}</td>
                <td className="p-3 text-slate-600">{route.fuelConsumption}</td>
                <td className="p-3 text-slate-600">{route.distance}</td>
                <td className="p-3 text-slate-600">{route.totalEmissions}</td>
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
                <td colSpan={10} className="p-4 text-center text-slate-500">No routes found matching existing filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
