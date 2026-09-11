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
        items: cartItems.map((item) => ({
          productId: item._id,
          itemName: item.itemName,
          quantity: item.quantity || 1,
          price: Number(item.price),
          subtotal: Number(item.price) * (item.quantity || 1)
        })),
        paymentMethod: paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'cod' ? 'Cash' : 'Bank Transfer',
        notes: `Store Order [${fulfillmentType === 'delivery' ? 'Home Delivery' : 'Clinic Pickup'}] - ${paymentMethodLabel} | Address: ${fulfillmentType === 'delivery' ? customerInfo.address : 'In-Clinic'} | ${customerInfo.notes || 'None'}`,
        discount: 0
      };

      const res = await createInvoice(invoicePayload);

      if (res && res.data) {
        setCompletedOrder(res.data);
        if (onClearCart) onClearCart();
        if (onCheckoutSuccess) onCheckoutSuccess(res.data);
        if (onOrderSuccess) onOrderSuccess(res.data);
      } else {
        throw new Error(res.message || 'Failed to process order.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-teal-100 dark:border-slate-800 overflow-hidden my-8 transition-colors">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-lg font-black shadow-md">
              🛍️
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {completedOrder ? 'Order Confirmed!' : 'Customer Storefront Checkout'}
              </h2>
              <p className="text-xs text-teal-100">
                {completedOrder
                  ? `Invoice #${completedOrder.invoiceNumber} has been generated`
                  : 'Select fulfillment, enter delivery details, and pick payment method'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ORDER COMPLETED STATE */}
        {completedOrder ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-300 dark:border-emerald-700 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Thank You for Your Order!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your veterinary prescription & pet care order has been verified and logged into our inventory database.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Invoice Number:</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">{completedOrder.invoiceNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Recipient Name:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Fulfillment Method:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {fulfillmentType === 'delivery' ? '🚚 Express Home Delivery' : '🏥 4 Paw Clinic Counter Pickup'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Payment Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-sans font-bold text-[10px]">
                  {completedOrder.paymentStatus || 'Paid / Verified'}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-sans font-extrabold text-slate-900 dark:text-white">
                <span>Total Amount Paid (LKR):</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono">
                  Rs. {Number(completedOrder.finalTotal || completedOrder.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Receipt Modal Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="py-2.5 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-teal-700/20 cursor-pointer"
              >
                <span>Back to Storefront</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM STATE */
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
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

            {/* 5. Financial Summary Box & Submit Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
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
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                  <span>Total Amount (LKR):</span>
                  <span className="text-teal-600 dark:text-teal-400 font-mono">
                    Rs. {grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading || cartItems.length === 0}
                  className="flex-2 py-3 px-6 rounded-xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-700/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
