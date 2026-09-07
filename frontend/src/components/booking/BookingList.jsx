import React, { useState } from 'react';
import { Calendar, Filter, Clock, Edit3 } from 'lucide-react';
import RescheduleModal from './RescheduleModal';

const BookingList = ({ bookings = [], onUpdateStatus, onCancel, onReschedule, statusFilter, setStatusFilter }) => {
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
      {/* Header & Filter Bar */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">Scheduled Appointments</h2>
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200/60">
              {bookings.length} Bookings
            </span>
          </div>
          <p className="text-xs text-slate-500">Clinical Consultations, Grooming & Doctor Slots</p>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Pet Patient</th>
              <th className="py-3.5 px-5">Service Category</th>
              <th className="py-3.5 px-5">Assigned Doctor / Staff</th>
              <th className="py-3.5 px-5">Date & Time Slot</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {bookings.length > 0 ? (
              bookings.map((item) => {
                const petName = item.petId ? item.petId.petName : 'Unknown Pet';
                const petPin = item.petId ? item.petId.uniquePin : 'N/A';
                const formattedDate = new Date(item.appointmentDate).toLocaleDateString();

                return (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-slate-800 block">{petName}</span>
                      <span className="bg-slate-100 text-slate-600 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                        {petPin}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-700">{item.serviceType}</td>
                    <td className="py-3.5 px-5 text-slate-700 text-xs">
                      <span className="font-medium bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 inline-block">
                        {item.assignedStaff || 'Dr. Perera (Senior Vet)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.timeSlot}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                        item.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200/80' :
                        item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' :
                        item.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200/80' : 'bg-amber-50 text-amber-700 border-amber-200/80'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'Confirmed' ? 'bg-blue-500' :
                          item.status === 'Completed' ? 'bg-emerald-500' :
                          item.status === 'Cancelled' ? 'bg-rose-500' : 'bg-amber-500'
                        }`}></span>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      {item.status === 'Pending' && (
                        <button
                          onClick={() => onUpdateStatus(item._id, 'Confirmed')}
                          className="px-2 py-1 text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200/60 transition-all"
                        >
                          Confirm
                        </button>
                      )}
                      {item.status === 'Confirmed' && (
                        <button
                          onClick={() => onUpdateStatus(item._id, 'Completed')}
                          className="px-2 py-1 text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg border border-emerald-200/60 transition-all"
                        >
                          Complete
                        </button>
                      )}
                      {item.status !== 'Cancelled' && item.status !== 'Completed' && (
                        <>
                          <button
                            onClick={() => setSelectedBookingForReschedule(item)}
                            className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-all"
                            title="Reschedule Slot"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => onCancel(item._id)}
                            className="px-2 py-1 text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg border border-rose-200/60 transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-12 px-4 text-center">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto border border-blue-100">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">No scheduled appointments</h3>
                    <p className="text-xs text-slate-400">
                      {statusFilter !== 'All'
                        ? 'No bookings match your status filter.'
                        : 'Book your first clinical appointment using the form above!'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reschedule Modal */}
      {selectedBookingForReschedule && (
        <RescheduleModal
          booking={selectedBookingForReschedule}
          onClose={() => setSelectedBookingForReschedule(null)}
          onReschedule={(id, data) => {
            onReschedule(id, data);
            setSelectedBookingForReschedule(null);
          }}
        />
      )}
    </div>
  );
};

export default BookingList;
