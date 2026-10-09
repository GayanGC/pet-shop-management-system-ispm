import React from 'react';
import { X, Printer, CheckCircle, AlertTriangle, Layers, Calendar, User, DollarSign } from 'lucide-react';

const PrintableZReportModal = ({ zReportData, onClose }) => {
  if (!zReportData) return null;

  const shift = zReportData.shift || zReportData;
  const invoicesSummary = zReportData.invoicesSummary;

  const handlePrint = () => {
    window.print();
  };

  const openedStr = shift.openedAt ? new Date(shift.openedAt).toLocaleString() : 'N/A';
  const closedStr = shift.closedAt ? new Date(shift.closedAt).toLocaleString() : new Date().toLocaleString();
  const discrepancy = Number(shift.cashDiscrepancy || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto print:p-0 print:bg-white print:static">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all my-8 print:shadow-none print:border-none print:max-w-none print:w-full print:m-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on Print) */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 flex justify-between items-center print:hidden border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              80mm Thermal Z-Report
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print (80mm)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 80mm Thermal Receipt Simulation Container */}
        <div className="p-6 font-mono text-slate-900 bg-white print:p-2 text-xs leading-tight select-text">
          {/* Header */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-dashed border-slate-400">
            <h1 className="text-sm font-black tracking-tight uppercase">
              4 PAW ANIMAL CLINIC
            </h1>
            <p className="text-[10px] text-slate-600 font-bold">
              Specialist Veterinary Hospital & Pharmacy
            </p>
            <p className="text-[9px] text-slate-500">
              123 Veterinary Hospital Rd, Colombo 05 · Tel: 011-2345678
            </p>
            <div className="pt-2">
              <span className="inline-block bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                *** DAY-END Z-REPORT ***
              </span>
            </div>
            <p className="text-[11px] font-black pt-1">
              {shift.zReportNo || 'Z-REPORT PENDING'}
            </p>
          </div>

          {/* Shift Details */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Shift Ref:</span>
              <span className="font-bold">{shift.shiftNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cashier:</span>
              <span className="font-bold">{shift.cashierName || shift.cashier?.name || 'Staff Cashier'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Shift Open:</span>
              <span>{openedStr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Shift Close:</span>
              <span>{closedStr}</span>
            </div>
          </div>

          {/* Sales Performance */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
            <div className="font-black uppercase text-[10px] tracking-wider text-slate-600">
              --- SALES PERFORMANCE ---
            </div>
            <div className="flex justify-between">
              <span>Gross Sales:</span>
              <span className="font-bold">Rs. {Number(shift.grossSales || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Discounts Granted:</span>
              <span>-Rs. {Number(shift.totalDiscount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax / VAT Collected:</span>
              <span>+Rs. {Number(shift.totalTax || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-xs border-t border-dotted border-slate-300 pt-1">
              <span>NET REVENUE:</span>
              <span>Rs. {Number(shift.netSales || shift.grossSales || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 pt-1">
              <span>Invoices Processed:</span>
              <span>{shift.totalInvoicesCount || 0} (Voided: {shift.voidedInvoicesCount || 0})</span>
            </div>
          </div>

          {/* Tender Breakdown */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="font-black uppercase text-[10px] tracking-wider text-slate-600">
              --- PAYMENT MODES ---
            </div>
            <div className="flex justify-between">
              <span>Cash Sales:</span>
              <span className="font-bold">Rs. {Number(shift.cashSales || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Card Sales (POS):</span>
              <span className="font-bold">Rs. {Number(shift.cardSales || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Online / Bank:</span>
              <span className="font-bold">Rs. {Number(shift.onlineSales || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Drawer Reconciliation */}
          <div className="py-3 border-b-2 border-dashed border-slate-400 space-y-1 text-[11px]">
            <div className="font-black uppercase text-[10px] tracking-wider text-slate-600">
              --- DRAWER AUDIT & RECONCILIATION ---
            </div>
            <div className="flex justify-between">
              <span>Opening Float:</span>
              <span>Rs. {Number(shift.openingFloat || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>(+) Cash Collected:</span>
              <span>Rs. {Number(shift.cashSales || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-dotted border-slate-300 pt-1">
              <span>EXPECTED DRAWER CASH:</span>
              <span>Rs. {Number(shift.expectedCashInDrawer || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>ACTUAL COUNTED CASH:</span>
              <span>Rs. {Number(shift.actualCashCounted || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-xs border-t-2 border-slate-900 pt-1">
              <span>VARIANCE / DISCREPANCY:</span>
              <span className={discrepancy === 0 ? 'text-slate-900' : discrepancy < 0 ? 'text-rose-600' : 'text-blue-600'}>
                {discrepancy === 0 ? 'Rs. 0.00 (BALANCED)' : discrepancy > 0 ? '+Rs. ' + discrepancy.toFixed(2) + ' (SURPLUS)' : '-Rs. ' + Math.abs(discrepancy).toFixed(2) + ' (SHORTAGE)'}
              </span>
            </div>
          </div>

          {/* Notes if any */}
          {shift.closingNotes && (
            <div className="py-2 border-b border-dashed border-slate-300 text-[10px] text-slate-600">
              <span className="font-bold block">Closing Remarks:</span>
              <p className="italic">{shift.closingNotes}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-6 pb-2 space-y-6 text-[10px]">
            <div className="flex justify-between items-end">
              <div>
                <div className="border-b border-slate-400 w-32 mb-1"></div>
                <span className="text-slate-500">Cashier Signature</span>
              </div>
              <div className="text-right">
                <div className="border-b border-slate-400 w-32 mb-1"></div>
                <span className="text-slate-500">Audit / Manager Sign</span>
              </div>
            </div>

            <div className="text-center text-[9px] text-slate-400 pt-2 border-t border-dotted border-slate-200">
              Generated by 4Paw Clinical ERP System · End of Financial Audit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableZReportModal;
