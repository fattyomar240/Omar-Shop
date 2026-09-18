import React from 'react';
import { HandCoins, Truck, PlusCircle, CheckCircle, Clock, ArrowRight, Download } from 'lucide-react';
import SummaryCard from './SummaryCard';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export default function Dashboard({ loans, supplies, setActiveTab, onOpenNewLoan, onOpenNewSupply, onOpenExportImport }) {
  // Calculations for Loans
  const totalLoaned = loans.reduce((acc, l) => acc + (parseFloat(l.amount) || 0), 0);
  const totalLoanPaid = loans.reduce((acc, l) => acc + (parseFloat(l.paidAmount) || 0), 0);
  const totalLoanOutstanding = totalLoaned - totalLoanPaid;
  const pendingLoansCount = loans.filter((l) => l.status !== 'Fully Paid').length;

  // Calculations for Bread Supplier
  const totalSupplierCost = supplies.reduce((acc, s) => acc + (parseFloat(s.totalCost) || 0), 0);
  const totalSupplierPaid = supplies.reduce((acc, s) => acc + (parseFloat(s.amountPaid) || 0), 0);
  const totalSupplierOwed = totalSupplierCost - totalSupplierPaid;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySupplies = supplies.filter(
    (s) => s.date && s.date.split('T')[0] === todayStr
  );
  const todayBreadCount = todaySupplies.reduce((acc, s) => acc + (parseInt(s.quantity) || 0), 0);

  // Recent 5 loans & supplies
  const recentLoans = [...loans].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const recentSupplies = [...supplies].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 border border-slate-800">
        <div>
          <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
            Shop Overview & Metrics
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">Welcome to Omar's Shop System</h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Track unpaid customer loans, repayments, and daily bread supplier deliveries effortlessly.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={onOpenNewLoan}
            className="flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Customer Loan</span>
          </button>
          <button
            onClick={onOpenNewSupply}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
          >
            <Truck className="w-4 h-4" />
            <span>Record Bread Delivery</span>
          </button>
          <button
            onClick={onOpenExportImport}
            className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Records</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <SummaryCard
          title="Customer Loans Due"
          value={formatCurrency(totalLoanOutstanding)}
          subtitle={`${pendingLoansCount} unpaid loan record(s)`}
          icon={HandCoins}
          color="amber"
          onClick={() => setActiveTab('loans')}
        />
        <SummaryCard
          title="Total Loans Collected"
          value={formatCurrency(totalLoanPaid)}
          subtitle={`Out of ${formatCurrency(totalLoaned)} total loaned`}
          icon={CheckCircle}
          color="emerald"
          onClick={() => setActiveTab('loans')}
        />
        <SummaryCard
          title="Bread Supplier Balance Owed"
          value={formatCurrency(totalSupplierOwed)}
          subtitle={`Total cost: ${formatCurrency(totalSupplierCost)}`}
          icon={Truck}
          color="rose"
          onClick={() => setActiveTab('supplier')}
        />
        <SummaryCard
          title="Bread Received Today"
          value={`${todayBreadCount} loaves`}
          subtitle={`${todaySupplies.length} delivery batch(es) today`}
          icon={Clock}
          color="indigo"
          onClick={() => setActiveTab('supplier')}
        />
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
        {/* Recent Customer Loans Panel */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 min-w-0">
                <HandCoins className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span className="truncate">Recent Customer Loans</span>
              </h3>
              <button
                onClick={() => setActiveTab('loans')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentLoans.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center italic">No customer loans recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentLoans.map((loan) => {
                  const remaining = (parseFloat(loan.amount) || 0) - (parseFloat(loan.paidAmount) || 0);
                  const isPaid = remaining <= 0;
                  return (
                    <div key={loan.id} className="py-3.5 flex items-start sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2">
                          <span className="font-bold text-slate-900 text-sm">{loan.customerName}</span>
                          {loan.phone && <span className="text-xs text-slate-400">({loan.phone})</span>}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Date: {formatDateTime(loan.date)}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-slate-900 text-sm block">
                          {formatCurrency(loan.amount)}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : loan.paidAmount > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPaid ? 'Fully Paid' : `Owes ${formatCurrency(remaining)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Bread Supplier Deliveries Panel */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2 min-w-0">
                <Truck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span className="truncate">Recent Bread Deliveries</span>
              </h3>
              <button
                onClick={() => setActiveTab('supplier')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentSupplies.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center italic">No bread deliveries recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentSupplies.map((supply) => {
                  const owed = (parseFloat(supply.totalCost) || 0) - (parseFloat(supply.amountPaid) || 0);
                  const isPaid = owed <= 0;
                  return (
                    <div key={supply.id} className="py-3.5 flex items-start sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{supply.supplierName}</span>
                          <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {supply.quantity} loaves
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Delivered: {formatDateTime(supply.date)}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-slate-900 text-sm block">
                          {formatCurrency(supply.totalCost)}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isPaid ? 'Paid in Full' : `Balance Owed: ${formatCurrency(owed)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
