import React, { useState, useEffect } from 'react';
import { Calendar, Clock, UserCheck, FileText, Plus, User, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchDoctorDaySchedule } from '../../services/bookingService';

const BookingForm = ({ pets = [], onSubmit, isLoading, isModal, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    petId: initialData?.petId || '',
    serviceType: initialData?.serviceType || 'Veterinary Checkup',
    assignedStaff: initialData?.assignedStaff || 'Dr. Perera (Senior Vet)',
    appointmentDate: initialData?.appointmentDate || '',
    timeSlot: initialData?.timeSlot || '09:00 AM',
    notes: initialData?.notes || ''
  });

  const [slotSchedule, setSlotSchedule] = useState([]);
  const [conflictError, setConflictError] = useState('');

  const workingSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.assignedStaff && formData.appointmentDate) {
      fetchDoctorDaySchedule(formData.assignedStaff, formData.appointmentDate)
        .then((res) => {
          if (res.success) {
            setSlotSchedule(res.data || []);
          }
        })
        .catch((err) => console.log('[Schedule Check Note]:', err.message));
    }
  }, [formData.assignedStaff, formData.appointmentDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setConflictError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflictError('');

    if (!formData.petId || !formData.appointmentDate || !formData.timeSlot) {
      alert('Please select a pet, appointment date, and time slot');
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({
        petId: '',
        serviceType: 'Veterinary Checkup',
        assignedStaff: 'Dr. Perera (Senior Vet)',
        appointmentDate: '',
        timeSlot: '09:00 AM',
        notes: ''
      });
      if (isModal && onClose) onClose();
    } catch (err) {
      if (err.message && err.message.includes('Conflict')) {
        setConflictError(err.message);
      } else {
        alert(err.message || 'Error booking appointment');
      }
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-5">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Schedule Clinical Appointment</h2>
            <p className="text-xs text-slate-500">Interactive Clinician Slot Booking & Double-Booking Guard</p>
          </div>
        </div>
        {isModal && (
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {conflictError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{conflictError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-teal-600" /> Select Registered Patient <span className="text-rose-500">*</span>
          </label>
          <select
            name="petId"
            value={formData.petId}
            onChange={handleChange}
            required
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all"
          >
            <option value="">-- Choose Registered Pet Patient --</option>
            {pets.map((pet) => (
              <option key={pet._id} value={pet._id}>
                {pet.petName} ({pet.species} - PIN: {pet.uniquePin})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-600" /> Service Category <span className="text-rose-500">*</span>
          </label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all"
          >
            <option value="Veterinary Checkup">Veterinary Clinical Checkup 🩺</option>
            <option value="Grooming & Bath">Full Grooming & Bathing ✂️</option>
            <option value="Vaccination">Vaccination & Immunization 💉</option>
            <option value="Dental Care">Dental Scaling & Cleaning 🦷</option>
            <option value="General Consultation">General Consultation 💬</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-teal-600" /> Assigned Doctor / Clinician
          </label>
          <select
            name="assignedStaff"
            value={formData.assignedStaff}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all"
          >
            <option value="Dr. Perera (Senior Vet)">Dr. Perera (Senior Vet)</option>
            <option value="Dr. Fernando (Vet Surgeon)">Dr. Fernando (Vet Surgeon)</option>
            <option value="Nurse Silva">Nurse Silva</option>
            <option value="Senior Groomer Kapila">Senior Groomer Kapila</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-600" /> Appointment Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleChange}
            required
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-600" /> Select Time Slot (Live Availability) <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {workingSlots.map((slot) => {
              const matched = slotSchedule.find((s) => s.timeSlot === slot);
              const isBooked = matched?.status === 'booked';
              const isSelected = formData.timeSlot === slot;

              if (isBooked) {
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled
                    className="py-2 px-3 rounded-xl text-xs font-mono font-bold bg-slate-100 text-slate-400 border border-slate-200 opacity-50 cursor-not-allowed line-through flex items-center justify-between"
                  >
                    <span>{slot}</span>
                    <span className="text-[9px] no-underline font-semibold bg-rose-100 text-rose-700 px-1 py-0.5 rounded">Booked</span>
                  </button>
                );
              }

              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, timeSlot: slot }))}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-teal-50/60 hover:bg-teal-100 text-teal-800 border-teal-200/80'
                  }`}
                >
                  <span>{slot}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" /> Special Notes / Medical Symptoms
          </label>
          <input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Symptoms or grooming requests..."
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || pets.length === 0}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 px-6 rounded-2xl shadow-sm hover:shadow-teal-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          {isLoading ? 'Scheduling Appointment...' : pets.length === 0 ? 'Register a Patient First to Book' : 'Confirm & Schedule Appointment'}
        </button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full animate-fadeIn">
          {formContent}
        </div>
      </div>
    );
  }

  return formContent;
};

export default BookingForm;
