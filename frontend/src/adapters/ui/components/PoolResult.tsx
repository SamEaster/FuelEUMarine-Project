import type { PoolResult } from '../../../core/domain/Types';

interface PoolResultProps {
  result: PoolResult;
}

function formatCB(value: number): string {
  const abs = Math.abs(value).toFixed(2);
  return value >= 0 ? `+${abs}` : `-${abs}`;
}

export function PoolResultPanel({ result }: PoolResultProps) {
  const totalBefore = result.members.reduce((sum, m) => sum + m.cbBefore, 0);
  const isPoolValid = result.totalBalance >= 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-indigo-900">Pool Created Successfully ✓</h3>
          <p className="text-xs text-indigo-600 font-mono mt-0.5">ID: {result.poolId}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${isPoolValid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {isPoolValid ? '✓ Compliant' : '✕ Non-compliant'}
        </div>
      </div>

      {/* Members Table */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-200">
            <th className="p-3 font-semibold uppercase tracking-wider">Ship ID</th>
            <th className="p-3 font-semibold uppercase tracking-wider text-right">CB Before</th>
            <th className="p-3 font-semibold uppercase tracking-wider text-center">→</th>
            <th className="p-3 font-semibold uppercase tracking-wider text-right">CB After</th>
            <th className="p-3 font-semibold uppercase tracking-wider text-right">Delta</th>
            <th className="p-3 font-semibold uppercase tracking-wider text-center">Role</th>
          </tr>
        </thead>
        <tbody>
          {result.members.map((member) => {
            const delta = member.cbAfter - member.cbBefore;
            return (
              <tr key={member.shipId} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-medium text-slate-800">{member.shipId}</td>
                <td className={`p-3 text-right font-mono ${member.cbBefore >= 0 ? 'text-slate-600' : 'text-red-500'}`}>
                  {formatCB(member.cbBefore)}
                </td>
                <td className="p-3 text-center text-slate-400 text-xs">→</td>
                <td className={`p-3 text-right font-mono font-semibold ${member.cbAfter >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCB(member.cbAfter)}
                </td>
                <td className={`p-3 text-right font-mono text-sm ${delta >= 0 ? 'text-emerald-500' : 'text-blue-500'}`}>
                  ({delta >= 0 ? '+' : ''}{delta.toFixed(2)})
                </td>
                <td className="p-3 text-center">
                  {delta > 0 && (
                    <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">Received</span>
                  )}
                  {delta < 0 && (
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Donated</span>
                  )}
                  {delta === 0 && (
                    <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-500 rounded-full">Neutral</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pool Summary Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-sm">
        <div className="text-slate-500">
          Total CB Before: <span className={`font-semibold font-mono ml-1 ${totalBefore >= 0 ? 'text-slate-700' : 'text-red-500'}`}>
            {formatCB(totalBefore)}
          </span>
        </div>
        <div className="text-slate-500">
          Total CB After: <span className={`font-semibold font-mono ml-1 ${result.totalBalance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatCB(result.totalBalance)}
          </span>
        </div>
      </div>
    </div>
  );
}
