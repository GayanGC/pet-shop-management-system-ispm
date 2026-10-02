import React, { useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  Crown,
  Building2,
  MessageSquare,
  Stethoscope,
  Video,
  Camera,
  LineChart,
  Download,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Mail,
  CalendarCheck
} from 'lucide-react';

const ProTierModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const coreFeatures = [
    { title: 'Single Clinic Clinical HMS', desc: 'Centralized patient records & clinical consultation management', icon: Building2 },
    { title: 'Unique Pet PIN (PET-XXXX)', desc: 'Permanent microchip/PIN tracking across veterinary workflows', icon: ShieldCheck },
    { title: 'Atomic Stock Deductions', desc: 'Real-time inventory deduction during POS billing & dispense', icon: Zap },
    { title: 'Slot Conflict 409 Guard', desc: 'Strict multi-doctor double booking prevention & reschedule history', icon: CalendarCheck },
    { title: 'Staff Credential Emailer', desc: 'Automated SMTP onboarding & secure credential distribution', icon: Mail },
    { title: 'MongoDB Atlas Persistence', desc: 'Cloud database connection with multi-tenant customer isolation', icon: Database },
  ];

  const proFeatures = [
    {
      title: 'Multi-Branch & Central Warehouse Sync',
      tag: 'Islandwide Logistics',
      desc: 'Seamless real-time inventory transfers and pet profile access across Colombo, Kandy, and Galle branches.',
      icon: Crown,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
    },
    {
      title: 'Automated WhatsApp & SMS Reminders',
      tag: 'Owner Engagement',
      desc: 'Scheduled automated alerts for recurring annual vaccinations, post-operative checks, and appointment reminders.',
      icon: MessageSquare,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
    },
    {
      title: 'AI-Assisted Diagnostics & Drug Conflicts',
      tag: 'Clinical Intelligence',
      desc: 'Automated cross-check of patient vitals, contraindications, allergies, and dosage safety warnings powered by Gemini AI.',
      icon: Stethoscope,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800'
    },
    {
      title: 'Telemedicine & Live Video Consultations',
      tag: 'Virtual Care',
      desc: 'End-to-end encrypted WebRTC video visits for triage, follow-up evaluations, and digital prescription issuance.',
      icon: Video,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Inpatient ICU Live Cam Streaming',
      tag: 'Pet Wellness',
      desc: 'Secure 24/7 camera streams for pet parents to check in on their admitted pets in the recovery ward.',
      icon: Camera,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
    },
    {
      title: 'Predictive Inventory AI & Financial BI',
      tag: 'Smart Analytics',
      desc: 'Machine learning forecasting for vaccine reorder points, seasonal disease spikes, and multi-branch ledger audits.',
      icon: LineChart,
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800'
    },
  ];

  const handleDownloadSpec = () => {
    const specMarkdown = `# 4 Paw Animal Clinic — Enterprise & Pro Roadmap Specification
Document Version: 2.4.0 (Enterprise Roadmap Edition)
Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
Organization: 4 Paw Animal Clinic & Veterinary Hospital Network (Pvt) Ltd.

---

## 1. Executive Summary
"4 Paw Animal Clinic" is currently running on the high-performance **Core Clinical HMS** architecture (Node.js/Express, React 18, Tailwind CSS, MongoDB Atlas). This specification outlines the architectural blueprint for the upcoming **Pro Enterprise Edition**, enabling multi-location hospital networks, intelligent veterinary triaging, and real-time client engagement.

---

## 2. Tier Feature Comparison

### [CURRENT STABLE] Core Clinical HMS Tier:
- **Single Clinic Operations**: Full OPD, Patient Registry, and Outpatient Consultations.
- **Unique Pet PIN**: Microchip-aligned unique identification (\`PET-XXXX\`) with full medical history linkage.
- **Atomic Stock Deductions**: Concurrent-safe stock adjustment during POS transactions and invoice generation.
- **Slot Conflict & Double-Booking Guard**: Strict 409 Conflict validation preventing clinical double bookings per veterinarian.
- **Staff Credential Emailer**: Onboarding engine with automated HTML credentials dispatch via SMTP / Nodemailer.
- **Cloud Database Persistence**: Real-time MongoDB Atlas integration with strict customer pet data isolation.

### [PLANNED ROADMAP] Pro Enterprise Tier:
1. **Multi-Branch & Central Warehouse Sync**:
   - Master Catalog with regional branch price books.
   - Real-time stock rebalancing and inter-branch dispatch notes.
   - Global pet history roaming (visit any clinic branch seamlessly).

2. **Automated WhatsApp & SMS Gateway**:
   - Webhook-driven vaccine booster notifications.
   - Interactive appointment confirmation & rescheduling via WhatsApp.
   - Post-surgery 48-hour automated recovery check-in surveys.

3. **AI-Assisted Diagnostics & Drug Conflict Triaging**:
   - Gemini-powered analysis of clinical symptoms and differential diagnoses.
   - Drug interaction matrix (e.g., NSAID + Corticosteroid conflict alerts).
   - Automated dosage calculation by weight and feline/canine species metabolism.

4. **Telemedicine & Video Consultations**:
   - High-definition, HIPAA/GDPR-compliant WebRTC peer-to-peer clinical rooms.
   - Integrated e-prescriptions synced directly to the clinic pharmacy POS for home delivery.

5. **Inpatient ICU Live Streaming**:
   - Low-latency RTSP/HLS video streams from inpatient cages.
   - Secure tokenized access granted only to verified pet owners during admission periods.

6. **Predictive Inventory AI & Advanced Financial BI**:
   - Exponential smoothing and trend analysis for expiry risk minimization.
   - Seasonal disease outbreak demand surge predictions (e.g., Parvovirus, Tick fever).
   - Multi-branch P&L consolidated reporting and automated tax remittances.

---

## 3. Technology Stack & Infrastructure
- **Core Engine**: React 18, Vite, Tailwind CSS, Node.js, Express.js.
- **Database**: MongoDB Atlas Replica Set (M30+ Dedicated Cluster with Automated Sharding).
- **Video & Realtime**: WebRTC, Socket.io, AWS Kinesis Video Streams.
- **Messaging**: Twilio / Meta Cloud API (WhatsApp Business Platform).
- **AI Processing**: Google Gemini 1.5 Pro via Vertex AI.

---
© ${new Date().getFullYear()} 4 Paw Animal Clinic. All rights reserved. Confidential & Proprietary.
`;

    const blob = new Blob([specMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '4PawClinic_Enterprise_Pro_Spec.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-300/60 dark:border-amber-500/30 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white p-5 sm:p-6 overflow-hidden">
          {/* Background Decorative Sparkles */}
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-24 bottom-0 w-24 h-24 bg-yellow-300/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-900/40 border border-amber-300/40 text-amber-100 text-[11px] font-bold tracking-wider uppercase backdrop-blur-xs">
                <Crown className="w-3.5 h-3.5 text-yellow-300" />
                Enterprise Edition Roadmap
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                4 Paw Animal Clinic
                <span className="text-amber-200 font-serif italic text-base sm:text-lg font-normal">Pro & Enterprise</span>
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 max-w-2xl font-normal leading-relaxed">
                Discover the upcoming tier enhancements engineered to scale clinical veterinary medicine across multi-location hospital networks.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-transform duration-200 hover:rotate-90 cursor-pointer shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body - Dual Comparison Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Column: Core Clinical HMS (Active) */}
            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Core Clinical HMS
                    </h3>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold font-mono">
                      v1.2.0 • Stable Release
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold">
                    Active
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Fully operational clinical foundation with real-time MongoDB Atlas integration, serving daily OPD operations:
                </p>

                <div className="space-y-2.5">
                  {coreFeatures.map((feat, i) => {
                    const Icon = feat.icon;
                    return (
                      <div key={i} className="flex items-start gap-2.5 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                        <div className="p-1 rounded-md bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{feat.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{feat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[11px] text-slate-400 font-medium">Included in Standard Clinic License</span>
              </div>
            </div>

            {/* Right Column: Pro Enterprise Tier (Planned Roadmap) */}
            <div className="lg:col-span-8 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 dark:from-slate-800/90 dark:via-slate-900/90 dark:to-amber-950/20 rounded-2xl p-4 sm:p-5 border-2 border-amber-300 dark:border-amber-500/40 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-amber-200/60 dark:border-amber-500/30">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950 shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        Pro Enterprise Edition
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-mono font-bold">
                          Roadmap
                        </span>
                      </h3>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                        Next-Gen Scalability for Multi-Facility Hospital Networks
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-800 dark:text-amber-300 font-semibold bg-amber-100/70 dark:bg-amber-950/70 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-800">
                    <Clock className="w-3 h-3 text-amber-600 animate-spin" /> In Active Design
                  </span>
                </div>

                {/* Pro Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {proFeatures.map((feat, idx) => {
                    const Icon = feat.icon;
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`p-1.5 rounded-lg border ${feat.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 font-mono">
                            {feat.tag}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {feat.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                          {feat.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pro Architecture Highlights Banner */}
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-100/80 via-yellow-100/60 to-amber-100/80 dark:from-amber-950/40 dark:via-slate-800 dark:to-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200">
                  <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-[11px] font-medium">
                    Architected for <strong>SLA 99.99% high availability</strong>, automated shard balancing, and HIPAA-compliant video.
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] font-bold text-amber-800 dark:text-amber-300">
                  <span>Q4 RELEASE</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Have feature suggestions or want priority onboarding for your hospital branch?
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadSpec}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 font-semibold text-xs border border-slate-300 dark:border-slate-600 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Download Feature Spec</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span>Close Roadmap</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProTierModal;
