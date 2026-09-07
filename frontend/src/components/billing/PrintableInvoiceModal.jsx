import React from 'react';
import { X, Printer, Receipt, CheckCircle2 } from 'lucide-react';

const PrintableInvoiceModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(invoice.createdAt || Date.now()).toLocaleString();
  const customerName = invoice.customerId ? (invoice.customerId.name || invoice.customerId.email) : 'Walk-in Counter Guest';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl border border-slate-200/80 shadow-2xl max-w-lg w-full flex flex-col overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95">
        {/* Modal Top Actions */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold">Official Invoice Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Receipt
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-transform duration-200 hover:rotate-90 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Content Body (Printable Target) */}
        <div className="p-8 space-y-6 text-slate-800 font-sans" id="printable-receipt">
          {/* Clinic Receipt Header */}
          <div className="text-center space-y-1 border-b border-slate-200 pb-4">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">🐾 4 Paw Animal Clinic</h1>
            <p className="text-xs text-slate-500 font-medium">Veterinary Hospital & Pet Care POS</p>
            <p className="text-[11px] text-slate-400 font-mono">Invoice Tag: <span className="font-bold text-purple-700">{invoice.invoiceNo}</span></p>
            <p className="text-[10px] text-slate-400">{formattedDate}</p>
          </div>

          {/* Customer Meta */}
          <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold text-slate-800">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Channel:</span>
              <span className="font-semibold text-purple-700">{invoice.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {invoice.paymentStatus}
              </span>
            </div>
          </div>

          {/* Items Purchased Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item Breakdown</h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items && invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 font-medium text-slate-800">{item.itemName}</td>
                    <td className="py-2 text-center font-mono">{item.quantity}</td>
                    <td className="py-2 text-right font-mono">Rs. {item.unitPrice.toFixed(2)}</td>
                    <td className="py-2 text-right font-mono font-bold">Rs. {item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals Breakdown */}
          <div className="border-t border-slate-200 pt-3 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span className="font-mono font-semibold">Rs. {(invoice.totalAmount || 0).toFixed(2)}</span>
            </div>

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount ({invoice.discountRate}%):</span>
                <span className="font-mono">-Rs. {(invoice.discountAmount || 0).toFixed(2)}</span>
              </div>
            )}

            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>VAT / Tax ({invoice.taxRate}%):</span>
                <span className="font-mono">+Rs. {(invoice.taxAmount || 0).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-200 pt-2 font-mono">
              <span>Total Paid:</span>
              <span className="text-purple-700">Rs. {(invoice.finalTotal || invoice.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-4 border-t border-dashed border-slate-200 text-[10px] text-slate-400">
            Thank you for choosing 4 Paw Animal Clinic!
            <br />
            For emergency vet consultations, call (+94) 11-234-5678.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableInvoiceModal;
