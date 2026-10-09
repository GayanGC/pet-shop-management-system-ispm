import React from 'react';
import { X, Printer, Receipt, CheckCircle2, ShieldAlert } from 'lucide-react';

const PrintableInvoiceModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrintReceipt = () => {
    const receiptElement = document.getElementById('printable-thermal-receipt') || document.querySelector('.printable-invoice');
    if (!receiptElement) {
      window.print();
      return;
    }

    // Remove existing print iframe if any
    const existingFrame = document.getElementById('receipt-print-frame');
    if (existingFrame) existingFrame.remove();

    // Create clean isolated iframe
    const printFrame = document.createElement('iframe');
    printFrame.id = 'receipt-print-frame';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>4 Paw Animal Clinic - Receipt</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px;
              line-height: 1.35;
              color: #000000;
              background: #ffffff;
              width: 74mm;
              max-width: 74mm;
              padding: 4mm 2mm;
              margin: 0 auto;
            }
            .no-print, button, svg {
              display: none !important;
            }
            table { width: 100%; border-collapse: collapse; margin: 4px 0; }
            th, td { padding: 3px 0; text-align: left; font-size: 11px; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .border-b { border-bottom: 1px dashed #000; }
            .border-t { border-top: 1px dashed #000; }
            .my-2 { margin: 6px 0; }
            .py-1 { padding: 3px 0; }
            .flex { display: flex; justify-content: space-between; }
            .text-xs { font-size: 10px; }
            .text-sm { font-size: 12px; }
            .void-stamp {
              border: 2px dashed #dc2626;
              color: #dc2626;
              padding: 4px;
              text-align: center;
              font-weight: bold;
              margin: 6px 0;
            }
          </style>
        </head>
        <body>
          ${receiptElement.innerHTML}
        </body>
      </html>
    `);
    frameDoc.close();

    // Trigger print cleanly on iframe
    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setTimeout(() => printFrame.remove(), 2000);
    }, 250);
  };

  const formattedDate = new Date(invoice.createdAt || Date.now()).toLocaleString();
  const customerName = invoice.customerName || (invoice.customerId ? (invoice.customerId.name || invoice.customerId.email) : 'Walk-in Counter Guest');
  const customerPhone = invoice.customerPhone || (invoice.customerId ? invoice.customerId.phone : '');

  const statusStyle = invoice.isVoided ? 'text-rose-600' : 'text-emerald-600';
  const itemRowStyle = invoice.isVoided ? 'receipt-item-row line-through text-slate-400' : 'receipt-item-row';
  const totalAmountStyle = invoice.isVoided ? 'text-rose-600 line-through' : 'text-purple-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all duration-300 print:static print:p-0 print:m-0 print:bg-transparent">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl border border-slate-200/80 shadow-2xl max-w-lg w-full flex flex-col overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95 print:transform-none print:shadow-none print:border-none print:m-0 print:p-0 print:w-auto print:max-w-none">
        {/* Modal Top Actions */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center print:hidden no-print">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold">
              Official Invoice Receipt {invoice.isVoided ? '(VOIDED)' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintReceipt}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Receipt
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-transform duration-200 hover:rotate-90 cursor-pointer modal-close-btn no-print">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Content Body (Printable Target) */}
        <div className="p-8 space-y-6 text-slate-800 font-sans printable-invoice thermal-receipt" id="printable-thermal-receipt">
          {/* Clinic Receipt Header */}
          <div className="receipt-header text-center space-y-1 border-b border-slate-200 pb-4">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">🐾 4 Paw Animal Clinic</h1>
            <p className="text-xs text-slate-500 font-medium">Veterinary Hospital & Pet Care POS</p>
            <p className="text-[11px] text-slate-400 font-mono">Invoice Tag: <span className="font-bold text-purple-700">{invoice.invoiceNo}</span></p>
            <p className="text-[10px] text-slate-400">{formattedDate}</p>

            {/* VOID WATERMARK BANNER */}
            {invoice.isVoided && (
              <div className="void-stamp mt-3 p-3 bg-rose-50 border-2 border-dashed border-rose-500 rounded-xl text-center space-y-1">
                <div className="text-sm font-black text-rose-600 tracking-widest uppercase">
                  *** VOIDED TRANSACTION ***
                </div>
                <div className="text-[11px] text-rose-700 font-semibold">
                  Reason: {invoice.voidReason || 'Transaction Cancelled'}
                </div>
                {invoice.voidedAt && (
                  <div className="text-[10px] text-rose-500 font-mono">
                    Voided On: {new Date(invoice.voidedAt).toLocaleString()}
                  </div>
                )}
                {invoice.voidNotes && (
                  <div className="text-[10px] text-slate-600 italic">
                    "{invoice.voidNotes}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customer Meta */}
          <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold text-slate-800">{customerName}</span>
            </div>
            {customerPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Phone:</span>
                <span className="font-mono text-slate-700">{customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Channel:</span>
              <span className="font-semibold text-purple-700">{invoice.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className={'font-bold flex items-center gap-1 ' + statusStyle}>
                {invoice.isVoided ? (
                  <>
                    <ShieldAlert className="w-3 h-3" /> Voided / Refunded
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> {invoice.paymentStatus || 'Paid'}
                  </>
                )}
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
                  <tr key={idx} className={itemRowStyle}>
                    <td className="py-2 font-medium text-slate-800">{item.itemName}</td>
                    <td className="py-2 text-center font-mono">{item.quantity}</td>
                    <td className="py-2 text-right font-mono">Rs. {Number(item.unitPrice || item.price || 0).toFixed(2)}</td>
                    <td className="py-2 text-right font-mono font-bold">Rs. {Number(item.subtotal || (item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals Breakdown */}
          <div className="receipt-summary border-t border-slate-200 pt-3 text-xs space-y-1.5">
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
              <span>{invoice.isVoided ? 'Original Total (Voided):' : 'Total Paid:'}</span>
              <span className={totalAmountStyle}>
                Rs. {(invoice.finalTotal || invoice.totalAmount || 0).toFixed(2)}
              </span>
            </div>

            {/* Split Payment Tender Details */}
            {invoice.paymentMethod === 'Split' && invoice.paymentBreakdown && (
              <div className="space-y-1 pt-2 border-t border-dashed border-slate-200 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Cash Tendered:</span>
                  <span className="font-mono font-bold text-slate-800">Rs. {Number(invoice.paymentBreakdown.cash || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Card Paid:</span>
                  <span className="font-mono font-bold text-slate-800">Rs. {Number(invoice.paymentBreakdown.card || 0).toFixed(2)}</span>
                </div>
                {invoice.changeAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Change Returned:</span>
                    <span className="font-mono">Rs. {Number(invoice.changeAmount).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Cash Tender Details */}
            {invoice.paymentMethod === 'Cash' && invoice.tenderedAmount !== undefined && invoice.tenderedAmount !== null && (
              <div className="space-y-1 pt-2 border-t border-dashed border-slate-200 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Cash Tendered:</span>
                  <span className="font-mono font-bold text-slate-800">Rs. {Number(invoice.tenderedAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Change Returned:</span>
                  <span className="font-mono">Rs. {Number(invoice.changeAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="receipt-footer text-center pt-4 border-t border-dashed border-slate-200 text-[10px] text-slate-400">
            {invoice.isVoided ? (
              <span className="text-rose-500 font-bold">This transaction has been voided and is not valid for accounting claims.</span>
            ) : (
              <>
                Thank you for choosing 4 Paw Animal Clinic!
                <br />
                For emergency vet consultations, call (+94) 11-234-5678.
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableInvoiceModal;
