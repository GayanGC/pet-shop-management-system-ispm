import React, { useState, useEffect } from 'react';
import { Search, Phone, ShieldCheck, PawPrint, Package, Calendar, CreditCard, Plus, Stethoscope, AlertTriangle, TrendingUp, Scissors, Tag, CheckCircle2, AlertCircle } from 'lucide-react';

import PetForm from './components/pet/PetForm';
import PetList from './components/pet/PetList';
import ProductForm from './components/inventory/ProductForm';
import InventoryList from './components/inventory/InventoryList';
import BookingForm from './components/booking/BookingForm';
import BookingList from './components/booking/BookingList';
import POSBilling from './components/billing/POSBilling';
import InvoiceList from './components/billing/InvoiceList';

import { fetchPets, createPet, updatePet, deletePet, addMedicalLog } from './services/petService';
import { fetchProducts, createProduct, deleteProduct, adjustStock } from './services/inventoryService';
import { fetchBookings, createBooking, updateBooking, cancelBooking } from './services/bookingService';
import { fetchInvoices, createInvoice, voidInvoice } from './services/billingService';

function App() {
  const [activeTab, setActiveTab] = useState('pets');
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Modal open states
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // State
  const [pets, setPets] = useState([]);
  const [petSearch, setPetSearch] = useState('');
  const [petSpeciesFilter, setPetSpeciesFilter] = useState('All');
  const [isPetLoading, setIsPetLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [isProductLoading, setIsProductLoading] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  const [invoices, setInvoices] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  // Helper toast
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  // Load Data
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
    if (activeTab === 'pets') loadPets();
    if (activeTab === 'pharmacy') loadProducts();
    if (activeTab === 'appointments') loadBookings();
    if (activeTab === 'pos') loadInvoices();
  }, [activeTab, petSearch, petSpeciesFilter, productSearch, productCategoryFilter, bookingStatusFilter, paymentFilter]);

  // Handlers - Patient Profiles
  const handleAddPet = async (petData) => {
    setIsPetLoading(true);
    try {
      const res = await createPet(petData);
      showToast(res.message || 'Pet patient registered successfully!');
      loadPets();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsPetLoading(false);
    }
  };

  const handleDeletePet = async (id) => {
    if (!window.confirm('Are you sure you want to archive this pet patient record?')) return;
    try {
      const res = await deletePet(id);
      showToast(res.message);
      loadPets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateClinicStatus = async (id, clinicStatus) => {
    try {
      const res = await updatePet(id, { clinicStatus });
      showToast(`Patient status changed to '${clinicStatus}'`);
      loadPets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddMedicalLog = async (id, logData) => {
    try {
      const res = await addMedicalLog(id, logData);
      showToast('Medical log recorded successfully!');
      loadPets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers - Pharmacy & Inventory
  const handleAddProduct = async (prodData) => {
    setIsProductLoading(true);
    try {
      const res = await createProduct(prodData);
      showToast(res.message || 'Product added to pharmacy catalog!');
      loadProducts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsProductLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Mark medication/product as discontinued?')) return;
    try {
      const res = await deleteProduct(id);
      showToast(res.message);
      loadProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAdjustStock = async (id, delta) => {
    try {
      const res = await adjustStock(id, delta);
      showToast(res.message);
      loadProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers - Appointments
  const handleAddBooking = async (bookingData) => {
    setIsBookingLoading(true);
    try {
      const res = await createBooking(bookingData);
      showToast(res.message || 'Clinical appointment scheduled!');
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

  const handleRescheduleBooking = async (id, data) => {
    try {
      const res = await updateBooking(id, data);
      showToast('Appointment rescheduled successfully!');
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

  // Handlers - POS & Invoicing
  const handleCheckoutPOS = async (orderData) => {
    setIsBillingLoading(true);
    try {
      const res = await createInvoice(orderData);
      showToast(`Invoice ${res.data.invoiceNo} issued & inventory deducted!`);
      loadInvoices();
      loadProducts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsBillingLoading(false);
    }
  };

  const handleVoidInvoice = async (id) => {
    if (!window.confirm('Void this invoice transaction? (Stock quantity will be restored)')) return;
    try {
      const res = await voidInvoice(id);
      showToast(res.message);
      loadInvoices();
      loadProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Compute KPI Stats
  const totalPatientsCount = pets.length;
  const lowStockCount = products.filter((p) => p.stockQuantity <= 5).length;
  const activeBookingsCount = bookings.filter((b) => b.status !== 'Cancelled').length;
  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.finalTotal || inv.totalAmount || 0), 0);

  // Search Submit Handler
  const handleGlobalSearchSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'pets') setPetSearch(petSearch);
    if (activeTab === 'pharmacy') setProductSearch(productSearch);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-600 selection:text-white">
      {/* 1. Ocean Teal Top Header Bar */}
      <header className="bg-teal-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-2xl shadow-sm">
              🐾
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                4 Paw Animal Clinic
              </h1>
              <p className="text-xs text-teal-100 font-medium">Veterinary Hospital & Pet Care Platform</p>
            </div>
          </div>

          {/* Central Search Bar with Warm Yellow Button */}
          <form onSubmit={handleGlobalSearchSubmit} className="flex items-center gap-2 w-full md:w-auto max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient PIN, medications, appointments..."
                value={activeTab === 'pets' ? petSearch : activeTab === 'pharmacy' ? productSearch : ''}
                onChange={(e) => {
                  if (activeTab === 'pets') setPetSearch(e.target.value);
                  if (activeTab === 'pharmacy') setProductSearch(e.target.value);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white text-slate-800 text-xs rounded-xl border-0 focus:ring-4 focus:ring-amber-300 focus:outline-none placeholder:text-slate-400 font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition-all shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Top Right Badges */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-teal-800/80 px-3 py-1.5 rounded-full text-teal-100 font-medium border border-teal-600/60">
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>+94 11 234 5678</span>
            </div>

            <div className="flex items-center gap-1.5 bg-teal-800/80 px-3 py-1.5 rounded-full text-teal-100 font-medium border border-teal-600/60">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-200" />
              <span>Admin Portal</span>
            </div>

            <div className="flex items-center gap-1.5 bg-teal-800/80 px-3 py-1.5 rounded-full text-teal-100 font-medium border border-teal-600/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-[11px]">Server Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Secondary Navigation Bar (Module Tabs) */}
      <nav className="bg-white border-b border-slate-200/80 shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto py-2.5 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pets')}
            className={`py-2.5 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'pets'
                ? 'bg-teal-700 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🐕</span> Patients & Pets ({totalPatientsCount})
          </button>

          <button
            onClick={() => setActiveTab('pharmacy')}
            className={`py-2.5 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'pharmacy'
                ? 'bg-teal-700 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>💊</span> Pharmacy & Stock ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-2.5 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'appointments'
                ? 'bg-teal-700 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📅</span> Appointments ({activeBookingsCount})
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className={`py-2.5 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'pos'
                ? 'bg-teal-700 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>💳</span> POS Terminal (Rs. {totalRevenue.toFixed(2)})
          </button>
        </div>
      </nav>

      {/* Notification Toast */}
      {notification.message && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 text-white transition-all transform animate-bounce ${
          notification.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* 3. Pet Care Hero Banner (Unsplash Photography) */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 min-h-[300px] flex items-center p-8 md:p-10 text-white shadow-xl border border-teal-600/20">
          <img
            src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1600&q=80"
            alt="Pet Care"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="bg-amber-400 text-slate-900 font-extrabold text-[11px] px-3 py-1 rounded-full inline-block tracking-wide uppercase">
              ✨ Enterprise Veterinary Care & Wellness
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-white">
              Compassionate Veterinary Care & Wellness for Your Beloved Pets
            </h2>
            <p className="text-xs md:text-sm text-teal-100 leading-relaxed max-w-xl">
              Complete hospital management, microchip patient registration, pharmacy stock tracking, appointment scheduling, and automated POS invoicing.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setIsPetModalOpen(true)}
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold py-2.5 px-5 rounded-2xl text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Register New Patient
              </button>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-5 rounded-2xl text-xs backdrop-blur-xs border border-white/20 transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4 text-amber-300" /> Book Clinical Appointment
              </button>
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-5 rounded-2xl text-xs backdrop-blur-xs border border-white/20 transition-all flex items-center gap-1.5"
              >
                <Package className="w-4 h-4 text-emerald-300" /> Add Pharmacy Product
              </button>
            </div>
          </div>
        </div>

        {/* 4. Circular Quick-Access Service Circles (PetMart Style) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Access Clinical Services</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {/* Circle 1 */}
            <div
              onClick={() => {
                setActiveTab('pets');
                setPetSpeciesFilter('Dog');
              }}
              className="bg-amber-100/90 hover:bg-amber-200 border-2 border-amber-300 hover:scale-105 transition-all cursor-pointer p-4 rounded-3xl text-center shadow-xs flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">🐕</span>
              <span className="text-xs font-bold text-slate-800">Canine / Dogs</span>
              <span className="text-[10px] text-slate-500 font-medium">Patients & Profiles</span>
            </div>

            {/* Circle 2 */}
            <div
              onClick={() => {
                setActiveTab('pets');
                setPetSpeciesFilter('Cat');
              }}
              className="bg-amber-100/90 hover:bg-amber-200 border-2 border-amber-300 hover:scale-105 transition-all cursor-pointer p-4 rounded-3xl text-center shadow-xs flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">🐈</span>
              <span className="text-xs font-bold text-slate-800">Feline / Cats</span>
              <span className="text-[10px] text-slate-500 font-medium">Patients & Profiles</span>
            </div>

            {/* Circle 3 */}
            <div
              onClick={() => {
                setActiveTab('pharmacy');
                setProductCategoryFilter('Healthcare');
              }}
              className="bg-amber-100/90 hover:bg-amber-200 border-2 border-amber-300 hover:scale-105 transition-all cursor-pointer p-4 rounded-3xl text-center shadow-xs flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">💊</span>
              <span className="text-xs font-bold text-slate-800">Pet Pharmacy</span>
              <span className="text-[10px] text-slate-500 font-medium">Meds & Stock</span>
            </div>

            {/* Circle 4 */}
            <div
              onClick={() => {
                setActiveTab('appointments');
              }}
              className="bg-amber-100/90 hover:bg-amber-200 border-2 border-amber-300 hover:scale-105 transition-all cursor-pointer p-4 rounded-3xl text-center shadow-xs flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">✂️</span>
              <span className="text-xs font-bold text-slate-800">Grooming & Spa</span>
              <span className="text-[10px] text-slate-500 font-medium">Appointments</span>
            </div>

            {/* Circle 5 */}
            <div
              onClick={() => {
                setActiveTab('appointments');
              }}
              className="bg-amber-100/90 hover:bg-amber-200 border-2 border-amber-300 hover:scale-105 transition-all cursor-pointer p-4 rounded-3xl text-center shadow-xs flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">🩺</span>
              <span className="text-xs font-bold text-slate-800">Consultations</span>
              <span className="text-[10px] text-slate-500 font-medium">Vet Clinical Slots</span>
            </div>

            {/* Circle 6 */}
            <div
              onClick={() => {
                setActiveTab('pos');
              }}
              className="bg-amber-100/90 hover:bg-amber-200 border-2 border-amber-300 hover:scale-105 transition-all cursor-pointer p-4 rounded-3xl text-center shadow-xs flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">🏷️</span>
              <span className="text-xs font-bold text-slate-800">POS & Retail</span>
              <span className="text-[10px] text-slate-500 font-medium">Checkout Sales</span>
            </div>
          </div>
        </div>

        {/* 5. TOP KPI METRICS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Registered Patients</span>
              <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">{totalPatientsCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-bold">
              <PawPrint className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Low Stock Warnings</span>
              <span className={`text-2xl font-black font-mono mt-1 block ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {lowStockCount} items
              </span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${
              lowStockCount > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Appointments</span>
              <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">{activeBookingsCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Sales Revenue</span>
              <span className="text-2xl font-black text-purple-700 font-mono mt-1 block">Rs. {totalRevenue.toFixed(2)}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 6. MAIN CONTENT PANELS */}

        {/* PATIENTS & PET PROFILES */}
        {activeTab === 'pets' && (
          <div className="space-y-8 animate-fadeIn">
            <PetList
              pets={pets}
              onDelete={handleDeletePet}
              onEdit={(pet) => alert(`Editing pet profile for ${pet.petName} (${pet.uniquePin})`)}
              onUpdateClinicStatus={handleUpdateClinicStatus}
              onAddMedicalLog={handleAddMedicalLog}
              searchTerm={petSearch}
              setSearchTerm={setPetSearch}
              speciesFilter={petSpeciesFilter}
              setSpeciesFilter={setPetSpeciesFilter}
            />
          </div>
        )}

        {/* PHARMACY & INVENTORY */}
        {activeTab === 'pharmacy' && (
          <div className="space-y-8 animate-fadeIn">
            <InventoryList
              products={products}
              onDelete={handleDeleteProduct}
              onEdit={(prod) => alert(`Editing pharmacy product ${prod.itemName}`)}
              onAdjustStock={handleAdjustStock}
              searchTerm={productSearch}
              setSearchTerm={setProductSearch}
              categoryFilter={productCategoryFilter}
              setCategoryFilter={setProductCategoryFilter}
            />
          </div>
        )}

        {/* APPOINTMENT SCHEDULING */}
        {activeTab === 'appointments' && (
          <div className="space-y-8 animate-fadeIn">
            <BookingList
              bookings={bookings}
              onUpdateStatus={handleUpdateBookingStatus}
              onCancel={handleCancelBooking}
              onReschedule={handleRescheduleBooking}
              statusFilter={bookingStatusFilter}
              setStatusFilter={setBookingStatusFilter}
            />
          </div>
        )}

        {/* POS & INVOICING */}
        {activeTab === 'pos' && (
          <div className="space-y-8 animate-fadeIn">
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

      {/* REGISTRATION POPUP MODALS */}
      {isPetModalOpen && (
        <PetForm
          isModal={true}
          onClose={() => setIsPetModalOpen(false)}
          onSubmit={handleAddPet}
          isLoading={isPetLoading}
        />
      )}

      {isProductModalOpen && (
        <ProductForm
          isModal={true}
          onClose={() => setIsProductModalOpen(false)}
          onSubmit={handleAddProduct}
          isLoading={isProductLoading}
        />
      )}

      {isBookingModalOpen && (
        <BookingForm
          isModal={true}
          onClose={() => setIsBookingModalOpen(false)}
          pets={pets}
          onSubmit={handleAddBooking}
          isLoading={isBookingLoading}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-16 text-center text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-600">4 Paw Animal Clinic • Enterprise Pet Care Platform</p>
        <p className="text-[11px] text-slate-400">Decoupled Modular Architecture • Node.js + Express + MongoDB + React + Tailwind CSS</p>
      </footer>
    </div>
  );
}

export default App;
