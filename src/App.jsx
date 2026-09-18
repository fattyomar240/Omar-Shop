import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import LoanManager from './components/LoanManager';
import SupplierManager from './components/SupplierManager';
import ExportImportModal from './components/ExportImportModal';
import { getLoans, saveLoans, getSupplies, saveSupplies } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loans, setLoans] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  // States to automatically trigger creation modals when opening tab from dashboard
  const [autoOpenNewLoan, setAutoOpenNewLoan] = useState(false);
  const [autoOpenNewSupply, setAutoOpenNewSupply] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setLoans(getLoans());
    setSupplies(getSupplies());
  };

  // Loan Handlers
  const handleAddLoan = (newLoan) => {
    const updated = [newLoan, ...loans];
    setLoans(updated);
    saveLoans(updated);
  };

  const handleUpdateLoan = (updatedLoan) => {
    const updated = loans.map((l) => (l.id === updatedLoan.id ? updatedLoan : l));
    setLoans(updated);
    saveLoans(updated);
  };

  const handleDeleteLoan = (loanId) => {
    const updated = loans.filter((l) => l.id !== loanId);
    setLoans(updated);
    saveLoans(updated);
  };

  const handleAddLoanPayment = (loanId, paymentAmount, date, note) => {
    const updated = loans.map((l) => {
      if (l.id === loanId) {
        const currentPaid = parseFloat(l.paidAmount) || 0;
        const newPaid = currentPaid + paymentAmount;
        const total = parseFloat(l.amount) || 0;
        const isFullyPaid = newPaid >= total;

        const newPayment = {
          id: 'pay-' + Date.now(),
          amount: paymentAmount,
          date: date || new Date().toISOString(),
          note: note || '',
        };

        return {
          ...l,
          paidAmount: newPaid,
          status: isFullyPaid ? 'Fully Paid' : 'Partially Paid',
          payments: [newPayment, ...(l.payments || [])],
        };
      }
      return l;
    });

    setLoans(updated);
    saveLoans(updated);
  };

  // Bread Supplier Handlers
  const handleAddSupply = (newSupply) => {
    const updated = [newSupply, ...supplies];
    setSupplies(updated);
    saveSupplies(updated);
  };

  const handleUpdateSupply = (updatedSupply) => {
    const updated = supplies.map((s) => (s.id === updatedSupply.id ? updatedSupply : s));
    setSupplies(updated);
    saveSupplies(updated);
  };

  const handleDeleteSupply = (supplyId) => {
    const updated = supplies.filter((s) => s.id !== supplyId);
    setSupplies(updated);
    saveSupplies(updated);
  };

  // Quick Action triggers
  const triggerNewLoan = () => {
    setActiveTab('loans');
    setAutoOpenNewLoan(true);
    setTimeout(() => setAutoOpenNewLoan(false), 500);
  };

  const triggerNewSupply = () => {
    setActiveTab('supplier');
    setAutoOpenNewSupply(true);
    setTimeout(() => setAutoOpenNewSupply(false), 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* Top Header / Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExportImport={() => setIsExportImportOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            loans={loans}
            supplies={supplies}
            setActiveTab={setActiveTab}
            onOpenNewLoan={triggerNewLoan}
            onOpenNewSupply={triggerNewSupply}
            onOpenExportImport={() => setIsExportImportOpen(true)}
          />
        )}

        {activeTab === 'loans' && (
          <LoanManager
            loans={loans}
            onAddLoan={handleAddLoan}
            onUpdateLoan={handleUpdateLoan}
            onDeleteLoan={handleDeleteLoan}
            onAddPayment={handleAddLoanPayment}
            initialOpenForm={autoOpenNewLoan}
          />
        )}

        {activeTab === 'supplier' && (
          <SupplierManager
            supplies={supplies}
            onAddSupply={handleAddSupply}
            onUpdateSupply={handleUpdateSupply}
            onDeleteSupply={handleDeleteSupply}
            initialOpenForm={autoOpenNewSupply}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-5 sm:py-6 text-center text-xs border-t border-slate-800 pb-[max(5.5rem,env(safe-area-inset-bottom))] md:pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-300">Omar's Shop Loans & Supplier Management System</p>
          <p className="mt-1 text-slate-500">
            All shop data is stored locally in your browser session for maximum speed & privacy.
          </p>
        </div>
      </footer>

      {/* Export / Import Modal */}
      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        onDataChanged={refreshData}
      />
    </div>
  );
}
