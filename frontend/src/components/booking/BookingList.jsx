import React from 'react';

const BookingList = ({ bookings = [], onUpdateStatus, onCancel, statusFilter, setStatusFilter }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Scheduled Service Appointments</h2>
          <p className="text-xs text-gray-500">Member 3 Scope - Appointments & Bookings</p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="p-3">Pet Details</th>
              <th className="p-3">Service Type</th>
              <th className="p-3">Date & Time Slot</th>
              <th className="p-3">Customer Owner</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {bookings.length > 0 ? (
              bookings.map((item) => {
                const petName = item.petId ? item.petId.petName : 'Unknown Pet';
                const petPin = item.petId ? item.petId.uniquePin : 'N/A';
                const ownerName = item.customerId ? item.customerId.name || item.customerId.email : 'Guest Customer';
                const formattedDate = new Date(item.appointmentDate).toLocaleDateString();

                return (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <span className="font-semibold text-gray-800 block">{petName}</span>
                      <span className="text-xs font-mono text-indigo-600">{petPin}</span>
                    </td>
                    <td className="p-3 font-medium text-gray-700">{item.serviceType}</td>
                    <td className="p-3 text-xs text-gray-600">
                      <span className="block font-semibold">{formattedDate}</span>
                      <span className="text-gray-500 font-mono">{item.timeSlot}</span>
                    </td>
                    <td className="p-3 text-xs text-gray-700">{ownerName}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                        item.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        item.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {item.status === 'Pending' && (
                        <button
                          onClick={() => onUpdateStatus(item._id, 'Confirmed')}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                        >
                          Confirm
                        </button>
                      )}
                      {item.status === 'Confirmed' && (
                        <button
                          onClick={() => onUpdateStatus(item._id, 'Completed')}
                          className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded"
                        >
                          Complete
                        </button>
                      )}
                      {item.status !== 'Cancelled' && item.status !== 'Completed' && (
                        <button
                          onClick={() => onCancel(item._id)}
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400 text-sm">
                  No appointments scheduled yet. Use the form above to book a service!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingList;
