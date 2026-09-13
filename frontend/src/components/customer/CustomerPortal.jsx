import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Stethoscope,
  PawPrint,
  Calendar,
  Clock,
  User,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Printer,
  ChevronDown,
  ChevronUp,
  FileText,
  Trash2,
  Sparkles,
  Zap,
  Tag,
  Phone,
  Mail,
  Heart,
  LayoutGrid,
  List,
  Filter
} from 'lucide-react';
import ProductShowcase from '../inventory/ProductShowcase';
import PrintableHealthPassportModal from '../pet/PrintableHealthPassportModal';
import PetDetailsReportModal from '../pet/PetDetailsReportModal';
import { createBooking, cancelBooking } from '../../services/bookingService';
import petService from '../../services/petService';

const VET_DOCTORS = [
  { id: 'Dr. Perera (Senior Vet)', name: 'Dr. Perera (Senior Vet & Clinical Surgeon)', specialty: 'Senior Surgeon & General Medicine' },
  { id: 'Dr. Silva (Consultant Physician)', name: 'Dr. Silva (Consultant Veterinary Physician)', specialty: 'Internal Medicine & Diagnostics' },
  { id: 'Dr. Fernando (Vet Surgeon)', name: 'Dr. Fernando (Vet Surgeon & Feline Specialist)', specialty: 'Feline Specialist & Orthopedics' }
];

const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '03:30 PM',
  '04:45 PM',
  '06:00 PM'
];

const SERVICE_TYPES = [
  'General Consultation & Diagnosis',
  'Annual Vaccine Booster & Parasite Screen',
  'Post-Op Wound Care & Minor Dressing',
  'Dental Cleaning & Oral Checkup',
  'Nutritional & Weight Consultation'
];

