import React, { useState } from 'react';
import { ShoppingCart, Zap, CheckCircle2, AlertTriangle, Sparkles, Filter, Search, Tag, Package } from 'lucide-react';

const CATEGORY_ICONS = {
  Healthcare: '💊',
  Food: '🍖',
  Toys: '🎾',
  Accessories: '🦮',
  'Grooming Supplies': '🧼',
  General: '📦'
};

const CATEGORY_GRADIENTS = {
  Healthcare: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/20 border-emerald-400/40 text-emerald-800 dark:text-emerald-300',
  Food: 'from-amber-500/20 via-orange-500/10 to-yellow-500/20 border-amber-400/40 text-amber-800 dark:text-amber-300',
  Toys: 'from-purple-500/20 via-indigo-500/10 to-pink-500/20 border-purple-400/40 text-purple-800 dark:text-purple-300',
  Accessories: 'from-blue-500/20 via-cyan-500/10 to-teal-500/20 border-blue-400/40 text-blue-800 dark:text-blue-300',
  'Grooming Supplies': 'from-rose-500/20 via-pink-500/10 to-amber-500/20 border-rose-400/40 text-rose-800 dark:text-rose-300',
  General: 'from-slate-500/20 via-slate-600/10 to-slate-700/20 border-slate-400/40 text-slate-800 dark:text-slate-300'
};

const ProductShowcase = ({ products = [], onAddToCart, onQuickBuy, title = 'Pharmacy & Pet Care Products Showcase', subtitle = 'Explore certified veterinary medicines, premium nutrition, and pet essentials' }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((item) => {
    if (item.status === 'Disposed') return false;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Category Filter Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-xl shadow-teal-950/5 space-y-4 transition-all">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-md">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {title}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          </div>

          {/* Search within Store */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, brand or drug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {['All', 'Healthcare', 'Food', 'Toys', 'Accessories', 'Grooming Supplies'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md shadow-teal-700/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{cat === 'All' ? '🌟' : CATEGORY_ICONS[cat] || '📦'}</span>
              <span>{cat}</span>
              {cat === 'All' && <span className="text-[10px] opacity-75">({products.length})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Showcase Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((item) => {
            const isLowStock = item.stockQuantity <= 5 && item.stockQuantity > 0;
            const isOutOfStock = item.stockQuantity === 0;
            const gradientStyle = CATEGORY_GRADIENTS[item.category] || CATEGORY_GRADIENTS.General;

            return (
              <div
                key={item._id}
                className="group bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/50 dark:hover:border-teal-500/50 shadow-lg shadow-slate-900/5 dark:shadow-slate-950/50 hover:shadow-2xl hover:shadow-teal-900/20 dark:hover:shadow-teal-950/60 transform transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
              >
                {/* Top Banner with Icon & Tag */}
                <div className={`p-4 bg-gradient-to-br ${gradientStyle} border-b flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl drop-shadow-sm">{CATEGORY_ICONS[item.category] || '📦'}</span>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider block">
                        {item.category}
                      </span>
                      <span className="text-[10px] opacity-80 truncate max-w-[120px] block">
                        {item.supplier || 'Veterinary Grade'}
                      </span>
                    </div>
                  </div>

                  {/* Stock Glow Status */}
                  <div>
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                        ⚠️ Only {item.stockQuantity} Left!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        In Stock ({item.stockQuantity})
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {item.itemName}
                    </h3>
                    {item.batchNo && (
                      <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                        Batch: {item.batchNo}
                      </p>
                    )}
                  </div>

                  {/* LKR Price Display */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">
                        Clinic Price (LKR)
                      </span>
                      <span className="text-xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-cyan-300 font-mono">
                        Rs. {Number(item.price).toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      per {item.unit || 'unit'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => onAddToCart && onAddToCart(item)}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-700/20 hover:shadow-lg hover:shadow-teal-600/30 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Add item to checkout cart"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>+ Cart</span>
                  </button>

                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => onQuickBuy && onQuickBuy(item)}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Instant Checkout"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ Buy Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 flex items-center justify-center mx-auto border border-teal-100 dark:border-teal-800">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No products match your criteria</h3>
          <p className="text-xs text-slate-400">
            Try choosing a different category pill or clearing the search query.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductShowcase;
