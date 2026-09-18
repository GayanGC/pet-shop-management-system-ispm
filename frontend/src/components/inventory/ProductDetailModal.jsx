import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  Zap,
  Star,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Tag,
  Package,
  Heart,
  Plus,
  Minus,
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';
import { getProductImage } from './ProductShowcase';

const CATEGORY_ICONS = {
  Medicines: '💊',
  Medicine: '💊',
  Vaccines: '💉',
  Nutrition: '🍖',
  Food: '🍖',
  Supplements: '✨',
  Healthcare: '🩺',
  Accessories: '🦮',
  Toys: '🎾',
  Clinical: '🔬',
  General: '📦'
};

// Generate realistic clinical & dosage information based on product type
const getProductClinicalInfo = (item) => {
  const name = (item.itemName || '').toLowerCase();
  const cat = (item.category || '').toLowerCase();

  let targetSpecies = ['Dogs 🐕', 'Cats 🐈'];
  let dosage = 'Administer as directed by veterinary physician. Standard dosage varies by pet body weight.';
  let healthBenefits = 'Provides targeted clinical relief, immune support, and rapid wellness enhancement.';
  let precautions = 'Store below 25°C in a dry place away from direct sunlight. Keep out of reach of children.';

  if (name.includes('amoxicillin') || name.includes('antibiotic')) {
    dosage = '10-20 mg/kg orally every 12 hours with food, or per attending veterinary prescription.';
    healthBenefits = 'Broad-spectrum antibacterial protection for respiratory, skin, and urinary tract infections.';
    precautions = 'Complete the full prescribed clinical course. Monitor for gastrointestinal sensitivity.';
  } else if (name.includes('vaccine') || name.includes('rabisin') || name.includes('parvo')) {
    dosage = '1.0 mL subcutaneous injection administered exclusively by certified veterinary staff.';
    healthBenefits = 'Induces robust active immunity against lethal viral pathogens; valid for official health passport registration.';
    precautions = 'Keep refrigerated at 2°C – 8°C (Cold Chain mandatory). Do not freeze.';
    targetSpecies = ['Canines 🐕', 'Felines 🐈'];
  } else if (name.includes('flea') || name.includes('tick') || name.includes('spray') || name.includes('bravecto')) {
    dosage = 'Topical application once every 30-90 days along the dorsal spine line or coat spray.';
    healthBenefits = 'Immediate knockdown of adult fleas, ticks, and mange mites; breaks parasite breeding cycle.';
    precautions = 'Avoid contact with animal eyes and mouth. Allow coat to dry thoroughly after topical application.';
  } else if (cat.includes('food') || name.includes('kibble') || name.includes('royal canin') || name.includes('whiskas')) {
    dosage = 'Feed daily portion according to animal age and weight chart printed on the package.';
    healthBenefits = 'Clinically balanced macronutrients, omega-3 fatty acids for coat shine, and prebiotic fibers for optimal digestion.';
    precautions = 'Ensure clean drinking water is available at all times. Reseal pouch after opening.';
  } else if (name.includes('vitamin') || name.includes('supplement') || name.includes('calcium')) {
    dosage = '1 chewable tablet or 5ml syrup per 10kg pet body weight daily.';
    healthBenefits = 'Enhances bone density, joint mobility, cognitive vitality, and natural immune resistance.';
    precautions = 'Dietary supplement only; not a substitute for complete prescription medication.';
  }

  return { targetSpecies, dosage, healthBenefits, precautions };
};

