import React, { useState } from 'react';
import { Filter, Receipt, Trash2, Printer } from 'lucide-react';
import PrintableInvoiceModal from './PrintableInvoiceModal';

const InvoiceList = ({ invoices = [], onVoidInvoice, paymentFilter, setPaymentFilter }) => {
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
      {/* Header & Filter Bar */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">Sales Transactions & Invoice Directory</h2>
            <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-200/60">
              {invoices.length} Invoices Issued
            </span>
          </div>
          <p className="text-xs text-slate-500">Checkout Records, POS Receipts & Financial Audits</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Payment Methods</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Invoice Tag</th>
              <th className="py-3.5 px-5">Date & Time</th>
              <th className="py-3.5 px-5">Purchased Items</th>
              <th className="py-3.5 px-5">Final Amount</th>
              <th className="py-3.5 px-5">Method</th>
              <th className="py-3.5 px-5">Payment Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {invoices.length > 0 ? (
              invoices.map((inv) => {
                const dateStr = new Date(inv.createdAt).toLocaleDateString();
                const itemCount = inv.items ? inv.items.length : 0;
                const totalToShow = inv.finalTotal || inv.totalAmount || 0;

                return (
                  <tr key={inv._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="bg-purple-50 text-purple-700 font-mono text-[11px] font-bold px-2.5 py-1 rounded-md border border-purple-200/80 inline-block">
                        {inv.invoiceNo}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">{dateStr}</td>
                    <td className="py-3.5 px-5 text-slate-700">
                      <span className="font-semibold">{itemCount} items</span>
                      <span className="block text-slate-400 text-[11px] truncate max-w-xs">
                        {inv.items.map((i) => i.itemName).join(', ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900 text-sm">
                      ${Number(totalToShow).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-slate-200">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                        inv.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' : 'bg-amber-50 text-amber-700 border-amber-200/80'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${inv.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedInvoiceForPrint(inv)}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-[11px] rounded-lg border border-purple-200/60 transition-colors inline-flex items-center gap-1"
                        title="Print Invoice Receipt"
                      >
                        <Printer className="w-3 h-3" /> Receipt
                      </button>
                      <button
                        onClick={() => onVoidInvoice(inv._id)}
                        className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                        title="Void Invoice & Restore Stock"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
                    <h3 className="text-sm font-bold text-slate-700">No sales invoices issued</h3>
                    <p className="text-xs text-slate-400">
                      {paymentFilter !== 'All'
                        ? 'No invoices match your payment method filter.'
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
    </div>
  );
};

export default InvoiceList;
