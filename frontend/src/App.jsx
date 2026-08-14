import React, { useState, useEffect } from 'react';
import PetForm from './components/pet/PetForm';
import PetList from './components/pet/PetList';
import ProductForm from './components/inventory/ProductForm';
import InventoryList from './components/inventory/InventoryList';
import BookingForm from './components/booking/BookingForm';
import BookingList from './components/booking/BookingList';
import POSBilling from './components/billing/POSBilling';
import InvoiceList from './components/billing/InvoiceList';

import { fetchPets, createPet, deletePet } from './services/petService';
import { fetchProducts, createProduct, deleteProduct } from './services/inventoryService';
import { fetchBookings, createBooking, updateBooking, cancelBooking } from './services/bookingService';
import { fetchInvoices, createInvoice, voidInvoice } from './services/billingService';

function App() {
  const [activeTab, setActiveTab] = useState('member1');
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Member 1 State
  const [pets, setPets] = useState([]);
  const [petSearch, setPetSearch] = useState('');
  const [petSpeciesFilter, setPetSpeciesFilter] = useState('All');
  const [isPetLoading, setIsPetLoading] = useState(false);

  // Member 2 State
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [isProductLoading, setIsProductLoading] = useState(false);

  // Member 3 State
  const [bookings, setBookings] = useState([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  // Member 4 State
  const [invoices, setInvoices] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  // Helper notification toast
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  // Load Data on Mount or Tab change
  const loadPets = async () => {
    setIsPetLoading(true);
    try {
      const res = await fetchPets({ search: petSearch, species: petSpeciesFilter });
      if (res.success) setPets(res.data);
    } catch (err) {
      console.warn('API fetch warning:', err.message);
    } finally {
      setIsPetLoading(false);
    }
  };

  const loadProducts = async () => {
    setIsProductLoading(true);
    try {
      const res = await fetchProducts({ search: productSearch, category: productCategoryFilter });
      if (res.success) setProducts(res.data);
    } catch (err) {
      console.warn('API fetch warning:', err.message);
    } finally {
      setIsProductLoading(false);
    }
  };

  const loadBookings = async () => {
    setIsBookingLoading(true);
    try {
      const res = await fetchBookings({ status: bookingStatusFilter });
      if (res.success) setBookings(res.data);
    } catch (err) {
      console.warn('API fetch warning:', err.message);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const loadInvoices = async () => {
    setIsBillingLoading(true);
    try {
      const res = await fetchInvoices({ paymentMethod: paymentFilter });
      if (res.success) setInvoices(res.data);
    } catch (err) {
      console.warn('API fetch warning:', err.message);
    } finally {
      setIsBillingLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
    loadProducts();
    loadBookings();
    loadInvoices();
  }, []);

  useEffect(() => {
    if (activeTab === 'member1') loadPets();
    if (activeTab === 'member2') loadProducts();
    if (activeTab === 'member3') loadBookings();
    if (activeTab === 'member4') loadInvoices();
  }, [activeTab, petSearch, petSpeciesFilter, productSearch, productCategoryFilter, bookingStatusFilter, paymentFilter]);

  // Handlers for Member 1
  const handleAddPet = async (petData) => {
    setIsPetLoading(true);
    try {
      const res = await createPet(petData);
      showToast(res.message || 'Pet registered successfully!');
      loadPets();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsPetLoading(false);
    }
  };

  const handleDeletePet = async (id) => {
    if (!window.confirm('Are you sure you want to archive this pet record?')) return;
    try {
      const res = await deletePet(id);
      showToast(res.message);
      loadPets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Member 2
  const handleAddProduct = async (prodData) => {
    setIsProductLoading(true);
    try {
      const res = await createProduct(prodData);
      showToast(res.message || 'Product added to inventory!');
      loadProducts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsProductLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Mark product as discontinued?')) return;
    try {
      const res = await deleteProduct(id);
      showToast(res.message);
      loadProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Member 3
  const handleAddBooking = async (bookingData) => {
    setIsBookingLoading(true);
    try {
      const res = await createBooking(bookingData);
      showToast(res.message || 'Appointment scheduled successfully!');
      loadBookings();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      const res = await updateBooking(id, { status });
      showToast(`Appointment status updated to ${status}`);
      loadBookings();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this service appointment?')) return;
    try {
      const res = await cancelBooking(id);
      showToast(res.message);
      loadBookings();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Member 4
  const handleCheckoutPOS = async (orderData) => {
    setIsBillingLoading(true);
    try {
      const res = await createInvoice(orderData);
      showToast(`Invoice ${res.data.invoiceNo} issued successfully!`);
      loadInvoices();
      loadProducts(); // Update stock count
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsBillingLoading(false);
    }
  };

  const handleVoidInvoice = async (id) => {
    if (!window.confirm('Void this sales invoice?')) return;
    try {
      const res = await voidInvoice(id);
      showToast(res.message);
      loadInvoices();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐾</span>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-400 to-indigo-400 bg-clip-text text-transparent">
                Pet Shop Management System
              </h1>
              <p className="text-xs text-slate-400 font-medium">Agile Scrum • Sprint 1 (4-Member Full-Stack Architecture)</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-mono">API: http://localhost:5000</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto border-t border-slate-800 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('member1')}
            className={`py-3 px-5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'member1'
                ? 'border-indigo-400 text-indigo-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🐶</span> Member 1: Pet Registry
          </button>

          <button
            onClick={() => setActiveTab('member2')}
            className={`py-3 px-5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'member2'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📦</span> Member 2: Inventory
          </button>

          <button
            onClick={() => setActiveTab('member3')}
            className={`py-3 px-5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'member3'
                ? 'border-blue-400 text-blue-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📅</span> Member 3: Appointments
          </button>

          <button
            onClick={() => setActiveTab('member4')}
            className={`py-3 px-5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'member4'
                ? 'border-purple-400 text-purple-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💳</span> Member 4: POS & Billing
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification.message && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-xl text-sm font-semibold flex items-center gap-2 text-white transition-all ${
          notification.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
        }`}>
          <span>{notification.type === 'error' ? '❌' : '✅'}</span>
          {notification.message}
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* MEMBER 1 PANEL */}
        {activeTab === 'member1' && (
          <div className="space-y-8">
            <PetForm onSubmit={handleAddPet} isLoading={isPetLoading} />
            <PetList
              pets={pets}
              onDelete={handleDeletePet}
              onEdit={(pet) => alert(`Editing pet ${pet.petName} (${pet.uniquePin})`)}
              searchTerm={petSearch}
              setSearchTerm={setPetSearch}
              speciesFilter={petSpeciesFilter}
              setSpeciesFilter={setPetSpeciesFilter}
            />
          </div>
        )}

        {/* MEMBER 2 PANEL */}
        {activeTab === 'member2' && (
          <div className="space-y-8">
            <ProductForm onSubmit={handleAddProduct} isLoading={isProductLoading} />
            <InventoryList
              products={products}
              onDelete={handleDeleteProduct}
              onEdit={(prod) => alert(`Editing inventory item ${prod.itemName}`)}
              searchTerm={productSearch}
              setSearchTerm={setProductSearch}
              categoryFilter={productCategoryFilter}
              setCategoryFilter={setProductCategoryFilter}
            />
          </div>
        )}

        {/* MEMBER 3 PANEL */}
        {activeTab === 'member3' && (
          <div className="space-y-8">
            <BookingForm pets={pets} onSubmit={handleAddBooking} isLoading={isBookingLoading} />
            <BookingList
              bookings={bookings}
              onUpdateStatus={handleUpdateBookingStatus}
              onCancel={handleCancelBooking}
              statusFilter={bookingStatusFilter}
              setStatusFilter={setBookingStatusFilter}
            />
          </div>
        )}

        {/* MEMBER 4 PANEL */}
        {activeTab === 'member4' && (
          <div className="space-y-8">
            <POSBilling products={products} onSubmitOrder={handleCheckoutPOS} isLoading={isBillingLoading} />
            <InvoiceList
              invoices={invoices}
              onVoidInvoice={handleVoidInvoice}
              paymentFilter={paymentFilter}
              setPaymentFilter={setPaymentFilter}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 mt-12 text-center text-xs space-y-1">
        <p className="font-semibold text-slate-300">Pet Shop Management System • Sprint 1 Full-Stack Deliverable</p>
        <p>Isolated Architecture for 4 Team Members • Express.js + Mongoose + React + Tailwind CSS</p>
      </footer>
    </div>
  );
}

export default App;
