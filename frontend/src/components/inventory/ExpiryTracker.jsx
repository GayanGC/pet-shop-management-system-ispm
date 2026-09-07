import React, { useState } from 'react';
import { AlertTriangle, Clock, Calendar, Trash2, CheckCircle2, ShieldAlert, Package, RefreshCw, X } from 'lucide-react';

const ExpiryTracker = ({ expiringProducts = [], onDisposeBatch, onRefresh }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [disposingProduct, setDisposingProduct] = useState(null);
  const [disposalReason, setDisposalReason] = useState('Batch expired - stock written off');

  const now = new Date();

  // Process products with countdown
  const itemsWithMetrics = expiringProducts.map((item) => {
    const expDate = item.expiryDate ? new Date(item.expiryDate) : null;
    let daysRemaining = 999;
    let riskLevel = 'Normal'; // 'Expired', 'Critical', 'Warning'

    if (expDate) {
      const diffTime = expDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 0) {
        riskLevel = 'Expired';
      } else if (daysRemaining <= 7) {
        riskLevel = 'Critical';
      } else if (daysRemaining <= 30) {
        riskLevel = 'Warning';
      }
    }

    return {
      ...item,
      expDate,
      daysRemaining,
      riskLevel
    };
  });

  // Metric counts
  const totalCount = itemsWithMetrics.length;
  const expiredCount = itemsWithMetrics.filter((i) => i.riskLevel === 'Expired').length;
  const criticalCount = itemsWithMetrics.filter((i) => i.riskLevel === 'Critical').length;
  const warningCount = itemsWithMetrics.filter((i) => i.riskLevel === 'Warning').length;

  // Filter items
  const filteredItems = itemsWithMetrics.filter((item) => {
    const matchesRisk =
      riskFilter === 'All' ||
      (riskFilter === 'Expired' && item.riskLevel === 'Expired') ||
      (riskFilter === 'Critical' && item.riskLevel === 'Critical') ||
      (riskFilter === 'Warning' && item.riskLevel === 'Warning');

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesRisk && matchesCategory;
  });

  const handleConfirmDisposal = () => {
    if (!disposingProduct) return;
    onDisposeBatch(disposingProduct._id, disposalReason);
    setDisposingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Batches to Review</span>
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
            <span className="text-[10px] text-slate-500 block">Expiry ≤ 30 Days or Expired</span>
          </div>
        </div>

        <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block">Expired Batches</span>
            <span className="text-2xl font-black text-rose-900">{expiredCount}</span>
            <span className="text-[10px] text-rose-600 block">Action: Immediate Disposal</span>
          </div>
        </div>

        <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">Expires in ≤ 7 Days</span>
            <span className="text-2xl font-black text-amber-900">{criticalCount}</span>
            <span className="text-[10px] text-amber-700 block">High Risk Batches</span>
          </div>
        </div>

        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">Expires in 8-30 Days</span>
            <span className="text-2xl font-black text-emerald-900">{warningCount}</span>
            <span className="text-[10px] text-emerald-700 block">Monitor & First-In First-Out</span>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Batch Expiry Lifecycle & Write-Off Control
              </h2>
              {expiredCount > 0 && (
                <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-200 animate-pulse">
                  🚨 {expiredCount} Expired
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated expiration alerts, countdown indicators, and disposal protocol logging
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Risk Level Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="All">All Risk Levels</option>
              <option value="Expired">🚨 Expired Only ({expiredCount})</option>
              <option value="Critical">⚠️ Critical ≤ 7 Days ({criticalCount})</option>
              <option value="Warning">⏳ Warning 8-30 Days ({warningCount})</option>
            </select>

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                title="Refresh Expiry Data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Expiry Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Item / Medication</th>
                <th className="py-3.5 px-5">Batch No & Supplier</th>
                <th className="py-3.5 px-5">Stock Level</th>
                <th className="py-3.5 px-5">Expiry Date</th>
                <th className="py-3.5 px-5">Lifecycle Status</th>
                <th className="py-3.5 px-5 text-right">Disposal Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isAlreadyDisposed = item.status === 'Disposed' || item.stockQuantity === 0;

                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        item.riskLevel === 'Expired' && !isAlreadyDisposed ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                              item.riskLevel === 'Expired'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : item.riskLevel === 'Critical'
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{item.itemName}</span>
                            <span className="text-[11px] text-slate-400 font-normal">
                              Category: <span className="font-semibold text-slate-600">{item.category}</span> | Price: Rs. {Number(item.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className="font-mono text-xs font-bold text-slate-700 block">{item.batchNo || 'N/A'}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Supplier: {item.supplier || 'Direct'}</span>
                      </td>

                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-1 rounded-full text-[11px] border ${
                            item.stockQuantity === 0
                              ? 'bg-slate-100 text-slate-500 border-slate-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {item.stockQuantity} {item.unit || 'units'}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 font-mono text-xs">
                        {item.expDate ? (
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {item.expDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-slate-400 block">Raw: {item.expDate.toISOString().split('T')[0]}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>

                      <td className="py-3.5 px-5">
                        {item.riskLevel === 'Expired' ? (
                          <span className="bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1 shadow-sm">
                            🚨 Expired ({Math.abs(item.daysRemaining)} days ago)
                          </span>
                        ) : item.riskLevel === 'Critical' ? (
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1">
                            ⚠️ Expires in {item.daysRemaining} {item.daysRemaining === 1 ? 'day' : 'days'}
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-semibold text-[11px] inline-flex items-center gap-1">
                            ⏳ Expires in {item.daysRemaining} days
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        {isAlreadyDisposed ? (
                          <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-xl text-[11px] font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Stock Written Off
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setDisposingProduct(item);
                              setDisposalReason(`Batch ${item.batchNo} expired - stock write-off`);
                            }}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Dispose Batch
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 px-4 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-700">No expiring products found</h3>
                      <p className="text-xs text-slate-400">
                        {riskFilter !== 'All'
                          ? 'No batches match the selected risk filter.'
                          : 'All pharmaceutical stock is well within healthy expiration limits!'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispose Confirmation Modal (Blur backdrop dialog) */}
      {disposingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-5 relative transform transition-all duration-300 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Confirm Batch Disposal</h3>
                  <p className="text-xs text-slate-500">Write off expired pharmaceutical stock</p>
                </div>
              </div>
              <button
                onClick={() => setDisposingProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-transform duration-200 hover:rotate-90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <div className="flex justify-between">
                <span className="text-slate-500">Item Name:</span>
                <span className="font-bold text-slate-900">{disposingProduct.itemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Batch Number:</span>
                <span className="font-mono font-bold text-slate-800">{disposingProduct.batchNo || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Stock:</span>
                <span className="font-bold text-rose-700">{disposingProduct.stockQuantity} {disposingProduct.unit || 'units'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expiry Date:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {disposingProduct.expDate ? disposingProduct.expDate.toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">
                Disposal Audit Reason *
              </label>
              <input
                type="text"
                value={disposalReason}
                onChange={(e) => setDisposalReason(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:outline-none transition-all"
                placeholder="e.g. Expired batch write-off"
              />
              <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                This action will set available stock quantity to 0 and log the write-off.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDisposingProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisposal}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Confirm Disposal (Write-Off)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiryTracker;
