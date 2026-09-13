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
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Zap,
  Clock
} from 'lucide-react';

import PetForm from './components/pet/PetForm';
import PetList from './components/pet/PetList';
import ProductForm from './components/inventory/ProductForm';
import InventoryList from './components/inventory/InventoryList';
import ProductShowcase from './components/inventory/ProductShowcase';
import SupplierDirectory from './components/inventory/SupplierDirectory';
import ExpiryTracker from './components/inventory/ExpiryTracker';
import BookingForm from './components/booking/BookingForm';
import BookingList from './components/booking/BookingList';
import DoctorCalendarView from './components/appointments/DoctorCalendarView';
import POSBilling from './components/billing/POSBilling';
import InvoiceList from './components/billing/InvoiceList';
import SalesAnalytics from './components/billing/SalesAnalytics';
import AuthModal from './components/auth/AuthModal';
import CustomerCheckoutModal from './components/store/CustomerCheckoutModal';
import CustomerPortal from './components/customer/CustomerPortal';

import { getCurrentUser, logout } from './services/authService';
import { fetchPets, createPet, updatePet, deletePet, addMedicalLog, archivePet } from './services/petService';
import productService, { fetchProducts as fetchProductsApi, createProduct, deleteProduct, adjustStock, fetchExpiringProducts, disposeBatch } from './services/inventoryService';
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from './services/supplierService';
import { fetchBookings, createBooking, updateBooking, cancelBooking } from './services/bookingService';
import { fetchInvoices as fetchInvoicesApi, createInvoice, voidInvoice } from './services/billingService';

const DEFAULT_FALLBACK_PRODUCTS = [
  {
    _id: 'seed-prod-1',
    itemName: 'Rabies Vaccine (Rabisin)',
    category: 'Vaccines',
    price: 2200.00,
    stockQuantity: 15,
    supplier: 'VetMed Lanka Ltd',
    batchNo: 'BTH-2026-01',
    expiryDate: '2027-03-31',
    unit: 'Vial',
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80',
    description: 'Certified inactivated rabies prophylactic vaccine for dogs and cats.'
  },
  {
    _id: 'seed-prod-2',
    itemName: 'Bravecto Chewable (Dogs 20-40kg)',
    category: 'Medicines',
    price: 6800.00,
    stockQuantity: 4,
    supplier: 'Ceylon Pet Supplies',
    batchNo: 'BTH-2026-04',
    expiryDate: '2026-09-30',
    unit: 'Pack',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    description: 'Long-acting chewable flea and tick preventative offering 12-week systemic protection.'
  },
  {
    _id: 'seed-prod-3',
    itemName: 'Royal Canin Maxi Adult (15kg)',
    category: 'Nutrition',
    price: 16500.00,
    stockQuantity: 8,
    supplier: 'Pet Care Importers',
    batchNo: 'BTH-2026-02',
    expiryDate: '2026-12-15',
    unit: 'Bag',
    imageUrl: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=600&q=80',
    description: 'Optimal nutritional kibble formulated for large breed adult dogs with high digestible proteins.'
  },
  {
    _id: 'seed-prod-4',
    itemName: 'Whiskas Ocean Fish (3kg)',
    category: 'Nutrition',
    price: 3200.00,
    stockQuantity: 5,
    supplier: 'Ceylon Pet Supplies',
    batchNo: 'BTH-2026-05',
    expiryDate: '2026-11-20',
    unit: 'Bag',
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80',
    description: 'Wholesome adult feline dry food packed with real ocean fish, zinc, and omega fatty acids.'
  },
  {
    _id: 'seed-prod-5',
    itemName: 'Amoxicillin Clavulanate Drops (15ml)',
    category: 'Medicines',
    price: 1450.00,
    stockQuantity: 12,
    supplier: 'MediVet Supplies',
    batchNo: 'BTH-2026-03',
    expiryDate: '2026-08-31',
    unit: 'Bottle',
    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80',
    description: 'Broad-spectrum potentiated penicillin antibiotic drops for bacterial infections.'
  },
  {
    _id: 'seed-prod-6',
    itemName: 'Antiseptic Flea & Tick Shampoo (500ml)',
    category: 'Medicines',
    price: 1850.00,
    stockQuantity: 18,
    supplier: 'Pet Care Importers',
    batchNo: 'BTH-2026-06',
    expiryDate: '2027-06-30',
    unit: 'Bottle',
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80',
    description: 'Medicated soothing shampoo bath providing rapid knockdown of external ectoparasites.'
  },
  {
    _id: 'seed-prod-7',
    itemName: 'Multivitamin & Mineral Chew Tablets',
    category: 'Supplements',
    price: 2800.00,
    stockQuantity: 25,
    supplier: 'VetMed Lanka Ltd',
    batchNo: 'BTH-2026-07',
    expiryDate: '2027-04-15',
    unit: 'Bottle',
    imageUrl: 'https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?auto=format&fit=crop&w=600&q=80',
    description: 'Daily multivitamin dietary supplement with essential trace minerals for pets of all ages.'
  },
  {
    _id: 'seed-prod-8',
    itemName: 'Interactive Feather Wand Cat Toy',
    category: 'General',
    price: 950.00,
    stockQuantity: 30,
    supplier: 'Pet Care Importers',
    batchNo: 'BTH-2026-08',
    expiryDate: null,
    unit: 'Piece',
    imageUrl: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=600&q=80',
    description: 'Dynamic teaser wand stimulating feline hunting instincts and active cardiovascular play.'
  }
];

