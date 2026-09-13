import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ShoppingCart,
  LogIn,
  Heart,
  ShieldCheck,
  Award,
  Clock,
  Phone,
  MapPin,
  Sparkles,
  ChevronRight,
  Activity,
  CheckCircle2,
  Stethoscope,
  Scissors,
  Syringe,
  Microscope,
  Ambulance,
  ChevronLeft
} from 'lucide-react';

const HERO_SLIDES = [
  {
    badge: '🐾 Sri Lanka’s Premier Animal Care Center',
    title: 'Advanced Veterinary Hospital & Multi-Species Wellness',
    subtitle:
      'From domestic dogs and cats to birds, small mammals, and exotic species — our state-of-the-art medical hospital provides compassionate diagnostics, surgery, and certified pharmacy dispensing.',
    ctaText: '📅 Schedule Clinical Consultation',
    actionType: 'book',
    image:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80',
    stat: '15,000+ Happy Patients'
  },
  {
    badge: '💊 Certified Veterinary Dispensary',
    title: 'Official Pet Pharmacy & Specialized Nutritional Diets',
    subtitle:
      'Order hospital-grade pharmaceuticals, vaccine boosters, and clinical prescription diets online with guaranteed cold-chain integrity and fast island-wide delivery.',
    ctaText: '🛒 Explore Pharmacy Catalog',
    actionType: 'store',
    image:
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=80',
    stat: '100% Authentic Meds'
  },
  {
    badge: '🚑 24/7 Emergency & ICU Readiness',
    title: 'Rapid Trauma Response & Advanced Surgical Care',
    subtitle:
      'Equipped with digital ultrasound, hematology analyzers, continuous vitals monitoring, and dedicated sterile surgical suites for critical patient stabilization.',
    ctaText: '📞 24/7 Emergency Hotline',
    actionType: 'emergency',
    image:
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1200&q=80',
    stat: '24/7 Emergency Care'
  }
];

const CLINICAL_SERVICES = [
  {
    icon: Stethoscope,
    title: 'Consultations & General Medicine',
    description: 'Thorough physical examinations, preventive screenings, dermatology, and chronic illness management by experienced veterinarians.',
    color: 'from-emerald-500 to-teal-600',
    emoji: '🩺'
  },
  {
    icon: Syringe,
    title: 'Vaccinations & Parasite Defense',
    description: 'Rabies, DHPP, and FVRCP booster schedules coupled with complete flea, tick, and heartworm clinical protection.',
    color: 'from-cyan-500 to-blue-600',
    emoji: '💉'
  },
  {
    icon: Microscope,
    title: 'In-House Pathology & Imaging',
    description: 'Immediate results with high-resolution digital X-rays, ultrasound diagnostics, and full automated blood analysis.',
    color: 'from-purple-500 to-indigo-600',
    emoji: '🔬'
  },
  {
    icon: Ambulance,
    title: '24/7 Emergency & Critical Surgery',
    description: 'Emergency stabilization, soft-tissue surgeries, orthopedic interventions, and dedicated recovery incubators.',
    color: 'from-rose-500 to-pink-600',
    emoji: '🚑'
  },
  {
    icon: Scissors,
    title: 'Grooming Spa & Medicated Baths',
    description: 'Hygienic coat trims, medicated antifungal washes, nail trimming, and parasite control baths for all breeds.',
    color: 'from-amber-500 to-orange-600',
    emoji: '✂️'
  },
  {
    icon: ShoppingCart,
    title: 'Prescription Pharmacy & Care',
    description: 'Direct access to official medications, surgical supplies, dietary supplements, and prescription kibbles.',
    color: 'from-teal-600 to-emerald-700',
    emoji: '💊'
  }
];

const DOCTOR_TEAM = [
  {
    name: 'Dr. Nimal Perera',
    role: 'Senior Veterinary Surgeon & Medical Director',
    degrees: 'BVSc (Peradeniya), MRCVS',
    specialty: 'Soft Tissue Surgery & Critical Care',
    experience: '16+ Years Experience',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Dr. Sunethra Fernando',
    role: 'Specialist in Internal Medicine & Diagnostics',
    degrees: 'BVSc, MSc Clinical Pathology',
    specialty: 'Ultrasound Imaging & Oncology',
    experience: '11+ Years Experience',
    photo: 'https://images.unsplash.com/photo-1594824813580-c11221bbef78?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Dr. Kaveen Silva',
    role: 'Veterinary Dental & Exotic Species Specialist',
    degrees: 'BVSc, Cert. Avian & Reptilian Medicine',
    specialty: 'Avian, Small Mammals & Dental Prophylaxis',
    experience: '8+ Years Experience',
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80'
  }
];

