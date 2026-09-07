import React, { useState } from 'react';
import { X, Calendar, Clock, Check } from 'lucide-react';

const RescheduleModal = ({ booking, onClose, onReschedule }) => {
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM');
  const [assignedStaff, setAssignedStaff] = useState(booking?.assignedStaff || 'Dr. Perera (Senior Vet)');
  const [errorMsg, setErrorMsg] = useState('');

  if (!booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!appointmentDate) {
      alert('Please select a new appointment date');
      return;
    }
    try {
      await onReschedule(booking._id, { appointmentDate, timeSlot, assignedStaff });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Slot conflict or rescheduling error');
    }
  };

  const petName = booking.petId ? booking.petId.petName : 'Pet Patient';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full p-6 space-y-5 transform transition-all duration-300 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Reschedule Appointment</h2>
              <p className="text-xs text-slate-500">{petName} ({booking.serviceType})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-transform duration-200 hover:rotate-90 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Appointment Date *</label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Time Slot *</label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="09:00 AM">09:00 AM - 10:00 AM</option>
              <option value="10:30 AM">10:30 AM - 11:30 AM</option>
              <option value="01:30 PM">01:30 PM - 02:30 PM</option>
              <option value="03:00 PM">03:00 PM - 04:00 PM</option>
              <option value="04:30 PM">04:30 PM - 05:30 PM</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reassigned Doctor / Groomer</label>
            <select
              value={assignedStaff}
              onChange={(e) => setAssignedStaff(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Dr. Perera (Senior Vet)">Dr. Perera (Senior Vet)</option>
              <option value="Dr. Fernando (Surgeon)">Dr. Fernando (Surgeon)</option>
              <option value="Nurse Silva">Nurse Silva</option>
              <option value="Senior Groomer Kapila">Senior Groomer Kapila</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" /> Confirm Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleModal;
