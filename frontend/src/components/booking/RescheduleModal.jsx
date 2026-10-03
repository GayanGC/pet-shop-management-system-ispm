import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Check, AlertCircle } from 'lucide-react';
import { fetchBookings } from '../../services/bookingService';

const CLINIC_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '11:00 AM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM'
];

const RescheduleModal = ({ booking, onClose, onReschedule }) => {
  const initialDateStr = booking?.appointmentDate
    ? new Date(booking.appointmentDate).toISOString().split('T')[0]
    : '';

  const [appointmentDate, setAppointmentDate] = useState(initialDateStr);
  const [timeSlot, setTimeSlot] = useState(booking?.timeSlot || '09:00 AM');
  const [assignedStaff, setAssignedStaff] = useState(
    booking?.assignedStaff || booking?.doctor || 'Dr. Perera (Senior Vet)'
  );
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (assignedStaff && appointmentDate) {
      setIsLoadingSlots(true);
      fetchBookings({ doctor: assignedStaff, date: appointmentDate })
        .then((res) => {
          const list = Array.isArray(res) ? res : (res?.data || res?.bookings || []);
          const activeBooked = list
            .filter((b) => b.status !== 'Cancelled' && b._id !== booking?._id)
            .map((b) => b.timeSlot);
          setBookedSlots(activeBooked);
        })
        .catch((err) => console.log('[Reschedule Slot Check Note]:', err.message))
        .finally(() => setIsLoadingSlots(false));
    } else {
      setBookedSlots([]);
    }
  }, [assignedStaff, appointmentDate, booking?._id]);

  if (!booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!appointmentDate) {
      setErrorMsg('Please select a new appointment date');
      return;
    }
    if (appointmentDate < todayStr) {
      setErrorMsg('Cannot reschedule appointments to past dates.');
      return;
    }
    if (!timeSlot) {
      setErrorMsg('Please select a time slot.');
      return;
    }
    if (bookedSlots.includes(timeSlot)) {
      setErrorMsg('The selected slot is already booked. Please choose an available slot.');
      return;
    }

    try {
      await onReschedule(booking._id, {
        newDate: appointmentDate,
        newTimeSlot: timeSlot,
        appointmentDate,
        timeSlot,
        assignedStaff,
        reason
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Slot conflict or rescheduling error');
    }
  };

  const petName = booking.petId ? (booking.petId.petName || booking.petId.name) : 'Pet Patient';
  const originalDate = booking.appointmentDate
    ? new Date(booking.appointmentDate).toLocaleDateString()
    : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 transform transition-all duration-300 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">Reschedule Appointment Visit</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {petName} • Currently: {originalDate} at {booking.timeSlot}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform duration-200 hover:rotate-90 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Attending Clinician / Doctor
            </label>
            <select
              value={assignedStaff}
              onChange={(e) => setAssignedStaff(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:bg-white focus:border-amber-500 focus:outline-none"
            >
              <option value="Dr. Perera (Senior Vet)">Dr. Perera (Senior Vet)</option>
              <option value="Dr. Fernando (Vet Surgeon)">Dr. Fernando (Vet Surgeon)</option>
              <option value="Dr. Silva (Consultant Physician)">Dr. Silva (Consultant Physician)</option>
              <option value="Nurse Silva">Nurse Silva</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Appointment Date *
            </label>
            <input
              type="date"
              value={appointmentDate}
              min={todayStr}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:bg-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                New Time Slot *
              </label>
              <span className="text-[10px] text-slate-400">
                {isLoadingSlots ? 'Checking doctor availability...' : '🟢 Open | 🔴 (Booked)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CLINIC_SLOTS.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                const isSelected = timeSlot === slot;

                if (isBooked) {
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked}
                      className="py-2 px-2.5 rounded-xl text-xs font-mono font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60 line-through dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 flex items-center justify-between shadow-2xs"
                      title="This slot is already booked by another patient"
                    >
                      <span>{slot}</span>
                      <span className="text-[8px] font-bold text-rose-600 no-underline inline-block">(Booked)</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400/30'
                        : 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{slot}</span>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-1 py-0.5 rounded">Open</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Rescheduling
            </label>
            <input
              type="text"
              placeholder="e.g. Schedule conflict, client request, illness"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white focus:border-amber-500 focus:outline-none placeholder:text-slate-400 text-slate-800 dark:text-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={bookedSlots.includes(timeSlot)}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" /> Confirm Reschedule to {timeSlot}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleModal;
