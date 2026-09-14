import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  ShieldCheck,
  Building,
  Smartphone,
  Banknote,
  Plus,
  Minus,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { createInvoice } from '../../services/billingService';

const CustomerCheckoutModal = ({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentUser,
  onRequireAuth,
  onCheckoutSuccess,
  onOrderSuccess
}) => {
  if (!isOpen) return null;

  // Fulfillment: 'pickup' | 'delivery'
  const [fulfillmentType, setFulfillmentType] = useState('pickup');
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Payment: 'card' | 'cod' | 'bank'
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Customer Contact & Shipping Details
  const [customerInfo, setCustomerInfo] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '0771234567',
    email: currentUser?.email || '',
    address: 'Colombo 03, Western Province, Sri Lanka',
    notes: ''
  });

  // Card details
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4532 •••• •••• 8921',
    cardHolder: currentUser?.name || 'Gayan Gunawardana',
    expiry: '12/28',
    cvc: '342'
  });

  // Bank / Wallet details
  const [walletType, setWalletType] = useState('LankaQR');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // Financial Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0);
  const currentDeliveryFee = fulfillmentType === 'delivery' ? 350 : 0;
  const grandTotal = subtotal + currentDeliveryFee;

  const handleFulfillmentChange = (type) => {
    setFulfillmentType(type);
    setDeliveryFee(type === 'delivery' ? 350 : 0);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (cartItems.length === 0) {
      setErrorMessage('Your shopping cart is empty.');
      return;
    }

    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth(
          () => handleSubmitOrder(e),
          'Please sign in or create an account to place your order.'
        );
      } else {
        setErrorMessage('Please sign in to place an order.');
      }
      return;
    }

    if (!customerInfo.name || !customerInfo.phone) {
      setErrorMessage('Please enter your full name and contact phone number.');
      return;
    }

    if (fulfillmentType === 'delivery' && !customerInfo.address) {
      setErrorMessage('Please provide a delivery address for doorstep courier.');
      return;
    }

    setIsLoading(true);

    try {
      const paymentMethodLabel =
        paymentMethod === 'card'
          ? 'Credit Card'
          : paymentMethod === 'cod'
          ? 'Cash'
          : `Bank Transfer / ${walletType}`;

      const invoicePayload = {
        customerId: currentUser._id,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        items: cartItems.map((item) => {
          const itemPrice = Number(item.price !== undefined ? item.price : (item.unitPrice || 0));
          const itemQty = Number(item.quantity || 1);
          return {
            productId: item._id || item.productId || item.product,
            product: item._id || item.productId || item.product,
            itemName: item.itemName || item.name || 'Product Item',
            quantity: itemQty,
            unitPrice: itemPrice,
            price: itemPrice,
            subtotal: itemPrice * itemQty
          };
        }),
        paymentMethod: paymentMethod === 'card' ? 'Card' : paymentMethod === 'cod' ? 'Cash' : 'Online',
        notes: `Store Order [${fulfillmentType === 'delivery' ? 'Home Delivery' : 'Clinic Pickup'}] - ${paymentMethodLabel} | Address: ${fulfillmentType === 'delivery' ? customerInfo.address : 'In-Clinic'} | ${customerInfo.notes || 'None'}`,
        discount: 0
      };

      const res = await createInvoice(invoicePayload);
      const invData = res?.data || res?.invoice || res || {};

      const normalizedOrder = {
        invoiceNo: invData.invoiceNo || invData.invoiceNumber || res?.invoiceNo || res?.invoiceNumber || ('INV-' + Date.now().toString().slice(-6)),
        customerName: invData.customerName || customerInfo.name || currentUser?.name || 'Customer',
        customerPhone: invData.customerPhone || customerInfo.phone || currentUser?.phone || '',
        fulfillmentMethod: fulfillmentType === 'delivery' ? '🚚 Express Home Delivery' : '🏥 4 Paw Clinic Counter Pickup',
        paymentStatus: invData.paymentStatus || 'Paid',
        paymentMethod: paymentMethod === 'card' ? 'Credit / Debit Card' : paymentMethod === 'cod' ? 'Cash on Delivery' : 'QR / Bank Transfer',
        totalAmount: Number(invData.finalTotal || invData.totalAmount || grandTotal || 0),
        items: invData.items || cartItems || [],
        address: fulfillmentType === 'delivery' ? customerInfo.address : 'In-Clinic Pickup',
        deliveryFee: currentDeliveryFee,
        createdAt: invData.createdAt || new Date().toISOString()
      };

      if (res && (res.data || res.success || res.invoiceNo)) {
        setCompletedOrder(normalizedOrder);
        if (onClearCart) onClearCart();
        if (onCheckoutSuccess) onCheckoutSuccess(normalizedOrder);
        if (onOrderSuccess) onOrderSuccess(normalizedOrder);
      } else {
        throw new Error(res?.message || 'Failed to process order.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error processing your checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Tier 1: Sticky Header (Shrink-0) */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white p-4 sm:p-5 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-lg font-black shadow-md shrink-0">
              🛍️
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black tracking-tight truncate">
                {completedOrder ? 'Order Confirmed!' : 'Customer Storefront Checkout'}
              </h2>
              <p className="text-xs text-teal-100 truncate">
                {completedOrder
                  ? `Invoice #${completedOrder.invoiceNo || 'INV-2026-PENDING'} generated`
                  : 'Select fulfillment, delivery details, and payment method'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
            title="Close Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ORDER COMPLETED STATE */}
        {completedOrder ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                #printable-receipt, #printable-receipt * {
                  visibility: visible;
                }
                #printable-receipt {
                  position: fixed;
                  left: 50%;
                  top: 20px;
                  transform: translateX(-50%);
                  width: 100%;
                  max-width: 480px;
                  margin: 0 auto;
                  padding: 20px;
                  border: 1px solid #cbd5e1;
                  border-radius: 8px;
                  background: #ffffff !important;
                  color: #0f172a !important;
                  box-shadow: none;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-300 dark:border-emerald-700 shadow-md shadow-emerald-500/20 no-print">
              <CheckCircle2 className="w-7 h-7 animate-bounce" />
            </div>

            <div className="text-center space-y-1 no-print">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Thank You for Your Order!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your veterinary prescription & pet care order has been verified and logged into our inventory database.
              </p>
            </div>

            {/* Printable Receipt Card */}
            <div
              id="printable-receipt"
              className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-3 font-mono text-xs shadow-inner"
            >
              {/* Receipt Header Branding */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
                <div>
                  <h4 className="font-sans font-black text-sm text-slate-900 dark:text-white tracking-tight">
                    🐾 4 PAW ANIMAL CLINIC
                  </h4>
                  <p className="font-sans text-[10px] text-slate-500 dark:text-slate-400">
                    Pet Pharmacy & Prescription Receipt
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-teal-600 dark:text-teal-400 text-xs">
                    {completedOrder?.invoiceNo || 'INV-2026-PENDING'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(completedOrder?.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Invoice Number Row */}
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Invoice Number:</span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                  {completedOrder?.invoiceNo || 'INV-2026-PENDING'}
                </span>
              </div>

              {/* Recipient Name Row */}
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Recipient Name:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 font-sans">
                  {completedOrder?.customerName || customerInfo?.name || currentUser?.name || 'Customer'}
                </span>
              </div>

              {/* Recipient Phone */}
              {(completedOrder?.customerPhone || customerInfo?.phone) && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400">Contact Phone:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-100">
                    {completedOrder?.customerPhone || customerInfo?.phone}
                  </span>
                </div>
              )}

              {/* Fulfillment Method Row */}
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Fulfillment Method:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 font-sans">
                  {completedOrder?.fulfillmentMethod || (fulfillmentType === 'delivery' ? '🚚 Express Home Delivery' : '🏥 4 Paw Clinic Counter Pickup')}
                </span>
              </div>

              {/* Payment Method & Status */}
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Payment Method:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 font-sans">
                  {completedOrder?.paymentMethod || 'Cash'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Payment Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-sans font-bold text-[10px]">
                  {completedOrder?.paymentStatus || 'Paid / Verified'}
                </span>
              </div>

              {/* Purchased Items List */}
              {Array.isArray(completedOrder?.items) && completedOrder.items.length > 0 && (
                <div className="py-2 border-b border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block font-sans">
                    Purchased Items ({completedOrder.items.length})
                  </span>
                  {completedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[240px] font-sans">
                        {it.itemName || it.name || 'Product Item'} × {it.quantity || 1}
                      </span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        Rs. {Number(it.subtotal || ((it.unitPrice || it.price || 0) * (it.quantity || 1))).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Amount Row */}
              <div className="flex justify-between pt-1 text-sm font-sans font-extrabold text-slate-900 dark:text-white">
                <span>Total Amount Paid (LKR):</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono text-base">
                  Rs. {Number(completedOrder?.totalAmount || completedOrder?.finalTotal || grandTotal).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Receipt Modal Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2 no-print">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-teal-700/20 cursor-pointer transition-all"
              >
                <span>Back to Storefront</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM STATE */
          <form onSubmit={handleSubmitOrder} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Tier 2: Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Itemized Cart Review */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Your Cart Items ({cartItems.length})
                </h3>
                {onClearCart && cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Cart
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                  Your cart is currently empty. Browse our storefront products to add medications and pet supplies.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-base shrink-0 border border-teal-200 dark:border-teal-800">
                          📦
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {item.itemName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Rs. {Number(item.price).toFixed(2)} / unit
                          </p>
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-inner">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity && onUpdateQuantity(item._id, Math.max(1, (item.quantity || 1) - 1))}
                            className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 cursor-pointer text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold font-mono text-slate-800 dark:text-white">
                            {item.quantity || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity && onUpdateQuantity(item._id, (item.quantity || 1) + 1)}
                            className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 cursor-pointer text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 w-20 text-right">
                          Rs. {(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                        </span>

                        <button
                          type="button"
                          onClick={() => onRemoveItem && onRemoveItem(item._id)}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Fulfillment Options: Pickup vs Doorstep Delivery */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
                Fulfillment & Delivery Method
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Pickup */}
                <div
                  onClick={() => handleFulfillmentChange('pickup')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    fulfillmentType === 'pickup'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 shadow-md shadow-teal-700/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white">Clinic Pickup</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        FREE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Ready for collection in 2 hours at 4 Paw Animal Clinic counter.
                    </p>
                  </div>
                </div>

                {/* Option 2: Delivery */}
                <div
                  onClick={() => handleFulfillmentChange('delivery')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    fulfillmentType === 'delivery'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 shadow-md shadow-teal-700/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white">Home Delivery</span>
                      <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                        + Rs. 350.00
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Express doorstep delivery across Western Province & Island-wide.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Recipient Information Form */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Contact & Shipping Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-teal-500 focus:outline-none"
                    placeholder="e.g. Kasun Silva"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-teal-500 focus:outline-none"
                    placeholder="0771234567"
                  />
                </div>
                {fulfillmentType === 'delivery' && (
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Delivery Address</label>
                    <input
                      type="text"
                      required
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-teal-500 focus:outline-none"
                      placeholder="e.g. No 42, Galle Road, Colombo 03"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 4. Diverse Payment Options */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
                Choose Payment Option
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Method 1: Credit / Debit Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                    paymentMethod === 'card'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-extrabold">Visa / Master</span>
                  <span className="text-[10px] opacity-75">Credit/Debit Card</span>
                </button>

                {/* Method 2: COD / Counter Pay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                    paymentMethod === 'cod'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs font-extrabold">Cash on Delivery</span>
                  <span className="text-[10px] opacity-75">Pay upon Delivery</span>
                </button>

                {/* Method 3: QR / Bank Transfer */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                    paymentMethod === 'bank'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs font-extrabold">QR / Bank Pay</span>
                  <span className="text-[10px] opacity-75">LankaQR & Koko</span>
                </button>
              </div>

              {/* Payment Details Subform */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> 256-Bit SSL Encrypted
                    </span>
                    <span className="font-mono text-[10px]">VISA / MASTERCARD / AMEX</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                        placeholder="Card Number"
                        className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-teal-400"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-teal-400"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        placeholder="CVC"
                        maxLength="4"
                        className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-slate-700 space-y-2 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-teal-600" />
                    Direct Mobile & QR Settlement
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Pay instantly via FriMi, Genie, Koko (3 installments), or transfer to Commercial Bank:
                  </p>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    A/C: 1000-4892-0192 | Bank: Commercial Bank | Branch: Colombo Kollupitiya
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Pay in cash or credit card when your package is delivered to your door or upon clinic pickup.
                  </span>
                </div>
              )}
            </div>
            {/* End of Tier 2: Scrollable Content Body */}
            </div>

            {/* Tier 3: Sticky Footer & Financial Summary (Shrink-0) */}
            <div className="shrink-0 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Items Subtotal:</span>
                  <span className="font-mono font-bold">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Fulfillment Fee ({fulfillmentType === 'delivery' ? 'Home Delivery' : 'Clinic Pickup'}):</span>
                  <span className="font-mono font-bold">
                    {currentDeliveryFee > 0 ? `Rs. ${currentDeliveryFee.toFixed(2)}` : 'FREE'}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 dark:text-white pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                  <span>Total Amount (LKR):</span>
                  <span className="text-teal-600 dark:text-teal-400 font-mono">
                    Rs. {grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading || cartItems.length === 0}
                  className="flex-2 py-2.5 sm:py-3 px-5 rounded-xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-700/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Place Order • Rs. {grandTotal.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CustomerCheckoutModal;
