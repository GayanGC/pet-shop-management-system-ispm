import React, { useState } from 'react';
import { PawPrint, Tag, User, Scale, Activity, Plus, X, AlertCircle } from 'lucide-react';

// ─── Validation rules ────────────────────────────────────────────────────────
const PET_NAME_RE = /^[a-zA-Z\s\-'\.]{2,30}$/; // 2-30 chars, letters/spaces/hyphens/apostrophes only

const validate = (data) => {
  const errors = {};

  if (!data.petName.trim()) {
    errors.petName = 'Patient name is required.';
  } else if (!PET_NAME_RE.test(data.petName.trim())) {
    errors.petName = 'Name must be 2–30 characters and contain only letters (no numbers or symbols).';
  }

  if (!data.species) {
    errors.species = 'Please select a species.';
  }

  const age = parseFloat(data.age);
  if (data.age === '' || isNaN(age)) {
    errors.age = 'Age is required.';
  } else if (age < 0 || age > 35) {
    errors.age = 'Age must be between 0 and 35 years.';
  }

  if (data.weight !== '') {
    const weight = parseFloat(data.weight);
    if (isNaN(weight) || weight < 0.1 || weight > 120) {
      errors.weight = 'Weight must be between 0.1 kg and 120 kg.';
    }
  }

  return errors;
};

// ─── PetForm Component ───────────────────────────────────────────────────────
const PetForm = ({ onSubmit, isLoading, isModal, onClose }) => {
  const INITIAL = {
    petName: '',
    species: 'Dog',
    breed: '',
    age: '',
    weight: '',
    gender: 'Male',
    status: 'Available',
    clinicStatus: 'Registered',
    uniquePin: ''
  };

  const [formData, setFormData] = useState(INITIAL);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errors = validate(formData);
    setFieldErrors((prev) => ({ ...prev, [name]: errors[name] || '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate(formData);
    setFieldErrors(errors);
    setTouched({ petName: true, species: true, age: true, weight: true });

    if (Object.keys(errors).length > 0) {
      return;
    }

    onSubmit(formData);
    setFormData(INITIAL);
    setFieldErrors({});
    setTouched({});
    if (isModal && onClose) onClose();
  };

  const fieldClass = (name) =>
    `w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-800/60 border rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400 ${
      touched[name] && fieldErrors[name]
        ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500'
        : 'border-slate-200 dark:border-slate-700 focus:border-teal-600'
    }`;

  const ErrorMsg = ({ name }) =>
    touched[name] && fieldErrors[name] ? (
      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {fieldErrors[name]}
      </p>
    ) : null;

  const formContent = (
    <form
      onSubmit={handleSubmit}
      className={`p-6 space-y-5 transition-all duration-300 ${
        isModal
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-2xl'
          : 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold shadow-xs">
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Register New Patient</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Patient Demographic & Clinical Microchip Profile</p>
          </div>
        </div>
        {isModal && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform duration-200 hover:rotate-90 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pet Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <PawPrint className="w-3.5 h-3.5 text-teal-600" /> Patient Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="petName"
            value={formData.petName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Max"
            maxLength={30}
            className={fieldClass('petName')}
          />
          <ErrorMsg name="petName" />
        </div>

        {/* Species */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-teal-600" /> Species <span className="text-rose-500">*</span>
          </label>
          <select
            name="species"
            value={formData.species}
            onChange={handleChange}
            onBlur={handleBlur}
            className={fieldClass('species')}
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
          <ErrorMsg name="species" />
        </div>

        {/* Breed */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" /> Breed Designation
          </label>
          <input
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            placeholder="e.g. Golden Retriever"
            maxLength={60}
            className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" /> Age (Years) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 2"
            min="0"
            max="35"
            step="0.5"
            className={fieldClass('age')}
          />
          <ErrorMsg name="age" />
          {!fieldErrors.age && <p className="text-[10px] text-slate-400 mt-0.5">Range: 0 – 35 years</p>}
        </div>

        {/* Weight */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-slate-400" /> Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 12.5"
            min="0.1"
            max="120"
            className={fieldClass('weight')}
          />
          <ErrorMsg name="weight" />
          {!fieldErrors.weight && <p className="text-[10px] text-slate-400 mt-0.5">Range: 0.1 – 120 kg</p>}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" /> Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all"
          >
            <option value="Male">Male ♂️</option>
            <option value="Female">Female ♀️</option>
            <option value="Unknown">Unknown 🐾</option>
          </select>
        </div>

        {/* Microchip PIN */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" /> Microchip PIN Tag (Optional)
          </label>
          <input
            type="text"
            name="uniquePin"
            value={formData.uniquePin}
            onChange={handleChange}
            placeholder="Auto-generated if blank (PET-XXXX)"
            className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-sans"
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
