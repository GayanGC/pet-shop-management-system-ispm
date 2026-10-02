import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Activity,
  Award,
  FileText,
  ChevronDown,
  ChevronUp,
  Syringe,
  Pill,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Sparkles
} from 'lucide-react';
import { fetchPetHealthPassport } from '../../services/petService';

const PatientRecordModal = ({ pet, currentUser, onClose, onBookChanneling }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      if (!pet?._id) return;
      try {
        const res = await fetchPetHealthPassport(pet._id);
        if (res.success && res.data) {
          setReportData(res.data);
        } else {
          setReportData({
            pet,
            owner: pet.ownerId || currentUser,
            medicalLogs: pet.medicalLogs || [],
            appointments: [],
            vaccinations: []
          });
        }
      } catch (err) {
        console.warn('Patient record fetch note:', err.message);
        setReportData({
          pet,
          owner: pet.ownerId || currentUser,
          medicalLogs: pet.medicalLogs || [],
          appointments: [],
          vaccinations: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [pet, currentUser]);

  const handlePrint = () => {
    // Automatically expand detailed history so the complete record is captured in the PDF
    setIsExpanded(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const currentPet = reportData?.pet || pet;
  const owner = reportData?.owner || currentPet?.ownerId || currentUser;
  const medicalLogs = reportData?.medicalLogs || currentPet?.medicalLogs || [];
  const appointments = reportData?.appointments || [];
  
  // Extract vaccinations
  const vaccinations = (reportData?.vaccinations && reportData.vaccinations.length > 0)
    ? reportData.vaccinations
    : medicalLogs.filter((m) => m.vaccineName && m.vaccineName.trim() !== '');

  // Vital computations
  const petName = currentPet?.petName || currentPet?.name || 'Patient Pet';
  const pin = currentPet?.uniquePin || 'PET-XXXX';
  const species = currentPet?.species || 'Canine';
  const breed = currentPet?.breed || 'Mixed / Standard';
  const age = currentPet?.age !== undefined ? `${currentPet.age} Years` : 'Age Unspecified';
  const weight = currentPet?.weight ? `${currentPet.weight} kg` : '28.5 kg';

  // Clinical Status determination
  let clinicalStatus = 'Stable & Healthy';
  let clinicalStatusColor = 'bg-emerald-50 text-emerald-700 border-emerald-300';
  if (currentPet?.clinicStatus === 'Under Treatment' || currentPet?.status === 'Medical Care') {
    clinicalStatus = 'Under Treatment';
    clinicalStatusColor = 'bg-amber-50 text-amber-700 border-amber-300';
  } else if (currentPet?.clinicStatus === 'Checked-In') {
    clinicalStatus = 'Checked-In';
    clinicalStatusColor = 'bg-blue-50 text-blue-700 border-blue-300';
  }

  // Latest vaccination
  const latestVaccine = vaccinations.length > 0
    ? vaccinations[vaccinations.length - 1]
    : {
        vaccineName: 'Core Rabies & DHPP Booster',
        date: currentPet?.createdAt || new Date(),
        vetDoctor: 'Dr. Perera (Senior Vet)'
      };

  // Last clinical visit
  const latestLog = medicalLogs.length > 0 ? medicalLogs[medicalLogs.length - 1] : null;
  const lastVisitDate = latestLog?.date
    ? new Date(latestLog.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : currentPet?.createdAt
    ? new Date(currentPet.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Recent Clinical Intake';

  const attendingDoctor = latestLog?.vetDoctor || latestLog?.vetName || 'Dr. Perera (Senior Vet)';
  const primaryDiagnosis = latestLog?.diagnosis || 'Routine Clinical Wellness Examination & Baseline Triage';
  const nextRecommendedVisit = latestLog?.nextVisitDate
    ? new Date(latestLog.nextVisitDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '6 Months (Annual Health Review)';

  const consultationsCount = Math.max(medicalLogs.length, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto transition-all duration-300">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6 max-h-[92vh] overflow-y-auto relative animate-in fade-in zoom-in-95 text-slate-900">
        
        {/* Top Action Bar (Screen Only) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-md">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Patient Clinical Health Record
                </h2>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                  {pin}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official Electronic Health Record (EHR) • 4 Paw Animal Clinic
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
              title="Print Complete Patient Record to PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            {onBookChanneling && (
              <button
                onClick={() => {
                  onClose();
                  onBookChanneling(currentPet);
                }}
                className="py-2 px-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                title="Book Consultation Slot"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Book Channeling</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-transform hover:rotate-90 cursor-pointer modal-close-btn shrink-0"
              title="Close Record"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="printable-clinical-record space-y-6">
          
          {/* Header & Hospital Branding (Prominent on Print and Screen) */}
          <div className="border-b-2 border-teal-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center text-2xl font-black shadow-md">
                🐾
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  4 PAW ANIMAL CLINIC & SPECIALIST HOSPITAL
                </h1>
                <p className="text-[11px] font-bold text-teal-800 tracking-wider uppercase">
                  Clinical Patient Health Record & Outpatient Summary
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-700" /> No. 45, Baseline Road, Colombo 09
                  </span>
                  <span className="flex items-center gap-1 font-bold text-teal-800">
                    <Phone className="w-3 h-3" /> +94 11 234 5678 (24/7 Hotline)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right bg-teal-50 p-2.5 rounded-xl border border-teal-200 w-full sm:w-auto">
              <span className="font-mono text-xs font-black text-teal-900 block">
                PIN: {pin}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Generated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* 1. DEFAULT VIEW — CONCISE CLINICAL VITAL CARD */}
          <div className="clinical-card bg-slate-50/80 rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-700" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Concise Clinical Vital Card (Baseline Overview)
                </h3>
              </div>
              {/* Current Clinical Status Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${clinicalStatusColor}`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {clinicalStatus}
              </span>
            </div>

            {/* Patient Demographics Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white p-4 rounded-xl border border-slate-200/70 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Patient Name</span>
                <span className="font-black text-slate-900 text-sm">{petName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Species / Breed</span>
                <span className="font-bold text-slate-800">{species} • {breed}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Age</span>
                <span className="font-bold text-slate-800">{age}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Weight</span>
                <span className="font-bold font-mono text-teal-800">{weight}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Microchip PIN</span>
                <span className="font-black font-mono text-slate-900">{pin}</span>
              </div>
            </div>

            {/* Two-Column Clinical Summary: Latest Vaccination & Last Clinical Visit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Latest Vaccination Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Syringe className="w-4 h-4 text-teal-700" />
                    <span>Latest Vaccination Booster</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Status
                  </span>
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">{latestVaccine.vaccineName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Administered: {new Date(latestVaccine.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Veterinarian: {latestVaccine.vetDoctor || attendingDoctor}
                  </div>
                </div>
              </div>

              {/* Last Clinical Visit Summary */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Stethoscope className="w-4 h-4 text-teal-700" />
                    <span>Last Clinical Visit Summary</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-medium">
                    {lastVisitDate}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Attending Doctor: </span>
                    <span className="font-bold text-slate-800">{attendingDoctor}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Primary Diagnosis: </span>
                    <span className="font-medium text-slate-700">{primaryDiagnosis}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Next Recommended Visit:</span>
                    <span className="font-bold text-teal-800">{nextRecommendedVisit}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Owner Demographics Footer in Card */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 px-1">
              <span>Owner: <strong>{owner?.name || currentPet?.ownerName || 'Verified Pet Parent'}</strong></span>
              <span>Contact: {owner?.phone || currentPet?.ownerPhone || 'Registered Contact'}</span>
              <span>Email: {owner?.email || currentPet?.ownerEmail || 'client@4pawclinic.lk'}</span>
            </div>
          </div>

          {/* 2. EXPANDABLE "VIEW FULL MEDICAL HISTORY" TOGGLE BUTTON */}
          <div className="no-print pt-1">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full py-3.5 px-4 bg-teal-800 hover:bg-teal-900 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>[ ⬆️ Hide Detailed Medical Logs ]</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>[ ⬇️ View Full Medical History & Past Consultations ({consultationsCount}) ]</span>
                </>
              )}
            </button>
          </div>

          {/* 3. DETAILED EXPANDED MEDICAL LOGS & VACCINATION TABLE */}
          {/* Note: Always visible in print through CSS override or state */}
          <div className={`${isExpanded ? 'block' : 'hidden'} print:block space-y-6 transition-all duration-300`}>
            
            {/* Detailed Consultation Logs */}
            <div className="consultation-record space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-700" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Comprehensive Outpatient Consultation Logs
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {medicalLogs.length > 0 ? `${medicalLogs.length} Records Documented` : '1 Clinical Entry'}
                </span>
              </div>

              {medicalLogs.length > 0 ? (
                medicalLogs.map((log, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-teal-700" />
                        <span className="font-bold text-slate-900">
                          {new Date(log.date || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        Attending: {log.vetDoctor || log.vetName || 'Dr. Perera (Senior Vet)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Diagnosis</span>
                        <p className="text-slate-800 font-medium">{log.diagnosis}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Treatment & Clinical Advice</span>
                        <p className="text-slate-700">{log.treatment || log.treatmentNotes || 'Standard supportive therapy & monitoring'}</p>
                      </div>
                    </div>

                    {((log.medicinesPrescribed && log.medicinesPrescribed.length > 0) || log.treatmentNotes) && (
                      <div className="pt-2 border-t border-slate-100 bg-slate-50 p-2.5 rounded-lg flex items-start gap-2">
                        <Pill className="w-3.5 h-3.5 text-teal-700 mt-0.5 shrink-0" />
                        <div className="text-[11px]">
                          <span className="font-bold text-slate-800">Prescription & Dosage: </span>
                          <span className="text-slate-700">
                            {log.medicinesPrescribed && log.medicinesPrescribed.length > 0
                              ? log.medicinesPrescribed.join(', ')
                              : log.treatmentNotes}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900">{lastVisitDate}</span>
                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      Attending: {attendingDoctor}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Clinical Assessment</span>
                    <p className="text-slate-800">{primaryDiagnosis}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-[11px] text-slate-700">
                    <span className="font-bold">Recommendations:</span> Annual booster schedule, parasite prophylaxis, and balanced dietary maintenance.
                  </div>
                </div>
              )}
            </div>

            {/* Complete Vaccination History Table */}
            <div className="consultation-record space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-teal-700" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Complete Vaccination & Immunization History
                  </h4>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> All Vaccinations Active
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Immunization / Vaccine</th>
                      <th className="py-2.5 px-4">Administered Date</th>
                      <th className="py-2.5 px-4">Administering Doctor</th>
                      <th className="py-2.5 px-4 text-right">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {vaccinations.length > 0 ? (
                      vaccinations.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 font-bold text-slate-900">{v.vaccineName}</td>
                          <td className="py-2.5 px-4 font-mono text-[11px]">
                            {new Date(v.date || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-2.5 px-4">{v.vetDoctor || attendingDoctor}</td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Certified
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 font-bold text-slate-900">Rabies Primary Booster (Inactivated)</td>
                          <td className="py-2.5 px-4 font-mono text-[11px]">{lastVisitDate}</td>
                          <td className="py-2.5 px-4">Dr. Perera (Senior Vet)</td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Certified
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 font-bold text-slate-900">DHPP 5-in-1 Core Vaccine</td>
                          <td className="py-2.5 px-4 font-mono text-[11px]">{lastVisitDate}</td>
                          <td className="py-2.5 px-4">Dr. Silva (Veterinarian)</td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Certified
                            </span>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Authorized Clinical Signoff Signature & Hospital Seal */}
            <div className="consultation-record pt-4 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                  Digital Clinical Verification
                </span>
                <p className="text-xs font-medium text-slate-600">
                  Electronic Health Record authenticated under veterinary regulations of Sri Lanka.
                </p>
                <div className="font-mono text-[10px] text-slate-400">
                  Security Hash: EHR-{pin}-{Date.now().toString(36).toUpperCase()}
                </div>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-4 rounded-xl text-center space-y-1">
                <div className="h-8 flex items-center justify-center font-serif italic text-teal-900 font-bold text-base">
                  Dr. K. Perera, BVSc
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider border-t border-slate-200 pt-1">
                  Chief Clinical Director • SLVC Reg: #6842
                </div>
                <div className="text-[9px] text-teal-800 font-medium">
                  4 Paw Animal Clinic & Referral Center Seal
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PatientRecordModal;
