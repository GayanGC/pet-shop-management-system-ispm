import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Plus, CheckCircle2, AlertCircle, RefreshCw, PawPrint } from 'lucide-react';
import { fetchDoctorDaySchedule } from '../../services/bookingService';

function DoctorCalendarView({ onBookSlot }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Perera (Senior Vet)');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSchedule = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchDoctorDaySchedule(selectedDoctor, selectedDate);
      if (res.success) {
        setSchedule(res.data || []);
      } else {
        setError(res.message || 'Failed to fetch doctor schedule');
      }
    } catch (err) {
      setError(err.message || 'Error fetching doctor schedule');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [selectedDoctor, selectedDate]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Doctor & Date Selection Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Doctor & Clinician Day Calendar</h3>
            <p className="text-xs text-slate-500">Live time slot availability and booked appointment schedule</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Clinician</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="Dr. Perera (Senior Vet)">Dr. Perera (Senior Vet)</option>
              <option value="Dr. Fernando (Vet Surgeon)">Dr. Fernando (Vet Surgeon)</option>
              <option value="Senior Groomer Kapila">Senior Groomer Kapila</option>
              <option value="Nurse Silva">Nurse Silva</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Schedule Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
            />
          </div>

          <div className="self-end pt-5">
            <button
              onClick={loadSchedule}
              className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-all"
              title="Refresh schedule"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Time Slot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedule.map((item, idx) => {
          const isBooked = item.status === 'booked';
          const booking = item.booking;

          if (isBooked && booking) {
            const pet = booking.petId || {};
            const customer = booking.customerId || {};

            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-3xl border-2 border-teal-600/30 shadow-xs space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold font-mono text-slate-800">{item.timeSlot}</span>
                  </div>
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                    Booked
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <PawPrint className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-black text-slate-800">
                      {pet.petName || 'Pet Patient'}
                    </span>
                    {pet.uniquePin && (
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                        {pet.uniquePin}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 space-y-0.5 pl-6">
                    <div><span className="font-semibold text-slate-700">Species:</span> {pet.species || 'Animal'} ({pet.breed || 'Mixed'})</div>
                    <div><span className="font-semibold text-slate-700">Client:</span> {customer.name || 'Registered Owner'}</div>
                    <div><span className="font-semibold text-slate-700">Service:</span> {booking.serviceType}</div>
                  </div>
                </div>

                {booking.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 font-medium italic">
                    "{booking.notes}"
                  </p>
                )}
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="bg-slate-50/50 hover:bg-teal-50/40 p-5 rounded-3xl border-2 border-dashed border-slate-200 hover:border-teal-400 transition-all flex flex-col items-center justify-center gap-3 text-center min-h-[160px]"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold font-mono text-slate-700">{item.timeSlot}</span>
              </div>

              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                Available
              </span>

              <button
                onClick={() =>
                  onBookSlot &&
                  onBookSlot({
                    assignedStaff: selectedDoctor,
                    appointmentDate: selectedDate,
                    timeSlot: item.timeSlot
                  })
                }
                className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Book Slot
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DoctorCalendarView;
