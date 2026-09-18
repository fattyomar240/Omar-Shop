import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Trash2,
  Edit2,
  Download,
} from 'lucide-react';
import { formatCurrency, formatDateTime, getCurrentDateTimeLocal } from '../utils/formatters';
import { downloadSuppliesCsv } from '../utils/exportRecords';
import Modal from './Modal';

export default function SupplierManager({
  supplies,
  onAddSupply,
  onUpdateSupply,
  onDeleteSupply,
  initialOpenForm = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(initialOpenForm);
  const [editingSupply, setEditingSupply] = useState(null);

  // Form states
  const [supplierName, setSupplierName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryDateTime, setDeliveryDateTime] = useState(getCurrentDateTimeLocal());
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('1.20');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');

  const openNewSupplyModal = () => {
    setEditingSupply(null);
    setSupplierName('Michael Baker');
    setPhone('');
    setDeliveryDateTime(getCurrentDateTimeLocal());
    setQuantity('');
    setUnitPrice('1.20');
    setAmountPaid('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditSupplyModal = (supply) => {
    setEditingSupply(supply);
    setSupplierName(supply.supplierName || '');
    setPhone(supply.phone || '');
    setDeliveryDateTime(supply.date ? supply.date.slice(0, 16) : getCurrentDateTimeLocal());
    setQuantity(supply.quantity || '');
    setUnitPrice(supply.unitPrice || '1.20');
    setAmountPaid(supply.amountPaid || '0');
    setNotes(supply.notes || '');
    setIsModalOpen(true);
  };

  const calculatedTotalCost = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);

  const handleSaveSupply = (e) => {
    e.preventDefault();
    const qtyNum = parseInt(quantity, 10);
    const priceNum = parseFloat(unitPrice);
    const paidNum = parseFloat(amountPaid) || 0;

    if (!supplierName.trim() || !qtyNum || qtyNum <= 0 || !priceNum || priceNum <= 0) {
      alert('Please fill in supplier name, quantity, and unit price.');
      return;
    }

    const totalCost = qtyNum * priceNum;
    const isPaid = paidNum >= totalCost;

    if (editingSupply) {
      const updated = {
        ...editingSupply,
        supplierName: supplierName.trim(),
        phone: phone.trim(),
        date: new Date(deliveryDateTime).toISOString(),
        quantity: qtyNum,
        unitPrice: priceNum,
        totalCost,
        amountPaid: paidNum,
        status: isPaid ? 'Paid' : 'Credit',
        notes: notes.trim(),
      };
      onUpdateSupply(updated);
    } else {
      const newSupply = {
        id: 'sup-' + Date.now(),
        supplierName: supplierName.trim(),
        phone: phone.trim(),
        date: new Date(deliveryDateTime).toISOString(),
        quantity: qtyNum,
        unitPrice: priceNum,
        totalCost,
        amountPaid: paidNum,
        status: isPaid ? 'Paid' : 'Credit',
        notes: notes.trim(),
      };
      onAddSupply(newSupply);
    }

    setIsModalOpen(false);
  };

  const handleSettleBalance = (supply) => {
    const total = parseFloat(supply.totalCost) || 0;
    const updated = {
      ...supply,
      amountPaid: total,
      status: 'Paid',
    };
    onUpdateSupply(updated);
  };

  // Filter supplies
  const filteredSupplies = supplies.filter((s) => {
    const matchSearch =
      s.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchSearch) return false;

    if (filterStatus === 'paid') return s.status === 'Paid';
    if (filterStatus === 'credit') return s.status === 'Credit';
    return true;
  });

  const renderStatusBadge = (isPaid) => (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
        isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {isPaid ? 'Paid in Full' : 'Credit / Balance Owed'}
    </span>
  );

  const renderActions = (supply, isPaid) => (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      {!isPaid && (
        <button
          onClick={() => handleSettleBalance(supply)}
          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors"
        >
          Mark Settled
        </button>
      )}
      <button
        onClick={() => openEditSupplyModal(supply)}
        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        title="Edit Delivery"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          if (window.confirm(`Delete bread supply record from ${supply.supplierName}?`)) {
            onDeleteSupply(supply.id);
          }
        }}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        title="Delete Delivery"
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
            <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 flex-shrink-0" />
            <span>Bread Supplier Tracker</span>
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Log bread supplier deliveries, exact date & time, quantity delivered, and supplier balances.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              if (!filteredSupplies.length) {
                alert('No bread delivery records to download yet. Record a delivery first.');
                return;
              }
              downloadSuppliesCsv(filteredSupplies);
            }}
            className="flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 w-full sm:w-auto"
          >
            <Download className="w-5 h-5" />
            <span>Download Deliveries</span>
          </button>
          <button
            onClick={openNewSupplyModal}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow transition-all active:scale-95 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Record Bread Delivery</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search supplier name or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto -mx-1 px-1">
          {[
            { id: 'all', label: 'All Deliveries' },
            { id: 'credit', label: 'Balance Owed (Credit)' },
            { id: 'paid', label: 'Paid in Full' },
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

      {/* Deliveries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredSupplies.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-slate-700 font-bold text-base">No Bread Deliveries Recorded</h3>
            <p className="text-slate-400 text-xs mt-1">
              Click "Record Bread Delivery" to log supplier delivery times and quantities.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredSupplies.map((supply) => {
                const total = parseFloat(supply.totalCost) || 0;
                const paid = parseFloat(supply.amountPaid) || 0;
                const owed = total - paid;
                const isPaid = owed <= 0;

                return (
                  <div key={supply.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{supply.supplierName}</div>
                        {supply.phone && <div className="text-xs text-slate-400">{supply.phone}</div>}
                      </div>
                      {renderStatusBadge(isPaid)}
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      <div className="col-span-2">
                        <div className="text-slate-400 font-semibold uppercase">Delivery Date & Time</div>
                        <div className="font-semibold text-slate-700">{formatDateTime(supply.date)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-semibold uppercase">Quantity</div>
                        <div className="font-bold text-indigo-700">{supply.quantity} loaves</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-semibold uppercase">Unit Price</div>
                        <div className="text-slate-700">{formatCurrency(supply.unitPrice)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-semibold uppercase">Total Cost</div>
                        <div className="font-bold text-slate-900">{formatCurrency(total)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-semibold uppercase">Paid</div>
                        <div className="font-semibold text-emerald-700">{formatCurrency(paid)}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-slate-400 font-semibold uppercase">Balance Owed</div>
                        <div className="font-bold text-rose-600">{formatCurrency(owed)}</div>
                      </div>
                    </div>

                    {supply.notes && (
                      <p className="text-xs text-slate-500 italic truncate">"{supply.notes}"</p>
                    )}

                    {renderActions(supply, isPaid)}
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[980px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Supplier Name</th>
                    <th className="px-6 py-3.5">Delivery Date & Time</th>
                    <th className="px-6 py-3.5">Quantity</th>
                    <th className="px-6 py-3.5">Unit Price</th>
                    <th className="px-6 py-3.5">Total Cost</th>
                    <th className="px-6 py-3.5">Amount Paid</th>
                    <th className="px-6 py-3.5">Balance Owed</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredSupplies.map((supply) => {
                    const total = parseFloat(supply.totalCost) || 0;
                    const paid = parseFloat(supply.amountPaid) || 0;
                    const owed = total - paid;
                    const isPaid = owed <= 0;

                    return (
                      <tr key={supply.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{supply.supplierName}</div>
                          {supply.phone && <div className="text-xs text-slate-400">{supply.phone}</div>}
                          {supply.notes && (
                            <div className="text-xs text-slate-500 italic mt-0.5 max-w-xs truncate">
                              "{supply.notes}"
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                          {formatDateTime(supply.date)}
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-700">
                          {supply.quantity} loaves
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatCurrency(supply.unitPrice)}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {formatCurrency(total)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-700">
                          {formatCurrency(paid)}
                        </td>
                        <td className="px-6 py-4 font-bold text-rose-600">
                          {formatCurrency(owed)}
                        </td>
                        <td className="px-6 py-4">{renderStatusBadge(isPaid)}</td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {renderActions(supply, isPaid)}
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

      {/* Modal: New / Edit Bread Delivery */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupply ? 'Edit Bread Delivery' : 'Record Bread Delivery'}
        icon={Truck}
        iconClassName="text-indigo-400"
        onSubmit={handleSaveSupply}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm shadow transition-all"
            >
              {editingSupply ? 'Save Delivery' : 'Record Delivery'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Bread Supplier Person Name *
            </label>
            <input
              type="text"
              required
              placeholder="Supplier / Delivery person name"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Supplier Phone
            </label>
            <input
              type="tel"
              placeholder="e.g. 555-0888"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Delivery Date & Time *
          </label>
          <input
            type="datetime-local"
            required
            value={deliveryDateTime}
            onChange={(e) => setDeliveryDateTime(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Quantity (Loaves) *
            </label>
            <input
              type="number"
              min="1"
              required
              placeholder="e.g. 50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Unit Price (GMD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="1.20"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Total Cost
            </label>
            <div className="px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900">
              {formatCurrency(calculatedTotalCost)}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Amount Paid Now (GMD)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max={calculatedTotalCost}
            placeholder="0.00 (Leave empty if credit)"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={() => setAmountPaid(calculatedTotalCost.toFixed(2))}
            className="text-xs text-indigo-600 font-semibold mt-1 hover:underline inline-block"
          >
            Pay total in full ({formatCurrency(calculatedTotalCost)})
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Delivery Notes
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Morning supply batch, sliced white bread..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </Modal>
    </div>
  );
}
