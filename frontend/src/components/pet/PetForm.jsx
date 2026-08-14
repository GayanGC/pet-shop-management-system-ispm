import React, { useState } from 'react';

const PetForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    petName: '',
    species: 'Dog',
    breed: '',
    age: '',
    weight: '',
    status: 'Available',
    uniquePin: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.petName || !formData.species || !formData.age) {
      alert('Please fill in required fields: Pet Name, Species, and Age');
      return;
    }
    onSubmit(formData);
    setFormData({
      petName: '',
      species: 'Dog',
      breed: '',
      age: '',
      weight: '',
      status: 'Available',
      uniquePin: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-gray-100">
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="text-xl font-bold text-gray-800">🐾 Register New Pet</h2>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">Member 1 Module</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
          <input
            type="text"
            name="petName"
            value={formData.petName}
            onChange={handleChange}
            placeholder="e.g. Max"
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Species *</label>
          <select
            name="species"
            value={formData.species}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="Dog">Dog 🐶</option>
            <option value="Cat">Cat 🐱</option>
            <option value="Bird">Bird 🦜</option>
            <option value="Fish">Fish 🐠</option>
            <option value="Reptile">Reptile 🦎</option>
            <option value="Small Animal">Small Animal 🐹</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
          <input
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            placeholder="e.g. Golden Retriever"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age (Years) *</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="e.g. 2"
            min="0"
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="e.g. 12.5"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom PIN (Optional)</label>
          <input
            type="text"
            name="uniquePin"
            value={formData.uniquePin}
            onChange={handleChange}
            placeholder="Auto-generated if blank (PET-XXXX)"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-mono"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 flex justify-center items-center shadow"
      >
        {isLoading ? 'Registering Pet...' : 'Register Pet'}
      </button>
    </form>
  );
};

export default PetForm;
