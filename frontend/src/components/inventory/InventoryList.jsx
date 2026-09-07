import React, { useState } from 'react';
import { Search, Filter, Package, AlertTriangle, Edit3, Trash2, CheckCircle2, SlidersHorizontal, Calendar } from 'lucide-react';
import StockAdjustModal from './StockAdjustModal';

const InventoryList = ({ products = [], onDelete, onEdit, onAdjustStock, searchTerm, setSearchTerm, categoryFilter, setCategoryFilter }) => {
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
      {/* Header & Filter Bar */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">Pharmacy & Stock Catalog</h2>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs text-slate-500">Pharmaceutical Stock Levels, Expiration & Suppliers</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products, suppliers, or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Healthcare">Healthcare 💊</option>
              <option value="Food">Food 🍖</option>
              <option value="Toys">Toys 🎾</option>
              <option value="Accessories">Accessories 🦮</option>
              <option value="Grooming Supplies">Grooming 🧼</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Item / Drug Name</th>
              <th className="py-3.5 px-5">Category & Batch</th>
              <th className="py-3.5 px-5">Unit Price</th>
              <th className="py-3.5 px-5">Stock Level</th>
              <th className="py-3.5 px-5">Expiry Date</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {products.length > 0 ? (
              products.map((item) => {
                const isLowStock = item.stockQuantity <= 5;
                const expiry = item.expiryDate ? new Date(item.expiryDate) : null;
                const daysToExpiry = expiry ? Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24)) : 999;
                const isExpiringSoon = daysToExpiry <= 30 && daysToExpiry >= 0;

                return (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span>{item.itemName}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">Supplier: {item.supplier || 'Direct'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-emerald-100 block w-fit">
                        {item.category}
                      </span>
                      {item.batchNo && (
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {item.batchNo}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-900 font-bold">
                      Rs. {Number(item.price).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 py-1 px-2.5 text-[11px] font-semibold rounded-full border ${
                          isLowStock 
                            ? 'bg-rose-50 text-rose-700 border-rose-200/80 animate-pulse' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        }`}>
                          {isLowStock ? <AlertTriangle className="w-3 h-3 text-rose-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {item.stockQuantity} {item.unit || 'units'}
                        </span>

                        <button
                          onClick={() => setSelectedProductForAdjust(item)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] transition-colors border border-slate-200 flex items-center gap-0.5"
                          title="Quick Adjust Stock Quantity"
                        >
                          <SlidersHorizontal className="w-3 h-3" /> Adjust
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      {expiry ? (
                        <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-medium px-2 py-0.5 rounded ${
                          isExpiringSoon ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-600'
                        }`}>
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {expiry.toLocaleDateString()} {isExpiringSoon ? '⚠️ Expiring' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        title="Edit Item"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(item._id)}
                        className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                        title="Discontinue Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-12 px-4 text-center">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-100">
                      <Package className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">No inventory products found</h3>
                    <p className="text-xs text-slate-400">
                      {searchTerm || categoryFilter !== 'All'
                        ? 'No stock items match your search or filter.'
                        : 'Add your first medication or stock item above!'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedProductForAdjust && (
        <StockAdjustModal
          product={selectedProductForAdjust}
          onClose={() => setSelectedProductForAdjust(null)}
          onAdjust={(id, delta) => {
            onAdjustStock(id, delta);
            setSelectedProductForAdjust(null);
          }}
        />
      )}
    </div>
  );
};

export default InventoryList;
