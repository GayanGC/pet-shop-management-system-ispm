import React, { useState } from 'react';
import { AlertTriangle, X, RefreshCw, ShieldAlert, FileText } from 'lucide-react';

const VOID_REASONS = [
  'Cashier Entry Error',
  'Client Cancelled / Return',
  'Defective / Damaged Medicine',
  'Incorrect Pricing Applied',
  'Other'
];

const VoidInvoiceModal = ({ invoice, onClose, onConfirmVoid, isSubmitting = false }) => {
  const [voidReason, setVoidReason] = useState('');
  const [voidNotes, setVoidNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!invoice) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!voidReason) {
      setErrorMsg('Please select a mandatory void reason from the dropdown.');
      return;
    }
    setErrorMsg('');
    onConfirmVoid(invoice._id, { voidReason, voidNotes: voidNotes.trim() });
  };

  const totalAmount = invoice.finalTotal || invoice.totalAmount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-linear-to-r from-rose-500 to-rose-600 text-white flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-inner">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Void Invoice & Stock Restoral</h3>
              <p className="text-xs text-rose-100 font-mono">Invoice #{invoice.invoiceNo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Summary Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Customer:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{invoice.customerName || 'Walk-in Client'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Total Amount:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">Rs. {Number(totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Items Count:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {invoice.items?.length || 0} line items
              </span>
            </div>
          </div>

          {/* Atomic Stock Restoral Guarantee */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3.5 flex items-start gap-3">
            <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              <strong className="font-semibold">Atomic Stock Restoral:</strong> All product quantities on this invoice will be automatically credited back (<code className="font-mono font-bold">$inc: +qty</code>) to dispensary inventory.
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mandatory Reason Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <span>Mandatory Void Reason</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={voidReason}
              onChange={(e) => {
                setVoidReason(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              required
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
            >
              <option value="">-- Select Void Reason (Mandatory Audit) --</option>
              {VOID_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* Audit Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Clinical Audit Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={voidNotes}
              onChange={(e) => setVoidNotes(e.target.value)}
              placeholder="Provide clinical or accounting context for this void transaction..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!voidReason || isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Voiding & Restoring Stock...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Confirm Void & Restore Stock</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoidInvoiceModal;
