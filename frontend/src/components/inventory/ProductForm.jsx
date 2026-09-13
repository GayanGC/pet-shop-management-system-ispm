import React, { useState } from 'react';
import { Package, DollarSign, Layers, Truck, Tag, Plus, Calendar, X } from 'lucide-react';

const ProductForm = ({ suppliers = [], onSubmit, isLoading, isModal, onClose }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Food',
    price: '',
    stockQuantity: '',
    supplier: '',
    batchNo: '',
    expiryDate: '',
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
      batchNo: '',
      expiryDate: '',
      unit: 'Piece'
    });
    if (isModal && onClose) onClose();
  };

  const formContent = (
    <form onSubmit={handleSubmit} className={`p-6 space-y-5 transition-all duration-300 ${isModal ? 'bg-white/95 backdrop-blur-lg rounded-3xl border border-slate-200/80 shadow-2xl' : 'bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md'}`}>
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {isModal ? 'Register New Product' : 'Quick Stock Registration'}
            </h3>
            <p className="text-xs text-slate-500">Add medicine, diet, or clinical supplies</p>
          </div>
        </div>
        {isModal && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" /> Item Name *
          </label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            placeholder="e.g. Amoxicillin 250mg"
            required
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" /> Clinical Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all cursor-pointer font-medium text-slate-700"
          >
            <option value="Food">Pet Food & Nutrition</option>
            <option value="Medicine">Prescription Medicine</option>
            <option value="Vaccines">Vaccines & Biologics</option>
            <option value="Healthcare">General Healthcare</option>
            <option value="Accessories">Accessories & Gear</option>
            <option value="Toys">Toys & Enrichment</option>
            <option value="Supplements">Supplements & Vitamins</option>
            <option value="Grooming">Grooming & Hygiene</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Retail Price (LKR - Rs.) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rs.</span>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="1200.00"
              required
              min="0"
              step="0.01"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all font-mono placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-slate-400" /> Stock Quantity *
          </label>
          <input
            type="number"
            name="stockQuantity"
            value={formData.stockQuantity}
            onChange={handleChange}
            placeholder="e.g. 50"
            required
            min="0"
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-slate-400" /> Supplier / Vendor
          </label>
          <input
            type="text"
            name="supplier"
            list="registered-suppliers-list"
            value={formData.supplier}
            onChange={handleChange}
            placeholder="e.g. VetMed Lanka or MediVet"
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400"
          />
          {Array.isArray(suppliers) && suppliers.length > 0 && (
            <datalist id="registered-suppliers-list">
              {suppliers.map((s) => (
                <option key={s._id} value={s.name}>
                  {s.name} ({s.phone || s.contactPerson || 'Vendor'})
                </option>
              ))}
            </datalist>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" /> Batch Number
          </label>
          <input
            type="text"
            name="batchNo"
            value={formData.batchNo}
            onChange={handleChange}
            placeholder="e.g. BATCH-2026-09"
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Expiry Date
          </label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" /> Unit Description
          </label>
          <input
            type="text"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="e.g. Pack, Bottle, Piece, kg"
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 px-6 rounded-xl shadow-sm hover:shadow-teal-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          {isLoading ? 'Adding Stock Product...' : 'Add Stock Item'}
        </button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all duration-300">
        <div className="max-w-4xl w-full transform transition-all duration-300 animate-in fade-in zoom-in-95">
          {formContent}
        </div>
      </div>
    );
  }

  return formContent;
};

export default ProductForm;
