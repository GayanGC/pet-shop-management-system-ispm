import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Phone,
  ShieldCheck,
  PawPrint,
  Package,
  Calendar,
  CreditCard,
  Plus,
  Stethoscope,
  AlertTriangle,
  TrendingUp,
  Tag,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User as UserIcon,
  ShoppingBag
} from 'lucide-react';

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
import AuthModal from './components/auth/AuthModal';

import { getCurrentUser, logout } from './services/authService';
import { fetchPets, createPet, updatePet, deletePet, addMedicalLog, archivePet } from './services/petService';
import { fetchProducts, createProduct, deleteProduct, adjustStock, fetchExpiringProducts, disposeBatch } from './services/inventoryService';
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from './services/supplierService';
import { fetchBookings, createBooking, updateBooking, cancelBooking } from './services/bookingService';
import { fetchInvoices, createInvoice, voidInvoice } from './services/billingService';

function App() {
  // Theme State Management (Persisted in localStorage, defaults to 'light')
  const [theme, setTheme] = useState(() => localStorage.getItem('4paw_theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('4paw_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // RBAC User Authentication State
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser() || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  // Active Tabs
  const [activeTab, setActiveTab] = useState('pets');
  const [posSubTab, setPosSubTab] = useState('terminal');
  const [bookingSubTab, setBookingSubTab] = useState('directory');
  const [pharmacySubTab, setPharmacySubTab] = useState('inventory');
  const [prefilledBookingData, setPrefilledBookingData] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Role Auto-Landing & Active Tab Sanitization
  useEffect(() => {
    if (!currentUser) return;
    const role = currentUser.role ? currentUser.role.toLowerCase() : 'customer';
    if (role === 'inventory_officer') {
      setActiveTab('pharmacy');
    } else if (role === 'staff') {
      if (activeTab !== 'pets' && activeTab !== 'appointments') {
        setActiveTab('pets');
      }
    }
  }, [currentUser]);

  // Guest Protection Trigger
  const handleActionWithAuth = (actionCallback, message = 'Please sign in to continue with your booking or purchase.') => {
    if (!currentUser) {
      setAuthModalMessage(message);
      setPendingAction(() => actionCallback);
      setIsAuthModalOpen(true);
      return false;
    }
    if (actionCallback) actionCallback();
    return true;
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    showToast(`Welcome, ${user.name}! Authenticated as ${user.role.toUpperCase()}`);
    if (pendingAction) {
      setTimeout(() => {
        pendingAction();
        setPendingAction(null);
      }, 300);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setActiveTab('pets');
    showToast('Signed out successfully. Switched to Guest View.');
  };

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
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  // Notification Toast Helper
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 4000);
  };

  // Data Loading
  const loadPets = async () => {
    setIsPetLoading(true);
    try {
      const data = await fetchPets({ search: petSearch, species: petSpeciesFilter, includeArchived: includeArchivedPets });
      setPets(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPetLoading(false);
    }
  };

  const loadProducts = async () => {
    setIsProductLoading(true);
    try {
      const data = await fetchProducts({ search: productSearch, category: productCategoryFilter });
      setProducts(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProductLoading(false);
    }
  };

  const loadSuppliers = async () => {
    setIsSupplierLoading(true);
    try {
      const data = await fetchSuppliers();
      setSuppliers(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSupplierLoading(false);
    }
  };

  const loadExpiringProducts = async () => {
    setIsExpiryLoading(true);
    try {
      const data = await fetchExpiringProducts(30);
      setExpiringProducts(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExpiryLoading(false);
    }
  };

  const loadBookings = async () => {
    setIsBookingLoading(true);
    try {
      const data = await fetchBookings({ status: bookingStatusFilter });
      setBookings(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const loadInvoices = async () => {
    setIsBillingLoading(true);
    try {
      const data = await fetchInvoices();
      setInvoices(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBillingLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, [petSearch, petSpeciesFilter, includeArchivedPets]);

  useEffect(() => {
    loadProducts();
  }, [productSearch, productCategoryFilter]);

  useEffect(() => {
    loadBookings();
  }, [bookingStatusFilter]);

  useEffect(() => {
    loadSuppliers();
    loadExpiringProducts();
    loadInvoices();
  }, []);

  // Handlers - Pets
  const handleCreatePet = async (petData) => {
    setIsPetLoading(true);
    try {
      const res = await createPet(petData);
      showToast(`Patient ${res.data.petName} registered successfully! (PIN: ${res.data.uniquePin})`);
      setIsPetModalOpen(false);
      loadPets();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsPetLoading(false);
    }
  };

  const handleDeletePet = async (id) => {
    if (!window.confirm('Are you sure you want to remove this pet patient record?')) return;
    try {
      const res = await deletePet(id);
      showToast(res.message);
      loadPets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleArchivePet = async (id, reason) => {
    try {
      const res = await archivePet(id, reason);
      showToast(res.message);
      loadPets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateClinicStatus = async (id, clinicStatus) => {
    try {
      const res = await updatePet(id, { clinicStatus });
      showToast(`Clinic status updated to ${clinicStatus}`);
      loadPets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddMedicalLog = async (id, logData) => {
    try {
      const res = await addMedicalLog(id, logData);
      showToast('Medical record entry appended successfully!');
      loadPets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers - Products & Pharmacy
  const handleCreateProduct = async (productData) => {
    setIsProductLoading(true);
    try {
      const res = await createProduct(productData);
      showToast(`Stock item ${res.data.itemName} registered successfully!`);
      setIsProductModalOpen(false);
      loadProducts();
      loadExpiringProducts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsProductLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Discontinue this pharmacy / inventory product?')) return;
    try {
      const res = await deleteProduct(id);
      showToast(res.message);
      loadProducts();
      loadExpiringProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAdjustStock = async (id, delta, reason) => {
    try {
      const res = await adjustStock(id, delta, reason);
      showToast(`Stock updated for ${res.data.itemName}. New quantity: ${res.data.stockQuantity}`);
      loadProducts();
      loadExpiringProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDisposeBatch = async (id, auditReason) => {
    try {
      const res = await disposeBatch(id, auditReason);
      showToast(res.message);
      loadProducts();
      loadExpiringProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers - Suppliers
  const handleAddSupplier = async (data) => {
    try {
      const res = await createSupplier(data);
      showToast(`Supplier ${res.data.name} added!`);
      loadSuppliers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateSupplier = async (id, data) => {
    try {
      const res = await updateSupplier(id, data);
      showToast(`Supplier ${res.data.name} updated!`);
      loadSuppliers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Remove this supplier from directory?')) return;
    try {
      const res = await deleteSupplier(id);
      showToast(res.message);
      loadSuppliers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers - Appointments
  const handleCreateBooking = async (bookingData) => {
    setIsBookingLoading(true);
    try {
      const res = await createBooking(bookingData);
      showToast('Appointment scheduled successfully! Slot confirmed.');
      setIsBookingModalOpen(false);
      setPrefilledBookingData(null);
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
    if (!currentUser) {
      handleActionWithAuth(() => handleCheckoutPOS(orderData), 'Please sign in to complete checkout and purchase.');
      return;
    }
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

  // Dynamic Navigation Tabs Based on RBAC Role
  const role = currentUser?.role ? currentUser.role.toLowerCase() : 'guest';

  const getNavTabs = () => {
    if (role === 'customer') {
      return [
        { id: 'pets', label: '🐾 My Pets', count: totalPatientsCount },
        { id: 'appointments', label: '📅 Book Appointment', count: activeBookingsCount },
        { id: 'pharmacy', label: '🛒 Pet Pharmacy Store', count: products.length },
        { id: 'pos', label: '🧾 My Orders & Cart', count: invoices.length }
      ];
    }
    if (role === 'inventory_officer') {
      return [
        { id: 'pharmacy', label: '💊 Pharmacy & Stock Management', count: products.length }
      ];
    }
    if (role === 'staff') {
      return [
        { id: 'pets', label: '🐕 Patients & Medical Records', count: totalPatientsCount },
        { id: 'appointments', label: '📅 Appointments & Calendar', count: activeBookingsCount }
      ];
    }
    // Admin & Guest default view
    return [
      { id: 'pets', label: `🐕 Patients & Pets (${totalPatientsCount})` },
      { id: 'pharmacy', label: `💊 Pharmacy & Stock (${products.length})` },
      { id: 'appointments', label: `📅 Appointments (${activeBookingsCount})` },
      { id: 'pos', label: `💳 POS Terminal (Rs. ${totalRevenue.toFixed(2)})` }
    ];
  };

  const navTabs = getNavTabs();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-teal-600 selection:text-white transition-colors duration-300">
      {/* 1. Ocean Teal Top Header Bar */}
      <header className="bg-teal-700 dark:bg-slate-900 text-white shadow-md border-b border-teal-800 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-800 dark:bg-teal-950/80 border border-teal-600/60 dark:border-teal-800 flex items-center justify-center text-xl shadow-xs">
                🐾
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none text-white">
                  4 Paw Animal Clinic
                </h1>
                <p className="text-xs text-teal-100 dark:text-slate-400 font-medium">Veterinary Hospital & Pet Care Platform</p>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-teal-800 dark:bg-slate-800 text-amber-300 border border-teal-600/40"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
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
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs rounded-xl border-0 focus:ring-4 focus:ring-amber-300 focus:outline-none placeholder:text-slate-400 font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition-all shadow-sm cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Top Right Header Controls & Authentication */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-teal-800/80 dark:bg-slate-800 px-3 py-1.5 rounded-full text-teal-100 dark:text-slate-300 font-medium border border-teal-600/60 dark:border-slate-700">
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>+94 11 234 5678</span>
            </div>

            {/* Theme Toggler (Sun / Moon) */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full bg-teal-800/80 hover:bg-teal-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-300 transition-all cursor-pointer border border-teal-600/60 dark:border-slate-700 flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-teal-100" />}
            </button>

            {/* Live Server Status Radar Ping */}
            <div className="flex items-center gap-1.5 bg-teal-800/80 dark:bg-slate-800 px-3 py-1.5 rounded-full text-teal-100 dark:text-slate-300 font-medium border border-teal-600/60 dark:border-slate-700">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px]">Server Online</span>
            </div>

            {/* Auth User Status / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-teal-800/90 dark:bg-slate-800 px-3 py-1.5 rounded-full text-white font-medium border border-teal-600/60 dark:border-slate-700">
                  <span>
                    {role === 'admin' ? '👑' : role === 'staff' ? '🩺' : role === 'inventory_officer' ? '📦' : '👤'}
                  </span>
                  <span className="font-bold text-xs truncate max-w-[110px]">{currentUser.name || currentUser.email}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 uppercase font-mono font-bold">
                    {role === 'inventory_officer' ? 'INVENTORY' : role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-rose-600/80 hover:bg-rose-700 px-2.5 py-1.5 rounded-full text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthModalMessage(''); setIsAuthModalOpen(true); }}
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-3.5 py-1.5 rounded-full text-xs transition-all shadow-sm cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Demo</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Secondary Navigation Bar (Role-Adaptive Module Tabs) */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-xs sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto py-2.5 gap-2 text-xs font-semibold">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                scrollToContent();
              }}
              className={`py-2.5 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-teal-700 text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
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
        {/* 3. DYNAMIC HERO PHOTO CAROUSEL BANNER */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[320px] md:min-h-[360px] flex items-center">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentHeroSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-teal-950/90 via-teal-900/75 to-transparent" />
            </div>
          ))}

          {/* Carousel Left / Right Navigation Chevrons */}
          <button
            onClick={prevHeroSlide}
            className="absolute left-3 md:left-5 z-20 hover:scale-110 transition-all bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-xs cursor-pointer"
            title="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextHeroSlide}
            className="absolute right-3 md:right-5 z-20 hover:scale-110 transition-all bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-xs cursor-pointer"
            title="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Hero Content Overlay */}
          <div className="relative z-20 p-6 md:p-10 max-w-2xl text-white space-y-3">
            <span className="inline-block bg-amber-400 text-slate-950 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
              {heroSlides[currentHeroSlide].tag}
            </span>
            <h2 className="text-2xl md:text-3xl font-black leading-tight drop-shadow-sm">
              {heroSlides[currentHeroSlide].title}
            </h2>
            <p className="text-xs md:text-sm text-teal-100 max-w-lg font-medium drop-shadow-xs">
              {heroSlides[currentHeroSlide].subtitle}
            </p>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                onClick={() => handleActionWithAuth(() => setIsPetModalOpen(true), 'Please sign in to register a pet patient.')}
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold py-2.5 px-5 rounded-2xl text-xs shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> + Register New Patient
              </button>

              <button
                onClick={() => handleActionWithAuth(() => setIsBookingModalOpen(true), 'Please sign in to book a clinical appointment.')}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-5 rounded-2xl text-xs backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-amber-300" /> 📅 Book Clinical Appointment
              </button>

              {(!currentUser || role === 'admin' || role === 'inventory_officer') && (
                <button
                  onClick={() => handleActionWithAuth(() => setIsProductModalOpen(true), 'Please sign in as Admin or Inventory Officer to add stock.')}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-5 rounded-2xl text-xs backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Package className="w-4 h-4 text-emerald-300" /> + Add Pharmacy Product
                </button>
              )}
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

        {/* 4. Circular Quick-Access Service Circles (Rebalanced to 5 Cards - Grooming Removed) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quick Access Clinical Services
            </h3>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">5 Core Portals</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Circle 1: Canine */}
            <div
              onClick={() => {
                setActiveTab('pets');
                setPetSpeciesFilter('Dog');
                scrollToContent();
              }}
              className="bg-amber-100/90 hover:bg-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border-2 border-amber-300 dark:border-amber-700/60 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-amber-400/20 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">🐕</span>
              <span className="text-xs font-bold text-slate-800 dark:text-amber-200">Canine / Dogs</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Patients & Profiles</span>
            </div>

            {/* Circle 2: Feline */}
            <div
              onClick={() => {
                setActiveTab('pets');
                setPetSpeciesFilter('Cat');
                scrollToContent();
              }}
              className="bg-amber-100/90 hover:bg-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border-2 border-amber-300 dark:border-amber-700/60 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-amber-400/20 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">🐈</span>
              <span className="text-xs font-bold text-slate-800 dark:text-amber-200">Feline / Cats</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Patients & Profiles</span>
            </div>

            {/* Circle 3: Pharmacy */}
            <div
              onClick={() => {
                setActiveTab('pharmacy');
                setProductCategoryFilter('Healthcare');
                scrollToContent();
              }}
              className="bg-amber-100/90 hover:bg-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border-2 border-amber-300 dark:border-amber-700/60 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-amber-400/20 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">💊</span>
              <span className="text-xs font-bold text-slate-800 dark:text-amber-200">Pet Pharmacy</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Meds & Stock</span>
            </div>

            {/* Circle 4: Consultations */}
            <div
              onClick={() => {
                setActiveTab('appointments');
                scrollToContent();
              }}
              className="bg-amber-100/90 hover:bg-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border-2 border-amber-300 dark:border-amber-700/60 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-amber-400/20 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">🩺</span>
              <span className="text-xs font-bold text-slate-800 dark:text-amber-200">Consultations</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Vet Clinical Slots</span>
            </div>

            {/* Circle 5: POS & Retail */}
            <div
              onClick={() => {
                setActiveTab('pos');
                scrollToContent();
              }}
              className="bg-amber-100/90 hover:bg-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border-2 border-amber-300 dark:border-amber-700/60 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-amber-400/20 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">🏷️</span>
              <span className="text-xs font-bold text-slate-800 dark:text-amber-200">POS & Retail</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Checkout Sales</span>
            </div>
          </div>
        </div>

        {/* 5. TOP KPI METRICS BAR (Dark / Light Mode Responsive) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => {
              setActiveTab('pets');
              scrollToContent();
            }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-teal-500/40 cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                {role === 'customer' ? 'My Registered Pets' : 'Registered Patients'}
              </span>
              <span className="text-2xl font-black text-slate-800 dark:text-white font-mono mt-1 block">
                {totalPatientsCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800 flex items-center justify-center font-bold">
              <PawPrint className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab('pharmacy');
              scrollToContent();
            }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-teal-500/40 cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                {role === 'customer' ? 'Catalog Medications' : 'Low Stock Items'}
              </span>
              <span className={`text-2xl font-black font-mono mt-1 block ${lowStockCount > 0 ? 'text-amber-500' : 'text-slate-800 dark:text-white'}`}>
                {role === 'customer' ? products.length : lowStockCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-100 dark:border-amber-800 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab('appointments');
              scrollToContent();
            }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-teal-500/40 cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                {role === 'customer' ? 'My Appointments' : 'Active Appointments'}
              </span>
              <span className="text-2xl font-black text-slate-800 dark:text-white font-mono mt-1 block">
                {activeBookingsCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab('pos');
              scrollToContent();
            }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-teal-500/40 cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                {role === 'customer' ? 'Orders Placed' : 'Total Sales Revenue'}
              </span>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1 block">
                {role === 'customer' ? `${invoices.length} Orders` : `Rs. ${totalRevenue.toFixed(2)}`}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-800 flex items-center justify-center font-bold">
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
              {/* Subtabs for Staff/Admin/Inventory Officer */}
              {role !== 'customer' && (
                <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex gap-2 w-fit flex-wrap">
                  <button
                    onClick={() => setPharmacySubTab('inventory')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                      pharmacySubTab === 'inventory'
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>📦</span> Medicine & Stock Directory
                  </button>

                  {(role === 'admin' || role === 'inventory_officer') && (
                    <>
                      <button
                        onClick={() => setPharmacySubTab('suppliers')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                          pharmacySubTab === 'suppliers'
                            ? 'bg-teal-700 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>🏢</span> Supplier Directory ({suppliers.length})
                      </button>

                      <button
                        onClick={() => setPharmacySubTab('expiry')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                          pharmacySubTab === 'expiry'
                            ? 'bg-teal-700 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>⚠️</span> Expiry & Batch Tracker ({expiringProducts.length})
                      </button>
                    </>
                  )}
                </div>
              )}

              {pharmacySubTab === 'inventory' && (
                <InventoryList
                  products={products}
                  onDelete={handleDeleteProduct}
                  onEdit={(item) => alert(`Edit ${item.itemName}`)}
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
              {/* Doctor Day Calendar Subtab (for Admin & Staff) */}
              {role !== 'customer' && (
                <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex gap-2 w-fit">
                  <button
                    onClick={() => setBookingSubTab('directory')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                      bookingSubTab === 'directory'
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>📋</span> Bookings Directory
                  </button>

                  <button
                    onClick={() => setBookingSubTab('calendar')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                      bookingSubTab === 'calendar'
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>📅</span> Doctor Day Calendar
                  </button>
                </div>
              )}

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
              {/* POS Sub-Navigation Switcher (Analytics hidden for Customer) */}
              {role === 'admin' && (
                <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex gap-2 w-fit">
                  <button
                    onClick={() => setPosSubTab('terminal')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                      posSubTab === 'terminal'
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>🛒</span> POS Terminal & Invoices
                  </button>

                  <button
                    onClick={() => setPosSubTab('analytics')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                      posSubTab === 'analytics'
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>📊</span> Sales Analytics & Reports
                  </button>
                </div>
              )}

              {posSubTab === 'terminal' ? (
                <div className="space-y-8">
                  <POSBilling products={products} onSubmitOrder={handleCheckoutPOS} isLoading={isBillingLoading} />
                  <InvoiceList
                    invoices={invoices}
                    onVoidInvoice={handleVoidInvoice}
                  />
                </div>
              ) : (
                <SalesAnalytics />
              )}
            </div>
          )}
        </div>
      </main>

      {/* POPUP MODALS */}
      {/* 1. Pet Registration Modal */}
      {isPetModalOpen && (
        <PetForm
          onSubmit={handleCreatePet}
          isLoading={isPetLoading}
          isModal={true}
          onClose={() => setIsPetModalOpen(false)}
        />
      )}

      {/* 2. Product Registration Modal */}
      {isProductModalOpen && (
        <ProductForm
          onSubmit={handleCreateProduct}
          isLoading={isProductLoading}
          isModal={true}
          onClose={() => setIsProductModalOpen(false)}
        />
      )}

      {/* 3. Appointment Booking Modal */}
      {isBookingModalOpen && (
        <BookingForm
          pets={pets}
          onSubmit={handleCreateBooking}
          isLoading={isBookingLoading}
          isModal={true}
          prefilledData={prefilledBookingData}
          onClose={() => {
            setIsBookingModalOpen(false);
            setPrefilledBookingData(null);
          }}
        />
      )}

      {/* 4. RBAC Authentication Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMessage={authModalMessage}
          onClose={() => {
            setIsAuthModalOpen(false);
            setPendingAction(null);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export default App;
