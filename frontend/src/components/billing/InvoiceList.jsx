import React from 'react';

const InvoiceList = ({ invoices = [], onVoidInvoice, paymentFilter, setPaymentFilter }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Sales Transactions & Invoice History</h2>
          <p className="text-xs text-gray-500">Member 4 Scope - Sales & Invoicing Records</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600">Payment Channel:</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="All">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Online">Online</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="p-3">Invoice No</th>
              <th className="p-3">Date</th>
              <th className="p-3">Items Purchased</th>
              <th className="p-3">Total Amount</th>
              <th className="p-3">Payment Method</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {invoices.length > 0 ? (
              invoices.map((inv) => {
                const dateStr = new Date(inv.createdAt).toLocaleDateString();
                const itemCount = inv.items ? inv.items.length : 0;

                return (
                  <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono text-xs font-bold text-purple-700">{inv.invoiceNo}</td>
                    <td className="p-3 text-xs text-gray-600">{dateStr}</td>
                    <td className="p-3 text-xs text-gray-700">
                      <span className="font-semibold">{itemCount} items</span>
                      <span className="block text-gray-400 truncate max-w-xs">
                        {inv.items.map((i) => i.itemName).join(', ')}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-extrabold text-gray-900">${Number(inv.totalAmount).toFixed(2)}</td>
                    <td className="p-3">
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        inv.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onVoidInvoice(inv._id)}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                      >
                        Void
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-400 text-sm">
                  No sales invoices generated yet. Use the POS Billing terminal above to make a checkout sale!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceList;
