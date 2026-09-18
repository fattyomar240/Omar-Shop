import React from 'react';
import { Store, LayoutDashboard, HandCoins, Truck, Download } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenExportImport }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard },
    { id: 'loans', label: 'Customer Loans', shortLabel: 'Loans', icon: HandCoins },
    { id: 'supplier', label: 'Bread Supplier', shortLabel: 'Bread', icon: Truck },
  ];

  return (
    <>
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 h-14 sm:h-16">
            <div
              className="flex items-center space-x-2 sm:space-x-3 min-w-0 cursor-pointer"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="bg-amber-500 p-1.5 sm:p-2 rounded-lg text-slate-900 font-bold flex-shrink-0">
                <Store className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-white leading-none truncate">
                  Omar's Shop
                </h1>
                <span className="hidden sm:block text-xs text-amber-400 font-medium">
                  Loans & Supplies Tracker
                </span>
              </div>
            </div>

            <nav className="hidden md:flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-amber-500 text-slate-900 shadow'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              onClick={onOpenExportImport}
              className="flex items-center space-x-1.5 px-3 py-2 min-h-10 bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400 rounded-lg text-xs font-bold transition-colors flex-shrink-0"
              title="Download or restore records"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900 border-t border-slate-800 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-around px-1 pt-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center min-h-[52px] py-1 px-2 rounded-lg text-[11px] font-semibold min-w-0 flex-1 ${
                  isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="truncate w-full text-center">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
