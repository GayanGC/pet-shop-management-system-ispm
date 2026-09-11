import React, { useState } from 'react';
import {
  ShoppingCart,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Filter,
  Search,
  Tag,
  Package,
  Star,
  ShieldCheck,
  Truck,
  Heart
} from 'lucide-react';

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

// Curated High-Definition Pet & Veterinary Product Photography
export const getProductImage = (item) => {
  if (item.imageUrl) return item.imageUrl;
  const name = (item.itemName || '').toLowerCase();
  const cat = (item.category || '').toLowerCase();

  if (cat.includes('food') || name.includes('food') || name.includes('kibble') || name.includes('treat') || name.includes('pedigree') || name.includes('whiskas')) {
    if (name.includes('cat') || name.includes('kitten') || name.includes('feline')) {
      return 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80';
    }
    return 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=600&q=80';
  }

  if (name.includes('spray') || name.includes('flea') || name.includes('tick')) {
    return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80';
  }

  if (name.includes('vaccine') || name.includes('injection') || name.includes('antibiotic') || name.includes('parvo') || name.includes('rabies') || name.includes('deworm')) {
    return 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80';
  }

  if (cat.includes('toy') || name.includes('ball') || name.includes('rope') || name.includes('chew')) {
    return 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=600&q=80';
  }

  if (cat.includes('accessories') || name.includes('collar') || name.includes('leash') || name.includes('harness')) {
    return 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80';
  }

  if (cat.includes('groom') || name.includes('shampoo') || name.includes('wash') || name.includes('soap') || name.includes('conditioner')) {
    return 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80';
  }

  if (cat.includes('health') || cat.includes('med') || name.includes('syrup') || name.includes('vitamin')) {
    return 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80';
  }

  return 'https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?auto=format&fit=crop&w=600&q=80';
};

const ProductShowcase = ({
  products = [],
  onAddToCart,
  onQuickBuy,
  cartCount = 0,
  onOpenCart,
  title = '🐾 Customer Pharmacy & Pet Storefront',
  subtitle = 'Official veterinary pharmaceuticals, prescription diets, and clinic-certified pet care essentials'
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedItemMap, setAddedItemMap] = useState({});

  const filteredProducts = products.filter((item) => {
    if (item.status === 'Disposed') return false;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.batchNo && item.batchNo.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddWithFeedback = (item) => {
    if (onAddToCart) onAddToCart(item);
    setAddedItemMap((prev) => ({ ...prev, [item._id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [item._id]: false }));
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Card */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-6 rounded-3xl border border-teal-150 dark:border-slate-800 shadow-xl shadow-teal-950/5 space-y-4 transition-all">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-400/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar & Cart Shortcut */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, brands or batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none text-slate-800 dark:text-slate-100 font-medium"
              />
            </div>

            {onOpenCart && cartCount > 0 && (
              <button
                onClick={onOpenCart}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-teal-700/20 hover:shadow-lg active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart ({cartCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {['All', 'Healthcare', 'Food', 'Toys', 'Accessories', 'Grooming Supplies'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 text-white shadow-md shadow-teal-700/25 scale-105'
                  : 'bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{cat === 'All' ? '🌟' : CATEGORY_ICONS[cat] || '📦'}</span>
              <span>{cat}</span>
              {cat === 'All' && <span className="text-[10px] opacity-75">({products.length})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Product Showcase Grid with Rich Photo Cards */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((item) => {
            const isLowStock = item.stockQuantity <= 5 && item.stockQuantity > 0;
            const isOutOfStock = item.stockQuantity === 0;
            const itemPrice = Number(item.price);
            const originalPrice = Math.round(itemPrice * 1.15); // Simulated MSRP saving
            const productImage = getProductImage(item);
            const isJustAdded = addedItemMap[item._id];

            return (
              <div
                key={item._id}
                className="group bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-teal-500/60 dark:hover:border-teal-500/50 shadow-lg shadow-slate-900/5 dark:shadow-slate-950/50 hover:shadow-2xl hover:shadow-teal-900/15 dark:hover:shadow-teal-950/50 transform transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between overflow-hidden"
              >
                {/* 1. Rich Photo Container with Hover Zoom & Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={productImage}
                    alt={item.itemName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20" />

                  {/* Category Pill Top Left */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md bg-slate-950/60 text-white border border-white/20 shadow-md flex items-center gap-1">
                      <span>{CATEGORY_ICONS[item.category] || '📦'}</span>
                      <span>{item.category}</span>
                    </span>
                  </div>

                  {/* Stock Status Badge Top Right */}
                  <div className="absolute top-3 right-3">
                    {isOutOfStock ? (
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-md bg-rose-600/90 text-white shadow-md border border-rose-400/40">
                        ✕ Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-md bg-amber-500/95 text-slate-950 shadow-md border border-amber-300 animate-pulse">
                        ⚠️ Only {item.stockQuantity} Left!
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-md bg-emerald-600/90 text-white shadow-md border border-emerald-400/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        In Stock ({item.stockQuantity})
                      </span>
                    )}
                  </div>

                  {/* Bottom Rating & Supplier Overlay */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
                    <div className="flex items-center gap-1 bg-slate-950/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 font-bold">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>4.9</span>
                      <span className="text-[9px] text-slate-300 font-normal">(38)</span>
                    </div>

                    <span className="bg-slate-950/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-semibold truncate max-w-[140px]">
                      {item.supplier || 'Veterinary Certified'}
                    </span>
                  </div>
                </div>

                {/* 2. Product Body Details */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {item.itemName}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      {item.batchNo && <span className="font-mono">Batch: {item.batchNo}</span>}
                      {item.unit && <span>• {item.unit}</span>}
                      <span>• <Truck className="w-3 h-3 inline text-emerald-500" /> Fast Delivery</span>
                    </div>
                  </div>

                  {/* 3. LKR Pricing Display with Discount Comparison */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 line-through font-mono">
                          Rs. {originalPrice.toFixed(2)}
                        </span>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-sans">
                          SAVE 15%
                        </span>
                      </div>
                      <span className="text-xl font-black bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-teal-300 dark:to-emerald-300 font-mono tracking-tight">
                        Rs. {itemPrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold mb-1">
                      per {item.unit || 'pack'}
                    </span>
                  </div>
                </div>

                {/* 4. Action Buttons (+ Cart & ⚡ Quick Buy) */}
                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => handleAddWithFeedback(item)}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      isJustAdded
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white shadow-teal-700/20'
                    }`}
                    title="Add item to checkout cart"
                  >
                    {isJustAdded ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 animate-bounce" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>+ Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => onQuickBuy && onQuickBuy(item)}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Instant Checkout with Diverse Payment Methods"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ Quick Buy</span>
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
            Try choosing a different category pill or clearing your search term.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductShowcase;
