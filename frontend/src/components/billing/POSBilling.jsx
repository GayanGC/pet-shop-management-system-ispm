import React, { useState } from 'react';

const POSBilling = ({ products = [], onSubmitOrder, isLoading }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customItemName, setCustomItemName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  // Add product from inventory to cart
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
      // Custom walk-in item
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

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Cart is empty! Add products before checking out.');
      return;
    }

    const orderPayload = {
      items: cartItems,
      totalAmount: calculateTotal(),
      paymentMethod,
      paymentStatus: 'Paid'
    };

    onSubmitOrder(orderPayload);
    setCartItems([]);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-6">
      <div className="flex justify-between items-center border-b pb-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">💳 POS Billing Terminal</h2>
          <p className="text-xs text-gray-500">Member 4 Scope - Order Checkout & Billing</p>
        </div>
        <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-semibold">Member 4 Module</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item Selection Panel */}
        <div className="lg:col-span-1 space-y-4 border-r pr-0 lg:pr-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">1. Add Items to Order</h3>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Select Product from Stock</label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setCustomItemName('');
                setCustomPrice('');
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">-- Choose Stock Product --</option>
              {products.map((prod) => (
                <option key={prod._id} value={prod._id}>
                  {prod.itemName} - ${prod.price} (Stock: {prod.stockQuantity})
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-2 text-gray-400 text-xs uppercase font-bold">or Custom Item</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Custom Service / Item Name</label>
            <input
              type="text"
              placeholder="e.g. Special Bath Addon"
              value={customItemName}
              onChange={(e) => {
                setCustomItemName(e.target.value);
                setSelectedProductId('');
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Custom Price ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 15.00"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={itemQty}
              onChange={(e) => setItemQty(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold py-2 rounded-lg text-sm transition-colors"
          >
            + Add Line Item
          </button>
        </div>

        {/* Cart & Checkout Panel */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">2. Order Items Summary</h3>

          <div className="overflow-x-auto min-h-[160px] border rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 border-b">
                <tr>
                  <th className="p-2.5">Item Name</th>
                  <th className="p-2.5">Price</th>
                  <th className="p-2.5">Qty</th>
                  <th className="p-2.5">Subtotal</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cartItems.length > 0 ? (
                  cartItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium">{item.itemName}</td>
                      <td className="p-2.5">${item.unitPrice.toFixed(2)}</td>
                      <td className="p-2.5">{item.quantity}</td>
                      <td className="p-2.5 font-bold font-mono">${item.subtotal.toFixed(2)}</td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => handleRemoveFromCart(idx)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-400 text-sm">
                      Cart is empty. Select products from the left panel to add to checkout.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment controls & Grand total */}
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm font-semibold bg-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="Cash">Cash 💵</option>
                <option value="Card">Credit / Debit Card 💳</option>
                <option value="Online">Online Transfer 🌐</option>
              </select>
            </div>

            <div className="text-right">
              <span className="text-xs text-gray-500 block uppercase font-bold">Grand Total Amount</span>
              <span className="text-3xl font-extrabold text-purple-700 font-mono">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={isLoading || cartItems.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg disabled:bg-purple-300"
          >
            {isLoading ? 'Processing Order...' : 'Complete POS Payment & Issue Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSBilling;
