import React, { useState } from 'react';

const ProductForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Food',
    price: '',
    stockQuantity: '',
    supplier: '',
    unit: 'Piece'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemName || formData.price === '' || formData.stockQuantity === '') {
      alert('Please fill in required fields: Item Name, Price, and Stock Quantity');
      return;
    }
    onSubmit(formData);
    setFormData({
      itemName: '',
      category: 'Food',
      price: '',
      stockQuantity: '',
      supplier: '',
      unit: 'Piece'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-gray-100">
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="text-xl font-bold text-gray-800">📦 Add Inventory Product</h2>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">Member 2 Module</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item / Product Name *</label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            placeholder="e.g. Royal Canin Adult Dog Food 3kg"
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="Food">Food 🍖</option>
            <option value="Toys">Toys 🎾</option>
            <option value="Accessories">Accessories 🦮</option>
            <option value="Healthcare">Healthcare 💊</option>
            <option value="Grooming Supplies">Grooming Supplies 🧼</option>
            <option value="General">General 📦</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($ / LKR) *</label>
          <input
            type="number"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g. 24.99"
            required
            min="0"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock Quantity *</label>
          <input
            type="number"
            name="stockQuantity"
            value={formData.stockQuantity}
            onChange={handleChange}
            placeholder="e.g. 50"
            required
            min="0"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Supplier / Vendor</label>
          <input
            type="text"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            placeholder="e.g. Pet Care Wholesale Supplies"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
          <input
            type="text"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="e.g. Pack, Bottle, Piece, kg"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 shadow"
      >
        {isLoading ? 'Adding Product...' : 'Add Stock Item'}
      </button>
    </form>
  );
};

export default ProductForm;
