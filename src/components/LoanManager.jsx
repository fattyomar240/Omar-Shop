import React, { useState } from 'react';
import {
  HandCoins,
  Plus,
  Search,
  Trash2,
  Edit2,
  Download,
} from 'lucide-react';
import { formatCurrency, formatDateTime, formatDate, getCurrentDateTimeLocal } from '../utils/formatters';
import { downloadLoansCsv } from '../utils/exportRecords';
import PaymentModal from './PaymentModal';
import Modal from './Modal';

export default function LoanManager({ loans, onAddLoan, onUpdateLoan, onDeleteLoan, onAddPayment, initialOpenForm = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isNewLoanModalOpen, setIsNewLoanModalOpen] = useState(initialOpenForm);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState(null);
  const [editingLoan, setEditingLoan] = useState(null);

  // Form fields for new / edit loan
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loanDateTime, setLoanDateTime] = useState(getCurrentDateTimeLocal());
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const openNewLoanModal = () => {
    setEditingLoan(null);
    setCustomerName('');
    setPhone('');
    setAmount('');
    setLoanDateTime(getCurrentDateTimeLocal());
    setDueDate('');
    setNotes('');
    setIsNewLoanModalOpen(true);
  };

  const openEditLoanModal = (loan) => {
    setEditingLoan(loan);
    setCustomerName(loan.customerName || '');
    setPhone(loan.phone || '');
    setAmount(loan.amount || '');
    setLoanDateTime(loan.date ? loan.date.slice(0, 16) : getCurrentDateTimeLocal());
    setDueDate(loan.dueDate || '');
    setNotes(loan.notes || '');
    setIsNewLoanModalOpen(true);
  };

  const handleSaveLoan = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!customerName.trim() || !numAmount || numAmount <= 0) {
      alert('Please fill in customer name and a valid loan amount.');
      return;
    }

    if (editingLoan) {
      const updated = {
        ...editingLoan,
        customerName: customerName.trim(),
        phone: phone.trim(),
        amount: numAmount,
        date: new Date(loanDateTime).toISOString(),
        dueDate: dueDate || null,
        notes: notes.trim(),
      };
      // re-evaluate status
      const paid = parseFloat(updated.paidAmount) || 0;
      if (paid >= numAmount) {
        updated.status = 'Fully Paid';
      } else if (paid > 0) {
        updated.status = 'Partially Paid';
      } else {
        updated.status = 'Pending';
      }
      onUpdateLoan(updated);
    } else {
      const newLoan = {
        id: 'loan-' + Date.now(),
        customerName: customerName.trim(),
        phone: phone.trim(),
        amount: numAmount,
        paidAmount: 0,
        date: new Date(loanDateTime).toISOString(),
        dueDate: dueDate || null,
        notes: notes.trim(),
        status: 'Pending',
        payments: [],
      };
      onAddLoan(newLoan);
    }

    setIsNewLoanModalOpen(false);
  };

  // Filter loans
  const filteredLoans = loans.filter((loan) => {
    const matchSearch =
      loan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loan.phone && loan.phone.includes(searchTerm));

    if (!matchSearch) return false;

    if (filterStatus === 'pending') return loan.status === 'Pending';
    if (filterStatus === 'partial') return loan.status === 'Partially Paid';
    if (filterStatus === 'paid') return loan.status === 'Fully Paid';
    return true;
  });

  const renderStatusBadge = (isPaid, paid) => (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
        isPaid
          ? 'bg-emerald-100 text-emerald-800'
          : paid > 0
          ? 'bg-amber-100 text-amber-800'
          : 'bg-rose-100 text-rose-800'
      }`}
    >
      {isPaid ? 'Fully Paid' : paid > 0 ? 'Partially Paid' : 'Pending'}
    </span>
  );

  const renderActions = (loan, isPaid) => (
    <div className="flex items-center justify-end gap-2">
      {!isPaid && (
        <button
          onClick={() => setSelectedLoanForPayment(loan)}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
        >
          Pay
        </button>
      )}
      <button
        onClick={() => openEditLoanModal(loan)}
        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        title="Edit Loan"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          if (window.confirm(`Delete loan record for ${loan.customerName}?`)) {
            onDeleteLoan(loan.id);
          }
        }}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        title="Delete Loan"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <HandCoins className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 flex-shrink-0" />
            <span>Customer Loans Management</span>
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Record loan date & time, amount taken, month/due date, and track repayments.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              if (!filteredLoans.length) {
                alert('No loan records to download yet. Record a customer loan first.');
                return;
              }
              downloadLoansCsv(filteredLoans);
            }}
            className="flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 w-full sm:w-auto"
          >
            <Download className="w-5 h-5" />
            <span>Download Loans</span>
          </button>
          <button
            onClick={openNewLoanModal}
            className="flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-sm shadow transition-all active:scale-95 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Record New Customer Loan</span>
          </button>
        </div>
      </div>

      {/* Controls: Search and Filter Tabs */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 -mx-1 px-1">
          {[
            { id: 'all', label: 'All Loans' },
            { id: 'pending', label: 'Pending' },
            { id: 'partial', label: 'Partially Paid' },
            { id: 'paid', label: 'Fully Paid' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loans Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredLoans.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <HandCoins className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-slate-700 font-bold text-base">No Customer Loans Found</h3>
            <p className="text-slate-400 text-xs mt-1">
              Try adjusting your search filter or click "Record New Customer Loan".
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredLoans.map((loan) => {
                const total = parseFloat(loan.amount) || 0;
                const paid = parseFloat(loan.paidAmount) || 0;
                const owed = total - paid;
                const isPaid = owed <= 0;

                return (
                  <div key={loan.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{loan.customerName}</div>
                        {loan.phone && <div className="text-xs text-slate-400">{loan.phone}</div>}
                      </div>
                      {renderStatusBadge(isPaid, paid)}
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      <div>
                        <div className="text-slate-400 font-semibold uppercase">Date & Time</div>
                        <div className="font-medium text-slate-700">{formatDateTime(loan.date)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-semibold uppercase">Due Date</div>
                        <div className="font-medium text-slate-700">
                          {loan.dueDate ? formatDate(loan.dueDate) : '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-semibold uppercase">Loan Amount</div>
                        <div className="font-bold text-slate-900">{formatCurrency(total)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-semibold uppercase">Paid</div>
                        <div className="font-semibold text-emerald-700">{formatCurrency(paid)}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-slate-400 font-semibold uppercase">Balance Owed</div>
                        <div className="font-bold text-amber-700">{formatCurrency(owed)}</div>
                      </div>
                    </div>

                    {loan.notes && (
                      <p className="text-xs text-slate-500 italic truncate">"{loan.notes}"</p>
                    )}

                    {renderActions(loan, isPaid)}
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[860px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Date & Time Taken</th>
                    <th className="px-6 py-3.5">Due Date</th>
                    <th className="px-6 py-3.5">Loan Amount</th>
                    <th className="px-6 py-3.5">Amount Paid</th>
                    <th className="px-6 py-3.5">Balance Owed</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredLoans.map((loan) => {
                    const total = parseFloat(loan.amount) || 0;
                    const paid = parseFloat(loan.paidAmount) || 0;
                    const owed = total - paid;
                    const isPaid = owed <= 0;

                    return (
                      <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{loan.customerName}</div>
                          {loan.phone && <div className="text-xs text-slate-400">{loan.phone}</div>}
                          {loan.notes && (
                            <div className="text-xs text-slate-500 italic mt-0.5 max-w-xs truncate">
                              "{loan.notes}"
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                          {formatDateTime(loan.date)}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                          {loan.dueDate ? formatDate(loan.dueDate) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {formatCurrency(total)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-700">
                          {formatCurrency(paid)}
                        </td>
                        <td className="px-6 py-4 font-bold text-amber-700">
                          {formatCurrency(owed)}
                        </td>
                        <td className="px-6 py-4">{renderStatusBadge(isPaid, paid)}</td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {renderActions(loan, isPaid)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal: New / Edit Customer Loan */}
      <Modal
        isOpen={isNewLoanModalOpen}
        onClose={() => setIsNewLoanModalOpen(false)}
        title={editingLoan ? 'Edit Customer Loan' : 'Record New Customer Loan'}
        icon={HandCoins}
        onSubmit={handleSaveLoan}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsNewLoanModalOpen(false)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow transition-all"
            >
              {editingLoan ? 'Save Changes' : 'Record Loan'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              required
              placeholder="Full Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. 555-0192"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Loan Amount (GMD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Date & Time Taken *
          </label>
          <input
            type="datetime-local"
            required
            value={loanDateTime}
            onChange={(e) => setLoanDateTime(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Items Taken / Notes
          </label>
          <textarea
            rows={2}
            placeholder="e.g. 2 loaves bread, 1kg sugar..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </Modal>

      {/* Payment Recording Modal */}
      <PaymentModal
        isOpen={Boolean(selectedLoanForPayment)}
        onClose={() => setSelectedLoanForPayment(null)}
        loan={selectedLoanForPayment}
        onSavePayment={onAddPayment}
      />
    </div>
  );
}
