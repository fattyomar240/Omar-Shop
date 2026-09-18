import React, { useEffect, useState } from 'react';
import { CheckCircle, HandCoins, History } from 'lucide-react';
import { formatCurrency, formatDateTime, getCurrentDateTimeLocal } from '../utils/formatters';
import Modal from './Modal';

export default function PaymentModal({ isOpen, onClose, loan, onSavePayment }) {
  const totalAmount = parseFloat(loan?.amount) || 0;
  const currentPaid = parseFloat(loan?.paidAmount) || 0;
  const remaining = totalAmount - currentPaid;

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDateTime, setPaymentDateTime] = useState(getCurrentDateTimeLocal());
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!isOpen || !loan) return;
    const nextRemaining = (parseFloat(loan.amount) || 0) - (parseFloat(loan.paidAmount) || 0);
    setPaymentAmount(nextRemaining > 0 ? nextRemaining.toFixed(2) : '');
    setPaymentDateTime(getCurrentDateTimeLocal());
    setNote('');
  }, [isOpen, loan]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loan) return;
    const amountNum = parseFloat(paymentAmount);
    if (!amountNum || amountNum <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    if (amountNum > remaining + 0.01) {
      alert(`Payment amount cannot exceed the remaining balance of ${formatCurrency(remaining)}.`);
      return;
    }

    onSavePayment(loan.id, amountNum, paymentDateTime, note);
    onClose();
  };

  return (
    <Modal
      isOpen={Boolean(isOpen && loan)}
      onClose={onClose}
      title="Record Customer Payment"
      icon={HandCoins}
      onSubmit={handleSubmit}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 sm:flex-none px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow transition-all flex items-center justify-center space-x-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Confirm Payment</span>
          </button>
        </>
      }
    >
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
        <div className="text-xs text-slate-500 font-semibold uppercase">Customer</div>
        <div className="text-base font-bold text-slate-900 break-words">{loan?.customerName}</div>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-slate-600 pt-2 border-t border-slate-200 mt-2">
          <span>Total Loan: <strong className="text-slate-900">{formatCurrency(totalAmount)}</strong></span>
          <span>Already Paid: <strong className="text-emerald-700">{formatCurrency(currentPaid)}</strong></span>
        </div>
        <div className="text-sm font-bold text-amber-700 pt-1 flex justify-between gap-2">
          <span>Remaining Balance Owed:</span>
          <span>{formatCurrency(remaining)}</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
          Payment Amount (GMD)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-slate-400 font-bold">D</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={remaining}
            required
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-xl text-base font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <button
          type="button"
          onClick={() => setPaymentAmount(remaining.toFixed(2))}
          className="text-xs text-indigo-600 font-semibold mt-1 hover:underline inline-block"
        >
          Pay remaining full balance ({formatCurrency(remaining)})
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
          Payment Date & Time
        </label>
        <input
          type="datetime-local"
          required
          value={paymentDateTime}
          onChange={(e) => setPaymentDateTime(e.target.value)}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
          Optional Note
        </label>
        <input
          type="text"
          placeholder="e.g. Cash payment / partial settlement"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      {loan?.payments && loan.payments.length > 0 && (
        <div className="pt-1">
          <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1 mb-2">
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Payment History</span>
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50">
            {loan.payments.map((p, idx) => (
              <div key={p.id || idx} className="text-xs flex justify-between items-center gap-2 text-slate-600 border-b border-slate-200/60 pb-1 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800">{formatDateTime(p.date)}</span>
                  {p.note && <span className="text-slate-400 block text-[10px] truncate">{p.note}</span>}
                </div>
                <span className="font-bold text-emerald-700 flex-shrink-0">+{formatCurrency(p.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
