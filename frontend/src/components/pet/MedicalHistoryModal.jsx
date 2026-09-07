import React, { useState } from 'react';
import { X, FileText, Plus, Stethoscope, Calendar, UserCheck } from 'lucide-react';

const MedicalHistoryModal = ({ pet, onClose, onAddLog }) => {
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
    vaccineName: '',
    vetDoctor: 'Dr. Perera (Senior Vet)'
  });

  if (!pet) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.diagnosis || !formData.treatment) {
      alert('Please enter diagnosis and treatment notes');
      return;
    }
    onAddLog(pet._id, formData);
    setFormData({
      diagnosis: '',
      treatment: '',
      vaccineName: '',
      vetDoctor: 'Dr. Perera (Senior Vet)'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Medical & Vaccine Record</h2>
              <p className="text-xs text-slate-500 font-medium">
                Patient: <span className="font-bold text-slate-700">{pet.petName}</span> ({pet.species} - PIN: <span className="font-mono text-indigo-600">{pet.uniquePin}</span>)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Add Medical Log Form */}
          <form onSubmit={handleSubmit} className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 space-y-3">
            <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add New Medical Log Entry
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Diagnosis *</label>
                <input
                  type="text"
                  placeholder="e.g. Mild Skin Allergy / Annual Checkup"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Treatment / Prescription *</label>
                <input
                  type="text"
                  placeholder="e.g. Antihistamine Shampoo, Ointment 5ml"
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Vaccine Name (If Applicable)</label>
                <input
                  type="text"
                  placeholder="e.g. Rabies Vaccine, DHPP"
                  value={formData.vaccineName}
                  onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Attending Vet Doctor</label>
                <select
                  value={formData.vetDoctor}
                  onChange={(e) => setFormData({ ...formData, vetDoctor: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="Dr. Perera (Senior Vet)">Dr. Perera (Senior Vet)</option>
                  <option value="Dr. Fernando (Surgeon)">Dr. Fernando (Surgeon)</option>
                  <option value="Nurse Silva">Nurse Silva</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Record Treatment Log
            </button>
          </form>

          {/* Medical Logs History */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-500" /> Patient Medical History ({pet.medicalLogs ? pet.medicalLogs.length : 0})
            </h3>

            {pet.medicalLogs && pet.medicalLogs.length > 0 ? (
              <div className="space-y-2">
                {pet.medicalLogs.map((log, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5 text-indigo-600" /> {log.diagnosis}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(log.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600"><span className="font-semibold text-slate-700">Treatment:</span> {log.treatment}</p>
                    {log.vaccineName && (
                      <p className="text-indigo-700 font-medium bg-indigo-50/60 inline-block px-2 py-0.5 rounded text-[11px]">
                        💉 Vaccine: {log.vaccineName}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 font-medium">Attending: {log.vetDoctor}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                No medical or vaccination logs recorded yet for this patient.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryModal;
