import React from 'react';

const InventoryList = ({ products = [], onDelete, onEdit, searchTerm, setSearchTerm, categoryFilter, setCategoryFilter }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Inventory Stock Directory</h2>
          <p className="text-xs text-gray-500">Member 2 Scope - Stock Control & Products</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search products or suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none flex-grow md:w-60"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Toys">Toys</option>
            <option value="Accessories">Accessories</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Grooming Supplies">Grooming</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="p-3">Item Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Unit Price</th>
              <th className="p-3">Stock Level</th>
              <th className="p-3">Supplier</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {products.length > 0 ? (
              products.map((item) => {
                const isLowStock = item.stockQuantity <= 5;
                return (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-semibold text-gray-800">{item.itemName}</td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-gray-900 font-bold">${Number(item.price).toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        isLowStock ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.stockQuantity} {item.unit || 'units'} {isLowStock ? '⚠️ Low Stock' : ''}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-600">{item.supplier || 'N/A'}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(item._id)}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded"
                      >
                        Discontinue
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400 text-sm">
                  No inventory products added yet. Use the form above to add items!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryList;