// Calculate Days until expiry
const getExpiryDaysRemaining = (expiryDateStr) => {
  if (!expiryDateStr) return null;
  const expiry = new Date(expiryDateStr);
  if (isNaN(expiry.getTime())) return null;
  const today = new Date();
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const ProductDetailModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onQuickBuy
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  if (!isOpen || !product) return null;

  const productImage = getProductImage(product);
  const itemPrice = Number(product.price) || 0;
  const originalPrice = Math.round(itemPrice * 1.15);
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
  const daysToExpiry = getExpiryDaysRemaining(product.expiryDate);
  const clinicalInfo = getProductClinicalInfo(product);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleIncrease = () => {
    if (quantity < (product.stockQuantity || 99)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleAdd = () => {
    if (isOutOfStock) return;
    if (onAddToCart) {
      onAddToCart(product, quantity);
      setIsAddedFeedback(true);
      setTimeout(() => setIsAddedFeedback(false), 1500);
    }
  };

  const handleBuy = () => {
    if (isOutOfStock) return;
    if (onQuickBuy) {
      onQuickBuy(product, quantity);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md transition-all duration-300 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-bold">
              {CATEGORY_ICONS[product.category] || '📦'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  {product.category || 'Pharmaceutical Product'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                  ✓ Official Clinic Pharmacy
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 flex items-center justify-center transition-transform hover:rotate-90 cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {/* Left Column: Rich Photo & Core Badges */}
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner group aspect-square max-h-80 md:max-h-none">
              <img
                src={productImage}
                alt={product.itemName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Status Floating Pill */}
              <div className="absolute top-4 left-4">
                {isOutOfStock ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600/95 text-white shadow-lg backdrop-blur-md border border-rose-400/40">
                    ✕ Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/95 text-slate-950 shadow-lg backdrop-blur-md border border-amber-300 animate-pulse">
                    ⚠️ Low Stock ({product.stockQuantity} remaining)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600/95 text-white shadow-lg backdrop-blur-md border border-emerald-400/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    In Stock ({product.stockQuantity} units)
                  </span>
                )}
              </div>

              {/* Supplier & Authenticity Badge Bottom */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 font-bold truncate max-w-[200px]">
                  Vendor: {product.supplier || 'Direct Certified Supplier'}
                </span>
                <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 font-mono text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Authentic
                </span>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3 text-teal-600" /> Batch Number
                </span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {product.batchNo || 'BATCH-2026-REG'}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-500" /> Expiration Date
                </span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {product.expiryDate
                    ? new Date(product.expiryDate).toLocaleDateString('en-GB')
                    : '2026-12-31'}
                </p>
                {daysToExpiry !== null && (
                  <span
                    className={`text-[9px] font-bold ${
                      daysToExpiry <= 30
                        ? 'text-rose-500 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {daysToExpiry > 0 ? `(${daysToExpiry} days remaining)` : '(Expired)'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Title, Pricing, Clinical Info & Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Product Title & Unit */}
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {product.itemName}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <span>Unit Dispensing: <strong className="text-slate-700 dark:text-slate-300">{product.unit || 'Piece / Pack'}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Truck className="w-3.5 h-3.5" /> Island-wide Delivery
                  </span>
                </p>
              </div>

              {/* Price Display */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50/70 to-emerald-50/70 dark:from-slate-800 dark:to-slate-800/60 border border-teal-200/50 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 line-through font-mono">
                      Rs. {Number(originalPrice).toLocaleString()}.00
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      SAVE 15%
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-teal-300 dark:to-emerald-300 font-mono tracking-tight">
                    Rs. {Number(itemPrice).toLocaleString()}.00
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Retail Price (LKR)
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Taxes included</span>
                </div>
              </div>

              {/* Target Animal Species Chips */}
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">
                  🐾 Safe & Approved Species
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {clinicalInfo.targetSpecies.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Clinical Description & Dosage */}
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Clinical Indications & Benefits
                  </h4>
                  <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                    {clinicalInfo.healthBenefits}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                    <Info className="w-3.5 h-3.5 text-teal-600" /> Administration & Dosage Guidelines
                  </h4>
                  <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                    {clinicalInfo.dosage}
                  </p>
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                  * Note: {clinicalInfo.precautions}
                </p>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Select Order Quantity:
                </span>
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black shadow-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-mono font-black text-sm text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrease}
                    disabled={quantity >= (product.stockQuantity || 99) || isOutOfStock}
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black shadow-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Buttons: Add to Cart & Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAdd}
                  className={`py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isAddedFeedback
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                      : 'bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white shadow-teal-700/25'
                  }`}
                >
                  {isAddedFeedback ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 animate-bounce" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>🛒 Add to Cart ({quantity})</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuy}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4" />
                  <span>⚡ Instant Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