function App() {
  // 1. Theme State Management (Persisted in localStorage, defaults to 'light')
  const [theme, setTheme] = useState(() => localStorage.getItem('4paw_theme') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('4paw_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 2. RBAC User Authentication State
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser() || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  // 3. Cart & Storefront Checkout State
  const [cartItems, setCartItems] = useState([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // 4. Navigation & Subtab State
  const [activeTab, setActiveTab] = useState('pets');
  const [posSubTab, setPosSubTab] = useState('terminal');
  const [bookingSubTab, setBookingSubTab] = useState('directory');
  const [pharmacySubTab, setPharmacySubTab] = useState('showcase'); // 'showcase' | 'inventory' | 'suppliers' | 'expiry'
  const [prefilledBookingData, setPrefilledBookingData] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Role Auto-Landing & Active Tab Sanitization
  useEffect(() => {
    if (!currentUser) return;
    const userRole = currentUser.role ? currentUser.role.toLowerCase() : 'customer';
    if (userRole === 'inventory_officer') {
      if (activeTab !== 'pos') {
        setActiveTab('pharmacy');
        setPharmacySubTab('inventory');
      }
    }
  }, [currentUser]);

  // Toast Notification Helper
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 4000);
  };

  // Guest Protection Interceptor
  const handleActionWithAuth = (actionCallback, message = 'Please sign in to proceed with your booking or order.') => {
    if (!currentUser) {
      setAuthModalMessage(message);
      setPendingAction(() => actionCallback);
      setIsAuthModalOpen(true);
      return false;
    }
    if (actionCallback) actionCallback();
    return true;
  };

  // Login Success Handler (Executes Intercepted Action)
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    loadPets();
    loadInvoices();
    loadProducts();
    showToast(`Welcome, ${user.name}! Authenticated as ${user.role.toUpperCase()}`);
    if (pendingAction) {
      setTimeout(() => {
        pendingAction();
        setPendingAction(null);
      }, 300);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setActiveTab('pets');
    setCartItems([]);
    showToast('Signed out successfully. Switched to Guest View.');
  };

  // Cart Handlers
  const handleAddToCart = (product) => {
    handleActionWithAuth(() => {
      const existingIdx = cartItems.findIndex((c) => c._id === product._id || c.product === product._id);
      if (existingIdx > -1) {
        const updated = [...cartItems];
        updated[existingIdx].quantity = (updated[existingIdx].quantity || 1) + 1;
        updated[existingIdx].subtotal = updated[existingIdx].quantity * updated[existingIdx].price;
        setCartItems(updated);
      } else {
        setCartItems([
          ...cartItems,
          {
            _id: product._id,
            product: product._id,
            productId: product._id,
            itemName: product.itemName,
            price: Number(product.price),
            unitPrice: Number(product.price),
            quantity: 1,
            subtotal: Number(product.price),
            unit: product.unit || 'unit',
            category: product.category || 'General'
          }
        ]);
      }
      showToast(`Added "${product.itemName}" to cart! (Rs. ${Number(product.price).toFixed(2)})`);
    }, 'Please sign in or create an account to add items to your cart.');
  };

  const handleQuickBuy = (product) => {
    handleActionWithAuth(() => {
      const existingIdx = cartItems.findIndex((c) => c._id === product._id || c.product === product._id);
      if (existingIdx === -1) {
        setCartItems((prev) => [
          ...prev,
          {
            _id: product._id,
            product: product._id,
            productId: product._id,
            itemName: product.itemName,
            price: Number(product.price),
            unitPrice: Number(product.price),
            quantity: 1,
            subtotal: Number(product.price),
            unit: product.unit || 'unit',
            category: product.category || 'General'
          }
        ]);
      }
      setIsCheckoutModalOpen(true);
      showToast(`Checkout ready for "${product.itemName}"!`);
    }, 'Please sign in or create an account to proceed with checkout.');
  };

  const handleUpdateCartQuantity = (id, newQty) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id || item.product === id
          ? { ...item, quantity: newQty, subtotal: newQty * item.price }
          : item
      )
    );
  };

  const handleRemoveCartItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id && item.product !== id));
    showToast('Removed item from shopping cart');
  };

  // Hero Carousel State
  const heroSlides = [
    {
      title: 'Compassionate Veterinary Care & Wellness',
      subtitle: 'Complete hospital management, microchip patient registration, and expert care.',
      image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1600&q=80',
      badge: 'Veterinary Hospital Care'
    },
    {
      title: 'Certified In-House Pet Pharmacy & Prescriptions',
      subtitle: 'Real-time stock deduction, Sri Lankan Rupee pricing, and batch expiry monitoring.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1600&q=80',
      badge: 'Pharmaceuticals & Vaccines'
    },
    {
      title: 'Instant Online Scheduling & Doctor Appointments',
      subtitle: 'Book visits with Senior Vets without conflict with real-time double booking guards.',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1600&q=80',
      badge: 'Consultation Calendar'
    }
  ];

  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextHeroSlide = () => setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
  const prevHeroSlide = () => setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  // Core Data States
  const [pets, setPets] = useState([]);
  const [products, setProducts] = useState(DEFAULT_FALLBACK_PRODUCTS);
  const [suppliers, setSuppliers] = useState([]);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Filter States
  const [petSearch, setPetSearch] = useState('');
  const [petSpeciesFilter, setPetSpeciesFilter] = useState('All');
  const [includeArchivedPets, setIncludeArchivedPets] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');
  const [invoicePaymentFilter, setInvoicePaymentFilter] = useState('All');

  // Modal Open States
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPetLoading, setIsPetLoading] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  // Scroll to Content Ref
  const mainContentRef = useRef(null);
  const scrollToContent = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Data Loading Effects
  const loadPets = async () => {
    try {
      const data = await fetchPets({
        species: petSpeciesFilter !== 'All' ? petSpeciesFilter : undefined,
        search: petSearch || undefined,
        includeArchived: includeArchivedPets
      });
      setPets(data.data || []);
    } catch (err) {
      console.error('Error loading pets:', err);
    }
  };

  const loadFallbackProducts = () => {
    setProducts(DEFAULT_FALLBACK_PRODUCTS);
  };

  const fetchProducts = async () => {
    try {
      const res = await productService.getAllProducts();
      const items = Array.isArray(res) 
        ? res 
        : (res?.data || res?.products || []);
      
      if (items.length > 0) {
        setProducts(items);
      } else {
        loadFallbackProducts();
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      loadFallbackProducts();
    }
  };
  const loadProducts = fetchProducts;

  const loadSuppliers = async () => {
    try {
      const data = await fetchSuppliers();
      setSuppliers(data.data || []);
    } catch (err) {
      console.error('Error loading suppliers:', err);
    }
  };

  const loadExpiringProducts = async () => {
    try {
      const data = await fetchExpiringProducts(30);
      setExpiringProducts(data.data || []);
    } catch (err) {
      console.error('Error loading expiring products:', err);
    }
  };

  const loadBookings = async () => {
    try {
      const data = await fetchBookings({
        status: bookingStatusFilter !== 'All' ? bookingStatusFilter : undefined
      });
      setBookings(data.data || []);
    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const data = await fetchInvoicesApi({
        paymentMethod: invoicePaymentFilter !== 'All' ? invoicePaymentFilter : undefined
      });
      setInvoices(data.data || []);
      return data;
    } catch (err) {
      console.error('Error loading invoices:', err);
    }
  };
  const loadInvoices = fetchInvoices;
  
  const fetchInitialData = () => {
    fetchProducts();
    loadPets();
    loadBookings();
    loadInvoices();
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    loadPets();
  }, [petSpeciesFilter, petSearch, includeArchivedPets]);

  useEffect(() => {
    loadProducts();
    loadExpiringProducts();
    loadSuppliers();
  }, [productCategoryFilter, productSearch]);

  useEffect(() => {
    loadBookings();
  }, [bookingStatusFilter]);

  useEffect(() => {
    loadInvoices();
  }, [invoicePaymentFilter]);

  // CRUD Handlers - Pets
  const handleCreatePet = async (petData) => {
    setIsPetLoading(true);
    try {
      const payload = {
        ...petData,
        ownerId: petData.ownerId || (currentUser ? currentUser._id : undefined)
      };
      const res = await createPet(payload);
      const createdPet = res.data || res;
      showToast(`Patient ${createdPet.petName} (PIN: ${createdPet.uniquePin}) registered successfully!`);
      setIsPetModalOpen(false);
      // Immediately inject into pets state for real-time reactivity
      if (createdPet && createdPet._id) {
        setPets((prev) => [createdPet, ...prev.filter((p) => p._id !== createdPet._id)]);
      }
      await loadPets();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsPetLoading(false);
    }
  };

  const handleDeletePet = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient record?')) return;
    try {
      const res = await deletePet(id);
      showToast(res.message);
      loadPets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleArchivePet = async (id) => {
    try {
      const res = await archivePet(id, { reason: 'Status Archived' });
      showToast(res.message);
      loadPets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateClinicStatus = async (id, clinicStatus) => {
    try {
      const res = await updatePet(id, { clinicStatus });
      showToast(`Patient clinic status updated to ${clinicStatus}`);
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

  // CRUD Handlers - Products & Pharmacy
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

  const handleAdjustStock = async (id, adjustmentData) => {
    try {
      const res = await adjustStock(id, adjustmentData);
      showToast(res.message);
      loadProducts();
      loadExpiringProducts();
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

  // CRUD Handlers - Suppliers
  const handleCreateSupplier = async (supplierData) => {
    try {
      const res = await createSupplier(supplierData);
      showToast(`Supplier "${res.data.name}" added successfully!`);
      loadSuppliers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateSupplier = async (id, supplierData) => {
    try {
      const res = await updateSupplier(id, supplierData);
      showToast(`Supplier updated successfully!`);
      loadSuppliers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Delete this supplier record?')) return;
    try {
      const res = await deleteSupplier(id);
      showToast(res.message);
      loadSuppliers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // CRUD Handlers - Bookings
  const handleCreateBooking = async (bookingData) => {
    setIsBookingLoading(true);
    try {
      const res = await createBooking(bookingData);
      showToast(`Appointment confirmed for ${res.data.assignedStaff} on ${new Date(res.data.appointmentDate).toLocaleDateString()} at ${res.data.timeSlot}!`);
      setIsBookingModalOpen(false);
      setPrefilledBookingData(null);
      loadBookings();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this consultation appointment?')) return;
    try {
      const res = await cancelBooking(id);
      showToast(res.message);
      loadBookings();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRescheduleBooking = async (id, updateData) => {
    try {
      const res = await updateBooking(id, updateData);
      showToast(`Appointment rescheduled to ${new Date(res.data.appointmentDate).toLocaleDateString()} at ${res.data.timeSlot}!`);
      loadBookings();
    } catch (err) {
      showToast(err.message, 'error');
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

  // POS Checkout Handler
  const handleCheckoutPOS = async (invoiceData) => {
    setIsBillingLoading(true);
    try {
      const res = await createInvoice(invoiceData);
      const invNumber = res.data?.invoiceNo || res.data?.invoiceNumber || 'INV-2026';
      const invTotal = Number(res.data?.finalTotal || res.data?.totalAmount || invoiceData.totalAmount || 0).toFixed(2);
      showToast(`Invoice #${invNumber} processed! Total: Rs. ${invTotal}`);
      setCartItems([]);
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

  // Role resolution
  const role = currentUser?.role ? currentUser.role.toLowerCase() : 'guest';

  // Customer Filtered Pets
  const customerPets = role === 'customer' && currentUser
    ? (() => {
        const filtered = pets.filter((p) => {
          const ownerIdStr = (p.ownerId?._id || p.ownerId)?.toString();
          const currentUserIdStr = (currentUser?._id || currentUser?.id)?.toString();
          const ownerName = (p.ownerName || p.ownerId?.name || '').toLowerCase();
          const currentUserName = (currentUser?.name || '').toLowerCase();
          const ownerPhone = (p.ownerPhone || p.ownerId?.phone || '').replace(/\D/g, '');
          const currentUserPhone = (currentUser?.phone || '').replace(/\D/g, '');

          const ownerMatch = Boolean(ownerIdStr && currentUserIdStr && ownerIdStr === currentUserIdStr);
          const nameMatch = Boolean(ownerName && currentUserName && ownerName === currentUserName);
          const phoneMatch = Boolean(ownerPhone && currentUserPhone && ownerPhone === currentUserPhone);
          return ownerMatch || nameMatch || phoneMatch;
        });
        return filtered;
      })()
    : pets;

  // KPI Metrics
  const totalPatientsCount = role === 'customer' ? customerPets.length : pets.length;
  const lowStockCount = products.filter((p) => p.stockQuantity <= 5).length;
  const activeBookingsCount = bookings.filter((b) => b.status !== 'Cancelled').length;
  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.finalTotal || inv.totalAmount || 0), 0);
  const cartItemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Search Submit Handler
  const handleGlobalSearchSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'pets') setPetSearch(petSearch);
    if (activeTab === 'pharmacy') setProductSearch(productSearch);
  };

  // Dynamic Navigation Tabs Based on Role
  const getNavTabs = () => {
    if (role === 'customer') {
      return [
        { id: 'pets', label: '🐾 My Pets', count: totalPatientsCount },
        { id: 'appointments', label: '📅 Book Appointment', count: activeBookingsCount },
        { id: 'pharmacy', label: '🛒 Pet Store & Pharmacy', count: products.length },
        { id: 'orders', label: `🧾 My Invoices & Orders (${invoices.length})`, count: invoices.length },
        { id: 'pos', label: '💳 POS Cashier Terminal' }
      ];
    }
    if (role === 'inventory_officer') {
      return [
        { id: 'pharmacy', label: '💊 Pharmacy & Stock Management', count: products.length },
        { id: 'pos', label: '💳 Inventory POS & Invoices' }
      ];
    }
    if (role === 'staff') {
      return [
        { id: 'pets', label: '🐕 Patients & Medical Records', count: totalPatientsCount },
        { id: 'appointments', label: '📅 Appointments & Calendar', count: activeBookingsCount },
        { id: 'pharmacy', label: '💊 Pharmacy Catalog', count: products.length },
        { id: 'pos', label: '💳 POS Cashier Terminal' }
      ];
    }
    if (role === 'admin') {
      return [
        { id: 'pets', label: `🐕 Patients & Pets (${totalPatientsCount})` },
        { id: 'pharmacy', label: `💊 Pharmacy & Stock (${products.length})` },
        { id: 'appointments', label: `📅 Appointments (${activeBookingsCount})` },
        { id: 'pos', label: `💳 POS Cashier Terminal` }
      ];
    }
    // Guest Default
    return [
      { id: 'pets', label: `🐕 Patients & Pets (${totalPatientsCount})` },
      { id: 'pharmacy', label: `🛒 Pet Store & Pharmacy (${products.length})` },
      { id: 'appointments', label: `📅 Appointments (${activeBookingsCount})` },
      { id: 'orders', label: `🛍️ Storefront Cart (${cartItemCount})` },
      { id: 'pos', label: `💳 POS Terminal` }
    ];
  };

  const navTabs = getNavTabs();

  return (
    <div className={theme === 'dark' 
      ? 'min-h-screen bg-slate-950 text-slate-100 transition-colors duration-300' 
      : 'min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300'}>
      
      {/* 1. TOP HEADER BAR */}
      <header className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950 text-white shadow-lg border-b border-teal-600/40 dark:border-emerald-500/20 transition-colors sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 border border-amber-300 flex items-center justify-center text-xl shadow-md shadow-amber-400/20">
                🐾
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none text-white flex items-center gap-1.5">
                  4 Paw Animal Clinic
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-mono font-bold">
                    PRO
                  </span>
                </h1>
                <p className="text-xs text-teal-100 dark:text-slate-400 font-medium">
                  Veterinary Hospital & Multi-Species E-Commerce Platform
                </p>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-amber-500 hover:scale-105 transition shadow-sm cursor-pointer"
                title="Toggle Light/Dark Theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {/* Central Search Bar */}
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
                className="w-full pl-9 pr-4 py-2 bg-white/95 dark:bg-slate-800/90 text-slate-800 dark:text-white text-xs rounded-xl border border-teal-200/60 dark:border-slate-700 focus:ring-4 focus:ring-amber-300 focus:outline-none placeholder:text-slate-400 font-medium shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all duration-200 shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            {/* Phone Hot-line */}
            <div className="hidden xl:flex items-center gap-1.5 bg-teal-900/60 dark:bg-slate-800 px-3 py-1.5 rounded-full text-xs font-bold text-teal-100 dark:text-slate-300 border border-teal-600/40 dark:border-slate-700 shadow-xs">
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>+94 11 234 5678</span>
            </div>

            {/* Shopping Cart Shortcut Button */}
            <button
              onClick={() => handleActionWithAuth(() => setIsCheckoutModalOpen(true), 'Please sign in to view your cart and checkout.')}
              className="relative p-2 rounded-xl bg-teal-900/60 hover:bg-teal-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-300 transition-all cursor-pointer border border-teal-600/40 dark:border-slate-700 flex items-center gap-1.5 shadow-xs"
              title="Shopping Bag & Checkout"
            >
              <ShoppingCart className="w-4 h-4 text-amber-300" />
              {cartItemCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-mono font-black text-[10px]">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Theme Toggler (Sun / Moon) */}
            <button
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-amber-500 hover:scale-105 transition shadow-sm cursor-pointer"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Live Server Status Radar Ping */}
            <div className="hidden sm:flex items-center gap-1.5 bg-teal-900/60 dark:bg-slate-800 px-3 py-1.5 rounded-full text-teal-100 dark:text-slate-300 font-medium border border-teal-600/40 dark:border-slate-700 shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px]">Server Online</span>
            </div>

            {/* Auth User Status / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-teal-900/80 dark:bg-slate-800 px-3 py-1.5 rounded-full text-white font-medium border border-teal-600/40 dark:border-slate-700 shadow-xs">
                  <span className="text-sm">
                    {role === 'admin' ? '👑' : role === 'staff' ? '🩺' : role === 'inventory_officer' ? '📦' : '👤'}
                  </span>
                  <span className="font-bold text-xs truncate max-w-[110px]">{currentUser.name || currentUser.email || currentUser.phone}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 uppercase font-mono font-bold">
                    {role === 'inventory_officer' ? 'INVENTORY' : role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 px-3 py-1.5 rounded-full text-white font-bold text-[11px] transition-all cursor-pointer shadow-sm shadow-rose-600/20"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthModalMessage(''); setIsAuthModalOpen(true); }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-extrabold px-3.5 py-1.5 rounded-full text-xs transition-all shadow-md shadow-amber-400/20 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Demo</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. SECONDARY NAVIGATION BAR (ROLE-ADAPTIVE TABS) */}
      <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-teal-100/80 dark:border-slate-800 shadow-sm sticky top-[61px] z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto py-2.5 gap-2 text-xs font-semibold">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                scrollToContent();
              }}
              className={`py-2.5 px-4 rounded-2xl flex items-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md shadow-teal-700/20 font-black scale-105'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-teal-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Notification Toast */}
      {notification.message && (
        <div className={`fixed top-24 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 text-white transition-all transform animate-bounce ${
          notification.type === 'error' ? 'bg-rose-600 shadow-rose-600/30' : 'bg-emerald-600 shadow-emerald-600/30'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* 3. DYNAMIC HERO PHOTO CAROUSEL BANNER */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[320px] md:min-h-[360px] flex items-center border border-teal-100/50 dark:border-emerald-500/20">
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
              <div className="absolute inset-0 bg-gradient-to-r from-teal-950/95 via-teal-900/80 to-transparent" />
            </div>
          ))}

          {/* Chevrons */}
          <button
            onClick={prevHeroSlide}
            className="absolute left-4 z-20 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
            title="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextHeroSlide}
            className="absolute right-4 z-20 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
            title="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Hero Content Overlay */}
          <div className="relative z-20 max-w-2xl px-6 md:px-12 py-8 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              {heroSlides[currentHeroSlide].badge}
            </span>

            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {heroSlides[currentHeroSlide].title}
            </h2>

            <p className="text-xs md:text-sm text-teal-100 font-medium leading-relaxed drop-shadow-sm max-w-xl">
              {heroSlides[currentHeroSlide].subtitle}
            </p>

            {/* Quick Action Action Buttons with Guest Protection */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleActionWithAuth(() => setIsPetModalOpen(true), 'Please sign in to register a pet patient.')}
                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-extrabold py-2.5 px-5 rounded-2xl text-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-400/30"
              >
                <Plus className="w-4 h-4" /> + Register New Patient
              </button>

              <button
                onClick={() => handleActionWithAuth(() => setIsBookingModalOpen(true), 'Please sign in to book a clinical appointment.')}
                className="bg-white/15 hover:bg-white/25 text-white font-bold py-2.5 px-5 rounded-2xl text-xs backdrop-blur-md border border-white/30 hover:border-white/50 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Calendar className="w-4 h-4 text-amber-300" /> 📅 Book Clinical Appointment
              </button>

              {(!currentUser || role === 'admin' || role === 'inventory_officer') && (
                <button
                  onClick={() => handleActionWithAuth(() => setIsProductModalOpen(true), 'Please sign in as Admin or Inventory Officer to add stock.')}
                  className="bg-white/15 hover:bg-white/25 text-white font-bold py-2.5 px-5 rounded-2xl text-xs backdrop-blur-md border border-white/30 hover:border-white/50 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Package className="w-4 h-4 text-emerald-300" /> + Add Pharmacy Product
                </button>
              )}
            </div>
          </div>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentHeroSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentHeroSlide
                    ? 'w-7 h-2.5 bg-amber-400 shadow-md'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/80'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 4. 5 CORE SERVICE HUBS (POS ELIMINATED FROM CUSTOMER VIEW) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Access Clinical Services
            </h3>
            <span className="text-[11px] text-teal-700 dark:text-teal-400 font-bold">5 Core Clinical Hubs</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Hub 1: Canine */}
            <div
              onClick={() => {
                setActiveTab('pets');
                setPetSpeciesFilter('Dog');
                scrollToContent();
              }}
              className="bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-orange-500/20 hover:from-amber-500/25 hover:to-orange-500/30 border-2 border-amber-400/60 dark:border-amber-500/40 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 transform transition-all duration-300 hover:-translate-y-2 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
            >
              <span className="text-3xl drop-shadow-sm">🐕</span>
              <span className="text-xs font-black text-amber-950 dark:text-amber-200">Canine / Dogs</span>
              <span className="text-[10px] text-amber-800/80 dark:text-amber-400/80 font-medium">Patients & Profiles</span>
            </div>

            {/* Hub 2: Feline */}
            <div
              onClick={() => {
                setActiveTab('pets');
                setPetSpeciesFilter('Cat');
                scrollToContent();
              }}
              className="bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-pink-500/20 hover:from-rose-500/25 hover:to-pink-500/30 border-2 border-rose-400/60 dark:border-rose-500/40 shadow-lg shadow-rose-500/10 hover:shadow-rose-500/25 transform transition-all duration-300 hover:-translate-y-2 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
            >
              <span className="text-3xl drop-shadow-sm">🐈</span>
              <span className="text-xs font-black text-rose-950 dark:text-rose-200">Feline / Cats</span>
              <span className="text-[10px] text-rose-800/80 dark:text-rose-400/80 font-medium">Patients & Profiles</span>
            </div>

            {/* Hub 3: Pet Pharmacy */}
            <div
              onClick={() => {
                setActiveTab('pharmacy');
                setProductCategoryFilter('All');
                scrollToContent();
              }}
              className="bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-teal-500/20 hover:from-emerald-500/25 hover:to-teal-500/30 border-2 border-emerald-400/60 dark:border-emerald-500/40 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 transform transition-all duration-300 hover:-translate-y-2 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
            >
              <span className="text-3xl drop-shadow-sm">💊</span>
              <span className="text-xs font-black text-emerald-950 dark:text-emerald-200">Pet Pharmacy</span>
              <span className="text-[10px] text-emerald-800/80 dark:text-emerald-400/80 font-medium">Meds & Vaccines</span>
            </div>

            {/* Hub 4: Consultations */}
            <div
              onClick={() => {
                setActiveTab('appointments');
                scrollToContent();
              }}
              className="bg-gradient-to-br from-cyan-500/15 via-cyan-500/5 to-blue-500/20 hover:from-cyan-500/25 hover:to-blue-500/30 border-2 border-cyan-400/60 dark:border-cyan-500/40 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/25 transform transition-all duration-300 hover:-translate-y-2 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
            >
              <span className="text-3xl drop-shadow-sm">🩺</span>
              <span className="text-xs font-black text-cyan-950 dark:text-cyan-200">Consultations</span>
              <span className="text-[10px] text-cyan-800/80 dark:text-cyan-400/80 font-medium">Doctor Calendar</span>
            </div>

            {/* Hub 5: Storefront / Orders for Customer; POS for Admin */}
            {role === 'customer' || role === 'guest' ? (
              <div
                onClick={() => {
                  setActiveTab('pharmacy');
                  setPharmacySubTab('showcase');
                  scrollToContent();
                }}
                className="bg-gradient-to-br from-purple-500/15 via-purple-500/5 to-indigo-500/20 hover:from-purple-500/25 hover:to-indigo-500/30 border-2 border-purple-400/60 dark:border-purple-500/40 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/25 transform transition-all duration-300 hover:-translate-y-2 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
              >
                <span className="text-3xl drop-shadow-sm">🛍️</span>
                <span className="text-xs font-black text-purple-950 dark:text-purple-200">Pet Store & Cart</span>
                <span className="text-[10px] text-purple-800/80 dark:text-purple-400/80 font-medium">Shop Medicines & Care</span>
              </div>
            ) : (
              <div
                onClick={() => {
                  setActiveTab('pos');
                  scrollToContent();
                }}
                className="bg-gradient-to-br from-purple-500/15 via-purple-500/5 to-indigo-500/20 hover:from-purple-500/25 hover:to-indigo-500/30 border-2 border-purple-400/60 dark:border-purple-500/40 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/25 transform transition-all duration-300 hover:-translate-y-2 active:scale-95 cursor-pointer p-4 rounded-3xl text-center flex flex-col items-center justify-center gap-1"
              >
                <span className="text-3xl drop-shadow-sm">🏷️</span>
                <span className="text-xs font-black text-purple-950 dark:text-purple-200">POS & Retail</span>
                <span className="text-[10px] text-purple-800/80 dark:text-purple-400/80 font-medium">Checkout Cashier</span>
              </div>
            )}
          </div>
        </div>

        {/* 5. KPI METRICS RIBBON */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-lg shadow-teal-900/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xl shadow-xs">
              🐕
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                {role === 'customer' ? 'My Registered Pets' : 'Registered Patients'}
              </p>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white font-mono">
                {totalPatientsCount}
              </h4>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-lg shadow-teal-900/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xl shadow-xs">
              💊
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                {role === 'customer' ? 'Catalog Medications' : 'Low Stock Items'}
              </p>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white font-mono">
                {role === 'customer' ? products.length : lowStockCount}
              </h4>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-lg shadow-teal-900/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xl shadow-xs">
              📅
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                {role === 'customer' ? 'My Appointments' : 'Active Appointments'}
              </p>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white font-mono">
                {activeBookingsCount}
              </h4>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-lg shadow-teal-900/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center text-xl shadow-xs">
              🧾
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                {role === 'customer' ? 'Orders Placed' : 'Total Clinic Revenue'}
              </p>
              <h4 className="text-xl font-black text-slate-800 dark:text-white font-mono">
                {role === 'customer' ? `${invoices.length} Orders` : `Rs. ${totalRevenue.toFixed(2)}`}
              </h4>
            </div>
          </div>
        </div>

        {/* 7. MAIN CONTENT PANELS */}
        <div ref={mainContentRef} className="pt-2">
          {role === 'customer' && currentUser && activeTab !== 'pos' ? (
            activeTab === 'orders' ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-6 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center text-xl shadow-md">
                      🧾
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        My Order Receipts & Clinical Invoices ({invoices.length})
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        View official clinic payment receipts, purchased medications, and transaction records.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setActiveTab('pharmacy')}
                      className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>🛒</span>
                      <span>Return to Store</span>
                    </button>
                    {cartItemCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsCheckoutModalOpen(true)}
                        className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Checkout ({cartItemCount})</span>
                      </button>
                    )}
                  </div>
                </div>

                <InvoiceList
                  invoices={invoices}
                  paymentFilter={invoicePaymentFilter}
                  setPaymentFilter={setInvoicePaymentFilter}
                />
              </div>
            ) : (
              <CustomerPortal
                currentUser={currentUser}
                pets={customerPets}
                products={products}
                bookings={bookings}
                invoices={invoices}
                cartItems={cartItems}
                onAddToCart={handleAddToCart}
                onQuickBuy={handleQuickBuy}
                onOpenCheckout={() => setIsCheckoutModalOpen(true)}
                onOpenRegisterPetModal={() => setIsPetModalOpen(true)}
                onRefreshData={fetchInitialData}
                onShowToast={(msg, type) => showToast(msg, type)}
                currentTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab)}
              />
            )
          ) : (
            <>
              {/* TAB: PATIENTS & PET PROFILES */}
          {activeTab === 'pets' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Customer Top Bar */}
              {role === 'customer' && (
                <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-5 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center text-2xl shadow-md">
                      🐾
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900 dark:text-white">
                        My Pet Patients ({customerPets.length})
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Personalized health records, vaccination schedules & printable health passports.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPetModalOpen(true)}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-teal-700/20 active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add New Pet</span>
                  </button>
                </div>
              )}

              {/* Welcoming Banner for Customer with 0 pets */}
              {role === 'customer' && customerPets.length === 0 ? (
                <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-10 rounded-3xl border-2 border-dashed border-teal-200 dark:border-slate-800 shadow-xl text-center space-y-4 max-w-2xl mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-300 flex items-center justify-center mx-auto border border-teal-200 dark:border-teal-800 shadow-md">
                    <PawPrint className="w-8 h-8 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      You haven't added any pets yet! 🐾
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Welcome to 4 Paw Animal Clinic! Index your dogs, cats, birds, or exotic family members to unlock digital health passports and vaccination tracking.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPetModalOpen(true)}
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-lg shadow-teal-700/20 active:scale-95 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Register Your First Pet</span>
                  </button>
                </div>
              ) : (
                <PetList
                  pets={customerPets}
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
              )}
            </div>
          )}

          {/* TAB: PHARMACY & INVENTORY */}
          {activeTab === 'pharmacy' && (
            <div className="space-y-6 animate-fadeIn">
              {role !== 'customer' && (
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl border border-teal-100 dark:border-slate-800 shadow-sm flex gap-2 w-fit flex-wrap">
                  <button
                    onClick={() => setPharmacySubTab('inventory')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                      pharmacySubTab === 'inventory'
                        ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>📦</span> Medicine & Stock Directory
                  </button>

                  <button
                    onClick={() => setPharmacySubTab('showcase')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                      pharmacySubTab === 'showcase'
                        ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>🛍️</span> Customer Storefront View
                  </button>

                  {(role === 'admin' || role === 'inventory_officer') && (
                    <>
                      <button
                        onClick={() => setPharmacySubTab('suppliers')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                          pharmacySubTab === 'suppliers'
                            ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>🏢</span> Supplier Directory ({suppliers.length})
                      </button>

                      <button
                        onClick={() => setPharmacySubTab('expiry')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                          pharmacySubTab === 'expiry'
                            ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>⚠️</span> Expiry & Batch Tracker ({expiringProducts.length})
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* View: Customer Storefront Showcase */}
              {(pharmacySubTab === 'showcase' || role === 'customer') && (
                <ProductShowcase
                  products={products}
                  onAddToCart={handleAddToCart}
                  onQuickBuy={handleQuickBuy}
                  cartCount={cartItemCount}
                  onOpenCart={() => handleActionWithAuth(() => setIsCheckoutModalOpen(true), 'Please sign in to view your cart.')}
                />
              )}

              {/* View: Internal Medicine Directory */}
              {pharmacySubTab === 'inventory' && role !== 'customer' && (
                <InventoryList
                  products={products}
                  onDelete={handleDeleteProduct}
                  onAdjustStock={handleAdjustStock}
                  searchTerm={productSearch}
                  setSearchTerm={setProductSearch}
                  categoryFilter={productCategoryFilter}
                  setCategoryFilter={setProductCategoryFilter}
                />
              )}

              {/* View: Supplier Directory */}
              {pharmacySubTab === 'suppliers' && (
                <SupplierDirectory
                  suppliers={suppliers}
                  onCreateSupplier={handleCreateSupplier}
                  onUpdateSupplier={handleUpdateSupplier}
                  onDeleteSupplier={handleDeleteSupplier}
                />
              )}

              {/* View: Expiry Tracker */}
              {pharmacySubTab === 'expiry' && (
                <ExpiryTracker
                  expiringProducts={expiringProducts}
                  onDisposeBatch={handleDisposeBatch}
                  onRefresh={loadExpiringProducts}
                />
              )}
            </div>
          )}

          {/* TAB: APPOINTMENT SCHEDULING */}
          {activeTab === 'appointments' && (
            <div className="space-y-6 animate-fadeIn">
              {role !== 'customer' && (
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl border border-teal-100 dark:border-slate-800 shadow-sm flex gap-2 w-fit">
                  <button
                    onClick={() => setBookingSubTab('directory')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                      bookingSubTab === 'directory'
                        ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>📋</span> Bookings Directory
                  </button>

                  <button
                    onClick={() => setBookingSubTab('calendar')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                      bookingSubTab === 'calendar'
                        ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md'
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

          {/* TAB: CUSTOMER ORDERS & INVOICES (CUSTOMER & GUEST VIEW) */}
          {(activeTab === 'orders' || (activeTab === 'pos' && role === 'customer')) && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-6 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center text-xl shadow-md">
                    🛍️
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      My Clinical Invoices & Shopping Cart
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      You currently have <span className="font-bold text-teal-600 dark:text-teal-400">{cartItemCount} item(s)</span> in your shopping bag.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleActionWithAuth(() => setIsCheckoutModalOpen(true), 'Please sign in to proceed with checkout.')}
                  className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Proceed to Storefront Checkout ({cartItemCount})</span>
                </button>
              </div>

              <InvoiceList
                invoices={invoices}
                paymentFilter={invoicePaymentFilter}
                setPaymentFilter={setInvoicePaymentFilter}
              />
            </div>
          )}

          {/* TAB: POS CASHIER TERMINAL (ALL ROLES) */}
          {activeTab === 'pos' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl border border-teal-100 dark:border-slate-800 shadow-sm flex gap-2 w-fit">
                <button
                  onClick={() => setPosSubTab('terminal')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    posSubTab === 'terminal'
                      ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>🛒</span> POS Cashier Register ({cartItemCount})
                </button>

                <button
                  onClick={() => setPosSubTab('analytics')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    posSubTab === 'analytics'
                      ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>📊</span> Sales Analytics & Reports
                </button>
              </div>

              {posSubTab === 'terminal' ? (
                <div className="space-y-8">
                  <POSBilling
                    products={products}
                    onSubmitOrder={handleCheckoutPOS}
                    isLoading={isBillingLoading}
                    cartItems={cartItems}
                    setCartItems={setCartItems}
                    currentUser={currentUser}
                    onRequireAuth={handleActionWithAuth}
                  />
                  <InvoiceList
                    invoices={invoices}
                    onVoidInvoice={handleVoidInvoice}
                    paymentFilter={invoicePaymentFilter}
                    setPaymentFilter={setInvoicePaymentFilter}
                  />
                </div>
              ) : (
                <SalesAnalytics />
              )}
            </div>
          )}
            </>
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
          pets={customerPets && customerPets.length > 0 ? customerPets : pets}
          isOpen={isBookingModalOpen}
          onSubmit={handleCreateBooking}
          isLoading={isBookingLoading}
          isModal={true}
          initialData={prefilledBookingData}
          prefilledData={prefilledBookingData}
          onClose={() => {
            setIsBookingModalOpen(false);
            setPrefilledBookingData(null);
          }}
        />
      )}

      {/* 4. RBAC & Dual-Identifier Multi-Pet Authentication Modal */}
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

      {/* 5. Customer Storefront Checkout Modal */}
      {isCheckoutModalOpen && (
        <CustomerCheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={() => setCartItems([])}
          onCheckoutSuccess={fetchInvoices}
          currentUser={currentUser}
          onRequireAuth={handleActionWithAuth}
          onOrderSuccess={(order) => {
            showToast(`Order #${order?.invoiceNumber || ''} placed successfully!`);
            fetchInvoices();
            loadProducts();
          }}
        />
      )}
    </div>
  );
}

export default App;
