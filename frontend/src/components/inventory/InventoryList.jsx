import React, { useState } from 'react';
import { Search, Filter, Package, AlertTriangle, Edit3, Trash2, CheckCircle2, SlidersHorizontal, Calendar } from 'lucide-react';
import StockAdjustModal from './StockAdjustModal';

const InventoryList = ({ 
  products = [], 
  onDelete, 
  onEdit, 
  onAdjustStock, 
  searchTerm, 
  setSearchTerm, 
  categoryFilter, 
  setCategoryFilter,
  readOnly = false 
}) => {
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState(null);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden space-y-0 transition-colors">
      {/* Header & Filter Bar */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {readOnly ? '💊 Clinical Medication & Formulary Catalog' : 'Pharmacy & Stock Catalog'}
            </h2>
            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
              {products.length} Items
            </span>
            {readOnly && (
              <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                Staff Clinical Reference
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {readOnly
              ? 'Real-time veterinary medication stock availability, active batches & prescription reference.'
              : 'Pharmaceutical Stock Levels, Expiration & Suppliers'}
          </p>
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
              <option value="Healthcare">Healthcare</option>
              <option value="Medicine">Prescription Medicine</option>
              <option value="Vaccines">Vaccines & Biologics</option>
              <option value="Supplements">Supplements & Vitamins</option>
              <option value="Food">Pet Nutrition & Diets</option>
              <option value="Clinical Supplies">Clinical Supplies</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-5">Item / Drug Name</th>
              <th className="py-3.5 px-5">Category & Batch</th>
              <th className="py-3.5 px-5">Unit Price</th>
              <th className="py-3.5 px-5">Stock Level</th>
              <th className="py-3.5 px-5">Expiry Date</th>
              <th className="py-3.5 px-5 text-right">{readOnly ? 'Formulary Status' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {products.length > 0 ? (
              products.map((item) => {
                const isLowStock = item.stockQuantity <= 5;
                const expiry = item.expiryDate ? new Date(item.expiryDate) : null;
                const daysToExpiry = expiry ? Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24)) : 999;
                const isExpiringSoon = daysToExpiry <= 30 && daysToExpiry >= 0;

                return (
                  <tr key={item._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span>{item.itemName}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">Supplier: {item.supplier || 'Direct'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-emerald-100 dark:border-emerald-800 block w-fit">
                        {item.category}
                      </span>
                      {item.batchNo && (
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {item.batchNo}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-900 dark:text-emerald-300 font-bold">
                      Rs. {Number(item.price).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 py-1 px-2.5 text-[11px] font-semibold rounded-full border ${
                          isLowStock 
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800 animate-pulse' 
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800'
                        }`}>
                          {isLowStock ? <AlertTriangle className="w-3 h-3 text-rose-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {item.stockQuantity} {item.unit || 'units'}
                        </span>

                        {!readOnly && (
                          <button
                            onClick={() => setSelectedProductForAdjust(item)}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-[10px] transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-0.5 cursor-pointer"
                            title="Quick Adjust Stock Quantity"
                          >
                            <SlidersHorizontal className="w-3 h-3" /> Adjust
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      {expiry ? (
                        <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-medium px-2 py-0.5 rounded ${
                          isExpiringSoon ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold' : 'text-slate-600 dark:text-slate-300'
                        }`}>
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {expiry.toLocaleDateString()} {isExpiringSoon ? '⚠️ Expiring' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      {readOnly ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
                          🩺 Clinical Available
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(item._id)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-all cursor-pointer"
                            title="Discontinue Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
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
