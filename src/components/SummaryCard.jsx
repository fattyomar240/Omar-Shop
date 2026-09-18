import React from 'react';

export default function SummaryCard({ title, value, subtitle, icon: Icon, color = 'indigo', onClick }) {
  const colorMap = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700 icon-bg-indigo-500',
    amber: 'bg-amber-50 border-amber-200 text-amber-700 icon-bg-amber-500',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 icon-bg-emerald-500',
    rose: 'bg-rose-50 border-rose-200 text-rose-700 icon-bg-rose-500',
    blue: 'bg-blue-50 border-blue-200 text-blue-700 icon-bg-blue-500',
  };

  const bgClasses = {
    indigo: 'bg-indigo-600',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-600',
    rose: 'bg-rose-600',
    blue: 'bg-blue-600',
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 break-words">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl text-white flex-shrink-0 ${bgClasses[color] || bgClasses.indigo}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
