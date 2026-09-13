import React, { useState } from 'react';
import { Package, DollarSign, Layers, Truck, Tag, Plus, Calendar, X, AlertCircle } from 'lucide-react';

// ─── Validation ─────────────────────────────────────────────────────────────
const BATCH_RE = /^[A-Z0-9\-]{3,30}$/;

const getTodayStr = () => new Date().toISOString().split('T')[0];

const validate = (data) => {
  const errors = {};

  // Item Name: 3–50 chars
  if (!data.itemName.trim()) {
    errors.itemName = 'Item name is required.';
  } else if (data.itemName.trim().length < 3 || data.itemName.trim().length > 50) {
    errors.itemName = 'Item name must be between 3 and 50 characters.';
  }

  // Price > 0
  const price = parseFloat(data.price);
  if (data.price === '' || isNaN(price)) {
    errors.price = 'Price is required.';
  } else if (price <= 0) {
    errors.price = 'Price must be greater than Rs. 0.';
  }

  // Stock Quantity >= 0
  const qty = parseInt(data.stockQuantity, 10);
  if (data.stockQuantity === '' || isNaN(qty)) {
    errors.stockQuantity = 'Stock quantity is required.';
  } else if (qty < 0) {
    errors.stockQuantity = 'Stock quantity cannot be negative.';
  }

  // Batch No: uppercase alphanumeric if provided
  if (data.batchNo && !BATCH_RE.test(data.batchNo)) {
    errors.batchNo = 'Batch number must be uppercase alphanumeric (e.g. BTH-2026-01). 3–30 chars.';
  }

  // Expiry Date: must be in the future if provided
  if (data.expiryDate) {
    if (data.expiryDate <= getTodayStr()) {
      errors.expiryDate = 'Expiry date must be a future date.';
    }
  }

  return errors;
};

// ─── ProductForm Component ───────────────────────────────────────────────────
const ProductForm = ({ suppliers = [], onSubmit, isLoading, isModal, onClose }) => {
  const INITIAL = {
    itemName: '',
    category: 'Food',
    price: '',
    stockQuantity: '',
    supplier: '',
    batchNo: '',
    expiryDate: '',
    unit: 'Piece'
  };

  const [formData, setFormData] = useState(INITIAL);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    let { name, value } = e.target;
    // Auto-uppercase batch number
    if (name === 'batchNo') value = value.toUpperCase();
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errors = validate(formData);
    setFieldErrors((prev) => ({ ...prev, [name]: errors[name] || '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate(formData);
    setFieldErrors(errors);
    setTouched({ itemName: true, price: true, stockQuantity: true, batchNo: true, expiryDate: true });

    if (Object.keys(errors).length > 0) return;

    onSubmit(formData);
    setFormData(INITIAL);
    setFieldErrors({});
    setTouched({});
    if (isModal && onClose) onClose();
  };

  const fieldClass = (name) =>
    `w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-800/60 border rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400 ${
      touched[name] && fieldErrors[name]
        ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500'
        : 'border-slate-200 dark:border-slate-700 focus:border-teal-600'
    }`;

  const ErrorMsg = ({ name }) =>
    touched[name] && fieldErrors[name] ? (
      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {fieldErrors[name]}
      </p>
    ) : null;

  const formContent = (
    <form
      onSubmit={handleSubmit}
      className={`p-6 space-y-5 transition-all duration-300 ${
        isModal
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-2xl'
          : 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {isModal ? 'Register New Product' : 'Quick Stock Registration'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add medicine, diet, or clinical supplies</p>
          </div>
        </div>
        {isModal && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Item Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" /> Item Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Amoxicillin 250mg"
            minLength={3}
            maxLength={50}
            className={fieldClass('itemName')}
          />
          <ErrorMsg name="itemName" />
          {!fieldErrors.itemName && (
            <p className="text-[10px] text-slate-400 mt-0.5">{formData.itemName.trim().length}/50 characters</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" /> Clinical Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all cursor-pointer font-medium text-slate-700 dark:text-slate-300"
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

        {/* Price */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Retail Price (LKR - Rs.) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rs.</span>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="1200.00"
              min="0.01"
              step="0.01"
              className={`pl-10 pr-3.5 py-2.5 w-full bg-slate-50/50 dark:bg-slate-800/60 border rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all font-mono placeholder:text-slate-400 placeholder:font-sans ${
                touched.price && fieldErrors.price
                  ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-teal-600'
              }`}
            />
          </div>
          <ErrorMsg name="price" />
        </div>

        {/* Stock Quantity */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-slate-400" /> Stock Quantity <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="stockQuantity"
            value={formData.stockQuantity}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 50"
            min="0"
            step="1"
            className={`${fieldClass('stockQuantity')} font-mono`}
          />
          <ErrorMsg name="stockQuantity" />
        </div>

        {/* Supplier */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-slate-400" /> Supplier / Vendor
          </label>
          <input
            type="text"
            name="supplier"
            list="registered-suppliers-list"
            value={formData.supplier}
            onChange={handleChange}
            placeholder="e.g. VetMed Lanka or MediVet"
            className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400"
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

        {/* Batch Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" /> Batch Number
          </label>
          <input
            type="text"
            name="batchNo"
            value={formData.batchNo}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. BTH-2026-09"
            maxLength={30}
            className={`${fieldClass('batchNo')} font-mono uppercase`}
          />
          <ErrorMsg name="batchNo" />
          {!fieldErrors.batchNo && (
            <p className="text-[10px] text-slate-400 mt-0.5">Auto-uppercased — letters, numbers, and hyphens only</p>
          )}
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Expiry Date
          </label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            onBlur={handleBlur}
            min={getTodayStr()}
            className={fieldClass('expiryDate')}
          />
          <ErrorMsg name="expiryDate" />
          {!fieldErrors.expiryDate && formData.expiryDate && (
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">✓ Future expiry date set</p>
          )}
        </div>

        {/* Unit */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" /> Unit Description
          </label>
          <input
            type="text"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="e.g. Pack, Bottle, Piece, kg"
            className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400"
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
