import React, { useState } from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { exportAllData, importAllData, resetToDemoData, getLoans, getSupplies } from '../utils/storage';
import {
  downloadAllRecordsExcel,
  downloadLoansCsv,
  downloadSuppliesCsv,
  printAllRecords,
} from '../utils/exportRecords';
import Modal from './Modal';

export default function ExportImportModal({ isOpen, onClose, onDataChanged }) {
  const [importText, setImportText] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  const handleDownloadRecords = () => {
    const loans = getLoans();
    const supplies = getSupplies();
    downloadAllRecordsExcel(loans, supplies);
    setStatusMessage({
      type: 'success',
      text: 'All shop records downloaded. Open the file in Excel or Google Sheets.',
    });
  };

  const handleDownloadLoans = () => {
    downloadLoansCsv(getLoans());
    setStatusMessage({ type: 'success', text: 'Customer loans downloaded as a spreadsheet.' });
  };

  const handleDownloadSupplies = () => {
    downloadSuppliesCsv(getSupplies());
    setStatusMessage({ type: 'success', text: 'Bread supplier records downloaded as a spreadsheet.' });
  };

  const handlePrint = () => {
    printAllRecords(getLoans(), getSupplies());
  };

  const handleExportBackup = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omars_shop_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage({ type: 'success', text: 'JSON backup downloaded. Keep this file to restore later.' });
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setStatusMessage({ type: 'error', text: 'Please paste JSON data first.' });
      return;
    }
    const result = importAllData(importText);
    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: `Successfully imported ${result.countLoans} loans and ${result.countSupplies} supplies records!`,
      });
      onDataChanged();
      setImportText('');
    } else {
      setStatusMessage({ type: 'error', text: result.error });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImportText(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset data to default sample demo records? Any unsaved changes will be replaced.')) {
      resetToDemoData();
      onDataChanged();
      setStatusMessage({ type: 'success', text: 'Reset to demo records successfully!' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Download & Restore Records" icon={Download}>
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-sm flex items-center space-x-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800">1. Download Your Records</h3>
        <p className="text-xs text-slate-500">
          After you record loans or bread deliveries, download them to your phone or computer. Excel and Google Sheets can open these files.
        </p>
        <button
          onClick={handleDownloadRecords}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-bold shadow transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download All Records (Excel)</span>
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleDownloadLoans}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Loans Spreadsheet</span>
          </button>
          <button
            onClick={handleDownloadSupplies}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Bread Spreadsheet</span>
          </button>
        </div>
        <button
          onClick={handlePrint}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-sm font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      <hr className="border-slate-200" />

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-800">2. JSON Backup (for restore)</h3>
        <p className="text-xs text-slate-500">
          Save a backup file you can restore later if you change phones or browsers.
        </p>
        <button
          onClick={handleExportBackup}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download JSON Backup</span>
        </button>
      </div>

      <hr className="border-slate-200" />

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800">3. Restore from Backup</h3>
        <p className="text-xs text-slate-500">
          Select a JSON backup file or paste backup contents to restore data.
        </p>
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
        />
        <textarea
          rows={3}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Or paste JSON code here..."
          className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          onClick={handleImport}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Restore Data Now</span>
        </button>
      </div>

      <hr className="border-slate-200" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-xs text-slate-500">Need to reload default sample demo data?</div>
        <button
          onClick={handleResetDemo}
          className="flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset to Demo Data</span>
        </button>
      </div>
    </Modal>
  );
}
