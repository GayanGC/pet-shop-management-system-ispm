import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, CreditCard, DollarSign, Receipt, Percent, Stethoscope, Package } from 'lucide-react';
import productService from '../../services/inventoryService';

const CLINICAL_SERVICES = [
  { id: 'srv-1', name: 'General Veterinary Consultation', price: 1500, category: 'Consultation' },
  { id: 'srv-2', name: 'Rabies Vaccination & Health Endorsement', price: 2000, category: 'Immunization' },
  { id: 'srv-3', name: 'Surgical Wound Dressing & Bandaging', price: 1800, category: 'Wound Care' },
  { id: 'srv-4', name: 'Dental Scaling & Oral Debridement', price: 3500, category: 'Dental' },
  { id: 'srv-5', name: 'Clinical Diagnostics & Complete Hemogram', price: 4200, category: 'Laboratory' },
  { id: 'srv-6', name: 'Emergency Clinical Triage & Stabilization', price: 5000, category: 'Emergency' }
];

const POSBilling = ({
  products = [],
  onSubmitOrder,
  isLoading,
  cartItems: externalCartItems,
  setCartItems: externalSetCartItems,
  currentUser,
  onRequireAuth
}) => {
  const [internalCartItems, setInternalCartItems] = useState([]);
  const cartItems = externalCartItems !== undefined ? externalCartItems : internalCartItems;
  const setCartItems = externalSetCartItems !== undefined ? externalSetCartItems : setInternalCartItems;

  const [internalProducts, setInternalProducts] = useState(products || []);

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      setInternalProducts(products);
    } else {
      productService.getAllProducts().then((res) => {
        const items = Array.isArray(res) ? res : (res?.data || res?.products || []);
        if (items.length > 0) setInternalProducts(items);
      }).catch(console.error);
    }
  }, [products]);

  const availableProducts = internalProducts.length > 0 ? internalProducts : products;

  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [taxRate, setTaxRate] = useState(8); // Default 8% VAT
  const [customItemName, setCustomItemName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [catalogTab, setCatalogTab] = useState('products'); // 'products' | 'services'

  const handleAddClinicalService = (service) => {
    const existingIndex = cartItems.findIndex((item) => !item.product && item.itemName === service.name);
    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          product: null,
          itemName: service.name,
          unitPrice: Number(service.price),
          quantity: 1,
          subtotal: Number(service.price),
          isService: true
        }
      ]);
    }
  };

  const handleAddToCart = () => {
    if (selectedProductId) {
      const prod = availableProducts.find((p) => p._id === selectedProductId);
      if (!prod) return;

      const existingIndex = cartItems.findIndex((item) => item.product === prod._id);

      if (existingIndex > -1) {
        const updated = [...cartItems];
        updated[existingIndex].quantity += Number(itemQty);
        updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
        setCartItems(updated);
      } else {
        setCartItems([
          ...cartItems,
          {
            product: prod._id,
            itemName: prod.itemName,
            unitPrice: Number(prod.price),
            quantity: Number(itemQty),
            subtotal: Number(prod.price) * Number(itemQty)
          }
        ]);
      }
      setSelectedProductId('');
      setItemQty(1);
    } else if (customItemName && customPrice) {
      setCartItems([
        ...cartItems,
        {
          product: null,
          itemName: customItemName,
          unitPrice: Number(customPrice),
          quantity: Number(itemQty),
          subtotal: Number(customPrice) * Number(itemQty)
        }
      ]);
      setCustomItemName('');
      setCustomPrice('');
      setItemQty(1);
    } else {
      alert('Please select an inventory product or enter custom item details');
    }
  };

  const handleRemoveFromCart = (index) => {
    setCartItems(cartItems.filter((_, idx) => idx !== index));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * (Number(taxRate) / 100));
  };

  const calculateDiscount = () => {
    return (calculateSubtotal() * (Number(discountRate) / 100));
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return Math.max(0, subtotal - discount + tax);
  };
  const calculateFinalTotal = calculateGrandTotal;

  const handleCheckout = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Cart is empty! Add products before checking out.');
      return;
    }

    const finalTotal = calculateFinalTotal();
    const tenderedNum = Number(tenderedAmount || 0);

    if (paymentMethod === 'Cash') {
      if (!tenderedAmount || tenderedNum < finalTotal) {
        alert(`Tendered cash (Rs. ${tenderedNum.toFixed(2)}) cannot be less than invoice total (Rs. ${finalTotal.toFixed(2)}).`);
        return;
      }
    }

    if (!currentUser && onRequireAuth) {
      onRequireAuth(() => {
        // Will continue once authenticated
      }, 'Please sign in to complete your checkout and order.');
      return;
    }

    const orderPayload = {
      items: cartItems,
      totalAmount: calculateSubtotal(),
      finalTotal,
      discountRate: Number(discountRate),
      taxRate: Number(taxRate),
      paymentMethod,
      tenderedAmount: paymentMethod === 'Cash' ? tenderedNum : finalTotal,
      changeAmount: paymentMethod === 'Cash' ? Math.max(0, tenderedNum - finalTotal) : 0,
      paymentStatus: 'Paid'
    };

    onSubmitOrder(orderPayload);
    setCartItems([]);
    setTenderedAmount('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6 transition-colors">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-800 border border-teal-100 dark:border-slate-700 flex items-center justify-center text-teal-700 dark:text-teal-400 shadow-xs">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">POS Checkout Terminal</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sales Transactions & Real-time Stock Deduction</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item Selection Panel */}
        <div className="lg:col-span-1 space-y-4 border-r border-slate-100 dark:border-slate-800 pr-0 lg:pr-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-teal-600" /> 1. Select Items to Sell
            </h3>
          </div>

          {/* Catalog Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setCatalogTab('products')}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                catalogTab === 'products'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Medications</span>
            </button>
            <button
              type="button"
              onClick={() => setCatalogTab('services')}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                catalogTab === 'services'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Clinical Services</span>
            </button>
          </div>

          {catalogTab === 'products' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Select Stock Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setCustomItemName('');
                    setCustomPrice('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none transition-all text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <option value="">-- Choose Stock Product --</option>
                  {availableProducts.map((prod) => (
                    <option key={prod._id} value={prod._id}>
                      {prod.itemName} - Rs. {prod.price} (Stock: {prod.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                <span className="flex-shrink mx-2 text-slate-400 text-[10px] uppercase font-bold">or Custom Item</span>
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Custom Item / Procedure Name</label>
                <input
                  type="text"
                  placeholder="e.g. Minor Surgical Dressing / Consultation"
                  value={customItemName}
                  onChange={(e) => {
                    setCustomItemName(e.target.value);
                    setSelectedProductId('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Custom Price (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1500.00"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-sans text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={itemQty}
                  onChange={(e) => setItemQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none transition-all text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-teal-50 hover:bg-teal-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 font-semibold py-2.5 px-4 rounded-xl text-xs border border-teal-200/60 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product to Cart
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hospital clinical procedures & consultations (No inventory stock deduction):
              </p>
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {CLINICAL_SERVICES.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-2 hover:border-teal-500/60 transition-all shadow-2xs"
                  >
                    <div>
                      <span className="text-[9px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
                        {srv.category}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                        {srv.name}
                      </p>
                      <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                        Rs. {srv.price.toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddClinicalService(srv)}
                      className="py-1.5 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cart & Checkout Panel */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5 text-teal-600" /> 2. Order Cart Summary ({cartItems.length} items)
          </h3>

          <div className="overflow-x-auto min-h-[160px] border border-slate-200/80 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-800/30">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3.5">Item Name</th>
                  <th className="py-2.5 px-3.5">Price</th>
                  <th className="py-2.5 px-3.5">Qty</th>
                  <th className="py-2.5 px-3.5">Subtotal</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cartItems.length > 0 ? (
                  cartItems.map((item, idx) => (
                    <tr key={idx} className="bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800 dark:text-slate-100">
                        {item.itemName}
                        {!item.product && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40 uppercase">
                            Clinical Service
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-600 dark:text-slate-300">Rs. {item.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-700 dark:text-slate-300">{item.quantity}</td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900 dark:text-white">Rs. {item.subtotal.toFixed(2)}</td>
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          onClick={() => handleRemoveFromCart(idx)}
                          className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-all cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400 text-xs">
                      Cart is empty. Select items from the left panel to add to checkout.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Discount, Tax & Payment Controls */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Online">Online Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Discount Rate</label>
                <select
                  value={discountRate}
                  onChange={(e) => setDiscountRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-100 focus:outline-none font-mono"
                >
                  <option value={0}>0% No Discount</option>
                  <option value={5}>5% Special Promo</option>
                  <option value={10}>10% VIP Client</option>
                  <option value={15}>15% Staff Rate</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sales Tax / VAT</label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-100 focus:outline-none font-mono"
                >
                  <option value={0}>0% Tax Exempt</option>
                  <option value={8}>8% Standard Tax</option>
                  <option value={12}>12% VAT Rate</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center text-xs">
              <div className="space-y-0.5 text-slate-500 dark:text-slate-400 font-mono">
                <div>Subtotal: <span className="font-bold text-slate-700 dark:text-slate-200">Rs. {calculateSubtotal().toFixed(2)}</span></div>
                {discountRate > 0 && <div className="text-emerald-600 font-bold">Discount ({discountRate}%): -Rs. {calculateDiscount().toFixed(2)}</div>}
                {taxRate > 0 && <div>Tax ({taxRate}%): +Rs. {calculateTax().toFixed(2)}</div>}
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Final Total</span>
                <span className="text-2xl font-black text-teal-700 dark:text-teal-400 font-mono tracking-tight">
                  Rs. {calculateFinalTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Strict Cash Tendered & Change Return Panel */}
            {paymentMethod === 'Cash' && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                      <span>Cash Tendered (Rs.)</span>
                      {cartItems.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setTenderedAmount(String(calculateFinalTotal().toFixed(2)))}
                          className="text-[10px] text-teal-600 hover:text-teal-700 font-bold underline cursor-pointer"
                        >
                          Exact (Rs. {calculateFinalTotal().toFixed(2)})
                        </button>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={`Min: Rs. ${calculateFinalTotal().toFixed(2)}`}
                      value={tenderedAmount}
                      onChange={(e) => setTenderedAmount(e.target.value)}
                      className={`w-full px-3.5 py-2 bg-white dark:bg-slate-800 border rounded-xl font-mono text-xs font-bold focus:outline-none transition-all ${
                        cartItems.length > 0 && tenderedAmount !== '' && Number(tenderedAmount) < calculateFinalTotal()
                          ? 'border-rose-400 bg-rose-50/40 text-rose-700 focus:ring-2 focus:ring-rose-200'
                          : 'border-slate-300 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-slate-800 dark:text-slate-100'
                      }`}
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Change Due (Return to Client)
                    </span>
                    <div className={`px-3.5 py-2 rounded-xl border font-mono font-bold text-xs flex items-center justify-between transition-all ${
                      cartItems.length > 0 && tenderedAmount !== '' && Number(tenderedAmount) >= calculateFinalTotal()
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100/70 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}>
                      <span>Change:</span>
                      <span className="text-sm">
                        Rs. {Math.max(0, Number(tenderedAmount || 0) - calculateFinalTotal()).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick denomination chips */}
                {cartItems.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Cash:</span>
                    {[calculateFinalTotal(), 500, 1000, 2000, 5000, 10000]
                      .filter((val, i, arr) => val >= calculateFinalTotal() && (val === calculateFinalTotal() || arr.indexOf(val) === i))
                      .slice(0, 5)
                      .map((val, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTenderedAmount(String(val))}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 hover:border-teal-300 text-slate-700 dark:text-slate-200 hover:text-teal-700 text-[10px] font-mono font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          Rs. {val >= 1000 ? val.toLocaleString() : val.toFixed(0)}
                        </button>
                      ))}
                  </div>
                )}

                {cartItems.length > 0 && tenderedAmount !== '' && Number(tenderedAmount) < calculateFinalTotal() && (
                  <p className="text-[11px] font-bold text-rose-600">
                    Tendered cash (Rs. {Number(tenderedAmount).toFixed(2)}) cannot be less than invoice total (Rs. {calculateFinalTotal().toFixed(2)}).
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={
              isLoading ||
              cartItems.length === 0 ||
              (paymentMethod === 'Cash' && (!tenderedAmount || Number(tenderedAmount) < calculateFinalTotal()))
            }
            className="w-full bg-teal-700 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-xs text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border border-teal-500/40"
          >
            <Receipt className="w-4 h-4" />
            {isLoading ? 'Processing Checkout Order...' : 'Complete Payment & Issue Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSBilling;
