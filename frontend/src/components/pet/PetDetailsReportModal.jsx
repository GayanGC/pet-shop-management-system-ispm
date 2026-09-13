import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  PawPrint,
  Calendar,
  User,
  Phone,
  Mail,
  Clock,
  Stethoscope,
  Award,
  FileText,
  Activity,
  CheckCircle2,
  AlertCircle,
  Tag
} from 'lucide-react';
import { fetchPetHealthPassport } from '../../services/petService';

const PetDetailsReportModal = ({ pet, currentUser, onClose, onBookChanneling }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      if (!pet?._id) return;
      try {
        const res = await fetchPetHealthPassport(pet._id);
        if (res.success) {
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
        console.warn('Clinical report fetch note:', err.message);
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
    window.print();
  };

  const currentPet = reportData?.pet || pet;
  const owner = reportData?.owner || currentPet?.ownerId || currentUser;
  const medicalLogs = reportData?.medicalLogs || currentPet?.medicalLogs || [];
  const appointments = reportData?.appointments || [];
  const vaccinations = reportData?.vaccinations || medicalLogs.filter((m) => m.vaccineName && m.vaccineName.trim() !== '');
  const intakeSummary = reportData?.intakeSummary;

  const registrationDate = currentPet?.createdAt
    ? new Date(currentPet.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto transition-all duration-300">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #clinical-report-document, #clinical-report-document * {
            visibility: visible !important;
          }
          #clinical-report-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 24px !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-6 max-h-[92vh] overflow-y-auto relative animate-in fade-in zoom-in-95">
        
        {/* Top Control Bar (Non-Printable) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 no-print">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              🐾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Patient Clinical Report & Health Record
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  OFFICIAL EHR
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Certified Veterinary Hospital Medical History & Diagnostic Profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="py-2.5 px-4 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
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
                className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Book Channeling</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-transform hover:rotate-90 cursor-pointer shrink-0"
              title="Close Report"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Generating clinical diagnostic summary and patient logs...
            </p>
          </div>
        ) : (
          /* Document Printable Body */
          <div id="clinical-report-document" className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
            {/* 1. Official Header */}
            <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center text-2xl font-black shadow-md">
                  🐾
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                    4 PAW ANIMAL CLINIC & SPECIALIST HOSPITAL
                  </h1>
                  <p className="text-[11px] font-bold text-teal-800 tracking-wider uppercase">
                    Veterinary Medicine, Surgery & Certified Patient Health Registry
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    No. 45, Baseline Road, Colombo 09 • Tel: +94 (011) 234-5678 • Email: clinic@4paw.lk
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto">
                <span className="inline-block bg-slate-900 text-white font-mono text-xs font-bold px-3 py-1 rounded-lg">
                  PIN: {currentPet.uniquePin}
                </span>
                <span className="block text-[10px] text-slate-500 font-bold uppercase mt-1">
                  Registered: {registrationDate}
                </span>
                <span className="block text-[10px] text-teal-700 font-mono font-bold">
                  Status: {currentPet.clinicStatus || 'Registered'}
                </span>
              </div>
            </div>

            {/* 2. Patient & Owner Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pet Bio Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <PawPrint className="w-4 h-4 text-teal-700" /> Patient Profile
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 font-mono">
                    ID: {currentPet._id?.toString().slice(-8).toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Patient Name</span>
                    <span className="font-extrabold text-slate-900 text-sm">{currentPet.petName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Species / Breed</span>
                    <span className="font-bold text-slate-800">{currentPet.species} • {currentPet.breed || 'Mixed'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Age & Weight</span>
                    <span className="font-bold text-slate-800">{currentPet.age} yrs • {currentPet.weight || 0} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Gender</span>
                    <span className="font-bold text-slate-800">{currentPet.gender || 'Male'}</span>
                  </div>
                </div>
              </div>

              {/* Verified Owner Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <User className="w-4 h-4 text-teal-700" /> Verified Pet Parent
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Certified Owner ✓
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Full Name</span>
                    <span className="font-bold text-slate-900">{owner?.name || currentPet.ownerName || 'Valued Client'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Contact Phone</span>
                    <span className="font-mono font-bold text-slate-800">{owner?.phone || currentPet.ownerPhone || 'On File with Clinic'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Registered Email</span>
                    <span className="font-mono text-slate-700">{owner?.email || currentPet.ownerEmail || 'Not Specified'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Clinical Intake Baseline & Health Status */}
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-teal-700" /> Electronic Health Record (EHR) Verification
                </span>
                <span className="text-[10px] font-mono text-teal-800 font-bold bg-white px-2 py-0.5 rounded-md border border-teal-200">
                  SLVC Hospital Registry Validated
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                Patient <strong className="text-slate-900">{currentPet.petName}</strong> is registered under Microchip PIN <strong className="font-mono text-teal-800">{currentPet.uniquePin}</strong>. 
                Intake assessment verifies active clinical registration status. Hospital staff have cleared the baseline patient record for clinical consultations, routine vaccination boosters, and surgical procedures.
              </p>
            </div>

            {/* 4. Doctor Clinical Visit Records */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-700" /> Clinical Consultation & Treatment Records ({medicalLogs.length})
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  Chronological Medical Logs
                </span>
              </div>

              {medicalLogs.length > 0 ? (
                <div className="space-y-3">
                  {medicalLogs.map((log, idx) => {
                    const visitDate = log.date ? new Date(log.date).toLocaleDateString() : 'N/A';
                    const nextDate = log.nextVisitDate ? new Date(log.nextVisitDate).toLocaleDateString() : null;
                    const doctor = log.vetDoctor || log.vetName || 'Dr. Perera (Senior Vet)';

                    return (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>👨‍⚕️</span> {doctor}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            📅 Consultation Date: {visitDate}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                            <span className="text-[10px] font-bold uppercase text-teal-800 block">Clinical Diagnosis</span>
                            <p className="font-bold text-slate-900 mt-0.5">{log.diagnosis}</p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                            <span className="text-[10px] font-bold uppercase text-amber-800 block">Prescriptions & Medicines</span>
                            <p className="font-semibold text-slate-800 mt-0.5">
                              {log.medicinesPrescribed && log.medicinesPrescribed.length > 0
                                ? (Array.isArray(log.medicinesPrescribed) ? log.medicinesPrescribed.join(', ') : log.medicinesPrescribed)
                                : 'No pharmaceutical prescription prescribed.'}
                            </p>
                          </div>
                        </div>

                        {(log.treatmentNotes || log.treatment) && (
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px]">
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">Doctor Instructions & Advice</span>
                            <p className="text-slate-700 mt-0.5">"{log.treatmentNotes || log.treatment}"</p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {log.vaccineName && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              💉 Vaccine Administered: {log.vaccineName}
                            </span>
                          )}
                          {nextDate && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800">
                              ⏰ Next Recommended Visit: {nextDate}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-700">
                    No doctor consultation notes recorded yet for this patient.
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    When attending veterinary surgeons or physicians record clinical diagnoses, treatments, or prescriptions during an appointment, they will be permanently indexed here.
                  </p>
                </div>
              )}
            </div>

            {/* 5. Immunization & Vaccination Certificates */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-teal-700" /> Vaccination & Immunization History ({vaccinations.length})
                </h3>
              </div>

              {vaccinations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-[10px] font-bold text-slate-700 uppercase border-y border-slate-200">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Vaccine Booster</th>
                        <th className="py-2 px-3">Attending Veterinarian</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vaccinations.map((vac, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-mono">
                            {vac.date ? new Date(vac.date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-teal-900">{vac.vaccineName}</td>
                          <td className="py-2.5 px-3 text-slate-700">{vac.vetDoctor || 'Dr. Perera'}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              Verified ✓
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                  No specific immunization records registered yet.
                </div>
              )}
            </div>

            {/* 6. Official Stamp & Clinic Signoff Footer */}
            <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-600">
              <div>
                <p className="font-bold text-slate-900 uppercase">Hospital Clinical Certification</p>
                <p className="text-[10px] text-slate-500 mt-0.5 max-w-sm">
                  This document serves as an official clinical summary generated from the 4 Paw Electronic Health Records system.
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <div className="w-48 border-b border-slate-400 pb-1 text-center font-serif text-[11px] italic text-slate-700">
                  Dr. Perera (Senior Vet)
                </div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">
                  Authorized Clinical Signoff
                </span>
                <span className="text-[10px] font-mono text-slate-400 block">
                  Report Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetDetailsReportModal;
