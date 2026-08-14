import React, { useState } from 'react';

const BookingForm = ({ pets = [], onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    petId: '',
    serviceType: 'Veterinary Checkup',
    appointmentDate: '',
    timeSlot: '09:00 AM',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.petId || !formData.appointmentDate || !formData.timeSlot) {
      alert('Please select a pet, appointment date, and time slot');
      return;
    }
    onSubmit(formData);
    setFormData({
      petId: '',
      serviceType: 'Veterinary Checkup',
      appointmentDate: '',
      timeSlot: '09:00 AM',
      notes: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-gray-100">
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="text-xl font-bold text-gray-800">📅 Book Pet Service Appointment</h2>
        <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">Member 3 Module</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Registered Pet *</label>
          <select
            name="petId"
            value={formData.petId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">-- Choose Pet --</option>
            {pets.map((pet) => (
              <option key={pet._id} value={pet._id}>
                {pet.petName} ({pet.species} - {pet.uniquePin})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="Veterinary Checkup">Veterinary Checkup 🩺</option>
            <option value="Grooming & Bath">Grooming & Bath ✂️</option>
            <option value="Vaccination">Vaccination 💉</option>
            <option value="Dental Care">Dental Care 🦷</option>
            <option value="General Consultation">General Consultation 💬</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date *</label>
          <input
            type="date"
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot *</label>
          <select
            name="timeSlot"
            value={formData.timeSlot}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
          >
            <option value="09:00 AM">09:00 AM - 10:00 AM</option>
            <option value="10:30 AM">10:30 AM - 11:30 AM</option>
            <option value="01:30 PM">01:30 PM - 02:30 PM</option>
            <option value="03:00 PM">03:00 PM - 04:00 PM</option>
            <option value="04:30 PM">04:30 PM - 05:30 PM</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Special Notes / Symptoms</label>
          <textarea
            name="notes"
            rows="2"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any specific pet symptoms or grooming requests..."
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          ></textarea>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || pets.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 shadow disabled:bg-blue-300"
      >
        {isLoading ? 'Scheduling Appointment...' : pets.length === 0 ? 'Register a Pet First to Book' : 'Book Appointment'}
      </button>
    </form>
  );
};

export default BookingForm;
