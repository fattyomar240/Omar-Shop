import { formatDate, formatDateTime } from './formatters';

const LOAN_HEADERS = [
  'Customer Name',
  'Phone',
  'Date & Time Taken',
  'Due Date',
  'Loan Amount (GMD)',
  'Amount Paid (GMD)',
  'Balance Owed (GMD)',
  'Status',
  'Notes',
  'Payment History',
];

const SUPPLY_HEADERS = [
  'Supplier Name',
  'Phone',
  'Delivery Date & Time',
  'Quantity (Loaves)',
  'Unit Price (GMD)',
  'Total Cost (GMD)',
  'Amount Paid (GMD)',
  'Balance Owed (GMD)',
  'Status',
  'Notes',
];

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

export function downloadFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function csvCell(value) {
  const text = value == null ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(headers, rows) {
  const lines = [headers.map(csvCell).join(','), ...rows.map((row) => row.map(csvCell).join(','))];
  return `\uFEFF${lines.join('\r\n')}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function excelTable(title, headers, rows) {
  return `
    <h2>${escapeHtml(title)}</h2>
    <table border="1" cellspacing="0" cellpadding="4">
      <thead>
        <tr>
          ${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${
          rows.length
            ? rows
                .map(
                  (row) =>
                    `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
                )
                .join('')
            : `<tr><td colspan="${headers.length}">No records</td></tr>`
        }
      </tbody>
    </table>
  `;
}

export function buildLoanRows(loans) {
  return loans.map((loan) => {
    const total = parseFloat(loan.amount) || 0;
    const paid = parseFloat(loan.paidAmount) || 0;
    const paymentHistory = (loan.payments || [])
      .map((payment) => {
        const note = payment.note ? ` (${payment.note})` : '';
        return `${formatDateTime(payment.date)}: ${Number(payment.amount).toFixed(2)}${note}`;
      })
      .join(' | ');

    return [
      loan.customerName || '',
      loan.phone || '',
      formatDateTime(loan.date),
      loan.dueDate ? formatDate(loan.dueDate) : '',
      total.toFixed(2),
      paid.toFixed(2),
      (total - paid).toFixed(2),
      loan.status || '',
      loan.notes || '',
      paymentHistory,
    ];
  });
}

export function buildSupplyRows(supplies) {
  return supplies.map((supply) => {
    const total = parseFloat(supply.totalCost) || 0;
    const paid = parseFloat(supply.amountPaid) || 0;

    return [
      supply.supplierName || '',
      supply.phone || '',
      formatDateTime(supply.date),
      supply.quantity ?? '',
      (parseFloat(supply.unitPrice) || 0).toFixed(2),
      total.toFixed(2),
      paid.toFixed(2),
      (total - paid).toFixed(2),
      supply.status || '',
      supply.notes || '',
    ];
  });
}

export function downloadLoansCsv(loans) {
  const csv = toCsv(LOAN_HEADERS, buildLoanRows(loans));
  downloadFile(`omars_shop_customer_loans_${dateStamp()}.csv`, csv, 'text/csv;charset=utf-8');
}

export function downloadSuppliesCsv(supplies) {
  const csv = toCsv(SUPPLY_HEADERS, buildSupplyRows(supplies));
  downloadFile(`omars_shop_bread_supplies_${dateStamp()}.csv`, csv, 'text/csv;charset=utf-8');
}

export function downloadAllRecordsExcel(loans, supplies) {
  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Omar's Shop Records</title>
      </head>
      <body>
        <h1>Omar's Shop Records</h1>
        <p>Downloaded: ${escapeHtml(new Date().toLocaleString())}</p>
        ${excelTable('Customer Loans', LOAN_HEADERS, buildLoanRows(loans))}
        <br />
        ${excelTable('Bread Supplier Deliveries', SUPPLY_HEADERS, buildSupplyRows(supplies))}
      </body>
    </html>
  `;
  downloadFile(
    `omars_shop_records_${dateStamp()}.xls`,
    html,
    'application/vnd.ms-excel'
  );
}

export function printAllRecords(loans, supplies) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1024,height=768');
  if (!printWindow) {
    alert('Please allow pop-ups to print or save your records as PDF.');
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Omar's Shop Records</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; padding: 24px; }
          h1 { margin-bottom: 4px; }
          h2 { margin-top: 28px; }
          p { color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
          th { background: #f1f5f9; }
        </style>
      </head>
      <body>
        <h1>Omar's Shop Records</h1>
        <p>Printed: ${escapeHtml(new Date().toLocaleString())}</p>
        ${excelTable('Customer Loans', LOAN_HEADERS, buildLoanRows(loans))}
        ${excelTable('Bread Supplier Deliveries', SUPPLY_HEADERS, buildSupplyRows(supplies))}
        <script>window.onload = function () { window.print(); };</script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
