import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calculator, FileSpreadsheet, AlertCircle, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { fetchCurrentShift, openCashierShift, closeCashierShift } from '../../services/billingService';

const ShiftSettlementModal = ({ isOpen, onClose, onShiftSettled, onShiftOpened }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeShiftData, setActiveShiftData] = useState(null);
  const [openingFloatInput, setOpeningFloatInput] = useState('5000');
  const [actualCashInput, setActualCashInput] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadShift = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchCurrentShift();
      setActiveShiftData(res?.data || null);
      if (res?.data?.liveMetrics?.expectedCashInDrawer !== undefined) {
        setActualCashInput(String(res.data.liveMetrics.expectedCashInDrawer));
      }
    } catch (err) {
      console.error('Error fetching current shift:', err);
      setErrorMsg('Could not fetch active shift information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadShift();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const shift = activeShiftData?.shift;
  const metrics = activeShiftData?.liveMetrics;

  const round2 = (v) => Math.round((Number(v) + Number.EPSILON) * 100) / 100;
  const expectedCash = metrics ? round2(metrics.expectedCashInDrawer) : 0;
  const actualCash = actualCashInput !== '' ? round2(Number(actualCashInput)) : 0;
  const discrepancy = round2(actualCash - expectedCash);

  const handleOpenShift = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const floatVal = Number(openingFloatInput || 0);
      const res = await openCashierShift(floatVal);
      if (onShiftOpened) onShiftOpened(res.data);
      await loadShift();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to open cashier shift.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseShift = async (e) => {
    e.preventDefault();
    if (actualCashInput === '' || isNaN(Number(actualCashInput))) {
      setErrorMsg('Please enter the physically counted cash amount.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await closeCashierShift({
        actualCashCounted: Number(actualCashInput),
        closingNotes: closingNotes.trim(),
        shiftId: shift?._id
      });
      if (onShiftSettled) onShiftSettled(res.data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to settle cashier shift.');
    } finally {
      setSubmitting(false);
    }
  };

  const getDiscrepancyStyle = () => {
    if (discrepancy === 0) {
      return 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300';
    }
    if (discrepancy < 0) {
      return 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300';
    }
    return 'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-linear-to-r from-teal-700 to-teal-800 text-white flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-inner">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {shift ? 'Cashier Shift Settlement & Z-Report' : 'Open New Cashier Shift'}
              </h3>
              <p className="text-xs text-teal-100 font-mono">
                {shift ? 'Shift Ref: ' + shift.shiftNo : 'Initialize Starting Cash Float'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600" />
              <p className="text-xs font-semibold">Auditing Cashier Shift Status...</p>
            </div>
          ) : !shift ? (
            /* Open Shift Screen */
            <form onSubmit={handleOpenShift} className="space-y-4">
              <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-2xl p-4 text-xs text-teal-800 dark:text-teal-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-600" />
                  No Active Shift Open
                </p>
                <p>
                  Set your initial cash drawer float to begin processing sales orders and tracking cash drawers.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Opening Cash Float (LKR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={openingFloatInput}
                  onChange={(e) => setOpeningFloatInput(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <DollarSign className="w-3.5 h-3.5" />}
                  <span>Open Shift & Start Terminal</span>
                </button>
              </div>
            </form>
          ) : (
            /* Close Shift / Settlement Form */
            <form onSubmit={handleCloseShift} className="space-y-4">
              {/* Financial Performance Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Opening Float</span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">
                    Rs. {Number(metrics?.openingFloat || 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cash Sales</span>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Rs. {Number(metrics?.cashSales || 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Card Sales</span>
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    Rs. {Number(metrics?.cardSales || 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Sales</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                    Rs. {Number(metrics?.grossSales || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Transactions count */}
              <div className="flex justify-between items-center text-xs text-slate-500 px-1 font-medium">
                <span>Total Invoices: <strong className="text-slate-800 dark:text-slate-200">{metrics?.totalInvoicesCount || 0}</strong> ({metrics?.activeInvoicesCount || 0} active, {metrics?.voidedInvoicesCount || 0} voided)</span>
                <span>Online / Other: <strong className="text-slate-800 dark:text-slate-200">Rs. {Number(metrics?.onlineSales || 0).toFixed(2)}</strong></span>
              </div>

              {/* Expected Drawer Reconciliation Card */}
              <div className="bg-linear-to-br from-slate-50 to-teal-50/50 dark:from-slate-800 dark:to-teal-950/20 border border-teal-200/80 dark:border-teal-800/60 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Expected Cash In Drawer:
                  </span>
                  <span className="font-mono text-base font-black text-teal-800 dark:text-teal-300">
                    Rs. {expectedCash.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Opening Float (Rs. {Number(metrics?.openingFloat || 0).toFixed(2)}) + Cash Receipts (Rs. {Number(metrics?.cashSales || 0).toFixed(2)})
                </p>
              </div>

              {/* Actual Cash Counted */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between items-center">
                  <span>Physically Counted Drawer Cash (LKR)</span>
                  <button
                    type="button"
                    onClick={() => setActualCashInput(String(expectedCash))}
                    className="text-[11px] text-teal-600 hover:text-teal-700 font-bold underline cursor-pointer"
                  >
                    Match Expected
                  </button>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(e.target.value)}
                  placeholder="Count bills and coins..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                />
              </div>

              {/* Live Discrepancy Indicator */}
              <div className={'p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ' + getDiscrepancyStyle()}>
                <div className="flex items-center gap-2">
                  {discrepancy === 0 ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4" />}
                  <span>
                    {discrepancy === 0
                      ? 'Drawer Status: Balanced'
                      : discrepancy < 0
                      ? 'Drawer Shortage Detected'
                      : 'Drawer Surplus Detected'}
                  </span>
                </div>
                <span className="font-mono text-sm">
                  {discrepancy > 0 ? '+Rs. ' + discrepancy.toFixed(2) : 'Rs. ' + discrepancy.toFixed(2)}
                </span>
              </div>

              {/* Closing Audit Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Shift Settlement Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Record any notes regarding drawer variance or handover..."
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || actualCashInput === ''}
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Settling Shift...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Settle & Generate 80mm Z-Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftSettlementModal;
