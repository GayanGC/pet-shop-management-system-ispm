import React, { useState } from 'react';
import { Filter, Receipt, Trash2, Printer, ShieldAlert, AlertTriangle } from 'lucide-react';
import PrintableInvoiceModal from './PrintableInvoiceModal';
import VoidInvoiceModal from './VoidInvoiceModal';

const InvoiceList = ({ invoices = [], onVoidInvoice, paymentFilter, setPaymentFilter }) => {
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);
  const [selectedInvoiceForVoid, setSelectedInvoiceForVoid] = useState(null);
  const [isVoiding, setIsVoiding] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Voided'

  const handleConfirmVoid = async (id, payload) => {
    setIsVoiding(true);
    try {
      if (onVoidInvoice) {
        await onVoidInvoice(id, payload);
      }
      setSelectedInvoiceForVoid(null);
    } catch (err) {
      console.error('Error voiding invoice:', err);
    } finally {
      setIsVoiding(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'Active' && inv.isVoided) return false;
    if (statusFilter === 'Voided' && !inv.isVoided) return false;
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden space-y-0">
      {/* Header & Filter Bar */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Sales Transactions & Invoice Directory</h2>
            <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-200/60">
              {invoices.length} Invoices Issued
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Checkout Records, POS Receipts & Financial Audits</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Invoices (Active & Voided)</option>
              <option value="Active">Active Only</option>
              <option value="Voided">Voided Only</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="pl-8 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Payment Methods</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Split">Split (Cash + Card)</option>
              <option value="Online">Online</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-5">Invoice Tag</th>
              <th className="py-3.5 px-5">Date & Time</th>
              <th className="py-3.5 px-5">Purchased Items</th>
              <th className="py-3.5 px-5">Final Amount</th>
              <th className="py-3.5 px-5">Method</th>
              <th className="py-3.5 px-5">Payment Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv) => {
                const dateStr = new Date(inv.createdAt).toLocaleDateString();
                const itemCount = inv.items ? inv.items.length : 0;
                const totalToShow = inv.finalTotal || inv.totalAmount || 0;
                const isVoid = Boolean(inv.isVoided);

                return (
                  <tr 
                    key={inv._id} 
                    className={'transition-colors ' + (isVoid ? 'bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-50/50' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40')}
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-mono text-[11px] font-bold px-2.5 py-1 rounded-md border border-purple-200/80 dark:border-purple-800/60 inline-block">
                          {inv.invoiceNo}
                        </span>
                        {isVoid && (
                          <span className="bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-300/80 uppercase tracking-wider">
                            VOIDED
                          </span>
                        )}
                      </div>
                      {isVoid && inv.voidReason && (
                        <span className="block text-[10px] text-rose-500 font-medium mt-0.5">
                          Reason: {inv.voidReason}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 font-medium">{dateStr}</td>
                    <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300">
                      <span className={'font-semibold ' + (isVoid ? 'line-through text-slate-400' : '')}>
                        {itemCount} items
                      </span>
                      <span className="block text-slate-400 text-[11px] truncate max-w-xs">
                        {inv.items ? inv.items.map((i) => i.itemName).join(', ') : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-sm">
                      <span className={isVoid ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}>
                        Rs. {Number(totalToShow).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                        {inv.paymentMethod}
                        {inv.paymentMethod === 'Split' && inv.paymentBreakdown && (
                          <span className="block text-[9px] text-slate-500">
                            Cash: {Number(inv.paymentBreakdown.cash || 0).toFixed(0)} | Card: {Number(inv.paymentBreakdown.card || 0).toFixed(0)}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      {isVoid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Voided
                        </span>
                      ) : (
                        <span className={'inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full border ' + (
                          inv.paymentStatus === 'Paid' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800' 
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800'
                        )}>
                          <span className={'w-1.5 h-1.5 rounded-full ' + (inv.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500')}></span>
                          {inv.paymentStatus}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedInvoiceForPrint(inv)}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold text-[11px] rounded-lg border border-purple-200/60 dark:border-purple-800/60 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Print Invoice Receipt"
                      >
                        <Printer className="w-3 h-3" /> Receipt
                      </button>
                      {onVoidInvoice && !isVoid && (
                        <button
                          onClick={() => setSelectedInvoiceForVoid(inv)}
                          className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all cursor-pointer"
                          title="Void Invoice & Restore Stock"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="py-12 px-4 text-center">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mx-auto border border-purple-100">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No sales invoices found</h3>
                    <p className="text-xs text-slate-400">
                      {paymentFilter !== 'All' || statusFilter !== 'All'
                        ? 'No invoices match your selected filters.'
                        : 'Use the POS Billing terminal above to execute a sales checkout!'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Printable Receipt Modal */}
      {selectedInvoiceForPrint && (
        <PrintableInvoiceModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}

      {/* Void Invoice Confirmation Modal with Mandatory Reason Audit */}
      {selectedInvoiceForVoid && (
        <VoidInvoiceModal
          invoice={selectedInvoiceForVoid}
          isSubmitting={isVoiding}
          onClose={() => setSelectedInvoiceForVoid(null)}
          onConfirmVoid={handleConfirmVoid}
        />
      )}
    </div>
  );
};

export default InvoiceList;