const SPECIES_WELLNESS_TIPS = [
  {
    species: 'Canines / Dogs 🐕',
    tips: [
      'Annual 5-in-1 vaccination & rabies immunization booster.',
      'Monthly tick & flea prevention during humid monsoon seasons.',
      'Clean dental water and teeth check-ups to prevent plaque.'
    ]
  },
  {
    species: 'Felines / Cats 🐈',
    tips: [
      'Maintain fresh water fountains to safeguard renal & urinary health.',
      'Core FVRCP booster vaccines to guard against feline distemper.',
      'Gentle weekly de-shedding to prevent digestive hairballs.'
    ]
  },
  {
    species: 'Birds & Exotic Pets 🦜🐇',
    tips: [
      'Provide UV-B sunlight exposure for proper calcium absorption.',
      'Fresh Timothy hay access for continuous rabbit tooth wear.',
      'Keep indoor enclosures draft-free and safely ventilated.'
    ]
  }
];

const GuestClinicOverview = ({
  onBookAppointment,
  onExploreStore,
  onOpenAuth,
  productsCount = 0
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance hero carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const activeSlide = HERO_SLIDES[currentSlide];

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* 1. HERO CAROUSEL BANNER */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-teal-200/60 dark:border-slate-800 bg-slate-900 min-h-[440px] flex items-center">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <img
            src={activeSlide.image}
            alt={activeSlide.title}
            className="w-full h-full object-cover opacity-35 filter blur-xs scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-3xl p-6 sm:p-10 md:p-12 space-y-5 text-white">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {activeSlide.badge}
          </span>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {activeSlide.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            {activeSlide.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onBookAppointment}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-700/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Doctor Appointment</span>
            </button>

            <button
              onClick={onExploreStore}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/30 backdrop-blur-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-amber-300" />
              <span>Browse Pet Store ({productsCount})</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>

          {/* Carousel Slide Indicators */}
          <div className="flex items-center gap-2 pt-4">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
            <span className="text-[11px] text-slate-400 font-mono ml-2">
              {currentSlide + 1} / {HERO_SLIDES.length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CLINICAL EXCELLENCE SERVICES */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
            🏥 Comprehensive Care Under One Roof
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Specialist Veterinary Services & Hospital Facilities
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Certified veterinary diagnostics, modern operating suites, and compassionate patient handling designed for optimal animal comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CLINICAL_SERVICES.map((serv, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md shadow-slate-900/5 hover:shadow-xl hover:border-teal-500/50 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-slate-800 text-2xl flex items-center justify-center border border-teal-100 dark:border-slate-700 shadow-xs group-hover:scale-110 transition-transform">
                  {serv.emoji}
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {serv.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {serv.description}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                <span>Certified Clinical Standard</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. MULTI-SPECIES WELLNESS & PREVENTIVE GUIDELINES */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 text-white p-8 sm:p-10 rounded-3xl shadow-xl border border-teal-800/60 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-teal-800/80 pb-4">
          <div>
            <span className="text-amber-400 text-xs font-black uppercase tracking-wider">
              🛡️ Doctor’s Preventive Medicine Guide
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              Multi-Species Health Protocols
            </h3>
            <p className="text-xs text-teal-200/80">
              Essential healthcare habits certified by our senior veterinary staff.
            </p>
          </div>
          <button
            onClick={onBookAppointment}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-md transition cursor-pointer"
          >
            Consult a Vet
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SPECIES_WELLNESS_TIPS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-3"
            >
              <h4 className="font-black text-sm text-amber-300 flex items-center gap-2">
                {item.species}
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                {item.tips.map((tip, tipIdx) => (
                  <li key={tipIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MEET OUR SENIOR VETERINARY PHYSICIANS */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
            🩺 Expert Veterinary Physicians
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Dedicated Care by Clinical Leaders
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Our multi-disciplinary team brings decades of combined surgical and clinical diagnostics experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {DOCTOR_TEAM.map((doc, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col justify-between group hover:border-teal-500/50 transition-all"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={doc.photo}
                    alt={doc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-bold">
                    {doc.experience}
                  </div>
                </div>

                <div className="p-5 space-y-1.5">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-bold">
                    {doc.role}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {doc.degrees}
                  </p>
                  <div className="pt-2">
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold inline-block">
                      Focus: {doc.specialty}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={onBookAppointment}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. LOCATION, HOURS & 24/7 HOTLINE CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            Emergency Care Active 24/7
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            4 Paw Animal Clinic & Specialist Hospital
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            No. 120, Galle Road, Colombo 03, Western Province, Sri Lanka
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            OPD Hours: Monday – Sunday: 8:00 AM – 10:00 PM (Emergency ICU: 24/7)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <a
            href="tel:+94112345678"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Emergency: +94 11 234 5678</span>
          </a>

          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-400/20 transition cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Customer Sign In / Register</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestClinicOverview;
