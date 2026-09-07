import React, { useState, useEffect, useRef } from 'react';
import { Search, Phone, ShieldCheck, PawPrint, Package, Calendar, CreditCard, Plus, Stethoscope, AlertTriangle, TrendingUp, Scissors, Tag, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

import PetForm from './components/pet/PetForm';
import PetList from './components/pet/PetList';
import ProductForm from './components/inventory/ProductForm';
import InventoryList from './components/inventory/InventoryList';
import SupplierDirectory from './components/inventory/SupplierDirectory';
import ExpiryTracker from './components/inventory/ExpiryTracker';
import BookingForm from './components/booking/BookingForm';
import BookingList from './components/booking/BookingList';
import DoctorCalendarView from './components/appointments/DoctorCalendarView';
import POSBilling from './components/billing/POSBilling';
import InvoiceList from './components/billing/InvoiceList';
import SalesAnalytics from './components/billing/SalesAnalytics';

import { fetchPets, createPet, updatePet, deletePet, addMedicalLog, archivePet } from './services/petService';
import { fetchProducts, createProduct, deleteProduct, adjustStock, fetchExpiringProducts, disposeBatch } from './services/inventoryService';
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from './services/supplierService';
import { fetchBookings, createBooking, updateBooking, cancelBooking } from './services/bookingService';
import { fetchInvoices, createInvoice, voidInvoice } from './services/billingService';

function App() {
  const [activeTab, setActiveTab] = useState('pets');
  const [posSubTab, setPosSubTab] = useState('terminal');
  const [bookingSubTab, setBookingSubTab] = useState('directory');
  const [pharmacySubTab, setPharmacySubTab] = useState('inventory');
  const [prefilledBookingData, setPrefilledBookingData] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Hero Carousel State
  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1600&q=80',
      tag: '✨ Enterprise Veterinary Care & Wellness',
      title: 'Compassionate Veterinary Care & Wellness',
      subtitle: 'Complete hospital management, microchip patient registration, and expert surgical care.'
    },
    {
      image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1600&q=80',
      tag: '🐕 Dedicated Canine & Feline Health',
      title: 'Dedicated Preventive Care for Dogs & Cats',
      subtitle: 'Vaccination tracking, nutrition guidance, and comprehensive health passport generation.'
    },
    {
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1600&q=80',
      tag: '💊 Certified Pharmacy & Modern POS',
      title: 'Fully Stocked Pet Pharmacy & POS',
      subtitle: 'Certified medicines, real-time stock alerts, and automated thermal billing.'
    }
  ];

  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextHeroSlide = () => setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
  const prevHeroSlide = () => setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  // Main content scroll ref
  const mainContentRef = useRef(null);

  const scrollToContent = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Modal open states
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // State
  const [pets, setPets] = useState([]);
  const [petSearch, setPetSearch] = useState('');
  const [petSpeciesFilter, setPetSpeciesFilter] = useState('All');
  const [includeArchivedPets, setIncludeArchivedPets] = useState(false);
  const [isPetLoading, setIsPetLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [isProductLoading, setIsProductLoading] = useState(false);

  const [suppliers, setSuppliers] = useState([]);
  const [isSupplierLoading, setIsSupplierLoading] = useState(false);

  const [expiringProducts, setExpiringProducts] = useState([]);
  const [isExpiryLoading, setIsExpiryLoading] = useState(false);

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
      const res = await fetchPets({
        search: petSearch,
        species: petSpeciesFilter,
        includeArchived: includeArchivedPets
      });
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

  const loadSuppliers = async () => {
    setIsSupplierLoading(true);
    try {
      const res = await fetchSuppliers();
      if (res.success) setSuppliers(res.data);
    } catch (err) {
      console.warn('Supplier API warning:', err.message);
    } finally {
      setIsSupplierLoading(false);
    }
  };

  const loadExpiringProducts = async () => {
    setIsExpiryLoading(true);
    try {
      const res = await fetchExpiringProducts();
      if (res.success) setExpiringProducts(res.data);
    } catch (err) {
      console.warn('Expiry API warning:', err.message);
    } finally {
      setIsExpiryLoading(false);
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
    loadSuppliers();
    loadExpiringProducts();
    loadBookings();
    loadInvoices();
  }, []);

  useEffect(() => {
    if (activeTab === 'pets') loadPets();
    if (activeTab === 'pharmacy') {
      loadProducts();
      loadSuppliers();
      loadExpiringProducts();
    }
    if (activeTab === 'appointments') loadBookings();
    if (activeTab === 'pos') loadInvoices();
  }, [activeTab, petSearch, petSpeciesFilter, includeArchivedPets, productSearch, productCategoryFilter, bookingStatusFilter, paymentFilter]);

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

  const handleArchivePet = async (id, isArchivedState) => {
    try {
      const res = await archivePet(id, { isArchived: isArchivedState });
      showToast(res.message || 'Pet archival status updated!');
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

  const handleAddSupplier = async (supplierData) => {
    setIsSupplierLoading(true);
    try {
      const res = await createSupplier(supplierData);
      showToast(res.message || 'Supplier registered successfully!');
      loadSuppliers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSupplierLoading(false);
    }
  };

  const handleUpdateSupplier = async (id, supplierData) => {
    try {
      const res = await updateSupplier(id, supplierData);
      showToast(res.message || 'Supplier updated successfully!');
      loadSuppliers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteSupplier = async (id) => {
    try {
      const res = await deleteSupplier(id);
      showToast(res.message);
      loadSuppliers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDisposeBatch = async (id, reason) => {
    try {
      const res = await disposeBatch(id, reason);
      showToast(res.message);
      loadProducts();
      loadExpiringProducts();
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

            <button
              onClick={() => scrollToContent()}
              className="flex items-center gap-1.5 bg-teal-800/80 hover:bg-teal-600 px-3 py-1.5 rounded-full text-teal-100 font-medium border border-teal-600/60 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-200" />
              <span>Admin Portal</span>
            </button>

            <div className="flex items-center gap-1.5 bg-teal-800/80 px-3 py-1.5 rounded-full text-teal-100 font-medium border border-teal-600/60">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px]">Server Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Secondary Navigation Bar (Module Tabs) */}
      <nav className="bg-white border-b border-slate-200/80 shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto py-2.5 gap-2 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('pets');
              scrollToContent();
            }}
            className={`py-2.5 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'pets'
                ? 'bg-teal-700 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🐕</span> Patients & Pets ({totalPatientsCount})
          </button>

          <button
            onClick={() => {
              setActiveTab('pharmacy');
              scrollToContent();
            }}
            className={`py-2.5 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'pharmacy'
                ? 'bg-teal-700 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>💊</span> Pharmacy & Stock ({products.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('appointments');
              scrollToContent();
            }}
            className={`py-2.5 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'appointments'
                ? 'bg-teal-700 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📅</span> Appointments ({activeBookingsCount})
          </button>

          <button
            onClick={() => {
              setActiveTab('pos');
              scrollToContent();
            }}
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
        
        {/* 3. Pet Care Hero Banner Carousel (3 Photo Slides + Auto-Play + Chevrons + Dots) */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 min-h-[320px] md:min-h-[340px] flex items-center p-8 md:p-10 text-white shadow-xl border border-teal-600/20 group">
          {/* Slide Background Images with Smooth Cross-Fade */}
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentHeroSlide ? 'opacity-40 scale-105 transition-transform duration-7000' : 'opacity-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent" />

          {/* Left/Right Chevron Overlay Navigation */}
          <button
            onClick={prevHeroSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white p-2.5 rounded-full backdrop-blur-xs transition-all duration-200 hover:scale-110 opacity-80 hover:opacity-100 cursor-pointer shadow-lg"
            title="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextHeroSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white p-2.5 rounded-full backdrop-blur-xs transition-all duration-200 hover:scale-110 opacity-80 hover:opacity-100 cursor-pointer shadow-lg"
            title="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Hero Content (Dynamic Tag, Title & Subtitle based on active slide) */}
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="bg-amber-400 text-slate-900 font-extrabold text-[11px] px-3.5 py-1 rounded-full inline-block tracking-wide uppercase shadow-sm">
              {heroSlides[currentHeroSlide].tag}
            </span>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-white transition-all duration-500">
              {heroSlides[currentHeroSlide].title}
            </h2>

            <p className="text-xs md:text-sm text-teal-100 leading-relaxed max-w-xl transition-all duration-500">
              {heroSlides[currentHeroSlide].subtitle}
            </p>

            {/* Anchored Functional Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setIsPetModalOpen(true)}
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold py-2.5 px-5 rounded-2xl text-xs shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> + Register New Patient
              </button>

              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-5 rounded-2xl text-xs backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-amber-300" /> 📅 Book Clinical Appointment
              </button>

              <button
                onClick={() => setIsProductModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-5 rounded-2xl text-xs backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Package className="w-4 h-4 text-emerald-300" /> + Add Pharmacy Product
              </button>
            </div>
          </div>

          {/* Bottom Slide Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentHeroSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentHeroSlide
                    ? 'w-7 h-2.5 bg-amber-400 shadow-sm'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/80'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 4. Circular Quick-Access Service Circles (PetMart Style with Micro-Animations) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Access Clinical Services</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {/* Circle 1 */}
            <div
              onClick={() => {
                setActiveTab('pets');
                setPetSpeciesFilter('Dog');
                scrollToContent();
              }}
              className="bg-amber-100/90 hover:bg-amber-200 border-2 border-amber-300 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-amber-400/20 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
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
                scrollToContent();
              }}
              className="bg-amber-100/90 hover:bg-amber-200 border-2 border-amber-300 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-amber-400/20 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
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
                scrollToContent();
              }}
              className="bg-amber-100/90 hover:bg-amber-200 border-2 border-amber-300 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-amber-400/20 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">💊</span>
              <span className="text-xs font-bold text-slate-800">Pet Pharmacy</span>
              <span className="text-[10px] text-slate-500 font-medium">Meds & Stock</span>
            </div>

            {/* Circle 4 */}
            <div
              onClick={() => {
                setActiveTab('appointments');
                scrollToContent();
              }}
              className="bg-amber-100/90 hover:bg-amber-200 border-2 border-amber-300 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-amber-400/20 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">✂️</span>
              <span className="text-xs font-bold text-slate-800">Grooming & Spa</span>
              <span className="text-[10px] text-slate-500 font-medium">Appointments</span>
            </div>

            {/* Circle 5 */}
            <div
              onClick={() => {
                setActiveTab('appointments');
                scrollToContent();
              }}
              className="bg-amber-100/90 hover:bg-amber-200 border-2 border-amber-300 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-amber-400/20 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">🩺</span>
              <span className="text-xs font-bold text-slate-800">Consultations</span>
              <span className="text-[10px] text-slate-500 font-medium">Vet Clinical Slots</span>
            </div>

            {/* Circle 6 */}
            <div
              onClick={() => {
                setActiveTab('pos');
                scrollToContent();
              }}
              className="bg-amber-100/90 hover:bg-amber-200 border-2 border-amber-300 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-amber-400/20 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">🏷️</span>
              <span className="text-xs font-bold text-slate-800">POS & Retail</span>
              <span className="text-[10px] text-slate-500 font-medium">Checkout Sales</span>
            </div>
          </div>
        </div>

        {/* 5. TOP KPI METRICS BAR (Hover Border Glow) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => {
              setActiveTab('pets');
              scrollToContent();
            }}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-teal-500/40 cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Registered Patients</span>
              <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">{totalPatientsCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-bold">
              <PawPrint className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab('pharmacy');
              scrollToContent();
            }}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-teal-500/40 cursor-pointer flex items-center justify-between"
          >
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

          <div
            onClick={() => {
              setActiveTab('appointments');
              scrollToContent();
            }}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-teal-500/40 cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Appointments</span>
              <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">{activeBookingsCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab('pos');
              scrollToContent();
            }}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-teal-500/40 cursor-pointer flex items-center justify-between"
          >
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
        <div ref={mainContentRef} className="pt-2">

        {/* PATIENTS & PET PROFILES */}
        {activeTab === 'pets' && (
          <div className="space-y-8 animate-fadeIn">
            <PetList
              pets={pets}
              onDelete={handleDeletePet}
              onArchivePet={handleArchivePet}
              onEdit={(pet) => alert(`Editing pet profile for ${pet.petName} (${pet.uniquePin})`)}
              onUpdateClinicStatus={handleUpdateClinicStatus}
              onAddMedicalLog={handleAddMedicalLog}
              searchTerm={petSearch}
              setSearchTerm={setPetSearch}
              speciesFilter={petSpeciesFilter}
              setSpeciesFilter={setPetSpeciesFilter}
              includeArchived={includeArchivedPets}
              setIncludeArchived={setIncludeArchivedPets}
            />
          </div>
        )}

        {/* PHARMACY & INVENTORY */}
        {activeTab === 'pharmacy' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Pharmacy Sub-Navigation Switcher */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex gap-2 w-fit flex-wrap">
              <button
                onClick={() => setPharmacySubTab('inventory')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  pharmacySubTab === 'inventory'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>📦</span> Medicine & Stock Directory
              </button>

              <button
                onClick={() => setPharmacySubTab('suppliers')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  pharmacySubTab === 'suppliers'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>🏢</span> Supplier Directory
              </button>

              <button
                onClick={() => setPharmacySubTab('expiry')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  pharmacySubTab === 'expiry'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>⚠️</span> Expiry Alerts
                {expiringProducts.length > 0 && (
                  <span className="bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full ml-1 animate-pulse">
                    {expiringProducts.length}
                  </span>
                )}
              </button>
            </div>

            {pharmacySubTab === 'inventory' && (
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
            )}

            {pharmacySubTab === 'suppliers' && (
              <SupplierDirectory
                suppliers={suppliers}
                onAddSupplier={handleAddSupplier}
                onUpdateSupplier={handleUpdateSupplier}
                onDeleteSupplier={handleDeleteSupplier}
              />
            )}

            {pharmacySubTab === 'expiry' && (
              <ExpiryTracker
                expiringProducts={expiringProducts}
                onDisposeBatch={handleDisposeBatch}
                onRefresh={loadExpiringProducts}
              />
            )}
          </div>
        )}

        {/* APPOINTMENT SCHEDULING */}
        {activeTab === 'appointments' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Appointments Sub-Navigation Switcher */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex gap-2 w-fit">
              <button
                onClick={() => setBookingSubTab('directory')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  bookingSubTab === 'directory'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>📋</span> Bookings Directory
              </button>

              <button
                onClick={() => setBookingSubTab('calendar')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  bookingSubTab === 'calendar'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>📅</span> Doctor Day Calendar
              </button>
            </div>

            {bookingSubTab === 'directory' ? (
              <BookingList
                bookings={bookings}
                onUpdateStatus={handleUpdateBookingStatus}
                onCancel={handleCancelBooking}
                onReschedule={handleRescheduleBooking}
                statusFilter={bookingStatusFilter}
                setStatusFilter={setBookingStatusFilter}
              />
            ) : (
              <DoctorCalendarView
                onBookSlot={(slotData) => {
                  setPrefilledBookingData(slotData);
                  setIsBookingModalOpen(true);
                }}
              />
            )}
          </div>
        )}

        {/* POS & INVOICING */}
        {activeTab === 'pos' && (
          <div className="space-y-6 animate-fadeIn">
            {/* POS Sub-Navigation Switcher */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex gap-2 w-fit">
              <button
                onClick={() => setPosSubTab('terminal')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  posSubTab === 'terminal'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>🛒</span> POS Terminal & Invoices
              </button>

              <button
                onClick={() => setPosSubTab('analytics')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  posSubTab === 'analytics'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>📊</span> Sales Analytics & Reports
              </button>
            </div>

            {posSubTab === 'terminal' ? (
              <div className="space-y-8">
                <POSBilling products={products} onSubmitOrder={handleCheckoutPOS} isLoading={isBillingLoading} />
                <InvoiceList
                  invoices={invoices}
                  onVoidInvoice={handleVoidInvoice}
                  paymentFilter={paymentFilter}
                  setPaymentFilter={setPaymentFilter}
                />
              </div>
            ) : (
              <SalesAnalytics />
            )}
          </div>
        )}
        </div>
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
          onClose={() => {
            setIsBookingModalOpen(false);
            setPrefilledBookingData(null);
          }}
          pets={pets}
          onSubmit={handleAddBooking}
          isLoading={isBookingLoading}
          initialData={prefilledBookingData}
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
