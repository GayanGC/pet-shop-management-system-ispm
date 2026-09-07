import React, { useState } from 'react';
import { X, Package, Plus, Minus, Check } from 'lucide-react';

const StockAdjustModal = ({ product, onClose, onAdjust }) => {
  const [delta, setDelta] = useState(1);

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-fadeIn">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Quick Stock Adjustment</h2>
              <p className="text-xs text-slate-500">{product.itemName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-center space-y-1">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Current Stock Quantity</span>
          <span className="text-3xl font-extrabold text-slate-800 font-mono">{product.stockQuantity} {product.unit || 'units'}</span>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">Adjustment Quantity Delta</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                onAdjust(product._id, Math.abs(delta));
                onClose();
              }}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Add (+{Math.abs(delta)}) Stock
            </button>
            <button
              onClick={() => {
                onAdjust(product._id, -Math.abs(delta));
                onClose();
              }}
              className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Minus className="w-4 h-4" /> Deduct (-{Math.abs(delta)}) Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustModal;