const CustomerPortal = ({
  currentUser,
  pets = [],
  products = [],
  bookings = [],
  invoices = [],
  cartItems = [],
  onAddToCart,
  onQuickBuy,
  onOpenCheckout,
  onOpenRegisterPetModal,
  onRefreshData,
  onShowToast,
  currentTab,
  onTabChange
}) => {
  // Active Tab: 'store' | 'channeling' | 'pets'
  const [activeTab, setActiveTab] = useState('pets');

  // Internal reactive pets state with auto-fallback fetch
  const [portalPets, setPortalPets] = useState(pets || []);
  const [isPetsLoading, setIsPetsLoading] = useState(false);

  // Sync external tab (e.g. from top header navigation)
  useEffect(() => {
    if (currentTab) {
      if (currentTab === 'appointments') setActiveTab('channeling');
      else if (currentTab === 'pharmacy') setActiveTab('store');
      else if (currentTab === 'orders') setActiveTab('store');
      else if (currentTab === 'pets') setActiveTab('pets');
    }
  }, [currentTab]);

  const loadCustomerPets = async () => {
    setIsPetsLoading(true);
    try {
      const res = await petService.getAllPets();
      const list = Array.isArray(res) ? res : (res?.data || res?.pets || []);
      if (Array.isArray(list)) {
        setPortalPets(list.filter((p) => !p.isArchived));
      }
    } catch (err) {
      console.error('Failed to load customer pets:', err);
    } finally {
      setIsPetsLoading(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(pets) && pets.length > 0) {
      setPortalPets(pets);
    } else {
      loadCustomerPets();
    }
  }, [pets]);

  const handleTabSwitch = (newTab) => {
    setActiveTab(newTab);
    if (onTabChange) {
      if (newTab === 'channeling') onTabChange('appointments');
      else if (newTab === 'store') onTabChange('pharmacy');
      else if (newTab === 'pets') onTabChange('pets');
    }
  };

  // Selected pet for Health Passport Modal & Clinical Report Modal
  const [selectedPetForPassport, setSelectedPetForPassport] = useState(null);
  const [selectedPetForReport, setSelectedPetForReport] = useState(null);

  // Customer Pet View Filter & Mode States
  const [petSearchTerm, setPetSearchTerm] = useState('');
  const [petSpeciesFilter, setPetSpeciesFilter] = useState('All');
  const [petViewMode, setPetViewMode] = useState('cards'); // 'cards' | 'table'

  // Expanded Doctor Visit Timelines map: { [petId]: boolean }
  const [expandedTimelines, setExpandedTimelines] = useState({});

  // Doctor Channeling Form States
  const [selectedPetId, setSelectedPetId] = useState(portalPets.length > 0 ? portalPets[0]._id : '');

  // Preselect first pet when pets load asynchronously
  useEffect(() => {
    if (!selectedPetId && portalPets.length > 0) {
      setSelectedPetId(portalPets[0]._id);
    }
  }, [portalPets, selectedPetId]);

  const [selectedVet, setSelectedVet] = useState(VET_DOCTORS[0].id);
  const [selectedService, setSelectedService] = useState(SERVICE_TYPES[0]);
  const [channelingDate, setChannelingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]);
  const [channelingNotes, setChannelingNotes] = useState('');
  const [isChannelingLoading, setIsChannelingLoading] = useState(false);
  const [channelingError, setChannelingError] = useState('');

  const toggleTimeline = (petId) => {
    setExpandedTimelines((prev) => ({
      ...prev,
      [petId]: !prev[petId]
    }));
  };

  // Channeling Submit Handler
  const handleConfirmChanneling = async (e) => {
    e.preventDefault();
    setChannelingError('');

    if (!selectedPetId) {
      setChannelingError('Please select a registered pet for this consultation visit.');
      return;
    }
    if (!channelingDate || !selectedSlot) {
      setChannelingError('Please select an appointment date and preferred time slot.');
      return;
    }

    setIsChannelingLoading(true);

    try {
      const payload = {
        petId: selectedPetId,
        customerId: currentUser._id,
        serviceType: selectedService,
        assignedStaff: selectedVet,
        appointmentDate: channelingDate,
        timeSlot: selectedSlot,
        notes: channelingNotes || 'Customer Channeling Consultation'
      };

      const res = await createBooking(payload);

      if (res.success) {
        if (onShowToast) {
          onShowToast(`Channeling confirmed with ${selectedVet} on ${channelingDate} at ${selectedSlot}!`);
        }
        setChannelingNotes('');
        if (onRefreshData) onRefreshData();
      } else {
        throw new Error(res.message || 'Failed to book appointment.');
      }
    } catch (err) {
      setChannelingError(err.message || 'Error booking appointment slot.');
    } finally {
      setIsChannelingLoading(false);
    }
  };

  const handleCancelChanneling = async (id) => {
    if (!window.confirm('Cancel this doctor consultation booking?')) return;
    try {
      const res = await cancelBooking(id);
      if (onShowToast) onShowToast(res.message || 'Booking cancelled successfully');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message, 'error');
    }
  };

  // Filter portalPets by search and species
  const filteredPets = portalPets.filter((pet) => {
    const term = petSearchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (pet.petName || '').toLowerCase().includes(term) ||
      (pet.uniquePin || '').toLowerCase().includes(term) ||
      (pet.breed || '').toLowerCase().includes(term);
    const matchesSpecies = petSpeciesFilter === 'All' || pet.species === petSpeciesFilter;
    return matchesSearch && matchesSpecies;
  });

  const cartItemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Personalized Pet Parent Header Card */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-teal-600/40 dark:border-emerald-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg shadow-amber-400/20">
              🐾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Welcome, {currentUser.name || 'Pet Parent'}!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-400/30">
                  VERIFIED OWNER
                </span>
              </div>
              <p className="text-xs text-teal-100 dark:text-slate-400 mt-1 max-w-xl">
                Private Pet Parent Portal: Access certified prescription health records, book veterinary channeling visits, and order authentic medications with doorstep delivery.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="px-4 py-2 rounded-2xl bg-white/10 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 text-center flex-1 md:flex-initial">
              <span className="text-[10px] font-bold text-teal-200 uppercase block">My Pets</span>
              <span className="text-lg font-black font-mono">{portalPets.length}</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/10 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 text-center flex-1 md:flex-initial">
              <span className="text-[10px] font-bold text-teal-200 uppercase block">Channelings</span>
              <span className="text-lg font-black font-mono">{bookings.length}</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/10 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 text-center flex-1 md:flex-initial">
              <span className="text-[10px] font-bold text-teal-200 uppercase block">Invoices</span>
              <span className="text-lg font-black font-mono">{invoices.length}</span>
            </div>
          </div>
        </div>

        {/* 3 Dedicated Portal Tabs */}
        <div className="flex flex-wrap gap-2 pt-6 mt-6 border-t border-teal-600/40 dark:border-slate-800">
          <button
            onClick={() => handleTabSwitch('pets')}
            className={`py-2.5 px-5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'pets'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25 scale-105'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <PawPrint className="w-4 h-4" />
            <span>My Pets, Medical Reports & Doctor Notes ({portalPets.length})</span>
          </button>

          <button
            onClick={() => handleTabSwitch('channeling')}
            className={`py-2.5 px-5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'channeling'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25 scale-105'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Channeling & Appointments ({bookings.length})</span>
          </button>

          <button
            onClick={() => handleTabSwitch('store')}
            className={`py-2.5 px-5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'store'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25 scale-105'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pet Pharmacy & Care Store ({products.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PET PHARMACY & CARE STORE */}
      {/* ========================================================================= */}
      {activeTab === 'store' && (
        <div className="space-y-6">
          <ProductShowcase
            products={products}
            onAddToCart={onAddToCart}
            onQuickBuy={onQuickBuy}
            cartCount={cartItemCount}
            onOpenCart={onOpenCheckout}
            title="🐾 4 Paw Certified Pharmacy & Pet Essentials Store"
            subtitle="Explore veterinary prescription pharmaceuticals, nutritional feeds & accessories. Instant purchase with LKR pricing."
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DOCTOR CHANNELING & APPOINTMENT BOOKING */}
      {/* ========================================================================= */}
      {activeTab === 'channeling' && (
        <div className="space-y-8">
          {/* Channeling Booking Form Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-teal-150 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-md">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Book Clinical Doctor Channeling
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Reserve an in-clinic consultation slot with double-booking prevention guard.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                LKR Clinical Rates Apply
              </span>
            </div>

            {channelingError && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{channelingError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmChanneling} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Select Registered Pet */}
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1.5">
                    Select Your Pet Patient *
                  </label>
                  {portalPets.length > 0 ? (
                    <select
                      required
                      value={selectedPetId}
                      onChange={(e) => setSelectedPetId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:border-teal-500 focus:outline-none"
                    >
                      {portalPets.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.petName} ({p.species} - {p.breed}) [{p.uniquePin}]
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200 text-amber-800 dark:text-amber-200 text-xs">
                      No pets registered. Please add a pet in Tab 3 first.
                    </div>
                  )}
                </div>

                {/* 2. Select Attending Vet */}
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1.5">
                    Attending Veterinary Doctor *
                  </label>
                  <select
                    value={selectedVet}
                    onChange={(e) => setSelectedVet(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:border-teal-500 focus:outline-none"
                  >
                    {VET_DOCTORS.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Clinical Service */}
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1.5">
                    Clinical Service Requested *
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:border-teal-500 focus:outline-none"
                  >
                    {SERVICE_TYPES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Channeling Date */}
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1.5">
                    Preferred Visit Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={channelingDate}
                    onChange={(e) => setChannelingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>

                {/* 5. Clinical Symptoms / Notes */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1.5">
                    Symptoms, Reason for Visit, or Clinical Observations
                  </label>
                  <input
                    type="text"
                    value={channelingNotes}
                    onChange={(e) => setChannelingNotes(e.target.value)}
                    placeholder="e.g. Lethargy, routine booster checkup, itching on ear..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Time Slot Chips */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Select Available Time Slot *
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedSlot === slot
                          ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{slot}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChannelingLoading || portalPets.length === 0}
                  className="py-3 px-8 rounded-2xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-700/25 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isChannelingLoading ? (
                    <span>Verifying Slot & Confirming...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>Confirm Channeling Booking ({selectedSlot})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* My Upcoming Channelings List */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-teal-150 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>📅</span>
                <span>My Consultation Bookings ({bookings.length})</span>
              </h3>
              <span className="text-xs text-slate-400">Strictly Scoped to Your Account</span>
            </div>

            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const petName = booking.petId?.petName || 'Patient Pet';
                  const petSpecies = booking.petId?.species || 'Animal';
                  const dateStr = new Date(booking.appointmentDate).toLocaleDateString();
                  const isCancelled = booking.status === 'Cancelled';

                  return (
                    <div
                      key={booking._id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center justify-center text-lg font-bold shrink-0">
                          🩺
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {petName} ({petSpecies})
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCancelled
                                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                            {booking.assignedStaff} • {booking.serviceType}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            📅 {dateStr} at {booking.timeSlot}
                          </p>
                        </div>
                      </div>

                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => handleCancelChanneling(booking._id)}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                        >
                          ✕ Cancel Booking
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                You have no active doctor channeling appointments. Use the booking form above to schedule a visit.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY PETS, MEDICAL REPORTS & DOCTOR VISIT NOTES */}
      {/* ========================================================================= */}
      {activeTab === 'pets' && (
        <div className="space-y-6">
          {/* Top Header & Search Bar */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-teal-150 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-md">
                  🐾
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>My Registered Pets & Clinical Reports</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      {portalPets.length} Patients
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Official Electronic Health Records (EHR), verified doctor prescriptions, and printable health passports.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* View Mode Toggle: Cards vs Table */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPetViewMode('cards')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      petViewMode === 'cards'
                        ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Card Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPetViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      petViewMode === 'table'
                        ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Directory Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onOpenRegisterPetModal}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-teal-700/20 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Register Another Pet</span>
                </button>
              </div>
            </div>

            {/* Search & Species Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter your pets by name, PIN, breed..."
                  value={petSearchTerm}
                  onChange={(e) => setPetSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={petSpeciesFilter}
                  onChange={(e) => setPetSpeciesFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:border-teal-500 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Species</option>
                  <option value="Dog">Dog 🐕</option>
                  <option value="Cat">Cat 🐈</option>
                  <option value="Bird">Bird 🦜</option>
                  <option value="Small Mammal">Small Mammal 🐇</option>
                  <option value="Primate">Primate 🐒</option>
                  <option value="Reptile">Reptile 🐢</option>
                  <option value="Aquatic">Aquatic 🐠</option>
                  <option value="Farm">Farm & Other 🐐</option>
                </select>
              </div>
            </div>
          </div>

          {/* Empty State when 0 pets registered */}
          {portalPets.length === 0 ? (
            <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-10 rounded-3xl border-2 border-dashed border-teal-200 dark:border-slate-800 shadow-xl text-center space-y-4 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-300 flex items-center justify-center mx-auto border border-teal-200 dark:border-teal-800 shadow-md">
                <PawPrint className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  You haven't added any pets yet! 🐾
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Register your dogs, cats, birds, or other family members to activate certified electronic health reports, printable health passports, and doctor visit updates.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenRegisterPetModal}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-lg shadow-teal-700/20 active:scale-95 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Register Your First Pet</span>
              </button>
            </div>
          ) : filteredPets.length === 0 ? (
            <div className="p-12 text-center text-xs font-bold text-slate-400 bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800">
              No pets match your search criteria. Try a different search term or species filter.
            </div>
          ) : petViewMode === 'table' ? (
            /* ======================================================= */
            /* DIRECTORY TABLE VIEW */
            /* ======================================================= */
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-5">Microchip PIN</th>
                      <th className="py-3.5 px-5">Patient Name</th>
                      <th className="py-3.5 px-5">Species / Breed</th>
                      <th className="py-3.5 px-5">Age & Weight</th>
                      <th className="py-3.5 px-5">Gender</th>
                      <th className="py-3.5 px-5">Clinic Status</th>
                      <th className="py-3.5 px-5 text-right">Official Reports & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredPets.map((pet) => (
                      <tr key={pet._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <span className="bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-mono text-[11px] px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800 font-black inline-block">
                            {pet.uniquePin}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-xs">
                              {pet.species === 'Dog' ? '🐕' : pet.species === 'Cat' ? '🐈' : pet.species === 'Bird' ? '🦜' : '🐾'}
                            </div>
                            <div>
                              <span className="font-black text-slate-900 dark:text-white block">{pet.petName}</span>
                              <span className="text-[10px] text-slate-400">Reg: {new Date(pet.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{pet.species}</span>
                          <span className="text-slate-400 text-[11px] block">{pet.breed || 'Mixed'}</span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 font-medium">
                          {pet.age} yrs • {pet.weight || 0} kg
                        </td>
                        <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 font-medium">
                          {pet.gender || 'Male'}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            {pet.clinicStatus || 'Registered'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPetForReport(pet)}
                            className="py-1.5 px-3 rounded-xl bg-teal-50 dark:bg-teal-950 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 font-extrabold text-[11px] border border-teal-200 dark:border-teal-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="View Complete Clinical Diagnostic Report"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Clinical Report</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedPetForPassport(pet)}
                            className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="View Printable Health Passport"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Passport</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ======================================================= */
            /* CARDS GRID VIEW */
            /* ======================================================= */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPets.map((pet) => {
                const logs = pet.medicalLogs || [];
                const isTimelineOpen = !!expandedTimelines[pet._id];

                return (
                  <div
                    key={pet._id}
                    className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    {/* Pet Card Header */}
                    <div className="p-6 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800/80 dark:to-teal-950/50 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-md">
                          {pet.species === 'Dog' ? '🐕' : pet.species === 'Cat' ? '🐈' : pet.species === 'Bird' ? '🦜' : '🐾'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                              {pet.petName}
                            </h3>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-teal-600 text-white shadow-xs">
                              {pet.uniquePin}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {pet.species} • {pet.breed || 'Mixed'}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        {pet.clinicStatus || 'Registered'}
                      </span>
                    </div>

                    {/* Pet Demographic & Vitals Grid */}
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Age</span>
                          <span className="text-xs font-black text-slate-800 dark:text-white">{pet.age} yrs</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Weight</span>
                          <span className="text-xs font-black text-slate-800 dark:text-white">{pet.weight || 0} kg</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Gender</span>
                          <span className="text-xs font-black text-slate-800 dark:text-white">{pet.gender || 'Male'}</span>
                        </div>
                      </div>

                      {/* Extended Details Chip */}
                      <div className="p-2.5 rounded-xl bg-teal-50/40 dark:bg-slate-800/40 border border-teal-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 font-bold">Registration Intake:</span>
                        <span className="font-mono font-bold text-teal-800 dark:text-teal-300">
                          {new Date(pet.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Action Buttons: 3 Column Layout */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {/* 1. Clinical Report Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedPetForReport(pet)}
                          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-700/20 cursor-pointer transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>📋 Clinical Report</span>
                        </button>

                        {/* 2. Health Passport Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedPetForPassport(pet)}
                          className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all"
                        >
                          <Printer className="w-3.5 h-3.5 text-teal-600" />
                          <span>🩺 Health Passport</span>
                        </button>
                      </div>

                      {/* Doctor Visits Accordion Toggle */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => toggleTimeline(pet._id)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-between border border-slate-200 dark:border-slate-700 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                            <span>Doctor Consultation Visits ({logs.length})</span>
                          </div>
                          {isTimelineOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* 🩺 Expandable Doctor Visit Updates Timeline */}
                      {isTimelineOpen && (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                              Doctor Clinical Visit Notes & Prescriptions
                            </span>
                            <span className="text-[10px] text-teal-600 font-mono font-bold">
                              {logs.length} Recorded Visits
                            </span>
                          </div>

                          {logs.length > 0 ? (
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                              {logs.map((log, idx) => {
                                const visitDate = new Date(log.date).toLocaleDateString();
                                const nextVisit = log.nextVisitDate ? new Date(log.nextVisitDate).toLocaleDateString() : null;
                                const doctor = log.vetName || log.vetDoctor || 'Dr. Perera (Senior Vet)';

                                return (
                                  <div
                                    key={idx}
                                    className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-slate-800/70 border border-teal-200/60 dark:border-slate-700 space-y-2 text-xs"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1">
                                        <span>🩺</span> {doctor}
                                      </span>
                                      <span className="text-[10px] font-mono text-slate-400">
                                        📅 {visitDate}
                                      </span>
                                    </div>

                                    {/* Diagnosis */}
                                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                      <span className="text-[10px] font-black uppercase text-teal-700 dark:text-teal-300 block">
                                        Clinical Diagnosis
                                      </span>
                                      <p className="font-bold text-slate-800 dark:text-white mt-0.5">
                                        {log.diagnosis}
                                      </p>
                                    </div>

                                    {/* Prescribed Medicines */}
                                    {log.medicinesPrescribed && log.medicinesPrescribed.length > 0 && (
                                      <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px]">
                                        <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 block">
                                          💊 Prescribed Medications & Dosage
                                        </span>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                          {Array.isArray(log.medicinesPrescribed) ? log.medicinesPrescribed.join(', ') : log.medicinesPrescribed}
                                        </p>
                                      </div>
                                    )}

                                    {/* Treatment & Vet Advice */}
                                    {(log.treatmentNotes || log.treatment) && (
                                      <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                          Doctor's Advice & Pet Parent Instructions:
                                        </span>
                                        <p className="mt-0.5 font-medium">
                                          "{log.treatmentNotes || log.treatment}"
                                        </p>
                                      </div>
                                    )}

                                    {/* Vaccine or Follow-up */}
                                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                                      {log.vaccineName && (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                                          💉 Vaccine: {log.vaccineName}
                                        </span>
                                      )}
                                      {nextVisit && (
                                        <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 font-bold">
                                          ⏰ Next Follow-Up: {nextVisit}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-4 text-center space-y-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                              <p className="text-xs text-slate-400">
                                No clinical consultation visit notes recorded yet. Schedule a visit to receive certified veterinary notes.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPetId(pet._id);
                                  handleTabSwitch('channeling');
                                }}
                                className="text-[11px] font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 underline cursor-pointer"
                              >
                                + Book Consultation for {pet.petName}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Printable Health Passport Modal */}
      {selectedPetForPassport && (
        <PrintableHealthPassportModal
          pet={selectedPetForPassport}
          onClose={() => setSelectedPetForPassport(null)}
        />
      )}

      {/* Comprehensive Clinical Report Modal */}
      {selectedPetForReport && (
        <PetDetailsReportModal
          pet={selectedPetForReport}
          currentUser={currentUser}
          onClose={() => setSelectedPetForReport(null)}
          onBookChanneling={(pet) => {
            setSelectedPetId(pet._id);
            handleTabSwitch('channeling');
          }}
        />
      )}
    </div>
  );
};

export default CustomerPortal;
