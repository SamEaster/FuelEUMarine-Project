import { useState } from 'react';
import { Share2, Scale, Building2, Users } from 'lucide-react';
import { RoutesTab, CompareTab, BankingTab, PoolingTab } from './adapters/ui/views';

function App() {
  const [activeTab, setActiveTab] = useState<'routes' | 'compare' | 'banking' | 'pooling'>('routes');

  const navItems = [
    { id: 'routes', label: 'Route Registry', icon: Share2 },
    { id: 'compare', label: 'Compare Routes', icon: Scale },
    { id: 'banking', label: 'Surplus Banking', icon: Building2 },
    { id: 'pooling', label: 'Compliance Pools', icon: Users },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
              FuelEU Maritime Compliance
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 uppercase tracking-wide
                ${activeTab === id 
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500/20' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${activeTab === id ? 'text-blue-600' : 'text-slate-400'}`} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="fade-in">
          {activeTab === 'routes' && <RoutesTab />}
          {activeTab === 'compare' && <CompareTab />}
          {activeTab === 'banking' && <BankingTab />}
          {activeTab === 'pooling' && <PoolingTab />}
        </div>

      </main>
    </div>
  );
}

export default App;
