import React, { useState } from 'react';
import { PawPrint, Tag, User, Scale, Activity, Plus, X } from 'lucide-react';

const PetForm = ({ onSubmit, isLoading, isModal, onClose }) => {
  const [formData, setFormData] = useState({
    petName: '',
    species: 'Dog',
    breed: '',
    age: '',
    weight: '',
    status: 'Available',
    clinicStatus: 'Registered',
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
      clinicStatus: 'Registered',
      uniquePin: ''
    });
    if (isModal && onClose) onClose();
  };

  const formContent = (
    <form onSubmit={handleSubmit} className={`p-6 space-y-5 transition-all duration-300 ${isModal ? 'bg-white/95 backdrop-blur-lg rounded-3xl border border-slate-200/80 shadow-2xl' : 'bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md'}`}>
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold shadow-xs">
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Register New Patient</h2>
            <p className="text-xs text-slate-500">Patient Demographic & Clinical Microchip Profile</p>
          </div>
        </div>
        {isModal && (
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-transform duration-200 hover:rotate-90 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <PawPrint className="w-3.5 h-3.5 text-teal-600" /> Patient Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="petName"
            value={formData.petName}
            onChange={handleChange}
            placeholder="e.g. Max"
            required
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-teal-600" /> Species <span className="text-rose-500">*</span>
          </label>
          <select
            name="species"
            value={formData.species}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all"
          >
            <option value="Dog">Canine / Dog 🐕</option>
            <option value="Cat">Feline / Cat 🐈</option>
            <option value="Bird">Avian / Bird 🦜</option>
            <option value="Small Mammal">Small Mammal / Rabbit 🐇</option>
            <option value="Primate">Primate / Monkey 🐒</option>
            <option value="Reptile">Reptile / Amphibian 🐢</option>
            <option value="Aquatic">Aquatic / Fish 🐠</option>
            <option value="Farm">Farm & Other 🐐</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" /> Breed Designation
          </label>
          <input
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            placeholder="e.g. Golden Retriever"
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" /> Age (Years) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="e.g. 2"
            min="0"
            required
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-slate-400" /> Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="e.g. 12.5"
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" /> Microchip PIN Tag (Optional)
          </label>
          <input
            type="text"
            name="uniquePin"
            value={formData.uniquePin}
            onChange={handleChange}
            placeholder="Auto-generated if blank (PET-XXXX)"
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-sans"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 px-6 rounded-xl shadow-sm hover:shadow-teal-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          {isLoading ? 'Registering Patient Record...' : 'Register Pet Patient'}
        </button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all duration-300">
        <div className="max-w-3xl w-full transform transition-all duration-300 animate-in fade-in zoom-in-95">
          {formContent}
        </div>
      </div>
    );
  }

  return formContent;
};

export default PetForm;
