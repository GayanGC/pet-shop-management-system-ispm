import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, CreditCard, DollarSign, Receipt, Percent } from 'lucide-react';

const POSBilling = ({ products = [], onSubmitOrder, isLoading }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discountRate, setDiscountRate] = useState(0);
  const [taxRate, setTaxRate] = useState(8); // Default 8% VAT
  const [customItemName, setCustomItemName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const handleAddToCart = () => {
    if (selectedProductId) {
      const prod = products.find((p) => p._id === selectedProductId);
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

  const calculateDiscount = () => {
    return calculateSubtotal() * (Number(discountRate) / 100);
  };

  const calculateTax = () => {
    const afterDiscount = calculateSubtotal() - calculateDiscount();
    return afterDiscount * (Number(taxRate) / 100);
  };

  const calculateFinalTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Cart is empty! Add products before checking out.');
      return;
    }

    const orderPayload = {
      items: cartItems,
      totalAmount: calculateSubtotal(),
      discountRate: Number(discountRate),
      taxRate: Number(taxRate),
      paymentMethod,
      paymentStatus: 'Paid'
    };

    onSubmitOrder(orderPayload);
    setCartItems([]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">POS Checkout Terminal</h2>
            <p className="text-xs text-slate-500">Sales Transactions & Real-time Stock Deduction</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item Selection Panel */}
        <div className="lg:col-span-1 space-y-4 border-r border-slate-100 pr-0 lg:pr-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-purple-500" /> 1. Select Items to Sell
          </h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Stock Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setCustomItemName('');
                setCustomPrice('');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all"
            >
              <option value="">-- Choose Stock Product --</option>
              {products.map((prod) => (
                <option key={prod._id} value={prod._id}>
                  {prod.itemName} - Rs. {prod.price} (Stock: {prod.stockQuantity})
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-2 text-slate-400 text-[10px] uppercase font-bold">or Custom Item</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Custom Service / Item Name</label>
            <input
              type="text"
              placeholder="e.g. Special Bath Addon / Consultation"
              value={customItemName}
              onChange={(e) => {
                setCustomItemName(e.target.value);
                setSelectedProductId('');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Custom Price (Rs.)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 15.00"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quantity</label>
            <input
              type="number"
              min="1"
              value={itemQty}
              onChange={(e) => setItemQty(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-2.5 px-4 rounded-xl text-xs border border-purple-200/60 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Line Item to Cart
          </button>
        </div>

        {/* Cart & Checkout Panel */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5 text-purple-500" /> 2. Order Cart Summary ({cartItems.length} items)
          </h3>

          <div className="overflow-x-auto min-h-[160px] border border-slate-200/80 rounded-xl bg-slate-50/30">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cartItems.length > 0 ? (
                  cartItems.map((item, idx) => (
                    <tr key={idx} className="bg-white hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">{item.itemName}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">Rs. {item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{item.quantity}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">Rs. {item.subtotal.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRemoveFromCart(idx)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-all"
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
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Cash">Cash 💵</option>
                  <option value="Card">Credit / Debit Card 💳</option>
                  <option value="Online">Online Bank Transfer 🌐</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discount Rate</label>
                <select
                  value={discountRate}
                  onChange={(e) => setDiscountRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none font-mono"
                >
                  <option value={0}>0% No Discount</option>
                  <option value={5}>5% Special Promo</option>
                  <option value={10}>10% VIP Client</option>
                  <option value={15}>15% Employee / Staff</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sales Tax / VAT</label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none font-mono"
                >
                  <option value={0}>0% Tax Exempt</option>
                  <option value={8}>8% Standard Tax</option>
                  <option value={12}>12% VAT Rate</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-xs">
              <div className="space-y-0.5 text-slate-500 font-mono">
                <div>Subtotal: <span className="font-bold text-slate-700">Rs. {calculateSubtotal().toFixed(2)}</span></div>
                {discountRate > 0 && <div className="text-emerald-600 font-bold">Discount ({discountRate}%): -Rs. {calculateDiscount().toFixed(2)}</div>}
                {taxRate > 0 && <div>Tax ({taxRate}%): +Rs. {calculateTax().toFixed(2)}</div>}
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Final Total</span>
                <span className="text-3xl font-black text-purple-700 font-mono tracking-tight">
                  Rs. {calculateFinalTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={isLoading || cartItems.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm hover:shadow-purple-200 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
