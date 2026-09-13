import React, { useState } from 'react';
import { Archive, X, AlertTriangle, HeartCrack, Calendar, FileText, CheckCircle2 } from 'lucide-react';

const ARCHIVE_REASONS = [
  { id: 'Deceased', label: 'Deceased 🕊️', desc: 'Patient passed away (euthanasia, natural, illness)' },
  { id: 'Relocated', label: 'Relocated / Moved 🏠', desc: 'Pet parent relocated outside clinic service area' },
  { id: 'Owner Request', label: 'Owner Request 👤', desc: 'Owner requested file inactivation or transferred care' },
  { id: 'Adoption Transfer', label: 'Adoption Transfer 🐾', desc: 'Rehomed or transferred to shelter / new family' },
  { id: 'Other', label: 'Other Administrative 📋', desc: 'Duplicate entry or administrative closure' }
];

const PetArchiveModal = ({ pet, onClose, onConfirm, isLoading = false }) => {
  const [reason, setReason] = useState('Deceased');
  const [dateOfEvent, setDateOfEvent] = useState(() => new Date().toISOString().split('T')[0]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [error, setError] = useState('');

  if (!pet) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select an archival reason.');
      return;
    }
    if (!dateOfEvent) {
      setError('Please select the date of this clinical event.');
      return;
    }

    onConfirm({
      isArchived: true,
      reason,
      dateOfEvent,
      clinicalNotes: clinicalNotes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-800 overflow-hidden my-6 transition-all duration-300">
        {/* Top Warning Ribbon */}
        <div className="h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl font-black border border-rose-200 dark:border-rose-900 shadow-sm">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Archive Clinical Record
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {pet.uniquePin}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Patient: <strong className="text-slate-800 dark:text-slate-200">{pet.petName}</strong> ({pet.species} • {pet.breed || 'Mixed'})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Reason Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <HeartCrack className="w-3.5 h-3.5 text-rose-500" /> Archival Clinical Reason <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {ARCHIVE_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    reason === r.id
                      ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 shadow-xs'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="archiveReason"
                      value={r.id}
                      checked={reason === r.id}
                      onChange={(e) => setReason(e.target.value)}
                      className="text-rose-600 accent-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="font-black text-xs block">{r.label}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{r.desc}</span>
                    </div>
                  </div>
                  {reason === r.id && <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />}
                </label>
              ))}
            </div>
          </div>

          {/* Date of Event */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date of Event / Inactivation <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dateOfEvent}
              onChange={(e) => setDateOfEvent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Clinical / Administrative Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Clinical Notes & Administrative Justification
            </label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="e.g. Patient peacefully passed due to congestive heart failure. Sympathy card sent to owner..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-rose-500 resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Notice Alert */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
            ℹ️ <strong>Audit Trail Note:</strong> Archiving removes this pet from active channeling schedules while preserving all EHR vaccination records and diagnostic history in the clinic archives.
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
            >
              <Archive className="w-4 h-4" />
              <span>{isLoading ? 'Archiving...' : 'Confirm & Archive Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PetArchiveModal;
