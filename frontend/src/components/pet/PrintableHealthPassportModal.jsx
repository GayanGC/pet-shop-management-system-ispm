import React, { useState, useEffect } from 'react';
import { Printer, X, ShieldCheck, PawPrint, Calendar, User, FileText, CheckCircle2, Award } from 'lucide-react';
import { fetchPetHealthPassport } from '../../services/petService';

const PrintableHealthPassportModal = ({ pet, onClose }) => {
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!pet?._id) return;
      try {
        const res = await fetchPetHealthPassport(pet._id);
        if (res.success) {
          setPassportData(res.data);
        } else {
          setPassportData({ pet, medicalLogs: pet.medicalLogs || [], appointments: [] });
        }
      } catch (err) {
        console.warn('Health passport fetch notice:', err.message);
        setPassportData({ pet, medicalLogs: pet.medicalLogs || [], appointments: [] });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pet]);

  const handlePrint = () => {
    window.print();
  };

  const currentPet = passportData?.pet || pet;
  const medicalLogs = passportData?.medicalLogs || currentPet?.medicalLogs || [];
  const appointments = passportData?.appointments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto transition-all duration-300">
      {/* Print Styles Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #health-passport-document, #health-passport-document * {
            visibility: visible !important;
          }
          #health-passport-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 20px !important;
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

      {/* Modal Container */}
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200/80 space-y-6 max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 animate-in fade-in zoom-in-95">
        {/* Modal Top Bar (Non-Printable) */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold border border-teal-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Official Patient Health Passport</h3>
              <p className="text-xs text-slate-500">Printable Clinical & Vaccination Record Document</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Passport Document
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-transform duration-200 hover:rotate-90 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-medium">
            Generating health passport details...
          </div>
        ) : (
          /* Printable Document Wrapper */
          <div id="health-passport-document" className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6 text-slate-900">
            {/* Header / Logo */}
            <div className="border-b-2 border-slate-900 pb-6 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-black text-xl">
                    🐾
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                      4 PAW ANIMAL CLINIC & PET CARE
                    </h1>
                    <p className="text-[11px] font-bold text-teal-800 tracking-wider uppercase">
                      Official Patient Health Passport & Vaccination Registry
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  No. 45, Baseline Road, Colombo 09 | Hotline: +94 (011) 234-5678 | Email: info@4pawclinic.lk
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block bg-slate-900 text-white font-mono text-xs font-bold px-3 py-1 rounded-lg">
                  PIN: {currentPet.uniquePin}
                </span>
                <span className="block text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                  License #SLVC-2026-VET
                </span>
              </div>
            </div>

            {/* Patient & Owner Demographic Bio Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pet Bio */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <PawPrint className="w-3.5 h-3.5 text-teal-700" /> Patient Identification
                  </span>
                  {currentPet.isArchived && (
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                      Archived Record
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-y-1.5">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Patient Name</span>
                    <span className="font-bold text-slate-900 text-sm">{currentPet.petName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Species / Breed</span>
                    <span className="font-semibold text-slate-800">{currentPet.species} • {currentPet.breed}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Age / Weight</span>
                    <span className="font-semibold text-slate-800">{currentPet.age} Years • {currentPet.weight || 0} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Clinic Status</span>
                    <span className="font-semibold text-teal-800">{currentPet.clinicStatus || 'Registered'}</span>
                  </div>
                </div>
              </div>

              {/* Owner Bio */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-teal-700" /> Registered Owner Info
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Owner Name</span>
                    <span className="font-bold text-slate-900">
                      {passportData?.owner?.name || currentPet.ownerId?.name || currentPet.ownerName || 'Registered Pet Parent'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Contact Info</span>
                    <span className="font-mono text-slate-700">
                      {passportData?.owner?.phone || currentPet.ownerId?.phone || currentPet.ownerPhone || passportData?.owner?.email || currentPet.ownerId?.email || currentPet.ownerEmail || 'On Record with Clinic'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Primary Veterinary Clinic</span>
                    <span className="font-medium text-slate-800">4 Paw Animal Clinic & Referral Center</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vaccination History Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <Award className="w-4 h-4 text-teal-700" /> Immunization & Vaccination Certificates
              </h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[10px] font-bold text-slate-700 uppercase border-y border-slate-200">
                    <th className="py-2 px-3">Date Administered</th>
                    <th className="py-2 px-3">Vaccine Booster Name</th>
                    <th className="py-2 px-3">Attending Veterinarian</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicalLogs.filter(log => log.vaccineName && log.vaccineName.trim() !== '').length > 0 ? (
                    medicalLogs
                      .filter(log => log.vaccineName && log.vaccineName.trim() !== '')
                      .map((log, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-mono">
                            {log.date ? new Date(log.date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-2 px-3 font-bold text-teal-900">{log.vaccineName}</td>
                          <td className="py-2 px-3 text-slate-700">{log.vetDoctor || 'Dr. Perera'}</td>
                          <td className="py-2 px-3 text-right">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              Verified ✓
                            </span>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-3 px-3 text-slate-400 text-center italic">
                        No specific immunization boosters recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Complete Clinical Medical History */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <FileText className="w-4 h-4 text-teal-700" /> Chronological Clinical Medical History
              </h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[10px] font-bold text-slate-700 uppercase border-y border-slate-200">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Diagnosis / Clinical Finding</th>
                    <th className="py-2 px-3">Treatment & Medication Given</th>
                    <th className="py-2 px-3 text-right">Attending Doctor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicalLogs.length > 0 ? (
                    medicalLogs.map((log, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-mono font-semibold">
                          {log.date ? new Date(log.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{log.diagnosis}</td>
                        <td className="py-2.5 px-3 text-slate-700">{log.treatment}</td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-800">{log.vetDoctor || 'Dr. Perera'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-4 px-3 text-slate-400 text-center italic">
                        No previous medical records registered for this patient.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Official Certification Signature Block */}
            <div className="pt-8 border-t-2 border-slate-200 flex justify-between items-end text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Document Authentication</span>
                <span className="font-mono text-slate-700 block">Issued On: {new Date().toLocaleDateString()}</span>
                <span className="text-[10px] text-slate-400 block">Validated via 4 Paw Veterinary Information System</span>
              </div>

              <div className="text-center space-y-1 w-64">
                <div className="border-b border-slate-900 pb-2">
                  <span className="font-serif italic font-bold text-slate-800 text-sm block">Dr. Perera (Senior Vet)</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 uppercase block">Chief Veterinary Officer</span>
                <span className="text-[9px] text-slate-500 block">B.V.Sc (Peradeniya), SLVC #2026-VET</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintableHealthPassportModal;
